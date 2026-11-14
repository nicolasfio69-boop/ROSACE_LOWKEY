"use client";
import { BackgroundBeams } from "./BackgroundBeams";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SkillBars } from "./SkillBars";
import { Rosace } from "./Rosace";
import { WorkspaceIcon } from "./WorkspaceIcon";
import { NEEDS, TALENTS } from "@/data/demo";
import {
  isComponent,
  LEVELS,
  skillName,
  type LevelValue,
} from "@/lib/framework";
import { OBSERVATION_LABELS, type Observation } from "@/lib/scoring";
import {
  NO_SUGGESTION_LABELS,
  suggestForNeed,
  withoutSuggestion,
} from "@/lib/suggestions";
import { meanObservedValue } from "@/lib/observations";
import { prepareConversation } from "@/lib/conversation";

/*
 * A 3-minute guided demo of the whole event, on fictional data, read only.
 * Nothing is saved. Each step uses the real scoring and suggestion code.
 */

const NEED = NEEDS[0];
const TALENT = TALENTS.find((t) => t.id === "amira") ?? TALENTS[0];

const STEPS = [
  {
    who: "Recruiter",
    title: "NordChip says what really matters.",
    text: "The recruiter picks 3 major Centrale components, in gold, and the level they expect. Technical skills sit next to them.",
    look: "The 3 gold branches arrive last and sit on top.",
  },
  {
    who: "Talent",
    title: "Amira turns her CV into a skills card.",
    text: "Sentences of her CV suggest skills. She confirms each level herself. Dotted means declared, not proven.",
    look: "Amira never sees a rank or a score, only her own rosace.",
  },
  {
    who: "Organiser",
    title: "The organiser sees who to meet, and why.",
    text: "Suggestions come with their reasons. Ties at the cut and people without a suggestion are shown, never hidden.",
    look: "Nothing is sent until a person approves it.",
  },
  {
    who: "Recruiter",
    title: "The conversation checks what was declared.",
    text: "Questions start where the card is weakest. After the meeting, the recruiter notes what they saw, on the Centrale grid.",
    look: "Click an answer: the observed rosace fills in, solid, next to the declared one.",
  },
] as const;

/** Reveals items one by one, majors last, unless the person prefers less motion. */
function useReveal(count: number, active: boolean, delay = 260) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (!active) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) {
      setShown(count);
      return;
    }
    setShown(0);
    let n = 0;
    const id = window.setInterval(() => {
      n += 1;
      setShown(n);
      if (n >= count) window.clearInterval(id);
    }, delay);
    return () => window.clearInterval(id);
  }, [count, active, delay]);
  return shown;
}

function NeedStep() {
  const components = NEED.requirements
    .filter((r) => isComponent(r.skill))
    .sort((a, b) => Number(a.major) - Number(b.major));
  const shown = useReveal(components.length, true, 380);
  const expected = Object.fromEntries(
    components
      .slice(0, shown)
      .map((r) => [r.skill, { level: r.expected, major: r.major }]),
  );
  const majors = NEED.requirements.filter((r) => r.major);
  const jobSkills = NEED.requirements.filter((r) => !isComponent(r.skill));
  return (
    <div className="tour-scene">
      <figure className="tour-rosace">
        <figcaption>
          {NEED.company} · {NEED.title}
        </figcaption>
        <Rosace
          size={400}
          labels="short"
          expected={expected}
          majors={majors.map((r) => r.skill)}
        />
        <SkillBars
          items={jobSkills.map((r) => ({
            code: r.skill,
            expected: r.expected,
          }))}
        />
      </figure>
      <div className="tour-cards">
        {majors.map((r, i) => (
          <article
            className="tour-card major"
            key={r.skill}
            style={{ animationDelay: `${1.2 + i * 0.15}s` }}
          >
            <span>Major · expects {LEVELS[r.expected as LevelValue].name}</span>
            <strong>{skillName(r.skill)}</strong>
            <p>“{r.reason}”</p>
          </article>
        ))}
        {jobSkills.map((r, i) => (
          <article
            className="tour-card"
            key={r.skill}
            style={{ animationDelay: `${1.65 + i * 0.15}s` }}
          >
            <span>
              Technical skill · expects {LEVELS[r.expected as LevelValue].name}
            </span>
            <strong>{skillName(r.skill)}</strong>
          </article>
        ))}
      </div>
    </div>
  );
}

