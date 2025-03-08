import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { ScriptureService } from '../services/scripture.service';

export const scriptureResolver: ResolveFn<boolean> = async () => {
    const scriptureService = inject(ScriptureService);
    await scriptureService.initialize();
    return scriptureService.initialized;
};
