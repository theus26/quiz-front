import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth.interceptor';
import { PerguntaApiService } from './core/infra/pergunta-api.service';
import { PontuacaoApiService } from './core/infra/pontuacao-api.service';
import { PerguntaGateway } from './core/portas/pergunta.gateway';
import { PontuacaoGateway } from './core/portas/pontuacao.gateway';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: PerguntaGateway, useExisting: PerguntaApiService },
    { provide: PontuacaoGateway, useExisting: PontuacaoApiService },
  ],
};
