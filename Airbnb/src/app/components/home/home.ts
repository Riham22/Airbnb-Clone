import { Component } from '@angular/core';
import { CarouselComponent } from "../carousel/carousel";
import { SearchBarComponent } from "../searchbar/searchbar";
import { Filtersbar } from "../filtersbar/filtersbar";
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgFor, CarouselComponent, SearchBarComponent, Filtersbar],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent {

  continueLocation = 'New Cairo';

  listings = [
    { title: "Hotel Cairo", price: 900, location: 'Cairo', guests: 2 },
    { title: "Luxury Villa", price: 2100, location: 'New Cairo', guests: 4 },
    { title: "Cozy Flat", price: 700, location: 'Giza', guests: 3 },
  ];

  filteredListings = [...this.listings];

  sampleStays = [
    { title: 'Apartment in First Nasr City Qism', meta: '2 beds • 1 bath • 4.9', price: 2205, image: 'assets/img1.jpg' },
    { title: 'Room in First New Cairo Qism', meta: 'Private room • 1 bed • 5.0', price: 2419, image: 'assets/img2.jpg' },
    { title: 'Loft in New Cairo', meta: 'Entire place • 2 beds • 4.95', price: 4441, image: 'assets/img3.jpg' },
    { title: 'Apartment in First New Cairo Qism', meta: 'Entire place • 3 beds • 5.0', price: 3280, image: 'assets/img4.jpg' },
    { title: 'Apartment in New Cairo', meta: '2 beds • 5.0', price: 2849, image: 'assets/img5.jpg' },
    { title: 'Room in First New Cairo Qism', meta: 'Private room • 1 bed • 4.94', price: 2850, image: 'assets/img6.jpg' }
  ];

  sampleSimilar = [
    { title: 'Cozy Studio', meta: 'Studio • 1 bath', price: 900, image: 'assets/img7.jpg' },
    { title: 'Modern Flat', meta: '2 beds • 2 baths', price: 1200, image: 'assets/img8.jpg' },
    { title: 'Sea View', meta: 'Entire place', price: 2000, image: 'assets/img9.jpg' }
  ];

  // -----------------
  // Receive search payload from search bar
  // -----------------
  onSearch(payload: any) {
    console.log("Search payload received:", payload);

    const { location, guests } = payload;

    this.filteredListings = this.listings.filter(item =>
      (!location || item.location.toLowerCase().includes(location.toLowerCase())) &&
      (!guests || item.guests >= guests)
    );
  }

  // -----------------
  // Receive filter from filter bar
  // -----------------
  onFilter(filter: string) {
    console.log("Filter clicked:", filter);

    switch (filter) {
      case 'price_low':
        this.filteredListings = [...this.filteredListings].sort((a, b) => a.price - b.price);
        break;

      case 'price_high':
        this.filteredListings = [...this.filteredListings].sort((a, b) => b.price - a.price);
        break;

      default:
        this.filteredListings = [...this.listings];
        break;
    }
  }
}
