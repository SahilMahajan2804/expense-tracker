import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './verify-otp.component.html',
  styleUrl: './verify-otp.component.css',
})
export class VerifyOtpComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastr = inject(ToastrService);

  otpForm: FormGroup = this.fb.group({
    otp: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(6)]],
  });

  email = signal('');
  isLoading = signal(false);
  isResending = signal(false);

  ngOnInit(): void {
    // Get email from query params immediately
    const emailFromUrl = this.route.snapshot.queryParams['email'] || '';
    this.email.set(emailFromUrl);

    // Also subscribe for any dynamic changes
    this.route.queryParams.subscribe((params) => {
      if (params['email'] && params['email'] !== this.email()) {
        this.email.set(params['email']);
      }
    });

    if (!this.email()) {
      this.toastr.warning('Please enter your email to verify account');
      this.router.navigate(['/register']);
    }
  }

  onSubmit(): void {
    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    this.authService
      .verifyOtp({
        email: this.email(),
        otp: this.otpForm.value.otp,
      })
      .subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.toastr.success(response.message);
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.toastr.error(error.error?.message || 'Invalid OTP');
        },
      });
  }

  resendOtp(): void {
    this.isResending.set(true);

    this.authService.resendOtp(this.email()).subscribe({
      next: () => {
        this.isResending.set(false);
        this.toastr.success('OTP sent successfully!');
      },
      error: () => {
        this.isResending.set(false);
        this.toastr.error('Failed to resend OTP');
      },
    });
  }

  get f() {
    return this.otpForm.controls;
  }
}
