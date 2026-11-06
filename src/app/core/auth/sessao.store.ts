import { Injectable, computed, signal } from '@angular/core';
import { Sessao } from '../modelos/quiz.modelos';

const CHAVE = 'bereia.sessao';
const CHAVE_ANTIGA = 'milhao.sessao';

@Injectable({ providedIn: 'root' })
export class SessaoStore {
  private readonly sessao = signal<Sessao | null>(lerSessao());

  readonly atual = this.sessao.asReadonly();
  readonly autenticado = computed(() => sessaoValida(this.sessao()));
  readonly administrador = computed(() => this.autenticado() && this.sessao()?.role === 'ADMIN');
  readonly usuarioId = computed(() => (this.autenticado() ? this.sessao()?.usuarioId ?? null : null));
  readonly nome = computed(() => nomeExibicao(this.autenticado() ? this.sessao() : null));

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
    armazenamento.removeItem(CHAVE_ANTIGA);
    if (sessao) {
      armazenamento.setItem(CHAVE, JSON.stringify(sessao));
    } else {
      armazenamento.removeItem(CHAVE);
    }
    return sessao;
  }
}

function nomeExibicao(sessao: Sessao | null): string {
  if (!sessao) {
    return '';
  }
  const nome = sessao.nome.trim();
  if (!nome || nome.toLowerCase() === sessao.email.trim().toLowerCase() || nome.includes('@')) {
    return '';
  }
  return nome;
}

function sessaoValida(sessao: Sessao | null): sessao is Sessao {
  return !!sessao && new Date(sessao.expiraEm).getTime() > Date.now();
}

function lerSessao(): Sessao | null {
  const armazenamento = memoria();
  if (!armazenamento) {
    return null;
  }
  const bruto = armazenamento.getItem(CHAVE) ?? armazenamento.getItem(CHAVE_ANTIGA);
  if (!bruto) {
    return null;
  }
  try {
    const sessao = JSON.parse(bruto) as Sessao;
    if (!sessao?.token) {
      return null;
    }
    if (!armazenamento.getItem(CHAVE)) {
      armazenamento.setItem(CHAVE, JSON.stringify(sessao));
      armazenamento.removeItem(CHAVE_ANTIGA);
    }
    return sessao;
  } catch {
    return null;
  }
}

function memoria(): Storage | null {
  return typeof localStorage === 'undefined' ? null : localStorage;
}
