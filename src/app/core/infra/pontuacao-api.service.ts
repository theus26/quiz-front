import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../api/api-url';
import { CriarPontuacao, FiltroHistorico, Pontuacao, RankingPainel } from '../modelos/quiz.modelos';
import { PontuacaoGateway } from '../portas/pontuacao.gateway';

@Injectable({ providedIn: 'root' })
export class PontuacaoApiService extends PontuacaoGateway {
  private readonly http = inject(HttpClient);

  registrar(dados: CriarPontuacao): Observable<Pontuacao> {
    return this.http.post<Pontuacao>(`${API_URL}/pontuacoes`, {
      rodadaToken: dados.rodadaToken,
      resultado: dados.resultado,
    });
  }

  ranking(): Observable<RankingPainel> {
    return this.http.get<RankingPainel>(`${API_URL}/pontuacoes/ranking`);
  }

  minhas(filtros: FiltroHistorico = {}): Observable<readonly Pontuacao[]> {
    return this.http.get<Pontuacao[]>(`${API_URL}/pontuacoes/minhas`, { params: parametros(filtros) });
  }

  historico(filtros: FiltroHistorico = {}): Observable<readonly Pontuacao[]> {
    return this.http.get<Pontuacao[]>(`${API_URL}/pontuacoes/historico`, { params: parametros(filtros) });
  }
}

function parametros(filtros: FiltroHistorico): Record<string, string> {
  const params: Record<string, string> = {};
  if (filtros.testamento) {
    params['testamento'] = filtros.testamento;
  }
  if (filtros.modalidade) {
    params['modalidade'] = filtros.modalidade;
  }
  if (filtros.resultado) {
    params['resultado'] = filtros.resultado;
  }
  if (filtros.busca?.trim()) {
    params['busca'] = filtros.busca.trim();
  }
  return params;
}
