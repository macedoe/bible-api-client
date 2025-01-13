import { BibleApiVerse } from './bible-api-verse';

export interface BibleApiResponse {
    reference: string;
    verses: BibleApiVerse[];
    text: string;
    translation_id: string;
    translation_name: string;
    translation_note: string;
}
