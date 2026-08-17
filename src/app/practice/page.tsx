import type { Metadata } from "next";
import { LearningChrome } from "@/components/LearningChrome";
import { SiteFooter } from "@/components/SiteFooter";
import { TrackHub } from "@/components/TrackHub";
import { getCurriculum } from "@/lib/curriculum";
import { buildTrackModules } from "@/lib/track-picker";

export const metadata: Metadata = {
  title: "Practice",
  description:
    "MCQs, flashcards, interview drill, and hands-on labs — pick a track, then a module.",
};

export default function PracticeHubPage() {
  const curriculum = getCurriculum();
  const tracks = buildTrackModules(curriculum);

  return (
    <>
      <LearningChrome current="practice">
        <main id="main" className="atmosphere flex-1">
          <section className="site-shell learning-hub">
            <p className="eyebrow">Practice</p>
            <h1 className="display">Drill what you just learned.</h1>
            <p className="hero-copy">
              Flashcards for recall, MCQs for interview pressure, lab when you
              have a sandbox.
            </p>
            <TrackHub mode="practice" tracks={tracks} />
          </section>
        </main>
      </LearningChrome>
      <SiteFooter />
    </>
  );
}
