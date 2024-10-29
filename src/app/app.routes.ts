import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { ChatManagementComponent } from './pages/chat-management/chat-management.component';
import { RegisterComponent } from './pages/register/register.component';
import { authGuard } from './core/guards/auth.guard';
import { authLogGuard } from './core/guards/auth-log.guard';


export const routes: Routes = [

    // { path: '**', redirectTo: '/', pathMatch: 'full' },

    {
        path: '',
        component: LoginComponent,
        // canActivate: [authLogGuard] // Guard to prevent logged-in users from accessing the login page
    },
    {
        path: 'chat',
        component: ChatManagementComponent,
        canActivate: [authGuard] // Guard to protect chat page for authenticated users
    },
    {
        path: 'register',
        component: RegisterComponent,
        // canActivate: [authLogGuard] // Guard to prevent logged-in users from accessing the register page
    },
    
];
