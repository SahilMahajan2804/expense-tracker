// app-routing.module.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // ==================== AUTH ROUTES (Public) ====================
  {
    path: 'login',
    loadComponent: () =>
      import('./components/auth/login/login.component').then((m) => m.LoginComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./components/auth/register/register.component').then((m) => m.RegisterComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'verify-otp',
    loadComponent: () =>
      import('./components/auth/verify-otp/verify-otp.component').then((m) => m.VerifyOtpComponent),
    canActivate: [guestGuard],
  },

  // ==================== EMPLOYEE ROUTES ====================
  {
    path: 'employee',
    canActivate: [authGuard],
    data: { roles: ['EMPLOYEE', 'ADMIN'] }, // Allow ADMIN to access employee routes too
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./components/employee/dashboard/dashboard.component').then(
            (m) => m.EmployeeDashboardComponent,
          ),
      },
      {
        path: 'expenses',
        loadComponent: () =>
          import('./components/employee/my-expenses/my-expenses.component').then(
            (m) => m.MyExpensesComponent,
          ),
      },
      {
        path: 'expenses/create',
        loadComponent: () =>
          import('./components/employee/create-expense/create-expense.component').then(
            (m) => m.CreateExpenseComponent,
          ),
      },
      {
        path: 'expenses/edit/:id',
        loadComponent: () =>
          import('./components/employee/edit-expense/edit-expense.component').then(
            (m) => m.EditExpenseComponent,
          ),
      },
      {
        path: 'expenses/:id',
        loadComponent: () =>
          import('./components/employee/expense-detail/expense-detail.component').then(
            (m) => m.ExpenseDetailComponent,
          ),
      },
    ],
  },

  // ==================== ADMIN ROUTES ====================
  {
    path: 'admin',
    canActivate: [authGuard],
    data: { roles: ['ADMIN'] },
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./components/admin/dashboard/dashboard.component').then(
            (m) => m.AdminDashboardComponent,
          ),
      },
      {
        path: 'expenses',
        loadComponent: () =>
          import('./components/admin/all-expenses/all-expenses.component').then(
            (m) => m.AllExpensesComponent,
          ),
      },
      {
        path: 'expenses/pending',
        loadComponent: () =>
          import('./components/admin/pending-expenses/pending-expenses.component').then(
            (m) => m.PendingExpensesComponent,
          ),
      },
      {
        path: 'expenses/:id',
        loadComponent: () =>
          import('./components/employee/expense-detail/expense-detail.component').then(
            (m) => m.ExpenseDetailComponent,
          ),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./components/admin/manage-categories/manage-categories.component').then(
            (m) => m.ManageCategoriesComponent,
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./components/admin/manage-users/manage-users.component').then(
            (m) => m.ManageUsersComponent,
          ),
      },
      {
        path: 'approvals',
        loadComponent: () =>
          import('./components/admin/approval-history/approval-history.component').then(
            (m) => m.ApprovalHistoryComponent,
          ),
      },
    ],
  },

  // ==================== APP ROUTES (Common Protected) ====================
  {
    path: 'about',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/shared/about-us/about-us.component').then((m) => m.AboutUsComponent),
  },

  // ==================== ERROR ROUTES ====================
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./components/shared/unauthorized/unauthorized.component').then(
        (m) => m.UnauthorizedComponent,
      ),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./components/shared/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      enableTracing: false, // Set to true for debugging route issues
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
