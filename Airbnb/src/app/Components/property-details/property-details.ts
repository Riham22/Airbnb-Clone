import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
  imports: [CommonModule, FormsModule, RouterModule, ReviewListComponent, ReviewFormComponent],
  templateUrl: './property-details.html',
  styleUrls: ['./property-details.css']
})
export class PropertyDetailsComponent implements OnInit {
  property: RentalProperty | null = null;
  selectedImageIndex = 0;
  showAllAmenities = false;
  checkInDate: string = '';
  checkOutDate: string = '';
  guests = 1;
  creatingBooking = false;
  hasBooking = false;
  suggestions: any[] = [];
  showReviewModal = false;
  showAllPhotos = false;
  activeImageIndex = 0;

  togglePhotoGallery(index: number = 0) {
    this.activeImageIndex = index;
    this.showAllPhotos = !this.showAllPhotos;
    if (this.showAllPhotos) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }

  nextImage(e?: Event) {
    e?.stopPropagation();
    if (this.property?.images) {
      this.activeImageIndex = (this.activeImageIndex + 1) % this.property.images.length;
    }
  }

  prevImage(e?: Event) {
    e?.stopPropagation();
    if (this.property?.images) {
      this.activeImageIndex = (this.activeImageIndex - 1 + this.property.images.length) % this.property.images.length;
    }
  }

  getGuestOptions(): number[] {
    if (!this.property) return [];
    const max = (this.property as any).maxGuests || (this.property as any).maxParticipants || 10;
    return Array.from({ length: max }, (_, i) => i + 1);
  }

  get displayedAmenities(): string[] {
    if (!this.property) return [];
    const amenities = this.property.amenities || [];
    if (this.showAllAmenities) {
      return amenities;
    }
    return amenities.slice(0, 6);
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: Data,
    private bookingService: BookingService,
    private authService: AuthService,
    private reviewService: ReviewService
  ) { }

  ngOnInit() {
    // Subscribe to route parameters to handle navigation between properties
    this.route.paramMap.subscribe(params => {
      const propertyId = Number(params.get('id'));
      // We can use snapshot for data because we only navigate to suggestions of the same type
      const routeType = this.route.snapshot.data['type'] || 'property';

      console.log(`🔎 Details View: Loading ${routeType} with ID ${propertyId}`);

      // Reset state for new property loading
      this.property = null;
      this.selectedImageIndex = 0;
      this.hasBooking = false;
      this.window.scrollTo(0, 0); // Scroll to top on navigation

      this.loadProperty(propertyId, routeType);
    });
  }

  // Helper to access window object safely 
  private get window(): Window {
    return window;
  }

