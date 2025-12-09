import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../Services/auth';


@Component({
  selector: 'app-become-host',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './become-host.html',
  styleUrl: './become-host.css'
})
export class BecomeHostComponent implements OnInit {
  currentStep = 1;
  totalSteps = 6;

  // Form data
  listingData = {
    propertyType: '',
    location: '',
    guests: 1,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    amenities: [] as string[],
    title: '',
    description: '',
    price: 0,
    photos: [] as string[],
    availability: {
      instantBook: false,
      checkInStart: '15:00',
      checkInEnd: '20:00',
      checkOut: '11:00'
    }
  };

  // Available options
  propertyTypes = [
    { value: 'apartment', label: 'Apartment', icon: '🏢' },
    { value: 'house', label: 'House', icon: '🏠' },
    { value: 'villa', label: 'Villa', icon: '🏡' },
    { value: 'cabin', label: 'Cabin', icon: '🛖' },
    { value: 'beach_house', label: 'Beach House', icon: '🏖️' },
    { value: 'loft', label: 'Loft', icon: '🏭' },
    { value: 'tiny_house', label: 'Tiny House', icon: '🚐' },
    { value: 'unique_space', label: 'Unique Space', icon: '🎪' }
  ];

  amenitiesList = [
    { value: 'wifi', label: 'WiFi', icon: '📶' },
    { value: 'kitchen', label: 'Kitchen', icon: '👨‍🍳' },
    { value: 'washing_machine', label: 'Washing Machine', icon: '🧼' },
    { value: 'dryer', label: 'Dryer', icon: '👕' },
    { value: 'air_conditioning', label: 'Air Conditioning', icon: '❄️' },
    { value: 'heating', label: 'Heating', icon: '🔥' },
    { value: 'tv', label: 'TV', icon: '📺' },
    { value: 'hair_dryer', label: 'Hair Dryer', icon: '💇' },
    { value: 'iron', label: 'Iron', icon: '👔' },
    { value: 'pool', label: 'Pool', icon: '🏊' },
    { value: 'hot_tub', label: 'Hot Tub', icon: '♨️' },
    { value: 'free_parking', label: 'Free Parking', icon: '🅿️' },
    { value: 'ev_charger', label: 'EV Charger', icon: '🔌' },
    { value: 'gym', label: 'Gym', icon: '💪' },
    { value: 'breakfast', label: 'Breakfast', icon: '🍳' },
    { value: 'fireplace', label: 'Fireplace', icon: '🪵' }
  ];


  progress = 0;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';


