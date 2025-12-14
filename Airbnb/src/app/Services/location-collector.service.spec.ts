import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { LocationCollectorService } from './location-collector.service';
import { Data } from './data';

describe('LocationCollectorService', () => {
  let service: LocationCollectorService;

  // Create stubs for Data service subjects
  const propertiesSubject = new BehaviorSubject<any[]>([]);
  const experiencesSubject = new BehaviorSubject<any[]>([]);
  const servicesSubject = new BehaviorSubject<any[]>([]);

  const dataStub = {
    properties$: propertiesSubject.asObservable(),
    experiences$: experiencesSubject.asObservable(),
    services$: servicesSubject.asObservable()
  } as unknown as Data;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LocationCollectorService,
        { provide: Data, useValue: dataStub }
      ]
    });

    service = TestBed.inject(LocationCollectorService);
  });

  it('should aggregate locations and include flexible option', async () => {
    propertiesSubject.next([
      { id: 1, location: 'New York, USA', name: 'Prop A' },
      { id: 2, location: 'Miami, USA', name: 'Prop B' }
    ]);

    experiencesSubject.next([
      { id: 3, location: 'New York, USA', title: 'Exp A' }
    ]);

    servicesSubject.next([
      { id: 4, location: 'Miami, USA', name: 'Svc A' },
      { id: 5, location: 'Miami, USA', name: 'Svc B' }
    ]);

    const locations = await firstValueFrom(service.getDynamicLocations());

    // First option should be the flexible one
    expect(locations.length).toBeGreaterThan(0);
    expect(locations[0].value).toBe('flexible');

    // Find New York and Miami
    const ny = locations.find(l => l.label.includes('New York'));
    const miami = locations.find(l => l.label.includes('Miami'));

    expect(ny).toBeTruthy();
    expect(ny!.count).toBe(2); // property + experience

    expect(miami).toBeTruthy();
    expect(miami!.count).toBe(3); // 1 property + 2 services
  });

  it('should skip items without location', async () => {
    propertiesSubject.next([]);
    experiencesSubject.next([{ id: 7, name: 'NoLoc' } as any]);
    servicesSubject.next([]);

    const locations = await firstValueFrom(service.getDynamicLocations());
    // Only flexible option should exist
    expect(locations.length).toBeGreaterThan(0);
    const nonFlexible = locations.filter(l => l.value !== 'flexible');
    expect(nonFlexible.length).toBe(0);
  });
});
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
