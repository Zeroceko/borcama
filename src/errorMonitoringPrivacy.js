// Allowlist only: never forward arbitrary SDK payloads, error text or user data.
export function privateErrorEvent(event) {
  const values = event.exception?.values;
  if (!values?.length) return null;
  const types = new Set(['Error', 'TypeError', 'ReferenceError', 'RangeError', 'SyntaxError', 'URIError', 'EvalError']);
  return {
    event_id: event.event_id,
    timestamp: event.timestamp,
    platform: 'javascript',
    level: 'error',
    release: event.release,
    environment: event.environment,
    user: { ip_address: '0.0.0.0' },
    exception: { values: values.slice(-3).map(value => ({
      type: types.has(value.type) ? value.type : 'Error',
      value: 'Borcama application error (private details removed)',
      stacktrace: { frames: (value.stacktrace?.frames || []).filter(frame =>
        /^https:\/\/(?:www\.|crm\.)?borcama\.com\/assets\/[A-Za-z0-9_.-]+\.js(?:[?#].*)?$/.test(frame.filename || '')
      ).slice(-30).map(frame => ({
        filename: frame.filename.split(/[?#]/)[0],
        lineno: Number.isInteger(frame.lineno) ? frame.lineno : undefined,
        colno: Number.isInteger(frame.colno) ? frame.colno : undefined,
        in_app: true,
      })) },
    })) },
  };
}
