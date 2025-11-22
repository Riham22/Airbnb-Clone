import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appLight]'
})
export class Light {

  constructor(private El:ElementRef) {
    El.nativeElement.style.border = '2px green solid';
  }
  @HostListener('mouseenter') onMouseEnter() {
  this.El.nativeElement.style.border=`5px red solid`;
   }

  @HostListener('mouseleave') onMouseLeave() {

  this.El.nativeElement.style.border=`2px yellow solid`;
  }
  





}
