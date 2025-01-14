import { Component, EventEmitter, Output, signal } from '@angular/core';
import { ScriptureService } from '../../../features/scripture/services/scripture.service';
import { MaterialModule } from '../../../material.module';
import { BibleBook, BibleChapter } from '../../interfaces';

@Component({
    selector: 'app-sidenav',
    imports: [MaterialModule],
    templateUrl: './sidenav.component.html',
    styleUrl: './sidenav.component.scss'
})
export class SidenavComponent {
    @Output() sideNavClosed = new EventEmitter();
    public showChapters = signal(false);

    constructor(public scriptureService: ScriptureService) {}

    onBookSelected(book: BibleBook) {
        this.scriptureService.onBookSelected(book);
        this.showChapters.set(true);
    }

    onChapterSelected(chapter: BibleChapter) {
        this.scriptureService.onChapterSelected(chapter);
        this.sideNavClosed.emit();
    }
}
