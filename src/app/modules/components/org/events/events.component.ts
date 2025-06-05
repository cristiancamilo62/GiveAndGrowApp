// src/app/modules/components/org/events/events-create.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Event } from '../../../../core//models/event';
import { NavbarComponent } from '../../../../shared/navbar/navbar.component';
import { EventService } from '../../../services/event.service';
import { NewEventModalComponent } from "../new-event-modal/new-event-modal.component";
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButton, MatButtonModule } from '@angular/material/button';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, NgFor, NgIf, ReactiveFormsModule,
     NavbarComponent,
    MatDialogModule, MatButtonModule,FormsModule],
  templateUrl: './events.component.html',
  styleUrl: './events.component.css'
})
export class EventsComponent  implements OnInit {

  
  events: Event[] = [];

  constructor(private eventService: EventService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  private loadEvents(): void {

    this.eventService.getAllByOrganization().subscribe({
      next: (response) => {
        console.log(response);
        this.events = response;
      },
      error: (err) => {
        console.error('Error al cargar eventos:', err);
        this.events = [];
      }
    });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(NewEventModalComponent, {
      width: "800px",
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result =>{
      this.loadEvents();
    })
  }


  onDelete(eventId: any): void {
  Swal.fire({
    title: '¿Estás seguro?',
    text: "¡No podrás revertir esta acción!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#0e743d',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      if (eventId) {
        this.eventService.delete(eventId).subscribe({
          next: (msg) => {
            this.loadEvents();
            Swal.fire({
              title: 'Eliminado!',
              text: msg,
              icon: 'success',
             
            });
          },
          error: (err) => {
            console.error('Error al eliminar el evento:', err);
            Swal.fire(
              'Error',
              'No se pudo eliminar el evento',
              'error'
            );
          }
        });
      }
    }
  });
}



onEdit(event: any) {
  console.log("eventoactualizar: " ,event);
  
  

  const dialogRef = this.dialog.open(NewEventModalComponent, {
    data: { event },
    width: '600px'
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.loadEvents();
    }
  });
}

onSubmit() {
throw new Error('Method not implemented.');
}
}
