import { Component, Output, EventEmitter, OnInit, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DateRange } from '../../Models/DateRange';
import { GuestCounts } from '../../Models/guest-counts';
import { LocationCollectorService } from '../../Services/location-collector.service'; // <-- Add this
import { Subscription } from 'rxjs'; // <-- Add this

@Component({
  selector: 'app-main-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './main-search-bar-component.html',
  styleUrl: './main-search-bar-component.css'
})
export class MainSearchBarComponent implements OnInit, OnDestroy {
  @Output() openFilters = new EventEmitter<void>();
  @Output() filtersChanged = new EventEmitter<any>();
  
  // Remove static @Input() and make it dynamic
  // @Input() locationOptions: any[] = [];
  
  // Dynamic locations
  locationOptions: any[] = [];
  isLoadingLocations = false;
  private locationSubscription?: Subscription;

  // UI state
  activePanel: string | null = null;
  currentMonth: Date = new Date();
  calendarView: 'month' | 'year' | 'decade' = 'month';
  
  // Filters
  currentFilters = {
    location: '',
    dates: { start: null as Date | null, end: null as Date | null, flexible: false } as DateRange,
    guests: { adults: 0, children: 0, infants: 0, pets: 0 }
  };

  // Date selection
  dateSelection = {
    start: null as Date | null,
    end: null as Date | null,
    selectingStart: true
  };

  // Guest selection
  guestSelection = {
    adults: 0,
    children: 0,
    infants: 0,
    pets: 0
  };

  // Constants
  readonly minDate: Date = new Date(2024, 0, 1);
  readonly maxDate: Date = new Date(2070, 11, 31);
  availableYears: number[] = [];
  availableDecades: number[] = [];

  constructor(
    private locationCollector: LocationCollectorService // <-- Inject service
  ) { }

  ngOnInit(): void {
    this.generateAvailableYears();
    this.generateAvailableDecades();
    this.loadDynamicLocations(); // <-- Load dynamic locations
  }

  ngOnDestroy(): void {
    // Clean up subscription
    if (this.locationSubscription) {
      this.locationSubscription.unsubscribe();
    }
  }

  /**
   * Load dynamic locations from API/DB
   */
  public loadDynamicLocations(): void {
    this.isLoadingLocations = true;
    
    this.locationSubscription = this.locationCollector.getDynamicLocations().subscribe({
      next: (locations) => {
        this.locationOptions = locations;
        this.isLoadingLocations = false;
        console.log('📍 Dynamic locations loaded in search bar:', locations.length);
        
        if (locations.length === 0) {
          console.warn('⚠️ No locations found in search bar');
          this.loadFallbackLocations();
        }
      },
      error: (error) => {
        console.error('❌ Error loading locations in search bar:', error);
        this.loadFallbackLocations();
        this.isLoadingLocations = false;
      }
    });
  }

  /**
   * Fallback locations if API fails
   */
  private loadFallbackLocations(): void {
    this.locationOptions = [
      {
        value: 'flexible',
        label: "I'm flexible",
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="#FF385C">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>`,
        description: 'Discover unique stays',
        category: 'property',
        count: 100
      }
    ];
  }

  /**
   * Debug function to check locations
   */
  debugLocations(): void {
    console.log('🔍 Debug locations:', {
      options: this.locationOptions,
      count: this.locationOptions.length,
      currentFilter: this.currentFilters.location
    });
    this.locationCollector.debugData();
  }

  // ========== PANEL METHODS ==========
  openPanel(panel: string): void {
    this.activePanel = panel;
    if (panel === 'dates') {
      this.currentMonth = new Date();
      this.calendarView = 'month';
    }
    
    // Debug when opening location panel
    if (panel === 'location') {
      console.log('📍 Opening location panel with options:', this.locationOptions.length);
    }
  }

  closePanel(): void {
    this.activePanel = null;
    this.calendarView = 'month';
  }

  onOpenFilters(): void {
    this.openFilters.emit();
  }

  // ========== LOCATION METHODS ==========
  selectLocation(location: string): void {
    console.log('📍 Location selected:', location);
    this.currentFilters.location = location;
    this.filtersChanged.emit(this.currentFilters);
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
        this.currentFilters.dates = { 
          start: this.dateSelection.start, 
          end: this.dateSelection.end 
        };
        this.filtersChanged.emit(this.currentFilters);
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
    this.filtersChanged.emit(this.currentFilters);
  }

  // Quick date actions
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
    this.filtersChanged.emit(this.currentFilters);
  }

  // ========== GUEST METHODS ==========
  updateGuests(type: 'adults' | 'children' | 'infants' | 'pets', change: number): void {
    const newValue = this.guestSelection[type] + change;
    if (newValue >= 0) {
      if (type === 'adults' && newValue === 0 && this.getTotalGuests() > 0) return;
      this.guestSelection[type] = newValue;
      this.currentFilters.guests = { ...this.guestSelection };
      this.filtersChanged.emit(this.currentFilters);
    }
  }

  clearGuests(): void {
    this.guestSelection = { adults: 0, children: 0, infants: 0, pets: 0 };
    this.currentFilters.guests = { ...this.guestSelection };
    this.filtersChanged.emit(this.currentFilters);
  }

  getTotalGuests(): number {
    return this.guestSelection.adults + this.guestSelection.children;
  }

  // ========== CALENDAR METHODS ==========
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

  selectMonth(monthNumber: number): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), monthNumber, 1);
    this.calendarView = 'month';
  }

  selectDecade(decade: number): void {
    this.currentMonth = new Date(decade, 0, 1);
    this.calendarView = 'year';
  }

  goToCurrentMonth(): void {
    this.currentMonth = new Date();
    this.calendarView = 'month';
  }

  // ========== DISPLAY METHODS ==========
  getLocationDisplay(): string {
    if (!this.currentFilters.location) return 'Anywhere';
    
    // For "flexible" option
    if (this.currentFilters.location === 'flexible') {
      return "I'm flexible";
    }
    
    // Find location in options
    const option = this.locationOptions.find(opt => opt.value === this.currentFilters.location);
    
    if (option) {
      return option.label;
    } else {
      // If not found in options but has a value, show it directly
      return this.currentFilters.location.replace('_', ' ') || 'Anywhere';
    }
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

  // ========== HELPER METHODS ==========
  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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

  // ========== VALIDATION METHODS ==========
  isDateSelectable(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today && date >= this.minDate && date <= this.maxDate;
  }

  isDateDisabled(date: Date): boolean {
    return !this.isDateSelectable(date);
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

  private generateAvailableYears(): void {
    this.availableYears = [];
    for (let year = 2024; year <= 2070; year++) {
      this.availableYears.push(year);
    }
  }

  private generateAvailableDecades(): void {
    this.availableDecades = [2020, 2030, 2040, 2050, 2060];
  }
}