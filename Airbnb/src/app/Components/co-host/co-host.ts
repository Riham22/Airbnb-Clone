
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-cohost',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './co-host.html',
  styleUrls: ['./co-host.css']
})
export class CohostComponent {
  public searchLocation = '';
  public selectedSpecialties: string[] = [];
  public hourlyRateRange = [0, 100];
  public selectedCoHost: CoHost | null = null;

  public specialties = [
    'Guest Communication',
    'Cleaning',
    'Maintenance',
    'Check-in',
    'Marketing',
    'Pricing'
  ];

  public coHosts: CoHost[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      avatar: 'sarah.jpg',
      location: 'Los Angeles, CA',
      responseRate: 98,
      responseTime: '< 1 hour',
      languages: ['English', 'Spanish'],
      description: 'Professional co-host with 5+ years experience managing luxury properties in LA. Specialized in guest communication and premium service delivery.',
      experience: '5+ years',
      hourlyRate: 45,
      rating: 4.95,
      reviewCount: 127,
      specialties: ['Guest Communication', 'Cleaning', 'Check-in'],
      verified: true
    },
    {
      id: '2',
      name: 'Marcus Rodriguez',
      avatar: 'marcus.jpg',
      location: 'Miami, FL',
      responseRate: 95,
      responseTime: '< 2 hours',
      languages: ['English', 'Spanish', 'Portuguese'],
      description: 'Full-service co-host covering everything from guest management to maintenance. Available 24/7 for emergency support.',
      experience: '3+ years',
      hourlyRate: 35,
      rating: 4.89,
      reviewCount: 89,
      specialties: ['Maintenance', 'Guest Communication', 'Pricing'],
      verified: true
    },
    {
      id: '3',
      name: 'Emily Watson',
      avatar: 'emily.jpg',
      location: 'New York, NY',
      responseRate: 99,
      responseTime: '< 30 min',
      languages: ['English', 'French'],
      description: 'Hospitality expert focusing on creating exceptional guest experiences. Background in hotel management and luxury services.',
      experience: '7+ years',
      hourlyRate: 60,
      rating: 4.98,
      reviewCount: 203,
      specialties: ['Guest Communication', 'Marketing', 'Pricing'],
      verified: true
    }
  ];

  public get filteredCoHosts(): CoHost[] {
    return this.coHosts.filter(cohost => {
      const matchesLocation = !this.searchLocation ||
        cohost.location.toLowerCase().includes(this.searchLocation.toLowerCase());

      const matchesSpecialties = this.selectedSpecialties.length === 0 ||
        this.selectedSpecialties.every(spec => cohost.specialties.includes(spec));

      const matchesRate = cohost.hourlyRate >= this.hourlyRateRange[0] &&
        cohost.hourlyRate <= this.hourlyRateRange[1];

      return matchesLocation && matchesSpecialties && matchesRate;
    });
  }

  public toggleSpecialty(specialty: string): void {
    const index = this.selectedSpecialties.indexOf(specialty);
    if (index > -1) {
      this.selectedSpecialties.splice(index, 1);
    } else {
      this.selectedSpecialties.push(specialty);
    }
  }

  public selectCoHost(cohost: CoHost): void {
    this.selectedCoHost = cohost;
  }

  public backToList(): void {
    this.selectedCoHost = null;
  }

  public contactCoHost(cohost: CoHost): void {
    // In real app, this would open a contact form
    alert(`Opening contact form for ${cohost.name}...`);
  }

  public clearFilters(): void {
    this.searchLocation = '';
    this.selectedSpecialties = [];
    this.hourlyRateRange = [0, 100];
  }
}
