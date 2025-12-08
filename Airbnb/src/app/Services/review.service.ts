import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReviewDto {
    id: number;
    reviewerId: string;
    userName: string;
    userPhoto?: string;
    rating: number;
    comment: string;
    reviewText?: string; // For flexibility (exp review uses reviewText)
    createdAt: string;
    reviewDate?: string; // For flexibility
}

export interface ReviewSummaryDto {
    averageRating: number;
    totalReviews: number;
}

export interface CreateReviewDto {
    propertyId: number;
    rating: number;
    comment: string;
}

export interface CreateExpReviewDto {
    experienceId: number;
    rating: number;
    reviewText: string;
}

export interface CreateServiceReviewDto {
    serviceId: number;
    serviceBookingId: number;
    rating: number;
    content: string;
}

@Injectable({
    providedIn: 'root'
})
export class ReviewService {
    private apiUrl = 'https://localhost:7020/api/Reviews';
    private expApiUrl = 'https://localhost:7020/api/ExpReview';
    private serviceApiUrl = 'https://localhost:7020/api/ServiceReview';

    constructor(private http: HttpClient) { }

    // ================= Property Reviews =================
    getPropertyReviews(propertyId: number): Observable<ReviewDto[]> {
        return this.http.get<ReviewDto[]>(`${this.apiUrl}/property/${propertyId}`);
    }

    createReview(review: CreateReviewDto): Observable<any> {
        return this.http.post<any>(this.apiUrl, review);
    }

    // ================= Experience Reviews =================
    getExperienceReviews(experienceId: number): Observable<ReviewDto[]> {
        return this.http.get<ReviewDto[]>(`${this.expApiUrl}/experience/${experienceId}`);
    }

    createExperienceReview(review: CreateExpReviewDto): Observable<any> {
        return this.http.post<any>(this.expApiUrl, review);
    }

    getExperienceReviewSummary(experienceId: number): Observable<ReviewSummaryDto> {
        return this.http.get<ReviewSummaryDto>(`${this.expApiUrl}/experience/${experienceId}/summary`);
    }

    // ================= Service Reviews =================
    getServiceReviews(serviceId: number): Observable<ReviewDto[]> {
        return this.http.get<ReviewDto[]>(`${this.serviceApiUrl}/service/${serviceId}`);
    }

    createServiceReview(review: CreateServiceReviewDto): Observable<any> {
        return this.http.post<any>(this.serviceApiUrl, review);
    }

    getServiceReviewSummary(serviceId: number): Observable<ReviewSummaryDto> {
        return this.http.get<ReviewSummaryDto>(`${this.serviceApiUrl}/service/${serviceId}/summary`);
    }
}

