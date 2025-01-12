import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { BibleChapter, BibleTranslation } from '../interfaces';
import { ConfigService } from './config.service';

@Injectable({
    providedIn: 'root'
})
export class BibleApiService {
    private baseUrl = '';

    constructor(
        private http: HttpClient,
        configService: ConfigService
    ) {
        this.baseUrl = configService.config.api.baseUrl;
    }

    getValidTranslations() {
        return this.get<{ translations: BibleTranslation[] }>('data').pipe(
            map(response => response.translations.filter(translation => translation.language_code === 'eng' && translation.identifier !== 'ylt'))
        );
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
}
