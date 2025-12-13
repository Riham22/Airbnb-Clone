// services/payment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, tap, throwError } from 'rxjs';
import { PaymentMethod } from '../Models/PaymentMethod';
import { Transaction } from '../Models/Transaction';
import { Payout } from '../Models/Payout';
import { CardData } from '../Models/CardData';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private baseUrl = '/api/Payment';

  // Subjects for reactive updates
  private paymentMethodsSubject = new BehaviorSubject<PaymentMethod[]>([]);
  private transactionsSubject = new BehaviorSubject<Transaction[]>([]);
  private payoutsSubject = new BehaviorSubject<Payout[]>([]);

  constructor(private http: HttpClient) {
    this.loadSavedCards();
  }

  // ================ PAYMENT METHODS ================

  /**
   * Get all saved payment methods
   */
  getPaymentMethods(): Observable<PaymentMethod[]> {
    return this.paymentMethodsSubject.asObservable();
  }

  /**
   * Save card details (mocked - in production, send to backend)
   */
  saveCardDetails(cardData: CardData): Observable<any> {
    // Mock implementation - add to local payment methods
    const newCard: PaymentMethod = {
      id: Date.now().toString(),
      type: 'card',
      provider: this.detectCardProvider(cardData.cardNumber),
      lastFour: cardData.cardNumber.slice(-4),
      expiryDate: cardData.expiryDate,
      isDefault: this.paymentMethodsSubject.value.length === 0, // First card is default
      cardHolderName: cardData.cardHolderName
    };

    const currentMethods = this.paymentMethodsSubject.value;
    const updatedMethods = [...currentMethods, newCard];
    this.paymentMethodsSubject.next(updatedMethods);

    // Save to localStorage
    this.saveCardsToStorage(updatedMethods);

    // In production, send to backend:
    // return this.http.post(`${this.baseUrl}/save-card`, cardData);
    return new Observable(subscriber => {
      subscriber.next({ success: true, card: newCard });
      subscriber.complete();
    });
  }

  /**
   * Process card payment
   */
  processCardPayment(cardData: CardData, amount: number): Observable<any> {
    // Mock implementation - in production, send to payment processor
    console.log('Processing card payment:', { cardData, amount });

    // In production, send to backend:
    // return this.http.post(`${this.baseUrl}/process-card-payment`, { cardData, amount });
    return new Observable(subscriber => {
      setTimeout(() => {
        const transaction: Transaction = {
          id: Date.now().toString(),
          type: 'payment',
          amount: amount,
          description: 'Card Payment',
          date: new Date(),
          status: 'completed',
          paymentMethodId: 'card-' + cardData.cardNumber.slice(-4)
        };

        // Add to transactions
        const currentTransactions = this.transactionsSubject.value;
        this.transactionsSubject.next([transaction, ...currentTransactions]);

        subscriber.next({
          success: true,
          transactionId: transaction.id,
          message: 'Payment processed successfully'
        });
        subscriber.complete();
      }, 1000);
    });
  }

  /**
   * Process PayPal payment (handled by PayPal SDK on client side)
   */
  processPayPalPayment(paypalData: any): Observable<any> {
    // PayPal payments are handled by the PayPal SDK
    // This method can be used to record the transaction on the backend
    console.log('Recording PayPal payment:', paypalData);

    const transaction: Transaction = {
      id: paypalData.orderID || Date.now().toString(),
      type: 'payment',
      amount: paypalData.amount || 0,
      description: 'PayPal Payment',
      date: new Date(),
      status: 'completed',
      paymentMethodId: 'paypal'
    };

    // Add to transactions
    const currentTransactions = this.transactionsSubject.value;
    this.transactionsSubject.next([transaction, ...currentTransactions]);

    // In production, send to backend:
    // return this.http.post(`${this.baseUrl}/process-paypal-payment`, paypalData);
    return new Observable(subscriber => {
      subscriber.next({ success: true, transactionId: transaction.id });
      subscriber.complete();
    });
  }

  /**
   * Set default payment method
   */
  setDefaultPaymentMethod(methodId: string): Observable<any> {
    const methods = this.paymentMethodsSubject.value.map(method => ({
      ...method,
      isDefault: method.id === methodId
    }));
    this.paymentMethodsSubject.next(methods);
    this.saveCardsToStorage(methods);

    return new Observable(subscriber => {
      subscriber.next({ success: true });
      subscriber.complete();
    });
  }

  /**
   * Remove payment method
   */
  removePaymentMethod(methodId: string): Observable<any> {
    const methods = this.paymentMethodsSubject.value.filter(m => m.id !== methodId);
    this.paymentMethodsSubject.next(methods);
    this.saveCardsToStorage(methods);

    return new Observable(subscriber => {
      subscriber.next({ success: true });
      subscriber.complete();
    });
  }

  // ================ TRANSACTIONS ================

  /**
   * Get all transactions
   */
  getTransactions(): Observable<Transaction[]> {
    return this.transactionsSubject.asObservable();
  }

  /**
   * Get transaction by ID
   */
  getTransactionById(id: string): Observable<Transaction | undefined> {
    return this.transactionsSubject.pipe(
      map(transactions => transactions.find(t => t.id === id))
    );
  }

  // ================ PAYOUTS ================

  /**
   * Get all payouts
   */
  getPayouts(): Observable<Payout[]> {
    return this.payoutsSubject.asObservable();
  }

  /**
   * Request payout
   */
  requestPayout(amount: number): void {
    const payouts = this.payoutsSubject.value;
    const newPayout: Payout = {
      id: (Math.max(0, ...payouts.map(p => parseInt(p.id))) + 1).toString(),
      date: new Date(),
      amount,
      method: 'Bank Transfer',
      status: 'pending'
    };
    this.payoutsSubject.next([newPayout, ...payouts]);
  }

  // ================ HELPER METHODS ================

  /**
   * Detect card provider from card number
   */
  private detectCardProvider(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\s/g, '');

    if (/^4/.test(cleaned)) return 'Visa';
    if (/^5[1-5]/.test(cleaned)) return 'Mastercard';
    if (/^3[47]/.test(cleaned)) return 'American Express';
    if (/^6(?:011|5)/.test(cleaned)) return 'Discover';

    return 'Card';
  }

  /**
   * Load saved cards from localStorage
   */
  private loadSavedCards(): void {
    try {
      const saved = localStorage.getItem('savedCards');
      if (saved) {
        const cards = JSON.parse(saved);
        this.paymentMethodsSubject.next(cards);
      }
    } catch (error) {
      console.error('Error loading saved cards:', error);
    }
  }

  /**
   * Save cards to localStorage
   */
  private saveCardsToStorage(cards: PaymentMethod[]): void {
    try {
      localStorage.setItem('savedCards', JSON.stringify(cards));
    } catch (error) {
      console.error('Error saving cards:', error);
    }
  }
}