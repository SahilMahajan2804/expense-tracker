import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // ✅ Import CommonModule for pipes
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AdminService } from '../../../services/admin.service';
import { Expense, ExpenseStatus } from '../../../models/expense.model';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-pending-expenses',
  standalone: true,
  imports: [
    CommonModule, // ✅ Provides date, slice, currency pipes etc.
    FormsModule, // ✅ For ngModel
    NavbarComponent,
    SidebarComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './pending-expenses.component.html',
  styleUrl: './pending-expenses.component.css',
})
export class PendingExpensesComponent implements OnInit {
  private adminService = inject(AdminService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  expenses = signal<Expense[]>([]);
  isLoading = signal(true);

  // Modal
  showModal = signal(false);
  modalAction = signal<'approve' | 'reject'>('approve');
  selectedExpense = signal<Expense | null>(null);
  remarks = signal('');
  isProcessing = signal(false);

  ngOnInit(): void {
    this.loadPendingExpenses();
  }

  loadPendingExpenses(): void {
    this.isLoading.set(true);
    this.adminService.getPendingExpenses().subscribe({
      next: (expenses) => {
        this.expenses.set(expenses);
        this.isLoading.set(false);
      },
      error: () => {
        this.toastr.error('Failed to load expenses');
        this.isLoading.set(false);
      },
    });
  }

  viewExpense(expense: Expense): void {
    this.router.navigate(['/admin/expenses', expense.expenseId]);
  }

  openApproveModal(expense: Expense): void {
    this.selectedExpense.set(expense);
    this.modalAction.set('approve');
    this.remarks.set('');
    this.showModal.set(true);
  }

  openRejectModal(expense: Expense): void {
    this.selectedExpense.set(expense);
    this.modalAction.set('reject');
    this.remarks.set('');
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.selectedExpense.set(null);
    this.remarks.set('');
  }

  updateRemarks(event: Event): void {
    const input = event.target as HTMLTextAreaElement;
    this.remarks.set(input.value);
  }

  confirmAction(): void {
    const expense = this.selectedExpense();
    if (!expense) return;

    this.isProcessing.set(true);

    if (this.modalAction() === 'approve') {
      this.adminService.approveExpense(expense.expenseId, this.remarks()).subscribe({
        next: () => {
          this.toastr.success('Expense approved!');
          this.handleSuccess();
        },
        error: (err) => {
          this.toastr.error(err.error || 'Failed to approve');
          this.isProcessing.set(false);
        },
      });
    } else {
      this.adminService.rejectExpense(expense.expenseId, this.remarks()).subscribe({
        next: () => {
          this.toastr.success('Expense rejected!');
          this.handleSuccess();
        },
        error: (err) => {
          this.toastr.error(err.error || 'Failed to reject');
          this.isProcessing.set(false);
        },
      });
    }
  }

  handleSuccess(): void {
    this.isProcessing.set(false);
    this.closeModal();
    this.loadPendingExpenses();
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  }
}
