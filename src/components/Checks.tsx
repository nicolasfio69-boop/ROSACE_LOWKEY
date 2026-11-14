"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { NEEDS, TALENTS } from "@/data/demo";
import { COMPONENTS, LEVELS, isComponent, skillName } from "@/lib/framework";
import {
  CHECK_SKILLS,
  checkExercise,
  checkSource,
  checkStatus,
  verificationFor,
  verificationLabel,
} from "@/lib/verification";
import {
  emptyWorkspace,
  gradeCheck,
  loadWorkspace,
  submitCheck,
  type Workspace,
} from "@/lib/workspace";
import { OBSERVATION_LABELS, type Observation } from "@/lib/scoring";
import { meanObservedValue } from "@/lib/observations";
import type { ExerciseFeedback } from "@/lib/exercises";
import { Rosace } from "./Rosace";
import { SkillBars } from "./SkillBars";
import { LivePreview } from "./LivePreview";

export function Checks() {
  const [workspace, setWorkspace] = useState<Workspace>(emptyWorkspace);
  const [needId, setNeedId] = useState(NEEDS[0].id);
  const [talentId, setTalentId] = useState("amira");
  const [skill, setSkill] = useState<string>("C5.1");
  const [role, setRole] = useState<"talent" | "recruiter">("talent");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [ready, setReady] = useState(false);
  const [connected, setConnected] = useState(false);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<ExerciseFeedback | null>(null);
  const requestVersion = useRef(0);
  useEffect(() => {
    const requests = requestVersion;
    try {
      setWorkspace(loadWorkspace(localStorage));
      setReady(true);
    } catch {
      setError(
        "Local data could not be read. Your saved work has not been overwritten.",
      );
    }
    fetch("/api/integrations")
      .then((r) => r.json())
      .then((r) =>
        setConnected(
          r.ai === true && String(r.provider).toLowerCase() === "featherless",
        ),
      )
      .catch(() => {});
    return () => {
      requests.current++;
    };
  }, []);
  const needs = [...NEEDS, ...workspace.needs];
  const talents = [...TALENTS, ...workspace.talents.map((t) => t.talent)];
  const need = needs.find((n) => n.id === needId)!;
  const talent = talents.find((t) => t.id === talentId)!;
  const level = talent.statements[skill]?.level;
  const exercise = level ? checkExercise(skill, level) : null;
  const submission = workspace.checks.find(
    (c) => c.needId === needId && c.talentId === talentId && c.skill === skill,
  );
  const seen = workspace.observations.filter(
    (s) => s.needId === needId && s.talentId === talentId,
  );
  const grade = seen.find((s) => s.source === checkSource(skill));
  const status = checkStatus(!!submission, !!grade);
  const expected = Object.fromEntries(
    need.requirements
      .filter((r) => isComponent(r.skill))
      .map((r) => [r.skill, { level: r.expected, major: r.major }]),
  );
  const observed = Object.fromEntries(
    COMPONENTS.map((c) => [
      c.code,
      meanObservedValue(
        seen.filter((s) => s.skill === c.code),
        need.requirements.find((r) => r.skill === c.code)?.expected ?? 1,
      ),
    ]),
  );
  const declared = Object.fromEntries(
    COMPONENTS.map((c) => [c.code, talent.statements[c.code]?.level ?? null]),
  );
  function reset() {
    requestVersion.current++;
    setAnswer("");
    setFeedback(null);
    setConsent(false);
    setBusy(false);
    setError("");
    setNotice("");
  }
  function submit() {
    if (!exercise) return;
    try {
      submitCheck(localStorage, {
        needId,
        talentId,
        skill,
        taskLevel: exercise.level,
        answer,
      });
      setWorkspace(loadWorkspace(localStorage));
      setNotice("Done · ready for recruiter review.");
      setError("");
      setFeedback(null);
      setConsent(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the answer.");
    }
  }
  function mark(observation: Observation) {
    if (!submission || role !== "recruiter") return;
    try {
      gradeCheck(localStorage, submission, observation);
      setWorkspace(loadWorkspace(localStorage));
      setNotice(
        `Graded · ${OBSERVATION_LABELS[observation]}. Declaration unchanged.`,
      );
      setError("");
    } catch {
      setError(
        "Could not save this grade. Reload and review the current answer.",
      );
    }
  }
  async function requestFeedback() {
    if (!submission || !consent || role !== "recruiter" || !connected) return;
    const version = ++requestVersion.current;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/exercise-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skill,
          level: submission.taskLevel,
          answer: submission.answer,
          consent: true,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      if (version === requestVersion.current) setFeedback(data);
    } catch (e) {
      if (version === requestVersion.current)
        setError(e instanceof Error ? e.message : "Feedback unavailable.");
    } finally {
      if (version === requestVersion.current) setBusy(false);
    }
  }
  return (
    <div className="workspace checks-workspace">
      <header className="step-heading">
        <p className="eyebrow">CHECK A CONCRETE SITUATION</p>
        <h1>Checks</h1>
        <p>
          Three fictional exercises · 6 + 6 + 8 minutes, at most 20 minutes in
          total. A recruiter gives the grade.
        </p>
      </header>
      <div className="checks-context form-panel">
        <label className="field-label">
          Company need
          <select
            value={needId}
            onChange={(e) => {
              reset();
              setNeedId(e.target.value);
            }}
          >
            {needs.map((n) => (
              <option key={n.id} value={n.id}>
                {n.company} · {n.title}
              </option>
            ))}
          </select>
        </label>
        <label className="field-label">
          Talent card
          <select
            value={talentId}
            onChange={(e) => {
              reset();
              setTalentId(e.target.value);
            }}
          >
            {talents.map((t) => (
              <option key={t.id} value={t.id}>
                {t.pseudonym}
              </option>
            ))}
          </select>
        </label>
        <label className="field-label">
          Demo role
          <select
            value={role}
            onChange={(e) => {
              reset();
              setRole(e.target.value as "talent" | "recruiter");
            }}
          >
            <option value="talent">Talent · answer</option>
            <option value="recruiter">Recruiter · review</option>
          </select>
        </label>
        <p className="quiet-note">
          Demo role switch, without authenticated accounts. Use fictional
          details only. Exercise answers are saved in this browser; CVs are
          never stored.
        </p>
      </div>
      {error && (
        <p role="alert" className="error-panel">
          {error}
        </p>
      )}
      <div className="workspace-grid">
        <section className="form-panel">
          <label className="field-label">
            Exercise
            <select
              value={skill}
              onChange={(e) => {
                reset();
                setSkill(e.target.value);
              }}
            >
              {CHECK_SKILLS.map((s) => (
                <option key={s} value={s}>
                  {skillName(s)}
                </option>
              ))}
            </select>
          </label>
          <p className="check-status" role="status">
            {notice || status}
          </p>
          <h2>{skillName(skill)}</h2>
          {role === "talent" &&
            (exercise ? (
              <>
                <p className="eyebrow">
                  {LEVELS[exercise.level].name} · {exercise.minutes} minutes ·
                  your declared level
                </p>
                <p className="check-prompt">{exercise.prompt}</p>
                <label className="field-label">
                  Your exercise answer
                  <textarea
                    rows={7}
                    maxLength={6000}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                  />
                </label>
                <button
                  className="primary-button"
                  disabled={!ready || !answer.trim()}
                  onClick={submit}
                >
                  {submission
                    ? "Replace answer and request a new review"
                    : "Submit for recruiter review"}
                </button>
                {submission && (
                  <details className="context-details">
                    <summary>Saved answer</summary>
                    <p className="check-answer">{submission.answer}</p>
                  </details>
                )}
              </>
            ) : (
              <p className="quiet-note">
                Confirm a Foundation, Intermediate or Advanced declaration on
                your <Link href="/talent/new">talent card</Link> before taking
                this exercise. Unknown and Not yet are not automatically
                Foundation.
              </p>
            ))}
          {role === "recruiter" &&
            (submission ? (
              <>
                <p className="eyebrow">
                  Submitted at {LEVELS[submission.taskLevel].name}
                </p>
                <p className="check-prompt">
                  {checkExercise(skill, submission.taskLevel).prompt}
                </p>
                <h3>Talent answer</h3>
                <blockquote className="check-answer">
                  {submission.answer}
                </blockquote>
                <h3>Review checklist</h3>
                <ul className="practice-checks">
                  {checkExercise(skill, submission.taskLevel).checks.map(
                    (c) => (
                      <li key={c}>{c}</li>
                    ),
                  )}
                </ul>
                <p className="quiet-note">
                  Judge this situation at the submitted level. A: demonstrated
                  clearly; C: partly; F: not demonstrated; NE: not covered or
                  insufficient evidence. Never grade accent, grammar or
                  background.
                </p>
                <div
                  className="tour-answers"
                  role="group"
                  aria-label="Recruiter grade"
                >
                  {Object.entries(OBSERVATION_LABELS).map(([code, label]) => (
                    <button
                      key={code}
                      aria-pressed={grade?.observation === code}
                      onClick={() => mark(code as Observation)}
                    >
                      {code} — {label}
                    </button>
                  ))}
                </div>
                <details className="context-details">
                  <summary>Optional Featherless feedback</summary>
                  <p>
                    Only the fictional answer and exercise are sent. Feedback
                    never assigns a grade.
                  </p>
                  <label className="consent-line">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                    />
                    Send this fictional answer to Featherless.
                  </label>
                  <button
                    className="secondary-button"
                    onClick={requestFeedback}
                    disabled={!connected || !consent || busy}
                  >
                    {busy ? "Requesting feedback…" : "Request AI feedback"}
                  </button>
                  {!connected && (
                    <p className="quiet-note">
                      Featherless is not configured. Human review works now.
                    </p>
                  )}
                  {feedback && (
                    <div>
                      <h3>Suggested feedback · review before use</h3>
                      {feedback.strengths.map((s, i) => (
                        <p key={i}>
                          “{s.quote}” — {s.comment}
                        </p>
                      ))}
                      <ul>
                        {feedback.questions.map((q) => (
                          <li key={q}>{q}</li>
                        ))}
                      </ul>
                      <p>{feedback.limitations}</p>
                    </div>
                  )}
                </details>
              </>
            ) : (
              <p className="quiet-note">
                To check · waiting for the talent’s answer. Switch to Talent to
                complete the exercise first.
              </p>
            ))}
          <details className="context-details">
            <summary>Every requirement: how it is checked</summary>
            {need.requirements.map((r) => {
              const submitted = workspace.checks.some(
                (c) =>
                  c.needId === needId &&
                  c.talentId === talentId &&
                  c.skill === r.skill,
              );
              const graded = seen.some((s) => s.skill === r.skill);
              return (
                <article className="question-brief" key={r.skill}>
                  <strong>
                    {skillName(r.skill)} · {checkStatus(submitted, graded)}
                  </strong>
                  <p>How it’s checked: {verificationLabel(r.skill)}</p>
                  <p>{verificationFor(r.skill).situation}</p>
                  {!CHECK_SKILLS.some((s) => s === r.skill) &&
                    verificationFor(r.skill).modes.includes("online") && (
                      <p className="quiet-note">
                        Exercise to be prepared by the recruiter; not included
                        in these three demo exercises.
                      </p>
                    )}
                </article>
              );
            })}
          </details>
          <Link
            href={`/brief?need=${needId}&talent=${talentId}`}
            className="text-button"
          >
            Open the conversation brief →
          </Link>
        </section>
        <LivePreview
          label="Checks rosace"
          summary={
            grade ? "Human observation saved" : "Declared · awaiting review"
          }
        >
          <p className="eyebrow">
            {talent.pseudonym} · {grade ? "OBSERVED" : "DECLARED"}
          </p>
          <Rosace
            size={440}
            labels="short"
            declared={declared}
            {...(seen.length > 0 ? { observedLevels: observed } : {})}
            expected={expected}
          />
          <p className="quiet-note">
            Dotted: declared. Solid: mean of human observations on the same
            level scale. Black tick: expected. NE leaves the branch empty.
            Declarations stay unchanged.
          </p>
          <SkillBars
            items={CHECK_SKILLS.filter((s) => !isComponent(s)).map((s) => ({
              code: s,
              level: talent.statements[s]?.level ?? null,
              expected: need.requirements.find((r) => r.skill === s)?.expected,
              ...(seen.some((o) => o.skill === s)
                ? {
                    observedValue: meanObservedValue(
                      seen.filter((o) => o.skill === s),
                      1,
                    ),
                  }
                : {}),
            }))}
          />
          <details className="chart-help">
            <summary>Original declaration</summary>
            <Rosace
              size={440}
              labels="short"
              declared={declared}
              expected={expected}
            />
          </details>
        </LivePreview>
      </div>
    </div>
  );
}
