// components/payment/payment.component.ts
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, firstValueFrom, Observable } from 'rxjs';
import { PaymentMethod } from '../../Models/PaymentMethod';
import { Transaction } from '../../Models/Transaction';
import { Payout } from '../../Models/Payout';
import {
  PaymentService,
  SetupIntentResponse,
  AddPaymentMethodRequest,
  CreatePaymentIntentRequest
} from '../../Services/payment';

// Declare Stripe for TypeScript (will be loaded via script tag)
declare const Stripe: any;

interface NewCard {
  number: string;
  expiry: string;
  cvc: string;
  name: string;
  zipCode?: string;
}

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './payment.html',
  styleUrl: './payment.css'
})
export class PaymentComponent implements OnInit, OnDestroy {
  // Payment data
  public paymentMethods: PaymentMethod[] = [];
  public paymentMethods$?: Observable<PaymentMethod[]>;
  public transactions: Transaction[] = [];
  public transactions$?: Observable<Transaction[]>;
  public payouts: Payout[] = [];
  public payouts$?: Observable<Payout[]>;

  // UI state
  public activeTab: 'methods' | 'transactions' | 'payouts' = 'methods';
  public showAddCard = false;
  public payoutAmount = 0;
  public availableBalance = 0;
  public isLoading = false;
  public errorMessage = '';
  public successMessage = '';
  public transactionFilter = 'all';
  public stripe: any = null;
  public cardElement: any = null;

  // New card form
  public newCard: NewCard = {
    number: '',
    expiry: '',
    cvc: '',
    name: '',
    zipCode: ''
  };

  // Test payment form
  public testPayment = {
    amount: 50,
    bookingId: 123,
    currency: 'USD',
    selectedMethodId: ''
  };

  private destroy$ = new Subject<void>();

  constructor(private paymentService: PaymentService, private cd: ChangeDetectorRef) {}

  public async ngOnInit(): Promise<void> {
    // Initialize observables that depend on injected services
    this.paymentMethods$ = this.paymentService.getPaymentMethodsObservable();
    this.transactions$ = this.paymentService.getTransactionsObservable();
    this.payouts$ = this.paymentService.getPayoutsObservable();

    this.loadPaymentData();

    // Initialize Stripe (test key)
    this.initializeStripe();

    // Subscribe to real-time updates
    this.paymentService.getPaymentMethodsObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe(methods => {
        this.paymentMethods = methods;
        if (methods.length > 0) {
          this.testPayment.selectedMethodId = methods[0].id;
        }
        this.cd.markForCheck();
      });

    this.paymentService.getTransactionsObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe(transactions => {
        this.transactions = transactions;
        this.calculateAvailableBalance();
        this.cd.markForCheck();
      });

    this.paymentService.getPayoutsObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe(payouts => {
        this.payouts = payouts;
        this.cd.markForCheck();
      });
  }

  private initializeStripe(): void {
    // Load Stripe.js dynamically
    if (!(window as any).Stripe) {

      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.onload = () => {
        this.setupStripe();
      };
      document.head.appendChild(script);
    } else {
      this.setupStripe();
    }
  }

  private setupStripe(): void {
    // Use your Stripe publishable key (test mode)
    const stripePublishableKey = 'pk_test_51S...'; // 🔴 Replace with your actual key

    this.stripe = Stripe(stripePublishableKey);
    console.log('✅ Stripe initialized');
  }

  private setupCardElement(): void {
    if (!this.stripe) {
      console.error('❌ Stripe not initialized');
      return;
    }
    // Clean up an existing card element if present to avoid duplicates
    if (this.cardElement) {
      try {
        if (typeof this.cardElement.unmount === 'function') {
          this.cardElement.unmount();
        } else if (typeof this.cardElement.destroy === 'function') {
          this.cardElement.destroy();
        }
      } catch (e) {
        console.warn('⚠️ Error while cleaning up previous Stripe card element:', e);
      }
      this.cardElement = null;
    }

    // Create card element
    const elements = this.stripe.elements();
    this.cardElement = elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#32325d',
          '::placeholder': {
            color: '#aab7c4'
          }
        },
        invalid: {
          color: '#fa755a'
        }
      }
    });

    // Mount card element
    setTimeout(() => {
      const cardElementDiv = document.getElementById('card-element');
      if (cardElementDiv) {
        this.cardElement.mount('#card-element');
        console.log('✅ Card element mounted');
      }
    }, 100);
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPaymentData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    console.log('🔍 Loading all payment data from API...');

    this.paymentService.loadAllPaymentData().subscribe({
      next: (data) => {
        console.log('✅ Payment data loaded successfully:', data);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error loading payment data:', error);
        this.errorMessage = 'Failed to load payment data. Please check your internet connection.';
        this.isLoading = false;
      }
    });
  }

  private calculateAvailableBalance(): void {
    const earnings = this.transactions
      .filter(t => t.type === 'earning' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const completedPayouts = this.payouts
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);

    this.availableBalance = earnings - completedPayouts;
    console.log('💰 Available balance calculated:', this.availableBalance);
  }

  // ================ UI METHODS ================

  public setActiveTab(tab: 'methods' | 'transactions' | 'payouts'): void {
    this.activeTab = tab;
    this.errorMessage = '';
    this.successMessage = '';
  }

  public openAddCardModal(): void {
    this.showAddCard = true;
    setTimeout(() => {
      this.setupCardElement();
    }, 100);
  }

  public closeAddCardModal(): void {
    this.showAddCard = false;
    this.resetCardForm();
  }

  // ================ PAYMENT METHODS ================



