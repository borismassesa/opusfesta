import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { ofVars } from '../constants/palette';

/**
 * Guards the hand-maintained CSS-variable declarations in global.css against the
 * `ofVars` single source in src/constants/palette.ts. NativeWind can't import JS
 * into CSS, so the two must be kept in step by hand — this test fails loudly the
 * moment they drift, which is the exact two-file problem the palette refactor
 * exists to eliminate.
 */

const cssPath = path.resolve(__dirname, '..', '..', 'global.css');
const css = readFileSync(cssPath, 'utf8');

/** Extract `--token: value;` pairs from a `<selector> { ... }` block. */
function parseBlock(selector: string): Record<string, string> {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`));
  assert.ok(match, `global.css is missing a "${selector}" block`);
  const out: Record<string, string> = {};
  for (const line of match![1].split(';')) {
    const decl = line.trim();
    if (!decl.startsWith('--')) continue;
    const idx = decl.indexOf(':');
    out[decl.slice(0, idx).trim()] = decl.slice(idx + 1).trim();
  }
  return out;
}

/** Normalize so `#FFFFFF` === `#ffffff` and `rgba(1, 2, 3, .1)` === `rgba(1,2,3,0.1)`. */
function norm(value: string): string {
  return value.toLowerCase().replace(/\s+/g, '');
}

const root = parseBlock(':root');
const darkRoot = parseBlock('.dark:root');

test(':root declares exactly the ofVars tokens, with matching light values', () => {
  assert.deepEqual(
    Object.keys(root).sort(),
    Object.keys(ofVars).sort(),
    ':root token set must match ofVars',
  );
  for (const [name, { light }] of Object.entries(ofVars)) {
    assert.equal(norm(root[name]), norm(light), `:root ${name} should be ${light}`);
  }
});

test('.dark:root redefines exactly the tokens that have a dark value', () => {
  const expectedDark = Object.entries(ofVars).filter(([, v]) => v.dark !== undefined);
  assert.deepEqual(
    Object.keys(darkRoot).sort(),
    expectedDark.map(([name]) => name).sort(),
    '.dark:root must redefine every token with a dark value and no others',
  );
  for (const [name, { dark }] of expectedDark) {
    assert.equal(norm(darkRoot[name]), norm(dark!), `.dark:root ${name} should be ${dark}`);
  }
});
