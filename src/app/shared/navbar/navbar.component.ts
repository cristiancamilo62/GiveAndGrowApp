import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink,ReactiveFormsModule,CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  isAuthenticated : boolean; // Estado de autenticación

  private authService = inject(AuthService); // Inyectar el servicio de autenticación

  constructor() {
    this.isAuthenticated = this.authService.isAuthenticated();
  }

  ngOnInit(): void {}

  logout(): void {
    this.authService.logout();


  }

  }








