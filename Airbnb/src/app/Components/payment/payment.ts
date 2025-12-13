// components/payment/payment.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { PaymentMethod } from '../../Models/PaymentMethod';
import { Transaction } from '../../Models/Transaction';
import { Payout } from '../../Models/Payout';
import { PaymentService } from '../../Services/payment';
import { HttpClient } from '@angular/common/http';
import { StripeService, StripeCardComponent } from 'ngx-stripe';
import { StripeCardElementOptions, StripeElementsOptions } from '@stripe/stripe-js';
import { ViewChild } from '@angular/core';
import { NewCard } from '../../Models/NewCard';
import { PaymentIntentRequest, ConfirmPaymentRequest } from '../../Models/PaymentInterfaces';

const STRIPE_PUBLIC_KEY = 'pk_test_51HxxxxxxREPLACE_WITH_YOUR_KEY'; // Test key only, replace for prod!

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule, StripeCardComponent],
  templateUrl: './payment.html',
  styleUrl: './payment.css'
})
export class PaymentComponent implements OnInit, OnDestroy {
  public paymentMethods: PaymentMethod[] = [];
  public transactions: Transaction[] = [];
  public payouts: Payout[] = [];
  public activeTab: 'methods' | 'transactions' | 'payouts' = 'methods';
  public showAddCard = false;
  public payoutAmount = 0;
  public availableBalance = 0;
  public isLoading = false;
  public errorMessage = '';
  public successMessage = '';
  public transactionFilter = 'all';

  public newCard: NewCard = {
    number: '',
    expiry: '',
    cvc: '',
    name: '',
    zipCode: ''
  };

  @ViewChild(StripeCardComponent) card!: StripeCardComponent;

  public cardOptions: StripeCardElementOptions = {
    style: {
      base: {
        iconColor: '#666EE8',
        color: '#31325F',
        fontWeight: '300',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSize: '18px',
        '::placeholder': {
          color: '#CFD7E0'
        }
      }
    }
  };

  public elementsOptions: StripeElementsOptions = {
    locale: 'en'
  };

  constructor(private paymentService: PaymentService, private http: HttpClient, private stripeService: StripeService) { }

  public ngOnInit(): void {
    this.loadPaymentData();
    // Optionally, load Stripe.js dynamically if not in index.html
    if (!(window as any).Stripe) {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.async = true;
      document.body.appendChild(script);
    }
  }

  private loadPaymentData(): void {
    // For demo purposes - in real app, these would be API calls
    this.paymentMethods = [
      {
        id: '1',
        type: 'card',
        provider: 'Visa',
        lastFour: '1234',
        expiryDate: '12/25',
        isDefault: true
      }
    ];

    this.transactions = [
      {
        id: '1',
        type: 'earning',
        amount: 150.00,
        description: 'Booking payment',
        date: new Date('2024-01-15'),
        status: 'completed',
        bookingId: 'BKG001'
      }
    ];

    this.payouts = [
      {
        id: '1',
        amount: 500.00,
        date: new Date('2024-01-10'),
        method: 'Bank Transfer',
        status: 'completed'
      }
    ];
  }

  public setActiveTab(tab: 'methods' | 'transactions' | 'payouts'): void {
    this.activeTab = tab;
    this.errorMessage = '';
    this.successMessage = '';
  }

  public setDefaultMethod(methodId: string): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    console.log('⚙️ Setting default payment method:', methodId);

