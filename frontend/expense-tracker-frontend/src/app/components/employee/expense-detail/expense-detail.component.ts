import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ExpenseService } from '../../../services/expense.service';
import { AttachmentService } from '../../../services/attachment.service';
import { AuthService } from '../../../services/auth.service';
import { Expense } from '../../../models/expense.model';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // If using ngModel
import { ReactiveFormsModule } from '@angular/forms'; // If using FormGroup
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-expense-detail',
  templateUrl: './expense-detail.component.html',
  standalone: true,
  imports: [
    CommonModule, // ✅ For pipes and directives
    FormsModule, // ✅ For ngModel (if needed)
    ReactiveFormsModule, // ✅ For reactive forms (if needed)
    RouterLink, // ✅ For routerLink
    NavbarComponent, // ✅ For <app-navbar>
    SidebarComponent, // ✅ For <app-sidebar>
    LoadingSpinnerComponent, // ✅ For <app-loading-spinner>
  ],
  styleUrls: ['./expense-detail.component.css'],
})
export class ExpenseDetailComponent implements OnInit {
  expense: Expense | null = null;
  isLoading = true;
  expenseId!: number;
  isAdmin = false;

  constructor(
    private expenseService: ExpenseService,
    private attachmentService: AttachmentService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.expenseId = +this.route.snapshot.params['id'];
    this.isAdmin = this.authService.isAdmin();
    this.loadExpense();
  }

  loadExpense(): void {
    this.expenseService.getExpenseById(this.expenseId).subscribe({
      next: (expense) => {
        this.expense = expense;
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('Failed to load expense details');
        this.goBack();
      },
    });
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

  downloadAttachment(attachmentId: number, fileName: string): void {
    this.attachmentService.downloadFile(attachmentId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.toastr.error('Failed to download file');
      },
    });
  }

  goBack(): void {
    if (this.isAdmin) {
      this.router.navigate(['/admin/expenses']);
    } else {
      this.router.navigate(['/employee/expenses']);
    }
  }

  canEdit(): boolean {
    return !this.isAdmin && this.expense?.status === 'PENDING';
  }
}
