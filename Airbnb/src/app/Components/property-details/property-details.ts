import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RentalProperty } from '../../Models/rental-property';
import { Data } from '../../Services/data';
import { BookingService } from '../../Services/booking.service';
import { AuthService } from '../../Services/auth';

@Component({
  selector: 'app-property-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: Data,
    private bookingService: BookingService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    const propertyId = Number(this.route.snapshot.paramMap.get('id'));

    this.dataService.properties$.subscribe(props => {
      const foundProperty = props.find(p => p.id === propertyId);
      if (foundProperty) {
        this.property = foundProperty;
      } else if (props.length > 0) {
        this.property = props[0];
      }
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
    // Parse the date string (YYYY-MM-DD) and create a date at midnight local time
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day, 0, 0, 0, 0);

    // Convert to ISO string format that the backend expects
    return date.toISOString();
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
}