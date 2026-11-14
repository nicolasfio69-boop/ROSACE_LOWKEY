import { SKILL_CODES, type ExpectedLevel } from "./framework";
import { checkNeed, type Need, type Requirement } from "./scoring";

export const JOB_QUESTIONS = [
  {
    key: "task",
    label: "What is one typical task?",
    placeholder: "Investigate a device that stops responding",
  },
  {
    key: "audience",
    label: "Who will they work with?",
    placeholder: "The product and support teams",
  },
  {
    key: "outcome",
    label: "What would a good result look like?",
    placeholder: "A reproducible fix with clear checks",
  },
  {
    key: "challenge",
    label: "What makes the work difficult?",
    placeholder: "Reports are incomplete and deadlines can change",
  },
] as const;

export type JobContext = Record<(typeof JOB_QUESTIONS)[number]["key"], string>;
export type NeedDraft = {
  draftId?: string;
  workMode?: string;
  location?: string;
  autonomy?: string;
  company?: string;
  companyContext?: string;
  sourceUrl?: string;
  eventName?: string;
  title: string;
  description: string;
  context: JobContext;
  capacity: number;
  requirements: Requirement[];
};

/** Hand-written scenarios, ordered Foundation, Intermediate, Advanced. */
const EXAMPLES: Record<string, readonly [string, string, string]> = {
  "C1.1": [
    "With a colleague, ask open questions and restate the request.",
    "Independently clarify the request and confirm the underlying need.",
    "Resolve conflicting requests and surface an unspoken need; help colleagues do the same.",
  ],
  "C1.2": [
    "With help, prepare a short proposal and explain its benefits.",
    "Present a solution independently and answer objections about its trade-offs.",
    "Adapt a proposal during a difficult discussion and help divided stakeholders reach a decision.",
  ],
  "C2.1": [
    "With help, find the relevant rule in the team's checklist.",
    "Identify applicable standards independently and decline a non-compliant shortcut.",
    "Resolve an ambiguous standards question and guide colleagues through the decision.",
  ],
  "C2.2": [
    "With help, check the deliverable for visible mistakes.",
    "Independently verify the deliverable against requirements and review a colleague's work.",
    "Design team checks that catch subtle failures in a new kind of deliverable.",
  ],
  "C3.1": [
    "With help, list the steps for a small task.",
    "Define deliverables and milestones independently and flag a delay early.",
    "Replan changing work across several people while keeping responsibilities clear.",
  ],
  "C3.2": [
    "After a simple task, explain what worked and one thing to change.",
    "Write and share a useful retrospective after completing the work independently.",
    "Turn lessons from several difficult projects into a practice adopted by the team.",
  ],
  "C4.1": [
    "With guidance, contribute to a shared task and listen to teammates.",
    "Coordinate a handover independently and help unblock a teammate.",
    "Keep several colleagues collaborating when priorities conflict under pressure.",
  ],
  "C4.2": [
    "With help, explain a past choice and identify an alternative.",
    "Notice a weak assumption during the work and adjust the approach independently.",
    "Challenge an approach before a new situation causes problems and help peers reflect too.",
  ],
  "C4.3": [
    "Complete an agreed small task on time and volunteer for the next one.",
    "Own a commitment from start to finish and propose a useful improvement.",
    "Take responsibility for an unowned, uncertain problem and coordinate its resolution.",
  ],
  "C5.1": [
    "With help, write down the problem and its assumptions.",
    "Independently turn an unclear request into a problem with boundaries and evidence.",
    "Create a shared problem statement when several teams disagree about a novel issue.",
  ],
  "C5.2": [
    "Use an unfamiliar guide to complete a simple task with help.",
    "Learn an unfamiliar tool independently and apply it to a real task.",
    "Learn a new technical domain deeply enough to guide colleagues through complex cases.",
  ],
  "C5.3": [
    "With feedback, write a clear update about a simple task.",
    "Independently adapt a report to its readers and lead a discussion about it.",
    "Explain a complex incident to technical and non-technical audiences under pressure.",
  ],
  "J.EMBEDDED_C": [
    "With help, change a small C routine on a development board.",
    "Implement and test a bounded embedded C feature independently.",
    "Diagnose a novel memory or timing failure and guide peers reviewing the fix.",
  ],
  "J.PROTOCOLS": [
    "With help, capture and read a simple UART exchange.",
    "Independently configure and debug a device exchange over SPI or I2C.",
    "Resolve an intermittent bus failure across devices and guide the team's protocol choices.",
  ],
  "J.TROUBLESHOOT": [
    "With help, reproduce a reported issue using a checklist.",
    "Independently isolate a reported issue, test the fix and explain it to the user.",
    "Lead diagnosis of an unfamiliar failure across systems and help others investigate it.",
  ],
  "J.LINUX": [
    "With help, navigate files and inspect a log in the terminal.",
    "Independently use Linux tools to investigate a service and document the commands.",
    "Diagnose a complex Linux resource problem and guide others through safe recovery.",
  ],
  "J.PYTHON": [
    "With help, adapt a small Python script to process a sample file.",
    "Independently write and test a Python script with useful error handling.",
    "Design a reliable Python automation for a complex workflow and guide maintainers.",
  ],
};

export function levelExample(
  skill: string,
  level: ExpectedLevel,
  draft: Pick<NeedDraft, "title" | "context">,
): string {
  const example = EXAMPLES[skill]?.[level - 1];
  if (!example) throw new Error("Choose a known skill and expected level.");
  const context = [
    draft.title.trim() && `Role: ${draft.title.trim()}.`,
    draft.context.task.trim() && `Task: ${draft.context.task.trim()}.`,
    draft.context.audience.trim() &&
      `Working with: ${draft.context.audience.trim()}.`,
    draft.context.outcome.trim() &&
      `Desired result: ${draft.context.outcome.trim()}.`,
    draft.context.challenge.trim() &&
      `Challenge: ${draft.context.challenge.trim()}.`,
  ]
    .filter(Boolean)
    .join(" ");
  return `${context ? `${context} ` : ""}${example}`;
}

export type DraftResult =
  | { ok: true; need: Need; description: string; context: JobContext }
  | { ok: false; errors: string[] };

/** Validate at the submission boundary, even when the UI prevents invalid selections. */
export function prepareNeed(draft: NeedDraft): DraftResult {
  const need: Need = {
    id: draft.draftId || "recruiter-preview",
    company: draft.company?.trim() || "Demo company",
    title: draft.title.trim(),
    capacity: draft.capacity,
    requirements: draft.requirements.map((r) => ({ ...r })),
  };
  const errors = checkNeed(need);
  if (!need.title) errors.push("Enter a job title.");
  if (!draft.description.trim()) errors.push("Enter a short job description.");
  if (!Number.isSafeInteger(need.capacity) || need.capacity < 1)
    errors.push("Capacity must be a positive whole number.");
  if (need.requirements.some((r) => !SKILL_CODES.has(r.skill)))
    errors.push("Choose skills from the closed list.");
  if (need.requirements.some((r) => ![1, 2, 3].includes(r.expected)))
    errors.push("Choose Foundation, Intermediate or Advanced for each skill.");
  if (errors.length) return { ok: false, errors };
  need.requirements = need.requirements.map((r) => ({
    ...r,
    example: levelExample(r.skill, r.expected, draft),
  }));
  return {
    ok: true,
    need,
    description: draft.description.trim(),
    context: { ...draft.context },
  };
}
