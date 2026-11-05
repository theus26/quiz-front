import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BoasVindasService {
  private readonly texto = signal<string | null>(null);
  private timer: ReturnType<typeof setTimeout> | null = null;

  readonly mensagem = this.texto.asReadonly();

  mostrar(nome: string): void {
    const primeiro = nome.trim().split(/\s+/)[0];
    this.texto.set(primeiro || 'você');
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => this.fechar(), 5600);
  }

  fechar(): void {
    this.texto.set(null);
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
