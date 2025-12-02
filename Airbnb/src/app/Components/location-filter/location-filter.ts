import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-location-filter',
  standalone: true,
  imports: [],
  templateUrl: './location-filter.html',
  styleUrl: './location-filter.css',
})
export class LocationFilter {
@Output() filterChange=new EventEmitter<string>();
onInputChange(event:Event){
  const inputElement=event?.target as HTMLInputElement;
  this.filterChange.emit(inputElement.value);
}
}
