import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NavbarComponent,
    SidebarComponent,
    LoadingSpinnerComponent
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  private userService = inject(UserService);
  private fb = inject(FormBuilder);
  private toastr = inject(ToastrService);

  user = signal<User | null>(null);
  isLoading = signal(true);
  isSubmitting = signal(false);
  profileForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.loadProfile();
  }

  initForm(): void {
    this.profileForm = this.fb.group({
      firstname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: [{ value: '', disabled: true }],
      phone: ['', [Validators.maxLength(15)]],
      department: ['', [Validators.maxLength(50)]],
      role: [{ value: '', disabled: true }]
    });
  }

  loadProfile(): void {
    this.isLoading.set(true);
    this.userService.getMyProfile().subscribe({
      next: (data) => {
        this.user.set(data);
        this.profileForm.patchValue({
          firstname: data.firstname,
          lastname: data.lastname,
          email: data.email,
          phone: data.phone,
          department: data.department,
          role: data.role
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        this.toastr.error('Failed to load profile');
        this.isLoading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.userService.updateMyProfile(this.profileForm.getRawValue()).subscribe({
      next: (updatedUser) => {
        this.user.set(updatedUser);
        this.toastr.success('Profile updated successfully!');
        this.isSubmitting.set(false);
        // Update local storage if needed to reflect name changes in navbar
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        currentUser.firstname = updatedUser.firstname;
        currentUser.lastname = updatedUser.lastname;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
      },
      error: (err) => {
        this.toastr.error(err.error || 'Failed to update profile');
        this.isSubmitting.set(false);
      }
    });
  }

  get f() {
    return this.profileForm.controls;
  }

  getInitials(): string {
    const user = this.user();
    if (!user) return '';
    return `${user.firstname.charAt(0)}${user.lastname.charAt(0)}`.toUpperCase();
  }
}
