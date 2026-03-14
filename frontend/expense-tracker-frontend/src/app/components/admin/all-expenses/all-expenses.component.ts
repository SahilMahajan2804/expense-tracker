import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';

import { AdminService } from '../../../services/admin.service';
import { AttachmentService } from '../../../services/attachment.service';
import { Expense, ExpenseStatus } from '../../../models/expense.model';

@Component({
  selector: 'app-all-expenses',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    NavbarComponent,
    SidebarComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './all-expenses.component.html',
  styleUrl: './all-expenses.component.css',
})
export class AllExpensesComponent implements OnInit {
  private adminService = inject(AdminService);
  private attachmentService = inject(AttachmentService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  // State using signals
  expenses = signal<Expense[]>([]);
  isLoading = signal(true);
  selectedExpenseIds = signal<Set<number>>(new Set());

  // Filters
  selectedStatus = signal('ALL');
  searchTerm = signal('');

  // Modal state
  showModal = signal(false);
  modalAction = signal<'approve' | 'reject' | 'bulk_approve' | 'bulk_reject'>('approve');
  selectedExpense = signal<Expense | null>(null);
  remarks = signal('');
  isProcessing = signal(false);

  // Pagination
  currentPage = signal(1);
  itemsPerPage = 10;

  // Computed values
  filteredExpenses = computed(() => {
    let result = [...this.expenses()];

    // Filter by status
    if (this.selectedStatus() !== 'ALL') {
      result = result.filter((e) => e.status === this.selectedStatus());
    }

    // Filter by search term
    const term = this.searchTerm().toLowerCase().trim();
    if (term) {
      result = result.filter(
        (e) =>
          e.employeeName.toLowerCase().includes(term) ||
          e.description.toLowerCase().includes(term) ||
          e.categoryName?.toLowerCase().includes(term) ||
          e.employeeEmail.toLowerCase().includes(term)
      );
    }

    return result;
  });

  totalPages = computed(() => Math.ceil(this.filteredExpenses().length / this.itemsPerPage));

  paginatedExpenses = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    return this.filteredExpenses().slice(startIndex, startIndex + this.itemsPerPage);
  });

  stats = computed(() => ({
    total: this.expenses().length,
    pending: this.expenses().filter((e) => e.status === ExpenseStatus.PENDING).length,
    approved: this.expenses().filter((e) => e.status === ExpenseStatus.APPROVED).length,
    rejected: this.expenses().filter((e) => e.status === ExpenseStatus.REJECTED).length,
  }));

  isAllSelected = computed(() => {
    const currentItems = this.paginatedExpenses().filter(e => e.status === ExpenseStatus.PENDING);
    if (currentItems.length === 0) return false;
    return currentItems.every(e => this.selectedExpenseIds().has(e.expenseId));
  });

  ngOnInit(): void {
    this.loadExpenses();
  }

  loadExpenses(): void {
    this.isLoading.set(true);
    this.adminService.getAllExpenses().subscribe({
      next: (expenses) => {
        this.expenses.set(expenses);
        this.isLoading.set(false);
        this.selectedExpenseIds.set(new Set());
      },
      error: (error) => {
        console.error('Error loading expenses:', error);
        this.toastr.error('Failed to load expenses');
        this.isLoading.set(false);
      },
    });
  }

  onStatusChange(status: string): void {
    this.selectedStatus.set(status);
    this.currentPage.set(1);
    this.selectedExpenseIds.set(new Set());
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.currentPage.set(1);
    this.selectedExpenseIds.set(new Set());
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.currentPage.set(1);
    this.selectedExpenseIds.set(new Set());
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const total = this.totalPages();
    const current = this.currentPage();
    const maxVisible = 5;

    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end = Math.min(total, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  // Selection Logic
  toggleSelection(id: number): void {
    const current = new Set(this.selectedExpenseIds());
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    this.selectedExpenseIds.set(current);
  }

  toggleAllSelection(): void {
    const current = new Set(this.selectedExpenseIds());
    const pendingInPage = this.paginatedExpenses().filter(e => e.status === ExpenseStatus.PENDING);
    
    if (this.isAllSelected()) {
      pendingInPage.forEach(e => current.delete(e.expenseId));
    } else {
      pendingInPage.forEach(e => current.add(e.expenseId));
    }
    this.selectedExpenseIds.set(current);
  }

  // Modal Functions
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

  openBulkApproveModal(): void {
    this.modalAction.set('bulk_approve');
    this.remarks.set('');
    this.showModal.set(true);
  }

  openBulkRejectModal(): void {
    this.modalAction.set('bulk_reject');
    this.remarks.set('');
    this.showModal.set(true);
  }

  clearSelection(): void {
    this.selectedExpenseIds.set(new Set());
  }

  closeModal(): void {
    this.showModal.set(false);
    this.selectedExpense.set(null);
    this.remarks.set('');
  }

  updateRemarks(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.remarks.set(textarea.value);
  }

  confirmAction(): void {
    const action = this.modalAction();
    this.isProcessing.set(true);

    if (action === 'approve' || action === 'reject') {
      const expense = this.selectedExpense();
      if (!expense) return;

      const obs = action === 'approve' 
        ? this.adminService.approveExpense(expense.expenseId, this.remarks())
        : this.adminService.rejectExpense(expense.expenseId, this.remarks());

      obs.subscribe({
        next: () => {
          this.toastr.success(`Expense ${action}d successfully!`);
          this.handleSuccess();
        },
        error: (error) => {
          this.toastr.error(error.error || `Failed to ${action} expense`);
          this.isProcessing.set(false);
        }
      });
    } else {
      // Bulk Actions
      const ids = Array.from(this.selectedExpenseIds());
      const isApprove = action === 'bulk_approve';
      
      // We'll use a recursive approach or forkJoin if the API doesn't support bulk.
      // Based on previous knowledge, we might need multiple calls.
      let completed = 0;
      let failed = 0;

      ids.forEach(id => {
        const obs = isApprove
          ? this.adminService.approveExpense(id, this.remarks())
          : this.adminService.rejectExpense(id, this.remarks());

        obs.subscribe({
          next: () => {
            completed++;
            if (completed + failed === ids.length) this.handleBulkFinish(completed, failed);
          },
          error: () => {
            failed++;
            if (completed + failed === ids.length) this.handleBulkFinish(completed, failed);
          }
        });
      });
    }
  }

  handleBulkFinish(completed: number, failed: number): void {
    if (completed > 0) this.toastr.success(`Successfully processed ${completed} expenses.`);
    if (failed > 0) this.toastr.error(`Failed to process ${failed} expenses.`);
    this.handleSuccess();
  }

  handleSuccess(): void {
    this.isProcessing.set(false);
    this.closeModal();
    this.loadExpenses();
  }

  viewExpense(expense: Expense): void {
    this.router.navigate(['/admin/expenses', expense.expenseId]);
  }

  // Utility Functions
  getStatusClass(status: ExpenseStatus): string {
    switch (status) {
      case ExpenseStatus.PENDING: return 'status-pending';
      case ExpenseStatus.APPROVED: return 'status-approved';
      case ExpenseStatus.REJECTED: return 'status-rejected';
      default: return '';
    }
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR'
    }).format(amount);
  }

  exportToCSV(): void {
    const headers = ['ID', 'Employee', 'Email', 'Category', 'Amount', 'Date', 'Status', 'Description'];
    const csvContent = [
      headers.join(','),
      ...this.filteredExpenses().map((e) =>
        [
          e.expenseId,
          `"${e.employeeName}"`,
          e.employeeEmail,
          `"${e.categoryName || ''}"`,
          e.amount,
          this.formatDate(e.expenseDate),
          e.status,
          `"${e.description.replace(/"/g, '""')}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  exportToPDF(): void {
    const doc = new jsPDF();
    const data = this.filteredExpenses().map(e => [
      e.expenseId,
      e.employeeName,
      e.categoryName || 'N/A',
      this.formatAmount(e.amount),
      this.formatDate(e.expenseDate),
      e.status
    ]);

    doc.setFontSize(18);
    doc.text('Expense Report', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    autoTable(doc, {
      startY: 40,
      head: [['ID', 'Employee', 'Category', 'Amount', 'Date', 'Status']],
      body: data,
      theme: 'grid',
      headStyles: { fillColor: [102, 126, 234], textColor: 255 },
      styles: { fontSize: 9 },
      columnStyles: {
        3: { halign: 'right' },
        0: { cellWidth: 15 }
      }
    });

    doc.save(`expenses_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  viewBill(expense: Expense): void {
    if (!expense.attachments || expense.attachments.length === 0) {
      this.toastr.info('No attachments found for this expense');
      return;
    }

    const attachment = expense.attachments[0];
    this.attachmentService.downloadFile(attachment.attachmentId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      },
      error: () => this.toastr.error('Failed to view attachment')
    });
  }
}
