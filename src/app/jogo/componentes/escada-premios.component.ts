import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PassoTrilha } from '../dominio/escada';

@Component({
  selector: 'app-escada-premios',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './escada-premios.component.html',
})
export class EscadaPremiosComponent {
  readonly degraus = input.required<readonly PassoTrilha[]>();

  classe(degrau: PassoTrilha): string {
    if (degrau.situacao === 'atual') {
      return 'degrau degrau-atual';
    }
    if (degrau.situacao === 'feita') {
      return 'degrau degrau-conquistado';
    }
    return 'degrau';
  }
}
