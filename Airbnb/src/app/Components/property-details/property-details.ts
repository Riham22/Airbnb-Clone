// property-details.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'; // Added ActivatedRoute import
import { CommonModule } from '@angular/common'; // Import CommonModule for standalone
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel
import { RentalProperty } from '../../Models/rental-property';
import { Review } from '../../Models/review'; // Import Review interface
import { Data } from '../../Services/data';


@Component({
  selector: 'app-property-details',
  standalone: true, // If using standalone component
  imports: [CommonModule, FormsModule], // Add required imports
  templateUrl: './property-details.html',
  styleUrls: ['./property-details.css']
})
export class PropertyDetailsComponent implements OnInit {
  property!: RentalProperty;
  selectedImageIndex = 0;
  showAllAmenities = false;
  checkInDate: string = ''; // Changed to string for date inputs
  checkOutDate: string = '';
  guests = 1;

  constructor(
    private route: ActivatedRoute,  
    private router: Router,
    private dataService: Data 
  ) {}

  ngOnInit() {
    const propertyId = Number(this.route.snapshot.paramMap.get('id'));
    
    // Use data service to get property by ID
    const foundProperty = this.dataService.getPropertyById(propertyId);
    
    if (foundProperty) {
      this.property = foundProperty;
    } else {
      // Fallback to first property if not found, or handle error
      const properties = this.dataService.getProperties();
      this.property = properties[0];
      
      // Optional: Redirect to home if property not found
      // this.router.navigate(['/']);
    }
  }

  selectImage(index: number) {
    this.selectedImageIndex = index;
  }

  toggleAmenities() {
    this.showAllAmenities = !this.showAllAmenities;
  }

  reserveProperty() {
    // Handle reservation logic
    if (!this.checkInDate || !this.checkOutDate) {
      alert('Please select check-in and check-out dates');
      return;
    }
    alert(`Reservation confirmed for ${this.guests} guests from ${this.checkInDate} to ${this.checkOutDate}!`);
  }

  goBack() {
    this.router.navigate(['/']);
  }

  // Helper method to calculate total price
  calculateTotalPrice(): number {
    if (!this.checkInDate || !this.checkOutDate) {
      return this.property.price;
    }
    
    const start = new Date(this.checkInDate);
    const end = new Date(this.checkOutDate);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    return (this.property.price * nights) + 80; // + cleaning and service fees
  }
}