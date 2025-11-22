import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-amenities-filter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './amenities-filter.html',
  styleUrl: './amenities-filter.css',
})
export class AmenitiesFilter {
allAmenities=['WiFi', 'Kitchen', 'Parking', 'Pool', 'Gym'];
selectedAmenties:string[]=[];
@Output() filterChange=new EventEmitter<string[]>();
onCheckboxChange(event:Event){
  const checkbox=event.target as HTMLInputElement;
  if(checkbox.checked){
    this.selectedAmenties.push(checkbox.value);
  }else{
    this.selectedAmenties=this.selectedAmenties.filter(a=>a!==checkbox.value);
  }
  this.filterChange.emit(this.selectedAmenties);
}
}
