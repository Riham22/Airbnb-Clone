export interface Transaction {
  id: string;
  type: 'earning' | 'payout' | 'refund' | 'payment';
  amount: number;
  description: string;
  date: Date;
  status: 'pending' | 'completed' | 'failed' | 'processing';
  bookingId?: string;
  paymentMethodId?: string;
  userId?: string;
}