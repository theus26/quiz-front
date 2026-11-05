import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs';
import { SessaoStore } from './sessao.store';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const sessao = inject(SessaoStore);
  const token = sessao.token();
  const autenticada = token && !req.headers.has('Authorization')
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(autenticada).pipe(
    tap({
      error: (erro: unknown) => {
        if (
          erro instanceof HttpErrorResponse
          && erro.status === 401
          && autenticada.headers.has('Authorization')
        ) {
          sessao.definir(null);
        }
      },
    }),
  );
};
