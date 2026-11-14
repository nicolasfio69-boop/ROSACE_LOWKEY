import { COMPONENTS, JOB_SKILLS, type ExpectedLevel } from "./framework";

export type Source = {
  id: string;
  title: string;
  text: string;
  url?: string;
  fetchedAt?: string;
};
export type Passage = {
  id: string;
  sourceId: string;
  title: string;
  text: string;
  url?: string;
};
export type LevelExamples = {
  examples: Record<ExpectedLevel, string>;
  sourceIds: string[];
};

/** Retrieve only reviewed job/company text. CVs never enter this corpus. */
export function retrievePassages(
  sources: Source[],
  skill: string,
  task: string,
  limit = 4,
): Passage[] {
  const component = [...COMPONENTS, ...JOB_SKILLS].find(
    (c) => c.code === skill,
  );
  if (!component) return [];
  const terms = new Set(
    `${component.name} ${component.activity} ${task}`
      .toLowerCase()
      .match(/[\p{L}\p{N}]{3,}/gu) ?? [],
  );
  const chunks = sources.flatMap((source) => {
    const text = source.text.slice(0, 16000);
    const passages: Passage[] = [];
    for (let i = 0; i < text.length; i += 700) {
      const chunk = text.slice(i, i + 900).trim();
      if (chunk)
        passages.push({
          id: `${source.id}:${passages.length + 1}`,
          sourceId: source.id,
          title: source.title,
          text: chunk,
          url: source.url,
        });
    }
    return passages;
  });
  return chunks
    .map((p, index) => ({
      p,
      index,
      score: [...terms].filter((t) => p.text.toLowerCase().includes(t)).length,
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map((x) => x.p);
}

export function validateExamples(
  value: unknown,
  passages: Passage[],
): LevelExamples {
  if (!value || typeof value !== "object")
    throw new Error("Invalid model response.");
  const data = value as Record<string, unknown>;
  if (!data.examples || typeof data.examples !== "object")
    throw new Error("Missing examples.");
  const examples = data.examples as Record<string, unknown>;
  for (const level of [1, 2, 3])
    if (
      typeof examples[level] !== "string" ||
      !(examples[level] as string).trim() ||
      (examples[level] as string).length > 1000
    )
      throw new Error("Invalid level example.");
  if (
    !Array.isArray(data.sourceIds) ||
    data.sourceIds.length < 1 ||
    data.sourceIds.some(
      (id) => typeof id !== "string" || !passages.some((p) => p.id === id),
    )
  )
    throw new Error("Unrecognised or missing source reference.");
  return {
    examples: {
      1: examples[1] as string,
      2: examples[2] as string,
      3: examples[3] as string,
    },
    sourceIds: data.sourceIds as string[],
  };
}
