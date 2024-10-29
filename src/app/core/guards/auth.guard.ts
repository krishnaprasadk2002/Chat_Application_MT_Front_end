import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, tap } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // return auth.isAuth().pipe(
  //   map(res => {
  //     if (res == true) {
  //       return true; // access
  //     } else {
  //       router.navigate(['/']); 
  //       return false; // no access
  //     }
  //   })
  // );

  return auth.isAuth().pipe(
    tap((isAuthenticated: boolean) => {
      if (!isAuthenticated) {
        router.navigate(['/']); // Redirect to login if not authenticated
      }
    })
  );
};