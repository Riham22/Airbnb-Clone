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


// Menu item type definition
export type MenuItem =
  | { label: string; icon: string; route: string; action?: never; separator?: never }
  | { label: string; icon: string; action: string; route?: never; separator?: never }
  | { separator: true; label?: never; icon?: never; route?: never; action?: never };

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

  // Property types for UI
  propertyTypes = [
    { value: 'all', label: 'All', icon: '🏠' },
    { value: 'property', label: 'Properties', icon: '🏡' },
    { value: 'experience', label: 'Experiences', icon: '🌟' },
    { value: 'service', label: 'Services', icon: '🔧' }
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

  // Menu
  languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' }
  ];
  selectedLanguage = this.languages[0];
  showLanguagePanel = false;
  showMenuPanel = false;

  // Mobile responsiveness
  isMobileView = false;

  constructor(
    private dataService: Data,
    private router: Router,
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
  toggleLanguagePanel(): void {
    this.showLanguagePanel = !this.showLanguagePanel;
    this.showMenuPanel = false;
  }

  selectLanguage(language: any): void {
    this.selectedLanguage = language;
    this.showLanguagePanel = false;
  }

  toggleMenuPanel(): void {
    this.showMenuPanel = !this.showMenuPanel;
    this.showLanguagePanel = false;
  }

  closeAllPanels(): void {
    this.showLanguagePanel = false;
    this.showMenuPanel = false;
  }

  onMenuItemClick(item: any): void {
    this.showMenuPanel = false;

    if (item.action === 'logout') {
      this.logout();
      return;
    }

    if (item.route) {
      this.router.navigate([item.route]);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
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

  // ========== MENU ITEMS ==========
  get menuItems(): MenuItem[] {
    if (this.isAuthenticated) {
      return [
        { label: 'Messages', icon: '💬', route: '/messages' },
        { label: 'Notifications', icon: '🔔', route: '/notifications' },
        { label: 'Trips', icon: '✈️', route: '/trips' },
        { label: 'Wishlists', icon: '❤️', route: '/wishlists' },
        { label: 'Account', icon: '👤', route: '/account' },
        { separator: true },
        { label: 'Become a Host', icon: '🏠', route: '/become-host' },
        { label: 'Host an experience', icon: '🌟', route: '/host-experience' },
        { label: 'Help Center', icon: '❓', route: '/help' },
        { label: 'Gift cards', icon: '🎁', route: '/gift-cards' },
        { separator: true },
        { label: 'Log out', icon: '🚪', action: 'logout' }
      ];
    } else {
      return [
        { label: 'Become a Host', icon: '🏠', route: '/become-host' },
        { label: 'Help Center', icon: '❓', route: '/help' },
        { label: 'Gift cards', icon: '🎁', route: '/gift-cards' },
        { separator: true },
        { label: 'Log in or sign up', icon: '👤', route: '/auth' }
      ];
    }
  }
}