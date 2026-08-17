import type { TopicMeta } from "./curriculum";

/** Server-side progress stub until client localStorage sync lands. */
export function getProgressStub(topics: TopicMeta[]) {
  const available = topics.filter((t) => t.status === "available");
  const completedIds: string[] = [];
  const completed = available.filter((t) => completedIds.includes(t.topic_id));
  const nextTasks = available
    .filter((t) => !completedIds.includes(t.topic_id))
    .slice(0, 5);

  return {
    completed,
    nextTasks,
    totalAvailable: available.length,
    completedCount: completed.length,
  };
}
