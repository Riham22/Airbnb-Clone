
export interface AdminStats {
  totalUsers: number;
  totalListings: number;
  totalBookings: number;
  totalRevenue: number;
  pendingVerifications: number;
  activeHosts: number;
  monthlyGrowth: number;
  weeklyRevenue?: number;
  activeBookings?: number;
}
