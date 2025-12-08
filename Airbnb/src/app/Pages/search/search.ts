// search.component.ts - Enhanced Airbnb-like version
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
import { CategoryBarComponent } from "../../Components/category-bar/category-bar.component";

// Menu item type definition
export type MenuItem =
  | { label: string; icon: string; route: string; action?: never; separator?: never }
  | { label: string; icon: string; action: string; route?: never; separator?: never }
  | { separator: true; label?: never; icon?: never; route?: never; action?: never };

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CategoryBarComponent],
  templateUrl: './search.html',
  styleUrls: ['./search.css']
})
export class SearchComponent implements OnInit {
  @Output() filteredPropertiesChange = new EventEmitter<any[]>();
  @Output() activeFiltersChange = new EventEmitter<any>();

  private properties: RentalProperty[] = [];
  private experiences: Experience[] = [];
  private services: Service[] = [];

  // Filter subjects
  private guestFilter$ = new BehaviorSubject<GuestCounts | null>(null);
  private locationFilter$ = new BehaviorSubject<string>('');
  private dateFilter$ = new BehaviorSubject<DateRange>({ start: null, end: null, flexible: false }); private propertyTypeFilter$ = new BehaviorSubject<string>('all');

  // Simplified property types - only 3 main categories
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

  activePanel: string | null = null;

  // Enhanced Calendar state
  currentMonth: Date = new Date();
  minDate: Date = new Date(2024, 0, 1);
  maxDate: Date = new Date(2070, 11, 31);

  // Navigation modes
  calendarView: 'month' | 'year' | 'decade' = 'month';

  // Years and decades for navigation
  availableYears: number[] = [];
  availableDecades: number[] = [];

  // Location options
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

  // Date selection state
  dateSelection = {
    start: null as Date | null,
    end: null as Date | null,
    selectingStart: true
  };

  // Guest selection state
  guestSelection = {
    adults: 0,
    children: 0,
    infants: 0,
    pets: 0
  };

  isAuthenticated = false;
  currentUser: any = null;

  // Language options
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

  // Panel states
  showLanguagePanel = false;
  showMenuPanel = false;

  // Enhanced Airbnb-like search state
  searchQuery: string = '';
  isSearchFocused = false;
  showSearchSuggestions = false;
  searchSuggestions: any[] = [];

  // Enhanced quick filters (Airbnb-like)
  quickFilters = [
    { label: 'Free cancellation', value: 'free_cancellation' },
    { label: 'WiFi', value: 'wifi' },
    { label: 'Kitchen', value: 'kitchen' },
    { label: 'Washer', value: 'washer' },
    { label: 'Pool', value: 'pool' },
    { label: 'Hot tub', value: 'hot_tub' },
    { label: 'Pet friendly', value: 'pets' },
    { label: 'Beachfront', value: 'beachfront' }
  ];

  selectedQuickFilters: string[] = [];


  isMobileView = false;


  showAdvancedFilters = false;
  priceRange = { min: 0, max: 1000 };
  selectedAmenities: string[] = [];
  selectedCategories: string[] = [];
  instantBookOnly = false;
  superhostOnly = false;

