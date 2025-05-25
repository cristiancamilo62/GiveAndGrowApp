import { Component, computed, inject, signal, WritableSignal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Organization } from '../../../core/models/organization';
import { CommonModule } from '@angular/common';
import { RouteConfigLoadEnd, RouterLink } from '@angular/router';

@Component({
  selector: 'app-form-register-org',
  imports: [ReactiveFormsModule,CommonModule,RouterLink],
  templateUrl: './form-register-org.component.html',
  styleUrl: './form-register-org.component.css'
})
export class FormRegisterOrgComponent {

  numberPattern = /^\d{7,15}$/;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);


  /* ───────── SEÑALES DE ESTADO ──── */
  readonly loading : WritableSignal<boolean> = signal(false);
  readonly error : WritableSignal<string | null> = signal(null);

  /* ───────── REACTIVE FORM ───────── */
  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
    identification: ["", [Validators.required, Validators.minLength(7), Validators.maxLength(15)]],
    description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(100)]],
    contactNumber: ['', [Validators.required, Validators.pattern(this.numberPattern)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]],
    address: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(50)]],
  })
  
  /* Derivado reactivo: habilita el botón solo si todo está válido y no hay carga */
  readonly canSave = computed(() => this.form.valid && !this.loading());


  /* ───────── MANEJO DE ENVÍO ─────── */
  onSubmit(): void {
    if(this.form.invalid) {
      return;
    }

    /* señales locales: spinner ON, error a null */
    this.loading.set(true);
    this.error.set(null);

    const org = this.form.getRawValue() as Organization; // Obtenemos los valores del formulario
    this.authService.registerOrg(org).subscribe({
      /* -- callback de éxito -- */
      next: () => {            // texto devuelto por el backend
        this.form.reset();        // limpia los campos
        this.loading.set(false);  // spinner OFF
      },

      /* -- callback de error -- */
      error: (err) => {
        this.error.set(err);
        alert(err); // Muestra el error en un alert
        this.loading.set(false);  // spinner OFF
      },
    })
  }
  
  control(name: keyof typeof this.form.controls): AbstractControl {
    return this.form.controls[name];
  }
}