  private loadProperty(propertyId: number, routeType: string) {
    // DEBUG: List existing bookings
    this.bookingService.getPropertyBookings(propertyId).subscribe({
      next: (res) => console.log('🛑 Existing Bookings:', res.data),
      error: (err) => console.log('ℹ️ Cannot view existing bookings (Not Host/Admin)')
    });

    // Strategy: Cache-First for instant display, then update from API
    let cachedItem: any = null;

    if (routeType === 'experience') {
      // 1. Try Cache
      cachedItem = this.dataService.getExperiences().find(e => e.id === propertyId);
      if (cachedItem) {
        console.log('⚡ Using cached experience for instant render');
        this.property = cachedItem;
        this.loadSuggestions(this.dataService.getExperiences(), propertyId);
      }

      // 2. Fetch Full Details
      this.dataService.getExperienceDetails(propertyId).subscribe({
        next: (data) => {
          if (!data) return;
          const exp = data;
          const images = exp.expImages || exp.ExpImages || exp.images || exp.Images || [];
          const processedImages = images.map((img: any) => this.dataService.processImageUrl(img.imageURL || img.ImageUrl || img.imageUrl));

          // Fallback to cached image if detailed list is empty
          const fallbackImage = processedImages[0] || cachedItem?.imageUrl || 'assets/default-experience.jpg';
          const finalImages = processedImages.length > 0 ? processedImages : (cachedItem?.images?.length ? cachedItem.images : [fallbackImage]);

          this.property = {
            id: exp.id,
            type: 'experience',
            name: exp.expTitle || exp.title || exp.name,
            location: `${exp.city}, ${exp.country}`,
            price: exp.guestPrice || exp.price,
            rating: exp.averageRating || 4.5,
            reviewCount: exp.reviews?.length || 0,
            imageUrl: fallbackImage,
            images: finalImages,
            category: exp.expCatogray?.name || 'Experience',
            description: exp.expDescribe || exp.description,
            host: { name: 'Host', isSuperhost: false, avatar: '', joinedDate: '2024' },
            amenities: [],
            highlights: [],
            reviews: [],
            isWishlisted: false,
            // @ts-ignore
            activities: exp.expActivities || []
          } as any;
          // Refresh suggestions with full list if needed
          if (!cachedItem) this.loadSuggestions(this.dataService.getExperiences(), propertyId);
        },
        error: (err) => console.error('Failed to load experience details', err)
      });

    } else if (routeType === 'service') {
      // 1. Try Cache
      cachedItem = this.dataService.getServices().find(s => s.id === propertyId);
      if (cachedItem) {
        console.log('⚡ Using cached service for instant render');
        this.property = cachedItem;
        this.loadSuggestions(this.dataService.getServices(), propertyId);
      }

      // 2. Fetch Full Details
      this.dataService.getServiceDetails(propertyId).subscribe({
        next: (data) => {
          if (!data) return;
          const svc = data;
          const images = svc.images || svc.Images || [];
          const processedImages = images.map((img: any) => this.dataService.processImageUrl(img.imageUrl || img.ImageUrl));

          // Fallback to cached image if detailed list is empty
          const fallbackImage = processedImages[0] || cachedItem?.imageUrl || 'assets/default-service.jpg';
          const finalImages = processedImages.length > 0 ? processedImages : (cachedItem?.images?.length ? cachedItem.images : [fallbackImage]);

          this.property = {
            id: svc.id,
            type: 'service',
            name: svc.title || svc.name,
            location: `${svc.city}, ${svc.country}`,
            price: svc.price,
            rating: svc.averageRating || 0,
            reviewCount: svc.reviewsCount || 0,
            imageUrl: fallbackImage,
            images: finalImages,
            category: svc.serviceCategory?.name || 'Service',
            description: svc.description,
            host: { name: 'Provider', isSuperhost: true, avatar: '', joinedDate: '2024' },
            amenities: [],
            highlights: [],
            reviews: [],
            isWishlisted: false
          } as any;
          if (!cachedItem) this.loadSuggestions(this.dataService.getServices(), propertyId);
        },
        error: (err) => console.error('Failed to load service details', err)
      });
    } else {
      // Property
      // 1. Try Cache
      cachedItem = this.dataService.getPropertyById(propertyId);
      if (cachedItem) {
        console.log('⚡ Using cached property for instant render');
        this.property = cachedItem;
        this.checkBookingStatus(propertyId);
        this.loadSuggestions(this.dataService.getProperties(), propertyId);
      }

      // 2. Fetch Full Details
      this.dataService.getPropertyDetails(propertyId).subscribe({
        next: (data) => {
          if (!data) return;
          const p = data;
          const images = p.images || p.Images || [];
          const processedImages = images.map((img: any) => this.dataService.processImageUrl(img.context || img.url || img.imageUrl || img.imageURL || img.id ? (img.imageUrl || img.ImageUrl) : img));
          const mappedImages = images.map((img: any) => this.dataService.processImageUrl(img.imageUrl || img.ImageUrl));

          // Fallback to cached image if detailed list is empty
          const fallbackImage = mappedImages[0] || cachedItem?.imageUrl || 'assets/default-listing.jpg';
          const finalImages = mappedImages.length > 0 ? mappedImages : (cachedItem?.images?.length ? cachedItem.images : [fallbackImage]);

          this.property = {
            id: p.id,
            type: 'property',
            name: p.title,
            location: `${p.city}, ${p.country}`,
            price: p.pricePerNight,
            rating: p.averageRating,
            reviewCount: p.reviewsCount,
            imageUrl: fallbackImage,
            images: finalImages,
            propertyType: p.propertyType?.name || 'Property',
            maxGuests: p.maxGuests,
            bedrooms: p.bedrooms,
            beds: p.beds,
            bathrooms: p.bathrooms,
            amenities: p.amenities?.map((a: any) => a.name) || [],
            host: { name: p.host?.firstName || 'Host', avatar: p.host?.photoURL || '', isSuperhost: false, joinedDate: '2024' },
            description: p.description,
            highlights: [],
            reviews: [],
            isWishlisted: false
          };
          this.checkBookingStatus(propertyId);
          // Refresh suggestions with full list if needed
          if (!cachedItem) this.loadSuggestions(this.dataService.getProperties(), propertyId);
        },
        error: (err) => console.error('Failed to load property details', err)
      });
    }
  }

