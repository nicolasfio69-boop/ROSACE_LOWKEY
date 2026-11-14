import { collectCompany } from "@/lib/server/company";
import {
  failure,
  field,
  limitCalls,
  noStore,
  readRequest,
} from "@/lib/server/http";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const data = await readRequest(request);
    const url = field(data, "url", 2000);
    limitCalls("company");
    return noStore(await collectCompany(url));
  } catch (error) {
    return failure(error);
  }
}
