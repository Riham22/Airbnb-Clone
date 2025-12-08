import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { BookingService, BookingListDto } from '../../Services/booking.service';
import { AuthService } from '../../Services/auth';
import { FormsModule } from '@angular/forms';
import { ReviewService } from '../../Services/review.service';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './booking.html',
  styleUrl: './booking.css',
})
export class Booking implements OnInit, OnDestroy {
  bookings: BookingListDto[] = [];
  loading = false;
  error: string | null = null;
  activeTab: 'upcoming' | 'past' | 'cancelled' = 'upcoming';

  // Review Modal State
  showReviewModal = false;
  submittingReview = false;
  reviewData = {
    propertyId: 0,
    rating: 5,
    comment: ''
  };

  private subscriptions = new Subscription();

  constructor(
    private bookingService: BookingService,
    private authService: AuthService,
    private reviewService: ReviewService,
    private cdr: ChangeDetectorRef
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
        this.cdr.detectChanges(); // Force update
      }
    }, 10000); // 10 second timeout

    this.subscriptions.add(
      this.bookingService.getMyBookings().subscribe({
        next: (response: any) => {
          clearTimeout(timeout);
          console.log('✅ Bookings loaded:', response);
          this.bookings = response.data || response || [];
          this.loading = false;
          console.log('🔄 Updating view, loading set to false');
          this.cdr.detectChanges(); // Force update
        },
        error: (err) => {
          clearTimeout(timeout);
          console.error('❌ Error loading bookings:', err);
          console.error('Error details:', err.error);
          this.error = err.error?.message || 'Failed to load bookings. Please try again.';
          this.loading = false;
          console.log('🔄 Updating view after error');
          this.cdr.detectChanges(); // Force update
        }
      })
    );
  }

  setActiveTab(tab: 'upcoming' | 'past' | 'cancelled') {
    this.activeTab = tab;
    this.cdr.detectChanges();
  }

  getFilteredBookings(): BookingListDto[] {
    const now = new Date();
    // Helper to ensure valid date objects
    const getDate = (d: any) => {
      if (!d) return new Date(0); // fallback to epoch if null
      return d instanceof Date ? d : new Date(d);
    };

    const filtered = this.bookings.filter(booking => {
      // Safety check for booking object
      if (!booking) return false;

      const checkInDate = getDate(booking.checkInDate);
      const status = (booking.status || '').toLowerCase();

      switch (this.activeTab) {
        case 'upcoming':
          return checkInDate >= now && status !== 'cancelled' && status !== 'completed';
        case 'past':
          return (checkInDate < now && status !== 'cancelled') || status === 'completed';
        case 'cancelled':
          return status === 'cancelled';
        default:
          return true;
      }
    });

    return filtered;
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
    if (!status) return 'status-unknown';
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
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return dateString;
    }
  }

  canCancelBooking(booking: BookingListDto): boolean {
    if (!booking || !booking.checkInDate) return false;
    const checkInDate = new Date(booking.checkInDate);
    const now = new Date();
    const status = (booking.status || '').toLowerCase();

    return checkInDate > now && status !== 'cancelled' && status !== 'completed';
  }

  canReview(booking: BookingListDto): boolean {
    if (!booking || !booking.status) return false;
    const status = booking.status.toLowerCase();
    // Allow reviewing Confirmed (for testing) and Completed bookings
    return status === 'confirmed' || status === 'completed';
  }

  // Review Methods
  openReviewModal(booking: BookingListDto) {
    this.reviewData = {
      propertyId: booking.propertyId,
      rating: 5,
      comment: ''
    };
    this.showReviewModal = true;
  }

  closeReviewModal() {
    this.showReviewModal = false;
  }

  submitReview() {
    if (!this.reviewData.comment.trim()) {
      alert('Please write a comment');
      return;
    }

    this.submittingReview = true;
    this.reviewService.createReview(this.reviewData).subscribe({
      next: () => {
        alert('Review submitted successfully!');
        this.submittingReview = false;
        this.closeReviewModal();
      },
      error: (err) => {
        console.error('Error submitting review:', err);
        alert(err.error?.message || 'Failed to submit review');
        this.submittingReview = false;
      }
    });
  }
}
