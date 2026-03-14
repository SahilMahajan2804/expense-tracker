import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AdminService } from '../../../services/admin.service';
import { Approval, ApprovalDecision } from '../../../models/expense.model';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // If using ngModel
import { ReactiveFormsModule } from '@angular/forms'; // If using FormGroup
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-approval-history',
  templateUrl: './approval-history.component.html',
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
  styleUrls: ['./approval-history.component.css'],
})
export class ApprovalHistoryComponent implements OnInit {
  approvals: Approval[] = [];
  isLoading = true;

  // Filters
  searchTerm = '';
  selectedDecision = 'ALL';

  constructor(private adminService: AdminService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.loadApprovals();
  }

  loadApprovals(): void {
    this.isLoading = true;
    this.adminService.getMyApprovals().subscribe({
      next: (approvals) => {
        this.approvals = approvals;
        this.isLoading = false;
      },
      error: (error) => {
        this.toastr.error('Failed to load approval history');
        this.isLoading = false;
      },
    });
  }

  get filteredApprovals(): Approval[] {
    let result = [...this.approvals];

    // Filter by decision
    if (this.selectedDecision !== 'ALL') {
      result = result.filter((a) => a.decision === this.selectedDecision);
    }

    // Filter by search
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(
        (a) => a.remarks?.toLowerCase().includes(term) || a.expenseId.toString().includes(term)
      );
    }

    return result;
  }

  get totalCount(): number {
    return this.approvals.length;
  }

  get approvedCount(): number {
    return this.approvals.filter((a) => a.decision === ApprovalDecision.APPROVED).length;
  }

  get rejectedCount(): number {
    return this.approvals.filter((a) => a.decision === ApprovalDecision.REJECTED).length;
  }

  getDecisionClass(decision: ApprovalDecision): string {
    return decision === ApprovalDecision.APPROVED ? 'approved' : 'rejected';
  }

  formatDateTime(date: Date | string): string {
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
