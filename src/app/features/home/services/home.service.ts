import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { lastValueFrom } from 'rxjs';
import { BibleApiResponse, BibleTranslation } from '../../../common/interfaces';
import { BibleApiService } from '../../../common/services';

@Injectable({
    providedIn: 'root'
})
export class HomeService {
    searchForm: FormGroup;
    chapter: BibleApiResponse | null = null;
    resultVerse: SafeHtml | null = null;
    bibleTranslations: BibleTranslation[] = [];

    constructor(
        formBuilder: FormBuilder,
        private bibleApiService: BibleApiService,
        private domSanitizer: DomSanitizer
    ) {
        this.searchForm = formBuilder.group({
            searchInput: [''],
            translation: ['', Validators.required]
        });
    }

    public clearSearch() {
        this.searchForm.get('searchInput')?.setValue('');
    }

    public async getTranslations() {
        this.bibleTranslations = await this.bibleApiService.getCachedTranslations();
    }

    public setDefaultTranslationIfAny() {
        const webTranslation = this.bibleTranslations.find(t => t.identifier === 'web');
        if (webTranslation) {
            this.searchForm.get('translation')?.setValue(webTranslation.identifier);
        }
    }

    public async search() {
        const searchInput = this.searchForm.get('searchInput')?.value as string | null;
        const selectedTranslation = this.searchForm.get('translation')?.value as string | null;

        if (!searchInput || !selectedTranslation) {
            this.chapter = null;
            return;
        }

        const queryString = `${searchInput}?translation=${selectedTranslation}`;

        try {
            const chapterData = await lastValueFrom(this.bibleApiService.get<BibleApiResponse>(queryString));

            let verses = '';
            for (let verse of chapterData.verses) {
                if (verses.length > 0) {
                    verses += '<br /><br />';
                }
                verses += `<sup><b>${verse.verse}</b></sup> ${verse.text} `;
            }

            this.chapter = chapterData;
            this.resultVerse = this.domSanitizer.bypassSecurityTrustHtml(verses);
        } catch (error) {
            this.chapter = null;
            this.resultVerse = null;

            console.error(error);
        }
    }
}
