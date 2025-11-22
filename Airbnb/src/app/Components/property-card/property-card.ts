import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RentalProperty } from '../../Models/rental-property';
import { Router } from '@angular/router';

@Component({
  selector: 'app-property-card',
  standalone: true,
  templateUrl: './property-card.html',
  styleUrl: './property-card.css'
})
export class PropertyCardComponent {
  @Input() property!: RentalProperty;

  @Output() cardClick = new EventEmitter<RentalProperty>();

  @Output() wishlistChange = new EventEmitter<{
    property: RentalProperty;
    isWishlisted: boolean;
  }>();
  constructor(private router: Router) {}

  isWishlisted = false;

   onCardClick() {

    this.router.navigate(['/property', this.property.id]);
   }

  toggleWishlist(event: MouseEvent) {
    event.stopPropagation();
    this.isWishlisted = !this.isWishlisted;

    this.wishlistChange.emit({
      property: this.property,
      isWishlisted: this.isWishlisted
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
}
