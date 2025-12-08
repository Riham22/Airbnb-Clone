// components/admin-dashboard/admin-dashboard.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AdminService } from '../../Services/Admin.service';
import { AdminStats } from '../../Models/AdminStats';
import { AdminUser } from '../../Models/AdminUser';
import { AdminListing } from '../../Models/AdminListing';

// Define interfaces based on your API response
// interface AdminStats {
//   totalUsers: number;
//   totalListings: number;
//   totalBookings: number;
//   totalRevenue: number;
//   pendingVerifications: number;
//   activeHosts: number;
// }

// interface AdminUser {
//   id: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   role: string;
//   status: string;
//   avatar?: string;
//   joinedDate: string;
//   listingsCount: number;
//   bookingsCount: number;
// }

// interface AdminListing {
//   id: string;
//   title: string;
//   description: string;
//   price: number;
//   location: string;
//   type: string;
//   rating: number;
//   reviewCount: number;
//   status: string;
//   images: string[];
//   host: string;
//   createdAt: string;
// }

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
  listings: AdminListing[] = [];
  services: any[] = [];
  experiences: any[] = [];
  loading = false;
  propertyTypes: any[] = [];
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
  newRoleForUser: 'admin'|'guest'|'host'= 'guest';

  // Form Data
  newUser: any = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'guest',
    dateOfBirth: '2000-01-01'
  };

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
    duration: '1 hour',
    serviceCategoryId: null,
    imageUrl: ''
  };

  newExperience: any = {
    name: '',
    description: '',
    price: 0,
    location: '',
    maxParticipants: 10,
    duration: '2 hours',
    meetingPoint: '',
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

  private subscriptions: Subscription = new Subscription();

  constructor(private adminService: AdminService) { }

  ngOnInit() {
    this.loadDashboardData();
    this.loadCategories();
    this.loadCategoryData(); // Load category management data

    // Subscribe to loading state
    this.subscriptions.add(
      this.adminService.getLoadingState().subscribe(loading => {
        this.loading = loading;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  // Load all dashboard data
  loadDashboardData(): void {
    this.loading = true;

    // Load stats
    this.subscriptions.add(
      this.adminService.getStats().subscribe({
        next: (stats) => {
          this.stats = stats;
          console.log('Stats loaded:', stats);
        },
        error: (error) => {
          console.error('Error loading stats:', error);
          // Set default stats if API fails
          this.stats = {
            totalUsers: 0,
            totalListings: 0,
            totalBookings: 0,
            totalRevenue: 0,
            monthlyGrowth: 0,
            pendingVerifications: 0,
            activeHosts: 0
          };
        },
        complete: () => {
          this.loading = false;
        }
      })
    );

    // Load users
    this.subscriptions.add(
      this.adminService.getUsers().subscribe({
        next: (users) => {
          this.users = this.formatUsers(users);
          console.log('Users loaded:', this.users);
        },
        error: (error) => {
          console.error('Error loading users:', error);
          this.users = [];
        }
      })
    );

    // Load listings
    this.subscriptions.add(
      this.adminService.getListings().subscribe({
        next: (listings) => {
          this.listings = this.formatListings(listings);
          console.log('Listings loaded:', this.listings);
        },
        error: (error) => {
          console.error('Error loading listings:', error);
          this.listings = [];
        }
      })
    );

    // Load services
    this.subscriptions.add(
      this.adminService.getServices().subscribe({
        next: (services) => {
          this.services = this.formatServices(services);
          console.log('Services loaded:', this.services);
        },
        error: (error) => {
          console.error('Error loading services:', error);
          this.services = [];
        }
      })
    );

    // Load experiences
    this.subscriptions.add(
      this.adminService.getExperiences().subscribe({
        next: (experiences) => {
          this.experiences = this.formatExperiences(experiences);
          console.log('Experiences loaded:', this.experiences);
        },
        error: (error) => {
          console.error('Error loading experiences:', error);
          this.experiences = [];
        }
      })
    );
  }

  // Format API responses to match component expectations
  private formatUsers(users: any[]): AdminUser[] {
    return users.map(user => ({
      id: user.id || user.userId || user.Id,
      firstName: user.firstName || user.firstname || 'Unknown',
      lastName: user.lastName || user.lastname || 'User',
      email: user.email || user.Email || 'No email',
      role: user.role || user.Role || 'guest',
      status: user.status || user.Status || 'active',
      avatar: user.avatar || user.profileImage || '/assets/default-avatar.png',
      joinedDate: user.joinedDate || user.createdAt || user.dateCreated || new Date().toISOString(),
      listingsCount: user.listingsCount || user.propertiesCount || 0,
      bookingsCount: user.bookingsCount || user.reservationsCount || 0
    }));
  }

  private formatListings(listings: any[]): AdminListing[] {
    return listings.map(listing => ({
      id: listing.id || listing.propertyId || listing.Id,
      title: listing.title || listing.name || 'Untitled Listing',
      description: listing.description || listing.Description || '',
      price: listing.price || listing.pricePerNight || listing.Price || 0,
      location: listing.location || listing.address || listing.city || 'Unknown Location',
      type: listing.type || listing.propertyType || 'Apartment',
      rating: listing.rating || listing.averageRating || 0,
      reviewCount: listing.reviewCount || listing.reviewsCount || 0,
      status: listing.status || listing.Status || 'active',
      images: listing.images || listing.imageUrls || [listing.imageUrl] || [],
      host: listing.host || listing.ownerName || listing.userName || 'Unknown Host',
      createdAt: listing.createdAt || listing.dateCreated || new Date().toISOString()
    }));
  }

  private formatServices(services: any[]): any[] {
    return services.map(service => ({
      id: service.id || service.serviceId || service.Id,
      name: service.name || service.title || 'Unnamed Service',
      description: service.description || service.Description || '',
      price: service.price || service.Price || 0,
      location: service.location || service.address || service.city || 'Unknown',
      category: service.category || service.serviceCategory || 'General',
      rating: service.rating || service.averageRating || 0,
      reviewCount: service.reviewCount || service.reviewsCount || 0,
      imageUrl: service.imageUrl || service.image || service.ImageUrl || '/assets/default-service.jpg',
      provider: service.provider || service.user || { name: 'Unknown' }
    }));
  }

  private formatExperiences(experiences: any[]): any[] {
    return experiences.map(exp => ({
      id: exp.id || exp.experienceId || exp.Id,
      name: exp.name || exp.title || exp.Name || 'Unnamed Experience',
      description: exp.description || exp.Description || '',
      price: exp.price || exp.GuestPrice || exp.Price || 0,
      location: exp.location || exp.Location || 'Unknown',
      category: exp.category || exp.Category || 'General',
      rating: exp.rating || exp.averageRating || 0,
      reviewCount: exp.reviewCount || exp.reviewsCount || 0,
      imageUrl: exp.imageUrl || exp.image || exp.ImageUrl || '/assets/default-experience.jpg',
      host: exp.host || exp.user || { name: 'Unknown' }
    }));
  }

  // Load categories
  private loadCategories(): void {
    // Load property types and categories
    this.subscriptions.add(
      this.adminService.getPropertyTypes().subscribe({
        next: (types) => {
          this.propertyTypes = types;
          console.log('Property types loaded:', types);
        },
        error: (error) => {
          console.error('Error loading property types:', error);
          this.propertyTypes = [];
        }
      })
    );

    this.subscriptions.add(
      this.adminService.getPropertyCategories().subscribe({
        next: (categories) => {
          this.propertyCategories = categories;
          console.log('Property categories loaded:', categories);
        },
        error: (error) => {
          console.error('Error loading property categories:', error);
          this.propertyCategories = [];
        }
      })
    );

    // Load service categories
    this.subscriptions.add(
      this.adminService.getServiceCategories().subscribe({
        next: (categories) => {
          this.serviceCategories = categories;
          console.log('Service categories loaded:', categories);
        },
        error: (error) => {
          console.error('Error loading service categories:', error);
          this.serviceCategories = [];
        }
      })
    );

    // Load experience categories
    this.subscriptions.add(
      this.adminService.getExperienceCategories().subscribe({
        next: (categories) => {
          this.experienceCategories = categories;
          console.log('Experience categories loaded:', categories);
        },
        error: (error) => {
          console.error('Error loading experience categories:', error);
          this.experienceCategories = [];
        }
      })
    );

    // Load all experience subcategories initially
    this.subscriptions.add(
      this.adminService.getExperienceSubCategories().subscribe({
        next: (subCategories) => {
          this.experienceSubCategories = subCategories;
          console.log('Experience subcategories loaded:', subCategories);
        },
        error: (error) => {
          console.error('Error loading experience subcategories:', error);
          this.experienceSubCategories = [];
        }
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
          this.newExperience.expSubCatograyId = null;
        },
        error: (error) => {
          console.error('Error loading experience subcategories:', error);
          this.experienceSubCategories = [];
        }
      });
    }
  }

  setActiveTab(tab: 'overview' | 'users' | 'listings' | 'services' | 'experiences' | 'categories' | 'analytics'): void {
    this.activeTab = tab;
  }

  // Modal Methods
  openAddUserModal() {
    this.newUser = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'guest',
      dateOfBirth: '2000-01-01'
    };
    this.showAddUserModal = true;
  }

  closeAddUserModal() {
    this.showAddUserModal = false;
  }

  openChangeRoleModal(user: AdminUser) {
    this.selectedUserForRole = user;
    this.newRoleForUser = user.role;
    this.showChangeRoleModal = true;
  }

  closeChangeRoleModal() {
    this.showChangeRoleModal = false;
    this.selectedUserForRole = null;
    this.newRoleForUser ='guest';
  }

  openAddListingModal() {
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
      propertyCategoryId: null,
      imageUrl: ''
    };
    this.selectedFile = null;
    this.selectedFiles = [];
  }

  openAddServiceModal() {
    this.newService = {
      name: '',
      description: '',
      price: 0,
      location: '',
      duration: '1 hour',
      serviceCategoryId: null,
      imageUrl: ''
    };
    this.selectedFile = null;
      description: '',
      price: 0,
      maxParticipants: 10,
      duration: '2 hours',
      meetingPoint: '',
      expCatograyId: null,
      expSubCatograyId: null,


      imageUrl: '',
      expActivities: []
    };
    this.newActivity = { name: '', describe: '', timeMinute: 60 };

    this.selectedFile = null;
    this.selectedFiles = [];
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
    if (!url || url === '') return 'assets/default-listing.jpg';
    if (url.startsWith('http') || url.startsWith('https')) return url;
    if (url.startsWith('data:image')) return url;
    if (url.includes('uploads') || url.includes('images') || url.includes('wwwroot')) {
      return `https://localhost:7020/${url.replace(/\\/g, '/')}`;
    }
    return 'assets/default-listing.jpg';
  }

  // CREATE METHODS
  addUser() {
    this.loading = true;

    const userPayload = {
      Username: this.newUser.email,
      Email: this.newUser.email,
      Password: this.newUser.password,
      FirstName: this.newUser.firstName,
      LastName: this.newUser.lastName,
      DateOfBirth: this.newUser.dateOfBirth,
      Role: this.newUser.role
    };

    console.log('Creating user with payload:', userPayload);

    this.adminService.createUser(userPayload).subscribe({
      next: (response) => {
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
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  changeRole() {
    if (this.selectedUserForRole && this.newRoleForUser) {
      this.loading = true;

      this.adminService.updateUserRole(this.selectedUserForRole.id, this.newRoleForUser).subscribe({
        next: (updatedUser) => {
          console.log('User role updated:', updatedUser);
          this.users = this.users.map(user =>
            user.id === this.selectedUserForRole!.id ? { ...user, role: this.newRoleForUser } : user
          );
          this.closeChangeRoleModal();
          alert('User role updated successfully');
        },
        error: (error) => {
          console.error('Error updating user role:', error);
          alert('Failed to update user role. Please try again.');
        },
        complete: () => {
          this.loading = false;
        }
      });
    }
  }

  addListing() {
    if (!this.newListing.propertyTypeId || !this.newListing.propertyCategoryId) {
      alert('Please select both Property Type and Property Category');
      return;
    }

    this.loading = true;

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
      amenityIds: [],
      imageUrl: this.newListing.imageUrl || 'https://via.placeholder.com/400x300?text=No+Image'
    };

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
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  addService() {
    if (!this.newService.serviceCategoryId) {
      alert('Please select a Service Category');
      return;
    }

    this.loading = true;

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
      imageUrl: this.newService.imageUrl,
      duration: this.newService.duration
    };

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
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  // Replace your addExperience() method in admin-dashboard.component.ts with this:

  addExperience() {
    // Validation
    if (!this.newExperience.expCatograyId || !this.newExperience.expSubCatograyId) {
      alert('Please select both Experience Category and Subcategory');
      return;
    }



    // Create the payload - NOT wrapped, send directly
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

    console.log('Category ID:', this.newExperience.expCatograyId);
    console.log('Subcategory ID:', this.newExperience.expSubCatograyId);

    this.adminService.createExperience(experiencePayload, this.selectedFiles).subscribe({
      next: (response: any) => {


        const experienceId = response?.id || response?.Id || response?.experienceId;
        if (experienceId && this.selectedFile) {
          this.adminService.uploadExperienceImage(experienceId, this.selectedFile).subscribe({
            next: () => {
              alert('Experience and image created successfully');
              this.closeAddExperienceModal();
              this.loadDashboardData();
        console.error('Full error object:', JSON.stringify(err.error, null, 2));

        // Log detailed validation errors
        if (err.error?.errors) {
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
    if (confirm('Are you sure you want to suspend this user?')) {
      this.loading = true;
      this.adminService.updateUserStatus(userId, 'suspended').subscribe({
        next: (updatedUser) => {
          console.log('User suspended:', updatedUser);
          this.users = this.users.map(user =>
            user.id === userId ? { ...user, status: 'suspended' } : user
          );
          alert('User suspended successfully');
        },
        error: (error) => {
          console.error('Error suspending user:', error);
          alert('Failed to suspend user. Please try again.');
        },
        complete: () => {
          this.loading = false;
        }
      });
    }
  }

  activateUser(userId: string): void {
    if (confirm('Are you sure you want to activate this user?')) {
      this.loading = true;
      this.adminService.updateUserStatus(userId, 'active').subscribe({
        next: (updatedUser) => {
          console.log('User activated:', updatedUser);
          this.users = this.users.map(user =>
            user.id === userId ? { ...user, status: 'active' } : user
          );
          alert('User activated successfully');
        },
        error: (error) => {
          console.error('Error activating user:', error);
          alert('Failed to activate user. Please try again.');
        },
        complete: () => {
          this.loading = false;
        }
      });
    }
  }

  deleteUser(userId: string): void {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      this.loading = true;
      this.adminService.deleteUser(userId).subscribe({
        next: (success) => {
          if (success) {
            this.users = this.users.filter(user => user.id !== userId);
            alert('User deleted successfully');
          }
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          alert('Failed to delete user. Please try again.');
        },
        complete: () => {
          this.loading = false;
        }
      });
    }
  }


  suspendListing(listingId: string): void {
    if (confirm('Are you sure you want to suspend this listing?')) {
      this.loading = true;

      next: (updatedListing) => {
          console.log('Listing approved:', updatedListing);
          this.listings = this.listings.map(listing =>
          );
          alert('Listing suspended successfully');
        },
        error: (error) => {
          console.error('Error approving listing:', error);
          alert(`Failed to approve listing. Status: ${error.status}, Message: ${error.error?.message || error.message}`);
        }
      this.loading = true;
      this.adminService.updateListingStatus(listingId, 'active').subscribe({
  suspendListing(listingId: string): void {
    this.subscriptions.add(
      this.adminService.updateListingStatus(listingId, 'suspended').subscribe({

        next: (updatedListing) => {
          console.log('Listing suspended:', updatedListing);
          this.listings = this.listings.map(listing =>
            listing.id === listingId ? { ...listing, status: 'active' } : listing
          );
          alert('Listing approved successfully');
        },
        error: (error) => {

          
          console.error('Error suspending listing:', error);
  deleteListing(listingId: string): void {
    if (confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      this.adminService.deleteListing(listingId).subscribe({
        next: (success) => {
          if (success) {
            this.listings = this.listings.filter(listing => listing.id !== listingId);
            alert('Listing deleted successfully');
          }
        },
        error: (error) => {
          console.error('Error deleting listing:', error);
          alert('Failed to delete listing. Please try again.');
        },
        complete: () => {
          this.loading = false;
        }
      });
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
      this.loading = true;
      this.adminService.deleteService(serviceId).subscribe({
        next: () => {
          this.services = this.services.filter(s => s.id !== serviceId);
          alert('Service deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting service:', error);
          alert('Failed to delete service');
        },
        complete: () => {
          this.loading = false;
        }
      });
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
      this.loading = true;
      this.adminService.deleteExperience(experienceId).subscribe({
        next: () => {
          this.experiences = this.experiences.filter(e => e.id !== experienceId);
          alert('Experience deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting experience:', error);
          alert('Failed to delete experience');
        },
        complete: () => {
          this.loading = false;
        }
      });
    }
  }

  // Helper methods for template
  getUserStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active': return 'status-active';
      case 'suspended': return 'status-suspended';
      case 'pending': return 'status-pending';
      case 'inactive': return 'status-suspended';
      default: return 'status-unknown';
    }
  }

  getListingStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active': return 'status-active';
      case 'suspended': return 'status-suspended';
      case 'pending': return 'status-pending';
      case 'inactive': return 'status-suspended';
      case 'approved': return 'status-active';
      default: return 'status-unknown';
    }
  }

  getRoleBadgeClass(role: string): string {
    switch (role?.toLowerCase()) {
      case 'host': return 'badge-host';
      case 'guest': return 'badge-guest';
      case 'admin': return 'badge-admin';
      case 'administrator': return 'badge-admin';
      default: return 'badge-unknown';
    }
  }
<<<<<<< HEAD
}
=======

  // ============================================
  // CATEGORY MANAGEMENT METHODS
  // ============================================

  loadCategoryData(): void {
    this.subscriptions.add(
      this.adminService.getExperienceCategories().subscribe({
        next: (categories) => {
          this.experienceCategories = categories;
        },
        error: (error) => console.error('Error loading categories:', error)
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

  // Experience Category Methods
  openAddCategoryModal(): void {
    this.categoryModalMode = 'create';
    this.newCategory = { name: '', description: '' };
    this.showCategoryModal = true;
  }

  openEditCategoryModal(category: any): void {
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
    if (this.categoryModalMode === 'create') {
      this.subscriptions.add(
        this.adminService.createExperienceCategory(this.newCategory).subscribe({
          next: () => {
            alert('Category created successfully');
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
            alert('Category updated successfully');
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

  // Experience Subcategory Methods
  openAddSubcategoryModal(): void {
    this.subcategoryModalMode = 'create';
    this.newSubcategory = { name: '', description: '', expCatograyId: null };
    this.showSubcategoryModal = true;
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
>>>>>>> 6c1b37138f6275b6b13adc2f9f507f0959f26db3
