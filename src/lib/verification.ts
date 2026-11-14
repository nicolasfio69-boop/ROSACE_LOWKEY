import { JOB_SKILLS, type ExpectedLevel } from "./framework";
import { ONLINE_EXERCISES } from "@/data/online-exercises";
export type VerificationMode = "online" | "onsite" | "interview";
export type Verification = { modes: VerificationMode[]; situation: string };
export const MODE_LABELS: Record<VerificationMode, string> = {
  online: "online exercise",
  onsite: "on-site situation",
  interview: "interview",
};
const COMPONENT_CHECKS: Record<string, Verification> = {
  "C1.1": {
    modes: ["onsite"],
    situation:
      "Ask a colleague played by the recruiter for information missing from a task.",
  },
  "C1.2": {
    modes: ["onsite"],
    situation:
      "Clarify a fictional customer's unclear request, restate it and get agreement on a proposal.",
  },
  "C2.1": {
    modes: ["online"],
    situation: "Read a short policy and explain what is allowed in five cases.",
  },
  "C2.2": {
    modes: ["online"],
    situation:
      "Review a small piece of code or a table and explain the errors using a checklist.",
  },
  "C3.1": {
    modes: ["online"],
    situation:
      "Split an unclear request into steps, with a duration and a risk for each.",
  },
  "C3.2": {
    modes: ["online", "interview"],
    situation:
      "Write a handover note for a fictional mini-project, then discuss it.",
  },
  "C4.1": {
    modes: ["onsite"],
    situation:
      "Complete a small task with two or three people; observe work sharing, listening and the joint result.",
  },
  "C4.2": {
    modes: ["interview", "onsite"],
    situation:
      "Choose between two options with incomplete information and explain your decision.",
  },
  "C4.3": {
    modes: ["interview"],
    situation:
      "Discuss a specific commitment kept over several weeks. Discussed, not observed: ten minutes cannot establish this.",
  },
  "C5.1": {
    modes: ["online"],
    situation:
      "Analyse a vague bug report and write the questions you would ask.",
  },
  "C5.2": {
    modes: ["online"],
    situation:
      "Explore a small fictional undocumented tool, then answer three questions within 20 minutes; use the entire online allowance for this task.",
  },
  "C5.3": {
    modes: ["onsite"],
    situation:
      "Explain a technical topic to a non-specialist in two minutes. Judge understanding, never accent or grammar.",
  },
};
export const VERIFICATION: Record<string, Verification> = {
  ...COMPONENT_CHECKS,
  ...Object.fromEntries(
    JOB_SKILLS.map((s) => [
      s.code,
      {
        modes: ["online"],
        situation: `Complete a small practical task: ${s.name.toLowerCase()}. Automated checks may help; a recruiter gives the grade.`,
      },
    ]),
  ),
};
export function verificationFor(skill: string): Verification {
  if (!VERIFICATION[skill]) throw new Error("Unknown skill.");
  return VERIFICATION[skill];
}
export function verificationLabel(skill: string) {
  return verificationFor(skill)
    .modes.map((m) => MODE_LABELS[m])
    .join(" / ");
}
export const DEMO_CHECK_SKILLS = ["C5.1", "C2.2", "J.EMBEDDED_C"] as const;
export const CHECK_SKILLS: readonly string[] = [
  ...DEMO_CHECK_SKILLS,
  ...Object.keys(ONLINE_EXERCISES),
];
export type CheckExercise = {
  skill: string;
  level: ExpectedLevel;
  minutes: number;
  prompt: string;
  checks: string[];
};
const TASKS: Record<string, [string, string, string]> = {
  "C5.1": [
    "NordChip's fictional sensor stops sending readings after startup. With this guide (power, connection, last change), write three questions, separate facts from assumptions and choose the first check.",
    "A fictional sensor stops reporting after about 30 minutes, but restarts normally. Investigate alone: list competing hypotheses, request useful logs and design a reproducible test for each likely cause.",
    "Two fictional customer sites report intermittent gaps after a firmware update. The hardware team suspects power; software suspects queues. New logs conflict. Propose an investigation others can follow, including how to revise it when evidence changes.",
  ],
  "C2.2": [
    "Review this fictional test table with the checklist: reporting interval must be at most 1000 ms; recovery after power loss must be tested. Rows: startup 900 ms PASS; steady state 1400 ms PASS; power recovery NOT RUN. Identify errors and corrections.",
    "Review a fictional release alone. Requirement: every sensor sample is in 0..100 inclusive. Tests cover 1 and 99 only; implementation accepts value > 0 && value < 100. Explain the defect, missing tests and release decision.",
    "A fictional sensor release passed unit tests but loses samples only after reconnection under load. Review this plan: test startup once, retry failed sends without an ID, release if no crash. Identify hidden errors and design checks the hardware and software teams can use before release.",
  ],
  "J.EMBEDDED_C": [
    "On a fictional board, int samples[4]; is filled by for (int i=0; i<=4; i++) samples[i]=i;. With this hint (valid indices are 0 through 3), correct the loop and describe a boundary check. No hardware is required.",
    "Correct this fictional C routine alone: int average(const int *a, unsigned n) { int sum=0; for(unsigned i=0;i<=n;i++) sum+=a[i]; return sum/n; }. State a safe input contract, handle empty input and overflow, and give boundary tests.",
    "A fictional interrupt writes samples into a ring buffer while the main loop reads them. Both update a shared count with count++/count-- and overwrite unread data when full. Sketch a safe C design with an explicit concurrency model, full/empty handling and tests for wraparound and interrupted operations. Explain timing and memory trade-offs for the team.",
  ],
};
export function checkExercise(
  skill: string,
  level: ExpectedLevel,
): CheckExercise {
  const authored = ONLINE_EXERCISES[skill];
  if (authored && [1, 2, 3].includes(level))
    return {
      skill,
      level,
      minutes: authored.minutes,
      prompt: `${authored.inputs}\n\n${authored.tasks[level - 1]}`,
      checks: [...authored.checks],
    };
  if (!TASKS[skill] || ![1, 2, 3].includes(level))
    throw new Error("Unknown exercise or level.");
  const checks =
    skill === "C5.1"
      ? [
          "Separates facts, assumptions and missing information",
          "Uses testable hypotheses and relevant questions",
          "Explains the next check and how evidence changes the analysis",
        ]
      : skill === "C2.2"
        ? [
            "Links each error to a stated requirement",
            "Proposes a concrete correction and boundary or failure test",
            "Explains an acceptable result and remaining uncertainty",
          ]
        : [
            "Avoids out-of-bounds access and defines input or concurrency assumptions",
            "Handles boundary and failure cases with concrete tests",
            "Explains memory, timing and correctness trade-offs",
          ];
  return {
    skill,
    level,
    minutes: skill === "J.EMBEDDED_C" ? 8 : 6,
    prompt: TASKS[skill][level - 1],
    checks,
  };
}
export function checkSource(skill: string) {
  return `online:${skill}`;
}
export function checkStatus(
  submitted: boolean,
  graded: boolean,
): "To check" | "Done" | "Graded" {
  return graded ? "Graded" : submitted ? "Done" : "To check";
}
