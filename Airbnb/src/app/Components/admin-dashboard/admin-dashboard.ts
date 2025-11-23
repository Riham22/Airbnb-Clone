// components/admin-dashboard/admin-dashboard.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
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
export class AdminDashboardComponent implements OnInit, OnDestroy {
  stats: AdminStats | null = null;
  users: AdminUser[] = [];
  listings: AdminListing[] = [];
  loading = false;
  activeTab: 'overview' | 'users' | 'listings' | 'analytics' = 'overview';

  private subscriptions: Subscription = new Subscription();

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadDashboardData();

    // Subscribe to loading state
    this.subscriptions.add(
      this.adminService.getLoadingState().subscribe(loading => {
        this.loading = loading;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

 loadDashboardData(): void {
    // Load stats
    this.subscriptions.add(
      this.adminService.getStats().subscribe({
        next: (stats) => {
          this.stats = stats;
        },
        error: (error) => {
          console.error('Error loading stats:', error);
          // You could show a user-friendly error message here
        }
      })
    );

    // Load users
    this.subscriptions.add(
      this.adminService.getUsers().subscribe({
        next: (users) => {
          this.users = users;
        },
        error: (error) => {
          console.error('Error loading users:', error);
        }
      })
    );

    // Load listings
    this.subscriptions.add(
      this.adminService.getListings().subscribe({
        next: (listings) => {
          this.listings = listings;
        },
        error: (error) => {
          console.error('Error loading listings:', error);
        }
      })
    );
  }

  setActiveTab(tab: 'overview' | 'users' | 'listings' | 'analytics'): void {
    this.activeTab = tab;
  }

  suspendUser(userId: string): void {
    this.subscriptions.add(
      this.adminService.updateUserStatus(userId, 'suspended').subscribe({
        next: (updatedUser) => {
          console.log('User suspended:', updatedUser);
          // Update local users array
          this.users = this.users.map(user =>
            user.id === userId ? updatedUser : user
          );
        },
        error: (error) => {
          console.error('Error suspending user:', error);
          alert('Failed to suspend user. Please try again.');
        }
      })
    );
  }

  activateUser(userId: string): void {
    this.subscriptions.add(
      this.adminService.updateUserStatus(userId, 'active').subscribe({
        next: (updatedUser) => {
          console.log('User activated:', updatedUser);
          // Update local users array
          this.users = this.users.map(user =>
            user.id === userId ? updatedUser : user
          );
        },
        error: (error) => {
          console.error('Error activating user:', error);
          alert('Failed to activate user. Please try again.');
        }
      })
    );
  }

  deleteUser(userId: string): void {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      this.subscriptions.add(
        this.adminService.deleteUser(userId).subscribe({
          next: (success) => {
            if (success) {
              // Remove user from local array
              this.users = this.users.filter(user => user.id !== userId);
              // Reload stats to reflect the change
              this.loadDashboardData();
              alert('User deleted successfully');
            }
          },
          error: (error) => {
            console.error('Error deleting user:', error);
            alert('Failed to delete user. Please try again.');
          }
        })
      );
    }
  }

  suspendListing(listingId: string): void {
    this.subscriptions.add(
      this.adminService.updateListingStatus(listingId, 'suspended').subscribe({
        next: (updatedListing) => {
          console.log('Listing suspended:', updatedListing);
          // Update local listings array
          this.listings = this.listings.map(listing =>
            listing.id === listingId ? updatedListing : listing
          );
        },
        error: (error) => {
          console.error('Error suspending listing:', error);
          alert('Failed to suspend listing. Please try again.');
        }
      })
    );
  }

  approveListing(listingId: string): void {
    this.subscriptions.add(
      this.adminService.updateListingStatus(listingId, 'active').subscribe({
        next: (updatedListing) => {
          console.log('Listing approved:', updatedListing);
          // Update local listings array
          this.listings = this.listings.map(listing =>
            listing.id === listingId ? updatedListing : listing
          );
        },
        error: (error) => {
          console.error('Error approving listing:', error);
          alert('Failed to approve listing. Please try again.');
        }
      })
    );
  }

  deleteListing(listingId: string): void {
    if (confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      this.subscriptions.add(
        this.adminService.deleteListing(listingId).subscribe({
          next: (success) => {
            if (success) {
              // Remove listing from local array
              this.listings = this.listings.filter(listing => listing.id !== listingId);
              // Reload stats to reflect the change
              this.loadDashboardData();
              alert('Listing deleted successfully');
            }
          },
          error: (error) => {
            console.error('Error deleting listing:', error);
            alert('Failed to delete listing. Please try again.');
          }
        })
      );
    }
  }

  // Helper methods for template
  getUserStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'status-active';
      case 'suspended': return 'status-suspended';
      case 'pending': return 'status-pending';
      default: return 'status-unknown';
    }
  }

  getListingStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'status-active';
      case 'suspended': return 'status-suspended';
      case 'pending': return 'status-pending';
      default: return 'status-unknown';
    }
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'host': return 'badge-host';
      case 'guest': return 'badge-guest';
      case 'admin': return 'badge-admin';
      default: return 'badge-unknown';
    }
  }
}
