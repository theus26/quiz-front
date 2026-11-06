import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../api/api-url';
import { Pagina, Papel, Usuario } from '../modelos/quiz.modelos';

@Injectable({ providedIn: 'root' })
export class UsuarioApiService {
  private readonly http = inject(HttpClient);

  listar(pagina: number, busca: string): Observable<Pagina<Usuario>> {
    const params: Record<string, string> = {
      pagina: String(pagina),
      tamanho: '12',
    };
    if (busca.trim()) {
      params['busca'] = busca.trim();
    }
    return this.http.get<Pagina<Usuario>>(`${API_URL}/usuarios`, { params });
  }

  obter(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${API_URL}/usuarios/${id}`);
  }

  alterarPapel(id: number, role: Papel): Observable<Usuario> {
    return this.http.put<Usuario>(`${API_URL}/usuarios/${id}/papel`, { role });
  }

  alterarSituacao(id: number, ativo: boolean): Observable<Usuario> {
    return this.http.put<Usuario>(`${API_URL}/usuarios/${id}/situacao`, { ativo });
  }
}
