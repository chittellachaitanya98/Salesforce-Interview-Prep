import type { Metadata } from "next";
import { LearningChrome } from "@/components/LearningChrome";
import { SiteFooter } from "@/components/SiteFooter";
import { TrackHub } from "@/components/TrackHub";
import { getCurriculum } from "@/lib/curriculum";
import { buildTrackModules } from "@/lib/track-picker";

export const metadata: Metadata = {
  title: "Cheat sheets",
  description:
    "Open a track, then a one-page cheat sheet — stay in the app, then go back.",
};

export default function CheatSheetsPage() {
  const curriculum = getCurriculum();
  const tracks = buildTrackModules(curriculum);

  return (
    <>
      <LearningChrome current="cheat-sheets">
        <main id="main" className="atmosphere flex-1">
          <section className="site-shell learning-hub">
            <p className="eyebrow">Cheat sheets</p>
            <h1 className="display">Scan a track, open a sheet.</h1>
            <p className="hero-copy">
              Expand a track, tap a sheet, then use Back. No topic dropdown —
              just open and close tracks.
            </p>
            <TrackHub mode="cheat-sheets" tracks={tracks} />
          </section>
        </main>
      </LearningChrome>
      <SiteFooter />
    </>
  );
}
