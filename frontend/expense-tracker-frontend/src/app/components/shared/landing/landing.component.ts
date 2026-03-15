import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {
  features = [
    {
      icon: 'fas fa-receipt',
      title: 'Expense Submission',
      desc: 'Employees can submit expenses with receipts, descriptions, and categories in seconds.'
    },
    {
      icon: 'fas fa-check-double',
      title: 'Admin Approvals',
      desc: 'Admins can approve or reject in bulk with remarks and a full approval history.'
    },
    {
      icon: 'fas fa-chart-pie',
      title: 'Analytics Dashboard',
      desc: 'Visual charts for spending trends, category breakdowns, and employee totals.'
    },
    {
      icon: 'fas fa-file-pdf',
      title: 'PDF Reports',
      desc: 'Export detailed PDF reports — daily, monthly, yearly, or custom date ranges.'
    },
    {
      icon: 'fas fa-bell',
      title: 'Email Notifications',
      desc: 'Instant email alerts for approvals, rejections and OTP verification via Brevo.'
    },
    {
      icon: 'fas fa-shield-alt',
      title: 'Secure & Role-based',
      desc: 'JWT authentication with separate admin and employee access levels.'
    }
  ];

  stats = [
    { value: '100%', label: 'Cloud Hosted' },
    { value: '2', label: 'User Roles' },
    { value: '∞', label: 'Expenses Tracked' },
    { value: '24/7', label: 'Available' }
  ];

  currentYear = new Date().getFullYear();
}
