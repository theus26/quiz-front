import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, switchMap } from 'rxjs';
import { API_URL } from '../api/api-url';
import { CriarUsuario, Login, Sessao, TokenResposta, Usuario } from '../modelos/quiz.modelos';
import { SessaoStore } from './sessao.store';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly sessao = inject(SessaoStore);

  entrar(credenciais: Login): Observable<Sessao> {
    return this.http.post<TokenResposta>(`${API_URL}/auth/login`, credenciais).pipe(
      switchMap((token) => this.completarSessao(token, credenciais.email)),
    );
  }

  cadastrar(dados: CriarUsuario): Observable<Sessao> {
    return this.http.post<Usuario>(`${API_URL}/usuarios`, {
      nome: dados.nome.trim(),
      email: dados.email.trim(),
      senha: dados.senha,
    }).pipe(
      switchMap(() => this.entrar({ email: dados.email.trim(), senha: dados.senha })),
    );
  }

  private completarSessao(token: TokenResposta, email: string): Observable<Sessao> {
    return this.http.get<Usuario>(`${API_URL}/usuarios/${token.usuarioId}`, {
      headers: { Authorization: `${token.tipo} ${token.token}` },
    }).pipe(
      map((usuario) => this.guardar(token, usuario.nome, usuario.email)),
      catchError(() => of(this.guardar(token, email, email))),
    );
  }

  private guardar(token: TokenResposta, nome: string, email: string): Sessao {
    const sessao: Sessao = {
      token: token.token,
      tipo: token.tipo,
      usuarioId: token.usuarioId,
      role: token.role,
      expiraEm: token.expiraEm,
      nome,
      email,
    };
    this.sessao.definir(sessao);
    return sessao;
  }
}
