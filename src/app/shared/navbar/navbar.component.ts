import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  isAuthenticated$: Observable<boolean>;
  userRole$: Observable<string | null>;

  isAuthenticated = false;
  userRole: string | null = null;
  currentRoute: boolean = false;

  private authService = inject(AuthService);

  constructor(private router: Router) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    
    this.userRole$ = this.authService.userRole$;

    this.isAuthenticated$.subscribe(value => this.isAuthenticated = value);
    console.log("estoy autenticado "+this.isAuthenticated);
    this.userRole$.subscribe(role => this.userRole = role);
      console.log("mi rol "+this.userRole);

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.urlAfterRedirects!=='/home';
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
