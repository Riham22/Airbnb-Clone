// data.service.ts - Enhanced version

import { Injectable } from '@angular/core';
import { RentalProperty } from '../Models/rental-property';
import { Experience } from '../Models/experience';
import { Service } from '../Models/service';
import { SearchFilters } from '../Models/search-filters';
import { Booking } from '../Models/booking';

export type ListingType = RentalProperty | Experience | Service;



import { Review } from '../Models/review';



@Injectable({
  providedIn: 'root',
})
export class Data  {
  private bookings: Booking[] = [];
  private wishlist: number[] = []; // Property IDs

 getProperties(): RentalProperty[] {
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
      ]
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
      type: 'property', // ← FIXED
      propertyType: 'city', // ← FIXED
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
      ]
    },
    {
      id: 3,
      name: 'Mountain Cabin Retreat',
      location: 'Aspen, Colorado',
      price: 320,
      rating: 4.95,
      reviewCount: 64,
      imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000',
      images: [
        'https://images.unsplash.com/photo-1449824913935-59a10b8d2000',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
        'https://images.unsplash.com/photo-1615870216513-1a3896abbf7d',
        'https://images.unsplash.com/photo-1615870719275-54c1e5bc9b25'
      ],
      type: 'property', // ← FIXED
      propertyType: 'mountain', // ← FIXED
      maxGuests: 6,
      bedrooms: 3,
      beds: 4,
      bathrooms: 2,
      amenities: ['WiFi', 'Fireplace', 'Mountain View', 'Parking', 'Hot Tub'],
      host: {
        name: 'Oliver Woods',
        joinedDate: '2017',
        isSuperhost: true,
        avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36'
      },
      description: 'A cozy wooden cabin with breathtaking mountain views and a private hot tub.',
      highlights: ['Private cabin', 'Fireplace', 'Hot tub', 'Amazing views'],
      reviews: []
    },
    {
      id: 4,
      name: 'Lakeside Villa',
      location: 'Lake Tahoe, Nevada',
      price: 275,
      rating: 4.83,
      reviewCount: 142,
      imageUrl: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739',
      images: [
        'https://images.unsplash.com/photo-1510798831971-661eb04b3739',
        'https://images.unsplash.com/photo-1600585154207-362ad7a1f235',
        'https://images.unsplash.com/photo-1560448075-bb46d1a1b6b1'
      ],
      type: 'property', // ← FIXED
      propertyType: 'lake', // ← FIXED
      maxGuests: 8,
      bedrooms: 4,
      beds: 6,
      bathrooms: 3,
      amenities: ['WiFi', 'Pool', 'Lake Access', 'Kitchen', 'Parking'],
      host: {
        name: 'Emma Davis',
        joinedDate: '2019',
        isSuperhost: true,
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2'
      },
      description: 'Luxury villa right on Lake Tahoe with private dock access.',
      highlights: ['Lake access', 'Private dock', 'Spacious home'],
      reviews: []
    },
    {
      id: 5,
      name: 'Countryside Farmhouse',
      location: 'Napa Valley, California',
      price: 180,
      rating: 4.87,
      reviewCount: 89,
      imageUrl: 'https://images.unsplash.com/photo-1513584684374-8bab748fbf90',
      images: [
        'https://images.unsplash.com/photo-1513584684374-8bab748fbf90',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
        'https://images.unsplash.com/photo-1499696010180-027a47b30e23'
      ],
      type: 'property', // ← FIXED
      propertyType: 'countryside', // ← FIXED
      maxGuests: 5,
      bedrooms: 3,
      beds: 3,
      bathrooms: 1.5,
      amenities: ['WiFi', 'Garden', 'Country View', 'Kitchen'],
      host: {
        name: 'Hannah Lee',
        joinedDate: '2022',
        isSuperhost: false,
        avatar: 'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7'
      },
      description: 'Relax in this quiet countryside farmhouse with large gardens and scenic valley views.',
      highlights: ['Private garden', 'Quiet area', 'Rustic design'],
      reviews: []
    }
  ];
}



  getExperiences(): Experience[] {
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
        ]
      },
      {
        id: 102,
        type: 'experience',
        name: 'Surfing Lessons in Malibu',
        location: 'Malibu, California',
        price: 75,
        rating: 4.88,
        reviewCount: 189,
        imageUrl: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
        images: [
          'https://images.unsplash.com/photo-1506929562872-bb421503ef21?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'
        ],
        category: 'sports',
        duration: '2 hours',
        maxParticipants: 6,
        host: {
          name: 'Jake Thompson',
          joinedDate: '2018',
          isSuperhost: true,
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
        },
        description: 'Learn to surf with professional instructors on the beautiful beaches of Malibu. Perfect for beginners and intermediate surfers.',
        highlights: ['Professional instructors', 'All equipment included', 'Small groups', 'Beautiful location'],
        includes: ['Surfboard', 'Wetsuit', 'Safety equipment', 'Photos'],
        requirements: ['Swimming ability', 'Comfortable in water'],
        meetingPoint: 'Malibu Surf Shop',
        languages: ['English'],
        reviews: [
          {
            id: 202,
            user: 'Emma R.',
            date: '2024-01-18',
            rating: 5,
            comment: 'So much fun! Caught my first wave thanks to Jake.',
            userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
          }
        ]
      },
      {
        id: 103,
        type: 'experience',
        name: 'NYC Street Photography Tour',
        location: 'New York City, New York',
        price: 65,
        rating: 4.92,
        reviewCount: 156,
        imageUrl: 'https://images.unsplash.com/photo-1519996529931-28324d5a630e?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
        images: [
          'https://images.unsplash.com/photo-1519996529931-28324d5a630e?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'
        ],
        category: 'arts-culture',
        duration: '4 hours',
        maxParticipants: 8,
        host: {
          name: 'Alex Chen',
          joinedDate: '2020',
          isSuperhost: true,
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
        },
        description: 'Discover hidden gems and iconic locations while learning street photography techniques from a professional photographer.',
        highlights: ['Professional guidance', 'Iconic locations', 'Small group', 'Photo tips'],
        includes: ['Photography tips', 'Route map', 'Local insights'],
        requirements: ['Camera or smartphone', 'Comfortable walking shoes'],
        meetingPoint: 'Central Park South',
        languages: ['English', 'Mandarin'],
        reviews: [
          {
            id: 203,
            user: 'Michael K.',
            date: '2024-01-15',
            rating: 5,
            comment: 'Alex showed us parts of NYC I never knew existed!',
            userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
          }
        ]
      },
      {
        id: 104,
        type: 'experience',
        name: 'Mountain Hiking Adventure',
        location: 'Aspen, Colorado',
        price: 55,
        rating: 4.85,
        reviewCount: 142,
        imageUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
        images: [
          'https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'
        ],
        category: 'outdoors',
        duration: '5 hours',
        maxParticipants: 10,
        host: {
          name: 'Ryan Wilson',
          joinedDate: '2017',
          isSuperhost: true,
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
        },
        description: 'Guided hiking tour through breathtaking mountain trails with stunning views and wildlife spotting opportunities.',
        highlights: ['Expert guide', 'Stunning views', 'Wildlife spotting', 'Small group'],
        includes: ['Trail snacks', 'Water', 'Safety equipment'],
        requirements: ['Good physical condition', 'Hiking shoes'],
        meetingPoint: 'Trailhead Parking',
        languages: ['English'],
        reviews: [
          {
            id: 204,
            user: 'Sarah M.',
            date: '2024-01-12',
            rating: 5,
            comment: 'Absolutely breathtaking views! Ryan was an excellent guide.',
            userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
          }
        ]
      }
    ];
  }

  // NEW: Services Data
  getServices(): Service[] {
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
        ]
      },
      {
        id: 202,
        type: 'service',
        name: 'Private Chef Experience',
        location: 'Miami, Florida',
        price: 200,
        rating: 4.95,
        reviewCount: 278,
        imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
        images: [
          'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'
        ],
        category: 'food',
        duration: '3 hours',
        provider: {
          name: 'Chef Marco',
          joinedDate: '2019',
          isVerified: true,
          avatar: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
        },
        description: 'Enjoy a gourmet dining experience in the comfort of your own home. Custom menus tailored to your preferences.',
        highlights: ['Custom menus', 'Professional chef', 'Local ingredients', 'Fine dining experience'],
        includes: ['Meal preparation', 'Grocery shopping', 'Kitchen cleanup'],
        requirements: ['Functional kitchen', 'Dietary preferences'],
        reviews: [
          {
            id: 302,
            user: 'Robert L.',
            date: '2024-01-20',
            rating: 5,
            comment: 'Chef Marco created an unforgettable dining experience!',
            userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
          }
        ]
      },
      {
        id: 203,
        type: 'service',
        name: 'Personal Fitness Training',
        location: 'Chicago, Illinois',
        price: 80,
        rating: 4.87,
        reviewCount: 189,
        imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
        images: [
          'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'
        ],
        category: 'fitness',
        duration: '1 hour',
        provider: {
          name: 'FitLife Training',
          joinedDate: '2020',
          isVerified: true,
          avatar: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
        },
        description: 'Personalized fitness training sessions tailored to your goals. Available at your home or local park.',
        highlights: ['Personalized plans', 'Certified trainers', 'Flexible location', 'Results focused'],
        includes: ['Fitness assessment', 'Custom workout plan', 'Nutrition guidance'],
        requirements: ['Comfortable clothing', 'Water bottle'],
        reviews: [
          {
            id: 303,
            user: 'Amanda K.',
            date: '2024-01-18',
            rating: 5,
            comment: 'Best trainer I have ever worked with! See real results.',
            userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
          }
        ]
      }
    ];
  }

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


  // KEEP YOUR EXISTING METHODS
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

  // NEW ENHANCED FEATURES

  /**
   * Advanced search with multiple filters
   */
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

    // Bedrooms filter
    // if (filters.bedrooms && filters.bedrooms > 0) {
    //   properties = properties.filter(p => p.bedrooms >= filters.bedrooms);
    // }

    // Bathrooms filter
    // if (filters.bathrooms && filters.bathrooms > 0) {
    //   properties = properties.filter(p => p.bathrooms >= filters.bathrooms);
    // }

    // Rating filter
    properties = properties.filter(p => p.rating >= filters.minRating);

    // Superhost filter
    if (filters.superhost) {
      properties = properties.filter(p => p.host.isSuperhost);
    }

    // Instant Book filter (mock implementation - you can add this property to your data)
    if (filters.instantBook) {
      properties = properties.filter(p => this.isInstantBookAvailable(p.id));
    }

    return properties;
  }

  /**
   * Wishlist management
   */
  addToWishlist(propertyId: number): void {
    if (!this.wishlist.includes(propertyId)) {
      this.wishlist.push(propertyId);
      this.saveWishlistToStorage();
    }
  }

  removeFromWishlist(propertyId: number): void {
    this.wishlist = this.wishlist.filter(id => id !== propertyId);
    this.saveWishlistToStorage();
  }

  getWishlist(): RentalProperty[] {
    this.loadWishlistFromStorage();
    return this.getProperties().filter(p => this.wishlist.includes(p.id));
  }

  isInWishlist(propertyId: number): boolean {
    this.loadWishlistFromStorage();
    return this.wishlist.includes(propertyId);
  }

  toggleWishlist(propertyId: number): boolean {
    if (this.isInWishlist(propertyId)) {
      this.removeFromWishlist(propertyId);
      return false;
    } else {
      this.addToWishlist(propertyId);
      return true;
    }
  }

  /**
   * Booking management
   */
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

  /**
   * Property recommendations
   */
  getRecommendedProperties(propertyId?: number, limit: number = 6): RentalProperty[] {
    const properties = this.getProperties();

    if (propertyId) {
      // Get similar properties based on type and location
      const currentProperty = this.getPropertyById(propertyId);
      if (currentProperty) {
        return properties
          .filter(p => p.id !== propertyId && p.type === currentProperty.type)
          .slice(0, limit);
      }
    }

    // Return popular properties (high rating and many reviews)
    return properties
      .sort((a, b) => {
        const scoreA = a.rating * a.reviewCount;
        const scoreB = b.rating * b.reviewCount;
        return scoreB - scoreA;
      })
      .slice(0, limit);
  }

  /**
   * Search suggestions
   */
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

  /**
   * Price statistics
   */
  getPriceStatistics(): { min: number; max: number; average: number } {
    const properties = this.getProperties();
    const prices = properties.map(p => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const average = prices.reduce((sum, price) => sum + price, 0) / prices.length;

    return { min, max, average: Math.round(average) };
  }

  // PRIVATE HELPER METHODS

  private generateBookingId(): number {
    return Math.max(0, ...this.bookings.map(b => b.id)) + 1;
  }

  private isInstantBookAvailable(propertyId: number): boolean {
    // Mock implementation - in real app, this would come from property data
    const instantBookProperties = [1, 2, 4, 7, 8]; // Property IDs with instant book
    return instantBookProperties.includes(propertyId);
  }

  private saveWishlistToStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('airbnb_wishlist', JSON.stringify(this.wishlist));
    }
  }

  private loadWishlistFromStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem('airbnb_wishlist');
      this.wishlist = stored ? JSON.parse(stored) : [];
    }
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

  /**
   * Get properties by host
   */
  getPropertiesByHost(hostName: string): RentalProperty[] {
    return this.getProperties().filter(p =>
      p.host.name.toLowerCase().includes(hostName.toLowerCase())
    );
  }

  /**
   * Get available properties for dates (mock implementation)
   */
  getAvailableProperties(checkIn: Date, checkOut: Date): RentalProperty[] {
    // Mock implementation - in real app, you'd check against actual availability calendar
    return this.getProperties().filter(property =>
      this.isPropertyAvailable(property.id, checkIn, checkOut)
    );
  }

  private isPropertyAvailable(propertyId: number, checkIn: Date, checkOut: Date): boolean {
    // Mock implementation - 80% of properties are available
    return Math.random() > 0.2;
  }
   /**
   * Calculate detailed price breakdown
   */
