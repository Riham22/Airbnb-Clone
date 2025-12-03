import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../Services/auth';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="account-container">
      <div class="header-section">
        <h1>Account</h1>
        <div class="user-subtitle" *ngIf="user">
          <span class="user-name">{{ user.firstName }} {{ user.lastName }}</span>
          <span class="separator">, </span>
          <span class="user-email">{{ user.email }}</span>
          <span class="separator"> · </span>
          <a href="#" class="profile-link">Go to profile</a>
        </div>
      </div>

      <div class="settings-grid">
        <!-- Personal Info -->
        <a class="setting-card" routerLink="/account-personal-info">
          <div class="icon-wrapper">
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style="display: block; height: 32px; width: 32px; fill: currentcolor;"><path d="M16 1a5 5 0 1 1-5 5 5 5 0 0 1 5-5zm0 2a3 3 0 1 0 3 3 3 3 0 0 0-3-3zm6 12v1h-2v-1a5 5 0 0 0-5-5h-4a5 5 0 0 0-5 5v1H4v-1a7 7 0 0 1 7-7h4a7 7 0 0 1 7 7zm10-1a2 2 0 1 1-2 2 2 2 0 0 1 2-2zm0 2a.001.001 0 0 0 0 0zm-4-3v2h-2v-2h2zm-12 8a7 7 0 1 1 7 7 7 7 0 0 1-7-7zm2 7a5 5 0 1 0 5-5 5 5 0 0 0-5 5z"></path></svg>
          </div>
          <div class="content">
            <h3>Personal info</h3>
            <p>Provide personal details and how we can reach you</p>
          </div>
        </a>

        <!-- Login & Security -->
        <a class="setting-card" routerLink="/account-login-security">
          <div class="icon-wrapper">
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style="display: block; height: 32px; width: 32px; fill: currentcolor;"><path d="M26 15V8a10 10 0 1 0-20 0v7H4v18h24V15h-2zm-18-7a8 8 0 1 1 16 0v7H8V8zm18 23H6V17h20v14z"></path></svg>
          </div>
          <div class="content">
            <h3>Login & security</h3>
            <p>Update your password and secure your account</p>
          </div>
        </a>

        <!-- Payments -->
        <a class="setting-card" routerLink="/account-payments">
          <div class="icon-wrapper">
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style="display: block; height: 32px; width: 32px; fill: currentcolor;"><path d="M29 5a2 2 0 0 1 2 2v18a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h26zm0 2H3v4h26V7zm0 18V13H3v12h26zm-7-5h4v2h-4v-2z"></path></svg>
          </div>
          <div class="content">
            <h3>Payments & payouts</h3>
            <p>Review payments, payouts, coupons, and gift cards</p>
          </div>
        </a>

        <!-- Taxes -->
        <a class="setting-card" routerLink="/account-taxes">
          <div class="icon-wrapper">
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style="display: block; height: 32px; width: 32px; fill: currentcolor;"><path d="M27 3a2 2 0 0 1 2 2v22a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h22zm0 2H5v22h22V5zM9 11h14v2H9v-2zm0 6h14v2H9v-2zm0 6h8v2H9v-2z"></path></svg>
          </div>
          <div class="content">
            <h3>Taxes</h3>
            <p>Manage taxpayer information and tax documents</p>
          </div>
        </a>

        <!-- Notifications -->
        <a class="setting-card" routerLink="/notifications">
          <div class="icon-wrapper">
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style="display: block; height: 32px; width: 32px; fill: currentcolor;"><path d="M24.3 20.3 27 23v2H5v-2l2.7-2.7A8.9 8.9 0 0 0 10 14V9a6 6 0 0 1 12 0v5c0 2.3.9 4.5 2.3 6.3zM16 31a5 5 0 0 1-4.9-4h9.8A5 5 0 0 1 16 31z"></path></svg>
          </div>
          <div class="content">
            <h3>Notifications</h3>
            <p>Choose notification preferences and how you want to be contacted</p>
          </div>
        </a>

        <!-- Privacy -->
        <a class="setting-card" routerLink="/account-privacy">
          <div class="icon-wrapper">
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style="display: block; height: 32px; width: 32px; fill: currentcolor;"><path d="M16 3a9 9 0 0 1 9 9c0 2.1-.7 4-2 5.6V29h-2v-4h-2v4h-2v-4h-2v4H13V17.6A8.9 8.9 0 0 1 7 12a9 9 0 0 1 9-9zm0 2a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm4 10h-2v-2h2v2zm-4 0h-2v-2h2v2zm-4 0H8v-2h4v2z"></path></svg>
          </div>
          <div class="content">
            <h3>Privacy & sharing</h3>
            <p>Manage your personal data, connected services, and data sharing settings</p>
          </div>
        </a>

        <!-- Global Preferences -->
        <a class="setting-card" routerLink="/account-preferences">
          <div class="icon-wrapper">
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style="display: block; height: 32px; width: 32px; fill: currentcolor;"><path d="M16 1a15 15 0 1 1 0 30 15 15 0 0 1 0-30zm0 2a13 13 0 1 0 0 26 13 13 0 0 0 0-26zm-1 10h2v16h-2V13zm1-10a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"></path></svg>
          </div>
          <div class="content">
            <h3>Global preferences</h3>
            <p>Set your default language, currency, and timezone</p>
          </div>
        </a>

        <!-- Travel for Work -->
        <a class="setting-card" routerLink="/account-travel-work">
          <div class="icon-wrapper">
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style="display: block; height: 32px; width: 32px; fill: currentcolor;"><path d="M28 6v20H4V6h24zm-2 2H6v16h20V8zM14 13v2h4v-2h-4zM4 2h24v2H4V2z"></path></svg>
          </div>
          <div class="content">
            <h3>Travel for work</h3>
            <p>Add a work email for business trip benefits</p>
          </div>
        </a>

        <!-- Professional Hosting -->
        <a class="setting-card" routerLink="/account-hosting">
          <div class="icon-wrapper">
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style="display: block; height: 32px; width: 32px; fill: currentcolor;"><path d="M16 31c-8.28 0-15-6.72-15-15S7.72 1 16 1s15 6.72 15 15-6.72 15-15 15zm0-28C8.82 3 3 8.82 3 16s5.82 13 13 13 13-5.82 13-13S23.18 3 16 3zm0 6a7 7 0 1 1 0 14 7 7 0 0 1 0-14zm0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"></path></svg>
          </div>
          <div class="content">
            <h3>Professional hosting tools</h3>
            <p>Get professional tools if you manage several properties on Airbnb</p>
          </div>
        </a>
      </div>

      <div class="logout-section">
        <p>Need to deactivate your account?</p>
        <a href="#" class="deactivate-link">Take care of that now</a>
      </div>
    </div>
  `,
  styles: [`
    .account-container {
      max-width: 1080px;
      margin: 0 auto;
      padding: 64px 24px;
      margin-top: 80px;
    }

    .header-section {
      margin-bottom: 48px;
    }

    h1 {
      font-size: 32px;
      font-weight: 800;
      margin-bottom: 8px;
      color: #222222;
    }

    .user-subtitle {
      font-size: 18px;
      color: #222222;
    }

    .user-name {
      font-weight: 600;
    }

    .profile-link {
      color: #222222;
      text-decoration: underline;
      font-weight: 600;
    }

    .settings-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 48px;
    }

    @media (max-width: 950px) {
      .settings-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 600px) {
      .settings-grid {
        grid-template-columns: 1fr;
      }
    }

    .setting-card {
      display: flex;
      flex-direction: column;
      padding: 16px;
      border-radius: 12px;
      box-shadow: 0 6px 16px rgba(0,0,0,0.04);
      border: 1px solid #dddddd;
      text-decoration: none;
      color: inherit;
      transition: box-shadow 0.2s ease;
      min-height: 140px;
    }

    .setting-card:hover {
      box-shadow: 0 6px 16px rgba(0,0,0,0.12);
      border-color: #dddddd;
    }

    .icon-wrapper {
      margin-bottom: 16px;
      color: #222222;
    }

    .content h3 {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 4px 0;
      color: #222222;
    }

    .content p {
      font-size: 14px;
      color: #717171;
      margin: 0;
      line-height: 18px;
    }

    .logout-section {
      text-align: center;
      margin-top: 48px;
      padding-top: 48px;
      border-top: 1px solid #dddddd;
    }

    .deactivate-link {
      color: #222222;
      text-decoration: underline;
      font-weight: 600;
    }
  `]
})
export class UserProfile implements OnInit {
  user: any = null;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });
  }
}
