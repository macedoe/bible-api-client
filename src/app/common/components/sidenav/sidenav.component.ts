import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { MaterialModule } from '../../../material.module';

@Component({
    selector: 'app-sidenav',
    imports: [MaterialModule],
    templateUrl: './sidenav.component.html',
    styleUrl: './sidenav.component.scss'
})
export class SidenavComponent {
    @Output() sideNavClosed = new EventEmitter();

    constructor(private router: Router) {}

    onAbout() {
        this.router.navigateByUrl('/about');
        this.sideNavClosed.emit(); // Emit event to parent component so it can tell sidenav to close
    }
}
