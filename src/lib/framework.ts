/**
 * The shared skills framework.
 *
 * It comes from the competency framework of Centrale Lyon Conseil (a student
 * consultancy): 5 competencies, 12 components, levels with factual descriptors,
 * and the rosace chart. Labels were rewritten in English for tech employers, and
 * a third level (Advanced) was added. Component codes C1.1 to C5.3 are unchanged.
 */

export type LevelValue = 0 | 1 | 2 | 3;
export type ExpectedLevel = 1 | 2 | 3;

export const LEVELS: Record<LevelValue, { name: string; definition: string }> = {
  0: { name: "Not yet", definition: "Has never done it." },
  1: { name: "Foundation", definition: "Has done it with help, on simple tasks." },
  2: { name: "Intermediate", definition: "Does it alone, in real situations, on well-defined tasks." },
  3: {
    name: "Advanced",
    definition: "Does it alone when the situation is new, unclear or changing, and other people's work depends on the result.",
  },
};

export type Competency = { code: string; name: string; color: string };

export const COMPETENCIES: Competency[] = [
  { code: "C1", name: "Working with clients and stakeholders", color: "#8B1E2D" },
  { code: "C2", name: "Rigour and compliance", color: "#2E4A6B" },
  { code: "C3", name: "Running a project", color: "#2F6B4F" },
  { code: "C4", name: "Commitment and self-management", color: "#B5701F" },
  { code: "C5", name: "Analysis, learning and communication", color: "#6B3A7A" },
];

export type Component = {
  code: string;
  competency: string;
  name: string;
  /** Short label for the rosace. */
  short: string;
  /** Completes "Have you ever ...?" in the talent questions and the brief. */
  activity: string;
  descriptors: Record<ExpectedLevel, string>;
};

/**
 * Descriptors are written so a recruiter can ask "tell me about a time when..." and check the details.
 * One ladder for all components: 1 = with help, simple case; 2 = alone, real case; 3 = alone, new or
 * changing situation, with other people depending on the result. No reputation ("others rely on them"),
 * no personality trait, and communication is judged on being understood, never on accent or grammar.
 */
