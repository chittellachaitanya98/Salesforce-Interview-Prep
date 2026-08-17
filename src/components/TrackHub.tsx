"use client";

import { useEffect, useMemo, useState } from "react";
import { TrackAccordion, type HubMode } from "@/components/TrackAccordion";
import { loadRegistry } from "@/lib/evidence-storage";
import type { TrackWithModules } from "@/lib/track-picker";

type Props = {
  tracks: TrackWithModules[];
  mode: HubMode;
  defaultOpenTrackId?: string;
};

export function TrackHub({ tracks, mode, defaultOpenTrackId }: Props) {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("All");
  const [startedIds, setStartedIds] = useState<string[]>([]);

  useEffect(() => {
    setStartedIds(Object.keys(loadRegistry()));
    const onStorage = () => setStartedIds(Object.keys(loadRegistry()));
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const levels = useMemo(() => {
    const unique = new Set<string>();
    for (const track of tracks) {
      for (const mod of track.modules) {
        if (mod.level) unique.add(mod.level);
      }
    }
    return ["All", ...Array.from(unique)];
  }, [tracks]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return tracks
      .map((track) => ({
        ...track,
        modules: track.modules.filter((mod) => {
          const levelOk = level === "All" || mod.level === level;
          if (!levelOk) return false;
          if (!needle) return true;
          return (
            mod.title.toLowerCase().includes(needle) ||
            mod.topic_id.toLowerCase().includes(needle)
          );
        }),
      }))
      .filter((track) => track.modules.length > 0);
  }, [tracks, query, level]);

  const moduleCount = filtered.reduce((sum, track) => sum + track.modules.length, 0);
  const openId =
    (defaultOpenTrackId &&
      filtered.some((track) => track.track_id === defaultOpenTrackId) &&
      defaultOpenTrackId) ||
    filtered[0]?.track_id;

  return (
    <div className="track-hub">
      <div className="hub-toolbar">
        <label className="hub-search">
          <span className="sr-only">Search modules</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title or topic ID"
            autoComplete="off"
          />
        </label>
        <div className="level-pills" role="group" aria-label="Filter by level">
          {levels.map((item) => (
            <button
              key={item}
              type="button"
              className={`level-pill ${level === item ? "active" : ""}`}
              aria-pressed={level === item}
              onClick={() => setLevel(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <p className="hub-filter-meta">
        {moduleCount} {mode === "cheat-sheets" ? "sheets" : "modules"}
        {query || level !== "All" ? " match" : ""}
      </p>
      {filtered.length === 0 ? (
        <p className="hub-empty">No modules match that search.</p>
      ) : (
        <TrackAccordion
          tracks={filtered}
          mode={mode}
          defaultOpenTrackId={openId}
          startedIds={startedIds}
        />
      )}
    </div>
  );
}
