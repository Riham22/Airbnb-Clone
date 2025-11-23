// services/admin.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { AdminStats } from '../Models/AdminStats';
import { AdminUser } from '../Models/AdminUser';
import { AdminListing } from '../Models/AdminListing';


@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private statsSubject = new BehaviorSubject<AdminStats>(this.getInitialStats());
  private usersSubject = new BehaviorSubject<AdminUser[]>(this.generateMockUsers());
  private listingsSubject = new BehaviorSubject<AdminListing[]>(this.generateMockListings());

  constructor() {}

  // Stats Management
  getStats(): Observable<AdminStats> {
    return this.statsSubject.asObservable();
  }

  updateStats(updates: Partial<AdminStats>): void {
    const current = this.statsSubject.value;
    this.statsSubject.next({ ...current, ...updates });
  }

  // Users Management
  getUsers(): Observable<AdminUser[]> {
    return this.usersSubject.asObservable();
  }

  updateUserStatus(userId: number, status: 'active' | 'suspended'): void {
    const users = this.usersSubject.value.map(user =>
      user.id === userId ? { ...user, status } : user
    );
    this.usersSubject.next(users);
  }

  // Listings Management
  getListings(): Observable<AdminListing[]> {
    return this.listingsSubject.asObservable();
  }

  updateListingStatus(listingId: number, status: 'active' | 'suspended' | 'pending'): void {
    const listings = this.listingsSubject.value.map(listing =>
      listing.id === listingId ? { ...listing, status } : listing
    );
    this.listingsSubject.next(listings);
  }

  // Mock Data Generators
  private getInitialStats(): AdminStats {
    return {
      totalUsers: 1250,
      totalListings: 543,
      totalBookings: 2897,
      totalRevenue: 154230,
      pendingVerifications: 23,
      activeHosts: 287,
      monthlyGrowth: 12.5
    };
  }

  private generateMockUsers(): AdminUser[] {
    return [
      {
        id: 1,
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'host',
        joinedDate: '2024-01-15',
        status: 'active',
        listingsCount: 3,
        bookingsCount: 12
      },
      {
        id: 2,
        email: 'sarah.smith@example.com',
        firstName: 'Sarah',
        lastName: 'Smith',
        role: 'guest',
        joinedDate: '2024-02-20',
        status: 'active',
        listingsCount: 0,
        bookingsCount: 5
      },
      // Add more mock users...
    ];
  }

  private generateMockListings(): AdminListing[] {
    return [
      {
        id: 1,
        title: 'Luxury Beach Villa',
        host: 'John Doe',
        type: 'property',
        status: 'active',
        price: 350,
        location: 'Malibu, CA',
        rating: 4.9,
        reviewCount: 47,
        createdAt: '2024-01-20',
        lastBooking: '2024-03-15'
      },
      // Add more mock listings...
    ];
  }
}
