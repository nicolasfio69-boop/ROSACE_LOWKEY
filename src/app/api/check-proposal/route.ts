import { proposeExercise } from "@/lib/server/ai-proposals";
import { reviewedContext } from "@/lib/server/reviewed-context";
import {
  failure,
  field,
  limitCalls,
  noStore,
  readRequest,
  ServiceError,
} from "@/lib/server/http";
import type { ExpectedLevel } from "@/lib/framework";
import { CHECK_SKILLS } from "@/lib/verification";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const data = await readRequest(request),
      { title, sources } = reviewedContext(data),
      skill = field(data, "skill", 30);
    if (
      !CHECK_SKILLS.some((s) => s === skill) ||
      ![1, 2, 3].includes(data.level as number)
    )
      throw new ServiceError("Unknown exercise or level.");
    limitCalls("ai", request);
    return noStore(
      await proposeExercise(skill, data.level as ExpectedLevel, title, sources),
    );
  } catch (e) {
    return failure(e);
  }
}
