import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Event } from '../../core/models/event';
import { AuthService } from '../../core/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class EventService {


  private url: string = 'http://localhost:8081/api/v1/events' 

  private http = inject(HttpClient)
  private id = inject(AuthService)

  create (event: Event) : Observable<string>{
    return this.http.post(this.url, event,{ responseType: 'text' })
  }
  
  update(event: Event) : Observable<string>{
    console.log("ya voy para el backend ", event)
    return this.http.put(this.url, event, { responseType: "text" })
  }
  
  getAllByOrganization(): Observable<Event[]> {
    console.log("id organizacion", this.id.getUserId())
  return this.http.get<Event[]>(`${this.url}/${this.id.getUserId()}`);
}

    getAll(): Observable<Event[]> {
      return this.http.get<Event[]>(`${this.url}`);
    }

    delete(id : string): Observable<string>{
      console.log("id backend", id)
      return this.http.delete(`${this.url}/${id}`, { responseType: 'text' })
    }
}
