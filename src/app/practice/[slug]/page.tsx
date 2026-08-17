import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VisitMarker } from "@/components/VisitMarker";
import { LearningChrome } from "@/components/LearningChrome";
import { ModuleContextBar } from "@/components/ModuleContextBar";
import { PracticePlayerClient } from "@/components/learn/PracticePlayerClient";
import { SiteFooter } from "@/components/SiteFooter";
import { allTopicSlugs, loadTopicBySlug } from "@/lib/topic";
import { neighborsForSlug } from "@/lib/topic-nav";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return allTopicSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const topic = loadTopicBySlug(slug);
  if (!topic) return { title: "Module not found" };
  return {
    title: `${topic.title} · Practice`,
    description: `MCQs, flashcards, interview drill, and lab for ${topic.title}`,
  };
}

export default async function PracticeModulePage({ params }: PageProps) {
  const { slug } = await params;
  const topic = loadTopicBySlug(slug);
  if (!topic) notFound();
  const neighbors = neighborsForSlug(slug);

  return (
    <>
      <LearningChrome current="practice" slug={slug}>
        <main id="main" className="atmosphere flex-1">
          <div className="site-shell topic-shell topic-shell-wide">
            <VisitMarker
              topicId={topic.topic_id}
              slug={slug}
              title={topic.title}
              href={`/practice/${slug}/`}
            />
            {neighbors ? (
              <ModuleContextBar neighbors={neighbors} current="practice" />
            ) : null}
            <PracticePlayerClient topic={topic} />
          </div>
        </main>
      </LearningChrome>
      <SiteFooter />
    </>
  );
}
