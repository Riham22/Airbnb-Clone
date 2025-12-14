import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PaymentComponent } from './payment';
import { PaymentService } from '../../Services/payment';

describe('PaymentComponent', () => {
  let component: PaymentComponent;
  let fixture: ComponentFixture<PaymentComponent>;
  let paymentServiceSpy: jasmine.SpyObj<PaymentService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('PaymentService', [
      'getSetupIntent',
      'addPaymentMethod',
      'getPaymentMethodsObservable',
      'getTransactionsObservable',
      'getPayoutsObservable',
      'loadAllPaymentData',
      'createPaymentIntent',
      'getTransactions'
    ]);

    await TestBed.configureTestingModule({
      imports: [PaymentComponent],
      providers: [{ provide: PaymentService, useValue: spy }]
    }).compileComponents();

    paymentServiceSpy = TestBed.inject(PaymentService) as jasmine.SpyObj<PaymentService>;

    // Default spies
    paymentServiceSpy.getSetupIntent.and.returnValue(of({ data: { clientSecret: 'sk_test_secret' } } as any));
    paymentServiceSpy.addPaymentMethod.and.returnValue(of({ id: 1 } as any));
    paymentServiceSpy.getPaymentMethodsObservable.and.returnValue(of([]));
    paymentServiceSpy.getTransactionsObservable.and.returnValue(of([]));
    paymentServiceSpy.getPayoutsObservable.and.returnValue(of([]));
    paymentServiceSpy.loadAllPaymentData.and.returnValue(of({} as any));

    // Provide a global Stripe stub so the component doesn't inject script tag
    (window as any).Stripe = (key: string) => ({
      confirmCardSetup: (_clientSecret: string, _opts: any) => Promise.resolve({ setupIntent: { payment_method: 'pm_123' } }),
      elements: () => ({ create: () => ({ mount: () => {}, unmount: () => {} }) })
    });

    fixture = TestBed.createComponent(PaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('adds a card successfully when setup intent and stripe confirm succeed', async () => {
    component.cardElement = {} as any; // a truthy placeholder
    await component.addCard();

    expect(paymentServiceSpy.getSetupIntent).toHaveBeenCalled();
    expect(paymentServiceSpy.addPaymentMethod).toHaveBeenCalledWith(jasmine.objectContaining({ stripePaymentMethodId: 'pm_123' }));
    expect(component.successMessage).toContain('Payment method added successfully');
    expect(component.isLoading).toBeFalse();
  });

  it('handles missing client secret from setup intent', async () => {
    paymentServiceSpy.getSetupIntent.and.returnValue(of({} as any));
    component.cardElement = {} as any;

    await component.addCard();

    expect(component.errorMessage).toContain('Failed to initialize payment');
    expect(component.isLoading).toBeFalse();
  });
});
