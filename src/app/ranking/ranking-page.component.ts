import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { formatarPontos } from '../compartilhado/apresentacao';
import { RankingItem } from '../core/modelos/quiz.modelos';
import { PontuacaoGateway } from '../core/portas/pontuacao.gateway';
import { mensagemErro } from '../core/api/mensagem-erro';

@Component({
  selector: 'app-ranking-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ranking-page.component.html',
})
export class RankingPageComponent {
  readonly ranking = signal<readonly RankingItem[]>([]);
  readonly carregando = signal(true);
  readonly erro = signal<string | null>(null);
  readonly formatar = formatarPontos;

  constructor() {
    inject(PontuacaoGateway).ranking().pipe(takeUntilDestroyed()).subscribe({
      next: (lista) => {
        this.ranking.set(lista);
        this.carregando.set(false);
      },
      error: (falha: unknown) => {
        this.erro.set(mensagemErro(falha, 'Não foi possível carregar o ranking.'));
        this.carregando.set(false);
      },
    });
  }
}
