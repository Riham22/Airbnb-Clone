
export interface HostBooking {
  id: number;
  propertyName: string;
  guestName: string;
  guestEmail: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  bookingDate: Date;
  propertyImage: string;
  guestAvatar?: string;
  listingName?: string;
}
