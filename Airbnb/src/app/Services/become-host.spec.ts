import { TestBed } from '@angular/core/testing';
import { BecomeHostService } from './become-host';



describe('BecomeHost', () => {
  let service: BecomeHostService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BecomeHostService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
