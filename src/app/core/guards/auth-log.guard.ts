import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { map } from 'rxjs';

export const authLogGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isAuth().pipe(
    map(res => {
      console.log(res);
      if (res == true) {
        
        router.navigate(['/chat']);
        return false; // User should not access the login/register page if authenticated
      } else {
        return true; // User can access the login/register page if not authenticated
      }
    })
  );
};
