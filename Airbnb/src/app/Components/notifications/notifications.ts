import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Notification {
  id: number;
  type: 'message' | 'system' | 'promotion' | 'booking';
  title: string;
  message: string;
  date: Date;
  isRead: boolean;
  actionUrl?: string;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="notifications-container">
      <div class="header">
        <h1>Notifications</h1>
        <button class="mark-all-btn" (click)="markAllAsRead()" *ngIf="hasUnread">
          Mark all as read
        </button>
      </div>

      <div class="tabs">
        <button class="tab-btn" [class.active]="activeTab === 'all'" (click)="activeTab = 'all'">All</button>
        <button class="tab-btn" [class.active]="activeTab === 'unread'" (click)="activeTab = 'unread'">Unread</button>
      </div>

      <div class="notifications-list">
        <div *ngFor="let notification of filteredNotifications" 
             class="notification-item" 
             [class.unread]="!notification.isRead"
             (click)="markAsRead(notification)">
          
          <div class="icon-wrapper" [ngSwitch]="notification.type">
            <span *ngSwitchCase="'message'">💬</span>
            <span *ngSwitchCase="'booking'">📅</span>
            <span *ngSwitchCase="'promotion'">🏷️</span>
            <span *ngSwitchDefault>🔔</span>
          </div>

          <div class="content">
            <div class="title-row">
              <h3>{{ notification.title }}</h3>
              <span class="time">{{ getTimeAgo(notification.date) }}</span>
            </div>
            <p>{{ notification.message }}</p>
          </div>

          <div class="indicator" *ngIf="!notification.isRead"></div>
        </div>

        <div *ngIf="filteredNotifications.length === 0" class="empty-state">
          <div class="empty-icon">🔕</div>
          <h3>No notifications</h3>
          <p>You're all caught up!</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notifications-container {
      max-width: 740px;
      margin: 0 auto;
      padding: 48px 24px;
      margin-top: 80px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    h1 {
      font-size: 32px;
      font-weight: 800;
      margin: 0;
      color: #222222;
    }

    .mark-all-btn {
      background: none;
      border: none;
      color: #222222;
      text-decoration: underline;
      font-weight: 600;
      cursor: pointer;
      padding: 8px;
    }

    .tabs {
      display: flex;
      gap: 16px;
      border-bottom: 1px solid #dddddd;
      margin-bottom: 24px;
    }

    .tab-btn {
      background: none;
      border: none;
      padding: 12px 0;
      font-size: 16px;
      font-weight: 600;
      color: #717171;
      cursor: pointer;
      position: relative;
    }

    .tab-btn.active {
      color: #222222;
    }

    .tab-btn.active::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      right: 0;
      height: 2px;
      background: #222222;
    }

    .notifications-list {
      display: flex;
      flex-direction: column;
    }

    .notification-item {
      display: flex;
      gap: 16px;
      padding: 24px 0;
      border-bottom: 1px solid #dddddd;
      cursor: pointer;
      position: relative;
      transition: background-color 0.2s;
    }

    .notification-item:hover {
      background-color: #f7f7f7;
      margin: 0 -16px;
      padding: 24px 16px;
      border-radius: 8px;
      border-bottom: none;
    }

    .icon-wrapper {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #f7f7f7;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      flex-shrink: 0;
    }

    .content {
      flex: 1;
    }

    .title-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
    }

    .content h3 {
      font-size: 16px;
      font-weight: 600;
      margin: 0;
      color: #222222;
    }

    .time {
      font-size: 12px;
      color: #717171;
    }

    .content p {
      font-size: 15px;
      color: #717171;
      margin: 0;
      line-height: 20px;
    }

    .notification-item.unread .content h3,
    .notification-item.unread .content p {
      color: #222222;
      font-weight: 600;
    }

    .indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #FF385C;
      position: absolute;
      top: 30px;
      right: 0;
    }

    .empty-state {
      text-align: center;
      padding: 64px 0;
    }

    .empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
      color: #dddddd;
    }
  `]
})
export class NotificationsComponent implements OnInit {
  activeTab: 'all' | 'unread' = 'all';
  notifications: Notification[] = [];

  ngOnInit() {
    // Mock data
    this.notifications = [
      {
        id: 1,
        type: 'message',
        title: 'New message from Host',
        message: 'Hey! Looking forward to hosting you next week. Let me know if you have any questions.',
        date: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
        isRead: false
      },
      {
        id: 2,
        type: 'booking',
        title: 'Booking confirmed',
        message: 'Your reservation for "Cozy Cabin in the Woods" is confirmed! Pack your bags.',
        date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        isRead: true
      },
      {
        id: 3,
        type: 'promotion',
        title: '20% off your next trip',
        message: 'Complete your profile to unlock a special discount for your next adventure.',
        date: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
        isRead: true
      }
    ];
  }

  get filteredNotifications() {
    if (this.activeTab === 'unread') {
      return this.notifications.filter(n => !n.isRead);
    }
    return this.notifications;
  }

  get hasUnread() {
    return this.notifications.some(n => !n.isRead);
  }

  markAsRead(notification: Notification) {
    notification.isRead = true;
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.isRead = true);
  }

  getTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y";

    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo";

    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d";

    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h";

    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m";

    return "now";
  }
}
