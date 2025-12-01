import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private toastsSubject = new BehaviorSubject<Toast[]>([]);
    public toasts$ = this.toastsSubject.asObservable();
    private nextId = 1;

    constructor() { }

    success(message: string, duration: number = 3000) {
        this.addToast({ message, type: 'success', duration });
    }

    error(message: string, duration: number = 4000) {
        this.addToast({ message, type: 'error', duration });
    }

    info(message: string, duration: number = 3000) {
        this.addToast({ message, type: 'info', duration });
    }

    warning(message: string, duration: number = 3000) {
        this.addToast({ message, type: 'warning', duration });
    }

    private addToast(toast: Omit<Toast, 'id'>) {
        const newToast: Toast = {
            ...toast,
            id: this.nextId++
        };

        const currentToasts = this.toastsSubject.value;
        this.toastsSubject.next([...currentToasts, newToast]);

        // Auto-remove toast after duration
        if (toast.duration) {
            setTimeout(() => {
                this.removeToast(newToast.id);
            }, toast.duration);
        }
    }

    removeToast(id: number) {
        const currentToasts = this.toastsSubject.value;
        this.toastsSubject.next(currentToasts.filter(t => t.id !== id));
    }

    clear() {
        this.toastsSubject.next([]);
    }
}
