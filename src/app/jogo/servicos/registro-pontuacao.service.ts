import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { mensagemErro } from '../../core/api/mensagem-erro';
import { CriarPontuacao } from '../../core/modelos/quiz.modelos';
import { PontuacaoGateway } from '../../core/portas/pontuacao.gateway';
import { SessaoStore } from '../../core/auth/sessao.store';

const CHAVE = 'bereia.pendente';
const CHAVE_ANTIGA = 'milhao.pendente';

export type ResultadoRegistro =
  | { readonly status: 'salvo'; readonly pontos: number }
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
      const salva = await firstValueFrom(this.pontuacoes.registrar(dados));
      limparPendente();
      return { status: 'salvo', pontos: salva.pontos };
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
  const armazenamento = memoria();
  armazenamento?.removeItem(CHAVE_ANTIGA);
  const bruto = armazenamento?.getItem(CHAVE);
  if (!bruto) {
    return null;
  }
  try {
    const dados = JSON.parse(bruto) as CriarPontuacao;
    if (!dados?.rodadaToken || !dados.resultado) {
      armazenamento?.removeItem(CHAVE);
      return null;
    }
    return dados;
  } catch {
    return null;
  }
}

function limparPendente(): void {
  const armazenamento = memoria();
  armazenamento?.removeItem(CHAVE);
  armazenamento?.removeItem(CHAVE_ANTIGA);
}

function memoria(): Storage | null {
  return typeof sessionStorage === 'undefined' ? null : sessionStorage;
}
