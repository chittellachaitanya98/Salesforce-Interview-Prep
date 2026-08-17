"use client";

import Link from "next/link";
import type { Topic } from "@/lib/topic";
import { cheatSheetViewerHref } from "@/lib/paths";

type Props = {
  topic: Topic;
};

export function TerminologyPlayerClient({ topic }: Props) {
  return (
    <article className="topic-player terminology-player">
      <header className="topic-hero">
        <div className="topic-hero-meta">
          <span className="chip">{topic.topic_id}</span>
          <span className="chip">{topic.track}</span>
          <span className="chip">Terminology</span>
        </div>
        <h1>{topic.title}</h1>
        <p className="topic-freshness">
          Load-bearing terms first — then continue into Learn or Practice.
        </p>
        <div className="hero-actions terminology-actions">
          <Link className="btn btn-primary" href={`/learn/${topic.slug}/`}>
            Continue to Learn
          </Link>
          <Link className="btn btn-secondary" href={`/decisions/${topic.slug}/`}>
            Decisions
          </Link>
          <Link className="btn btn-secondary" href={`/practice/${topic.slug}/`}>
            Practice
          </Link>
          <Link className="btn btn-secondary" href={cheatSheetViewerHref(topic.topic_id)}>
            Cheat sheet
          </Link>
        </div>
      </header>

      <section className="player-section" id="terminology" aria-labelledby="terms-heading">
        <p className="eyebrow">Glossary</p>
        <h2 id="terms-heading">Terms you must own</h2>
        <div className="term-grid">
          {topic.terminology.map((term) => (
            <article className="term-card" key={term.term}>
              <h3>{term.term}</h3>
              <p>{term.plain}</p>
              {term.precise ? (
                <p className="term-precise">
                  <strong>Precise:</strong> {term.precise}
                </p>
              ) : null}
              {term.example ? (
                <p className="term-example">
                  <strong>Example:</strong> {term.example}
                </p>
              ) : null}
              {term.non_example ? (
                <p className="term-non-example">
                  <strong>Not this:</strong> {term.non_example}
                </p>
              ) : null}
              {term.confusable_neighbor ? (
                <p className="term-neighbor">
                  <strong>Don&apos;t confuse with:</strong>{" "}
                  {term.confusable_neighbor}
                </p>
              ) : null}
              {term.boundary ? (
                <p className="term-boundary">
                  <strong>Boundary:</strong> {term.boundary}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </article>
  );
}
