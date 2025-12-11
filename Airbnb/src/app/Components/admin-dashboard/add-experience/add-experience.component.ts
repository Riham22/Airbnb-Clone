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
        expActivities: [] as any[]
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

        this.isLoading = true;
        const expPayload = {
            name: this.newExperience.name,
            description: this.newExperience.description,
            price: Number(this.newExperience.price),
            location: 'Default Location',
            maxParticipants: Number(this.newExperience.maxParticipants),
            expCatograyId: Number(this.newExperience.expCatograyId),
            expSubCatograyId: Number(this.newExperience.expSubCatograyId),
            imageUrl: '',
            expActivities: this.newExperience.expActivities,
            Status: 1 // Pending
        };

        this.adminService.createExperience(expPayload, this.selectedFiles).subscribe({
            next: () => {
                alert('Experience created successfully');
                this.isLoading = false;
                this.router.navigate(['/admin']);
            },
            error: (err) => {
                console.error('Create Experience Error:', err);
                alert(`Failed to create experience: ${err.message}`);
                this.isLoading = false;
            }
        });
    }
}
