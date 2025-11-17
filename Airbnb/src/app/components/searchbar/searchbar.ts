import { Component, EventEmitter, Output, model } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [NgIf, NgFor],
  templateUrl: './searchbar.html',
  styleUrls: ['./searchbar.css']
})
export class SearchBarComponent {

  @Output() onSearch = new EventEmitter<any>();

  // UI Controls
  openWhere = false;
  openCheckIn = false;
  openCheckOut = false;
  openGuests = false;


  
  // Search values with model()
  location = model('');
  checkIn = model('');
  checkOut = model('');
  guests = model(1);

  // List of locations
  locations = ['Cairo', 'Giza', 'Alexandria', 'New Cairo', 'Nasr City'];

  toggle(which: string) {
    this.openWhere = which === 'where';
    this.openCheckIn = which === 'checkin';
    this.openCheckOut = which === 'checkout';
    this.openGuests = which === 'guests';
  }

  applySearch() {
    this.onSearch.emit({
      location: this.location(),
      checkIn: this.checkIn(),
      checkOut: this.checkOut(),
      guests: this.guests()
    });

    this.openWhere = false;
    this.openCheckIn = false;
    this.openCheckOut = false;
    this.openGuests = false;
  }
}
