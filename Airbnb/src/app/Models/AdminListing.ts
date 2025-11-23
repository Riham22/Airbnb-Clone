export interface AdminListing {
  id: number;
  title: string;
  host: string;
  type: 'property' | 'experience' | 'service';
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  price: number;
  location: string;
  rating: number;
  reviewCount: number;
  createdAt: string;
  lastBooking: string;
}
