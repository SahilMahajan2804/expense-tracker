import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ResetPasswordRequest } from '../../../models/user.model';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card glassmorphism">
        <div class="auth-header">
          <h2>Reset Password</h2>
          <p>Enter the code sent to {{ email }}</p>
        </div>

        <form (ngSubmit)="onSubmit()" #resetForm="ngForm">
          <div class="form-group">
            <label for="otp">Verification Code</label>
            <div class="input-wrapper">
              <i class="fas fa-key"></i>
              <input
                type="text"
                id="otp"
                name="otp"
                [(ngModel)]="resetRequest.otp"
                required
                minlength="6"
                maxlength="6"
                placeholder="6-digit code"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="newPassword">New Password</label>
            <div class="input-wrapper">
              <i class="fas fa-lock"></i>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                [(ngModel)]="resetRequest.newPassword"
                required
                minlength="8"
                #pwd="ngModel"
                placeholder="At least 8 characters"
              />
            </div>
            <div *ngIf="pwd.invalid && (pwd.dirty || pwd.touched)" class="error-message">
              Password must be at least 8 characters long
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <div class="input-wrapper">
              <i class="fas fa-lock"></i>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                [(ngModel)]="confirmPassword"
                required
                placeholder="Repeat new password"
              />
            </div>
            <div *ngIf="confirmPassword !== resetRequest.newPassword && resetRequest.newPassword" class="error-message">
              Passwords do not match
            </div>
          </div>

          <button type="submit" [disabled]="resetForm.invalid || isLoading || confirmPassword !== resetRequest.newPassword" class="btn-primary">
            <span *ngIf="!isLoading">Update Password</span>
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
export class ResetPasswordComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email: string = '';
  confirmPassword: string = '';
  isLoading: boolean = false;
  message: string = '';
  messageType: 'success' | 'error' = 'success';

  resetRequest: ResetPasswordRequest = {
    email: '',
    otp: '',
    newPassword: ''
  };

  ngOnInit() {
    this.email = this.route.snapshot.queryParams['email'] || '';
    if (!this.email) {
      this.router.navigate(['/forgot-password']);
    }
    this.resetRequest.email = this.email;
  }

  onSubmit() {
    this.isLoading = true;
    this.message = '';

    this.authService.resetPassword(this.resetRequest).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.message = 'Password reset successfully! Redirecting to login...';
        this.messageType = 'success';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (error) => {
        this.isLoading = false;
        this.message = error.error?.message || 'Failed to reset password. Please check the code and try again.';
        this.messageType = 'error';
      }
    });
  }
}
