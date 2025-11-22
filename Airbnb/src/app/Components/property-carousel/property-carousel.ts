import { Component, Input, ElementRef, ViewChild, AfterViewInit, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RentalProperty } from '../../Models/rental-property';
import { PropertyCardComponent } from '../property-card/property-card';

@Component({
  selector: 'app-property-carousel',
  standalone: true,
  imports: [CommonModule, PropertyCardComponent],
  templateUrl: './property-carousel.html',
  styleUrls: ['./property-carousel.css']   // ← كانت styleUrl (خطأ) — صلّحتها
})
export class PropertyCarousel implements AfterViewInit, OnChanges {
  @Input({ required: true }) properties: RentalProperty[] = [];
  @Input() title: string = 'Featured Properties';
  @Input() showControls: boolean = true;
@Input() showType: boolean = false;
  // @Output() propertyClick = new EventEmitter<RentalProperty>();
@Output() propertyClick = new EventEmitter<any>();
  @Output() wishlistChange = new EventEmitter<any>();
  @ViewChild('carouselContainer', { static: false }) carouselContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('carouselTrack', { static: false }) carouselTrack!: ElementRef<HTMLDivElement>;
  ngOnInit() {
  console.log("CAROUSEL GOT:", this.properties);
}

  canScrollLeft = false;
  canScrollRight = false;

  ngAfterViewInit() {
    setTimeout(() => this.checkScrollStatus(), 100);
    window.addEventListener('resize', () => this.checkScrollStatus());
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['properties']) {
      setTimeout(() => this.checkScrollStatus(), 150);
    }
  }

  checkScrollStatus() {
    if (this.carouselContainer?.nativeElement && this.carouselTrack?.nativeElement) {
      const container = this.carouselContainer.nativeElement;
      const track = this.carouselTrack.nativeElement;

      const containerWidth = container.clientWidth;
      const trackWidth = track.scrollWidth;
      const scrollLeft = container.scrollLeft;

      this.canScrollLeft = scrollLeft > 10;
      this.canScrollRight = (scrollLeft + containerWidth) < (trackWidth - 10);
    }
  }

  scrollLeft() {
    if (this.carouselContainer?.nativeElement) {
      const container = this.carouselContainer.nativeElement;
      const scrollAmount = Math.min(container.clientWidth * 0.8, container.scrollLeft);
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      setTimeout(() => this.checkScrollStatus(), 400);
    }
  }

  scrollRight() {
    if (this.carouselContainer?.nativeElement) {
      const container = this.carouselContainer.nativeElement;
      const scrollAmount = container.clientWidth * 0.8;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(() => this.checkScrollStatus(), 400);
    }
  }

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
