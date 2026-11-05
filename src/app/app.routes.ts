import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./inicio/inicio-page.component').then((m) => m.InicioPageComponent),
  },
  {
    path: 'jogar',
    loadComponent: () => import('./jogo/paginas/jogo-page.component').then((m) => m.JogoPageComponent),
  },
  {
    path: 'ranking',
    loadComponent: () => import('./ranking/ranking-page.component').then((m) => m.RankingPageComponent),
  },
  {
    path: 'entrar',
    loadComponent: () => import('./acesso/login-page.component').then((m) => m.LoginPageComponent),
  },
  {
    path: 'cadastro',
    loadComponent: () => import('./acesso/cadastro-page.component').then((m) => m.CadastroPageComponent),
  },
  {
    path: 'historico',
    canActivate: [authGuard],
    loadComponent: () => import('./historico/historico-page.component').then((m) => m.HistoricoPageComponent),
  },
  { path: '**', redirectTo: '' },
];
