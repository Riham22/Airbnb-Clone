/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { LocationCollectorService } from './location-collector.service';

describe('Service: LocationCollector', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LocationCollectorService]
    });
  });

  it('should ...', inject([LocationCollectorService], (service: LocationCollectorService) => {
    expect(service).toBeTruthy();
  }));
});
