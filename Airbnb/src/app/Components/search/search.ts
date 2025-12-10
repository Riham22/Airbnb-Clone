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

  constructor(
    private dataService: Data,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
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
      return [
        { label: 'Messages', icon: '', route: '/messages' },
        { label: 'Notifications', icon: '', route: '/notifications' },
        { label: 'Trips', icon: '', route: '/trips' },
        { label: 'Wishlists', icon: '', route: '/wishlists' },
        { label: 'Account', icon: '', route: '/account' },
        { separator: true },
        { label: 'Become a Host', icon: '', route: '/become-host' },
        { label: 'Host an experience', icon: '', route: '/host-experience' },
        { label: 'Help Center', icon: '', route: '/help' },
        { label: 'Gift cards', icon: '', route: '/gift-cards' },
        { separator: true },
        { label: 'Log out', icon: '', action: 'logout' }
      ];
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
