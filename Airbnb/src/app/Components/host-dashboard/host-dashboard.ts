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
  properties: HostListing[] = [];
  experiences: any[] = []; // TODO: Create Experience model
  services: any[] = []; // TODO: Create Service model

  activeTab: 'overview' | 'properties' | 'experiences' | 'services' | 'bookings' | 'earnings' = 'overview';
  showCreateListing = false;

  constructor(private hostService: HostService) { }

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
        // Ensure properties is always an array
        this.properties = Array.isArray(listings) ? listings : [];
      },
      error: (err) => {
        console.error('Error loading properties:', err);
        this.properties = [];
      }
    });

    // TODO: Load experiences and services from backend
    // this.hostService.getExperiences().subscribe(experiences => {
    //   this.experiences = experiences;
    // });
    // this.hostService.getServices().subscribe(services => {
    //   this.services = services;
    // });
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
    this.showCreateListing = !this.showCreateListing;
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
