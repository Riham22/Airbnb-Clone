import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-category-bar',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './category-bar.component.html',
    styleUrl: './category-bar.component.css'
})
export class CategoryBarComponent {
    @Output() categorySelect = new EventEmitter<string>();
    @Output() openFilters = new EventEmitter<void>();

    selectedCategory: string = 'Icons';

    categories = [
        { name: 'Icons', icon: 'https://a0.muscache.com/pictures/3b1eb541-46d9-4bef-abc4-c37d77e3c21b.jpg' },
        { name: 'Castles', icon: 'https://a0.muscache.com/pictures/1b6a8b70-a3b6-48b5-88e1-2243d9172c06.jpg' },
        { name: 'Amazing pools', icon: 'https://a0.muscache.com/pictures/3fb523a0-b622-4368-8142-b5e03df7549b.jpg' },
        { name: 'Farms', icon: 'https://a0.muscache.com/pictures/aaa02c2d-9f0d-4c41-878a-68c12ec6c6bd.jpg' },
        { name: 'Beachfront', icon: 'https://a0.muscache.com/pictures/bcd1adc0-5cee-4d7a-85ec-f6730b0f8d0c.jpg' },
        { name: 'Islands', icon: 'https://a0.muscache.com/pictures/8e507f16-7b43-4722-b59d-1e9fe29f71ae.jpg' },
        { name: 'Luxe', icon: 'https://a0.muscache.com/pictures/c8e2ed05-c666-47b6-99fc-4cb6edcde6b4.jpg' },
        { name: 'Mansions', icon: 'https://a0.muscache.com/pictures/78ba8486-6ba6-4a43-a56d-f556189193da.jpg' },
        { name: 'Lakefront', icon: 'https://a0.muscache.com/pictures/677a041d-7264-4c45-bb72-52bff21eb6e8.jpg' },
        { name: 'Treehouses', icon: 'https://a0.muscache.com/pictures/4d4a4eba-c7e4-43eb-9ce2-95e1d200d10e.jpg' },
        { name: 'Camping', icon: 'https://a0.muscache.com/pictures/ca25c7f3-0d1f-432b-9efa-b9f5dc6d8770.jpg' },
        { name: 'OMG!', icon: 'https://a0.muscache.com/pictures/c5a4f6fc-c92c-4ae8-87dd-57f1ff1b89a6.jpg' }
    ];

    selectCategory(categoryName: string) {
        this.selectedCategory = categoryName;
        this.categorySelect.emit(categoryName);
    }

    onOpenFilters() {
        this.openFilters.emit();
    }
}
