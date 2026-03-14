import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MobileNavService {
  isSidebarActive = signal(false);

  toggleSidebar(): void {
    this.isSidebarActive.update((active) => !active);
  }

  closeSidebar(): void {
    this.isSidebarActive.set(false);
  }
}
