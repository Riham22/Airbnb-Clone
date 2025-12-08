import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RentalProperty } from '../../Models/rental-property';
import { Data } from '../../Services/data';
import { BookingService } from '../../Services/booking.service';
import { AuthService } from '../../Services/auth';
import { ReviewService } from '../../Services/review.service';
import { ReviewListComponent } from '../reviews/review-list/review-list.component';
import { ReviewFormComponent } from '../reviews/review-form/review-form.component';

@Component({
  selector: 'app-property-details',
  standalone: true,
  imports: [CommonModule, FormsModule, ReviewListComponent, ReviewFormComponent],
  templateUrl: './property-details.html',
  styleUrls: ['./property-details.css']
})
export class PropertyDetailsComponent implements OnInit {
  property!: RentalProperty;
  selectedImageIndex = 0;
  showAllAmenities = false;
  checkInDate: string = '';
  checkOutDate: string = '';
  guests = 1;
  creatingBooking = false;
  hasBooking = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: Data,
    private bookingService: BookingService,
    private authService: AuthService,
    private reviewService: ReviewService
  ) { }

  ngOnInit() {
    const propertyId = Number(this.route.snapshot.paramMap.get('id'));
    const routeType = this.route.snapshot.data['type'] || 'property';

    console.log(`🔎 Details View: Loading ${routeType} with ID ${propertyId}`);

    // DEBUG: List existing bookings to help identify conflicts
    this.bookingService.getPropertyBookings(propertyId).subscribe({
      next: (res) => console.log('🛑 Existing Bookings blocking this property:', res.data),
      error: (err) => console.log('ℹ️ Cannot view existing bookings (Not Host/Admin)')
    });

    if (routeType === 'experience') {
      this.dataService.experiences$.subscribe(exps => {
        const found = exps.find(e => e.id === propertyId);
        if (found) {
          this.property = found as any; // Cast to satisfy RentalProperty interface roughly
          console.log('✨ Found Experience:', this.property.name);
        }
      });
    } else if (routeType === 'service') {
      this.dataService.services$.subscribe(svcs => {
        const found = svcs.find(s => s.id === propertyId);
        if (found) {
          this.property = found as any;
          console.log('✨ Found Service:', this.property.name);
        }
      });
    } else {
      // Default: Property
      this.dataService.properties$.subscribe(props => {
        const foundProperty = props.find(p => p.id === propertyId);
        if (foundProperty) {
          this.property = foundProperty;
          this.checkBookingStatus(propertyId);
        } else if (props.length > 0 && props[0].id === propertyId) { // Only fallback if ID matches (unlikely) or strict mode disabled?
          // Don't fallback randomly! Only if we are desperate or debugging.
          // For now, let's keep it strict to avoid showing wrong images.
          console.warn(`❌ Property ${propertyId} not found in loaded properties.`);
        }
      });
    }
  }

  checkBookingStatus(propertyId: number) {
    if (this.authService.isAdmin()) {
      this.hasBooking = true; // Admins can always review
      return;
    }

    this.bookingService.getMyBookings().subscribe({
      next: (res: any) => {
        const bookings = res.data || res || [];
        // Check if any booking for this property is confirmed/completed
        const validBooking = bookings.find((b: any) =>
          b.propertyId === propertyId &&
          (b.status.toLowerCase() === 'confirmed' || b.status.toLowerCase() === 'completed')
        );
        this.hasBooking = !!validBooking;
        console.log('📝 Can review property?', this.hasBooking);
      },
      error: () => this.hasBooking = false
    });
  }

  selectImage(index: number) {
    this.selectedImageIndex = index;
  }

  toggleAmenities() {
    this.showAllAmenities = !this.showAllAmenities;
  }

  calculateTotalPrice(): number {
    if (!this.checkInDate || !this.checkOutDate) {
      return this.property.price;
    }

    const start = new Date(this.checkInDate);
    const end = new Date(this.checkOutDate);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    return (this.property.price * nights) + 80; // + cleaning and service fees
  }

  // Helper method to format dates for API
  private formatDateForApi(dateString: string): string {
    // The input is already YYYY-MM-DD from the date picker
    // Sending it directly works best with backend DateOnly
    return dateString;
  }

  reserveProperty() {
    // Check if user is logged in
    if (!this.authService.isLoggedIn()) {
      alert('Please log in to make a reservation');
      this.router.navigate(['/auth']);
      return;
    }

    // Validate dates
    if (!this.checkInDate || !this.checkOutDate) {
      alert('Please select check-in and check-out dates');
      return;
    }

    // Validate that checkout is after checkin
    const checkin = new Date(this.checkInDate);
    const checkout = new Date(this.checkOutDate);
    if (checkout <= checkin) {
      alert('Check-out date must be after check-in date');
      return;
    }

    this.creatingBooking = true;
    const bookingData = {
      propertyId: this.property.id,
      checkInDate: this.formatDateForApi(this.checkInDate),
      checkOutDate: this.formatDateForApi(this.checkOutDate),
      adults: this.guests,
      children: 0,
      infants: 0,
      pets: 0
    };

    console.log('📅 Booking Request:');
    console.log('  Property ID:', bookingData.propertyId);
    console.log('  Check-in:', bookingData.checkInDate);
    console.log('  Check-out:', bookingData.checkOutDate);
    console.log('  Guests:', bookingData.adults);

    this.bookingService.createBooking(bookingData).subscribe({
      next: (response) => {
        this.creatingBooking = false;
        console.log('✅ Booking successful:', response);
        alert(`Reservation confirmed! Booking ID: ${response.data?.id || 'N/A'}`);
        this.router.navigate(['/trips']);
      },
      error: (err) => {
        this.creatingBooking = false;
        console.error('❌ Booking error:', err);
        console.error('Error response:', err.error);

        const errorMsg = err.error?.message || err.error?.title || err.error || 'Failed to create booking';
        alert(errorMsg);
      }
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }

  // Review Logic
  canReviewProperty(): boolean {
    return true; // Simplified for now
  }

  /* 
   * Review Modal State 
   */
  showReviewModal = false;

  openReviewModal() {
    this.showReviewModal = true;
  }

  closeReviewModal() {
    this.showReviewModal = false;
  }

  onReviewSubmitted() {
    this.closeReviewModal();
  }
}