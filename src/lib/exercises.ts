import { COMPONENTS } from "./framework";
export type Exercise = { scenario: string; prompt: string; checks: string[] };
/** Fictional exercises; never a test result or a claim that a skill is verified. */
export const EXERCISES: Record<string, Exercise> = {
  "C1.1": {
    scenario:
      "A fictional customer says: ‘The sensor dashboard is too slow.’ You do not yet know which action is slow or why it matters.",
    prompt:
      "Write three questions to clarify the need, then explain how you would confirm your understanding.",
    checks: [
      "Open questions without assuming a cause",
      "A concrete user task and its impact",
      "A restatement for the customer to confirm",
    ],
  },
  "C1.2": {
    scenario:
      "Your fictional team can patch a sensor issue today or redesign the module over two weeks. The customer wants both speed and reliability.",
    prompt:
      "Present a proposal, explain a trade-off and respond to an objection.",
    checks: [
      "A clear recommendation with reasons",
      "An explicit trade-off and uncertainty",
      "A response that addresses the stakeholder’s concern",
    ],
  },
  "C2.1": {
    scenario:
      "A fictional team wants to collect device logs that may contain customer identifiers. The applicable policy has not been checked.",
    prompt:
      "Explain what you would check, whom you would involve and how you would handle a request to skip that check.",
    checks: [
      "Identifies missing rules without inventing them",
      "Seeks the appropriate policy owner",
      "Proposes a compliant way forward",
    ],
  },
  "C2.2": {
    scenario:
      "A fictional sensor must report once a second and recover after losing power. A colleague has only checked the normal startup.",
    prompt:
      "Write a short review and three checks you would run before delivery.",
    checks: [
      "Checks linked to the stated requirements",
      "A failure or recovery case",
      "Explains what result would be acceptable",
    ],
  },
  "C3.1": {
    scenario:
      "You have five working days to prepare a fictional device demo. A teammate owns the hardware, and a dependency may arrive late.",
    prompt:
      "Propose a small plan with deliverables, responsibilities and a response to the dependency slipping.",
    checks: [
      "Concrete deliverables and milestones",
      "Dependencies and responsibilities",
      "An early signal and a realistic fallback",
    ],
  },
  "C3.2": {
    scenario:
      "A fictional demo succeeded, but a last-minute manual fix was needed because a setup instruction was missing.",
    prompt:
      "Write a brief retrospective and propose one improvement you would share with the team.",
    checks: [
      "Separates what happened from assumptions",
      "Identifies something that worked and something to change",
      "A specific improvement with a way to check it",
    ],
  },
  "C4.1": {
    scenario:
      "Two colleagues on a fictional remote team have made different changes to the same module. Each believes theirs is urgent.",
    prompt:
      "Describe how you would clarify the conflict and help the team agree on the next step.",
    checks: [
      "Seeks both perspectives",
      "Makes dependencies and priorities explicit",
      "Agrees on ownership and a clear handover",
    ],
  },
  "C4.2": {
    scenario:
      "You assumed a fictional device problem was a network issue. New logs show the device restarts before connecting.",
    prompt:
      "Explain how this changes your reasoning and what you would check next.",
    checks: [
      "Names the original assumption",
      "Uses the new evidence to revise it",
      "Proposes a check rather than jumping to a new certainty",
    ],
  },
  "C4.3": {
    scenario:
      "You notice a recurring failure in a fictional demo setup. Nobody owns the issue and your assigned task is nearly finished.",
    prompt:
      "Explain what you would take responsibility for, what you would communicate and how you would follow through.",
    checks: [
      "A useful initiative within realistic limits",
      "Communicates ownership and dependencies",
      "A concrete follow-through step",
    ],
  },
  "C5.1": {
    scenario:
      "A fictional device loses readings intermittently. Reports disagree on when it happens, and the team wants to rewrite the software immediately.",
    prompt:
      "Frame the problem, list the missing evidence and propose a first investigation.",
    checks: [
      "A bounded problem statement",
      "Distinguishes facts from hypotheses",
      "A test that could rule out an explanation",
    ],
  },
  "C5.2": {
    scenario:
      "Your fictional team needs a small report from logs in an unfamiliar format. You have a guide and access to a colleague for questions.",
    prompt:
      "Describe how you would learn enough to deliver the report and check that your understanding is correct.",
    checks: [
      "A focused learning goal",
      "A small practical experiment",
      "Validation and an appropriate request for help",
    ],
  },
  "C5.3": {
    scenario:
      "A fictional firmware change caused missed readings during a demo. The fix is being tested; the cause is not fully confirmed.",
    prompt:
      "Write a short update for the customer and explain what extra detail you would give the engineering team.",
    checks: [
      "Audience-appropriate wording",
      "Clear separation of known facts and uncertainty",
      "A concrete next step and update expectation",
    ],
  },
};
export function exerciseFor(skill: string): Exercise {
  if (!COMPONENTS.some((c) => c.code === skill))
    throw new Error("Choose one of the twelve components.");
  return EXERCISES[skill];
}
export type ExerciseFeedback = {
  strengths: { quote: string; comment: string }[];
  questions: string[];
  limitations: string;
};
export function validateFeedback(
  value: unknown,
  answer: string,
): ExerciseFeedback {
  if (!value || typeof value !== "object") throw new Error("Invalid feedback.");
  const v = value as Record<string, unknown>;
  const sentence = (s: unknown): s is string =>
    typeof s === "string" && s.trim().length > 0 && s.length <= 1000;
  if (
    !Array.isArray(v.strengths) ||
    v.strengths.length > 4 ||
    !v.strengths.every(
      (s) =>
        s &&
        typeof s === "object" &&
        sentence(s.quote) &&
        answer.includes(s.quote) &&
        sentence(s.comment),
    ) ||
    !Array.isArray(v.questions) ||
    v.questions.length < 1 ||
    v.questions.length > 4 ||
    !v.questions.every(sentence) ||
    !sentence(v.limitations)
  )
    throw new Error(
      "Feedback must cite the answer and keep uncertainty explicit.",
    );
  return {
    strengths: v.strengths,
    questions: v.questions,
    limitations: v.limitations,
  };
}
