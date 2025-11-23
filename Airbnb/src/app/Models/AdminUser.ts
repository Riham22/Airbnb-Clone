export interface AdminUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'guest' | 'host' | 'admin';
  joinedDate: string;
  status: 'active' | 'suspended' | 'pending';
  listingsCount: number;
  bookingsCount: number;
}
