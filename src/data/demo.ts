/**
 * Synthetic demo data. No real person or company.
 * Two needs at one Espoo matchmaking event, and six talent cards.
 */
import type { Need, Talent } from "@/lib/scoring";

export const EVENT = {
  id: "espoo-tech-matchmaking",
  name: "Espoo Tech Matchmaking",
  format: "In person and online",
};

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
        reason: "We need someone resourceful who can make sense of a vague bug report from a customer.",
        example: "Turns a bug a customer describes vaguely into a case the team can reproduce.",
      },
      {
        skill: "C4.1",
        major: true,
        expected: 2,
        reason: "They'll work in a team of five, next to the hardware engineers.",
        example: "Agrees on an interface with the hardware team and keeps the others informed.",
      },
      {
        skill: "C5.2",
        major: true,
        expected: 2,
        reason: "We have a lot of in-house tools that nobody documented.",
        example: "Figures out an undocumented build tool alone and writes down how it works.",
      },
      {
        skill: "C2.2",
        major: false,
        expected: 1,
        reason: "Firmware has to follow our coding rules before it ships.",
        example: "Runs the code checker and fixes what it reports before asking for a review.",
      },
      {
        skill: "J.EMBEDDED_C",
        major: false,
        expected: 2,
        reason: "They'll be writing firmware for our sensor boards from week one.",
        example: "Writes and debugs a driver for a new sensor on their own, following our coding rules.",
      },
      {
        skill: "J.PROTOCOLS",
        major: false,
        expected: 1,
        reason: "Our boards talk over SPI and CAN. They'll pick it up with us.",
        example: "Reads an SPI frame with a logic analyser, with a colleague's help.",
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
        skill: "C1.1",
        major: true,
        expected: 2,
        reason: "Customers often can't describe what is wrong.",
        example: "On a call, finds out what the customer was actually trying to do before the error appeared.",
      },
      {
        skill: "C5.3",
        major: true,
        expected: 2,
        reason: "They write the answers our customers read.",
        example: "Writes a reply a non-technical customer can follow step by step.",
      },
      {
        skill: "C4.3",
        major: true,
        expected: 2,
        reason: "We want people who follow a ticket until the customer is happy.",
        example: "Comes back to a customer two days later to check the fix held.",
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
        reason: "Most of the job is finding why something breaks for a user.",
        example: "Finds the cause of a user's sync error from the logs, without escalating.",
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
      "Organised workshops for 30 new members.",
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
      "C4.1": { level: 2, evidence: "declared", cvQuote: "President of the Otaniemi student robotics club (2 years)." },
      "J.PROTOCOLS": { level: null, cvQuote: "Connected sensors to the robot's main board." },
      "C5.2": { level: 1, evidence: "declared" },
      "C1.1": { level: 1, evidence: "declared" },
      "C5.3": { level: 2, evidence: "situation", cvQuote: "Organised workshops for 30 new members." },
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
      "MSc in applied physics.",
    ].join("\n"),
    statements: {
      "C5.1": { level: 3, evidence: "situation", cvQuote: "Wrote the analysis plan for a noisy measurement campaign." },
      "C4.1": { level: 2, evidence: "declared" },
      "C5.2": { level: 2, evidence: "supported", cvQuote: "Taught myself Rust to rewrite the lab's data pipeline.", link: "https://example.org/lab-pipeline" },
      "C1.1": { level: 2, evidence: "declared" },
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
      "BSc in computer engineering.",
    ].join("\n"),
    statements: {
      "J.EMBEDDED_C": { level: 2, evidence: "situation", cvQuote: "Developed drivers in C for temperature sensors over SPI and I2C." },
      "C5.1": { level: 2, evidence: "declared" },
      "C4.1": { level: 1, evidence: "declared" },
      "J.PROTOCOLS": { level: 2, evidence: "declared", cvQuote: "Developed drivers in C for temperature sensors over SPI and I2C." },
      "C5.2": { level: 2, evidence: "declared" },
      "J.LINUX": { level: 3, evidence: "declared", cvQuote: "Automated test benches with Python on Linux." },
      "J.PYTHON": { level: 2, evidence: "declared" },
      "C1.1": { level: 1, evidence: "declared" },
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
      "IT helpdesk agent, logistics company (3 years).",
      "First point of contact for 400 employees, phone and chat.",
      "Wrote the internal FAQ used by the whole support team.",
    ].join("\n"),
    statements: {
      "C1.1": { level: 3, evidence: "situation", cvQuote: "First point of contact for 400 employees, phone and chat." },
      "C5.3": { level: 2, evidence: "supported", cvQuote: "Wrote the internal FAQ used by the whole support team.", link: "https://example.org/faq" },
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
      "Career change towards tech support.",
    ].join("\n"),
    statements: {
      "C5.3": { level: 3, evidence: "declared" },
      "C1.1": { level: 2, evidence: "declared" },
      "C4.1": { level: 3, evidence: "situation", cvQuote: "Coordinated a team of 8 teachers for a new curriculum." },
      "C5.2": { level: 3, evidence: "situation", cvQuote: "Learned Python online and built grading scripts for colleagues." },
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
    cv: ["Freelance web developer.", "Python and JavaScript."].join("\n"),
    statements: {
      "J.PYTHON": { level: 2, evidence: "declared" },
      "C4.3": { level: 2, evidence: "declared" },
      "C5.3": { level: 2, evidence: "declared" },
    },
  },
];
