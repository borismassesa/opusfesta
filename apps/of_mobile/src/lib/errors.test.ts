import assert from 'node:assert/strict';
import test from 'node:test';
import { getErrorMessage, getErrorCode } from './errors';

test('getErrorMessage returns a plain string error as-is', () => {
  assert.equal(getErrorMessage('boom'), 'boom');
});

test('getErrorMessage prefers a Clerk errors[0].message', () => {
  const err = { errors: [{ message: 'That code is incorrect' }] };
  assert.equal(getErrorMessage(err, 'fallback'), 'That code is incorrect');
});

test('getErrorMessage falls back to a standard Error message', () => {
  assert.equal(getErrorMessage(new Error('network down')), 'network down');
});

test('getErrorMessage skips an empty Clerk errors array and uses message', () => {
  const err = { errors: [], message: 'top-level message' };
  assert.equal(getErrorMessage(err, 'fallback'), 'top-level message');
});

test('getErrorMessage ignores a non-string message', () => {
  const err = { message: 42 };
  assert.equal(getErrorMessage(err, 'fallback'), 'fallback');
});

test('getErrorMessage uses the fallback for null / undefined / unknown shapes', () => {
  assert.equal(getErrorMessage(null, 'fallback'), 'fallback');
  assert.equal(getErrorMessage(undefined, 'fallback'), 'fallback');
  assert.equal(getErrorMessage({}, 'fallback'), 'fallback');
});

test('getErrorMessage uses the default fallback when none is provided', () => {
  assert.equal(getErrorMessage({}), 'Something went wrong');
});

test('getErrorCode reads a string code (e.g. native cancellation)', () => {
  assert.equal(getErrorCode({ code: 'ERR_REQUEST_CANCELED' }), 'ERR_REQUEST_CANCELED');
});

test('getErrorCode returns undefined when there is no string code', () => {
  assert.equal(getErrorCode({ code: 123 }), undefined);
  assert.equal(getErrorCode(null), undefined);
  assert.equal(getErrorCode('nope'), undefined);
});
