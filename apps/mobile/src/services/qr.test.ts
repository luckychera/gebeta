import assert from 'node:assert/strict';
import test from 'node:test';
import qrcode from 'qrcode-generator';

test('builds a referral matrix for a demo provider link', () => {
  const qr = qrcode(0, 'M');
  qr.addData('gebeta://provider/kafa-terrace');
  qr.make();
  assert.ok(qr.getModuleCount() > 10);
  assert.equal(typeof qr.isDark(0, 0), 'boolean');
});
