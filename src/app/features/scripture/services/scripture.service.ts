import { Injectable, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BIBLE_BOOK_COOKIE, BIBLE_CHAPTER_COOKIE, BIBLE_TRANSLATION_COOKIE } from '../../../common/constants';
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

        let webTranslation: BibleTranslation | null = null;

        const translationCookie = localStorage.getItem(BIBLE_TRANSLATION_COOKIE);
        if (translationCookie) {
            webTranslation = JSON.parse(translationCookie) as BibleTranslation;
        }

        if (!webTranslation) {
            webTranslation = this.bibleTranslations.find(translation => translation.identifier === 'web') || null;
        }

        if (webTranslation) {
            this.selectForm.get('translation')?.setValue(webTranslation.identifier);
            const translation = await this.bibleApiService.getCachedTranslation(webTranslation.identifier);
            this.selectedBooks = translation.books;
        }

        const bookCookie = localStorage.getItem(BIBLE_BOOK_COOKIE);
        if (bookCookie) {
            await this.onBookSelected(JSON.parse(bookCookie) as BibleBook);
        }

        const chapterCookie = localStorage.getItem(BIBLE_CHAPTER_COOKIE);
        if (chapterCookie) {
            await this.onChapterSelected(JSON.parse(chapterCookie) as BibleChapter);
        }
    }

    public async onTranslationChange() {
        if (this.selectedTranslation) {
            const translation = await this.bibleApiService.getCachedTranslation(this.selectedTranslation);

            localStorage.setItem(BIBLE_TRANSLATION_COOKIE, JSON.stringify(translation.translation));

            this.selectedBooks = translation.books;
        }

        if (this.selectedTranslation && this.selectedChapter) {
            await this.onChapterSelected(this.selectedChapter);
        }
    }

    public async onBookSelected(book: BibleBook) {
        this.showChapters.set(true);
        this.selectedBook = book;

        localStorage.setItem(BIBLE_BOOK_COOKIE, JSON.stringify(this.selectedBook));

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

        localStorage.setItem(BIBLE_CHAPTER_COOKIE, JSON.stringify(this.selectedChapter));

        const selectedTranslation = this.selectForm.get('translation')?.value as string | null;
        if (selectedTranslation) {
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
    }

    public async onPreviousChapterSelected(chapter: BibleChapter) {
        if (chapter.chapter <= 1) {
            return;
        }

        let previousChapter = Object.assign({}, chapter);
        previousChapter.chapter--;
        await this.onChapterSelected(previousChapter);
    }

    public async onNextChapterSelected(chapter: BibleChapter) {
        if (chapter.chapter >= this.selectedBookChapters!.length + 1) {
            return;
        }

        let nextChapter = Object.assign({}, chapter);
        nextChapter.chapter++;
        await this.onChapterSelected(nextChapter);
    }
}
