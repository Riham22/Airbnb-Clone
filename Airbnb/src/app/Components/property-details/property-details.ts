// property-details.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'; // Added ActivatedRoute import
import { CommonModule } from '@angular/common'; // Import CommonModule for standalone
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel
import { RentalProperty } from '../../Models/rental-property';
import { Data } from '../../Services/data';
import { BookingService } from '../../Services/booking.service';
import { AuthService } from '../../Services/auth';


@Component({
  selector: 'app-property-details',
  standalone: true, // If using standalone component
  imports: [CommonModule, FormsModule], // Add required imports
  templateUrl: './property-details.html',
  styleUrls: ['./property-details.css']
})
export class PropertyDetailsComponent implements OnInit {
  property!: RentalProperty;
  selectedImageIndex = 0;
  showAllAmenities = false;
  checkInDate: string = ''; // Changed to string for date inputs
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

    // Create booking via backend
    this.creatingBooking = true;

    const bookingData = {
      propertyId: this.property.id,
      checkInDate: this.checkInDate,
      checkOutDate: this.checkOutDate,
      adults: this.guests,
      children: 0,
      infants: 0,
      pets: 0
    };

    this.bookingService.createBooking(bookingData).subscribe({
      next: (response) => {
        this.creatingBooking = false;
        alert(`Reservation confirmed! Booking ID: ${response.data?.id || 'N/A'}`);
        this.router.navigate(['/booking']);
      },
      error: (err) => {
        this.creatingBooking = false;
        console.error('Booking error:', err);
        alert(err.error?.message || 'Failed to create booking. Please try again.');
      }
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }

  // Helper method to calculate total price
  calculateTotalPrice(): number {
    if (!this.checkInDate || !this.checkOutDate) {
      return this.property.price;
    }

    const start = new Date(this.checkInDate);
    const end = new Date(this.checkOutDate);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    return (this.property.price * nights) + 80; // + cleaning and service fees
  }
}