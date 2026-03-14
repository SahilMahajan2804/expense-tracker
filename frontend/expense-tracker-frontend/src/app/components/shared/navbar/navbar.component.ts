import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ThemeService } from '../../../services/theme.service';
import { MobileNavService } from '../../../services/mobile-nav.service';
import { Role } from '../../../models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  private mobileNavService = inject(MobileNavService);

  currentUser = this.authService.currentUser;
  isAdmin = this.authService.isAdmin;
  theme = this.themeService.theme;

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleSidebar(): void {
    this.mobileNavService.toggleSidebar();
  }

  logout(): void {
    this.authService.logout();
  }
}
