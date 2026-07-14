import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveUserType, resolveOnboardingComplete } from './onboardingMetadata';

test('resolveUserType prefers publicMetadata over unsafeMetadata', () => {
  assert.equal(resolveUserType({ userType: 'vendor' }, { userType: 'couple' }), 'vendor');
});

test('resolveUserType falls back to unsafeMetadata.userType', () => {
  assert.equal(resolveUserType(undefined, { userType: 'vendor' }), 'vendor');
});

test('resolveUserType falls back to the legacy unsafeMetadata.user_type key', () => {
  assert.equal(resolveUserType(null, { user_type: 'vendor' }), 'vendor');
});

test('resolveUserType returns unknown when nothing is set, never defaults to couple', () => {
  assert.equal(resolveUserType(undefined, undefined), 'unknown');
  assert.equal(resolveUserType({}, {}), 'unknown');
});

test('resolveUserType returns unknown for an unrecognized value', () => {
  assert.equal(resolveUserType({ userType: 'admin' }, undefined), 'unknown');
});

test('resolveOnboardingComplete is true if either metadata source says so', () => {
  assert.equal(resolveOnboardingComplete({ onboardingComplete: true }, undefined), true);
  assert.equal(resolveOnboardingComplete(undefined, { onboardingComplete: true }), true);
  assert.equal(resolveOnboardingComplete({ onboardingComplete: false }, undefined), false);
  assert.equal(resolveOnboardingComplete(undefined, undefined), false);
});
