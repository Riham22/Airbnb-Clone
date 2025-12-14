// search.component.ts - Cleaned and Fixed Version
import { Component, Output, EventEmitter, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Data } from '../../Services/data';
import { AuthService } from '../../Services/auth';
import { GuestCounts } from '../../Models/guest-counts';
import { RentalProperty } from '../../Models/rental-property';
import { Experience } from '../../Models/experience';
import { Service } from '../../Models/service';
import { DateRange } from '../../Models/DateRange';

// Menu item type definition
export type MenuItem =
  | { label: string; icon: string; route: string; action?: never; separator?: never }
  | { label: string; icon: string; action: string; route?: never; separator?: never }
  | { separator: true; label?: never; icon?: never; route?: never; action?: never };

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
  @Output() openFilters = new EventEmitter<void>(); // Add this output for filter button

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
  currentFilters = {
    location: '',
    dates: { start: null as Date | null, end: null as Date | null, flexible: false } as DateRange,
    guests: { adults: 0, children: 0, infants: 0, pets: 0 },
    propertyType: 'all'
  };

  // UI state
  activePanel: string | null = null;
  currentMonth: Date = new Date();
  calendarView: 'month' | 'year' | 'decade' = 'month';
  dateSelection = {
    start: null as Date | null,
    end: null as Date | null,
    selectingStart: true
  };
  guestSelection = {
    adults: 0,
    children: 0,
    infants: 0,
    pets: 0
  };

  // Constants
  readonly minDate: Date = new Date(2024, 0, 1);
  readonly maxDate: Date = new Date(2070, 11, 31);
  // Dynamic location/category options
  locationOptions: any[] = [
    { value: 'flexible', label: "I'm flexible", icon: '🌍', description: 'Discover unique stays' }
  ];

  // Auth state
  isAuthenticated = false;
  currentUser: any = null;

  // Language & Menu
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
  isHostPage = false;

  // Years and decades arrays
  availableYears: number[] = [];
  availableDecades: number[] = [];

  constructor(
    private dataService: Data,
    private router: Router,
    private authService: AuthService
  ) {
    // Listen for route changes to verify if it is Admin or Trips or Account or Host Page
    this.router.events.subscribe(() => {
      this.isAdminPage = this.router.url.includes('/admin');
      this.isTripsPage = this.router.url.includes('/trips');
      this.isAccountPage = this.router.url.includes('/account');
      this.isHostPage = this.router.url.includes('/host');
    });
  }

  ngOnInit(): void {
    this.isAdminPage = this.router.url.includes('/admin'); // Initial check
    this.isTripsPage = this.router.url.includes('/trips'); // Initial check
    this.isAccountPage = this.router.url.includes('/account'); // Initial check
    this.isHostPage = this.router.url.includes('/host'); // Initial check
    this.loadAllData();
    this.generateAvailableYears();
    this.generateAvailableDecades();
    this.checkMobileView();
    this.setupFilterObservables();
    this.setupAuthObservables();

    // Subscribe to unique locations for "Where" options
    this.dataService.locations$.subscribe(locations => {
      if (locations && locations.length > 0) {
        this.updateLocationOptions(locations);
      }
    });
  }

  updateLocationOptions(locations: string[]) {
    // const baseOptions = [
    //   { value: 'flexible', label: "I'm flexible", icon: '🌍', description: 'Discover unique stays' }
    // ];

    const mappedLocations = locations.map(loc => ({
      value: loc, // Use city name as value
      label: loc,
      icon: '📍', // Generic pin icon for locations
      description: 'Explore stays in ' + loc
    }));

    this.locationOptions = [...mappedLocations];
  }

  getCategoryIcon(name: string): string {
    // Kept for compatibility but unused for location validation
    return '📍';
  }

  // ========== FILTER METHODS ==========

  selectPropertyType(type: string): void {
    this.selectedPropertyType = type;
    this.currentFilters.propertyType = type;
    this.propertyTypeFilter$.next(type);
    this.activeFiltersChange.emit(this.currentFilters);
  }

  selectLocation(location: string): void {
    this.currentFilters.location = location;
    this.locationFilter$.next(location);
    this.activeFiltersChange.emit(this.currentFilters);
    setTimeout(() => this.closePanel(), 300);
  }

  // ========== DATE METHODS ==========

  selectDate(date: Date): void {
    if (!this.isDateSelectable(date)) return;

    if (this.dateSelection.selectingStart || !this.dateSelection.start) {
      this.dateSelection.start = date;
      this.dateSelection.selectingStart = false;
      if (this.dateSelection.end && this.dateSelection.end < date) {
        this.dateSelection.end = null;
      }
    } else {
      if (date >= this.dateSelection.start!) {
        this.dateSelection.end = date;
        this.dateSelection.selectingStart = true;
        this.currentFilters.dates = { start: this.dateSelection.start, end: this.dateSelection.end };
        this.dateFilter$.next(this.currentFilters.dates);
        this.activeFiltersChange.emit(this.currentFilters);
      } else {
        this.dateSelection.start = date;
        this.dateSelection.end = null;
        this.dateSelection.selectingStart = false;
      }
    }
  }

  clearDates(): void {
    this.dateSelection.start = null;
    this.dateSelection.end = null;
    this.dateSelection.selectingStart = true;
    this.currentFilters.dates = { start: null, end: null };
    this.dateFilter$.next(this.currentFilters.dates);
    this.activeFiltersChange.emit(this.currentFilters);
  }

  selectNextWeekend(): void {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;

    const startDate = new Date(today);
    startDate.setDate(today.getDate() + daysUntilSaturday);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1);

    this.setDateSelection(startDate, endDate);
  }

  selectNextWeek(): void {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    this.setDateSelection(startDate, endDate);
  }

  selectNextMonth(): void {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(endDate.getDate() - 1);

    this.setDateSelection(startDate, endDate);
  }

  private setDateSelection(start: Date, end: Date): void {
    this.dateSelection.start = start;
    this.dateSelection.end = end;
    this.dateSelection.selectingStart = true;
    this.currentFilters.dates = { start, end };
    this.dateFilter$.next(this.currentFilters.dates);
    this.activeFiltersChange.emit(this.currentFilters);
  }

  // ========== GUEST METHODS ==========

  updateGuests(type: 'adults' | 'children' | 'infants' | 'pets', change: number): void {
    const newValue = this.guestSelection[type] + change;
    if (newValue >= 0) {
      // Allow 0 guests (reset)
      this.guestSelection[type] = newValue;
      this.currentFilters.guests = { ...this.guestSelection };
      const guestCounts: GuestCounts = {
        adults: this.guestSelection.adults,
        children: this.guestSelection.children,
        infants: this.guestSelection.infants,
        pets: this.guestSelection.pets,
        totalGuests: this.getTotalGuests()
      };
      this.guestFilter$.next(guestCounts.totalGuests > 0 ? guestCounts : null);
      this.activeFiltersChange.emit(this.currentFilters);
    }
  }

  clearGuests(): void {
    this.guestSelection = { adults: 0, children: 0, infants: 0, pets: 0 };
    this.currentFilters.guests = { ...this.guestSelection };
    this.guestFilter$.next(null);
    this.activeFiltersChange.emit(this.currentFilters);
  }

  getTotalGuests(): number {
    return this.guestSelection.adults + this.guestSelection.children;
  }

  // ========== CALENDAR NAVIGATION ==========

  navigateMonth(direction: number): void {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() + direction,
      1
    );
  }

  navigateYear(direction: number): void {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear() + direction,
      this.currentMonth.getMonth(),
      1
    );
  }

  switchToYearView(): void {
    this.calendarView = 'year';
  }

  switchToDecadeView(): void {
    this.calendarView = 'decade';
  }

  switchToMonthView(): void {
    this.calendarView = 'month';
  }

  selectYear(year: number): void {
    this.currentMonth = new Date(year, this.currentMonth.getMonth(), 1);
    this.calendarView = 'month';
  }

  selectDecade(decade: number): void {
    this.currentMonth = new Date(decade, 0, 1);
    this.calendarView = 'year';
  }

  selectMonth(monthNumber: number): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), monthNumber, 1);
    this.calendarView = 'month';
  }

  // ========== UI PANEL METHODS ==========

  openPanel(panel: string): void {
    this.activePanel = panel;
    if (panel === 'dates') {
      this.currentMonth = new Date();
      this.calendarView = 'month';
    }
  }

  closePanel(): void {
    this.activePanel = null;
    this.calendarView = 'month';
  }

  onOpenFilters(): void {
    this.openFilters.emit(); // Emit event to parent component
  }

  onSearch(): void {
    console.log('Searching with filters:', this.currentFilters);
    this.closePanel();
  }

  // ========== AUTH & MENU METHODS ==========

  toggleLanguagePanel(): void {
    this.showLanguagePanel = !this.showLanguagePanel;
    this.showMenuPanel = false;
    this.activePanel = null;
  }

  selectLanguage(language: any): void {
    this.selectedLanguage = language;
    this.showLanguagePanel = false;
    console.log('Language changed to:', language.name);
  }

  toggleMenuPanel(): void {
    this.showMenuPanel = !this.showMenuPanel;
    this.showLanguagePanel = false;
    this.activePanel = null;
  }

  closeAllPanels(): void {
    this.activePanel = null;
    this.showLanguagePanel = false;
    this.showMenuPanel = false;
    this.calendarView = 'month';
  }

  onMenuItemClick(item: any): void {
    this.showMenuPanel = false;
    console.log('Menu item clicked:', item.label);

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

  // ========== UTILITY METHODS ==========

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  goToCurrentMonth(): void {
    this.currentMonth = new Date();
    this.calendarView = 'month';
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

    this.activeFiltersChange.emit(this.currentFilters);
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
    const filterLoc = location.toLowerCase().trim();
    if (filterLoc === 'flexible') return true;

    // Direct location match (City name)
    const listingLoc = (listing.location || '').toLowerCase();

    // Check if the listing location includes the selected city (e.g. "Cairo, Egypt" includes "Cairo")
    return listingLoc.includes(filterLoc);
  }

  private isListingAvailable(listing: any, start: Date, end: Date): boolean {
    return Math.random() > 0.2; // Mock availability
  }

  private generateAvailableYears(): void {
    this.availableYears = [];
    for (let year = 2024; year <= 2070; year++) {
      this.availableYears.push(year);
    }
  }

  private generateAvailableDecades(): void {
    this.availableDecades = [2020, 2030, 2040, 2050, 2060];
  }

  private checkMobileView(): void {
    this.isMobileView = window.innerWidth < 768;
  }

  // ========== MENU ITEMS ==========

  get menuItems(): MenuItem[] {
    if (this.isAuthenticated) {
      const items: MenuItem[] = [
        { label: 'Trips', icon: '✈️', route: '/trips' },
        { label: 'Wishlists', icon: '❤️', route: '/wishlists' },
        { label: 'Account', icon: '👤', route: '/account' }];

      // Add Admin Dashboard if user is admin
      if (this.authService.isAdmin()) {
        items.push({ label: 'Admin Dashboard', icon: '⚡', route: '/admin' });
      }

      // Add Host Dashboard or Become a Host based on role
      items.push({ separator: true });

      if (this.authService.isHost()) {
        // User is already a host - show Host Dashboard
        items.push({ label: 'Host Dashboard', icon: '🏠', route: '/host' });
      } else {
        // User is guest - show Become a Host (navigates to host dashboard)
        items.push({ label: 'Become a Host', icon: '🏠', route: '/host' });
      }

      items.push(
        { separator: true },
        { label: 'Log out', icon: '🚪', action: 'logout' }
      );

      return items;
    } else {
      return [
        { label: 'Become a Host', icon: '🏠', route: '/become-host' },
        { separator: true },
        { label: 'Log in or sign up', icon: '👤', route: '/auth' }
      ];
    }
  }

  // ========== HOST LISTENER ==========

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkMobileView();
  }
}
