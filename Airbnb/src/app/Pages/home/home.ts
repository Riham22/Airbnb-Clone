import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyList } from '../../Components/property-list/property-list';
import { FilterModalComponent } from '../../Components/filter-modal/filter-modal.component';

import { Data } from '../../Services/data';
import { combineLatest } from 'rxjs';

import { NavBarComponent } from '../../Components/nav-bar/nav-bar.component';
import { MainSearchBarComponent } from '../../Components/main-search-bar-component/main-search-bar-component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    PropertyList,
    FilterModalComponent,
    NavBarComponent,
    MainSearchBarComponent
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  allProperties: any[] = [];
  allExperiences: any[] = [];
  allServices: any[] = [];
  properties: any[] = []; // Used for compatibility if referenced elsewhere

  filteredProperties: any[] = [];
  activeFilters: any = {};
  isFilterModalOpen = false;
  selectedCategory: string = 'All';
  isLoading = true;
  activePanel: string | null = null;

  locationOptions = [
    { value: 'flexible', label: "I'm flexible", icon: '🌍', description: 'Discover unique stays' },
    { value: 'new_york', label: 'New York', icon: '🏙️', description: 'Big Apple adventures' },
    { value: 'los_angeles', label: 'Los Angeles', icon: '🌴', description: 'Sunny California' },
    { value: 'miami', label: 'Miami', icon: '🏖️', description: 'Beachfront escapes' },
    { value: 'chicago', label: 'Chicago', icon: '🏙️', description: 'Windy City stays' },
    { value: 'las_vegas', label: 'Las Vegas', icon: '🎰', description: 'Entertainment capital' },
    { value: 'san_francisco', label: 'San Francisco', icon: '🌉', description: 'Golden Gate views' },
    { value: 'seattle', label: 'Seattle', icon: '🌧️', description: 'Pacific Northwest' },
    { value: 'austin', label: 'Austin', icon: '🎸', description: 'Live music capital' },
    { value: 'boston', label: 'Boston', icon: '🎓', description: 'Historic charm' }
  ];

  constructor(private dataService: Data) { }

  ngOnInit() {
    console.log('🏠 HomeComponent initialized');
    // Ensure data is loaded
    this.dataService.refreshData();

    combineLatest([
      this.dataService.properties$,
      this.dataService.experiences$,
      this.dataService.services$,
      this.dataService.activeFilters$
    ]).subscribe({
      next: ([properties, experiences, services, filters]) => {
        console.log('📦 Data received in Home:', {
          props: properties?.length,
          exps: experiences?.length,
          svcs: services?.length,
          filters
        });

        this.allProperties = properties || [];
        this.allExperiences = experiences || [];
        this.allServices = services || [];

        // Update active filters from global state
        this.activeFilters = { ...this.activeFilters, ...filters };

        // Also populate 'properties' for backward compatibility
        this.properties = [
          ...this.allProperties,
          ...this.allExperiences,
          ...this.allServices
        ];

        this.applyComplexFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error loading data:', error);
        this.isLoading = false;
      }
    });
  }

  onPanelOpened(panel: string): void {
    console.log('Home: Panel opened:', panel);
    this.activePanel = panel;
  }

  onOpenFilters(): void {
    this.openFilters();
  }

  // Legacy methods kept but likely unused now that we use global state
  onNavBarFiltersChange(filters: any) {
    // Handled by subscription now
  }

  onSearchFiltersChanged(filters: any) {
    // Handled by subscription now
  }

  onFilteredPropertiesChange(properties: any[]) {
    console.log("Home: Received properties from NavBar/Search:", properties?.length);
    if (!properties || properties.length === 0) {
      // If empty, re-evaluate local filters or keep as is?
      // Usually if search returns empty, it means no matches.
      // But let's trust the search component if it returns something.
      // If it explicitly returns [], it matched nothing.
      this.filteredProperties = [];
    } else {
      this.filteredProperties = properties;
    }
  }

  openFilters() {
    this.isFilterModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeFilters() {
    this.isFilterModalOpen = false;
    document.body.style.overflow = 'auto';
  }

  onApplyFilters(filters: any) {
    console.log('Home: Filters applied from modal:', filters);
    this.activeFilters = { ...this.activeFilters, ...filters };
    this.applyComplexFilters();
    this.closeFilters();
  }

  applyComplexFilters() {
    console.log('🎯 Applying complex filters:', this.activeFilters);

    let allListings = [
      ...this.allProperties,
      ...this.allExperiences,
      ...this.allServices
    ];

    // Apply property type filter
    if (this.activeFilters.propertyType && this.activeFilters.propertyType !== 'all') {
      const type = this.activeFilters.propertyType;
      console.log('Applying Property Type Filter:', type);
      allListings = allListings.filter(listing => listing.type === type);
    }

    // Apply location filter
    if (this.activeFilters.location && this.activeFilters.location !== '' && this.activeFilters.location !== 'flexible') {
      allListings = allListings.filter(listing =>
        listing.location?.toLowerCase().includes(this.activeFilters.location.toLowerCase())
      );
    }

    // Apply price filter
    if (this.activeFilters.minPrice || this.activeFilters.maxPrice) {
      const minPrice = this.activeFilters.minPrice || 0;
      const maxPrice = this.activeFilters.maxPrice || Infinity;
      allListings = allListings.filter(listing =>
        listing.price >= minPrice && listing.price <= maxPrice
      );
    }

    // Apply dates filter
    if (this.activeFilters.dates?.start && this.activeFilters.dates?.end) {
      allListings = allListings.filter(listing =>
        listing.isAvailable !== false
      );
    }

    // Apply guests filter
    if (this.activeFilters.guests?.adults || this.activeFilters.guests?.children) {
      const totalGuests = (this.activeFilters.guests.adults || 0) + (this.activeFilters.guests.children || 0);
      allListings = allListings.filter(listing =>
        (listing.maxGuests ?? 0) >= totalGuests
      );
    }

    // Apply amenities filter
    if (this.activeFilters.amenities && this.activeFilters.amenities.length > 0) {
      allListings = allListings.filter(listing =>
        listing.amenities && this.activeFilters.amenities.every((amenity: string) =>
          listing.amenities.includes(amenity)
        )
      );
    }

    // Apply Category Filter (SelectedCategory)
    if (this.selectedCategory && this.selectedCategory !== 'All') {
      const categoryLower = this.selectedCategory.toLowerCase();
      allListings = allListings.filter(property =>
        property.category?.toLowerCase() === categoryLower ||
        property.tags?.some((tag: string) => tag.toLowerCase() === categoryLower)
      );
    }

    this.filteredProperties = allListings;
    console.log('Final filtered listings:', this.filteredProperties.length);
  }

  // Wishlist handler
  onWishlistChange(event: any) {
    console.log("Wish changed:", event);
    const { propertyId, isWishlisted, itemType } = event;

    this.dataService.toggleWishlist(itemType || 'Property', propertyId).subscribe({
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
      return 'No listings found';
    }

    if (this.activeFilters.location && this.activeFilters.location !== 'anywhere') {
      const location = this.activeFilters.location.charAt(0).toUpperCase() +
        this.activeFilters.location.slice(1);
      return `${location} Listings`;
    }

    if (this.activeFilters.propertyType && this.activeFilters.propertyType !== 'all') {
      const type = this.activeFilters.propertyType.charAt(0).toUpperCase() +
        this.activeFilters.propertyType.slice(1);
      return `${type} Listings`;
    }

    return 'All Available Listings';
  }

  onPropertyClick(property: any) {
    console.log('Property clicked:', property);
    // يمكنك إضافة التنقل لصفحة التفاصيل هنا
  }
}
