import * as Sentry from '@sentry/react';
import { version } from '../package.json';
import { privateErrorEvent } from './errorMonitoringPrivacy.js';

// Public ingestion address, not an authentication secret. No local/demo telemetry.
if (import.meta.env.PROD && ['borcama.com', 'www.borcama.com', 'crm.borcama.com'].includes(window.location.hostname)) {
  Sentry.init({
    dsn: 'https://439bb8e781fe0b0333c4a98d4e67e5fc@o4512024083562496.ingest.de.sentry.io/4512024142217296',
    release: `borcama@${version}`,
    environment: 'production',
    defaultIntegrations: false,
    integrations: [Sentry.globalHandlersIntegration(), Sentry.browserApiErrorsIntegration(), Sentry.dedupeIntegration()],
    sendDefaultPii: false,
    dataCollection: { userInfo: false, httpBodies: [] },
    autoSessionTracking: false,
    sendClientReports: false,
    maxBreadcrumbs: 0,
    tracesSampleRate: 0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    beforeSend: privateErrorEvent,
  });
}

export const ErrorBoundary = Sentry.ErrorBoundary;
