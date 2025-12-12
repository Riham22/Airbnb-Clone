// import { Component, Output, EventEmitter, OnInit, Input, HostListener } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Router, RouterModule } from '@angular/router';
// import { Data } from '../../Services/data';
// import { AuthService } from '../../Services/auth';
// import { BehaviorSubject, combineLatest, map } from 'rxjs';
// import { RentalProperty } from '../../Models/rental-property';
// import { Experience } from '../../Models/experience';
// import { Service } from '../../Models/service';
// import { GuestCounts } from '../../Models/guest-counts';
// import { DateRange } from '../../Models/DateRange';
// import { MainSearchBarComponent } from '../main-search-bar-component/main-search-bar-component';


// // Menu item type definition
// export type MenuItem =
//   | { label: string; icon: string; route: string; action?: never; separator?: never }
//   | { label: string; icon: string; action: string; route?: never; separator?: never }
//   | { separator: true; label?: never; icon?: never; route?: never; action?: never };

// @Component({
//   selector: 'app-nav-bar',
//   standalone: true,
//   imports: [CommonModule, FormsModule, RouterModule, MainSearchBarComponent],
//   templateUrl: './nav-bar.component.html',
//   styleUrls: ['./nav-bar.component.css']
// })
// export class NavBarComponent implements OnInit {
//   @Output() filteredPropertiesChange = new EventEmitter<any[]>();
//   @Output() activeFiltersChange = new EventEmitter<any>();
//   @Output() openFilters = new EventEmitter<void>();

//   // Data collections
//   private properties: RentalProperty[] = [];
//   private experiences: Experience[] = [];
//   private services: Service[] = [];

//   // Filter subjects for RxJS
//   private guestFilter$ = new BehaviorSubject<GuestCounts | null>(null);
//   private locationFilter$ = new BehaviorSubject<string>('');
//   private dateFilter$ = new BehaviorSubject<DateRange>({ start: null, end: null, flexible: false });
//   private propertyTypeFilter$ = new BehaviorSubject<string>('all');

//  // In your component.ts file, update the propertyTypes array:
// propertyTypes = [
//   {
//     value: 'all',
//     label: 'All',
//     icon: `<svg class="type-icon" viewBox="0 0 24 24" fill="currentColor">
//       <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
//     </svg>`
//   },
//   {
//     value: 'service',
//     label: 'Service',
//     icon: `<svg class="type-icon" viewBox="0 0 24 24" fill="currentColor">
//       <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29l-1.43-1.43z"></path>
//     </svg>`
//   },
//   {
//     value: 'experience',
//     label: 'Experience',
//     icon: `<svg class="type-icon" viewBox="0 0 24 24" fill="currentColor">
//       <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"></path>
//     </svg>`
//   }
// ];

// // Update menuItems with Font Awesome icons:
// menuItems = [
//   {
//     label: 'My Trips',
//     icon: `<i class="fas fa-suitcase-rolling"></i>`,
//     action: 'trips'
//   },
//   {
//     label: 'Wishlists',
//     icon: `<i class="fas fa-heart"></i>`,
//     action: 'wishlists'
//   },
//   {
//     label: 'Messages',
//     icon: `<i class="fas fa-comments"></i>`,
//     action: 'messages'
//   },
//   {
//     label: 'Notifications',
//     icon: `<i class="fas fa-bell"></i>`,
//     action: 'notifications'
//   },
//   { separator: true },
//   {
//     label: 'Host your home',
//     icon: `<i class="fas fa-home"></i>`,
//     action: 'host'
//   },
//   {
//     label: 'Host an experience',
//     icon: `<i class="fas fa-star"></i>`,
//     action: 'experience'
//   },
//   {
//     label: 'Account settings',
//     icon: `<i class="fas fa-user-cog"></i>`,
//     action: 'settings'
//   },
//   { separator: true },
//   {
//     label: 'Help Center',
//     icon: `<i class="fas fa-question-circle"></i>`,
//     action: 'help'
//   }
// ];

//   selectedPropertyType = 'all';

//   // Current filters for search bar
//   currentSearchFilters = {
//     location: '',
//     dates: { start: null as Date | null, end: null as Date | null, flexible: false } as DateRange,
//     guests: { adults: 0, children: 0, infants: 0, pets: 0 }
//   };

