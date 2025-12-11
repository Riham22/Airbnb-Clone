import { Review } from "./review";

// models/service.ts
export interface Service {
  isWishlisted: boolean;
  id: number;
  type: 'service';
  name: string;
  location: string;
  price: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  images: string[];
  category: string;
  duration: string;
  maxGuests?: number;
  host: {
    name: string;
    joinedDate: string;
    isSuperhost: boolean;
    avatar: string;
  };
  description: string;
  highlights: string[];
  includes: string[];
  requirements: string[];
  reviews: Review[];
}
