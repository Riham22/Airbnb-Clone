// search.component.ts - Simplified Version
import { Component, Output, EventEmitter, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Data } from '../../Services/data';
import { AuthService } from '../../Services/auth';
import { RentalProperty } from '../../Models/rental-property';
import { Experience } from '../../Models/experience';
import { Service } from '../../Models/service';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './search.html',
  styleUrls: ['./search.css']
})
export class SearchComponent implements OnInit {
  @Output() filteredPropertiesChange = new EventEmitter<any[]>();
  @Output() activeFiltersChange = new EventEmitter<any>();

  // Data collections
  private properties: RentalProperty[] = [];
  private experiences: Experience[] = [];
  private services: Service[] = [];

  // Filter subjects for RxJS
  private propertyTypeFilter$ = new BehaviorSubject<string>('all');

  // Property types for UI
  propertyTypes = [
    { value: 'all', label: 'All', icon: '🏠' },
    { value: 'property', label: 'Properties', icon: '🏡' },
    { value: 'experience', label: 'Experiences', icon: '🌟' },
    { value: 'service', label: 'Services', icon: '🔧' }
  ];

  selectedPropertyType = 'all';

  // Auth state
  isAuthenticated = false;
  currentUser: any = null;
  showMenuPanel = false;

<<<<<<< HEAD
=======
  // Search state
  searchQuery: string = '';
  isSearchFocused = false;
  showSearchSuggestions = false;
  searchSuggestions: any[] = [];

  // Mobile responsiveness
  isMobileView = false;

  // Admin Page State
  isAdminPage = false;
  isTripsPage = false;
  isAccountPage = false;

  // Years and decades arrays
  availableYears: number[] = [];
  availableDecades: number[] = [];

>>>>>>> 481bb34615c4b29b09b3b85bc66cb66f22dfc7df
  constructor(
    private dataService: Data,
    private router: Router,
    private authService: AuthService
  ) {
    // Listen for route changes to verify if it is Admin or Trips or Account Page
    this.router.events.subscribe(() => {
      this.isAdminPage = this.router.url.includes('/admin');
      this.isTripsPage = this.router.url.includes('/trips');
      this.isAccountPage = this.router.url.includes('/account');
    });
  }

  ngOnInit(): void {
    this.isAdminPage = this.router.url.includes('/admin'); // Initial check
    this.isTripsPage = this.router.url.includes('/trips'); // Initial check
    this.isAccountPage = this.router.url.includes('/account'); // Initial check
    this.loadAllData();
    this.setupFilterObservables();
    this.setupAuthObservables();
  }

  // ========== FILTER METHODS ==========

  selectPropertyType(type: string): void {
    this.selectedPropertyType = type;
    this.propertyTypeFilter$.next(type);
    this.activeFiltersChange.emit({ propertyType: type });
  }

  // ========== AUTH METHODS ==========

  toggleMenuPanel(): void {
    this.showMenuPanel = !this.showMenuPanel;
<<<<<<< HEAD
=======
    this.showLanguagePanel = false;
    this.activePanel = null;
  }

  closeAllPanels(): void {
    this.activePanel = null;
    this.showLanguagePanel = false;
    this.showMenuPanel = false;
    this.calendarView = 'month';
>>>>>>> 481bb34615c4b29b09b3b85bc66cb66f22dfc7df
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
<<<<<<< HEAD
=======
    console.log('Logout successful');
  }

  navigateToBecomeHost(): void {
    this.router.navigate(['/become-host']);
    this.closeAllPanels();
  }

  // ========== DISPLAY METHODS ==========

  getLocationDisplay(): string {
    if (!this.currentFilters.location) return 'Anywhere';
    const option = this.locationOptions.find(opt => opt.value === this.currentFilters.location);
    return option ? option.label : 'Anywhere';
  }

  getDatesDisplay(): string {
    if (!this.currentFilters.dates.start || !this.currentFilters.dates.end) return 'Any week';
    const start = this.formatDate(this.currentFilters.dates.start);
    const end = this.formatDate(this.currentFilters.dates.end);
    return `${start} – ${end}`;
  }

  getGuestsDisplay(): string {
    const total = this.getTotalGuests();
    if (total === 0) return 'Add guests';

    const parts: string[] = [];
    if (this.guestSelection.adults > 0) {
      parts.push(`${this.guestSelection.adults} adult${this.guestSelection.adults > 1 ? 's' : ''}`);
    }
    if (this.guestSelection.children > 0) {
      parts.push(`${this.guestSelection.children} child${this.guestSelection.children > 1 ? 'ren' : ''}`);
    }
    if (this.guestSelection.infants > 0) {
      parts.push(`${this.guestSelection.infants} infant${this.guestSelection.infants > 1 ? 's' : ''}`);
    }
    if (this.guestSelection.pets > 0) {
      parts.push(`${this.guestSelection.pets} pet${this.guestSelection.pets > 1 ? 's' : ''}`);
    }

    return parts.join(', ');
  }

  // ========== CALENDAR HELPER METHODS ==========

  getCalendarDays(): Date[] {
    const days: Date[] = [];
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    return days;
  }

