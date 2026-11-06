import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  CATEGORIAS,
  CriarPergunta,
  Nivel,
  PerguntaResumo,
  Testamento,
} from '../core/modelos/quiz.modelos';
import { PerguntaApiService } from '../core/infra/pergunta-api.service';
import { mensagemErro } from '../core/api/mensagem-erro';
import { ROTULO_NIVEL, ROTULO_STATUS, formatarData } from '../compartilhado/apresentacao';

@Component({
  selector: 'app-enviar-page',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './enviar-page.component.html',
})
export class EnviarPageComponent {
  private readonly perguntas = inject(PerguntaApiService);
  private readonly fb = inject(FormBuilder);

  readonly categorias = CATEGORIAS;
  readonly rotuloNivel = ROTULO_NIVEL;
  readonly rotuloStatus = ROTULO_STATUS;
  readonly formatarData = formatarData;
  readonly enviando = signal(false);
  readonly carregando = signal(true);
  readonly erro = signal<string | null>(null);
  readonly sucesso = signal<string | null>(null);
  readonly minhas = signal<readonly PerguntaResumo[]>([]);
  readonly correta = signal(0);

  readonly formulario = this.fb.nonNullable.group({
    enunciado: ['', [Validators.required, Validators.maxLength(500)]],
    testamento: this.fb.nonNullable.control<Testamento>('ANTIGO'),
    nivel: this.fb.nonNullable.control<Nivel>('FACIL'),
    categoria: ['', Validators.required],
    referencia: ['', Validators.maxLength(120)],
    explicacao: ['', Validators.maxLength(500)],
    alternativas: this.fb.nonNullable.array([
      this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(255)]),
      this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(255)]),
      this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(255)]),
      this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(255)]),
    ]),
  });

  constructor() {
    this.carregar();
  }

  enviar(): void {
    if (this.formulario.invalid || this.enviando()) {
      this.formulario.markAllAsTouched();
      return;
    }
    const valor = this.formulario.getRawValue();
    const textos = valor.alternativas.map((texto) => texto.trim());
    if (new Set(textos.map((texto) => texto.toLowerCase())).size < 4) {
      this.erro.set('As quatro alternativas precisam ser diferentes.');
      return;
    }
    const dados: CriarPergunta = {
      enunciado: valor.enunciado.trim(),
      testamento: valor.testamento,
      nivel: valor.nivel,
      categoria: valor.categoria,
      referencia: valor.referencia.trim() || null,
      explicacao: valor.explicacao.trim() || null,
      alternativas: textos.map((texto, indice) => ({
        texto,
        correta: indice === this.correta(),
      })),
    };
    this.enviando.set(true);
    this.erro.set(null);
    this.sucesso.set(null);
    this.perguntas.enviar(dados).subscribe({
      next: () => {
        this.sucesso.set('Pergunta enviada. Ela entra nas partidas depois da aprovação.');
        this.formulario.reset({
          enunciado: '',
          testamento: 'ANTIGO',
          nivel: 'FACIL',
          categoria: '',
          referencia: '',
          explicacao: '',
          alternativas: ['', '', '', ''],
        });
        this.correta.set(0);
        this.enviando.set(false);
        this.carregar();
      },
      error: (falha: unknown) => {
        this.erro.set(mensagemErro(falha, 'Não foi possível enviar a pergunta.'));
        this.enviando.set(false);
      },
    });
  }

  private carregar(): void {
    this.perguntas.minhas().subscribe({
      next: (lista) => {
        this.minhas.set(lista);
        this.carregando.set(false);
      },
      error: (falha: unknown) => {
        this.erro.set(mensagemErro(falha, 'Não foi possível carregar suas perguntas.'));
        this.carregando.set(false);
      },
    });
  }
}
