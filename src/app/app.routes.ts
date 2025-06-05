import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  {
    path: 'home',
    title: 'Home',
    loadComponent: () =>
      import('./modules/components/home/home.component')
        .then(m => m.HomeComponent)
    },
      {
        path: 'home/org/events-org',
        title: 'Events Org',
        loadComponent: () =>
          import('./modules/components/org/events/events.component')
            .then(m => m.EventsComponent)
      
  },
  {
        path: 'home/usr/events-org',
        title: 'Events Org',
        loadComponent: () =>
          import('./modules/components/user/events-user/events-user.component')
            .then(m => m.EventsUserComponent)
      
  },
  {
    path: 'register',
    title: 'Registro',
    loadComponent: () =>
      import('./modules/auth/form-register-user/form-register-user.component')
        .then(m => m.FormRegisterComponent)
  },
  {
    path: 'registerOrg',
    title: 'Registro Organización',
    loadComponent: () =>
      import('./modules/auth/form-register-org/form-register-org.component')
        .then(m => m.FormRegisterOrgComponent)
  },
  {
    path: 'login',
    title: 'Login',
    loadComponent: () =>
      import('./modules/auth/login/login.component')
        .then(m => m.LoginComponent)
  },
  {
    path: 'updateUser',
    title: 'Actualizar Usuario',
    loadComponent: () =>
      import('./modules/components/user/form-update/form-update.component')
        .then(m => m.FormUpdateComponent)
  },
  {
    path: 'updateOrg',
    title: 'Actualizar Organizacion',
    loadComponent: () =>
      import('./modules/components/org/form-org-update/form-org-update.component')
        .then(m => m.FormOrgUpdateComponent)
  }
];
