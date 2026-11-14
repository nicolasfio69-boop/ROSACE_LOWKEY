"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Rosace } from "./Rosace";
import {
  COMPETENCIES,
  COMPONENTS,
  JOB_SKILLS,
  LEVELS,
  descriptor,
  isComponent,
  skillName,
  type ExpectedLevel,
} from "@/lib/framework";
import {
  JOB_QUESTIONS,
  levelExample,
  prepareNeed,
  type NeedDraft,
  type DraftResult,
} from "@/lib/need-draft";
import { MAJOR_COUNT } from "@/lib/scoring";
import { changeSelection, type SelectionRole } from "@/lib/need-selection";

import {
  decodeStoredNeed,
  emptyNeedDraft,
  NEED_STORAGE_KEY,
  saveNeed,
} from "@/lib/need-storage";

const steps = [
  "The role",
  "Your priorities",
  "Expected levels",
  "Review & confirm",
];

export function NeedForm() {
  const [draft, setDraft] = useState<NeedDraft>(emptyNeedDraft);
  const [result, setResult] = useState<DraftResult | null>(null);
  const [step, setStep] = useState(0);
  const [activeSkill, setActiveSkill] = useState("");
  const [attempted, setAttempted] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [storageError, setStorageError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(NEED_STORAGE_KEY);
      if (raw) {
        const stored = decodeStoredNeed(raw);
        setDraft(stored.draft);
        if (stored.confirmed) {
          setResult(prepareNeed(stored.draft));
          setStep(3);
        }
        setSaved(true);
      }
    } catch {
      setStorageError(
        "Your saved need could not be restored. You can continue editing; saving will replace the unreadable copy.",
      );
    }
    setLoaded(true);
  }, []);

  function persist(next: NeedDraft, confirmed: boolean) {
    try {
      saveNeed(window.localStorage, next, confirmed);
      setSaved(true);
      setStorageError("");
    } catch {
      setSaved(false);
      setStorageError(
        "Your latest changes could not be saved in this browser. Keep this page open and retry saving.",
      );
    }
  }

  function clearSavedNeed() {
    try {
      window.localStorage.removeItem(NEED_STORAGE_KEY);
      setDraft(emptyNeedDraft());
      setStep(0);
      setAttempted(false);
      setResult(null);
      setSaved(false);
      setStorageError("");
    } catch {
      setStorageError(
        "The saved need could not be deleted. Please allow browser storage and try again.",
      );
    }
  }

  const majors = draft.requirements.filter((r) => r.major).length;
  const minors = draft.requirements.filter(
    (r) => isComponent(r.skill) && !r.major,
  ).length;
  const jobs = draft.requirements.filter((r) => !isComponent(r.skill)).length;
  const validation = prepareNeed(draft);

  function update(patch: Partial<NeedDraft>) {
    const next = { ...draft, ...patch };
    setDraft(next);
    setResult(null);
    persist(next, false);
  }

  function select(skill: string, role: SelectionRole) {
    update({ requirements: changeSelection(draft.requirements, skill, role) });
  }

  const roleReady = !!draft.title.trim() && !!draft.description.trim();
  const prioritiesReady = majors === MAJOR_COUNT;
  const focused =
    draft.requirements.find((r) => r.skill === activeSkill) ??
    draft.requirements[0];

  function go(next: number) {
    setStep(next);
    setAttempted(false);
    requestAnimationFrame(() => {
      heading.current?.focus();
      heading.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttempted(true);
    if (step === 0 && !roleReady) return;
    if (step === 1 && !prioritiesReady) return;
    if (step < 3) {
      go(step + 1);
      return;
    }
    const checked = prepareNeed(draft);
    setResult(checked);
    if (checked.ok) persist(draft, true);
  }

  if (!loaded)
    return (
      <p role="status" className="loading-state">
        Opening your workspace…
      </p>
    );

  return (
    <div className="workspace">
      <div className="workspace-top">
        <Link href="/" className="back-link">
          ← Home
        </Link>
        <span className="save-note">
          {storageError
            ? "Saving needs attention"
            : saved
              ? "● Saved on this browser"
              : "Your draft saves as you go"}
        </span>
      </div>
      <ol className="stepper" aria-label="Your progress">
        {steps.map((label, i) => (
          <li
            key={label}
            className={
              i === step ? "current-step" : i < step ? "completed-step" : ""
            }
          >
            <button
              type="button"
              aria-current={i === step ? "step" : undefined}
              disabled={i > step && (!roleReady || (i > 1 && !prioritiesReady))}
              onClick={() => go(i)}
            >
              <span>{i < step ? "✓" : i + 1}</span>
              <span>{label}</span>
            </button>
          </li>
        ))}
      </ol>
      {storageError && (
        <div className="error-panel" role="alert">
          {storageError}{" "}
          <button
            type="button"
            onClick={() => persist(draft, result?.ok === true)}
          >
            Retry saving
          </button>
        </div>
      )}
      <form onSubmit={submit} className="workspace-grid">
        <div className="form-panel">
          <div className="step-heading">
            <p className="eyebrow">STEP 0{step + 1} / 04</p>
            <h1 ref={heading} tabIndex={-1}>
              {
                [
                  "Start with the real work.",
                  "What matters most?",
                  "Make your expectations clear.",
                  result?.ok
                    ? "Ready for a better conversation."
                    : "A clear picture of your role.",
                ][step]
              }
            </h1>
            <p>
              {
                [
                  "Describe the role in your own words. We’ll turn it into a focused skills profile.",
                  "Choose three major components. Think about the work, not an idealised candidate.",
                  "Choose a level for each skill. Ask for what the role needs, not the highest level by default.",
                  "Take a moment to review. These are conversation starters, not a verdict on anyone.",
                ][step]
              }
            </p>
          </div>
          <div className="step-content" key={step}>
            {step === 0 && (
              <>
                <label className="field-label">
                  Job title
                  <input
                    autoComplete="off"
                    placeholder="e.g. Junior embedded developer"
                    required
                    maxLength={120}
                    value={draft.title}
                    onChange={(e) => update({ title: e.target.value })}
                  />
                </label>
                <label className="field-label">
                  What will this person do?
                  <textarea
                    placeholder="Describe a typical task and what you want them to achieve…"
                    required
                    maxLength={1000}
                    rows={4}
                    value={draft.description}
                    onChange={(e) => update({ description: e.target.value })}
                  />
                </label>
                <details className="context-details">
                  <summary>
                    Add a little context <span>4 optional questions</span>
                  </summary>
                  <div className="context-grid">
                    {JOB_QUESTIONS.map((q) => (
                      <label key={q.key} className="field-label">
                        {q.label}
                        <input
                          maxLength={240}
                          placeholder={q.placeholder}
                          value={draft.context[q.key]}
                          onChange={(e) =>
                            update({
                              context: {
                                ...draft.context,
                                [q.key]: e.target.value,
                              },
                            })
                          }
                        />
                      </label>
                    ))}
                  </div>
                </details>
                <p className="quiet-note">
                  Use a fictional role for this demo. No personal information
                  needed.
                </p>
                {attempted && !roleReady && (
                  <p role="alert" className="inline-error">
                    Add a job title and a short description to continue.
                  </p>
                )}
              </>
            )}
            {step === 1 && (
              <>
                <div className="priority-slots" aria-live="polite">
                  {Array.from({ length: 3 }, (_, i) => {
                    const r = draft.requirements.filter((r) => r.major)[i];
                    return (
                      <div key={i} className={r ? "filled-slot" : ""}>
                        <span>0{i + 1}</span>
                        {r ? skillName(r.skill) : "Choose a priority"}
                      </div>
                    );
                  })}
                </div>
                <p className="selection-count">
                  {majors} of 3 majors selected · gold on your rosace
                </p>
                {COMPETENCIES.map((group) => (
                  <fieldset className="component-group" key={group.code}>
                    <legend>
                      <span style={{ background: group.color }} />
                      {group.name}
                    </legend>
                    <div className="component-grid">
                      {COMPONENTS.filter(
                        (c) => c.competency === group.code,
                      ).map((c) => {
                        const r = draft.requirements.find(
                          (r) => r.skill === c.code,
                        );
                        return (
                          <button
                            type="button"
                            key={c.code}
                            className={`component-card ${r?.major ? "selected-major" : ""}`}
                            aria-pressed={!!r?.major}
                            disabled={!r?.major && majors >= 3}
                            onClick={() =>
                              select(c.code, r?.major ? "none" : "major")
                            }
                          >
                            <span className="component-code">{c.code}</span>
                            <strong>{c.name}</strong>
                            <span className="card-check" aria-hidden="true">
                              {r?.major ? "✓" : "+"}
                            </span>
                            {r && !r.major && <small>Currently a minor</small>}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                ))}
                <details className="context-details">
                  <summary>
                    Add supporting skills <span>Optional</span>
                  </summary>
                  <div className="optional-skills">
                    <h3>
                      Minor components <span>{minors} / 2</span>
                    </h3>
                    <p>Useful alongside your three priorities.</p>
                    <div className="chip-grid">
                      {COMPONENTS.filter(
                        (c) =>
                          !draft.requirements.some(
                            (r) => r.skill === c.code && r.major,
                          ),
                      ).map((c) => {
                        const chosen = draft.requirements.some(
                          (r) => r.skill === c.code,
                        );
                        return (
                          <button
                            type="button"
                            className={`skill-chip ${chosen ? "chosen" : ""}`}
                            key={c.code}
                            aria-pressed={chosen}
                            disabled={!chosen && minors >= 2}
                            onClick={() =>
                              select(c.code, chosen ? "none" : "minor")
                            }
                          >
                            {chosen ? "✓ " : "+ "}
                            {c.name}
                          </button>
                        );
                      })}
                    </div>
                    <h3>
                      Job skills <span>{jobs} / 2</span>
                    </h3>
                    <p>
                      Specific know-how. Shown beside the rosace, never as
                      majors.
                    </p>
                    <div className="chip-grid">
                      {JOB_SKILLS.map((j) => {
                        const chosen = draft.requirements.some(
                          (r) => r.skill === j.code,
                        );
                        return (
                          <button
                            type="button"
                            className={`skill-chip ${chosen ? "chosen" : ""}`}
                            key={j.code}
                            aria-pressed={chosen}
                            disabled={!chosen && jobs >= 2}
                            onClick={() =>
                              select(j.code, chosen ? "none" : "job")
                            }
                          >
                            {chosen ? "✓ " : "+ "}
                            {j.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </details>
                {attempted && !prioritiesReady && (
                  <p role="alert" className="inline-error">
                    Choose exactly three major components to continue.
                  </p>
                )}
              </>
            )}
            {step === 2 && focused && (
              <>
                <div
                  className="skill-tabs"
                  aria-label="Choose a skill to set its level"
                >
                  {draft.requirements.map((r, i) => (
                    <button
                      type="button"
                      key={r.skill}
                      className={
                        r.skill === focused.skill ? "active-skill" : ""
                      }
                      aria-pressed={r.skill === focused.skill}
                      onClick={() => setActiveSkill(r.skill)}
                    >
                      <span>{i + 1}</span>
                      {skillName(r.skill)}
                    </button>
                  ))}
                </div>
                <p className="role-context">
                  <strong>{draft.title}</strong>
                  {draft.context.task && <> · {draft.context.task}</>}
                </p>
                <fieldset className="level-fieldset">
                  <legend>{skillName(focused.skill)}</legend>
                  <p className="quiet-note">
                    Foundation is the starting selection. Compare the cards
                    before continuing.
                  </p>
                  <div className="level-grid">
                    {([1, 2, 3] as const).map((level) => (
                      <label
                        key={level}
                        className={`level-card ${focused.expected === level ? "selected-level" : ""}`}
                      >
                        <div className="level-card-top">
                          <span className="level-bars" aria-hidden="true">
                            {[1, 2, 3].map((n) => (
                              <i key={n} className={n <= level ? "lit" : ""} />
                            ))}
                          </span>
                          <input
                            type="radio"
                            name={`level-${focused.skill}`}
                            checked={focused.expected === level}
                            onChange={() =>
                              update({
                                requirements: draft.requirements.map((r) =>
                                  r.skill === focused.skill
                                    ? { ...r, expected: level as ExpectedLevel }
                                    : r,
                                ),
                              })
                            }
                          />
                        </div>
                        <h3>{LEVELS[level].name}</h3>
                        <p>{descriptor(focused.skill, level)}</p>
                        <div className="example-block">
                          <span>IN THIS ROLE</span>
                          <p>
                            {levelExample(focused.skill, level, {
                              title: "",
                              context: {
                                task: "",
                                audience: "",
                                outcome: "",
                                challenge: "",
                              },
                            })}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <details className="context-details">
                  <summary>
                    Your job context <span>Keep this in mind</span>
                  </summary>
                  <p className="context-copy">
                    {draft.title} — {draft.description}
                  </p>
                  {JOB_QUESTIONS.filter((q) => draft.context[q.key]).map(
                    (q) => (
                      <p className="context-copy" key={q.key}>
                        <strong>{q.label}</strong> {draft.context[q.key]}
                      </p>
                    ),
                  )}
                </details>
              </>
            )}
            {step === 3 && (
              <>
                {result?.ok && (
                  <div className="success-panel" role="status">
                    <span aria-hidden="true">✓</span>
                    <div>
                      <strong>Need confirmed</strong>
                      <p>
                        {saved
                          ? "Saved in this browser. You can return and edit it anytime."
                          : "Not yet saved. Retry saving before leaving."}
                      </p>
                    </div>
                  </div>
                )}
                <div className="review-role">
                  <div>
                    <p className="eyebrow">YOUR ROLE</p>
                    <h2>{draft.title}</h2>
                    <p>{draft.description}</p>
                  </div>
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => go(0)}
                  >
                    Edit role
                  </button>
                </div>
                <div className="review-label">
                  <h3>Skills to explore together</h3>
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => go(1)}
                  >
                    Edit skills
                  </button>
                </div>
                <div className="review-list">
                  {draft.requirements.map((r) => (
                    <div key={r.skill}>
                      <span className={r.major ? "gold-dot" : "red-dot"} />
                      <div>
                        <strong>{skillName(r.skill)}</strong>
                        <small>
                          {r.major
                            ? "Major component"
                            : isComponent(r.skill)
                              ? "Minor component"
                              : "Job skill"}
                        </small>
                      </div>
                      <button
                        type="button"
                        className="level-edit"
                        onClick={() => {
                          setActiveSkill(r.skill);
                          go(2);
                        }}
                      >
                        {LEVELS[r.expected].name}{" "}
                        <span aria-hidden="true">→</span>
                      </button>
                    </div>
                  ))}
                </div>
                <label className="capacity-field">
                  <span>
                    <strong>How many people would you like to meet?</strong>
                    <small>
                      You can start with three meaningful conversations.
                    </small>
                  </span>
                  <input
                    aria-label="People to meet"
                    type="number"
                    min={1}
                    step={1}
                    required
                    value={Number.isNaN(draft.capacity) ? "" : draft.capacity}
                    onChange={(e) =>
                      update({ capacity: e.target.valueAsNumber })
                    }
                  />
                </label>
                {!validation.ok && (
                  <ul role="alert" className="inline-error">
                    {validation.errors.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                )}
                <p className="quiet-note">
                  This need stays in your browser. It is not sent to an
                  organiser or added to the demo matches yet.
                </p>
              </>
            )}
          </div>
          <div className="form-actions">
            {step > 0 ? (
              <button
                type="button"
                className="secondary-button"
                onClick={() => go(step - 1)}
              >
                ← Back
              </button>
            ) : (
              <span className="quiet-note">About the work. Not the CV.</span>
            )}
            <button type="submit" className="primary-button">
              {step === 3
                ? result?.ok
                  ? "Confirm again"
                  : "Confirm my need"
                : [
                    "Choose priorities",
                    "Set expected levels",
                    "Review my need",
                  ][step]}{" "}
              <span aria-hidden="true">{step === 3 ? "✓" : "→"}</span>
            </button>
          </div>
        </div>
        <aside className="live-panel" aria-label="Live need preview">
          <div className="visual-topline">
            <span className="eyebrow">YOUR ROLE, TAKING SHAPE</span>
            <span className="live-label">
              <span className="status-dot" /> Live
            </span>
          </div>
          <Rosace
            title={draft.title || "Your next great conversation"}
            size={310}
            labels="short"
            expected={Object.fromEntries(
              draft.requirements
                .filter((r) => isComponent(r.skill))
                .map((r) => [r.skill, { level: r.expected, major: r.major }]),
            )}
          />
          <div className="preview-legend">
            <span>
              <i className="gold-dot" /> Major
            </span>
            <span>
              <i className="red-dot" /> Minor
            </span>
            <span>Empty = not selected</span>
          </div>
          <div className="preview-summary">
            <span>
              {majors}
              <small>of 3 majors</small>
            </span>
            <span>
              {minors}
              <small>minor components</small>
            </span>
            <span>
              {jobs}
              <small>job skills</small>
            </span>
          </div>
          {jobs > 0 && (
            <div className="preview-jobs">
              <p className="eyebrow">JOB SKILLS · ALONGSIDE THE ROSACE</p>
              {draft.requirements
                .filter((r) => !isComponent(r.skill))
                .map((r) => (
                  <p key={r.skill}>
                    {skillName(r.skill)}
                    <small>{LEVELS[r.expected].name}</small>
                  </p>
                ))}
            </div>
          )}
          <details className="chart-help">
            <summary>How to read your rosace</summary>
            <p>
              Grey disk: Foundation. Inner ring: Intermediate. Outer circle:
              Advanced. Your three major components are drawn in gold, on top.
            </p>
          </details>
          <div className="human-note">
            ✦{" "}
            <span>
              We turn claims into questions you can check during the
              conversation.
            </span>
          </div>
        </aside>
      </form>
      <div className="workspace-bottom">
        <span>Synthetic demo · Your judgement stays central</span>
        <button type="button" onClick={clearSavedNeed}>
          Clear saved need and start again
        </button>
      </div>
    </div>
  );
}
