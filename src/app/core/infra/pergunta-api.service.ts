import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../api/api-url';
import { Alternativa, FiltroTestamento, Pergunta } from '../modelos/quiz.modelos';
import { PerguntaGateway } from '../portas/pergunta.gateway';

@Injectable({ providedIn: 'root' })
export class PerguntaApiService extends PerguntaGateway {
  private readonly http = inject(HttpClient);

  listar(filtro: FiltroTestamento): Observable<readonly Pergunta[]> {
    return this.http.get<Pergunta[]>(`${API_URL}/perguntas`, {
      params: { testamento: filtro },
    });
  }

  conferir(perguntaId: number, alternativaId: number): Observable<boolean> {
    return this.http.post<boolean>(`${API_URL}/perguntas/conferir`, { perguntaId, alternativaId });
  }

  revelarCorreta(perguntaId: number): Observable<Alternativa> {
    return this.http.get<Alternativa>(`${API_URL}/perguntas/${perguntaId}/correta`);
  }
}
