import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, inject, provideAppInitializer, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withHashLocation } from '@angular/router';
import { routes } from './app.routes';
import { bibleApiInterceptor } from './common/interceptors';
import { ConfigService } from './common/services';
import { loadApiConfiguration } from './common/utils';
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
    providers: [
        provideAppInitializer(async () => {
            const configService = inject(ConfigService);
            await loadApiConfiguration(configService);
        }),
        provideHttpClient(withInterceptors([bibleApiInterceptor])),
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes, withHashLocation()),
        provideAnimationsAsync(), provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          })
    ]
};
