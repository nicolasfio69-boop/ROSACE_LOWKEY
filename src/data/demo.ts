/**
 * Synthetic demo data. No real person or company.
 * One Espoo matchmaking event, three company needs and ten talent cards.
 * Every declared level is backed by a CV line or left as a plain declaration,
 * so the conversation guide has something concrete to check.
 * Pseudonyms vary on purpose: names, languages, degrees and career paths never enter a calculation.
 */
import type { Need, Talent } from "@/lib/scoring";

export const NEEDS: Need[] = [
  {
    id: "nordchip-embedded",
    company: "NordChip",
    title: "Junior embedded software developer",
    capacity: 3,
    requirements: [
      {
        skill: "C5.1",
        major: true,
        expected: 2,
        reason:
          'Customers report problems like "the meter went silent last night". Someone has to turn that into a case we can reproduce.',
        example:
          "Turns a bug a customer describes vaguely into a case the team can reproduce.",
      },
      {
        skill: "C4.1",
        major: true,
        expected: 2,
        reason:
          "Five developers sit next to the hardware engineers in Espoo; interfaces are agreed face to face.",
        example:
          "Agrees on an interface with the hardware team and keeps the others informed.",
      },
      {
        skill: "C5.2",
        major: true,
        expected: 2,
        reason:
          "Our build and flashing tools are home-made and barely documented.",
        example:
          "Figures out an undocumented build tool alone and writes down how it works.",
      },
      {
        skill: "C2.2",
        major: false,
        expected: 1,
        reason: "Firmware has to follow our coding rules before it ships.",
        example:
          "Runs the code checker and fixes what it reports before asking for a review.",
      },
      {
        skill: "J.EMBEDDED_C",
        major: false,
        expected: 2,
        reason:
          "They write firmware for our district-heating sensor boards from week one.",
        example:
          "Writes and debugs a driver for a new sensor on their own, following our coding rules.",
      },
      {
        skill: "J.PROTOCOLS",
        major: false,
        expected: 1,
        reason: "Our boards talk over SPI and CAN. They'll pick it up with us.",
        example:
          "Reads an SPI frame with a logic analyser, with a colleague's help.",
      },
    ],
  },
  {
    id: "lumora-support",
    company: "Lumora",
    title: "Customer support engineer",
    capacity: 3,
    requirements: [
      {
        skill: "C1.2",
        major: true,
        expected: 2,
        reason:
          "Our customers are property managers; they rarely describe the technical problem behind a complaint.",
        example:
          "On a call, finds out what the customer was actually trying to do before the error appeared.",
      },
      {
        skill: "C5.3",
        major: true,
        expected: 2,
        reason:
          "Most answers go out in writing, in the support portal, to non-technical readers.",
        example:
          "Writes a reply a non-technical customer can follow step by step.",
      },
      {
        skill: "C4.3",
        major: true,
        expected: 2,
        reason:
          "Tickets often stay open for days while a fix is tested; nobody else will follow up.",
        example:
          "Comes back to a customer two days later to check the fix held.",
      },
      {
        skill: "C2.2",
        major: false,
        expected: 1,
        reason: "Answers must follow our support guidelines.",
        example: "Checks their reply against the guidelines before sending it.",
      },
      {
        skill: "J.TROUBLESHOOT",
        major: false,
        expected: 2,
        reason:
          "Most tickets are sync errors between the mobile app and building sensors.",
        example:
          "Finds the cause of a user's sync error from the logs, without escalating.",
      },
    ],
  },
  {
    id: "vireo-data",
    company: "Vireo Data",
    title: "Junior data analyst",
    capacity: 2,
    requirements: [
      {
        skill: "C5.1",
        major: true,
        expected: 2,
        reason:
          'City clients ask open questions such as "why did bus ridership drop in March?"',
        example:
          "Splits a vague client question into three checks the data can answer.",
      },
      {
        skill: "C5.3",
        major: true,
        expected: 2,
        reason: "Results go to city officials who do not read code.",
        example:
          "Explains a trend and its limits in five plain sentences and one chart.",
      },
      {
        skill: "C2.2",
        major: true,
        expected: 2,
        reason:
          "A wrong figure in a public report costs us the client's trust.",
        example:
          "Reconciles totals with the source before a report leaves the team.",
      },
      {
        skill: "C3.1",
        major: false,
        expected: 1,
        reason: "Small studies have fixed budgets of a few days.",
        example: "Lists the steps of a study and says which one could slip.",
      },
      {
        skill: "C1.2",
        major: false,
        expected: 1,
        reason: "Analysts join client meetings with a senior colleague.",
        example:
          "Rephrases the client's question to confirm it before starting.",
      },
      {
        skill: "J.SQL",
        major: false,
        expected: 2,
        reason: "All ticketing and sensor data sits in a PostgreSQL warehouse.",
        example:
          "Writes a query joining trips and stops without help, and checks the row counts.",
      },
      {
        skill: "J.DATA_ANALYSIS",
        major: false,
        expected: 2,
        reason: "Raw data has gaps and duplicates every week.",
        example:
          "Cleans a month of sensor data and documents each step in a notebook.",
      },
      {
        skill: "J.DASHBOARD",
        major: false,
        expected: 1,
        reason: "Clients follow a few indicators in Power BI.",
        example:
          "Adds a chart to an existing dashboard with a colleague's review.",
      },
    ],
  },
];

