// become-host.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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

  // Progress tracking
  progress = 0;
  isSubmitting = false;

constructor(private router: Router) {}



  ngOnInit() {
    this.updateProgress();
  }

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

    if (newValue >= 1 && newValue <= (type === 'guests' ? 16 : type === 'bathrooms' ? 8 : 10)) {
      this.listingData[type] = newValue;
    }
  }

  handlePhotoUpload(event: any) {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
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

  calculateEstimatedEarnings(): number {
    const basePrice = this.listingData.price || 100;
    const estimatedMonthlyBookings = 20; // Conservative estimate
    return basePrice * estimatedMonthlyBookings;
  }

  submitListing() {
    this.isSubmitting = true;

    // Simulate API call
    setTimeout(() => {
      console.log('Listing submitted:', this.listingData);
      this.isSubmitting = false;
      // Navigate to success page or dashboard
      this.router.navigate(['/host/success']);
    }, 2000);
  }

  // Price suggestions based on location and type
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

  // Location autocomplete simulation
  locationSuggestions: string[] = [];
  searchLocations(query: string) {
    // Simulate API call for location suggestions
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
}
