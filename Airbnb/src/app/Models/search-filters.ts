export interface SearchFilters {
  location: string;
  checkIn: Date | null;
  checkOut: Date | null;
  guests: number;
  priceRange: { min: number; max: number };
  propertyTypes: string[];
  amenities: string[];
  bedrooms: number | null;
  bathrooms: number | null;
  superhost: boolean;
  instantBook: boolean;
  minRating: number;
}