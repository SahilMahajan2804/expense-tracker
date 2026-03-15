import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ExpenseService } from '../../../services/expense.service';
import { CategoryService } from '../../../services/category.service';
import { AttachmentService } from '../../../services/attachment.service';
import { Category } from '../../../models/category.model';
import { Expense, ExpenseStatus } from '../../../models/expense.model';
import { Attachment } from '../../../models/attachment.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // If using ngModel
import { ReactiveFormsModule } from '@angular/forms'; // If using FormGroup
import { RouterLink } from '@angular/router';

// ✅ Import all child components
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-edit-expense',
  templateUrl: './edit-expense.component.html',
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
  styleUrls: ['./edit-expense.component.css'],
})
export class EditExpenseComponent implements OnInit {
  expenseForm!: FormGroup;
  expense: Expense | null = null;
  categories: Category[] = [];
  existingAttachments: Attachment[] = [];
  newFiles: File[] = [];

  expenseId!: number;
  isLoading = true;
  isSubmitting = false;
  isLoadingCategories = true;

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
    private categoryService: CategoryService,
    private attachmentService: AttachmentService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.expenseId = +this.route.snapshot.params['id'];
    this.loadCategories();
    this.loadExpense();
  }

  initForm(): void {
    this.expenseForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(0.01)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      expenseDate: ['', Validators.required],
      categoryId: ['', Validators.required],
    });
  }

  loadCategories(): void {
    this.categoryService.getActiveCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.isLoadingCategories = false;
      },
      error: () => {
        this.toastr.error('Failed to load categories');
        this.isLoadingCategories = false;
      },
    });
  }

  loadExpense(): void {
    this.expenseService.getExpenseById(this.expenseId).subscribe({
      next: (expense) => {
        this.expense = expense;

        // Check if expense can be edited
        if (expense.status !== ExpenseStatus.PENDING) {
          this.toastr.warning('Only pending expenses can be edited');
          this.router.navigate(['/employee/expenses']);
          return;
        }

        // Populate form
        this.expenseForm.patchValue({
          amount: expense.amount,
          description: expense.description,
          expenseDate: this.formatDate(expense.expenseDate),
          categoryId: expense.categoryId,
        });

        this.existingAttachments = expense.attachments || [];
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('Failed to load expense');
        this.router.navigate(['/employee/expenses']);
      },
    });
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  onFileSelect(event: any): void {
    const files = event.target.files;
    for (let file of files) {
      if (file.size > 10 * 1024 * 1024) {
        this.toastr.error(`${file.name} is too large. Max size is 10MB`);
        continue;
      }
      this.newFiles.push(file);
    }
  }

  removeNewFile(index: number): void {
    this.newFiles.splice(index, 1);
  }

  removeExistingAttachment(attachment: Attachment): void {
    if (confirm('Are you sure you want to remove this attachment?')) {
      this.attachmentService.deleteAttachment(attachment.attachmentId).subscribe({
        next: () => {
          this.existingAttachments = this.existingAttachments.filter(
            (a) => a.attachmentId !== attachment.attachmentId
          );
          this.toastr.success('Attachment removed');
        },
        error: () => {
          this.toastr.error('Failed to remove attachment');
        },
      });
    }
  }

  onSubmit(): void {
    if (this.expenseForm.invalid) {
      this.expenseForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    this.expenseService.updateExpense(this.expenseId, this.expenseForm.value).subscribe({
      next: (expense) => {
        if (this.newFiles.length > 0) {
          this.uploadNewAttachments(expense.expenseId);
        } else {
          this.isSubmitting = false;
          this.toastr.success('Expense updated successfully!');
          this.router.navigate(['/employee/expenses']);
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        this.toastr.error(error.error || 'Failed to update expense');
      },
    });
  }

  uploadNewAttachments(expenseId: number): void {
    let uploadCount = 0;
    const totalFiles = this.newFiles.length;

    this.newFiles.forEach((file) => {
      this.attachmentService.uploadFile(expenseId, file).subscribe({
        next: () => {
          uploadCount++;
          if (uploadCount === totalFiles) {
            this.isSubmitting = false;
            this.toastr.success('Expense updated with attachments!');
            this.router.navigate(['/employee/expenses']);
          }
        },
        error: () => {
          uploadCount++;
          this.toastr.warning('Some attachments failed to upload');
          if (uploadCount === totalFiles) {
            this.isSubmitting = false;
            this.router.navigate(['/employee/expenses']);
          }
        },
      });
    });
  }

  get f() {
    return this.expenseForm.controls;
  }
}
