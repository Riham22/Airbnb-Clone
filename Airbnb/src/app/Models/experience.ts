import { Review } from "./review";

// models/experience.ts
export interface Experience {
  id: number;
  type: 'experience';
  name: string;
  location: string;
  price: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  images: string[];
  category: string;
  duration: string;
  maxParticipants: number;
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
  meetingPoint: string;
  languages: string[];
}

