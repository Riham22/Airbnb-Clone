import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { Data } from '../../Services/data';

interface WishlistItem {
  id: number;
  itemType: string;
  itemId: number;
  itemTitle: string;
  itemLocation: string;
  itemPrice: number;
  itemRating: number;
  itemReviewCount: number;
  itemImageUrl: string;
  addedAt: string;
}

interface Wishlist {
  id: number;
  name: string;
  coverImage?: string;
  itemCount: number;
  listings: WishlistItem[];
}

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './wish-list.html',
  styleUrls: ['./wish-list.css']
})
export class WishlistComponent implements OnInit, OnDestroy {
  public wishlists: Wishlist[] = [];
  public selectedWishlist: Wishlist | null = null;
  public loading = false;
  private subscriptions = new Subscription();

  constructor(
    private dataService: Data,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadWishlists();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private loadWishlists(): void {
    this.loading = true;
    console.log('📋 Loading wishlists...');

    // Safety timeout
    const timeout = setTimeout(() => {
      if (this.loading) {
        this.loading = false;
        console.warn('⏱️ Wishlist load timed out');
        this.cdr.detectChanges();
      }
    }, 10000);

    this.subscriptions.add(
      this.dataService.getWishlist().subscribe({
        next: (response: any) => {
          clearTimeout(timeout);
          console.log('✅ Wishlist loaded:', response);
          const rawItems = response.data || response || [];

          // Map backend fields to frontend interface
          const items: WishlistItem[] = Array.isArray(rawItems) ? rawItems.map((item: any) => ({
            id: item.id || item.Id,
            itemType: item.itemType || item.ItemType,
            itemId: item.itemId || item.ItemId,
            itemTitle: item.itemTitle || item.title || item.Title || 'Untitled',
            itemLocation: item.itemLocation || item.location || item.Location || '',
            itemPrice: item.itemPrice || item.price || item.Price || 0,
            itemRating: item.itemRating || item.rating || item.Rating || 0,
            itemReviewCount: item.itemReviewCount || item.reviewsCount || item.ReviewsCount || 0,
            itemImageUrl: item.itemImageUrl || item.coverImage || item.CoverImage || '',
            addedAt: item.addedAt || item.CreatedAt || new Date().toISOString()
          })) : [];

          // Group items into a "My Favorites" wishlist for now
          // In a real app, you'd fetch multiple wishlists
          if (items.length > 0) {
            this.wishlists = [{
              id: 1,
              name: 'My favorites',
              coverImage: items[0].itemImageUrl,
              itemCount: items.length,
              listings: items
            }];
          } else {
            this.wishlists = [];
          }
          this.loading = false;
          this.cdr.detectChanges(); // Force update
        },
        error: (err) => {
          clearTimeout(timeout);
          console.error('❌ Error loading wishlist:', err);
          this.loading = false;
          this.cdr.detectChanges(); // Force update
        }
      })
    );
  }

  public openWishlist(wishlist: Wishlist): void {
    this.selectedWishlist = wishlist;
  }

  public backToAll(): void {
    this.selectedWishlist = null;
  }

  public removeFromWishlist(itemId: number, event: Event): void {
    event.stopPropagation();
    // Implementation for removing item
    this.subscriptions.add(
      this.dataService.toggleWishlist('property', itemId).subscribe({
        next: () => {
          if (this.selectedWishlist) {
            this.selectedWishlist.listings = this.selectedWishlist.listings.filter(item => item.itemId !== itemId);
            this.selectedWishlist.itemCount = this.selectedWishlist.listings.length;

            // Update main list too
            const wishlist = this.wishlists.find(w => w.id === this.selectedWishlist!.id);
            if (wishlist) {
              wishlist.listings = this.selectedWishlist.listings;
              wishlist.itemCount = this.selectedWishlist.itemCount;
            }
          }
        },
        error: (err) => console.error('Error removing item', err)
      })
    );
  }
}