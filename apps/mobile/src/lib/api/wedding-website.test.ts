import assert from 'node:assert/strict';
import test from 'node:test';
import { generateSlug } from './wedding-website';

test('joins both partner names into a lowercase, hyphenated slug', () => {
  assert.equal(generateSlug('Amara', 'Tumaini'), 'amara-and-tumaini');
});

test('falls back to a single name when the second partner is omitted', () => {
  assert.equal(generateSlug('Amara'), 'amara');
});

test('strips punctuation and collapses whitespace', () => {
  assert.equal(generateSlug("O'Brien & Sons", 'Zawadi   Mwangi'), 'o-brien-sons-and-zawadi-mwangi');
});

test('trims leading and trailing separators', () => {
  assert.equal(generateSlug('  Amara  ', '  Tumaini  '), 'amara-and-tumaini');
});
