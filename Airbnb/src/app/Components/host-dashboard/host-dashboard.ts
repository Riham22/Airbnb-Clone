import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { HostStats } from '../../Models/HostStats';
import { HostBooking } from '../../Models/HostBooking';
import { HostListing } from '../../Models/HostListing';
import { HostService } from '../../Services/Host.service';

@Component({
  selector: 'app-host-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './host-dashboard.html',
  styleUrls: ['./host-dashboard.css']
})
export class HostDashboardComponent implements OnInit, OnDestroy {
  // Data
  stats: HostStats | null = null;
  bookings: HostBooking[] = [];
  listings: HostListing[] = [];
  services: any[] = [];
  experiences: any[] = [];
  loading = false;

  // Tabs
  activeTab: 'overview' | 'listings' | 'bookings' | 'services' | 'experiences' | 'earnings' = 'overview';

  // Filter Properties
  searchText: string = '';
  statusFilter: string = 'all';
  filteredListings: HostListing[] = [];
  filteredServices: any[] = [];
  filteredExperiences: any[] = [];

  // Categories
  propertyTypes: any[] = [];
  propertyCategories: any[] = [];
  serviceCategories: any[] = [];
  experienceCategories: any[] = [];
  experienceSubCategories: any[] = [];

  // Modal States
  showAddListingModal = false;
  showAddServiceModal = false;
  showAddExperienceModal = false;

  // Form Data
  newListing: any = {
    name: '',
    description: '',
    price: 0,
    location: '',
    maxGuests: 2,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    propertyTypeId: null,
    propertyCategoryId: null
  };

  newService: any = {
    name: '',
    description: '',
    price: 0,
    location: '',
    serviceCategoryId: null,
    pricingType: 'PerHour'
  };

  newExperience: any = {
    name: '',
    description: '',
    price: 0,
    maxParticipants: 10,
    expCatograyId: null,
    expSubCatograyId: null,
    location: '',
    expActivities: []
  };

  newActivity: any = {
    name: '',
    describe: '',
    timeMinute: 60
  };

  // File Upload
  selectedFiles: File[] = [];

  private subscriptions: Subscription = new Subscription();

  constructor(private hostService: HostService) { }

