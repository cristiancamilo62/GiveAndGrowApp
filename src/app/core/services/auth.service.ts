import { HttpClient } from '@angular/common/http';
import { Injectable, WritableSignal, computed, inject, signal } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { User } from '../models/user';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { query, response } from 'express';
import { Organization } from '../models/organization';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = "http://localhost:8081/api/v1/"
  private readonly TOKEN_KEY = "user_auth_key"
  private readonly TOKEN_EXPIRATION = 10 * 60 * 60; //seconds


  /*-------DEPENDENCIAS--------*/ 
  private http = inject(HttpClient);
  private cookieService = inject(CookieService);
  private router = inject(Router);

  /* ───────── STATE (signals) ─ */
  private _user : WritableSignal<User | null> = signal<User | null>(null);
  private _loading : WritableSignal<boolean> = signal<boolean>(false);
  private _error : WritableSignal<string | null> = signal<string | null>(null);

   /*  Accesores reactivos para plantillas  */
  readonly user = computed(() => this._user());
  readonly loading = computed(() => this._loading());
  readonly isAuthenticated = computed(() => !!this._user());
  readonly authError = computed(() => this._error());

  /* ───────── MÉTODOS PÚBLICOS ───────── */

  login(user:User): Observable<{ token: string; user?: User }> {
    this._loading.set(true);
  
    return this.http
      .post<{ token: string; user?: User }>(`${this.apiUrl}auth/login`, user, { responseType: 'text' as 'json' })
      .pipe(
        tap(({ token, user }) => {
          this.setToken(token);
          this._user.set(user ?? null);
          this._loading.set(false);
        }),
        catchError(error => {
          this._error.set(error.message ?? 'Credenciales inválidas');
          this._loading.set(false);
          return throwError(() => error);
        })
      );
  }

 

  registerUser(user: User): Observable<string> {
    this._loading.set(true);
    return this.http
    .post<string>(`${this.apiUrl}users/r`, user,{responseType: 'text' as 'json',})
    .pipe(
      tap(msg=> {
        alert(msg);
        this.router.navigate(['/login'],{
          queryParams: {email: user.email},
        });
        this._loading.set(false);
      }),
      catchError(error => {
        this._error.set(error);
        this._loading.set(false);
        return throwError(() => error);
      })
    );
  }

  registerOrg(org: Organization): Observable<string> {
    this._loading.set(true);
    return this.http
    .post<string>(`${this.apiUrl}organization`, org , {responseType: 'text' as 'json',})
    .pipe(
      tap(msg=> {
        alert(msg);
        this.router.navigate(['/login'],{
          queryParams: {email: org.email},
        });
        this._loading.set(false);
      }),
      catchError(error => {
        this._error.set(error);
        this._loading.set(false);
        return throwError(() => error);
      })
    );
  }

  setToken(token: string) {

    const days = this.TOKEN_EXPIRATION / 60 / 60 / 24;

    this.cookieService.set(this.TOKEN_KEY, token, days, '/', undefined, true, 'Strict');
  }

  
  getToken(): string{
    return this.cookieService.get(this.TOKEN_KEY)
  }

  removeToken():void{
    this.cookieService.delete(this.TOKEN_KEY,'/')
  }

  setRedirectUrl(url : string){
    this.router.navigate([url])
  }
}
