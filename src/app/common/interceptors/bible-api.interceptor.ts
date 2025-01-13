import { HttpInterceptorFn } from '@angular/common/http';

export const bibleApiInterceptor: HttpInterceptorFn = (req, next) => {
    return next(req);
};
