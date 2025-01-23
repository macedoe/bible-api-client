import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { FooterComponent, SidenavComponent, TopBarComponent } from './common/components';
import { SidenavService } from './common/services';
import { ThemeService } from './common/services/theme.service';
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

    constructor(
        private sidenavService: SidenavService,
        private swUpdate: SwUpdate,
        public themeService: ThemeService
    ) {}

    ngOnInit() {
        this.sidenavService.toggleSidenav.subscribe(() => {
            this.sidenav.toggle();
        });

        if (this.swUpdate.isEnabled) {
            this.swUpdate.versionUpdates.subscribe(event => {
                if (event.type === 'VERSION_READY') {
                    const userConfirmed = confirm('A new version of the app is available. Do you want to load it?');
                    if (userConfirmed) {
                        window.location.reload();
                    }
                }
            });
        }

        this.themeService.loadTheme();
    }
}
