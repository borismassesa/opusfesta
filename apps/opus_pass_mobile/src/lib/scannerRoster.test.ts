import assert from 'node:assert/strict';
import test from 'node:test';
import {
  arrivedHeads,
  avatarColorFor,
  countLabel,
  expectedHeads,
  groupRoster,
  initialsOf,
  partySizeLabel,
  UNGROUPED_LABEL,
} from './scannerRoster';
import type { RosterEntry } from '../types/checkin';

/**
 * These derivations produce the numbers a door attendant acts on and the couple
 * is billed against, so the arithmetic is worth pinning down: a head miscount
 * is invisible on screen and only surfaces in the catering invoice.
 */

function guest(overrides: Partial<RosterEntry> & { fullName: string }): RosterEntry {
  return {
    invitationId: overrides.fullName,
    entryCode: null,
    partySize: 1,
    checkedInAt: null,
    checkedInPartySize: null,
    checkedInDoor: null,
    checkedInBy: null,
    groupTag: null,
    isVip: false,
    ...overrides,
  };
}

test('initials take the first and last word, not the middle', () => {
  assert.equal(initialsOf('Natasha Fernandes'), 'NF');
  assert.equal(initialsOf('Asha Grace Mwakalinga'), 'AM');
  assert.equal(initialsOf('Aryeh'), 'A');
  assert.equal(initialsOf('   '), '?');
});

test('avatar colour is stable for a key and varies across keys', () => {
  assert.equal(avatarColorFor('Natasha Fernandes'), avatarColorFor('Natasha Fernandes'));
  const distinct = new Set(
    ["Bride's Family", "Groom's Side", 'Work Friends', 'University'].map(avatarColorFor)
  );
  assert.ok(distinct.size > 1, 'a single-colour palette would defeat the point');
});

test('expected heads counts the party, arrived heads counts only who came', () => {
  const roster = [
    guest({ fullName: 'A', partySize: 4, checkedInAt: '2027-07-18T18:00:00Z', checkedInPartySize: 2 }),
    guest({ fullName: 'B', partySize: 3, checkedInAt: '2027-07-18T18:05:00Z' }),
    guest({ fullName: 'C', partySize: 2 }),
  ];

  assert.equal(expectedHeads(roster), 9);
  // A brought 2 of 4; B was admitted with no correction so the full 3 count;
  // C has not arrived and contributes nothing.
  assert.equal(arrivedHeads(roster), 5);
});

test('untagged guests collect under one heading and sort last', () => {
  const groups = groupRoster([
    guest({ fullName: 'A', groupTag: 'Work Friends' }),
    guest({ fullName: 'B', groupTag: null }),
    guest({ fullName: 'C', groupTag: '  ' }),
    guest({ fullName: 'D', groupTag: "Bride's Family", partySize: 2 }),
    guest({ fullName: 'E', groupTag: "Bride's Family", checkedInAt: '2027-07-18T18:00:00Z' }),
  ]);

  assert.deepEqual(
    groups.map((g) => g.tag),
    ["Bride's Family", 'Work Friends', UNGROUPED_LABEL]
  );
  assert.equal(groups[0].guests.length, 2);
  assert.equal(groups[0].heads, 3);
  assert.equal(groups[0].arrivedCount, 1);
  // Whitespace-only tags are not their own group.
  assert.equal(groups[2].guests.length, 2);
});

test('the head count is dropped when it says nothing beyond the row count', () => {
  assert.equal(countLabel(1, 1), '1 guest');
  assert.equal(countLabel(5, 5), '5 guests');
  assert.equal(countLabel(5, 12), '5 guests · 12 people');
});

test('party badges speak the language the tickets are sold in', () => {
  assert.equal(partySizeLabel(1), 'Single');
  assert.equal(partySizeLabel(2), 'Double');
  // Hand-entered special invitations can exceed a Double; fall back to count.
  assert.equal(partySizeLabel(6), 'Party of 6');
});
