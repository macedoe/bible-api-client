import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ScriptureService } from '../../../features/scripture/services/scripture.service';
import { MaterialModule } from '../../../material.module';

@Component({
    selector: 'app-sidenav',
    imports: [MaterialModule],
    templateUrl: './sidenav.component.html',
    styleUrl: './sidenav.component.scss'
})
export class SidenavComponent {
    @Output() sideNavClosed = new EventEmitter();

    constructor(
        public scriptureService: ScriptureService,
        private router: Router
    ) {}

    onAbout() {
        this.router.navigateByUrl('/about');
        this.sideNavClosed.emit();
    }
}
