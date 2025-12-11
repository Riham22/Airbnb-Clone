import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
<<<<<<< HEAD
import { NavBarComponent } from "../../Components/nav-bar/nav-bar.component";
=======
import { SearchComponent } from '../../Pages/search/search';
>>>>>>> 481bb34615c4b29b09b3b85bc66cb66f22dfc7df




@Component({
  selector: 'app-main-layout',
  standalone: true,
<<<<<<< HEAD
  imports: [CommonModule, RouterOutlet, NavBarComponent],
=======
  imports: [CommonModule, RouterOutlet, SearchComponent],
>>>>>>> 481bb34615c4b29b09b3b85bc66cb66f22dfc7df
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
