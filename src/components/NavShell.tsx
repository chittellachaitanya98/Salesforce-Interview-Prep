"use client";

import { useEffect, useId, useState } from "react";
import { AppTopNav, type LearningNavCurrent } from "@/components/AppTopNav";

type Props = {
  current?: LearningNavCurrent;
  slug?: string;
};

export function NavShell({ current = "home", slug }: Props) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [current, slug]);

  return (
    <div className="nav-shell">
      <button
        type="button"
        className="nav-menu-btn"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "Close" : "Menu"}
      </button>
      <div
        id={panelId}
        className={`nav-shell-panel${open ? " is-open" : ""}`}
      >
        <AppTopNav current={current} slug={slug} />
      </div>
    </div>
  );
}
