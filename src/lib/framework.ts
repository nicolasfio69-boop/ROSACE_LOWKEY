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
 * Names and Foundation/Intermediate descriptors follow the Centrale Lyon Conseil skills grid
 * (Grille_Competences_CLC.xlsx, N1 Prétendant / N2 Chargé d'affaires), moved from JE situations
 * to a tech workplace: tickets, bug reports, code reviews, customers, datasheets.
 * Descriptors are written so a recruiter can ask "tell me about a time when..." and check the details.
 * One ladder for all components: 1 = with help, simple case; 2 = alone, real case; 3 = alone, new or
 * changing situation, with other people depending on the result. No reputation ("others rely on them"),
 * no personality trait, and communication is judged on being understood, never on accent or grammar.
 */
export const COMPONENTS: Component[] = [
  {
    code: "C1.1",
    competency: "C1",
    name: "Reach out to people",
    short: "Reach out",
    activity: "contacted people you did not know (users, other teams, suppliers) to get what the work needed",
    descriptors: {
      1: "Contacts someone they do not know (a user, another team, a supplier) to get information, and does not freeze after a no.",
      2: "Regularly goes to users or other teams to get what the work needs, and adapts the approach to the person (engineer, customer, manager).",
      3: "Builds contacts the team did not have (new customers, partners, experts) and turns them into regular exchanges.",
    },
  },
  {
    code: "C1.2",
    competency: "C1",
    name: "Understand and convince",
    short: "Convince",
    activity: "convinced a customer or a team to accept a proposal",
    descriptors: {
      1: "Asks relevant questions about a request, restates it, and defends their view with clear arguments.",
      2: "Runs a meeting with a customer or another team alone, says no to a request that cannot be done, and gets a proposal accepted.",
      3: "Gets a decision on a technical choice from people with conflicting interests (customer, management, other teams).",
    },
  },
  {
    code: "C2.1",
    competency: "C2",
    name: "Know the rules and stick to them",
    short: "Rules",
    activity: "followed rules or standards that applied to your work (coding rules, data protection, safety)",
    descriptors: {
      1: "Knows the main rules of the job (coding rules, data protection, safety, the company's process) and answers questions about them correctly.",
      2: "Applies them without being reminded, and refuses a shortcut or a request that would break them.",
      3: "Works out which rules apply to something new (product, market, regulation) and writes them down for the team.",
    },
  },
  {
    code: "C2.2",
    competency: "C2",
    name: "Get it right and spot the error",
    short: "Get it right",
    activity: "delivered work that had to pass a review, tests or an acceptance check",
    descriptors: {
      1: "Delivers work without obvious mistakes, and spots visible errors in someone else's work.",
      2: "Delivers work that passes review or tests with few corrections, and finds real problems when reviewing someone else's code or document.",
      3: "Sets up the checks (tests, review rules, checklists) that catch errors before they reach the customer.",
    },
  },
  {
    code: "C3.1",
    competency: "C3",
    name: "Scope a job",
    short: "Scope",
    activity: "planned the steps of a task or project before starting it",
    descriptors: {
      1: "Says what should be done for a simple request and lists the steps.",
      2: "Writes the scope, deliverables and steps of a task or project, consistent with each other, and estimates the time it takes.",
      3: "Scopes a project whose goal is unclear or keeps changing, and splits it between several people.",
    },
  },
  {
    code: "C3.2",
    competency: "C3",
    name: "See it through and hand it over",
    short: "See it through",
    activity: "taken a project to the end and handed it over to someone else",
    descriptors: {
      1: "Understands that a project has milestones, anticipates a simple difficulty, and hands in finished work.",
      2: "Follows their work to the end, warns early when it slips, closes it cleanly and leaves notes the next person can use.",
      3: "Brings a late or stuck project to delivery and organises a clean handover to another team.",
    },
  },
  {
    code: "C4.1",
    competency: "C4",
    name: "Work with others",
    short: "Teamwork",
    activity: "worked in a team towards a shared result",
    descriptors: {
      1: "Finds their place in a group, listens and contributes.",
      2: "Moves a team forward and takes the lead when needed, without crushing others.",
      3: "Keeps a team delivering through disagreement, pressure, or people joining and leaving.",
    },
  },
  {
    code: "C4.2",
    competency: "C4",
    name: "Own your decisions",
    short: "Decisions",
    activity: "made a decision on your own work and stood by it",
    descriptors: {
      1: "Owns their choices in a project or an exercise, defends a position, and does not blame others.",
      2: "Makes a decision on their own work and owns it, including when it turns out wrong, and says what they changed.",
      3: "Makes decisions that affect others (a technical choice, a release date) under uncertainty, and owns the consequences.",
    },
  },
  {
    code: "C4.3",
    competency: "C4",
    name: "Be reliable",
    short: "Reliable",
    activity: "kept a commitment over several weeks",
    descriptors: {
      1: "Delivers on time, and can say how much time they have for a task.",
      2: "Keeps their commitments for the whole length of a project, including in busy periods.",
      3: "Keeps their commitments across several projects or people, and warns before a deadline is missed, not after.",
    },
  },
  {
    code: "C5.1",
    competency: "C5",
    name: "Break down a problem",
    short: "Break down",
    activity: "turned a vague problem or bug report into a clear analysis",
    descriptors: {
      1: "Structures their reasoning on an open problem and states their assumptions.",
      2: "Turns a vague request or bug report into an analysis the team can use, and checks that the results hold together.",
      3: "Breaks down a problem that is new, confused or disputed, and the team works from their analysis.",
    },
  },
  {
    code: "C5.2",
    competency: "C5",
    name: "Learn fast on your own",
    short: "Learn fast",
    activity: "learned a new tool or subject on your own for a real task",
    descriptors: {
      1: "Takes on an unfamiliar topic, tool or document and gets something useful out of it.",
      2: "Gets up to speed alone on what a real task needs (a new language, a datasheet, an unknown codebase), without training.",
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
      1: "Writes and explains so that others understand at first reading, and presents themselves clearly.",
      2: "Writes documents adapted to who reads them (customer, user, manager), runs a meeting, and answers an objection.",
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
