// components/auth/login/login.component.ts

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../services/auth.service';
import { Role } from '../../../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  isLoading = signal(false);
  showPassword = signal(false);

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        console.log('Login successful, response:', response);

        this.toastr.success('Login successful!');

        // Normalize role for comparison
        let userRole = response.role?.toString().toUpperCase() || '';
        if (userRole.startsWith('ROLE_')) {
          userRole = userRole.replace('ROLE_', '');
        }

        console.log('Normalized role for redirect:', userRole);

        // Navigate based on role
        if (userRole === 'ADMIN' || userRole === Role.ADMIN) {
          console.log('Navigating to admin dashboard');
          this.router.navigate(['/admin/dashboard']);
        } else {
          console.log('Navigating to employee dashboard');
          this.router.navigate(['/employee/dashboard']);
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('Login error:', error);

        // Handle different error formats
        let message = 'Login failed. Please try again.';
        if (error.error?.message) {
          message = error.error.message;
        } else if (typeof error.error === 'string') {
          message = error.error;
        } else if (error.message) {
          message = error.message;
        }

        this.toastr.error(message);
      },
    });
  }

  get f() {
    return this.loginForm.controls;
  }
}
