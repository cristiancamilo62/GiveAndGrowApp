import { Component,inject, WritableSignal,signal,computed } from '@angular/core';
import {FormBuilder,Validators,ReactiveFormsModule,AbstractControl,} from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from "../../../shared/navbar/navbar.component";

@Component({
  selector: 'app-form-register-user',
  imports: [ReactiveFormsModule, CommonModule, RouterLink, NavbarComponent],
  templateUrl: './form-register-user.component.html',
  styleUrl: './form-register-user.component.css'
})
export class FormRegisterComponent {

  numberPattern = /^\d{7,15}$/;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  /* ───────── SEÑALES DE ESTADO ──── */
  readonly loading : WritableSignal<boolean> = signal(false);
  readonly error : WritableSignal<string | null> = signal(null);  

  /* ───────── REACTIVE FORM ───────── */
  readonly form = this.fb.group({
    identification: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(15)]],
    firstName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
    middleName: ['', [Validators.minLength(3), Validators.maxLength(20)]],  
    lastName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
    middleLastName: ['', [Validators.minLength(3), Validators.maxLength(20)]],
    email: ['', [Validators.required, Validators.email]],
    institution : ["", [Validators.required,]],
    phoneOfReference: ["", [Validators.required,]],
    phoneNumber: ['', [Validators.required, Validators.pattern(this.numberPattern)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]],
  });

  /* Derivado reactivo: habilita el botón solo si todo está válido y no hay carga */
  readonly canSave = computed(() => this.form.valid && !this.loading());

   /* ───────── MANEJO DE ENVÍO ─────── */
  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }
  
    /* señales locales: spinner ON, error a null */
    this.loading.set(true);
    this.error.set(null);
  
    const user = this.form.getRawValue() as User;

    this.authService.registerUser(user).subscribe({
      /* -- callback de éxito -- */
      next: () => {            // texto devuelto por el backend
        this.form.reset();        // limpia los campos
        this.loading.set(false);  // spinner OFF
      },
  
      /* -- callback de error -- */
      error: (err) => {
        this.error.set(err);
        console.log(err);
        alert(err);
        this.loading.set(false);  // spinner OFF
      },
    });
  }


  control(name: keyof typeof this.form.controls): AbstractControl {
    return this.form.controls[name];
  }
  }