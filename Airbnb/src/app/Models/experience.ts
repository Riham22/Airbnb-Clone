import { Review } from "./review";

// models/experience.ts
export interface Experience {
  isWishlisted: boolean;
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
  amenities?: string[]; // Added for UI compatibility
  reviews: Review[];
  meetingPoint: string;
  languages: string[];
  activities: ExperienceActivity[];
<<<<<<< HEAD
=======
}

export interface ExperienceActivity {
  id: number;
  name: string;
  description: string;
  durationMinutes: number;
>>>>>>> 481bb34615c4b29b09b3b85bc66cb66f22dfc7df
}

export interface ExperienceActivity {
  id: number;
  name: string;
  description: string;
  durationMinutes: number;
}
