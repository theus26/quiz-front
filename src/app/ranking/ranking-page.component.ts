import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { formatarPontos, formatarTaxa, iniciais } from '../compartilhado/apresentacao';
import { RankingItem, RankingPainel } from '../core/modelos/quiz.modelos';
import { PontuacaoGateway } from '../core/portas/pontuacao.gateway';
import { mensagemErro } from '../core/api/mensagem-erro';
import { SessaoStore } from '../core/auth/sessao.store';

@Component({
  selector: 'app-ranking-page',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ranking-page.component.html',
})
export class RankingPageComponent {
  private readonly sessao = inject(SessaoStore);

  readonly painel = signal<RankingPainel | null>(null);
  readonly carregando = signal(true);
  readonly erro = signal<string | null>(null);
  readonly formatar = formatarPontos;
  readonly formatarTaxa = formatarTaxa;
  readonly iniciais = iniciais;
  readonly autenticado = this.sessao.autenticado;
  readonly meuId = this.sessao.usuarioId;

  readonly classificacao = computed(() => this.painel()?.classificacao ?? []);
  readonly pessoal = computed(() => this.painel()?.pessoal ?? null);
  readonly primeiro = computed(() => this.classificacao().find((item) => item.posicao === 1) ?? null);
  readonly segundo = computed(() => this.classificacao().find((item) => item.posicao === 2) ?? null);
  readonly terceiro = computed(() => this.classificacao().find((item) => item.posicao === 3) ?? null);

  constructor() {
    inject(PontuacaoGateway).ranking().pipe(takeUntilDestroyed()).subscribe({
      next: (painel) => {
        this.painel.set(painel);
        this.carregando.set(false);
      },
      error: (falha: unknown) => {
        this.erro.set(mensagemErro(falha, 'Não foi possível carregar o ranking.'));
        this.carregando.set(false);
      },
    });
  }

  textoEvolucao(valor: number | null, partidas: number): string | null {
    if (valor == null) {
      return partidas > 0 ? 'Ainda não há uma posição anterior para comparar.' : null;
    }
    if (valor > 0) {
      return valor === 1
        ? 'Você subiu 1 posição desde a partida anterior.'
        : `Você subiu ${valor} posições desde a partida anterior.`;
    }
    if (valor < 0) {
      const queda = Math.abs(valor);
      return queda === 1
        ? 'Você desceu 1 posição desde a partida anterior.'
        : `Você desceu ${queda} posições desde a partida anterior.`;
    }
    return 'Sua posição não mudou na última partida.';
  }
}
