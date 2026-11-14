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

/** Palette kept to Centrale red, gold and greys only (no blue/green/purple accents). */
export const COMPETENCIES: Competency[] = [
  { code: "C1", name: "Working with clients and stakeholders", color: "#C8102E" },
  { code: "C2", name: "Rigour and compliance", color: "#5C5C5C" },
  { code: "C3", name: "Running a project", color: "#7A7A7A" },
  { code: "C4", name: "Commitment and self-management", color: "#F0C300" },
  { code: "C5", name: "Analysis, learning and communication", color: "#3D3D3D" },
];

export type Component = {
  code: string;
  competency: string;
  name: string;
  /** Short label for the rosace. Always starts with an action verb. */
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
    short: "Follow the rules",
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
    short: "Scope the work",
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
    short: "Work with others",
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
    short: "Own decisions",
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
    name: "Keep commitments and manage your time",
    short: "Keep commitments",
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
    short: "Break down problems",
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
    short: "Communicate clearly",
    activity: "explained something to people who needed to understand it",
    descriptors: {
      1: "Writes and explains so that others understand at first reading, and presents themselves clearly.",
      2: "Writes documents adapted to who reads them (customer, user, manager), runs a meeting, and answers an objection.",
      3: "Explains complex topics to very different audiences, including in tense or high-stakes situations.",
    },
  },
];

/**
 * Technical skills, the second layer added per company need, next to the rosace.
 * Grouped by job family. Same three levels and the same ladder as the Centrale components:
 * 1 with help on a simple case, 2 alone on a real task, 3 new or hard cases that others depend on.
 * To be matched to ESCO skills later.
 */
export type JobFamily = { code: string; name: string };

export const JOB_FAMILIES: JobFamily[] = [
  { code: "embedded", name: "Embedded and hardware" },
  { code: "software", name: "Software and web" },
  { code: "data", name: "Data and scripting" },
  { code: "support", name: "IT support and operations" },
];

export type JobSkill = {
  code: string;
  family: string;
  name: string;
  activity: string;
  descriptors: Record<ExpectedLevel, string>;
};

