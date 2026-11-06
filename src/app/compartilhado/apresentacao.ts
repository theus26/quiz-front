import { FiltroTestamento, Modalidade, Nivel, ResultadoPartida, StatusPergunta } from '../core/modelos/quiz.modelos';

export const ROTULO_FILTRO: Record<FiltroTestamento, string> = {
  ANTIGO: 'Antigo Testamento',
  NOVO: 'Novo Testamento',
  AMBOS: 'Bíblia toda',
};

export const ROTULO_NIVEL: Record<Nivel, string> = {
  FACIL: 'Fácil',
  MEDIO: 'Médio',
  DIFICIL: 'Difícil',
};

export const ROTULO_MODALIDADE: Record<Modalidade, string> = {
  CLASSICO: 'Clássico',
  RAPIDO: 'Desafio rápido',
  NIVEL: 'Desafio por nível',
};

export const ROTULO_RESULTADO: Record<ResultadoPartida, string> = {
  VITORIA: 'Vitória',
  ERRO: 'Errou',
  PARADA: 'Parou',
  ESGOTOU: 'Perguntas esgotadas',
};

export const ROTULO_STATUS: Record<StatusPergunta, string> = {
  PENDENTE: 'Pendente',
  APROVADA: 'Aprovada',
  REJEITADA: 'Rejeitada',
};

export const ROTULO_PAPEL = {
  ADMIN: 'Administrador',
  USER: 'Jogador',
} as const;

export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  const letras = partes.slice(0, 2).map((parte) => parte[0]?.toUpperCase() ?? '');
  return letras.join('') || '?';
}

export function formatarTaxa(taxa: number): string {
  return `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(taxa)}%`;
}

export function formatarPontos(pontos: number): string {
  return new Intl.NumberFormat('pt-BR').format(pontos);
}

export function formatarData(iso: string): string {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) {
    return iso;
  }
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(data);
}

export function letraAlternativa(indice: number): string {
  return String.fromCharCode(65 + indice);
}

export function retornoSeguro(valor: string | null): string {
  if (!valor || !valor.startsWith('/') || valor.startsWith('//')) {
    return '/';
  }
  return valor;
}
