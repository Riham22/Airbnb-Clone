import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyCarousel } from './property-carousel';

describe('PropertyCarousel', () => {
  let component: PropertyCarousel;
  let fixture: ComponentFixture<PropertyCarousel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyCarousel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropertyCarousel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
