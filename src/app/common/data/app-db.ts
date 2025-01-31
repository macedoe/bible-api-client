import Dexie, { Table } from 'dexie';
import { BibleApiResponse, BibleBook, BibleChapter, BibleTranslation, BibleVerse, DefaultTranslation } from '../interfaces';

export class AppDb extends Dexie {
    translations!: Table<BibleTranslation, string>;
    defaultTranslations!: Table<DefaultTranslation, string>;
    apiResponses!: Table<BibleApiResponse, string>;

    storedBooks!: Table<BibleBook, string>;
    selectedBook!: Table<BibleBook, string>;

    storedChapters!: Table<BibleChapter, string>;
    selectedChapter!: Table<BibleChapter, string>;

    storedVerses!: Table<BibleVerse, string>;

    constructor() {
        super('BibleAppDb');

        this.version(2).stores({
            translations: '++itmId, identifier',
            defaultTranslations: 'view',
            apiResponses: '++itmId, reference, translation_id',
            storedBooks: '++itmId, id',
            selectedBook: 'id',
            storedChapters: '++itmId, book_id',
            selectedChapter: 'book_id, chapter',
            storedVerses: '++itmId, book_id, chapter'
        });
    }
}

export const localBibleDb = new AppDb();
