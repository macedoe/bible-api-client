import { Component, OnInit } from '@angular/core';
import { SidenavService } from '../../common/services';
import { MaterialModule } from '../../material.module';
import { ScriptureService } from './services/scripture.service';

@Component({
    selector: 'app-scripture',
    imports: [MaterialModule],
    templateUrl: './scripture.component.html',
    styleUrl: './scripture.component.scss'
})
export class ScriptureComponent implements OnInit {
    constructor(
        private sidenavService: SidenavService,
        private scriptureService: ScriptureService
    ) {}

    onToggleSidenav() {
        this.sidenavService.toggle();
    }

    async ngOnInit() {
        if (!this.scriptureService.bibleTranslations.length) {
            await this.scriptureService.getTranslations();
            this.scriptureService.setDefaultTranslation();
        }
    }
}
