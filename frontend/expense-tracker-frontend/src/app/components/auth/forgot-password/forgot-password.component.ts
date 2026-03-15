import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card glassmorphism">
        <div class="auth-header">
          <h2>Forgot Password</h2>
          <p>Enter your email to receive a reset code</p>
        </div>

        <form (ngSubmit)="onSubmit()" #forgotForm="ngForm">
          <div class="form-group">
            <label for="email">Email Address</label>
            <div class="input-wrapper">
              <i class="fas fa-envelope"></i>
              <input
                type="email"
                id="email"
                name="email"
                [(ngModel)]="email"
                required
                email
                #emailModel="ngModel"
                placeholder="you@example.com"
              />
            </div>
            <div *ngIf="emailModel.invalid && (emailModel.dirty || emailModel.touched)" class="error-message">
              <span *ngIf="emailModel.errors?.['required']">Email is required</span>
              <span *ngIf="emailModel.errors?.['email']">Please enter a valid email</span>
            </div>
          </div>

          <button type="submit" [disabled]="forgotForm.invalid || isLoading" class="btn-primary">
            <span *ngIf="!isLoading">Send Reset Code</span>
            <span *ngIf="isLoading" class="loader"></span>
          </button>

          <div class="auth-footer">
            <p>Back to <a routerLink="/login">Login</a></p>
          </div>
        </form>

        <div *ngIf="message" [class]="'alert ' + messageType">
          {{ message }}
        </div>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email: string = '';
  isLoading: boolean = false;
  message: string = '';
  messageType: 'success' | 'error' = 'success';

  onSubmit() {
    this.isLoading = true;
    this.message = '';

    this.authService.forgotPassword(this.email).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.message = 'Verification code sent to your email!';
        this.messageType = 'success';
        // Navigate to reset password page after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/reset-password'], { queryParams: { email: this.email } });
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.message = error.error?.message || 'Failed to send reset code. Please try again.';
        this.messageType = 'error';
      }
    });
  }
}
