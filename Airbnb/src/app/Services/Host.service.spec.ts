/* tslint:disable:no-unused-variable */

import { TestBed, inject } from '@angular/core/testing';
import { HostService } from './Host.service';

describe('Service: Host', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HostService]
    });
  });

  it('should ...', inject([HostService], (service: HostService) => {
    expect(service).toBeTruthy();
  }));
});
