export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'bank_transfer';
  provider: string;
  lastFour?: string;
  expiryDate?: string;
  isDefault: boolean;
}
