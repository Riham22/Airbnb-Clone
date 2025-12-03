import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-filter-modal',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './filter-modal.component.html',
    styleUrl: './filter-modal.component.css'
})
export class FilterModalComponent {
    @Input() isOpen = false;
    @Output() close = new EventEmitter<void>();
    @Output() applyFilters = new EventEmitter<any>();

    priceRange = { min: 10, max: 800 };
    typeOfPlace = {
        entirePlace: false,
        privateRoom: false,
        sharedRoom: false
    };
    amenities = {
        wifi: false,
        kitchen: false,
        washer: false,
        dryer: false,
        airConditioning: false,
        heating: false
    };
    roomsAndBeds = {
        bedrooms: 0,
        beds: 0,
        bathrooms: 0
    };
    standoutStays = {
        guestFavorite: false,
        luxe: false
    };
    bookingOptions = {
        instantBook: false,
        selfCheckIn: false,
        allowsPets: false
    };

    onClose() {
        this.close.emit();
    }

    onApply() {
        const filters = {
            priceRange: this.priceRange,
            typeOfPlace: this.typeOfPlace,
            roomsAndBeds: this.roomsAndBeds,
            amenities: this.amenities,
            bookingOptions: this.bookingOptions,
            standoutStays: this.standoutStays
        };
        this.applyFilters.emit(filters);
        this.close.emit();
    }

    clearAll() {
        this.priceRange = { min: 10, max: 800 };
        this.typeOfPlace = { entirePlace: false, privateRoom: false, sharedRoom: false };
        this.roomsAndBeds = { bedrooms: 0, beds: 0, bathrooms: 0 };
        this.amenities = { wifi: false, kitchen: false, washer: false, dryer: false, airConditioning: false, heating: false };
        this.bookingOptions = { instantBook: false, selfCheckIn: false, allowsPets: false };
        this.standoutStays = { guestFavorite: false, luxe: false };
    }

    updateCounter(type: 'bedrooms' | 'beds' | 'bathrooms', change: number) {
        const newValue = this.roomsAndBeds[type] + change;
        if (newValue >= 0) {
            this.roomsAndBeds[type] = newValue;
        }
    }

    toggleBookingOption(option: 'instantBook' | 'selfCheckIn' | 'allowsPets') {
        this.bookingOptions[option] = !this.bookingOptions[option];
    }

    toggleStandout(option: 'guestFavorite' | 'luxe') {
        this.standoutStays[option] = !this.standoutStays[option];
    }
}
