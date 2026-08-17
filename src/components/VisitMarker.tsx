"use client";

import { useEffect } from "react";
import { markLastVisited } from "@/lib/evidence-storage";

type VisitMarkerProps = {
  topicId: string;
  slug: string;
  title: string;
  href: string;
};

export function VisitMarker({ topicId, slug, title, href }: VisitMarkerProps) {
  useEffect(() => {
    markLastVisited({ topicId, slug, title, href });
  }, [topicId, slug, title, href]);

  return null;
}
