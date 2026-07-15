import assert from 'node:assert/strict';
import test from 'node:test';
import { formatRelativeTime } from './formatRelativeTime';

// A fixed reference "now" so the relative buckets are deterministic.
const NOW = new Date('2026-07-12T12:00:00Z').getTime();
const ago = (ms: number) => new Date(NOW - ms).toISOString();

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

test('formatRelativeTime returns empty string for a missing date', () => {
  assert.equal(formatRelativeTime('', NOW), '');
});

test('formatRelativeTime reports minutes under an hour', () => {
  assert.equal(formatRelativeTime(ago(5 * MIN), NOW), '5m ago');
  assert.equal(formatRelativeTime(ago(59 * MIN), NOW), '59m ago');
});

test('formatRelativeTime reports hours under a day', () => {
  assert.equal(formatRelativeTime(ago(3 * HOUR), NOW), '3h ago');
  assert.equal(formatRelativeTime(ago(23 * HOUR), NOW), '23h ago');
});

test('formatRelativeTime says "Yesterday" at exactly one day', () => {
  assert.equal(formatRelativeTime(ago(DAY), NOW), 'Yesterday');
});

test('formatRelativeTime reports days under a week', () => {
  assert.equal(formatRelativeTime(ago(2 * DAY), NOW), '2d ago');
  assert.equal(formatRelativeTime(ago(6 * DAY), NOW), '6d ago');
});

test('formatRelativeTime falls back to a "Mon D" date at a week or older', () => {
  // 8 days before 2026-07-12 is 2026-07-04.
  assert.equal(formatRelativeTime(ago(8 * DAY), NOW), 'Jul 4');
});
