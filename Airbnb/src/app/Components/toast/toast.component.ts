import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Toast } from '../../Services/notification.service';

@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="toast-container">
      <div *ngFor="let toast of toasts" 
           class="toast" 
           [ngClass]="'toast-' + toast.type"
           [@slideIn]>
        <div class="toast-content">
          <svg *ngIf="toast.type === 'success'" class="toast-icon" viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
          <svg *ngIf="toast.type === 'error'" class="toast-icon" viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
          <svg *ngIf="toast.type === 'info'" class="toast-icon" viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
          <svg *ngIf="toast.type === 'warning'" class="toast-icon" viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
          </svg>
          <span class="toast-message">{{ toast.message }}</span>
        </div>
        <button class="toast-close" (click)="closeToast(toast.id)">×</button>
      </div>
    </div>
  `,
    styles: [`
    .toast-container {
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 400px;
    }

    .toast {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s ease-out;
      min-width: 300px;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .toast-content {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }

    .toast-icon {
      flex-shrink: 0;
    }

    .toast-message {
      font-size: 14px;
      font-weight: 500;
      line-height: 1.4;
    }

    .toast-close {
      background: none;
      border: none;
      font-size: 24px;
      line-height: 1;
      cursor: pointer;
      padding: 0;
      margin-left: 12px;
      opacity: 0.7;
      transition: opacity 0.2s;
    }

    .toast-close:hover {
      opacity: 1;
    }

    .toast-success {
      background-color: #10b981;
      color: white;
    }

    .toast-error {
      background-color: #ef4444;
      color: white;
    }

    .toast-info {
      background-color: #3b82f6;
      color: white;
    }

    .toast-warning {
      background-color: #f59e0b;
      color: white;
    }

    @media (max-width: 640px) {
      .toast-container {
        right: 12px;
        left: 12px;
        max-width: none;
      }

      .toast {
        min-width: auto;
      }
    }
  `]
})
export class ToastComponent implements OnInit {
    toasts: Toast[] = [];

    constructor(private notificationService: NotificationService) { }

    ngOnInit() {
        this.notificationService.toasts$.subscribe(toasts => {
            this.toasts = toasts;
        });
    }

    closeToast(id: number) {
        this.notificationService.removeToast(id);
    }
}
