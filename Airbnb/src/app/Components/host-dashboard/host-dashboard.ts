// components/host-dashboard/host-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router'; // Import Router here

import { HostService } from '../../Services/Host.service';
import { HostBooking } from '../../Models/HostBooking';
import { HostStats } from '../../Models/HostStats';
import { HostListing } from '../../Models/HostListing';

import { AuthService } from '../../Services/auth';

@Component({
  selector: 'app-host-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './host-dashboard.html',
  styleUrls: ['./host-dashboard.css']
})
export class HostDashboardComponent implements OnInit {
  stats!: HostStats;
  bookings: HostBooking[] = [];
  properties: HostListing[] = [];
  experiences: any[] = [];
  services: any[] = [];

  activeTab: 'overview' | 'properties' | 'experiences' | 'services' | 'bookings' | 'earnings' = 'overview';
  showCreateListing = false;
  currentUserId: string | null = null;

  constructor(
    private hostService: HostService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadHostData();
  }

  cancelBooking(bookingId: number): void {
    this.hostService.updateBookingStatus(bookingId, 'cancelled');
    // Update local state
    const booking = this.bookings.find(b => b.id === bookingId);
    if (booking) {
      booking.status = 'cancelled';
    }
  }

  private loadHostData(): void {
    this.hostService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (err) => {
        console.error('Error loading stats:', err);
      }
    });

    this.hostService.getBookings().subscribe({
      next: (bookings) => {
        // Ensure bookings is always an array
        this.bookings = Array.isArray(bookings) ? bookings : [];
      },
      error: (err) => {
        console.error('Error loading bookings:', err);
        this.bookings = [];
      }
    });

    this.hostService.getListings().subscribe({
      next: (listings) => {
        const allListings = Array.isArray(listings) ? listings : [];

        // Filter by current user ID
        const currentUser = this.authService.getCurrentUser();
        const currentUserId = currentUser ? currentUser.id : null;

        console.log('🔍 Debugging Host Filter:');
        console.log('👉 Current User:', currentUser);
        console.log('👉 Current User ID:', currentUserId);
        console.log('👉 Total Listings Fetched:', allListings.length);
        if (allListings.length > 0) {
          console.log('👉 First Listing HostId:', allListings[0].hostId);
          console.log('👉 First Listing Full Object:', allListings[0]);
        }

        if (currentUserId) {
          // Loose equality check for different id types (number vs string)
          this.properties = allListings.filter(p => {
            const match = p.hostId == currentUserId;
            console.log(`Checking property ${p.id}: HostId '${p.hostId}' vs CurrentUser '${currentUserId}' => Match? ${match}`);
            return match;
          });
        } else {
          console.warn('⚠️ No current user ID found, clearing properties.');
          this.properties = [];
        }

        console.log('Filtered properties:', this.properties.length);
      },
      error: (err) => {
        console.error('Error loading properties:', err);
        this.properties = [];
      }
    });

    // TODO: Load experiences and services from backend
  }

  setActiveTab(tab: 'overview' | 'properties' | 'experiences' | 'services' | 'bookings' | 'earnings'): void {
    this.activeTab = tab;
  }

  toggleListingStatus(listingId: number, currentStatus: string): void {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    this.hostService.updateListingStatus(listingId, newStatus as 'active' | 'inactive');
  }

  confirmBooking(bookingId: number): void {
    this.hostService.updateBookingStatus(bookingId, 'upcoming');
  }

  toggleCreateListing(): void {
    // Navigate to the dedicated add listing page with returnUrl
    this.router.navigate(['/admin/add-listing'], { queryParams: { returnUrl: '/host' } });
  }

  deleteProperty(id: number): void {
    if (confirm('Are you sure you want to delete this property?')) {
      // TODO: Call delete API
      this.properties = this.properties.filter(p => p.id !== id);
    }
  }

  deleteExperience(id: number): void {
    if (confirm('Are you sure you want to delete this experience?')) {
      // TODO: Call delete API
      this.experiences = this.experiences.filter(e => e.id !== id);
    }
  }

  deleteService(id: number): void {
    if (confirm('Are you sure you want to delete this service?')) {
      // TODO: Call delete API
      this.services = this.services.filter(s => s.id !== id);
    }
  }
}
