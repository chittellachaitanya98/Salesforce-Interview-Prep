import {
  getCurriculum,
  topicsForTrack,
  type TopicMeta,
  type Track,
} from "@/lib/curriculum";

export type TopicNeighbors = {
  topic: TopicMeta;
  track: Track;
  prev: TopicMeta | null;
  next: TopicMeta | null;
};

export function neighborsForTopicId(topicId: string): TopicNeighbors | null {
  const curriculum = getCurriculum();
  const topic = curriculum.topicsById[topicId];
  if (!topic) return null;
  const track = curriculum.tracks.find((item) => item.track_id === topic.track_id);
  if (!track) return null;
  const list = topicsForTrack(curriculum, track);
  const index = list.findIndex((item) => item.topic_id === topicId);
  return {
    topic,
    track,
    prev: index > 0 ? list[index - 1] : null,
    next: index >= 0 && index < list.length - 1 ? list[index + 1] : null,
  };
}

export function neighborsForSlug(slug: string): TopicNeighbors | null {
  const curriculum = getCurriculum();
  const topic = curriculum.topics.find((item) => item.slug === slug);
  if (!topic) return null;
  return neighborsForTopicId(topic.topic_id);
}