  loadSuggestions(items: any[], currentId: number) {
    // Simple suggestion logic: take up to 3 other items
    this.suggestions = items.filter(i => i.id !== currentId).slice(0, 3);
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

  get nights(): number {
    if (!this.checkInDate || !this.checkOutDate) return 5;
    const start = new Date(this.checkInDate);
    const end = new Date(this.checkOutDate);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 5;
  }

  get cleaningFee(): number {
    return 50;
  }

  get serviceFee(): number {
    return 30 * this.guests;
  }

  calculateTotalPrice(): number {
    if (!this.property) return 0;
    return (this.property.price * this.nights) + this.cleaningFee + this.serviceFee;
  }

  // Helper method to format dates for API
  private formatDateForApi(dateString: string): string {
    // The input is already YYYY-MM-DD from the date picker
    // Sending it directly works best with backend DateOnly
    return dateString;
  }

  reserveProperty() {
    // Check if property is loaded
    if (!this.property) return;

    // Check if user is logged in
    if (!this.authService.isLoggedIn()) {
      alert('Please log in to make a reservation');
      this.router.navigate(['/auth']);
      return;
    }

    // Validate dates
    if (!this.checkInDate) {
      alert('Please select a date');
      return;
    }

    // For services and properties with ranges, check checkout
    if (this.property.type !== 'experience' && !this.checkOutDate) {
      alert('Please select check-in and check-out dates');
      return;
    }

    // Validate that checkout is after checkin (for ranges)
    if (this.checkOutDate) {
      const checkin = new Date(this.checkInDate);
      const checkout = new Date(this.checkOutDate);
      if (checkout <= checkin) {
        alert('Check-out date must be after check-in date');
        return;
      }
    }

    this.creatingBooking = true;

    if (this.property.type === 'service') {
      const bookingData = {
        serviceId: this.property.id,
        startDate: this.formatDateForApi(this.checkInDate),
        endDate: this.checkOutDate ? this.formatDateForApi(this.checkOutDate) : undefined,
        duration: 1 // Default or calculated
      };

      console.log('🛠️ Service Booking Request:', bookingData);

      this.bookingService.createServiceBooking(bookingData).subscribe({
        next: (res) => this.handleBookingSuccess(res),
        error: (err) => this.handleBookingError(err)
      });

    } else if (this.property.type === 'experience') {
      const bookingData = {
        experienceId: this.property.id,
        numberOfGuests: this.guests,
        reservationDate: this.formatDateForApi(this.checkInDate),
        reservationTime: '10:00:00', // Default time for now, ideally add time picker
        price: this.property.price
      };

      console.log('🎟️ Experience Reservation Request:', bookingData);

      this.bookingService.createExperienceBooking(bookingData).subscribe({
        next: (res) => this.handleBookingSuccess(res),
        error: (err) => this.handleBookingError(err)
      });

    } else {
      // Default: Property
      const bookingData = {
        propertyId: this.property.id,
        checkInDate: this.formatDateForApi(this.checkInDate),
        checkOutDate: this.formatDateForApi(this.checkOutDate),
        adults: this.guests,
        children: 0,
        infants: 0,
        pets: 0
      };

      console.log('📅 Property Booking Request:', bookingData);

      this.bookingService.createBooking(bookingData).subscribe({
        next: (res) => this.handleBookingSuccess(res),
        error: (err) => this.handleBookingError(err)
      });
    }
  }

  private handleBookingSuccess(response: any) {
    this.creatingBooking = false;
    console.log('✅ Booking successful:', response);
    const id = response.data?.id || response.id || 'N/A';
    alert(`Reservation confirmed! ID: ${id}`);
    this.router.navigate(['/trips']);
  }

  private handleBookingError(err: any) {
    this.creatingBooking = false;
    console.error('❌ Booking error:', err);

    // Improved error parsing
    let errorMsg = 'Failed to create booking';
    if (err.error) {
      if (typeof err.error === 'string') errorMsg = err.error;
      else if (err.error.message) errorMsg = err.error.message;
      else if (err.error.title) errorMsg = err.error.title;
      else if (err.error.errors) errorMsg = JSON.stringify(err.error.errors);
    }

    alert(errorMsg);
  }

  goBack() {
    this.router.navigate(['/']);
  }

  // Review Logic
  canReviewProperty(): boolean {
    return true; // Simplified for now
  }

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