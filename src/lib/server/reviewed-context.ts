import { field, ServiceError } from "./http";
import type { Source } from "../context";
export function reviewedContext(data: Record<string, unknown>) {
  if (data.reviewed !== true)
    throw new ServiceError(
      "Review the fictional company and job context before sending it to Claude.",
    );
  const title = field(data, "title", 120),
    job = field(data, "job", 16000),
    company = field(data, "company", 16000, true),
    task = field(data, "task", 1000, true);
  const sources: Source[] = [
    { id: "job", title: "Recruiter-reviewed job context", text: job },
  ];
  if (company)
    sources.push({
      id: "company",
      title: "Recruiter-reviewed company context",
      text: company,
    });
  return { title, task, sources };
}