//   // Location options for search bar
//   locationOptions = [
//     { value: 'flexible', label: "I'm flexible", icon: '🌍', description: 'Discover unique stays' },
//     { value: 'new_york', label: 'New York', icon: '🏙️', description: 'Big Apple adventures' },
//     { value: 'los_angeles', label: 'Los Angeles', icon: '🌴', description: 'Sunny California' },
//     { value: 'miami', label: 'Miami', icon: '🏖️', description: 'Beachfront escapes' },
//     { value: 'chicago', label: 'Chicago', icon: '🏙️', description: 'Windy City stays' },
//     { value: 'las_vegas', label: 'Las Vegas', icon: '🎰', description: 'Entertainment capital' },
//     { value: 'san_francisco', label: 'San Francisco', icon: '🌉', description: 'Golden Gate views' },
//     { value: 'seattle', label: 'Seattle', icon: '🌧️', description: 'Pacific Northwest' },
//     { value: 'austin', label: 'Austin', icon: '🎸', description: 'Live music capital' },
//     { value: 'boston', label: 'Boston', icon: '🎓', description: 'Historic charm' }
//   ];

//   // Auth state
//   isAuthenticated = false;
//   currentUser: any = null;


//   showMenuPanel = false;

//   // Mobile responsiveness
//   isMobileView = false;

//   constructor(
//     private dataService: Data,
//     private router: Router,
//     private authService: AuthService
//   ) { }

//   ngOnInit(): void {
//     this.loadAllData();
//     this.checkMobileView();
//     this.setupFilterObservables();
//     this.setupAuthObservables();
//   }

//   // ========== PROPERTY TYPE METHODS ==========
//   selectPropertyType(type: string): void {
//     this.selectedPropertyType = type;
//     this.propertyTypeFilter$.next(type);
//     this.activeFiltersChange.emit(this.getAllFilters());
//   }

//   // ========== SEARCH BAR METHODS ==========
//   onSearchFiltersChanged(filters: any): void {
//     this.currentSearchFilters = filters;
//     this.locationFilter$.next(filters.location);
//     this.dateFilter$.next(filters.dates);

//     const guestCounts: GuestCounts = {
//       adults: filters.guests.adults,
//       children: filters.guests.children,
//       infants: filters.guests.infants,
//       pets: filters.guests.pets,
//       totalGuests: filters.guests.adults + filters.guests.children
//     };

//     this.guestFilter$.next(guestCounts.totalGuests > 0 ? guestCounts : null);
//     this.activeFiltersChange.emit(this.getAllFilters());
//   }

//   private getAllFilters(): any {
//     return {
//       propertyType: this.selectedPropertyType,
//       location: this.currentSearchFilters.location,
//       dates: this.currentSearchFilters.dates,
//       guests: this.currentSearchFilters.guests
//     };
//   }

//   // ========== AUTH & MENU METHODS ==========
//   toggleLanguagePanel(): void {

//     this.showMenuPanel = false;
//   }




//   toggleMenuPanel(): void {
//     this.showMenuPanel = !this.showMenuPanel;

//   }

//   closeAllPanels(): void {

//     this.showMenuPanel = false;
//   }

//   onMenuItemClick(item: any): void {
//     this.showMenuPanel = false;

//     if (item.action === 'logout') {
//       this.logout();
//       return;
//     }

//     if (item.route) {
//       this.router.navigate([item.route]);
//     }
//   }

//   logout(): void {
//     this.authService.logout();
//     this.router.navigate(['/']);
//   }

//   // ========== USER DISPLAY METHODS ==========
//   getUserDisplayName(): string {
//     if (this.isAuthenticated && this.currentUser) {
//       return `${this.currentUser.firstName} ${this.currentUser.lastName?.charAt(0)}.`;
//     }
//     return 'Log in';
//   }

//   getUserInitials(): string {
//     if (this.isAuthenticated && this.currentUser) {
//       const first = this.currentUser.firstName?.charAt(0) || '';
//       const last = this.currentUser.lastName?.charAt(0) || '';
//       return (first + last).toUpperCase();
//     }
//     return '👤';
//   }

//   // ========== PRIVATE HELPER METHODS ==========
//   private setupFilterObservables(): void {
//     combineLatest([
//       this.locationFilter$,
//       this.dateFilter$,
//       this.guestFilter$,
//       this.propertyTypeFilter$
//     ]).pipe(
//       map(([location, dates, guestCounts, propertyType]) => {
//         const allListings = this.getAllListings();
//         return this.applyAllFilters(allListings, { location, dates, guestCounts, propertyType });
//       })
//     ).subscribe(filteredProperties => {
//       this.filteredPropertiesChange.emit(filteredProperties);
//     });

