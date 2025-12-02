import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { GuestCounts } from '../../Models/guest-counts';

@Component({
  selector: 'app-guest-filter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './guest-filter.html',
  styleUrl: './guest-filter.css',
})
export class GuestFilter {
@Output() filterChange=new EventEmitter<GuestCounts>();

counts={
  adults:0,
  children:0,
  infants:0,
  pets:0,
};

private emitChange(){
  const totalGuests=this.counts.adults+this.counts.children+this.counts.infants+this.counts
  .pets;
  this.filterChange.emit({...this.counts,totalGuests});
}
updateCount(category:keyof typeof this.counts, delta:number){
  const currentValue=this.counts[category];
  const newValue=currentValue+delta;
if(newValue>=0){
  if (category==='adults'&& newValue ===0 && (this.counts.children===0)) {
    return;

  }
  this.counts[category]=newValue;
  this.emitChange();
}
}
ngOnInit(){
  this.emitChange();
}

}
