import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { ScriptureService } from '../services/scripture.service';

export const scriptureResolver: ResolveFn<boolean> = async (route, state) => {
    const scriptureService = inject(ScriptureService);
    await scriptureService.getTranslations();
    if (scriptureService.bibleTranslations.length > 0) {
        return true;
    } else {
        return false;
    }
};
