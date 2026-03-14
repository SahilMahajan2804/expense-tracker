// interceptors/auth.interceptor.ts

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Skip adding token for auth endpoints
  const authEndpoints = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/verify-otp',
    '/api/auth/resend-otp',
  ];
  const isAuthEndpoint = authEndpoints.some((endpoint) => req.url.includes(endpoint));

  let authReq = req;

  // Add token if available and not an auth endpoint
  if (!isAuthEndpoint) {
    const token = authService.getToken();
    if (token) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Added auth token to request:', req.url);
    }
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('HTTP Error:', error.status, error.message);

      if (error.status === 401) {
        console.log('401 Unauthorized - logging out');
        authService.logout();
        router.navigate(['/login']);
      } else if (error.status === 403) {
        console.log('403 Forbidden - access denied');
        // Don't logout on 403, just show unauthorized page
        router.navigate(['/unauthorized']);
      }

      return throwError(() => error);
    }),
  );
};
