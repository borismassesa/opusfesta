import assert from 'node:assert/strict';
import test from 'node:test';
import { buildDefaultSiteDoc } from './wedding-website';

test('buildDefaultSiteDoc seeds meta from the given names and preset', () => {
  const doc = buildDefaultSiteDoc('Amara', 'Tumaini', 'serengeti');
  assert.equal(doc.title, 'Amara & Tumaini');
  assert.equal(doc.meta.partnerA, 'Amara');
  assert.equal(doc.meta.partnerB, 'Tumaini');
  assert.equal(doc.meta.presetId, 'serengeti');
  assert.equal(doc.meta.layoutId, 'banner');
});

test('buildDefaultSiteDoc defaults the welcome message when none is given', () => {
  const doc = buildDefaultSiteDoc('Amara', 'Tumaini', 'tanzanite');
  assert.equal(doc.meta.welcome, "We're getting married!");
});

test('buildDefaultSiteDoc accepts a custom welcome message', () => {
  const doc = buildDefaultSiteDoc('Amara', 'Tumaini', 'kanga', 'Karibu!');
  assert.equal(doc.meta.welcome, 'Karibu!');
});

test('buildDefaultSiteDoc seeds all 8 content pages visible except rsvp', () => {
  const doc = buildDefaultSiteDoc('Amara', 'Tumaini', 'tanzanite');
  assert.equal(doc.meta.pages.length, 8);
  const rsvp = doc.meta.pages.find((p) => p.key === 'rsvp');
  assert.equal(rsvp?.visible, false);
  const others = doc.meta.pages.filter((p) => p.key !== 'rsvp');
  assert.ok(others.every((p) => p.visible));
});

test('buildDefaultSiteDoc seeds a non-empty sections array (satisfies the live publish guard)', () => {
  const doc = buildDefaultSiteDoc('Amara', 'Tumaini', 'serengeti');
  assert.ok(Array.isArray(doc.sections));
  assert.ok(doc.sections.length > 0);
});
