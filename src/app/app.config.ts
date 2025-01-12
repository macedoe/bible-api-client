import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withHashLocation } from '@angular/router';
import { routes } from './app.routes';
import { bibleApiInterceptorInterceptor } from './common/interceptors';
import { ConfigService } from './common/services';
import { loadApiConfiguration } from './common/utils';

export const appConfig: ApplicationConfig = {
    providers: [
        provideAppInitializer(async () => {
            const configService = inject(ConfigService);
            await loadApiConfiguration(configService);
        }),
        provideHttpClient(withInterceptors([bibleApiInterceptorInterceptor])),
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes, withHashLocation()),
        provideAnimationsAsync()
    ]
};
