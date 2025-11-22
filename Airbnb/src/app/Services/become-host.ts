// become-host.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BecomeHostService {
  private showBecomeHostModal = new BehaviorSubject<boolean>(false);
  showBecomeHostModal$ = this.showBecomeHostModal.asObservable();

  openBecomeHostModal() {
    this.showBecomeHostModal.next(true);
  }

  closeBecomeHostModal() {
    this.showBecomeHostModal.next(false);
  }
}
