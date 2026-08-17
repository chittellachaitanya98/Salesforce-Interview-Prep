import type { Metadata } from "next";
import { LearningChrome } from "@/components/LearningChrome";
import { SiteFooter } from "@/components/SiteFooter";
import { TrackHub } from "@/components/TrackHub";
import { getCurriculum } from "@/lib/curriculum";
import { buildTrackModules } from "@/lib/track-picker";

export const metadata: Metadata = {
  title: "Learn",
  description:
    "Interview-style lessons — 60-second recap, when to use what, then practice.",
};

export default function LearnHubPage() {
  const curriculum = getCurriculum();
  const tracks = buildTrackModules(curriculum);

  return (
    <>
      <LearningChrome current="learn">
        <main id="main" className="atmosphere flex-1">
          <section className="site-shell learning-hub">
            <p className="eyebrow">Learn</p>
            <h1 className="display">Open a track. Pick a lesson.</h1>
            <p className="hero-copy">
              Recap, decision cues, and Feynman teach-back — not a wall of JSON.
              Start with Terminology if you want the words first.
            </p>
            <TrackHub mode="learn" tracks={tracks} />
          </section>
        </main>
      </LearningChrome>
      <SiteFooter />
    </>
  );
}
