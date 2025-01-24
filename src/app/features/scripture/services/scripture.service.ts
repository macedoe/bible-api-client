import { Injectable, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BIBLE_BOOK_STORAGE, BIBLE_CHAPTER_STORAGE, BIBLE_TRANSLATION_STORAGE } from '../../../common/constants';
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

    public showChapters = signal(false);

    initialized = false;

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

    public async initialize() {
        if (this.initialized) {
            return;
        }

        await this.getTranslations();

        if (this.bibleTranslations.length === 0) {
            console.error('No Bible translations found.');
            return;
        }

        let cachedTranslation: BibleTranslation | null = null;

        const storedTranslation = localStorage.getItem(BIBLE_TRANSLATION_STORAGE);
        if (storedTranslation) {
            cachedTranslation = JSON.parse(storedTranslation) as BibleTranslation;
        } else {
            cachedTranslation = this.bibleTranslations.find(translation => translation.identifier === 'web') || null;
        }

        if (!cachedTranslation) {
            console.error('No Bible translation found.');
            return;
        }

        this.selectForm.get('translation')?.setValue(cachedTranslation.identifier);
        const translation = await this.bibleApiService.getCachedTranslation(cachedTranslation.identifier);
        this.selectedBooks = translation.books;

        const storedBook = localStorage.getItem(BIBLE_BOOK_STORAGE);
        if (storedBook) {
            this.showChapters.set(true);
            this.selectedBook = JSON.parse(storedBook) as BibleBook;
            await this.getCachedBookChapters(cachedTranslation.identifier, this.selectedBook.id);
        }

        const storedChapter = localStorage.getItem(BIBLE_CHAPTER_STORAGE);
        if (storedChapter) {
            this.selectedChapter = JSON.parse(storedChapter) as BibleChapter;
            await this.getCachedChapterVerses(cachedTranslation.identifier, JSON.parse(storedChapter) as BibleChapter);
        }

        this.initialized = true;
    }

    public async getTranslations() {
        this.bibleTranslations = await this.bibleApiService.getCachedTranslations();
    }

    public async onTranslationChange() {
        if (this.selectedTranslation) {
            const translation = await this.bibleApiService.getCachedTranslation(this.selectedTranslation);

            localStorage.setItem(BIBLE_TRANSLATION_STORAGE, JSON.stringify(translation.translation));

            this.selectedBooks = translation.books;
        }

        if (this.selectedTranslation && this.selectedChapter) {
            await this.onChapterSelected(this.selectedChapter);
        }
    }

    public async onBookSelected(book: BibleBook) {
        this.showChapters.set(true);
        this.selectedBook = book;

        localStorage.setItem(BIBLE_BOOK_STORAGE, JSON.stringify(this.selectedBook));

        if (this.selectedBook.id !== this.selectedChapter?.book_id) {
            this.selectedBookChapters = null;
            this.selectedChapter = null;
        }

        if (this.selectedTranslation) {
            await this.getCachedBookChapters(this.selectedTranslation, book.id);
        }
    }

    private async getCachedBookChapters(selectedTranslation: string, bookId: string) {
        const chapters = await this.bibleApiService.getCachedBookChapters(selectedTranslation, bookId);
        this.selectedBookChapters = chapters.chapters;
    }

    public async onChapterSelected(chapter: BibleChapter) {
        this.selectedChapter = chapter;

        localStorage.setItem(BIBLE_CHAPTER_STORAGE, JSON.stringify(this.selectedChapter));

        const selectedTranslation = this.selectForm.get('translation')?.value as string | null;
        if (selectedTranslation) {
            await this.getCachedChapterVerses(selectedTranslation, chapter);
        }
    }

    private async getCachedChapterVerses(selectedTranslation: string, chapter: BibleChapter) {
        const verses = await this.bibleApiService.getCachedChapterVerses(selectedTranslation, chapter.book_id, chapter.chapter);
        this.selectedChapterVerses = verses.verses;

        let chapterVerse = '';
        for (const verse of this.selectedChapterVerses) {
            if (chapterVerse.length > 0) {
                chapterVerse += '<br /><br />';
            }
            chapterVerse += `<sup><b>${verse.verse}</b></sup> ${verse.text} `;
        }

        this.bookChapterString = `${this.selectedBook?.name} ${chapter.chapter}`;
        this.chapterVerseString = chapterVerse;
    }

    public async onPreviousChapterSelected(chapter: BibleChapter) {
        if (chapter.chapter <= 1) {
            return;
        }

        const previousChapter = Object.assign({}, chapter);
        previousChapter.chapter--;
        await this.onChapterSelected(previousChapter);
    }

    public async onNextChapterSelected(chapter: BibleChapter) {
        if (chapter.chapter >= this.selectedBookChapters!.length + 1) {
            return;
        }

        const nextChapter = Object.assign({}, chapter);
        nextChapter.chapter++;
        await this.onChapterSelected(nextChapter);
    }
}