//     this.activeFiltersChange.emit(this.getAllFilters());
//     const initialListings = this.getAllListings();
//     this.filteredPropertiesChange.emit(initialListings);
//   }

//   private setupAuthObservables(): void {
//     this.authService.isAuthenticated$.subscribe(isAuth => {
//       this.isAuthenticated = isAuth;
//     });

//     this.authService.currentUser$.subscribe(user => {
//       this.currentUser = user;
//     });

//     this.authService.checkAuthentication();
//   }

//   private loadAllData(): void {
//     this.dataService.properties$.subscribe(props => {
//       this.properties = props;
//       this.updateAndEmitListings();
//     });

//     this.dataService.experiences$.subscribe(exps => {
//       this.experiences = exps;
//       this.updateAndEmitListings();
//     });

//     this.dataService.services$.subscribe(svcs => {
//       this.services = svcs;
//       this.updateAndEmitListings();
//     });
//   }

//   private updateAndEmitListings(): void {
//     this.filteredPropertiesChange.emit(this.getAllListings());
//   }

//   private getAllListings(): any[] {
//     return [...this.properties, ...this.experiences, ...this.services];
//   }

//   private applyAllFilters(listings: any[], filters: any): any[] {
//     return listings.filter(listing => {
//       // Property type filter
//       if (filters.propertyType && filters.propertyType !== 'all') {
//         if (!this.matchesPropertyType(listing, filters.propertyType)) {
//           return false;
//         }
//       }

//       // Location filter
//       if (filters.location && filters.location !== '' && filters.location !== 'flexible') {
//         if (!this.isListingInLocation(listing, filters.location)) {
//           return false;
//         }
//       }

//       // Date filter
//       if (filters.dates.start && filters.dates.end && !this.isListingAvailable(listing, filters.dates.start, filters.dates.end)) {
//         return false;
//       }

//       // Guest filter
//       if (filters.guestCounts && filters.guestCounts.totalGuests > 0) {
//         if (listing.type === 'property' && listing.maxGuests < filters.guestCounts.totalGuests) {
//           return false;
//         }
//         if (listing.type === 'experience' && listing.maxParticipants < filters.guestCounts.totalGuests) {
//           return false;
//         }
//       }

//       return true;
//     });
//   }

//   private matchesPropertyType(listing: any, propertyType: string): boolean {
//     switch (propertyType) {
//       case 'property': return listing.type === 'property';
//       case 'experience': return listing.type === 'experience';
//       case 'service': return listing.type === 'service';
//       default: return true; // 'all' case
//     }
//   }

//   private isListingInLocation(listing: any, location: string): boolean {
//     const locationMap: { [key: string]: string[] } = {
//       'new_york': ['New York', 'NY', 'New York City'],
//       'los_angeles': ['Los Angeles', 'LA', 'California', 'Malibu'],
//       'miami': ['Miami', 'Florida'],
//       'chicago': ['Chicago', 'Illinois'],
//       'las_vegas': ['Las Vegas', 'Nevada'],
//       'san_francisco': ['San Francisco', 'SF'],
//       'seattle': ['Seattle', 'Washington'],
//       'austin': ['Austin', 'Texas'],
//       'boston': ['Boston', 'Massachusetts']
//     };

//     const searchTerms = locationMap[location] || [location];
//     return searchTerms.some(term =>
//       listing.location.toLowerCase().includes(term.toLowerCase())
//     );
//   }

//   private isListingAvailable(listing: any, start: Date, end: Date): boolean {
//     return Math.random() > 0.2; // Mock availability
//   }

//   private checkMobileView(): void {
//     this.isMobileView = window.innerWidth < 768;
//   }

//   @HostListener('window:resize', ['$event'])
//   onResize(event: any) {
//     this.checkMobileView();
//   }



