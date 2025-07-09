import { Injectable, WritableSignal, computed, inject, signal } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { User } from '../models/user';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { Organization } from '../models/organization';
import { jwtDecode } from 'jwt-decode';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl = "http://localhost:8081/api/v1/";

  private readonly TOKEN_KEY = "user_auth_key";
  private readonly ROLE_KEY = "user_role_key";
  private readonly USER_ID_KEY = "user_id_key";
  private readonly USER_DATA_KEY = "user_data_key";

  private userRoleSubject = new BehaviorSubject<string | null>(null);
  userRole$ = this.userRoleSubject.asObservable();

  private authenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.authenticatedSubject.asObservable();

  private _user: WritableSignal<User | Organization | null> = signal<User | null>(null);
  private _loading: WritableSignal<boolean> = signal<boolean>(false);
  private _error: WritableSignal<string | null> = signal<string | null>(null);
  private _isAuthenticated: WritableSignal<boolean> = signal<boolean>(false);
  private _id : WritableSignal<string | null> = signal<string | null>(null);

  readonly user = computed(() => this._user());
  readonly loading = computed(() => this._loading());
  readonly isAuthenticated = computed(() => !!this._user());
  readonly authError = computed(() => this._error());
  readonly id = computed(() => this._id());

  constructor(private cookieService: CookieService, private http: HttpClient, private router: Router) {
    this.restoreUserState();
  }

  private restoreUserState(): void {
    const token = this.getToken();
    const savedRole = this.getRole();

    if (token && savedRole && !this.isTokenExpired(token)) {
      this.userRoleSubject.next(savedRole);
      const userData = this.getUserDataFromCookies();
      const userId = this.cookieService.get(this.USER_ID_KEY);

      if (userData) {
        this._user.set(userData);
        this._id.set(userId);
        this._isAuthenticated.set(true);
        this.authenticatedSubject.next(true);
      }
    } else {
      this.logout();
    }
  }

  public isTokenExpired(token: string): boolean {
    try {
      const decoded: any = jwtDecode(token);
      const exp = decoded.exp;
      if (!exp) return true;
      const now = Math.floor(Date.now() / 1000);
      return exp < now;
    } catch (e) {
      return true;
    }
  }

  public setAuthenticated(isAuth: boolean) {
    this.authenticatedSubject.next(isAuth);
  }

  isAuthenticate(): boolean {
    return this.authenticatedSubject.value;
  }

  private getUserDataFromCookies(): User | Organization | null {
    const userDataStr = this.cookieService.get(this.USER_DATA_KEY);
    return userDataStr ? JSON.parse(userDataStr) : null;
  }

  private saveUserData(userData: User | Organization): void {
    const userDataStr = JSON.stringify(userData);
    this.setCookieWithTokenExpiration(this.USER_DATA_KEY, userDataStr);
  }

  login(user: User): Observable<any> {
    this._loading.set(true);

    this.cookieService.delete(this.TOKEN_KEY, '/');
    this.cookieService.delete(this.ROLE_KEY, '/');
    this.cookieService.delete(this.USER_ID_KEY, '/');
    this.cookieService.delete(this.USER_DATA_KEY, '/');

    this._user.set(null);
    this._id.set(null);
    this._isAuthenticated.set(false);
    this.userRoleSubject.next(null);

    return this.http.post<any>(`${this.apiUrl}auth/login`, user).pipe(
      tap(values => {
        this.setToken(values.token);
        this.setRoleAndIdByToken(values.token);
        this._user.set(values.AuthenticatedUser);
        this.saveUserData(values.AuthenticatedUser);
        this._isAuthenticated.set(true);
        this.setAuthenticated(true);
        this._loading.set(false);
      }),
      catchError(error => {
        this._error.set(error.message || 'Error al iniciar sesión');
        this._loading.set(false);
        return throwError(() => error);
      })
    );
  }

  registerUser(user: User): Observable<string> {
    this._loading.set(true);
    return this.http.post(`${this.apiUrl}users/r`, user, { responseType : "text" }).pipe(
      tap(msg => {
        alert(msg);
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
    return this.http.post(`${this.apiUrl}organizations`, org, { responseType: 'text' }).pipe(
      tap(response => {
        alert(response);
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
    const expirationDate = this.getTokenExpirationDate(token);
    if (expirationDate) {
      const now = new Date();
      const diffInMs = expirationDate.getTime() - now.getTime();
      const expirationDays = diffInMs / (1000 * 60 * 60 * 24);

      this.cookieService.set(this.TOKEN_KEY, token, { 
        expires: expirationDays,
        secure: true,
        sameSite: 'Strict'
      });
    } else {
      this.cookieService.set(this.TOKEN_KEY, token, { 
        expires: 0.5,
        secure: true,
        sameSite: 'Strict'
      });
    }
  }

  private setCookieWithTokenExpiration(key: string, value: string): void {
    const token = this.getToken();
    const expirationDate = this.getTokenExpirationDate(token);
    const now = new Date();
    const expirationDays = expirationDate
      ? (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      : 0.5;

    this.cookieService.set(key, value, {
      expires: expirationDays,
      secure: true,
      sameSite: 'Strict'
    });
  }

  private getTokenExpirationDate(token: string): Date | null {
    try {
      const decoded: any = jwtDecode(token);
      if (!decoded.exp) return null;
      return new Date(decoded.exp * 1000);
    } catch (e) {
      return null;
    }
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
      this.setCookieWithTokenExpiration(this.ROLE_KEY, decodedToken.role);
      this.setCookieWithTokenExpiration(this.USER_ID_KEY, decodedToken.id);
      this._id.set(decodedToken.id);
      console.log("id login", this.id());
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
    return this.id() ?? '';
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
    this.setAuthenticated(false);
    this.router.navigate(['/login']);
  }

  private clearUserData(): void {
    this.cookieService.delete(this.USER_DATA_KEY, '/');
  }
}
