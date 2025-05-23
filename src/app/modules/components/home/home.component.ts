import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from "../../../shared/navbar/navbar.component";
import { CommonModule } from '@angular/common';
import { AuthService } from "../../../../app/core/services/auth.service";
import { Router } from 'express';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { FooterComponent } from "../../../shared/footer/footer.component";


@Component({
  selector: 'app-home',
  imports: [NavbarComponent, ReactiveFormsModule, RouterLink, CommonModule, FooterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent  implements OnInit{

  userRole$: Observable<string | null>;

  constructor(private authService: AuthService) {
    this.userRole$ = this.authService.userRole$;
  }

  ngOnInit(): void {
   this.userRole$ = this.authService.userRole$;
   console.log(this.userRole$);
   console.log(this.authService.getToken());
  }

}
