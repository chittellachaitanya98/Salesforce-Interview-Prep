import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheatSheetCanvas } from "@/components/CheatSheetCanvas";
import { LearningChrome } from "@/components/LearningChrome";
import { ModuleContextBar } from "@/components/ModuleContextBar";
import { SiteFooter } from "@/components/SiteFooter";
import { VisitMarker } from "@/components/VisitMarker";
import { getCurriculum } from "@/lib/curriculum";
import { loadTopicById } from "@/lib/topic";
import { neighborsForTopicId } from "@/lib/topic-nav";

type PageProps = { params: Promise<{ topicId: string }> };

export function generateStaticParams() {
  return getCurriculum().topics.map((topic) => ({ topicId: topic.topic_id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { topicId } = await params;
  const topic = loadTopicById(topicId);
  if (!topic) return { title: "Cheat sheet not found" };
  return {
    title: `${topic.title} · Cheat sheet`,
    description: topic.sixty_second_explanation,
  };
}

export default async function CheatSheetViewerPage({ params }: PageProps) {
  const { topicId } = await params;
  const topic = loadTopicById(topicId);
  const neighbors = neighborsForTopicId(topicId);
  if (!topic || !neighbors) notFound();

  return (
    <>
      <LearningChrome current="cheat-sheets" slug={topic.slug}>
        <main id="main" className="sheet-page flex-1">
          <div className="site-shell topic-shell topic-shell-wide">
            <VisitMarker
              topicId={topic.topic_id}
              slug={topic.slug}
              title={topic.title}
              href={`/cheat-sheets/${topicId}/`}
            />
            <p className="viewer-back">
              <Link className="text-link" href={`/cheat-sheets/#${neighbors.track.track_id}`}>
                ← Back to cheat sheets
              </Link>
            </p>
            <ModuleContextBar neighbors={neighbors} current="cheat-sheets" />
            <CheatSheetCanvas topic={topic} />
          </div>
        </main>
      </LearningChrome>
      <SiteFooter />
    </>
  );
}
