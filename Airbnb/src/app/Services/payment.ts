// services/payment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, tap, throwError } from 'rxjs';
import { PaymentMethod } from '../Models/PaymentMethod';
import { Transaction } from '../Models/Transaction';
import { Payout } from '../Models/Payout';

export interface PaymentIntentRequest {
  amount: number;
  currency?: string;
  paymentMethodType?: string;
  metadata?: any;
}

export interface PaymentIntentResponse {
  id: string;
  clientSecret: string;
  amount: number;
  status: string;
}

export interface ConfirmPaymentRequest {
  paymentIntentId: string;
  paymentMethodId?: string;
}

export interface RefundRequest {
  paymentId: string;
  amount?: number;
  reason?: string;
}

// Unified API Response Interface based on your endpoints
export interface PaymentApiResponse {
  id: string;
  type?: 'payment_method' | 'transaction' | 'payout' | 'earning' | 'refund';
  amount?: number;
  description?: string;
  date?: string | Date;
  status?: 'pending' | 'completed' | 'failed' | 'processing';
  method?: string;
  provider?: string;
  lastFour?: string;
  expiryDate?: string;
  isDefault?: boolean;
  bookingId?: string;
  userId?: string;
  paymentMethodId?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private baseUrl = 'http://localhost:5034/api/Payment';
  
  // Subjects for reactive updates
  private paymentMethodsSubject = new BehaviorSubject<PaymentMethod[]>([]);
  private transactionsSubject = new BehaviorSubject<Transaction[]>([]);
  private payoutsSubject = new BehaviorSubject<Payout[]>([]);

  constructor(private http: HttpClient) {}

  // ================ PAYMENT METHODS ================
  
  // Get all payment methods from my-payments endpoint
  getPaymentMethods(): Observable<PaymentMethod[]> {
    return this.http.get<PaymentApiResponse[]>(`${this.baseUrl}/my-payments`).pipe(
      map(responses => {
        // Filter and transform API responses to PaymentMethod objects
        const methods = responses
          .filter(response => 
            // Identify payment methods: has provider or lastFour, or no amount
            response.provider || 
            response.lastFour || 
            (!response.amount && !response.bookingId)
          )
          .map(response => ({
            id: response.id,
            type: this.determinePaymentMethodType(response),
            provider: response.provider || 'Card',
            lastFour: response.lastFour,
            expiryDate: response.expiryDate,
            isDefault: response.isDefault || false,
            cardHolderName: response.description
          } as PaymentMethod));
        
        this.paymentMethodsSubject.next(methods);
        return methods;
      }),
      catchError(error => {
        console.error('Error fetching payment methods:', error);
        return throwError(() => error);
      })
    );
  }

  private determinePaymentMethodType(response: PaymentApiResponse): PaymentMethod['type'] {
    if (response.provider?.toLowerCase().includes('paypal')) return 'paypal';
    if (response.provider?.toLowerCase().includes('bank')) return 'bank_transfer';
    return 'card';
  }

  getPaymentMethodsObservable(): Observable<PaymentMethod[]> {
    return this.paymentMethodsSubject.asObservable();
  }

  // Create payment intent - EXACT ENDPOINT: POST /api/Payment/create-payment-intent
  createPaymentIntent(data: PaymentIntentRequest): Observable<PaymentIntentResponse> {
    return this.http.post<PaymentIntentResponse>(`${this.baseUrl}/create-payment-intent`, data).pipe(
      catchError(error => {
        console.error('Error creating payment intent:', error);
        return throwError(() => error);
      })
    );
  }

