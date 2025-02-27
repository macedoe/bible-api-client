import { Clipboard } from '@angular/cdk/clipboard';
import { Injectable, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { lastValueFrom } from 'rxjs';
import { DEFAULT_TRANSLATION } from '../../../common/constants';
import { localBibleDb } from '../../../common/data';
import { BibleApiResponse, BibleApiVerse, BibleTranslation } from '../../../common/interfaces';
import { BibleApiService } from '../../../common/services';
import { searchTermValidator } from '../validators/search-term.validator';

@Injectable({
    providedIn: 'root'
})
export class HomeService {
    searchForm: FormGroup;
    chapter: BibleApiResponse | null = null;
    resultVerse: SafeHtml | null = null;
    bibleTranslations = signal<BibleTranslation[]>([]);
    initialized = false;

    constructor(
        formBuilder: FormBuilder,
        private bibleApiService: BibleApiService,
        private domSanitizer: DomSanitizer,
        private clipboard: Clipboard,
        private snackBar: MatSnackBar
    ) {
        this.searchForm = formBuilder.group({
            searchInput: ['', [Validators.required, searchTermValidator()]],
            translation: ['', Validators.required]
        });
    }

    private get selectedTranslation(): string | null {
        return this.searchForm.get('translation')?.value as string | null;
    }

    public async initialize() {
        if (!this.initialized) {
            this.initialized = true;

            await this.loadTranslations();
            await this.loadTranslationFromStorage();
            await this.loadVerseFromStorage();
        }
    }

    public async loadTranslations() {
        const storedTranslations = await localBibleDb.translations.toArray();

        if (storedTranslations.length > 0) {
            this.bibleTranslations.set(storedTranslations);
        } else {
            const translationsResponse = await lastValueFrom(this.bibleApiService.getTranslationHeaders());
            this.bibleTranslations.set(translationsResponse);
            await localBibleDb.translations.bulkAdd(translationsResponse);
        }
    }

    private async loadTranslationFromStorage() {
        const storedTranslation = (await localBibleDb.defaultTranslations.get('home')) || null;
        if (storedTranslation) {
            this.searchForm.get('translation')?.setValue(storedTranslation.identifier);
        } else {
            this.loadDefaultTranslation();
        }
    }

    private loadDefaultTranslation() {
        const webTranslation = this.bibleTranslations().find(translation => translation.identifier === DEFAULT_TRANSLATION) || null;
        if (webTranslation) {
            this.searchForm.get('translation')?.setValue(webTranslation.identifier);
        }
    }

    private async loadVerseFromStorage() {
        const storedSearch = localStorage.getItem('ls-home-search-input-string');
        if (storedSearch && this.selectedTranslation) {
            this.searchForm.get('searchInput')?.setValue(storedSearch);

            await this.loadChapterFromStorage(this.selectedTranslation, storedSearch);
        }
    }

    private async loadChapterFromStorage(translation_id: string, searchInput: string) {
        const storedChapter = (await localBibleDb.apiResponses.where('reference').equals(searchInput).toArray()) || null;

        if (storedChapter.filter(response => response.translation_id === translation_id).length > 0) {
            await this.setChapterAndVerses(storedChapter[0]);
        }
    }

    public async onTranslationSelected(event: MatSelectChange) {
        const selectedTranslation = event.value as string;
        await this.storeTranslation(selectedTranslation);
        await this.search();
    }

    private async storeTranslation(translationId: string) {
        await localBibleDb.defaultTranslations.put({ view: 'home', identifier: translationId });
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
            let chapterData = await localBibleDb.apiResponses
                .where('reference')
                .equals(searchInput)
                .and(response => response.translation_id === translationId)
                .first();

            if (!chapterData) {
                chapterData = await lastValueFrom(this.bibleApiService.get<BibleApiResponse>(queryString));
            }

            await this.setChapterAndVerses(chapterData);
            this.storeSearch(searchInput);
        } catch (error) {
            this.chapter = null;
            this.resultVerse = null;

            console.error(error);
        }
    }

    async onShare() {
        if (this.chapter) {
            let verses = '';
            for (const bibleVerse of this.chapter.verses) {
                if (verses.length > 0) {
                    verses += '\n\n';
                }
                verses += `${bibleVerse.verse} ${bibleVerse.text} `;
            }

            const shareText = `${this.chapter.reference}\n\n${verses}`;

            if (navigator.share) {
                await navigator.share({ title: 'Bible Verse', text: shareText });
            } else {
                this.clipboard.copy(shareText);
                this.snackBar.open('Verse copied to clipboard', 'Dismiss', { duration: 3000 });
            }
        }
    }

    private storeSearch(searchInput: string) {
        localStorage.setItem('ls-home-search-input-string', searchInput);
    }

    private async setChapterAndVerses(chapterData: BibleApiResponse) {
        const verses = this.parseChapterVerses(chapterData.verses);

        this.chapter = chapterData;
        this.resultVerse = this.domSanitizer.bypassSecurityTrustHtml(verses);

        const existingChapter = await localBibleDb.apiResponses.where('reference').equals(chapterData.reference).toArray();
        if (existingChapter.filter(chapter => chapter.translation_id === this.selectedTranslation).length === 0) {
            await localBibleDb.apiResponses.put(chapterData);
        }
    }

    private parseChapterVerses(bibleVerses: BibleApiVerse[]): string {
        let verses = '';
        for (const bibleVerse of bibleVerses) {
            if (verses.length > 0) {
                verses += '<br /><br />';
            }
            verses += `<sup><b>${bibleVerse.verse}</b></sup> ${bibleVerse.text} `;
        }

        return verses;
    }
}
