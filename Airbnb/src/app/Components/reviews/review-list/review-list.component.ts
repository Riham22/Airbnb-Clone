import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewService, ReviewDto } from '../../../Services/review.service';

@Component({
    selector: 'app-review-list',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="reviews-container">
      <h3 class="text-xl font-semibold mb-4">Reviews ({{ reviews.length }})</h3>
      
      <div *ngIf="loading" class="text-gray-500">Loading reviews...</div>
      
      <div *ngIf="!loading && reviews.length === 0" class="text-gray-500">
        No reviews yet. Be the first to review!
      </div>

      <div class="reviews-grid grid grid-cols-1 md:grid-cols-2 gap-6" *ngIf="!loading && reviews.length > 0">
        <div *ngFor="let review of reviews" class="review-card">
          <div class="header flex items-center gap-3 mb-2">
            <img [src]="review.userPhoto || 'assets/user-placeholder.png'" 
                 class="w-10 h-10 rounded-full object-cover" 
                 alt="User">
            <div>
              <div class="font-medium">{{ review.userName || 'Anonymous' }}</div>
              <div class="text-sm text-gray-500">
                {{ (review.createdAt || review.reviewDate) | date:'mediumDate' }}
              </div>
            </div>
          </div>
          <div class="rating flex text-yellow-500 mb-2">
             <span *ngFor="let star of [1,2,3,4,5]">
               <svg *ngIf="star <= review.rating" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
                 <path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clip-rule="evenodd" />
               </svg>
             </span>
          </div>
          <p class="text-gray-700 leading-relaxed text-sm">
            {{ review.comment || review.reviewText }}
          </p>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .reviews-container {
      padding: 2rem 0;
      border-top: 1px solid #e0e0e0;
      margin-top: 2rem;
    }
  `]
})
export class ReviewListComponent implements OnInit, OnChanges {
    @Input() itemId!: number;
    @Input() type: 'property' | 'experience' | 'service' = 'property';

    reviews: ReviewDto[] = [];
    loading: boolean = false;

    constructor(private reviewService: ReviewService) { }

    ngOnInit() {
        this.fetchReviews();
    }

    ngOnChanges() {
        if (this.itemId) {
            this.fetchReviews();
        }
    }

    fetchReviews() {
        this.loading = true;
        let request;

        if (this.type === 'property') {
            request = this.reviewService.getPropertyReviews(this.itemId);
        } else if (this.type === 'experience') {
            request = this.reviewService.getExperienceReviews(this.itemId);
        } else {
            request = this.reviewService.getServiceReviews(this.itemId);
        }

        request.subscribe({
            next: (data) => {
                this.reviews = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error fetching reviews:', err);
                this.loading = false;
            }
        });
    }
}
