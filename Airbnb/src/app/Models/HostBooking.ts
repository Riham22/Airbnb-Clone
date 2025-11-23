

export interface HostBooking {
  id: number;
  guestName: string;
  guestAvatar: string;
  listingName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: 'upcoming' | 'current' | 'completed' | 'cancelled';
}
