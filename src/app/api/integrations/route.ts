import { noStore } from "@/lib/server/http";
export const dynamic = "force-dynamic";
export async function GET() {
  return noStore({
    context: !!process.env.CONTEXT_DEV_API_KEY,
    gemini: !!process.env.GEMINI_API_KEY && !!process.env.GEMINI_MODEL,
  });
}
