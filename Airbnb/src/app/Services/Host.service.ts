// services/host.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, forkJoin } from 'rxjs';
import { tap, map, switchMap, catchError } from 'rxjs/operators';
import { HostStats } from '../Models/HostStats';
import { HostBooking } from '../Models/HostBooking';
import { HostListing } from '../Models/HostListing';

@Injectable({
  providedIn: 'root'
})
export class HostService {
  private apiUrl = 'https://localhost:7020/api';

  private statsSubject = new BehaviorSubject<HostStats>(this.getInitialStats());
  private bookingsSubject = new BehaviorSubject<HostBooking[]>([]);
  private listingsSubject = new BehaviorSubject<HostListing[]>([]);
  private servicesSubject = new BehaviorSubject<any[]>([]);
  private experiencesSubject = new BehaviorSubject<any[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  // Observables للاستخدام في المكونات
  stats$ = this.statsSubject.asObservable();
  bookings$ = this.bookingsSubject.asObservable();
  listings$ = this.listingsSubject.asObservable();
  services$ = this.servicesSubject.asObservable();
  experiences$ = this.experiencesSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) { }

  // ==================== STATS MANAGEMENT ====================
  getStats(): Observable<HostStats> {
    this.setLoading(true);

    // استخدام forkJoin لجمع البيانات من مصادر متعددة
    const properties$ = this.http.get<any[]>(`${this.apiUrl}/Properties/my-properties`).pipe(
      catchError(() => of([]))
    );

    const bookings$ = this.http.get<any>(`${this.apiUrl}/Booking/host-bookings`).pipe(
      map(res => res.data || res || []),
      catchError(() => of([]))
    );

    return forkJoin({
      properties: properties$,
      bookings: bookings$
    }).pipe(
      map(({ properties, bookings }) => {
        const activeProperties = properties.filter((p: any) =>
          p.isPublished || p.IsPublished || p.status === 'active'
        ).length;

        const totalBookings = bookings.length;
        const completedBookings = bookings.filter((b: any) =>
          b.status === 'completed' || b.status === 'Confirmed'
        ).length;

        // حساب الإيرادات (افتراضي)
        const totalEarnings = completedBookings * 150;
        const monthlyEarnings = totalEarnings * 0.3; // 30% من الإجمالي

        const stats: HostStats = {
          totalEarnings: totalEarnings,
          monthlyEarnings: monthlyEarnings,
          activeListings: activeProperties,
          totalBookings: totalBookings,
          occupancyRate: activeProperties > 0 ? (completedBookings / activeProperties) * 100 : 0,
          averageRating: this.calculateAverageRating(properties),
          responseRate: 95 // قيمة افتراضية
        };

        this.statsSubject.next(stats);
        return stats;
      }),
      tap(() => this.setLoading(false)),
      catchError(err => {
        console.error('getStats error', err);
        this.setLoading(false);
        return of(this.getInitialStats());
      })
    );
  }

  updateStats(updates: Partial<HostStats>): void {
    const current = this.statsSubject.value;
    this.statsSubject.next({ ...current, ...updates });
  }

  // ==================== BOOKINGS MANAGEMENT ====================
  getBookings(): Observable<HostBooking[]> {
    this.setLoading(true);

    return this.http.get<any>(`${this.apiUrl}/Booking/host-bookings`).pipe(
      map((response: any) => {
        const bookings = Array.isArray(response) ? response : (response?.data || []);

        const hostBookings: HostBooking[] = bookings.map((b: any) => {
          const property = b.property || b.Property;
          const guest = b.user || b.User;

          return {
            id: b.id || b.Id,
            propertyName: property?.title || property?.Title || property?.name || 'Unknown Property',
            guestName: guest ? `${guest.firstName || guest.FirstName} ${guest.lastName || guest.LastName}`
                     : b.guestName || 'Unknown Guest',
            guestEmail: guest?.email || guest?.Email || b.guestEmail || '',
            checkIn: b.checkInDate ? new Date(b.checkInDate) : new Date(),
            checkOut: b.checkOutDate ? new Date(b.checkOutDate) : new Date(),
            guests: b.numberOfGuests || b.guests || 1,
            totalPrice: b.totalPrice || b.price || 0,
            status: this.mapBookingStatus(b.status || b.Status),
            bookingDate: b.createdAt ? new Date(b.createdAt) : new Date(),
            propertyImage: property?.coverImageUrl || property?.imageUrl || ''
          };
        });

        this.bookingsSubject.next(hostBookings);
        return hostBookings;
      }),
      tap(() => this.setLoading(false)),
      catchError(err => {
        console.error('getBookings error', err);
        this.setLoading(false);
        return of([]);
      })
    );
  }

