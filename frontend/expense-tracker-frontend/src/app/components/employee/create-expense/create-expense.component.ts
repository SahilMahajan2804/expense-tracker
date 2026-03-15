import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ExpenseService } from '../../../services/expense.service';
import { CategoryService } from '../../../services/category.service';
import { AttachmentService } from '../../../services/attachment.service';
import { Category } from '../../../models/category.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // If using ngModel
import { ReactiveFormsModule } from '@angular/forms'; // If using FormGroup
import { RouterLink } from '@angular/router';

// ✅ Import all child components
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-create-expense',
  templateUrl: './create-expense.component.html',
  standalone: true,
  imports: [
    CommonModule, // ✅ For pipes and directives
    FormsModule, // ✅ For ngModel (if needed)
    ReactiveFormsModule, // ✅ For reactive forms (if needed)
    RouterLink, // ✅ For routerLink
    NavbarComponent, // ✅ For <app-navbar>
    SidebarComponent, // ✅ For <app-sidebar>
  ],
  styleUrls: ['./create-expense.component.css'],
})
export class CreateExpenseComponent implements OnInit {
  expenseForm!: FormGroup;
  categories: Category[] = [];
  selectedFiles: File[] = [];
  isLoading = false;
  isLoadingCategories = true;

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
    private categoryService: CategoryService,
    private attachmentService: AttachmentService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
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
      error: (error) => {
        this.toastr.error('Failed to load categories');
        this.isLoadingCategories = false;
      },
    });
  }

  onFileSelect(event: any): void {
    const files = event.target.files;
    for (let file of files) {
      if (file.size > 10 * 1024 * 1024) {
        this.toastr.error(`${file.name} is too large. Max size is 10MB`);
        continue;
      }
      this.selectedFiles.push(file);
    }
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  onSubmit(): void {
    if (this.expenseForm.invalid) {
      this.expenseForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    this.expenseService.createExpense(this.expenseForm.value).subscribe({
      next: (expense) => {
        if (this.selectedFiles.length > 0) {
          this.uploadAttachments(expense.expenseId);
        } else {
          this.isLoading = false;
          this.toastr.success('Expense created successfully!');
          this.router.navigate(['/employee/expenses']);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.toastr.error(error.error || 'Failed to create expense');
      },
    });
  }

  uploadAttachments(expenseId: number): void {
    let uploadCount = 0;
    const totalFiles = this.selectedFiles.length;

    this.selectedFiles.forEach((file) => {
      this.attachmentService.uploadFile(expenseId, file).subscribe({
        next: () => {
          uploadCount++;
          if (uploadCount === totalFiles) {
            this.isLoading = false;
            this.toastr.success('Expense created with attachments!');
            this.router.navigate(['/employee/expenses']);
          }
        },
        error: (error) => {
          uploadCount++;
          const errorMsg = error.error || 'Connection error';
          this.toastr.warning(`Failed to upload ${file.name}: ${errorMsg}`);
          if (uploadCount === totalFiles) {
            this.isLoading = false;
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
