import { descriptor, LEVELS, type ExpectedLevel } from "@/lib/framework";
import { levelExample, type NeedDraft } from "@/lib/need-draft";
import { jobScenario } from "@/data/job-scenarios";
export function LevelCards({
  skill,
  value,
  onChange,
  examples,
  jobTitle = "",
}: {
  skill: string;
  value?: ExpectedLevel;
  onChange: (level: ExpectedLevel) => void;
  examples?: Record<ExpectedLevel, string>;
  jobTitle?: string;
}) {
  const empty: Pick<NeedDraft, "title" | "context"> = {
    title: "",
    context: { task: "", audience: "", outcome: "", challenge: "" },
  };
  return (
    <div className="level-grid">
      {([1, 2, 3] as const).map((level) => (
        <article
          key={level}
          className={`level-card ${value === level ? "selected-level" : ""}`}
        >
          <div className="level-card-top">
            <span className="level-bars" aria-hidden="true">
              {[1, 2, 3].map((n) => (
                <i key={n} className={n <= level ? "lit" : ""} />
              ))}
            </span>
            <input
              aria-label={LEVELS[level].name}
              id={`level-${skill}-${level}`}
              type="radio"
              name={`level-${skill}`}
              checked={value === level}
              onChange={() => onChange(level)}
            />
          </div>
          <h3>
            <span className="level-number">0{level}</span>
            <label htmlFor={`level-${skill}-${level}`}>
              {LEVELS[level].name}
            </label>
          </h3>
          <p className="autonomy-label">
            {
              ["With a colleague", "Independently", "Through new complexity"][
                level - 1
              ]
            }
          </p>
          <div className="example-block">
            <span>{examples ? "REVIEWED SUGGESTION" : "IN PRACTICE"}</span>
            <p>
              {examples?.[level] ??
                jobScenario(skill, level, jobTitle) ??
                levelExample(skill, level, empty)}
            </p>
          </div>
          <details className="descriptor-details">
            <summary>Framework descriptor</summary>
            <p>{descriptor(skill, level)}</p>
          </details>
        </article>
      ))}
    </div>
  );
}
