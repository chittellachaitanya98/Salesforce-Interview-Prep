import type { Topic } from "@/lib/topic";
import { TopicPlayerClient } from "./TopicPlayerClient";

type TopicPlayerProps = {
  topic: Topic;
};

export function TopicPlayer({ topic }: TopicPlayerProps) {
  return <TopicPlayerClient topic={topic} />;
}
