import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { retornoSeguro } from '../compartilhado/apresentacao';
import { mensagemErro } from '../core/api/mensagem-erro';
import { AuthService } from '../core/auth/auth.service';
import { BoasVindasService } from '../core/auth/boas-vindas.service';
import { SessaoStore } from '../core/auth/sessao.store';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login-page.component.html',
})
export class LoginPageComponent {
  private readonly auth = inject(AuthService);
  private readonly sessao = inject(SessaoStore);
  private readonly boasVindas = inject(BoasVindasService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  readonly enviando = signal(false);
  readonly erro = signal<string | null>(null);
  readonly senhaVisivel = signal(false);
  readonly formulario = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required]],
  });

  constructor() {
    if (this.sessao.autenticado()) {
      void this.router.navigateByUrl(this.destino());
    }
  }

  enviar(): void {
    if (this.formulario.invalid || this.enviando()) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    this.erro.set(null);
    const { email, senha } = this.formulario.getRawValue();
    this.auth.entrar({ email: email.trim(), senha }).subscribe({
      next: (sessao) => {
        this.boasVindas.mostrar(sessao.nome);
        void this.router.navigateByUrl(this.destino());
      },
      error: (falha: unknown) => {
        this.erro.set(mensagemErro(falha, 'Não foi possível entrar.'));
        this.enviando.set(false);
      },
    });
  }

  destino(): string {
    return retornoSeguro(this.route.snapshot.queryParamMap.get('retorno'));
  }
}
