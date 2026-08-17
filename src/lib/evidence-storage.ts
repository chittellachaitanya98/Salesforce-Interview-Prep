export const REGISTRY_KEY = "sfm-evidence-registry-v1";
export const LAST_VISITED_KEY = "sfm-last-visited-v1";

export type QuizAttempt = {
  id: string;
  choice: string;
  confidence: number;
  outcome: "correct" | "incorrect";
  assistance: "unaided" | "feedback-assisted";
  provenance: "local-deterministic";
  at: string;
};

export type DiagnosticAttempt = {
  text: string;
  confidence: number;
  assistance: "unaided" | "orientation-revealed";
  provenance: "learner-authored";
  verification: "external-unverified";
  at: string;
};

export type TopicEvidenceState = {
  diagnostic: DiagnosticAttempt | null;
  quiz: QuizAttempt[];
};

export type RegistryEntry = {
  baselineAt: string;
  independentMcqs: number;
  mcqTotal: number;
  verified: boolean;
  diagnosticCommitted: boolean;
  reviews: Record<string, string>;
  updatedAt: string;
};

export type EvidenceRegistry = Record<string, RegistryEntry>;

export function topicProgressKey(topicId: string): string {
  return `sfm-${topicId}-evidence-v2`;
}

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage blocked or quota exceeded — degrade silently.
  }
}

export function removeKey(key: string): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function emptyTopicState(): TopicEvidenceState {
  return { diagnostic: null, quiz: [] };
}

export function loadTopicState(topicId: string): TopicEvidenceState {
  const stored = readJson(topicProgressKey(topicId), emptyTopicState());
  return {
    diagnostic: stored.diagnostic ?? null,
    quiz: Array.isArray(stored.quiz) ? stored.quiz : [],
  };
}

export function saveTopicState(topicId: string, state: TopicEvidenceState): void {
  writeJson(topicProgressKey(topicId), state);
}

export function loadRegistry(): EvidenceRegistry {
  return readJson(REGISTRY_KEY, {});
}

export function saveRegistry(registry: EvidenceRegistry): void {
  writeJson(REGISTRY_KEY, registry);
}

export function isIndependentChecked(attempt: QuizAttempt): boolean {
  return (
    attempt.outcome === "correct" &&
    attempt.assistance === "unaided" &&
    attempt.provenance === "local-deterministic"
  );
}

export function independentMcqCount(quiz: QuizAttempt[], mcqTotal: number): number {
  const checked = new Set(
    quiz.filter(isIndependentChecked).map((attempt) => attempt.id),
  );
  return Math.min(checked.size, mcqTotal);
}

export function topicVerified(quiz: QuizAttempt[], mcqTotal: number): boolean {
  return mcqTotal > 0 && independentMcqCount(quiz, mcqTotal) >= mcqTotal;
}

export function syncRegistryEntry(
  topicId: string,
  state: TopicEvidenceState,
  mcqTotal: number,
): EvidenceRegistry {
  const registry = loadRegistry();
  const independent = independentMcqCount(state.quiz, mcqTotal);
  const verified = topicVerified(state.quiz, mcqTotal);
  const existing = registry[topicId] || {};
  const baseline =
    existing.baselineAt || state.diagnostic?.at || new Date().toISOString();

  registry[topicId] = {
    baselineAt: baseline,
    independentMcqs: independent,
    mcqTotal,
    verified,
    diagnosticCommitted: Boolean(state.diagnostic?.text),
    reviews: existing.reviews || {},
    updatedAt: new Date().toISOString(),
  };
  saveRegistry(registry);
  return registry;
}

export type LastVisited = {
  topicId: string;
  slug: string;
  title: string;
  href: string;
  at: string;
};

export function loadLastVisited(): LastVisited | null {
  return readJson<LastVisited | null>(LAST_VISITED_KEY, null);
}

export function markLastVisited(visit: Omit<LastVisited, "at">): void {
  writeJson(LAST_VISITED_KEY, { ...visit, at: new Date().toISOString() });
}

export function resetTopicEvidence(topicId: string): void {
  removeKey(topicProgressKey(topicId));
  const registry = loadRegistry();
  delete registry[topicId];
  saveRegistry(registry);
}