  // Confirm payment - EXACT ENDPOINT: POST /api/Payment/confirm
  confirmPayment(data: ConfirmPaymentRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/confirm`, data).pipe(
      catchError(error => {
        console.error('Error confirming payment:', error);
        return throwError(() => error);
      })
    );
  }

  // Set default payment method - Custom endpoint needed
  setDefaultPaymentMethod(methodId: string): Observable<any> {
    // Note: This endpoint doesn't exist in your API
    // You might need to create it or use a different approach
    console.warn('Endpoint /api/Payment/{id}/set-default may not exist');
    
    // Simulating the update locally for now
    const methods = this.paymentMethodsSubject.value.map(method => ({
      ...method,
      isDefault: method.id === methodId
    }));
    this.paymentMethodsSubject.next(methods);
    
    return new Observable(subscriber => {
      subscriber.next({ success: true });
      subscriber.complete();
    });
  }

  // Remove payment method - EXACT ENDPOINT: DELETE /api/Payment/{id}
  removePaymentMethod(methodId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${methodId}`).pipe(
      tap(() => {
        // Update local state
        const methods = this.paymentMethodsSubject.value.filter(m => m.id !== methodId);
        this.paymentMethodsSubject.next(methods);
      }),
      catchError(error => {
        console.error('Error removing payment method:', error);
        return throwError(() => error);
      })
    );
  }

  // ================ TRANSACTIONS ================
  
  // Get all transactions from my-payments endpoint
  getTransactions(): Observable<Transaction[]> {
    return this.http.get<PaymentApiResponse[]>(`${this.baseUrl}/my-payments`).pipe(
      map(responses => {
        // Filter and transform API responses to Transaction objects
        const transactions = responses
          .filter(response => 
            // Identify transactions: has amount and bookingId or description
            response.amount && 
            (response.bookingId || response.description)
          )
          .map(response => ({
            id: response.id,
            type: this.determineTransactionType(response),
            amount: response.amount || 0,
            description: response.description || 'Transaction',
            date: response.date ? new Date(response.date) : new Date(),
            status: response.status || 'completed',
            bookingId: response.bookingId,
            paymentMethodId: response.paymentMethodId
          } as Transaction));
        
        this.transactionsSubject.next(transactions);
        return transactions;
      }),
      catchError(error => {
        console.error('Error fetching transactions:', error);
        return throwError(() => error);
      })
    );
  }

  private determineTransactionType(response: PaymentApiResponse): Transaction['type'] {
    if (response.type === 'earning' || response.description?.toLowerCase().includes('booking')) return 'earning';
    if (response.type === 'refund' || response.description?.toLowerCase().includes('refund')) return 'refund';
    if (response.type === 'payout' || response.description?.toLowerCase().includes('payout')) return 'payout';
    return 'payment';
  }

  getTransactionsObservable(): Observable<Transaction[]> {
    return this.transactionsSubject.asObservable();
  }

  // Get transaction by ID - EXACT ENDPOINT: GET /api/Payment/{id}
  getTransactionById(id: string): Observable<Transaction> {
    return this.http.get<PaymentApiResponse>(`${this.baseUrl}/${id}`).pipe(
      map(response => ({
        id: response.id,
        type: this.determineTransactionType(response),
        amount: response.amount || 0,
        description: response.description || 'Transaction',
        date: response.date ? new Date(response.date) : new Date(),
        status: response.status || 'completed',
        bookingId: response.bookingId,
        paymentMethodId: response.paymentMethodId
      } as Transaction)),
      catchError(error => {
        console.error('Error fetching transaction:', error);
        return throwError(() => error);
      })
    );
  }

  // Get transactions by booking - EXACT ENDPOINT: GET /api/Payment/hooking/{bookingId}
  getTransactionsByBooking(bookingId: string): Observable<Transaction[]> {
    return this.http.get<PaymentApiResponse[]>(`${this.baseUrl}/hooking/${bookingId}`).pipe(
      map(responses => responses.map(response => ({
        id: response.id,
        type: this.determineTransactionType(response),
        amount: response.amount || 0,
        description: response.description || 'Booking Payment',
        date: response.date ? new Date(response.date) : new Date(),
        status: response.status || 'completed',
        bookingId: response.bookingId,
        paymentMethodId: response.paymentMethodId
      } as Transaction))),
      catchError(error => {
        console.error('Error fetching booking transactions:', error);
        return throwError(() => error);
      })
    );
  }

  // Get transactions by user - EXACT ENDPOINT: GET /api/Payment/user/{userId}
  getTransactionsByUser(userId: string): Observable<Transaction[]> {
    return this.http.get<PaymentApiResponse[]>(`${this.baseUrl}/user/${userId}`).pipe(
      map(responses => responses.map(response => ({
        id: response.id,
        type: this.determineTransactionType(response),
        amount: response.amount || 0,
        description: response.description || 'User Transaction',
        date: response.date ? new Date(response.date) : new Date(),
        status: response.status || 'completed',
        bookingId: response.bookingId,
        paymentMethodId: response.paymentMethodId,
        userId: response.userId
      } as Transaction))),
      catchError(error => {
        console.error('Error fetching user transactions:', error);
        return throwError(() => error);
      })
    );
  }

  // Get transactions by status - EXACT ENDPOINT: GET /api/Payment/status/{status}
  getTransactionsByStatus(status: string): Observable<Transaction[]> {
    return this.http.get<PaymentApiResponse[]>(`${this.baseUrl}/status/${status}`).pipe(
      map(responses => responses.map(response => ({
        id: response.id,
        type: this.determineTransactionType(response),
        amount: response.amount || 0,
        description: response.description || 'Transaction',
        date: response.date ? new Date(response.date) : new Date(),
        status: response.status || status,
        bookingId: response.bookingId,
        paymentMethodId: response.paymentMethodId
      } as Transaction))),
      catchError(error => {
        console.error('Error fetching transactions by status:', error);
        return throwError(() => error);
      })
    );
  }

  // ================ PAYOUTS ================
  
  // Get all payouts from my-payments endpoint
  getPayouts(): Observable<Payout[]> {
    return this.http.get<PaymentApiResponse[]>(`${this.baseUrl}/my-payments`).pipe(
      map(responses => {
        // Filter and transform API responses to Payout objects
        const payouts = responses
          .filter(response => 
            // Identify payouts: has method (bank transfer, etc.) or type is payout
            response.method || 
            response.type === 'payout'
          )
          .map(response => ({
            id: response.id,
            amount: response.amount || 0,
            date: response.date ? new Date(response.date) : new Date(),
            method: response.method || 'Bank Transfer',
            status: response.status || 'pending',
            description: response.description || 'Payout',
            userId: response.userId
          } as Payout));
        
        this.payoutsSubject.next(payouts);
        return payouts;
      }),
      catchError(error => {
        console.error('Error fetching payouts:', error);
        return throwError(() => error);
      })
    );
  }

  getPayoutsObservable(): Observable<Payout[]> {
    return this.payoutsSubject.asObservable();
  }

  // Request payout - Using refund endpoint as placeholder
  // EXACT ENDPOINT: POST /api/Payment/refund
  requestPayout(amount: number): Observable<any> {
    const payoutRequest: RefundRequest = {
      paymentId: `payout_${Date.now()}`,
      amount: amount,
      reason: 'Payout request'
    };
    
    return this.http.post(`${this.baseUrl}/refund`, payoutRequest).pipe(
      tap((response: any) => {
        // Create a new payout object from response
        const newPayout: Payout = {
          id: response.id || `payout_${Date.now()}`,
          amount: amount,
          date: new Date(),
          method: 'Bank Transfer',
          status: 'pending',
          description: `Payout request for $${amount}`
        };
        
        // Update local state
        const payouts = this.payoutsSubject.value;
        this.payoutsSubject.next([newPayout, ...payouts]);
      }),
      catchError(error => {
        console.error('Error requesting payout:', error);
        return throwError(() => error);
      })
    );
  }

  // Refund payment - EXACT ENDPOINT: POST /api/Payment/refund
  refundPayment(data: RefundRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/refund`, data).pipe(
      catchError(error => {
        console.error('Error processing refund:', error);
        return throwError(() => error);
      })
    );
  }

  // ================ WEBHOOK ================
  
  // Handle webhook - EXACT ENDPOINT: POST /api/Payment/webhook
  handleWebhook(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/webhook`, data).pipe(
      catchError(error => {
        console.error('Error processing webhook:', error);
        return throwError(() => error);
      })
    );
  }

  // ================ TEST ENDPOINT ================
  
  // Test connection - EXACT ENDPOINT: GET /api/Payment/test
  testConnection(): Observable<any> {
    return this.http.get(`${this.baseUrl}/test`).pipe(
      catchError(error => {
        console.error('Error testing connection:', error);
        return throwError(() => error);
      })
    );
  }

  // ================ UTILITY METHODS ================
  
  // Load all payment data at once (for initial load)
  loadAllPaymentData(): Observable<{
    methods: PaymentMethod[],
    transactions: Transaction[],
    payouts: Payout[]
  }> {
    return this.http.get<PaymentApiResponse[]>(`${this.baseUrl}/my-payments`).pipe(
      map(responses => {
        // Process all data from the single endpoint
        const methods: PaymentMethod[] = [];
        const transactions: Transaction[] = [];
        const payouts: Payout[] = [];

        responses.forEach(response => {
          // Determine type and categorize
          if (response.provider || response.lastFour || (!response.amount && !response.bookingId)) {
            // Payment Method
            methods.push({
              id: response.id,
              type: this.determinePaymentMethodType(response),
              provider: response.provider || 'Card',
              lastFour: response.lastFour,
              expiryDate: response.expiryDate,
              isDefault: response.isDefault || false,
              cardHolderName: response.description
            });
          } else if (response.amount && (response.bookingId || response.description)) {
            // Transaction
            transactions.push({
              id: response.id,
              type: this.determineTransactionType(response),
              amount: response.amount || 0,
              description: response.description || 'Transaction',
              date: response.date ? new Date(response.date) : new Date(),
              status: response.status || 'completed',
              bookingId: response.bookingId,
              paymentMethodId: response.paymentMethodId
            });
          } else if (response.method || response.type === 'payout') {
            // Payout
            payouts.push({
              id: response.id,
              amount: response.amount || 0,
              date: response.date ? new Date(response.date) : new Date(),
              method: response.method || 'Bank Transfer',
              status: response.status || 'pending',
              description: response.description || 'Payout'
            });
          }
        });

        // Update subjects
        this.paymentMethodsSubject.next(methods);
        this.transactionsSubject.next(transactions);
        this.payoutsSubject.next(payouts);

        return { methods, transactions, payouts };
      }),
      catchError(error => {
        console.error('Error loading all payment data:', error);
        return throwError(() => error);
      })
    );
  }
}