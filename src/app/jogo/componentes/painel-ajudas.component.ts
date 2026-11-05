import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-painel-ajudas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './painel-ajudas.component.html',
})
export class PainelAjudasComponent {
  readonly pulos = input.required<number>();
  readonly referenciaDisponivel = input.required<boolean>();
  readonly revelacaoDisponivel = input.required<boolean>();
  readonly travado = input(false);

  readonly pular = output<void>();
  readonly referencia = output<void>();
  readonly revelar = output<void>();

  pedirPulo(): void {
    if (this.travado() || this.pulos() <= 0) {
      return;
    }
    this.pular.emit();
  }

  pedirReferencia(): void {
    if (this.travado() || !this.referenciaDisponivel()) {
      return;
    }
    this.referencia.emit();
  }

  pedirRevelacao(): void {
    if (this.travado() || !this.revelacaoDisponivel()) {
      return;
    }
    this.revelar.emit();
  }
}
