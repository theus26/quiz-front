import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessaoStore } from './sessao.store';

export const jogadorGuard: CanActivateFn = () => {
  if (inject(SessaoStore).administrador()) {
    return inject(Router).createUrlTree(['/ranking']);
  }
  return true;
};
