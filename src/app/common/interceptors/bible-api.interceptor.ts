import { HttpInterceptorFn } from '@angular/common/http';

export const bibleApiInterceptor: HttpInterceptorFn = (req, next) => {
    if (req.url.includes('bible-api.com') && !req.url.endsWith('data')) {
        const request = req.clone({
            setHeaders: {
                // 'X-Single-Chapter-Book-Matching': 'indifferent',
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        });
        return next(request);
    }

    return next(req);
};
