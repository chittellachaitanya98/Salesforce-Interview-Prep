import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VisitMarker } from "@/components/VisitMarker";
import { LearningChrome } from "@/components/LearningChrome";
import { ModuleContextBar } from "@/components/ModuleContextBar";
import { TheoryPlayerClient } from "@/components/learn/TheoryPlayerClient";
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
    title: `${topic.title} · Learn`,
    description: topic.sixty_second_explanation,
  };
}

export default async function LearnModulePage({ params }: PageProps) {
  const { slug } = await params;
  const topic = loadTopicBySlug(slug);
  if (!topic) notFound();
  const neighbors = neighborsForSlug(slug);

  return (
    <>
      <LearningChrome current="learn" slug={slug}>
        <main id="main" className="atmosphere flex-1">
          <div className="site-shell topic-shell topic-shell-wide">
            <VisitMarker
              topicId={topic.topic_id}
              slug={slug}
              title={topic.title}
              href={`/learn/${slug}/`}
            />
            {neighbors ? (
              <ModuleContextBar neighbors={neighbors} current="learn" />
            ) : null}
            <TheoryPlayerClient topic={topic} />
          </div>
        </main>
      </LearningChrome>
      <SiteFooter />
    </>
  );
}
