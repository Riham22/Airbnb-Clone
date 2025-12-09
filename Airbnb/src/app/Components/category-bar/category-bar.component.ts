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
    @Output() openFilters = new EventEmitter<void>();

    onOpenFilters() {
        this.openFilters.emit();
    }

}
