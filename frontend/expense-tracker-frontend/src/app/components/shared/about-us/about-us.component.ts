import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [CommonModule, NavbarComponent, SidebarComponent],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.css'
})
export class AboutUsComponent {
  founders = [
    {
      name: 'Shruti Markad',
      role: 'Co-Founder & System Architect',
      image: '/assets/images/shruti.png',
      linkedin: 'https://www.linkedin.com/in/shruti-markad-242026302/',
      email: 'shrutimarkad05@gmail.com',
      phone: '9175980849',
      github: null
    },
    {
      name: 'Sahil Mahajan',
      role: 'Co-Founder & Lead Developer',
      image: '/assets/images/sahil.png',
      linkedin: 'https://www.linkedin.com/in/sahil-mahajan-6164b8292/',
      github: 'https://github.com/SahilMahajan2804',
      email: 'sahilmahajan2804@gmail.com',
      phone: '7757879510'
    }
  ];

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = '/assets/images/default-avatar.png';
  }
}