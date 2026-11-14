"use client";
import { BackgroundBeams } from "./BackgroundBeams";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  COMPONENTS,
  JOB_FAMILIES,
  JOB_SKILLS,
  LEVELS,
  descriptor,
  isComponent,
  skillName,
  type LevelValue,
} from "@/lib/framework";
import {
  makeTalent,
  spotSkills,
  suggestLevel,
  type Answers,
} from "@/lib/talent-intake";
import { addTalent, loadWorkspace, removeTalent } from "@/lib/workspace";
import { LivePreview } from "./LivePreview";
import { DocumentInput } from "./DocumentInput";
import { JourneyRail } from "./JourneyRail";
import { Rosace } from "./Rosace";

const emptyAnswers: Answers = { done: "", autonomy: "", complexity: "" };
const sample =
  "I tested a fictional sensor prototype with a firmware team. I wrote Python scripts to analyse test reports and documented the results. I learned Linux tools and investigated intermittent bugs with a mentor.";
export function TalentForm() {
  const [step, setStep] = useState(0),
    [index, setIndex] = useState(0),
    [cv, setCv] = useState(""),
    [quotes, setQuotes] = useState<Record<string, string>>({}),
    [answers, setAnswers] = useState<Record<string, Answers>>({}),
    [levels, setLevels] = useState<Record<string, LevelValue>>({}),
    [overrides, setOverrides] = useState<Record<string, LevelValue>>({}),
    [name, setName] = useState("Demo talent"),
    [consent, setConsent] = useState(false),
    [saved, setSaved] = useState(false),
    [error, setError] = useState(""),
    [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const card = loadWorkspace(localStorage).talents.find(
        (item) => item.talent.id === "local-talent",
      );
      if (card) {
        const restored = Object.fromEntries(
          Object.entries(card.talent.statements).flatMap(([code, statement]) =>
            statement.level === null ? [] : [[code, statement.level]],
          ),
        ) as Record<string, LevelValue>;
        setLevels(restored);
        setOverrides(restored);
        setName(card.talent.pseudonym);
        setConsent(true);
        setSaved(true);
        setStep(2);
      }
    } catch {
      setError(
        "Your saved card could not be opened. Reload to try again; your existing data has not been replaced.",
      );
    } finally {
      setReady(true);
    }
  }, []);
  const [pinned, setPinned] = useState<string[]>([]);
  const jobInPath = JOB_SKILLS.filter(
    (j) =>
      quotes[j.code] || levels[j.code] !== undefined || pinned.includes(j.code),
  );
  const skills = [...COMPONENTS, ...jobInPath],
    skill = skills[Math.min(index, skills.length - 1)],
    response = answers[skill.code] ?? emptyAnswers,
    suggested = suggestLevel(response),
    selected = overrides[skill.code] ?? suggested;
  function answer(patch: Partial<Answers>) {
    setAnswers({ ...answers, [skill.code]: { ...response, ...patch } });
    setOverrides((previous) => {
      const next = { ...previous };
      delete next[skill.code];
      return next;
    });
    setLevels((previous) => {
      const next = { ...previous };
      delete next[skill.code];
      return next;
    });
    setSaved(false);
  }
  function confirmLevel() {
    if (selected === null) {
      setError(
        "Answer the three questions, or choose a level yourself, before confirming.",
      );
      return;
    }
    setLevels({ ...levels, [skill.code]: selected });
    setSaved(false);
    setError("");
    if (index < skills.length - 1) setIndex(index + 1);
    else setStep(2);
  }
  function save() {
    try {
      addTalent(localStorage, makeTalent(levels, name), consent);
      setSaved(true);
      setQuotes({});
      setCv("");
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the card.");
    }
  }
  if (!ready)
    return (
      <p className="loading-state" role="status">
        Opening your skills card…
      </p>
    );
  return (
    <div className="workspace talent-workspace">
      <div className="workspace-top">
        <Link href="/">← Home</Link>
        <span>Your skills · Your words · Your choice</span>
      </div>
      <ol className="stepper">
        {["Your experience", "Explore your skills", "Your card"].map((s, i) => (
          <li className={step === i ? "current-step" : ""} key={s}>
            <button type="button" onClick={() => setStep(i)}>
              <span>{i + 1}</span>
              <span>{s}</span>
            </button>
          </li>
        ))}
      </ol>
      {error && (
        <p role="alert" className="error-panel">
          {error}
        </p>
      )}
      <div className={`intake-layout ${step === 1 ? "with-rail" : ""}`}>
        {step === 1 && (
          <details className="component-navigator">
            <summary>
              Browse your skills{" "}
              <span>Twelve components + optional technical skills</span>
            </summary>
            <JourneyRail
              index={index}
              onSelect={setIndex}
              selected={Object.keys(levels)}
            />
            <div className="journey-rail">
              <p className="eyebrow">OPTIONAL TECHNICAL SKILLS</p>
              {JOB_FAMILIES.map((family) => (
                <div key={family.code}>
                  <p className="quiet-note">{family.name}</p>
                  {JOB_SKILLS.filter((j) => j.family === family.code).map(
                    (j) => (
                      <button
                        type="button"
                        key={j.code}
                        onClick={() => {
                          const path = [
                            ...COMPONENTS,
                            ...JOB_SKILLS.filter(
                              (x) =>
                                x.code === j.code ||
                                quotes[x.code] ||
                                levels[x.code] !== undefined ||
                                pinned.includes(x.code),
                            ),
                          ];
                          setPinned((p) =>
                            p.includes(j.code) ? p : [...p, j.code],
                          );
                          setIndex(path.findIndex((s) => s.code === j.code));
                        }}
                      >
                        {j.name}
                      </button>
                    ),
                  )}
                </div>
              ))}
            </div>
          </details>
        )}
        <section className="form-panel">
          {step === 0 && (
            <>
              <div className="step-heading">
                <BackgroundBeams />
                <h1>Build your skills card.</h1>
                <p>
                  Use a fictional CV for this demo, or start without one. A
                  mention suggests a question — it never assigns a level.
                </p>
              </div>
              <DocumentInput label="Import a synthetic CV" onText={setCv} />
              <label className="field-label">
                Paste CV text or describe an experience
                <textarea
                  rows={7}
                  maxLength={30000}
                  value={cv}
                  onChange={(e) => setCv(e.target.value)}
                />
              </label>
              <button
                type="button"
                className="secondary-button"
                onClick={() => setCv(sample)}
              >
                Use a fictional example
              </button>
              <p className="quiet-note">
                Your document is read on this device. It is not uploaded, saved
                or sent to any AI provider. The full text is cleared when you
                continue; short quotes remain only in this page’s memory while
                you review.
              </p>
              <div className="form-actions">
                <span className="quiet-note">
                  You can leave any component unanswered.
                </span>
                <button
                  className="primary-button"
                  onClick={() => {
                    setQuotes(spotSkills(cv));
                    setCv("");
                    setStep(1);
                    setError("");
                  }}
                >
                  Explore my skills →
                </button>
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <p className="eyebrow">
                {isComponent(skill.code)
                  ? `COMPONENT ${index + 1} / 12`
                  : `TECHNICAL SKILL ${index - 11} / ${jobInPath.length}`}{" "}
                · {skill.code}
              </p>
              <div className="step-heading">
                <BackgroundBeams />
                <h1>{skill.name}</h1>
                <p>Have you ever {skill.activity}?</p>
              </div>
              {quotes[skill.code] && (
                <blockquote className="source-passage">
                  <strong>A possible clue in your document</strong>
                  <p>“{quotes[skill.code]}”</p>
                  <small>
                    Confirm the skill only if this reflects what you actually
                    did.
                  </small>
                </blockquote>
              )}
              <fieldset className="question-set">
                <legend>1. Have you done this?</legend>
                {(
                  [
                    ["yes", "Yes, in a real task"],
                    ["no", "Not yet"],
                  ] as const
                ).map(([value, label]) => (
                  <label key={value}>
                    <input
                      type="radio"
                      name="done"
                      checked={response.done === value}
                      onChange={() => answer({ done: value })}
                    />
                    {label}
                  </label>
                ))}
              </fieldset>
              {response.done === "yes" && (
                <>
                  <fieldset className="question-set">
                    <legend>2. How independently?</legend>
                    {(
                      [
                        ["help", "With help or guidance"],
                        ["alone", "On my own"],
                      ] as const
                    ).map(([value, label]) => (
                      <label key={value}>
                        <input
                          type="radio"
                          name="autonomy"
                          checked={response.autonomy === value}
                          onChange={() => answer({ autonomy: value })}
                        />
                        {label}
                      </label>
                    ))}
                  </fieldset>
                  <fieldset className="question-set">
                    <legend>3. In what kind of situation?</legend>
                    {(
                      [
                        ["simple", "Simple or well-defined work"],
                        [
                          "new",
                          "New or complex work where others relied on me",
                        ],
                      ] as const
                    ).map(([value, label]) => (
                      <label key={value}>
                        <input
                          type="radio"
                          name="complexity"
                          checked={response.complexity === value}
                          onChange={() => answer({ complexity: value })}
                        />
                        {label}
                      </label>
                    ))}
                  </fieldset>
                </>
              )}
              <div className="role-context" aria-live="polite">
                <strong>
                  {suggested === null
                    ? "No level suggested yet"
                    : `Suggested level: ${LEVELS[suggested].name}`}
                </strong>
                <details className="level-rule">
                  <summary>How the suggestion works</summary>
                  <p className="quiet-note">
                    Written rule: not done → Not yet; with help → Foundation;
                    alone on defined work → Intermediate; alone in new or
                    complex work where others rely on you → Advanced. You can
                    correct the suggestion.
                  </p>
                </details>
              </div>
              <fieldset className="talent-levels">
                <legend>Your choice</legend>
                {([0, 1, 2, 3] as const).map((l) => (
                  <label key={l} className={selected === l ? "chosen" : ""}>
                    <input
                      type="radio"
                      name={`declared-${skill.code}`}
                      checked={selected === l}
                      onChange={() => {
                        setOverrides({ ...overrides, [skill.code]: l });
                        setSaved(false);
                      }}
                    />
                    <strong>{LEVELS[l].name}</strong>
                    <span>
                      {l === 0
                        ? LEVELS[0].definition
                        : descriptor(skill.code, l)}
                    </span>
                  </label>
                ))}
              </fieldset>
              <div className="form-actions">
                {Object.keys(levels).length > 0 && (
                  <button className="text-button" onClick={() => setStep(2)}>
                    Review my card ({Object.keys(levels).length})
                  </button>
                )}
                <button
                  className="secondary-button"
                  onClick={() => {
                    setLevels((previous) => {
                      const next = { ...previous };
                      delete next[skill.code];
                      return next;
                    });
                    setSaved(false);
                    setError("");
                    if (index < skills.length - 1) setIndex(index + 1);
                    else setStep(2);
                  }}
                >
                  Leave unanswered →
                </button>
                <button className="primary-button" onClick={confirmLevel}>
                  Confirm this level ✓
                </button>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <div className="step-heading">
                <BackgroundBeams />
                <h1>
                  {saved
                    ? "Your saved skills card."
                    : "Review your skills card."}
                </h1>
                <p>
                  These levels are your declarations, not verified results. No
                  rank or matching score is shown here.
                </p>
              </div>
              {Object.keys(levels).length === 0 ? (
                <p>
                  No levels confirmed yet. Return to the skills journey to
                  begin.
                </p>
              ) : (
                <div className="review-list">
                  {Object.entries(levels).map(([code, level]) => (
                    <div key={code}>
                      <strong>{skillName(code)}</strong>
                      <span>{LEVELS[level].name}</span>
                      <button
                        className="text-button"
                        onClick={() => {
                          setIndex(skills.findIndex((s) => s.code === code));
                          setStep(1);
                        }}
                      >
                        Edit
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button className="secondary-button" onClick={() => setStep(1)}>
                Edit my card
              </button>
              <label className="field-label">
                Fictional display name
                <input
                  maxLength={80}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setSaved(false);
                  }}
                />
              </label>
              <label className="consent-line">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />{" "}
                Keep my confirmed card in this browser for up to six months so
                the demo organiser can consider it.
              </label>
              <p className="quiet-note">
                Only the display name and confirmed levels are saved. No CV,
                quotes or questionnaire answers. You can delete the card below.
                This browser is shared between the demo roles.
              </p>
              <button
                className="primary-button"
                onClick={save}
                disabled={!consent || !Object.keys(levels).length}
              >
                Save my confirmed card
              </button>
              {saved && (
                <p role="status" className="success-panel">
                  Card saved in this browser. The organiser can now review it.
                </p>
              )}
              <button
                className="secondary-button delete-card-action"
                onClick={() => {
                  try {
                    removeTalent(localStorage, "local-talent");
                    setSaved(false);
                    setConsent(false);
                    setLevels({});
                    setAnswers({});
                    setOverrides({});
                    setQuotes({});
                    setCv("");
                    setError("");
                    setStep(0);
                  } catch {
                    setError("Could not delete the saved card.");
                  }
                }}
              >
                Delete my card and clear this session
              </button>
            </>
          )}
        </section>
        <LivePreview
          label="Live talent rosace"
          summary={`${Object.keys(levels).length} confirmed skills · Declared`}
        >
          <p className="eyebrow">YOUR DECLARED SKILLS</p>
          <Rosace
            title={name || "Your skills"}
            size={480}
            labels="short"
            activeSkill={step === 1 ? skill.code : undefined}
            onSelect={(code) => {
              setIndex(COMPONENTS.findIndex((c) => c.code === code));
              setStep(1);
              setError("");
            }}
            declared={Object.fromEntries(
              Object.entries(levels).filter(([code]) => isComponent(code)),
            )}
          />
          <p className="quiet-note">
            A dotted branch appears only after you confirm a level. Empty means
            unanswered, not zero. A dot at the centre means “Not yet”.
          </p>
          <details className="chart-help">
            <summary>Read the levels</summary>
            <p>
              Grey disk: Foundation. Inner ring: Intermediate. Outer circle:
              Advanced.
            </p>
          </details>
          {Object.entries(levels)
            .filter(([code]) => !isComponent(code))
            .map(([code, l]) => (
              <p key={code} className="quiet-note">
                {skillName(code)} · {LEVELS[l].name}
              </p>
            ))}
        </LivePreview>
      </div>
    </div>
  );
}
