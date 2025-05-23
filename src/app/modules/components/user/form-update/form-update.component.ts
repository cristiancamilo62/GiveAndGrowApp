import { Component, inject, OnInit, WritableSignal, signal } from '@angular/core';
import { FormBuilder, Validators, AbstractControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { UserService } from '../../../services/user.service';
import { User } from '../../../../core/models/user';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-form-update',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],  // Asegúrate de importar los módulos necesarios
  templateUrl: './form-update.component.html',
  styleUrls: ['./form-update.component.css']
})
export class FormUpdateComponent implements OnInit {

  // Inyectar el AuthService para acceder al estado del usuario
  private authService = inject(AuthService);  // Usamos la señal de usuario desde el servicio
  private userService = inject(UserService);  // Inyectar el servicio de usuario
  private fb = inject(FormBuilder);  // Usamos FormBuilder para crear el formulario

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
  }

  ngOnInit(): void {
    console.log("este es el usuario a actualizar con el computed",this.user);
    // Verificamos que el usuario esté disponible antes de usarlo
    if (this.user) {
      this.form = this.fb.group({
        identification: [this.user.identification || '', Validators.required],
        firstName: [this.user.firstName || '', Validators.required],
        middleName: [this.user.middleName || ''],
        lastName: [this.user.lastName || '', Validators.required],
        middleLastName: [this.user.middleLastName || ''],
        email: [this.user.email || '', [Validators.required, Validators.email]],
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
      updatedUser.password = this.passwordPersistida;  // Mantener la contraseña original 
      updatedUser.id = this.authService.getUserId();  // Asegúrate de que el ID del usuario esté presente
      console.log(updatedUser);
      this.userService.updateUser(updatedUser).subscribe(
        (response) => {
          console.log('Usuario actualizado con éxito', response);
        },
        (error) => {
          this.error.set('Error al actualizar el usuario');
        }
      );
    }
  }

  // Control para acceso reactivo al formulario
  control(name: keyof typeof this.form.controls): AbstractControl {
    return this.form.controls[name];
  }
}
