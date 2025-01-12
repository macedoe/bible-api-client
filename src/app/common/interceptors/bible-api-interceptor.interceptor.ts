import { HttpInterceptorFn } from '@angular/common/http';

export const bibleApiInterceptorInterceptor: HttpInterceptorFn = (req, next) => {
    // if (req.url.includes('bible-api.com')) {
    //     const request = req.clone({
    //         setHeaders: {
    //             'X-Single-Chapter-Book-Matching': 'indifferent'
    //         }
    //     });
    //     return next(request);
    // }

    return next(req);
};
