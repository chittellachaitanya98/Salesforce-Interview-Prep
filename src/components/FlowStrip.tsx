type FlowNode = {
  label: string;
  note?: string;
};

type Props = {
  nodes: FlowNode[];
  footnotes?: string[];
  title?: string;
};

const BORDER_TONES = [
  "flow-tone-a",
  "flow-tone-b",
  "flow-tone-c",
  "flow-tone-d",
  "flow-tone-e",
] as const;

/** Horizontal multi-color bordered path — Matter-style flow. */
export function FlowStrip({ nodes, footnotes = [], title }: Props) {
  if (nodes.length < 2) return null;

  return (
    <div className="flow-strip">
      {title ? <h3 className="flow-strip-title">{title}</h3> : null}
      <ol className="flow-strip-track" aria-label={title || "Process path"}>
        {nodes.map((node, index) => (
          <li
            key={`${node.label}-${index}`}
            className={`flow-strip-node ${BORDER_TONES[index % BORDER_TONES.length]}`}
          >
            <strong>{node.label}</strong>
            {node.note ? <span>{node.note}</span> : null}
          </li>
        ))}
      </ol>
      {footnotes.length > 0 ? (
        <ul className="flow-strip-notes">
          {footnotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function flowNodesFromDecision(
  rows: Array<{ signal: string; choose: string; not: string; why: string }>,
): { nodes: FlowNode[]; footnotes: string[] } {
  const top = rows.slice(0, 5);
  return {
    nodes: top.map((row) => ({
      label: row.choose,
      note: row.signal.length > 48 ? `${row.signal.slice(0, 46)}…` : row.signal,
    })),
    footnotes: top.slice(0, 2).map((row) => `Blocked if defaulting to ${row.not}: ${row.why}`),
  };
}
