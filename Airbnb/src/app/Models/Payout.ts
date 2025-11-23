export interface Payout {
  id: string;
  amount: number;
  date: Date;
  method: string;
  status: 'pending' | 'completed' | 'failed';
}
