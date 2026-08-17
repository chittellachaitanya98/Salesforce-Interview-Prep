import Link from "next/link";
import type { Topic } from "@/lib/topic";
import { cheatSheetViewerHref } from "@/lib/paths";
import { splitToBullets, BulletList } from "@/lib/text-format";
import { MermaidDiagram } from "@/components/learn/MermaidDiagram";
import { DiagramLoupe } from "@/components/DiagramLoupe";
import { FlowStrip, flowNodesFromDecision } from "@/components/FlowStrip";

type Props = {
  topic: Topic;
};

export function DecisionPlayerClient({ topic }: Props) {
  const decisionChart = topic.visuals?.mermaid?.decision?.trim();
  const structureChart =
    !decisionChart && topic.visuals?.mermaid?.structure
      ? topic.visuals.mermaid.structure
      : null;
  const { nodes, footnotes } = flowNodesFromDecision(topic.decision_table);

  return (
    <article className="topic-player scan-lesson">
      <header className="topic-hero tile">
        <div className="topic-hero-meta">
          <span className="chip">
            <code>{topic.topic_id}</code>
          </span>
          <span className="chip">{topic.track}</span>
          <span className="chip">Decisions</span>
        </div>
        <h1>{topic.title}</h1>
        <p className="topic-freshness">When to use what · interview cues</p>
      </header>

      <section className="player-section tile" id="decisions">
        <p className="eyebrow">When to use what</p>
        <h2>Decision cues</h2>
        <ol className="cue-stack">
          {topic.decision_table.map((row, index) => {
            const whyBullets = splitToBullets(row.why, 4);
            return (
              <li className="cue-card" key={row.signal}>
                <span className="cue-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="cue-signal">{row.signal}</p>
                  <p>
                    <strong>Choose:</strong> {row.choose}
                  </p>
                  <p className="cue-not">
                    <strong>Not by default:</strong> {row.not}
                  </p>
                  {whyBullets.length > 0 ? (
                    <BulletList items={whyBullets} className="bullet-list cue-why-list" />
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {decisionChart || structureChart || nodes.length >= 2 ? (
        <section className="player-section tile" id="visuals">
          <p className="eyebrow">Picture it</p>
          <h2>Scan the path</h2>
          {decisionChart ? (
            <MermaidDiagram chart={decisionChart} title="When to use which" />
          ) : structureChart ? (
            <MermaidDiagram chart={structureChart} title="Structure" />
          ) : null}
          {nodes.length >= 2 ? (
            <DiagramLoupe label="path flow">
              <FlowStrip
                nodes={nodes}
                footnotes={footnotes}
                title="Choose this path when…"
              />
            </DiagramLoupe>
          ) : null}
        </section>
      ) : null}

      <footer className="lesson-next">
        <Link className="btn btn-secondary" href={`/learn/${topic.slug}/`}>
          Open Learn
        </Link>
        <Link className="btn btn-primary" href={`/practice/${topic.slug}/`}>
          Practice this module
        </Link>
        <Link
          className="btn btn-secondary"
          href={cheatSheetViewerHref(topic.topic_id)}
        >
          Open cheat sheet
        </Link>
      </footer>
    </article>
  );
}
