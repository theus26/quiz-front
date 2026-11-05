import { HttpErrorResponse } from '@angular/common/http';

export function mensagemErro(erro: unknown, padrao: string): string {
  if (!(erro instanceof HttpErrorResponse)) {
    return padrao;
  }
  if (erro.status === 0) {
    return 'Não foi possível falar com o servidor. Confira se a API está no ar.';
  }
  return lerMensagem(erro.error) ?? padrao;
}

function lerMensagem(corpo: unknown): string | null {
  if (!corpo || typeof corpo !== 'object' || !('mensagem' in corpo)) {
    return null;
  }
  const mensagem = (corpo as { mensagem: unknown }).mensagem;
  return typeof mensagem === 'string' && mensagem.trim() ? mensagem : null;
}
