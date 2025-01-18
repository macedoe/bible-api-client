import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { lastValueFrom } from 'rxjs';
import { HOME_CHAPTER_STORAGE, HOME_TRANSLATION_STORAGE, HOME_VERSE_STORAGE } from '../../../common/constants';
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
    initialized = false;

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

    public async initialize() {
        if (!this.initialized) {
            this.initialized = true;

            await this.loadTranslations();
            this.loadDefaultTranslation();

            this.loadTranslationFromStorage();
            this.loadVerseFromStorage();
            this.loadChapterFromStorage();
        }
    }

    public async loadTranslations() {
        this.bibleTranslations = await this.bibleApiService.getCachedTranslations();
    }

    private loadDefaultTranslation() {
        const webTranslation = this.bibleTranslations.find(translation => translation.identifier === 'web') || null;
        if (webTranslation) {
            this.searchForm.get('translation')?.setValue(webTranslation.identifier);
        }
    }

    private loadTranslationFromStorage() {
        const storedTranslationId = localStorage.getItem(HOME_TRANSLATION_STORAGE);
        if (storedTranslationId) {
            this.searchForm.get('translation')?.setValue(storedTranslationId);
        }
    }

    private loadVerseFromStorage() {
        const storedSearch = localStorage.getItem(HOME_VERSE_STORAGE);
        if (storedSearch) {
            this.searchForm.get('searchInput')?.setValue(storedSearch);
        }
    }

    private loadChapterFromStorage() {
        const storedChapter = localStorage.getItem(HOME_CHAPTER_STORAGE);
        if (storedChapter) {
            this.setChapterAndVerses(JSON.parse(storedChapter) as BibleApiResponse);
        }
    }

    public async onTranslationSelected(event: MatSelectChange) {
        const selectedTranslation = event.value as string;
        this.storeTranslation(selectedTranslation);
        await this.search();
    }

    private storeTranslation(translationId: string) {
        localStorage.setItem(HOME_TRANSLATION_STORAGE, translationId);
    }

    public clearSearch() {
        this.searchForm.get('searchInput')?.setValue('');
    }

    public async search() {
        const searchInput = this.searchForm.get('searchInput')?.value as string | null;
        const translationId = this.searchForm.get('translation')?.value as string | null;

        if (!searchInput || !translationId) {
            this.chapter = null;
            return;
        }

        const queryString = `${searchInput}?translation=${translationId}`;

        try {
            const chapterData = await lastValueFrom(this.bibleApiService.get<BibleApiResponse>(queryString));
            this.setChapterAndVerses(chapterData);
            this.storeSearch(searchInput);
        } catch (error) {
            this.chapter = null;
            this.resultVerse = null;

            console.error(error);
        }
    }

    private storeSearch(searchInput: string) {
        localStorage.setItem(HOME_VERSE_STORAGE, searchInput);
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

        localStorage.setItem(HOME_CHAPTER_STORAGE, JSON.stringify(chapterData));
    }
}
