import { generateFeedback } from "@/lib/server/exercise-feedback";
import { exerciseFor } from "@/lib/exercises";
import {
  failure,
  field,
  limitCalls,
  noStore,
  readRequest,
  ServiceError,
} from "@/lib/server/http";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const data = await readRequest(request);
    if (data.consent !== true)
      throw new ServiceError(
        "Confirm before sending your practice answer to the configured AI provider.",
      );
    const skill = field(data, "skill", 30),
      answer = field(data, "answer", 6000);
    try {
      exerciseFor(skill);
    } catch {
      throw new ServiceError("Unknown component.");
    }
    limitCalls("ai");
    return noStore(await generateFeedback(skill, answer));
  } catch (e) {
    return failure(e);
  }
}
