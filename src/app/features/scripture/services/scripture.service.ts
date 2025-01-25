import { Injectable, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import {
    BIBLE_BOOK_STORAGE,
    BIBLE_CHAPTER_STORAGE,
    BIBLE_TRANSLATION_STORAGE,
    TRANSLATION_BOOKS_STORAGE,
    TRANSLATION_CHAPTERS_STORAGE,
    TRANSLATION_LIST_STORAGE,
    TRANSLATION_VERSES_STORAGE
} from '../../../common/constants';
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

        await this.loadTranslationBooksFromCache(cachedTranslation.identifier);

        const storedBook = localStorage.getItem(BIBLE_BOOK_STORAGE);
        if (storedBook) {
            this.showChapters.set(true);
            this.selectedBook = JSON.parse(storedBook) as BibleBook;
            await this.loadBookChaptersFromCache(cachedTranslation.identifier);
        }

        const storedChapter = localStorage.getItem(BIBLE_CHAPTER_STORAGE);
        if (storedChapter) {
            this.selectedChapter = JSON.parse(storedChapter) as BibleChapter;
            await this.loadVersesFromCache(cachedTranslation.identifier);
        }

        this.initialized = true;
    }

    public async getTranslations() {
        const storedTranslations = localStorage.getItem(TRANSLATION_LIST_STORAGE);
        if (storedTranslations) {
            this.bibleTranslations = JSON.parse(storedTranslations) as BibleTranslation[];
        } else {
            const translationsResponse = await lastValueFrom(this.bibleApiService.getTranslationHeaders());
            this.bibleTranslations = translationsResponse;
            localStorage.setItem(TRANSLATION_LIST_STORAGE, JSON.stringify(translationsResponse));
        }
    }

    private async loadTranslationBooksFromCache(translationIdentifier: string) {
        const storedBooks = localStorage.getItem(TRANSLATION_BOOKS_STORAGE);
        if (storedBooks) {
            this.selectedBooks = JSON.parse(storedBooks) as BibleBook[];
        } else {
            const translation = await lastValueFrom(this.bibleApiService.getTranslation(translationIdentifier));
            this.selectedBooks = translation.books;
            localStorage.setItem(TRANSLATION_BOOKS_STORAGE, JSON.stringify(this.selectedBooks));
        }
    }

    private async loadBookChaptersFromCache(translationIdentifier: string) {
        const storedChapters = localStorage.getItem(TRANSLATION_CHAPTERS_STORAGE);
        if (storedChapters) {
            this.selectedBookChapters = JSON.parse(storedChapters) as BibleChapter[];
        } else {
            if (this.selectedBook) {
                await this.getBookChapters(translationIdentifier, this.selectedBook.id);
                localStorage.setItem(TRANSLATION_CHAPTERS_STORAGE, JSON.stringify(this.selectedBookChapters));
            }
        }
    }

    private async loadVersesFromCache(translationIdentifier: string) {
        const storedVerses = localStorage.getItem(TRANSLATION_VERSES_STORAGE);
        if (storedVerses) {
            this.selectedChapterVerses = JSON.parse(storedVerses) as BibleVerse[];
            this.setChapterVerseString(this.selectedChapter!, this.selectedChapterVerses!);
        } else {
            if (this.selectedChapter) {
                await this.getChapterVerses(translationIdentifier, this.selectedChapter);
                localStorage.setItem(TRANSLATION_VERSES_STORAGE, JSON.stringify(this.selectedChapterVerses));
            }
        }
    }

    public async onTranslationChange() {
        if (this.selectedTranslation) {
            const translation = await lastValueFrom(this.bibleApiService.getTranslation(this.selectedTranslation));

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
            await this.getBookChapters(this.selectedTranslation, book.id);
        }
    }

    private async getBookChapters(selectedTranslation: string, bookId: string) {
        const chapters = await lastValueFrom(this.bibleApiService.getBookChapters(selectedTranslation, bookId));
        this.selectedBookChapters = chapters.chapters;
    }

    public async onChapterSelected(chapter: BibleChapter) {
        this.selectedChapter = chapter;

        localStorage.setItem(BIBLE_CHAPTER_STORAGE, JSON.stringify(this.selectedChapter));

        const selectedTranslation = this.selectForm.get('translation')?.value as string | null;
        if (selectedTranslation) {
            await this.getChapterVerses(selectedTranslation, chapter);
        }
    }

    private async getChapterVerses(selectedTranslation: string, chapter: BibleChapter) {
        const verses = await lastValueFrom(this.bibleApiService.getChapterVerses(selectedTranslation, chapter.book_id, chapter.chapter));
        this.selectedChapterVerses = verses.verses;
        this.setChapterVerseString(chapter, verses.verses);
    }

    private setChapterVerseString(chapter: BibleChapter, verses: BibleVerse[]) {
        let chapterVerse = '';
        for (const verse of verses) {
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
