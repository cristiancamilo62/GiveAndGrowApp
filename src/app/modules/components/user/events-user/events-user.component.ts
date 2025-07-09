import { Component, OnInit } from '@angular/core';
import { EventService } from '../../../services/event.service';
import { Event } from '../../../../core//models/event';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../../shared/navbar/navbar.component';
import Swal from 'sweetalert2';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-events-user',
  imports: [CommonModule, NgFor, NgIf, ReactiveFormsModule,
     NavbarComponent,FormsModule],
  templateUrl: './events-user.component.html',
  styleUrl: './events-user.component.css'
})
export class EventsUserComponent implements OnInit {

  events: Event[] = [];
  filteredEvents: Event[] = []; // Events that match the search term
  searchTerm: string = ''; // Término de búsqueda ingresado por el usuario
  searchType: string = 'all'; // Tipo de búsqueda, por defecto "Todo"
  selectedCategory: string = ''; // Categoría seleccionada
  searchLocation: string = ''; // Localidad ingresada

  constructor(private eventService: EventService,private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  private loadEvents(): void {

    this.eventService.getAll().subscribe({
      next: (response) => {
        console.log(response);
        this.events = response;
        this.filteredEvents = response; 
      },
      error: (err) => {
        console.error('Error al cargar eventos:', err);
        this.events = [];
        this.filteredEvents = [];
      }
    });
  }
  // Filtrar eventos según el tipo de filtro y el término de búsqueda
  onSearch(): void {
    const lowerCaseTerm = this.searchTerm.toLowerCase();
    
    if (this.searchType === 'all') {
      this.filteredEvents = this.events; // Mostrar todos los eventos
    } else if (this.searchType === 'category') {
      if (this.selectedCategory) {
        this.filteredEvents = this.events.filter(
          (ev) => ev.category.toLowerCase() === this.selectedCategory.toLowerCase()
        );
      }
    } else if (this.searchType === 'location') {
      console.log(this.searchTerm)
      this.filteredEvents = this.events.filter(
        (ev) => 
          ev.location.toLowerCase().includes(lowerCaseTerm)
      );
    }
  }

  // Cambiar el tipo de filtro y restablecer la búsqueda
  onFilterChange(): void {
    this.selectedCategory = '';
    this.searchLocation = '';
    this.searchTerm = '';
    this.onSearch();
  }


  onApply(event: Event) {
  Swal.fire({
    title: '¡Solicitud enviada!',
    html: `
      <div style="font-size: 16px; text-align: left;">
        <p><strong>Evento:</strong> ${event.name}</p>
        <p><strong>Ubicación:</strong> ${event.location}</p>
        <p><strong>Fecha de inicio:</strong> ${new Date(event.startDateTime).toLocaleDateString()}</p>
        <hr style="margin: 10px 0;">
        <p style="margin: 0;">Tu solicitud ha sido <strong>enviada correctamente</strong> a la organización.</p>
        <p style="margin: 10px 0 0 0;">Pronto recibirás una <strong>respuesta al correo electrónico ${this.authService.user()?.email}</strong> que tienes registrado en nuestra plataforma.</p>
      </div>
    `,
    icon: 'success',
    background: '#ffffff',
    color: '#000000',
    confirmButtonText: 'OK',
    confirmButtonColor: '#0e743d',
    customClass: {
      popup: 'custom-alert-popup'
    }
  });

  console.log('Applying for event:', event);
}

}
