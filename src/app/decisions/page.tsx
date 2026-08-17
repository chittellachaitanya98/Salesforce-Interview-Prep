import type { Metadata } from "next";
import { LearningChrome } from "@/components/LearningChrome";
import { SiteFooter } from "@/components/SiteFooter";
import { TrackHub } from "@/components/TrackHub";
import { getCurriculum } from "@/lib/curriculum";
import { buildTrackModules } from "@/lib/track-picker";

export const metadata: Metadata = {
  title: "Decisions",
  description:
    "When-to-use cues from each module — signal, choose, not by default, why.",
};

export default function DecisionsHubPage() {
  const curriculum = getCurriculum();
  const tracks = buildTrackModules(curriculum);

  return (
    <>
      <LearningChrome current="decisions">
        <main id="main" className="atmosphere flex-1">
          <section className="site-shell learning-hub">
            <p className="eyebrow">Decisions</p>
            <h1 className="display">Pick the right tool under pressure.</h1>
            <p className="hero-copy">
              Signal → choose → not by default. Decision diagrams and path
              strips for interview “when to use which.”
            </p>
            <TrackHub mode="decisions" tracks={tracks} />
          </section>
        </main>
      </LearningChrome>
      <SiteFooter />
    </>
  );
}
