import { HttpClient } from '@angular/common/http';
import { Injectable, WritableSignal, computed, inject, signal } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { User } from '../models/user';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { Organization } from '../models/organization';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl = "http://localhost:8081/api/v1/";
  private readonly TOKEN_EXPIRATION_DAYS = 10 / 24; // Expiración de 10 horas

  private readonly TOKEN_KEY = "user_auth_key";
  private readonly ROLE_KEY = "user_role_key";
  private readonly USER_ID_KEY = "user_id_key";
  private readonly USER_DATA_KEY = "user_data_key";

  private userRoleSubject = new BehaviorSubject<string | null>(null);
  userRole$ = this.userRoleSubject.asObservable();

  private _user: WritableSignal<User | Organization | null> = signal<User | null>(null);
  private _loading: WritableSignal<boolean> = signal<boolean>(false);
  private _error: WritableSignal<string | null> = signal<string | null>(null);
  private _isAuthenticated: WritableSignal<boolean> = signal<boolean>(false);

  readonly user = computed(() => this._user());
  readonly loading = computed(() => this._loading());
  readonly isAuthenticated = computed(() => !!this._user());
  readonly authError = computed(() => this._error());

  constructor(private cookieService: CookieService, private http: HttpClient, private router: Router) {
    this.restoreUserState();
  }

  // Restaurar estado del usuario desde cookies
  private restoreUserState(): void {
    const token = this.getToken();
    const savedRole = this.getRole();
    if (token && savedRole) {
      this.userRoleSubject.next(savedRole);
      const userData = this.getUserDataFromCookies();
      if (userData) {
        this._user.set(userData);
        this._isAuthenticated.set(true);
      }
    }
  }

  // Obtener datos del usuario desde cookies
  private getUserDataFromCookies(): User | Organization | null {
    const userDataStr = this.cookieService.get(this.USER_DATA_KEY);
    return userDataStr ? JSON.parse(userDataStr) : null;
  }

  // Guardar datos del usuario en cookies
  private saveUserData(userData: User | Organization): void {
    const userDataStr = JSON.stringify(userData);
    this.cookieService.set(this.USER_DATA_KEY, userDataStr, { expires: this.TOKEN_EXPIRATION_DAYS, secure: true, sameSite: 'Strict' });
  }

  login(user: User): Observable<any> {
    this._loading.set(true);
    this.cookieService.delete(this.TOKEN_KEY, '/');
    this._user.set(null); // Clear user state before login

    return this.http.post<any>(`${this.apiUrl}auth/login`, user).pipe(
      tap(values => {
        this.setToken(values.token);
        this.setRoleAndIdByToken(values.token);
        this._user.set(values.AuthenticatedUser);
        this.saveUserData(values.AuthenticatedUser);
        this._isAuthenticated.set(true);
        this._loading.set(false);
      }),
      catchError(error => {
        this._error.set(error);
        this._loading.set(false);
        return throwError(() => error);
      })
    );
  }

  registerUser(user: User): Observable<User> {
    this._loading.set(true);
    return this.http.post<User>(`${this.apiUrl}users/r`, user).pipe(
      tap(user => {
        alert(user);
        this.router.navigate(['/login'], { queryParams: { email: user.email } });
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
    return this.http.post<string>(`${this.apiUrl}organizations`, org).pipe(
      tap(msg => {
        alert(msg);
        this.router.navigate(['/login'], { queryParams: { email: org.email } });
        this._loading.set(false);
      }),
      catchError(error => {
        this._error.set(error);
        this._loading.set(false);
        return throwError(() => error);
      })
    );
  }

  private setToken(token: string): void {
    this.cookieService.set(this.TOKEN_KEY, token, { expires: this.TOKEN_EXPIRATION_DAYS, secure: true, sameSite: 'Strict' });
  }

  getToken(): string {
    return this.cookieService.get(this.TOKEN_KEY);
  }

  removeToken(): void {
    this.cookieService.delete(this.TOKEN_KEY, '/');
  }

  setRedirectUrl(url: string): void {
    this.router.navigate([url]);
  }

  getRedirectUrl(): string {
    return this.router.url;
  }

  private setRoleAndIdByToken(token: string): void {
    try {
      const decodedToken: any = jwtDecode(token);
      this.cookieService.set(this.ROLE_KEY, decodedToken.role, { expires: this.TOKEN_EXPIRATION_DAYS, secure: true, sameSite: 'Strict' });
      
      this.cookieService.set(this.USER_ID_KEY, decodedToken.id, { expires: this.TOKEN_EXPIRATION_DAYS, secure: true, sameSite: 'Strict'});
      this.userRoleSubject.next(this.getRole());
    } catch (error) {
      console.error('Error decoding token', error);
    }
  }

  removeRole(): void {
    this.cookieService.delete(this.ROLE_KEY, '/');
    this.userRoleSubject.next(null);
  }

  removeUserId(): void {
    this.cookieService.delete(this.USER_ID_KEY, '/');
  }

  getRole(): string {
    return this.cookieService.get(this.ROLE_KEY);
  }

  getUserId(): string {
    return this.cookieService.get(this.USER_ID_KEY);
  }

  updateUserData(userData: User | Organization): void {
    this._user.set(userData);
    this.saveUserData(userData);
  }

  logout(): void {
    this.removeToken();
    this.removeRole();
    this.removeUserId();
    this.clearUserData();
    this._user.set(null);
    this._isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  private clearUserData(): void {
    this.cookieService.delete(this.USER_DATA_KEY, '/');
  }
}
