import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Staycard } from './staycard';

describe('Staycard', () => {
  let component: Staycard;
  let fixture: ComponentFixture<Staycard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Staycard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Staycard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
