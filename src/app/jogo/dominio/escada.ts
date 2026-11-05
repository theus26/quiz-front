import { Nivel, Pergunta } from '../../core/modelos/quiz.modelos';

export const PULOS_INICIAIS = 3;

export const PONTOS_POR_NIVEL: Record<Nivel, number> = {
  FACIL: 5,
  MEDIO: 10,
  DIFICIL: 15,
};

export type SituacaoPasso = 'feita' | 'atual' | 'fila';

export interface PassoTrilha {
  readonly id: number;
  readonly ordem: number;
  readonly pontos: number;
  readonly situacao: SituacaoPasso;
}

export interface AcertoRegistrado {
  readonly id: number;
  readonly pontos: number;
}

export function pontosDoNivel(nivel: Nivel): number {
  return PONTOS_POR_NIVEL[nivel];
}

export function montarTrilha(
  feitas: readonly AcertoRegistrado[],
  atual: Pergunta | null,
  proximas: readonly Pergunta[],
): PassoTrilha[] {
  const idsFeitos = new Set(feitas.map((acerto) => acerto.id));
  const itens: Omit<PassoTrilha, 'ordem'>[] = [
    ...feitas.map((acerto) => ({ id: acerto.id, pontos: acerto.pontos, situacao: 'feita' as const })),
    ...(atual && !idsFeitos.has(atual.id)
      ? [{ id: atual.id, pontos: pontosDoNivel(atual.nivel), situacao: 'atual' as const }]
      : []),
    ...proximas
      .filter((pergunta) => !idsFeitos.has(pergunta.id))
      .map((pergunta) => ({ id: pergunta.id, pontos: pontosDoNivel(pergunta.nivel), situacao: 'fila' as const })),
  ];
  return itens.map((item, indice) => ({ ...item, ordem: indice + 1 })).reverse();
}

const PESO_NIVEL: Record<Nivel, number> = {
  FACIL: 0,
  MEDIO: 1,
  DIFICIL: 2,
};

export function ordenarParaEscada(perguntas: readonly Pergunta[]): Pergunta[] {
  return perguntas
    .map((pergunta, indice) => ({ pergunta: prepararPergunta(pergunta), indice }))
    .sort((a, b) => PESO_NIVEL[a.pergunta.nivel] - PESO_NIVEL[b.pergunta.nivel] || a.indice - b.indice)
    .map((item) => item.pergunta);
}

function prepararPergunta(pergunta: Pergunta): Pergunta {
  return {
    ...pergunta,
    alternativas: [...pergunta.alternativas].sort((a, b) => a.ordem - b.ordem || a.id - b.id),
  };
}
