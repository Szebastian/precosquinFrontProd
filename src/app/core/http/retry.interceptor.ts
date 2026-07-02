import { HttpInterceptorFn } from '@angular/common/http';
import { retry, timeout, catchError, throwError } from 'rxjs';

export const retryInterceptor: HttpInterceptorFn = (req, next) => {
  const isIdempotent = ['GET', 'HEAD', 'OPTIONS'].includes(req.method);
  const maxRetries = isIdempotent ? 2 : 0;
  const retryDelay = 1000;

  if (maxRetries === 0) {
    return next(req);
  }

  return next(req).pipe(
    timeout(30000),
    retry({
      count: maxRetries,
      delay: (error, retryCount) => {
        if (error.status >= 500 || error.status === 429 || error.status === 0) {
          return new Promise(resolve => setTimeout(resolve, retryDelay * retryCount));
        }
        throw error;
      }
    }),
    catchError((error) => {
      return throwError(() => error);
    })
  );
};