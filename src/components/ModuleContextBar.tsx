import Link from "next/link";
import { cheatSheetViewerHref } from "@/lib/paths";
import type { TopicNeighbors } from "@/lib/topic-nav";
import type { LearningNavCurrent } from "@/components/AppTopNav";

type Props = {
  neighbors: TopicNeighbors;
  current: Extract<
    LearningNavCurrent,
    "terminology" | "learn" | "decisions" | "practice" | "cheat-sheets"
  >;
};

export function ModuleContextBar({ neighbors, current }: Props) {
  const { topic, track, prev, next } = neighbors;
  const slug = topic.slug;

  return (
    <div className="context-bar">
      <p className="context-bar-crumb">
        <Link className="text-link" href="/curriculum/">
          {track.track_id}
        </Link>
        <span aria-hidden="true"> · </span>
        <span>{track.title}</span>
      </p>
      <nav className="context-bar-modes" aria-label="This module">
        <Link
          href={`/terminology/${slug}/`}
          aria-current={current === "terminology" ? "page" : undefined}
        >
          Terms
        </Link>
        <Link
          href={`/learn/${slug}/`}
          aria-current={current === "learn" ? "page" : undefined}
        >
          Learn
        </Link>
        <Link
          href={`/decisions/${slug}/`}
          aria-current={current === "decisions" ? "page" : undefined}
        >
          Decisions
        </Link>
        <Link
          href={`/practice/${slug}/`}
          aria-current={current === "practice" ? "page" : undefined}
        >
          Practice
        </Link>
        <Link
          href={cheatSheetViewerHref(topic.topic_id)}
          aria-current={current === "cheat-sheets" ? "page" : undefined}
        >
          Sheet
        </Link>
      </nav>
      <div className="context-bar-step">
        {prev ? (
          <Link
            className="text-link"
            href={
              current === "cheat-sheets"
                ? cheatSheetViewerHref(prev.topic_id)
                : `/${current}/${prev.slug}/`
            }
          >
            ← Prev
          </Link>
        ) : (
          <span className="context-bar-muted">← Prev</span>
        )}
        {next ? (
          <Link
            className="text-link"
            href={
              current === "cheat-sheets"
                ? cheatSheetViewerHref(next.topic_id)
                : `/${current}/${next.slug}/`
            }
          >
            Next →
          </Link>
        ) : (
          <span className="context-bar-muted">Next →</span>
        )}
      </div>
    </div>
  );
}
