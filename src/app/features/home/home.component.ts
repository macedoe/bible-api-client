import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { lastValueFrom } from 'rxjs';
import { BibleChapter } from '../../common/interfaces';
import { BibleApiService } from '../../common/services';
import { MaterialModule } from '../../material.module';

@Component({
    selector: 'app-home',
    imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent {
    searchForm: FormGroup;
    chapter: BibleChapter | null = null;
    resultVerse: SafeHtml | null = null;

    constructor(
        formBuilder: FormBuilder,
        private bibleApiService: BibleApiService,
        private domSanitizer: DomSanitizer
    ) {
        this.searchForm = formBuilder.group({
            searchInput: ['']
        });
    }

    public clearSearch() {
        this.searchForm.reset();
    }

    public async search() {
        this.chapter = null;
        const searchInput = this.searchForm.get('searchInput')?.value;

        if (!searchInput) {
            return;
        }

        const chapterData = await lastValueFrom(this.bibleApiService.get<BibleChapter>(searchInput));

        let verses = '';
        for (let verse of chapterData.verses) {
            if (verses.length > 0) {
                verses += '<br /><br />';
            }
            verses += `<sup><b>${verse.verse}</b></sup> ${verse.text} `;
        }

        this.chapter = chapterData;
        this.resultVerse = this.domSanitizer.bypassSecurityTrustHtml(verses);
    }
}
