// services/host.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HostStats } from '../Models/HostStats';
import { HostBooking } from '../Models/HostBooking';
import { HostListing } from '../Models/HostListing';


@Injectable({
  providedIn: 'root'
})
export class HostService {
  private statsSubject = new BehaviorSubject<HostStats>(this.getInitialStats());
  private bookingsSubject = new BehaviorSubject<HostBooking[]>(this.generateMockBookings());
  private listingsSubject = new BehaviorSubject<HostListing[]>(this.generateMockListings());

  constructor() {}

  // Stats Management
  getStats(): Observable<HostStats> {
    return this.statsSubject.asObservable();
  }

  // Bookings Management
  getBookings(): Observable<HostBooking[]> {
    return this.bookingsSubject.asObservable();
  }

  updateBookingStatus(bookingId: number, status: HostBooking['status']): void {
    const bookings = this.bookingsSubject.value.map(booking =>
      booking.id === bookingId ? { ...booking, status } : booking
    );
    this.bookingsSubject.next(bookings);
  }

  // Listings Management
  getListings(): Observable<HostListing[]> {
    return this.listingsSubject.asObservable();
  }

  createListing(listing: Omit<HostListing, 'id'>): void {
    const listings = this.listingsSubject.value;
    const newListing: HostListing = {
      ...listing,
      id: Math.max(0, ...listings.map(l => l.id)) + 1
    };
    this.listingsSubject.next([...listings, newListing]);
  }

  updateListingStatus(listingId: number, status: 'active' | 'inactive'): void {
    const listings = this.listingsSubject.value.map(listing =>
      listing.id === listingId ? { ...listing, status } : listing
    );
    this.listingsSubject.next(listings);
  }

  // Mock Data
  private getInitialStats(): HostStats {
    return {
      totalEarnings: 28450,
      monthlyEarnings: 3250,
      activeListings: 3,
      totalBookings: 47,
      occupancyRate: 78,
      averageRating: 4.8,
      responseRate: 95
    };
  }

  private generateMockBookings(): HostBooking[] {
    return [
      {
        id: 1,
        guestName: 'Michael Chen',
        guestAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
        listingName: 'Luxury Beach Villa',
        checkIn: '2024-04-15',
        checkOut: '2024-04-20',
        guests: 4,
        totalPrice: 1750,
        status: 'upcoming'
      },
      // More mock bookings...
    ];
  }

  private generateMockListings(): HostListing[] {
    return [
      {
        id: 1,
        title: 'Luxury Beach Villa',
        type: 'property',
        status: 'active',
        price: 350,
        location: 'Malibu, CA',
        rating: 4.9,
        reviewCount: 47,
        bookingsCount: 23,
        images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267']
      },
      // More mock listings...
    ];
  }
}
