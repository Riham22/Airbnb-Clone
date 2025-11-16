import { Component, Input } from '@angular/core';


@Component({ selector: 'app-stay-card', templateUrl: './staycard.html' })
export class StayCardComponent {
@Input() item: any;
liked = false;
toggleLike() { this.liked = !this.liked; }
}