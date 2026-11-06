import { Observable } from 'rxjs';
import { CriarPontuacao, FiltroHistorico, Pontuacao, RankingPainel } from '../modelos/quiz.modelos';

export abstract class PontuacaoGateway {
  abstract registrar(dados: CriarPontuacao): Observable<Pontuacao>;
  abstract ranking(): Observable<RankingPainel>;
  abstract minhas(filtros?: FiltroHistorico): Observable<readonly Pontuacao[]>;
  abstract historico(filtros?: FiltroHistorico): Observable<readonly Pontuacao[]>;
}
