"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ProgressRing } from "@/components/ProgressRing";
import type { TopicMeta } from "@/lib/curriculum";
import {
  loadLastVisited,
  loadRegistry,
  type EvidenceRegistry,
  type LastVisited,
} from "@/lib/evidence-storage";

type DashboardProgressProps = {
  topics: TopicMeta[];
  prototypeSlug?: string;
};

export function DashboardProgress({ topics, prototypeSlug }: DashboardProgressProps) {
  const [registry, setRegistry] = useState<EvidenceRegistry>({});
  const [lastVisited, setLastVisited] = useState<LastVisited | null>(null);

  useEffect(() => {
    setRegistry(loadRegistry());
    setLastVisited(loadLastVisited());
    const onStorage = () => {
      setRegistry(loadRegistry());
      setLastVisited(loadLastVisited());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const available = useMemo(
    () => topics.filter((t) => t.status === "available"),
    [topics],
  );

  const completed = useMemo(
    () => available.filter((t) => registry[t.topic_id]?.verified),
    [available, registry],
  );

  const nextTasks = useMemo(
    () =>
      available
        .filter((t) => !registry[t.topic_id]?.verified)
        .slice(0, 5),
    [available, registry],
  );

  const startHref = nextTasks[0]
    ? `/learn/${nextTasks[0].slug}/`
    : prototypeSlug
      ? `/learn/${prototypeSlug}/`
      : "/learn/";

  const ctaHref = lastVisited?.href || startHref;
  const ctaLabel = lastVisited
    ? `Continue: ${lastVisited.title}`
    : "Start learning";

  return (
    <section className="site-shell dashboard-grid" aria-label="Progress cards">
      <div className="dashboard-card dashboard-card-progress">
        <div className="dashboard-progress-head">
          <ProgressRing
            value={completed.length}
            max={available.length || topics.length}
            label={`${completed.length} of ${available.length} modules verified`}
          />
          <div>
            <p className="eyebrow">Completed modules</p>
            <h2>
              {completed.length}
              <span className="dashboard-muted"> / {available.length}</span>
            </h2>
            <p className="dashboard-muted">
              {topics.length} modules in the handbook
            </p>
          </div>
        </div>
        {completed.length === 0 ? (
          <p className="dashboard-card-copy">
            Complete all MCQs with unaided correct first attempts to verify a
            module. Progress is stored in this browser only — it is not synced.
          </p>
        ) : (
          <>
            <p className="dashboard-card-copy">
              Progress is stored in this browser only — it is not synced.
            </p>
            <ul className="dashboard-list">
              {completed.map((topic) => (
                <li key={topic.topic_id}>
                  <Link href={`/terminology/${topic.slug}/`}>{topic.title}</Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="dashboard-card dashboard-card-accent">
        <p className="eyebrow">Next tasks to be done</p>
        <ul className="dashboard-list">
          {nextTasks.map((topic) => (
            <li key={topic.topic_id}>
              <Link href={`/learn/${topic.slug}/`}>
                <code>{topic.topic_id}</code>
                <span>{topic.title}</span>
                <em>{topic.estimated_minutes} min</em>
              </Link>
            </li>
          ))}
        </ul>
        <Link className="btn btn-primary dashboard-cta" href={ctaHref}>
          {ctaLabel}
        </Link>
      </div>
    </section>
  );
}
