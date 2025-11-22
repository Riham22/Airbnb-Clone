import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'clac'
})
export class ClacPipe implements PipeTransform {

  transform(value: number): number {
    return value * 15;
  }

}
