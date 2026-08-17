"use client";

import { useEffect, useState } from "react";
import type { Topic } from "@/lib/topic";
import {
  emptyTopicState,
  loadTopicState,
  saveTopicState,
  syncRegistryEntry,
  type DiagnosticAttempt,
  type TopicEvidenceState,
} from "@/lib/evidence-storage";

type Props = {
  topic: Topic;
};

export function ContextPlayerClient({ topic }: Props) {
  const topicId = topic.topic_id;
  const mcqTotal = topic.mcqs.length;
  const [state, setState] = useState<TopicEvidenceState>(emptyTopicState);
  const [diagnosticText, setDiagnosticText] = useState("");
  const [diagnosticConfidence, setDiagnosticConfidence] = useState(3);

  useEffect(() => {
    const stored = loadTopicState(topicId);
    setState(stored);
    setDiagnosticText(stored.diagnostic?.text ?? "");
    setDiagnosticConfidence(stored.diagnostic?.confidence ?? 3);
  }, [topicId]);

  function persist(next: TopicEvidenceState) {
    setState(next);
    saveTopicState(topicId, next);
    syncRegistryEntry(topicId, next, mcqTotal);
  }

  function commitDiagnostic(assistance: DiagnosticAttempt["assistance"]) {
    if (!diagnosticText.trim()) return;
    const diagnostic: DiagnosticAttempt = {
      text: diagnosticText.trim(),
      confidence: diagnosticConfidence,
      assistance,
      provenance: "learner-authored",
      verification: "external-unverified",
      at: new Date().toISOString(),
    };
    persist({ ...state, diagnostic });
  }

  return (
    <article className="topic-player">
      <header className="topic-hero">
        <div className="topic-hero-meta">
          <span className="chip">{topic.topic_id}</span>
          <span className="chip">{topic.track}</span>
          <span className="chip">{topic.level}</span>
        </div>
        <h1>{topic.title}</h1>
        <p className="topic-lead">{topic.definition}</p>
      </header>

      <section className="player-section">
        <p className="eyebrow">Subjective context</p>
        <h2>Start with the business situation</h2>
        <p className="section-note">
          Retrieve from memory before opening theory. Your attempt is stored locally.
        </p>

        <ul className="objective-list">
          {topic.objectives.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>

        <div className="attempt-card">
          <p className="attempt-label">Diagnostic · attempt before reveal</p>
          <p className="diagnostic-prompt">{topic.diagnostic_question}</p>
          <label className="sr-only" htmlFor="diagnostic-answer">
            Write a memory-first answer
          </label>
          <textarea
            id="diagnostic-answer"
            rows={5}
            value={diagnosticText}
            onChange={(e) => setDiagnosticText(e.target.value)}
            placeholder="Situation, constraints, what you would verify first, and what evidence would change your approach."
          />
          <div className="attempt-actions">
            <label>
              Confidence{" "}
              <input
                type="range"
                min={1}
                max={5}
                value={diagnosticConfidence}
                onChange={(e) => setDiagnosticConfidence(Number(e.target.value))}
              />
              <span>{diagnosticConfidence}/5</span>
            </label>
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => commitDiagnostic("unaided")}
            >
              Commit attempt
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => commitDiagnostic("orientation-revealed")}
            >
              Save as assisted
            </button>
          </div>
          {state.diagnostic ? (
            <p className="evidence-note">
              Attempt saved ({state.diagnostic.assistance}). Continue to{" "}
              <a className="text-link" href={`/theory/${topic.slug}/`}>
                Theory
              </a>{" "}
              for knowledge, limits, and STAR frameworks.
            </p>
          ) : null}
        </div>

        <p className="lead-paragraph">{topic.why_it_matters}</p>

        <div className="scenario-card">
          <p className="eyebrow">Scenario anchor</p>
          <h3>{topic.worked_example.scenario}</h3>
        </div>

        {topic.prerequisites.length > 0 ? (
          <div className="prereq-card">
            <p className="eyebrow">Prerequisites</p>
            <ul>
              {topic.prerequisites.map((id) => (
                <li key={id}>
                  <code>{id}</code>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
    </article>
  );
}
