import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { EventService } from '../../../services/event.service';
import { AuthService } from '../../../../core/services/auth.service';
import Swal from 'sweetalert2';
import { CloudinaryService } from '../../../services/cloudinary.service';
import { ColombiaService } from '../../../services/colombia.service';

@Component({
  selector: 'app-new-event-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatButtonModule,
    FormsModule
  ],
  templateUrl: './new-event-modal.component.html',
  styleUrls: ['./new-event-modal.component.css']
})
export class NewEventModalComponent {

  caracteresRestantes: number = 110;
  eventForm: FormGroup;
  isEditMode: boolean = false;
  eventId?: number;

  imageUrl: string | null = null;
  uploading: boolean = false;

  departamentos: { id: number; name: string }[] = [];
  ciudades: string[] = [];

  currentOptions: { label: string; value: string }[] = [];

  selectedDepartmentId: number | null = null;
  selectedDepartmentName: string = '';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<NewEventModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private eventService: EventService,
    private authService: AuthService,
    private cloudinaryService: CloudinaryService,
    private colombia: ColombiaService
  ) {
    const eventData = data?.event || {};
    this.isEditMode = !!data?.event;
    this.eventId = eventData.id;

    this.eventForm = this.fb.group({
      id : [this.eventId],
      name: [eventData.name || '', [Validators.required,Validators.minLength(4)]],
      address: [eventData.address || '', Validators.required],
      location: ['', Validators.required],     // Aquí se guardará "Departamento, Ciudad"
      startDateTime: [eventData.startDateTime || '', Validators.required],
      registrationDeadline: [eventData.registrationDeadline || '', Validators.required],
      category: [eventData.category || '', Validators.required],
      maxParticipants: [eventData.maxParticipants ?? 0, [Validators.required, Validators.min(1)]],
      currentParticipantsCount: [eventData.currentParticipantsCount ?? 0],
      description: [eventData.description || '', [Validators.required]],
      organizationId: [this.authService.getUserId(), Validators.required],
      imageUrl: [eventData.imageUrl || '', Validators.required],
    });

    this.caracteresRestantes = 110 - (eventData.description?.length || 0);

    if (eventData.imageUrl) this.imageUrl = eventData.imageUrl;
  }

  ngOnInit() {
  this.colombia.getDepartments().subscribe(depts => {
    this.departamentos = depts;
    this.currentOptions = this.departamentos.map(d => ({
      label: d.name,
      value: `DEP:${d.id}`
    }));
  });
}

  onDepartmentSelect(event: Event) {
  const deptId = +(event.target as HTMLSelectElement).value;
  const dept = this.departamentos.find(d => d.id === deptId);
  if (!dept) return;

  this.selectedDepartmentId = deptId;
  this.selectedDepartmentName = dept.name;

  console.log('Departamento seleccionado:', deptId); // ✅ Agrega este log
  this.colombia.getCitiesByDepartment(deptId).subscribe(cities => {
    console.log('Ciudades cargadas:', cities); // ✅ Agrega este log
    this.ciudades = cities;
  });
}

onCitySelect(event: Event) {
  const city = (event.target as HTMLSelectElement).value;
  const location = `${this.selectedDepartmentName}, ${city}`;
  this.eventForm.get('location')?.setValue(location);
}

  

  async onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.uploading = true;
      try {
        // Sube la imagen y guarda la URL
        const url = await this.cloudinaryService.uploadImage(file);
        this.imageUrl = url;
        console.log('Imagen subida:', url);
        this.eventForm.get('imageUrl')?.setValue(url);
      } catch (e) {
        Swal.fire('Error', 'No se pudo subir la imagen', 'error');
      } finally {
        this.uploading = false;
      }
    }
  }

  // Borra la imagen seleccionada
  clearImage() {
    this.imageUrl = null;
    this.eventForm.get('imageUrl')?.setValue(null);
  }


  close(): void {
    this.dialogRef.close();
  }

  submit(): void {
  if (this.eventForm.invalid) {
    this.eventForm.markAllAsTouched();
    Swal.fire({
      title: 'Formulario inválido',
      text: 'Por favor completa todos los campos obligatorios correctamente',
      icon: 'warning',
      confirmButtonColor: '#0e743d',
      background: '#fff',
      color: '#000',
    });
    return;
  }

  const event = this.eventForm.getRawValue();

  if (this.isEditMode && this.eventId !== undefined) {
    this.eventService.update(event).subscribe({
      next: (response) => {
        Swal.fire({
          title: '¡Éxito!',
          text: response,
          icon: 'success',
          confirmButtonColor: '#0e743d',
          background: '#fff',
          color: '#000',
        });
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Error al actualizar el evento:', err);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo actualizar el evento',
          icon: 'warning',
          confirmButtonColor: '#0e743d',
          background: '#fff',
          color: '#000',
        });
      }
    });
  } else {
    console.log('Creando nuevo evento:', event);
    this.eventService.create(event).subscribe({
      next: (response) => {
        Swal.fire({
          title: '¡Éxito!',
          text: response,
          icon: 'success',
          confirmButtonColor: '#0e743d',
          background: '#fff',
          color: '#000',
        });
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Error al crear el evento:', err);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo crear el evento',
          icon: 'warning',
          confirmButtonColor: '#cae838',
          background: '#cae838',
          color: '#333333',
        });
      }
    });
  }
}


  actualizarCaracteres(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    const texto = textarea.value;
    this.caracteresRestantes = 110 - texto.length;
  }
}
