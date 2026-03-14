// src/app/components/employee/my-expenses/my-expenses.component.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // ✅
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ExpenseService } from '../../../services/expense.service';
import { Expense, ExpenseStatus } from '../../../models/expense.model';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-my-expenses',
  standalone: true,
  imports: [
    CommonModule, // ✅
    FormsModule,
    RouterLink,
    NavbarComponent,
    SidebarComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './my-expenses.component.html',
  styleUrl: './my-expenses.component.css',
})
export class MyExpensesComponent implements OnInit {
  expenses: Expense[] = [];
  filteredExpenses: Expense[] = [];
  isLoading = true;

  // Filters
  selectedStatus: string = 'ALL';
  searchTerm: string = '';
  sortBy: string = 'date-desc';

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  // Delete Modal
  showDeleteModal = false;
  expenseToDelete: Expense | null = null;
  isDeleting = false;

  statusOptions = [
    { value: 'ALL', label: 'All Status' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
  ];

  constructor(private expenseService: ExpenseService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.loadExpenses();
  }

  loadExpenses(): void {
    this.isLoading = true;
    this.expenseService.getMyExpenses().subscribe({
      next: (expenses) => {
        this.expenses = expenses;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        this.toastr.error('Failed to load expenses');
        this.isLoading = false;
      },
    });
  }

  applyFilters(): void {
    let result = [...this.expenses];

    // Filter by status
    if (this.selectedStatus !== 'ALL') {
      result = result.filter((e) => e.status === this.selectedStatus);
    }

    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(
        (e) =>
          e.description.toLowerCase().includes(term) ||
          e.categoryName?.toLowerCase().includes(term) ||
          e.amount.toString().includes(term)
      );
    }

    // Sort
    result = this.sortExpenses(result);

    this.filteredExpenses = result;
    this.totalPages = Math.ceil(this.filteredExpenses.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  sortExpenses(expenses: Expense[]): Expense[] {
    switch (this.sortBy) {
      case 'date-desc':
        return expenses.sort(
          (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        );
      case 'date-asc':
        return expenses.sort(
          (a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
        );
      case 'amount-desc':
        return expenses.sort((a, b) => b.amount - a.amount);
      case 'amount-asc':
        return expenses.sort((a, b) => a.amount - b.amount);
      default:
        return expenses;
    }
  }

  get paginatedExpenses(): Expense[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredExpenses.slice(start, end);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'status-pending';
      case 'APPROVED':
        return 'status-approved';
      case 'REJECTED':
        return 'status-rejected';
      default:
        return '';
    }
  }

  openDeleteModal(expense: Expense): void {
    if (expense.status !== ExpenseStatus.PENDING) {
      this.toastr.warning('Only pending expenses can be deleted');
      return;
    }
    this.expenseToDelete = expense;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.expenseToDelete = null;
  }

  confirmDelete(): void {
    if (!this.expenseToDelete) return;

    this.isDeleting = true;
    this.expenseService.deleteExpense(this.expenseToDelete.expenseId).subscribe({
      next: () => {
        this.toastr.success('Expense deleted successfully');
        this.closeDeleteModal();
        this.loadExpenses();
        this.isDeleting = false;
      },
      error: (error) => {
        this.toastr.error(error.error || 'Failed to delete expense');
        this.isDeleting = false;
      },
    });
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onSortChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.selectedStatus = 'ALL';
    this.searchTerm = '';
    this.sortBy = 'date-desc';
    this.applyFilters();
  }
}
