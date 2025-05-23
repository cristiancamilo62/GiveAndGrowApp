import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from '../../core/models/user';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = "http://localhost:8081/api/v1/users"

  private http = inject(HttpClient);

  updateUser(userUpdate: User) : Observable<User> {
    return this.http.put<User>(`${this.apiUrl}`, userUpdate, { responseType:'json' })
      
  }

}
