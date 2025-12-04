import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../Services/auth';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="user">
      <h2>Welcome, {{ user.firstName }} {{ user.lastName }}</h2>
      <p>Email: {{ user.email }}</p>
      <p>Date Of Birth: {{ user.dateOfBirth }}</p>
    </div>
  `
})
export class UserProfile {
  user: any = null;

  constructor(private authService: AuthService) {
    this.authService.currentUser$.subscribe(u => this.user = u);
  }
}
