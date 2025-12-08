import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CreateBookingDto {
    propertyId: number;
    checkInDate: string;
    checkOutDate: string;
    adults: number;
    children: number;
    infants: number;
    pets: number;
}

export interface BookingListDto {
    id: number;
    propertyId: number;
    propertyTitle: string;
    propertyCoverImage: string;
    checkInDate: string;
    checkOutDate: string;
    numberOfNights: number;
    totalPrice: number;
    currency: string;
    status: string;
    createdAt: string;
}

export interface BookingDetailsDto extends BookingListDto {
    pricePerNight: number;
    adults: number;
    children: number;
    infants: number;
    pets: number;
    hostName: string;
    propertyAddress: string;
    cancelledAt?: string;
}

@Injectable({
    providedIn: 'root'
})
export class BookingService {
    private apiUrl = 'https://localhost:7020/api/Booking';

    constructor(private http: HttpClient) { }

    getMyBookings(): Observable<any> {
        return this.http.get(`${this.apiUrl}`);
    }

    getBookingDetails(id: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/${id}`);
    }

    createBooking(data: CreateBookingDto): Observable<any> {
        return this.http.post(`${this.apiUrl}`, data);
    }

    cancelBooking(id: number): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}/cancel`, {});
    }

    getPropertyBookings(propertyId: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/property/${propertyId}`);
    }
}
