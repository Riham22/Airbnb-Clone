import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
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
  styleUrl: './property-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PropertyCardComponent implements OnInit, OnChanges {
  @Input() property!: RentalProperty;

  @Output() cardClick = new EventEmitter<RentalProperty>();

  @Output() wishlistChange = new EventEmitter<{
    property: RentalProperty;
    isWishlisted: boolean;
  }>();

  // Boolean property for wishlist state
  isWishlisted: boolean = false;

  // Stable properties for random values
  randomDistance: string = '';
  instantBookStatus: boolean = false;
  showImageIndicators = true;

  constructor(
    private router: Router,
    private dataService: Data,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    // Initialize wishlist state from property
    this.updateWishlistState();
    this.initializeRandomValues();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Update wishlist state whenever the property input changes
    if (changes['property']) {
      this.updateWishlistState();
    }
  }

  private updateWishlistState() {
    if (this.property && this.property.id) {
      this.isWishlisted = this.property.isWishlisted ?? false;
      // Manually trigger change detection to avoid NG0100 error
      this.cdr.detectChanges();
    }
  }

  onCardClick() {
    const type = this.property['type'] || 'property';
    if (type === 'experience') {
      this.router.navigate(['/experience', this.property.id]);
    } else if (type === 'service') {
      this.router.navigate(['/service', this.property.id]);
    } else {
      this.router.navigate(['/property', this.property.id]);
    }
  }

  toggleWishlist(event: MouseEvent) {
    event.preventDefault(); // Prevent any default browser action
    event.stopPropagation(); // Stop bubbling to card click

    console.log('❤️ Toggling wishlist for property:', this.property.id);

    // Optimistically update the UI immediately
    const newState = !this.isWishlisted;
    this.isWishlisted = newState;

    // Determine item type
    let itemType = 'Property';
    if (this.property.type) {
      const typeLower = this.property.type.toLowerCase();
      if (typeLower === 'experience') itemType = 'Experience';
      else if (typeLower === 'service') itemType = 'Service';
    }

    // Call backend API
    this.dataService.toggleWishlist(itemType, this.property.id).subscribe({
      next: (response: any) => {
        // Update to actual state from server (in case it differs)
        this.isWishlisted = response.wishlisted;

        // IMPORTANT: Also update the property's isWishlisted field
        this.property.isWishlisted = response.wishlisted;

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

  handleImageError(event: any) {
    console.error('❌ Image failed to load:', this.property.imageUrl);
    console.log('Event details:', event);

    // Prevent infinite loop if fallback also fails (though local asset shouldn't)
    if (this.property.imageUrl !== 'assets/default-listing.jpg') {
      this.property.imageUrl = 'assets/default-listing.jpg';
    }
  }

  getSuperhostStatus(): boolean {
    // Mock superhost status - in real app this would come from your data
    return this.property.rating >= 4.8 && this.property.reviewCount > 50;
  }

  private initializeRandomValues() {
    // Calculate these once to avoid NG0100 errors
    const distances = ['2 miles away', '5 miles away', '10 miles away', '15 miles away'];
    this.randomDistance = distances[Math.floor(Math.random() * distances.length)];
    this.instantBookStatus = Math.random() > 0.3;
  }

  getDistance(): string {
    return this.randomDistance;
  }

  isInstantBook(): boolean {
    return this.instantBookStatus;
  }

  getImageIndicators(): any[] {
    return this.property.images ? new Array(this.property.images.length) : [];
  }
}
