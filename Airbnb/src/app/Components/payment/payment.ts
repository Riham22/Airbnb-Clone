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
declare var Stripe: any; // Stripe.js type

const STRIPE_PUBLIC_KEY = 'pk_test_51HxxxxxxREPLACE_WITH_YOUR_KEY'; // Test key only, replace for prod!

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  constructor(private paymentService: PaymentService, private http: HttpClient) {}

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
    if (this.validateCard()) {
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
          cardLastFour: this.newCard.number.slice(-4),
          cardType: this.getCardProvider(this.newCard.number)
        }
      };

      this.paymentService.createPaymentIntent(paymentIntentData).subscribe({
        next: (paymentIntent) => {
          console.log('✅ Payment intent created:', paymentIntent.id);
          
          // Then confirm the payment with the card details
          const confirmData: ConfirmPaymentRequest = {
            paymentIntentId: paymentIntent.id,
            paymentMethodId: undefined // Will be created from card details
          };

          // In a real implementation, you would use Stripe Elements or similar
          // For now, we'll simulate adding the card
          this.simulateAddCardToBackend();
        },
        error: (error) => {
          console.error('❌ Error creating payment intent:', error);
          this.errorMessage = 'Failed to process card. Please check your details and try again.';
          this.isLoading = false;
        }
      });
    }
  }

  private simulateAddCardToBackend(): void {
    // Simulate API call - replace with actual implementation
    setTimeout(() => {
      const newMethod: PaymentMethod = {
        id: Date.now().toString(),
        type: 'card',
        lastFour: this.newCard.number.slice(-4),
        expiryDate: this.newCard.expiry,
        isDefault: this.paymentMethods.length === 0,
        provider: this.getCardProvider(this.newCard.number),
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

      this.paymentService.requestPayout(this.payoutAmount).subscribe({
        next: (newPayout) => {
          console.log('✅ Payout requested:', newPayout);
          this.successMessage = `Payout of $${this.payoutAmount} requested successfully`;
          this.payoutAmount = 0;
          this.calculateAvailableBalance();
          this.isLoading = false;
          
          // Auto-hide success message after 3 seconds
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

  payWithStripeCheckout() {
    // Example payment data—replace with real data as needed
    const bookingId = 1; // Replace with selected booking
    const amount = 100; // Replace with real amount
    const currency = 'usd'; // Should match booking/payment currency
    this.paymentService.createCheckoutSession({
      bookingId,
      amount,
      currency
    }).subscribe({
      next: async (res) => {
        const sessionId = res.sessionId;
        const stripe = (window as any).Stripe
            ? (window as any).Stripe(STRIPE_PUBLIC_KEY)
            : Stripe(STRIPE_PUBLIC_KEY);
        await stripe.redirectToCheckout({ sessionId });
      },
      error: (err) => {
        alert('Payment failed to initialize: ' + (err?.error?.message || err.message));
      }
    });
  }
}
