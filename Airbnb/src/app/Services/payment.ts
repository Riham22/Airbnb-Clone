// services/payment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, tap, throwError, forkJoin } from 'rxjs';
import { PaymentMethod } from '../Models/PaymentMethod';
import { Transaction } from '../Models/Transaction';
import { Payout } from '../Models/Payout';

// ✅ بناءً على الـ API الحقيقي من Postman Guide
export interface SetupIntentResponse {
  success: boolean;
  message: string;
  data: {
    clientSecret: string;
    customerId: string;
  };
}

export interface PaymentMethodResponse {
  id: number;
  cardBrand: string;
  last4Digits: string;
  expiryMonth: number;
  expiryYear: number;
  cardholderName: string | null;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface PaymentMethodsListResponse {
  success: boolean;
  count: number;
  data: PaymentMethodResponse[];
}

export interface AddPaymentMethodRequest {
  stripePaymentMethodId: string;
  setAsDefault?: boolean;
}

export interface CreatePaymentIntentRequest {
  bookingId: number;
  amount: number;
  currency?: string;
  paymentMethod: string;
  savedPaymentMethodId?: number;
  saveCard?: boolean;
}

export interface PaymentIntentResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    bookingId: number;
    amount: number;
    currency: string;
    status: string;
    transactionId: string;
    clientSecret: string | null;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  // ✅ Base URLs بناءً على الـ API
  private baseUrl = 'https://localhost:7020/api'; // أصلح البورت إذا كان مختلف
  private paymentMethodsUrl = `${this.baseUrl}/PaymentMethods`;
  private paymentUrl = `${this.baseUrl}/Payment`;

  // Subjects for reactive updates
  private paymentMethodsSubject = new BehaviorSubject<PaymentMethod[]>([]);
  private transactionsSubject = new BehaviorSubject<Transaction[]>([]);
  private payoutsSubject = new BehaviorSubject<Payout[]>([]);

  constructor(private http: HttpClient) {}

  // ================ STRIPE SETUP INTENT ================
  
  /**
   * Step 1: Get Setup Intent for adding new cards
   * POST /api/PaymentMethods/setup-intent
   */
  // In getSetupIntent() method, add null check
getSetupIntent(): Observable<SetupIntentResponse> {
  return this.http.post<SetupIntentResponse>(`${this.paymentMethodsUrl}/setup-intent`, {}).pipe(
    map(response => {
      if (!response?.data?.clientSecret) {
        throw new Error('Invalid setup intent response');
      }
      return response;
    }),
    catchError(error => {
      console.error('❌ Error getting setup intent:', error);
      return throwError(() => new Error('Failed to get setup intent. Please try again.'));
    })
  );
}
  // ================ PAYMENT METHODS CRUD ================
  
  /**
   * Step 2: Add new payment method (after getting payment_method ID from Stripe)
   * POST /api/PaymentMethods
   */
  addPaymentMethod(request: AddPaymentMethodRequest): Observable<PaymentMethodResponse> {
    return this.http.post<PaymentMethodResponse>(this.paymentMethodsUrl, request).pipe(
      tap(response => {
        console.log('✅ Payment method added:', response);
        // Update local state by reloading all methods
        this.getPaymentMethods().subscribe();
      }),
      catchError(error => {
        console.error('❌ Error adding payment method:', error);
        return throwError(() => new Error('Failed to add payment method. Please check the payment method ID.'));
      })
    );
  }

  /**
   * Get all saved payment methods
   * GET /api/PaymentMethods
   */
  getPaymentMethods(): Observable<PaymentMethod[]> {
    return this.http.get<PaymentMethodsListResponse>(this.paymentMethodsUrl).pipe(
      map(response => {
        // Transform backend response to frontend PaymentMethod model
        const methods = response.data.map(item => ({
          id: item.id.toString(),
          type: this.mapCardBrandToType(item.cardBrand),
          provider: this.formatCardBrand(item.cardBrand),
          lastFour: item.last4Digits,
          expiryDate: `${item.expiryMonth.toString().padStart(2, '0')}/${item.expiryYear.toString().slice(-2)}`,
          isDefault: item.isDefault,
          cardHolderName: item.cardholderName || '',
          isActive: item.isActive,
          createdAt: item.createdAt
        } as PaymentMethod));
        
        this.paymentMethodsSubject.next(methods);
        return methods;
      }),
      catchError(error => {
        console.error('❌ Error fetching payment methods:', error);
        return throwError(() => new Error('Failed to load payment methods.'));
      })
    );
  }

