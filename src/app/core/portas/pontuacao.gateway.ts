import { Observable } from 'rxjs';
import { CriarPontuacao, Pontuacao, RankingItem } from '../modelos/quiz.modelos';

export abstract class PontuacaoGateway {
  abstract registrar(dados: CriarPontuacao): Observable<Pontuacao>;
  abstract ranking(): Observable<readonly RankingItem[]>;
  abstract minhas(): Observable<readonly Pontuacao[]>;
}
