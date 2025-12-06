// data.service.ts - FIXED VERSION

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap, catchError, of, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Experience } from '../Models/experience';
import { Service } from '../Models/service';
import { SearchFilters } from '../Models/search-filters';
import { Booking } from '../Models/booking';
import { RentalProperty } from '../Models/rental-property';

export type ListingType = RentalProperty | Experience | Service;

@Injectable({
  providedIn: 'root',
})
export class Data {
  getAmenities(): string[] {
    throw new Error('Method not implemented.');
  }
  private bookings: Booking[] = [];
  private wishlistCache: Set<string> = new Set();

  private apiUrl = 'https://localhost:7020'; // Backend URL
  private useMockData = false; // Flag to use mock data when backend fails

  private propertiesSubject = new BehaviorSubject<RentalProperty[]>([]);
  properties$ = this.propertiesSubject.asObservable();

  private experiencesSubject = new BehaviorSubject<Experience[]>([]);
  experiences$ = this.experiencesSubject.asObservable();

  private servicesSubject = new BehaviorSubject<Service[]>([]);
  services$ = this.servicesSubject.asObservable();

  constructor(private http: HttpClient) {
    // First, check if backend is available
    this.checkBackendHealth().subscribe(isHealthy => {
      if (isHealthy) {
        console.log('Backend is available, loading data from API');
        this.useMockData = false;
        this.loadWishlist();
        this.loadProperties();
        this.loadExperiences();
        this.loadServices();
      } else {
        console.warn('Backend not available, using mock data');
        this.useMockData = true;
        this.loadMockData();
      }
    });
  }

  /**
   * Check if backend server is running
   */
  private checkBackendHealth(): Observable<boolean> {
    return this.http.get(`${this.apiUrl}/health`, {
      responseType: 'text',
      observe: 'response'
    }).pipe(
      tap(response => console.log('Backend health check:', response.status)),
      map(response => response.status === 200),
      catchError((error) => {
        console.warn('Backend health check failed:', error.message);
        return of(false);
      })
    );
  }

  /**
   * Load all mock data when backend is unavailable
   */
  private loadMockData(): void {
    const properties = this.getHardcodedProperties();
    const experiences = this.getHardcodedExperiences();
    const services = this.getHardcodedServices();

    // Apply wishlist status to mock data
    this.wishlistCache.forEach(key => {
      const [itemType, itemId] = key.split('_');
      const id = parseInt(itemId);

      switch(itemType) {
        case 'Property':
          const property = properties.find(p => p.id === id);
          if (property) property.isWishlisted = true;
          break;
        case 'Experience':
          const experience = experiences.find(e => e.id === id);
          if (experience) experience.isWishlisted = true;
          break;
        case 'Service':
          const service = services.find(s => s.id === id);
          if (service) service.isWishlisted = true;
          break;
      }
    });

    this.propertiesSubject.next(properties);
    this.experiencesSubject.next(experiences);
    this.servicesSubject.next(services);
  }

  /**
   * Load wishlist - FIXED: Removed circular reloading
   */
  loadWishlist() {
    this.http.get<any[]>(`${this.apiUrl}/api/Wishlist`).pipe(
      catchError((error) => {
        console.warn('Cannot load wishlist from backend, using local cache');
        // Try to load from localStorage as fallback
        const storedWishlist = localStorage.getItem('wishlist');
        if (storedWishlist) {
          return of(JSON.parse(storedWishlist));
        }
        return of([]);
      })
    ).subscribe({
      next: (items: any[]) => {
        this.wishlistCache.clear();
        items.forEach(item => {
          if (item.itemType && item.itemId) {
            const key = `${item.itemType}_${item.itemId}`;
            this.wishlistCache.add(key);
          }
        });
        // Save to localStorage for offline use
        localStorage.setItem('wishlist', JSON.stringify(items));

        // Only update UI if using mock data
        if (this.useMockData) {
          this.loadMockData();
        }
      },
      error: (err) => console.error('Failed to load wishlist', err)
    });
  }

