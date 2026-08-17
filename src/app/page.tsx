import Link from "next/link";
import { DashboardProgress } from "@/components/DashboardProgress";
import { LearningChrome } from "@/components/LearningChrome";
import { Reveal } from "@/components/Reveal";
import { SiteFooter } from "@/components/SiteFooter";
import { getCurriculum } from "@/lib/curriculum";

const MODES = [
  {
    n: "01",
    href: "/terminology/",
    title: "Terms",
    copy: "Own the words before the lecture.",
  },
  {
    n: "02",
    href: "/learn/",
    title: "Learn",
    copy: "Recap, analogy, then Feynman teach-back.",
  },
  {
    n: "03",
    href: "/decisions/",
    title: "Decisions",
    copy: "Signal → choose → not. When to use which.",
  },
  {
    n: "04",
    href: "/practice/",
    title: "Practice",
    copy: "Flashcards and MCQs under pressure.",
  },
  {
    n: "05",
    href: "/cheat-sheets/",
    title: "Cheat sheets",
    copy: "One poster per topic. Open and close tracks.",
  },
] as const;

export default function HomePage() {
  const curriculum = getCurriculum();
  const prototype = curriculum.topicsById["FOUND-002"];

  return (
    <>
      <LearningChrome current="home" slug={prototype?.slug}>
        <main id="main" className="atmosphere flex-1">
          <section className="site-shell cover" aria-labelledby="dashboard-title">
            <Reveal className="cover-copy">
              <p className="eyebrow">Interview handbook</p>
              <h1 id="dashboard-title" className="display dashboard-title">
                Get fluent. Or freeze in the room.
              </h1>
              <ul className="bullet-list hero-bullets">
                <li>
                  <strong>{curriculum.lessonCount} modules</strong> across Terms,
                  Learn, Decisions, Practice, and Sheets
                </li>
                <li>
                  Short bullets, decision paths, and diagrams only where they help
                </li>
                <li>Progress stays in this browser only</li>
              </ul>
              <div className="hero-actions">
                <Link className="btn btn-primary" href="/terminology/">
                  Start with terms
                </Link>
                <Link className="btn btn-secondary" href="/cheat-sheets/">
                  Open cheat sheets
                </Link>
              </div>
            </Reveal>

            <div className="cover-stage" aria-label="How you study">
              <p className="cover-stage-label">Study stack</p>
              {MODES.map((mode) => (
                <Link className="cover-stage-card" href={mode.href} key={mode.n}>
                  <span>{mode.n}</span>
                  <strong>{mode.title}</strong>
                  <em>{mode.copy}</em>
                </Link>
              ))}
            </div>
          </section>

          <section className="site-shell mode-grid" aria-label="Learning modes">
            {MODES.map((mode) => (
              <Link className="mode-card" href={mode.href} key={mode.n}>
                <p className="eyebrow">{mode.n}</p>
                <h2>{mode.title}</h2>
                <p>{mode.copy}</p>
              </Link>
            ))}
          </section>

          <DashboardProgress
            topics={curriculum.topics}
            prototypeSlug={prototype?.slug}
          />
        </main>
      </LearningChrome>
      <SiteFooter />
    </>
  );
}
