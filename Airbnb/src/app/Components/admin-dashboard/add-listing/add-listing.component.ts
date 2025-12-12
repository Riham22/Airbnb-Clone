import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AdminService } from '../../../Services/Admin.service';

@Component({
    selector: 'app-add-listing',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './add-listing.component.html',
    styleUrls: ['./add-listing.component.css']
})
export class AddListingComponent implements OnInit {
    newListing = {
        name: '',
        description: '',
        price: 0,
        location: '',
        maxGuests: 2,
        bedrooms: 1,
        beds: 1,
        bathrooms: 1,
        propertyTypeId: null,
        propertyCategoryId: null,
        imageUrl: '',
        currency: 'USD'
    };

    propertyTypes: any[] = [];
    propertyCategories: any[] = [];
    selectedFiles: File[] = [];
    isLoading = false;

    constructor(
        private adminService: AdminService,
        private router: Router
    ) { }

    ngOnInit() {
        this.loadMetadata();
    }

    loadMetadata() {
        this.adminService.getPropertyTypes().subscribe(types => this.propertyTypes = types);
        this.adminService.getPropertyCategories().subscribe(cats => this.propertyCategories = cats);
    }

    onFileSelected(event: any) {
        if (event.target.files && event.target.files.length > 0) {
            this.selectedFiles = Array.from(event.target.files);
        }
    }

    goBack() {
        this.router.navigate(['/admin']);
    }

    onSubmit() {
        if (!this.newListing.name || !this.newListing.price || !this.newListing.location) {
            alert('Please fill in required fields');
            return;
        }

        if (this.newListing.price <= 0) {
            alert('Price must be greater than 0');
            return;
        }

        this.isLoading = true;
        const listingPayload = {
            title: this.newListing.name,
            description: this.newListing.description,
            pricePerNight: Number(this.newListing.price),
            currency: this.newListing.currency || 'USD',
            country: this.newListing.location.split(',')[1]?.trim() || 'Unknown',
            city: this.newListing.location.split(',')[0]?.trim() || 'Unknown',
            address: this.newListing.location,
            latitude: 0,
            longitude: 0,
            maxGuests: Number(this.newListing.maxGuests),
            bedrooms: Number(this.newListing.bedrooms),
            beds: Number(this.newListing.beds),
            bathrooms: Number(this.newListing.bathrooms),
            allowsPets: true,
            cancellationPolicy: 'Flexible',
            minNights: 1,
            maxNights: 30,
            propertyTypeId: Number(this.newListing.propertyTypeId),
            propertyCategoryId: Number(this.newListing.propertyCategoryId),
            subCategoryId: null,
            amenityIds: [],
            imageUrl: '',
            isPublished: false
        };

        this.adminService.createListing(listingPayload, this.selectedFiles).subscribe({
            next: () => {
                alert('Listing created successfully');
                this.isLoading = false;
                this.router.navigate(['/admin']);
            },
            error: (err) => {
                console.error('Create Listing Error:', err);
                alert(`Failed to create listing: ${err.message}`);
                this.isLoading = false;
            }
        });
    }
}
