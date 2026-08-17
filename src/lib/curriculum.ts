import { readdirSync, readFileSync } from "fs";
import { join } from "path";

export type Track = {
  track_id: string;
  prefix: string;
  title: string;
  topic_ids: string[];
};

export type TopicMeta = {
  topic_id: string;
  title: string;
  track_id: string;
  track: string;
  level: string;
  type: string;
  estimated_minutes: number;
  status: string;
  slug: string;
};

export type CurriculumBundle = {
  tracks: Track[];
  topics: TopicMeta[];
  topicsById: Record<string, TopicMeta>;
  lessonCount: number;
  firstLesson: TopicMeta | null;
};

function contentRoot(): string {
  return join(process.cwd(), "content");
}

function loadSlugIndex(): Record<string, string> {
  const dir = join(contentRoot(), "topics");
  const index: Record<string, string> = {};
  for (const file of readdirSync(dir)) {
    if (!file.endsWith(".json")) continue;
    const raw = JSON.parse(readFileSync(join(dir, file), "utf8")) as {
      topic_id: string;
      slug: string;
    };
    index[raw.topic_id] = raw.slug;
  }
  return index;
}

export function getCurriculum(): CurriculumBundle {
  const curriculum = JSON.parse(
    readFileSync(join(contentRoot(), "curriculum.json"), "utf8"),
  ) as {
    tracks: Track[];
    topics: Omit<TopicMeta, "slug">[];
  };

  const slugs = loadSlugIndex();
  const topics: TopicMeta[] = curriculum.topics.map((t) => ({
    ...t,
    slug: slugs[t.topic_id] || t.topic_id.toLowerCase(),
  }));

  const topicsById = Object.fromEntries(topics.map((t) => [t.topic_id, t]));
  const available = topics.filter((t) => t.status === "available" && slugs[t.topic_id]);
  const firstLesson =
    available.find((t) => t.topic_id === "FOUND-001") || available[0] || null;

  return {
    tracks: curriculum.tracks,
    topics,
    topicsById,
    lessonCount: available.length,
    firstLesson,
  };
}

export function topicsForTrack(
  bundle: CurriculumBundle,
  track: Track,
): TopicMeta[] {
  return track.topic_ids
    .map((id) => bundle.topicsById[id])
    .filter((t): t is TopicMeta => Boolean(t));
}
