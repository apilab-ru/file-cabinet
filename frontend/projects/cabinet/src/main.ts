import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/pages/main/app.module';
import { environment } from './environments/environment';
import * as Sentry from '@sentry/angular';
import { Integrations } from '@sentry/tracing';
import { captureException } from '@sentry/angular';

Sentry.init({
  integrations: [
    new Integrations.BrowserTracing({
      tracingOrigins: ['*'],
      routingInstrumentation: Sentry.routingInstrumentation,
    }),
  ],
  ...environment.sentry,
});

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => {
    console.error(err);
    captureException(err);
  });
