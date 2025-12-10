import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RentalProperty } from '../../Models/rental-property';
import { PropertyList } from '../../Components/property-list/property-list';
import { FilterModalComponent } from '../../Components/filter-modal/filter-modal.component';
import { MainSearchBarComponent } from "../../Components/main-search-bar-component/main-search-bar-component";
import { NavBarComponent } from "../../Components/nav-bar/nav-bar.component";
import { Data } from '../../Services/data';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    PropertyList,
    FilterModalComponent,
    MainSearchBarComponent,
    NavBarComponent
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
  activePanel: string | null = null;

  // Location options for MainSearchBarComponent
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

    this.dataService.loadProperties();
    this.dataService.loadExperiences();
    this.dataService.loadServices();

    this.dataService.properties$.subscribe(props => {
      this.properties = props;
      this.filteredProperties = props;
      this.isLoading = false;
    });
  }

  // Handle panel opened from both components
  onPanelOpened(panel: string): void {
    console.log('Home: Panel opened:', panel);
    this.activePanel = panel;
  }

  // Handle filter button click
  onOpenFilters(): void {
    this.openFilters();
  }

  // Handle property type filters from NavBarComponent
  onNavBarFiltersChange(filters: any) {
    console.log('Home: NavBar filters received:', filters);
    // Merge with existing filters
    this.activeFilters = { ...this.activeFilters, ...filters };
    this.applyComplexFilters();
  }

  // Handle search filters from MainSearchBarComponent
  onSearchFiltersChanged(filters: any) {
    console.log('Home: Search filters received:', filters);
    // Merge with existing filters
    this.activeFilters = { ...this.activeFilters, ...filters };
    this.applyComplexFilters();
  }

  // Handle filtered properties from NavBarComponent
  onFilteredPropertiesChange(properties: RentalProperty[]) {
    console.log("Home: Received properties from NavBar:", properties.length);
    // Store these as the base for further filtering
    if (properties.length === 0) {
      this.filteredProperties = [...this.properties];
    } else {
      this.filteredProperties = properties;
    }
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
    console.log('Home: Filters applied from modal:', filters);
    this.activeFilters = { ...this.activeFilters, ...filters };
    this.applyComplexFilters();
    this.closeFilters();
  }

  // Apply all filters (from both components and modal)
  applyComplexFilters() {
    let filtered = [...this.properties];

    // Apply property type filter from NavBar
    if (this.activeFilters.propertyType && this.activeFilters.propertyType !== 'all') {
      filtered = filtered.filter(property => {
        switch (this.activeFilters.propertyType) {
          case 'property': return property.type === 'property';
          case 'experience': return property.type === 'experience';
          case 'service': return property.type === 'service';
          default: return true;
        }
      });
    }

    // Apply location filter from MainSearchBar
    if (this.activeFilters.location && this.activeFilters.location !== '' && this.activeFilters.location !== 'flexible') {
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

    // Apply dates filter from MainSearchBar
    if (this.activeFilters.dates?.start && this.activeFilters.dates?.end) {
      filtered = filtered.filter(property =>
        property.isAvailable !== false
      );
    }

    // Apply guests filter from MainSearchBar
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

    this.filteredProperties = filtered;
  }

  // Wishlist handler
  onWishlistChange(event: any) {
    console.log("Wish changed:", event);
    const { propertyId, isWishlisted, itemType } = event;
    const type = itemType || 'Property';
    
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

    if (this.activeFilters.propertyType && this.activeFilters.propertyType !== 'all') {
      const type = this.activeFilters.propertyType.charAt(0).toUpperCase() +
        this.activeFilters.propertyType.slice(1);
      return `${type} Listings`;
    }

    return 'All Available Stays';
  }

  onPropertyClick(property: RentalProperty) {
    console.log('Property clicked:', property);
  }
}