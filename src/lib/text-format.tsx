import type { ReactNode } from "react";

/** Split dense prose into short cheat-sheet bullets. */
export function splitToBullets(text: string, max = 6): string[] {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return [];

  const parts = cleaned
    .split(/(?<=[.!;])\s+|\n+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length <= 1 && cleaned.length > 120) {
    const clauses = cleaned
      .split(/,\s+(?=[A-Z])|\s+—\s+|\s+-\s+/)
      .map((part) => part.trim())
      .filter((part) => part.length > 12);
    if (clauses.length > 1) return clauses.slice(0, max);
  }

  return (parts.length ? parts : [cleaned]).slice(0, max);
}

const API_TOKEN =
  /(\b[A-Z][A-Za-z0-9]*(?:__[cr]|__e)?\b|@[a-zA-Z]+|`[^`]+`)/g;

/** Render a line with mono API tokens and light bold on leading action verbs. */
export function EmphasizedLine({ text }: { text: string }): ReactNode {
  const nodes: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  const re = new RegExp(API_TOKEN.source, "g");

  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push(emphasizeVerbs(text.slice(last, match.index)));
    }
    const token = match[0];
    if (token.startsWith("`") && token.endsWith("`")) {
      nodes.push(
        <code key={`${match.index}-code`} className="inline-code">
          {token.slice(1, -1)}
        </code>,
      );
    } else if (/^[A-Z]/.test(token) || token.startsWith("@")) {
      nodes.push(
        <code key={`${match.index}-api`} className="inline-code">
          {token}
        </code>,
      );
    } else {
      nodes.push(token);
    }
    last = match.index + token.length;
  }

  if (last < text.length) nodes.push(emphasizeVerbs(text.slice(last)));
  if (nodes.length === 0) return emphasizeVerbs(text);
  return <>{nodes}</>;
}

function emphasizeVerbs(chunk: string): ReactNode {
  const verbs =
    /^(Choose|Use|Prefer|Avoid|Never|Always|Start|Stop|Check|Open|Create|Deploy|Enable|Disable|Register|Authenticate|Save|Run|Call|Pass|Return|Keep|Do not|Don't)\b/i;
  const m = chunk.match(verbs);
  if (!m || m.index !== 0) return chunk;
  const word = m[0];
  return (
    <>
      <strong>{word}</strong>
      {chunk.slice(word.length)}
    </>
  );
}

export function BulletList({
  items,
  className = "bullet-list",
}: {
  items: string[];
  className?: string;
}) {
  if (!items.length) return null;
  return (
    <ul className={className}>
      {items.map((item) => (
        <li key={item}>
          <EmphasizedLine text={item} />
        </li>
      ))}
    </ul>
  );
}
