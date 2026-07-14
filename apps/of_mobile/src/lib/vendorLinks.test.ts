import assert from 'node:assert/strict';
import test from 'node:test';
import { formatAddress, toUrl } from './vendorLinks';

test('formatAddress returns null for null/empty location', () => {
  assert.equal(formatAddress(null), null);
  assert.equal(formatAddress(undefined), null);
  assert.equal(formatAddress({}), null);
});

test('formatAddress prefers an explicit non-blank address', () => {
  assert.equal(formatAddress({ address: '12 Marina Rd', city: 'Lagos' }), '12 Marina Rd');
});

test('formatAddress ignores a blank address and joins parts', () => {
  assert.equal(
    formatAddress({ address: '   ', street: '5 Palm Ave', city: 'Lagos', region: 'LA' }),
    '5 Palm Ave, Lagos, LA',
  );
});

test('formatAddress prefers ward over district, and skips empty parts', () => {
  assert.equal(formatAddress({ ward: 'Ikoyi', district: 'Eti-Osa', city: 'Lagos' }), 'Ikoyi, Lagos');
  assert.equal(formatAddress({ district: 'Eti-Osa', city: 'Lagos' }), 'Eti-Osa, Lagos');
});

test('toUrl passes absolute URLs through unchanged', () => {
  assert.equal(toUrl('https://example.com'), 'https://example.com');
  assert.equal(toUrl('http://example.com', 'https://instagram.com/'), 'http://example.com');
});

test('toUrl treats a value with a base as a handle and strips a leading @', () => {
  assert.equal(toUrl('@opusfesta', 'https://instagram.com/'), 'https://instagram.com/opusfesta');
  assert.equal(toUrl('opusfesta', 'https://facebook.com/'), 'https://facebook.com/opusfesta');
});

test('toUrl assumes https for a bare domain with no base', () => {
  assert.equal(toUrl('opusfesta.com'), 'https://opusfesta.com');
});