//   calculatePriceBreakdown(property: RentalProperty, checkIn: Date, checkOut: Date, guests: number): PriceBreakdown {
//     const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
//     const subtotal = property.price * nights;
//     const cleaningFee = this.getCleaningFee(property);
//     const serviceFee = this.calculateServiceFee(subtotal);
//     const taxes = this.calculateTaxes(subtotal + cleaningFee + serviceFee);
//     const total = subtotal + cleaningFee + serviceFee + taxes;

//     return {
//       nightlyRate: property.price,
//       nights,
//       subtotal,
//       cleaningFee,
//       serviceFee,
//       taxes,
//       total,
//       currency: 'USD'
//     };
//   }

//   /**
//    * Process payment for a booking
//    */
//   processPayment(bookingRequest: BookingRequest): { success: boolean; payment?: Payment; error?: string } {
//     const property = this.getPropertyById(bookingRequest.propertyId);
//     if (!property) {
//       return { success: false, error: 'Property not found' };
//     }

//     // Check availability
//     if (!this.isPropertyAvailable(property.id, bookingRequest.checkIn, bookingRequest.checkOut)) {
//       return { success: false, error: 'Property not available for selected dates' };
//     }

//     // Calculate price
//     const priceBreakdown = this.calculatePriceBreakdown(
//       property,
//       bookingRequest.checkIn,
//       bookingRequest.checkOut,
//       bookingRequest.guests
//     );

