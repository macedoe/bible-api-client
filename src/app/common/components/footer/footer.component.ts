import { Component, EventEmitter, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MaterialModule } from '../../../material.module';

@Component({
    selector: 'app-footer',
    imports: [MaterialModule, RouterLink, RouterLinkActive],
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.scss'
})
export class FooterComponent {
    @Output() public sidenavToggle = new EventEmitter();

    onToggleSidenav = () => {
        this.sidenavToggle.emit();
    };
}
