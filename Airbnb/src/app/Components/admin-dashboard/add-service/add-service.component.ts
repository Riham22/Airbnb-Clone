import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AdminService } from '../../../Services/Admin.service';

@Component({
    selector: 'app-add-service',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './add-service.component.html',
    styleUrls: ['./add-service.component.css']
})
export class AddServiceComponent implements OnInit {
    newService = {
        title: '',
        description: '',
        price: 0,
        country: '',
        city: '',
        address: '',
        serviceCategoryId: null,
        imageUrl: '',
        currency: 'USD'
    };

    serviceCategories: any[] = [];
    selectedFiles: File[] = [];
    isLoading = false;

    constructor(
        private adminService: AdminService,
        private router: Router
    ) { }

    ngOnInit() {
        this.adminService.getServiceCategories().subscribe(cats => this.serviceCategories = cats);
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
        if (!this.newService.title || !this.newService.price || !this.newService.serviceCategoryId || !this.newService.country || !this.newService.city) {
            alert('Please fill in required fields (Title, Price, Category, Country, City)');
            return;
        }

        if (this.newService.price <= 0) {
            alert('Price must be greater than 0');
            return;
        }

        this.isLoading = true;
        const servicePayload = {
            title: this.newService.title,
            description: this.newService.description,
            price: Number(this.newService.price),
            country: this.newService.country,
            city: this.newService.city,
            address: this.newService.address,
            serviceCategoryId: Number(this.newService.serviceCategoryId),
            imageUrl: '',
            currency: this.newService.currency,
            pricingType: 'PerHour' // Default value matching backend
        };

        console.log('Component Submitting Service Payload:', servicePayload);

        this.adminService.createService(servicePayload, this.selectedFiles).subscribe({
            next: () => {
                alert('Service created successfully');
                this.isLoading = false;
                this.router.navigate(['/admin']);
            },
            error: (err) => {
                console.error('Create Service Error:', err);
                alert(`Failed to create service: ${err.message}`);
                this.isLoading = false;
            }
        });
    }
}
