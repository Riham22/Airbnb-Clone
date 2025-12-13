import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { SearchComponent } from '../../Pages/search/search';




@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SearchComponent],
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

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const url = event.urlAfterRedirects;
        this.showSearch = !url.includes('/auth') &&
          !url.includes('/forget-password') &&
          !url.match(/\/property\/\d+/) &&
          !url.match(/\/experience\/\d+/) &&
          !url.match(/\/service\/\d+/);
      }
    });
  }

  onFiltersChange(filters: any) {
    this.currentFilters = { ...filters };
  }
}
