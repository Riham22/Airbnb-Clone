// services/admin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, forkJoin, defer } from 'rxjs';
import { Action } from 'rxjs/internal/scheduler/Action';
import { tap, map, switchMap, catchError, finalize, timeout } from 'rxjs/operators';
import { AdminStats } from '../Models/AdminStats';
import { AdminUser } from '../Models/AdminUser';
import { AdminListing } from '../Models/AdminListing';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:5034/api';
  private statsSubject = new BehaviorSubject<AdminStats>(this.getInitialStats());
  private usersSubject = new BehaviorSubject<AdminUser[]>([]);
  private listingsSubject = new BehaviorSubject<AdminListing[]>([]);
  private servicesSubject = new BehaviorSubject<any[]>([]);
  private experiencesSubject = new BehaviorSubject<any[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private loadingRequestCount = 0;

  constructor(private http: HttpClient) { }

  // Stats Management - Calculated from data
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
      activeBookings: 0,
      totalServices: 0,
      totalExperiences: 0
    };
  }

  getStats(): Observable<AdminStats> {
    return defer(() => {
      this.increaseLoading();
      // 1. Create Observables for all necessary data sources
      const users$ = this.http.get<any[]>(`${this.apiUrl}/User`).pipe(timeout(10000), catchError(() => of([])));
      const properties$ = this.http.get<any[]>(`${this.apiUrl}/Properties`).pipe(timeout(10000), catchError(() => of([])));
      const services$ = this.http.get<any[]>(`${this.apiUrl}/Services`).pipe(timeout(10000), catchError(() => of([])));
      const experiences$ = this.http.get<any[]>(`${this.apiUrl}/Experience`).pipe(timeout(10000), catchError(() => of([])));
      const bookings$ = this.getAllBookings().pipe(timeout(10000), catchError(() => of([])));

      // 2. Use forkJoin to wait for all three requests to complete
      return forkJoin({
        users: users$,
        props: properties$,
        svcs: services$,
        exps: experiences$,
        bookings: this.getAllBookings().pipe(timeout(10000), catchError(() => of([])))
      }).pipe(
        map(({ users, props, svcs, exps, bookings }) => {
          // Handle potential wrapper objects if API returns { data: [...] }
          const servicesList = Array.isArray(svcs) ? svcs : (svcs as any)?.data || [];
          const experiencesList = Array.isArray(exps) ? exps : (exps as any)?.data || [];
          const bookingsList = Array.isArray(bookings) ? bookings : (bookings as any)?.data || [];

          const totalUsers = users.length;
          const totalListings = props.length;
          const totalBookings = bookingsList.length;

          const stats: AdminStats = {
            totalUsers,
            totalListings,
            totalBookings,
            totalRevenue: totalBookings * 150, // rough estimate or calculate from bookings
            pendingVerifications: 0,
            activeHosts: Math.floor(totalUsers * 0.3),
            monthlyGrowth: 0,
            weeklyRevenue: 0,
            activeBookings: totalBookings,
            totalServices: servicesList.length,
            totalExperiences: experiencesList.length
          };

          this.statsSubject.next(stats);
          return stats;
        }),
        catchError(err => {
          console.error('getStats forkJoin error', err);
          return of(this.getInitialStats());
        })
      );
    }).pipe(
      finalize(() => this.decreaseLoading())
    );
  }

  // ... (updateStats remains same)

  // Users Management - Connected to backend
  getUsers(): Observable<AdminUser[]> {
    return defer(() => {
      this.increaseLoading();
      return this.http.get<any>(`${this.apiUrl}/User`).pipe(
        timeout(10000),
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
        catchError(err => {
          console.error('getUsers error', err);
          return of([]);
        })
      );
    }).pipe(
      finalize(() => this.decreaseLoading())
    );
  }

  updateUserStatus(userId: string, status: 'active' | 'suspended'): Observable<AdminUser> {
    return new Observable<AdminUser>(observer => {
      // Mocking the update for now as backend might need specific endpoint
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
    return defer(() => {
      this.increaseLoading();
      // Use the host-specific endpoint to get ALL properties (published and unpublished)
      return this.http.get<any>(`${this.apiUrl}/Properties/my-properties`).pipe(
        timeout(10000),
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
              amenities: p.amenities || p.Amenities || [],
              description: p.description || p.Description,
              propertyTypeId: p.propertyTypeId || p.PropertyTypeId,
              propertyCategoryId: p.propertyCategoryId || p.PropertyCategoryId,
              beds: p.beds || p.Beds,
              imageUrl: p.imageUrl || p.ImageUrl
            };
          });
          this.listingsSubject.next(adminListings);
          return adminListings;
        }),
        catchError(err => {
          console.error('getListings error', err);
          return of([]);
        })
      );
    }).pipe(
      finalize(() => this.decreaseLoading())
    );
  }

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

  // Services Management
  getServices(): Observable<any[]> {
    return defer(() => {
      this.increaseLoading();
      // Use the host-specific endpoint to get ALL services
      return this.http.get<any>(`${this.apiUrl}/Services/my-services`).pipe(
        timeout(10000),
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
              images: images?.map((i: any) => i.imageUrl || i.ImageUrl) || [],
              serviceCategoryId: s.serviceCategoryId || s.ServiceCategoryId,
              duration: s.duration || s.Duration
            };
          });
          this.servicesSubject.next(mappedServices);
          return mappedServices;
        }),
        catchError(err => {
          console.error('getServices error', err);
          return of([]);
        })
      );
    }).pipe(
      finalize(() => this.decreaseLoading())
    );
  }

  // ...

  // Experiences Management
  getExperiences(): Observable<any[]> {
    return defer(() => {
      this.increaseLoading();
      // Use the host-specific endpoint to get ALL experiences
      return this.http.get<any>(`${this.apiUrl}/Experience/my-experiences`).pipe(
        timeout(10000),
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
              images: images?.map((i: any) => i.imageUrl || i.ImageUrl) || [],
              expCatograyId: e.expCatograyId || e.ExpCatograyId,
              expSubCatograyId: e.expSubCatograyId || e.ExpSubCatograyId,
              maxParticipants: e.maximumGuest || e.MaximumGuest || 10,
              expActivities: e.expActivities || e.ExpActivities || []
            };
          });
          this.experiencesSubject.next(mappedExperiences);
          return mappedExperiences;
        }),
        catchError(err => {
          console.error('getExperiences error', err);
          return of([]);
        })
      );
    }).pipe(
      finalize(() => this.decreaseLoading())
    );
  }

  // START OPTIMIZATION: Get All Data in One Call
  getAllBookings(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/Booking/all`).pipe(
      map(res => {
        return Array.isArray(res) ? res : res.data || [];
      })
    );
  }

  getDashboardData(): Observable<any> {
    return defer(() => {
      this.increaseLoading();

      return forkJoin({
        users: this.http.get<any[]>(`${this.apiUrl}/User`).pipe(timeout(15000), catchError(err => { console.warn('Users fetch failed', err); return of([]); })),
        properties: this.http.get<any[]>(`${this.apiUrl}/Properties/my-properties`).pipe(timeout(15000), catchError(err => { console.warn('Properties fetch failed', err); return of([]); })),
        services: this.http.get<any[]>(`${this.apiUrl}/Services/my-services`).pipe(timeout(15000), catchError(err => { console.warn('Services fetch failed', err); return of([]); })),
        experiences: this.http.get<any[]>(`${this.apiUrl}/Experience/my-experiences`).pipe(timeout(15000), catchError(err => { console.warn('Experiences fetch failed', err); return of([]); })),
        bookings: this.getAllBookings().pipe(timeout(15000), catchError(err => { console.warn('Bookings fetch failed', err); return of([]); }))
      }).pipe(
        map(({ users, properties, services, experiences, bookings }) => {

          // 1. Process Users
          const adminUsers: AdminUser[] = (users || []).map(u => ({
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

          // 2. Process Listings
          const rawProps = Array.isArray(properties) ? properties : (properties as any)?.data || [];
          const adminListings: AdminListing[] = rawProps.map((p: any) => ({
            id: (p.id || p.Id)?.toString() ?? '',
            title: p.title || p.Name,
            host: (p.host?.firstName || p.HostName) || 'Host',
            hostId: p.hostId || p.HostId || '1',
            type: 'Property',
            status: (p.isPublished || p.IsPublished) ? 'active' : 'pending',
            price: p.pricePerNight || p.PricePerNight || 0,
            location: p.location || p.Location || 'Unknown',
            rating: p.averageRating || 0,
            reviewCount: p.reviewCount || 0,
            createdAt: new Date(),
            lastBooking: new Date(),
            bedrooms: 0, bathrooms: 0, maxGuests: 0,
            images: [], amenities: [], description: '',
            propertyTypeId: 0, propertyCategoryId: 0, beds: 0, imageUrl: ''
          }));
          this.listingsSubject.next(adminListings);

          // 3. Process Services
          const rawServices = Array.isArray(services) ? services : (services as any)?.data || [];
          this.servicesSubject.next(rawServices); // Keep raw for now or map if needed

          // 4. Process Experiences
          const rawExperiences = Array.isArray(experiences) ? experiences : (experiences as any)?.data || [];
          this.experiencesSubject.next(rawExperiences);

          // 5. Calculate Stats
          const rawBookings = Array.isArray(bookings) ? bookings : (bookings as any)?.data || [];
          const totalRevenue = rawBookings.reduce((sum: number, b: any) => sum + (b.totalPrice || b.TotalPrice || 0), 0);

          const stats: AdminStats = {
            totalUsers: adminUsers.length,
            totalListings: adminListings.length,
            totalBookings: rawBookings.length,
            totalRevenue: totalRevenue || rawBookings.length * 150,
            pendingVerifications: 0,
            activeHosts: Math.floor(adminUsers.length * 0.3),
            monthlyGrowth: 0,
            weeklyRevenue: 0,
            activeBookings: rawBookings.length,
            totalServices: rawServices.length,
            totalExperiences: rawExperiences.length
          };
          this.statsSubject.next(stats);

          return { stats, users: adminUsers, listings: adminListings, services: rawServices, experiences: rawExperiences };
        }),
        finalize(() => this.decreaseLoading())
      );
    });
  }

  // Loading state
  getLoadingState(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }

  private increaseLoading(): void {
    this.loadingRequestCount++;
    console.warn(`[AdminService] Loading Increased: ${this.loadingRequestCount}`); // DEBUG
    this.loadingSubject.next(true);
  }

  private decreaseLoading(): void {
    if (this.loadingRequestCount > 0) {
      this.loadingRequestCount--;
      console.warn(`[AdminService] Loading Decreased: ${this.loadingRequestCount}`); // DEBUG
    } else {
      console.error('[AdminService] Loading decrease requested but count is already 0'); // DEBUG
    }
    if (this.loadingRequestCount === 0) {
      this.loadingSubject.next(false);
    }
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
      formData.append('Images', f);
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
      IsPublished: false
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

  // UPDATE Methods for Entities
  updateUser(id: string, userData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/User/${id}`, userData).pipe(
      tap(() => {
        this.getUsers().subscribe(); // Refresh data
      }),
      catchError(err => {
        console.error('updateUser error', err);
        throw err;
      })
    );
  }

  updateListing(id: string, listingData: any, files: File[] = []): Observable<any> {
    const payload = { ...listingData, id: id };

    // Logic similar to create but using PUT
    return this.http.put<any>(`${this.apiUrl}/Properties/${id}`, payload).pipe(
      switchMap((updated: any) => {
        if (files.length > 0) {
          return this.uploadPropertyImages(Number(id), files).pipe(
            map(results => ({ updated, uploads: results })),
            catchError(err => {
              console.error('Failed to upload images during update', err);
              return of({ updated, imageError: err });
            })
          );
        }
        return of({ updated });
      }),
      tap(() => this.getListings().subscribe()), // Refresh local state
      catchError(err => {
        console.error('updateListing error', err);
        throw err;
      })
    );
  }

  updateService(id: string, serviceData: any, files: File[] = []): Observable<any> {
    const payload = { ...serviceData, id: id };

    return this.http.put<any>(`${this.apiUrl}/Services/${id}`, payload).pipe(
      switchMap((updated: any) => {
        if (files.length > 0) {
          return this.uploadServiceImages(Number(id), files).pipe(
            map(results => ({ updated, uploads: results })),
            catchError(err => {
              console.error('Failed to upload images during update', err);
              return of({ updated, imageError: err });
            })
          );
        }
        return of({ updated });
      }),
      tap(() => this.getServices().subscribe()),
      catchError(err => {
        console.error('updateService error', err);
        throw err;
      })
    );
  }

  updateExperience(id: string, experienceData: any, files: File[] = []): Observable<any> {
    const payload = { ...experienceData, id: id };

    return this.http.put<any>(`${this.apiUrl}/Experience/${id}`, payload).pipe(
      switchMap((updated: any) => {
        if (files.length > 0) {
          return this.uploadExperienceImages(Number(id), files).pipe(
            map(results => ({ updated, uploads: results })),
            catchError(err => {
              console.error('Failed to upload images during update', err);
              return of({ updated, imageError: err });
            })
          );
        }
        return of({ updated });
      }),
      tap(() => this.getExperiences().subscribe()),
      catchError(err => {
        console.error('updateExperience error', err);
        throw err;
      })
    );
  }

  // Category Management Methods - try backend first, fallback to hardcoded
  getServiceCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ServiceCategories`).pipe(
      catchError(err => {
        console.warn('ServiceCategories endpoint failed, returning empty array as fallback.', err);
        return of([]);
      })
    );
  }

  createServiceCategory(data: any): Observable<any> {
    const payload = { Name: data.name, Description: data.description };
    return this.http.post<any>(`${this.apiUrl}/ServiceCategories`, payload).pipe(
      catchError(err => {
        console.error('createServiceCategory error', err);
        throw err;
      })
    );
  }

  updateServiceCategory(id: number, data: any): Observable<any> {
    const payload = { Id: id, Name: data.name, Description: data.description };
    return this.http.put<any>(`${this.apiUrl}/ServiceCategories/${id}`, payload).pipe(
      catchError(err => {
        console.error('updateServiceCategory error', err);
        throw err;
      })
    );
  }

  deleteServiceCategory(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/ServiceCategories/${id}`).pipe(
      catchError(err => {
        console.error('deleteServiceCategory error', err);
        throw err;
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
  }

  getPropertyTypes(): Observable<any[]> {
    // Assuming backend will expose PropertyTypes
    return this.http.get<any[]>(`${this.apiUrl}/PropertyTypes`).pipe(
      catchError(err => {
        console.warn('PropertyTypes endpoint failed, returning hardcoded types.', err);
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
    return this.http.get<any[]>(`${this.apiUrl}/PropertyCategories`).pipe(
      catchError(err => {
        console.warn('PropertyCategories endpoint failed, returning hardcoded categories.', err);
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
}