//     // Validate payment method
//     const paymentMethod = this.getPaymentMethodById(bookingRequest.paymentMethodId);
//     if (!paymentMethod) {
//       return { success: false, error: 'Invalid payment method' };
//     }

//     // Simulate payment processing
//     const paymentSuccess = this.simulatePaymentProcessing(paymentMethod, priceBreakdown.total);

//     if (paymentSuccess) {
//       // Create booking
//       const booking = this.createBooking({
//         propertyId: bookingRequest.propertyId,
//         userId: 1, // Current user ID
//         checkIn: bookingRequest.checkIn,
//         checkOut: bookingRequest.checkOut,
//         guests: bookingRequest.guests,
//         totalPrice: priceBreakdown.total,
//         status: 'confirmed'
//       });

//       // Create payment record
//       const payment: Payment = {
//         id: this.generatePaymentId(),
//         bookingId: booking.id,
//         amount: priceBreakdown.total,
//         currency: 'USD',
//         status: 'completed',
//         paymentMethodId: bookingRequest.paymentMethodId,
//         createdAt: new Date(),
//         processedAt: new Date()
//       };

//       this.payments.push(payment);
//       this.savePaymentsToStorage();

//       return { success: true, payment };
//     } else {
//       return { success: false, error: 'Payment processing failed' };
//     }
//   }

