import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import * as Sentry from '@sentry/angular';
import { captureException } from '@sentry/angular';
import { Integrations } from '@sentry/tracing';

Sentry.init({
  integrations: [
    new Integrations.BrowserTracing({
      tracingOrigins: ['*'],
      routingInstrumentation: Sentry.routingInstrumentation,
    }),
  ],
  ...environment.sentry,
});

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule) // { ngZone: 'noop' }
  .catch(err => {
    console.error(err);
    captureException(err);
  });
