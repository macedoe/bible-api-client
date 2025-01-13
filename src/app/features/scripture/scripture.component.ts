import { Component } from '@angular/core';
import { SidenavService } from '../../common/services';
import { MaterialModule } from '../../material.module';

@Component({
    selector: 'app-scripture',
    imports: [MaterialModule],
    templateUrl: './scripture.component.html',
    styleUrl: './scripture.component.scss'
})
export class ScriptureComponent {
    constructor(private sidenavService: SidenavService) {}

    onToggleSidenav() {
        this.sidenavService.toggle();
    }
}
