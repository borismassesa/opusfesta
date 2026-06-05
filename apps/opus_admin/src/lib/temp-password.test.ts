import assert from 'node:assert/strict'
import test from 'node:test'
import { generateTempPassword, TEMP_PASSWORD_LENGTH } from './temp-password'

// Run every check across many samples — the generator is random, so a single
// sample could pass by luck. 500 iterations makes a missing class or a stray
// ambiguous char overwhelmingly likely to surface.
const SAMPLES = 500

test('temp password is the expected fixed length', () => {
  for (let i = 0; i < SAMPLES; i++) {
    assert.equal(generateTempPassword().length, TEMP_PASSWORD_LENGTH)
  }
})

test('temp password always satisfies all-class complexity', () => {
  for (let i = 0; i < SAMPLES; i++) {
    const pw = generateTempPassword()
    assert.match(pw, /[A-Z]/, `no uppercase in "${pw}"`)
    assert.match(pw, /[a-z]/, `no lowercase in "${pw}"`)
    assert.match(pw, /[0-9]/, `no digit in "${pw}"`)
    assert.match(pw, /[!@#$%*?]/, `no symbol in "${pw}"`)
  }
})

test('temp password avoids ambiguous characters', () => {
  for (let i = 0; i < SAMPLES; i++) {
    const pw = generateTempPassword()
    assert.doesNotMatch(pw, /[O0Il1]/, `ambiguous char in "${pw}"`)
  }
})

test('temp passwords are not trivially repeated', () => {
  const seen = new Set<string>()
  for (let i = 0; i < SAMPLES; i++) seen.add(generateTempPassword())
  // Collisions across 500 draws would indicate a broken RNG.
  assert.equal(seen.size, SAMPLES)
})
