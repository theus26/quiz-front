import { ChangeDetectionStrategy, Component, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ROTULO_FILTRO, ROTULO_MODALIDADE, ROTULO_NIVEL, formatarPontos } from '../../compartilhado/apresentacao';
import { SessaoStore } from '../../core/auth/sessao.store';
import { isFiltroTestamento, isModalidade, isNivel } from '../../core/modelos/quiz.modelos';
import { CartaPerguntaComponent } from '../componentes/carta-pergunta.component';
import { EscadaPremiosComponent } from '../componentes/escada-premios.component';
import { PainelAjudasComponent } from '../componentes/painel-ajudas.component';
import { PainelResultadoComponent } from '../componentes/painel-resultado.component';
import { montarTrilha, pontosDoNivel } from '../dominio/escada';
import { JogoService } from '../servicos/jogo.service';

@Component({
  selector: 'app-jogo-page',
  imports: [
    RouterLink,
    EscadaPremiosComponent,
    PainelAjudasComponent,
    CartaPerguntaComponent,
    PainelResultadoComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './jogo-page.component.html',
})
export class JogoPageComponent implements OnInit {
  private readonly jogo = inject(JogoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sessao = inject(SessaoStore);

  readonly estado = this.jogo.estado;
  readonly autenticado = this.sessao.autenticado;
  readonly escadaAberta = signal(false);
  readonly confirmarParada = signal(false);
  readonly formatar = formatarPontos;
  readonly rotuloFiltro = ROTULO_FILTRO;
  readonly rotuloModalidade = ROTULO_MODALIDADE;
  readonly rotuloNivel = ROTULO_NIVEL;
  readonly pontosDoNivel = pontosDoNivel;
  readonly trilha = computed(() => {
    const jogo = this.estado();
    return montarTrilha(jogo.feitas, jogo.atual, jogo.proximas);
  });

  readonly emPergunta = computed(() => {
    const fase = this.estado().fase;
    return fase === 'pergunta' || fase === 'conferindo' || fase === 'acerto' || fase === 'erro';
  });

  readonly travado = computed(() => {
    const jogo = this.estado();
    return jogo.consultando || jogo.fase === 'conferindo' || jogo.fase === 'acerto' || jogo.fase === 'erro';
  });

  readonly respostaCerta = computed(() => {
    const jogo = this.estado();
    return jogo.atual?.alternativas.find((alternativa) => alternativa.id === jogo.alternativaReveladaId)?.texto ?? null;
  });

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    const filtro = params.get('testamento');
    const modalidadeInformada = params.get('modalidade');
    const nivelInformado = params.get('nivel');
    const rodada = params.get('rodada');
    const estado = this.estado();
    const modalidade = isModalidade(modalidadeInformada) ? modalidadeInformada : 'CLASSICO';
    const nivel = isNivel(nivelInformado) ? nivelInformado : null;
    if (!isFiltroTestamento(filtro) || (modalidade === 'NIVEL' && !nivel)) {
      if (estado.fase === 'ociosa') {
        void this.router.navigateByUrl('/');
      }
      return;
    }
    if (estado.fase !== 'ociosa' && estado.rodada === rodada) {
      return;
    }
    void this.jogo.iniciar(filtro, modalidade, nivel, rodada);
  }

  @HostListener('document:keydown', ['$event'])
  tecla(evento: KeyboardEvent): void {
    if (evento.target instanceof HTMLInputElement || evento.target instanceof HTMLTextAreaElement) {
      return;
    }
    if (evento.key === 'Escape') {
      this.confirmarParada.set(false);
      this.escadaAberta.set(false);
      return;
    }
    if (this.confirmarParada() || this.escadaAberta()) {
      return;
    }
    const jogo = this.estado();
    const alternativas = jogo.atual?.alternativas;
    if (!this.emPergunta() || this.travado() || !alternativas) {
      return;
    }
    const indice = ['1', '2', '3', '4', 'a', 'b', 'c', 'd'].indexOf(evento.key.toLowerCase());
    const posicao = indice >= 4 ? indice - 4 : indice;
    const alternativa = posicao >= 0 ? alternativas[posicao] : undefined;
    if (alternativa) {
      this.jogo.selecionar(alternativa.id);
    }
    if (evento.key === 'Enter') {
      void this.jogo.confirmar();
    }
  }

  selecionar(id: number): void {
    this.jogo.selecionar(id);
  }

  confirmar(): void {
    void this.jogo.confirmar();
  }

  pular(): void {
    this.jogo.pular();
  }

  referencia(): void {
    this.jogo.usarReferencia();
  }

  revelar(): void {
    void this.jogo.usarRevelacao();
  }

  pedirParada(): void {
    if (this.estado().acertos <= 0 || this.travado()) {
      return;
    }
    this.confirmarParada.set(true);
  }

  confirmarPremio(): void {
    this.confirmarParada.set(false);
    this.jogo.parar();
  }

  desistir(): void {
    this.jogo.abandonar();
    void this.router.navigateByUrl('/');
  }

  jogarDeNovo(): void {
    const filtro = this.estado().filtro ?? 'AMBOS';
    const modalidade = this.estado().modalidade ?? 'CLASSICO';
    const nivel = this.estado().nivel;
    const rodada = Date.now().toString();
    this.escadaAberta.set(false);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        testamento: filtro,
        modalidade,
        nivel: modalidade === 'NIVEL' ? nivel : null,
        rodada,
      },
      replaceUrl: true,
    });
    void this.jogo.iniciar(filtro, modalidade, nivel, rodada);
  }

  tentarSalvar(): void {
    void this.jogo.salvarPendente();
  }

  urlAtual(): string {
    return this.router.url;
  }
}
