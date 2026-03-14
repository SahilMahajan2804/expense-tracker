// guards/auth.guard.ts

import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('=== Auth Guard Check ===');
  console.log('Route:', route.url);

  // Check if user is logged in using signal
  if (!authService.isLoggedIn()) {
    console.log('Not logged in, redirecting to /login');
    router.navigate(['/login']);
    return false;
  }

  // Check role-based access
  const expectedRoles = route.data['roles'] as string[];
  console.log('Expected roles:', expectedRoles);

  if (expectedRoles && expectedRoles.length > 0) {
    const currentUser = authService.getCurrentUser();
    console.log('Current user:', currentUser);

    if (!currentUser || !currentUser.role) {
      console.log('No user role found, redirecting to /unauthorized');
      router.navigate(['/unauthorized']);
      return false;
    }

    // Normalize role comparison
    const userRoleString = String(currentUser.role);
    const normalizedUserRole = userRoleString.toUpperCase().replace('ROLE_', '');
    const normalizedExpectedRoles = expectedRoles.map((r) => r.toUpperCase().replace('ROLE_', ''));

    console.log('User role:', userRoleString);
    console.log('Normalized user role:', normalizedUserRole);
    console.log('Normalized expected roles:', normalizedExpectedRoles);

    if (!normalizedExpectedRoles.includes(normalizedUserRole)) {
      console.log('Role mismatch, redirecting to /unauthorized');
      router.navigate(['/unauthorized']);
      return false;
    }
  }

  console.log('Auth guard passed!');
  return true;
};
