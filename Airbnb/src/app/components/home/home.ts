import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent {
listings = [
{ title: 'Cozy Apartment', price: 120, image: 'assets/img1.jpg' },
{ title: 'Beach House', price: 240, image: 'assets/img2.jpg' },
{ title: 'Mountain Cabin', price: 180, image: 'assets/img3.jpg' }
];
filters = [
{ name: 'Beach', icon: '🏖️' },
{ name: 'Rooms', icon: '🛏️' },
{ name: 'Trending', icon: '🔥' },
{ name: 'Castles', icon: '🏰' },
{ name: 'Islands', icon: '🏝️' },
{ name: 'Cabins', icon: '🌲' },
];
}
