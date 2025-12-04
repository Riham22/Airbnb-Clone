// data.service.ts - Complete Fixed Version

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { RentalProperty } from '../Models/rental-property';
import { Experience } from '../Models/experience';
import { Service } from '../Models/service';
import { SearchFilters } from '../Models/search-filters';
import { Booking } from '../Models/booking';

export type ListingType = RentalProperty | Experience | Service;

@Injectable({
  providedIn: 'root',
})
export class Data {
  private bookings: Booking[] = [];
  private wishlistCache: Set<string> = new Set();

  private propertiesSubject = new BehaviorSubject<RentalProperty[]>([]);
  properties$ = this.propertiesSubject.asObservable();

  private experiencesSubject = new BehaviorSubject<Experience[]>([]);
  experiences$ = this.experiencesSubject.asObservable();

  private servicesSubject = new BehaviorSubject<Service[]>([]);
  services$ = this.servicesSubject.asObservable();

  constructor(private http: HttpClient) {
    console.log('🚀 DataService initialized');

    // Load wishlist first, then data
    this.loadWishlist();

    // Give a small delay to ensure wishlist loads first
    setTimeout(() => {
      this.loadProperties();
      this.loadExperiences();
      this.loadServices();
    }, 100);
  }

  loadWishlist() {
    this.getWishlist().subscribe({
      next: (items: any[]) => {
        this.wishlistCache.clear();
        items.forEach(item => {
          if (item.itemType && item.itemId) {
            this.wishlistCache.add(`${item.itemType}_${item.itemId}`);
          }
        });
        // Reload data to update UI
        this.loadProperties();
        this.loadExperiences();
        this.loadServices();
      },
      error: (err) => console.error('Failed to load wishlist', err)
    });
  }

  loadProperties() {
    console.log('🔄 Loading properties from API...');

    // Note: Using capital 'P' in Properties to match your API
    this.http.get<any>('https://localhost:7020/api/Properties').subscribe({
      next: (response) => {
        console.log('✅ API Response received:', response);

        // Handle different response formats
        let data: any[] = [];

        // Check if response is wrapped in a data property
        if (response && typeof response === 'object') {
          if (Array.isArray(response)) {
            data = response;
          } else if (response.data && Array.isArray(response.data)) {
            data = response.data;
          } else if (response.items && Array.isArray(response.items)) {
            data = response.items;
          } else if (response.properties && Array.isArray(response.properties)) {
            data = response.properties;
          } else {
            console.warn('⚠️ Unexpected response format:', response);
            data = [];
          }
        }

        console.log('📊 Number of properties:', data?.length);

        if (!data || data.length === 0) {
          console.warn('⚠️ No properties returned from API');
          this.propertiesSubject.next([]);
          return;
        }

        const mappedProperties: RentalProperty[] = data.map(p => {
          console.log('=== Mapping property ===');
          console.log('ID:', p.id);
          console.log('Title:', p.title);
          console.log('PropertyCategory:', p.propertyCategory);
          console.log('PropertyType:', p.propertyType);

          // Try to get category name from multiple sources
          let categoryName =
            p.propertyCategory?.name ||     // Best: from PropertyCategory relationship
            p.propertyCategory?.title ||
            p.categoryName ||               // Fallback: direct field
            p.category?.name;

          // If no category found, try to guess from title
          if (!categoryName) {
            console.warn('⚠️ No category found, guessing from title:', p.title);
            const title = (p.title || '').toLowerCase();
            if (title.includes('beach')) categoryName = 'Beachfront';
            else if (title.includes('city')) categoryName = 'City';
            else if (title.includes('countryside') || title.includes('cottage')) categoryName = 'Countryside';
            else if (title.includes('mountain')) categoryName = 'Mountain';
            else if (title.includes('lake')) categoryName = 'Lake';
            else categoryName = 'City'; // Default
          }

          console.log('Using category name:', categoryName);

          const categoryForUI = this.mapPropertyType(categoryName);

          console.log('Mapped to UI category:', categoryForUI);
          console.log('===================');

          return {
            id: p.id,
            name: p.title || 'Untitled Property',
            location: `${p.city || 'Unknown'}, ${p.country || 'Unknown'}`,
            price: p.pricePerNight || 0,
            rating: p.averageRating || 0,
            reviewCount: p.reviewsCount || 0,
            imageUrl: p.coverImageUrl || 'https://via.placeholder.com/400x300?text=No+Image',
            images: p.images?.length > 0
              ? p.images.map((img: any) => img.imageUrl || img.imageURL).filter((url: string) => url)
              : [p.coverImageUrl || 'https://via.placeholder.com/400x300?text=No+Image'],
            type: 'property',
            propertyType: categoryForUI,
            maxGuests: p.maxGuests || 2,
            bedrooms: p.bedrooms || 1,
            beds: p.beds || 1,
            bathrooms: p.bathrooms || 1,
            amenities: Array.isArray(p.amenities)
              ? p.amenities.map((a: any) => a.name || a).filter((name: string) => name)
              : [],
            host: {
              name: p.hostName || 'Host',
              joinedDate: '2024',
              isSuperhost: false,
              avatar: ''
            },
            description: p.description || '',
            highlights: [],
            reviews: [],
            isWishlisted: this.isWishlistedSync('Property', p.id)
          };
        });

        console.log('✅ Mapped properties:', mappedProperties.length);
        console.log('📦 First property:', mappedProperties[0]);

        this.propertiesSubject.next(mappedProperties);
      },
      error: (err) => {
        console.error('❌ Failed to load properties:', err);
        console.error('Error details:', {
          status: err.status,
          statusText: err.statusText,
          message: err.message,
          url: err.url
        });

        // Return empty array on error
        this.propertiesSubject.next([]);
      }
    });
  }

