import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import { FooterComponent, SidenavComponent, TopBarComponent } from './common/components';
import { SidenavService } from './common/services';
import { MaterialModule } from './material.module';

@Component({
    selector: 'app-root',
    imports: [FooterComponent, SidenavComponent, TopBarComponent, RouterOutlet, MaterialModule],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
    @ViewChild('sidenav') sidenav!: MatSidenav;
    title = 'simple bible search';

    constructor(private sidenavService: SidenavService) {}

    ngOnInit() {
        this.sidenavService.toggleSidenav.subscribe(() => {
            this.sidenav.toggle();
        });
    }
}
