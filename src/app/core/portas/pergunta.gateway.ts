import { Observable } from 'rxjs';
import { AbrirPartida, Alternativa, FiltroTestamento, PartidaAberta, Pergunta } from '../modelos/quiz.modelos';

export abstract class PerguntaGateway {
  abstract listar(filtro: FiltroTestamento): Observable<readonly Pergunta[]>;
  abstract abrir(dados: AbrirPartida): Observable<PartidaAberta>;
  abstract conferir(perguntaId: number, alternativaId: number, rodadaToken: string): Observable<boolean>;
  abstract revelarCorreta(perguntaId: number, rodadaToken: string): Observable<Alternativa>;
}