function TalentStep() {
  const declaredSkills = Object.entries(TALENT.statements).filter(
    ([skill, s]) => isComponent(skill) && s.level !== null,
  );
  const shown = useReveal(declaredSkills.length, true, 220);
  const declared = Object.fromEntries(
    declaredSkills.slice(0, shown).map(([skill, s]) => [skill, s.level]),
  );
  const quotes = Object.entries(TALENT.statements).filter(([, s]) => s.cvQuote);
  return (
    <div className="tour-scene">
      <div className="tour-cards">
        <p className="tour-label">From the CV · {TALENT.pseudonym}</p>
        {quotes.map(([skill, s], i) => (
          <article
            className="tour-card quote"
            key={skill}
            style={{ animationDelay: `${0.2 + i * 0.2}s` }}
          >
            <p>“{s.cvQuote}”</p>
            <span>
              Suggests: <strong>{skillName(skill)}</strong>
              {s.level !== null
                ? ` · she declares ${LEVELS[s.level].name}`
                : " · no level yet, a question for the recruiter"}
            </span>
          </article>
        ))}
      </div>
      <figure className="tour-rosace">
        <figcaption>{TALENT.pseudonym}’s card · declared, dotted</figcaption>
        <Rosace size={400} labels="short" declared={declared} majors={[]} />
      </figure>
    </div>
  );
}