  /**
   * Load properties with proper error handling
   */
  loadProperties() {
    // Don't load from API if using mock data
    if (this.useMockData) return;

    this.http.get<any[]>(`${this.apiUrl}/api/properties`).pipe(
      catchError((error) => {
        console.warn('Failed to load properties from API, switching to mock data');
        this.useMockData = true;
        return of(this.getHardcodedProperties());
      })
    ).subscribe({
      next: (data) => {
        if (this.useMockData && Array.isArray(data) && data.length > 0) {
          // This is mock data from catchError
          this.propertiesSubject.next(data);
        } else if (Array.isArray(data)) {
          // This is real API data
          const mappedProperties: RentalProperty[] = data.map(p => ({
            id: p.id,
            name: p.title,
            location: `${p.city}, ${p.country}`,
            price: p.pricePerNight,
            rating: p.averageRating,
            reviewCount: p.reviewsCount,
            imageUrl: p.coverImageUrl,
            images: [p.coverImageUrl],
            type: 'property',
            propertyType: this.mapPropertyType(p.propertyType?.name || 'apartment'),
            maxGuests: p.maxGuests || 2,
            bedrooms: p.bedrooms || 1,
            beds: p.beds || 1,
            bathrooms: p.bathrooms || 1,
            amenities: p.amenities?.map((a: any) => a.name) || [],
            host: {
              name: p.host?.name || 'Host',
              joinedDate: '2024',
              isSuperhost: p.host?.isSuperhost || false,
              avatar: p.host?.avatar || ''
            },
            description: p.description || '',
            highlights: [],
            reviews: [],
            isWishlisted: this.isWishlistedSync('Property', p.id)
          }));
          this.propertiesSubject.next(mappedProperties);
        }
      },
      error: (err) => {
        console.error('Error in loadProperties:', err);
        // Fallback to mock data
        this.propertiesSubject.next(this.getHardcodedProperties());
      }
    });
  }

  private mapPropertyType(backendType: string): string {
    const type = backendType.toLowerCase();
    if (type.includes('beach') || type.includes('coast')) return 'beach';
    if (type.includes('city') || type.includes('apartment') || type.includes('loft')) return 'city';
    if (type.includes('mountain') || type.includes('cabin') || type.includes('ski')) return 'mountain';
    if (type.includes('lake') || type.includes('water')) return 'lake';
    if (type.includes('country') || type.includes('farm') || type.includes('barn')) return 'countryside';
    return 'city'; // Default fallback
  }

