export type Testamento = 'ANTIGO' | 'NOVO';
export type FiltroTestamento = Testamento | 'AMBOS';
export type Nivel = 'FACIL' | 'MEDIO' | 'DIFICIL';
export type Papel = 'ADMIN' | 'USER';
export type Modalidade = 'CLASSICO' | 'RAPIDO' | 'NIVEL';
export type ResultadoPartida = 'VITORIA' | 'ERRO' | 'PARADA' | 'ESGOTOU';
export type StatusPergunta = 'PENDENTE' | 'APROVADA' | 'REJEITADA';

export interface Alternativa {
  readonly id: number;
  readonly texto: string;
  readonly ordem: number;
}

export interface AlternativaEdicao {
  readonly texto: string;
  readonly correta: boolean;
}

export interface Pergunta {
  readonly id: number;
  readonly enunciado: string;
  readonly testamento: Testamento;
  readonly nivel: Nivel;
  readonly referencia: string | null;
  readonly categoria: string | null;
  readonly alternativas: readonly Alternativa[];
}

export interface CriarPergunta {
  readonly enunciado: string;
  readonly testamento: Testamento;
  readonly nivel: Nivel;
  readonly referencia: string | null;
  readonly categoria: string;
  readonly explicacao: string | null;
  readonly alternativas: readonly AlternativaEdicao[];
}

export interface PerguntaResumo {
  readonly id: number;
  readonly enunciado: string;
  readonly testamento: Testamento;
  readonly nivel: Nivel;
  readonly categoria: string | null;
  readonly status: StatusPergunta;
  readonly autorNome: string;
  readonly criadaEm: string;
}

export interface PerguntaDetalhe extends PerguntaResumo {
  readonly referencia: string | null;
  readonly explicacao: string | null;
  readonly motivoRejeicao: string | null;
  readonly revisorNome: string | null;
  readonly revisadaEm: string | null;
  readonly propria: boolean;
  readonly alternativas: readonly (Alternativa & { readonly correta: boolean })[];
}

export interface PainelModeracao {
  readonly pendentes: number;
  readonly aprovadas: number;
  readonly rejeitadas: number;
  readonly perguntas: readonly PerguntaResumo[];
}

export interface AbrirPartida {
  readonly filtroTestamento: FiltroTestamento;
  readonly modalidade: Modalidade;
  readonly nivel: Nivel | null;
}

export interface PartidaAberta {
  readonly token: string;
  readonly filtroTestamento: FiltroTestamento;
  readonly modalidade: Modalidade;
  readonly nivel: Nivel | null;
  readonly perguntas: readonly Pergunta[];
}

export interface CriarPontuacao {
  readonly rodadaToken: string;
  readonly resultado: ResultadoPartida;
}

export interface Pontuacao {
  readonly id: number;
  readonly usuarioId: number;
  readonly nome: string;
  readonly filtroTestamento: FiltroTestamento;
  readonly modalidade: Modalidade;
  readonly nivel: Nivel | null;
  readonly acertos: number;
  readonly erros: number;
  readonly respondidas: number;
  readonly pontos: number;
  readonly resultado: ResultadoPartida;
  readonly finalizadaEm: string;
}

export interface RankingItem {
  readonly posicao: number;
  readonly usuarioId: number;
  readonly nome: string;
  readonly pontos: number;
  readonly partidas: number;
  readonly acertos: number;
  readonly respondidas: number;
  readonly taxaAcerto: number;
  readonly melhorPontuacao: number;
}

export interface RankingPessoal {
  readonly elegivel: boolean;
  readonly posicao: number | null;
  readonly pontos: number;
  readonly partidas: number;
  readonly faltamParaProximo: number | null;
  readonly nomeAcima: string | null;
  readonly evolucao: number | null;
  readonly recorde: number;
  readonly melhorAcertos: number;
  readonly sequenciaAtual: number;
  readonly taxaAcerto: number;
  readonly conquistas: readonly string[];
  readonly mensagem: string;
}

export interface RankingPainel {
  readonly classificacao: readonly RankingItem[];
  readonly pessoal: RankingPessoal | null;
}

export interface Usuario {
  readonly id: number;
  readonly nome: string;
  readonly email: string;
  readonly ativo: boolean;
  readonly role: Papel;
  readonly criadoEm: string;
}

export interface Pagina<T> {
  readonly dados: readonly T[];
  readonly totalRegistros: number;
  readonly totalPaginas: number;
}

export interface FiltroHistorico {
  readonly testamento?: FiltroTestamento | null;
  readonly modalidade?: Modalidade | null;
  readonly resultado?: ResultadoPartida | null;
  readonly busca?: string | null;
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

export function isModalidade(valor: string | null): valor is Modalidade {
  return valor === 'CLASSICO' || valor === 'RAPIDO' || valor === 'NIVEL';
}

export function isNivel(valor: string | null): valor is Nivel {
  return valor === 'FACIL' || valor === 'MEDIO' || valor === 'DIFICIL';
}

export const CATEGORIAS = [
  'Antigo Testamento',
  'Novo Testamento',
  'Gênesis',
  'Êxodo',
  'Reis de Israel',
  'Profetas',
  'Salmos',
  'Provérbios',
  'Vida de Jesus',
  'Parábolas',
  'Apóstolos',
  'Igreja primitiva',
  'Mulheres da Bíblia',
  'Personagens bíblicos',
  'Milagres',
  'Viagens missionárias',
  'Cartas paulinas',
  'História bíblica',
] as const;
