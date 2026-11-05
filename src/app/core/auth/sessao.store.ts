import { Injectable, computed, signal } from '@angular/core';
import { Sessao } from '../modelos/quiz.modelos';

const CHAVE = 'milhao.sessao';

@Injectable({ providedIn: 'root' })
export class SessaoStore {
  private readonly sessao = signal<Sessao | null>(lerSessao());

  readonly atual = this.sessao.asReadonly();
  readonly autenticado = computed(() => sessaoValida(this.sessao()));
  readonly nome = computed(() => (this.autenticado() ? this.sessao()?.nome ?? '' : ''));

  constructor() {
    if (this.sessao() && !sessaoValida(this.sessao())) {
      this.definir(null);
    }
  }

  token(): string | null {
    const sessao = this.sessao();
    if (!sessaoValida(sessao)) {
      return null;
    }
    return sessao.token;
  }

  definir(sessao: Sessao | null): Sessao | null {
    this.sessao.set(sessao);
    const armazenamento = memoria();
    if (!armazenamento) {
      return sessao;
    }
    if (sessao) {
      armazenamento.setItem(CHAVE, JSON.stringify(sessao));
    } else {
      armazenamento.removeItem(CHAVE);
    }
    return sessao;
  }
}

function sessaoValida(sessao: Sessao | null): sessao is Sessao {
  return !!sessao && new Date(sessao.expiraEm).getTime() > Date.now();
}

function lerSessao(): Sessao | null {
  const armazenamento = memoria();
  if (!armazenamento) {
    return null;
  }
  const bruto = armazenamento.getItem(CHAVE);
  if (!bruto) {
    return null;
  }
  try {
    const sessao = JSON.parse(bruto) as Sessao;
    return sessao?.token ? sessao : null;
  } catch {
    return null;
  }
}

function memoria(): Storage | null {
  return typeof localStorage === 'undefined' ? null : localStorage;
}
