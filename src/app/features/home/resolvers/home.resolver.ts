import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { HomeService } from '../services/home.service';

export const homeResolver: ResolveFn<boolean> = async (route, state) => {
    const homeService = inject(HomeService);
    await homeService.initialize();
    if (homeService.initialized) {
        return true;
    } else {
        return false;
    }
};
