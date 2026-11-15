import { cleanExercise } from "@/lib/ai-proposals";
import { generateFeedback } from "@/lib/server/exercise-feedback";
import { checkExercise } from "@/lib/verification";
import type { ExpectedLevel } from "@/lib/framework";
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
      if (data.level !== undefined)
        checkExercise(skill, data.level as ExpectedLevel);
      else exerciseFor(skill);
    } catch {
      throw new ServiceError("Unknown component.");
    }
    limitCalls("ai", request);
    return noStore(
      await generateFeedback(
        skill,
        answer,
        fetch,
        data.level as ExpectedLevel | undefined,
        data.exercise
          ? cleanExercise(data.exercise, skill, data.level as ExpectedLevel)
          : undefined,
      ),
    );
  } catch (e) {
    return failure(e);
  }
}
