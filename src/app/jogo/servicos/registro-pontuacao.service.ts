import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { mensagemErro } from '../../core/api/mensagem-erro';
import { CriarPontuacao } from '../../core/modelos/quiz.modelos';
import { PontuacaoGateway } from '../../core/portas/pontuacao.gateway';
import { SessaoStore } from '../../core/auth/sessao.store';

const CHAVE = 'milhao.pendente';

export type ResultadoRegistro =
  | { readonly status: 'salvo' }
  | { readonly status: 'visitante' }
  | { readonly status: 'falha'; readonly mensagem: string };

@Injectable({ providedIn: 'root' })
export class RegistroPontuacaoService {
  private readonly pontuacoes = inject(PontuacaoGateway);
  private readonly sessao = inject(SessaoStore);

  temPendente(): boolean {
    return lerPendente() !== null;
  }

  async registrar(dados: CriarPontuacao): Promise<ResultadoRegistro> {
    if (!this.sessao.autenticado()) {
      gravarPendente(dados);
      return { status: 'visitante' };
    }
    return this.enviar(dados);
  }

  async tentarPendente(): Promise<ResultadoRegistro | null> {
    const pendente = lerPendente();
    if (!pendente || !this.sessao.autenticado()) {
      return null;
    }
    return this.enviar(pendente);
  }

  private async enviar(dados: CriarPontuacao): Promise<ResultadoRegistro> {
    try {
      await firstValueFrom(this.pontuacoes.registrar(dados));
      limparPendente();
      return { status: 'salvo' };
    } catch (erro) {
      gravarPendente(dados);
      return {
        status: 'falha',
        mensagem: mensagemErro(erro, 'Não foi possível registrar a pontuação.'),
      };
    }
  }
}

function gravarPendente(dados: CriarPontuacao): void {
  memoria()?.setItem(CHAVE, JSON.stringify(dados));
}

function lerPendente(): CriarPontuacao | null {
  const bruto = memoria()?.getItem(CHAVE);
  if (!bruto) {
    return null;
  }
  try {
    const dados = JSON.parse(bruto) as CriarPontuacao;
    if (!dados?.filtroTestamento || !Array.isArray(dados.perguntaIds)) {
      return null;
    }
    return dados;
  } catch {
    return null;
  }
}

function limparPendente(): void {
  memoria()?.removeItem(CHAVE);
}

function memoria(): Storage | null {
  return typeof sessionStorage === 'undefined' ? null : sessionStorage;
}
