import { Component, OnInit } from '@angular/core';
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
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  properties: RentalProperty[] = [];
  filteredProperties: RentalProperty[] = [];
  activeFilters: any = {};
  isFilterModalOpen = false;
  selectedCategory: string = 'Icons';

  constructor(private dataService: Data) { }

  ngOnInit() {
    this.dataService.properties$.subscribe(props => {
      this.properties = props;
      this.filteredProperties = props;
    });
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
    // TODO: Filter properties by category
    // For now, just logging or mock filtering
  }

  openFilters() {
    this.isFilterModalOpen = true;
  }

  closeFilters() {
    this.isFilterModalOpen = false;
  }

  onApplyFilters(filters: any) {
    console.log('Filters applied:', filters);
    this.activeFilters = { ...this.activeFilters, ...filters };
    // TODO: Apply complex filtering logic here
  }

  onWishlistChange(event: any) {
    console.log("Wish changed:", event);
    // TODO: save to user profile / local storage
  }

  onActiveFiltersChange(filters: any) {
    console.log('Filters received:', filters);
    this.activeFilters = filters;
  }

  getResultsTitle(): string {
    if (this.filteredProperties.length === 0) {
      return 'No properties found';
    }

    if (this.activeFilters.location && this.activeFilters.location !== 'anywhere') {
      const location = this.activeFilters.location.charAt(0).toUpperCase() +
        this.activeFilters.location.slice(1);
      return `${location} Properties`;
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
  }
}
