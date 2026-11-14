import { noStore } from "@/lib/server/http";
import { aiStatus } from "@/lib/server/ai";
export const dynamic = "force-dynamic";
export async function GET() {
  const status = aiStatus();
  return noStore({
    context: !!process.env.CONTEXT_DEV_API_KEY,
    ai: status.configured,
    provider: status.provider,
  });
}