    this.paymentService.setDefaultPaymentMethod(methodId).subscribe({
      next: () => {
        console.log('✅ Default payment method updated');
        this.successMessage = 'Default payment method updated successfully';
        this.isLoading = false;

        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('❌ Error setting default payment method:', error);
        this.errorMessage = 'Failed to set default payment method. Please try again.';
        this.isLoading = false;
      }
    });
  }

  public removePaymentMethod(methodId: string): void {
    if (confirm('Are you sure you want to remove this payment method? This action cannot be undone.')) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      console.log('🗑️ Removing payment method:', methodId);

      this.paymentService.removePaymentMethod(methodId).subscribe({
        next: () => {
          console.log('✅ Payment method removed');
          this.successMessage = 'Payment method removed successfully';
          this.isLoading = false;

          // Auto-hide success message after 3 seconds
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          console.error('❌ Error removing payment method:', error);
          this.errorMessage = 'Failed to remove payment method. Please try again.';
          this.isLoading = false;
        }
      });
    }
  }

  public addCard(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    console.log('💳 Adding new payment card...');

    // First, create a payment intent
    const paymentIntentData: PaymentIntentRequest = {
      amount: 100, // $1.00 authorization charge
      currency: 'USD',
      paymentMethodType: 'card',
      metadata: {
        // Metadata will be populated by Stripe
      }
    };

    this.paymentService.createPaymentIntent(paymentIntentData).subscribe({
      next: (paymentIntent) => {
        console.log('✅ Payment intent created:', paymentIntent.id);

        // Confirm the payment with the card element
        this.stripeService.confirmCardPayment(paymentIntent.client_secret, {
          payment_method: {
            card: this.card.element,
            billing_details: {
              name: this.newCard.name,
            },
          },
        }).subscribe({
          next: (result) => {
            if (result.error) {
              console.error('❌ Error confirming payment:', result.error);
              this.errorMessage = result.error.message || 'Payment failed';
              this.isLoading = false;
            } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
              console.log('✅ Payment confirmed');
              // In a real app, you would save the payment method ID to your backend here
              // For now, we'll simulate adding it to the list
              this.simulateAddCardToBackend(result.paymentIntent.payment_method as string);
            }
          },
          error: (error) => {
            console.error('❌ Error confirming card payment:', error);
            this.errorMessage = 'Failed to process card. Please try again.';
            this.isLoading = false;
          }
        });
      },
      error: (error) => {
        console.error('❌ Error creating payment intent:', error);
        this.errorMessage = 'Failed to process card. Please check your details and try again.';
        this.isLoading = false;
      }
    });
  }

  private simulateAddCardToBackend(paymentMethodId?: string): void {
    // Simulate API call - replace with actual implementation
    setTimeout(() => {
      const newMethod: PaymentMethod = {
        id: paymentMethodId || Date.now().toString(),
        type: 'card',
        lastFour: '4242', // Mock for now, would come from API
        expiryDate: '12/25', // Mock for now
        isDefault: this.paymentMethods.length === 0,
        provider: 'Visa', // Mock for now
        cardHolderName: this.newCard.name
      };

      // Update local state (in real app, this would come from API response)
      this.paymentMethods = [...this.paymentMethods, newMethod];
      this.paymentService['paymentMethodsSubject'].next(this.paymentMethods);

      console.log('✅ Card added successfully');
      this.successMessage = 'Payment method added successfully';
      this.showAddCard = false;
      this.resetCardForm();
      this.isLoading = false;

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    }, 1500);
  }

  public requestPayout(): void {
    if (this.payoutAmount > 0 && this.payoutAmount <= this.availableBalance) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      console.log('💰 Requesting payout:', this.payoutAmount);

      this.paymentService.requestPayout(this.payoutAmount);

      // Since requestPayout is void and updates subject, we can assume success or listen to subject
      // For now, we'll assume success as per previous implementation logic
      console.log('✅ Payout requested');
      this.successMessage = `Payout of $${this.payoutAmount} requested successfully`;
      this.payoutAmount = 0;
      this.calculateAvailableBalance();
      this.isLoading = false;

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    } else if (this.payoutAmount > this.availableBalance) {
      this.errorMessage = 'Payout amount cannot exceed available balance';
    }
  }

  public validateCard(): boolean {
    const isValid = this.newCard.number.length === 16 &&
      /^\d+$/.test(this.newCard.number) &&
      this.validateExpiryDate(this.newCard.expiry) &&
      this.newCard.cvc.length === 3 &&
      /^\d+$/.test(this.newCard.cvc) &&
      this.newCard.name.trim().length > 0;

    if (!isValid) {
      this.errorMessage = 'Please check your card details and try again';
    }

    return isValid;
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
  }

  private validateExpiryDate(expiry: string): boolean {
    if (expiry.length !== 5 || !expiry.includes('/')) {
      return false;
    }

    const [month, year] = expiry.split('/').map(Number);
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;

    return month >= 1 && month <= 12 &&
      year >= currentYear &&
      (year > currentYear || month >= currentMonth);
  }

  private getCardProvider(cardNumber: string): string {
    if (cardNumber.startsWith('4')) return 'Visa';
    if (cardNumber.startsWith('5')) return 'Mastercard';
    if (cardNumber.startsWith('34') || cardNumber.startsWith('37')) return 'American Express';
    if (cardNumber.startsWith('6')) return 'Discover';
    return 'Credit Card';
  }

  public ngOnDestroy(): void {
    // Clean up subscriptions if needed
  }

  private calculateAvailableBalance(): void {
    // Calculate balance from transactions
    const earnings = this.transactions
      .filter(t => t.type === 'earning' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const payouts = this.payouts
      .filter(p => p.status === 'completed' || p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0);

    this.availableBalance = earnings - payouts;
  }
}
