import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { retornoSeguro } from '../compartilhado/apresentacao';
import { mensagemErro } from '../core/api/mensagem-erro';
import { AuthService } from '../core/auth/auth.service';
import { BoasVindasService } from '../core/auth/boas-vindas.service';
import { SessaoStore } from '../core/auth/sessao.store';

@Component({
  selector: 'app-cadastro-page',
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cadastro-page.component.html',
})
export class CadastroPageComponent {
  private readonly auth = inject(AuthService);
  private readonly sessao = inject(SessaoStore);
  private readonly boasVindas = inject(BoasVindasService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  readonly enviando = signal(false);
  readonly erro = signal<string | null>(null);
  readonly formulario = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required]],
    confirmar: ['', [Validators.required]],
  }, { validators: [senhasIguais] });

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
    const { nome, email, senha } = this.formulario.getRawValue();
    this.auth.cadastrar({ nome, email, senha }).subscribe({
      next: (sessao) => {
        this.boasVindas.mostrar(sessao.nome);
        void this.router.navigateByUrl(this.destino());
      },
      error: (falha: unknown) => {
        this.erro.set(mensagemErro(falha, 'Não foi possível criar a conta.'));
        this.enviando.set(false);
      },
    });
  }

  destino(): string {
    return retornoSeguro(this.route.snapshot.queryParamMap.get('retorno'));
  }
}

function senhasIguais(controle: AbstractControl): ValidationErrors | null {
  const senha = controle.get('senha')?.value;
  const confirmar = controle.get('confirmar')?.value;
  if (!senha || !confirmar || senha === confirmar) {
    return null;
  }
  return { senhas: true };
}
