import {
  isComponent,
  LEVELS,
  skillActivity,
  skillName,
  descriptor,
} from "./framework";
import { align, type Need, type Talent } from "./scoring";
import { levelExample } from "./need-draft";
/** Prioritise discussion gaps without changing matching, evidence or levels. */
export function prepareConversation(need: Need, talent: Talent) {
  const alignment = align(need, talent);
  const priority = { unknown: 0, mentioned: 0, below: 1, met: 2 };
  const questions = alignment.rows
    .filter((r) => r.requirement.major || !isComponent(r.requirement.skill))
    .sort((a, b) => priority[a.status] - priority[b.status])
    .slice(0, 5)
    .map((row) => {
      const r = row.requirement,
        statement = talent.statements[r.skill];
      const declared =
        row.level === null ? "Not filled in" : LEVELS[row.level].name;
      const reason =
        row.level === null
          ? "No level has been declared here. Explore the experience before drawing a conclusion."
          : row.level < r.expected
            ? `The declared level is ${declared}; this role expects ${LEVELS[r.expected].name}. Explore the support needed and a concrete situation.`
            : statement?.evidence === "supported"
              ? "A supporting link was declared. Discuss the person's contribution; a link does not verify a skill."
              : "The declared level meets the expectation. Ask for a concrete situation and the person's own contribution.";
      return {
        skill: r.skill,
        name: skillName(r.skill),
        major: r.major,
        declared,
        expected: LEVELS[r.expected].name,
        reason,
        status: row.status,
        question:
          row.level === null
            ? `What experience, if any, have you had when you ${skillActivity(r.skill)}?`
            : `Tell me about a time when you ${skillActivity(r.skill)}.`,
        followUp:
          row.level === null
            ? "It is fine to say you have not done this yet. What related task have you tried, and what help would you need?"
            : "What did you do yourself, what support did you need and what was the outcome?",
        descriptor: descriptor(r.skill, r.expected),
        example:
          r.example ??
          levelExample(r.skill, r.expected, {
            title: need.title,
            context: { task: "", audience: "", outcome: "", challenge: "" },
          }),
        jobReason: r.reason,
      };
    });
  return {
    alignment,
    questions,
    connections: alignment.rows
      .filter((r) => r.status === "met")
      .map((r) => skillName(r.requirement.skill)),
    unknown: questions
      .filter((q) => q.status === "unknown" || q.status === "mentioned")
      .map((q) => q.name),
    toExplore: questions.filter((q) => q.status !== "met").map((q) => q.name),
  };
}
