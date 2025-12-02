import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BecomeHost } from './become-host';

describe('BecomeHost', () => {
  let component: BecomeHost;
  let fixture: ComponentFixture<BecomeHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BecomeHost]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BecomeHost);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
