// models/admin-user.model.ts
export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'host' | 'guest' | 'admin';
  joinedDate: Date;
  status: 'active' | 'suspended' | 'pending';
  listingsCount: number;
  bookingsCount: number;
  lastActive?: Date;
  avatar?: string;
  updatedAt?: Date;
}
