// components/wishlist/wishlist.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  description: string;
  isPublic: boolean;
  itemCount: number;
  createdAt: string;
  listings: any[];
}

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './wish-list.html',
  styleUrls: ['./wish-list.css']
})
export class WishlistComponent implements OnInit, OnDestroy {
  // For the main wishlist view (your original data)
  public wishlistItems: WishlistItem[] = [];
  
  // For the wishlist management view (needed for HTML template)
  public wishlists: Wishlist[] = [];
  public selectedWishlist: Wishlist | null = null;
  public showCreateForm = false;
  public newWishlistName = '';
  public newWishlistDescription = '';
  public newWishlistIsPublic = true;
  
  public loading = false;
  public error: string | null = null;
  private subscriptions = new Subscription();

  constructor(private dataService: Data) { }

  ngOnInit() {
    this.loadWishlist();
    this.loadWishlists(); // Load wishlist collections if needed
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public loadWishlist(): void {
    this.loading = true;
    this.error = null;

    this.subscriptions.add(
      this.dataService.getWishlist().subscribe({
        next: (response: any) => {
          this.wishlistItems = response.data || response || [];
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading wishlist:', err);
          this.error = 'Failed to load wishlist. Please try again.';
          this.loading = false;
        }
      })
    );
  }

  // New methods for wishlist management
  private loadWishlists(): void {
    // If your API supports multiple wishlists, implement this
    // For now, create a default wishlist from the items
    if (this.wishlistItems.length > 0) {
      this.wishlists = [{
        id: 1,
        name: 'My Favorites',
        description: 'All my saved places',
        isPublic: false,
        itemCount: this.wishlistItems.length,
        createdAt: new Date().toISOString(),
        listings: this.wishlistItems.map(item => ({
          id: item.itemId,
          title: item.itemTitle,
          location: item.itemLocation,
          price: item.itemPrice,
          rating: item.itemRating,
          reviewCount: item.itemReviewCount,
          dates: 'Any dates',
          guests: 2
        }))
      }];
    }
  }

  public selectWishlist(wishlist: Wishlist): void {
    this.selectedWishlist = wishlist;
  }

  public backToWishlists(): void {
    this.selectedWishlist = null;
  }

  public createWishlist(): void {
    if (!this.newWishlistName.trim()) return;

    const newWishlist: Wishlist = {
      id: Date.now(), // Temporary ID
      name: this.newWishlistName,
      description: this.newWishlistDescription,
      isPublic: this.newWishlistIsPublic,
      itemCount: 0,
      createdAt: new Date().toISOString(),
      listings: []
    };

    this.wishlists.push(newWishlist);
    this.cancelCreate();
  }

  public cancelCreate(): void {
    this.showCreateForm = false;
    this.newWishlistName = '';
    this.newWishlistDescription = '';
    this.newWishlistIsPublic = true;
  }

  public shareWishlist(wishlist: Wishlist): void {
    // Implement share functionality
    if (wishlist.isPublic) {
      // Generate shareable link
      alert(`Share this wishlist: ${wishlist.name}`);
    } else {
      alert('Make wishlist public to share it');
    }
  }

  public deleteWishlist(wishlistId: number): void {
    if (confirm('Are you sure you want to delete this wishlist?')) {
      this.wishlists = this.wishlists.filter(w => w.id !== wishlistId);
      if (this.selectedWishlist?.id === wishlistId) {
        this.selectedWishlist = null;
      }
    }
  }

  public removeFromWishlist(itemId: number, itemType?: string): void {
    // For single wishlist view
    if (!itemType) {
      this.subscriptions.add(
        this.dataService.toggleWishlist('property', itemId).subscribe({
          next: (response) => {
            // Remove from local arrays
            this.wishlistItems = this.wishlistItems.filter(item => item.itemId !== itemId);
            
            // Update wishlists
            this.wishlists.forEach(wishlist => {
              wishlist.listings = wishlist.listings.filter(listing => listing.id !== itemId);
              wishlist.itemCount = wishlist.listings.length;
            });
          },
          error: (err) => {
            console.error('Error removing from wishlist:', err);
            alert('Failed to remove item. Please try again.');
          }
        })
      );
    } else {
      // For specific item type (your original method)
      this.subscriptions.add(
        this.dataService.toggleWishlist(itemType, itemId).subscribe({
          next: (response) => {
            this.wishlistItems = this.wishlistItems.filter(
              item => !(item.itemId === itemId && item.itemType === itemType)
            );
          },
          error: (err) => {
            console.error('Error removing from wishlist:', err);
            alert('Failed to remove item. Please try again.');
          }
        })
      );
    }
  }

  public getItemRoute(item: WishlistItem): string {
    const type = item.itemType.toLowerCase();
    return `/${type}/${item.itemId}`;
  }

  public formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}