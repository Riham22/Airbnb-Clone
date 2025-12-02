import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationFilter } from './location-filter';

describe('LocationFilter', () => {
  let component: LocationFilter;
  let fixture: ComponentFixture<LocationFilter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocationFilter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LocationFilter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
