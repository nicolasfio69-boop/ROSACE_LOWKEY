import {
  COMPONENTS,
  JOB_SKILLS,
  SKILL_CODES,
  type LevelValue,
} from "./framework";
import type { Talent } from "./scoring";

const PATTERNS: Record<string, RegExp> = {
  "C1.1": /listen|interview|stakeholder|customer needs|écout|besoin client/i,
  "C1.2": /present|proposal|pitch|propos|présent/i,
  "C2.1":
    /standard|compliance|regulat|conform|norme|privacy|data protection|gdpr|coding rules|misra/i,
  "C2.2": /test|quality|review|qualité|revue/i,
  "C3.1": /project|plan|scope|deadline|projet|livrable/i,
  "C3.2":
    /retrospective|lessons|knowledge.shar|rétrospective|retour d.expérience/i,
  "C4.1": /team|collaborat|équipe|coordonn/i,
  "C4.2": /reflect|adjust|assumption|réflex|remise en question/i,
  "C4.3":
    /ownership|initiative|volunteer|responsabil|commitment|on time|would slip|flagged/i,
  "C5.1": /analys|problem|debug|diagnos|problème/i,
  "C5.2": /learn|self.taught|appris|autodidact/i,
  "C5.3": /communicat|document|report|rapport/i,
  "J.EMBEDDED_C":
    /embedded|microcontroller|firmware|embarqué|microcontrôleur|\bC\b/,
  "J.PROTOCOLS": /\b(UART|SPI|I2C|CAN)\b/i,
  "J.TROUBLESHOOT": /troubleshoot|support|reported issue|dépann/i,
  "J.LINUX": /linux|command.line|shell|terminal/i,
  "J.PYTHON": /python/i,
  "J.RTOS": /\brtos\b|freertos|zephyr/i,
  "J.HW_DEBUG": /oscilloscope|logic analy[sz]er|debugger|jtag/i,
  "J.DATASHEET": /datasheet|schematic/i,
  "J.GIT": /\bgit\b|github|gitlab|pull request/i,
  "J.WEB_BACKEND": /backend|back-end|\bapi\b|node\.?js|django/i,
  "J.WEB_FRONTEND": /react|typescript|javascript|frontend|front-end|website/i,
  "J.TESTING": /automated (regression )?tests?|unit tests?|regression tests?|test automation|testing tools/i,
  "J.SQL": /\bsql\b|postgres|mysql/i,
  "J.DATA_ANALYSIS": /pandas|notebook|dataset|cleaned .*data|excel/i,
  "J.ML": /machine.learning|\bml model/i,
  "J.DASHBOARD": /power bi|dashboard|grafana|tableau/i,
  "J.NETWORK": /network|wi-?fi|\bdns\b|\bvpn\b/i,
  "J.CLOUD": /docker|kubernetes|ci\/cd|\baws\b|azure/i,
};
export function spotSkills(text: string): Record<string, string> {
  const sentences = text
    .slice(0, 30000)
    .split(/\n|(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return Object.fromEntries(
    [...COMPONENTS, ...JOB_SKILLS].flatMap((c) => {
      const quote = sentences.find((sentence) =>
        PATTERNS[c.code]?.test(sentence),
      );
      return quote ? [[c.code, quote.slice(0, 500)]] : [];
    }),
  );
}
export type Answers = {
  done: "yes" | "no" | "";
  autonomy: "help" | "alone" | "";
  complexity: "simple" | "new" | "";
};
export function suggestLevel(answers: Answers): LevelValue | null {
  if (answers.done === "no") return 0;
  if (answers.done !== "yes" || !answers.autonomy || !answers.complexity)
    return null;
  if (answers.autonomy === "help") return 1;
  return answers.complexity === "new" ? 3 : 2;
}
export function makeTalent(
  levels: Record<string, LevelValue>,
  pseudonym: string,
): Talent {
  if (!pseudonym.trim() || Object.keys(levels).length === 0)
    throw new Error("Confirm at least one component and enter a demo name.");
  if (
    Object.entries(levels).some(
      ([code, level]) =>
        !SKILL_CODES.has(code) || ![0, 1, 2, 3].includes(level),
    )
  )
    throw new Error("Invalid skill or level.");
  return {
    id: "local-talent",
    pseudonym: pseudonym.trim().slice(0, 80),
    cv: "",
    statements: Object.fromEntries(
      Object.entries(levels).map(([code, level]) => [
        code,
        { level, evidence: "declared" },
      ]),
    ),
  };
}
