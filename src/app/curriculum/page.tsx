import type { Metadata } from "next";
import Link from "next/link";
import { LearningChrome } from "@/components/LearningChrome";
import { SiteFooter } from "@/components/SiteFooter";
import { TrackHub } from "@/components/TrackHub";
import { getCurriculum } from "@/lib/curriculum";
import { buildTrackModules } from "@/lib/track-picker";

export const metadata: Metadata = {
  title: "Curriculum",
  description:
    "Browse all Salesforce Interview Prep tracks and open source-grounded lessons.",
};

export default function CurriculumPage() {
  const curriculum = getCurriculum();
  const tracks = buildTrackModules(curriculum);

  return (
    <>
      <LearningChrome current="curriculum">
        <main id="main" className="atmosphere flex-1">
          <section className="site-shell learning-hub">
            <p className="eyebrow">Curriculum</p>
            <h1 className="display">Every track, every lesson.</h1>
            <p className="hero-copy">
              {curriculum.lessonCount} authored topics across{" "}
              {curriculum.tracks.length} tracks. Search, filter by level, then
              open Terminology, Learn, Practice, or a cheat sheet.
            </p>
            <TrackHub mode="learn" tracks={tracks} />
            <p style={{ marginTop: "2rem" }}>
              <Link className="text-link" href="/cheat-sheets/">
                Open the cheat sheet book →
              </Link>
            </p>
          </section>
        </main>
      </LearningChrome>
      <SiteFooter />
    </>
  );
}
