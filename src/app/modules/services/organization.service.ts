import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Organization } from '../../core/models/organization';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {

private apiUrl = "http://localhost:8081/api/v1/organizations"

  private http = inject(HttpClient);

  updateUser(organizationUpdate: Organization) : Observable<any> {
    return this.http.put<any>(`${this.apiUrl}`, organizationUpdate)
      
  }
}
