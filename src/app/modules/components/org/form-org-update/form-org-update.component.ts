import { Component, inject, OnInit, WritableSignal, signal } from '@angular/core';
import { FormBuilder, Validators, AbstractControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { UserService } from '../../../services/user.service';
import { User } from '../../../../core/models/user';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Organization } from '../../../../core/models/organization';
import { NavbarComponent } from "../../../../shared/navbar/navbar.component";
import { OrganizationService } from '../../../services/organization.service';

@Component({
  selector: 'app-form-update',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NavbarComponent],  // Asegúrate de importar los módulos necesarios
  templateUrl: './form-org-update.component.html',
  styleUrls: ['./form-org-update.component.css']
})
export class FormOrgUpdateComponent implements OnInit {

  // Inyectar el AuthService para acceder al estado del usuario
  private authService = inject(AuthService);  // Usamos la señal de usuario desde el servicio
  private organizationService = inject(OrganizationService);  // Inyectar el servicio de usuario
  private fb = inject(FormBuilder);  // Usamos FormBuilder para crear el formulario
  private router = inject(Router);

  // Definir las señales de estado (loading, error)
  readonly loading: WritableSignal<boolean> = signal(false);
  readonly error: WritableSignal<string | null> = signal(null);

  organization: Organization | null = null;  // Declaramos la variable de usuario
  form: FormGroup = this.fb.group({});  // Inicializamos el formulario vacío

  // Guardar la contraseña original para comparar cambios
  private passwordPersistida = '';

  constructor() {
    // Inyectamos el usuario desde el servicio AuthService
    this.organization = this.authService.user() as Organization;  // Asegúrate de que el tipo sea correcto
  }

  ngOnInit(): void {
    // Verificamos que el usuario esté disponible antes de usarlo
    if (this.organization) {
      this.form = this.fb.group({
        name: [this.organization.name, [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
        nit: [this.organization.nit || "", [Validators.required, Validators.minLength(7), Validators.maxLength(15)]],
        description: [this.organization.description || "", [Validators.required, Validators.minLength(10), Validators.maxLength(100)]],
        contactNumber: [this.organization.contactNumber || "", [Validators.required]],
        email: [this.organization.email || "", [Validators.required, Validators.email]],
        password: [this.organization.password],
        address: [this.organization.address || "", [Validators.required, Validators.minLength(5), Validators.maxLength(50)]],
      });

      // Guardamos la contraseña persistida para comparaciones posteriores
      this.passwordPersistida = this.organization.password;
    } else {
      // Si el usuario no está disponible, mostramos un mensaje de error o redirigimos
      this.error.set("Usuario no encontrado.");
    }
  }

  // Método para manejar la actualización del formulario
  onSubmit(): void {
    if (this.form.valid) {
      const updatedUser = this.form.value;
        // Mantener la contraseña original 
      updatedUser.id = this.authService.getUserId();  // Asegúrate de que el ID del usuario esté presente
      console.log(updatedUser);
      this.organizationService.updateUser(updatedUser).subscribe(
        (response) => {
          alert("cuenta actualizada correctamente");
          this.authService.updateUserData(response)
          this.router.navigate(['/home'])  
        },
        (error) => {
          alert(error)
          this.error.set('Error al actualizar el usuario');
          console.log(error);
        }
      );
    }
  }
  // Control para acceso reactivo al formulario
  control(name: keyof typeof this.form.controls): AbstractControl {
    return this.form.controls[name];
  }
}
