import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ROTULO_NIVEL, formatarPontos, letraAlternativa } from '../../compartilhado/apresentacao';
import { Pergunta } from '../../core/modelos/quiz.modelos';
import { FaseJogo } from '../dominio/estado-jogo';

@Component({
  selector: 'app-carta-pergunta',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './carta-pergunta.component.html',
})
export class CartaPerguntaComponent {
  readonly pergunta = input.required<Pergunta>();
  readonly fase = input.required<FaseJogo>();
  readonly premio = input.required<number>();
  readonly passo = input.required<number>();
  readonly selecionadaId = input<number | null>(null);
  readonly reveladaId = input<number | null>(null);
  readonly erradaId = input<number | null>(null);
  readonly referenciaVisivel = input(false);
  readonly travado = input(false);

  readonly selecionar = output<number>();
  readonly formatar = formatarPontos;
  readonly rotuloNivel = ROTULO_NIVEL;
  readonly letra = letraAlternativa;

  escolher(id: number): void {
    if (this.travado()) {
      return;
    }
    this.selecionar.emit(id);
  }

  ehCerta(id: number): boolean {
    if (this.fase() === 'acerto') {
      return this.selecionadaId() === id;
    }
    if (this.fase() === 'erro') {
      return this.reveladaId() === id;
    }
    return false;
  }
}