  /**
   * Get hardcoded properties
   */
  private getHardcodedProperties(): RentalProperty[] {
    return [
      {
        id: 1,
        name: 'Cozy Beachfront Apartment',
        location: 'Malibu, California',
        price: 245,
        rating: 4.92,
        reviewCount: 128,
        imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
        images: [
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
          'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb',
          'https://images.unsplash.com/photo-1554995207-c18c203602cb',
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750'
        ],
        type: 'property',
        propertyType: 'beach',
        maxGuests: 4,
        bedrooms: 2,
        beds: 3,
        bathrooms: 1.5,
        amenities: [
          'WiFi', 'Kitchen', 'Parking', 'Beach Access',
          'Air Conditioning', 'TV', 'Washer'
        ],
        host: {
          name: 'Sarah Johnson',
          joinedDate: '2018',
          isSuperhost: true,
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786'
        },
        description: 'Beautiful beachfront apartment with stunning ocean views. Perfect for a relaxing getaway with direct beach access.',
        highlights: [
          'Beachfront location',
          'Stunning ocean views',
          'Modern amenities',
          'Direct beach access'
        ],
        reviews: [
          {
            id: 1,
            user: 'Michael T.',
            date: '2024-01-15',
            rating: 5,
            comment: 'Absolutely stunning views! The apartment was even better than pictured.',
            userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d'
          }
        ],
        isWishlisted: this.isWishlistedSync('Property', 1)
      },
      {
        id: 2,
        name: 'Modern City Loft',
        location: 'New York City, New York',
        price: 189,
        rating: 4.78,
        reviewCount: 95,
        imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00',
        images: [
          'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
          'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5',
          'https://images.unsplash.com/photo-1505691938895-1758d7feb511'
        ],
        type: 'property',
        propertyType: 'city',
        maxGuests: 2,
        bedrooms: 1,
        beds: 1,
        bathrooms: 1,
        amenities: ['WiFi', 'Kitchen', 'Gym', 'City View', 'Heating'],
        host: {
          name: 'Daniel Price',
          joinedDate: '2020',
          isSuperhost: false,
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'
        },
        description: 'Stylish loft located in the heart of NYC. Walking distance to major attractions and subway stations.',
        highlights: [
          'Central location',
          'Modern interior',
          'High-speed WiFi',
          'Gym access'
        ],
        reviews: [
          {
            id: 1,
            user: 'Emily R.',
            date: '2024-02-02',
            rating: 5,
            comment: 'Perfect location & super clean!',
            userAvatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e'
          }
        ],
        isWishlisted: this.isWishlistedSync('Property', 2)
      },
      // Add more properties as needed
    ];
  }

  getProperties(): RentalProperty[] {
    return this.propertiesSubject.value;
  }

  /**
   * Load experiences with proper error handling
   */
  loadExperiences() {
    // Don't load from API if using mock data
    if (this.useMockData) return;

    this.http.get<any[]>(`${this.apiUrl}/api/Experience`).pipe(
      catchError((error) => {
        console.warn('Failed to load experiences from API, using mock data');
        return of(this.getHardcodedExperiences());
      })
    ).subscribe({
      next: (data) => {
        if (this.useMockData && Array.isArray(data) && data.length > 0) {
          // This is mock data from catchError
          this.experiencesSubject.next(data);
        } else if (Array.isArray(data)) {
          // This is real API data
          const mappedExperiences: Experience[] = data.map(exp => ({
            id: exp.id,
            type: 'experience',
            name: exp.expTitle || exp.name || 'Experience',
            location: `${exp.city || ''}, ${exp.country || ''}`.trim(),
            price: exp.guestPrice || 0,
            rating: exp.averageRating || 4.5,
            reviewCount: exp.reviewsCount || 0,
            imageUrl: exp.images?.[0]?.imageURL || '',
            images: exp.images?.map((img: any) => img.imageURL) || [],
            category: exp.expCatograyName || 'general',
            duration: exp.duration || '3 hours',
            maxParticipants: exp.maximumGuest || 10,
            host: {
              name: exp.host?.name || 'Host',
              joinedDate: new Date(exp.postedDate || Date.now()).getFullYear().toString(),
              isSuperhost: exp.host?.isSuperhost || false,
              avatar: exp.host?.avatar || ''
            },
            description: exp.expDescribe || exp.expSummary || '',
            highlights: exp.highlights || [],
            includes: exp.includes || [],
            requirements: exp.requirements || [],
            meetingPoint: exp.locationName || '',
            languages: exp.usingLanguage ? [exp.usingLanguage] : ['English'],
            reviews: [],
            isWishlisted: this.isWishlistedSync('Experience', exp.id)
          }));
          this.experiencesSubject.next(mappedExperiences);
        }
      },
      error: (err) => {
        console.error('Error in loadExperiences:', err);
        // Fallback to mock data
        this.experiencesSubject.next(this.getHardcodedExperiences());
      }
    });
  }

  getExperiences(): Experience[] {
    return this.experiencesSubject.value;
  }