  filteredProperties: RentalProperty[] = [];
  activeFilters: any = {};
  isFilterModalOpen = false;
  selectedCategory: string = 'All';
  isLoading = true;
  isScrolled = false;
  Router: any;
  constructor(
    private dataService: Data,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {

    this.loadAllData();
    this.generateAvailableYears();
    this.generateAvailableDecades();
    this.checkMobileView();


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

    // Emit initial data
    const initialListings = this.getAllListings();
    this.filteredPropertiesChange.emit(initialListings);

    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
    });

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.authService.checkAuthentication();
  }





  onSearchInput(): void {
    if (this.searchQuery.length > 2) {
      this.showSearchSuggestions = true;
      this.updateSearchSuggestions();
    } else {
      this.showSearchSuggestions = false;
    }
  }

  private updateSearchSuggestions(): void {
    const allListings = this.getAllListings();
    this.searchSuggestions = allListings
      .filter(listing =>
        listing.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        listing.location.toLowerCase().includes(this.searchQuery.toLowerCase())
      )
      .slice(0, 5);
  }

  selectSuggestion(suggestion: any): void {
    this.searchQuery = suggestion.name;
    this.showSearchSuggestions = false;
    this.isSearchFocused = false;
    // Optionally apply this as a location filter
    this.selectLocation(this.searchQuery);
  }

  toggleQuickFilter(filter: string): void {
    const index = this.selectedQuickFilters.indexOf(filter);
    if (index > -1) {
      this.selectedQuickFilters.splice(index, 1);
    } else {
      this.selectedQuickFilters.push(filter);
    }
    this.applyQuickFilters();
  }

  private applyQuickFilters(): void {
    // Implement quick filter logic
    console.log('Applied quick filters:', this.selectedQuickFilters);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkMobileView();
  }

  private checkMobileView(): void {
    this.isMobileView = window.innerWidth < 768;
  }

  // Enhanced panel management for mobile
  openMobilePanel(panel: string): void {
    if (this.isMobileView) {
      this.activePanel = panel;
    } else {
      this.openPanel(panel);
    }
  }

  // Enhanced date selection with Airbnb-like features
  getPopularDateRanges() {
    return [
      { label: 'Next weekend', getDates: () => this.getNextWeekend() },
      { label: 'Next week', getDates: () => this.getNextWeek() },
      { label: 'Next month', getDates: () => this.getNextMonth() },
      { label: 'Flexible dates', getDates: () => ({ start: null, end: null, flexible: true }) }
    ];
  }

  selectPopularDateRange(range: any): void {
    const dates = range.getDates();
    if (dates.flexible) {
      // Handle flexible dates
      this.currentFilters.dates = { start: null, end: null, flexible: true };
    } else {
      this.dateSelection.start = dates.start;
      this.dateSelection.end = dates.end;
      this.currentFilters.dates = { start: dates.start, end: dates.end, flexible: false };
    }
    this.dateFilter$.next(this.currentFilters.dates);
    this.activeFiltersChange.emit(this.currentFilters);
  }
  private getNextWeek(): { start: Date, end: Date } {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1); // Start from tomorrow

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6); // 7 days total (1 week)

    return { start: startDate, end: endDate };
  }

  // Missing method: getNextMonth
  private getNextMonth(): { start: Date, end: Date } {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1); // Start from tomorrow

    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(endDate.getDate() - 1); // Last day of next month

    return { start: startDate, end: endDate };
  }

  private getNextWeekend(): { start: Date, end: Date } {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
    const friday = new Date(today);
    friday.setDate(today.getDate() + daysUntilFriday);

    const sunday = new Date(friday);
    sunday.setDate(friday.getDate() + 2);

    return { start: friday, end: sunday };
  }

  // Enhanced guest selection with Airbnb-like room types
  roomTypes = [
    { type: 'adults', label: 'Adults', description: 'Ages 13 or above' },
    { type: 'children', label: 'Children', description: 'Ages 2-12' },
    { type: 'infants', label: 'Infants', description: 'Under 2' },
    { type: 'pets', label: 'Pets', description: 'Bringing a service animal?' }
  ];

  // Load all data types
  private loadAllData(): void {
    // Subscribe to properties
    this.dataService.properties$.subscribe(props => {
      this.properties = props;
      this.updateAndEmitListings();
    });

    // Subscribe to experiences
    this.dataService.experiences$.subscribe(exps => {
      this.experiences = exps;
      this.updateAndEmitListings();
    });

    // Subscribe to services
    this.dataService.services$.subscribe(svcs => {
      this.services = svcs;
      this.updateAndEmitListings();
    });
  }

  // Helper to emit updates
  private updateAndEmitListings(): void {
    this.filteredPropertiesChange.emit(this.getAllListings());
    // Also update suggestions if search is active
    if (this.searchQuery) {
      this.updateSearchSuggestions();
    }
  }

  // Get all listings from all categories
  private getAllListings(): any[] {
    return [
      ...this.properties,
      ...this.experiences,
      ...this.services
    ];
  }

  // Apply all filters to all listing types
  private applyAllFilters(listings: any[], filters: any): any[] {
    return listings.filter(listing => {
      // Property type filter (main filter)
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
        // Services don't typically have guest limits
      }

      return true;
    });
  }

  // Property type matching for the 3 main categories
  private matchesPropertyType(listing: any, propertyType: string): boolean {
    switch (propertyType) {
      case 'property':
        return listing.type === 'property';
      case 'experience':
        return listing.type === 'experience';
      case 'service':
        return listing.type === 'service';
      default:
        return true; // 'all' case
    }
  }

  // Enhanced location matching for all types
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

  // Enhanced availability check
  private isListingAvailable(listing: any, start: Date, end: Date): boolean {
    // Mock availability - in real app, check against actual availability
    return Math.random() > 0.2;
  }

  // Generate available years (2024-2070)
  private generateAvailableYears(): void {
    this.availableYears = [];
    for (let year = 2024; year <= 2070; year++) {
      this.availableYears.push(year);
    }
  }

  // Generate available decades
  private generateAvailableDecades(): void {
    this.availableDecades = [2020, 2030, 2040, 2050, 2060];
  }

  // Property type selection - UPDATED
  selectPropertyType(type: string) {
    this.selectedPropertyType = type;
    this.currentFilters.propertyType = type;
    this.propertyTypeFilter$.next(type);
    this.activeFiltersChange.emit(this.currentFilters);
  }

  // ALL YOUR EXISTING UI METHODS REMAIN EXACTLY THE SAME
  // Panel management
  openPanel(panel: string) {
    this.activePanel = panel;
    if (panel === 'dates') {
      this.currentMonth = new Date();
      this.calendarView = 'month';
    }
  }

  closePanel() {
    this.activePanel = null;
    this.calendarView = 'month';
  }

  // Enhanced Calendar navigation
  navigateMonth(direction: number) {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() + direction,
      1
    );
  }

  navigateYear(direction: number) {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear() + direction,
      this.currentMonth.getMonth(),
      1
    );
  }

  // View switching
  switchToYearView() {
    this.calendarView = 'year';
  }

  switchToDecadeView() {
    this.calendarView = 'decade';
  }

  switchToMonthView() {
    this.calendarView = 'month';
  }

  // Select year from year view
  selectYear(year: number) {
    this.currentMonth = new Date(year, this.currentMonth.getMonth(), 1);
    this.calendarView = 'month';
  }

  // Select decade from decade view
  selectDecade(decade: number) {
    this.currentMonth = new Date(decade, 0, 1);
    this.calendarView = 'year';
  }

  // Select month from year view
  selectMonth(monthNumber: number) {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), monthNumber, 1);
    this.calendarView = 'month';
  }

  // Get current decade
  getCurrentDecade(): number {
    return Math.floor(this.currentMonth.getFullYear() / 10) * 10;
  }

  // Check if decade is current
  isCurrentDecade(decade: number): boolean {
    return this.getCurrentDecade() === decade;
  }

  // Get months for year view
  getMonthsForYear(): { name: string, number: number }[] {
    return [
      { name: 'Jan', number: 0 }, { name: 'Feb', number: 1 }, { name: 'Mar', number: 2 },
      { name: 'Apr', number: 3 }, { name: 'May', number: 4 }, { name: 'Jun', number: 5 },
      { name: 'Jul', number: 6 }, { name: 'Aug', number: 7 }, { name: 'Sep', number: 8 },
      { name: 'Oct', number: 9 }, { name: 'Nov', number: 10 }, { name: 'Dec', number: 11 }
    ];
  }

  // Quick navigation methods
  goToCurrentMonth() {
    this.currentMonth = new Date();
    this.calendarView = 'month';
  }

  // Location selection
  selectLocation(location: string) {
    this.currentFilters.location = location;
    this.locationFilter$.next(location);
    this.activeFiltersChange.emit(this.currentFilters);
    setTimeout(() => this.closePanel(), 300);
  }

  // Date selection
  selectDate(date: Date) {
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

  clearDates() {
    this.dateSelection.start = null;
    this.dateSelection.end = null;
    this.dateSelection.selectingStart = true;
    this.currentFilters.dates = { start: null, end: null };
    this.dateFilter$.next(this.currentFilters.dates);
    this.activeFiltersChange.emit(this.currentFilters);
  }

  // Date validation methods
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

  // Guest management
  updateGuests(type: 'adults' | 'children' | 'infants' | 'pets', change: number) {
    const newValue = this.guestSelection[type] + change;
    if (newValue >= 0) {
      if (type === 'adults' && newValue === 0 && this.getTotalGuests() > 0) return;
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

  clearGuests() {
    this.guestSelection = { adults: 0, children: 0, infants: 0, pets: 0 };
    this.currentFilters.guests = { ...this.guestSelection };
    this.guestFilter$.next(null);
    this.activeFiltersChange.emit(this.currentFilters);
  }

  getTotalGuests(): number {
    return this.guestSelection.adults + this.guestSelection.children;
  }

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
    const parts = [];
    if (this.guestSelection.adults > 0) parts.push(`${this.guestSelection.adults} adult${this.guestSelection.adults > 1 ? 's' : ''}`);
    if (this.guestSelection.children > 0) parts.push(`${this.guestSelection.children} child${this.guestSelection.children > 1 ? 'ren' : ''}`);
    if (this.guestSelection.infants > 0) parts.push(`${this.guestSelection.infants} infant${this.guestSelection.infants > 1 ? 's' : ''}`);
    if (this.guestSelection.pets > 0) parts.push(`${this.guestSelection.pets} pet${this.guestSelection.pets > 1 ? 's' : ''}`);
    return parts.join(', ');
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

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

  isDateInRange(date: Date): boolean {
    if (!this.dateSelection.start || !this.dateSelection.end) return false;
    return date >= this.dateSelection.start && date <= this.dateSelection.end;
  }

  isDateSelected(date: Date): boolean {
    return date.getTime() === this.dateSelection.start?.getTime() || date.getTime() === this.dateSelection.end?.getTime();
  }

  isDateStart(date: Date): boolean {
    return date.getTime() === this.dateSelection.start?.getTime();
  }

  isDateEnd(date: Date): boolean {
    return date.getTime() === this.dateSelection.end?.getTime();
  }

  // Check if date is today
  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  }

  // Quick date selections
  selectNextWeekend() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;

    const startDate = new Date(today);
    startDate.setDate(today.getDate() + daysUntilSaturday);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1);

    this.dateSelection.start = startDate;
    this.dateSelection.end = endDate;
    this.dateSelection.selectingStart = true;

    this.currentFilters.dates = {
      start: startDate,
      end: endDate
    };
    this.dateFilter$.next(this.currentFilters.dates);
    this.activeFiltersChange.emit(this.currentFilters);
  }

  selectNextWeek() {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    this.dateSelection.start = startDate;
    this.dateSelection.end = endDate;
    this.dateSelection.selectingStart = true;

    this.currentFilters.dates = {
      start: startDate,
      end: endDate
    };
    this.dateFilter$.next(this.currentFilters.dates);
    this.activeFiltersChange.emit(this.currentFilters);
  }

  selectNextMonth() {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);

    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(endDate.getDate() - 1);

    this.dateSelection.start = startDate;
    this.dateSelection.end = endDate;
    this.dateSelection.selectingStart = true;

    this.currentFilters.dates = {
      start: startDate,
      end: endDate
    };
    this.dateFilter$.next(this.currentFilters.dates);
    this.activeFiltersChange.emit(this.currentFilters);
  }

  onSearch() {
    console.log('Searching with filters:', this.currentFilters);
    this.closePanel();
  }

  // Language methods
  toggleLanguagePanel() {
    this.showLanguagePanel = !this.showLanguagePanel;
    this.showMenuPanel = false;
    this.activePanel = null;
  }

  selectLanguage(language: any) {
    this.selectedLanguage = language;
    this.showLanguagePanel = false;
    console.log('Language changed to:', language.name);
  }

  // Menu methods
  toggleMenuPanel() {
    this.showMenuPanel = !this.showMenuPanel;
    this.showLanguagePanel = false;
    this.activePanel = null;
  }

  get menuItems(): MenuItem[] {
    if (this.isAuthenticated) {
      const items: MenuItem[] = [
        { label: 'Messages', icon: '💬', route: '/messages' },
        { label: 'Notifications', icon: '🔔', route: '/notifications' },
        { label: 'Trips', icon: '✈️', route: '/trips' },
        { label: 'Wishlists', icon: '❤️', route: '/wishlists' },
        { label: 'Account', icon: '👤', route: '/account' }
      ];

      // Add Admin Dashboard for admin users
      // if (this.authService.isAdmin()) {
      //   items.push({ label: 'Admin Dashboard', icon: '⚙️', route: '/admin' });
      // }

      items.push(
        { separator: true },
        { label: 'Become a Host', icon: '🏠', route: '/become-host' },
        { label: 'Host an experience', icon: '🌟', route: '/host-experience' },
        { label: 'Help Center', icon: '❓', route: '/help' },
        { label: 'Gift cards', icon: '🎁', route: '/gift-cards' },
        { separator: true },
        {
          label: 'Log out',
          icon: '🚪',
          action: 'logout'
        }
      );

      return items;
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

  // Close all panels
  closeAllPanels() {
    this.activePanel = null;
    this.showLanguagePanel = false;
    this.showMenuPanel = false;
  }

  onMenuItemClick(item: any) {
    this.showMenuPanel = false;
    console.log('Menu item clicked:', item.label);

    // Handle logout action
    if (item.action === 'logout') {
      this.logout();
      return;
    }

    // Handle navigation based on route
    if (item.route) {
      this.router.navigate([item.route]);
    }
  }

  // Enhanced logout method
  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
    console.log('Logout successful');
  }

  // Enhanced getUserDisplayName method
  getUserDisplayName(): string {
    if (this.isAuthenticated && this.currentUser) {
      return `${this.currentUser.firstName} ${this.currentUser.lastName?.charAt(0)}.`;
    }
    return 'Log in';
  }

  // Add this method for user avatar
  getUserInitials(): string {
    if (this.isAuthenticated && this.currentUser) {
      const first = this.currentUser.firstName?.charAt(0) || '';
      const last = this.currentUser.lastName?.charAt(0) || '';
      return (first + last).toUpperCase();
    }
    return '👤';
  }

  navigateToBecomeHost() {
    this.router.navigate(['/become-host']);
    this.closeAllPanels();
  }

  // Get all available amenities from your data service
  get availableAmenities(): string[] {
    return this.dataService.getAmenities();
  }

  // Check if any basic filters are active
  get areBasicFiltersActive(): boolean {
    return !!this.currentFilters.location ||
      !!this.currentFilters.dates.start ||
      !!this.currentFilters.dates.end ||
      this.getTotalGuests() > 0;
  }

  // Check if any advanced filters are active
  get areAdvancedFiltersActive(): boolean {
    return this.priceRange.min > 0 ||
      this.priceRange.max < 1000 ||
      this.selectedAmenities.length > 0 ||
      this.selectedCategories.length > 0 ||
      this.instantBookOnly ||
      this.superhostOnly;
  }

  // Check if any filters are active (basic or advanced)
  get areAnyFiltersActive(): boolean {
    return this.areBasicFiltersActive || this.areAdvancedFiltersActive;
  }

  // Clear all basic filters (Where-When-Who)
  clearAllBasicFilters(): void {
    this.currentFilters.location = '';
    this.currentFilters.dates = { start: null, end: null };
    this.currentFilters.guests = { adults: 0, children: 0, infants: 0, pets: 0 };

    // Reset guest selection
    this.guestSelection = { adults: 0, children: 0, infants: 0, pets: 0 };

    // Reset date selection
    this.dateSelection = { start: null, end: null, selectingStart: true };

    // Emit the cleared filters
    this.locationFilter$.next('');
    this.dateFilter$.next({ start: null, end: null });
    this.guestFilter$.next(null);
    this.activeFiltersChange.emit(this.currentFilters);

    console.log('All basic filters cleared');
  }

  // Clear all advanced filters
  clearAdvancedFilters(): void {
    this.priceRange = { min: 0, max: 1000 };
    this.selectedAmenities = [];
    this.selectedCategories = [];
    this.instantBookOnly = false;
    this.superhostOnly = false;

    console.log('Advanced filters cleared');
  }

  // Clear all filters (both basic and advanced)
  clearAllFilters(): void {
    this.clearAllBasicFilters();
    this.clearAdvancedFilters();
    this.showAdvancedFilters = false;
  }

  // Toggle advanced filters panel
  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
    if (this.showAdvancedFilters) {
      this.closePanel(); // Close other panels when opening advanced filters
    }
  }

  // Apply advanced filters
  applyAdvancedFilters(): void {
    console.log('Applying advanced filters:', {
      priceRange: this.priceRange,
      amenities: this.selectedAmenities,
      categories: this.selectedCategories,
      instantBook: this.instantBookOnly,
      superhost: this.superhostOnly
    });

    // In a real app, you would emit these filters and update the listings
    // For now, we'll just close the panel
    this.showAdvancedFilters = false;
  }

  // Toggle amenity selection
  toggleAmenity(amenity: string): void {
    const index = this.selectedAmenities.indexOf(amenity);
    if (index > -1) {
      this.selectedAmenities.splice(index, 1);
    } else {
      this.selectedAmenities.push(amenity);
    }
  }

  // Toggle category selection
  toggleCategory(category: string): void {
    const index = this.selectedCategories.indexOf(category);
    if (index > -1) {
      this.selectedCategories.splice(index, 1);
    } else {
      this.selectedCategories.push(category);
    }
  }

  openFilters() {
    this.isFilterModalOpen = true;
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  }

  closeFilters() {
    this.isFilterModalOpen = false;
    // Restore body scroll
    document.body.style.overflow = 'auto';
  }

  onApplyFilters(filters: any) {
    console.log('Filters applied:', filters);
    this.activeFilters = { ...this.activeFilters, ...filters };
    this.applyComplexFilters();
    this.closeFilters();
  }

  applyComplexFilters() {
    let filtered = [...this.properties];

    // Apply location filter
    if (this.activeFilters.location && this.activeFilters.location !== 'anywhere') {
      filtered = filtered.filter(property =>
        property.location?.toLowerCase().includes(this.activeFilters.location.toLowerCase())

      );
    }

    // Apply price filter
    if (this.activeFilters.minPrice || this.activeFilters.maxPrice) {
      const minPrice = this.activeFilters.minPrice || 0;
      const maxPrice = this.activeFilters.maxPrice || Infinity;
      filtered = filtered.filter(property =>
        property.price >= minPrice && property.price <= maxPrice
      );
    }

    // Apply dates filter
    if (this.activeFilters.checkIn && this.activeFilters.checkOut) {
      // Here you would implement actual date availability logic
      // For now, just filter by availability flag
      filtered = filtered.filter(property => property.availableDates);
    }

    // Apply guests filter
    if (this.activeFilters.guests) {
      filtered = filtered.filter(property =>
        property.maxGuests >= this.activeFilters.guests
      );
    }

    // Apply amenities filter
    if (this.activeFilters.amenities && this.activeFilters.amenities.length > 0) {
      filtered = filtered.filter(property =>
        this.activeFilters.amenities.every((amenity: string) =>
          property.amenities?.includes(amenity)
        )
      );
    }

    // Apply category filter
    if (this.selectedCategory && this.selectedCategory !== 'All') {
      filtered = filtered.filter(property =>
        property.propertyType?.includes(this.selectedCategory.toLowerCase())
      );
    }

    this.filteredProperties = filtered;
  }
}


