import assert from 'node:assert/strict';
import test from 'node:test';
import { describeSignUp, validateDisplayName, validateEmail, validatePassword } from './authRules';

test('email validation accepts an ordinary address and rejects the usual mistakes', () => {
  assert.equal(validateEmail('alem@example.com'), null);
  assert.equal(validateEmail('  alem@example.com  '), null);
  assert.notEqual(validateEmail(''), null);
  assert.notEqual(validateEmail('alem'), null);
  assert.notEqual(validateEmail('alem@example'), null);
  assert.notEqual(validateEmail('alem @example.com'), null);
});

test('password validation enforces a minimum length without silently truncating', () => {
  assert.notEqual(validatePassword(''), null);
  assert.notEqual(validatePassword('short'), null);
  assert.equal(validatePassword('longenough1'), null);
  assert.notEqual(validatePassword('x'.repeat(73)), null);
});

test('display name length is bounded', () => {
  assert.equal(validateDisplayName('Alem'), null);
  assert.equal(validateDisplayName(''), null);
  assert.notEqual(validateDisplayName('x'.repeat(61)), null);
});

test('a sign-up that returns a session is already signed in', () => {
  const outcome = describeSignUp({ hasSession: true, userId: 'u1', identityCount: 1, email: 'a@example.com' });
  assert.equal(outcome.kind, 'signed-in');
});

test('a sign-up without a session asks the person to confirm their email', () => {
  const outcome = describeSignUp({ hasSession: false, userId: 'u1', identityCount: 1, email: 'a@example.com' });
  assert.equal(outcome.kind, 'confirm-email');
  assert.match(outcome.message, /a@example\.com/);
});

test('an empty identity list means the address is already registered', () => {
  const outcome = describeSignUp({ hasSession: false, userId: 'u1', identityCount: 0, email: 'a@example.com' });
  assert.equal(outcome.kind, 'already-registered');
});
