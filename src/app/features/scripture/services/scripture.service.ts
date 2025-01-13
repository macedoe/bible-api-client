import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BibleBook, BibleChapter, BibleTranslation, BibleVerse } from '../../../common/interfaces';
import { BibleApiService } from '../../../common/services';

@Injectable({
    providedIn: 'root'
})
export class ScriptureService {
    bibleTranslations: BibleTranslation[] = [];
    selectForm: FormGroup;
    selectedBooks: BibleBook[] | null = null;

    selectedBookChapters: BibleChapter[] | null = null;
    selectedChapterVerses: BibleVerse[] | null = null;

    constructor(
        formBuilder: FormBuilder,
        private bibleApiService: BibleApiService
    ) {
        this.selectForm = formBuilder.group({
            translation: ['', Validators.required]
        });
    }

    public async getTranslations() {
        this.bibleTranslations = await this.bibleApiService.getCachedTranslations();
    }

    public async onTranslationChange() {
        const selectedTranslation = this.selectForm.get('translation')?.value as string | null;
        if (selectedTranslation) {
            const translation = await this.bibleApiService.getCachedTranslation(selectedTranslation);
            this.selectedBooks = translation.books;
        }
    }

    public onBookSelect(book: BibleBook) {}
}
