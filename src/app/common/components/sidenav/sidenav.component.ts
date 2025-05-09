import { Component, EventEmitter, Output } from '@angular/core';
import { ScriptureService } from '../../../features/scripture/services/scripture.service';
import { MaterialModule } from '../../../material.module';
import { BibleChapter } from '../../interfaces';
import { ThemeService } from '../../services/theme.service';

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
        public themeService: ThemeService
    ) {}

    onChapterSelected(chapter: BibleChapter) {
        this.scriptureService.onChapterSelected(chapter);
        this.sideNavClosed.emit();
    }
}
