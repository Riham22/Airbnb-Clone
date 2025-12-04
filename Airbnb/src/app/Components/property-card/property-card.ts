import { Component, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { RentalProperty } from '../../Models/rental-property';
import { Router } from '@angular/router';
import { Data } from '../../Services/data';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-property-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './property-card.html',
  styleUrl: './property-card.css'
})
export class PropertyCardComponent implements AfterViewInit {
  @Input() property!: RentalProperty;

  @Output() cardClick = new EventEmitter<RentalProperty>();

  @Output() wishlistChange = new EventEmitter<{
    property: RentalProperty;
    isWishlisted: boolean;
  }>();

  // Boolean property for wishlist state
  isWishlisted: boolean = false;

  constructor(
    private router: Router,
    private dataService: Data
  ) { }

  ngAfterViewInit() {
    // Initialize from property data in next tick to avoid change detection errors
    setTimeout(() => {
      if (this.property && this.property.id) {
        this.isWishlisted = this.property.isWishlisted ?? false;
      }
    }, 0);
  }

  onCardClick() {
    this.router.navigate(['/property', this.property.id]);
  }

  toggleWishlist(event: MouseEvent) {
    event.stopPropagation();

    console.log('❤️ Toggling wishlist for property:', this.property.id);

    // Optimistically update the UI immediately
    const newState = !this.isWishlisted;
    this.isWishlisted = newState;

    // Call backend API
    this.dataService.toggleWishlist('Property', this.property.id).subscribe({
      next: (response: any) => {
        // Update to actual state from server (in case it differs)
        this.isWishlisted = response.wishlisted;
        console.log('✅ Wishlist updated:', response);

        this.wishlistChange.emit({
          property: this.property,
          isWishlisted: response.wishlisted
        });
      },
      error: (err) => {
        // Revert on error
        this.isWishlisted = !newState;
        console.error('❌ Error toggling wishlist:', err);
      }
    });
  }

  handleImageError() {
    this.property.imageUrl = 'assets/fallback.jpg';
  }

  getSuperhostStatus(): boolean {
    // Mock superhost status - in real app this would come from your data
    return this.property.rating >= 4.8 && this.property.reviewCount > 50;
  }

  getDistance(): string {
    // Mock distance - in real app this would be calculated
    const distances = ['2 miles away', '5 miles away', '10 miles away', '15 miles away'];
    return distances[Math.floor(Math.random() * distances.length)];
  }

  isInstantBook(): boolean {
    // Mock instant book status
    return Math.random() > 0.3;
  }

  showImageIndicators = true;

  getImageIndicators(): any[] {
    return this.property.images ? new Array(this.property.images.length) : [];
  }
}
