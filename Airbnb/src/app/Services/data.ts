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

  private propertyCategoriesSubject = new BehaviorSubject<any[]>([]);
  propertyCategories$ = this.propertyCategoriesSubject.asObservable();

  private locationsSubject = new BehaviorSubject<string[]>([]);
  locations$ = this.locationsSubject.asObservable();

  constructor(private http: HttpClient) {
    console.log('🚀 DataService initialized');

    // Load wishlist first, then data
    this.loadWishlist();

    // Give a small delay to ensure wishlist loads first
    setTimeout(() => {
      this.loadProperties();
      this.loadExperiences();
      this.loadProperties();
      this.loadExperiences();
      this.loadServices();
      this.loadPropertyCategories();
    }, 100);
  }

  // ... (loadWishlist method remains same)

  private updateLocations() {
    const allListings = [...this.propertiesSubject.value, ...this.experiencesSubject.value, ...this.servicesSubject.value];
    const cities = allListings.map(l => {
      if (!l.location) return '';
      // Assuming location format is "City, Country" or just "City"
      const parts = l.location.split(',');
      return parts[0].trim();
    }).filter(c => c && c !== 'Unknown');

    // Unique cities, sorted
    const uniqueCities = [...new Set(cities)].sort();
    console.log('🌍 Extracted unique locations:', uniqueCities);
    this.locationsSubject.next(uniqueCities);
  }

  loadWishlist() {
    this.getWishlist().subscribe({
      next: (items: any[]) => {
        this.wishlistCache.clear();
        items.forEach(item => {
          const type = item.itemType || item.ItemType;
          const id = item.itemId || item.ItemId;
          if (type && id) {
            this.wishlistCache.add(`${type}_${id}`);
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

        // Filter out non-published properties
        data = data.filter(p => p.isPublished === true || p.IsPublished === true);


        const mappedProperties: RentalProperty[] = data.map(p => {
          console.log('=== Mapping property ===');
          console.log('ID:', p.id);
          console.log('Title:', p.title);
          console.log('PropertyCategory:', p.propertyCategory);
          console.log('PropertyType:', p.propertyType);

          // Try to get category name from multiple sources (PascalCase & camelCase)
          let categoryName =
            p.propertyCategory?.name || p.PropertyCategory?.Name ||
            p.propertyCategory?.title || p.PropertyCategory?.Title ||
            p.categoryName || p.CategoryName ||
            p.category?.name || p.Category?.Name;

          // If no category found, try to guess from title
          if (!categoryName) {
            const title = (p.title || p.Title || '').toLowerCase();
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

          // PascalCase fallbacks
          const id = Number(p.id || p.Id);
          const title = p.title || p.Title;
          const city = p.city || p.City;
          const country = p.country || p.Country;
          const price = p.pricePerNight || p.PricePerNight || p.price || p.Price;
          const rating = p.averageRating || p.AverageRating;
          const reviewCount = p.reviewsCount || p.ReviewsCount;
          const coverImage = p.coverImageUrl || p.CoverImageUrl;
          const images = p.images || p.Images;
          const maxGuests = p.maxGuests || p.MaxGuests;
          const bedrooms = p.bedrooms || p.Bedrooms;
          const beds = p.beds || p.Beds;
          const bathrooms = p.bathrooms || p.Bathrooms;
          const amenities = p.amenities || p.Amenities;
          const hostName = p.hostName || p.HostName;
          const description = p.description || p.Description;

          return {
            id: id,
            name: title || 'Untitled Property',
            location: `${city || 'Unknown'}, ${country || 'Unknown'}`,
            price: price || 0,
            rating: rating || 0,
            reviewCount: reviewCount || 0,
            imageUrl: (coverImage && coverImage !== '') ? this.processImageUrl(coverImage) : (images?.length > 0 ? this.processImageUrl(images[0].imageUrl || images[0].ImageUrl || images[0].imageURL) : 'assets/default-listing.jpg'),
            images: images?.length > 0
              ? images.map((img: any) => this.processImageUrl(img.imageUrl || img.ImageUrl || img.imageURL)).filter((url: string) => url)
              : [],
            type: 'property',
            propertyType: categoryForUI,
            propertyCategoryId: p.propertyCategoryId || p.PropertyCategoryId,
            propertyCategory: categoryName,
            maxGuests: maxGuests || 2,
            bedrooms: bedrooms || 1,
            beds: beds || 1,
            bathrooms: bathrooms || 1,
            amenities: Array.isArray(amenities)
              ? amenities.map((a: any) => a.name || a.Name || a).filter((name: string) => name)
              : [],
            host: {
              name: hostName || 'Host',
              joinedDate: '2024',
              isSuperhost: false,
              avatar: ''
            },
            description: description || '',
            highlights: [],
            reviews: [],
            isWishlisted: this.isWishlistedSync('Property', id)
          };
        });

        console.log('✅ Mapped properties:', mappedProperties.length);
        console.log('📦 First property:', mappedProperties[0]);

        this.propertiesSubject.next(mappedProperties);
        this.updateLocations();
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
        if (data && data.length > 0) {
          console.log('📦 First Experience JSON:', JSON.stringify(data[0]));
        }

        if (!data || data.length === 0) {
          console.warn('⚠️ No experiences returned from API');
          this.experiencesSubject.next([]);
          return;
        }

        // Filter out non-published experiences (Status 3 = Published)
        data = data.filter(e => {
          const s = e.status || e.Status;
          // Accept 3 or 'Published' or 'published' or 'Active' (just in case)
          // Based on AdminService it is 3 or 'Published'
          return s === 3 || s === 'Published';
        });


        const mappedExperiences: Experience[] = data.map(exp => {
          console.log('🔍 Raw Experience Data:', exp.id, exp.name || exp.title, exp.ExpActivity, exp.expActivity);

          const id = Number(exp.id || exp.Id);
          const title = exp.expTitle || exp.ExpTitle || exp.title || exp.Title || exp.name || exp.Name || 'Experience';
          const city = exp.city || exp.City;
          const country = exp.country || exp.Country;
          const price = exp.guestPrice || exp.GuestPrice || exp.price || exp.Price;
          const images = exp.expImages || exp.ExpImages || exp.images || exp.Images;
          const desc = exp.expDescribe || exp.ExpDescribe || exp.expSummary || exp.ExpSummary || exp.description || exp.Description;
          const catName = exp.expCatograyName || exp.ExpCatograyName || exp.categoryName || exp.CategoryName;
          const maxGuest = exp.maximumGuest || exp.MaximumGuest || exp.maxParticipants || exp.MaxParticipants;
          const postedDate = exp.postedDate || exp.PostedDate;
          const locationName = exp.locationName || exp.LocationName;
          const language = exp.usingLanguage || exp.UsingLanguage;

          const processedImages = images?.map((img: any) => this.processImageUrl(img.imageURL || img.ImageUrl || img.imageUrl)) || [];
          if (processedImages.length === 0) {
            processedImages.push('assets/images/placeholder.jpg'); // Fallback to avoid empty array
          }

          return {
            id: id,
            type: 'experience',
            name: title,
            location: `${city || ''}, ${country || ''}`.trim(),
            price: price || 0,
            rating: 4.5,
            reviewCount: 0,
            imageUrl: (processedImages.length > 0) ? processedImages[0] : 'assets/default-experience.jpg',
            images: processedImages,
            category: catName || 'general',
            duration: '3 hours',
            maxParticipants: maxGuest || 10,
            maxGuests: maxGuest || 10,
            host: {
              name: exp.hostName || exp.HostName || exp.ownerName || exp.OwnerName || 'Host',
              joinedDate: new Date(postedDate || Date.now()).getFullYear().toString(),
              isSuperhost: false,
              avatar: exp.hostAvatar || exp.HostAvatar || exp.ownerAvatar || ''
            },
            description: desc || '',
            highlights: [],
            includes: [],
            requirements: [],
            amenities: [], // Added fallback for UI compatibility
            meetingPoint: locationName || '',
            languages: language ? [language] : ['English'],
            reviews: [],
            isWishlisted: this.isWishlistedSync('Experience', id),
            activities: (exp.activities || exp.Activities || []).map((act: any) => ({
              id: act.id || act.Id,
              name: act.name || act.Name,
              description: act.describe || act.Describe || act.description || act.Description,
              durationMinutes: act.timeMinute || act.TimeMinute || 0
            }))
          };
        });

        // Debug experience removed

        console.log('✅ Mapped experiences:', mappedExperiences.length);
        this.experiencesSubject.next(mappedExperiences);
        this.updateLocations();
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

        // Filter out non-published services
        data = data.filter(s => s.isPublished === true || s.IsPublished === true);


        try {
          const mappedServices: Service[] = data.map(svc => {
            const id = Number(svc.id || svc.Id);
            const title = svc.title || svc.Title || svc.name || svc.Name || 'Service';
            const city = svc.city || svc.City;
            const country = svc.country || svc.Country;
            const price = svc.price || svc.Price;
            const rating = svc.averageRating || svc.AverageRating;
            const reviewCount = svc.reviewsCount || svc.ReviewsCount;
            const coverImage = svc.coverImageUrl || svc.CoverImageUrl || svc.imageUrl || svc.ImageUrl;
            const images = svc.images || svc.Images;
            const catName = svc.categoryName || svc.CategoryName || svc.category?.name || svc.Category?.Name;
            const description = svc.description || svc.Description;

            return {
              id: id,
              type: 'service',
              name: title,
              location: `${city || ''}, ${country || ''}`.trim(),
              price: price || 0,
              rating: rating || 0,
              reviewCount: reviewCount || 0,
              imageUrl: (coverImage && coverImage !== '') ? this.processImageUrl(coverImage) : (images?.length > 0 ? this.processImageUrl(images[0].imageUrl || images[0].ImageUrl) : 'assets/default-listing.jpg'),
              images: images?.map((img: any) => this.processImageUrl(img.imageUrl || img.ImageUrl)) || [],
              category: catName || 'general',
              duration: '3 hours',
              maxGuests: 4, // Default for services as it's not in API yet
              host: {
                name: svc.providerName || svc.ProviderName || svc.hostName || svc.HostName || 'Provider',
                joinedDate: '2024',
                isSuperhost: true,
                avatar: svc.providerAvatar || svc.ProviderAvatar || ''
              },
              description: description || '',
              highlights: [],
              includes: [],
              requirements: [],
              reviews: [],
              isWishlisted: this.isWishlistedSync('Service', id)
            };
          });

          // Debug service removed

          console.log('✅ Mapped services:', mappedServices.length);
          this.servicesSubject.next(mappedServices);
          this.updateLocations();
        } catch (e) {
          console.error('❌ Error mapping services:', e);
          this.servicesSubject.next([]);
        }
      },
      error: (err) => {
        console.error('❌ Failed to load services:', err);
        console.error('❌ Failed to load services:', err);
        // FORCE inject dummy data just to prove UI works
        this.servicesSubject.next([{
          id: 99999,
          type: 'service',
          name: 'DEBUG SERVICE (Error Fallback)',
          location: 'Debug City',
          price: 100,
          rating: 5,
          reviewCount: 1,
          imageUrl: 'assets/default-listing.jpg',
          images: [],
          category: 'cleaning',
          duration: '1 hour',
          maxGuests: 4,
          host: { name: 'Debug', joinedDate: '2024', isSuperhost: true, avatar: '' },
          description: 'Fallback service.',
          highlights: [],
          includes: [],
          requirements: [],
          reviews: [],
          isWishlisted: false
        }]);
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

  getPropertyDetails(id: number) {
    return this.http.get<any>(`https://localhost:7020/api/Properties/${id}`).pipe(
      tap(p => console.log('📦 GetPropertyDetails API:', p)),
      // We map it here or in the component. Let's map it here to be consistent
      // But for simplicity, let's return the raw Observable and map in component or use a helper
      // actually, reusing the mapping logic is better.
    );
  }

  getServiceDetails(id: number) {
    return this.http.get<any>(`https://localhost:7020/api/Services/${id}`);
  }

  getExperienceDetails(id: number) {
    return this.http.get<any>(`https://localhost:7020/api/Experience/GetById/${id}`);
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

  loadPropertyCategories() {
    this.http.get<any[]>('https://localhost:7020/api/PropertyCategories').subscribe({
      next: (categories) => {
        console.log('✅ Loaded property categories:', categories);
        this.propertyCategoriesSubject.next(categories);
      },
      error: (err) => {
        console.warn('⚠️ Failed to load property categories, using fallback', err);
        // Fallback categories matching AdminService
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
        this.propertyCategoriesSubject.next(categories);
      }
    });
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

        // Update the observables to reflect wishlist changes in UI
        if (itemType === 'Property') {
          const currentProperties = this.propertiesSubject.value;
          const updatedProperties = currentProperties.map(prop =>
            prop.id === itemId ? { ...prop, isWishlisted: response.wishlisted } : prop
          );
          this.propertiesSubject.next(updatedProperties);
        } else if (itemType === 'Experience') {
          const currentExperiences = this.experiencesSubject.value;
          const updatedExperiences = currentExperiences.map(exp =>
            exp.id === itemId ? { ...exp, isWishlisted: response.wishlisted } : exp
          );
          this.experiencesSubject.next(updatedExperiences);
        } else if (itemType === 'Service') {
          const currentServices = this.servicesSubject.value;
          const updatedServices = currentServices.map(svc =>
            svc.id === itemId ? { ...svc, isWishlisted: response.wishlisted } : svc
          );
          this.servicesSubject.next(updatedServices);
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

  public processImageUrl(url: string | null | undefined): string {
    if (!url) return 'assets/default-listing.jpg';

    // Handle legacy seed data paths that point to non-existent /images/ folder
    if (url.startsWith('/images/') || url.startsWith('images/')) {
      return 'assets/default-listing.jpg';
    }

    // Handle standard absolute URLs (http/https)
    if (url.startsWith('http')) {
      // Fix for stale localhost:5000/7187 URLs in database if they occur
      if (url.includes('localhost') && !url.includes('7020')) {
        // Extract the path after 'uploads/'
        const match = url.match(/\/uploads\/(.*)/);
        if (match) {
          return `https://localhost:7020/uploads/${match[1]}`;
        }
      }
      return url;
    }

    // Handle bare filenames (e.g. "101.jpg") -> Assume properties upload folder as fallback
    if (!url.includes('/') && !url.includes('\\')) {
      return `https://localhost:7020/uploads/properties/${url}`;
    }

    // Handle API-relative paths (e.g. "uploads/...")
    // Ensure we don't double-slash
    const cleanPath = url.startsWith('/') ? url.substring(1) : url;
    return `https://localhost:7020/${cleanPath}`;
  }

  updateWishlist(propertyId: number, isWishlisted: boolean) {
    return this.toggleWishlist('Property', propertyId);
  }
}
