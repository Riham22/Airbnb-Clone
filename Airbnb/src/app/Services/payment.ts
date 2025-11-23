// services/payment.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PaymentMethod } from '../Models/PaymentMethod';
import { Transaction } from '../Models/Transaction';
import { Payout } from '../Models/Payout';


@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private paymentMethodsSubject = new BehaviorSubject<PaymentMethod[]>(this.getMockPaymentMethods());
  private transactionsSubject = new BehaviorSubject<Transaction[]>(this.getMockTransactions());
  private payoutsSubject = new BehaviorSubject<Payout[]>(this.getMockPayouts());

  constructor() {}

  getPaymentMethods(): Observable<PaymentMethod[]> {
    return this.paymentMethodsSubject.asObservable();
  }

  addPaymentMethod(method: Omit<PaymentMethod, 'id'>): void {
    const methods = this.paymentMethodsSubject.value;
    const newMethod: PaymentMethod = {
      ...method,
      id: (Math.max(0, ...methods.map(m => parseInt(m.id))) + 1).toString()
    };
    this.paymentMethodsSubject.next([...methods, newMethod]);
  }

  setDefaultPaymentMethod(methodId: string): void {
    const methods = this.paymentMethodsSubject.value.map(method => ({
      ...method,
      isDefault: method.id === methodId
    }));
    this.paymentMethodsSubject.next(methods);
  }

  removePaymentMethod(methodId: string): void {
    const methods = this.paymentMethodsSubject.value.filter(m => m.id !== methodId);
    this.paymentMethodsSubject.next(methods);
  }

  getTransactions(): Observable<Transaction[]> {
    return this.transactionsSubject.asObservable();
  }

  getPayouts(): Observable<Payout[]> {
    return this.payoutsSubject.asObservable();
  }

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

  private getMockPaymentMethods(): PaymentMethod[] {
    return [
      {
        id: '1',
        type: 'card',
        lastFour: '4242',
        expiryDate: '12/25',
        isDefault: true,
        provider: 'Visa'
      },
      {
        id: '2',
        type: 'paypal',
        isDefault: false,
        provider: 'PayPal'
      }
    ];
  }

  private getMockTransactions(): Transaction[] {
    return [
      {
        id: '1',
        date: new Date('2024-03-15'),
        description: 'Beach Villa Booking',
        amount: 350,
        type: 'earning',
        status: 'completed',
        bookingId: '123'
      },
      {
        id: '2',
        date: new Date('2024-03-10'),
        description: 'Mountain Cabin Booking',
        amount: 275,
        type: 'earning',
        status: 'completed',
        bookingId: '124'
      }
    ];
  }

  private getMockPayouts(): Payout[] {
    return [
      {
        id: '1',
        date: new Date('2024-03-01'),
        amount: 2845,
        method: 'Bank Transfer',
        status: 'completed'
      },
      {
        id: '2',
        date: new Date('2024-02-15'),
        amount: 1500,
        method: 'PayPal',
        status: 'completed'
      }
    ];
  }
}
