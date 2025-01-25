import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { BibleBook, BibleChapter, BibleTranslation, BibleVerse } from '../interfaces';
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
        return this.get<{ translations: BibleTranslation[] }>('data').pipe(
            map(response => {
                return response.translations.filter(translation => translation.language_code === 'eng' && translation.identifier !== 'ylt');
            })
        );
    }

    get<T>(queryString: string) {
        return this.http.get<T>(`${this.baseUrl}${queryString}`);
    }
}
