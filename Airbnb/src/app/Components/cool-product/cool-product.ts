import { Component } from '@angular/core';
import { ICoolProduct } from '../../Models/icool-product';
import { NgClass } from '@angular/common';
import { ClacPipe } from '../../Pipes/clac-pipe';
@Component({
  selector: 'app-cool-product',
  imports: [NgClass,ClacPipe],
templateUrl: './cool-product.html',
  styleUrl: './cool-product.css',
})
export class CoolProduct {
listOfProducts:ICoolProduct[];
constructor(){
  this.listOfProducts=[
    {
      CoolName: "Cool Laptop", Img: "assets/laptop.png",
      Quantity: 0
    },
    {
      CoolName: "Cool Mobile", Img: "assets/mobile.png",
      Quantity: 8
    },
    {
      CoolName: "Cool Tablet", Img: "assets/tablet.png",
      Quantity: 5
    }
  ];
}
}
