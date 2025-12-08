// home.component.ts - Complete Fixed Version

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RentalProperty } from '../../Models/rental-property';
import { PropertyList } from '../../Components/property-list/property-list';
import { SearchComponent } from '../search/search';
import { Data } from '../../Services/data';
// import { CategoryBarComponent } from '../../Components/category-bar/category-bar.component';
// import { FilterModalComponent } from '../../Components/filter-modal/filter-modal.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, SearchComponent, PropertyList],
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
  isScrolled = false;
  Router: any;

  constructor(private dataService: Data) { }

  ngOnInit() {
    console.log('🏠 HomeComponent initialized');

    // Force refresh data from API to ensure we have the latest updates (e.g. newly added items)
    this.dataService.loadProperties();
    this.dataService.loadExperiences();
    this.dataService.loadServices();

    // Subscribe to properties
    this.dataService.properties$.subscribe(props => {
      this.properties = props;
      this.filteredProperties = props;
    });

    // Also try to get properties directly
    const directProps = this.dataService.getProperties();
    console.log('Direct properties check:', directProps.length);
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
  }

  onWishlistChange(event: any) {
    console.log("Wish changed:", event);
  }

  onActiveFiltersChange(filters: any) {
    console.log('Filters received:', filters);
    this.activeFilters = filters;
    // this.applyComplexFilters();
  }
  // applyComplexFilters() {
  //   throw new Error('Method not implemented.');
  // }

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
  }

  // Debug method - add this button to your template temporarily
  debugProperties() {
    console.log('=== DEBUG INFO ===');
    console.log('Properties:', this.properties);
    console.log('Filtered Properties:', this.filteredProperties);
    console.log('Active Filters:', this.activeFilters);
    console.log('Service Properties:', this.dataService.getProperties());
  }
}