  getMonthYearDisplay(): string {
    return this.currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  getCurrentDecade(): number {
    return Math.floor(this.currentMonth.getFullYear() / 10) * 10;
  }

  getMonthsForYear(): { name: string, number: number }[] {
    return [
      { name: 'Jan', number: 0 }, { name: 'Feb', number: 1 }, { name: 'Mar', number: 2 },
      { name: 'Apr', number: 3 }, { name: 'May', number: 4 }, { name: 'Jun', number: 5 },
      { name: 'Jul', number: 6 }, { name: 'Aug', number: 7 }, { name: 'Sep', number: 8 },
      { name: 'Oct', number: 9 }, { name: 'Nov', number: 10 }, { name: 'Dec', number: 11 }
    ];
  }

  // ========== VALIDATION METHODS ==========

  isDateSelectable(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today && date >= this.minDate && date <= this.maxDate;
  }

  isDateDisabled(date: Date): boolean {
    return !this.isDateSelectable(date);
  }

  isPastDate(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }

  isDateInRange(date: Date): boolean {
    if (!this.dateSelection.start || !this.dateSelection.end) return false;
    return date >= this.dateSelection.start && date <= this.dateSelection.end;
  }

  isDateSelected(date: Date): boolean {
    return date.getTime() === this.dateSelection.start?.getTime() ||
      date.getTime() === this.dateSelection.end?.getTime();
  }

  isDateStart(date: Date): boolean {
    return date.getTime() === this.dateSelection.start?.getTime();
  }

  isDateEnd(date: Date): boolean {
    return date.getTime() === this.dateSelection.end?.getTime();
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  }

  canNavigatePrev(): boolean {
    const prevMonth = new Date(this.currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    return prevMonth >= this.minDate;
  }

  canNavigateNext(): boolean {
    const nextMonth = new Date(this.currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth <= this.maxDate;
  }

  isCurrentDecade(decade: number): boolean {
    return this.getCurrentDecade() === decade;
>>>>>>> 481bb34615c4b29b09b3b85bc66cb66f22dfc7df
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
    this.propertyTypeFilter$.pipe(
      map(propertyType => {
        const allListings = this.getAllListings();
        return this.applyPropertyTypeFilter(allListings, propertyType);
      })
    ).subscribe(filteredProperties => {
      this.filteredPropertiesChange.emit(filteredProperties);
    });

    // Emit initial state
    this.activeFiltersChange.emit({ propertyType: 'all' });
    this.filteredPropertiesChange.emit(this.getAllListings());
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
    const filtered = this.applyPropertyTypeFilter(this.getAllListings(), this.selectedPropertyType);
    this.filteredPropertiesChange.emit(filtered);
  }

  private getAllListings(): any[] {
    return [...this.properties, ...this.experiences, ...this.services];
  }

  private applyPropertyTypeFilter(listings: any[], propertyType: string): any[] {
    if (propertyType === 'all') {
      return listings; // Return all listings when "All" is selected
    }

    return listings.filter(listing => {
      return this.matchesPropertyType(listing, propertyType);
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

  // ========== MENU ITEMS ==========

  get menuItems(): any[] {
    if (this.isAuthenticated) {
<<<<<<< HEAD
      return [
        { label: 'Messages', icon: '', route: '/messages' },
        { label: 'Notifications', icon: '', route: '/notifications' },
        { label: 'Trips', icon: '', route: '/trips' },
        { label: 'Wishlists', icon: '', route: '/wishlists' },
        { label: 'Account', icon: '', route: '/account' },
=======
      const items: MenuItem[] = [
        { label: 'Messages', icon: '💬', route: '/messages' },
        { label: 'Notifications', icon: '🔔', route: '/notifications' },
        { label: 'Trips', icon: '✈️', route: '/trips' },
        { label: 'Wishlists', icon: '❤️', route: '/wishlists' },
        { label: 'Account', icon: '👤', route: '/account' }];

      // Add Admin Dashboard if user is admin
      if (this.authService.isAdmin()) {
        items.push({ label: 'Admin Dashboard', icon: '⚡', route: '/admin' });
      }

      items.push(
>>>>>>> 481bb34615c4b29b09b3b85bc66cb66f22dfc7df
        { separator: true },
        { label: 'Become a Host', icon: '', route: '/become-host' },
        { label: 'Host an experience', icon: '', route: '/host-experience' },
        { label: 'Help Center', icon: '', route: '/help' },
        { label: 'Gift cards', icon: '', route: '/gift-cards' },
        { separator: true },
<<<<<<< HEAD
        { label: 'Log out', icon: '', action: 'logout' }
      ];
=======
        { label: 'Log out', icon: '🚪', action: 'logout' }
      );

      return items;
>>>>>>> 481bb34615c4b29b09b3b85bc66cb66f22dfc7df
    } else {
      return [
        { label: 'Become a Host', icon: '', route: '/become-host' },
        { label: 'Help Center', icon: '', route: '/help' },
        { label: 'Gift cards', icon: '', route: '/gift-cards' },
        { separator: true },
        { label: 'Log in or sign up', icon: '', route: '/auth' }
      ];
    }
  }
}
