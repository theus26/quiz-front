import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { mensagemErro } from '../../core/api/mensagem-erro';
import { SessaoStore } from '../../core/auth/sessao.store';
import { FiltroTestamento, Pergunta } from '../../core/modelos/quiz.modelos';
import { PerguntaGateway } from '../../core/portas/pergunta.gateway';
import { EstadoJogo, MotivoFim, estadoInicial } from '../dominio/estado-jogo';
import { ordenarParaEscada, pontosDoNivel } from '../dominio/escada';
import { RegistroPontuacaoService, ResultadoRegistro } from './registro-pontuacao.service';

@Injectable({ providedIn: 'root' })
export class JogoService {
  private readonly perguntas = inject(PerguntaGateway);
  private readonly registro = inject(RegistroPontuacaoService);
  private readonly sessao = inject(SessaoStore);
  private readonly estadoInterno = signal<EstadoJogo>(estadoInicial());

  private jogada = 0;
  private encerrando = false;
  private gravando = false;

  readonly estado = this.estadoInterno.asReadonly();

  async iniciar(filtro: FiltroTestamento, rodada: string | null = null): Promise<void> {
    const jogada = ++this.jogada;
    this.encerrando = false;
    this.estadoInterno.set({ ...estadoInicial(), fase: 'carregando', filtro, rodada });

    try {
      const perguntas = ordenarParaEscada(await firstValueFrom(this.perguntas.listar(filtro)));
      if (jogada !== this.jogada) {
        return;
      }
      const atual = perguntas[0];
      if (!atual) {
        this.falharCarga(jogada, 'Não há perguntas para este testamento.');
        return;
      }
      this.estadoInterno.update((estado) => ({
        ...estado,
        fase: 'pergunta',
        atual,
        proximas: perguntas.slice(1),
        erro: null,
      }));
    } catch (erro) {
      this.falharCarga(jogada, mensagemErro(erro, 'Não foi possível carregar as perguntas.'));
    }
  }

  selecionar(alternativaId: number): void {
    const estado = this.estadoInterno();
    if (!this.podeAgir(estado)) {
      return;
    }
    this.estadoInterno.update((atual) => ({
      ...atual,
      selecionadaId: atual.selecionadaId === alternativaId ? null : alternativaId,
      erro: null,
    }));
  }

  async confirmar(): Promise<void> {
    const estado = this.estadoInterno();
    const pergunta = estado.atual;
    const alternativaId = estado.selecionadaId;
    if (!this.podeAgir(estado) || !pergunta || alternativaId == null) {
      return;
    }

    const jogada = this.jogada;
    this.estadoInterno.update((atual) => ({ ...atual, fase: 'conferindo', erro: null }));

    try {
      const correta = await firstValueFrom(this.perguntas.conferir(pergunta.id, alternativaId));
      if (jogada !== this.jogada) {
        return;
      }
      if (correta) {
        await this.avancarAcerto(pergunta, jogada);
        return;
      }
      await this.encerrarErro(pergunta, alternativaId, jogada);
    } catch (erro) {
      if (jogada !== this.jogada) {
        return;
      }
      this.estadoInterno.update((atual) => ({
        ...atual,
        fase: 'pergunta',
        erro: mensagemErro(erro, 'Não foi possível conferir a resposta.'),
      }));
    }
  }

  pular(): void {
    const estado = this.estadoInterno();
    if (!this.podeAgir(estado) || estado.pulosRestantes <= 0 || !estado.atual) {
      return;
    }
    const proxima = estado.proximas[0];
    if (!proxima) {
      void this.finalizar('esgotou', estado.pontos, estado.respondidasIds, estado.acertos);
      return;
    }
    this.estadoInterno.update((atual) => ({
      ...atual,
      atual: proxima,
      proximas: atual.proximas.slice(1),
      pulosRestantes: atual.pulosRestantes - 1,
      selecionadaId: null,
      alternativaReveladaId: null,
      alternativaErradaId: null,
      referenciaVisivel: false,
      erro: null,
    }));
  }

  usarReferencia(): void {
    const estado = this.estadoInterno();
    if (!this.podeAgir(estado) || !estado.referenciaDisponivel || !estado.atual) {
      return;
    }
    this.estadoInterno.update((atual) => ({
      ...atual,
      referenciaDisponivel: false,
      referenciaVisivel: true,
    }));
  }

  async usarRevelacao(): Promise<void> {
    const estado = this.estadoInterno();
    const pergunta = estado.atual;
    if (!this.podeAgir(estado) || !estado.revelacaoDisponivel || !pergunta) {
      return;
    }

    const jogada = this.jogada;
    this.estadoInterno.update((atual) => ({ ...atual, consultando: true, erro: null }));
    try {
      const alternativa = await firstValueFrom(this.perguntas.revelarCorreta(pergunta.id));
      if (jogada !== this.jogada) {
        return;
      }
      this.estadoInterno.update((atual) => ({
        ...atual,
        consultando: false,
        revelacaoDisponivel: false,
        alternativaReveladaId: alternativa.id,
      }));
    } catch (erro) {
      if (jogada !== this.jogada) {
        return;
      }
      this.estadoInterno.update((atual) => ({
        ...atual,
        consultando: false,
        erro: mensagemErro(erro, 'Não foi possível revelar a resposta.'),
      }));
    }
  }

