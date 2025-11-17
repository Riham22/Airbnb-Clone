import { Component } from '@angular/core';
import { Navbar } from "../../components/navbar/navbar";
import { RouterOutlet } from "@angular/router";
import { Footer } from "../../components/footer/footer";
import { SearchBarComponent } from "../../components/searchbar/searchbar";
import { Filtersbar } from "../../components/filtersbar/filtersbar";
import { HomeComponent } from "../../components/home/home";

interface Listing {
  id: number;
  title: string;
  location: string;
  price: number;
  guests: number;
  image: string;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    Navbar,
    RouterOutlet,
    Footer,
    SearchBarComponent,
    Filtersbar,
    HomeComponent
],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {

  // ==========================
  //      MOCK DATA
  // ==========================
  listings: Listing[] = [
    { id: 1, title: "Modern Apartment", location: "Cairo", price: 900, guests: 2, image: "assets/img1.jpg" },
    { id: 2, title: "Cozy Studio", location: "Giza", price: 700, guests: 3, image: "assets/img2.jpg" },
    { id: 3, title: "Luxury Villa", location: "Alexandria", price: 1500, guests: 5, image: "assets/img3.jpg" },
  ];

  filteredListings: Listing[] = [...this.listings];

  constructor() {}

  // ==========================
  //        SEARCH LOGIC
  // ==========================
  onSearch(payload: any) {
    console.log("Search payload:", payload);

    const { where, checkIn, checkOut, guests } = payload;

    // -------- MOCK FILTERING --------
    this.filteredListings = this.listings.filter(item =>
      (!where || item.location.toLowerCase().includes(where.toLowerCase())) &&
      (!guests || item.guests >= guests)
    );

    // -------- DYNAMIC API (comment if not needed) --------
    /*
    this.searchService.search(payload).subscribe(res => {
      this.filteredListings = res.data;
    });
    */
  }

  // ==========================
  //        FILTER LOGIC
  // ==========================
  onFilter(filter: string) {
    console.log("Filter selected:", filter);

    switch (filter) {
      case 'price_low':
        this.filteredListings = [...this.filteredListings].sort((a, b) => a.price - b.price);
        break;

      case 'price_high':
        this.filteredListings = [...this.filteredListings].sort((a, b) => b.price - a.price);
        break;

      case 'top_rated':
        // لو عندك rating استخدميها هنا
        break;

      default:
        this.filteredListings = [...this.listings];
        break;
    }

    // -------- API version (optional) --------
    /*
    this.filterService.apply(filter).subscribe(res => {
      this.filteredListings = res.data;
    });
    */
  }
}
