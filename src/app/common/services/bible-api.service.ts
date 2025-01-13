import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom, map, tap } from 'rxjs';
import { BibleBook, BibleChapter, BibleTranslation, BibleVerse } from '../interfaces';
import { ConfigService } from './config.service';

@Injectable({
    providedIn: 'root'
})
export class BibleApiService {
    private baseUrl = '';
    private lastTranslationsRefresh: Date | null = null;
    private lastTranslationRefresh: Date | null = null;
    private lastBookChaptersRefresh: Date | null = null;
    private lastChapterVersesRefresh: Date | null = null;

    public bibleTranslations: BibleTranslation[] = [];
    public bibleTranslation: { translation: BibleTranslation; books: BibleBook[] } | null = null;
    public bibleBookChapters: { translation: BibleTranslation; chapters: BibleChapter[] } | null = null;
    public bibleChapterVerses: { translation: BibleTranslation; verses: BibleVerse[] } | null = null;

    constructor(
        private http: HttpClient,
        configService: ConfigService
    ) {
        this.baseUrl = configService.config.api.baseUrl;
    }

    public async getCachedTranslationHeader(identifier: string, maxAgeMinutes = 3) {
        if (!this.bibleTranslations.length || this.needsRefresh(maxAgeMinutes, this.lastTranslationsRefresh)) {
            this.bibleTranslations = await this.getCachedTranslations();
        }

        return this.bibleTranslations.find(translation => translation.identifier === identifier);
    }

    public async getCachedTranslations(refresh = false, durationMinutes = 3) {
        if (!this.bibleTranslations.length || refresh || this.needsRefresh(durationMinutes, this.lastTranslationsRefresh)) {
            this.bibleTranslations = await lastValueFrom(
                this.getTranslationHeaders().pipe(
                    tap(() => (this.lastTranslationsRefresh = new Date())),
                    map(response =>
                        response.translations.filter(translation => translation.language_code === 'eng' && translation.identifier !== 'ylt')
                    )
                )
            );
        }

        return this.bibleTranslations;
    }

    public async getCachedTranslation(identifier: string, maxAgeMinutes = 3) {
        if (
            !this.bibleTranslation ||
            this.bibleTranslation.translation.identifier !== identifier ||
            this.needsRefresh(maxAgeMinutes, this.lastTranslationRefresh)
        ) {
            this.bibleTranslation = await lastValueFrom(
                this.getTranslation(identifier).pipe(
                    tap(response => {
                        this.bibleTranslation = response;
                        this.lastTranslationRefresh = new Date();
                    })
                )
            );
        }

        return this.bibleTranslation;
    }

    public async getCachedBookChapters(translation: string, book_id: string, maxAgeMinutes = 3) {
        if (
            !this.bibleBookChapters ||
            this.bibleBookChapters.translation.identifier !== translation ||
            this.bibleBookChapters.chapters[0].book_id !== book_id ||
            this.needsRefresh(maxAgeMinutes, this.lastBookChaptersRefresh)
        ) {
            this.bibleBookChapters = await lastValueFrom(
                this.getBookChapters(translation, book_id).pipe(
                    tap(response => {
                        this.bibleBookChapters = response;
                        this.lastBookChaptersRefresh = new Date();
                    })
                )
            );
        }

        return this.bibleBookChapters;
    }

    public async getCachedChapterVerses(translation: string, book: string, chapter: number, maxAgeMinutes = 3) {
        if (
            !this.bibleChapterVerses ||
            this.bibleChapterVerses.translation.identifier !== translation ||
            this.bibleChapterVerses.verses[0].book_id !== book ||
            this.bibleChapterVerses.verses[0].chapter !== chapter ||
            this.needsRefresh(maxAgeMinutes, this.lastChapterVersesRefresh)
        ) {
            this.bibleChapterVerses = await lastValueFrom(
                this.getChapterVerses(translation, book, chapter).pipe(
                    tap(response => {
                        this.bibleChapterVerses = response;
                        this.lastChapterVersesRefresh = new Date();
                    })
                )
            );
        }

        return this.bibleChapterVerses;
    }

    getChapterVerses(translation: string, book: string, chapter: number) {
        return this.get<{ translation: BibleTranslation; verses: BibleVerse[] }>(`data/${translation}/${book}/${chapter}`);
    }

    getBookChapters(translation: string, book: string) {
        return this.get<{ translation: BibleTranslation; chapters: BibleChapter[] }>(`data/${translation}/${book}`);
    }

    getTranslation(identifier: string) {
        return this.get<{ translation: BibleTranslation; books: BibleBook[] }>(`data/${identifier}`);
    }

    getTranslationHeaders() {
        return this.get<{ translations: BibleTranslation[] }>('data');
    }

    get<T>(queryString: string) {
        return this.http.get<T>(`${this.baseUrl}${queryString}`);
    }

    private needsRefresh(durationMinutes: number, lastRefresh: Date | null) {
        const now = new Date();
        return !lastRefresh || now.getTime() - lastRefresh.getTime() > durationMinutes * 60000;
    }
}