//   /**
//    * Payment method management
//    */
//   getPaymentMethods(): PaymentMethod[] {
//     this.loadPaymentMethodsFromStorage();
//     return this.paymentMethods;
//   }

//   addPaymentMethod(paymentMethod: Omit<PaymentMethod, 'id'>): PaymentMethod {
//     const newPaymentMethod: PaymentMethod = {
//       ...paymentMethod,
//       id: this.generatePaymentMethodId()
//     };

//     // If this is the first payment method, set as default
//     if (this.paymentMethods.length === 0) {
//       newPaymentMethod.isDefault = true;
//     }

//     this.paymentMethods.push(newPaymentMethod);
//     this.savePaymentMethodsToStorage();
//     return newPaymentMethod;
//   }

//   setDefaultPaymentMethod(paymentMethodId: number): void {
//     this.paymentMethods.forEach(method => {
//       method.isDefault = method.id === paymentMethodId;
//     });
//     this.savePaymentMethodsToStorage();
//   }

//   removePaymentMethod(paymentMethodId: number): boolean {
//     const index = this.paymentMethods.findIndex(m => m.id === paymentMethodId);
//     if (index > -1) {
//       const wasDefault = this.paymentMethods[index].isDefault;
//       this.paymentMethods.splice(index, 1);

//       // If we removed the default, set a new default
//       if (wasDefault && this.paymentMethods.length > 0) {
//         this.paymentMethods[0].isDefault = true;
//       }

