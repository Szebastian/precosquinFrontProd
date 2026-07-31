import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideZonelessChangeDetection } from '@angular/core';

import { AppComponent } from './app/app.component';
import { appRoutes } from './app/app.routes';
import { authInterceptor } from './app/core/http/token.interceptor';
import { errorInterceptor } from './app/core/http/error.interceptor';
import { retryInterceptor } from './app/core/http/retry.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor, retryInterceptor, errorInterceptor])
    ),
    provideRouter(appRoutes, withComponentInputBinding()),
    provideAnimations(),
  ],
}).catch((err) => console.error(err));
