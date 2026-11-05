import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { formatarPontos } from '../../compartilhado/apresentacao';
import { MotivoFim, Salvamento } from '../dominio/estado-jogo';

@Component({
  selector: 'app-painel-resultado',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './painel-resultado.component.html',
})
export class PainelResultadoComponent {
  readonly motivo = input.required<MotivoFim>();
  readonly acertos = input.required<number>();
  readonly pontos = input.required<number>();
  readonly respostaCerta = input<string | null>(null);
  readonly salvamento = input.required<Salvamento>();
  readonly mensagemSalvar = input<string | null>(null);
  readonly autenticado = input.required<boolean>();
  readonly retorno = input.required<string>();

  readonly jogarDeNovo = output<void>();
  readonly tentarSalvar = output<void>();
  readonly formatar = formatarPontos;

  titulo(): string {
    switch (this.motivo()) {
      case 'vitoria':
        return 'Você concluiu a partida';
      case 'erro':
        return 'A jornada parou aqui';
      case 'parada':
        return 'Pontuação guardada';
      case 'esgotou':
        return 'As perguntas acabaram';
    }
  }

  verso(): string {
    switch (this.motivo()) {
      case 'vitoria':
        return 'Bem, servo bom e fiel.';
      case 'erro':
        return 'Ainda há tempo de recomeçar.';
      case 'parada':
        return 'A prudência também é sabedoria.';
      case 'esgotou':
        return 'Você caminhou até onde as Escrituras desta noite alcançaram.';
    }
  }
}
