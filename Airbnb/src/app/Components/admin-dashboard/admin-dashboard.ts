// components/admin-dashboard/admin-dashboard.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
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
  listings: AdminListing[] = [];
  services: any[] = [];
  experiences: any[] = [];
  loading = false;
  activeTab: 'overview' | 'users' | 'listings' | 'services' | 'experiences' | 'analytics' = 'users';

  // Category Data
  propertyTypes: any[] = [];
  propertyCategories: any[] = [];
  serviceCategories: any[] = [];
  experienceCategories: any[] = [];
  experienceSubCategories: any[] = [];

  // Modal States
  showAddUserModal = false;
  showAddListingModal = false;
  showAddServiceModal = false;
  showAddExperienceModal = false;

  // Form Data
  newUser: any = { firstName: '', lastName: '', email: '', password: '' };
  newListing: any = {
    name: '',
    description: '',
    price: 0,
    location: '',
    maxGuests: 2,
    bedrooms: 1,
    bathrooms: 1,
    propertyTypeId: null,
    propertyCategoryId: null
  };
  newService: any = {
    name: '',
    description: '',
    price: 0,
    location: '',
    serviceCategoryId: null
  };
  newExperience: any = {
    name: '',
    description: '',
    price: 0,
    maxParticipants: 10,
    expCatograyId: null,
    expSubCatograyId: null
  };

  selectedFile: File | null = null;

  private subscriptions: Subscription = new Subscription();

  constructor(private adminService: AdminService) { }

  ngOnInit() {
    this.loadDashboardData();
    this.loadCategories();

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

  loadDashboardData(): void {
    // Load stats
    this.subscriptions.add(
      this.adminService.getStats().subscribe({
        next: (stats) => {
          this.stats = stats;
        },
        error: (error) => {
          console.error('Error loading stats:', error);
        }
      })
    );

    // Load users
    this.subscriptions.add(
      this.adminService.getUsers().subscribe({
        next: (users) => {
          this.users = users;
        },
        error: (error) => {
          console.error('Error loading users:', error);
        }
      })
    );

    // Load listings
    this.subscriptions.add(
      this.adminService.getListings().subscribe({
        next: (listings) => {
          this.listings = listings;
        },
        error: (error) => {
          console.error('Error loading listings:', error);
        }
      })
    );

    // Load services
    this.subscriptions.add(
      this.adminService.getServices().subscribe({
        next: (services) => {
          this.services = services;
        },
        error: (error) => {
          console.error('Error loading services:', error);
        }
      })
    );

    // Load experiences
    this.subscriptions.add(
      this.adminService.getExperiences().subscribe({
        next: (experiences) => {
          this.experiences = experiences;
        },
        error: (error) => {
          console.error('Error loading experiences:', error);
        }
      })
    );
  }

  private loadCategories(): void {
    // Load property types and categories
    this.subscriptions.add(
      this.adminService.getPropertyTypesFromData().subscribe({
        next: (types) => {
          this.propertyTypes = types;
          console.log('Loaded property types:', types);
        },
        error: (error) => console.error('Error loading property types:', error)
      })
    );

    this.subscriptions.add(
      this.adminService.getPropertyCategoriesFromData().subscribe({
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
      this.adminService.getExperienceSubCategories(categoryId).subscribe({
        next: (subCategories) => {
          this.experienceSubCategories = subCategories;
          // Reset subcategory selection
          this.newExperience.expSubCatograyId = null;
        },
        error: (error) => console.error('Error loading experience subcategories:', error)
      });
    }
  }

  setActiveTab(tab: 'overview' | 'users' | 'listings' | 'services' | 'experiences' | 'analytics'): void {
    this.activeTab = tab;
  }

  // Modal Methods
  openAddUserModal() { this.showAddUserModal = true; }
  closeAddUserModal() {
    this.showAddUserModal = false;
    this.newUser = { firstName: '', lastName: '', email: '', password: '' };
  }

  openAddListingModal() { this.showAddListingModal = true; }
  closeAddListingModal() {
    this.showAddListingModal = false;
    this.newListing = {
      name: '',
      description: '',
      price: 0,
      location: '',
      maxGuests: 2,
      bedrooms: 1,
      bathrooms: 1,
      propertyTypeId: null,
      propertyCategoryId: null
    };
    this.selectedFile = null;
  }

  openAddServiceModal() { this.showAddServiceModal = true; }
  closeAddServiceModal() {
    this.showAddServiceModal = false;
    this.newService = {
      name: '',
      description: '',
      price: 0,
      location: '',
      serviceCategoryId: null
    };
    this.selectedFile = null;
  }

  openAddExperienceModal() { this.showAddExperienceModal = true; }
  closeAddExperienceModal() {
    this.showAddExperienceModal = false;
    this.newExperience = {
      name: '',
      description: '',
      price: 0,
      maxParticipants: 10,
      expCatograyId: null,
      expSubCatograyId: null
    };
    this.selectedFile = null;
  }

  // File Selection
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
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

  // CREATE METHODS
  addUser() {
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

  addListing() {
    if (!this.newListing.propertyTypeId || !this.newListing.propertyCategoryId) {
      alert('Please select both Property Type and Property Category');
      return;
    }

    const listingPayload = {
      Title: this.newListing.name,
      Description: this.newListing.description,
      PricePerNight: Number(this.newListing.price),
      Currency: 'USD',
      Country: this.newListing.location.split(',')[1]?.trim() || 'Unknown',
      City: this.newListing.location.split(',')[0]?.trim() || 'Unknown',
      Address: this.newListing.location,
      MaxGuests: Number(this.newListing.maxGuests),
      Bedrooms: Number(this.newListing.bedrooms),
      Beds: Number(this.newListing.bedrooms),
      Bathrooms: Number(this.newListing.bathrooms),
      PropertyTypeId: Number(this.newListing.propertyTypeId),
      PropertyCategoryId: Number(this.newListing.propertyCategoryId),
      AmenityIds: []
    };

    console.log('Creating listing with payload:', listingPayload);

    this.adminService.createListing(listingPayload).subscribe({
      next: (response: any) => {
        const listingId = response?.id || response?.Id;
        if (listingId && this.selectedFile) {
          this.adminService.uploadPropertyImage(listingId, this.selectedFile).subscribe({
            next: () => {
              alert('Listing and image created successfully');
              this.closeAddListingModal();
              this.loadDashboardData();
            },
            error: (err) => {
              console.error('Image upload failed', err);
              alert('Listing created but image upload failed');
              this.closeAddListingModal();
              this.loadDashboardData();
            }
          });
        } else {
          alert('Listing created successfully');
          this.closeAddListingModal();
          this.loadDashboardData();
        }
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
    if (!this.newService.serviceCategoryId) {
      alert('Please select a Service Category');
      return;
    }

    const servicePayload = {
      Title: this.newService.name,
      Description: this.newService.description,
      Price: Number(this.newService.price),
      Currency: 'USD',
      PricingType: 'PerHour',
      Country: 'Unknown',
      City: this.newService.location,
      Address: this.newService.location,
      ServiceCategoryId: Number(this.newService.serviceCategoryId)
    };

    console.log('Creating service with payload:', servicePayload);

    this.adminService.createService(servicePayload).subscribe({
      next: (response: any) => {
        const serviceId = response?.id || response?.Id;
        if (serviceId && this.selectedFile) {
          this.adminService.uploadServiceImage(serviceId, this.selectedFile).subscribe({
            next: () => {
              alert('Service and image created successfully');
              this.closeAddServiceModal();
              this.loadDashboardData();
            },
            error: (err) => {
              console.error('Image upload failed', err);
              alert('Service created but image upload failed');
              this.closeAddServiceModal();
              this.loadDashboardData();
            }
          });
        } else {
          alert('Service created successfully');
          this.closeAddServiceModal();
          this.loadDashboardData();
        }
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
    if (!this.newExperience.expCatograyId || !this.newExperience.expSubCatograyId) {
      alert('Please select both Experience Category and Subcategory');
      return;
    }

    const experiencePayload = {
      Name: this.newExperience.name,
      ExpTitle: this.newExperience.name,
      ExpDescribe: this.newExperience.description,
      GuestPrice: Number(this.newExperience.price),
      MaximumGuest: Number(this.newExperience.maxParticipants),
      ExpCatograyId: Number(this.newExperience.expCatograyId),
      ExpSubCatograyId: Number(this.newExperience.expSubCatograyId),
      Status: 'In_Progress'
    };

    console.log('Creating experience with payload:', experiencePayload);

    this.adminService.createExperience(experiencePayload).subscribe({
      next: (response: any) => {
        const experienceId = response?.id || response?.Id;
        if (experienceId && this.selectedFile) {
          this.adminService.uploadExperienceImage(experienceId, this.selectedFile).subscribe({
            next: () => {
              alert('Experience and image created successfully');
              this.closeAddExperienceModal();
              this.loadDashboardData();
            },
            error: (err) => {
              console.error('Image upload failed', err);
              alert('Experience created but image upload failed');
              this.closeAddExperienceModal();
              this.loadDashboardData();
            }
          });
        } else {
          alert('Experience created successfully');
          this.closeAddExperienceModal();
          this.loadDashboardData();
        }
      },
      error: (err) => {
        console.error('Create Experience Error:', err);
        alert(`Failed to create experience: ${err.error?.message || err.message}`);
        if (err.error?.errors) {
          console.error('Validation Errors:', err.error.errors);
        }
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

  suspendListing(listingId: string): void {
    this.subscriptions.add(
      this.adminService.updateListingStatus(listingId, 'suspended').subscribe({
        next: (updatedListing) => {
          console.log('Listing suspended:', updatedListing);
          this.listings = this.listings.map(listing =>
            listing.id === listingId ? updatedListing : listing
          );
        },
        error: (error) => {
          console.error('Error suspending listing:', error);
          alert('Failed to suspend listing. Please try again.');
        }
      })
    );
  }

  approveListing(listingId: string): void {
    this.subscriptions.add(
      this.adminService.updateListingStatus(listingId, 'active').subscribe({
        next: (updatedListing) => {
          console.log('Listing approved:', updatedListing);
          this.listings = this.listings.map(listing =>
            listing.id === listingId ? updatedListing : listing
          );
        },
        error: (error) => {
          console.error('Error approving listing:', error);
          alert('Failed to approve listing. Please try again.');
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
            alert('Failed to delete listing. Please try again.');
          }
        })
      );
    }
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
            alert('Failed to delete service');
          }
        })
      );
    }
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
}
