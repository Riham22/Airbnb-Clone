import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SearchComponent } from '../../Pages/search/search';




@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SearchComponent],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayoutComponent {
  currentFilters = {
    location: 'anywhere',
    dates: 'any-week',
    guests: 'any-guests'
  };

  onFiltersChange(filters: any) {
    this.currentFilters = { ...filters };
  }
}