  locationSuggestions: string[] = [];

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.updateProgress();
  }

  // Navigation methods
  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      this.updateProgress();
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.updateProgress();
    }
  }

  updateProgress() {
    this.progress = (this.currentStep / this.totalSteps) * 100;
  }

  // Form methods
  selectPropertyType(type: string) {
    this.listingData.propertyType = type;
  }

  toggleAmenity(amenity: string) {
    const index = this.listingData.amenities.indexOf(amenity);
    if (index > -1) {
      this.listingData.amenities.splice(index, 1);
    } else {
      this.listingData.amenities.push(amenity);
    }
  }

  isAmenitySelected(amenity: string): boolean {
    return this.listingData.amenities.includes(amenity);
  }

  updateGuests(count: number, type: 'guests' | 'bedrooms' | 'beds' | 'bathrooms') {
    const current = this.listingData[type];
    const newValue = current + count;

    const limits = {
      guests: 16,
      bedrooms: 10,
      beds: 10,
      bathrooms: 8
    };

    if (newValue >= 1 && newValue <= limits[type]) {
      this.listingData[type] = newValue;
    }
  }

  handlePhotoUpload(event: any) {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file
        if (!file.type.startsWith('image/')) {
          this.errorMessage = `${file.name} is not an image file`;
          continue;
        }
        
        if (file.size > 5 * 1024 * 1024) {
          this.errorMessage = `${file.name} is too large (max 5MB)`;
          continue;
        }

        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.listingData.photos.push(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removePhoto(index: number) {
    this.listingData.photos.splice(index, 1);
  }

  // Step info methods
  getStepTitle(): string {
    const titles = {
      1: 'What kind of place are you listing?',
      2: 'Where is your place located?',
      3: 'How many guests can your place accommodate?',
      4: 'What amenities do you offer?',
      5: 'Describe your place',
      6: 'Set your price and availability'
    };
    return titles[this.currentStep as keyof typeof titles] || '';
  }

  getStepDescription(): string {
    const descriptions = {
      1: 'Choose a property type that best describes your space.',
      2: 'Your address is only shared with guests after they book.',
      3: 'Make sure you can comfortably host this many people.',
      4: 'Select all amenities that apply to your space.',
      5: 'Help guests imagine staying at your place.',
      6: 'Set competitive pricing and availability options.'
    };
    return descriptions[this.currentStep as keyof typeof descriptions] || '';
  }

  // Location methods
  searchLocations(query: string) {
    if (query.length < 2) {
      this.locationSuggestions = [];
      return;
    }

    const mockSuggestions = [
      'New York, NY, USA',
      'Los Angeles, CA, USA',
      'London, UK',
      'Paris, France',
      'Tokyo, Japan',
      'Sydney, Australia'
    ].filter(location =>
      location.toLowerCase().includes(query.toLowerCase())
    );

    this.locationSuggestions = mockSuggestions;
  }

  selectLocation(location: string) {
    this.listingData.location = location;
    this.locationSuggestions = [];
  }

  // Price methods
  calculateEstimatedEarnings(): number {
    const basePrice = this.listingData.price || 100;
    return basePrice * 20; // 20 days per month
  }

  getPriceSuggestion(): number {
    const basePrices: { [key: string]: number } = {
      'apartment': 80,
      'house': 120,
      'villa': 250,
      'cabin': 90,
      'beach_house': 180,
      'loft': 100,
      'tiny_house': 70,
      'unique_space': 150
    };
    return basePrices[this.listingData.propertyType] || 100;
  }

  // Submission method
  submitListing() {
    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Validate form
    if (!this.validateForm()) {
      this.isSubmitting = false;
      return;
    }

    // Prepare data for backend
    const propertyData = this.prepareBackendData();

    // In a real app, you would call your backend API here
    // For now, simulate API call
    setTimeout(() => {
      console.log('Listing data prepared for backend:', propertyData);
      this.isSubmitting = false;
      this.successMessage = 'Listing created successfully!';
      
      // Navigate after success
      setTimeout(() => {
        this.router.navigate(['/host/dashboard']);
      }, 2000);
    }, 2000);
  }

  private validateForm(): boolean {
    if (!this.listingData.title || this.listingData.title.trim().length < 5) {
      this.errorMessage = 'Title must be at least 5 characters';
      return false;
    }

    if (!this.listingData.description || this.listingData.description.trim().length < 20) {
      this.errorMessage = 'Description must be at least 20 characters';
      return false;
    }

    if (!this.listingData.propertyType) {
      this.errorMessage = 'Please select a property type';
      return false;
    }

    if (!this.listingData.location) {
      this.errorMessage = 'Please enter a location';
      return false;
    }

    if (!this.listingData.price || this.listingData.price <= 0) {
      this.errorMessage = 'Price must be greater than 0';
      return false;
    }

    if (this.listingData.photos.length < 5) {
      this.errorMessage = 'Please add at least 5 photos';
      return false;
    }

    return true;
  }

  private prepareBackendData(): any {
    // Convert frontend data to match your backend CreatePropertyDto
    return {
      title: this.listingData.title,
      description: this.listingData.description,
      propertyType: this.listingData.propertyType,
      location: this.listingData.location,
      guests: this.listingData.guests,
      bedrooms: this.listingData.bedrooms,
      beds: this.listingData.beds,
      bathrooms: this.listingData.bathrooms,
      pricePerNight: this.listingData.price,
      amenities: this.listingData.amenities,
      instantBook: this.listingData.availability.instantBook,
      checkInStart: this.listingData.availability.checkInStart,
      checkInEnd: this.listingData.availability.checkInEnd,
      checkOut: this.listingData.availability.checkOut
    };
  }
}