import assert from 'node:assert/strict';
import test from 'node:test';
import qrcode from 'qrcode-generator';
import { buildProviderLink, providerPath } from './links';

test('builds a referral matrix for a demo provider link', () => {
  const qr = qrcode(0, 'M');
  qr.addData(buildProviderLink('https://gebeta.example', 'kafa-terrace').url);
  qr.make();
  assert.ok(qr.getModuleCount() > 10);
  assert.equal(typeof qr.isDark(0, 0), 'boolean');
});

test('a web base produces the public provider route', () => {
  assert.equal(providerPath('kafa-terrace'), '/provider/kafa-terrace');
  assert.deepEqual(buildProviderLink('https://gebeta.example/', 'kafa-terrace'), {
    url: 'https://gebeta.example/provider/kafa-terrace',
    kind: 'web',
  });
  assert.equal(buildProviderLink('http://localhost:8090', 'jimma-lakes').url, 'http://localhost:8090/provider/jimma-lakes');
});

test('without a web base the link falls back to the app scheme', () => {
  assert.deepEqual(buildProviderLink(null, 'kafa-terrace'), {
    url: 'gebeta://provider/kafa-terrace',
    kind: 'app',
  });
  assert.equal(buildProviderLink('   ', 'kafa-terrace').kind, 'app');
  assert.equal(buildProviderLink('gebeta://provider', 'kafa-terrace').kind, 'app');
});
