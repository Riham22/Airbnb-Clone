import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewService } from '../../../Services/review.service';

@Component({
    selector: 'app-review-form',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="review-form my-6 p-6 border rounded-xl shadow-sm bg-white">
      <h3 class="text-lg font-semibold mb-4">Leave a Review</h3>
      
      <div class="mb-4">
        <label class="block text-sm font-medium mb-1">Rating</label>
        <div class="flex gap-2">
          <button *ngFor="let star of [1,2,3,4,5]" 
                  (click)="rating = star"
                  class="text-2xl focus:outline-none transition-transform active:scale-90"
                  [class.text-yellow-400]="star <= rating"
                  [class.text-gray-300]="star > rating">
            ★
          </button>
        </div>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium mb-1">Comment</label>
        <textarea [(ngModel)]="comment" 
                  rows="4" 
                  class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
                  placeholder="Share your experience..."></textarea>
      </div>

      <div *ngIf="errorMessage" class="text-red-500 mb-3 text-sm">
        {{ errorMessage }}
      </div>
       <div *ngIf="successMessage" class="text-green-500 mb-3 text-sm">
        {{ successMessage }}
      </div>

      <button (click)="submitReview()" 
              [disabled]="isSubmitting || rating === 0 || !comment.trim()"
              class="bg-rose-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        {{ isSubmitting ? 'Submitting...' : 'Submit Review' }}
      </button>
    </div>
  `,
    styles: []
})
export class ReviewFormComponent {
    @Input() itemId!: number;
    @Input() type: 'property' | 'experience' | 'service' = 'property';
    @Input() bookingId?: number; // Required for Services, maybe properties?

    @Output() reviewSubmitted = new EventEmitter<void>();

    rating: number = 0;
    comment: string = '';
    isSubmitting: boolean = false;
    errorMessage: string = '';
    successMessage: string = '';

    constructor(private reviewService: ReviewService) { }

    submitReview() {
        if (this.rating === 0) {
            this.errorMessage = 'Please select a rating';
            return;
        }

        this.isSubmitting = true;
        this.errorMessage = '';
        this.successMessage = '';

        let request;

        if (this.type === 'property') {
            request = this.reviewService.createReview({
                propertyId: this.itemId,
                rating: this.rating,
                comment: this.comment
            });
        } else if (this.type === 'experience') {
            request = this.reviewService.createExperienceReview({
                experienceId: this.itemId,
                rating: this.rating,
                reviewText: this.comment
            });
        } else {
            // Services require bookingID
            if (!this.bookingId) {
                this.errorMessage = 'Booking ID is required for service reviews.';
                this.isSubmitting = false;
                return;
            }
            request = this.reviewService.createServiceReview({
                serviceId: this.itemId,
                serviceBookingId: this.bookingId,
                rating: this.rating,
                content: this.comment
            });
        }

        request.subscribe({
            next: () => {
                this.isSubmitting = false;
                this.comment = '';
                this.rating = 0;
                this.successMessage = 'Review submitted successfully!';
                this.reviewSubmitted.emit();
                setTimeout(() => this.successMessage = '', 3000);
            },
            error: (err) => {
                this.isSubmitting = false;
                console.error(err);
                this.errorMessage = err.error?.message || 'Failed to submit review. Please try again.';
            }
        });
    }
}
