"use client";

import { useEffect, useMemo, useState } from "react";
import type { Topic } from "@/lib/topic";
import {
  emptyTopicState,
  independentMcqCount,
  loadTopicState,
  resetTopicEvidence,
  saveTopicState,
  syncRegistryEntry,
  type DiagnosticAttempt,
  type QuizAttempt,
  type TopicEvidenceState,
} from "@/lib/evidence-storage";
import { cheatSheetViewerHref } from "@/lib/paths";
import { MermaidDiagram } from "@/components/learn/MermaidDiagram";

const SECTIONS = [
  ["context", "Context"],
  ["theory", "Theory"],
  ["visuals", "Visuals"],
  ["cheat-sheet", "Cheat sheet"],
  ["mcqs", "MCQs"],
  ["practice", "Practice"],
  ["review", "Review"],
] as const;

type TopicPlayerClientProps = {
  topic: Topic;
};

export function TopicPlayerClient({ topic }: TopicPlayerClientProps) {
  const topicId = topic.topic_id;
  const mcqTotal = topic.mcqs.length;
  const [state, setState] = useState<TopicEvidenceState>(emptyTopicState);
  const [revealedTheory, setRevealedTheory] = useState(false);
  const [diagnosticText, setDiagnosticText] = useState("");
  const [diagnosticConfidence, setDiagnosticConfidence] = useState(3);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const stored = loadTopicState(topicId);
    setState(stored);
    setDiagnosticText(stored.diagnostic?.text ?? "");
    setDiagnosticConfidence(stored.diagnostic?.confidence ?? 3);
    setRevealedTheory(Boolean(stored.diagnostic?.text));
  }, [topicId]);

  const independentCount = useMemo(
    () => independentMcqCount(state.quiz, mcqTotal),
    [state.quiz, mcqTotal],
  );

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
    setRevealedTheory(true);
  }

  function submitMcq(
    questionId: string,
    answer: string,
    choice: string,
    confidence: number,
    priorCount: number,
  ) {
    const correct = choice === answer;
    const attempt: QuizAttempt = {
      id: questionId,
      choice,
      confidence,
      outcome: correct ? "correct" : "incorrect",
      assistance: priorCount === 0 ? "unaided" : "feedback-assisted",
      provenance: "local-deterministic",
      at: new Date().toISOString(),
    };
    persist({ ...state, quiz: [...state.quiz, attempt] });
    return correct;
  }

  return (
    <div className="topic-layout">
      <aside className="topic-rail" aria-label="Lesson outline">
        <p className="eyebrow">On this page</p>
        <nav className="topic-rail-nav">
          {SECTIONS.map(([id, label]) => (
            <a key={id} href={`#${id}`}>
              {label}
            </a>
          ))}
        </nav>
        <div className="evidence-panel">
          <p className="eyebrow">Local evidence</p>
          <strong>
            {independentCount} / {mcqTotal} independent checked items
          </strong>
          <p className="evidence-note">
            Only a correct, unaided first attempt counts toward verification.
          </p>
          <button
            className="text-link-btn danger"
            type="button"
            onClick={() => {
              if (!confirm("Reset locally stored evidence for this lesson?")) return;
              resetTopicEvidence(topicId);
              setState(emptyTopicState());
              setDiagnosticText("");
              setRevealedTheory(false);
            }}
          >
            Reset local evidence
          </button>
        </div>
      </aside>

      <article className="topic-player">
        <header className="topic-hero">
          <div className="topic-hero-meta">
            <span className="chip">{topic.topic_id}</span>
            <span className="chip">{topic.track}</span>
            <span className="chip">{topic.level}</span>
            <span className="chip">{topic.estimated_minutes} min</span>
          </div>
          <h1>{topic.title}</h1>
          <p className="topic-lead">{topic.definition}</p>
          <p className="topic-freshness">
            Verified {topic.last_verified} · {topic.release_verified} · API{" "}
            {topic.api_version}
          </p>
        </header>

        <nav className="section-jump mobile-only" aria-label="Topic sections">
          {SECTIONS.map(([id, label]) => (
            <a key={id} href={`#${id}`}>
              {label}
            </a>
          ))}
        </nav>

        <section className="player-section" id="context">
          <p className="eyebrow">Subjective context</p>
          <h2>Start with the business situation</h2>
          <ul className="objective-list">
            {topic.objectives.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
          <div className="attempt-card">
            <p className="attempt-label">Attempt before reveal</p>
            <p className="diagnostic-prompt">{topic.diagnostic_question}</p>
            <label className="sr-only" htmlFor="diagnostic-answer">
              Write a memory-first answer
            </label>
            <textarea
              id="diagnostic-answer"
              rows={5}
              value={diagnosticText}
              onChange={(e) => setDiagnosticText(e.target.value)}
              placeholder="Name the business nouns, instances, typed facts, and evidence that would change your model."
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
                Show orientation (assisted)
              </button>
            </div>
          </div>
          <p className="lead-paragraph">{topic.why_it_matters}</p>
          <div className="scenario-card">
            <p className="eyebrow">Scenario anchor</p>
            <h3>{topic.worked_example.scenario}</h3>
          </div>
        </section>

        <section className="player-section" id="theory">
          <p className="eyebrow">Theory · Pareto 80/20</p>
          <h2>Plain language first</h2>
          {revealedTheory ? (
            <>
              <div className="key-explanation">
                <p>{topic.sixty_second_explanation}</p>
              </div>
              <div className="term-grid">
                {topic.terminology.map((term) => (
                  <article className="term-card" key={term.term}>
                    <h3>{term.term}</h3>
                    <p>{term.plain}</p>
                  </article>
                ))}
              </div>
              <div className="analogy-grid">
                <div>
                  <h3>{topic.mental_model.analogy}</h3>
                  <h4>Useful mapping</h4>
                  <ul>
                    {topic.mental_model.useful_mapping.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="boundary-panel">
                  <h4>Where it breaks</h4>
                  <ul>
                    {topic.mental_model.where_it_breaks.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <ol className="deep-list">
                {topic.deeper_explanation.map((para) => (
                  <li key={para}>{para}</li>
                ))}
              </ol>
            </>
          ) : (
            <p className="reminder-note">
              Commit your diagnostic attempt above to unlock theory content.
            </p>
          )}
        </section>

        <section className="player-section" id="visuals">
          <p className="eyebrow">Visual model</p>
          <h2>Scan the model</h2>
          {topic.visuals?.mermaid?.structure ? (
            <MermaidDiagram chart={topic.visuals.mermaid.structure} title="Structure" />
          ) : null}
          {topic.visuals?.mermaid?.decision ? (
            <MermaidDiagram chart={topic.visuals.mermaid.decision} title="When to use which" />
          ) : null}
          {topic.visuals?.mermaid?.sequence ? (
            <MermaidDiagram chart={topic.visuals.mermaid.sequence} title="Sequence" />
          ) : null}
        </section>

        <section className="player-section" id="cheat-sheet">
          <p className="eyebrow">Cheat sheet</p>
          <h2>Limits and decisions</h2>
          <div className="two-col">
            <div>
              <h3>Boundaries</h3>
              <ul>
                {topic.limitations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Common mistakes</h3>
              <ul>
                {topic.common_mistakes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Signal</th>
                  <th>Choose</th>
                  <th>Not by default</th>
                  <th>Why</th>
                </tr>
              </thead>
              <tbody>
                {topic.decision_table.map((row) => (
                  <tr key={row.signal}>
                    <td>{row.signal}</td>
                    <td>
                      <strong>{row.choose}</strong>
                    </td>
                    <td>{row.not}</td>
                    <td>{row.why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="asset-card">
            <h3>One-page cheat sheet</h3>
            <a className="btn btn-primary" href={cheatSheetViewerHref(topicId)}>
              Open cheat sheet
            </a>
          </div>
        </section>

        <section className="player-section" id="mcqs">
          <p className="eyebrow">MCQs</p>
          <h2>Check reasoning</h2>
          <p className="section-note">
            Answer and set confidence before feedback. Original questions only.
          </p>
          <div className="mcq-list">
            {topic.mcqs.map((q) => (
              <McqCard
                key={q.id}
                question={q}
                attempts={state.quiz.filter((a) => a.id === q.id)}
                onSubmit={(choice, confidence) =>
                  submitMcq(
                    q.id,
                    q.answer,
                    choice,
                    confidence,
                    state.quiz.filter((a) => a.id === q.id).length,
                  )
                }
              />
            ))}
          </div>
        </section>

        <section className="player-section" id="practice">
          <p className="eyebrow">Practice</p>
          <h2>Trailhead-style lab</h2>
          <div className="lab-banner">
            <strong>Sandbox-only lab.</strong> {topic.hands_on_lab.environment}
          </div>
          <ol className="lab-steps">
            {topic.hands_on_lab.steps.map((step, i) => (
              <li key={step}>
                <span>{i + 1}</span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
          <h3>Mechanics</h3>
          <div className="mechanics-list">
            {topic.mechanics.map((step) => (
              <article key={step.step}>
                <span>{String(step.step).padStart(2, "0")}</span>
                <div>
                  <h4>{step.transition}</h4>
                  <p>
                    <strong>Actor:</strong> {step.actor} · <strong>Trigger:</strong>{" "}
                    {step.trigger}
                  </p>
                  <p>
                    {step.before} → {step.after}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="player-section" id="review">
          <p className="eyebrow">Review</p>
          <h2>Flashcards and spaced recall</h2>
          <div className="flash-grid">
            {topic.flashcards.map((card) => (
              <button
                key={card.id}
                type="button"
                className={`flash-card interactive ${flippedCards[card.id] ? "flipped" : ""}`}
                onClick={() =>
                  setFlippedCards((prev) => ({
                    ...prev,
                    [card.id]: !prev[card.id],
                  }))
                }
              >
                {!flippedCards[card.id] ? (
                  <>
                    <small>{card.category}</small>
                    <strong>{card.front}</strong>
                    <em>Tap to reveal</em>
                  </>
                ) : (
                  <>
                    <small>Answer</small>
                    <strong>{card.back}</strong>
                    <em>Tap to return</em>
                  </>
                )}
              </button>
            ))}
          </div>
          <div className="review-timeline">
            {topic.review_schedule.map((item) => (
              <article key={item.interval}>
                <span>{item.interval}</span>
                <p>{item.prompt}</p>
              </article>
            ))}
          </div>
          <h3>Sources</h3>
          <ul className="source-list">
            {topic.sources.map((source) => (
              <li key={source.source_id}>
                <a href={source.url} rel="noopener noreferrer">
                  {source.title}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </article>
    </div>
  );
}

type McqCardProps = {
  question: Topic["mcqs"][number];
  attempts: QuizAttempt[];
  onSubmit: (choice: string, confidence: number) => boolean;
};

function McqCard({ question, attempts, onSubmit }: McqCardProps) {
  const [choice, setChoice] = useState("");
  const [confidence, setConfidence] = useState("");
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    answer: string;
  } | null>(null);
  const last = attempts[attempts.length - 1];

  useEffect(() => {
    if (last) {
      setFeedback({
        correct: last.outcome === "correct",
        answer: question.answer,
      });
    }
  }, [last, question.answer]);

  return (
    <form
      className="mcq-card"
      onSubmit={(e) => {
        e.preventDefault();
        if (!choice || !confidence) return;
        const correct = onSubmit(choice, Number(confidence));
        setFeedback({ correct, answer: question.answer });
      }}
    >
      <div className="question-meta">
        <code>{question.id}</code>
        <span className="chip">
          {question.category} · {question.difficulty}
        </span>
      </div>
      <fieldset>
        <legend>{question.prompt}</legend>
        {Object.entries(question.options).map(([key, value]) => (
          <label key={key} className="mcq-option">
            <input
              type="radio"
              name={question.id}
              value={key}
              checked={choice === key}
              onChange={() => setChoice(key)}
            />
            <span>
              <b>{key}.</b> {value}
            </span>
          </label>
        ))}
      </fieldset>
      <label className="confidence-row">
        Confidence before feedback{" "}
        <select
          name="confidence"
          value={confidence}
          onChange={(e) => setConfidence(e.target.value)}
        >
          <option value="">Choose 1–5</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>
      <button className="btn btn-primary" type="submit">
        Check reasoning
      </button>
      {feedback && (
        <div
          className={`quiz-feedback ${feedback.correct ? "correct" : "incorrect"}`}
        >
          <p className="feedback-result">
            {feedback.correct
              ? "Correct. Your classification matches the governing model."
              : `Not yet. The best answer is ${feedback.answer}.`}
          </p>
          <p>{question.rationale}</p>
          <p>
            <b>Concept:</b> {question.concept}
          </p>
        </div>
      )}
    </form>
  );
}
