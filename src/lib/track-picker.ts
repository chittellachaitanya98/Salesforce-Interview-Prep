import type { CurriculumBundle } from "@/lib/curriculum";
import { topicsForTrack } from "@/lib/curriculum";

export type TrackModule = {
  topic_id: string;
  title: string;
  slug: string;
  estimated_minutes: number;
  level: string;
};

export type TrackWithModules = {
  track_id: string;
  title: string;
  modules: TrackModule[];
};

export function buildTrackModules(curriculum: CurriculumBundle): TrackWithModules[] {
  return curriculum.tracks.map((track) => ({
    track_id: track.track_id,
    title: track.title,
    modules: topicsForTrack(curriculum, track).map((topic) => ({
      topic_id: topic.topic_id,
      title: topic.title,
      slug: topic.slug,
      estimated_minutes: topic.estimated_minutes,
      level: topic.level,
    })),
  }));
}
