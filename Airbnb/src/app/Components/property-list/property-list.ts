// property-list.component.ts - COMPLETE VERSION
import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyCarousel } from '../property-carousel/property-carousel';
import { Data } from '../../Services/data';

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [CommonModule, PropertyCarousel],
  templateUrl: './property-list.html',
  styleUrls: ['./property-list.css']
})
export class PropertyList implements OnInit, OnChanges {
  @Input() properties: any[] = [];
  @Input() title: string = 'Properties';
  @Input() filters: any = {};
  @Input() showResultCount: boolean = true;
  @Input() viewMode: 'grid' | 'map' = 'grid';

  @Output() propertyClick = new EventEmitter<any>();
  @Output() wishlistChange = new EventEmitter<any>();
  @Output() viewModeChange = new EventEmitter<'grid' | 'map'>();
  @Output() filtersChange = new EventEmitter<any>(); // ADD THIS

  // All available listings from data service
  allListings: any[] = [];

  // Enhanced categories with Airbnb-like organization
  categories = [
    {
      id: 'beach',
      title: 'Beachfront Escapes',
      subtitle: 'Wake up to ocean views',
      icon: '🏖️',
      properties: [] as any[]
    },
    {
      id: 'city',
      title: 'City Adventures',
      subtitle: 'Explore urban landscapes',
      icon: '🏙️',
      properties: [] as any[]
    },
    {
      id: 'mountain',
      title: 'Mountain Getaways',
      subtitle: 'Find peace in nature',
      icon: '⛰️',
      properties: [] as any[]
    },
    {
      id: 'lake',
      title: 'Lake Retreats',
      subtitle: 'Waterfront serenity',
      icon: '🌊',
      properties: [] as any[]
    },
    {
      id: 'countryside',
      title: 'Countryside Charm',
      subtitle: 'Escape the ordinary',
      icon: '🌾',
      properties: [] as any[]
    }
  ];

  // Experiences with Airbnb categories
  experiences = [
    {
      id: 'food-drink',
      title: 'Food & Drink',
      subtitle: 'Culinary adventures',
      icon: '🍷',
      properties: [] as any[]
    },
    {
      id: 'sports',
      title: 'Sports & Adventure',
      subtitle: 'Active experiences',
      icon: '🏄',
      properties: [] as any[]
    },
    {
      id: 'arts-culture',
      title: 'Arts & Culture',
      subtitle: 'Creative journeys',
      icon: '🎨',
      properties: [] as any[]
    },
    {
      id: 'outdoors',
      title: 'Outdoor Exploration',
      subtitle: 'Nature experiences',
      icon: '🥾',
      properties: [] as any[]
    },
    {
      id: 'wellness',
      title: 'Wellness & Relaxation',
      subtitle: 'Rejuvenating activities',
      icon: '🧘',
      properties: [] as any[]
    }
  ];

  // Services categories
  services = [
    {
      id: 'cleaning',
      title: 'Cleaning Services',
      subtitle: 'Professional cleaning',
      icon: '🧹',
      properties: [] as any[]
    },
    {
      id: 'food',
      title: 'Food Services',
      subtitle: 'Private chefs & more',
      icon: '👨‍🍳',
      properties: [] as any[]
    },
    {
      id: 'fitness',
      title: 'Fitness & Wellness',
      subtitle: 'Personal training',
      icon: '💪',
      properties: [] as any[]
    },
    {
      id: 'beauty',
      title: 'Beauty Services',
      subtitle: 'Pamper yourself',
      icon: '💅',
      properties: [] as any[]
    },
    {
      id: 'transport',
      title: 'Transportation',
      subtitle: 'Get around easily',
      icon: '🚗',
      properties: [] as any[]
    }
  ];

  // Main listing types for filtering
  listingTypes = [
    {
      id: 'property',
      title: 'Stays',
      subtitle: 'Find your perfect stay',
      icon: '🏠',
      properties: [] as any[]
    },
    {
      id: 'experience',
      title: 'Experiences',
      subtitle: 'Things to do',
      icon: '🌟',
      properties: [] as any[]
    },
    {
      id: 'service',
      title: 'Services',
      subtitle: 'Professional services',
      icon: '🔧',
      properties: [] as any[]
    }
  ];

