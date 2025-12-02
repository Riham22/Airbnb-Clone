import { Listing } from "./Listing";

export interface Wishlist {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  itemCount: number;
  listings: Listing[];
  createdAt: Date;
}
