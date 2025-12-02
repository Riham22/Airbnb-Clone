import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoolProduct } from './cool-product';

describe('CoolProduct', () => {
  let component: CoolProduct;
  let fixture: ComponentFixture<CoolProduct>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoolProduct]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoolProduct);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
