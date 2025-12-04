// services/admin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, forkJoin } from 'rxjs';
import { tap, map, switchMap, catchError } from 'rxjs/operators';
import { AdminStats } from '../Models/AdminStats';
import { AdminUser } from '../Models/AdminUser';
import { AdminListing } from '../Models/AdminListing';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'https://localhost:7020/api';
  private statsSubject = new BehaviorSubject<AdminStats>(this.getInitialStats());
  private usersSubject = new BehaviorSubject<AdminUser[]>([]);
  private listingsSubject = new BehaviorSubject<AdminListing[]>([]);
  private servicesSubject = new BehaviorSubject<any[]>([]);
  private experiencesSubject = new BehaviorSubject<any[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) { }

  // Stats Management - Calculated from data
  getStats(): Observable<AdminStats> {
    this.setLoading(true);
    return new Observable<AdminStats>(observer => {
      let totalUsers = 0;
      let totalListings = 0;
      let totalBookings = 0;

      this.http.get<any>(`${this.apiUrl}/User`).subscribe({
        next: (users) => {
          totalUsers = users.length || 0;

          this.http.get<any>(`${this.apiUrl}/Properties`).subscribe({
            next: (props) => {
              totalListings = props.length || 0;

              this.http.get<any>(`${this.apiUrl}/Booking`).subscribe({
                next: (bookings) => {
                  const bookingsData = bookings.data || bookings || [];
                  totalBookings = bookingsData.length || 0;

                  const stats: AdminStats = {
                    totalUsers,
                    totalListings,
                    totalBookings,
                    totalRevenue: totalBookings * 150,
                    pendingVerifications: 0,
                    activeHosts: Math.floor(totalUsers * 0.3),
                    monthlyGrowth: 0,
                    weeklyRevenue: 0,
                    activeBookings: totalBookings
                  };

                  this.statsSubject.next(stats);
                  observer.next(stats);
                  observer.complete();
                  this.setLoading(false);
                },
                error: () => {
                  const stats: AdminStats = {
                    totalUsers,
                    totalListings,
                    totalBookings: 0,
                    totalRevenue: 0,
                    pendingVerifications: 0,
                    activeHosts: Math.floor(totalUsers * 0.3),
                    monthlyGrowth: 0,
                    weeklyRevenue: 0,
                    activeBookings: 0
                  };
                  this.statsSubject.next(stats);
                  observer.next(stats);
                  observer.complete();
                  this.setLoading(false);
                }
              });
            },
            error: () => {
              observer.error('Failed to load properties');
              this.setLoading(false);
            }
          });
        },
        error: () => {
          observer.error('Failed to load users');
          this.setLoading(false);
        }
      });
    });
  }

  updateStats(updates: Partial<AdminStats>): void {
    const current = this.statsSubject.value;
    this.statsSubject.next({ ...current, ...updates });
  }

  // Users Management - Connected to backend
  getUsers(): Observable<AdminUser[]> {
    this.setLoading(true);
    return this.http.get<any>(`${this.apiUrl}/User`).pipe(
      map((users: any[]) => {
        const adminUsers: AdminUser[] = users.map(u => ({
          id: u.id,
          email: u.email,
          firstName: u.firstName,
          lastName: u.lastName,
          role: u.roles?.[0] || 'guest',
          joinedDate: new Date(),
          status: 'active',
          listingsCount: 0,
          bookingsCount: 0,
          lastActive: new Date(),
          avatar: u.photoURL || ''
        }));
        this.usersSubject.next(adminUsers);
        return adminUsers;
      }),
      tap(() => this.setLoading(false)),
      catchError(err => {
        this.setLoading(false);
        console.error('getUsers error', err);
        return of([]);
      })
    );
  }

  updateUserStatus(userId: string, status: 'active' | 'suspended'): Observable<AdminUser> {
    return new Observable<AdminUser>(observer => {
      setTimeout(() => {
        const users = this.usersSubject.value.map(user =>
          user.id === userId ? { ...user, status, updatedAt: new Date() } : user
        );
        this.usersSubject.next(users);

        const updatedUser = users.find(user => user.id === userId);
        if (updatedUser) {
          observer.next(updatedUser);
        } else {
          observer.error(new Error('User not found'));
        }
        observer.complete();
      }, 300);
    });
  }

  deleteUser(userId: string): Observable<boolean> {
    return this.http.delete(`${this.apiUrl}/User/${userId}`).pipe(
      tap(() => {
        const users = this.usersSubject.value.filter(user => user.id !== userId);
        this.usersSubject.next(users);

        const stats = this.statsSubject.value;
        this.statsSubject.next({
          ...stats,
          totalUsers: Math.max(0, stats.totalUsers - 1)
        });
      }),
      map(() => true),
      catchError(err => {
        console.error('deleteUser error', err);
        throw err;
      })
    );
  }

  // Listings Management - Connected to backend
  getListings(): Observable<AdminListing[]> {
    this.setLoading(true);
    return this.http.get<any>(`${this.apiUrl}/Properties`).pipe(
      map((properties: any[]) => {
        const adminListings: AdminListing[] = properties.map(p => ({
          id: p.id?.toString() ?? '',
          title: p.title || p.name,
          host: p.hostName || 'Host',
          hostId: p.hostId || '1',
          type: 'Property',
          status: p.isPublished ? 'active' : 'pending',
          price: p.pricePerNight || p.price,
          location: p.city && p.country ? `${p.city}, ${p.country}` : p.location,
          rating: p.averageRating || p.rating || 0,
          reviewCount: p.reviewsCount || p.reviewCount || 0,
          createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
          lastBooking: p.lastBooking ? new Date(p.lastBooking) : new Date(),
          bedrooms: p.bedrooms || 0,
          bathrooms: p.bathrooms || 0,
          maxGuests: p.maxGuests || 0,
          images: p.images?.length ? p.images.map((i: any) => i.imageUrl || i.imageURL) : [p.coverImageUrl || p.imageUrl],
          amenities: p.amenities || []
        }));
        this.listingsSubject.next(adminListings);
        return adminListings;
      }),
      tap(() => this.setLoading(false)),
      catchError(err => {
        console.error('getListings error', err);
        this.setLoading(false);
        return of([]);
      })
    );
  }

  updateListingStatus(listingId: string, status: 'active' | 'suspended' | 'pending'): Observable<AdminListing> {
    return new Observable<AdminListing>(observer => {
      setTimeout(() => {
        const listings = this.listingsSubject.value.map(listing =>
          listing.id === listingId ? { ...listing, status, updatedAt: new Date() } : listing
        );
        this.listingsSubject.next(listings);

        const updatedListing = listings.find(listing => listing.id === listingId);
        if (updatedListing) {
          observer.next(updatedListing);
        } else {
          observer.error(new Error('Listing not found'));
        }
        observer.complete();
      }, 300);
    });
  }

  deleteListing(listingId: string): Observable<boolean> {
    return this.http.delete(`${this.apiUrl}/Properties/${listingId}`).pipe(
      tap(() => {
        const listings = this.listingsSubject.value.filter(listing => listing.id !== listingId);
        this.listingsSubject.next(listings);

        const stats = this.statsSubject.value;
        this.statsSubject.next({
          ...stats,
          totalListings: Math.max(0, stats.totalListings - 1)
        });
      }),
      map(() => true),
      catchError(err => {
        console.error('deleteListing error', err);
        throw err;
      })
    );
  }

  // Services Management
  getServices(): Observable<any[]> {
    this.setLoading(true);
    return this.http.get<any>(`${this.apiUrl}/Services`).pipe(
      map((services: any[]) => {
        this.servicesSubject.next(services);
        return services;
      }),
      tap(() => this.setLoading(false)),
      catchError(err => {
        console.error('getServices error', err);
        this.setLoading(false);
        return of([]);
      })
    );
  }

  deleteService(serviceId: string): Observable<boolean> {
    return this.http.delete(`${this.apiUrl}/Services/${serviceId}`).pipe(
      tap(() => {
        const services = this.servicesSubject.value.filter(s => s.id !== serviceId);
        this.servicesSubject.next(services);
      }),
      map(() => true),
      catchError(err => {
        console.error('deleteService error', err);
        throw err;
      })
    );
  }

  // Experiences Management
  getExperiences(): Observable<any[]> {
    this.setLoading(true);
    return this.http.get<any>(`${this.apiUrl}/Experience`).pipe(
      map((experiences: any[]) => {
        this.experiencesSubject.next(experiences);
        return experiences;
      }),
      tap(() => this.setLoading(false)),
      catchError(err => {
        console.error('getExperiences error', err);
        this.setLoading(false);
        return of([]);
      })
    );
  }

  deleteExperience(experienceId: string): Observable<boolean> {
    return this.http.delete(`${this.apiUrl}/Experience/${experienceId}`).pipe(
      tap(() => {
        const experiences = this.experiencesSubject.value.filter(e => e.id !== experienceId);
        this.experiencesSubject.next(experiences);
      }),
      map(() => true),
      catchError(err => {
        console.error('deleteExperience error', err);
        throw err;
      })
    );
  }

  // Loading state
  getLoadingState(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }

  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  private getInitialStats(): AdminStats {
    return {
      totalUsers: 0,
      totalListings: 0,
      totalBookings: 0,
      totalRevenue: 0,
      pendingVerifications: 0,
      activeHosts: 0,
      monthlyGrowth: 0,
      weeklyRevenue: 0,
      activeBookings: 0
    };
  }

  // TEST METHODS - Check if endpoints work
  testPropertiesEndpoint(): void {
    console.log('🧪 Testing /api/Properties endpoint...');
    this.http.get(`${this.apiUrl}/Properties`).subscribe({
      next: (data) => {
        console.log('✅ Properties endpoint works!');
        console.log('📦 Properties data:', data);
        console.log('📊 Number of properties:', Array.isArray(data) ? data.length : 'Not an array');
      },
      error: (err) => {
        console.error('❌ Properties endpoint failed:', err);
      }
    });
  }

  testServicesEndpoint(): void {
    console.log('🧪 Testing /api/Services endpoint...');
    this.http.get(`${this.apiUrl}/Services`).subscribe({
      next: (data) => {
        console.log('✅ Services endpoint works!');
        console.log('📦 Services data:', data);
        console.log('📊 Number of services:', Array.isArray(data) ? data.length : 'Not an array');
      },
      error: (err) => {
        console.error('❌ Services endpoint failed:', err);
      }
    });
  }

  testExperienceEndpoint(): void {
    console.log('🧪 Testing /api/Experience endpoint...');
    this.http.get(`${this.apiUrl}/Experience`).subscribe({
      next: (data) => {
        console.log('✅ Experience endpoint works!');
        console.log('📦 Experience data:', data);
        console.log('📊 Number of experiences:', Array.isArray(data) ? data.length : 'Not an array');
      },
      error: (err) => {
        console.error('❌ Experience endpoint failed:', err);
      }
    });
  }

  testAllEndpoints(): void {
    console.log('🧪 Testing all endpoints...');
    this.testPropertiesEndpoint();
    this.testServicesEndpoint();
    this.testExperienceEndpoint();
  }

  // CREATE METHODS

  createUser(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Account/Register`, userData, { responseType: 'text' }).pipe(
      tap(() => {
        this.getUsers().subscribe();
      })
    );
  }

  /**
   * Create Property
   * - Uses the exact fields from your DTO.
   * - If `listingData.imageFiles` is provided (File[]), uploads them after property creation.
   */
  createListing(listingData: any): Observable<any> {
    const payload = {
      title: listingData.title,
      description: listingData.description,
      pricePerNight: listingData.pricePerNight,
      currency: listingData.currency || 'USD',
      country: listingData.country,
      city: listingData.city,
      address: listingData.address || '',
      latitude: listingData.latitude ?? 0,
      longitude: listingData.longitude ?? 0,
      maxGuests: listingData.maxGuests,
      bedrooms: listingData.bedrooms,
      beds: listingData.beds ?? listingData.bedrooms ?? 0,
      bathrooms: listingData.bathrooms,
      allowsPets: !!listingData.allowsPets,
      cancellationPolicy: listingData.cancellationPolicy || 'Flexible',
      minNights: listingData.minNights ?? 1,
      maxNights: listingData.maxNights ?? 30,
      propertyTypeId: listingData.propertyTypeId,
      propertyCategoryId: listingData.propertyCategoryId,
      subCategoryId: listingData.subCategoryId ?? null,
      amenityIds: Array.isArray(listingData.amenityIds) ? listingData.amenityIds : (listingData.amenities || [])
    };

    console.log("📤 Sending createListing payload:", payload);

    return this.http.post<any>(`${this.apiUrl}/Properties`, payload).pipe(
      switchMap((created: any) => {
        const createdId = created?.id || created?.data?.id;
        // if there are image files to upload, do that now
        if (createdId && listingData.imageFiles && Array.isArray(listingData.imageFiles) && listingData.imageFiles.length) {
          const uploads = listingData.imageFiles.map((file: File) => this.uploadPropertyImage(createdId, file));
          return forkJoin(uploads).pipe(
            map(results => {
              return { created, uploads: results };
            })
          );
        }
        return of({ created });
      }),
      tap((res) => {
        // Refresh listings
        this.getListings().subscribe();
        console.log('createListing response:', res);
      }),
      catchError(err => {
        console.error('createListing error', err);
        throw err;
      })
    );
  }

  uploadPropertyImage(propertyId: number, file: File): Observable<any> {
    const formData = new FormData();
    // backend expects field name "Images" (your screenshot indicated that)
    formData.append("Images", file);
    // Add CoverImageIndex if you want first file to be cover
    formData.append("CoverImageIndex", "0");
    return this.http.post(`${this.apiUrl}/Properties/${propertyId}/images`, formData).pipe(
      catchError(err => {
        console.error('uploadPropertyImage error', err);
        throw err;
      })
    );
  }

  uploadServiceImage(serviceId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('Images', file);
    return this.http.post(`${this.apiUrl}/Services/${serviceId}/images`, formData).pipe(
      catchError(err => {
        console.error('uploadServiceImage error', err);
        throw err;
      })
    );
  }

  uploadExperienceImage(experienceId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('Images', file);
    return this.http.post(`${this.apiUrl}/Experience/${experienceId}/images`, formData).pipe(
      catchError(err => {
        console.error('uploadExperienceImage error', err);
        throw err;
      })
    );
  }



  /**
   * Create Service
   * DTO fields: Title, Description, Price, Currency, PricingType, Country, City, Address, ServiceCategoryId
   * If `serviceData.imageFiles` is provided (File[]), will upload after creation.
   */
  createService(serviceData: any): Observable<any> {
    const payload = {
      Title: serviceData.title,
      Description: serviceData.description,
      Price: Number(serviceData.price),
      Currency: serviceData.currency || 'USD',
      PricingType: serviceData.pricingType || 'PerHour',
      Country: serviceData.country,
      City: serviceData.city,
      Address: serviceData.address || '',
      ServiceCategoryId: Number(serviceData.serviceCategoryId)
    };

    console.log('📤 Sending createService payload:', payload);

    return this.http.post<any>(`${this.apiUrl}/Services`, payload).pipe(
      switchMap((created: any) => {
        const id = created?.id || created?.data?.id;
        if (id && serviceData.imageFiles && Array.isArray(serviceData.imageFiles) && serviceData.imageFiles.length) {
          const uploads = serviceData.imageFiles.map((f: File) => this.uploadServiceImage(id, f));
          return forkJoin(uploads).pipe(map(u => ({ created, uploads: u })));
        }
        return of({ created });
      }),
      tap(() => this.getServices().subscribe()),
      catchError(err => {
        console.error('createService error', err);
        throw err;
      })
    );
  }

  /**
   * Create Experience
   * Uses the DTO keys you provided. If `experienceData.images` contains File objects, send them after creation.
   */
  createExperience(experienceData: any): Observable<any> {
    // Map experience payload using DTO keys you provided
    const payload: any = {
      name: experienceData.name,
      location: experienceData.location,
      manyExpYear: experienceData.manyExpYear ?? 0,
      workName: experienceData.workName,
      expSummary: experienceData.expSummary,
      expAchievement: experienceData.expAchievement,
      country: experienceData.country,
      apartment: experienceData.apartment,
      street: experienceData.street,
      city: experienceData.city,
      governorate: experienceData.governorate,
      postalCode: experienceData.postalCode,
      locationName: experienceData.locationName,
      expTitle: experienceData.expTitle,
      expDescribe: experienceData.expDescribe,
      maximumGuest: experienceData.maximumGuest ?? 1,
      guestPrice: experienceData.guestPrice ?? 0,
      groupPrice: experienceData.groupPrice ?? 0,
      durationDiscount: experienceData.durationDiscount ?? 0,
      earlyDiscount: experienceData.earlyDiscount ?? 0,
      groupDiscount: experienceData.groupDiscount ?? 0,
      responsibleGuests: experienceData.responsibleGuests,
      servingFood: experienceData.servingFood,
      servingAlcoholic: experienceData.servingAlcoholic,
      cancelOrder: experienceData.cancelOrder,
      usingLanguage: experienceData.usingLanguage,
      status: experienceData.status || 'In_Progress',
      expCatograyId: experienceData.expCatograyId,
      expSubCatograyId: experienceData.expSubCatograyId,
      postedBy: experienceData.postedBy,
      // backend expects images array objects (you provided an example with imageURL) - but if we have File[] we'll upload separately
      images: Array.isArray(experienceData.images) ? experienceData.images.filter((i: any) => typeof i.imageURL === 'string') : [],
      expActivities: experienceData.expActivities || []
    };

    console.log('📤 Sending createExperience payload:', payload);

    return this.http.post<any>(`${this.apiUrl}/Experience`, payload).pipe(
      switchMap((created: any) => {
        const id = created?.id || created?.data?.id;
        // if user passed imageFiles (File[]) -> upload them
        if (id && experienceData.imageFiles && Array.isArray(experienceData.imageFiles) && experienceData.imageFiles.length) {
          const uploads = experienceData.imageFiles.map((f: File) => this.uploadExperienceImage(id, f));
          return forkJoin(uploads).pipe(map(u => ({ created, uploads: u })));
        }
        return of({ created });
      }),
      tap(() => this.getExperiences().subscribe()),
      catchError(err => {
        console.error('createExperience error', err);
        throw err;
      })
    );
  }

  updateUserRole(userId: string, newRole: string): Observable<any> {
    console.log(`Mocking role update for user ${userId} to ${newRole}`);
    return new Observable(observer => {
      setTimeout(() => {
        const users = this.usersSubject.value.map(u =>
          u.id === userId ? { ...u, role: newRole as 'guest' | 'host' | 'admin' } : u
        );
        this.usersSubject.next(users);
        observer.next({ success: true });
        observer.complete();
      }, 500);
    });
  }

  // Category Management Methods - try backend first, fallback to hardcoded
  getServiceCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Services/categories`).pipe(
      catchError(err => {
        console.warn('ServiceCategory endpoint failed, returning empty array as fallback.', err);
        return of([]);
      })
    );
  }

  getExperienceCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ExpCatogray`).pipe(
      catchError(err => {
        console.warn('ExpCatogray endpoint failed, returning empty array as fallback.', err);
        return of([]);
      })
    );
  }

  getExperienceSubCategories(categoryId?: number): Observable<any[]> {
    const endpoint = `${this.apiUrl}/ExpSubCatogray`;
    if (categoryId) {
      return this.http.get<any[]>(endpoint).pipe(
        map(subs => subs.filter(s => s.expCatograyId === categoryId)),
        catchError(err => {
          console.warn('ExpSubCatogray fetch failed, returning empty array.', err);
          return of([]);
        })
      );
    }
    return this.http.get<any[]>(endpoint).pipe(
      catchError(err => {
        console.warn('ExpSubCatogray fetch failed, returning empty array.', err);
        return of([]);
      })
    );
  }

  getPropertyTypes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/PropertyType`).pipe(
      catchError(err => {
        console.warn('PropertyType endpoint failed, returning hardcoded types.', err);
        // fallback (same as before)
        const types = [
          { id: 1, name: 'Apartment', description: 'Entire apartment' },
          { id: 2, name: 'House', description: 'Entire house' },
          { id: 3, name: 'Villa', description: 'Luxury villa' },
          { id: 4, name: 'Room', description: 'Private room' },
          { id: 5, name: 'Double Room', description: 'Room with double bed' },
          { id: 6, name: 'Single Room', description: 'Room with single bed' },
          { id: 7, name: 'Shared Room', description: 'Shared space' },
          { id: 8, name: 'Studio', description: 'Open plan apartment' },
          { id: 9, name: 'Cabin', description: 'Nature cabin' },
          { id: 10, name: 'Cottage', description: 'Cozy cottage' }
        ];
        return of(types);
      })
    );
  }

  getPropertyCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/PropertyCategory`).pipe(
      catchError(err => {
        console.warn('PropertyCategory endpoint failed, returning hardcoded categories.', err);
        const categories = [
          { id: 1, name: 'Beachfront', description: 'Properties right on the beach' },
          { id: 2, name: 'City', description: 'Urban apartments and lofts' },
          { id: 3, name: 'Countryside', description: 'Peaceful countryside retreats' },
          { id: 4, name: 'Lakefront', description: 'Properties by the lake' },
          { id: 5, name: 'Mansions', description: 'Luxury mansions' },
          { id: 6, name: 'Castles', description: 'Historic castles' },
          { id: 7, name: 'Islands', description: 'Private islands' },
          { id: 8, name: 'Camping', description: 'Camping and glamping spots' },
          { id: 9, name: 'Trending', description: 'Highly rated and popular properties' },
          { id: 10, name: 'Cabins', description: 'Cozy cabins in nature' }
        ];
        return of(categories);
      })
    );
  }

  createPropertyCategory(categoryData: any): Observable<any> {
    // Mock implementation maintained for now
    return of({ id: Math.floor(Math.random() * 1000) + 11, ...categoryData });
  }
}
