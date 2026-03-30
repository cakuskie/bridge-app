import * as Sentry from '@sentry/react-native'

export function initSentry() {
  Sentry.init({
    dsn: 'https://a8d394fc96f1c26f0c048bd161fe7796@o4511130685407232.ingest.us.sentry.io/4511130697662464',
    enableInExpoDevelopment: false,
    debug: false,
    tracesSampleRate: 0.2,
    environment: 'production',
    beforeSend(event) {
      // Strip any sensitive fields before sending to Sentry
      if (event.user) {
        delete event.user.email
        delete event.user.ip_address
      }
      return event
    },
  })
}

export function captureError(err, context = {}) {
  Sentry.captureException(err, { extra: context })
}

export function captureMessage(msg, level = 'info') {
  Sentry.captureMessage(msg, level)
}
