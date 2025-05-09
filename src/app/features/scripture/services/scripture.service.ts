import { Injectable, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { DEFAULT_TRANSLATION } from '../../../common/constants';
import { localBibleDb } from '../../../common/data';
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

        const defaultTranslation = await localBibleDb.defaultTranslations.get('scripture');
        const cachedTranslation =
            this.bibleTranslations.find(translation => translation.identifier === (defaultTranslation?.identifier || DEFAULT_TRANSLATION)) || null;

        if (!cachedTranslation) {
            console.error('No Bible translation found.');
            return;
        }

        this.selectForm.get('translation')?.setValue(cachedTranslation.identifier);

        await this.loadTranslationBooksFromCache(cachedTranslation.identifier);

        const storedBook = await localBibleDb.selectedBook.toArray();
        if (storedBook.length === 1) {
            this.showChapters.set(true);
            this.selectedBook = storedBook[0];
            await this.loadBookChaptersFromCache(cachedTranslation.identifier);
        }

        const storedChapter = await localBibleDb.selectedChapter.toArray();
        if (storedChapter.length === 1) {
            this.selectedChapter = storedChapter[0];
            await this.loadVersesFromCache(cachedTranslation.identifier);
        }

        this.initialized = true;
    }

    public async getTranslations() {
        const storedTranslations = await localBibleDb.translations.toArray();
        if (storedTranslations.length > 0) {
            this.bibleTranslations = storedTranslations;
        } else {
            const translationsResponse = await lastValueFrom(this.bibleApiService.getTranslationHeaders());
            this.bibleTranslations = translationsResponse;
            await localBibleDb.translations.bulkAdd(translationsResponse);
        }
    }

    private async loadTranslationBooksFromCache(translationIdentifier: string) {
        const storedBooks = await localBibleDb.storedBooks.toArray();
        if (storedBooks.length > 0) {
            this.selectedBooks = storedBooks;
        } else {
            const translation = await lastValueFrom(this.bibleApiService.getTranslation(translationIdentifier));
            this.selectedBooks = translation.books;
            await localBibleDb.storedBooks.bulkAdd(this.selectedBooks);
        }
    }

    private async loadBookChaptersFromCache(translationIdentifier: string) {
        if (!this.selectedBook) {
            return;
        }

        const storedChapters = await localBibleDb.storedChapters.where('book_id').equals(this.selectedBook.id).toArray();
        if (storedChapters.length > 0) {
            this.selectedBookChapters = storedChapters;
        } else {
            await this.getBookChapters(translationIdentifier, this.selectedBook.id);
            await localBibleDb.storedChapters.bulkAdd(this.selectedBookChapters as BibleChapter[]);
        }
    }

    private async loadVersesFromCache(translationIdentifier: string) {
        if (!this.selectedBook && !this.selectedChapter) {
            return;
        }

        const storedVerses = await localBibleDb.storedVerses
            .filter(verse => verse.book_id === this.selectedChapter!.book_id && verse.chapter === this.selectedChapter!.chapter)
            .toArray();
        if (storedVerses.length > 0) {
            this.selectedChapterVerses = storedVerses;
            this.setChapterVerseString(this.selectedChapter!, this.selectedChapterVerses!);
        } else {
            if (this.selectedChapter) {
                await this.getChapterVerses(translationIdentifier, this.selectedChapter);
                await localBibleDb.storedVerses.bulkAdd(this.selectedChapterVerses as BibleVerse[]);
            }
        }
    }

    public async onTranslationChange() {
        if (this.selectedTranslation) {
            await localBibleDb.defaultTranslations.put({ view: 'scripture', identifier: this.selectedTranslation });
            await this.loadTranslationBooksFromCache(this.selectedTranslation);
        }

        if (this.selectedTranslation && this.selectedChapter) {
            await this.onChapterSelected(this.selectedChapter);
        }
    }

    public async onBookSelected(book: BibleBook) {
        this.showChapters.set(true);
        this.selectedBook = book;

        await localBibleDb.selectedBook.clear();
        await localBibleDb.selectedBook.put(book);

        if (this.selectedBook.id !== this.selectedChapter?.book_id) {
            this.selectedBookChapters = null;
            this.selectedChapter = null;
            this.selectedChapterVerses = null;
            this.bookChapterString = null;
            this.chapterVerseString = null;
        }

        if (this.selectedTranslation) {
            await this.getBookChapters(this.selectedTranslation, book.id);
        }
    }

    private async getBookChapters(selectedTranslation: string, bookId: string) {
        let chapters = await localBibleDb.storedChapters.where('book_id').equals(bookId).toArray();
        if (chapters.length === 0) {
            const chaptersResponse = await lastValueFrom(this.bibleApiService.getBookChapters(selectedTranslation, bookId));
            chapters = chaptersResponse.chapters;
            await localBibleDb.storedChapters.bulkAdd(chapters);
        }
        this.selectedBookChapters = chapters;
    }

    public async onChapterSelected(chapter: BibleChapter) {
        this.selectedChapter = chapter;

        await localBibleDb.selectedChapter.clear();
        await localBibleDb.selectedChapter.put(chapter);

        if (this.selectedTranslation) {
            await this.getChapterVerses(this.selectedTranslation, chapter);
        }
    }

    private async getChapterVerses(selectedTranslation: string, chapter: BibleChapter) {
        const versesResponse = await lastValueFrom(this.bibleApiService.getChapterVerses(selectedTranslation, chapter.book_id, chapter.chapter));
        this.selectedChapterVerses = versesResponse.verses;
        await localBibleDb.storedVerses.clear();
        await localBibleDb.storedVerses.bulkAdd(this.selectedChapterVerses);

        this.setChapterVerseString(chapter, this.selectedChapterVerses);
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
