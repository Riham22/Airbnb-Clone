// components/admin-dashboard/admin-dashboard.component.ts
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AdminService } from '../../Services/Admin.service';
import { AdminListing } from '../../Models/AdminListing';
import { AdminUser } from '../../Models/AdminUser';
import { AdminStats } from '../../Models/AdminStats';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  stats: AdminStats | null = null;
  users: AdminUser[] = [];
  filteredUsers: AdminUser[] = [];
  listings: AdminListing[] = [];
  filteredListings: AdminListing[] = [];
  services: any[] = [];
  filteredServices: any[] = [];
  experiences: any[] = [];
  filteredExperiences: any[] = [];

  // Filter States
  userSearchTerm: string = '';
  userRoleFilter: string = 'All Roles';
  listingSearchTerm: string = '';
  listingStatusFilter: string = 'All Status';
  serviceSearchTerm: string = '';
  experienceSearchTerm: string = '';
  loading = false;
  activeTab: 'overview' | 'users' | 'listings' | 'services' | 'experiences' | 'categories' | 'amenities' | 'analytics' = 'overview';

  // Category Data
  propertyTypes: any[] = [];
  propertyCategories: any[] = [];
  serviceCategories: any[] = [];
  experienceCategories: any[] = [];
  experienceSubCategories: any[] = [];

  // Modal States
  showAddUserModal = false;
  showChangeRoleModal = false;
  showAddListingModal = false;
  showAddServiceModal = false;
  showAddExperienceModal = false;

  selectedUserForRole: AdminUser | null = null;
  newRoleForUser: string = '';

  // Edit Mode State
  isEditMode = false;
  currentEditId: string | null = null;

  // Form Data
  newUser: any = { firstName: '', lastName: '', email: '', password: '' };
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
    propertyCategoryId: null,
    imageUrl: ''
  };
  newService: any = {
    name: '',
    description: '',
    price: 0,
    location: '',
    serviceCategoryId: null,
    imageUrl: ''
  };
  newExperience: any = {
    name: '',
    description: '',
    price: 0,
    maxParticipants: 10,
    expCatograyId: null,
    expSubCatograyId: null,
    imageUrl: '',
    expActivities: []
  };

  newActivity: any = {
    name: '',
    describe: '', // Backend expects 'Describe'
    timeMinute: 60
  };

  // Category Management (using existing experienceCategories from line 32)
  showCategoryModal = false;
  showSubcategoryModal = false;
  categoryModalMode: 'create' | 'edit' = 'create';
  subcategoryModalMode: 'create' | 'edit' = 'create';
  selectedCategory: any = null;
  selectedSubcategory: any = null;
  newCategory: any = { name: '', description: '' };
  newSubcategory: any = { name: '', description: '', expCatograyId: null };

  selectedFile: File | null = null;

  // Amenity Modal States
  showAmenityModal = false;
  amenityModalMode: 'create' | 'edit' = 'create';
  selectedAmenity: any = null;
  newAmenity: any = { name: '', icon: '', category: 'Basic' };
  amenityList: any[] = []; // Stores available amenities

  // Pagination State
  pageSize = 7;
  currentPageUsers = 1;
  currentPageListings = 1;
  currentPageServices = 1;
  currentPageExperiences = 1;
  currentPagePropCats = 1;
  currentPageServiceCats = 1;
  currentPageExpCats = 1;
  currentPageExpSubCats = 1;
  currentPageAmenities = 1;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef
  ) { }

  // Pagination Helpers
  getPaginatedUsers(): AdminUser[] {
    const startIndex = (this.currentPageUsers - 1) * this.pageSize;
    return this.filteredUsers.slice(startIndex, startIndex + this.pageSize);
  }

  getPaginatedListings(): AdminListing[] {
    const startIndex = (this.currentPageListings - 1) * this.pageSize;
    return this.filteredListings.slice(startIndex, startIndex + this.pageSize);
  }

  getPaginatedServices(): any[] {
    const startIndex = (this.currentPageServices - 1) * this.pageSize;
    return this.filteredServices.slice(startIndex, startIndex + this.pageSize);
  }

  getPaginatedExperiences(): any[] {
    const startIndex = (this.currentPageExperiences - 1) * this.pageSize;
    return this.filteredExperiences.slice(startIndex, startIndex + this.pageSize);
  }

  getPaginatedPropertyCategories(): any[] {
    const startIndex = (this.currentPagePropCats - 1) * this.pageSize;
    return this.propertyCategories.slice(startIndex, startIndex + this.pageSize);
  }

  getPaginatedServiceCategories(): any[] {
    const startIndex = (this.currentPageServiceCats - 1) * this.pageSize;
    return this.serviceCategories.slice(startIndex, startIndex + this.pageSize);
  }

  getPaginatedExperienceCategories(): any[] {
    const startIndex = (this.currentPageExpCats - 1) * this.pageSize;
    return this.experienceCategories.slice(startIndex, startIndex + this.pageSize);
  }

  getPaginatedExperienceSubCategories(): any[] {
    const startIndex = (this.currentPageExpSubCats - 1) * this.pageSize;
    return this.experienceSubCategories.slice(startIndex, startIndex + this.pageSize);
  }

  getPaginatedAmenities(): any[] {
    const startIndex = (this.currentPageAmenities - 1) * this.pageSize;
    return this.amenityList.slice(startIndex, startIndex + this.pageSize);
  }

  changePage(type: 'users' | 'listings' | 'services' | 'experiences' | 'propcats' | 'servicecats' | 'expcats' | 'expsubcats' | 'amenities', page: number): void {
    if (type === 'users') this.currentPageUsers = page;
    if (type === 'listings') this.currentPageListings = page;
    if (type === 'services') this.currentPageServices = page;
    if (type === 'experiences') this.currentPageExperiences = page;
    if (type === 'propcats') this.currentPagePropCats = page;
    if (type === 'servicecats') this.currentPageServiceCats = page;
    if (type === 'expcats') this.currentPageExpCats = page;
    if (type === 'expsubcats') this.currentPageExpSubCats = page;
    if (type === 'amenities') this.currentPageAmenities = page;
  }

  getTotalPages(type: 'users' | 'listings' | 'services' | 'experiences' | 'propcats' | 'servicecats' | 'expcats' | 'expsubcats' | 'amenities'): number {
    let totalItems = 0;
    if (type === 'users') totalItems = this.filteredUsers.length;
    if (type === 'listings') totalItems = this.filteredListings.length;
    if (type === 'services') totalItems = this.filteredServices.length;
    if (type === 'experiences') totalItems = this.filteredExperiences.length;
    if (type === 'propcats') totalItems = this.propertyCategories.length;
    if (type === 'servicecats') totalItems = this.serviceCategories.length;
    if (type === 'expcats') totalItems = this.experienceCategories.length;
    if (type === 'expsubcats') totalItems = this.experienceSubCategories.length;
    if (type === 'amenities') totalItems = this.amenityList.length;
    return Math.ceil(totalItems / this.pageSize);
  }

  getPageArray(type: 'users' | 'listings' | 'services' | 'experiences'): number[] {
    const totalPages = this.getTotalPages(type);
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  ngOnInit() {
    console.log('🏁 Admin Dashboard Initialized');
    this.loadDashboardData();
    this.loadCategories();
    this.loadAmenities();
    this.loadCategoryData(); // Load category management data

    // Subscribe to loading state
    this.subscriptions.add(
      this.adminService.getLoadingState().subscribe(loading => {
        console.warn(`🔄 Dashboard Loading State Changed: ${loading}`); // DEBUG
        this.loading = loading;
        this.cdr.detectChanges(); // FORCE UI UPDATE
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  loadDashboardData(): void {
    console.log('🚀 loadDashboardData called (Optimized)');

    this.subscriptions.add(
      this.adminService.getDashboardData().subscribe({
        next: (data) => {
          console.log('✅ Dashboard Data Loaded Full:', data);

          if (data.stats) {
            this.stats = data.stats;
            console.log('✅ Stats Updated');
          }

          if (data.users) {
            this.users = data.users;
            this.filterUsers();
            console.log(`✅ Users Updated: ${this.users.length}`);
          }

          if (data.listings) {
            this.listings = data.listings;
            this.filterListings();
            console.log(`✅ Listings Updated: ${this.listings.length}`);
          }

          if (data.services) {
            this.services = data.services;
            this.filterServices();
            console.log(`✅ Services Updated: ${this.services.length}`);
          }

          if (data.experiences) {
            this.experiences = data.experiences;
            this.filterExperiences();
            console.log(`✅ Experiences Updated: ${this.experiences.length}`);
          }
        },
        error: (error) => {
          console.error('❌ Error loading dashboard data:', error);
        }
      })
    );
  }

  private loadCategories(): void {
    // Load property types and categories
    this.subscriptions.add(
      this.adminService.getPropertyTypes().subscribe({
        next: (types) => {
          this.propertyTypes = types;
          console.log('Loaded property types:', types);
        },
        error: (error) => console.error('Error loading property types:', error)
      })
    );

    this.subscriptions.add(
      this.adminService.getPropertyCategories().subscribe({
        next: (categories) => {
          this.propertyCategories = categories;
          console.log('Loaded property categories:', categories);
        },
        error: (error) => console.error('Error loading property categories:', error)
      })
    );

    // Load service categories
    this.subscriptions.add(
      this.adminService.getServiceCategories().subscribe({
        next: (categories) => {
          this.serviceCategories = categories;
          console.log('Loaded service categories:', categories);
        },
        error: (error) => console.error('Error loading service categories:', error)
      })
    );

    // Load experience categories
    this.subscriptions.add(
      this.adminService.getExperienceCategories().subscribe({
        next: (categories) => {
          this.experienceCategories = categories;
          console.log('Loaded experience categories:', categories);
        },
        error: (error) => console.error('Error loading experience categories:', error)
      })
    );

    // Load all experience subcategories
    this.subscriptions.add(
      this.adminService.getExperienceSubCategories().subscribe({
        next: (subCategories) => {
          this.experienceSubCategories = subCategories;
          console.log('Loaded experience subcategories:', subCategories);
        },
        error: (error) => console.error('Error loading experience subcategories:', error)
      })
    );
  }

  // Handle experience category change to filter subcategories
  onExperienceCategoryChange(): void {
    const categoryId = this.newExperience.expCatograyId;
    if (categoryId) {
      this.adminService.getExperienceSubCategories(Number(categoryId)).subscribe({
        next: (subCategories) => {
          this.experienceSubCategories = subCategories;
          // Reset subcategory selection
          this.newExperience.expSubCatograyId = null;
        },
        error: (error) => console.error('Error loading experience subcategories:', error)
      });
    }
  }

  setActiveTab(tab: 'overview' | 'users' | 'listings' | 'services' | 'experiences' | 'categories' | 'amenities' | 'analytics'): void {
    this.activeTab = tab;
  }

  // Filter Methods
  filterUsers() {
    if (!this.users) {
      this.filteredUsers = []; // Handle case where users might be undefined
      return;
    }
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = (user.firstName + ' ' + user.lastName + ' ' + user.email).toLowerCase().includes(this.userSearchTerm.toLowerCase());
      const matchesRole = this.userRoleFilter === 'All Roles' || user.role.toLowerCase() === this.userRoleFilter.toLowerCase().slice(0, -1);
      return matchesSearch && matchesRole;
    });
  }

  filterListings() {
    if (!this.listings) {
      this.filteredListings = [];
      return;
    }
    this.filteredListings = this.listings.filter(listing => {
      const matchesSearch = (listing.title + ' ' + listing.location).toLowerCase().includes(this.listingSearchTerm.toLowerCase());
      const matchesStatus = this.listingStatusFilter === 'All Status' || listing.status.toLowerCase() === this.listingStatusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }

  filterServices() {
    if (!this.services) {
      this.filteredServices = [];
      return;
    }
    this.filteredServices = this.services.filter(service => {
      return (service.name + ' ' + service.location).toLowerCase().includes(this.serviceSearchTerm.toLowerCase());
    });
  }

  filterExperiences() {
    if (!this.experiences) {
      this.filteredExperiences = [];
      return;
    }
    this.filteredExperiences = this.experiences.filter(exp => {
      return (exp.name + ' ' + exp.location).toLowerCase().includes(this.experienceSearchTerm.toLowerCase());
    });
  }

  // Modal Methods
  openAddUserModal() {
    this.isEditMode = false;
    this.currentEditId = null;
    this.showAddUserModal = true;
    this.newUser = { firstName: '', lastName: '', email: '', password: '' };
  }

  openEditUserModal(user: AdminUser) {
    this.isEditMode = true;
    this.currentEditId = user.id;
    this.newUser = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: '' // Don't populate password
    };
    this.showAddUserModal = true;
  }

  closeAddUserModal() {
    this.showAddUserModal = false;
    this.newUser = { firstName: '', lastName: '', email: '', password: '' };
    this.isEditMode = false;
    this.currentEditId = null;
  }

  // ... (Role modal methods remain same)

  // CREATE / UPDATE Methods
  addUser() {
    if (this.isEditMode && this.currentEditId) {
      // Update Logic
      const updatePayload = {
        firstName: this.newUser.firstName,
        lastName: this.newUser.lastName,
        email: this.newUser.email
        // Password only if provided? Backend specific.
      };

      this.adminService.updateUser(this.currentEditId, updatePayload).subscribe({
        next: () => {
          alert('User updated successfully');
          this.closeAddUserModal();
        },
        error: (err) => alert(`Failed to update user: ${err.message}`)
      });
      return;
    }

    // Create Logic
    const userPayload = {
      Username: this.newUser.email,
      Email: this.newUser.email,
      Password: this.newUser.password,
      FirstName: this.newUser.firstName,
      LastName: this.newUser.lastName,
      DateOfBirth: '2000-01-01'
    };

    console.log('Creating user with payload:', userPayload);

    this.adminService.createUser(userPayload).subscribe({
      next: () => {
        alert('User created successfully');
        this.closeAddUserModal();
        this.loadDashboardData();
      },
      error: (err) => {
        console.error('Create User Error:', err);
        alert(`Failed to create user: ${err.error?.message || err.message || 'Unknown error'}`);
        if (err.error?.errors) {
          console.error('Validation Errors:', err.error.errors);
        }
      }
    });
  }

  openAddListingModal() {
    this.isEditMode = false;
    this.currentEditId = null;
    this.showAddListingModal = true;
    this.newListing = {
      name: '', description: '', price: 0, location: '', maxGuests: 2,
      bedrooms: 1, beds: 1, bathrooms: 1, propertyTypeId: null, propertyCategoryId: null,
      amenityIds: []
    };
    this.selectedFiles = [];
  }

  openEditListingModal(listing: any) {
    this.isEditMode = true;
    this.currentEditId = listing.id;
    this.showAddListingModal = true;
    this.newListing = {
      name: listing.title,
      description: listing.description,
      price: listing.price,
      location: listing.location,
      maxGuests: listing.maxGuests,
      bedrooms: listing.bedrooms,
      beds: listing.beds,
      bathrooms: listing.bathrooms,
      propertyTypeId: listing.propertyTypeId,
      propertyCategoryId: listing.propertyCategoryId,
      imageUrl: listing.imageUrl,
      amenityIds: listing.amenities ? listing.amenities.map((a: any) => a.id) : []
    };
    this.selectedFiles = [];
  }

  closeAddListingModal() {
    this.showAddListingModal = false;
    this.isEditMode = false;
    this.currentEditId = null;
  }

  openAddServiceModal() {
    this.isEditMode = false;
    this.currentEditId = null;
    this.showAddServiceModal = true;
    this.newService = {
      name: '', description: '', price: 0, location: '', serviceCategoryId: null
    };
    this.selectedFiles = [];
  }

  openEditServiceModal(service: any) {
    this.isEditMode = true;
    this.currentEditId = service.id;
    this.showAddServiceModal = true;
    this.newService = {
      name: service.name,
      description: service.description,
      price: service.price,
      location: service.location,
      serviceCategoryId: service.serviceCategoryId,
      imageUrl: service.imageUrl
    };
    this.selectedFiles = [];
  }

  closeAddServiceModal() {
    this.showAddServiceModal = false;
    this.isEditMode = false;
    this.currentEditId = null;
  }

  openAddExperienceModal() {
    this.isEditMode = false;
    this.currentEditId = null;
    this.showAddExperienceModal = true;
    this.newExperience = {
      name: '', description: '', price: 0, maxParticipants: 10,
      expCatograyId: null, expSubCatograyId: null, imageUrl: '', expActivities: []
    };
    this.newActivity = { name: '', describe: '', timeMinute: 60 };
    this.selectedFiles = [];
  }

  openEditExperienceModal(exp: any) {
    this.isEditMode = true;
    this.currentEditId = exp.id;
    this.showAddExperienceModal = true;
    this.newExperience = {
      name: exp.name,
      description: exp.description,
      price: exp.price,
      location: exp.location,
      maxParticipants: exp.maxParticipants,
      expCatograyId: exp.expCatograyId,
      expSubCatograyId: exp.expSubCatograyId,
      imageUrl: exp.imageUrl,
      expActivities: exp.expActivities ? [...exp.expActivities] : []
    };
    this.newActivity = { name: '', describe: '', timeMinute: 60 };
    this.selectedFiles = [];

    // Trigger subcategory load
    if (exp.expCatograyId) {
      this.adminService.getExperienceSubCategories(exp.expCatograyId).subscribe(subs => {
        this.experienceSubCategories = subs;
      });
    }
  }

  closeAddExperienceModal() {
    this.showAddExperienceModal = false;
    this.isEditMode = false;
    this.currentEditId = null;
  }

  addActivity() {
    if (!this.newActivity.name || !this.newActivity.describe) {
      alert('Please fill in Activity Name and Description');
      return;
    }
    this.newExperience.expActivities.push({ ...this.newActivity });
    this.newActivity = { name: '', describe: '', timeMinute: 60 };
  }

  removeActivity(index: number) {
    this.newExperience.expActivities.splice(index, 1);
  }

  // Re-adding ChangeRoleModal methods
  openChangeRoleModal(user: AdminUser) {
    this.selectedUserForRole = user;
    this.newRoleForUser = user.role;
    this.showChangeRoleModal = true;
  }

  closeChangeRoleModal() {
    this.showChangeRoleModal = false;
    this.selectedUserForRole = null;
    this.newRoleForUser = '';
  }

  changeRole() {
    if (this.selectedUserForRole && this.newRoleForUser) {
      this.subscriptions.add(
        this.adminService.updateUserRole(this.selectedUserForRole.id, this.newRoleForUser).subscribe({
          next: (updatedUser) => {
            console.log('User role updated:', updatedUser);
            this.users = this.users.map(user =>
              user.id === updatedUser.id ? updatedUser : user
            );
            this.closeChangeRoleModal();
            alert('User role updated successfully');
          },
          error: (error) => {
            console.error('Error updating user role:', error);
            alert('Failed to update user role. Please try again.');
          }
        })
      );
    }
  }

  // File Selection
  selectedFiles: File[] = [];

  onFileSelected(event: any, type?: string): void {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFiles = Array.from(event.target.files);
      // Keep selectedFile for compatibility
      this.selectedFile = event.target.files[0];
    }
  }

  // Image URL Helper
  getImageUrl(url: string | null | undefined): string {
    if (!url) return 'assets/default-listing.jpg';
    if (url.startsWith('http')) return url;
    if (url.includes('uploads') || url.includes('images')) {
      return `https://localhost:7020/${url}`;
    }
    return 'assets/default-listing.jpg';
  }


  addListing() {
    const listingPayload = {
      title: this.newListing.name,
      description: this.newListing.description,
      pricePerNight: Number(this.newListing.price),
      currency: this.newListing.currency || 'USD',
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
      amenityIds: [],
      imageUrl: this.newListing.imageUrl || 'https://via.placeholder.com/400x300?text=No+Image'
    };

    if (this.isEditMode && this.currentEditId) {
      this.adminService.updateListing(this.currentEditId.toString(), listingPayload, this.selectedFiles).subscribe({
        next: () => {
          alert('Listing updated successfully');
          this.closeAddListingModal();
        },
        error: (err) => alert(`Failed to update listing: ${err.message}`)
      });
      return;
    }

    if (!this.newListing.propertyTypeId || !this.newListing.propertyCategoryId) {
      alert('Please select both Property Type and Property Category');
      return;
    }

    if (this.newListing.price <= 0) {
      alert('Price must be greater than 0');
      return;
    }

    console.log('Creating listing with payload:', listingPayload);

    this.adminService.createListing(listingPayload, this.selectedFiles).subscribe({
      next: (response: any) => {
        alert('Listing created successfully');
        this.closeAddListingModal();
        this.loadDashboardData();
      },
      error: (err) => {
        console.error('Create Listing Error:', err);
        alert(`Failed to create listing: ${err.error?.message || err.message}`);
        if (err.error?.errors) {
          console.error('Validation Errors:', err.error.errors);
        }
      }
    });
  }

  addService() {
    const servicePayload = {
      title: this.newService.name,
      description: this.newService.description,
      price: Number(this.newService.price),
      currency: 'USD',
      pricingType: 'PerHour',
      country: 'Unknown',
      city: this.newService.location,
      address: this.newService.location,
      serviceCategoryId: Number(this.newService.serviceCategoryId),
      imageUrl: this.newService.imageUrl
    };

    if (this.isEditMode && this.currentEditId) {
      this.adminService.updateService(this.currentEditId.toString(), servicePayload, this.selectedFiles).subscribe({
        next: () => {
          alert('Service updated successfully');
          this.closeAddServiceModal();
        },
        error: (err) => alert(`Failed to update service: ${err.message}`)
      });
      return;
    }

    if (!this.newService.serviceCategoryId) {
      alert('Please select a Service Category');
      return;
    }

    console.log('Creating service with payload:', servicePayload);

    this.adminService.createService(servicePayload, this.selectedFiles).subscribe({
      next: (response: any) => {
        alert('Service created successfully');
        this.closeAddServiceModal();
        this.loadDashboardData();
      },
      error: (err) => {
        console.error('Create Service Error:', err);
        alert(`Failed to create service: ${err.error?.message || err.message}`);
        if (err.error?.errors) {
          console.error('Validation Errors:', err.error.errors);
        }
      }
    });
  }

  addExperience() {
    // Create the payload
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

    if (this.isEditMode && this.currentEditId) {
      this.adminService.updateExperience(this.currentEditId.toString(), experiencePayload, this.selectedFiles).subscribe({
        next: () => {
          alert('Experience updated successfully');
          this.closeAddExperienceModal();
        },
        error: (err) => alert('Failed to update experience')
      });
      return;
    }


    // Validation
    if (!this.newExperience.expCatograyId || !this.newExperience.expSubCatograyId) {
      alert('Please select both Experience Category and Subcategory');
      return;
    }

    console.log('Category ID:', this.newExperience.expCatograyId);
    console.log('Subcategory ID:', this.newExperience.expSubCatograyId);

    this.adminService.createExperience(experiencePayload, this.selectedFiles).subscribe({
      next: (response: any) => {
        console.log('Experience created successfully:', response);
        alert('Experience created successfully');
        this.closeAddExperienceModal();
        this.loadDashboardData();
      },
      error: (err) => {
        console.error('Create Experience Error:', err);
        console.error('Full error object:', JSON.stringify(err.error, null, 2));

        // Log detailed validation errors
        if (err.error?.errors) {
          console.error('=== VALIDATION ERRORS ===');
          Object.keys(err.error.errors).forEach(key => {
            console.error(`Field: ${key}`);
            console.error(`Errors: ${err.error.errors[key].join(', ')}`);
          });
        }

        const errorMsg = err.error?.title || err.message || 'Unknown error';
        let detailedMsg = errorMsg;

        if (err.error?.errors) {
          const errorDetails = Object.keys(err.error.errors)
            .map(key => `${key}: ${err.error.errors[key].join(', ')}`)
            .join('\n');
          detailedMsg = `${errorMsg}\n\nDetails:\n${errorDetails}`;
        }

        alert(`Failed to create experience:\n${detailedMsg}`);
      }
    });
  }
  // Test API Method
  testAPIs() {
    console.log('Testing APIs...');
    this.adminService.testAllEndpoints();
  }

  suspendUser(userId: string): void {
    this.subscriptions.add(
      this.adminService.updateUserStatus(userId, 'suspended').subscribe({
        next: (updatedUser) => {
          console.log('User suspended:', updatedUser);
          this.users = this.users.map(user =>
            user.id === userId ? updatedUser : user
          );
          this.filterUsers();
        },
        error: (error) => {
          console.error('Error suspending user:', error);
          alert('Failed to suspend user. Please try again.');
        }
      })
    );
  }

  activateUser(userId: string): void {
    this.subscriptions.add(
      this.adminService.updateUserStatus(userId, 'active').subscribe({
        next: (updatedUser) => {
          console.log('User activated:', updatedUser);
          this.users = this.users.map(user =>
            user.id === userId ? updatedUser : user
          );
          this.filterUsers();
        },
        error: (error) => {
          console.error('Error activating user:', error);
          alert('Failed to activate user. Please try again.');
        }
      })
    );
  }

  deleteUser(userId: string): void {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      this.subscriptions.add(
        this.adminService.deleteUser(userId).subscribe({
          next: (success) => {
            if (success) {
              this.users = this.users.filter(user => user.id !== userId);
              this.loadDashboardData();
              alert('User deleted successfully');
            }
          },
          error: (error) => {
            console.error('Error deleting user:', error);
            alert('Failed to delete user. Please try again.');
          }
        })
      );
    }
  }

  // Listing (Property) actions
  approveListing(listingId: string): void {
    this.subscriptions.add(
      this.adminService.updateListingStatus(listingId, 'active').subscribe({
        next: () => {
          // console.log('Listing approved');
          alert('Listing approved successfully');
          this.loadDashboardData();
        },
        error: (error) => {
          console.error('Error approving listing:', error);
          alert(`Failed to approve listing. Status: ${error.status}, Message: ${error.error?.message || error.message}`);
        }
      })
    );
  }

  suspendListing(listingId: string): void {
    this.subscriptions.add(
      this.adminService.updateListingStatus(listingId, 'suspended').subscribe({
        next: () => {
          // console.log('Listing suspended');
          alert('Listing suspended successfully');
          this.loadDashboardData();
        },
        error: (error) => {
          console.error('Error suspending listing:', error);
          alert('Failed to suspend listing. Please try again.');
        }
      })
    );
  }

  deleteListing(listingId: string): void {
    if (confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      this.subscriptions.add(
        this.adminService.deleteListing(listingId).subscribe({
          next: (success) => {
            if (success) {
              this.listings = this.listings.filter(listing => listing.id !== listingId);
              this.loadDashboardData();
              alert('Listing deleted successfully');
            }
          },
          error: (error) => {
            console.error('Error deleting listing:', error);
            const errorMessage = error.error?.message || error.message || 'Failed to delete listing. Please try again.';
            alert(errorMessage);
          }
        })
      );
    }
  }

  // Service actions
  approveService(serviceId: string): void {
    this.subscriptions.add(
      this.adminService.updateServiceStatus(serviceId, 'active').subscribe({
        next: () => {
          alert('Service published successfully!');
          this.loadDashboardData(); // Reload to refresh list
        },
        error: (error) => {
          console.error('Error approving service:', error);
          alert(`Failed to publish service. Status: ${error.status}, Message: ${error.error?.message || error.message}`);
        }
      })
    );
  }

  suspendService(serviceId: string): void {
    this.subscriptions.add(
      this.adminService.updateServiceStatus(serviceId, 'suspended').subscribe({
        next: () => {
          alert('Service unpublished successfully!');
          this.loadDashboardData();
        },
        error: (error) => {
          console.error('Error suspending service:', error);
          alert(`Failed to unpublish service. Status: ${error.status}, Message: ${error.error?.message || error.message}`);
        }
      })
    );
  }

  deleteService(serviceId: string): void {
    if (confirm('Are you sure you want to delete this service?')) {
      this.subscriptions.add(
        this.adminService.deleteService(serviceId).subscribe({
          next: () => {
            this.services = this.services.filter(s => s.id !== serviceId);
            alert('Service deleted successfully');
          },
          error: (error) => {
            console.error('Error deleting service:', error);
            const errorMessage = error.error?.message || error.message || 'Failed to delete service';
            alert(errorMessage);
          }
        })
      );
    }
  }

  // Experience actions
  approveExperience(experienceId: string): void {
    this.subscriptions.add(
      this.adminService.updateExperienceStatus(experienceId, 'active').subscribe({
        next: () => {
          alert('Experience published successfully!');
          this.loadDashboardData();
        },
        error: (error) => {
          console.error('Error approving experience:', error);
          alert(`Failed to publish experience. Status: ${error.status}, Message: ${error.error?.message || error.message}`);
        }
      })
    );
  }

  suspendExperience(experienceId: string): void {
    this.subscriptions.add(
      this.adminService.updateExperienceStatus(experienceId, 'suspended').subscribe({
        next: () => {
          alert('Experience unpublished successfully!');
          this.loadDashboardData();
        },
        error: (error) => {
          console.error('Error suspending experience:', error);
          alert('Failed to unpublish experience.');
        }
      })
    );
  }

  deleteExperience(experienceId: string): void {
    if (confirm('Are you sure you want to delete this experience?')) {
      this.subscriptions.add(
        this.adminService.deleteExperience(experienceId).subscribe({
          next: () => {
            this.experiences = this.experiences.filter(e => e.id !== experienceId);
            alert('Experience deleted successfully');
          },
          error: (error) => {
            console.error('Error deleting experience:', error);
            alert('Failed to delete experience');
          }
        })
      );
    }
  }

  // Helper methods for template
  getUserStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'status-active';
      case 'suspended': return 'status-suspended';
      case 'pending': return 'status-pending';
      default: return 'status-unknown';
    }
  }

  getListingStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'status-active';
      case 'suspended': return 'status-suspended';
      case 'pending': return 'status-pending';
      default: return 'status-unknown';
    }
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'host': return 'badge-host';
      case 'guest': return 'badge-guest';
      case 'admin': return 'badge-admin';
      default: return 'badge-unknown';
    }
  }

  // ============================================
  // CATEGORY MANAGEMENT METHODS
  // ============================================

  categoryType: 'experience' | 'service' | 'property' = 'experience';

  loadCategoryData(): void {
    this.subscriptions.add(
      this.adminService.getExperienceCategories().subscribe({
        next: (categories) => {
          this.experienceCategories = categories;
        },
        error: (error) => console.error('Error loading experience categories:', error)
      })
    );

    this.subscriptions.add(
      this.adminService.getServiceCategories().subscribe({
        next: (categories) => {
          this.serviceCategories = categories;
        },
        error: (error) => console.error('Error loading service categories:', error)
      })
    );

    this.subscriptions.add(
      this.adminService.getExperienceSubcategories().subscribe({
        next: (subcategories) => {
          this.experienceSubCategories = subcategories; // Fixed: capital C to match line 33
        },
        error: (error) => console.error('Error loading subcategories:', error)
      })
    );
  }

  // Category Methods
  openAddCategoryModal(type: 'experience' | 'service' | 'property' = 'experience'): void {
    this.categoryType = type;
    this.categoryModalMode = 'create';
    this.newCategory = { name: '', description: '' };
    this.showCategoryModal = true;
  }

  openEditCategoryModal(category: any, type: 'experience' | 'service' | 'property' = 'experience'): void {
    this.categoryType = type;
    this.categoryModalMode = 'edit';
    this.selectedCategory = category;
    this.newCategory = { ...category };
    this.showCategoryModal = true;
  }

  closeAddCategoryModal(): void {
    this.showCategoryModal = false;
    this.newCategory = { name: '', description: '' };
    this.selectedCategory = null;
  }

  saveCategory(): void {
    // Shared Validation: Uniqueness Check
    // We only enforce uniqueness for the current type being added
    let isUnique = true;
    if (this.categoryType === 'service') {
      const existing = this.serviceCategories.find(c =>
        c.name.toLowerCase() === this.newCategory.name.toLowerCase() &&
        (this.categoryModalMode === 'create' || c.id !== this.selectedCategory?.id)
      );
      if (existing) isUnique = false;
    } else if (this.categoryType === 'property') {
      const existing = this.propertyCategories.find(c =>
        c.name.toLowerCase() === this.newCategory.name.toLowerCase() &&
        (this.categoryModalMode === 'create' || c.id !== this.selectedCategory?.id)
      );
      if (existing) isUnique = false;
    } else {
      // Experience Category Uniqueness
      const existing = this.experienceCategories.find(c =>
        c.name.toLowerCase() === this.newCategory.name.toLowerCase() &&
        (this.categoryModalMode === 'create' || c.id !== this.selectedCategory?.id)
      );
      if (existing) isUnique = false;
    }

    if (!isUnique) {
      alert(`Category name "${this.newCategory.name}" already exists. Please choose a unique name.`);
      return;
    }

    if (this.categoryType === 'experience') {
      if (this.categoryModalMode === 'create') {
        this.subscriptions.add(
          this.adminService.createExperienceCategory(this.newCategory).subscribe({
            next: () => {
              alert('Experience Category created successfully');
              this.closeAddCategoryModal();
              this.loadCategoryData();
            },
            error: (error) => {
              console.error('Error creating category:', error);
              alert(`Failed to create category: ${error.error?.message || error.message}`);
            }
          })
        );
      } else {
        this.subscriptions.add(
          this.adminService.updateExperienceCategory(this.selectedCategory.id, this.newCategory).subscribe({
            next: () => {
              // alert('Experience Category updated successfully'); // Removed for auto-close
              alert('Experience Category updated successfully');
              this.closeAddCategoryModal();
              this.loadCategoryData();
            },
            error: (error) => {
              console.error('Error updating category:', error);
              alert(`Failed to update category: ${error.error?.message || error.message}`);
            }
          })
        );
      }
    } else if (this.categoryType === 'property') {
      // Property Category Logic
      if (this.categoryModalMode === 'create') {
        this.subscriptions.add(
          this.adminService.createPropertyCategory(this.newCategory).subscribe({
            next: () => {
              // alert('Property Category created successfully');
              alert('Property Category created successfully');
              this.closeAddCategoryModal();
              this.loadCategories(); // Refresh property categories
            },
            error: (error) => {
              console.error('Error creating property category:', error);
              alert(`Failed to create category: ${error.message}`);
            }
          })
        );
      } else {
        this.subscriptions.add(
          this.adminService.updatePropertyCategory(this.selectedCategory.id, this.newCategory).subscribe({
            next: () => {
              alert('Property Category updated successfully');
              this.closeAddCategoryModal();
              this.loadCategories(); // Refresh property categories
            },
            error: (error) => {
              console.error('Error updating property category:', error);
              alert(`Failed to update category: ${error.message}`);
            }
          })
        );
      }
    } else {
      // Service Category Logic
      if (this.categoryModalMode === 'create') {
        this.subscriptions.add(
          this.adminService.createServiceCategory(this.newCategory).subscribe({
            next: () => {
              alert('Service Category created successfully');
              this.closeAddCategoryModal();
              this.loadCategoryData();
            },
            error: (error) => {
              console.error('Error creating service category:', error);
              alert(`Failed to create category: ${error.error?.message || error.message}`);
            }
          })
        );
      } else {
        this.subscriptions.add(
          this.adminService.updateServiceCategory(this.selectedCategory.id, this.newCategory).subscribe({
            next: () => {
              // alert('Service Category updated successfully'); // Removed for auto-close
              alert('Service Category updated successfully');
              this.closeAddCategoryModal();
              this.loadCategoryData();
            },
            error: (error) => {
              console.error('Error updating service category:', error);
              alert(`Failed to update category: ${error.error?.message || error.message}`);
            }
          })
        );
      }
    }
  }


  toggleAmenitySelection(amenityId: number, event: any): void {
    if (!this.newListing.amenityIds) {
      this.newListing.amenityIds = [];
    }
    const checked = event.target.checked;
    if (checked) {
      this.newListing.amenityIds.push(amenityId);
    } else {
      const index = this.newListing.amenityIds.indexOf(amenityId);
      if (index > -1) {
        this.newListing.amenityIds.splice(index, 1);
      }
    }
  }

  deleteCategory(categoryId: number): void {
    if (confirm('Are you sure you want to delete this category? This may affect related subcategories.')) {
      this.subscriptions.add(
        this.adminService.deleteExperienceCategory(categoryId).subscribe({
          next: () => {
            alert('Category deleted successfully');
            this.loadCategoryData();
          },
          error: (error) => {
            console.error('Error deleting category:', error);
            if (error.status === 403) {
              alert('Cannot delete this category - you do not have permission.');
            } else {
              alert(`Failed to delete category: ${error.error?.message || error.message}`);
            }
          }
        })
      );
    }
  }

  deleteServiceCategory(categoryId: number): void {
    if (confirm('Are you sure you want to delete this service category?')) {
      this.subscriptions.add(
        this.adminService.deleteServiceCategory(categoryId).subscribe({
          next: () => {
            alert('Service Category deleted successfully');
            this.loadCategoryData();
          },
          error: (error) => {
            console.error('Error deleting service category:', error);
            if (error.status === 403) {
              alert('Cannot delete this category because it is being used by existing services.');
            } else {
              alert(`Failed to delete category: ${error.error?.message || error.message}`);
            }
          }
        })
      );
    }
  }

  deletePropertyCategory(categoryId: number): void {
    if (confirm('Are you sure you want to delete this property category?')) {
      this.subscriptions.add(
        this.adminService.deletePropertyCategory(categoryId).subscribe({
          next: () => {
            alert('Property Category deleted successfully');
            this.loadCategories(); // Refresh list
          },
          error: (error) => {
            console.error('Error deleting property category:', error);
            alert(`Failed to delete category: ${error.message}`);
          }
        })
      );
    }
  }

  // Experience Subcategory Methods
  openAddSubcategoryModal(): void {
    this.subcategoryModalMode = 'create';
    this.newSubcategory = { name: '', description: '', expCatograyId: null };
    this.showSubcategoryModal = true;
  }

  // Amenity Methods
  openAddAmenityModal(): void {
    this.amenityModalMode = 'create';
    this.newAmenity = { name: '', icon: '', category: 'Basic' };
    this.showAmenityModal = true;
  }

  openEditAmenityModal(amenity: any): void {
    this.amenityModalMode = 'edit';
    this.selectedAmenity = amenity;
    this.newAmenity = { ...amenity };
    this.showAmenityModal = true;
  }

  closeAmenityModal(): void {
    this.showAmenityModal = false;
    this.selectedAmenity = null;
    this.newAmenity = { name: '', icon: '', category: 'Basic' };
  }

  saveAmenity(): void {
    if (this.amenityModalMode === 'create') {
      this.subscriptions.add(
        this.adminService.createAmenity(this.newAmenity).subscribe({
          next: () => {
            this.closeAmenityModal();
            this.loadAmenities(); // Refresh list
            alert('Amenity created successfully');
          },
          error: (error) => {
            console.error('Error creating amenity:', error);
            alert(`Failed to create amenity: ${error.message}`);
          }
        })
      );
    } else {
      this.subscriptions.add(
        this.adminService.updateAmenity(this.selectedAmenity.id, this.newAmenity).subscribe({
          next: () => {
            this.closeAmenityModal();
            this.loadAmenities(); // Refresh list
            alert('Amenity updated successfully');
          },
          error: (error) => {
            console.error('Error updating amenity:', error);
            alert(`Failed to update amenity: ${error.message}`);
          }
        })
      );
    }
  }

  deleteAmenity(amenityId: number): void {
    if (confirm('Are you sure you want to delete this amenity? Property listings using it may be affected.')) {
      this.subscriptions.add(
        this.adminService.deleteAmenity(amenityId).subscribe({
          next: () => {
            alert('Amenity deleted successfully');
            this.loadAmenities();
          },
          error: (error) => {
            console.error('Error deleting amenity:', error);
            alert(`Failed to delete amenity: ${error.message}`);
          }
        })
      );
    }
  }

  loadAmenities(): void {
    this.subscriptions.add(
      this.adminService.getAmenities().subscribe({
        next: (amenities) => {
          this.amenityList = amenities;
          console.log('Loaded amenities:', amenities);
        },
        error: (err) => console.error('Error loading amenities:', err)
      })
    );
  }


  openEditSubcategoryModal(subcategory: any): void {
    this.subcategoryModalMode = 'edit';
    this.selectedSubcategory = subcategory;
    this.newSubcategory = { ...subcategory };
    this.showSubcategoryModal = true;
  }

  closeAddSubcategoryModal(): void {
    this.showSubcategoryModal = false;
    this.newSubcategory = { name: '', description: '', expCatograyId: null };
    this.selectedSubcategory = null;
  }

  saveSubcategory(): void {
    const existing = this.experienceSubCategories.find(s =>
      s.name.toLowerCase() === this.newSubcategory.name.toLowerCase() &&
      (this.subcategoryModalMode === 'create' || s.id !== this.selectedSubcategory?.id)
    );

    if (existing) {
      alert(`Subcategory "${this.newSubcategory.name}" already exists.`);
      return;
    }

    if (this.subcategoryModalMode === 'create') {
      this.subscriptions.add(
        this.adminService.createExperienceSubcategory(this.newSubcategory).subscribe({
          next: () => {
            alert('Subcategory created successfully');
            this.closeAddSubcategoryModal();
            this.loadCategoryData();
          },
          error: (error) => {
            console.error('Error creating subcategory:', error);
            alert(`Failed to create subcategory: ${error.error?.message || error.message}`);
          }
        })
      );
    } else {
      this.subscriptions.add(
        this.adminService.updateExperienceSubcategory(this.selectedSubcategory.id, this.newSubcategory).subscribe({
          next: () => {
            alert('Subcategory updated successfully');
            this.closeAddSubcategoryModal();
            this.loadCategoryData();
          },
          error: (error) => {
            console.error('Error updating subcategory:', error);
            alert(`Failed to update subcategory: ${error.error?.message || error.message}`);
          }
        })
      );
    }
  }

  deleteSubcategory(subcategoryId: number): void {
    if (confirm('Are you sure you want to delete this subcategory?')) {
      this.subscriptions.add(
        this.adminService.deleteExperienceSubcategory(subcategoryId).subscribe({
          next: () => {
            alert('Subcategory deleted successfully');
            this.loadCategoryData();
          },
          error: (error) => {
            console.error('Error deleting subcategory:', error);
            if (error.status === 403) {
              alert('Cannot delete this subcategory - you do not have permission.');
            } else {
              alert(`Failed to delete subcategory: ${error.error?.message || error.message}`);
            }
          }
        })
      );
    }
  }

  getCategoryName(categoryId: number): string {
    const category = this.experienceCategories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown';
  }
}
