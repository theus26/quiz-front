import { FiltroTestamento, Nivel } from '../core/modelos/quiz.modelos';

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
