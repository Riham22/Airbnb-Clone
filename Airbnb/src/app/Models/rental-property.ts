import { Review } from "./review";

export interface RentalProperty {
  isWishlisted: boolean;
  id: number;
  name: string;
  location: string;
  price: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  images: string[];
  type: string;
  propertyType: string;
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  amenities: string[];
  host: {
    name: string;
    joinedDate: string;
    isSuperhost: boolean;
    avatar: string;
  };
  description: string;
  highlights: string[];
  reviews: Review[];
  availableDates?: string;
  totalPrice?: number;
}
