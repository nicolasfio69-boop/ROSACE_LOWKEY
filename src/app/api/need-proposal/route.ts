import { proposeRequirements } from "@/lib/server/ai-proposals";
import { reviewedContext } from "@/lib/server/reviewed-context";
import { failure, limitCalls, noStore, readRequest } from "@/lib/server/http";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const { title, task, sources } = reviewedContext(
      await readRequest(request),
    );
    limitCalls("ai");
    return noStore(await proposeRequirements(title, task, sources));
  } catch (e) {
    return failure(e);
  }
}
