import type { ReactNode } from 'react';

// Safe renderer for legacy HTML strings (studio_articles.body_html, backfilled
// as article.body_html during Phase 5 migration). Strips all tags except a
// small allowlist and emits React elements — no raw HTML injection.
//
// Allowlisted tags: p, h2, h3, h4, strong, b, em, i, a, ul, ol, li, br,
// blockquote, code. Everything else is stripped.
//
// This is intentionally limited. Editors who want rich formatting should
// migrate content into the Phase 2 Tiptap richtext editor (article.body
// field), which gives full fidelity. This renderer exists only to keep
// legacy articles displayable during the transition.

interface LegacyHtmlRendererProps {
  html: string;
  className?: string;
}

// Strip dangerous elements and attributes before parsing. Removes:
//   - <script>, <style>, <iframe>, <object>, <embed>, <form>, <input>, <button>
//   - any `on*` event handler attribute
//   - javascript: URLs
function sanitize(input: string): string {
  return input
    .replace(/<(script|style|iframe|object|embed|form|input|button|textarea|select|link|meta)[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<(script|style|iframe|object|embed|form|input|button|textarea|select|link|meta)[^>]*\/?>/gi, '')
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/\son\w+\s*=\s*'[^']*'/gi, '')
    .replace(/\son\w+\s*=\s*[^\s>]*/gi, '')
    .replace(/javascript:/gi, '');
}

type InlineNode =
  | { kind: 'text'; text: string }
  | { kind: 'strong' | 'em' | 'code'; children: InlineNode[] }
  | { kind: 'a'; href: string; children: InlineNode[] }
  | { kind: 'br' };

type BlockNode =
  | { kind: 'p'; children: InlineNode[] }
  | { kind: 'h2' | 'h3' | 'h4'; children: InlineNode[] }
  | { kind: 'blockquote'; children: InlineNode[] }
  | { kind: 'ul' | 'ol'; items: InlineNode[][] };

// Decode the most common HTML entities. Safe subset — we intentionally do
// not delegate to document-level HTML parsing so no injection surface is
// reintroduced after the sanitize step.
function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)));
}

// Parse inline HTML — handles strong/b, em/i, code, a, br. Everything else
// becomes plain text.
function parseInline(html: string): InlineNode[] {
  const out: InlineNode[] = [];
  const matches = [...html.matchAll(/<(\/?)(strong|b|em|i|code|a|br)(\s[^>]*)?>/gi)];
  const stack: Array<{ kind: 'strong' | 'em' | 'code' | 'a'; children: InlineNode[]; href?: string }> = [];
  const top = (): InlineNode[] => (stack.length > 0 ? stack[stack.length - 1].children : out);

  const pushText = (text: string) => {
    if (!text) return;
    top().push({ kind: 'text', text: decodeEntities(text) });
  };

  let cursor = 0;
  for (const match of matches) {
    const [full, slash, tagRaw, attrs = ''] = match;
    const tag = tagRaw.toLowerCase();
    const idx = match.index ?? 0;
    pushText(html.slice(cursor, idx));
    cursor = idx + full.length;

    if (tag === 'br') {
      top().push({ kind: 'br' });
      continue;
    }

    const normalized: 'strong' | 'em' | 'code' | 'a' =
      tag === 'b' ? 'strong' : tag === 'i' ? 'em' : (tag as 'strong' | 'em' | 'code' | 'a');

    if (slash === '/') {
      const reverseIdx = [...stack].reverse().findIndex((f) => f.kind === normalized);
      if (reverseIdx === -1) continue;
      const closeCount = reverseIdx + 1;
      for (let i = 0; i < closeCount; i++) {
        const frame = stack.pop();
        if (!frame) break;
        const parent = top();
        if (frame.kind === 'a') {
          parent.push({ kind: 'a', href: frame.href ?? '#', children: frame.children });
        } else {
          parent.push({ kind: frame.kind, children: frame.children });
        }
      }
      continue;
    }

    if (normalized === 'a') {
      const hrefMatch = attrs.match(/href\s*=\s*"([^"]*)"|href\s*=\s*'([^']*)'/i);
      const rawHref = (hrefMatch?.[1] ?? hrefMatch?.[2] ?? '#').trim();
      const safeHref = /^(javascript|data):/i.test(rawHref) ? '#' : rawHref;
      stack.push({ kind: 'a', children: [], href: safeHref });
    } else {
      stack.push({ kind: normalized, children: [] });
    }
  }
  pushText(html.slice(cursor));

  // Flush any unclosed tags so we don't lose content
  while (stack.length > 0) {
    const frame = stack.pop();
    if (!frame) break;
    const parent = top();
    if (frame.kind === 'a') {
      parent.push({ kind: 'a', href: frame.href ?? '#', children: frame.children });
    } else {
      parent.push({ kind: frame.kind, children: frame.children });
    }
  }

  return out;
}

