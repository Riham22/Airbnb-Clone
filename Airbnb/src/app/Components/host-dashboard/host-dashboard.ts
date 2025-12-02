// components/host-dashboard/host-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';


import { HostService } from '../../Services/Host.service';
import { HostBooking } from '../../Models/HostBooking';
import { HostStats } from '../../Models/HostStats';
import { HostListing } from '../../Models/HostListing';

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
  listings: HostListing[] = [];
  activeTab: 'overview' | 'listings' | 'bookings' | 'earnings' = 'overview';
  showCreateListing = false;

  constructor(private hostService: HostService) {}

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
    this.hostService.getStats().subscribe(stats => {
      this.stats = stats;
    });

    this.hostService.getBookings().subscribe(bookings => {
      this.bookings = bookings;
    });

    this.hostService.getListings().subscribe(listings => {
      this.listings = listings;
    });
  }

  setActiveTab(tab: 'overview' | 'listings' | 'bookings' | 'earnings'): void {
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
    this.showCreateListing = !this.showCreateListing;
  }
}