  /**
   * Fallback hardcoded experiences
   */
  private getHardcodedExperiences(): Experience[] {
    return [
      {
        id: 101,
        type: 'experience',
        name: 'Wine Tasting in Napa Valley',
        location: 'Napa Valley, California',
        price: 89,
        rating: 4.95,
        reviewCount: 234,
        imageUrl: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
        images: [
          'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'
        ],
        category: 'food-drink',
        duration: '3 hours',
        maxParticipants: 12,
        host: {
          name: 'Sophia Martinez',
          joinedDate: '2019',
          isSuperhost: true,
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
        },
        description: 'Join us for an exclusive wine tasting experience at a family-owned vineyard. Learn about wine production while enjoying stunning valley views.',
        highlights: ['Local winery', 'Expert sommelier', 'Beautiful scenery', 'Small group'],
        includes: ['Wine tasting (5 varieties)', 'Cheese platter', 'Vineyard tour'],
        requirements: ['Age 21+', 'Comfortable walking shoes'],
        meetingPoint: 'Main Winery Entrance',
        languages: ['English', 'Spanish'],
        reviews: [
          {
            id: 201,
            user: 'David L.',
            date: '2024-01-20',
            rating: 5,
            comment: 'Amazing experience! Sophia was incredibly knowledgeable.',
            userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
          }
        ],
        isWishlisted: this.isWishlistedSync('Experience', 101)
      },
      // Add more experiences as needed
    ];
  }

  /**
   * Load services with proper error handling
   */
  loadServices() {
    // Don't load from API if using mock data
    if (this.useMockData) return;

    this.http.get<any[]>(`${this.apiUrl}/api/Services`).pipe(
      catchError((error) => {
        console.warn('Failed to load services from API, using mock data');
        return of(this.getHardcodedServices());
      })
    ).subscribe({
      next: (data) => {
        if (this.useMockData && Array.isArray(data) && data.length > 0) {
          // This is mock data from catchError
          this.servicesSubject.next(data);
        } else if (Array.isArray(data)) {
          // This is real API data
          const mappedServices: Service[] = data.map(svc => ({
            id: svc.id,
            type: 'service',
            name: svc.title || 'Service',
            location: `${svc.city || ''}, ${svc.country || ''}`.trim(),
            price: svc.price || 0,
            rating: svc.averageRating || 0,
            reviewCount: svc.reviewsCount || 0,
            imageUrl: svc.coverImageUrl || '',
            images: svc.images?.map((img: any) => img.imageUrl) || [svc.coverImageUrl],
            category: svc.categoryName || 'general',
            duration: svc.duration || '3 hours',
            provider: {
              name: svc.provider?.name || 'Provider',
              joinedDate: '2024',
              isVerified: svc.provider?.isVerified || true,
              avatar: svc.provider?.avatar || ''
            },
            description: svc.description || '',
            highlights: svc.highlights || [],
            includes: svc.includes || [],
            requirements: svc.requirements || [],
            reviews: [],
            isWishlisted: this.isWishlistedSync('Service', svc.id)
          }));
          this.servicesSubject.next(mappedServices);
        }
      },
      error: (err) => {
        console.error('Error in loadServices:', err);
        // Fallback to mock data
        this.servicesSubject.next(this.getHardcodedServices());
      }
    });
  }

  getServices(): Service[] {
    return this.servicesSubject.value;
  }

  /**
   * Fallback hardcoded services
   */
  private getHardcodedServices(): Service[] {
    return [
      {
        id: 201,
        type: 'service',
        name: 'Professional House Cleaning',
        location: 'Los Angeles, California',
        price: 120,
        rating: 4.90,
        reviewCount: 345,
        imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
        images: [
          'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'
        ],
        category: 'cleaning',
        duration: '3 hours',
        provider: {
          name: 'CleanPro Services',
          joinedDate: '2018',
          isVerified: true,
          avatar: 'https://images.unsplash.com/photo-1560250056-07ba64664864?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
        },
        description: 'Professional deep cleaning service for homes and apartments. We use eco-friendly products and pay attention to every detail.',
        highlights: ['Eco-friendly products', 'Professional team', 'Satisfaction guaranteed', 'Flexible scheduling'],
        includes: ['Deep cleaning', 'Kitchen & bathroom', 'Floor cleaning', 'Dusting'],
        requirements: ['Access to property', 'Clear workspace'],
        reviews: [
          {
            id: 301,
            user: 'Jennifer T.',
            date: '2024-01-22',
            rating: 5,
            comment: 'My apartment has never been cleaner! Highly recommended.',
            userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
          }
        ],
        isWishlisted: this.isWishlistedSync('Service', 201)
      },
      // Add more services as needed
    ];
  }

