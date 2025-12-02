export interface Booking {
  id: number;
  propertyId: number;
  userId: number;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
}