import assert from 'node:assert/strict';
import test from 'node:test';
import { toSegments } from './deepLinkSegments';

// deepLinks.ts itself imports ./supabase, which pulls in @clerk/clerk-expo —
// that only loads under the RN/Metro toolchain, not plain Node. This tests
// the pure parsing it's built on instead (see deepLinkSegments.ts).

test('custom-scheme URL puts the host back into the segment list', () => {
  assert.deepEqual(toSegments('opusfesta://vendor/abc-123'), ['vendor', 'abc-123']);
  assert.deepEqual(toSegments('opusfesta://messages/thread-9'), ['messages', 'thread-9']);
});

test('production https URL is split on pathname alone', () => {
  assert.deepEqual(toSegments('https://opusfesta.com/vendors/some-slug'), ['vendors', 'some-slug']);
  assert.deepEqual(toSegments('https://www.opusfesta.com/vendor/abc-123'), ['vendor', 'abc-123']);
});

test('a bare scheme with no path segments returns an empty list', () => {
  assert.deepEqual(toSegments('opusfesta://'), []);
});

test('a malformed URL returns an empty list instead of throwing', () => {
  assert.deepEqual(toSegments('not a url at all'), []);
});
