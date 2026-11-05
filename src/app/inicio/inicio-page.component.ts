import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ROTULO_FILTRO, formatarPontos } from '../compartilhado/apresentacao';
import { mensagemErro } from '../core/api/mensagem-erro';
import { SessaoStore } from '../core/auth/sessao.store';
import { FiltroTestamento, RankingItem } from '../core/modelos/quiz.modelos';
import { PontuacaoGateway } from '../core/portas/pontuacao.gateway';

interface Jornada {
  readonly filtro: FiltroTestamento;
  readonly titulo: string;
  readonly texto: string;
  readonly detalhe: string;
}

@Component({
  selector: 'app-inicio-page',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './inicio-page.component.html',
})
export class InicioPageComponent {
  private readonly sessao = inject(SessaoStore);
  private readonly router = inject(Router);

  readonly autenticado = this.sessao.autenticado;
  readonly nome = this.sessao.nome;
  readonly ranking = signal<readonly RankingItem[]>([]);
  readonly carregandoRanking = signal(true);
  readonly erroRanking = signal<string | null>(null);
  readonly formatar = formatarPontos;
  readonly rotuloFiltro = ROTULO_FILTRO;

  readonly jornadas: readonly Jornada[] = [
    {
      filtro: 'ANTIGO',
      titulo: 'Antigo Testamento',
      texto: 'Lei, profetas e a história de Israel.',
      detalhe: 'Do Gênesis a Malaquias',
    },
    {
      filtro: 'NOVO',
      titulo: 'Novo Testamento',
      texto: 'Evangelhos, cartas e o Apocalipse.',
      detalhe: 'De Mateus a Apocalipse',
    },
    {
      filtro: 'AMBOS',
      titulo: 'Bíblia toda',
      texto: 'Os dois testamentos na mesma jornada.',
      detalhe: 'A escritura completa',
    },
  ];

  jogar(filtro: FiltroTestamento): void {
    void this.router.navigate(['/jogar'], {
      queryParams: { testamento: filtro, rodada: Date.now().toString() },
    });
  }

  constructor() {
    inject(PontuacaoGateway).ranking().pipe(takeUntilDestroyed()).subscribe({
      next: (lista) => {
        this.ranking.set(lista.slice(0, 5));
        this.carregandoRanking.set(false);
      },
      error: (falha: unknown) => {
        this.erroRanking.set(mensagemErro(falha, 'Não foi possível carregar o ranking.'));
        this.carregandoRanking.set(false);
      },
    });
  }
}
