import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ROTULO_FILTRO,
  ROTULO_MODALIDADE,
  ROTULO_NIVEL,
  ROTULO_RESULTADO,
  formatarData,
  formatarPontos,
} from '../compartilhado/apresentacao';
import { mensagemErro } from '../core/api/mensagem-erro';
import { SessaoStore } from '../core/auth/sessao.store';
import {
  FiltroHistorico,
  FiltroTestamento,
  Modalidade,
  Pontuacao,
  ResultadoPartida,
} from '../core/modelos/quiz.modelos';
import { PontuacaoGateway } from '../core/portas/pontuacao.gateway';

@Component({
  selector: 'app-historico-page',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './historico-page.component.html',
})
export class HistoricoPageComponent {
  private readonly pontuacoes = inject(PontuacaoGateway);
  private readonly sessao = inject(SessaoStore);

  readonly administrador = this.sessao.administrador;
  readonly partidas = signal<readonly Pontuacao[]>([]);
  readonly carregando = signal(true);
  readonly erro = signal<string | null>(null);
  readonly testamento = signal<FiltroTestamento | ''>('');
  readonly modalidade = signal<Modalidade | ''>('');
  readonly resultado = signal<ResultadoPartida | ''>('');
  readonly busca = signal('');
  readonly formatar = formatarPontos;
  readonly formatarData = formatarData;
  readonly rotuloFiltro = ROTULO_FILTRO;
  readonly rotuloModalidade = ROTULO_MODALIDADE;
  readonly rotuloNivel = ROTULO_NIVEL;
  readonly rotuloResultado = ROTULO_RESULTADO;

  constructor() {
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.erro.set(null);
    const filtros: FiltroHistorico = {
      testamento: this.testamento() || null,
      modalidade: this.modalidade() || null,
      resultado: this.resultado() || null,
      busca: this.administrador() ? this.busca() : null,
    };
    const pedido = this.administrador()
      ? this.pontuacoes.historico(filtros)
      : this.pontuacoes.minhas(filtros);
    pedido.subscribe({
      next: (lista) => {
        this.partidas.set(lista);
        this.carregando.set(false);
      },
      error: (falha: unknown) => {
        this.erro.set(mensagemErro(falha, 'Não foi possível carregar o histórico.'));
        this.carregando.set(false);
      },
    });
  }

  limpar(): void {
    this.testamento.set('');
    this.modalidade.set('');
    this.resultado.set('');
    this.busca.set('');
    this.carregar();
  }
}
