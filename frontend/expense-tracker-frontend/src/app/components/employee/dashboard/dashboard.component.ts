import { Component, OnInit } from '@angular/core';
import { ExpenseService } from '../../../services/expense.service';
import { Dashboard } from '../../../models/dashboard.model';
import { AuthService } from '../../../services/auth.service';
import { LoginResponse } from '../../../models/user.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // If using ngModel
import { ReactiveFormsModule } from '@angular/forms'; // If using FormGroup
import { RouterLink } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';

// ✅ Import all child components
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-employee-dashboard',
  templateUrl: './dashboard.component.html',
  standalone: true,
  imports: [
    CommonModule, // ✅ For pipes and directives
    FormsModule, // ✅ For ngModel (if needed)
    ReactiveFormsModule, // ✅ For reactive forms (if needed)
    RouterLink, // ✅ For routerLink
    BaseChartDirective,
    NavbarComponent, // ✅ For <app-navbar>
    SidebarComponent, // ✅ For <app-sidebar>
    LoadingSpinnerComponent, // ✅ For <app-loading-spinner>
  ],
  styleUrls: ['./dashboard.component.css'],
})
export class EmployeeDashboardComponent implements OnInit {
  dashboard: Dashboard | null = null;
  currentUser: LoginResponse | null = null;
  isLoading = true;

  categoryChartData: ChartData<'doughnut', number[], string> = {
    labels: [],
    datasets: [{ data: [], backgroundColor: [] }],
  };
  categoryChartType = 'doughnut' as const;
  categoryChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right' },
    },
  };

  monthlyChartData: ChartData<'bar', number[], string> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Expenses',
        backgroundColor: '#087f8c',
        borderRadius: 5,
      },
    ],
  };
  monthlyChartType = 'bar' as const;
  monthlyChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true },
    },
    plugins: {
      legend: { display: false },
    },
  };

  constructor(
    private expenseService: ExpenseService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.expenseService.getEmployeeDashboard().subscribe({
      next: (data) => {
        this.dashboard = data;
        this.updateCharts(data);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard:', error);
        this.isLoading = false;
      },
    });
  }

  private updateCharts(data: Dashboard): void {
    const categoryEntries = Object.entries(data.categoryBreakdown ?? {});
    this.categoryChartData = {
      labels: categoryEntries.map(([category]) => category),
      datasets: [
        {
          data: categoryEntries.map(([, amount]) => amount),
          backgroundColor: ['#087f8c', '#e07a5f', '#577590', '#f2cc8f', '#81b29a', '#bc6c25'],
        },
      ],
    };

    const monthlyEntries = Object.entries(data.monthlyTrends ?? {}).sort(([left], [right]) =>
      left.localeCompare(right),
    );
    this.monthlyChartData = {
      labels: monthlyEntries.map(([month]) => this.formatMonth(month)),
      datasets: [
        {
          data: monthlyEntries.map(([, amount]) => amount),
          label: 'Expenses',
          backgroundColor: '#087f8c',
          borderRadius: 5,
        },
      ],
    };
  }

  private formatMonth(month: string): string {
    return new Intl.DateTimeFormat('en-IN', { month: 'short', year: 'numeric' }).format(
      new Date(`${month}-01T00:00:00`),
    );
  }
}
