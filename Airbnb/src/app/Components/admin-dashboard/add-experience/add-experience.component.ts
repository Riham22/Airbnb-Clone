import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AdminService } from '../../../Services/Admin.service';

@Component({
    selector: 'app-add-experience',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './add-experience.component.html',
    styleUrls: ['./add-experience.component.css']
})
export class AddExperienceComponent implements OnInit {
    newExperience = {
        name: '',
        description: '',
        price: 0,
        maxParticipants: 10,
        expCatograyId: null,
        expSubCatograyId: null,
        imageUrl: '',
        expActivities: [] as any[],
        currency: 'USD'
    };

    newActivity = { name: '', describe: '', timeMinute: 60 };

    categories: any[] = [];
    subCategories: any[] = [];
    selectedFiles: File[] = [];
    isLoading = false;

    constructor(
        private adminService: AdminService,
        private router: Router
    ) { }

    ngOnInit() {
        this.adminService.getExperienceCategories().subscribe(cats => this.categories = cats);
    }

    onCategoryChange() {
        this.subCategories = [];
        this.newExperience.expSubCatograyId = null;
        if (this.newExperience.expCatograyId) {
            this.adminService.getExperienceSubCategories(this.newExperience.expCatograyId).subscribe(subs => {
                this.subCategories = subs;
            });
        }
    }

    addActivity() {
        if (!this.newActivity.name || !this.newActivity.describe) {
            alert('Please fill in Activity Name and Description');
            return;
        }
        this.newExperience.expActivities.push({ ...this.newActivity });
        this.newActivity = { name: '', describe: '', timeMinute: 60 };
    }

    removeActivity(index: number) {
        this.newExperience.expActivities.splice(index, 1);
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
        if (!this.newExperience.name || !this.newExperience.price || !this.newExperience.expCatograyId) {
            alert('Please fill in required fields');
            return;
        }

        if (this.newExperience.price <= 0) {
            alert('Price must be greater than 0');
            return;
        }

        this.isLoading = true;
        const expPayload = {
            Id: 0,
            Name: this.newExperience.name, // Required by backend
            ExpTitle: this.newExperience.name,
            Title: this.newExperience.name, // Valid backup

            ExpDescribe: this.newExperience.description,
            Description: this.newExperience.description,

            GuestPrice: Number(this.newExperience.price),
            Price: Number(this.newExperience.price),
            GroupPrice: Number(this.newExperience.price), // Fix: Database requires this field (NOT NULL)

            Currency: this.newExperience.currency || 'USD',
            Location: 'Default Location', // Consider adding a location input if needed

            MaximumGuest: Math.max(1, Number(this.newExperience.maxParticipants) || 1), // Ensure min 1

            ExpCatograyId: Number(this.newExperience.expCatograyId),
            ExpSubCatograyId: Number(this.newExperience.expSubCatograyId),
            Status: 1, // Published

            ExpActivities: this.newExperience.expActivities.map(act => ({
                Name: act.name,
                Description: act.describe,
                DurationMinutes: act.timeMinute
            }))
        };

        console.log('Creating Experience with Payload:', expPayload);

        this.adminService.createExperience(expPayload, this.selectedFiles).subscribe({
            next: () => {
                alert('Experience created successfully');
                this.isLoading = false;
                this.router.navigate(['/admin']);
            },
            error: (err) => {
                console.error('Create Experience Full Error:', err);
                const validationErrors = err.error?.errors || err.error;
                const errorMsg = JSON.stringify(validationErrors) || err.message;
                alert(`Failed to create experience: ${errorMsg}`);
                this.isLoading = false;
            }
        });
    }
}