  /**
   * Set default payment method
   * PUT /api/PaymentMethods/{id}/set-default
   */
  setDefaultPaymentMethod(methodId: string): Observable<any> {
    return this.http.put(`${this.paymentMethodsUrl}/${methodId}/set-default`, {}).pipe(
      tap(() => {
        console.log('✅ Payment method set as default:', methodId);
        // Update local state
        const updatedMethods = this.paymentMethodsSubject.value.map(method => ({
          ...method,
          isDefault: method.id === methodId
        }));
        this.paymentMethodsSubject.next(updatedMethods);
      }),
      catchError(error => {
        console.error('❌ Error setting default payment method:', error);
        return throwError(() => new Error('Failed to set default payment method.'));
      })
    );
  }

  /**
   * Remove payment method
   * DELETE /api/PaymentMethods/{id}
   */
  removePaymentMethod(methodId: string): Observable<any> {
    return this.http.delete(`${this.paymentMethodsUrl}/${methodId}`).pipe(
      tap(() => {
        console.log('✅ Payment method removed:', methodId);
        // Update local state
        const filteredMethods = this.paymentMethodsSubject.value.filter(m => m.id !== methodId);
        this.paymentMethodsSubject.next(filteredMethods);
      }),
      catchError(error => {
        console.error('❌ Error removing payment method:', error);
        return throwError(() => new Error('Failed to remove payment method.'));
      })
    );
  }

  /**
   * Check if payment method exists in wishlist
   * GET /api/PaymentMethods/check/{itemType}/{itemId}
   */
  checkPaymentMethodStatus(itemType: string, itemId: number): Observable<any> {
    return this.http.get(`${this.paymentMethodsUrl}/check/${itemType}/${itemId}`);
  }

  /**
   * Get wishlist count
   * GET /api/PaymentMethods/count
   */
  getPaymentMethodCount(): Observable<any> {
    return this.http.get(`${this.paymentMethodsUrl}/count`);
  }

  // ================ PAYMENT PROCESSING ================
  
  /**
   * Create payment intent with saved card
   * POST /api/Payment/create-payment-intent
   */
  createPaymentIntent(data: CreatePaymentIntentRequest): Observable<PaymentIntentResponse> {
    return this.http.post<PaymentIntentResponse>(`${this.paymentUrl}/create-payment-intent`, data).pipe(
      catchError(error => {
        console.error('❌ Error creating payment intent:', error);
        return throwError(() => new Error('Failed to create payment intent.'));
      })
    );
  }

  /**
   * Get payment by ID
   * GET /api/Payment/{id}
   */
  getPaymentById(id: string): Observable<any> {
    return this.http.get(`${this.paymentUrl}/${id}`);
  }

