import { test } from 'node:test';
import assert from 'node:assert/strict';
import { privateErrorEvent } from './errorMonitoringPrivacy.js';

test('error monitoring removes financial data, tokens, user details and breadcrumbs', () => {
  const result = privateErrorEvent({ user: { email: 'private@example.com' }, request: { data: 'balance 48000' }, extra: { token: 'secret' }, breadcrumbs: [{ message: 'statement' }], exception: { values: [{ type: 'TypeError', value: 'private@example.com balance 48000', stacktrace: { frames: [{ filename: 'https://borcama.com/assets/App-abc.js?token=secret', lineno: 10, colno: 5, vars: { balance: 48000 } }, { filename: 'https://external.com/private' }] } }] } });
  const serialized = JSON.stringify(result);
  for (const value of ['private@example.com', '48000', 'secret', 'statement', 'external.com']) assert.ok(!serialized.includes(value));
  assert.equal(result.exception.values[0].stacktrace.frames.length, 1);
  assert.equal(result.user.ip_address, '0.0.0.0');
  assert.equal(privateErrorEvent({ message: 'private log' }), null);
});
