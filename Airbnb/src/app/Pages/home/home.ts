import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyList } from '../../Components/property-list/property-list';
import { FilterModalComponent } from '../../Components/filter-modal/filter-modal.component';
import { MainSearchBarComponent } from "../../Components/main-search-bar-component/main-search-bar-component";
import { NavBarComponent } from "../../Components/nav-bar/nav-bar.component";
import { Data } from '../../Services/data';
import { combineLatest } from 'rxjs';

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
  allProperties: any[] = []; // تخزين جميع الـ properties من الـ API
  allExperiences: any[] = []; // تخزين جميع الـ experiences
  allServices: any[] = []; // تخزين جميع الـ services

  filteredProperties: any[] = []; // للعرض بعد الفلترة
  activeFilters: any = {};
  isFilterModalOpen = false;
  selectedCategory: string = 'All';
  isLoading = true;
  activePanel: string | null = null;

  // MainSearchBarComponent loads dynamic locations itself; no local static list required

  constructor(private dataService: Data) { }

  ngOnInit() {
    console.log('🏠 HomeComponent initialized');

    // استخدام combineLatest لجمع البيانات من جميع الـ Observables
    combineLatest([
      this.dataService.properties$,
      this.dataService.experiences$,
      this.dataService.services$
    ]).subscribe({
      next: ([properties, experiences, services]) => {
        console.log('📦 Data received:');
        console.log('Properties:', properties?.length);
        console.log('Experiences:', experiences?.length);
        console.log('Services:', services?.length);

        this.allProperties = properties || [];
        this.allExperiences = experiences || [];
        this.allServices = services || [];

        // دمج جميع الأنواع في مصفوفة واحدة للعرض
        const allListings = [
          ...this.allProperties,
          ...this.allExperiences,
          ...this.allServices
        ];

        console.log('Total listings:', allListings.length);

        if (allListings.length > 0) {
          console.log('First listing:', allListings[0]);
        }

        this.filteredProperties = allListings;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error loading data:', error);
        this.isLoading = false;
      }
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
  onFilteredPropertiesChange(properties: any[]) {
    console.log("Home: Received properties from NavBar:", properties?.length);
    // إذا أرسلت NavBar قائمة خالية، استخدم كل البيانات
    if (!properties || properties.length === 0) {
      this.applyComplexFilters(); // إعادة تطبيق الفلاتر
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
    console.log('🎯 Applying complex filters:', this.activeFilters);

    // دمج جميع الأنواع
    let allListings = [
      ...this.allProperties,
      ...this.allExperiences,
      ...this.allServices
    ];

    console.log('Total listings before filtering:', allListings.length);

    // Apply property type filter from NavBar
    if (this.activeFilters.propertyType && this.activeFilters.propertyType !== 'all') {
      console.log('Filtering by type:', this.activeFilters.propertyType);
      allListings = allListings.filter(listing => {
        return listing.type === this.activeFilters.propertyType;
      });
      console.log('After type filter:', allListings.length);
    }

    // Apply location filter from MainSearchBar
    if (this.activeFilters.location && this.activeFilters.location !== '' && this.activeFilters.location !== 'flexible') {
      console.log('Filtering by location:', this.activeFilters.location);
      allListings = allListings.filter(listing =>
        listing.location?.toLowerCase().includes(this.activeFilters.location.toLowerCase())
      );
      console.log('After location filter:', allListings.length);
    }

    // Apply price filter from modal
    if (this.activeFilters.minPrice || this.activeFilters.maxPrice) {
      const minPrice = this.activeFilters.minPrice || 0;
      const maxPrice = this.activeFilters.maxPrice || Infinity;
      console.log('Filtering by price:', minPrice, 'to', maxPrice);
      allListings = allListings.filter(listing =>
        listing.price >= minPrice && listing.price <= maxPrice
      );
      console.log('After price filter:', allListings.length);
    }

    // Apply dates filter from MainSearchBar
    if (this.activeFilters.dates?.start && this.activeFilters.dates?.end) {
      console.log('Filtering by dates');
      allListings = allListings.filter(listing =>
        listing.isAvailable !== false
      );
      console.log('After dates filter:', allListings.length);
    }

    // Apply guests filter from MainSearchBar
    if (this.activeFilters.guests?.adults || this.activeFilters.guests?.children) {
      const totalGuests = (this.activeFilters.guests.adults || 0) + (this.activeFilters.guests.children || 0);
      console.log('Filtering by guests:', totalGuests);
      allListings = allListings.filter(listing =>
        (listing.maxGuests ?? 0) >= totalGuests
      );
      console.log('After guests filter:', allListings.length);
    }

    // Apply amenities filter from modal
    if (this.activeFilters.amenities && this.activeFilters.amenities.length > 0) {
      console.log('Filtering by amenities:', this.activeFilters.amenities);
      allListings = allListings.filter(listing =>
        listing.amenities && this.activeFilters.amenities.every((amenity: string) =>
          listing.amenities.includes(amenity)
        )
      );
      console.log('After amenities filter:', allListings.length);
    }

    this.filteredProperties = allListings;
    console.log('Final filtered listings:', this.filteredProperties.length);

    // إذا لم توجد نتائج، أظهر رسالة في الكونسول
    if (this.filteredProperties.length === 0) {
      console.log('❌ No listings found after filtering');
      console.log('Active filters:', this.activeFilters);
      console.log('All properties:', this.allProperties.length);
      console.log('All experiences:', this.allExperiences.length);
      console.log('All services:', this.allServices.length);
    }
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