export const COMPONENTS: Component[] = [
  {
    code: "C1.1",
    competency: "C1",
    name: "Listen and surface the real need",
    short: "Listen",
    activity: "brought out what someone really needed by listening and asking questions",
    descriptors: {
      1: "With help, talks with someone about a need: asks open questions and restates what they understood before acting.",
      2: "Alone, runs a conversation with a client or another team and comes out with the real need written down and confirmed by that person.",
      3: "Clarifies a need that is vague, changing or disputed between several people, and gets them to agree on it in writing.",
    },
  },
  {
    code: "C1.2",
    competency: "C1",
    name: "Present and defend a proposal",
    short: "Present",
    activity: "presented a proposal and answered objections to it",
    descriptors: {
      1: "Presents an idea or a solution to their team in a structured way, with the reasons behind it.",
      2: "Presents a proposal to a client or a team on their own, answers their objections, and gets it accepted or adjusted.",
      3: "Defends a proposal in front of decision-makers or people with conflicting interests, adapts it on the spot, and gets a decision.",
    },
  },
  {
    code: "C2.1",
    competency: "C2",
    name: "Identify the rules and standards that apply",
    short: "Rules",
    activity: "worked out which rules or standards applied to your work",
    descriptors: {
      1: "Knows the main rules of their work (for example coding standards, data protection, safety rules, a style guide) and follows them once pointed out.",
      2: "Finds on their own which rules apply to a task before starting, and flags or refuses a request that would break them.",
      3: "Works out which rules apply when none is obvious (new product, new market, new regulation) and writes them down for the team.",
    },
  },
  {
    code: "C2.2",
    competency: "C2",
    name: "Deliver work that meets the requirements",
    short: "Quality",
    activity: "delivered work that had to meet precise requirements",
    descriptors: {
      1: "Delivers work without obvious errors, checks it against a given checklist, and spots visible errors in someone else's work.",
      2: "Delivers work that passes review or acceptance with few corrections, and finds real problems when reviewing someone else's work.",
      3: "Sets up the checks (tests, reviews, checklists) that make a team's work reliable, and catches problems others missed.",
    },
  },
  {
    code: "C3.1",
    competency: "C3",
    name: "Scope and run a piece of work",
    short: "Scope",
    activity: "planned and ran a piece of work from start to finish",
    descriptors: {
      1: "For a simple need, lists the steps to take and follows a plan someone else made.",
      2: "Writes the scope, deliverables and steps of a project, follows it, and warns early when it slips.",
      3: "Runs a project whose goal or constraints change along the way, re-plans it, and coordinates several people on it.",
    },
  },
  {
    code: "C3.2",
    competency: "C3",
    name: "Learn from experience and pass it on",
    short: "Lessons",
    activity: "drawn lessons from a piece of work and passed them on to others",
    descriptors: {
      1: "After a task, says what worked, what did not, and one thing they would do differently.",
      2: "Closes a project with written lessons or documentation that the next person actually used.",
      3: "Turns lessons from several projects into a practice or a tool that the team adopted.",
    },
  },
  {
    code: "C4.1",
    competency: "C4",
    name: "Work within a team",
    short: "Team",
    activity: "worked in a team towards a shared result",
    descriptors: {
      1: "Does their share in a group, asks for help when blocked, and keeps the others informed.",
      2: "Moves a team forward: splits the work, unblocks others, and takes the lead when needed without taking over.",
      3: "Keeps a team delivering through disagreement, pressure, or people joining and leaving.",
    },
  },
  {
    code: "C4.2",
    competency: "C4",
    name: "Reflect critically on own choices",
    short: "Reflect",
    activity: "looked back critically at your own choices and changed your approach",
    descriptors: {
      1: "Explains a choice they made, afterwards, and says what they could have done differently.",
      2: "Gives a concrete case where feedback or a mistake made them change the way they work, and what changed.",
      3: "Notices when their own approach is not working before it fails, changes course, and helps others review theirs.",
    },
  },
  {
    code: "C4.3",
    competency: "C4",
    name: "Take ownership and initiative",
    short: "Initiative",
    activity: "taken on a task or problem without being asked, and seen it through",
    descriptors: {
      1: "Delivers what they promised on time, and volunteers for tasks without being asked.",
      2: "Keeps their commitments for the whole length of a project, and starts useful actions nobody asked for.",
      3: "Takes charge of a problem nobody owns, in an uncertain situation, and sees it through to the end.",
    },
  },
  {
    code: "C5.1",
    competency: "C5",
    name: "Frame a problem or a need",
    short: "Frame",
    activity: "turned a vague problem into a clearly stated one",
    descriptors: {
      1: "With help, restates an open problem in a structured way and states their assumptions.",
      2: "Alone, turns a vague request or bug report into a clearly stated problem that others can work from.",
      3: "Frames a problem that is new, confused or disputed, and the team works from their framing.",
    },
  },
  {
    code: "C5.2",
    competency: "C5",
    name: "Learn independently",
    short: "Learn",
    activity: "learned a new subject on your own for a real task",
    descriptors: {
      1: "With guidance, takes on an unfamiliar tool, topic or document and gets something useful out of it.",
      2: "Learns a new tool or domain alone for a real task, without training, and delivers with it.",
      3: "Learns a new field fast enough to set it up or teach it for others.",
    },
  },
  {
    code: "C5.3",
    competency: "C5",
    name: "Communicate clearly",
    short: "Communicate",
    activity: "explained something to people who needed to understand it",
    descriptors: {
      1: "Explains their own work so that their team can follow it, in writing and out loud.",
      2: "Writes for a specific reader (client, user, manager) so they can act without coming back with questions, and runs a meeting.",
      3: "Explains complex topics to very different audiences, including in tense or high-stakes situations.",
    },
  },
];

/**
 * Job-specific skills, the second layer added per company need.
 * Prepared by hand for the demo jobs; to be matched to ESCO skills.
 */
export type JobSkill = { code: string; name: string; activity: string };

export const JOB_SKILLS: JobSkill[] = [
  { code: "J.EMBEDDED_C", name: "Program embedded systems in C", activity: "written C code that runs on a microcontroller or an embedded device" },
  { code: "J.PROTOCOLS", name: "Use communication protocols (UART, SPI, I2C, CAN)", activity: "made devices talk to each other over a protocol such as UART, SPI, I2C or CAN" },
  { code: "J.TROUBLESHOOT", name: "Troubleshoot software issues reported by users", activity: "found and fixed the cause of a problem a user reported" },
  { code: "J.LINUX", name: "Work with Linux and the command line", activity: "used Linux and the command line for real work" },
  { code: "J.PYTHON", name: "Write scripts in Python", activity: "written a Python script that others used" },
];

export const SKILL_CODES = new Set<string>([...COMPONENTS.map((c) => c.code), ...JOB_SKILLS.map((j) => j.code)]);

export function isComponent(code: string): boolean {
  return COMPONENTS.some((c) => c.code === code);
}

export function skillName(code: string): string {
  return COMPONENTS.find((c) => c.code === code)?.name ?? JOB_SKILLS.find((j) => j.code === code)?.name ?? code;
}

export function skillActivity(code: string): string {
  return COMPONENTS.find((c) => c.code === code)?.activity ?? JOB_SKILLS.find((j) => j.code === code)?.activity ?? code;
}

/** Descriptor of a level. Job skills fall back to the general level definition. */
export function descriptor(code: string, level: ExpectedLevel): string {
  return COMPONENTS.find((c) => c.code === code)?.descriptors[level] ?? LEVELS[level].definition;
}
