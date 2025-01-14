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

    selectedBook: BibleBook | null = null;
    selectedBookChapters: BibleChapter[] | null = null;
    selectedChapter: BibleChapter | null = null;
    selectedChapterVerses: BibleVerse[] | null = null;

    bookChapterString: string | null = null;
    chapterVerseString: string | null = null;

    constructor(
        formBuilder: FormBuilder,
        private bibleApiService: BibleApiService
    ) {
        this.selectForm = formBuilder.group({
            translation: ['', Validators.required]
        });
    }

    private get selectedTranslation(): string | null {
        return this.selectForm.get('translation')?.value as string | null;
    }

    public async getTranslations() {
        this.bibleTranslations = await this.bibleApiService.getCachedTranslations();
        const webTranslation = this.bibleTranslations.find(translation => translation.identifier === 'web');

        if (webTranslation) {
            this.selectForm.get('translation')?.setValue(webTranslation.identifier);
            const translation = await this.bibleApiService.getCachedTranslation(webTranslation.identifier);
            this.selectedBooks = translation.books;
        }
    }

    public async onTranslationChange() {
        if (this.selectedTranslation) {
            const translation = await this.bibleApiService.getCachedTranslation(this.selectedTranslation);
            this.selectedBooks = translation.books;
        }

        if (this.selectedTranslation && this.selectedChapter) {
            await this.onChapterSelected(this.selectedChapter);
        }
    }

    public async onBookSelected(book: BibleBook) {
        this.selectedBook = book;

        if (this.selectedBook.id !== this.selectedChapter?.book_id) {
            this.selectedBookChapters = null;
            this.selectedChapter = null;
        }

        if (this.selectedTranslation) {
            const chapters = await this.bibleApiService.getCachedBookChapters(this.selectedTranslation, book.id);
            this.selectedBookChapters = chapters.chapters;
        }
    }

    public async onChapterSelected(chapter: BibleChapter) {
        this.selectedChapter = chapter;

        const selectedTranslation = this.selectForm.get('translation')?.value as string | null;
        if (selectedTranslation) {
            const verses = await this.bibleApiService.getCachedChapterVerses(selectedTranslation, chapter.book_id, chapter.chapter);
            this.selectedChapterVerses = verses.verses;

            let chapterVerse = '';
            for (let verse of this.selectedChapterVerses) {
                if (chapterVerse.length > 0) {
                    chapterVerse += '<br /><br />';
                }
                chapterVerse += `<sup><b>${verse.verse}</b></sup> ${verse.text} `;
            }

            this.bookChapterString = `${this.selectedBook?.name} ${chapter.chapter}`;
            this.chapterVerseString = chapterVerse;
        }
    }
}
