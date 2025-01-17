import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { lastValueFrom } from 'rxjs';
import { HOME_CHAPTER_COOKIE, HOME_TRANSLATION_COOKIE, HOME_VERSE_COOKIE } from '../../../common/constants';
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
        let webTranslation: BibleTranslation | null = null;

        const translationCookie = localStorage.getItem(HOME_TRANSLATION_COOKIE);
        if (translationCookie) {
            webTranslation = JSON.parse(translationCookie) as BibleTranslation;
        }

        if (!webTranslation) {
            webTranslation = this.bibleTranslations.find(translation => translation.identifier === 'web') || null;
        }

        if (webTranslation) {
            this.searchForm.get('translation')?.setValue(webTranslation.identifier);
        }

        const verseCookie = localStorage.getItem(HOME_VERSE_COOKIE);
        if (verseCookie) {
            const searchResult = verseCookie;
            this.searchForm.get('searchInput')?.setValue(searchResult);
        }

        const chapterCookie = localStorage.getItem(HOME_CHAPTER_COOKIE);
        if (chapterCookie) {
            this.setChapterAndVerses(JSON.parse(chapterCookie) as BibleApiResponse);
        }
    }

    public async search() {
        const searchInput = this.searchForm.get('searchInput')?.value as string | null;
        const translationId = this.searchForm.get('translation')?.value as string | null;
        const selectedTranslation = this.bibleTranslations.find(translation => translation.identifier === translationId);

        if (!searchInput || !translationId) {
            this.chapter = null;
            return;
        }

        localStorage.setItem(HOME_VERSE_COOKIE, searchInput);
        localStorage.setItem(HOME_TRANSLATION_COOKIE, JSON.stringify(selectedTranslation));

        const queryString = `${searchInput}?translation=${translationId}`;

        try {
            const chapterData = await lastValueFrom(this.bibleApiService.get<BibleApiResponse>(queryString));
            this.setChapterAndVerses(chapterData);
        } catch (error) {
            this.chapter = null;
            this.resultVerse = null;

            console.error(error);
        }
    }

    private setChapterAndVerses(chapterData: BibleApiResponse) {
        let verses = '';
        for (const verse of chapterData.verses) {
            if (verses.length > 0) {
                verses += '<br /><br />';
            }
            verses += `<sup><b>${verse.verse}</b></sup> ${verse.text} `;
        }

        this.chapter = chapterData;
        this.resultVerse = this.domSanitizer.bypassSecurityTrustHtml(verses);

        localStorage.setItem(HOME_CHAPTER_COOKIE, JSON.stringify(chapterData));
    }
}
