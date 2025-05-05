import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  // Utilizamos señales para manejar el estado (si el usuario está logueado, por ejemplo)
  isLoggedIn = signal<boolean>(false); // Signal para estado de sesión

  constructor() { }

  ngOnInit(): void {
    // Aquí podríamos verificar el estado de sesión si es necesario
    // Ejemplo: this.isLoggedIn.set(true); o false si no está logueado
  }

  // Método para alternar el estado de sesión (solo un ejemplo)
  toggleLogin() {
    this.isLoggedIn.set(!this.isLoggedIn());
  }




}
