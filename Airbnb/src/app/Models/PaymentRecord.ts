export interface PaymentRecord {
  id: string;
  type: 'payment_method' | 'transaction' | 'payout';
  amount?: number;
  description?: string;
  date?: Date;
  status?: string;
  method?: string;
  provider?: string;
  lastFour?: string;
  expiryDate?: string;
  isDefault?: boolean;
  bookingId?: string;
}