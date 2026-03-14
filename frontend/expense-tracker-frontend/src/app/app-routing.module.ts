import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';

// Auth Components
import { LoginComponent } from '../app/components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { VerifyOtpComponent } from './components/auth/verify-otp/verify-otp.component';

// Employee Components
import { EmployeeDashboardComponent } from './components/employee/dashboard/dashboard.component';
import { MyExpensesComponent } from './components/employee/my-expenses/my-expenses.component';
import { CreateExpenseComponent } from './components/employee/create-expense/create-expense.component';
import { EditExpenseComponent } from './components/employee/edit-expense/edit-expense.component';
import { ExpenseDetailComponent } from './components/employee/expense-detail/expense-detail.component';

// Admin Components
import { AdminDashboardComponent } from './components/admin/dashboard/dashboard.component';
import { AllExpensesComponent } from './components/admin/all-expenses/all-expenses.component';
import { PendingExpensesComponent } from './components/admin/pending-expenses/pending-expenses.component';
import { ManageCategoriesComponent } from './components/admin/manage-categories/manage-categories.component';
import { ManageUsersComponent } from './components/admin/manage-users/manage-users.component';
import { ApprovalHistoryComponent } from './components/admin/approval-history/approval-history.component';

// Shared Components
import { UnauthorizedComponent } from './components/shared/unauthorized/unauthorized.component';
import { NotFoundComponent } from './components/shared/not-found/not-found.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // Auth Routes
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
  { path: 'verify-otp', component: VerifyOtpComponent, canActivate: [guestGuard] },

  // Employee Routes
  {
    path: 'employee',
    canActivate: [authGuard],
    data: { roles: ['EMPLOYEE'] },
    children: [
      { path: 'dashboard', component: EmployeeDashboardComponent },
      { path: 'expenses', component: MyExpensesComponent },
      { path: 'expenses/create', component: CreateExpenseComponent },
      { path: 'expenses/edit/:id', component: EditExpenseComponent },
      { path: 'expenses/:id', component: ExpenseDetailComponent },
    ],
  },

  // Admin Routes
  {
    path: 'admin',
    canActivate: [authGuard],
    data: { roles: ['ADMIN'] },
    children: [
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'expenses', component: AllExpensesComponent },
      { path: 'expenses/pending', component: PendingExpensesComponent },
      { path: 'expenses/:id', component: ExpenseDetailComponent },
      { path: 'categories', component: ManageCategoriesComponent },
      { path: 'users', component: ManageUsersComponent },
      { path: 'approvals', component: ApprovalHistoryComponent },
    ],
  },

  // Error Routes
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
