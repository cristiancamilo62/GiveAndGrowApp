import { Component, inject, OnInit } from '@angular/core';
import { NavbarComponent } from "../../../shared/navbar/navbar.component";
import { CommonModule } from '@angular/common';
import { AuthService } from "../../../../app/core/services/auth.service";
import { Router } from 'express';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';
import { FooterComponent } from "../../../shared/footer/footer.component";
import { User } from '../../../core/models/user';
import { Organization } from '../../../core/models/organization';


@Component({
  selector: 'app-home',
  imports: [NavbarComponent, ReactiveFormsModule, RouterLink, CommonModule, FooterComponent,RouterOutlet],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent  implements OnInit{

  org : Organization | null = null;
  usr : User | null = null;
  name : string = '';
  isAuthenticated : boolean; // Estado de autenticación


onSubmit() {
throw new Error('Method not implemented.');
}

  userRole$: Observable<string | null>;

  constructor(private authService: AuthService) {
    this.userRole$ = this.authService.userRole$;
    console.log(this.userRole$);
    this.isAuthenticated = this.authService.isAuthenticated();
    
  }

  ngOnInit(): void {
   this.userRole$ = this.authService.userRole$;
   this.validateName();
  }

  validateName(){
    this.userRole$.subscribe(role => {
      if (role === "ROLE_ORG"){
        this.org = this.authService.user() as Organization;
        console.log("este es mi nombre org",this.org);
        this.name = this.org.name
      }
      else if (role === "ROLE_USER"){
        this.usr = this.authService.user() as User;
        console.log("este es mi nombre usr",this.usr.firstName);
        this.name = this.usr.firstName+" "+this.usr.lastName
      }
    });
  }

}
