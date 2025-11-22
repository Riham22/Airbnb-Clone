// property-list.component.ts - Fixed version
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

  @Output() propertyClick = new EventEmitter<any>();
  @Output() wishlistChange = new EventEmitter<any>();

  // Filtered categories - ALL properties should be here
  beachProperties: any[] = [];
  cityProperties: any[] = [];
  mountainProperties: any[] = [];
  lakeProperties: any[] = [];
  countrysideProperties: any[] = [];

  // Experience categories
  foodExperiences: any[] = [];
  sportsExperiences: any[] = [];
  artsExperiences: any[] = [];
  outdoorExperiences: any[] = [];
  wellnessExperiences: any[] = [];

  // Service categories
  cleaningServices: any[] = [];
  foodServices: any[] = [];
  fitnessServices: any[] = [];
  beautyServices: any[] = [];
  transportServices: any[] = [];

  constructor(private dataService: Data) {}

  ngOnInit() {
    this.updateAllCategories();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['properties'] || changes['filters']) {
      console.log("Properties or filters changed:", this.properties, this.filters);
      this.updateAllCategories();
    }
  }

  private updateAllCategories(): void {
    console.log("Updating all carousel categories with filters:", this.filters);

    // Apply filters to all properties first
    const filteredProperties = this.applyFilters(this.properties);

    // Property categories
    this.beachProperties = this.filterByType(filteredProperties, 'beach');
    this.cityProperties = this.filterByType(filteredProperties, 'city');
    this.mountainProperties = this.filterByType(filteredProperties, 'mountain');
    this.lakeProperties = this.filterByType(filteredProperties, 'lake');
    this.countrysideProperties = this.filterByType(filteredProperties, 'countryside');

    // Experience categories
    this.foodExperiences = this.filterExperiencesByCategory(filteredProperties, 'food-drink');
    this.sportsExperiences = this.filterExperiencesByCategory(filteredProperties, 'sports');
    this.artsExperiences = this.filterExperiencesByCategory(filteredProperties, 'arts-culture');
    this.outdoorExperiences = this.filterExperiencesByCategory(filteredProperties, 'outdoors');
    this.wellnessExperiences = this.filterExperiencesByCategory(filteredProperties, 'wellness');

    // Service categories
    this.cleaningServices = this.filterServicesByCategory(filteredProperties, 'cleaning');
    this.foodServices = this.filterServicesByCategory(filteredProperties, 'food');
    this.fitnessServices = this.filterServicesByCategory(filteredProperties, 'fitness');
    this.beautyServices = this.filterServicesByCategory(filteredProperties, 'beauty');
    this.transportServices = this.filterServicesByCategory(filteredProperties, 'transport');

    console.log("Filtered results:", {
      beach: this.beachProperties.length,
      city: this.cityProperties.length,
      foodExp: this.foodExperiences.length,
      cleaning: this.cleaningServices.length
    });
  }

  private applyFilters(properties: any[]): any[] {
    if (!this.filters || Object.keys(this.filters).length === 0) {
      return properties;
    }

    return properties.filter(property => {
      // Location filter
      if (this.filters.location && this.filters.location !== 'anywhere') {
        if (!property.location.toLowerCase().includes(this.filters.location.toLowerCase())) {
          return false;
        }
      }

      // Price range filter
      if (this.filters.priceRange) {
        if (property.price < this.filters.priceRange.min || property.price > this.filters.priceRange.max) {
          return false;
        }
      }

      // Guests filter for properties and experiences
      if (this.filters.guests && this.filters.guests.totalGuests > 0) {
        if (property.type === 'property' && property.maxGuests < this.filters.guests.totalGuests) {
          return false;
        }
        if (property.type === 'experience' && property.maxParticipants < this.filters.guests.totalGuests) {
          return false;
        }
      }

      // Date filter (mock implementation)
      if (this.filters.dates && this.filters.dates.start && this.filters.dates.end) {
        // In real app, check against availability calendar
        const isAvailable = Math.random() > 0.3; // 70% available
        if (!isAvailable) return false;
      }

      // Property type filter
      if (this.filters.propertyType && this.filters.propertyType !== 'all') {
        if (this.filters.propertyType === 'property' && property.type !== 'property') {
          return false;
        }
        if (this.filters.propertyType === 'experience' && property.type !== 'experience') {
          return false;
        }
        if (this.filters.propertyType === 'service' && property.type !== 'service') {
          return false;
        }
        // Specific property types (beach, city, etc.)
        if (['beach', 'city', 'mountain', 'lake', 'countryside'].includes(this.filters.propertyType)) {
          if (property.type !== 'property' || property.type !== this.filters.propertyType) {
            return false;
          }
        }
      }

      return true;
    });
  }

  private filterByType(properties: any[], type: string): any[] {
    return properties.filter(p => p.type === 'property' && p.propertyType === type);
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

  onPropertyClick(property: any): void {
    this.propertyClick.emit(property);
  }

  onWishlistChange(event: any): void {
    this.wishlistChange.emit(event);
  }

  getActiveFilters(): string[] {
    const filters: string[] = [];
    if (this.filters?.location && this.filters.location !== 'anywhere') {
      filters.push(this.filters.location);
    }
    if (this.filters?.guests && this.filters.guests.totalGuests > 0) {
      filters.push(`${this.filters.guests.totalGuests} guests`);
    }
    return filters;
  }

  // Helper to check if any category has items
  hasAnyCategoryItems(): boolean {
    return this.beachProperties.length > 0 ||
           this.cityProperties.length > 0 ||
           this.mountainProperties.length > 0 ||
           this.lakeProperties.length > 0 ||
           this.countrysideProperties.length > 0 ||
           this.foodExperiences.length > 0 ||
           this.sportsExperiences.length > 0 ||
           this.artsExperiences.length > 0 ||
           this.outdoorExperiences.length > 0 ||
           this.wellnessExperiences.length > 0 ||
           this.cleaningServices.length > 0 ||
           this.foodServices.length > 0 ||
           this.fitnessServices.length > 0 ||
           this.beautyServices.length > 0 ||
           this.transportServices.length > 0;
  }
}
