export interface Transaction {
  id: string;
  type: 'earning' | 'payout' | 'refund';
  amount: number;
  description: string;
  date: Date;
  status: 'pending' | 'completed' | 'failed';
  bookingId?: string;
}
