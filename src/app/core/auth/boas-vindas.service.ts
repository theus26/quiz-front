import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BoasVindasService {
  private readonly texto = signal<string | null>(null);
  private timer: ReturnType<typeof setTimeout> | null = null;

  readonly mensagem = this.texto.asReadonly();

  mostrar(nome: string): void {
    const limpo = nome.trim();
    if (!limpo || limpo.includes('@')) {
      this.texto.set(null);
      return;
    }
    this.texto.set(limpo);
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
