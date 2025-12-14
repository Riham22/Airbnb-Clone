// components/payment/payment.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { PaymentMethod } from '../../Models/PaymentMethod';
import { Transaction } from '../../Models/Transaction';
import { Payout } from '../../Models/Payout';
import { PaymentService, PaymentIntentRequest, ConfirmPaymentRequest } from '../../Services/payment';
import { PaymentService as NewPaymentService, PaymentMethodDto } from '../../Services/payment.service';

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
  templateUrl: './payment.html',
  styleUrl: './payment.css'
})
export class PaymentComponent implements OnInit, OnDestroy {
  public paymentMethods: PaymentMethod[] = [];
  public savedPaymentMethods: PaymentMethodDto[] = []; // Saved cards from LocalStorage
  public selectedPaymentMethodId: number | null = null;
  public useNewCard = false;
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

  private destroy$ = new Subject<void>();

  constructor(
    private paymentService: PaymentService,
    private newPaymentService: NewPaymentService
  ) { }

  public ngOnInit(): void {
    this.loadSavedPaymentMethods();
    this.loadPaymentData();

    // Subscribe to real-time updates
    this.paymentService.getPaymentMethodsObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe(methods => {
        this.paymentMethods = methods;
      });

    this.paymentService.getTransactionsObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe(transactions => {
        this.transactions = transactions;
        this.calculateAvailableBalance();
      });

    this.paymentService.getPayoutsObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe(payouts => {
        this.payouts = payouts;
      });
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadSavedPaymentMethods(): void {
    // Load saved payment methods from LocalStorage
    const stored = localStorage.getItem('user_payment_methods');
    if (stored) {
      try {
        this.savedPaymentMethods = JSON.parse(stored);
        // Auto-select default method if available
        const defaultMethod = this.savedPaymentMethods.find(m => m.isDefault);
        if (defaultMethod) {
          this.selectedPaymentMethodId = defaultMethod.id;
        } else if (this.savedPaymentMethods.length > 0) {
          // Select first method if no default
          this.selectedPaymentMethodId = this.savedPaymentMethods[0].id;
        }
      } catch (e) {
        console.error('Error loading saved payment methods:', e);
        this.savedPaymentMethods = [];
      }
    }
  }

  // Update the loadPaymentData method in your component
  private loadPaymentData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    console.log('🔍 Loading all payment data from API...');

    // Use the unified load method
    this.paymentService.loadAllPaymentData().subscribe({
      next: (data) => {
        console.log('✅ Payment data loaded successfully');
        console.log(`📊 ${data.methods.length} payment methods`);
        console.log(`💳 ${data.transactions.length} transactions`);
        console.log(`💰 ${data.payouts.length} payouts`);

        // Data is already loaded into subjects via the service
        // Just calculate balance
        this.calculateAvailableBalance();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error loading payment data:', error);
        this.errorMessage = 'Failed to load payment data. Please try again.';
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

  public retryLoad(): void {
    this.errorMessage = '';
    this.loadPaymentData();
  }

  public filterTransactions(filter: string): void {
    this.transactionFilter = filter;
    console.log('🔍 Filtering transactions by:', filter);

    // In a real implementation, you would call the API with filter
    // For now, we'll just log it
  }

  public testApiConnection(): void {
    console.log('🧪 Testing API connection...');
    this.paymentService.testConnection().subscribe({
      next: (response) => {
        console.log('✅ API Connection test successful:', response);
        this.successMessage = 'API connection successful';

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
}