import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../../services/user.service';
import { User, Role } from '../../../models/user.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // If using ngModel
import { ReactiveFormsModule } from '@angular/forms'; // If using FormGroup
import { RouterLink, RouterLinkActive } from '@angular/router';

// ✅ Import all child components
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';
@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
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

  styleUrls: ['./manage-users.component.css'],
})
export class ManageUsersComponent implements OnInit {
  users: User[] = [];
  isLoading = true;

  // Filters
  searchTerm = '';
  selectedRole = 'ALL';

  // Delete Modal
  showDeleteModal = false;
  userToDelete: User | null = null;
  isDeleting = false;

  // View Modal
  showViewModal = false;
  selectedUser: User | null = null;

  constructor(private userService: UserService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
      },
      error: (error) => {
        this.toastr.error('Failed to load users');
        this.isLoading = false;
      },
    });
  }

  get filteredUsers(): User[] {
    let result = [...this.users];

    // Filter by role
    if (this.selectedRole !== 'ALL') {
      result = result.filter((u) => u.role === this.selectedRole);
    }

    // Filter by search
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(
        (u) =>
          u.firstname.toLowerCase().includes(term) ||
          u.lastname.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term) ||
          u.department?.toLowerCase().includes(term)
      );
    }

    return result;
  }

  get totalCount(): number {
    return this.users.length;
  }

  get employeeCount(): number {
    return this.users.filter((u) => u.role === Role.EMPLOYEE).length;
  }

  get adminCount(): number {
    return this.users.filter((u) => u.role === Role.ADMIN).length;
  }

  get verifiedCount(): number {
    return this.users.filter((u) => u.isVerified).length;
  }

  // View User
  viewUser(user: User): void {
    this.selectedUser = user;
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedUser = null;
  }

  // Delete User
  openDeleteModal(user: User): void {
    this.userToDelete = user;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.userToDelete = null;
  }

  confirmDelete(): void {
    if (!this.userToDelete) return;

    this.isDeleting = true;
    this.userService.deleteUser(this.userToDelete.id).subscribe({
      next: () => {
        this.toastr.success('User deleted successfully!');
        this.isDeleting = false;
        this.closeDeleteModal();
        this.loadUsers();
      },
      error: (error) => {
        this.toastr.error(error.error || 'Failed to delete user');
        this.isDeleting = false;
      },
    });
  }

  // Utility
  getRoleClass(role: Role): string {
    return role === Role.ADMIN ? 'role-admin' : 'role-employee';
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  getInitials(user: User): string {
    return `${user.firstname.charAt(0)}${user.lastname.charAt(0)}`.toUpperCase();
  }
}