// }
import { Component, Output, EventEmitter, OnInit, Input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Data } from '../../Services/data';
import { AuthService } from '../../Services/auth';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { RentalProperty } from '../../Models/rental-property';
import { Experience } from '../../Models/experience';
import { Service } from '../../Models/service';
import { GuestCounts } from '../../Models/guest-counts';
import { DateRange } from '../../Models/DateRange';
import { MainSearchBarComponent } from '../main-search-bar-component/main-search-bar-component';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MainSearchBarComponent],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit {
  @Output() filteredPropertiesChange = new EventEmitter<any[]>();
  @Output() activeFiltersChange = new EventEmitter<any>();
  @Output() openFilters = new EventEmitter<void>();

  // Data collections
  private properties: RentalProperty[] = [];
  private experiences: Experience[] = [];
  private services: Service[] = [];

  // Filter subjects for RxJS
  private guestFilter$ = new BehaviorSubject<GuestCounts | null>(null);
  private locationFilter$ = new BehaviorSubject<string>('');
  private dateFilter$ = new BehaviorSubject<DateRange>({ start: null, end: null, flexible: false });
  private propertyTypeFilter$ = new BehaviorSubject<string>('all');

  // Property types
  propertyTypes = [
    { value: 'all', label: 'All' },
    { value: 'service', label: 'Service' },
    { value: 'experience', label: 'Experience' }
  ];

  selectedPropertyType = 'all';

  // Current filters for search bar
  currentSearchFilters = {
    location: '',
    dates: { start: null as Date | null, end: null as Date | null, flexible: false } as DateRange,
    guests: { adults: 0, children: 0, infants: 0, pets: 0 }
  };

  // Location options for search bar
  locationOptions = [
    { value: 'flexible', label: "I'm flexible", icon: '🌍', description: 'Discover unique stays' },
    { value: 'new_york', label: 'New York', icon: '🏙️', description: 'Big Apple adventures' },
    { value: 'los_angeles', label: 'Los Angeles', icon: '🌴', description: 'Sunny California' },
    { value: 'miami', label: 'Miami', icon: '🏖️', description: 'Beachfront escapes' },
    { value: 'chicago', label: 'Chicago', icon: '🏙️', description: 'Windy City stays' },
    { value: 'las_vegas', label: 'Las Vegas', icon: '🎰', description: 'Entertainment capital' },
    { value: 'san_francisco', label: 'San Francisco', icon: '🌉', description: 'Golden Gate views' },
    { value: 'seattle', label: 'Seattle', icon: '🌧️', description: 'Pacific Northwest' },
    { value: 'austin', label: 'Austin', icon: '🎸', description: 'Live music capital' },
    { value: 'boston', label: 'Boston', icon: '🎓', description: 'Historic charm' }
  ];

  // Auth state
  isAuthenticated = false;
  currentUser: any = null;
  showMenuPanel = false;

  // Mobile responsiveness
  isMobileView = false;

  constructor(
    private dataService: Data,
    public router: Router, // جعلها public للاستخدام في HTML
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadAllData();
    this.checkMobileView();
    this.setupFilterObservables();
    this.setupAuthObservables();
  }

  // ========== PROPERTY TYPE METHODS ==========
  selectPropertyType(type: string): void {
    this.selectedPropertyType = type;
    this.propertyTypeFilter$.next(type);
    this.activeFiltersChange.emit(this.getAllFilters());
  }

  // دالة للحصول على أيقونات الـ property types
  getPropertyTypeIcon(type: string): string {
    switch(type) {
      case 'all':
        return `<svg class="type-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
        </svg>`;
      case 'service':
        return `<svg class="type-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29l-1.43-1.43z"/>
        </svg>`;
      case 'experience':
        return `<svg class="type-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>`;
      default:
        return '';
    }
  }

  // ========== SEARCH BAR METHODS ==========
  onSearchFiltersChanged(filters: any): void {
    this.currentSearchFilters = filters;
    this.locationFilter$.next(filters.location);
    this.dateFilter$.next(filters.dates);

    const guestCounts: GuestCounts = {
      adults: filters.guests.adults,
      children: filters.guests.children,
      infants: filters.guests.infants,
      pets: filters.guests.pets,
      totalGuests: filters.guests.adults + filters.guests.children
    };

    this.guestFilter$.next(guestCounts.totalGuests > 0 ? guestCounts : null);
    this.activeFiltersChange.emit(this.getAllFilters());
  }

  private getAllFilters(): any {
    return {
      propertyType: this.selectedPropertyType,
      location: this.currentSearchFilters.location,
      dates: this.currentSearchFilters.dates,
      guests: this.currentSearchFilters.guests
    };
  }

  // ========== AUTH & MENU METHODS ==========
  toggleMenuPanel(): void {
    this.showMenuPanel = !this.showMenuPanel;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
    this.showMenuPanel = false;
  }

  // ========== USER DISPLAY METHODS ==========
  getUserDisplayName(): string {
    if (this.isAuthenticated && this.currentUser) {
      return `${this.currentUser.firstName} ${this.currentUser.lastName?.charAt(0)}.`;
    }
    return 'Log in';
  }

  getUserInitials(): string {
    if (this.isAuthenticated && this.currentUser) {
      const first = this.currentUser.firstName?.charAt(0) || '';
      const last = this.currentUser.lastName?.charAt(0) || '';
      return (first + last).toUpperCase();
    }
    return '👤';
  }

  // ========== PRIVATE HELPER METHODS ==========
  private setupFilterObservables(): void {
    combineLatest([
      this.locationFilter$,
      this.dateFilter$,
      this.guestFilter$,
      this.propertyTypeFilter$
    ]).pipe(
      map(([location, dates, guestCounts, propertyType]) => {
        const allListings = this.getAllListings();
        return this.applyAllFilters(allListings, { location, dates, guestCounts, propertyType });
      })
    ).subscribe(filteredProperties => {
      this.filteredPropertiesChange.emit(filteredProperties);
    });

    this.activeFiltersChange.emit(this.getAllFilters());
    const initialListings = this.getAllListings();
    this.filteredPropertiesChange.emit(initialListings);
  }

  private setupAuthObservables(): void {
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
    });

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.authService.checkAuthentication();
  }

  private loadAllData(): void {
    this.dataService.properties$.subscribe(props => {
      this.properties = props;
      this.updateAndEmitListings();
    });

    this.dataService.experiences$.subscribe(exps => {
      this.experiences = exps;
      this.updateAndEmitListings();
    });

    this.dataService.services$.subscribe(svcs => {
      this.services = svcs;
      this.updateAndEmitListings();
    });
  }

  private updateAndEmitListings(): void {
    this.filteredPropertiesChange.emit(this.getAllListings());
  }

  private getAllListings(): any[] {
    return [...this.properties, ...this.experiences, ...this.services];
  }

  private applyAllFilters(listings: any[], filters: any): any[] {
    return listings.filter(listing => {
      // Property type filter
      if (filters.propertyType && filters.propertyType !== 'all') {
        if (!this.matchesPropertyType(listing, filters.propertyType)) {
          return false;
        }
      }

      // Location filter
      if (filters.location && filters.location !== '' && filters.location !== 'flexible') {
        if (!this.isListingInLocation(listing, filters.location)) {
          return false;
        }
      }

      // Date filter
      if (filters.dates.start && filters.dates.end && !this.isListingAvailable(listing, filters.dates.start, filters.dates.end)) {
        return false;
      }

      // Guest filter
      if (filters.guestCounts && filters.guestCounts.totalGuests > 0) {
        if (listing.type === 'property' && listing.maxGuests < filters.guestCounts.totalGuests) {
          return false;
        }
        if (listing.type === 'experience' && listing.maxParticipants < filters.guestCounts.totalGuests) {
          return false;
        }
      }

      return true;
    });
  }

  private matchesPropertyType(listing: any, propertyType: string): boolean {
    switch (propertyType) {
      case 'property': return listing.type === 'property';
      case 'experience': return listing.type === 'experience';
      case 'service': return listing.type === 'service';
      default: return true; // 'all' case
    }
  }

  private isListingInLocation(listing: any, location: string): boolean {
    const locationMap: { [key: string]: string[] } = {
      'new_york': ['New York', 'NY', 'New York City'],
      'los_angeles': ['Los Angeles', 'LA', 'California', 'Malibu'],
      'miami': ['Miami', 'Florida'],
      'chicago': ['Chicago', 'Illinois'],
      'las_vegas': ['Las Vegas', 'Nevada'],
      'san_francisco': ['San Francisco', 'SF'],
      'seattle': ['Seattle', 'Washington'],
      'austin': ['Austin', 'Texas'],
      'boston': ['Boston', 'Massachusetts']
    };

    const searchTerms = locationMap[location] || [location];
    return searchTerms.some(term =>
      listing.location.toLowerCase().includes(term.toLowerCase())
    );
  }

  private isListingAvailable(listing: any, start: Date, end: Date): boolean {
    return Math.random() > 0.2; // Mock availability
  }

  private checkMobileView(): void {
    this.isMobileView = window.innerWidth < 768;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkMobileView();
  }
}
