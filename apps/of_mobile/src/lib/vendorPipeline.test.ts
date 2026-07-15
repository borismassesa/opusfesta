import assert from 'node:assert/strict';
import test from 'node:test';
import { leadStatusStyle, bookingStageStyle, nextBookingStage } from './vendorPipeline';

test('leadStatusStyle returns a distinct label per status', () => {
  assert.equal(leadStatusStyle('pending').label, 'New');
  assert.equal(leadStatusStyle('accepted').label, 'Accepted');
  assert.equal(leadStatusStyle('declined').label, 'Declined');
});

test('bookingStageStyle returns a distinct label per stage', () => {
  assert.equal(bookingStageStyle('quoted').label, 'Quoted');
  assert.equal(bookingStageStyle('completed').label, 'Completed');
});

test('nextBookingStage advances through the forward pipeline', () => {
  assert.equal(nextBookingStage('quoted'), 'reserved');
  assert.equal(nextBookingStage('reserved'), 'confirmed');
  assert.equal(nextBookingStage('confirmed'), 'completed');
});

test('nextBookingStage returns null at the end and for cancelled', () => {
  assert.equal(nextBookingStage('completed'), null);
  assert.equal(nextBookingStage('cancelled'), null);
});
