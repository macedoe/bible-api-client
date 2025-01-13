import { Injectable } from '@angular/core';
import { BibleChapter, BibleTranslation, BibleVerse } from '../../../common/interfaces';
import { BibleApiService } from '../../../common/services';

@Injectable({
    providedIn: 'root'
})
export class ScriptureService {
    bibleTranslations: BibleTranslation[] = [];
    selectedTranslation: BibleTranslation | null = null;
    selectedBookChapters: BibleChapter[] | null = null;
    selectedChapterVerses: BibleVerse[] | null = null;

    constructor(private bibleApiService: BibleApiService) {}

    public async getTranslations() {
        this.bibleTranslations = await this.bibleApiService.getCachedTranslations();
    }

    public setDefaultTranslation() {
        const webTranslation = this.bibleTranslations.find(translation => translation.identifier === 'web');
        if (webTranslation) {
            this.selectedTranslation = webTranslation;
        }
    }
}