  private mapPropertyType(backendType: string): string {
    if (!backendType) {
      console.warn('⚠️ No property type provided, defaulting to "city"');
      return 'city';
    }

    const type = backendType.toLowerCase().trim();
    console.log('Mapping category:', backendType, '→', type);

    // Exact matches first
    if (type === 'beachfront' || type === 'beach') return 'beach';
    if (type === 'city' || type === 'urban') return 'city';
    if (type === 'countryside' || type === 'country') return 'countryside';
    if (type === 'mountain' || type === 'mountains') return 'mountain';
    if (type === 'lakefront' || type === 'lake') return 'lake';

    // Contains matches
    if (type.includes('beach') || type.includes('coast') || type.includes('seaside') || type.includes('ocean')) {
      console.log('→ Mapped to: beach');
      return 'beach';
    }
    if (type.includes('city') || type.includes('urban') || type.includes('downtown')) {
      console.log('→ Mapped to: city');
      return 'city';
    }
    if (type.includes('mountain') || type.includes('alpine') || type.includes('ski')) {
      console.log('→ Mapped to: mountain');
      return 'mountain';
    }
    if (type.includes('lake') || type.includes('water')) {
      console.log('→ Mapped to: lake');
      return 'lake';
    }
    if (type.includes('country') || type.includes('farm') || type.includes('rural') || type.includes('cottage')) {
      console.log('→ Mapped to: countryside');
      return 'countryside';
    }

    // For Apartment, House, Villa etc - default to city
    if (type.includes('apartment') || type.includes('house') || type.includes('villa') ||
      type.includes('studio') || type.includes('cabin') || type.includes('room')) {
      console.warn('⚠️ Found building type "' + backendType + '", defaulting to "city"');
      return 'city';
    }

    // Default fallback
    console.warn('⚠️ Category "' + backendType + '" did not match, defaulting to "city"');
    return 'city';
  }

  getProperties(): RentalProperty[] {
    return this.propertiesSubject.value;
  }

  loadExperiences() {
    console.log('🔄 Loading experiences from API...');

    this.http.get<any[]>('https://localhost:7020/api/Experience').subscribe({
      next: (data) => {
        console.log('✅ Experiences API Response:', data?.length);

        if (!data || data.length === 0) {
          console.warn('⚠️ No experiences returned from API');
          this.experiencesSubject.next([]);
          return;
        }

        const mappedExperiences: Experience[] = data.map(exp => ({
          id: exp.id,
          type: 'experience',
          name: exp.expTitle || exp.name || 'Experience',
          location: `${exp.city || ''}, ${exp.country || ''}`.trim(),
          price: exp.guestPrice || 0,
          rating: 4.5,
          reviewCount: 0,
          imageUrl: exp.images?.[0]?.imageURL || 'https://via.placeholder.com/400x300?text=No+Image',
          images: exp.images?.map((img: any) => img.imageURL) || [],
          category: exp.expCatograyName || 'general',
          duration: '3 hours',
          maxParticipants: exp.maximumGuest || 10,
          host: {
            name: 'Host',
            joinedDate: new Date(exp.postedDate || Date.now()).getFullYear().toString(),
            isSuperhost: false,
            avatar: ''
          },
          description: exp.expDescribe || exp.expSummary || '',
          highlights: [],
          includes: [],
          requirements: [],
          meetingPoint: exp.locationName || '',
          languages: exp.usingLanguage ? [exp.usingLanguage] : ['English'],
          reviews: [],
          isWishlisted: this.isWishlistedSync('Experience', exp.id)
        }));

        console.log('✅ Mapped experiences:', mappedExperiences.length);
        this.experiencesSubject.next(mappedExperiences);
      },
      error: (err) => {
        console.error('❌ Failed to load experiences:', err);
        this.experiencesSubject.next([]);
      }
    });
  }

