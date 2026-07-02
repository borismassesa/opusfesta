import assert from 'node:assert/strict';
import test from 'node:test';
import { buildRsvpLink } from './guests';

test('buildRsvpLink points at the OpusPass public RSVP page for a given token', () => {
  assert.equal(
    buildRsvpLink('a1b2c3'),
    'https://opuspass.opusfesta.com/rsvp/a1b2c3',
  );
});
