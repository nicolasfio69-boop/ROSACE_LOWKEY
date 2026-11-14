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
    definition: "Does it alone in new or complex situations, and others rely on them for it.",
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

export const COMPONENTS: Component[] = [
  {
    code: "C1.1",
    competency: "C1",
    name: "Listen and surface the real need",
    short: "Listen",
    activity: "brought out what someone really needed by listening and asking questions",
    descriptors: {
      1: "Listens without interrupting, asks open questions and restates what they understood.",
      2: "In a conversation with a client or another team, brings out the real need, restates it to confirm it, and notices what is left unsaid.",
      3: "Surfaces needs the client had not put into words, in new or tense situations, and others rely on them to clarify what is really asked.",
    },
  },
  {
    code: "C1.2",
    competency: "C1",
    name: "Present and defend a proposal",
    short: "Present",
    activity: "presented a proposal and answered objections to it",
    descriptors: {
      1: "Presents an idea in a structured way and backs it with understandable arguments.",
      2: "Presents a proposal to a client or a team on their own, argues for it and answers objections.",
      3: "Defends a proposal in front of demanding or divided stakeholders, adapts it on the spot, and gets a decision.",
    },
  },
  {
    code: "C2.1",
    competency: "C2",
    name: "Identify the rules and standards that apply",
    short: "Rules",
    activity: "worked out which rules or standards applied to your work",
    descriptors: {
      1: "Knows the main rules of their field and answers simple questions about them correctly, with help.",
      2: "Identifies on their own the rules and standards that apply to a task, and refuses a request that does not comply.",
      3: "Works out which rules apply in new or ambiguous situations, and others come to them when in doubt.",
    },
  },
  {
    code: "C2.2",
    competency: "C2",
    name: "Deliver work that meets the requirements",
    short: "Quality",
    activity: "delivered work that had to meet precise requirements",
    descriptors: {
      1: "Produces work without obvious errors, and spots visible errors in someone else's work.",
      2: "Delivers compliant work on their own with few corrections, and finds substantive issues in someone else's work.",
      3: "Sets up the checks that make a team's work reliable, and catches problems others missed.",
    },
  },
  {
    code: "C3.1",
    competency: "C3",
    name: "Scope and run a piece of work",
    short: "Scope",
    activity: "planned and ran a piece of work from start to finish",
    descriptors: {
      1: "Says what should be done for a simple need and proposes steps.",
      2: "Writes the scope, deliverables and phases of a piece of work, then follows it and raises alerts in time.",
      3: "Scopes and runs work whose goal or constraints change along the way, and coordinates several people on it.",
    },
  },
  {
    code: "C3.2",
    competency: "C3",
    name: "Learn from experience and pass it on",
    short: "Lessons",
    activity: "drawn lessons from a piece of work and passed them on to others",
    descriptors: {
      1: "Says what worked and what did not after a task, and draws a lesson from it.",
      2: "Closes a piece of work with lessons learned that others can use, and shares them.",
      3: "Turns lessons from several projects into practices that the team adopts.",
    },
  },
  {
    code: "C4.1",
    competency: "C4",
    name: "Work within a team",
    short: "Team",
    activity: "worked in a team towards a shared result",
    descriptors: {
      1: "Finds their place in a group, listens and contributes.",
      2: "Moves a team forward and takes the lead when needed, without crushing others.",
      3: "Keeps a team working together through disagreement or pressure, and others count on them for it.",
    },
  },
  {
    code: "C4.2",
    competency: "C4",
    name: "Reflect critically on own choices",
    short: "Reflect",
    activity: "looked back critically at your own choices and changed your approach",
    descriptors: {
      1: "Explains a choice afterwards and recognises what they could have done differently.",
      2: "Steps back on their decisions and attitude during a real piece of work, and makes concrete adjustments.",
      3: "Questions their own approach in new situations before things go wrong, and helps others do the same.",
    },
  },
  {
    code: "C4.3",
    competency: "C4",
    name: "Take ownership and initiative",
    short: "Initiative",
    activity: "taken on a task or problem without being asked, and seen it through",
    descriptors: {
      1: "Is present, delivers on time, and volunteers for tasks without being asked.",
      2: "Keeps their commitments for the whole length of a piece of work, and takes initiatives that help the team.",
      3: "Takes ownership of problems nobody owns, in uncertain situations, and sees them through.",
    },
  },
  {
    code: "C5.1",
    competency: "C5",
    name: "Frame a problem or a need",
    short: "Frame",
    activity: "turned a vague problem into a clearly stated one",
    descriptors: {
      1: "Restates an open problem in a structured way and states explicit assumptions, with help.",
      2: "Turns a vague need into a clearly stated problem on their own, that others can work from.",
      3: "Frames the problem when the situation is new or confused, or when people disagree on it, and others rely on their framing.",
    },
  },
  {
    code: "C5.2",
    competency: "C5",
    name: "Learn independently",
    short: "Learn",
    activity: "learned a new subject on your own for a real task",
    descriptors: {
      1: "Takes on an unfamiliar topic or document and gets something useful out of it.",
      2: "Gets up to speed alone on a new domain for a real piece of work, without prior training.",
      3: "Masters a new field quickly enough to become the person others turn to.",
    },
  },
  {
    code: "C5.3",
    competency: "C5",
    name: "Communicate clearly",
    short: "Communicate",
    activity: "explained something to people who needed to understand it",
    descriptors: {
      1: "Writes clearly and correctly, and holds attention when speaking.",
      2: "Writes documents adapted to who reads them, runs a meeting, and answers an objection.",
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
