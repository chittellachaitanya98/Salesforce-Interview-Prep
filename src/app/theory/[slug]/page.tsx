import { redirect } from "next/navigation";
import { allTopicSlugs } from "@/lib/topic";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return allTopicSlugs().map((slug) => ({ slug }));
}

/** Legacy Theory module → Learn module */
export default async function TheoryModuleRedirect({ params }: PageProps) {
  const { slug } = await params;
  redirect(`/learn/${slug}/`);
}