  /**
   * Toggle wishlist with offline support
   */
  toggleWishlist(itemType: string, itemId: number) {
    const key = `${itemType}_${itemId}`;
    const currentlyWishlisted = this.wishlistCache.has(key);

    if (this.useMockData) {
      // Handle locally when backend is unavailable
      if (currentlyWishlisted) {
        this.wishlistCache.delete(key);
      } else {
        this.wishlistCache.add(key);
      }

      // Update UI
      this.updateWishlistStatus(itemType, itemId, !currentlyWishlisted);

      // Save to localStorage
      this.saveWishlistToStorage();

      return of({ wishlisted: !currentlyWishlisted });
    }

    // Call backend API
    return this.http.post<any>(`${this.apiUrl}/api/Wishlist/toggle`, {
      itemType: itemType,
      itemId: itemId
    }).pipe(
      tap((response: any) => {
        if (response.wishlisted) {
          this.wishlistCache.add(key);
        } else {
          this.wishlistCache.delete(key);
        }
        // Update UI
        this.updateWishlistStatus(itemType, itemId, response.wishlisted);
        // Save to localStorage
        this.saveWishlistToStorage();
      }),
      catchError((error) => {
        console.warn('Failed to toggle wishlist on backend, updating locally');
        // Update locally
        if (currentlyWishlisted) {
          this.wishlistCache.delete(key);
          this.updateWishlistStatus(itemType, itemId, false);
        } else {
          this.wishlistCache.add(key);
          this.updateWishlistStatus(itemType, itemId, true);
        }
        this.saveWishlistToStorage();
        return of({ wishlisted: !currentlyWishlisted });
      })
    );
  }

  /**
   * Update wishlist status in UI
   */
  private updateWishlistStatus(itemType: string, itemId: number, isWishlisted: boolean): void {
    switch(itemType) {
      case 'Property':
        const properties = this.propertiesSubject.value.map(p => {
          if (p.id === itemId) {
            return { ...p, isWishlisted };
          }
          return p;
        });
        this.propertiesSubject.next(properties);
        break;

      case 'Experience':
        const experiences = this.experiencesSubject.value.map(e => {
          if (e.id === itemId) {
            return { ...e, isWishlisted };
          }
          return e;
        });
        this.experiencesSubject.next(experiences);
        break;

      case 'Service':
        const services = this.servicesSubject.value.map(s => {
          if (s.id === itemId) {
            return { ...s, isWishlisted };
          }
          return s;
        });
        this.servicesSubject.next(services);
        break;
    }
  }

  /**
   * Save wishlist to localStorage
   */
  private saveWishlistToStorage(): void {
    const wishlistItems = Array.from(this.wishlistCache).map(key => {
      const [itemType, itemId] = key.split('_');
      return {
        itemType,
        itemId: parseInt(itemId)
      };
    });
    localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
  }

  // Keep all your existing methods below (searchAllListings, getPropertyById, etc.)
  // Make sure they reference the BehaviorSubjects correctly

