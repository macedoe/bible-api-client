import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom, map, tap } from 'rxjs';
import { BibleBookHeader, BibleChapterHeader, BibleTranslationHeader } from '../interfaces';
import { ConfigService } from './config.service';

@Injectable({
    providedIn: 'root'
})
export class BibleApiService {
    private baseUrl = '';
    private lastTranslationsRefresh: Date | null = null;
    private lastTranslationRefresh: Date | null = null;
    private lastBookChaptersRefresh: Date | null = null;

    public bibleTranslations: BibleTranslationHeader[] = [];
    public bibleTranslation: { translation: BibleTranslationHeader; books: BibleBookHeader[] } | null = null;
    public bibleBookChapters: { translation: BibleTranslationHeader; chapters: BibleChapterHeader[] } | null = null;

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

    public async getCachedBookChapters(translation: string, identifier: string, maxAgeMinutes = 3) {
        if (
            !this.bibleBookChapters ||
            this.bibleBookChapters.translation.identifier !== translation ||
            this.bibleBookChapters.chapters[0].book_id !== identifier ||
            this.needsRefresh(maxAgeMinutes, this.lastBookChaptersRefresh)
        ) {
            this.bibleBookChapters = await lastValueFrom(
                this.getBookChapters(translation, identifier).pipe(
                    tap(response => {
                        this.bibleBookChapters = response;
                        this.lastBookChaptersRefresh = new Date();
                    })
                )
            );
        }

        return this.bibleBookChapters;
    }

    getBookChapters(translation: string, identifier: string) {
        return this.get<{ translation: BibleTranslationHeader; chapters: BibleChapterHeader[] }>(`data/${translation}/${identifier}`);
    }

    getTranslation(identifier: string) {
        return this.get<{ translation: BibleTranslationHeader; books: BibleBookHeader[] }>(`data/${identifier}`);
    }

    getTranslationHeaders() {
        return this.get<{ translations: BibleTranslationHeader[] }>('data');
    }

    get<T>(queryString: string) {
        return this.http.get<T>(`${this.baseUrl}${queryString}`);
    }

    private needsRefresh(durationMinutes: number, lastRefresh: Date | null) {
        const now = new Date();
        return !lastRefresh || now.getTime() - lastRefresh.getTime() > durationMinutes * 60000;
    }
}
