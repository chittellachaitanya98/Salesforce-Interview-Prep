import { redirect } from "next/navigation";
import { allTopicSlugs } from "@/lib/topic";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return allTopicSlugs().map((slug) => ({ slug }));
}

/** Legacy Context module → Terminology module */
export default async function ContextModuleRedirect({ params }: PageProps) {
  const { slug } = await params;
  redirect(`/terminology/${slug}/`);
}