  /**
   * Get payments by booking ID
   * GET /api/Payment/hooking/{bookingId}
   */
  getPaymentsByBooking(bookingId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.paymentUrl}/hooking/${bookingId}`);
  }

  /**
   * Get payments by user ID
   * GET /api/Payment/user/{userId}
   */
  getPaymentsByUser(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.paymentUrl}/user/${userId}`);
  }

  /**
   * Get payments by status
   * GET /api/Payment/status/{status}
   */
  getPaymentsByStatus(status: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.paymentUrl}/status/${status}`);
  }

  /**
   * Process refund
   * POST /api/Payment/refund
   */
  refundPayment(data: any): Observable<any> {
    return this.http.post(`${this.paymentUrl}/refund`, data);
  }

  /**
   * Handle webhook
   * POST /api/Payment/webhook
   */
  handleWebhook(data: any): Observable<any> {
    return this.http.post(`${this.paymentUrl}/webhook`, data);
  }

  // ================ TRANSACTIONS ================
  
  /**
   * Get user's transactions (using existing /my-payments endpoint)
   * GET /api/Payment/my-payments
   */
  getTransactions(): Observable<Transaction[]> {
    return this.http.get<any[]>(`${this.paymentUrl}/my-payments`).pipe(
      map(responses => {
        const transactions = responses.map(item => ({
          id: item.id?.toString() || '',
          type: this.determineTransactionType(item),
          amount: item.amount || 0,
          description: item.description || 'Payment',
          date: item.createdAt ? new Date(item.createdAt) : new Date(),
          status: item.status || 'completed',
          bookingId: item.bookingId?.toString(),
          paymentMethodId: item.paymentMethodId?.toString()
        } as Transaction));
        
        this.transactionsSubject.next(transactions);
        return transactions;
      }),
      catchError(error => {
        console.error('❌ Error fetching transactions:', error);
        return throwError(() => new Error('Failed to load transactions.'));
      })
    );
  }

  // ================ PAYOUTS ================
  
  /**
   * Get user's payouts
   * Note: Might need separate endpoint for payouts
   */
  getPayouts(): Observable<Payout[]> {
    // For now, use transactions with type 'payout'
    return this.getTransactions().pipe(
      map(transactions => {
        const payouts = transactions
          .filter(t => t.type === 'payout')
          .map(t => ({
            id: t.id,
            amount: t.amount,
            date: t.date,
            method: 'Bank Transfer', // Default
            status: t.status,
            description: t.description
          } as Payout));
        
        this.payoutsSubject.next(payouts);
        return payouts;
      })
    );
  }

  /**
   * Request payout
   * Note: Might need separate endpoint for payout requests
   */
  requestPayout(amount: number): Observable<any> {
    // Using refund endpoint as placeholder
    const payoutRequest = {
      paymentId: `payout_${Date.now()}`,
      amount: amount,
      reason: 'Payout request'
    };
    
    return this.refundPayment(payoutRequest).pipe(
      tap(() => {
        // Create local payout record
        const newPayout: Payout = {
          id: Date.now().toString(),
          amount: amount,
          date: new Date(),
          method: 'Bank Transfer',
          status: 'pending',
          description: `Payout request for $${amount}`
        };
        
        const payouts = this.payoutsSubject.value;
        this.payoutsSubject.next([newPayout, ...payouts]);
      })
    );
  }

  // ================ UTILITY METHODS ================
  
  private mapCardBrandToType(brand: string): PaymentMethod['type'] {
    const lowerBrand = brand.toLowerCase();
    if (lowerBrand.includes('visa') || lowerBrand.includes('mastercard') || 
        lowerBrand.includes('amex') || lowerBrand.includes('discover')) {
      return 'card';
    }
    if (lowerBrand.includes('paypal')) return 'paypal';
    if (lowerBrand.includes('bank')) return 'bank_transfer';
    return 'card';
  }

  private formatCardBrand(brand: string): string {
    const brands: { [key: string]: string } = {
      'visa': 'Visa',
      'mastercard': 'Mastercard',
      'amex': 'American Express',
      'american express': 'American Express',
      'discover': 'Discover',
      'paypal': 'PayPal',
      'bank': 'Bank Transfer'
    };
    
    const lowerBrand = brand.toLowerCase();
    for (const [key, value] of Object.entries(brands)) {
      if (lowerBrand.includes(key)) {
        return value;
      }
    }
    
    return brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase();
  }

  private determineTransactionType(item: any): Transaction['type'] {
    if (item.type === 'earning' || item.description?.toLowerCase().includes('earning')) {
      return 'earning';
    }
    if (item.type === 'payout' || item.description?.toLowerCase().includes('payout')) {
      return 'payout';
    }
    if (item.type === 'refund' || item.description?.toLowerCase().includes('refund')) {
      return 'refund';
    }
    return 'payment';
  }

  /**
   * Load all payment data at once
   */
  loadAllPaymentData(): Observable<{
    methods: PaymentMethod[],
    transactions: Transaction[],
    payouts: Payout[]
  }> {
    return forkJoin({
      methods: this.getPaymentMethods(),
      transactions: this.getTransactions(),
      payouts: this.getPayouts()
    }).pipe(
      catchError(error => {
        console.error('❌ Error loading all payment data:', error);
        return throwError(() => new Error('Failed to load payment data.'));
      })
    );
  }

  getPaymentMethodsObservable(): Observable<PaymentMethod[]> {
    return this.paymentMethodsSubject.asObservable();
  }

  getTransactionsObservable(): Observable<Transaction[]> {
    return this.transactionsSubject.asObservable();
  }

  getPayoutsObservable(): Observable<Payout[]> {
    return this.payoutsSubject.asObservable();
  }

  /**
   * Test API connection
   * GET /api/Payment/test
   */
  testConnection(): Observable<any> {
    return this.http.get(`${this.paymentUrl}/test`);
  }
}