import { Logo } from "@/components/Logo";
import { Rosace } from "@/components/Rosace";
import { EVENT, NEEDS, TALENTS } from "@/data/demo";
import { isComponent, JOB_SKILLS, LEVELS, skillName } from "@/lib/framework";
import { weightOf, type Alignment, type Need, type Requirement, type Talent } from "@/lib/scoring";
import { NO_SUGGESTION_LABELS, suggestForNeed, withoutSuggestion } from "@/lib/suggestions";

export default function Overview() {
  const results = NEEDS.map((need) => suggestForNeed(need, TALENTS));
  const missing = withoutSuggestion(results, TALENTS);
  const pseudonym = (id: string) => TALENTS.find((t) => t.id === id)?.pseudonym ?? id;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Logo size={44} />
          <p className="text-sm text-muted">{EVENT.name} · {EVENT.format}</p>
        </div>
        <h1 className="mt-4 text-3xl font-semibold">Prepare the right conversations</h1>
        <p className="mt-2 max-w-2xl text-muted">
          We turn claims into questions you can check during the conversation. Overview of the demo data and of the
          suggestions the organiser approves.
        </p>
        <Legend />
      </header>

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold">Company needs and suggestions</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {results.map((result) => (
            <article key={result.need.id} className="rounded-lg border border-line bg-white p-4">
              <NeedHeader need={result.need} />
              <Rosace expected={expectedOf(result.need)} size={300} labels="short" />
              <Requirements need={result.need} />
              <h4 className="mt-4 text-sm font-semibold">Suggested to meet</h4>
              <AlignmentList items={result.suggested} name={pseudonym} />
              {result.tied.length > 0 ? (
                <>
                  <h4 className="mt-3 text-sm font-semibold text-brand">Tied for the last place: the organiser chooses</h4>
                  <AlignmentList items={result.tied} name={pseudonym} />
                </>
              ) : null}
              {result.others.length > 0 ? (
                <>
                  <h4 className="mt-3 text-sm font-semibold text-muted">Eligible, below the cut</h4>
                  <AlignmentList items={result.others} name={pseudonym} />
                </>
              ) : null}
              {result.ineligible.length > 0 ? (
                <>
                  <h4 className="mt-3 text-sm font-semibold text-muted">Card not filled in enough for this need</h4>
                  <AlignmentList items={result.ineligible} name={pseudonym} />
                </>
              ) : null}
            </article>
          ))}
        </div>

        <div className="mt-6 rounded-lg border border-line bg-white p-4">
          <h3 className="font-semibold">Talents without any suggestion</h3>
          <p className="text-sm text-muted">The organiser sees them before approving, and can add them with a reason.</p>
          <ul className="mt-2 space-y-1 text-sm">
            {missing.map(({ talent, reason }) => (
              <li key={talent.id}>
                <span className="font-medium">{talent.pseudonym}</span>: {NO_SUGGESTION_LABELS[reason]}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Talent cards</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TALENTS.map((talent) => (
            <TalentCard key={talent.id} talent={talent} />
          ))}
        </div>
      </section>
    </main>
  );
}

function Legend() {
  return (
    <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted">
      <li><span className="font-semibold text-gold-ink">Gold</span>: the three majors, drawn on top</li>
      <li><span className="font-semibold text-brand">Red</span>: the other components</li>
      <li>Dotted bar: declared by the talent</li>
      <li>Solid bar: observed by a recruiter, or expected by the company</li>
      <li>Grey disk: Foundation · inner ring: Intermediate · outer ring: Advanced</li>
      <li>Empty branch: not filled in</li>
    </ul>
  );
}

function expectedOf(need: Need) {
  return Object.fromEntries(
    need.requirements.filter((r) => isComponent(r.skill)).map((r) => [r.skill, { level: r.expected, major: r.major }]),
  );
}

function NeedHeader({ need }: { need: Need }) {
  return (
    <div className="mb-2">
      <p className="text-sm text-muted">{need.company}</p>
      <h3 className="text-lg font-semibold">{need.title}</h3>
      <p className="text-sm text-muted">Wants to meet {need.capacity} people</p>
    </div>
  );
}

function Requirements({ need }: { need: Need }) {
  const majors = need.requirements.filter((r) => isComponent(r.skill) && r.major);
  const minors = need.requirements.filter((r) => isComponent(r.skill) && !r.major);
  const jobSkills = need.requirements.filter((r) => !isComponent(r.skill));
  return (
    <div className="mt-2 space-y-3 text-sm">
      <RequirementGroup title="Three majors (gold)" items={majors} />
      <RequirementGroup title="Other components" items={minors} />
      <RequirementGroup title="Job skills, on top of the Centrale base" items={jobSkills} />
    </div>
  );
}

function RequirementGroup({ title, items }: { title: string; items: Requirement[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">{title}</h4>
      <ul className="mt-1 space-y-2">
        {items.map((r) => (
          <li key={r.skill}>
            <span className={r.major ? "font-semibold" : ""}>{skillName(r.skill)}</span>
            <span className="text-muted"> · weight {weightOf(r)} · expects {LEVELS[r.expected].name}</span>
            {r.reason ? <p className="text-muted italic">“{r.reason}”</p> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function AlignmentList({ items, name }: { items: Alignment[]; name: (id: string) => string }) {
  if (items.length === 0) return <p className="text-sm text-muted">Nobody yet.</p>;
  return (
    <ul className="mt-1 space-y-1 text-sm">
      {items.map((a) => (
        <li key={a.talentId}>
          <span className="font-medium">{name(a.talentId)}</span>
          <span> · {a.points} out of {a.max}</span>
          <span className="text-muted"> · {a.coveredWeight} of {a.totalWeight} weights filled in</span>
          {a.missingMajors.length + a.missingJobSkills.length > 0 ? (
            <span className="text-brand">
              {" "}· to check: {[...a.missingMajors, ...a.missingJobSkills].map(skillName).join(", ")}
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function TalentCard({ talent }: { talent: Talent }) {
  const declared = Object.fromEntries(
    Object.entries(talent.statements)
      .filter(([code]) => isComponent(code))
      .map(([code, s]) => [code, s.level]),
  );
  const jobSkills = JOB_SKILLS.filter((j) => talent.statements[j.code]);
  return (
    <article className="rounded-lg border border-line bg-white p-4">
      <Rosace declared={declared} size={260} title={talent.pseudonym} />
      {jobSkills.length > 0 ? (
        <ul className="mt-2 space-y-1 text-sm">
          {jobSkills.map((j) => {
            const s = talent.statements[j.code];
            return (
              <li key={j.code}>
                {j.name}: <span className="font-medium">{s.level === null ? "mentioned in CV, not detailed" : LEVELS[s.level].name}</span>
              </li>
            );
          })}
        </ul>
      ) : null}
    </article>
  );
}
