import { environment } from '../../environments/environment';
import { FileCab } from '../shared/services/file-cab';
import * as Sentry from '@sentry/angular';
import { Integrations } from '@sentry/tracing';

declare global {
  interface Window {
    fileCab: FileCab;
  }
}

Sentry.init({
  integrations: [
    new Integrations.BrowserTracing({
      tracingOrigins: ['*'],
      routingInstrumentation: Sentry.routingInstrumentation,
    }),
  ],
  ...environment.sentry,
});

window.fileCab = new FileCab();
