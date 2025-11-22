import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmenitiesFilter } from './amenities-filter';

describe('AmenitiesFilter', () => {
  let component: AmenitiesFilter;
  let fixture: ComponentFixture<AmenitiesFilter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AmenitiesFilter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AmenitiesFilter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
