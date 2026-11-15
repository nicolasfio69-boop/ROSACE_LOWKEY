"use client";
import { ExerciseDesigner } from "./ExerciseDesigner";
import { BackgroundBeams } from "./BackgroundBeams";
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
  saveCheckPlan,
} from "@/lib/workspace";
import { OBSERVATION_LABELS, type Observation } from "@/lib/scoring";
import { meanObservedValue } from "@/lib/observations";
import { validateFeedback, type ExerciseFeedback } from "@/lib/exercises";
import {
  defaultCheckPlan,
  onlineSkillsFor,
  planMinutes,
  validateCheckPlan,
} from "@/lib/check-plan";
import {
  startCheckAttempt,
  secondsRemaining,
  formatSeconds,
  type CheckAttempt,
} from "@/lib/check-timing";
import { Rosace } from "./Rosace";
import { SkillBars } from "./SkillBars";
import { LivePreview } from "./LivePreview";

export function Checks({
  audience = "recruiter",
}: {
  audience?: "talent" | "recruiter";
}) {
  const role = audience;
  const [workspace, setWorkspace] = useState<Workspace>(emptyWorkspace);
  const [needId, setNeedId] = useState(NEEDS[0].id);
  const [talentId, setTalentId] = useState("amira");
  const [skill, setSkill] = useState<string>("C5.1");
  const [answer, setAnswer] = useState("");
  const [attempt, setAttempt] = useState<CheckAttempt | null>(null);
  const [now, setNow] = useState(0);
  const answerField = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (!attempt) return;
    answerField.current?.focus();
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, [attempt]);
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
      const saved = loadWorkspace(localStorage);
      setWorkspace(saved);
      const query = new URLSearchParams(window.location.search);
      const nextNeed = [...NEEDS, ...saved.needs].some(
        (n) => n.id === query.get("need"),
      )
        ? query.get("need")!
        : NEEDS[0].id;
      const nextTalent = [
        ...TALENTS,
        ...saved.talents.map((t) => t.talent),
      ].some((t) => t.id === query.get("talent"))
        ? query.get("talent")!
        : audience === "talent" && saved.talents[0]
          ? saved.talents[0].talent.id
          : "amira";
      const nextSkill = CHECK_SKILLS.some((s) => s === query.get("skill"))
        ? query.get("skill")!
        : "C5.1";
      setSkill(nextSkill);
      setNeedId(nextNeed);
      setTalentId(nextTalent);
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}?need=${encodeURIComponent(nextNeed)}&talent=${encodeURIComponent(nextTalent)}&skill=${encodeURIComponent(nextSkill)}`,
      );
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
          r.ai === true && String(r.provider).toLowerCase() === "claude",
        ),
      )
      .catch(() => {});
    return () => {
      requests.current++;
    };
  }, [audience]);
  const needs = [...NEEDS, ...workspace.needs];
  const talents = [...TALENTS, ...workspace.talents.map((t) => t.talent)];
  const need = needs.find((n) => n.id === needId)!;
  const talent = talents.find((t) => t.id === talentId)!;
  let plan: string[];
  try {
    const saved = workspace.checkPlans?.find((p) => p.needId === needId);
    plan = saved
      ? validateCheckPlan(need, saved.skills)
      : defaultCheckPlan(need);
  } catch {
    plan = defaultCheckPlan(need);
  }
  const planKey = plan.join("|");
  useEffect(() => {
    const selected = planKey.split("|").filter(Boolean);
    if (!selected.includes(skill)) {
      setSkill(selected[0] ?? "");
      setAnswer("");
      setAttempt(null);
      setFeedback(null);
      requestVersion.current++;
    }
  }, [planKey, skill]);
  useEffect(() => {
    if (ready)
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}?need=${encodeURIComponent(needId)}&talent=${encodeURIComponent(talentId)}&skill=${encodeURIComponent(skill)}`,
      );
  }, [ready, needId, talentId, skill]);
  const remaining = attempt ? secondsRemaining(attempt, now) : 0;
  const level = talent.statements[skill]?.level;
  const exercise = level
    ? (workspace.exercises.find(
        (e) =>
          e.needId === needId &&
          e.exercise.skill === skill &&
          e.exercise.level === level,
      )?.exercise ?? checkExercise(skill, level))
    : null;
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
    setAttempt(null);
    setAnswer("");
    setFeedback(null);
    setConsent(false);
    setBusy(false);
    setError("");
    setNotice("");
  }
  function start() {
    if (!exercise || !plan.includes(skill)) return;
    const current = Date.now();
    setNow(current);
    setAttempt(startCheckAttempt(exercise, current));
    setAnswer("");
    setError("");
    setNotice("");
  }
  function changePlan(next: string[]) {
    try {
      saveCheckPlan(localStorage, need, next);
      setWorkspace(loadWorkspace(localStorage));
      setError("");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not save the online plan.",
      );
    }
  }
  function submit() {
    if (!attempt || role !== "talent") return;
    const submittedExercise = attempt.exercise;
    try {
      submitCheck(localStorage, {
        needId,
        talentId,
        skill,
        taskLevel: submittedExercise.level,
        answer,
        exercise: submittedExercise,
        timing: {
          startedAt: attempt.startedAt,
          submittedAt: Date.now(),
          allowedSeconds: submittedExercise.minutes * 60,
        },
      });
      setWorkspace(loadWorkspace(localStorage));
      setNotice("Done · ready for recruiter review.");
      setAttempt(null);
      setAnswer("");
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
          exercise: submission.exercise,
          answer: submission.answer,
          consent: true,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      if (version === requestVersion.current)
        setFeedback(
          validateFeedback(
            data,
            submission.answer,
            (submission.exercise ?? checkExercise(skill, submission.taskLevel))
              .checks,
          ),
        );
    } catch (e) {
      if (version === requestVersion.current)
        setError(e instanceof Error ? e.message : "Feedback unavailable.");
    } finally {
      if (version === requestVersion.current) setBusy(false);
    }
  }
  return (
    <div
      className={`workspace checks-workspace${attempt ? " is-answering" : ""}`}
    >
      <header className="step-heading">
        <BackgroundBeams />
        <h1>{role === "talent" ? "My checks" : "Prepare and review checks"}</h1>
        <p>
          {role === "talent"
            ? "Complete the selected online exercises before the meeting. The recruiter reviews your work; other skills are discussed or observed on site."
            : "Choose a short online plan, review submitted work, then prepare the on-site checks. Claude can recommend a grade; you make the final decision."}
        </p>
      </header>
      <div className="checks-context form-panel">
        <label className="field-label">
          Company need
          <select
            aria-label="Company need"
            value={needId}
            disabled={!!attempt}
            onChange={(e) => {
              reset();
              setNeedId(e.target.value);
              window.history.replaceState(
                null,
                "",
                `${window.location.pathname}?need=${encodeURIComponent(e.target.value)}&talent=${encodeURIComponent(talentId)}&skill=${encodeURIComponent(skill)}`,
              );
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
            aria-label="Talent card"
            value={talentId}
            disabled={!!attempt}
            onChange={(e) => {
              reset();
              setTalentId(e.target.value);
              window.history.replaceState(
                null,
                "",
                `${window.location.pathname}?need=${encodeURIComponent(needId)}&talent=${encodeURIComponent(e.target.value)}&skill=${encodeURIComponent(skill)}`,
              );
            }}
          >
            {talents.map((t) => (
              <option key={t.id} value={t.id}>
                {t.pseudonym}
              </option>
            ))}
          </select>
        </label>
        <p className="quiet-note">
          Fictional data only. Exercise answers stay in this browser; CVs are
          never stored.
        </p>
      </div>
      <section className="check-plan" aria-labelledby="online-plan-heading">
        <div>
          <h2 id="online-plan-heading">Before the event · online</h2>
          <p>
            {planMinutes(plan)} of 20 minutes selected for this role. A clear
            time limit for each exercise.
          </p>
        </div>
        {role === "recruiter" ? (
          <details>
            <summary>Choose the exercises for this role</summary>
            <p className="quiet-note">
              All online requirements have a written exercise at each level.
              Choose the priorities within the event budget; removing one from
              the plan does not delete submitted work.
            </p>
            <div className="check-plan-options">
              {onlineSkillsFor(need).map((code) => (
                <label className="consent-line" key={code}>
                  <input
                    type="checkbox"
                    checked={plan.includes(code)}
                    onChange={(e) =>
                      changePlan(
                        e.target.checked
                          ? [...plan, code]
                          : plan.filter((s) => s !== code),
                      )
                    }
                  />
                  {skillName(code)} · {checkExercise(code, 1).minutes} min
                </label>
              ))}
            </div>
            {onlineSkillsFor(need).length === 0 && (
              <p>
                This need is checked at the meeting; no online exercise is
                required.
              </p>
            )}
          </details>
        ) : (
          <ol className="check-plan-list">
            {plan.map((code) => (
              <li key={code}>
                <strong>{skillName(code)}</strong>
                <span>
                  {checkExercise(code, 1).minutes} min ·{" "}
                  {checkStatus(
                    workspace.checks.some(
                      (c) =>
                        c.needId === needId &&
                        c.talentId === talentId &&
                        c.skill === code,
                    ),
                    seen.some(
                      (o) => o.skill === code && o.source === checkSource(code),
                    ),
                  )}
                </span>
              </li>
            ))}
          </ol>
        )}
        {!plan.length && (
          <p>
            No online exercise is selected. Prepare for the meeting using the
            guidance below.
          </p>
        )}
      </section>
      {error && (
        <p role="alert" className="error-panel">
          {error}
        </p>
      )}
      {attempt && (
        <p className="check-active-context">
          {need.company} · {talent.pseudonym} · unsubmitted attempt
        </p>
      )}
      <div className="workspace-grid">
        <section className="form-panel">
          <label className="field-label">
            Exercise
            <select
              aria-label="Exercise"
              value={skill}
              disabled={!!attempt || !plan.length}
              onChange={(e) => {
                reset();
                setSkill(e.target.value);
                window.history.replaceState(
                  null,
                  "",
                  `${window.location.pathname}?need=${encodeURIComponent(needId)}&talent=${encodeURIComponent(talentId)}&skill=${encodeURIComponent(e.target.value)}`,
                );
              }}
            >
              {!plan.length && (
                <option value="">No online exercise selected</option>
              )}
              {plan.map((s) => (
                <option key={s} value={s}>
                  {skillName(s)}
                </option>
              ))}
            </select>
          </label>
          <p className="check-status" data-state={status} role="status">
            {attempt
              ? remaining
                ? "In progress · not submitted"
                : "Time is up · awaiting submission"
              : notice || status}
          </p>
          <h2>{skill ? skillName(skill) : "At the meeting"}</h2>
          {role === "recruiter" && exercise && (
            <ExerciseDesigner
              key={`${needId}-${skill}-${level}`}
              needId={needId}
              title={need.title}
              job={
                "description" in need
                  ? String(need.description)
                  : need.requirements
                      .map(
                        (r) =>
                          `${skillName(r.skill)}: ${r.reason ?? r.example ?? ""}`,
                      )
                      .join("\n")
              }
              company={
                "companyContext" in need
                  ? String(need.companyContext)
                  : `${need.company}, a fictional demo company.`
              }
              skill={skill}
              level={exercise.level}
              connected={connected}
              onApproved={() => setWorkspace(loadWorkspace(localStorage))}
            />
          )}
          {role === "talent" &&
            plan.length > 0 &&
            (exercise ? (
              <>
                <p className="check-task-meta">
                  {LEVELS[exercise.level].name} · {exercise.minutes} minutes ·
                  your declared level
                </p>
                {!attempt ? (
                  <div className="check-start">
                    <p>
                      Start when you are ready. The task opens with the timer.
                      At the time limit, writing stops; you can still submit
                      what you have written.
                    </p>
                    <p className="quiet-note">
                      This is a local practice timer, not a supervised exam.
                      Unsubmitted text stays in memory and is lost when you
                      leave or reload. No code is executed.
                    </p>
                    <button
                      className="primary-button"
                      disabled={!ready}
                      onClick={start}
                    >
                      {submission ? "Start a new attempt" : "Start exercise"}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="check-timer">
                      <strong role="timer" aria-label="Time remaining">
                        {formatSeconds(remaining)}
                      </strong>
                      <span>
                        {remaining
                          ? "Time remaining"
                          : "Time is up · submit your current answer"}
                      </span>
                    </div>
                    {remaining === 0 && (
                      <p role="alert" className="check-time-up">
                        Writing has stopped. Review and submit the answer
                        already written; no grade is assigned automatically.
                      </p>
                    )}
                    <p className="check-prompt">{attempt.exercise.prompt}</p>
                    <label className="field-label">
                      Your exercise answer
                      <textarea
                        ref={answerField}
                        rows={9}
                        maxLength={6000}
                        value={answer}
                        readOnly={remaining === 0}
                        onChange={(e) => {
                          if (secondsRemaining(attempt, Date.now()) > 0)
                            setAnswer(e.target.value);
                        }}
                      />
                    </label>
                    <div className="check-attempt-actions">
                      <button
                        className="primary-button"
                        disabled={!ready || !answer.trim()}
                        onClick={submit}
                      >
                        {submission
                          ? "Replace answer and request a new review"
                          : "Submit for recruiter review"}
                      </button>
                      <button
                        className="text-button"
                        onClick={() => {
                          setAttempt(null);
                          setAnswer("");
                        }}
                      >
                        Discard this attempt
                      </button>
                    </div>
                  </>
                )}
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
            plan.length > 0 &&
            (submission ? (
              <>
                <p className="eyebrow">
                  Submitted at {LEVELS[submission.taskLevel].name}
                </p>
                <p className="check-prompt">
                  {
                    (
                      submission.exercise ??
                      checkExercise(skill, submission.taskLevel)
                    ).prompt
                  }
                </p>
                {submission.timing && (
                  <p className="quiet-note">
                    Local timing:{" "}
                    {formatSeconds(
                      Math.floor(
                        (submission.timing.submittedAt -
                          submission.timing.startedAt) /
                          1000,
                      ),
                    )}{" "}
                    elapsed · {formatSeconds(submission.timing.allowedSeconds)}{" "}
                    writing limit. Timing is contextual information, never an
                    automatic grade.
                  </p>
                )}
                <h3>Talent answer</h3>
                <blockquote className="check-answer">
                  {submission.answer}
                </blockquote>
                <h3>Review checklist</h3>
                <ul className="practice-checks">
                  {(
                    submission.exercise ??
                    checkExercise(skill, submission.taskLevel)
                  ).checks.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
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
                  <summary>Optional Claude feedback</summary>
                  <p>
                    Only the fictional answer and the submitted exercise are
                    sent. Claude recommends A/C/F/NE with evidence. You can
                    accept it, choose another grade or review without AI.
                  </p>
                  <label className="consent-line">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                    />
                    Send this fictional answer to Claude.
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
                      Claude is not configured. Human review works now.
                    </p>
                  )}
                  {feedback && (
                    <div>
                      <h3>
                        {grade
                          ? "AI recommendation · your grade is recorded"
                          : "AI recommendation · awaiting your decision"}
                      </h3>
                      {feedback.recommendation && (
                        <div className="ai-grade-proposal">
                          <strong>
                            {feedback.recommendation.grade} —{" "}
                            {OBSERVATION_LABELS[feedback.recommendation.grade]}
                          </strong>
                          <p>{feedback.recommendation.reason}</p>
                          <ul>
                            {feedback.recommendation.criteria.map((c) => (
                              <li key={c.index}>
                                <strong>
                                  {
                                    (
                                      submission.exercise ??
                                      checkExercise(skill, submission.taskLevel)
                                    ).checks[c.index]
                                  }
                                </strong>
                                <p>
                                  {c.verdict.replaceAll("_", " ")}: {c.reason}
                                </p>
                                {c.quote && (
                                  <blockquote>“{c.quote}”</blockquote>
                                )}
                              </li>
                            ))}
                          </ul>
                          <button
                            className="primary-button"
                            onClick={() => mark(feedback.recommendation!.grade)}
                          >
                            Validate recommended grade{" "}
                            {feedback.recommendation.grade}
                          </button>
                          <p className="quiet-note">
                            Read the answer and criteria first. Use the
                            recruiter grade buttons above to choose a different
                            grade. Only your decision changes the rosace.
                          </p>
                        </div>
                      )}
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
                To check · waiting for the talent’s answer. Use Demo profile →
                Candidate to complete a selected exercise.
              </p>
            ))}
          <section className="meeting-guidance">
            <h2>At the meeting</h2>
            <p className="quiet-note">
              Share at most 10 minutes across the selected on-site tasks. Ask
              about concrete examples; the recruiter records what was seen.
            </p>
            {need.requirements
              .filter((r) =>
                verificationFor(r.skill).modes.some(
                  (mode) => mode !== "online",
                ),
              )
              .map((r) => (
                <article className="question-brief" key={r.skill}>
                  <strong>{skillName(r.skill)}</strong>
                  <p>{verificationFor(r.skill).situation}</p>
                  <p className="quiet-note">
                    {r.skill === "C4.3"
                      ? "Discussed, not observed. Do not assign an observation from this short meeting."
                      : "Ask what they did, what help they needed and how they checked the result."}
                  </p>
                </article>
              ))}
            {!need.requirements.some((r) =>
              verificationFor(r.skill).modes.some((mode) => mode !== "online"),
            ) && (
              <p>
                Discuss the submitted work and any remaining questions with the
                recruiter.
              </p>
            )}
          </section>
          <details className="context-details">
            <summary>All requirements and their status</summary>
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
                  {CHECK_SKILLS.includes(r.skill) &&
                    !plan.includes(r.skill) && (
                      <p className="quiet-note">
                        Available online, but not selected within this role’s
                        20-minute plan. The recruiter can change the plan; this
                        skill is not treated as failed.
                      </p>
                    )}
                  {!verificationFor(r.skill).modes.includes("online") && (
                    <p className="quiet-note">
                      {r.skill === "C4.3"
                        ? "Discussed, not observed. Ask about a commitment over several weeks."
                        : "Observed by a recruiter at the meeting, within the shared 10-minute allowance."}
                    </p>
                  )}
                </article>
              );
            })}
          </details>
          {role === "recruiter" && (
            <Link
              href={`/brief?need=${needId}&talent=${talentId}`}
              className="text-button"
            >
              Open the conversation brief →
            </Link>
          )}
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
            items={need.requirements
              .map((r) => r.skill)
              .filter((s) => !isComponent(s))
              .map((s) => ({
                code: s,
                level: talent.statements[s]?.level ?? null,
                expected: need.requirements.find((r) => r.skill === s)
                  ?.expected,
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
