import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  registerForm: FormGroup = this.fb.group(
    {
      firstname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
      confirmPassword: ['', Validators.required],
      phone: ['', [Validators.maxLength(15)]],
      department: ['', [Validators.maxLength(50)]],
      role: ['EMPLOYEE', Validators.required], // Added role field with default EMPLOYEE
    },
    { validators: this.passwordMatchValidator },
  );

  isLoading = signal(false);
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true });
    }
    return null;
  }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update((v) => !v);
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    // Exclude confirmPassword from the data sent to backend
    const { confirmPassword, ...registerData } = this.registerForm.value;

    // Clean up empty optional fields (send null instead of empty string)
    if (!registerData.phone) registerData.phone = null;
    if (!registerData.department) registerData.department = null;

    console.log('Registration payload:', registerData);

    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.toastr.success(response.registerMessage || 'Registration successful!');
        this.router.navigate(['/verify-otp'], {
          queryParams: { email: response.email },
        });
      },
      error: (error) => {
        this.isLoading.set(false);
        let errorMessage = 'Registration failed';

        if (error.error) {
          if (typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.error.message) {
            errorMessage = error.error.message;
          } else {
            // Log the object for debugging but show a generic message or stringified version
            console.error('Registration error object:', error.error);
            errorMessage = error.message || 'An unexpected error occurred';
          }
        } else {
          errorMessage = error.message || 'Server connection failed';
        }

        this.toastr.error(errorMessage);
      },
    });
  }

  get f() {
    return this.registerForm.controls;
  }
}
