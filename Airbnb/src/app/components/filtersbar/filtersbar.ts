
import { NgClass } from '@angular/common';
import { Component, NgModule } from '@angular/core';



@Component({
  selector: 'app-filtersbar',
  imports: [NgClass],
  templateUrl: './filtersbar.html',
  styleUrl: './filtersbar.css',
})
export class Filtersbar {
select(_t4: any) {
throw new Error('Method not implemented.');
}
filters = [
{ name: 'Beach', icon: '🏖️' },
{ name: 'Rooms', icon: '🛏️' },
{ name: 'Trending', icon: '🔥' },
{ name: 'Castles', icon: '🏰' },
{ name: 'Islands', icon: '🏝️' },
{ name: 'Cabins', icon: '🌲' },
];
active: any;
}
