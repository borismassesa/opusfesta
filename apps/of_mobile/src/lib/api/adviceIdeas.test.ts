import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveAdviceIdeasImage } from './adviceIdeas';

const ORIGIN = 'https://opusfesta.com';

test('resolveAdviceIdeasImage returns null for null/undefined/empty', () => {
  assert.equal(resolveAdviceIdeasImage(null), null);
  assert.equal(resolveAdviceIdeasImage(undefined), null);
  assert.equal(resolveAdviceIdeasImage(''), null);
});

test('resolveAdviceIdeasImage passes absolute URLs through unchanged', () => {
  assert.equal(resolveAdviceIdeasImage('https://cdn.example.com/a.jpg'), 'https://cdn.example.com/a.jpg');
  assert.equal(resolveAdviceIdeasImage('http://cdn.example.com/a.jpg'), 'http://cdn.example.com/a.jpg');
});

test('resolveAdviceIdeasImage joins a site-relative path with a leading slash', () => {
  assert.equal(resolveAdviceIdeasImage('/images/hero.jpg'), `${ORIGIN}/images/hero.jpg`);
});

test('resolveAdviceIdeasImage adds a slash for a path without a leading slash', () => {
  assert.equal(resolveAdviceIdeasImage('images/hero.jpg'), `${ORIGIN}/images/hero.jpg`);
});
