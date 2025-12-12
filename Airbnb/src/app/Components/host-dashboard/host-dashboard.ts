// components/host-dashboard/host-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { HostService } from '../../Services/Host.service';
import { HostBooking } from '../../Models/HostBooking';
import { HostStats } from '../../Models/HostStats';
import { HostListing } from '../../Models/HostListing';

@Component({
  selector: 'app-host-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './host-dashboard.html',
  styleUrls: ['./host-dashboard.css']
})
export class HostDashboardComponent implements OnInit {
  stats!: HostStats;
  bookings: HostBooking[] = [];
  listings: HostListing[] = [];
  activeTab: 'overview' | 'listings' | 'bookings' | 'earnings' = 'overview';
  showCreateListing = false;
  loading = false;
  errorMessage = '';
  successMessage = '';

  // Form data for creating listing
  newListing = {
    title: '',
    description: '',
    price: 0,
    city: '',
    country: '',
    address: '',
    maxGuests: 1,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    allowsPets: false,
    propertyTypeId: 1,
    propertyCategoryId: 1
  };

  constructor(private hostService: HostService) {}

  ngOnInit() {
    this.loadHostData();
  }

  cancelBooking(bookingId: number): void {
    this.loading = true;
    this.hostService.updateBookingStatus(bookingId, 'cancelled').subscribe({
      next: () => {
        const booking = this.bookings.find(b => b.id === bookingId);
        if (booking) {
          booking.status = 'cancelled';
        }
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to cancel booking';
        this.loading = false;
      }
    });
  }

  private loadHostData(): void {
    this.loading = true;
    this.hostService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load stats';
        this.loading = false;
      }
    });

    this.hostService.getBookings().subscribe({
      next: (bookings) => {
        this.bookings = bookings;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load bookings';
      }
    });

    this.hostService.getListings().subscribe({
      next: (listings) => {
        this.listings = listings;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load listings';
      }
    });
  }

  setActiveTab(tab: 'overview' | 'listings' | 'bookings' | 'earnings'): void {
    this.activeTab = tab;
  }

  toggleListingStatus(listingId: number, currentStatus: string): void {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    this.loading = true;
    this.hostService.updateListingStatus(listingId, newStatus as 'active' | 'inactive').subscribe({
      next: () => {
        // Refresh listings to get updated status
        this.hostService.getListings().subscribe(listings => {
          this.listings = listings;
          this.loading = false;
          this.successMessage = `Listing ${newStatus === 'active' ? 'published' : 'unpublished'} successfully`;
        });
      },
      error: (err) => {
        this.errorMessage = 'Failed to update listing status';
        this.loading = false;
      }
    });
  }

  confirmBooking(bookingId: number): void {
    this.loading = true;
    this.hostService.updateBookingStatus(bookingId, 'upcoming').subscribe({
      next: () => {
        const booking = this.bookings.find(b => b.id === bookingId);
        if (booking) {
          booking.status = 'upcoming';
        }
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to confirm booking';
        this.loading = false;
      }
    });
  }

  toggleCreateListing(): void {
    this.showCreateListing = !this.showCreateListing;
    if (!this.showCreateListing) {
      // Reset form when closing
      this.newListing = {
        title: '',
        description: '',
        price: 0,
        city: '',
        country: '',
        address: '',
        maxGuests: 1,
        bedrooms: 1,
        beds: 1,
        bathrooms: 1,
        allowsPets: false,
        propertyTypeId: 1,
        propertyCategoryId: 1
      };
    }
  }

  createListing(): void {
    if (!this.newListing.title || !this.newListing.price) {
      this.errorMessage = 'Please fill in required fields (title and price)';
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.hostService.createListing(this.newListing).subscribe({
      next: (res) => {
        this.successMessage = 'Listing created successfully!';
        this.showCreateListing = false;
        this.loading = false;
        // Reset form
        this.newListing = {
          title: '',
          description: '',
          price: 0,
          city: '',
          country: '',
          address: '',
          maxGuests: 1,
          bedrooms: 1,
          beds: 1,
          bathrooms: 1,
          allowsPets: false,
          propertyTypeId: 1,
          propertyCategoryId: 1
        };
      },
      error: (err) => {
        this.errorMessage = 'Failed to create listing: ' + (err?.error?.message || err.message);
        this.loading = false;
      }
    });
  }
}
