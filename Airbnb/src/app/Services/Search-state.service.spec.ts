import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SearchStateService {
  // Track which panel is active
  private activePanelSubject = new BehaviorSubject<string | null>(null);
  activePanel$ = this.activePanelSubject.asObservable();

  // Track current filters
  private currentFiltersSubject = new BehaviorSubject<any>({
    location: '',
    dates: { start: null, end: null },
    guests: { adults: 0, children: 0, infants: 0, pets: 0 }
  });
  currentFilters$ = this.currentFiltersSubject.asObservable();

  // Methods to update state
  setActivePanel(panel: string | null) {
    this.activePanelSubject.next(panel);
  }

  setCurrentFilters(filters: any) {
    this.currentFiltersSubject.next(filters);
  }

  getCurrentFilters() {
    return this.currentFiltersSubject.value;
  }
}
