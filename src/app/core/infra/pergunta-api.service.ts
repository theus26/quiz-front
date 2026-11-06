import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../api/api-url';
import {
  AbrirPartida,
  Alternativa,
  CriarPergunta,
  FiltroTestamento,
  PainelModeracao,
  PartidaAberta,
  Pergunta,
  PerguntaDetalhe,
  PerguntaResumo,
  StatusPergunta,
} from '../modelos/quiz.modelos';
import { PerguntaGateway } from '../portas/pergunta.gateway';

@Injectable({ providedIn: 'root' })
export class PerguntaApiService extends PerguntaGateway {
  private readonly http = inject(HttpClient);

  listar(filtro: FiltroTestamento): Observable<readonly Pergunta[]> {
    return this.http.get<Pergunta[]>(`${API_URL}/perguntas`, {
      params: { testamento: filtro },
    });
  }

  abrir(dados: AbrirPartida): Observable<PartidaAberta> {
    return this.http.post<PartidaAberta>(`${API_URL}/partidas`, {
      filtroTestamento: dados.filtroTestamento,
      modalidade: dados.modalidade,
      nivel: dados.nivel,
    });
  }

  conferir(perguntaId: number, alternativaId: number, rodadaToken: string): Observable<boolean> {
    return this.http.post<boolean>(`${API_URL}/perguntas/conferir`, {
      perguntaId,
      alternativaId,
      rodadaToken,
    });
  }

  revelarCorreta(perguntaId: number, rodadaToken: string): Observable<Alternativa> {
    return this.http.get<Alternativa>(`${API_URL}/perguntas/${perguntaId}/correta`, {
      params: { rodada: rodadaToken },
    });
  }

  enviar(dados: CriarPergunta): Observable<PerguntaDetalhe> {
    return this.http.post<PerguntaDetalhe>(`${API_URL}/perguntas/enviar`, dados);
  }

  minhas(): Observable<readonly PerguntaResumo[]> {
    return this.http.get<PerguntaResumo[]>(`${API_URL}/perguntas/minhas`);
  }

  moderar(status: StatusPergunta | null, busca: string): Observable<PainelModeracao> {
    const params: Record<string, string> = {};
    if (status) {
      params['status'] = status;
    }
    if (busca.trim()) {
      params['busca'] = busca.trim();
    }
    return this.http.get<PainelModeracao>(`${API_URL}/perguntas/moderacao`, { params });
  }

  detalheModeracao(id: number): Observable<PerguntaDetalhe> {
    return this.http.get<PerguntaDetalhe>(`${API_URL}/perguntas/moderacao/${id}`);
  }

  aprovar(id: number): Observable<PerguntaDetalhe> {
    return this.http.post<PerguntaDetalhe>(`${API_URL}/perguntas/${id}/aprovar`, {});
  }

  rejeitar(id: number, motivo: string): Observable<PerguntaDetalhe> {
    return this.http.post<PerguntaDetalhe>(`${API_URL}/perguntas/${id}/rejeitar`, { motivo });
  }
}