//       this.savePaymentMethodsToStorage();
//       return true;
//     }
//     return false;
//   }

//   getPaymentMethodById(id: number): PaymentMethod | undefined {
//     return this.paymentMethods.find(method => method.id === id);
//   }

//   // PRIVATE HELPER METHODS

//   private getCleaningFee(property: RentalProperty): number {
//     // Base cleaning fee + property size factor
//     return 50 + (property.bedrooms * 10);
//   }

//   private calculateServiceFee(subtotal: number): number {
//     // Airbnb-like service fee: 14% of subtotal
//     return subtotal * 0.14;
//   }

//   private calculateTaxes(amount: number): number {
//     // Simplified tax calculation (8%)
//     return amount * 0.08;
//   }

//   private simulatePaymentProcessing(paymentMethod: PaymentMethod, amount: number): boolean {
//     // Simulate payment processing - 95% success rate
//     // In real app, this would integrate with Stripe, PayPal, etc.
//     return Math.random() > 0.05;
//   }

//   private generatePaymentId(): number {
//     return Math.max(0, ...this.payments.map(p => p.id)) + 1;
//   }

//   private generatePaymentMethodId(): number {
//     return Math.max(0, ...this.paymentMethods.map(p => p.id)) + 1;
//   }

//   private savePaymentMethodsToStorage(): void {
//     if (typeof window !== 'undefined' && window.localStorage) {
//       localStorage.setItem('airbnb_payment_methods', JSON.stringify(this.paymentMethods));
//     }
//   }

//   private loadPaymentMethodsFromStorage(): void {
//     if (typeof window !== 'undefined' && window.localStorage) {
//       const stored = localStorage.getItem('airbnb_payment_methods');
//       this.paymentMethods = stored ? JSON.parse(stored) : this.paymentMethods;
//     }
//   }

//   private savePaymentsToStorage(): void {
//     if (typeof window !== 'undefined' && window.localStorage) {
//       localStorage.setItem('airbnb_payments', JSON.stringify(this.payments));
//     }
//   }

//   private loadPaymentsFromStorage(): void {
//     if (typeof window !== 'undefined' && window.localStorage) {
//       const stored = localStorage.getItem('airbnb_payments');
//       this.payments = stored ? JSON.parse(stored) : [];
//     }
// }
}
