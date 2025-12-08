// Services/Admin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { AdminStats } from '../Models/AdminStats';
import { AdminUser } from '../Models/AdminUser';
import { AdminListing } from '../Models/AdminListing';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'https://localhost:7020/api'; // Your API base URL
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {}

<<<<<<< HEAD
  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
=======
  // Stats Management - Calculated from data
  getStats(): Observable<AdminStats> {
    this.setLoading(true);

    // 1. Create Observables for all necessary data sources
    const users$ = this.http.get<any[]>(`${this.apiUrl}/User`).pipe(catchError(() => of([])));
    const properties$ = this.http.get<any[]>(`${this.apiUrl}/Properties`).pipe(catchError(() => of([])));
    const bookings$ = this.http.get<any>(`${this.apiUrl}/Booking`).pipe(
      map(res => res.data || res || []),
      catchError(() => of([]))
    );

    // 2. Use forkJoin to wait for all three requests to complete
    return forkJoin({
      users: users$,
      props: properties$,
      bookings: bookings$
    }).pipe(
      map(({ users, props, bookings }) => {
        const totalUsers = users.length;
        const totalListings = props.length;
        const totalBookings = bookings.length;

        const stats: AdminStats = {
          totalUsers,
          totalListings,
          totalBookings,
          totalRevenue: totalBookings * 150, // Your existing calculation
          pendingVerifications: 0,
          activeHosts: Math.floor(totalUsers * 0.3),
          monthlyGrowth: 0,
          weeklyRevenue: 0,
          activeBookings: totalBookings
        };

        this.statsSubject.next(stats);
        return stats;
      }),
      tap(() => this.setLoading(false)),
      catchError(err => {
        console.error('getStats forkJoin error', err);
        this.setLoading(false);
        return of(this.getInitialStats());
      })
    );
  }

  updateStats(updates: Partial<AdminStats>): void {
    const current = this.statsSubject.value;
    this.statsSubject.next({ ...current, ...updates });
>>>>>>> 6c1b37138f6275b6b13adc2f9f507f0959f26db3
  }

  // Account/User related endpoints
  getUsers(): Observable<AdminUser[]> {
    this.setLoading(true);
    return this.http.get<AdminUser[]>(`${this.apiUrl}/Account/Profile`)
      .pipe(
        map(users => {
          this.setLoading(false);
          return users;
        })
      );
  }

  createUser(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Account/Register`, userData);
  }

<<<<<<< HEAD
  updateUserRole(userId: string, role: string): Observable<AdminUser> {
    return this.http.post<AdminUser>(`${this.apiUrl}/Account/ChangeRole`, { 
      userId, 
      role 
    });
  }

  updateUserStatus(userId: string, status: string): Observable<AdminUser> {
    return this.http.post<AdminUser>(`${this.apiUrl}/Account/UpdateStatus`, { 
      userId, 
      status 
    });
=======
  // Listings Management - Connected to backend
  getListings(): Observable<AdminListing[]> {
    this.setLoading(true);
    // Use the host-specific endpoint to get ALL properties (published and unpublished)
    return this.http.get<any>(`${this.apiUrl}/Properties/my-properties`).pipe(
      map((response: any) => {
        const properties = Array.isArray(response) ? response : (response?.data || []);
        const adminListings: AdminListing[] = properties.map((p: any) => {
          const host = p.host || p.Host;
          const city = p.city || p.City;
          const country = p.country || p.Country;
          const images = p.images || p.Images;

          return {
            id: (p.id || p.Id)?.toString() ?? '',
            title: p.title || p.Title || p.name || p.Name,
            host: host ? `${host.firstName || host.FirstName} ${host.lastName || host.LastName}` : (p.hostName || p.HostName || 'Host'),
            hostId: p.hostId || p.HostId || '1',
            type: 'Property',
            status: (p.isPublished || p.IsPublished) ? 'active' : 'pending',
            price: p.pricePerNight || p.PricePerNight || p.price || p.Price,
            location: city && country ? `${city}, ${country}` : (p.location || p.Location),
            rating: p.averageRating || p.AverageRating || p.rating || p.Rating || 0,
            reviewCount: p.reviewsCount || p.ReviewsCount || p.reviewCount || p.ReviewCount || 0,
            createdAt: (p.createdAt || p.CreatedAt) ? new Date(p.createdAt || p.CreatedAt) : new Date(),
            lastBooking: (p.lastBooking || p.LastBooking) ? new Date(p.lastBooking || p.LastBooking) : new Date(),
            bedrooms: p.bedrooms || p.Bedrooms || 0,
            bathrooms: p.bathrooms || p.Bathrooms || 0,
            maxGuests: p.maxGuests || p.MaxGuests || 0,
            images: images?.length ? images.map((i: any) => i.imageUrl || i.ImageUrl || i.imageURL) : [p.coverImageUrl || p.CoverImageUrl || p.imageUrl || p.ImageUrl],
            amenities: p.amenities || p.Amenities || []
          };
        });
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

  // ... (existing updateListingStatus and deleteListing methods) ...

  updateListingStatus(listingId: string, status: 'active' | 'suspended' | 'pending'): Observable<AdminListing> {
    let apiCall: Observable<any>;

    if (status === 'active') {
      apiCall = this.http.put(`${this.apiUrl}/Properties/${listingId}/publish`, {});
    } else if (status === 'suspended') {
      apiCall = this.http.put(`${this.apiUrl}/Properties/${listingId}/unpublish`, {});
    } else {
      // Pending status handling if needed, or default
      return of(this.listingsSubject.value.find(l => l.id === listingId)!);
    }

    return apiCall.pipe(
      map(() => {
        // Update local state
        const listings = this.listingsSubject.value.map(listing =>
          listing.id === listingId ? { ...listing, status, updatedAt: new Date() } : listing
        );
        this.listingsSubject.next(listings);

        return listings.find(listing => listing.id === listingId)!;
      }),
      catchError(err => {
        console.error(`updateListingStatus to ${status} error`, err);
        throw err;
      })
    );
  }

  updateServiceStatus(serviceId: string, status: 'active' | 'suspended'): Observable<any> {
    const action = status === 'active' ? 'publish' : 'unpublish';
    return this.http.put(`${this.apiUrl}/Services/${serviceId}/${action}`, {}).pipe(
      tap(() => {
        // Update local state
        const services = this.servicesSubject.value.map(s =>
          s.id === serviceId ? { ...s, status: status } : s
        );
        this.servicesSubject.next(services);
      }),
      catchError(err => {
        console.error(`updateServiceStatus to ${status} error`, err);
        throw err;
      })
    );
  }

  updateExperienceStatus(experienceId: string, status: 'active' | 'suspended'): Observable<any> {
    const action = status === 'active' ? 'publish' : 'unpublish';
    return this.http.put(`${this.apiUrl}/Experience/${experienceId}/${action}`, {}).pipe(
      tap(() => {
        // Update local state
        const experiences = this.experiencesSubject.value.map(e =>
          e.id === experienceId ? { ...e, status: status } : e
        );
        this.experiencesSubject.next(experiences);
      }),
      catchError(err => {
        console.error(`updateExperienceStatus to ${status} error`, err);
        throw err;
      })
    );
>>>>>>> 6c1b37138f6275b6b13adc2f9f507f0959f26db3
  }

  deleteUser(userId: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/Account/${userId}`);
  }

  // Stats endpoint
  getStats(): Observable<AdminStats> {
    this.setLoading(true);
<<<<<<< HEAD
    return this.http.get<AdminStats>(`${this.apiUrl}/Dashboard/Stats`)
      .pipe(
        map(stats => {
          this.setLoading(false);
          return stats;
        })
      );
=======
    // Use the host-specific endpoint to get ALL services
    return this.http.get<any>(`${this.apiUrl}/Services/my-services`).pipe(
      map((response: any) => {
        const services = Array.isArray(response) ? response : (response?.data || []);
        const mappedServices = services.map((s: any) => {
          const provider = s.provider || s.Provider;
          const category = s.category || s.Category;
          const city = s.city || s.City;
          const country = s.country || s.Country;
          const images = s.images || s.Images;

          return {
            id: (s.id || s.Id)?.toString() || '',
            name: s.title || s.Title || s.name || s.Name || 'Unnamed Service',
            description: s.description || s.Description,
            price: s.price || s.Price,
            currency: s.currency || s.Currency,
            location: city && country ? `${city}, ${country}` : (city || country || 'Unknown'),
            provider: {
              name: provider ? `${provider.firstName || provider.FirstName} ${provider.lastName || provider.LastName}` : (s.providerName || s.ProviderName || 'Unknown')
            },
            category: category?.name || category?.Name || s.categoryName || s.CategoryName || 'Uncategorized',
            rating: s.averageRating || s.AverageRating || 0,
            reviewCount: s.reviews?.length || s.Reviews?.length || 0,
            status: (s.isPublished || s.IsPublished) ? 'active' : 'pending',
            imageUrl: images?.[0]?.imageUrl || images?.[0]?.ImageUrl || s.imageUrl || s.ImageUrl || 'assets/default-service.jpg',
            images: images?.map((i: any) => i.imageUrl || i.ImageUrl) || []
          };
        });
        this.servicesSubject.next(mappedServices);
        return mappedServices;
      }),
      tap(() => this.setLoading(false)),
      catchError(err => {
        console.error('getServices error', err);
        this.setLoading(false);
        return of([]);
      })
    );
  }

  // ... (existing deleteService method) ...

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
>>>>>>> 6c1b37138f6275b6b13adc2f9f507f0959f26db3
  }

  // Property/Listing endpoints
  getListings(): Observable<AdminListing[]> {
    this.setLoading(true);
<<<<<<< HEAD
    return this.http.get<AdminListing[]>(`${this.apiUrl}/Property`)
      .pipe(
        map(listings => {
          this.setLoading(false);
          return listings;
        })
      );
=======
    // Use the host-specific endpoint to get ALL experiences
    return this.http.get<any>(`${this.apiUrl}/Experience/my-experiences`).pipe(
      map((response: any) => {
        const experiences = Array.isArray(response) ? response : (response?.data || []);
        const mappedExperiences = experiences.map((e: any) => {
          const host = e.host || e.Host;
          const category = e.category || e.Category || e.expCatogray || e.ExpCatogray;
          const city = e.city || e.City;
          const country = e.country || e.Country;
          const images = e.images || e.Images;

          // Experience Status: 3 = Published
          const rawStatus = e.status || e.Status;
          const isActive = rawStatus === 3 || rawStatus === 'Published';

          return {
            id: (e.id || e.Id)?.toString() || '',
            name: e.title || e.Title || e.name || e.Name || e.expTitle || e.ExpTitle || 'Unnamed Experience',
            description: e.description || e.Description || e.expDescribe || e.ExpDescribe,
            location: e.location || e.Location || (city && country ? `${city}, ${country}` : 'Unknown'),
            price: e.price || e.Price || e.guestPrice || e.GuestPrice,
            host: {
              name: host ? `${host.firstName || host.FirstName} ${host.lastName || host.LastName}` : (e.hostName || e.HostName || 'Unknown Host')
            },
            category: category?.name || category?.Name || 'Uncategorized',
            rating: e.averageRating || e.AverageRating || 0,
            reviewCount: e.reviews?.length || e.Reviews?.length || 0,
            status: isActive ? 'active' : 'pending',
            imageUrl: images?.[0]?.imageUrl || images?.[0]?.ImageUrl || e.imageUrl || e.ImageUrl || 'assets/default-experience.jpg',
            images: images?.map((i: any) => i.imageUrl || i.ImageUrl) || []
          };
        });
        this.experiencesSubject.next(mappedExperiences);
        return mappedExperiences;
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
>>>>>>> 6c1b37138f6275b6b13adc2f9f507f0959f26db3
  }

  createListing(listingData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Property`, listingData);
  }

<<<<<<< HEAD
  updateListingStatus(listingId: string, status: string): Observable<AdminListing> {
    return this.http.put<AdminListing>(`${this.apiUrl}/Property/${listingId}/status`, { status });
  }

  deleteListing(listingId: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/Property/${listingId}`);
  }

  // Property Categories
  getPropertyTypes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/PropertyType`);
  }

  getPropertyCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/PropertyCategory`);
  }

  // Services
  getServices(): Observable<any[]> {
    this.setLoading(true);
    return this.http.get<any[]>(`${this.apiUrl}/Service`)
      .pipe(
        map(services => {
          this.setLoading(false);
          return services;
        })
      );
  }

  createService(serviceData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Service`, serviceData);
  }

  deleteService(serviceId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Service/${serviceId}`);
  }

  getServiceCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ServiceCategory`);
  }

  // Experiences
  getExperiences(): Observable<any[]> {
    this.setLoading(true);
    return this.http.get<any[]>(`${this.apiUrl}/Experience`)
      .pipe(
        map(experiences => {
          this.setLoading(false);
          return experiences;
        })
      );
=======
  // CREATE METHODS

  createUser(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Account/Register`, userData, { responseType: 'text' }).pipe(
      switchMap(res => this.getUsers().pipe(map(() => res)))
    );
  }

  /**
   * Create Property
   * - Uses the exact fields from your DTO.
   */
  uploadPropertyImages(propertyId: number, files: File[]): Observable<any> {
    console.log(`Uploading ${files.length} property images for ID ${propertyId}`);
    const formData = new FormData();
    files.forEach((f, index) => {
      console.log(`   File[${index}]: ${f.name}, Size: ${f.size}, Type: ${f.type}`);
      formData.append(`Images[${index}]`, f);
    });
    formData.append("CoverImageIndex", "0");
    return this.http.post(`${this.apiUrl}/Properties/${propertyId}/images`, formData);
  }

  uploadServiceImages(serviceId: number, files: File[]): Observable<any> {
    console.log(`Uploading ${files.length} service images for ID ${serviceId}`);
    const formData = new FormData();
    files.forEach(f => formData.append('Images', f));
    formData.append('CoverImageIndex', '0');
    return this.http.post(`${this.apiUrl}/Services/${serviceId}/images`, formData);
  }

  uploadExperienceImages(experienceId: number, files: File[]): Observable<any> {
    const formData = new FormData();
    files.forEach(f => formData.append('Images', f));
    return this.http.post(`${this.apiUrl}/Experience/${experienceId}/images`, formData);
  }

  createListing(listingData: any, files: File[] = []): Observable<any> {
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
        if (createdId && files.length > 0) {
          return this.uploadPropertyImages(createdId, files).pipe(
            map(results => ({ created, uploads: results })),
            catchError(err => {
              console.error('Failed to upload images', err);
              return of({ created, imageError: err });
            })
          );
        }
        return of({ created });
      }),
      tap((res) => {
        console.log('createListing response:', res);
      }),
      switchMap((res) => this.getListings().pipe(map(() => res))),
      catchError(err => {
        console.error('createListing error', err);
        throw err;
      })
    );
  }

  // // Replace the createExperience method in Admin.service.ts with this:

  createService(serviceData: any, files: File[] = []): Observable<any> {
    const payload = {
      Title: serviceData.title,
      Description: serviceData.description,
      Price: Number(serviceData.price),
      Currency: serviceData.currency || 'USD',
      PricingType: serviceData.pricingType || 'PerHour',
      Country: serviceData.country,
      City: serviceData.city,
      Address: serviceData.address || '',
      ServiceCategoryId: Number(serviceData.serviceCategoryId),
      IsPublished: true
    };

    console.log('📤 Sending createService payload:', payload);

    return this.http.post<any>(`${this.apiUrl}/Services`, payload).pipe(
      switchMap((created: any) => {
        const id = created?.id || created?.data?.id;
        if (id && files.length > 0) {
          return this.uploadServiceImages(id, files).pipe(
            map(u => ({ created, uploads: u })),
            catchError(err => {
              console.error('Failed to upload service images', err);
              return of({ created, imageError: err });
            })
          );
        }
        return of({ created });
      }),
      switchMap((res) => this.getServices().pipe(map(() => res))),
      catchError(err => {
        console.error('createService error', err);
        throw err;
      })
    );
  }

  createExperience(experienceData: any, files: File[] = []): Observable<any> {
    const payload = experienceData;
    console.log('📤 Sending createExperience payload:', payload);

    return this.http.post<any>(`${this.apiUrl}/Experience`, payload).pipe(
      switchMap((created: any) => {
        const id = created?.id || created?.data?.id;
        if (id && files.length > 0) {
          return this.uploadExperienceImages(id, files).pipe(
            map(u => ({ created, uploads: u })),
            catchError(err => {
              console.error('Failed to upload experience images', err);
              return of({ created, imageError: err });
            })
          );
        }
        return of({ created });
      }),
      switchMap((res) => this.getExperiences().pipe(map(() => res))),
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
      map(categories => categories.map(c => ({
        id: c.id || c.Id,
        name: c.name || c.Name
      }))),
      catchError(err => {
        console.warn('ExpCatogray endpoint failed, returning hardcoded categories.', err);
        const categories = [
          { id: 1, name: 'Art and Culture' },
          { id: 2, name: 'Entertainment' },
          { id: 3, name: 'Food and Drink' },
          { id: 4, name: 'Sports' },
          { id: 5, name: 'Tours' },
          { id: 6, name: 'Sightseeing' },
          { id: 7, name: 'Wellness' },
          { id: 8, name: 'Nature and Outdoors' }
        ];
        return of(categories);
      })
    );
  }

  getExperienceSubCategories(categoryId?: number): Observable<any[]> {
    const endpoint = `${this.apiUrl}/ExpSubCatogray`;
    return this.http.get<any[]>(endpoint).pipe(
      map(subs => {
        const mappedSubs = subs.map(s => ({
          id: s.id || s.Id,
          name: s.name || s.Name,
          expCatograyId: s.expCatograyId || s.ExpCatograyId
        }));

        if (categoryId) {
          return mappedSubs.filter(s => s.expCatograyId === categoryId);
        }
        return mappedSubs;
      }),
      catchError(err => {
        console.warn('ExpSubCatogray fetch failed, returning hardcoded subcategories.', err);
        const subCategories = [
          { id: 1, name: 'Painting', expCatograyId: 1 },
          { id: 2, name: 'Photography', expCatograyId: 1 },
          { id: 3, name: 'Museums', expCatograyId: 1 },
          { id: 4, name: 'Concerts', expCatograyId: 2 },
          { id: 5, name: 'Theater', expCatograyId: 2 },
          { id: 6, name: 'Cooking Class', expCatograyId: 3 },
          { id: 7, name: 'Wine Tasting', expCatograyId: 3 },
          { id: 8, name: 'Food Tour', expCatograyId: 3 },
          { id: 9, name: 'Surfing', expCatograyId: 4 },
          { id: 10, name: 'Yoga', expCatograyId: 4 },
          { id: 11, name: 'Hiking', expCatograyId: 4 },
          { id: 12, name: 'City Tour', expCatograyId: 5 },
          { id: 13, name: 'Boat Tour', expCatograyId: 5 },
          { id: 14, name: 'Landmarks', expCatograyId: 6 },
          { id: 15, name: 'Spa', expCatograyId: 7 },
          { id: 16, name: 'Meditation', expCatograyId: 7 },
          { id: 17, name: 'Camping', expCatograyId: 8 },
          { id: 18, name: 'Wildlife', expCatograyId: 8 }
        ];
        if (categoryId) {
          return of(subCategories.filter(s => s.expCatograyId === categoryId));
        }
        return of(subCategories);
      })
    );
>>>>>>> 6c1b37138f6275b6b13adc2f9f507f0959f26db3
  }

  createExperience(experienceData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Experience`, experienceData);
  }

  uploadExperienceImage(experienceId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/Experience/${experienceId}/upload`, formData);
  }

  deleteExperience(experienceId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Experience/${experienceId}`);
  }

<<<<<<< HEAD
  getExperienceCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ExpCatogray`);
  }

  getExperienceSubCategories(categoryId?: string): Observable<any[]> {
    const url = categoryId 
      ? `${this.apiUrl}/ExpSubCatogray?categoryId=${categoryId}`
      : `${this.apiUrl}/ExpSubCatogray`;
    return this.http.get<any[]>(url);
  }

  // Analytics
  getAnalytics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/Analytics`);
  }

 // Test all endpoints - Fixed version
testAllEndpoints(): void {
  console.log('Testing API endpoints...');
  
  // Create properly typed endpoints array
  const endpoints: Array<{ 
    name: string; 
    observable: Observable<any> 
  }> = [
    { name: 'Stats', observable: this.getStats() },
    { name: 'Users', observable: this.getUsers() },
    { name: 'Listings', observable: this.getListings() },
    { name: 'Services', observable: this.getServices() },
    { name: 'Experiences', observable: this.getExperiences() },
    { name: 'Property Types', observable: this.getPropertyTypes() },
    { name: 'Property Categories', observable: this.getPropertyCategories() },
    { name: 'Service Categories', observable: this.getServiceCategories() },
    { name: 'Experience Categories', observable: this.getExperienceCategories() }
  ];

  endpoints.forEach((endpoint, index) => {
    // Use setTimeout to avoid overwhelming the API
    setTimeout(() => {
      console.log(`Testing ${endpoint.name}...`);
      endpoint.observable.subscribe({
        next: (data: any) => console.log(`✅ ${endpoint.name} working:`, data),
        error: (error: any) => console.error(`❌ ${endpoint.name} failed:`, error.message || error)
      });
    }, index * 300);
  });
=======
  // ============================================
  // EXPERIENCE CATEGORY CRUD OPERATIONS
  // ============================================

  createExperienceCategory(data: { name: string; description?: string }): Observable<any> {
    const payload = {
      Name: data.name,
      VAT: 0 // Required field by backend (default to 0)
    };
    return this.http.post<any>(`${this.apiUrl}/ExpCatogray`, payload).pipe(
      catchError(err => {
        console.error('createExperienceCategory error', err);
        throw err;
      })
    );
  }

  updateExperienceCategory(id: number, data: { name: string; description?: string }): Observable<any> {
    const payload = {
      Id: id,
      Name: data.name,
      VAT: 0 // Required field by backend (default to 0)
    };
    return this.http.put<any>(`${this.apiUrl}/ExpCatogray/${id}`, payload).pipe(
      catchError(err => {
        console.error('updateExperienceCategory error', err);
        throw err;
      })
    );
  }

  deleteExperienceCategory(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/ExpCatogray/${id}`).pipe(
      catchError(err => {
        console.error('deleteExperienceCategory error', err);
        throw err;
      })
    );
  }

  // ============================================
  // EXPERIENCE SUBCATEGORY CRUD OPERATIONS
  // ============================================

  getExperienceSubcategories(categoryId?: number): Observable<any[]> {
    const url = categoryId
      ? `${this.apiUrl}/ExpSubCatogray/CatograyId/${categoryId}`
      : `${this.apiUrl}/ExpSubCatogray`;

    return this.http.get<any[]>(url).pipe(
      catchError(err => {
        console.error('getExperienceSubcategories error', err);
        return of([]);
      })
    );
  }

  createExperienceSubcategory(data: { name: string; description?: string; expCatograyId: number }): Observable<any> {
    const payload = {
      Name: data.name,
      Description: data.description || '',
      ExpCatograyId: data.expCatograyId
    };
    return this.http.post<any>(`${this.apiUrl}/ExpSubCatogray`, payload).pipe(
      catchError(err => {
        console.error('createExperienceSubcategory error', err);
        throw err;
      })
    );
  }

  updateExperienceSubcategory(id: number, data: { name: string; description?: string; expCatograyId: number }): Observable<any> {
    const payload = {
      Id: id,
      Name: data.name,
      Description: data.description || '',
      ExpCatograyId: data.expCatograyId
    };
    return this.http.put<any>(`${this.apiUrl}/ExpSubCatogray/${id}`, payload).pipe(
      catchError(err => {
        console.error('updateExperienceSubcategory error', err);
        throw err;
      })
    );
  }

  deleteExperienceSubcategory(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/ExpSubCatogray/${id}`).pipe(
      catchError(err => {
        console.error('deleteExperienceSubcategory error', err);
        throw err;
      })
    );
  }
>>>>>>> 6c1b37138f6275b6b13adc2f9f507f0959f26db3
}

  getLoadingState(): Observable<boolean> {
    return this.loading$;
  }
}