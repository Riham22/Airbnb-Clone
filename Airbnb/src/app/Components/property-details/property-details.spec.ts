import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyDetailsComponent } from './property-details';

describe('PropertyDetails', () => {
  let component: PropertyDetailsComponent;
  let fixture: ComponentFixture<PropertyDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropertyDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
