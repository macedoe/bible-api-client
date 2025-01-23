import { Component, Input } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { ThemeService } from '../../services/theme.service';

@Component({
    selector: 'app-top-bar',
    imports: [MaterialModule],
    templateUrl: './top-bar.component.html',
    styleUrl: './top-bar.component.scss'
})
export class TopBarComponent {
    @Input() title = 'app';

    showBackArrow = false;

    constructor(public themeService: ThemeService) {}
}
