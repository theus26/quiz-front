import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessaoStore } from './sessao.store';

export const adminGuard: CanActivateFn = (_route, state) => {
  const sessao = inject(SessaoStore);
  const router = inject(Router);
  if (!sessao.autenticado()) {
    return router.createUrlTree(['/entrar'], { queryParams: { retorno: state.url } });
  }
  if (!sessao.administrador()) {
    return router.createUrlTree(['/']);
  }
  return true;
};
