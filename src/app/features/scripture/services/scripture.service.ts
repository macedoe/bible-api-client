import { Injectable } from '@angular/core';
import { BibleTranslation } from '../../../common/interfaces';

@Injectable({
    providedIn: 'root'
})
export class ScriptureService {
    bibleTranslations: BibleTranslation[] = [];

    constructor() {}
}
