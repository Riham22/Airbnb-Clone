import { Component, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';


@Component({ selector: 'app-carousel', templateUrl: './carousel.html' })
export class CarouselComponent implements AfterViewInit {
@Input() title: string | null = null;
@Input() items: any[] = [];
@ViewChild('scroller') scroller!: ElementRef<HTMLDivElement>;


ngAfterViewInit() {}


scroll(delta: number) {
const el = this.scroller.nativeElement;
el.scrollBy({ left: delta, behavior: 'smooth' });
}
}