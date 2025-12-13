import { Component, Input, ElementRef, ViewChild, AfterViewInit, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RentalProperty } from '../../Models/rental-property';
import { PropertyCardComponent } from '../property-card/property-card';

@Component({
  selector: 'app-property-carousel',
  standalone: true,
  imports: [CommonModule, PropertyCardComponent],
  templateUrl: './property-carousel.html',
  styleUrls: ['./property-carousel.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PropertyCarousel implements OnChanges {
  @Input({ required: true }) properties: RentalProperty[] = [];
  @Input() title: string = 'Featured Properties';
  @Input() showControls: boolean = true;
  @Input() showType: boolean = false;
  // @Output() propertyClick = new EventEmitter<RentalProperty>();
  @Output() propertyClick = new EventEmitter<any>();
  @Output() wishlistChange = new EventEmitter<any>();
  @ViewChild('carouselContainer', { static: false }) carouselContainer!: ElementRef<HTMLDivElement>;

  ngOnInit() {
    console.log("CAROUSEL GOT:", this.properties);
  }


  ngOnChanges(changes: SimpleChanges) {
    if (changes['properties']) {
      // Logic if needed on change
    }
  }

  // checkScrollStatus, scrollLeft, scrollRight removed as we are now using grid layout

  //  @Output() propertyClick = new EventEmitter<RentalProperty>();

  onPropertyClick(p: RentalProperty) {
    this.propertyClick.emit(p);
  }


  onWishlistChange(event: { property: RentalProperty; isWishlisted: boolean }) {
    this.wishlistChange.emit(event);
  }


  trackByPropertyId(index: number, property: RentalProperty): number {
    return property.id;
  }
}
