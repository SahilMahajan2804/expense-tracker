import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterLink } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

import { AdminService } from '../../../services/admin.service';
import { Dashboard } from '../../../models/dashboard.model';
import { Expense } from '../../../models/expense.model';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NavbarComponent,
    SidebarComponent,
    LoadingSpinnerComponent,
    BaseChartDirective,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);

  // Using signals for reactive state
  dashboard = signal<Dashboard | null>(null);
  recentExpenses = signal<Expense[]>([]);
  isLoading = signal(true);

  // Chart Data
  public pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: [],
    datasets: [{ data: [], backgroundColor: [] }]
  };
  public pieChartType: ChartType = 'pie';
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'right', labels: { color: '#64748b', font: { family: 'Inter', size: 11 } } },
    }
  };

  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Monthly Spending',
      backgroundColor: 'rgba(102, 126, 234, 0.8)',
      borderColor: 'rgba(102, 126, 234, 1)',
      borderWidth: 0,
      borderRadius: 6
    }]
  };
  public barChartType: ChartType = 'bar';
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#64748b' } },
      x: { grid: { display: false }, ticks: { color: '#64748b' } }
    },
    plugins: {
      legend: { display: false }
    }
  };

  ngOnInit(): void {
    this.loadDashboard();
    this.loadRecentExpenses();
  }

  loadDashboard(): void {
    this.isLoading.set(true);
    this.adminService.getAdminDashboard().subscribe({
      next: (data) => {
        this.dashboard.set(data);
        this.updateCharts(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load dashboard:', error);
        this.isLoading.set(false);
      },
    });
  }

  loadRecentExpenses(): void {
    this.adminService.getPendingExpenses().subscribe({
      next: (expenses) => {
        this.recentExpenses.set(expenses.slice(0, 5));
      },
      error: (error) => {
        console.error('Failed to load recent expenses:', error);
      },
    });
  }

  updateCharts(data: Dashboard): void {
    if (data.categoryBreakdown) {
      const labels = Object.keys(data.categoryBreakdown);
      const values = Object.values(data.categoryBreakdown);
      this.pieChartData = {
        labels,
        datasets: [{
          data: values,
          backgroundColor: ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6']
        }]
      };
    }

    if (data.monthlyTrends) {
      const labels = Object.keys(data.monthlyTrends);
      const values = Object.values(data.monthlyTrends);
      this.barChartData = {
        labels,
        datasets: [{
          data: values,
          label: 'Spending',
          backgroundColor: 'rgba(99, 102, 241, 0.8)',
          hoverBackgroundColor: 'rgba(99, 102, 241, 1)',
          borderRadius: 6
        }]
      };
    }
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}
