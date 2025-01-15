import { HttpInterceptorFn } from '@angular/common/http';

export const bibleApiInterceptor: HttpInterceptorFn = (req, next) => {
    if (req.url.includes('bible-api.com')) {
        const request = req.clone().headers.append('Content-Type', 'application/json;charset=utf-8');
    }
    return next(req);
};
