import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { MaterialModule } from '../../../material.module';

@Component({
    selector: 'app-top-bar',
    imports: [MaterialModule],
    templateUrl: './top-bar.component.html',
    styleUrl: './top-bar.component.scss'
})
export class TopBarComponent {
    @Input() title = 'app';

    showBackArrow = false;

    constructor(private router: Router) {}
}
