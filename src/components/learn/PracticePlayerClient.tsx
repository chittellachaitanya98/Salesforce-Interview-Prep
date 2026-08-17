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
  type QuizAttempt,
  type TopicEvidenceState,
} from "@/lib/evidence-storage";
import { McqCard } from "@/components/learn/McqCard";
import { SourceMoreInfoList } from "@/components/MoreInfoLink";
import { BulletList, splitToBullets } from "@/lib/text-format";

type PracticeTab = "mcqs" | "flashcards" | "lab" | "interview";

type Props = {
  topic: Topic;
};

export function PracticePlayerClient({ topic }: Props) {
  const topicId = topic.topic_id;
  const mcqTotal = topic.mcqs.length;
  const [tab, setTab] = useState<PracticeTab>("mcqs");
  const [state, setState] = useState<TopicEvidenceState>(emptyTopicState);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setState(loadTopicState(topicId));
  }, [topicId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash === "#interview") setTab("interview");
  }, []);

  const independentCount = useMemo(
    () => independentMcqCount(state.quiz, mcqTotal),
    [state.quiz, mcqTotal],
  );

  function persist(next: TopicEvidenceState) {
    setState(next);
    saveTopicState(topicId, next);
    syncRegistryEntry(topicId, next, mcqTotal);
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
    <article className="topic-player">
      <header className="topic-hero">
        <div className="topic-hero-meta">
          <span className="chip">{topic.topic_id}</span>
          <span className="chip">{topic.track}</span>
          <span className="chip">Practice</span>
        </div>
        <h1>{topic.title}</h1>
        <p className="section-note">
          Trailhead-style practice — MCQs for reasoning, flashcards for recall,
          a 30s / 2 min interview drill, and a sandbox lab.
        </p>
        <p className="evidence-inline">
          <strong>
            {independentCount} / {mcqTotal}
          </strong>{" "}
          independent MCQs verified locally
        </p>
      </header>

      <div className="practice-tabs" role="tablist" aria-label="Practice mode">
        {(
          [
            ["mcqs", "MCQs"],
            ["flashcards", "Flashcards"],
            ["interview", "Interview"],
            ["lab", "Hands-on lab"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            id={`practice-tab-${id}`}
            role="tab"
            aria-selected={tab === id}
            aria-controls={`practice-panel-${id}`}
            tabIndex={tab === id ? 0 : -1}
            className={`practice-tab ${tab === id ? "active" : ""}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "mcqs" ? (
        <section
          className="player-section"
          role="tabpanel"
          id="practice-panel-mcqs"
          aria-labelledby="practice-tab-mcqs"
        >
          <p className="eyebrow">MCQs</p>
          <h2>Check your reasoning</h2>
          <p className="section-note">
            Answer and set confidence before feedback. Only a correct, unaided
            first attempt counts toward verification.
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
      ) : null}

      {tab === "flashcards" ? (
        <section
          className="player-section"
          role="tabpanel"
          id="practice-panel-flashcards"
          aria-labelledby="practice-tab-flashcards"
        >
          <p className="eyebrow">Flashcards</p>
          <h2>Spaced recall</h2>
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
        </section>
      ) : null}

      {tab === "interview" ? (
        <section
          className="player-section"
          role="tabpanel"
          id="practice-panel-interview"
          aria-labelledby="practice-tab-interview"
        >
          <p className="eyebrow">Interview drill</p>
          <h2>30s / 2 min answers</h2>
          <p className="section-note">
            Speak first. Reveal the 30-second take, then the 2-minute answer,
            then an example — separately, after you have tried.
          </p>
          <div className="star-grid">
            {topic.interview_questions.map((item) => (
              <article className="interview-card" key={item.id}>
                <h3>{item.question}</h3>
                <div className="reveal-buttons">
                  <details className="reveal-panel">
                    <summary>30 seconds</summary>
                    <BulletList
                      items={splitToBullets(item.answer_30_seconds, 5)}
                    />
                  </details>
                  <details className="reveal-panel">
                    <summary>2 minutes</summary>
                    <BulletList
                      items={splitToBullets(item.answer_2_minutes, 6)}
                    />
                  </details>
                  <details className="reveal-panel">
                    <summary>Example</summary>
                    <BulletList items={splitToBullets(item.example, 5)} />
                  </details>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {tab === "lab" ? (
        <section
          className="player-section"
          role="tabpanel"
          id="practice-panel-lab"
          aria-labelledby="practice-tab-lab"
        >
          <p className="eyebrow">Hands-on lab</p>
          <h2>Trailhead-style sandbox practice</h2>
          <div className="lab-banner">
            <strong>Sandbox-only.</strong> {topic.hands_on_lab.environment}
          </div>
          {topic.hands_on_lab.starting_state_checks.length > 0 ? (
            <>
              <h3>Starting checks</h3>
              <ul className="bullet-panel">
                {topic.hands_on_lab.starting_state_checks.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </>
          ) : null}
          <ol className="lab-steps">
            {topic.hands_on_lab.steps.map((step, i) => (
              <li key={step}>
                <span>{i + 1}</span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
          <h3>Mechanics walkthrough</h3>
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
          {topic.hands_on_lab.independent_challenge ? (
            <div className="challenge-card">
              <p className="eyebrow">Independent challenge</p>
              <p>{topic.hands_on_lab.independent_challenge}</p>
            </div>
          ) : null}
        </section>
      ) : null}

      <div className="practice-footer">
        {topic.sources?.length ? (
          <section className="player-section tile" id="sources">
            <h2>Sources</h2>
            <SourceMoreInfoList sources={topic.sources} />
          </section>
        ) : null}
        <button
          className="text-link-btn danger"
          type="button"
          onClick={() => {
            if (!confirm("Reset locally stored practice evidence for this module?")) return;
            resetTopicEvidence(topicId);
            setState(emptyTopicState());
          }}
        >
          Reset local practice evidence
        </button>
      </div>
    </article>
  );
}
