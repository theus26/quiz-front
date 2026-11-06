import { ChangeDetectionStrategy, Component, effect, inject, signal, untracked } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { BoasVindasService } from './core/auth/boas-vindas.service';
import { SessaoStore } from './core/auth/sessao.store';
import { JogoService } from './jogo/servicos/jogo.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.component.html',
})
export class AppComponent {
  private readonly sessao = inject(SessaoStore);
  private readonly jogo = inject(JogoService);
  private readonly router = inject(Router);
  private readonly aviso = inject(BoasVindasService);

  readonly autenticado = this.sessao.autenticado;
  readonly administrador = this.sessao.administrador;
  readonly nome = this.sessao.nome;
  readonly boasVindas = this.aviso.mensagem;
  readonly maisAberto = signal(false);

  constructor() {
    effect(() => {
      if (!this.sessao.autenticado()) {
        return;
      }
      untracked(() => {
        void this.jogo.salvarPendente();
      });
    });
  }

  sair(): void {
    this.maisAberto.set(false);
    this.aviso.fechar();
    this.sessao.definir(null);
    void this.router.navigateByUrl('/');
  }

  fecharMais(): void {
    this.maisAberto.set(false);
  }

  fecharBoasVindas(): void {
    this.aviso.fechar();
  }
}