  ngOnInit() {
    this.loadDashboardData();
    this.loadCategories();

    // Subscribe to loading state
    this.subscriptions.add(
      this.hostService.loading$.subscribe((loading: boolean) => {
        this.loading = loading;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  loadDashboardData(): void {
    // Load stats
    this.subscriptions.add(
      this.hostService.getStats().subscribe({
        next: (stats: any) => {
          this.stats = stats;
        },
        error: (error: any) => {
          console.error('Error loading stats:', error);
        }
      })
    );

    // Load bookings
    this.subscriptions.add(
      this.hostService.getBookings().subscribe({
        next: (bookings: any) => {
          this.bookings = bookings;
        },
        error: (error: any) => {
          console.error('Error loading bookings:', error);
        }
      })
    );

    // Load listings
    this.subscriptions.add(
      this.hostService.getListings().subscribe({
        next: (listings: any) => {
          this.listings = listings;
          this.filteredListings = [...listings]; // Initialize filtered list
        },
        error: (error: any) => {
          console.error('Error loading listings:', error);
        }
      })
    );

    // Load services
    this.subscriptions.add(
      this.hostService.getServices().subscribe({
        next: (services: any) => {
          this.services = services;
          this.filteredServices = [...services]; // Initialize filtered list
        },
        error: (error: any) => {
          console.error('Error loading services:', error);
        }
      })
    );

    // Load experiences
    this.subscriptions.add(
      this.hostService.getExperiences().subscribe({
        next: (experiences: any) => {
          this.experiences = experiences;
          this.filteredExperiences = [...experiences]; // Initialize filtered list
        },
        error: (error: any) => {
          console.error('Error loading experiences:', error);
        }
      })
    );
  }

  private loadCategories(): void {
    // Load property types and categories
    this.subscriptions.add(
      this.hostService.getPropertyTypes().subscribe({
        next: (types: any) => this.propertyTypes = types,
        error: (error: any) => console.error('Error loading property types:', error)
      })
    );

    this.subscriptions.add(
      this.hostService.getPropertyCategories().subscribe({
        next: (categories: any) => this.propertyCategories = categories,
        error: (error: any) => console.error('Error loading property categories:', error)
      })
    );

    // Load service categories
    this.subscriptions.add(
      this.hostService.getServiceCategories().subscribe({
        next: (categories: any) => this.serviceCategories = categories,
        error: (error: any) => console.error('Error loading service categories:', error)
      })
    );

    // Load experience categories
    this.subscriptions.add(
      this.hostService.getExperienceCategories().subscribe({
        next: (categories: any) => this.experienceCategories = categories,
        error: (error: any) => console.error('Error loading experience categories:', error)
      })
    );
  }

  // ==================== FILTERING METHODS ====================
  filterListings(event?: Event): void {
    // Get filter value from event or use current value
    if (event) {
      const target = event.target as HTMLSelectElement;
      this.statusFilter = target.value;
    }

    // Apply search text filter
    const searchTerm = this.searchText.toLowerCase();

    // Filter listings
    this.filteredListings = this.listings.filter(listing => {
      // Search filter
      const matchesSearch = !searchTerm ||
        listing.title.toLowerCase().includes(searchTerm) ||
        listing.location.toLowerCase().includes(searchTerm) ||
        listing.type.toLowerCase().includes(searchTerm);

      // Status filter
      const matchesStatus = this.statusFilter === 'all' ||
        listing.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  filterServices(): void {
    const searchTerm = this.searchText.toLowerCase();

    this.filteredServices = this.services.filter(service => {
      const matchesSearch = !searchTerm ||
        service.name.toLowerCase().includes(searchTerm) ||
        service.location.toLowerCase().includes(searchTerm) ||
        service.category.toLowerCase().includes(searchTerm);

      return matchesSearch;
    });
  }

  filterExperiences(): void {
    const searchTerm = this.searchText.toLowerCase();

    this.filteredExperiences = this.experiences.filter(experience => {
      const matchesSearch = !searchTerm ||
        experience.name.toLowerCase().includes(searchTerm) ||
        experience.location.toLowerCase().includes(searchTerm) ||
        experience.category.toLowerCase().includes(searchTerm);

      return matchesSearch;
    });
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchText = target.value;

    // Apply filters based on active tab
    if (this.activeTab === 'listings') {
      this.filterListings();
    } else if (this.activeTab === 'services') {
      this.filterServices();
    } else if (this.activeTab === 'experiences') {
      this.filterExperiences();
    }
  }

  getFilteredResultsMessage(): string {
    if (this.activeTab === 'listings') {
      return `Showing ${this.filteredListings.length} of ${this.listings.length} properties`;
    } else if (this.activeTab === 'services') {
      return `Showing ${this.filteredServices.length} of ${this.services.length} services`;
    } else if (this.activeTab === 'experiences') {
      return `Showing ${this.filteredExperiences.length} of ${this.experiences.length} experiences`;
    }
    return '';
  }

  // Experience category change handler
  onExperienceCategoryChange(): void {
    const categoryId = this.newExperience.expCatograyId;
    if (categoryId) {
      this.hostService.getExperienceSubCategories(Number(categoryId)).subscribe({
        next: (subCategories: any) => {
          this.experienceSubCategories = subCategories;
          this.newExperience.expSubCatograyId = null;
        },
        error: (error: any) => console.error('Error loading subcategories:', error)
      });
    }
  }

  // Tab Navigation
  setActiveTab(tab: 'overview' | 'listings' | 'bookings' | 'services' | 'experiences' | 'earnings'): void {
    this.activeTab = tab;
    // Reset filters when switching tabs
    this.searchText = '';
    this.statusFilter = 'all';
  }

  // Modal Methods
  openAddListingModal() {
    this.showAddListingModal = true;
  }

  closeAddListingModal() {
    this.showAddListingModal = false;
    this.newListing = {
      name: '',
      description: '',
      price: 0,
      location: '',
      maxGuests: 2,
      bedrooms: 1,
      beds: 1,
      bathrooms: 1,
      propertyTypeId: null,
      propertyCategoryId: null
    };
    this.selectedFiles = [];
  }

  openAddServiceModal() {
    this.showAddServiceModal = true;
  }

  closeAddServiceModal() {
    this.showAddServiceModal = false;
    this.newService = {
      name: '',
      description: '',
      price: 0,
      location: '',
      serviceCategoryId: null,
      pricingType: 'PerHour'
    };
    this.selectedFiles = [];
  }

  openAddExperienceModal() {
    this.showAddExperienceModal = true;
  }

  closeAddExperienceModal() {
    this.showAddExperienceModal = false;
    this.newExperience = {
      name: '',
      description: '',
      price: 0,
      maxParticipants: 10,
      expCatograyId: null,
      expSubCatograyId: null,
      location: '',
      expActivities: []
    };
    this.newActivity = { name: '', describe: '', timeMinute: 60 };
    this.selectedFiles = [];
  }

  // Activity management for experiences
  addActivity() {
    if (!this.newActivity.name || !this.newActivity.describe) {
      alert('Please fill in Activity Name and Description');
      return;
    }
    if (!this.newExperience.expActivities) {
      this.newExperience.expActivities = [];
    }
    this.newExperience.expActivities.push({ ...this.newActivity });
    this.newActivity = { name: '', describe: '', timeMinute: 60 };
  }

  removeActivity(index: number) {
    this.newExperience.expActivities.splice(index, 1);
  }

  // File Selection
  onFileSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFiles = Array.from(event.target.files);
    }
  }

  // CREATE METHODS
  addListing() {
    if (!this.newListing.propertyTypeId || !this.newListing.propertyCategoryId) {
      alert('Please select both Property Type and Property Category');
      return;
    }

    const listingPayload = {
      title: this.newListing.name,
      description: this.newListing.description,
      pricePerNight: Number(this.newListing.price),
      currency: 'USD',
      country: this.newListing.location.split(',')[1]?.trim() || 'Unknown',
      city: this.newListing.location.split(',')[0]?.trim() || 'Unknown',
      address: this.newListing.location,
      latitude: 0,
      longitude: 0,
      maxGuests: Number(this.newListing.maxGuests),
      bedrooms: Number(this.newListing.bedrooms),
      beds: Number(this.newListing.beds),
      bathrooms: Number(this.newListing.bathrooms),
      allowsPets: true,
      cancellationPolicy: 'Flexible',
      minNights: 1,
      maxNights: 30,
      propertyTypeId: Number(this.newListing.propertyTypeId),
      propertyCategoryId: Number(this.newListing.propertyCategoryId),
      subCategoryId: null,
      amenityIds: []
    };

    this.subscriptions.add(
      this.hostService.createListing(listingPayload, this.selectedFiles).subscribe({
        next: (response: any) => {
          alert('Listing created successfully');
          this.closeAddListingModal();
          this.loadDashboardData();
        },
        error: (err: any) => {
          console.error('Create Listing Error:', err);
          alert(`Failed to create listing: ${err.error?.message || err.message}`);
        }
      })
    );
  }

  addService() {
    if (!this.newService.serviceCategoryId) {
      alert('Please select a Service Category');
      return;
    }

    const servicePayload = {
      title: this.newService.name,
      description: this.newService.description,
      price: Number(this.newService.price),
      currency: 'USD',
      pricingType: this.newService.pricingType,
      country: 'Unknown',
      city: this.newService.location,
      address: this.newService.location,
      serviceCategoryId: Number(this.newService.serviceCategoryId)
    };

    this.subscriptions.add(
      this.hostService.createService(servicePayload, this.selectedFiles).subscribe({
        next: (response: any) => {
          alert('Service created successfully');
          this.closeAddServiceModal();
          this.loadDashboardData();
        },
        error: (err: any) => {
          console.error('Create Service Error:', err);
          alert(`Failed to create service: ${err.error?.message || err.message}`);
        }
      })
    );
  }

  addExperience() {
    if (!this.newExperience.expCatograyId || !this.newExperience.expSubCatograyId) {
      alert('Please select both Experience Category and Subcategory');
      return;
    }

    const experiencePayload = {
      name: this.newExperience.name || '',
      location: this.newExperience.location || '',
      manyExpYear: 0,
      workName: this.newExperience.name || '',
      expSummary: this.newExperience.description || '',
      expAchievement: this.newExperience.description || '',
      country: 'Egypt',
      apartment: '',
      street: this.newExperience.location || '',
      city: this.newExperience.location || '',
      governorate: 'Cairo',
      postalCode: '00000',
      locationName: this.newExperience.location || '',
      expTitle: this.newExperience.name || '',
      expDescribe: this.newExperience.description || '',
      maximumGuest: Number(this.newExperience.maxParticipants) || 10,
      guestPrice: Number(this.newExperience.price) || 0,
      groupPrice: Number(this.newExperience.price) || 0,
      durationDiscount: 0,
      earlyDiscount: 0,
      groupDiscount: 0,
      responsibleGuests: 'No',
      servingFood: 'No',
      servingAlcoholic: 'No',
      cancelOrder: 'No',
      usingLanguage: 'English',
      status: 'In_Progress',
      expCatograyId: Number(this.newExperience.expCatograyId),
      expSubCatograyId: Number(this.newExperience.expSubCatograyId),
      postedBy: null,
      images: [],
      expActivities: this.newExperience.expActivities || []
    };

    this.subscriptions.add(
      this.hostService.createExperience(experiencePayload, this.selectedFiles).subscribe({
        next: (response: any) => {
          alert('Experience created successfully');
          this.closeAddExperienceModal();
          this.loadDashboardData();
        },
        error: (err: any) => {
          console.error('Create Experience Error:', err);
          alert(`Failed to create experience: ${err.error?.message || err.message}`);
        }
      })
    );
  }

  // ACTIONS
  updateBookingStatus(bookingId: number, status: 'pending' | 'confirmed' | 'cancelled' | 'completed') {
    if (confirm(`Are you sure you want to change this booking status to ${status}?`)) {
      this.subscriptions.add(
        this.hostService.updateBookingStatus(bookingId, status).subscribe({
          next: () => {
            this.loadDashboardData();
            alert(`Booking ${status} successfully`);
          },
          error: (error: any) => {
            console.error('Error updating booking:', error);
            alert('Failed to update booking status');
          }
        })
      );
    }
  }

  updateListingStatus(listingId: number, status: 'active' | 'inactive') {
    if (confirm(`Are you sure you want to ${status === 'active' ? 'activate' : 'deactivate'} this listing?`)) {
      this.subscriptions.add(
        this.hostService.updateListingStatus(listingId, status).subscribe({
          next: () => {
            this.loadDashboardData();
            alert(`Listing ${status === 'active' ? 'activated' : 'deactivated'} successfully`);
          },
          error: (error: any) => {
            console.error('Error updating listing:', error);
            alert('Failed to update listing status');
          }
        })
      );
    }
  }

  updateServiceStatus(serviceId: number, status: 'active' | 'inactive') {
    if (confirm(`Are you sure you want to ${status === 'active' ? 'activate' : 'deactivate'} this service?`)) {
      this.subscriptions.add(
        this.hostService.updateServiceStatus(serviceId, status).subscribe({
          next: () => {
            this.loadDashboardData();
            alert(`Service ${status === 'active' ? 'activated' : 'deactivated'} successfully`);
          },
          error: (error: any) => {
            console.error('Error updating service:', error);
            alert('Failed to update service status');
          }
        })
      );
    }
  }

  updateExperienceStatus(experienceId: number, status: 'active' | 'inactive') {
    if (confirm(`Are you sure you want to ${status === 'active' ? 'activate' : 'deactivate'} this experience?`)) {
      this.subscriptions.add(
        this.hostService.updateExperienceStatus(experienceId, status).subscribe({
          next: () => {
            this.loadDashboardData();
            alert(`Experience ${status === 'active' ? 'activated' : 'deactivated'} successfully`);
          },
          error: (error: any) => {
            console.error('Error updating experience:', error);
            alert('Failed to update experience status');
          }
        })
      );
    }
  }

  deleteListing(listingId: number) {
    if (confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      this.subscriptions.add(
        this.hostService.deleteListing(listingId).subscribe({
          next: () => {
            this.loadDashboardData();
            alert('Listing deleted successfully');
          },
          error: (error: any) => {
            console.error('Error deleting listing:', error);
            alert('Failed to delete listing');
          }
        })
      );
    }
  }

  deleteService(serviceId: number) {
    if (confirm('Are you sure you want to delete this service?')) {
      this.subscriptions.add(
        this.hostService.deleteService(serviceId).subscribe({
          next: () => {
            this.loadDashboardData();
            alert('Service deleted successfully');
          },
          error: (error: any) => {
            console.error('Error deleting service:', error);
            alert('Failed to delete service');
          }
        })
      );
    }
  }

  deleteExperience(experienceId: number) {
    if (confirm('Are you sure you want to delete this experience?')) {
      this.subscriptions.add(
        this.hostService.deleteExperience(experienceId).subscribe({
          next: () => {
            this.loadDashboardData();
            alert('Experience deleted successfully');
          },
          error: (error: any) => {
            console.error('Error deleting experience:', error);
            alert('Failed to delete experience');
          }
        })
      );
    }
  }

  // Helper Methods
  getImageUrl(url: string | null | undefined): string {
    if (!url) return 'assets/default-listing.jpg';
    if (url.startsWith('http')) return url;
    if (url.includes('uploads') || url.includes('images')) {
      return `https://localhost:7020/${url}`;
    }
    return 'assets/default-listing.jpg';
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'confirmed':
      case 'completed':
        return 'status-active';
      case 'inactive':
      case 'cancelled':
        return 'status-suspended';
      case 'pending':
      case 'upcoming':
        return 'status-pending';
      default:
        return 'status-unknown';
    }
  }

  getBookingStatusText(status: string): string {
    switch (status?.toLowerCase()) {
      case 'upcoming': return 'Upcoming';
      case 'confirmed': return 'Confirmed';
      case 'cancelled': return 'Cancelled';
      case 'completed': return 'Completed';
      default: return status || 'Pending';
    }
  }

  refreshData() {
    this.loadDashboardData();
    this.loadCategories();
  }

  testEndpoints() {
    this.hostService.testEndpoints();
  }
}
