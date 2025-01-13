import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom, map, tap } from 'rxjs';
import { BibleChapter, BibleTranslation } from '../interfaces';
import { ConfigService } from './config.service';

@Injectable({
    providedIn: 'root'
})
export class BibleApiService {
    private baseUrl = '';
    private lastTranslationRefresh: Date | null = null;
    public bibleTranslations: BibleTranslation[] = [];

    constructor(
        private http: HttpClient,
        configService: ConfigService
    ) {
        this.baseUrl = configService.config.api.baseUrl;
    }

    public async getCachedTranslation(identifier: string, maxAgeMinutes = 3) {
        if (!this.bibleTranslations.length || this.translationNeedsRefresh(maxAgeMinutes)) {
            this.bibleTranslations = await this.getCachedTranslations();
        }

        return this.bibleTranslations.find(translation => translation.identifier === identifier);
    }

    public async getCachedTranslations(refresh = false, durationMinutes = 3) {
        if (!this.bibleTranslations.length || refresh || this.translationNeedsRefresh(durationMinutes)) {
            this.bibleTranslations = await lastValueFrom(
                this.getTranslations().pipe(
                    tap(() => (this.lastTranslationRefresh = new Date())),
                    map(response =>
                        response.translations.filter(translation => translation.language_code === 'eng' && translation.identifier !== 'ylt')
                    )
                )
            );
        }

        return this.bibleTranslations;
    }

    getTranslations() {
        return this.get<{ translations: BibleTranslation[] }>('data');
    }

    getVerseRange(book: string, chapter: number, startVerse: number, endVerse: number) {
        return this.get<BibleChapter>(`${book} ${chapter}:${startVerse}-${endVerse}`);
    }

    getVerse(book: string, chapter: number, verse: number) {
        return this.get<BibleChapter>(`${book} ${chapter}:${verse}`);
    }

    getChapter(book: string, chapter: number) {
        return this.get<BibleChapter>(`${book} ${chapter}`);
    }

    get<T>(queryString: string) {
        return this.http.get<T>(`${this.baseUrl}${queryString}`);
    }

    private translationNeedsRefresh(durationMinutes: number) {
        const now = new Date();
        const lastRefresh = this.lastTranslationRefresh;

        return !lastRefresh || now.getTime() - lastRefresh.getTime() > durationMinutes * 60000;
    }
}
