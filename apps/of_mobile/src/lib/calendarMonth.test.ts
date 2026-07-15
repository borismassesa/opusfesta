import assert from 'node:assert/strict';
import test from 'node:test';
import { getMonthGridDates, formatMonthTitle } from './calendarMonth';

test('grid always has exactly 42 cells (6 full weeks)', () => {
  assert.equal(getMonthGridDates(2026, 1).length, 42); // Feb 2026 (28 days)
  assert.equal(getMonthGridDates(2026, 0).length, 42); // Jan 2026 (31 days)
});

test('current-month cells match the actual days in that month', () => {
  const cells = getMonthGridDates(2026, 1); // February 2026, non-leap, 28 days
  const inMonth = cells.filter((c) => c.inCurrentMonth);
  assert.equal(inMonth.length, 28);
  assert.equal(inMonth[0].date, '2026-02-01');
  assert.equal(inMonth[27].date, '2026-02-28');
});

test('leading padding cells belong to the previous month', () => {
  // March 1, 2026 is a Sunday (weekday 0), so there should be no leading padding.
  const cells = getMonthGridDates(2026, 2);
  assert.equal(cells[0].date, '2026-03-01');
  assert.equal(cells[0].inCurrentMonth, true);
});

test('leading padding rolls back across a year boundary', () => {
  // January 1, 2027 is a Friday - leading days come from December 2026.
  const cells = getMonthGridDates(2027, 0);
  const leading = cells.filter((c) => !c.inCurrentMonth && c.date < '2027-01-01');
  assert.ok(leading.every((c) => c.date.startsWith('2026-12')));
});

test('trailing padding rolls forward across a year boundary', () => {
  const cells = getMonthGridDates(2026, 11); // December 2026
  const trailing = cells.filter((c) => !c.inCurrentMonth && c.date > '2026-12-31');
  assert.ok(trailing.length > 0);
  assert.ok(trailing.every((c) => c.date.startsWith('2027-01')));
});

test('formatMonthTitle renders a human month/year label', () => {
  assert.equal(formatMonthTitle(2026, 0), 'January 2026');
  assert.equal(formatMonthTitle(2026, 11), 'December 2026');
});