export const TALENTS: Talent[] = [
  {
    id: "amira",
    pseudonym: "Amira",
    cv: [
      "President of the Otaniemi student robotics club (2 years).",
      "Programmed the robot controller in C on an STM32 board.",
      "Connected sensors to the robot's main board.",
      "Kept the club's build plan on track for two national robot contests.",
      "Organised workshops for 30 new members.",
      "Summer job 2025: assembly line assistant at an electronics plant in Salo.",
      "Studies: electrical engineering, 3rd year.",
    ].join("\n"),
    statements: {
      "J.EMBEDDED_C": {
        level: 3,
        evidence: "supported",
        cvQuote: "Programmed the robot controller in C on an STM32 board.",
        link: "https://example.org/robot-controller",
      },
      "C5.1": { level: 1, evidence: "declared" },
      "C4.1": {
        level: 2,
        evidence: "declared",
        cvQuote: "President of the Otaniemi student robotics club (2 years).",
      },
      "J.PROTOCOLS": {
        level: null,
        cvQuote: "Connected sensors to the robot's main board.",
      },
      "C5.2": { level: 1, evidence: "declared" },
      "C1.2": { level: 1, evidence: "declared" },
      "C5.3": {
        level: 2,
        evidence: "situation",
        cvQuote: "Organised workshops for 30 new members.",
      },
      "C4.3": { level: 3, evidence: "declared" },
      "C3.1": { level: 2, evidence: "declared" },
      "C2.2": { level: 2, evidence: "declared" },
      "J.TROUBLESHOOT": { level: 1, evidence: "declared" },
    },
  },
  {
    id: "jonas",
    pseudonym: "Jonas",
    cv: [
      "Research assistant, signal processing lab (1 year).",
      "Wrote the analysis plan for a noisy measurement campaign.",
      "Taught myself Rust to rewrite the lab's data pipeline.",
      "Presented results at the lab's weekly seminar.",
      "MSc in applied physics.",
    ].join("\n"),
    statements: {
      "C5.1": {
        level: 3,
        evidence: "situation",
        cvQuote: "Wrote the analysis plan for a noisy measurement campaign.",
      },
      "C4.1": { level: 2, evidence: "declared" },
      "C5.2": {
        level: 2,
        evidence: "supported",
        cvQuote: "Taught myself Rust to rewrite the lab's data pipeline.",
        link: "https://example.org/lab-pipeline",
      },
      "C1.2": { level: 2, evidence: "declared" },
      "C5.3": { level: 1, evidence: "declared" },
    },
  },
  {
    id: "lin",
    pseudonym: "Lin",
    cv: [
      "Embedded software intern, industrial sensors company (6 months).",
      "Developed drivers in C for temperature sensors over SPI and I2C.",
      "Automated test benches with Python on Linux.",
      "Fixed review comments from the senior developer before each merge.",
      "BSc in computer engineering.",
    ].join("\n"),
    statements: {
      "J.EMBEDDED_C": {
        level: 2,
        evidence: "situation",
        cvQuote:
          "Developed drivers in C for temperature sensors over SPI and I2C.",
      },
      "C5.1": { level: 2, evidence: "declared" },
      "C4.1": { level: 1, evidence: "declared" },
      "J.PROTOCOLS": {
        level: 2,
        evidence: "declared",
        cvQuote:
          "Developed drivers in C for temperature sensors over SPI and I2C.",
      },
      "C5.2": { level: 2, evidence: "declared" },
      "J.LINUX": {
        level: 3,
        evidence: "declared",
        cvQuote: "Automated test benches with Python on Linux.",
      },
      "J.PYTHON": { level: 2, evidence: "declared" },
      "C1.2": { level: 1, evidence: "declared" },
      "C5.3": { level: 1, evidence: "declared" },
      "C2.2": { level: 2, evidence: "declared" },
      "C4.3": { level: 2, evidence: "declared" },
      "J.TROUBLESHOOT": { level: 2, evidence: "declared" },
    },
  },
  {
    id: "mateo",
    pseudonym: "Mateo",
    cv: [
      "IT helpdesk agent, logistics company in Vantaa (3 years).",
      "First point of contact for 400 employees, phone and chat.",
      "Wrote the internal FAQ used by the whole support team.",
      "Followed laptop and VPN tickets until the user confirmed the fix.",
    ].join("\n"),
    statements: {
      "C1.2": {
        level: 3,
        evidence: "situation",
        cvQuote: "First point of contact for 400 employees, phone and chat.",
      },
      "C5.3": {
        level: 2,
        evidence: "supported",
        cvQuote: "Wrote the internal FAQ used by the whole support team.",
        link: "https://example.org/faq",
      },
      "J.TROUBLESHOOT": { level: 2, evidence: "declared" },
      "C2.2": { level: 1, evidence: "declared" },
      "C4.3": { level: 2, evidence: "declared" },
      "J.EMBEDDED_C": { level: 0 },
      "C5.1": { level: 1, evidence: "declared" },
      "C4.1": { level: 2, evidence: "declared" },
      "J.PROTOCOLS": { level: 0 },
      "C5.2": { level: 2, evidence: "declared" },
    },
  },
  {
    id: "sofia",
    pseudonym: "Sofia",
    cv: [
      "Secondary school teacher, mathematics (6 years).",
      "Coordinated a team of 8 teachers for a new curriculum.",
      "Learned Python online and built grading scripts for colleagues.",
      "Explained the school's new grading platform to parents at evening sessions.",
      "Career change towards tech support.",
    ].join("\n"),
    statements: {
      "C5.3": { level: 3, evidence: "declared" },
      "C1.2": { level: 2, evidence: "declared" },
      "C4.1": {
        level: 3,
        evidence: "situation",
        cvQuote: "Coordinated a team of 8 teachers for a new curriculum.",
      },
      "C5.2": {
        level: 3,
        evidence: "situation",
        cvQuote:
          "Learned Python online and built grading scripts for colleagues.",
      },
      "J.TROUBLESHOOT": { level: 1, evidence: "declared" },
      "C2.2": { level: 2, evidence: "declared" },
      "C4.3": { level: 2, evidence: "declared" },
      "J.PYTHON": { level: 1, evidence: "declared" },
      "C5.1": { level: 2, evidence: "declared" },
      "J.EMBEDDED_C": { level: 0 },
    },
  },
  {
    id: "kwame",
    pseudonym: "Kwame",
    cv: [
      "Freelance web developer (4 years): websites for small shops and associations.",
      "Python and JavaScript; maintains three client sites.",
    ].join("\n"),
    statements: {
      "J.PYTHON": { level: 2, evidence: "declared" },
      "C4.3": { level: 2, evidence: "declared" },
      "C5.3": { level: 2, evidence: "declared" },
    },
  },
  {
    id: "elina",
    pseudonym: "Elina",
    cv: [
      "Field service technician, elevator maintenance company (4 years).",
      "Diagnosed faults on site from error codes and maintenance logs.",
      "Explained repairs and delays to building managers and residents.",
      "Logged every intervention in the ticketing system and closed it only after a test run.",
      "Wrote the checklist new technicians use for their first month.",
      "Vocational qualification in electrical and automation engineering.",
    ].join("\n"),
    statements: {
      "C1.2": {
        level: 2,
        evidence: "situation",
        cvQuote:
          "Explained repairs and delays to building managers and residents.",
      },
      "C5.3": {
        level: 2,
        evidence: "supported",
        cvQuote:
          "Wrote the checklist new technicians use for their first month.",
        link: "https://example.org/technician-checklist",
      },
      "C4.3": {
        level: 3,
        evidence: "situation",
        cvQuote:
          "Logged every intervention in the ticketing system and closed it only after a test run.",
      },
      "C2.2": { level: 2, evidence: "declared" },
      "J.TROUBLESHOOT": {
        level: 2,
        evidence: "situation",
        cvQuote:
          "Diagnosed faults on site from error codes and maintenance logs.",
      },
      "J.TICKETING": { level: 2, evidence: "declared" },
      "J.NETWORK": { level: 1, evidence: "declared" },
      "C5.1": { level: 2, evidence: "declared" },
      "C4.1": { level: 2, evidence: "declared" },
      "C5.2": { level: 1, evidence: "declared" },
    },
  },
  {
    id: "omar",
    pseudonym: "Omar",
    cv: [
      "Data analyst, telecom operator (5 years), before moving to Espoo in 2024.",
      "Built weekly churn reports from a SQL warehouse of 20 million rows.",
      "Found a double-counting error in the billing data before a board report.",
      "Presented findings to sales managers with no data background.",
      "Planned a 6-week pricing study with two colleagues.",
      "Python (pandas) for cleaning; Power BI for dashboards.",
    ].join("\n"),
    statements: {
      "C5.1": { level: 3, evidence: "declared" },
      "C5.3": {
        level: 2,
        evidence: "situation",
        cvQuote:
          "Presented findings to sales managers with no data background.",
      },
      "C2.2": {
        level: 3,
        evidence: "situation",
        cvQuote:
          "Found a double-counting error in the billing data before a board report.",
      },
      "C3.1": {
        level: 2,
        evidence: "situation",
        cvQuote: "Planned a 6-week pricing study with two colleagues.",
      },
      "C1.2": { level: 1, evidence: "declared" },
      "J.SQL": {
        level: 3,
        evidence: "situation",
        cvQuote:
          "Built weekly churn reports from a SQL warehouse of 20 million rows.",
      },
      "J.DATA_ANALYSIS": { level: 3, evidence: "declared" },
      "J.DASHBOARD": {
        level: 2,
        evidence: "declared",
        cvQuote: "Python (pandas) for cleaning; Power BI for dashboards.",
      },
      "J.PYTHON": { level: 2, evidence: "declared" },
      "C4.1": { level: 2, evidence: "declared" },
      "C5.2": { level: 2, evidence: "declared" },
    },
  },
  {
    id: "tuomas",
    pseudonym: "Tuomas",
    cv: [
      "Bachelor of Business Administration, graduated in June 2026.",
      "Thesis: Power BI dashboard tracking a sports club's memberships.",
      "Cleaned five years of membership spreadsheets for the thesis.",
      "Part-time customer service at a sports shop (2 years).",
      "Basic SQL from an online course.",
    ].join("\n"),
    statements: {
      "C5.1": { level: 1, evidence: "declared" },
      "C5.3": { level: 2, evidence: "declared" },
      "C2.2": {
        level: 2,
        evidence: "situation",
        cvQuote:
          "Cleaned five years of membership spreadsheets for the thesis.",
      },
      "C3.1": { level: 2, evidence: "declared" },
      "C1.2": {
        level: 2,
        evidence: "situation",
        cvQuote: "Part-time customer service at a sports shop (2 years).",
      },
      "J.SQL": {
        level: 1,
        evidence: "declared",
        cvQuote: "Basic SQL from an online course.",
      },
      "J.DATA_ANALYSIS": { level: 2, evidence: "declared" },
      "J.DASHBOARD": {
        level: 3,
        evidence: "supported",
        cvQuote:
          "Thesis: Power BI dashboard tracking a sports club's memberships.",
        link: "https://example.org/thesis-dashboard",
      },
      "C4.1": { level: 2, evidence: "declared" },
      "C4.3": { level: 2, evidence: "declared" },
    },
  },
  {
    id: "priya",
    pseudonym: "Priya",
    cv: [
      "QA engineer, banking software (4 years), then a two-year career break.",
      "Wrote and maintained automated regression tests for payment flows.",
      "Checked test results in SQL against the expected database state.",
      "Split release testing into a plan the team could follow.",
      "Online course in data analysis completed in 2026.",
    ].join("\n"),
    statements: {
      "C5.1": { level: 2, evidence: "declared" },
      "C5.3": { level: 1, evidence: "declared" },
      "C2.2": {
        level: 3,
        evidence: "situation",
        cvQuote:
          "Wrote and maintained automated regression tests for payment flows.",
      },
      "C3.1": {
        level: 2,
        evidence: "situation",
        cvQuote: "Split release testing into a plan the team could follow.",
      },
      "C1.2": { level: 1, evidence: "declared" },
      "J.SQL": {
        level: 2,
        evidence: "situation",
        cvQuote:
          "Checked test results in SQL against the expected database state.",
      },
      "J.DATA_ANALYSIS": {
        level: 1,
        evidence: "declared",
        cvQuote: "Online course in data analysis completed in 2026.",
      },
      "J.DASHBOARD": { level: 1, evidence: "declared" },
      "J.TESTING": { level: 3, evidence: "declared" },
      "C4.3": { level: 2, evidence: "declared" },
      "C4.1": { level: 2, evidence: "declared" },
      "C5.2": { level: 2, evidence: "declared" },
    },
  },
];