  updateBookingStatus(bookingId: number, status: 'pending' | 'confirmed' | 'cancelled' | 'completed'): Observable<any> {
    const payload = { status: status };

    return this.http.put(`${this.apiUrl}/Booking/${bookingId}/status`, payload).pipe(
      switchMap(() => {
        // بعد التحديث الناجح، أعد تحميل البيانات من الـ API
        return this.getBookings();
      }),
      catchError(err => {
        console.error('updateBookingStatus error', err);
        throw err;
      })
    );
  }

  // ==================== LISTINGS MANAGEMENT ====================
  getListings(): Observable<HostListing[]> {
    this.setLoading(true);

    return this.http.get<any>(`${this.apiUrl}/Properties/my-properties`).pipe(
      map((response: any) => {
        const properties = Array.isArray(response) ? response : (response?.data || []);

        const hostListings: HostListing[] = properties.map((p: any) => {
          const city = p.city || p.City;
          const country = p.country || p.Country;
          const images = p.images || p.Images;
          const isPublished = p.isPublished || p.IsPublished;

          return {
            id: (p.id || p.Id)?.toString() ?? '',
            title: p.title || p.Title || p.name || p.Name || 'Unnamed Property',
            type: 'property',
            status: isPublished ? 'active' : 'inactive',
            price: p.pricePerNight || p.price || p.Price || 0,
            location: city && country ? `${city}, ${country}` : p.location || 'Unknown Location',
            rating: p.averageRating || p.rating || 0,
            reviewCount: p.reviewsCount || p.reviewCount || 0,
            bookingsCount: p.bookingsCount || 0,
            images: images?.length ?
              images.map((i: any) => i.imageUrl || i.ImageUrl || i.imageURL)
              : [p.coverImageUrl || p.CoverImageUrl || p.imageUrl || p.ImageUrl || ''],
            createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
            lastBooking: p.lastBookingDate ? new Date(p.lastBookingDate) : null,
            maxGuests: p.maxGuests || p.maximumGuests || 0,
            bedrooms: p.bedrooms || 0,
            bathrooms: p.bathrooms || 0
          };
        });

        this.listingsSubject.next(hostListings);
        return hostListings;
      }),
      tap(() => this.setLoading(false)),
      catchError(err => {
        console.error('getListings error', err);
        this.setLoading(false);
        return of([]);
      })
    );
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
      amenityIds: Array.isArray(listingData.amenityIds) ? listingData.amenityIds : (listingData.amenities || []),
      isPublished: listingData.isPublished !== undefined ? listingData.isPublished : true
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

  updateListingStatus(listingId: string, status: 'active' | 'inactive'): Observable<any> {
    const action = status === 'active' ? 'publish' : 'unpublish';

    return this.http.put(`${this.apiUrl}/Properties/${listingId}/${action}`, {}).pipe(
      switchMap(() => {
        // بعد التحديث الناجح، أعد تحميل البيانات من الـ API
        return this.getListings();
      }),
      catchError(err => {
        console.error(`updateListingStatus to ${status} error`, err);
        throw err;
      })
    );
  }

  deleteListing(listingId: string): Observable<boolean> {
    return this.http.delete(`${this.apiUrl}/Properties/${listingId}`).pipe(
      switchMap(() => {
        // بعد الحذف الناجح، أعد تحميل البيانات من الـ API
        return this.getListings().pipe(map(() => true));
      }),
      catchError(err => {
        console.error('deleteListing error', err);
        throw err;
      })
    );
  }

  // ==================== SERVICES MANAGEMENT ====================
  getServices(): Observable<any[]> {
    this.setLoading(true);

    return this.http.get<any>(`${this.apiUrl}/Services/my-services`).pipe(
      map((response: any) => {
        const services = Array.isArray(response) ? response : (response?.data || []);

        const mappedServices = services.map((s: any) => {
          const city = s.city || s.City;
          const country = s.country || s.Country;
          const images = s.images || s.Images;
          const isPublished = s.isPublished || s.IsPublished;

          return {
            id: (s.id || s.Id)?.toString() || '',
            name: s.title || s.Title || s.name || s.Name || 'Unnamed Service',
            description: s.description || s.Description,
            price: s.price || s.Price,
            currency: s.currency || s.Currency || 'USD',
            location: city && country ? `${city}, ${country}` : (city || country || 'Unknown'),
            category: s.categoryName || s.CategoryName || s.category?.name || 'Uncategorized',
            rating: s.averageRating || s.AverageRating || 0,
            reviewCount: s.reviewsCount || s.ReviewsCount || 0,
            status: isPublished ? 'active' : 'inactive',
            imageUrl: images?.[0]?.imageUrl || images?.[0]?.ImageUrl || s.imageUrl || s.ImageUrl || '',
            images: images?.map((i: any) => i.imageUrl || i.ImageUrl) || [],
            createdAt: s.createdAt ? new Date(s.createdAt) : new Date()
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

  updateServiceStatus(serviceId: string, status: 'active' | 'inactive'): Observable<any> {
    const action = status === 'active' ? 'publish' : 'unpublish';

    return this.http.put(`${this.apiUrl}/Services/${serviceId}/${action}`, {}).pipe(
      switchMap(() => {
        // بعد التحديث الناجح، أعد تحميل البيانات من الـ API
        return this.getServices();
      }),
      catchError(err => {
        console.error(`updateServiceStatus to ${status} error`, err);
        throw err;
      })
    );
  }

  deleteService(serviceId: string): Observable<boolean> {
    return this.http.delete(`${this.apiUrl}/Services/${serviceId}`).pipe(
      switchMap(() => {
        // بعد الحذف الناجح، أعد تحميل البيانات من الـ API
        return this.getServices().pipe(map(() => true));
      }),
      catchError(err => {
        console.error('deleteService error', err);
        throw err;
      })
    );
  }

  // ==================== EXPERIENCES MANAGEMENT ====================
  getExperiences(): Observable<any[]> {
    this.setLoading(true);

    return this.http.get<any>(`${this.apiUrl}/Experience/my-experiences`).pipe(
      map((response: any) => {
        const experiences = Array.isArray(response) ? response : (response?.data || []);

        const mappedExperiences = experiences.map((e: any) => {
          const city = e.city || e.City;
          const country = e.country || e.Country;
          const images = e.images || e.Images;
          const status = e.status || e.Status;
          const isActive = status === 3 || status === 'Published' || status === 'Active';

          return {
            id: (e.id || e.Id)?.toString() || '',
            name: e.title || e.Title || e.name || e.Name || e.expTitle || e.ExpTitle || 'Unnamed Experience',
            description: e.description || e.Description || e.expDescribe || e.ExpDescribe,
            location: e.location || e.Location || (city && country ? `${city}, ${country}` : 'Unknown'),
            price: e.price || e.Price || e.guestPrice || e.GuestPrice,
            category: e.categoryName || e.CategoryName || e.category?.name || e.expCatogray?.name || 'Uncategorized',
            rating: e.averageRating || e.AverageRating || 0,
            reviewCount: e.reviewsCount || e.ReviewsCount || 0,
            status: isActive ? 'active' : 'inactive',
            imageUrl: images?.[0]?.imageUrl || images?.[0]?.ImageUrl || e.imageUrl || e.ImageUrl || '',
            images: images?.map((i: any) => i.imageUrl || i.ImageUrl) || [],
            createdAt: e.createdAt ? new Date(e.createdAt) : new Date(),
            duration: e.duration || '3 hours',
            maxParticipants: e.maximumGuest || e.maxParticipants || 10
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

  updateExperienceStatus(experienceId: string, status: 'active' | 'inactive'): Observable<any> {
    const action = status === 'active' ? 'publish' : 'unpublish';

    return this.http.put(`${this.apiUrl}/Experience/${experienceId}/${action}`, {}).pipe(
      switchMap(() => {
        // بعد التحديث الناجح، أعد تحميل البيانات من الـ API
        return this.getExperiences();
      }),
      catchError(err => {
        console.error(`updateExperienceStatus to ${status} error`, err);
        throw err;
      })
    );
  }

  deleteExperience(experienceId: string): Observable<boolean> {
    return this.http.delete(`${this.apiUrl}/Experience/${experienceId}`).pipe(
      switchMap(() => {
        // بعد الحذف الناجح، أعد تحميل البيانات من الـ API
        return this.getExperiences().pipe(map(() => true));
      }),
      catchError(err => {
        console.error('deleteExperience error', err);
        throw err;
      })
    );
  }

  // ==================== IMAGE UPLOAD ====================
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

  // ==================== CATEGORY MANAGEMENT ====================
  getPropertyTypes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/PropertyType`).pipe(
      catchError(err => {
        console.warn('PropertyType endpoint failed', err);
        return of([]);
      })
    );
  }

  getPropertyCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/PropertyCategory`).pipe(
      catchError(err => {
        console.warn('PropertyCategory endpoint failed', err);
        return of([]);
      })
    );
  }

  getServiceCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Services/categories`).pipe(
      catchError(err => {
        console.warn('ServiceCategory endpoint failed', err);
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
        console.warn('ExpCatogray endpoint failed', err);
        return of([]);
      })
    );
  }

  getExperienceSubCategories(categoryId?: number): Observable<any[]> {
    const endpoint = categoryId
      ? `${this.apiUrl}/ExpSubCatogray/CatograyId/${categoryId}`
      : `${this.apiUrl}/ExpSubCatogray`;

    return this.http.get<any[]>(endpoint).pipe(
      map(subs => subs.map(s => ({
        id: s.id || s.Id,
        name: s.name || s.Name,
        expCatograyId: s.expCatograyId || s.ExpCatograyId
      }))),
      catchError(err => {
        console.warn('ExpSubCatogray endpoint failed', err);
        return of([]);
      })
    );
  }

  // ==================== HELPER METHODS ====================
  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  private getInitialStats(): HostStats {
    return {
      totalEarnings: 0,
      monthlyEarnings: 0,
      activeListings: 0,
      totalBookings: 0,
      occupancyRate: 0,
      averageRating: 0,
      responseRate: 0
    };
  }

  private calculateAverageRating(properties: any[]): number {
    if (!properties.length) return 0;

    const totalRating = properties.reduce((sum, p) => {
      const rating = Number(p.averageRating || p.rating || 0);
      return sum + rating;
    }, 0);

    return totalRating / properties.length;
  }

  private mapBookingStatus(status: string | number): 'pending' | 'confirmed' | 'cancelled' | 'completed' {
    // حوّل إلى string إذا كان رقم
    const statusStr = typeof status === 'number' ? status.toString() : String(status || '');

    const statusMap: { [key: string]: 'pending' | 'confirmed' | 'cancelled' | 'completed' } = {
      '1': 'pending',
      '2': 'confirmed',
      '3': 'cancelled',
      '4': 'completed',
      'Pending': 'pending',
      'Confirmed': 'confirmed',
      'Cancelled': 'cancelled',
      'Completed': 'completed',
      'pending': 'pending',
      'confirmed': 'confirmed',
      'cancelled': 'cancelled',
      'completed': 'completed'
    };

    return statusMap[statusStr] || 'pending';
  }

  // ==================== TEST METHODS ====================
  testEndpoints(): void {
    console.log('🧪 Testing Host Service endpoints...');

    this.http.get(`${this.apiUrl}/Properties/my-properties`).subscribe({
      next: (data) => {
        console.log('✅ Host Properties endpoint works!', data);
      },
      error: (err) => {
        console.error('❌ Host Properties endpoint failed:', err);
      }
    });

    this.http.get(`${this.apiUrl}/Booking/host-bookings`).subscribe({
      next: (data) => {
        console.log('✅ Host Bookings endpoint works!', data);
      },
      error: (err) => {
        console.error('❌ Host Bookings endpoint failed:', err);
      }
    });
  }
}
