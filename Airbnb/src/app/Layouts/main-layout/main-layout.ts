import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavBarComponent } from "../../Components/nav-bar/nav-bar.component";
import { SearchComponent } from '../../Pages/search/search';




import { Data } from '../../Services/data';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavBarComponent, SearchComponent],

  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayoutComponent {
  showSearch = true;

  currentFilters = {
    location: 'anywhere',
    dates: 'any-week',
    guests: 'any-guests'
  };

  @ViewChild(SearchComponent) searchComponent!: SearchComponent;

  constructor(private router: Router, private dataService: Data) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const url = event.urlAfterRedirects;
        this.showSearch = !url.includes('/auth') && !url.includes('/forget-password');

        // Reset filters when navigating to home
        if (url === '/' && this.searchComponent) {
          this.searchComponent.resetFilters();
        }
      }
    });
  }

  onFiltersChange(filters: any) {
    this.currentFilters = { ...filters };
    this.dataService.updateFilters(filters);
  }
}
