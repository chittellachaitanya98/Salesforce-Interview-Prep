import type { Topic } from "@/lib/topic";
import { FlowStrip, flowNodesFromDecision } from "@/components/FlowStrip";
import { DiagramLoupe } from "@/components/DiagramLoupe";
import { MermaidDiagram } from "@/components/learn/MermaidDiagram";
import { SourceMoreInfoList } from "@/components/MoreInfoLink";
import { BulletList, splitToBullets } from "@/lib/text-format";

type Props = {
  topic: Topic;
};

export function CheatSheetCanvas({ topic }: Props) {
  const terms = topic.terminology.slice(0, 8);
  const cues = topic.decision_table.slice(0, 5);
  const trouble = topic.troubleshooting.slice(0, 4);
  const recap = splitToBullets(topic.sixty_second_explanation, 4);
  const why = splitToBullets(topic.why_it_matters, 4);
  const { nodes, footnotes } = flowNodesFromDecision(topic.decision_table);
  const structure = topic.visuals?.mermaid?.structure;
  const decision = topic.visuals?.mermaid?.decision;

  return (
    <article className="sheet-poster">
      <header className="sheet-tile sheet-hero">
        <p className="sheet-kicker">
          <code className="inline-code">{topic.topic_id}</code>
          {" · "}
          {topic.level}
          {" · "}
          {topic.estimated_minutes} min
        </p>
        <h1>{topic.title}</h1>
        <BulletList items={recap} className="bullet-list sheet-lead-list" />
      </header>

      <div className="sheet-two-col">
        <section className="sheet-tile" id="why">
          <h2>Why this matters</h2>
          <BulletList items={why} />
          <BulletList
            items={topic.objectives.slice(0, 4)}
            className="bullet-list sheet-objectives"
          />
        </section>

        <section className="sheet-tile" id="cues">
          <h2>Decision cues</h2>
          <ul className="bullet-list">
            {cues.map((row) => (
              <li key={row.signal}>
                <strong>{row.choose}</strong>
                {" — "}
                {row.signal}
                <span className="sheet-not"> Not: {row.not}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {decision ? (
        <section className="sheet-tile" id="decision-diagram">
          <h2>When to use which</h2>
          <MermaidDiagram
            chart={decision}
            title="Decision"
            showSource
            withLoupe
          />
        </section>
      ) : null}

      {structure ? (
        <section className="sheet-tile" id="structure">
          <h2>Structure</h2>
          <MermaidDiagram chart={structure} title="Structure" withLoupe />
        </section>
      ) : null}

      {nodes.length >= 2 ? (
        <section className="sheet-tile" id="path">
          <h2>Path</h2>
          <DiagramLoupe label="path flow">
            <FlowStrip nodes={nodes} footnotes={footnotes} />
          </DiagramLoupe>
        </section>
      ) : null}

      <section className="sheet-tile" id="terms">
        <h2>Terms you must own</h2>
        <div className="sheet-type-grid">
          {terms.map((term) => (
            <article className="sheet-type-card" key={term.term}>
              <h3>
                <code className="inline-code">{term.term}</code>
              </h3>
              <BulletList items={splitToBullets(term.plain, 3)} />
            </article>
          ))}
        </div>
      </section>

      {trouble.length > 0 ? (
        <section className="sheet-tile" id="stuck">
          <h2>Stuck? Fix it</h2>
          <div className="sheet-trouble-grid">
            {trouble.map((row, index) => (
              <article
                className={`sheet-trouble tone-${(index % 4) + 1}`}
                key={row.symptom}
              >
                <h3>{row.symptom}</h3>
                <BulletList items={row.check.slice(0, 3)} />
                <p>
                  <strong>Do not assume:</strong> {row.do_not_assume}
                </p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {topic.teach_back_prompt ? (
        <footer className="sheet-tile sheet-feynman">
          <p className="sheet-kicker">Feynman</p>
          <h2>Explain it without the jargon</h2>
          <BulletList items={splitToBullets(topic.teach_back_prompt, 3)} />
        </footer>
      ) : null}

      {topic.sources?.length ? (
        <section className="sheet-tile" id="sources">
          <h2>Sources</h2>
          <SourceMoreInfoList sources={topic.sources} />
        </section>
      ) : null}
    </article>
  );
}
