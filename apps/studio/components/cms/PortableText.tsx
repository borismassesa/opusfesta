import type { ReactNode } from 'react';

// Public renderer for Tiptap JSON documents stored in studio_documents.
// Traverses the tree and emits semantic HTML. User content is rendered as
// React elements (not raw HTML), so there is no injection surface.
//
// Supported nodes: doc, paragraph, heading (h2/h3), bulletList, orderedList,
// listItem, blockquote, codeBlock, hardBreak.
// Supported marks: bold, italic, code, link.

type Mark =
  | { type: 'bold' }
  | { type: 'italic' }
  | { type: 'code' }
  | { type: 'link'; attrs?: { href?: string; target?: string; rel?: string } };

type Node =
  | { type: 'doc'; content?: Node[] }
  | { type: 'paragraph'; content?: Node[] }
  | { type: 'heading'; attrs?: { level?: number }; content?: Node[] }
  | { type: 'bulletList'; content?: Node[] }
  | { type: 'orderedList'; content?: Node[] }
  | { type: 'listItem'; content?: Node[] }
  | { type: 'blockquote'; content?: Node[] }
  | { type: 'codeBlock'; content?: Node[] }
  | { type: 'hardBreak' }
  | { type: 'text'; text: string; marks?: Mark[] }
  | { type: string; content?: Node[]; text?: string; marks?: Mark[]; attrs?: Record<string, unknown> };

interface PortableTextProps {
  value: unknown;
  className?: string;
}

function isNode(value: unknown): value is Node {
  return !!value && typeof value === 'object' && typeof (value as { type?: unknown }).type === 'string';
}

function renderMarks(text: string, marks: Mark[] | undefined, key: string): ReactNode {
  if (!marks || marks.length === 0) return text;
  return marks.reduce<ReactNode>((acc, mark, i) => {
    const markKey = `${key}-m${i}`;
    if (mark.type === 'bold') return <strong key={markKey}>{acc}</strong>;
    if (mark.type === 'italic') return <em key={markKey}>{acc}</em>;
    if (mark.type === 'code') return <code key={markKey}>{acc}</code>;
    if (mark.type === 'link') {
      return (
        <a
          key={markKey}
          href={mark.attrs?.href ?? '#'}
          target={mark.attrs?.target ?? '_blank'}
          rel={mark.attrs?.rel ?? 'noopener noreferrer'}
        >
          {acc}
        </a>
      );
    }
    return acc;
  }, text);
}

function renderChildren(nodes: Node[] | undefined, keyPrefix: string): ReactNode[] {
  if (!nodes) return [];
  return nodes
    .filter(isNode)
    .map((child, i) => renderNode(child, `${keyPrefix}-${i}`));
}

function renderNode(node: Node, key: string): ReactNode {
  switch (node.type) {
    case 'doc':
      return <>{renderChildren(node.content, key)}</>;
    case 'paragraph':
      return <p key={key}>{renderChildren(node.content, key)}</p>;
    case 'heading': {
      const level = (node as { attrs?: { level?: number } }).attrs?.level ?? 2;
      const children = renderChildren(node.content, key);
      if (level === 3) return <h3 key={key}>{children}</h3>;
      if (level === 4) return <h4 key={key}>{children}</h4>;
      return <h2 key={key}>{children}</h2>;
    }
    case 'bulletList':
      return <ul key={key}>{renderChildren(node.content, key)}</ul>;
    case 'orderedList':
      return <ol key={key}>{renderChildren(node.content, key)}</ol>;
    case 'listItem':
      return <li key={key}>{renderChildren(node.content, key)}</li>;
    case 'blockquote':
      return <blockquote key={key}>{renderChildren(node.content, key)}</blockquote>;
    case 'codeBlock':
      return (
        <pre key={key}>
          <code>{renderChildren(node.content, key)}</code>
        </pre>
      );
    case 'hardBreak':
      return <br key={key} />;
    case 'text':
      return (
        <span key={key}>
          {renderMarks((node as { text: string }).text, (node as { marks?: Mark[] }).marks, key)}
        </span>
      );
    default: {
      // Unknown node type — render children if it has any, otherwise skip.
      const unknown = node as { content?: Node[] };
      return unknown.content ? <div key={key}>{renderChildren(unknown.content, key)}</div> : null;
    }
  }
}

export default function PortableText({ value, className }: PortableTextProps) {
  if (!isNode(value)) return null;
  return <div className={className}>{renderNode(value, 'pt')}</div>;
}
