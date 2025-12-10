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
        name: '',
        description: '',
        price: 0,
        location: '',
        serviceCategoryId: null,
        imageUrl: ''
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
        if (!this.newService.name || !this.newService.price || !this.newService.serviceCategoryId) {
            alert('Please fill in required fields');
            return;
        }

        this.isLoading = true;
        const servicePayload = {
            name: this.newService.name,
            description: this.newService.description,
            price: Number(this.newService.price),
            location: this.newService.location,
            serviceCategoryId: Number(this.newService.serviceCategoryId),
            imageUrl: ''
        };

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
