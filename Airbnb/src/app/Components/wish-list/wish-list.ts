import { Component, OnInit, OnDestroy } from '@angular/core';
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

  constructor(private dataService: Data) { }

  ngOnInit() {
    this.loadWishlists();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private loadWishlists(): void {
    this.loading = true;
    this.subscriptions.add(
      this.dataService.getWishlist().subscribe({
        next: (response: any) => {
          const items: WishlistItem[] = response.data || response || [];

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
        },
        error: (err) => {
          console.error('Error loading wishlist:', err);
          this.loading = false;
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