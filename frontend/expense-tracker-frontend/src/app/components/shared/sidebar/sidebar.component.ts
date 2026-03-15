import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { MobileNavService } from '../../../services/mobile-nav.service';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  mobileNavService = inject(MobileNavService);

  isCollapsed = signal(false);
  isAdmin = this.authService.isAdmin;

  menuItems = computed(() => {
    const isAdmin = this.isAdmin();
    return isAdmin
      ? [
          { icon: 'fas fa-tachometer-alt', label: 'Dashboard', route: '/admin/dashboard' },
          { icon: 'fas fa-clock', label: 'Pending Requests', route: '/admin/expenses/pending' },
          { icon: 'fas fa-list', label: 'All Expenses', route: '/admin/expenses' },
          { icon: 'fas fa-history', label: 'Approval History', route: '/admin/approvals' },
          { icon: 'fas fa-tags', label: 'Categories', route: '/admin/categories' },
          { icon: 'fas fa-users', label: 'Users', route: '/admin/users' },
          { icon: 'fas fa-info-circle', label: 'About Us', route: '/about' },
        ]
      : [
          { icon: 'fas fa-tachometer-alt', label: 'Dashboard', route: '/employee/dashboard' },
          { icon: 'fas fa-plus-circle', label: 'New Expense', route: '/employee/expenses/create' },
          { icon: 'fas fa-list', label: 'My Expenses', route: '/employee/expenses' },
          { icon: 'fas fa-info-circle', label: 'About Us', route: '/about' },
        ];
  });

  toggleSidebar(): void {
    this.isCollapsed.update((v) => !v);
  }

  onLinkClick(): void {
    if (window.innerWidth <= 768) {
      this.mobileNavService.closeSidebar();
    }
  }
}