  parar(): void {
    const estado = this.estadoInterno();
    if (!this.podeAgir(estado) || estado.acertos <= 0) {
      return;
    }
    void this.finalizar('parada', estado.pontos, estado.respondidasIds, estado.acertos);
  }

  abandonar(): void {
    this.jogada++;
    this.encerrando = false;
    this.estadoInterno.set(estadoInicial());
  }

  async salvarPendente(): Promise<void> {
    if (this.gravando || !this.sessao.autenticado() || !this.registro.temPendente()) {
      return;
    }
    this.gravando = true;
    try {
      if (this.estadoInterno().fase === 'resultado') {
        this.estadoInterno.update((estado) => ({ ...estado, salvamento: 'salvando', mensagemSalvar: null }));
      }
      const resultado = await this.registro.tentarPendente();
      if (resultado && this.estadoInterno().fase === 'resultado') {
        this.aplicarRegistro(resultado);
      }
    } finally {
      this.gravando = false;
    }
  }

  private async avancarAcerto(pergunta: Pergunta, jogada: number): Promise<void> {
    const ganho = pontosDoNivel(pergunta.nivel);
    const acertos = this.estadoInterno().acertos + 1;
    const pontos = this.estadoInterno().pontos + ganho;
    const respondidas = [...this.estadoInterno().respondidasIds, pergunta.id];
    const feitas = [...this.estadoInterno().feitas, { id: pergunta.id, pontos: ganho }];
    this.estadoInterno.update((estado) => ({
      ...estado,
      fase: 'acerto',
      acertos,
      pontos,
      feitas,
      respondidasIds: respondidas,
    }));
    await esperar(1100);
    if (jogada !== this.jogada) {
      return;
    }

    const proxima = this.estadoInterno().proximas[0];
    if (!proxima) {
      await this.finalizar('vitoria', pontos, respondidas, acertos);
      return;
    }
    this.estadoInterno.update((estado) => ({
      ...estado,
      fase: 'pergunta',
      atual: proxima,
      proximas: estado.proximas.slice(1),
      selecionadaId: null,
      alternativaReveladaId: null,
      alternativaErradaId: null,
      referenciaVisivel: false,
    }));
  }

  private async encerrarErro(pergunta: Pergunta, alternativaId: number, jogada: number): Promise<void> {
    let corretaId = this.estadoInterno().alternativaReveladaId;
    if (corretaId == null) {
      try {
        const alternativa = await firstValueFrom(this.perguntas.revelarCorreta(pergunta.id));
        corretaId = alternativa.id;
      } catch {
        corretaId = null;
      }
    }
    if (jogada !== this.jogada) {
      return;
    }

    const respondidas = [...this.estadoInterno().respondidasIds, pergunta.id];
    const acertos = this.estadoInterno().acertos;
    const pontos = this.estadoInterno().pontos;
    this.estadoInterno.update((estado) => ({
      ...estado,
      fase: 'erro',
      alternativaErradaId: alternativaId,
      alternativaReveladaId: corretaId,
      respondidasIds: respondidas,
    }));
    await esperar(1600);
    if (jogada !== this.jogada) {
      return;
    }
    await this.finalizar('erro', pontos, respondidas, acertos);
  }

  private async finalizar(
    motivo: MotivoFim,
    pontos: number,
    perguntaIds: readonly number[],
    acertos: number,
  ): Promise<void> {
    if (this.encerrando) {
      return;
    }
    this.encerrando = true;
    const jogada = this.jogada;
    const filtro = this.estadoInterno().filtro;
    this.estadoInterno.update((estado) => ({
      ...estado,
      fase: 'resultado',
      motivo,
      pontosLevar: pontos,
      acertos,
      respondidasIds: perguntaIds,
      consultando: false,
      salvamento: 'salvando',
      mensagemSalvar: null,
      erro: null,
    }));

    if (!filtro || perguntaIds.length === 0) {
      this.estadoInterno.update((estado) => ({
        ...estado,
        salvamento: 'idle',
        mensagemSalvar: 'Nenhuma resposta foi enviada, então não há partida para registrar.',
      }));
      return;
    }

    const resultado = await this.registro.registrar({
      filtroTestamento: filtro,
      acertos,
      pontos,
      perguntaIds,
    });
    if (jogada !== this.jogada || this.estadoInterno().fase !== 'resultado') {
      return;
    }
    this.aplicarRegistro(resultado);
  }

  private aplicarRegistro(resultado: ResultadoRegistro): void {
    if (resultado.status === 'salvo') {
      this.estadoInterno.update((estado) => ({ ...estado, salvamento: 'salvo', mensagemSalvar: null }));
      return;
    }
    if (resultado.status === 'falha') {
      this.estadoInterno.update((estado) => ({
        ...estado,
        salvamento: 'falha',
        mensagemSalvar: resultado.mensagem,
      }));
      return;
    }
    this.estadoInterno.update((estado) => ({ ...estado, salvamento: 'visitante', mensagemSalvar: null }));
  }

  private podeAgir(estado: EstadoJogo): boolean {
    return estado.fase === 'pergunta' && !estado.consultando;
  }

  private falharCarga(jogada: number, mensagem: string): void {
    if (jogada !== this.jogada) {
      return;
    }
    this.estadoInterno.update((estado) => ({
      ...estado,
      fase: 'ociosa',
      erro: mensagem,
    }));
  }
}

function esperar(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
