// Update home.component.ts
import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RentalProperty } from '../../Models/rental-property';
import { PropertyList } from '../../Components/property-list/property-list';
import { SearchComponent } from '../search/search';
import { Data } from '../../Services/data';
import { CategoryBarComponent } from '../../Components/category-bar/category-bar.component';
import { FilterModalComponent } from '../../Components/filter-modal/filter-modal.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, SearchComponent, PropertyList, CategoryBarComponent, FilterModalComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  properties: RentalProperty[] = [];
  filteredProperties: RentalProperty[] = [];
  activeFilters: any = {};
  isFilterModalOpen = false;
  selectedCategory: string = 'All';
  isLoading = true;
  isScrolled = false;
  Router: any;

  constructor(private dataService: Data) { }

  ngOnInit() {
    // Simulate loading delay
    setTimeout(() => {
      this.dataService.properties$.subscribe(props => {
        this.properties = props;
        this.filteredProperties = props;
        this.isLoading = false;
      });
    }, 1000);
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  onFilteredPropertiesChange(properties: RentalProperty[]) {
    console.log("Received from search:", properties.length);
    if (properties.length === 0) {
      this.filteredProperties = [...this.properties];
    } else {
      this.filteredProperties = properties;
    }
  }

  onCategorySelect(category: string) {
    console.log('Category selected:', category);
    this.selectedCategory = category;

    // Filter properties by category
    if (category === 'All') {
      this.filteredProperties = [...this.properties];
    } else {
      this.filteredProperties = this.properties.filter(property =>
        property.type?.toLowerCase() === category.toLowerCase()
      );
    }
  }

  openFilters() {
    this.isFilterModalOpen = true;
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  }

  closeFilters() {
    this.isFilterModalOpen = false;
    // Restore body scroll
    document.body.style.overflow = 'auto';
  }

  onApplyFilters(filters: any) {
    console.log('Filters applied:', filters);
    this.activeFilters = { ...this.activeFilters, ...filters };
    this.applyComplexFilters();
    this.closeFilters();
  }

  applyComplexFilters() {
    let filtered = [...this.properties];

    // Apply location filter
    if (this.activeFilters.location && this.activeFilters.location !== 'anywhere') {
      filtered = filtered.filter(property =>
        property.location?.toLowerCase().includes(this.activeFilters.location.toLowerCase())

      );
    }

    // Apply price filter
    if (this.activeFilters.minPrice || this.activeFilters.maxPrice) {
      const minPrice = this.activeFilters.minPrice || 0;
      const maxPrice = this.activeFilters.maxPrice || Infinity;
      filtered = filtered.filter(property =>
        property.price >= minPrice && property.price <= maxPrice
      );
    }

    // Apply dates filter
    if (this.activeFilters.checkIn && this.activeFilters.checkOut) {
      // Here you would implement actual date availability logic
      // For now, just filter by availability flag
      filtered = filtered.filter(property => property.availableDates);
    }

    // Apply guests filter
    if (this.activeFilters.guests) {
      filtered = filtered.filter(property =>
        property.maxGuests >= this.activeFilters.guests
      );
    }

    // Apply amenities filter
    if (this.activeFilters.amenities && this.activeFilters.amenities.length > 0) {
      filtered = filtered.filter(property =>
        this.activeFilters.amenities.every((amenity: string) =>
          property.amenities?.includes(amenity)
        )
      );
    }

    // Apply category filter
    if (this.selectedCategory && this.selectedCategory !== 'All') {
      filtered = filtered.filter(property =>
        property.propertyType?.includes(this.selectedCategory.toLowerCase())
      );
    }

    this.filteredProperties = filtered;
  }

  onWishlistChange(event: any) {
    console.log("Wish changed:", event);
    // In a real app, you would save to user profile / backend
    const { propertyId, isWishlisted } = event;
    // Update local state or call service
  }

  onActiveFiltersChange(filters: any) {
    console.log('Filters received:', filters);
    this.activeFilters = filters;
    this.applyComplexFilters();
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

  getStarRating(rating: number): string {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    return '★'.repeat(fullStars) + (halfStar ? '½' : '') + '☆'.repeat(emptyStars);
  }

  onPropertyClick(property: RentalProperty) {
    console.log('Property clicked:', property);
    // Navigate to property details
    this.Router.navigate(['/property', property.id]);
  }

  clearFilters() {
    this.activeFilters = {};
    this.selectedCategory = 'All';
    this.filteredProperties = [...this.properties];
  }
}
