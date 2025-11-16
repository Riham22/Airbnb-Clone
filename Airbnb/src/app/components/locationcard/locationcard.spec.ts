import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Locationcard } from './locationcard';

describe('Locationcard', () => {
  let component: Locationcard;
  let fixture: ComponentFixture<Locationcard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Locationcard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Locationcard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
