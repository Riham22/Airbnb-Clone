// components/admin-dashboard/admin-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../Services/Admin.service';
import { AdminListing } from '../../Models/AdminListing';
import { AdminUser } from '../../Models/AdminUser';
import { AdminStats } from '../../Models/AdminStats';



@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit {
  stats!: AdminStats;
  users: AdminUser[] = [];
  listings: AdminListing[] = [];
  activeTab: 'overview' | 'users' | 'listings' | 'analytics' = 'overview';

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.adminService.getStats().subscribe(stats => {
      this.stats = stats;
    });

    this.adminService.getUsers().subscribe(users => {
      this.users = users;
    });

    this.adminService.getListings().subscribe(listings => {
      this.listings = listings;
    });
  }

  setActiveTab(tab: 'overview' | 'users' | 'listings' | 'analytics'): void {
    this.activeTab = tab;
  }

  suspendUser(userId: number): void {
    this.adminService.updateUserStatus(userId, 'suspended');
  }

  activateUser(userId: number): void {
    this.adminService.updateUserStatus(userId, 'active');
  }

  suspendListing(listingId: number): void {
    this.adminService.updateListingStatus(listingId, 'suspended');
  }

  approveListing(listingId: number): void {
    this.adminService.updateListingStatus(listingId, 'active');
  }
}
