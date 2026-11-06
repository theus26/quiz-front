import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ROTULO_FILTRO, ROTULO_NIVEL, formatarPontos } from '../compartilhado/apresentacao';
import { mensagemErro } from '../core/api/mensagem-erro';
import { SessaoStore } from '../core/auth/sessao.store';
import { FiltroTestamento, Modalidade, Nivel, RankingItem } from '../core/modelos/quiz.modelos';
import { PontuacaoGateway } from '../core/portas/pontuacao.gateway';

interface Jornada {
  readonly filtro: FiltroTestamento;
  readonly titulo: string;
  readonly texto: string;
  readonly detalhe: string;
}

interface Modo {
  readonly id: Modalidade;
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
  readonly jornadaEscolhida = signal<FiltroTestamento | null>(null);
  readonly etapa = signal<'modo' | 'nivel'>('modo');
  readonly formatar = formatarPontos;
  readonly rotuloFiltro = ROTULO_FILTRO;
  readonly rotuloNivel = ROTULO_NIVEL;
  readonly niveis: readonly Nivel[] = ['FACIL', 'MEDIO', 'DIFICIL'];
  readonly modalAberto = computed(() => this.jornadaEscolhida() !== null);

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

  readonly modos: readonly Modo[] = [
    {
      id: 'CLASSICO',
      titulo: 'Clássico',
      texto: 'Sete fáceis, cinco médias e cinco difíceis. Três pulos, referência e revelar.',
      detalhe: 'A jornada completa',
    },
    {
      id: 'RAPIDO',
      titulo: 'Desafio rápido',
      texto: 'Seis perguntas, um pulo e a referência. A resposta não é revelada.',
      detalhe: 'Uma rodada curta',
    },
    {
      id: 'NIVEL',
      titulo: 'Desafio por nível',
      texto: 'Oito perguntas fáceis ou médias, ou seis difíceis. Dois pulos e as duas ajudas.',
      detalhe: 'Você escolhe a dificuldade',
    },
  ];

  constructor() {
    inject(PontuacaoGateway).ranking().pipe(takeUntilDestroyed()).subscribe({
      next: (painel) => {
        this.ranking.set(painel.classificacao.slice(0, 5));
        this.carregandoRanking.set(false);
      },
      error: (falha: unknown) => {
        this.erroRanking.set(mensagemErro(falha, 'Não foi possível carregar o ranking.'));
        this.carregandoRanking.set(false);
      },
    });
  }

  jogar(filtro: FiltroTestamento): void {
    this.etapa.set('modo');
    this.jornadaEscolhida.set(filtro);
  }

  fecharModal(): void {
    this.jornadaEscolhida.set(null);
    this.etapa.set('modo');
  }

  escolherModo(modalidade: Modalidade): void {
    if (modalidade === 'NIVEL') {
      this.etapa.set('nivel');
      return;
    }
    this.iniciar(modalidade, null);
  }

  escolherNivel(nivel: Nivel): void {
    this.iniciar('NIVEL', nivel);
  }

  voltarModos(): void {
    this.etapa.set('modo');
  }

  private iniciar(modalidade: Modalidade, nivel: Nivel | null): void {
    const filtro = this.jornadaEscolhida();
    if (!filtro) {
      return;
    }
    this.fecharModal();
    void this.router.navigate(['/jogar'], {
      queryParams: {
        testamento: filtro,
        modalidade,
        nivel,
        rodada: Date.now().toString(),
      },
    });
  }
}