export const JOB_SKILLS: JobSkill[] = [
  {
    code: "J.EMBEDDED_C",
    family: "embedded",
    name: "Program embedded systems in C",
    activity: "written C code that runs on a microcontroller or an embedded device",
    descriptors: {
      1: "Changes a small C routine on a development board with help, then builds and flashes it.",
      2: "Writes and debugs a driver or a feature in C on a microcontroller alone, within memory and timing limits.",
      3: "Finds and fixes hard failures (memory corruption, timing, interrupts) in code others wrote, and sets the team's coding rules.",
    },
  },
  {
    code: "J.PROTOCOLS",
    family: "embedded",
    name: "Use communication protocols (UART, SPI, I2C, CAN)",
    activity: "made devices talk to each other over a protocol such as UART, SPI, I2C or CAN",
    descriptors: {
      1: "Reads and sends data over UART or I2C by following an example.",
      2: "Configures and debugs a link between devices over SPI, I2C or CAN alone, using the datasheet.",
      3: "Solves intermittent bus failures across several devices, and chooses the protocol for a new design.",
    },
  },
  {
    code: "J.RTOS",
    family: "embedded",
    name: "Use a real-time operating system (FreeRTOS, Zephyr)",
    activity: "built firmware with several tasks on a real-time operating system",
    descriptors: {
      1: "Runs and modifies an example project with tasks on FreeRTOS or Zephyr.",
      2: "Splits a firmware into tasks, queues and interrupts alone, without blocking or priority problems.",
      3: "Diagnoses deadlocks or missed deadlines in a real-time system, and sets its architecture.",
    },
  },
  {
    code: "J.HW_DEBUG",
    family: "embedded",
    name: "Debug hardware with lab tools (oscilloscope, logic analyser, debugger)",
    activity: "used an oscilloscope, a logic analyser or a hardware debugger to find a fault",
    descriptors: {
      1: "Uses a multimeter, an oscilloscope or a debugger with guidance to check a signal or step through code.",
      2: "Finds alone whether a fault comes from the hardware or the software, with an oscilloscope, a logic analyser or JTAG.",
      3: "Diagnoses faults that only appear in the field or under load, and writes the test procedure for production.",
    },
  },
  {
    code: "J.DATASHEET",
    family: "embedded",
    name: "Read datasheets and schematics",
    activity: "configured a component from its datasheet or a schematic",
    descriptors: {
      1: "Finds a pin, a register or a voltage limit in a datasheet with help.",
      2: "Sets up a new component alone from its datasheet and the board schematic.",
      3: "Spots errors or risks in a schematic or a component choice before the board is made.",
    },
  },
  {
    code: "J.GIT",
    family: "software",
    name: "Work with Git and code review",
    activity: "worked on a shared Git repository with branches and code reviews",
    descriptors: {
      1: "Commits, pushes and pulls on a shared repository, following the team's instructions.",
      2: "Works with branches and pull requests, resolves merge conflicts, and gives useful review comments.",
      3: "Sets the team's branching and review rules, and repairs a broken history without losing work.",
    },
  },
  {
    code: "J.WEB_BACKEND",
    family: "software",
    name: "Build a web API (backend)",
    activity: "built or changed the server side of a web application",
    descriptors: {
      1: "Adds a simple endpoint to an existing API, following the existing code.",
      2: "Builds a web API alone, with validation, error handling and a database, and deploys it.",
      3: "Designs an API used by several teams or customers, and handles security, versions and load.",
    },
  },
  {
    code: "J.WEB_FRONTEND",
    family: "software",
    name: "Build a web interface (frontend)",
    activity: "built screens of a web application that people used",
    descriptors: {
      1: "Changes a page or a component of an existing interface, following a mock-up.",
      2: "Builds a screen alone that calls an API, handles errors and loading, and works on a phone.",
      3: "Sets up the structure of a front-end used by several developers, including accessibility and performance.",
    },
  },
  {
    code: "J.TESTING",
    family: "software",
    name: "Write automated tests",
    activity: "written automated tests for code",
    descriptors: {
      1: "Writes a unit test for a simple function, following the existing tests.",
      2: "Writes the tests for their own features alone, and adds a test that reproduces each bug they fix.",
      3: "Sets up the test strategy and the automated checks of a project, so that errors are caught before release.",
    },
  },
  {
    code: "J.SQL",
    family: "software",
    name: "Query and design a SQL database",
    activity: "written SQL queries or designed tables for a real application",
    descriptors: {
      1: "Writes SELECT queries with filters and joins on an existing database.",
      2: "Designs the tables for a feature alone, writes the queries, and adds an index when a query is slow.",
      3: "Plans data migrations on a live database without downtime, and fixes performance problems under load.",
    },
  },
  {
    code: "J.PYTHON",
    family: "data",
    name: "Write scripts in Python",
    activity: "written a Python script that others used",
    descriptors: {
      1: "Adapts an existing Python script to a new file or a new case.",
      2: "Writes a Python script alone that others use, with clear inputs, error handling and a short README.",
      3: "Builds and maintains a Python tool or package used by several people, with tests and versions.",
    },
  },
  {
    code: "J.DATA_ANALYSIS",
    family: "data",
    name: "Clean and analyse data (pandas, notebooks, spreadsheets)",
    activity: "cleaned a real dataset and used it to answer a question",
    descriptors: {
      1: "Loads a dataset in a notebook or a spreadsheet and produces simple statistics or charts, with guidance.",
      2: "Cleans a messy real dataset alone, checks it, and answers a business question with it.",
      3: "Sets up a repeatable analysis that others rely on, and notices when the data itself is wrong.",
    },
  },
  {
    code: "J.ML",
    family: "data",
    name: "Train and evaluate a machine-learning model",
    activity: "trained a machine-learning model and checked how well it worked",
    descriptors: {
      1: "Trains a model from a tutorial or a course on a prepared dataset.",
      2: "Trains and evaluates a model alone on real data, with a proper test set, and explains its limits.",
      3: "Takes a model to production, monitors it, and decides when it must be retrained or dropped.",
    },
  },
  {
    code: "J.DASHBOARD",
    family: "data",
    name: "Build dashboards and reports (Power BI, Grafana, Excel)",
    activity: "built a dashboard or a report that a team used",
    descriptors: {
      1: "Builds a chart or a simple report from prepared data in a tool such as Excel, Power BI or Grafana.",
      2: "Builds a dashboard alone that a team uses every week, from the data source to the charts.",
      3: "Defines the indicators a team steers with, and keeps them correct when the sources change.",
    },
  },
  {
    code: "J.TROUBLESHOOT",
    family: "support",
    name: "Troubleshoot software issues reported by users",
    activity: "found and fixed the cause of a problem a user reported",
    descriptors: {
      1: "Reproduces a problem a user reported, following a checklist.",
      2: "Finds alone the cause of a user's problem from logs and tests, then fixes it or hands it on with a clear diagnosis.",
      3: "Leads the diagnosis of an unfamiliar failure across several systems, and helps others investigate it.",
    },
  },
  {
    code: "J.LINUX",
    family: "support",
    name: "Work with Linux and the command line",
    activity: "used Linux and the command line for real work",
    descriptors: {
      1: "Moves around files, reads logs and runs commands in a terminal, following instructions.",
      2: "Installs, configures and checks a service on Linux alone, and writes small shell scripts.",
      3: "Diagnoses resource or permission problems on production servers and recovers them safely.",
    },
  },
  {
    code: "J.NETWORK",
    family: "support",
    name: "Diagnose network issues (IP, DNS, Wi-Fi, VPN)",
    activity: "found why a person or a device could not connect",
    descriptors: {
      1: "Checks the basics of a connection (IP address, DNS, ping) with a checklist.",
      2: "Finds alone why a user or a device cannot connect (DNS, firewall, Wi-Fi, VPN) and fixes it.",
      3: "Designs or changes the network of an office or a product, and solves intermittent failures.",
    },
  },
  {
    code: "J.CLOUD",
    family: "support",
    name: "Deploy and run services in the cloud (Docker, CI/CD)",
    activity: "deployed an application with containers or a cloud service",
    descriptors: {
      1: "Runs an application in a container or deploys it to a cloud service by following a guide.",
      2: "Packages and deploys a service alone with Docker and a CI/CD pipeline, and reads its logs and metrics.",
      3: "Designs how a product runs in the cloud (environments, costs, security, recovery) and handles incidents.",
    },
  },
  {
    code: "J.TICKETING",
    family: "support",
    name: "Handle support tickets and document fixes",
    activity: "handled support tickets for users or customers",
    descriptors: {
      1: "Answers simple support tickets using the knowledge base.",
      2: "Handles a queue of tickets alone, writes clear replies, and adds each new fix to the knowledge base.",
      3: "Organises the support process (categories, priorities, escalation) so that tickets are solved faster.",
    },
  },
  {
    code: "J.DATA_PIPELINES",
    family: "data",
    name: "Build data pipelines",
    activity: "built a repeatable process to move and prepare data between systems",
    descriptors: {
      1: "Runs and adapts a small file-to-table pipeline with help, checking the row count and required fields.",
      2: "Builds a repeatable pipeline alone for real data, with validation, retries and a clear failure report.",
      3: "Adapts a pipeline when sources or schemas change, preventing duplicate or missing records for teams that depend on it.",
    },
  },
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

/** Descriptor of a level, for a Centrale component or a technical skill. */
export function descriptor(code: string, level: ExpectedLevel): string {
  return (
    COMPONENTS.find((c) => c.code === code)?.descriptors[level] ??
    JOB_SKILLS.find((j) => j.code === code)?.descriptors[level] ??
    LEVELS[level].definition
  );
}
