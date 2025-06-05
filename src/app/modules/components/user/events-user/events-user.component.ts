import { Component, OnInit } from '@angular/core';
import { EventService } from '../../../services/event.service';
import { Event } from '../../../../core//models/event';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../../shared/navbar/navbar.component';

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

  constructor(private eventService: EventService,
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


  onApply(eventId: string | undefined) {
    // Implement the logic for applying to an event
    console.log('Applying for event:', eventId);
  }
}