function parseBlocks(html: string): BlockNode[] {
  const blocks: BlockNode[] = [];
  const matches = [...html.matchAll(/<(p|h2|h3|h4|blockquote|ul|ol)([^>]*)>([\s\S]*?)<\/\1>/gi)];
  let cursor = 0;

  for (const match of matches) {
    const idx = match.index ?? 0;
    const between = html.slice(cursor, idx).trim();
    if (between) {
      blocks.push({ kind: 'p', children: parseInline(between) });
    }
    cursor = idx + match[0].length;

    const tag = match[1].toLowerCase();
    const inner = match[3];
    if (tag === 'ul' || tag === 'ol') {
      const items = [...inner.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((m) => parseInline(m[1]));
      blocks.push({ kind: tag, items });
    } else if (tag === 'h2' || tag === 'h3' || tag === 'h4') {
      blocks.push({ kind: tag, children: parseInline(inner) });
    } else if (tag === 'blockquote') {
      blocks.push({ kind: 'blockquote', children: parseInline(inner) });
    } else {
      blocks.push({ kind: 'p', children: parseInline(inner) });
    }
  }

  const trailing = html.slice(cursor).trim();
  if (trailing) {
    blocks.push({ kind: 'p', children: parseInline(trailing) });
  }

  return blocks;
}

function renderInline(nodes: InlineNode[], keyPrefix: string): ReactNode[] {
  return nodes.map((node, i) => {
    const k = `${keyPrefix}-${i}`;
    if (node.kind === 'text') return <span key={k}>{node.text}</span>;
    if (node.kind === 'br') return <br key={k} />;
    if (node.kind === 'strong') return <strong key={k}>{renderInline(node.children, k)}</strong>;
    if (node.kind === 'em') return <em key={k}>{renderInline(node.children, k)}</em>;
    if (node.kind === 'code') return <code key={k}>{renderInline(node.children, k)}</code>;
    if (node.kind === 'a') {
      return (
        <a key={k} href={node.href} target="_blank" rel="noopener noreferrer">
          {renderInline(node.children, k)}
        </a>
      );
    }
    return null;
  });
}

export default function LegacyHtmlRenderer({ html, className }: LegacyHtmlRendererProps) {
  if (!html || html.trim().length === 0) return null;

  const sanitized = sanitize(html);
  const blocks = parseBlocks(sanitized);

  return (
    <div className={className}>
      {blocks.map((block, i) => {
        const k = `b${i}`;
        switch (block.kind) {
          case 'h2':
            return <h2 key={k}>{renderInline(block.children, k)}</h2>;
          case 'h3':
            return <h3 key={k}>{renderInline(block.children, k)}</h3>;
          case 'h4':
            return <h4 key={k}>{renderInline(block.children, k)}</h4>;
          case 'blockquote':
            return <blockquote key={k}>{renderInline(block.children, k)}</blockquote>;
          case 'ul':
            return (
              <ul key={k}>
                {block.items.map((item, j) => <li key={`${k}-${j}`}>{renderInline(item, `${k}-${j}`)}</li>)}
              </ul>
            );
          case 'ol':
            return (
              <ol key={k}>
                {block.items.map((item, j) => <li key={`${k}-${j}`}>{renderInline(item, `${k}-${j}`)}</li>)}
              </ol>
            );
          case 'p':
            return <p key={k}>{renderInline(block.children, k)}</p>;
          default: {
            const _exhaustive: never = block;
            return null;
          }
        }
      })}
    </div>
  );
}
