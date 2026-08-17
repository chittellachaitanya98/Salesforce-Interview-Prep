import { readFileSync, readdirSync } from "fs";
import { join } from "path";

export type TerminologyEntry = {
  term: string;
  plain: string;
  precise: string;
  example: string;
  non_example: string;
  confusable_neighbor: string;
  boundary: string;
};

export type Mcq = {
  id: string;
  category: string;
  difficulty: string;
  prompt: string;
  options: Record<string, string>;
  answer: string;
  rationale: string;
  concept: string;
  citation_ids: string[];
  distractor_explanations: Record<string, string>;
};

export type Topic = {
  topic_id: string;
  slug: string;
  title: string;
  track: string;
  level: string;
  type: string;
  estimated_minutes: number;
  release_verified: string;
  api_version: string;
  last_verified: string;
  prerequisites: string[];
  objectives: string[];
  diagnostic_question: string;
  definition: string;
  why_it_matters: string;
  sixty_second_explanation: string;
  deeper_explanation: string[];
  terminology: TerminologyEntry[];
  mental_model: {
    analogy: string;
    useful_mapping: string[];
    where_it_breaks: string[];
  };
  mechanics: Array<{
    step: number;
    transition: string;
    actor: string;
    trigger: string;
    before: string;
    after: string;
    observe: string;
    failure: string;
  }>;
  worked_example: {
    scenario: string;
    inputs: string[];
    decisions: Array<{ decision: string; because: string; rejected: string }>;
    configuration_or_code: string[];
    output: string;
    verification: string[];
    self_explanation: string;
  };
  hands_on_lab: {
    environment: string;
    starting_state_checks: string[];
    steps: string[];
    guided_completion: string[];
    independent_challenge: string;
    evidence: string[];
    stop_recovery_cleanup: string[];
    limitations: string;
  };
  decision_table: Array<{
    signal: string;
    choose: string;
    not: string;
    why: string;
  }>;
  limitations: string[];
  security_notes: string[];
  teach_back_prompt?: string;
  common_mistakes: string[];
  troubleshooting: Array<{ symptom: string; check: string[]; do_not_assume: string }>;
  mcqs: Mcq[];
  flashcards: Array<{ id: string; category: string; front: string; back: string }>;
  review_schedule: Array<{ interval: string; prompt: string }>;
  visuals?: {
    infographic?: Record<string, unknown>;
    cheat_sheet?: Record<string, unknown>;
    system_map?: Record<string, unknown>;
    mermaid?: {
      structure?: string;
      decision?: string;
      sequence?: string;
    };
  };
  interview_questions: Array<{
    id: string;
    category: string;
    question: string;
    answer_30_seconds: string;
    answer_2_minutes: string;
    example: string;
    tradeoffs: string[];
    follow_ups: string[];
    weak_answer_warnings: string[];
  }>;
  sources: Array<{
    source_id: string;
    title: string;
    url: string;
    type: string;
    supports: string;
    release_or_version: string;
    last_verified: string;
    limits: string;
  }>;
};

function contentRoot(): string {
  return join(process.cwd(), "content");
}

export function loadTopicBySlug(slug: string): Topic | null {
  const dir = join(contentRoot(), "topics");
  for (const file of readdirSync(dir)) {
    if (!file.endsWith(".json")) continue;
    const raw = JSON.parse(readFileSync(join(dir, file), "utf8")) as Topic;
    if (raw.slug === slug) return raw;
  }
  return null;
}

export function loadTopicById(topicId: string): Topic | null {
  const file = join(contentRoot(), "topics", `${topicId}.json`);
  try {
    return JSON.parse(readFileSync(file, "utf8")) as Topic;
  } catch {
    return null;
  }
}

export function allTopicSlugs(): string[] {
  const dir = join(contentRoot(), "topics");
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const raw = JSON.parse(readFileSync(join(dir, f), "utf8")) as { slug: string };
      return raw.slug;
    });
}