  searchAllListings(filters: SearchFilters): ListingType[] {
    const allListings: ListingType[] = [
      ...this.getProperties(),
      ...this.getExperiences(),
      ...this.getServices()
    ];

    return allListings.filter(listing => {
      // Location filter
      if (filters.location && filters.location.trim() !== '') {
        if (!listing.location.toLowerCase().includes(filters.location.toLowerCase())) {
          return false;
        }
      }

      // Price range filter
      if (listing.price < filters.priceRange.min || listing.price > filters.priceRange.max) {
        return false;
      }

      // Rating filter
      if (listing.rating < filters.minRating) {
        return false;
      }

      // Property type filter (enhanced for all types)
      if (filters.propertyTypes && filters.propertyTypes.length > 0) {
        if (this.isProperty(listing) && !filters.propertyTypes.includes(listing.type)) {
          return false;
        }
        if (this.isExperience(listing) && !filters.propertyTypes.includes('experience')) {
          return false;
        }
        if (this.isService(listing) && !filters.propertyTypes.includes('service')) {
          return false;
        }
      }

      return true;
    });
  }

  // Type guards
  private isProperty(item: ListingType): item is RentalProperty {
    return (item as RentalProperty).bedrooms !== undefined;
  }

  private isExperience(item: ListingType): item is Experience {
    return (item as Experience).duration !== undefined && (item as any).type === 'experience';
  }

  private isService(item: ListingType): item is Service {
    return (item as Service).duration !== undefined && (item as any).type === 'service';
  }

  getWishlist() {
    return this.http.get<any>(`${this.apiUrl}/api/Wishlist`);
  }

  isInWishlist(itemType: string, itemId: number) {
    return this.http.get<any>(`${this.apiUrl}/api/Wishlist/check/${itemType}/${itemId}`);
  }

  getWishlistCount() {
    return this.http.get<any>(`${this.apiUrl}/api/Wishlist/count`);
  }

  isWishlistedSync(itemType: string, itemId: number): boolean {
    return this.wishlistCache.has(`${itemType}_${itemId}`);
  }

  // Legacy method for backward compatibility
  toggleWishlistLegacy(propertyId: number) {
    return this.toggleWishlist('Property', propertyId);
  }

  // getPropertyById(id: number): RentalProperty | undefined {
//     return this.getProperties().find(property => property.id === id);
//   }
// getAmenities(): string[] {
//     const allAmenities = this.getProperties().flatMap(p => p.amenities);
//     return Array.from(new Set(allAmenities));
//   }

  getPropertyTypes(): string[] {
    const properties = this.getProperties();
    const types = [...new Set(properties.map(p => p.type))];
    return ['property', 'experience', 'service', ...types];
  }

  getGuestsRange(): { min: number, max: number } {
    const properties = this.getProperties();
    const guests = properties.map(p => p.maxGuests);
    return {
      min: Math.min(...guests),
      max: Math.max(...guests)
    };
  }

  getPropertyById(id: number): RentalProperty | undefined{
    return this.getProperties().find(property => property.id === id);
  }



  searchProperties(filters: SearchFilters): RentalProperty[] {
  let properties = this.getProperties();

  // Location filter
  if (filters.location && filters.location.trim() !== '') {
    properties = properties.filter(p =>
      p.location.toLowerCase().includes(filters.location.toLowerCase())
    );
  }

  // Price range filter
  properties = properties.filter(p =>
    p.price >= filters.priceRange.min &&
    p.price <= filters.priceRange.max
  );

  // Property types filter
  if (filters.propertyTypes && filters.propertyTypes.length > 0) {
    properties = properties.filter(p =>
      filters.propertyTypes.includes(p.type)
    );
  }

  // Amenities filter
  if (filters.amenities && filters.amenities.length > 0) {
    properties = properties.filter(p =>
      filters.amenities.every(amenity => p.amenities.includes(amenity))
    );
  }

  // Rating filter
  properties = properties.filter(p => p.rating >= filters.minRating);

  // Superhost filter
  if (filters.superhost) {
    properties = properties.filter(p => p.host.isSuperhost);
  }




  // ADD THIS RETURN STATEMENT
  return properties;
}
}
