import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessaoStore } from './sessao.store';

export const authGuard: CanActivateFn = (_route, state) => {
  if (inject(SessaoStore).autenticado()) {
    return true;
  }
  return inject(Router).createUrlTree(['/entrar'], {
    queryParams: { retorno: state.url },
  });
};
