export interface Payout {
  id: string;
  amount: number;
  date: Date;
  method: string;
  status: 'pending' | 'completed' | 'failed'|'processing';
  description?: string;
  userId?: string;
}