  getExperiences(): Experience[] {
    return this.experiencesSubject.value;
  }

  loadServices() {
    console.log('🔄 Loading services from API...');

    this.http.get<any[]>('https://localhost:7020/api/Services').subscribe({
      next: (data) => {
        console.log('✅ Services API Response:', data?.length);

        if (!data || data.length === 0) {
          console.warn('⚠️ No services returned from API');
          this.servicesSubject.next([]);
          return;
        }

        const mappedServices: Service[] = data.map(svc => ({
          id: svc.id,
          type: 'service',
          name: svc.title || 'Service',
          location: `${svc.city || ''}, ${svc.country || ''}`.trim(),
          price: svc.price || 0,
          rating: svc.averageRating || 0,
          reviewCount: svc.reviewsCount || 0,
          imageUrl: svc.coverImageUrl || 'https://via.placeholder.com/400x300?text=No+Image',
          images: svc.images?.map((img: any) => img.imageUrl) || [svc.coverImageUrl],
          category: svc.categoryName || 'general',
          duration: '3 hours',
          provider: {
            name: 'Provider',
            joinedDate: '2024',
            isVerified: true,
            avatar: ''
          },
          description: svc.description || '',
          highlights: [],
          includes: [],
          requirements: [],
          reviews: [],
          isWishlisted: this.isWishlistedSync('Service', svc.id)
        }));

        console.log('✅ Mapped services:', mappedServices.length);
        this.servicesSubject.next(mappedServices);
      },
      error: (err) => {
        console.error('❌ Failed to load services:', err);
        this.servicesSubject.next([]);
      }
    });
  }

  getServices(): Service[] {
    return this.servicesSubject.value;
  }

