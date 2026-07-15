import type { SupabaseClient } from '@supabase/supabase-js';

// Ported verbatim from apps/opus_pass/src/lib/dashboard/share.ts — mobile and
// opus_pass both write into the same `couple_profiles.public_slug UNIQUE`
// column, so this must stay byte-for-byte identical to avoid diverging slug
// formats between the two apps for the same couple.

/** Salutations that aren't a partner's actual first name — skipped so a name
 *  like "Mr Boris Massesa" slugs to "boris", not "mr". Covers both English
 *  and Swahili honorifics, since couples are Tanzanian. */
const NAME_TITLES = new Set([
  'mr', 'mrs', 'ms', 'miss', 'mx', 'dr', 'prof', 'rev', 'sir', 'madam', 'chief', 'eng', 'engr', 'capt',
  'mzee', 'bwana', 'bi', 'bibi', 'ndugu',
]);

/** Index of the first word that isn't a leading title, or -1 if every word
 *  is a title (name is nothing but titles) or the input is empty. */
function skipTitles(words: string[]): number {
  let i = 0;
  while (i < words.length - 1 && NAME_TITLES.has(words[i].replace(/\.$/, '').toLowerCase())) i++;
  const word = words[i];
  if (!word || NAME_TITLES.has(word.replace(/\.$/, '').toLowerCase())) return -1;
  return i;
}

/** First given name from a full name — skips leading titles (Mr/Mrs/Dr/Mzee/
 *  Bwana/...) and falls back to the full name if nothing usable remains. */
export function firstNameOf(name: string): string {
  const words = name.trim().split(/\s+/);
  const i = skipTitles(words);
  return i === -1 ? name : words[i];
}

/** Slugify free text for a URL handle: lowercase, ASCII, dash-separated. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics
    .replace(/&/g, ' na ') // "Asha & Juma" -> "asha na juma"
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/** Build a public slug base from the couple's first names ("asha-na-juma"). */
export function coupleSlugBase(partner1: string | null, partner2: string | null): string {
  const firstNames = [partner1, partner2].filter(Boolean).map((name) => firstNameOf(name as string));
  const base = slugify(firstNames.join(' na '));
  return base || 'harusi';
}

/**
 * Find an unused public_slug, appending -2, -3… on collision — mirrors
 * apps/opus_pass/src/lib/dashboard/actions.ts's reserveUniqueSlug. This is a
 * check-then-set probe, not atomic; the final UPDATE in publishWebsite()
 * (wedding-website.ts) must still handle a 23505 unique-violation as the
 * real backstop.
 */
export async function reserveUniqueSlug(client: SupabaseClient, base: string): Promise<string> {
  for (let n = 1; n < 50; n++) {
    const candidate = n === 1 ? base : `${base}-${n}`;
    const { data } = await client
      .from('couple_profiles')
      .select('id')
      .eq('public_slug', candidate)
      .maybeSingle();
    if (!data) return candidate;
  }
  return `${base}-${Math.floor(Date.now() % 100000)}`;
}