function OrganiserStep() {
  const results = useMemo(
    () => NEEDS.map((n) => suggestForNeed(n, TALENTS)),
    [],
  );
  const mine = results[0];
  const without = withoutSuggestion(results, TALENTS);
  const [approved, setApproved] = useState<string[]>([]);
  const name = (id: string) =>
    TALENTS.find((t) => t.id === id)?.pseudonym ?? id;
  return (
    <div className="tour-scene single">
      <div className="tour-cards wide">
        <p className="tour-label">
          {NEED.company} wants to meet {NEED.capacity} people
        </p>
        {mine.suggested.map((a, i) => {
          const missing = a.missingMajors.map(skillName);
          return (
            <article
              className="tour-card row"
              key={a.talentId}
              style={{ animationDelay: `${0.15 + i * 0.25}s` }}
            >
              <span className="tour-avatar">{name(a.talentId)[0]}</span>
              <div>
                <strong>{name(a.talentId)}</strong>
                <p>
                  {a.points}/{a.max} points of the need · covers{" "}
                  {a.coveredWeight}/{a.totalWeight} of what is asked
                  {missing.length
                    ? ` · to check: ${missing.join(", ")}`
                    : " · every major reached"}
                </p>
              </div>
              <button
                type="button"
                className={
                  approved.includes(a.talentId)
                    ? "tour-approve done"
                    : "tour-approve"
                }
                onClick={() =>
                  setApproved((list) =>
                    list.includes(a.talentId)
                      ? list.filter((x) => x !== a.talentId)
                      : [...list, a.talentId],
                  )
                }
              >
                {approved.includes(a.talentId) ? "Approved ✓" : "Approve"}
              </button>
            </article>
          );
        })}
        <p className="tour-label" style={{ marginTop: 18 }}>
          People without a suggestion, shown to the organiser
        </p>
        {without.map(({ talent, reason }, i) => (
          <article
            className="tour-card row muted"
            key={talent.id}
            style={{ animationDelay: `${0.9 + i * 0.2}s` }}
          >
            <span className="tour-avatar">{talent.pseudonym[0]}</span>
            <div>
              <strong>{talent.pseudonym}</strong>
              <p>{NO_SUGGESTION_LABELS[reason]}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

const ANSWERS: Observation[] = ["A", "C", "F", "NE"];

function ConversationStep() {
  const { questions } = useMemo(() => prepareConversation(NEED, TALENT), []);
  const [seen, setSeen] = useState<Record<string, Observation>>({});
  const onlineLevel = TALENT.statements["C5.1"]!.level!;
  const components = NEED.requirements.filter((r) => isComponent(r.skill));
  const declared = Object.fromEntries(
    components.map((r) => [r.skill, TALENT.statements[r.skill]?.level ?? null]),
  );
  const observedLevels = Object.fromEntries(
    components.map((r) => [
      r.skill,
      meanObservedValue(
        [
          ...(r.skill === "C5.1"
            ? [
                {
                  taskLevel: onlineLevel as 1 | 2 | 3,
                  observation: "A" as const,
                },
              ]
            : []),
          ...(seen[r.skill]
            ? [{ taskLevel: r.expected, observation: seen[r.skill] }]
            : []),
        ],
        r.expected,
      ),
    ]),
  );
  return (
    <div className="tour-scene convo">
      <div className="tour-cards">
        <article className="tour-card">
          <span>
            Online exercise · Graded by the recruiter · fictional example
          </span>
          <strong>Break down a problem · {LEVELS[onlineLevel].name}</strong>
          <p>
            Amira identified the missing facts in a sensor bug report. The
            recruiter marked A — Seen clearly at her declared task level. The
            solid branch starts at {onlineLevel}; further observations are
            averaged.
          </p>
          <Link href="/checks">Try the answer and review flow →</Link>
        </article>
        {questions
          .filter((q) => isComponent(q.skill))
          .slice(0, 3)
          .map((q, i) => (
            <article
              className="tour-card question"
              key={q.skill}
              style={{ animationDelay: `${0.15 + i * 0.2}s` }}
            >
              <span>
                {q.name} · declared {q.declared}, expected {q.expected}
              </span>
              <strong>{q.question}</strong>
              <div
                className="tour-answers"
                role="group"
                aria-label={`What did you see for ${q.name}?`}
              >
                {ANSWERS.map((o) => (
                  <button
                    type="button"
                    key={o}
                    aria-pressed={seen[q.skill] === o}
                    onClick={() => setSeen((s) => ({ ...s, [q.skill]: o }))}
                  >
                    {OBSERVATION_LABELS[o]}
                  </button>
                ))}
              </div>
            </article>
          ))}
      </div>
      <div className="tour-pair">
        <figure className="tour-rosace small">
          <figcaption>Declared by Amira · dotted</figcaption>
          <Rosace
            size={340}
            labels="short"
            declared={declared}
            majors={NEED.requirements
              .filter((r) => r.major)
              .map((r) => r.skill)}
          />
        </figure>
        <figure className="tour-rosace small">
          <figcaption>Observed by the recruiter · solid</figcaption>
          <Rosace
            size={340}
            labels="short"
            observedLevels={observedLevels}
            majors={NEED.requirements
              .filter((r) => r.major)
              .map((r) => r.skill)}
          />
        </figure>
      </div>
    </div>
  );
}

export function GuidedDemo() {
  const [step, setStep] = useState(0);
  const last = STEPS.length - 1;
  const current = STEPS[step];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
        return;
      if (e.key === "ArrowRight") setStep((s) => Math.min(last, s + 1));
      if (e.key === "ArrowLeft") setStep((s) => Math.max(0, s - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [last]);

  return (
    <div className="tour">
      <nav className="tour-steps" aria-label="Demo steps">
        {STEPS.map((s, i) => (
          <button
            type="button"
            key={i}
            aria-current={i === step ? "step" : undefined}
            className={i < step ? "past" : undefined}
            onClick={() => setStep(i)}
          >
            <span>{i + 1}</span>
            {s.who}
          </button>
        ))}
        <i style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
      </nav>

      <section className="tour-body" key={step} aria-live="polite">
        <header className="tour-head">
          <BackgroundBeams />
          <h1>{current.title}</h1>
          <p className="tour-progress-label">
            STEP {step + 1} OF {STEPS.length} · {current.who.toUpperCase()}
          </p>
          <p>{current.text}</p>
          <p className="tour-look">
            <span className="status-dot" /> {current.look}
          </p>
        </header>
        {step === 0 && <NeedStep />}
        {step === 1 && <TalentStep />}
        {step === 2 && <OrganiserStep />}
        {step === 3 && <ConversationStep />}
      </section>

      <footer className="tour-nav">
        <button
          type="button"
          className="secondary-button"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
        >
          ← Back
        </button>
        <small>Fictional data · nothing is saved · use ← → keys</small>
        {step < last ? (
          <button
            type="button"
            className="primary-button"
            onClick={() => setStep((s) => Math.min(last, s + 1))}
          >
            Next: {STEPS[step + 1].who.toLowerCase()}{" "}
            <WorkspaceIcon name="arrow" />
          </button>
        ) : (
          <Link className="primary-button" href="/need/new">
            Try it with your own role <WorkspaceIcon name="arrow" />
          </Link>
        )}
      </footer>
    </div>
  );
}