  searchAllListings(filters: SearchFilters): ListingType[] {
    const allListings: ListingType[] = [
      ...this.getProperties(),
      ...this.getExperiences(),
      ...this.getServices()
    ];

    return allListings.filter(listing => {
      if (filters.location && filters.location.trim() !== '') {
        if (!listing.location.toLowerCase().includes(filters.location.toLowerCase())) {
          return false;
        }
      }

      if (listing.price < filters.priceRange.min || listing.price > filters.priceRange.max) {
        return false;
      }

      if (listing.rating < filters.minRating) {
        return false;
      }

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

  private isProperty(item: ListingType): item is RentalProperty {
    return (item as RentalProperty).bedrooms !== undefined;
  }

  private isExperience(item: ListingType): item is Experience {
    return (item as Experience).duration !== undefined && (item as any).type === 'experience';
  }

  private isService(item: ListingType): item is Service {
    return (item as Service).duration !== undefined && (item as any).type === 'service';
  }

  getAmenities(): string[] {
    const allAmenities = this.getProperties().flatMap(p => p.amenities);
    return Array.from(new Set(allAmenities));
  }

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

  getPropertyById(id: number): RentalProperty | undefined {
    return this.getProperties().find(property => property.id === id);
  }

  searchProperties(filters: SearchFilters): RentalProperty[] {
    let properties = this.getProperties();

    if (filters.location && filters.location.trim() !== '') {
      properties = properties.filter(p =>
        p.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    properties = properties.filter(p =>
      p.price >= filters.priceRange.min &&
      p.price <= filters.priceRange.max
    );

    if (filters.propertyTypes && filters.propertyTypes.length > 0) {
      properties = properties.filter(p =>
        filters.propertyTypes.includes(p.type)
      );
    }

    if (filters.amenities && filters.amenities.length > 0) {
      properties = properties.filter(p =>
        filters.amenities.every(amenity => p.amenities.includes(amenity))
      );
    }

    properties = properties.filter(p => p.rating >= filters.minRating);

    if (filters.superhost) {
      properties = properties.filter(p => p.host.isSuperhost);
    }

    if (filters.instantBook) {
      properties = properties.filter(p => this.isInstantBookAvailable(p.id));
    }

    return properties;
  }

  toggleWishlist(itemType: string, itemId: number) {
    return this.http.post<any>('https://localhost:7020/api/Wishlist/toggle', {
      itemType: itemType,
      itemId: itemId
    }).pipe(
      tap((response: any) => {
        const key = `${itemType}_${itemId}`;
        if (response.wishlisted) {
          this.wishlistCache.add(key);
        } else {
          this.wishlistCache.delete(key);
        }
      })
    );
  }

  getWishlist() {
    return this.http.get<any>('https://localhost:7020/api/Wishlist');
  }

  isInWishlist(itemType: string, itemId: number) {
    return this.http.get<any>(`https://localhost:7020/api/Wishlist/check/${itemType}/${itemId}`);
  }

  getWishlistCount() {
    return this.http.get<any>('https://localhost:7020/api/Wishlist/count');
  }

  isWishlistedSync(itemType: string, itemId: number): boolean {
    return this.wishlistCache.has(`${itemType}_${itemId}`);
  }

  toggleWishlistLegacy(propertyId: number) {
    return this.toggleWishlist('Property', propertyId);
  }

  createBooking(bookingData: Omit<Booking, 'id' | 'createdAt'>): Booking {
    const newBooking: Booking = {
      ...bookingData,
      id: this.generateBookingId(),
      createdAt: new Date()
    };
    this.bookings.push(newBooking);
    this.saveBookingsToStorage();
    return newBooking;
  }

  getUserBookings(userId: number): Booking[] {
    this.loadBookingsFromStorage();
    return this.bookings.filter(booking => booking.userId === userId);
  }

  getBookingById(bookingId: number): Booking | undefined {
    this.loadBookingsFromStorage();
    return this.bookings.find(booking => booking.id === bookingId);
  }

  cancelBooking(bookingId: number): boolean {
    const bookingIndex = this.bookings.findIndex(b => b.id === bookingId);
    if (bookingIndex > -1) {
      this.bookings[bookingIndex].status = 'cancelled';
      this.saveBookingsToStorage();
      return true;
    }
    return false;
  }

  getRecommendedProperties(propertyId?: number, limit: number = 6): RentalProperty[] {
    const properties = this.getProperties();

    if (propertyId) {
      const currentProperty = this.getPropertyById(propertyId);
      if (currentProperty) {
        return properties
          .filter(p => p.id !== propertyId && p.type === currentProperty.type)
          .slice(0, limit);
      }
    }

    return properties
      .sort((a, b) => {
        const scoreA = a.rating * a.reviewCount;
        const scoreB = b.rating * b.reviewCount;
        return scoreB - scoreA;
      })
      .slice(0, limit);
  }

  getSearchSuggestions(query: string): string[] {
    const properties = this.getProperties();
    const locations = properties.map(p => p.location);
    const uniqueLocations = [...new Set(locations)];

    return uniqueLocations
      .filter(location =>
        location.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 5);
  }

  getPriceStatistics(): { min: number; max: number; average: number } {
    const properties = this.getProperties();
    const prices = properties.map(p => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const average = prices.reduce((sum, price) => sum + price, 0) / prices.length;

    return { min, max, average: Math.round(average) };
  }

  private generateBookingId(): number {
    return Math.max(0, ...this.bookings.map(b => b.id)) + 1;
  }

  private isInstantBookAvailable(propertyId: number): boolean {
    const instantBookProperties = [1, 2, 4, 7, 8];
    return instantBookProperties.includes(propertyId);
  }

  private saveBookingsToStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('airbnb_bookings', JSON.stringify(this.bookings));
    }
  }

  private loadBookingsFromStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem('airbnb_bookings');
      this.bookings = stored ? JSON.parse(stored) : [];
    }
  }

  getPropertiesByHost(hostName: string): RentalProperty[] {
    return this.getProperties().filter(p =>
      p.host.name.toLowerCase().includes(hostName.toLowerCase())
    );
  }

  getAvailableProperties(checkIn: Date, checkOut: Date): RentalProperty[] {
    return this.getProperties().filter(property =>
      this.isPropertyAvailable(property.id, checkIn, checkOut)
    );
  }

  private isPropertyAvailable(propertyId: number, checkIn: Date, checkOut: Date): boolean {
    return Math.random() > 0.2;
  }
}