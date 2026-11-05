export type Testamento = 'ANTIGO' | 'NOVO';
export type FiltroTestamento = Testamento | 'AMBOS';
export type Nivel = 'FACIL' | 'MEDIO' | 'DIFICIL';
export type Papel = 'ADMIN' | 'USER';

export interface Alternativa {
  readonly id: number;
  readonly texto: string;
  readonly ordem: number;
}

export interface Pergunta {
  readonly id: number;
  readonly enunciado: string;
  readonly testamento: Testamento;
  readonly nivel: Nivel;
  readonly referencia: string | null;
  readonly alternativas: readonly Alternativa[];
}

export interface CriarPontuacao {
  readonly filtroTestamento: FiltroTestamento;
  readonly acertos: number;
  readonly pontos: number;
  readonly perguntaIds: readonly number[];
}

export interface Pontuacao {
  readonly id: number;
  readonly usuarioId: number;
  readonly nome: string;
  readonly filtroTestamento: FiltroTestamento;
  readonly acertos: number;
  readonly pontos: number;
  readonly finalizadaEm: string;
}

export interface RankingItem {
  readonly posicao: number;
  readonly usuarioId: number;
  readonly nome: string;
  readonly pontos: number;
}

export interface Usuario {
  readonly id: number;
  readonly nome: string;
  readonly email: string;
  readonly ativo: boolean;
  readonly role: Papel;
}

export interface Login {
  readonly email: string;
  readonly senha: string;
}

export interface CriarUsuario {
  readonly nome: string;
  readonly email: string;
  readonly senha: string;
}

export interface TokenResposta {
  readonly token: string;
  readonly tipo: string;
  readonly usuarioId: number;
  readonly role: Papel;
  readonly expiraEm: string;
}

export interface Sessao {
  readonly token: string;
  readonly tipo: string;
  readonly usuarioId: number;
  readonly role: Papel;
  readonly expiraEm: string;
  readonly nome: string;
  readonly email: string;
}

export function isFiltroTestamento(valor: string | null): valor is FiltroTestamento {
  return valor === 'ANTIGO' || valor === 'NOVO' || valor === 'AMBOS';
}
