// models/admin-listing.model.ts
export interface AdminListing {
  id: string;
  title: string;
  host: string;
  hostId: string;
  type: string;
  status: 'active' | 'suspended' | 'pending';
  price: number;
  location: string;
  rating: number;
  reviewCount: number;
  createdAt: Date;
  lastBooking: Date;
  bedrooms?: number;
  bathrooms?: number;
  maxGuests?: number;
  images: string[];
  amenities: string[];
  updatedAt?: Date;
}
