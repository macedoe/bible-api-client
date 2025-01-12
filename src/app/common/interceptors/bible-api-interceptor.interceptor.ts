import { HttpInterceptorFn } from '@angular/common/http';

export const bibleApiInterceptorInterceptor: HttpInterceptorFn = (req, next) => {
    if (req.url.includes('bible-api.com')) {
        const request = req.clone({
            url: req.url + '?single_chapter_book_matching=indifferent'
        });
        return next(request);
    }

    return next(req);
};
