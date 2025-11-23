import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CohostComponent } from './co-host';

describe('CoHost', () => {
  let component: CohostComponent;
  let fixture: ComponentFixture<CohostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CohostComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CohostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
