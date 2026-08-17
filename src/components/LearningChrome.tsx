import Link from "next/link";
import { NavShell } from "@/components/NavShell";
import type { LearningNavCurrent } from "@/components/AppTopNav";

type LearningChromeProps = {
  current?: LearningNavCurrent;
  slug?: string;
  children: React.ReactNode;
};

/**
 * Single site chrome: brand + learning modes nav (no stacked SiteHeader + AppTopNav).
 */
export function LearningChrome({
  current = "home",
  slug,
  children,
}: LearningChromeProps) {
  return (
    <>
      <header className="learning-chrome">
        <div className="site-shell learning-chrome-inner">
          <Link className="brand" href="/" aria-label="Salesforce Interview Prep home">
            <span className="brand-mark" aria-hidden="true">
              <span />
            </span>
            <span>
              <strong>Salesforce Interview Prep</strong>
              <small>Independent handbook</small>
            </span>
          </Link>
          <NavShell current={current} slug={slug} />
        </div>
      </header>
      {children}
    </>
  );
}
