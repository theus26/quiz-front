import { Routes } from '@angular/router';
import { adminGuard } from './core/auth/admin.guard';
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
  {
    path: 'enviar',
    canActivate: [authGuard],
    loadComponent: () => import('./enviar/enviar-page.component').then((m) => m.EnviarPageComponent),
  },
  {
    path: 'admin/usuarios',
    canActivate: [adminGuard],
    loadComponent: () => import('./admin/usuarios-page.component').then((m) => m.UsuariosPageComponent),
  },
  {
    path: 'admin/perguntas',
    canActivate: [adminGuard],
    loadComponent: () => import('./admin/moderacao-page.component').then((m) => m.ModeracaoPageComponent),
  },
  { path: '**', redirectTo: '' },
];
