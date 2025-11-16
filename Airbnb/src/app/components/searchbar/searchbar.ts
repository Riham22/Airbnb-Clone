import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
 selector: 'app-search-bar',
standalone: true,
imports: [ReactiveFormsModule],
templateUrl: './searchbar.html',
styleUrls: ['./searchbar.css']
})
export class SearchBarComponent {
form = new FormGroup({
where: new FormControl(''),
checkIn: new FormControl(''),
checkOut: new FormControl(''),
guests: new FormControl(1)
});


submitSearch() {
console.log(this.form.value);
}
}
