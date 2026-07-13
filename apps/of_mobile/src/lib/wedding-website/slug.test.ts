import assert from 'node:assert/strict';
import test from 'node:test';
import { coupleSlugBase, slugify } from './slug';

test('joins both partner names with " na " and lowercases', () => {
  assert.equal(slugify('Amara na Tumaini'), 'amara-na-tumaini');
});

test('maps "&" to " na "', () => {
  assert.equal(slugify('Asha & Juma'), 'asha-na-juma');
});

test('strips diacritics', () => {
  assert.equal(slugify('Renée & José'), 'renee-na-jose');
});

test('caps at 60 characters', () => {
  const long = 'a'.repeat(80);
  assert.equal(slugify(long).length, 60);
});

test('coupleSlugBase joins both names with " na "', () => {
  assert.equal(coupleSlugBase('Amara', 'Tumaini'), 'amara-na-tumaini');
});

test('coupleSlugBase falls back to a single name', () => {
  assert.equal(coupleSlugBase('Amara', null), 'amara');
});

test('coupleSlugBase falls back to "harusi" when both names are empty', () => {
  assert.equal(coupleSlugBase(null, null), 'harusi');
});
