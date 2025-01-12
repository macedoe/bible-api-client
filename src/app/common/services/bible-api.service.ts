import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BibleChapter } from '../interfaces';
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
