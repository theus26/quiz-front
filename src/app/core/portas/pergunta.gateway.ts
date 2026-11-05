import { Observable } from 'rxjs';
import { Alternativa, FiltroTestamento, Pergunta } from '../modelos/quiz.modelos';

export abstract class PerguntaGateway {
  abstract listar(filtro: FiltroTestamento): Observable<readonly Pergunta[]>;
  abstract conferir(perguntaId: number, alternativaId: number): Observable<boolean>;
  abstract revelarCorreta(perguntaId: number): Observable<Alternativa>;
}
