import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { HomeService } from '../services/home.service';

export const homeResolver: ResolveFn<boolean> = async () => {
    const homeService = inject(HomeService);
    await homeService.initialize();
    return homeService.initialized;
};
