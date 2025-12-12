// components/payment/payment.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  styleUrls: ['./payment.css']
})
export class PaymentComponent implements OnInit {
  public paymentMethods: PaymentMethod[] = [];
  public transactions: Transaction[] = [];
  public payouts: Payout[] = [];
  public activeTab: 'methods' | 'transactions' | 'payouts' = 'methods';
  public showAddCard = false;
  public payoutAmount = 0;
  public availableBalance = 2845.50;

  public newCard: NewCard = {
    number: '',
    expiry: '',
    cvc: '',
    name: ''
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
  }

  public setDefaultMethod(methodId: string): void {
    this.paymentMethods = this.paymentMethods.map(method => ({
      ...method,
      isDefault: method.id === methodId
    }));
  }

  public removePaymentMethod(methodId: string): void {
    if (confirm('Are you sure you want to remove this payment method?')) {
      this.paymentMethods = this.paymentMethods.filter(method => method.id !== methodId);
    }
  }

  public addCard(): void {
    if (this.validateCard()) {
      const newMethod: PaymentMethod = {
        id: Date.now().toString(),
        type: 'card',
        lastFour: this.newCard.number.slice(-4),
        expiryDate: this.newCard.expiry,
        isDefault: this.paymentMethods.length === 0,
        provider: this.getCardProvider(this.newCard.number)
      };

      this.paymentMethods = [...this.paymentMethods, newMethod];
      this.showAddCard = false;
      this.resetCardForm();
    }
  }

  public requestPayout(): void {
    if (this.payoutAmount > 0 && this.payoutAmount <= this.availableBalance) {
      const newPayout: Payout = {
        id: Date.now().toString(),
        amount: this.payoutAmount,
        date: new Date(),
        method: 'Bank Transfer',
        status: 'pending'
      };

      this.payouts = [newPayout, ...this.payouts];
      this.availableBalance -= this.payoutAmount;
      this.payoutAmount = 0;
    }
  }

  public validateCard(): boolean {
    return this.newCard.number.length === 16 &&
           /^\d+$/.test(this.newCard.number) &&
           this.validateExpiryDate(this.newCard.expiry) &&
           this.newCard.cvc.length === 3 &&
           /^\d+$/.test(this.newCard.cvc) &&
           this.newCard.name.trim().length > 0;
  }

  public resetCardForm(): void {
    this.newCard = {
      number: '',
      expiry: '',
      cvc: '',
      name: ''
    };
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
    return 'Card';
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
