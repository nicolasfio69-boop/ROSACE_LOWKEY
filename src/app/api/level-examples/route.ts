import { generateExamples } from "@/lib/server/gemini";
import {
  failure,
  field,
  limitCalls,
  noStore,
  readRequest,
  ServiceError,
} from "@/lib/server/http";
import type { Source } from "@/lib/context";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const data = await readRequest(request);
    if (data.reviewed !== true)
      throw new ServiceError("Review the context before using it with Gemini.");
    const skill = field(data, "skill", 30),
      title = field(data, "title", 120),
      task = field(data, "task", 1000, true);
    const job = field(data, "job", 16000),
      company = field(data, "company", 16000, true);
    const sources: Source[] = [
      { id: "job", title: "Recruiter-reviewed job description", text: job },
    ];
    if (company)
      sources.push({
        id: "company",
        title: "Recruiter-reviewed company context",
        text: company,
      });
    limitCalls("gemini");
    return noStore(await generateExamples(skill, title, task, sources));
  } catch (error) {
    return failure(error);
  }
}
