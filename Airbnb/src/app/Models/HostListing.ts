export interface HostListing {
  id: number;
  title: string;
  type: 'property' | 'experience' | 'service';
  status: 'active' | 'inactive' | 'draft';
  price: number;
  location: string;
  rating: number;
  reviewCount: number;
  bookingsCount: number;
  images: string[];
}
