import { Routes } from '@angular/router';

export const routes: Routes = [

    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },

    {
        path: 'register',
        title: 'Registro',
        loadComponent: () => import('./modules/auth/form-register-user/form-register-user.component').then(m => m.FormRegisterComponent)
    },
    {
        path: 'registerOrg',
        title: 'Registro',
        loadComponent: () => import("./modules/auth/form-register-org/form-register-org.component").then(m => m.FormRegisterOrgComponent)
    },
    {
        path: 'login',
        title: 'Login',
        loadComponent: () => import('./modules/auth/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'home',
        title: 'home',
        loadComponent: () => import('./modules/components/home/home.component').then(m => m.HomeComponent)
    }
    ,
    {
        path: 'updateUser',
        title: 'Actualizar',
        loadComponent: () => import('./modules/components/user/form-update/form-update.component').then(m => m.FormUpdateComponent)
    }
];
