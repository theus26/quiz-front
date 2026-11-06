import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ROTULO_NIVEL, ROTULO_STATUS, formatarData, letraAlternativa } from '../compartilhado/apresentacao';
import { mensagemErro } from '../core/api/mensagem-erro';
import { PerguntaApiService } from '../core/infra/pergunta-api.service';
import { PainelModeracao, PerguntaDetalhe, StatusPergunta } from '../core/modelos/quiz.modelos';

@Component({
  selector: 'app-moderacao-page',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './moderacao-page.component.html',
})
export class ModeracaoPageComponent {
  private readonly api = inject(PerguntaApiService);

  readonly painel = signal<PainelModeracao | null>(null);
  readonly detalhe = signal<PerguntaDetalhe | null>(null);
  readonly status = signal<StatusPergunta>('PENDENTE');
  readonly busca = signal('');
  readonly motivo = signal('');
  readonly carregando = signal(true);
  readonly agindo = signal(false);
  readonly erro = signal<string | null>(null);
  readonly aviso = signal<string | null>(null);
  readonly formatarData = formatarData;
  readonly rotuloNivel = ROTULO_NIVEL;
  readonly rotuloStatus = ROTULO_STATUS;
  readonly letra = letraAlternativa;

  constructor() {
    this.carregar();
  }

  filtrar(status: StatusPergunta): void {
    this.status.set(status);
    this.detalhe.set(null);
    this.carregar();
  }

  pesquisar(): void {
    this.detalhe.set(null);
    this.carregar();
  }

  abrir(id: number): void {
    this.erro.set(null);
    this.aviso.set(null);
    this.motivo.set('');
    this.api.detalheModeracao(id).subscribe({
      next: (pergunta) => this.detalhe.set(pergunta),
      error: (falha: unknown) => this.erro.set(mensagemErro(falha, 'Não foi possível abrir a pergunta.')),
    });
  }

  fechar(): void {
    this.detalhe.set(null);
    this.motivo.set('');
  }

  aprovar(): void {
    const pergunta = this.detalhe();
    if (!pergunta || this.agindo()) {
      return;
    }
    this.agindo.set(true);
    this.erro.set(null);
    this.api.aprovar(pergunta.id).subscribe({
      next: () => {
        this.aviso.set('Pergunta aprovada. Ela já pode entrar nas partidas.');
        this.agindo.set(false);
        this.fechar();
        this.carregar();
      },
      error: (falha: unknown) => {
        this.erro.set(mensagemErro(falha, 'Não foi possível aprovar a pergunta.'));
        this.agindo.set(false);
      },
    });
  }

  rejeitar(): void {
    const pergunta = this.detalhe();
    const motivo = this.motivo().trim();
    if (!pergunta || this.agindo()) {
      return;
    }
    if (!motivo) {
      this.erro.set('Informe o motivo da rejeição.');
      return;
    }
    this.agindo.set(true);
    this.erro.set(null);
    this.api.rejeitar(pergunta.id, motivo).subscribe({
      next: () => {
        this.aviso.set('Pergunta rejeitada.');
        this.agindo.set(false);
        this.fechar();
        this.carregar();
      },
      error: (falha: unknown) => {
        this.erro.set(mensagemErro(falha, 'Não foi possível rejeitar a pergunta.'));
        this.agindo.set(false);
      },
    });
  }

  private carregar(): void {
    this.carregando.set(true);
    this.api.moderar(this.status(), this.busca()).subscribe({
      next: (painel) => {
        this.painel.set(painel);
        this.carregando.set(false);
      },
      error: (falha: unknown) => {
        this.erro.set(mensagemErro(falha, 'Não foi possível carregar as perguntas.'));
        this.carregando.set(false);
      },
    });
  }
}
