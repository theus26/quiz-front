import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ROTULO_FILTRO, formatarData, formatarPontos } from '../compartilhado/apresentacao';
import { mensagemErro } from '../core/api/mensagem-erro';
import { Pontuacao } from '../core/modelos/quiz.modelos';
import { PontuacaoGateway } from '../core/portas/pontuacao.gateway';

@Component({
  selector: 'app-historico-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './historico-page.component.html',
})
export class HistoricoPageComponent {
  readonly partidas = signal<readonly Pontuacao[]>([]);
  readonly carregando = signal(true);
  readonly erro = signal<string | null>(null);
  readonly formatar = formatarPontos;
  readonly formatarData = formatarData;
  readonly rotuloFiltro = ROTULO_FILTRO;

  constructor() {
    inject(PontuacaoGateway).minhas().pipe(takeUntilDestroyed()).subscribe({
      next: (lista) => {
        this.partidas.set(lista);
        this.carregando.set(false);
      },
      error: (falha: unknown) => {
        this.erro.set(mensagemErro(falha, 'Não foi possível carregar o seu histórico.'));
        this.carregando.set(false);
      },
    });
  }
}
