// services/location-collector.service.ts
import { Injectable } from '@angular/core';
import { Observable, combineLatest, map } from 'rxjs';
import { Data } from './data';
import { HttpClient } from '@angular/common/http';

export interface LocationOption {
  value: string;
  label: string;
  icon: string; // SVG string
  description: string;
  category: 'property' | 'experience' | 'service';
  count: number;
}

@Injectable({
  providedIn: 'root'
})
export class LocationCollectorService {
  // ستور مؤقت للـ locations
  private cachedLocations: LocationOption[] = [];
  
  constructor(
    private dataService: Data,
    private http: HttpClient
  ) {}

  /**
   * جمع الـ locations من جميع المصادر (API + Local Data)
   */
  getDynamicLocations(): Observable<LocationOption[]> {
    return combineLatest([
      this.dataService.properties$,
      this.dataService.experiences$,
      this.dataService.services$
    ]).pipe(
      map(([properties, experiences, services]) => {
        console.log('🔍 Debug - Collecting locations from data:');
        console.log('- Properties:', properties.length);
        console.log('- Experiences:', experiences.length);
        console.log('- Services:', services.length);
        
        const allLocations: Map<string, LocationOption> = new Map();

        // Process Properties
        this.processItems(properties, 'property', allLocations);
        
        // Process Experiences
        this.processItems(experiences, 'experience', allLocations);
        
        // Process Services  
        this.processItems(services, 'service', allLocations);

        // Convert Map to array and add "flexible" option
        const result = Array.from(allLocations.values())
          .sort((a, b) => b.count - a.count) // Sort by count desc
          .slice(0, 20); // Limit to top 20

        // Add "I'm flexible" option
        const flexibleOption: LocationOption = {
          value: 'flexible',
          label: "I'm flexible",
          icon: this.getFlexibleIcon(),
          description: 'Discover unique stays',
          category: 'property',
          count: properties.length + experiences.length + services.length
        };

        console.log('✅ Final locations:', result);
        this.cachedLocations = [flexibleOption, ...result];
        
        return this.cachedLocations;
      })
    );
  }

  /**
   * Process items and extract locations
   */
  private processItems(
    items: any[], 
    category: 'property' | 'experience' | 'service', 
    map: Map<string, LocationOption>
  ): void {
    if (!items || items.length === 0) {
      console.warn(`⚠️ No ${category} items found`);
      return;
    }

    items.forEach(item => {
      // Debug each item
      if (!item.location) {
        console.warn(`⚠️ Item without location:`, {
          id: item.id,
          name: item.name || item.title,
          type: category,
          fullItem: item
        });
        return;
      }

      const location = item.location.trim();
      if (!location || location === '') {
        return;
      }

      const key = location.toLowerCase();
      
      if (map.has(key)) {
        // Update existing location
        const existing = map.get(key)!;
        existing.count++;
        if (!existing.category.includes(category)) {
          existing.category += `,${category}`;
        }
      } else {
        // Add new location
        map.set(key, {
          value: this.slugify(location),
          label: location,
          icon: this.getLocationIcon(location, category),
          description: `${this.getCategoryLabel(category)} in ${location}`,
          category: category,
          count: 1
        });
      }
    });
  }

  /**
   * Get location icon based on location and category
   */
  private getLocationIcon(location: string, category: string): string {
    const lowerLocation = location.toLowerCase();
    
    // Icons by category
    const categoryIcons = {
      property: `<svg width="20" height="20" viewBox="0 0 24 24" fill="#FF385C">
        <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H6V4h12v16zM8 6h8v2H8zm0 4h8v2H8zm0 4h8v2H8z"/>
      </svg>`,
      experience: `<svg width="20" height="20" viewBox="0 0 24 24" fill="#00A699">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>`,
      service: `<svg width="20" height="20" viewBox="0 0 24 24" fill="#FFB400">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
      </svg>`
    };

    // Location-specific icons
    if (lowerLocation.includes('new york')) {
      return `<svg width="20" height="20" viewBox="0 0 24 24" fill="#FF385C">
        <path d="M18.99 11.5c.34 0 .67.03 1 .07V5.5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12.09c.81 0 1.46-.67 1.46-1.49 0-.85-.65-1.51-1.46-1.51-.81 0-1.46.66-1.46 1.51H6v-9h12.99v.5z"/>
      </svg>`;
    }

    if (lowerLocation.includes('miami') || lowerLocation.includes('beach')) {
      return `<svg width="20" height="20" viewBox="0 0 24 24" fill="#00A699">
        <path d="M13.13 14.56l1.43-1.43 5.73 5.73c.39.39.39 1.03 0 1.43-.39.39-1.03.39-1.43 0l-5.73-5.73zm4.29-5.73l1.27-1.27c.89-.89.77-2.43-.31-3.08-3.89-2.38-9.03-1.89-12.4 1.47 3.93-1.3 8.31-.25 11.44 2.88zM5.95 5.98c-3.36 3.37-3.85 8.51-1.48 12.4.65 1.08 2.19 1.21 3.08.31l1.27-1.27C5.7 14.29 4.65 9.91 5.95 5.98zm.02-.02l-.01.01c-.38 3.01 1.17 6.88 4.3 10.02l5.73-5.73c-3.13-3.13-7.01-4.68-10.02-4.3z"/>
      </svg>`;
    }

    return categoryIcons[category as keyof typeof categoryIcons] || categoryIcons.property;
  }

  private getFlexibleIcon(): string {
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="#FF385C">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
    </svg>`;
  }

  private getCategoryLabel(category: string): string {
    return {
      property: 'Properties',
      experience: 'Experiences',
      service: 'Services'
    }[category] || 'Listings';
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '_')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Debug function to check data structure
   */
  debugData(): void {
    console.log('=== DEBUG LOCATION DATA ===');
    
    this.dataService.properties$.subscribe(properties => {
      console.log('🔍 PROPERTIES:', properties);
      if (properties.length > 0) {
        console.log('First property location:', properties[0]?.location);
        console.log('First property full:', properties[0]);
      }
    });

    this.dataService.experiences$.subscribe(experiences => {
      console.log('🔍 EXPERIENCES:', experiences);
      if (experiences.length > 0) {
        console.log('First experience location:', experiences[0]?.location);
      }
    });

    this.dataService.services$.subscribe(services => {
      console.log('🔍 SERVICES:', services);
      if (services.length > 0) {
        console.log('First service location:', services[0]?.location);
      }
    });
  }
}