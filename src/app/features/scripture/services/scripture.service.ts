import { Injectable } from '@angular/core';
import { BibleTranslation } from '../../../common/interfaces';
import { BibleApiService } from '../../../common/services';

@Injectable({
    providedIn: 'root'
})
export class ScriptureService {
    bibleTranslations: BibleTranslation[] = [];
    selectedTranslation: BibleTranslation | null = null;

    constructor(private bibleApiService: BibleApiService) {}

    public async getTranslations() {
        this.bibleTranslations = await this.bibleApiService.getCachedTranslations();
    }
}
