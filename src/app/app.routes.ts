import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { ChatManagementComponent } from './pages/chat-management/chat-management.component';
import { RegisterComponent } from './pages/register/register.component';


export const routes: Routes = [
    {
        path:'',
        component:LoginComponent
    },
    {
        path:'chat',
        component:ChatManagementComponent
    },
    {
        path:'register',
        component:RegisterComponent
    },
    
];
