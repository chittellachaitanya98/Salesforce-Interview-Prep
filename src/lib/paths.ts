/** Absolute app path that respects NEXT_PUBLIC_BASE_PATH for static assets outside next/link. */
export function assetPath(path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

/** In-app cheat sheet viewer (keeps LearningChrome). */
export function cheatSheetViewerHref(topicId: string): string {
  return `/cheat-sheets/${topicId}/`;
}
