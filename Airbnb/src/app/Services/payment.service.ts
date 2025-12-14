import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';


export interface PaymentMethodDto {
    id: number;
    cardBrand: string;
    last4Digits: string;
    expiryMonth: number;
    expiryYear: number;
    cardholderName?: string;
    isDefault: boolean;
    isActive: boolean;
    createdAt: string;
}

export interface PaymentListDto {
    id: number;
    bookingType: string;
    relatedId: number;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
}

export interface SetupIntentResponseDto {
    clientSecret: string;
    customerId: string;
}

export interface AddPaymentMethodDto {
    stripePaymentMethodId: string;
    setAsDefault: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class PaymentService {
    private apiUrl = 'https://localhost:7020/api'; // Using hardcoded URL as per other services

    constructor(private http: HttpClient) { }

    // ================= Payment Methods =================

    getPaymentMethods(): Observable<any> {
        return this.http.get<{ success: boolean, count: number, data: PaymentMethodDto[] }>(`${this.apiUrl}/PaymentMethods`);
    }

    createSetupIntent(): Observable<any> {
        return this.http.post<{ success: boolean, data: SetupIntentResponseDto }>(`${this.apiUrl}/PaymentMethods/setup-intent`, {});
    }

    addPaymentMethod(dto: AddPaymentMethodDto): Observable<any> {
        return this.http.post<{ success: boolean, data: PaymentMethodDto }>(`${this.apiUrl}/PaymentMethods`, dto);
    }

    deletePaymentMethod(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/PaymentMethods/${id}`);
    }

    setDefaultPaymentMethod(id: number): Observable<any> {
        return this.http.put<{ success: boolean, data: PaymentMethodDto }>(`${this.apiUrl}/PaymentMethods/${id}/set-default`, {});
    }

    // ================= Payment History =================

    getMyPayments(): Observable<any> {
        return this.http.get<{ success: boolean, count: number, data: PaymentListDto[] }>(`${this.apiUrl}/Payment/my-payments`);
    }
}
