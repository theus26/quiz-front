import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../api/api-url';
import { CriarPontuacao, Pontuacao, RankingItem } from '../modelos/quiz.modelos';
import { PontuacaoGateway } from '../portas/pontuacao.gateway';

@Injectable({ providedIn: 'root' })
export class PontuacaoApiService extends PontuacaoGateway {
  private readonly http = inject(HttpClient);

  registrar(dados: CriarPontuacao): Observable<Pontuacao> {
    return this.http.post<Pontuacao>(`${API_URL}/pontuacoes`, {
      filtroTestamento: dados.filtroTestamento,
      acertos: dados.acertos,
      pontos: dados.pontos,
      perguntaIds: [...dados.perguntaIds],
    });
  }

  ranking(): Observable<readonly RankingItem[]> {
    return this.http.get<RankingItem[]>(`${API_URL}/pontuacoes/ranking`);
  }

  minhas(): Observable<readonly Pontuacao[]> {
    return this.http.get<Pontuacao[]>(`${API_URL}/pontuacoes/minhas`);
  }
}
