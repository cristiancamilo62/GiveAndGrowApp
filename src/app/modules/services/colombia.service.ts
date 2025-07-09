import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, map} from 'rxjs';

interface DepartmentApi { id: number; name: string; cities?: any[]; /* ... */ }
interface CityApi {
  id: number;
  name: string;
  departmentId: number;
}


@Injectable({
  providedIn: 'root'
})
export class ColombiaService {

  private base = 'https://api-colombia.com/api/v1';

  private http = inject(HttpClient);

  getDepartments(): Observable<{ id: number; name: string; }[]> {
    return this.http.get<DepartmentApi[]>(`${this.base}/Department`)
      .pipe(map(depts => depts.map(d => ({ id: d.id, name: d.name }))));
  }

  getCitiesByDepartment(deptId: number): Observable<string[]> {
  return this.http.get<CityApi[]>(`${this.base}/City/department/${deptId}`)
    .pipe(map(cities => cities.map(c => c.name)));
}

}
