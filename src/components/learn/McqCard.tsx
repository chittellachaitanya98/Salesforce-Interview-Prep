"use client";

import { useEffect, useState } from "react";
import type { Topic } from "@/lib/topic";
import type { QuizAttempt } from "@/lib/evidence-storage";

type McqCardProps = {
  question: Topic["mcqs"][number];
  attempts: QuizAttempt[];
  onSubmit: (choice: string, confidence: number) => boolean;
};

export function McqCard({ question, attempts, onSubmit }: McqCardProps) {
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
