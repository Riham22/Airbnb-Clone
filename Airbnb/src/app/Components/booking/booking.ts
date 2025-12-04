import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { BookingService, BookingListDto } from '../../Services/booking.service';
import { AuthService } from '../../Services/auth';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './booking.html',
  styleUrl: './booking.css',
})
export class Booking implements OnInit, OnDestroy {
  bookings: BookingListDto[] = [];
  loading = false;
  error: string | null = null;
  activeTab: 'upcoming' | 'past' | 'cancelled' = 'upcoming';

  private subscriptions = new Subscription();

  constructor(
    private bookingService: BookingService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.loadBookings();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  loadBookings() {
    this.loading = true;
    this.error = null;

    console.log('📋 Loading bookings from API...');

    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (this.loading) {
        this.loading = false;
        this.error = 'Request timed out. Please check your connection and try again.';
        console.error('⏱️ Booking request timed out');
      }
    }, 10000); // 10 second timeout

    this.subscriptions.add(
      this.bookingService.getMyBookings().subscribe({
        next: (response: any) => {
          clearTimeout(timeout);
          console.log('✅ Bookings loaded:', response);
          this.bookings = response.data || response || [];
          this.loading = false;
        },
        error: (err) => {
          clearTimeout(timeout);
          console.error('❌ Error loading bookings:', err);
          console.error('Error details:', err.error);
          this.error = err.error?.message || 'Failed to load bookings. Please try again.';
          this.loading = false;
        }
      })
    );
  }

  setActiveTab(tab: 'upcoming' | 'past' | 'cancelled') {
    this.activeTab = tab;
  }

  getFilteredBookings(): BookingListDto[] {
    const now = new Date();

    return this.bookings.filter(booking => {
      const checkInDate = new Date(booking.checkInDate);
      const status = booking.status.toLowerCase();

      switch (this.activeTab) {
        case 'upcoming':
          return checkInDate >= now && status !== 'cancelled';
        case 'past':
          return checkInDate < now && status !== 'cancelled';
        case 'cancelled':
          return status === 'cancelled';
        default:
          return true;
      }
    });
  }

  cancelBooking(bookingId: number) {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    this.subscriptions.add(
      this.bookingService.cancelBooking(bookingId).subscribe({
        next: (response) => {
          alert('Booking cancelled successfully');
          this.loadBookings(); // Reload bookings
        },
        error: (err) => {
          console.error('Error cancelling booking:', err);
          alert('Failed to cancel booking. Please try again.');
        }
      })
    );
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'status-confirmed';
      case 'pending':
        return 'status-pending';
      case 'cancelled':
        return 'status-cancelled';
      case 'completed':
        return 'status-completed';
      default:
        return 'status-unknown';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  canCancelBooking(booking: BookingListDto): boolean {
    const checkInDate = new Date(booking.checkInDate);
    const now = new Date();
    const status = booking.status.toLowerCase();

    return checkInDate > now && status !== 'cancelled' && status !== 'completed';
  }
}
