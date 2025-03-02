import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, isDevMode, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, TitleStrategy, withHashLocation } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { routes } from './app.routes';
import { bibleApiInterceptor } from './common/interceptors';
import { BibleTitleStrategy } from './common/strategies';
import { loadApiConfiguration } from './common/utils';

export const appConfig: ApplicationConfig = {
    providers: [
        provideAppInitializer(async () => await loadApiConfiguration()),
        provideHttpClient(withInterceptors([bibleApiInterceptor])),
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes, withHashLocation()),
        provideAnimationsAsync(),
        {
            provide: TitleStrategy,
            useClass: BibleTitleStrategy
        },
        provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
        })
    ]
};
