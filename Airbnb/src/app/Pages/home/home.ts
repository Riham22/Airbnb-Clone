// home.component.ts - Fixed Version
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RentalProperty } from '../../Models/rental-property';
import { PropertyList } from '../../Components/property-list/property-list';
import { SearchComponent } from '../search/search';
import { Data } from '../../Services/data';
import { FilterModalComponent } from '../../Components/filter-modal/filter-modal.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    SearchComponent,
    PropertyList,
    FilterModalComponent
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  properties: any[] = [];
  filteredProperties: any[] = [];
  activeFilters: any = {};
  isFilterModalOpen = false;
  selectedCategory: string = 'All';
  isLoading = true;

  constructor(private dataService: Data) { }

  ngOnInit() {
    console.log('🏠 HomeComponent initialized');

    // Force refresh data from API
    this.dataService.loadProperties();
    this.dataService.loadExperiences();
    this.dataService.loadServices();

    // Subscribe to properties
    this.dataService.properties$.subscribe(props => {
      this.properties = props;
      this.filteredProperties = props;
      this.isLoading = false;
    });
  }

  // Handle filter button click from SearchComponent
  onOpenFilters(): void {
    this.openFilters();
  }

  // Handle search results from SearchComponent
  onFilteredPropertiesChange(properties: RentalProperty[]) {
    console.log("Received from search:", properties.length);
    if (properties.length === 0) {
      this.filteredProperties = [...this.properties];
    } else {
      this.filteredProperties = properties;
    }
  }

  // Handle active filters from SearchComponent
  onActiveFiltersChange(filters: any) {
    console.log('Filters received:', filters);
    this.activeFilters = filters;
    this.applyComplexFilters();
  }

  // Open filter modal
  openFilters() {
    this.isFilterModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  // Close filter modal
  closeFilters() {
    this.isFilterModalOpen = false;
    document.body.style.overflow = 'auto';
  }

  // Apply filters from modal
  onApplyFilters(filters: any) {
    console.log('Filters applied:', filters);
    this.activeFilters = { ...this.activeFilters, ...filters };
    this.applyComplexFilters();
    this.closeFilters();
  }

  // Apply all filters (from search and modal)
  applyComplexFilters() {
    let filtered = [...this.properties];

    // Apply location filter from search
    if (this.activeFilters.location && this.activeFilters.location !== 'anywhere') {
      filtered = filtered.filter(property =>
        property.location?.toLowerCase().includes(this.activeFilters.location.toLowerCase())
      );
    }

    // Apply price filter from modal
    if (this.activeFilters.minPrice || this.activeFilters.maxPrice) {
      const minPrice = this.activeFilters.minPrice || 0;
      const maxPrice = this.activeFilters.maxPrice || Infinity;
      filtered = filtered.filter(property =>
        property.price >= minPrice && property.price <= maxPrice
      );
    }

    // Apply dates filter from search
    if (this.activeFilters.dates?.start && this.activeFilters.dates?.end) {
      filtered = filtered.filter(property =>
        property.isAvailable !== false
      );
    }

    // Apply guests filter from search
    if (this.activeFilters.guests?.adults || this.activeFilters.guests?.children) {
      const totalGuests = (this.activeFilters.guests.adults || 0) + (this.activeFilters.guests.children || 0);
      filtered = filtered.filter(property =>
        (property.maxGuests ?? 0) >= totalGuests
      );
    }

    // Apply amenities filter from modal
    if (this.activeFilters.amenities && this.activeFilters.amenities.length > 0) {
      filtered = filtered.filter(property =>
        this.activeFilters.amenities.every((amenity: string) =>
          property.amenities?.includes(amenity)
        )
      );
    }

    // Apply category filter - FIXED: Added type for tag parameter
    if (this.selectedCategory && this.selectedCategory !== 'All') {
      const categoryLower = this.selectedCategory.toLowerCase();
      filtered = filtered.filter(property =>
        property.category?.toLowerCase() === categoryLower ||
        property.tags?.some((tag: string) => tag.toLowerCase() === categoryLower)
      );
    }

    this.filteredProperties = filtered;
  }

  // Wishlist handler - FIXED: Use toggleWishlist method
  onWishlistChange(event: any) {
    console.log("Wish changed:", event);
    const { propertyId, isWishlisted, itemType } = event;

    // Check which type of item this is (property, experience, or service)
    const type = itemType || 'Property'; // Default to Property if not specified

    // Use the toggleWishlist method from Data service
    this.dataService.toggleWishlist(type, propertyId).subscribe({
      next: (response) => {
        console.log('Wishlist updated:', response);
      },
      error: (err) => {
        console.error('Failed to update wishlist:', err);
      }
    });
  }

  getResultsTitle(): string {
    if (this.filteredProperties.length === 0 && !this.isLoading) {
      return 'No properties found';
    }

    if (this.activeFilters.location && this.activeFilters.location !== 'anywhere') {
      const location = this.activeFilters.location.charAt(0).toUpperCase() +
        this.activeFilters.location.slice(1);
      return `${location} Properties`;
    }

    if (this.selectedCategory && this.selectedCategory !== 'All') {
      return `${this.selectedCategory} Stays`;
    }

    return 'All Available Stays';
  }

  onPropertyClick(property: RentalProperty) {
    console.log('Property clicked:', property);
  }
}
