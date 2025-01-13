import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class SidenavService {
    toggleSidenav: EventEmitter<void> = new EventEmitter<void>();

    toggle() {
        this.toggleSidenav.emit();
    }
}
