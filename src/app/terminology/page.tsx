import type { Metadata } from "next";
import { LearningChrome } from "@/components/LearningChrome";
import { SiteFooter } from "@/components/SiteFooter";
import { TrackHub } from "@/components/TrackHub";
import { getCurriculum } from "@/lib/curriculum";
import { buildTrackModules } from "@/lib/track-picker";

export const metadata: Metadata = {
  title: "Terminology",
  description:
    "Load-bearing Salesforce terms first — plain language, examples, and boundaries.",
};

export default function TerminologyHubPage() {
  const curriculum = getCurriculum();
  const tracks = buildTrackModules(curriculum);

  return (
    <>
      <LearningChrome current="terminology">
        <main id="main" className="atmosphere flex-1">
          <section className="site-shell learning-hub">
            <p className="eyebrow">Terminology</p>
            <h1 className="display">Own the words first.</h1>
            <p className="hero-copy">
              Expand a track, open a glossary, then continue into Learn.
            </p>
            <TrackHub mode="terminology" tracks={tracks} />
          </section>
        </main>
      </LearningChrome>
      <SiteFooter />
    </>
  );
}
