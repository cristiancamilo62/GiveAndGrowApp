import { Component, inject, OnInit, WritableSignal, signal } from '@angular/core';
import { FormBuilder, Validators, AbstractControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { UserService } from '../../../services/user.service';
import { User } from '../../../../core/models/user';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { NavbarComponent } from "../../../../shared/navbar/navbar.component";
import Swal from 'sweetalert2';

@Component({
  selector: 'app-form-update',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NavbarComponent],  // Asegúrate de importar los módulos necesarios
  templateUrl: './form-update.component.html',
  styleUrls: ['./form-update.component.css']
})
export class FormUpdateComponent implements OnInit {

  // Inyectar el AuthService para acceder al estado del usuario
  private authService = inject(AuthService);  // Usamos la señal de usuario desde el servicio
  private userService = inject(UserService);  // Inyectar el servicio de usuario
  private fb = inject(FormBuilder);  // Usamos FormBuilder para crear el formulario
  private route = inject(Router)

  // Definir las señales de estado (loading, error)
  readonly loading: WritableSignal<boolean> = signal(false);
  readonly error: WritableSignal<string | null> = signal(null);

  user: User | null = null;  // Declaramos la variable de usuario
  form: FormGroup = this.fb.group({});  // Inicializamos el formulario vacío

  // Guardar la contraseña original para comparar cambios
  private passwordPersistida = '';

  constructor() {
    // Inyectamos el usuario desde el servicio AuthService
    this.user = this.authService.user() as User;  // Asegúrate de que el tipo sea correcto

    console.log("usuario a editar contructor ", this.authService.id());
    
  }

  ngOnInit(): void {
    console.log("id usuario a editar",this.authService.id());
    // Verificamos que el usuario esté disponible antes de usarlo
    if (this.user) {
      this.form = this.fb.group({
        identification: [this.user.identification || '', Validators.required],
        firstName: [this.user.firstName || '', Validators.required],
        middleName: [this.user.middleName || ''],
        lastName: [this.user.lastName || '', Validators.required],
        middleLastName: [this.user.middleLastName || ''],
        email: [this.user.email || '', [Validators.required, Validators.email]],
        institution: [this.user.institution || "",[Validators.required]],
        phoneOfReference: [this.user.phoneOfReference || "" , [Validators.required]],
        phoneNumber: [this.user.phoneNumber || '', Validators.required],
        password: ['' ]  // Puedes aplicar más validaciones si es necesario
      });

      // Guardamos la contraseña persistida para comparaciones posteriores
      this.passwordPersistida = this.user.password;
    } else {
      // Si el usuario no está disponible, mostramos un mensaje de error o redirigimos
      this.error.set("Usuario no encontrado.");
    }
  }

  // Método para manejar la actualización del formulario
  onSubmit(): void {
  if (this.form.valid) {
    const updatedUser = this.form.value;
    updatedUser.password = this.passwordPersistida;
    updatedUser.id =  this.authService.id();  // Asegúrate de que el ID del usuario esté presente

    console.log("usaurio listo pa mandar",updatedUser);

    this.userService.updateUser(updatedUser).subscribe({
      next: (response) => {
        Swal.fire({
          title: '¡Perfil actualizado!',
          text: response.message,
          icon: 'success',
          confirmButtonColor: '#0e743d',
          background: '#fff',
          color: '#000',
          confirmButtonText: 'OK'
        });
        this.authService.updateUserData(updatedUser);
        this.route.navigate(['/home']);
      },
      error: (error) => {
        Swal.fire({
          title: 'Error',
          text: error.message || 'No se pudo actualizar el perfil',
          icon: 'warning',
          confirmButtonColor: '#cae838',
          background: '#cae838',
          color: '#000',
          confirmButtonText: 'OK'
        });
      }
    });
  } else {
    this.form.markAllAsTouched();
    Swal.fire({
      title: 'Formulario inválido',
      text: 'Por favor completa todos los campos obligatorios correctamente',
      icon: 'warning',
      confirmButtonColor: '#cae838',
      background: '#fff',
      color: '#000',
      confirmButtonText: 'OK',
      customClass: {
        confirmButton: 'custom-black-button'
      }
    });
  }
}


  // Control para acceso reactivo al formulario
  control(name: keyof typeof this.form.controls): AbstractControl {
    return this.form.controls[name];
  }
}
