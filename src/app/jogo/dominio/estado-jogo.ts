import { FiltroTestamento, Pergunta } from '../../core/modelos/quiz.modelos';
import { AcertoRegistrado, PULOS_INICIAIS } from './escada';

export type FaseJogo =
  | 'ociosa'
  | 'carregando'
  | 'pergunta'
  | 'conferindo'
  | 'acerto'
  | 'erro'
  | 'resultado';

export type MotivoFim = 'vitoria' | 'erro' | 'parada' | 'esgotou';

export type Salvamento = 'idle' | 'salvando' | 'salvo' | 'visitante' | 'falha';

export interface EstadoJogo {
  readonly fase: FaseJogo;
  readonly filtro: FiltroTestamento | null;
  readonly rodada: string | null;
  readonly proximas: readonly Pergunta[];
  readonly atual: Pergunta | null;
  readonly acertos: number;
  readonly pontos: number;
  readonly feitas: readonly AcertoRegistrado[];
  readonly selecionadaId: number | null;
  readonly alternativaReveladaId: number | null;
  readonly alternativaErradaId: number | null;
  readonly referenciaVisivel: boolean;
  readonly pulosRestantes: number;
  readonly referenciaDisponivel: boolean;
  readonly revelacaoDisponivel: boolean;
  readonly respondidasIds: readonly number[];
  readonly motivo: MotivoFim | null;
  readonly pontosLevar: number;
  readonly erro: string | null;
  readonly consultando: boolean;
  readonly salvamento: Salvamento;
  readonly mensagemSalvar: string | null;
}

export function estadoInicial(): EstadoJogo {
  return {
    fase: 'ociosa',
    filtro: null,
    rodada: null,
    proximas: [],
    atual: null,
    acertos: 0,
    pontos: 0,
    feitas: [],
    selecionadaId: null,
    alternativaReveladaId: null,
    alternativaErradaId: null,
    referenciaVisivel: false,
    pulosRestantes: PULOS_INICIAIS,
    referenciaDisponivel: true,
    revelacaoDisponivel: true,
    respondidasIds: [],
    motivo: null,
    pontosLevar: 0,
    erro: null,
    consultando: false,
    salvamento: 'idle',
    mensagemSalvar: null,
  };
}
