import { Injectable } from '@angular/core';
import { BibleTranslationHeader } from '../../../common/interfaces';
import { BibleApiService } from '../../../common/services';

@Injectable({
    providedIn: 'root'
})
export class ScriptureService {
    bibleTranslations: BibleTranslationHeader[] = [];
    selectedTranslation: BibleTranslationHeader | null = null;

    constructor(private bibleApiService: BibleApiService) {}

    public async getTranslations() {
        this.bibleTranslations = await this.bibleApiService.getCachedTranslations();
    }
}
