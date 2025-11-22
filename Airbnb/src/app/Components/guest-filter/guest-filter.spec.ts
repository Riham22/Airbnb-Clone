import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuestFilter } from './guest-filter';

describe('GuestFilter', () => {
  let component: GuestFilter;
  let fixture: ComponentFixture<GuestFilter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuestFilter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuestFilter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
