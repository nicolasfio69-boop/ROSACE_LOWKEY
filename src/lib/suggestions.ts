/**
 * Suggestions per need, prepared for the organiser to approve.
 *
 * No AI and no optimisation: talents whose card covers enough of the need and who
 * reach at least Foundation on one major requirement are sorted by declared alignment.
 * The tool never breaks a tie at the cut: tied talents are handed to the organiser.
 */
import { align, type Alignment, type Need, type Talent } from "./scoring";

export type NeedSuggestions = {
  need: Need;
  suggested: Alignment[];
  /** Tied for the last places: the organiser chooses. */
  tied: Alignment[];
  /** Eligible but below the cut. */
  others: Alignment[];
  /** Not eligible: card not filled in enough, or no major requirement reached. */
  ineligible: Alignment[];
};

export function isEligible(alignment: Alignment): boolean {
  const reachesAMajor = alignment.rows.some((row) => row.requirement.major && (row.level ?? 0) >= 1);
  return alignment.complete && reachesAMajor;
}

function byPointsThenName(talents: Map<string, Talent>) {
  return (a: Alignment, b: Alignment) =>
    b.points - a.points ||
    (talents.get(a.talentId)?.pseudonym ?? "").localeCompare(talents.get(b.talentId)?.pseudonym ?? "");
}

export function suggestForNeed(need: Need, talents: Talent[]): NeedSuggestions {
  const index = new Map(talents.map((t) => [t.id, t]));
  const all = talents.map((talent) => align(need, talent));
  const eligible = all.filter(isEligible).sort(byPointsThenName(index));
  const ineligible = all.filter((a) => !isEligible(a)).sort(byPointsThenName(index));

  if (eligible.length <= need.capacity) {
    return { need, suggested: eligible, tied: [], others: [], ineligible };
  }

  const cutPoints = eligible[need.capacity - 1].points;
  const firstOutPoints = eligible[need.capacity].points;
  if (cutPoints !== firstOutPoints) {
    return {
      need,
      suggested: eligible.slice(0, need.capacity),
      tied: [],
      others: eligible.slice(need.capacity),
      ineligible,
    };
  }

  return {
    need,
    suggested: eligible.filter((a) => a.points > cutPoints),
    tied: eligible.filter((a) => a.points === cutPoints),
    others: eligible.filter((a) => a.points < cutPoints),
    ineligible,
  };
}

export type NoSuggestionReason = "card_too_sparse" | "no_major_reached" | "outranked";

export const NO_SUGGESTION_LABELS: Record<NoSuggestionReason, string> = {
  card_too_sparse: "Card not filled in enough for any need",
  no_major_reached: "No major requirement reached for any need",
  outranked: "Eligible, but other talents are better aligned",
};

/** Talents with no suggestion at all, with the reason shown to the organiser. */
export function withoutSuggestion(
  results: NeedSuggestions[],
  talents: Talent[],
): { talent: Talent; reason: NoSuggestionReason }[] {
  const placed = new Set(results.flatMap((r) => [...r.suggested, ...r.tied].map((a) => a.talentId)));
  return talents
    .filter((talent) => !placed.has(talent.id))
    .map((talent) => {
      const mine = results.map((r) => [...r.others, ...r.ineligible].find((a) => a.talentId === talent.id)!);
      let reason: NoSuggestionReason;
      if (mine.some(isEligible)) reason = "outranked";
      else if (mine.every((a) => !a.complete)) reason = "card_too_sparse";
      else reason = "no_major_reached";
      return { talent, reason };
    });
}
