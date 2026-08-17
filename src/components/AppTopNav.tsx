import Link from "next/link";

export type LearningNavCurrent =
  | "home"
  | "terminology"
  | "learn"
  | "decisions"
  | "practice"
  | "cheat-sheets"
  | "curriculum";

type AppTopNavProps = {
  current?: LearningNavCurrent;
  slug?: string;
};

export function AppTopNav({ current = "home", slug }: AppTopNavProps) {
  const terminologyHref = slug ? `/terminology/${slug}/` : "/terminology/";
  const learnHref = slug ? `/learn/${slug}/` : "/learn/";
  const decisionsHref = slug ? `/decisions/${slug}/` : "/decisions/";
  const practiceHref = slug ? `/practice/${slug}/` : "/practice/";

  return (
    <nav className="app-topnav" aria-label="Learning modes">
      <Link
        className="app-topnav-link"
        href="/"
        aria-current={current === "home" ? "page" : undefined}
      >
        Home
      </Link>
      <Link
        className="app-topnav-link"
        href={terminologyHref}
        aria-current={current === "terminology" ? "page" : undefined}
      >
        Terms
      </Link>
      <Link
        className="app-topnav-link"
        href={learnHref}
        aria-current={current === "learn" ? "page" : undefined}
      >
        Learn
      </Link>
      <Link
        className="app-topnav-link"
        href={decisionsHref}
        aria-current={current === "decisions" ? "page" : undefined}
      >
        Decisions
      </Link>
      <Link
        className="app-topnav-link"
        href={practiceHref}
        aria-current={current === "practice" ? "page" : undefined}
      >
        Practice
      </Link>
      <Link
        className="app-topnav-link"
        href="/cheat-sheets/"
        aria-current={current === "cheat-sheets" ? "page" : undefined}
      >
        Cheat sheets
      </Link>
      <Link
        className="app-topnav-link"
        href="/curriculum/"
        aria-current={current === "curriculum" ? "page" : undefined}
      >
        Curriculum
      </Link>
    </nav>
  );
}