  // Airbnb-like state
  isLoading = false;
  showFilters = false;
  sortBy: string = 'recommended';
  priceRange = { min: 0, max: 1000 };

  // ADD THESE PROPERTIES
  selectedAmenities: string[] = [];
  selectedCategories: string[] = [];
  instantBookOnly = false;
  superhostOnly = false;
  showAdvancedFilters = false;

  constructor(private dataService: Data) { }

  ngOnInit() {
    this.loadAllData();
    this.updateAllCategories();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['properties'] || changes['filters']) {
      this.updateAllCategories();
    }
  }

  // In your PropertyList component, make sure you're loading properties correctly
  private loadAllData(): void {
    // Get properties, experiences, and services from data service
    const rentalProperties = this.dataService.getProperties();
    const experiences = (this.dataService as any).getExperiences ? (this.dataService as any).getExperiences() : [];
    const services = (this.dataService as any).getServices ? (this.dataService as any).getServices() : [];

    console.log('Rental Properties:', rentalProperties); // Debug log
    console.log('Experiences:', experiences); // Debug log
    console.log('Services:', services); // Debug log

    // Combine all listings
    this.allListings = [
      ...rentalProperties,
      ...experiences,
      ...services
    ];

    console.log('All Listings:', this.allListings); // Debug log

    // If input properties are provided, use them instead
    if (this.properties && this.properties.length > 0) {
      this.allListings = this.properties;
    }
  }
  private updateAllCategories(): void {
    const filteredProperties = this.applyFilters(this.allListings);

    // Update main listing types
    this.listingTypes.forEach(type => {
      type.properties = this.filterByType(filteredProperties, type.id);
    });

    // Update property categories
    this.categories.forEach(category => {
      category.properties = this.filterPropertiesByType(filteredProperties, category.id);
    });

    // Update experiences
    this.experiences.forEach(exp => {
      exp.properties = this.filterExperiencesByCategory(filteredProperties, exp.id);
    });

    // Update services
    this.services.forEach(service => {
      service.properties = this.filterServicesByCategory(filteredProperties, service.id);
    });
  }

  // Enhanced filtering with Airbnb-like options
  private applyFilters(properties: any[]): any[] {
    if (!this.filters || Object.keys(this.filters).length === 0) {
      return properties;
    }

    return properties.filter(property => {
      // Enhanced location filter
      if (this.filters.location && this.filters.location !== 'anywhere') {
        if (!this.matchesLocation(property, this.filters.location)) {
          return false;
        }
      }

      // Price range filter
      if (this.filters.priceRange) {
        if (property.price < this.filters.priceRange.min || property.price > this.filters.priceRange.max) {
          return false;
        }
      }

      // Enhanced guests filter
      if (this.filters.guests && this.filters.guests.totalGuests > 0) {
        if (!this.matchesGuestRequirements(property, this.filters.guests)) {
          return false;
        }
      }

      // Date availability
      if (this.filters.dates && this.filters.dates.start && this.filters.dates.end) {
        if (!this.isAvailable(property, this.filters.dates.start, this.filters.dates.end)) {
          return false;
        }
      }

      // Property type filter
      if (this.filters.propertyType && this.filters.propertyType !== 'all') {
        if (!this.matchesPropertyType(property, this.filters.propertyType)) {
          return false;
        }
      }

      // Amenities filter
      if (this.filters.amenities && this.filters.amenities.length > 0) {
        if (!this.hasAllAmenities(property, this.filters.amenities)) {
          return false;
        }
      }

      // Superhost filter
      if (this.filters.superhostOnly && property.host && !property.host.isSuperhost) {
        return false;
      }

      // Instant book filter
      if (this.filters.instantBookOnly && !property.instantBook) {
        return false;
      }

      return true;
    });
  }

  private matchesLocation(property: any, location: string): boolean {
    const locationMap: { [key: string]: string[] } = {
      'new_york': ['New York', 'NY', 'New York City', 'Manhattan', 'Brooklyn'],
      'los_angeles': ['Los Angeles', 'LA', 'California', 'Malibu', 'Santa Monica'],
      'miami': ['Miami', 'Florida', 'Miami Beach'],
      'chicago': ['Chicago', 'Illinois'],
      'las_vegas': ['Las Vegas', 'Nevada'],
      'san_francisco': ['San Francisco', 'SF', 'Bay Area'],
      'seattle': ['Seattle', 'Washington'],
      'austin': ['Austin', 'Texas'],
      'boston': ['Boston', 'Massachusetts']
    };

    const searchTerms = locationMap[location] || [location];
    return searchTerms.some(term =>
      property.location.toLowerCase().includes(term.toLowerCase())
    );
  }

  private matchesGuestRequirements(property: any, guests: any): boolean {
    const totalGuests = guests.adults + guests.children;

    if (property.type === 'property') {
      return property.maxGuests >= totalGuests;
    }
    if (property.type === 'experience') {
      return property.maxParticipants >= totalGuests;
    }
    return true; // Services typically don't have guest limits
  }

  private matchesPropertyType(property: any, propertyType: string): boolean {
    if (['property', 'experience', 'service'].includes(propertyType)) {
      return property.type === propertyType;
    }

    // Specific property types
    if (property.type === 'property') {
      return property.propertyType === propertyType;
    }

    return false;
  }

  private hasAllAmenities(property: any, requiredAmenities: string[]): boolean {
    if (!property.amenities) return false;
    return requiredAmenities.every(amenity =>
      property.amenities.includes(amenity)
    );
  }

  private isAvailable(property: any, start: Date, end: Date): boolean {
    // Mock implementation - in real app, check against availability calendar
    return Math.random() > 0.3; // 70% available
  }

  // Filter methods for different data types
  private filterByType(properties: any[], type: string): any[] {
    return properties.filter(p => p.type === type);
  }

  private filterPropertiesByType(properties: any[], propertyType: string): any[] {
    console.log(`Filtering properties for type: ${propertyType}`); // Debug
    const filtered = properties.filter(p =>
      p.type === 'property' && p.propertyType === propertyType
    );
    console.log(`Found ${filtered.length} properties for ${propertyType}:`, filtered); // Debug
    return filtered;
  }

  private filterExperiencesByCategory(properties: any[], category: string): any[] {
    return properties.filter(p =>
      p.type === 'experience' && p.category === category
    );
  }

  private filterServicesByCategory(properties: any[], category: string): any[] {
    return properties.filter(p =>
      p.type === 'service' && p.category === category
    );
  }

  // Airbnb-like UI interactions
  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'grid' ? 'map' : 'grid';
    this.viewModeChange.emit(this.viewMode);
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  onSortChange(sortBy: string): void {
    this.sortBy = sortBy;
    this.applySorting();
  }

  private applySorting(): void {
    const allProperties = [
      ...this.categories.flatMap(c => c.properties),
      ...this.experiences.flatMap(e => e.properties),
      ...this.services.flatMap(s => s.properties)
    ];

    switch (this.sortBy) {
      case 'price_low_high':
        allProperties.sort((a, b) => a.price - b.price);
        break;
      case 'price_high_low':
        allProperties.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        allProperties.sort((a, b) => b.rating - a.rating);
        break;
      case 'recommended':
      default:
        // Keep original order or apply recommendation algorithm
        break;
    }
  }

  // Enhanced event handlers
  onPropertyClick(property: any): void {
    this.propertyClick.emit(property);
  }

  onWishlistChange(event: any): void {
    this.wishlistChange.emit(event);
  }

  // Airbnb-like utility methods
  getTotalResults(): number {
    return this.categories.reduce((total, category) => total + category.properties.length, 0) +
      this.experiences.reduce((total, exp) => total + exp.properties.length, 0) +
      this.services.reduce((total, service) => total + service.properties.length, 0);
  }

  // UPDATED: Return array of objects instead of strings
  getActiveFilters(): { type: string, value: string, display: string, data?: any }[] {
    const filters: { type: string, value: string, display: string, data?: any }[] = [];

    if (this.filters?.location && this.filters.location !== 'anywhere') {
      filters.push({
        type: 'location',
        value: this.filters.location,
        display: this.getLocationDisplay(this.filters.location)
      });
    }

    if (this.filters?.guests && this.filters.guests.totalGuests > 0) {
      filters.push({
        type: 'guests',
        value: 'guests',
        display: `${this.filters.guests.totalGuests} guests`
      });
    }

    if (this.filters?.dates?.start && this.filters?.dates?.end) {
      filters.push({
        type: 'dates',
        value: 'dates',
        display: `${this.formatDate(this.filters.dates.start)} - ${this.formatDate(this.filters.dates.end)}`
      });
    }

    if (this.filters?.propertyType && this.filters.propertyType !== 'all') {
      filters.push({
        type: 'propertyType',
        value: this.filters.propertyType,
        display: this.formatPropertyType(this.filters.propertyType)
      });
    }

    if (this.filters?.superhostOnly) {
      filters.push({
        type: 'superhost',
        value: 'superhost',
        display: 'Superhost'
      });
    }

    if (this.filters?.instantBookOnly) {
      filters.push({
        type: 'instantBook',
        value: 'instantBook',
        display: 'Instant Book'
      });
    }

    if (this.filters?.priceRange && (this.filters.priceRange.min > 0 || this.filters.priceRange.max < 1000)) {
      filters.push({
        type: 'price',
        value: 'price',
        display: `$${this.filters.priceRange.min} - $${this.filters.priceRange.max}`
      });
    }

    if (this.filters?.amenities && this.filters.amenities.length > 0) {
      this.filters.amenities.forEach((amenity: string) => {
        filters.push({
          type: 'amenity',
          value: amenity,
          display: this.formatAmenity(amenity),
          data: amenity
        });
      });
    }

    return filters;
  }

  // ADD THIS METHOD
  private formatAmenity(amenity: string): string {
    const amenityMap: { [key: string]: string } = {
      'wifi': 'WiFi',
      'kitchen': 'Kitchen',
      'parking': 'Parking',
      'pool': 'Pool',
      'hot_tub': 'Hot Tub',
      'air_conditioning': 'Air Conditioning',
      'washer': 'Washer',
      'dryer': 'Dryer',
      'tv': 'TV',
      'gym': 'Gym'
    };
    return amenityMap[amenity] || amenity;
  }

  private getLocationDisplay(location: string): string {
    const locationMap: { [key: string]: string } = {
      'new_york': 'New York',
      'los_angeles': 'Los Angeles',
      'miami': 'Miami',
      'chicago': 'Chicago',
      'las_vegas': 'Las Vegas',
      'san_francisco': 'San Francisco',
      'seattle': 'Seattle',
      'austin': 'Austin',
      'boston': 'Boston',
      'flexible': 'Flexible'
    };
    return locationMap[location] || location;
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  private formatPropertyType(type: string): string {
    const typeMap: { [key: string]: string } = {
      'property': 'Properties',
      'experience': 'Experiences',
      'service': 'Services',
      'beach': 'Beach',
      'city': 'City',
      'mountain': 'Mountain',
      'lake': 'Lake',
      'countryside': 'Countryside'
    };
    return typeMap[type] || type;
  }

  // Check if any category has items
  hasAnyCategoryItems(): boolean {
    return this.categories.some(cat => cat.properties.length > 0) ||
      this.experiences.some(exp => exp.properties.length > 0) ||
      this.services.some(service => service.properties.length > 0) ||
      this.listingTypes.some(type => type.properties.length > 0);
  }

  // Check if specific category has items
  hasCategoryItems(categoryId: string): boolean {
    const allCategories = [
      ...this.categories,
      ...this.experiences,
      ...this.services,
      ...this.listingTypes
    ];
    const category = allCategories.find(cat => cat.id === categoryId);
    return category ? category.properties.length > 0 : false;
  }

  // Get category by ID
  getCategoryById(categoryId: string): any {
    const allCategories = [
      ...this.categories,
      ...this.experiences,
      ...this.services,
      ...this.listingTypes
    ];
    return allCategories.find(cat => cat.id === categoryId);
  }

  // Load more functionality for infinite scroll
  loadMore(): void {
    this.isLoading = true;
    // Simulate API call
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  // Get display information for different listing types
  getListingDisplayInfo(listing: any): { type: string, subtitle: string } {
    switch (listing.type) {
      case 'property':
        return {
          type: 'Stay',
          subtitle: `${listing.bedrooms} bed${listing.bedrooms !== 1 ? 's' : ''} • ${listing.bathrooms} bath${listing.bathrooms !== 1 ? 's' : ''}`
        };
      case 'experience':
        return {
          type: 'Experience',
          subtitle: `${listing.duration} • ${listing.maxParticipants} max`
        };
      case 'service':
        return {
          type: 'Service',
          subtitle: `${listing.duration} • Professional service`
        };
      default:
        return {
          type: 'Listing',
          subtitle: ''
        };
    }
  }

  // Get price display with proper formatting
  getPriceDisplay(listing: any): string {
    if (listing.type === 'property') {
      return `$${listing.price}/night`;
    } else if (listing.type === 'experience') {
      return `$${listing.price}/person`;
    } else if (listing.type === 'service') {
      return `$${listing.price}/session`;
    }
    return `$${listing.price}`;
  }

  // Check if listing is in wishlist
  isInWishlist(listing: any): boolean {
    // This would integrate with your wishlist service
    return this.dataService.isWishlistedSync ? this.dataService.isWishlistedSync(listing.id) : false;
  }

  // Toggle wishlist
  toggleWishlist(listing: any): void {
    const wasInWishlist = this.isInWishlist(listing);
    if (this.dataService.toggleWishlist) {
      const isNowInWishlist = this.dataService.toggleWishlist('property', listing.id);
      this.wishlistChange.emit({
        listing,
        inWishlist: isNowInWishlist,
        wasInWishlist
      });
    }
  }

  // ADD THESE METHODS
  get hasExperiences(): boolean {
    return this.experiences.some(exp => exp.properties.length > 0);
  }

  get hasServices(): boolean {
    return this.services.some(service => service.properties.length > 0);
  }

  clearAllFilters(): void {
    console.log('Clearing all filters...');

    // Reset all filter properties to their default values
    const clearedFilters = {
      location: '',
      dates: { start: null, end: null },
      guests: { adults: 0, children: 0, infants: 0, pets: 0, totalGuests: 0 },
      propertyType: 'all',
      priceRange: { min: 0, max: 1000 },
      amenities: [],
      superhostOnly: false,
      instantBookOnly: false
    };

    // Emit the cleared filters to parent component
    this.filtersChange.emit(clearedFilters);

    // Also update local state if filters are managed locally
    this.filters = clearedFilters;

    // Reset any local filter states
    this.resetLocalFilterStates();

    // Reload data with cleared filters
    this.updateAllCategories();

    console.log('All filters cleared successfully');
  }

  // ADD THIS METHOD
  private resetLocalFilterStates(): void {
    this.priceRange = { min: 0, max: 1000 };
    this.selectedAmenities = [];
    this.selectedCategories = [];
    this.instantBookOnly = false;
    this.superhostOnly = false;
    this.showAdvancedFilters = false;
  }

  // ADD THIS METHOD
  removeFilter(filterType: string, filterValue?: any): void {
    switch (filterType) {
      case 'location':
        this.filters.location = '';
        break;
      case 'dates':
        this.filters.dates = { start: null, end: null };
        break;
      case 'guests':
        this.filters.guests = { adults: 0, children: 0, infants: 0, pets: 0, totalGuests: 0 };
        break;
      case 'propertyType':
        this.filters.propertyType = 'all';
        break;
      case 'price':
        this.filters.priceRange = { min: 0, max: 1000 };
        break;
      case 'superhost':
        this.filters.superhostOnly = false;
        break;
      case 'instantBook':
        this.filters.instantBookOnly = false;
        break;
      case 'amenity':
        if (filterValue && this.filters.amenities) {
          this.filters.amenities = this.filters.amenities.filter((a: string) => a !== filterValue);
        }
        break;
    }

    // Emit the updated filters
    this.filtersChange.emit({ ...this.filters });

    // Update the view
    this.updateAllCategories();
  }
}
