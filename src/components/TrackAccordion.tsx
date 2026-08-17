import Link from "next/link";
import type { TrackWithModules } from "@/lib/track-picker";
import { cheatSheetViewerHref } from "@/lib/paths";

export type HubMode =
  | "terminology"
  | "learn"
  | "decisions"
  | "practice"
  | "cheat-sheets";

type Props = {
  tracks: TrackWithModules[];
  mode: HubMode;
  defaultOpenTrackId?: string;
  startedIds?: readonly string[];
};

function primaryHref(mode: HubMode, topicId: string, slug: string): string {
  if (mode === "cheat-sheets") return cheatSheetViewerHref(topicId);
  return `/${mode}/${slug}/`;
}

function hasStarted(startedIds: readonly string[] | undefined, topicId: string): boolean {
  return Boolean(startedIds?.includes(topicId));
}

export function TrackAccordion({
  tracks,
  mode,
  defaultOpenTrackId,
  startedIds,
}: Props) {
  const openId = defaultOpenTrackId ?? tracks[0]?.track_id;

  return (
    <div className="track-accordion">
      {tracks.map((track) => (
        <details
          key={track.track_id}
          id={track.track_id}
          className="track-accordion-item"
          open={track.track_id === openId}
        >
          <summary className="track-accordion-summary">
            <span className="track-accordion-title">
              <code>{track.track_id}</code>
              {track.title}
            </span>
            <span className="track-accordion-count">
              {track.modules.length}{" "}
              {mode === "cheat-sheets" ? "sheets" : "modules"}
            </span>
          </summary>
          <ul className="module-card-list">
            {track.modules.map((mod, index) => {
              const started = hasStarted(startedIds, mod.topic_id);
              return (
                <li key={mod.topic_id}>
                  <article className="module-card">
                    <Link
                      className="module-card-main"
                      href={primaryHref(mode, mod.topic_id, mod.slug)}
                    >
                      <span className="module-card-index">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <code>{mod.topic_id}</code>
                      <strong>{mod.title}</strong>
                      <span className="module-card-meta">
                        <span className={`module-resume-chip ${started ? "is-resume" : ""}`}>
                          {started ? "Resume" : "Start"}
                        </span>
                        {mod.level} · {mod.estimated_minutes} min
                      </span>
                    </Link>
                    <p className="module-card-links">
                      <Link href={`/terminology/${mod.slug}/`}>Terms</Link>
                      <Link href={`/learn/${mod.slug}/`}>Learn</Link>
                      <Link href={`/decisions/${mod.slug}/`}>Decisions</Link>
                      <Link href={`/practice/${mod.slug}/`}>Practice</Link>
                      <Link href={cheatSheetViewerHref(mod.topic_id)}>Sheet</Link>
                    </p>
                  </article>
                </li>
              );
            })}
          </ul>
        </details>
      ))}
    </div>
  );
}
