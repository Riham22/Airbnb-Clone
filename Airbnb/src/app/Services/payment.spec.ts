import { TestBed } from '@angular/core/testing';
import { PaymentComponent } from '../Components/payment/payment';





describe('Payment', () => {
  let service: PaymentComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaymentComponent);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
