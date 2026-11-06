import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { ROTULO_PAPEL, formatarData } from '../compartilhado/apresentacao';
import { mensagemErro } from '../core/api/mensagem-erro';
import { SessaoStore } from '../core/auth/sessao.store';
import { UsuarioApiService } from '../core/infra/usuario-api.service';
import { Papel, Usuario } from '../core/modelos/quiz.modelos';

@Component({
  selector: 'app-usuarios-page',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './usuarios-page.component.html',
})
export class UsuariosPageComponent {
  private readonly api = inject(UsuarioApiService);
  private readonly sessao = inject(SessaoStore);

  readonly meuId = this.sessao.usuarioId;
  readonly busca = signal('');
  readonly pagina = signal(1);
  readonly totalPaginas = signal(1);
  readonly usuarios = signal<readonly Usuario[]>([]);
  readonly selecionado = signal<Usuario | null>(null);
  readonly carregando = signal(true);
  readonly agindo = signal(false);
  readonly erro = signal<string | null>(null);
  readonly aviso = signal<string | null>(null);
  readonly formatarData = formatarData;
  readonly rotuloPapel = ROTULO_PAPEL;

  constructor() {
    this.carregar();
  }

  pesquisar(): void {
    this.pagina.set(1);
    this.selecionado.set(null);
    this.carregar();
  }

  ir(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas()) {
      return;
    }
    this.pagina.set(pagina);
    this.carregar();
  }

  abrir(usuario: Usuario): void {
    this.erro.set(null);
    this.aviso.set(null);
    this.api.obter(usuario.id).subscribe({
      next: (detalhe) => this.selecionado.set(detalhe),
      error: (falha: unknown) => this.erro.set(mensagemErro(falha, 'Não foi possível abrir o usuário.')),
    });
  }

  fechar(): void {
    this.selecionado.set(null);
  }

  mudarPapel(role: Papel): void {
    const usuario = this.selecionado();
    if (!usuario || usuario.id === this.meuId()) {
      return;
    }
    this.executar(
      this.api.alterarPapel(usuario.id, role),
      'O novo perfil passa a valer quando a pessoa entrar de novo.',
    );
  }

  mudarSituacao(ativo: boolean): void {
    const usuario = this.selecionado();
    if (!usuario || usuario.id === this.meuId()) {
      return;
    }
    this.executar(this.api.alterarSituacao(usuario.id, ativo), ativo ? 'Usuário ativado.' : 'Usuário desativado.');
  }

  private carregar(): void {
    this.carregando.set(true);
    this.erro.set(null);
    this.api.listar(this.pagina(), this.busca()).subscribe({
      next: (pagina) => {
        this.usuarios.set(pagina.dados);
        this.totalPaginas.set(Math.max(1, pagina.totalPaginas));
        this.carregando.set(false);
      },
      error: (falha: unknown) => {
        this.erro.set(mensagemErro(falha, 'Não foi possível listar os usuários.'));
        this.carregando.set(false);
      },
    });
  }

  private executar(pedido: Observable<Usuario>, mensagem: string): void {
    if (this.agindo()) {
      return;
    }
    this.agindo.set(true);
    this.erro.set(null);
    this.aviso.set(null);
    pedido.subscribe({
      next: (usuario) => {
        this.selecionado.set(usuario);
        this.aviso.set(mensagem);
        this.agindo.set(false);
        this.carregar();
      },
      error: (falha: unknown) => {
        this.erro.set(mensagemErro(falha, 'Não foi possível atualizar o usuário.'));
        this.agindo.set(false);
      },
    });
  }
}
