import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Expense, Approval, ApprovalRequest } from '../models/expense.model';
import { Dashboard } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/admin/expenses`;

  getAllExpenses(): Observable<Expense[]> {
    return this.http.get<Expense[]>(this.apiUrl);
  }

  getExpensesByStatus(status: string): Observable<Expense[]> {
    return this.http.get<Expense[]>(`${this.apiUrl}/status/${status}`);
  }

  getPendingExpenses(): Observable<Expense[]> {
    return this.http.get<Expense[]>(`${this.apiUrl}/pending`);
  }

  getApprovedExpenses(): Observable<Expense[]> {
    return this.http.get<Expense[]>(`${this.apiUrl}/approved`);
  }

  getRejectedExpenses(): Observable<Expense[]> {
    return this.http.get<Expense[]>(`${this.apiUrl}/rejected`);
  }

  approveExpense(expenseId: number, remarks?: string): Observable<Approval> {
    let url = `${this.apiUrl}/${expenseId}/approve`;
    if (remarks) {
      url += `?remarks=${encodeURIComponent(remarks)}`;
    }
    return this.http.post<Approval>(url, {});
  }

  rejectExpense(expenseId: number, remarks?: string): Observable<Approval> {
    let url = `${this.apiUrl}/${expenseId}/reject`;
    if (remarks) {
      url += `?remarks=${encodeURIComponent(remarks)}`;
    }
    return this.http.post<Approval>(url, {});
  }

  getMyApprovals(): Observable<Approval[]> {
    return this.http.get<Approval[]>(`${this.apiUrl}/my-approvals`);
  }

  getAdminDashboard(): Observable<Dashboard> {
    return this.http.get<Dashboard>(`${this.apiUrl}/dashboard`);
  }
}
