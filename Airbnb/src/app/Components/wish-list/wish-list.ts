// components/wishlist/wishlist.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Wishlist } from '../../Models/Wishlist';
import { Listing } from '../../Models/Listing';



@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './wish-list.html',
  styleUrls: ['./wish-list.css']
})
export class WishlistComponent implements OnInit {
  public wishlists: Wishlist[] = [];
  public selectedWishlist: Wishlist | null = null;
  public showCreateForm = false;
  public newWishlistName = '';
  public newWishlistDescription = '';
  public newWishlistIsPublic = true;

  public sampleListings: Listing[] = [
    {
      id: '1',
      title: 'Beachfront Villa with Private Pool',
      location: 'Bali, Indonesia',
      price: 245,
      rating: 4.89,
      reviewCount: 142,
      images: ['beach-villa.jpg'],
      type: 'Entire villa',
      dates: 'Apr 15-22',
      guests: 6
    },
    {
      id: '2',
      title: 'Modern Apartment in City Center',
      location: 'Tokyo, Japan',
      price: 120,
      rating: 4.95,
      reviewCount: 89,
      images: ['tokyo-apartment.jpg'],
      type: 'Entire apartment',
      dates: 'Jun 1-7',
      guests: 4
    }
  ];

  ngOnInit() {
    this.loadWishlists();
  }

  private loadWishlists(): void {
    // In real app, this would be from a service
    this.wishlists = [
      {
        id: '1',
        name: 'Beach Getaways',
        description: 'Perfect spots for summer vacations',
        isPublic: true,
        itemCount: 12,
        listings: this.sampleListings,
        createdAt: new Date('2024-01-15')
      },
      {
        id: '2',
        name: 'Mountain Cabins',
        description: 'Cozy retreats in the mountains',
        isPublic: false,
        itemCount: 8,
        listings: [],
        createdAt: new Date('2024-02-01')
      },
      {
        id: '3',
        name: 'City Breaks',
        description: 'Urban adventures around the world',
        isPublic: true,
        itemCount: 15,
        listings: [],
        createdAt: new Date('2024-01-20')
      }
    ];
  }

  public selectWishlist(wishlist: Wishlist): void {
    this.selectedWishlist = wishlist;
  }

  public backToWishlists(): void {
    this.selectedWishlist = null;
  }

  public createWishlist(): void {
    if (this.newWishlistName.trim()) {
      const newWishlist: Wishlist = {
        id: Date.now().toString(),
        name: this.newWishlistName,
        description: this.newWishlistDescription,
        isPublic: this.newWishlistIsPublic,
        itemCount: 0,
        listings: [],
        createdAt: new Date()
      };

      this.wishlists.unshift(newWishlist);
      this.cancelCreate();
    }
  }

  public cancelCreate(): void {
    this.showCreateForm = false;
    this.newWishlistName = '';
    this.newWishlistDescription = '';
    this.newWishlistIsPublic = true;
  }

  public removeFromWishlist(listingId: string): void {
    if (this.selectedWishlist) {
      this.selectedWishlist.listings = this.selectedWishlist.listings.filter(
        listing => listing.id !== listingId
      );
      this.selectedWishlist.itemCount = this.selectedWishlist.listings.length;
    }
  }

  public deleteWishlist(wishlistId: string): void {
    if (confirm('Are you sure you want to delete this wishlist?')) {
      this.wishlists = this.wishlists.filter(w => w.id !== wishlistId);
      if (this.selectedWishlist?.id === wishlistId) {
        this.selectedWishlist = null;
      }
    }
  }

  public shareWishlist(wishlist: Wishlist): void {
    // In real app, this would open share dialog
    const url = `${window.location.origin}/wishlist/${wishlist.id}`;
    navigator.clipboard.writeText(url);
    alert('Wishlist link copied to clipboard!');
  }
}