public async addCard(): Promise<void> {
  if (!this.stripe || !this.cardElement) {
    this.errorMessage = 'Payment system not ready. Please try again.';
    return;
  }

  this.isLoading = true;
  this.errorMessage = '';

  try {
    console.log('💳 Starting card addition process...');

    // Step 1: Get setup intent from backend - FIXED
    const setupIntentResponse = await firstValueFrom(this.paymentService.getSetupIntent());

    // Check if setupIntentResponse exists
    if (!setupIntentResponse || !setupIntentResponse.data?.clientSecret) {
      this.errorMessage = 'Failed to initialize payment. Please try again.';
      this.isLoading = false;
      return;
    }

    console.log('✅ Setup intent received:', setupIntentResponse);

    // Step 2: Confirm card setup with Stripe - FIXED
    const { error, setupIntent: confirmedSetupIntent } = await this.stripe.confirmCardSetup(
      setupIntentResponse.data.clientSecret, // Now safely accessed
      {
        payment_method: {
          card: this.cardElement,
          billing_details: {
            name: this.newCard.name,
            address: {
              postal_code: this.newCard.zipCode
            }
          }
        }
      }
    );



      if (error) {
        console.error('❌ Stripe error:', error);
        this.errorMessage = error.message || 'Failed to verify card.';
        this.isLoading = false;
        return;
      }

      console.log('✅ Card verified by Stripe:', confirmedSetupIntent);

      // Step 3: Save payment method to backend
      const stripePaymentMethodId = typeof confirmedSetupIntent.payment_method === 'string'
        ? confirmedSetupIntent.payment_method
        : confirmedSetupIntent.payment_method?.id ?? '';

      if (!stripePaymentMethodId) {
        this.errorMessage = 'Payment verification failed (no payment method id).';
        this.isLoading = false;
        return;
      }

      const paymentMethodRequest: AddPaymentMethodRequest = {
        stripePaymentMethodId: stripePaymentMethodId,
        setAsDefault: this.paymentMethods.length === 0
      };

      const savedMethod = await firstValueFrom(this.paymentService.addPaymentMethod(paymentMethodRequest));
      console.log('✅ Payment method saved to backend:', savedMethod);

      this.successMessage = 'Payment method added successfully!';
      this.closeAddCardModal();
      this.isLoading = false;

      // Auto-hide success message
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);

    } catch (error: any) {
      console.error('❌ Error adding card:', error);
      this.errorMessage = error.message || 'Failed to add payment method. Please try again.';
      this.isLoading = false;
    }
  }

  public setDefaultMethod(methodId: string): void {
    if (confirm('Set this as your default payment method?')) {
      this.isLoading = true;
      this.errorMessage = '';

      this.paymentService.setDefaultPaymentMethod(methodId).subscribe({
        next: () => {
          this.successMessage = 'Default payment method updated!';
          this.isLoading = false;

          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          console.error('❌ Error setting default method:', error);
          this.errorMessage = 'Failed to set default payment method.';
          this.isLoading = false;
        }
      });
    }
  }

  public removePaymentMethod(methodId: string): void {
    if (confirm('Are you sure you want to remove this payment method?')) {
      this.isLoading = true;
      this.errorMessage = '';

      this.paymentService.removePaymentMethod(methodId).subscribe({
        next: () => {
          this.successMessage = 'Payment method removed!';
          this.isLoading = false;

          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          console.error('❌ Error removing payment method:', error);
          this.errorMessage = 'Failed to remove payment method.';
          this.isLoading = false;
        }
      });
    }
  }

  // ================ TEST PAYMENT ================

  public async processTestPayment(): Promise<void> {
    if (!this.testPayment.selectedMethodId || this.testPayment.amount <= 0) {
      this.errorMessage = 'Please select a payment method and enter amount.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      const paymentRequest: CreatePaymentIntentRequest = {
        bookingId: this.testPayment.bookingId,
        amount: this.testPayment.amount,
        currency: this.testPayment.currency || 'USD',
        paymentMethod: 'Card',
        savedPaymentMethodId: parseInt(this.testPayment.selectedMethodId),
        saveCard: false
      };

      console.log('💸 Processing test payment:', paymentRequest);

      const result = await firstValueFrom(this.paymentService.createPaymentIntent(paymentRequest));
      console.log('✅ Payment intent created:', result);

      this.successMessage = `Payment of $${this.testPayment.amount} processed successfully!`;
      this.isLoading = false;

      // Refresh transactions
      this.paymentService.getTransactions().subscribe();

      setTimeout(() => {
        this.successMessage = '';
      }, 3000);

    } catch (error: any) {
      console.error('❌ Error processing payment:', error);
      this.errorMessage = error.message || 'Payment failed. Please try again.';
      this.isLoading = false;
    }
  }

  // ================ PAYOUTS ================

  public requestPayout(): void {
    if (this.payoutAmount <= 0 || this.payoutAmount > this.availableBalance) {
      this.errorMessage = 'Please enter a valid payout amount.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.paymentService.requestPayout(this.payoutAmount).subscribe({
      next: () => {
        this.successMessage = `Payout of $${this.payoutAmount} requested successfully!`;
        this.payoutAmount = 0;
        this.isLoading = false;

        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('❌ Error requesting payout:', error);
        this.errorMessage = 'Failed to request payout. Please try again.';
        this.isLoading = false;
      }
    });
  }

  // ================ FORM VALIDATION ================

  public validateCard(): boolean {
    // Basic validation - in real app, use Stripe Elements validation
    if (!this.newCard.name.trim()) {
      this.errorMessage = 'Please enter cardholder name.';
      return false;
    }

    if (!this.newCard.zipCode || this.newCard.zipCode.length < 5) {
      this.errorMessage = 'Please enter valid ZIP code.';
      return false;
    }

    return true;
  }

  public resetCardForm(): void {
    this.newCard = {
      number: '',
      expiry: '',
      cvc: '',
      name: '',
      zipCode: ''
    };
    this.errorMessage = '';

    if (this.cardElement) {
      try {
        if (typeof this.cardElement.unmount === 'function') {
          this.cardElement.unmount();
        } else if (typeof this.cardElement.destroy === 'function') {
          this.cardElement.destroy();
        } else if (typeof this.cardElement.clear === 'function') {
          this.cardElement.clear();
        }
      } catch (e) {
        console.warn('⚠️ Error while unmounting Stripe card element:', e);
      }
      this.cardElement = null;
    }
  }

  // ================ HELPER METHODS ================

  public retryLoad(): void {
    this.errorMessage = '';
    this.loadPaymentData();
  }

  // ========== Performance helpers ==========
  trackByPaymentMethodId(index: number, item: PaymentMethod) { return item?.id; }
  trackByTransactionId(index: number, item: Transaction) { return item?.id; }
  trackByPayoutId(index: number, item: Payout) { return item?.id; }

  public filterTransactions(filter: string): void {
    this.transactionFilter = filter;
    console.log('🔍 Filtering transactions by:', filter);
  }

  public testApiConnection(): void {
    console.log('🧪 Testing API connection...');
    this.paymentService.testConnection().subscribe({
      next: (response) => {
        console.log('✅ API Connection test successful:', response);
        this.successMessage = 'API connection successful!';

        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('❌ API Connection test failed:', error);
        this.errorMessage = 'API connection failed. Please check your backend.';
      }
    });
  }

  // Format card display
  public getCardIcon(brand: string): string {
    switch(brand.toLowerCase()) {
      case 'visa': return 'fab fa-cc-visa';
      case 'mastercard': return 'fab fa-cc-mastercard';
      case 'amex':
      case 'american express': return 'fab fa-cc-amex';
      case 'discover': return 'fab fa-cc-discover';
      case 'paypal': return 'fab fa-paypal';
      default: return 'fas fa-credit-card';
    }
  }
}
