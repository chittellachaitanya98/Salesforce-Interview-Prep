"use client";

import Link from "next/link";
import type { Topic } from "@/lib/topic";
import { cheatSheetViewerHref } from "@/lib/paths";
import { MermaidDiagram } from "@/components/learn/MermaidDiagram";
import { SourceMoreInfoList } from "@/components/MoreInfoLink";
import { BulletList, splitToBullets } from "@/lib/text-format";

type Props = {
  topic: Topic;
};

export function TheoryPlayerClient({ topic }: Props) {
  const interviewPreview = topic.interview_questions.slice(0, 3);
  const recap = splitToBullets(topic.sixty_second_explanation, 4);
  const hasStructure = Boolean(topic.visuals?.mermaid?.structure);
  const hasSequence = Boolean(topic.visuals?.mermaid?.sequence);

  return (
    <article className="topic-player scan-lesson">
      <header className="topic-hero tile">
        <div className="topic-hero-meta">
          <span className="chip">
            <code>{topic.topic_id}</code>
          </span>
          <span className="chip">{topic.track}</span>
          <span className="chip">{topic.level}</span>
        </div>
        <h1>{topic.title}</h1>
        <p className="topic-freshness">
          Interview scan · {topic.estimated_minutes} min
        </p>
      </header>

      <section className="player-section tile" id="recap">
        <p className="eyebrow">60-second recap</p>
        <h2>Plain language first</h2>
        <BulletList items={recap} />
      </section>

      <section className="player-section tile" id="mental-model">
        <p className="eyebrow">Mental model</p>
        <h2>Analogy and boundaries</h2>
        <div className="analogy-grid">
          <div>
            <h3>{topic.mental_model.analogy}</h3>
            <h4>Useful mapping</h4>
            <BulletList items={topic.mental_model.useful_mapping} />
          </div>
          <div className="boundary-panel">
            <h4>Where it breaks</h4>
            <BulletList items={topic.mental_model.where_it_breaks} />
          </div>
        </div>
      </section>

      {topic.decision_table.length > 0 ? (
        <section className="player-section tile" id="decisions">
          <p className="eyebrow">When to use what</p>
          <h2>Decision cues</h2>
          <BulletList
            items={[
              "Full signal → choose → not tables live in Decisions.",
              "Decision diagrams and path strips live there too.",
            ]}
          />
          <div className="lesson-next">
            <Link className="btn btn-primary" href={`/decisions/${topic.slug}/`}>
              Open Decisions
            </Link>
          </div>
        </section>
      ) : null}

      {hasStructure || hasSequence ? (
        <section className="player-section tile" id="visuals">
          <p className="eyebrow">Picture it</p>
          <h2>Scan the model</h2>
          {topic.visuals?.mermaid?.structure ? (
            <MermaidDiagram
              chart={topic.visuals.mermaid.structure}
              title="Structure"
            />
          ) : null}
          {topic.visuals?.mermaid?.sequence ? (
            <MermaidDiagram
              chart={topic.visuals.mermaid.sequence}
              title="Sequence"
            />
          ) : null}
        </section>
      ) : null}

      {topic.deeper_explanation.length > 0 ? (
        <section className="player-section tile" id="depth">
          <p className="eyebrow">Go deeper</p>
          <h2>The lesson behind the recap</h2>
          <BulletList items={topic.deeper_explanation} />
        </section>
      ) : null}

      {topic.teach_back_prompt ? (
        <section className="player-section tile" id="feynman">
          <p className="eyebrow">Feynman</p>
          <h2>Explain it back</h2>
          <BulletList items={splitToBullets(topic.teach_back_prompt, 3)} />
        </section>
      ) : null}

      <details className="more-panel tile" id="watch-outs">
        <summary>Open more — mistakes and troubleshooting</summary>
        <section className="player-section" id="mistakes">
          <h2>Common mistakes</h2>
          <BulletList items={topic.common_mistakes} />
        </section>
        {topic.troubleshooting.length > 0 ? (
          <section className="player-section" id="troubleshooting">
            <h2>Symptom → checks</h2>
            <div className="trouble-grid">
              {topic.troubleshooting.map((row, index) => (
                <article
                  className={`trouble-card tone-${(index % 4) + 1}`}
                  key={row.symptom}
                >
                  <h3>{row.symptom}</h3>
                  <BulletList items={row.check} />
                  <p>
                    <strong>Do not assume:</strong> {row.do_not_assume}
                  </p>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </details>

      {interviewPreview.length > 0 ? (
        <section className="player-section tile" id="interview">
          <p className="eyebrow">Interview teaser</p>
          <h2>Try these out loud</h2>
          <div className="star-grid">
            {interviewPreview.map((item) => (
              <article className="interview-card" key={item.id}>
                <h3>{item.question}</h3>
                <details className="reveal-panel">
                  <summary>Reveal 30-second answer</summary>
                  <BulletList
                    items={splitToBullets(item.answer_30_seconds, 4)}
                  />
                </details>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {topic.sources?.length ? (
        <section className="player-section tile" id="sources">
          <h2>Sources</h2>
          <SourceMoreInfoList sources={topic.sources} />
        </section>
      ) : null}

      <footer className="lesson-next">
        <Link className="btn btn-primary" href={`/decisions/${topic.slug}/`}>
          Decisions
        </Link>
        <Link className="btn btn-secondary" href={`/practice/${topic.slug}/`}>
          Practice
        </Link>
        <Link
          className="btn btn-secondary"
          href={cheatSheetViewerHref(topic.topic_id)}
        >
          Cheat sheet
        </Link>
      </footer>
    </article>
  );
}
