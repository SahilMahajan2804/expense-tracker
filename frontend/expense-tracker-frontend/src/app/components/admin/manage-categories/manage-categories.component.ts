import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CategoryService } from '../../../services/category.service';
import { Category, CategoryRequest } from '../../../models/category.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // If using ngModel
import { ReactiveFormsModule } from '@angular/forms'; // If using FormGroup
import { RouterLink, RouterLinkActive } from '@angular/router';

// ✅ Import all child components
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-manage-categories',
  templateUrl: './manage-categories.component.html',
  standalone: true,
  imports: [
    CommonModule, // ✅ For pipes and directives
    FormsModule, // ✅ For ngModel (if needed)
    ReactiveFormsModule, // ✅ For reactive forms (if needed)
    RouterLink, // ✅ For routerLink
    RouterLinkActive, // ✅ For routerLinkActive
    NavbarComponent, // ✅ For <app-navbar>
    SidebarComponent, // ✅ For <app-sidebar>
    LoadingSpinnerComponent, // ✅ For <app-loading-spinner>
  ],

  styleUrls: ['./manage-categories.component.css'],
})
export class ManageCategoriesComponent implements OnInit {
  categories: Category[] = [];
  isLoading = true;

  // Modal
  showModal = false;
  isEditMode = false;
  selectedCategory: Category | null = null;
  categoryForm!: FormGroup;
  isSubmitting = false;

  // Delete Modal
  showDeleteModal = false;
  categoryToDelete: Category | null = null;
  isDeleting = false;

  // Search & Filter
  searchTerm = '';
  filterStatus = 'ALL';

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
  }

  initForm(): void {
    this.categoryForm = this.fb.group({
      categoryName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      description: ['', Validators.maxLength(200)],
      isActive: [true],
    });
  }

  loadCategories(): void {
    this.isLoading = true;
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.isLoading = false;
      },
      error: (error) => {
        this.toastr.error('Failed to load categories');
        this.isLoading = false;
      },
    });
  }

  get filteredCategories(): Category[] {
    let result = [...this.categories];

    // Filter by status
    if (this.filterStatus !== 'ALL') {
      const isActive = this.filterStatus === 'ACTIVE';
      result = result.filter((c) => c.isActive === isActive);
    }

    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.categoryName.toLowerCase().includes(term) || c.description?.toLowerCase().includes(term)
      );
    }

    return result;
  }

  get activeCount(): number {
    return this.categories.filter((c) => c.isActive).length;
  }

  get inactiveCount(): number {
    return this.categories.filter((c) => !c.isActive).length;
  }

  // Modal Functions
  openAddModal(): void {
    this.isEditMode = false;
    this.selectedCategory = null;
    this.categoryForm.reset({ isActive: true });
    this.showModal = true;
  }

  openEditModal(category: Category): void {
    this.isEditMode = true;
    this.selectedCategory = category;
    this.categoryForm.patchValue({
      categoryName: category.categoryName,
      description: category.description,
      isActive: category.isActive,
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedCategory = null;
    this.categoryForm.reset();
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formData: CategoryRequest = this.categoryForm.value;

    if (this.isEditMode && this.selectedCategory) {
      this.categoryService.updateCategory(this.selectedCategory.categoryId, formData).subscribe({
        next: () => {
          this.toastr.success('Category updated successfully!');
          this.handleSuccess();
        },
        error: (error) => {
          this.toastr.error(error.error || 'Failed to update category');
          this.isSubmitting = false;
        },
      });
    } else {
      this.categoryService.createCategory(formData).subscribe({
        next: () => {
          this.toastr.success('Category created successfully!');
          this.handleSuccess();
        },
        error: (error) => {
          this.toastr.error(error.error || 'Failed to create category');
          this.isSubmitting = false;
        },
      });
    }
  }

  handleSuccess(): void {
    this.isSubmitting = false;
    this.closeModal();
    this.loadCategories();
  }

  // Toggle Status
  toggleStatus(category: Category): void {
    this.categoryService.toggleCategoryStatus(category.categoryId).subscribe({
      next: (updatedCategory) => {
        const status = updatedCategory.isActive ? 'activated' : 'deactivated';
        this.toastr.success(`Category ${status} successfully!`);
        this.loadCategories();
      },
      error: (error) => {
        this.toastr.error('Failed to update category status');
      },
    });
  }

  // Delete Functions
  openDeleteModal(category: Category): void {
    this.categoryToDelete = category;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.categoryToDelete = null;
  }

  confirmDelete(): void {
    if (!this.categoryToDelete) return;

    this.isDeleting = true;
    this.categoryService.deleteCategory(this.categoryToDelete.categoryId).subscribe({
      next: () => {
        this.toastr.success('Category deleted successfully!');
        this.isDeleting = false;
        this.closeDeleteModal();
        this.loadCategories();
      },
      error: (error) => {
        this.toastr.error(error.error || 'Failed to delete category');
        this.isDeleting = false;
      },
    });
  }

  // Form Getters
  get f() {
    return this.categoryForm.controls;
  }
}
