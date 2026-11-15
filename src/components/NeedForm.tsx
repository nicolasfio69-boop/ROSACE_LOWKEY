"use client";
import { NeedProposal } from "./NeedProposal";
import { BackgroundBeams } from "./BackgroundBeams";
import { LivePreview } from "./LivePreview";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  COMPONENTS,
  JOB_FAMILIES,
  JOB_SKILLS,
  LEVELS,
  isComponent,
  skillName,
} from "@/lib/framework";
import {
  emptyNeedDraft,
  decodeStoredNeed,
  NEED_STORAGE_KEY,
  saveNeed,
} from "@/lib/need-storage";
import { JOB_QUESTIONS, prepareNeed, type NeedDraft } from "@/lib/need-draft";
import { changeSelection, type SelectionRole } from "@/lib/need-selection";
import { MAX_JOB_SKILLS } from "@/lib/scoring";
import { verificationFor, verificationLabel } from "@/lib/verification";
import { SkillBars } from "./SkillBars";
import { spotSkills } from "@/lib/talent-intake";
import { addNeed } from "@/lib/workspace";
import {
  retrievePassages,
  type Passage,
  type LevelExamples,
} from "@/lib/context";
import { jobScenario } from "@/data/job-scenarios";
import { WorkspaceIcon } from "./WorkspaceIcon";
import { DocumentInput } from "./DocumentInput";
import { LevelCards } from "./LevelCards";
import { JourneyRail } from "./JourneyRail";
import { Rosace } from "./Rosace";

const initial = (): NeedDraft => ({
  ...emptyNeedDraft(),
  company: "",
  companyContext: "",
  eventName: "Espoo Tech Matchmaking",
  workMode: "Hybrid",
  location: "Espoo",
  autonomy: "With guidance at first",
});
type Generated = LevelExamples & { passages: Passage[] };
export function NeedForm() {
  const [draft, setDraft] = useState<NeedDraft>(initial);
  const [loaded, setLoaded] = useState(false);
  const [step, setStep] = useState(0);
  const [contextStage, setContextStage] = useState(0);
  const [index, setIndex] = useState(0);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [integrations, setIntegrations] = useState({
    context: false,
    ai: false,
    provider: "Claude",
  });
  const [pending, setPending] = useState<Generated | null>(null);
  const [accepted, setAccepted] = useState<Record<string, Generated>>({});
  const ticket = useRef(0);
  const [levelChoices, setLevelChoices] = useState<Record<string, 1 | 2 | 3>>(
    {},
  );
  useEffect(() => {
    try {
      const raw = localStorage.getItem(NEED_STORAGE_KEY);
      if (raw) {
        const stored = decodeStoredNeed(raw);
        setDraft({
          ...initial(),
          ...stored.draft,
          draftId: stored.draft.draftId ?? crypto.randomUUID(),
        });
        setUrl(stored.draft.sourceUrl ?? "");
        if (stored.confirmed) {
          setStep(3);
          setConfirmed(true);
        }
      }
    } catch {
      setError(
        "The saved draft could not be restored. You can start a new one.",
      );
    }
    setLoaded(true);
    fetch("/api/integrations")
      .then((r) => r.json())
      .then(setIntegrations)
      .catch(() => {});
    return () => {
      ticket.current = -1;
    };
  }, []);
  const c = COMPONENTS[index],
    selected = draft.requirements.find((r) => r.skill === c.code),
    majors = draft.requirements.filter((r) => r.major).length,
    minors = draft.requirements.filter(
      (r) => isComponent(r.skill) && !r.major,
    ).length,
    jobs = draft.requirements.filter((r) => !isComponent(r.skill)).length;
  const roleReady =
    !!draft.company?.trim() &&
    !!draft.title.trim() &&
    !!draft.description.trim();
  const jobContext = [
    `Work arrangement: ${draft.workMode}. Workplace: ${draft.location}. Support: ${draft.autonomy}.`,
    ...JOB_QUESTIONS.map((q) => `${q.label} ${draft.context[q.key]}`),
    draft.description,
  ]
    .join("\n")
    .slice(0, 16000);
  const passages = retrievePassages(
    [
      { id: "job", title: "Your job context", text: jobContext },
      ...(reviewed && draft.companyContext
        ? [
            {
              id: "company",
              title: "Reviewed company context",
              text: draft.companyContext,
              url: draft.sourceUrl,
            },
          ]
        : []),
    ],
    c.code,
    draft.context.task,
  );
  const mentions = spotSkills(jobContext);
  function update(patch: Partial<NeedDraft>) {
    const next = {
      ...draft,
      draftId: draft.draftId ?? crypto.randomUUID(),
      ...patch,
    };
    setDraft(next);
    setConfirmed(false);
    setError("");
    ticket.current++;
    setBusy(false);
    setPending(null);
    if (!("requirements" in patch) && !("capacity" in patch)) {
      setReviewed(false);
      setAccepted({});
    }
    try {
      saveNeed(localStorage, next, false);
      setStatus("Draft saved in this browser");
    } catch {
      setError(
        "Could not save your latest changes. Keep this page open and try again.",
      );
    }
  }
  function exploreSkill(code: string) {
    const i = COMPONENTS.findIndex((item) => item.code === code);
    if (i < 0) return;
    setIndex(i);
    setStep(1);
    setPending(null);
    ticket.current++;
    setBusy(false);
    setError("");
  }
  function go(next: number) {
    ticket.current++;
    setBusy(false);
    setPending(null);
    setStep(next);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function select(skill: string, role: SelectionRole) {
    update({
      requirements: changeSelection(draft.requirements, skill, role).map((r) =>
        r.skill === skill && levelChoices[skill]
          ? { ...r, expected: levelChoices[skill] }
          : r,
      ),
    });
  }
  async function collect() {
    const id = ++ticket.current;
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/company-context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      if (id !== ticket.current) return;
      update({ companyContext: data.source.text, sourceUrl: data.source.url });
      setStatus(
        `Source collected ${new Date(data.source.fetchedAt).toLocaleString()}${data.cached ? " · cached for this session" : ""}. Review the text before using it.`,
      );
    } catch (e) {
      if (id === ticket.current)
        setError(
          e instanceof Error ? e.message : "Could not collect company context.",
        );
    } finally {
      if (id === ticket.current) setBusy(false);
    }
  }
  async function generate() {
    const id = ++ticket.current;
    setBusy(true);
    setPending(null);
    setError("");
    try {
      const r = await fetch("/api/level-examples", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skill: c.code,
          title: draft.title,
          task: draft.context.task,
          job: jobContext,
          company: reviewed ? draft.companyContext : "",
          reviewed,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      if (id === ticket.current) setPending(data);
    } catch (e) {
      if (id === ticket.current)
        setError(
          e instanceof Error ? e.message : "Could not generate examples.",
        );
    } finally {
      if (id === ticket.current) setBusy(false);
    }
  }
  function confirm() {
    const result = prepareNeed(draft);
    if (!result.ok) {
      setError(result.errors.join(" "));
      return;
    }
    if (!roleReady) {
      setError("Add your company, job title and job description.");
      return;
    }
    try {
      const need = {
        ...result.need,
        requirements: result.need.requirements.map((r) => ({
          ...r,
          example:
            accepted[r.skill]?.examples[r.expected] ??
            jobScenario(r.skill, r.expected, draft.title) ??
            r.example,
        })),
        description: draft.description,
        context: draft.context,
        workMode: draft.workMode,
        location: draft.location,
        autonomy: draft.autonomy,
        eventName: draft.eventName ?? "Espoo Tech Matchmaking",
        companyContext: reviewed ? (draft.companyContext ?? "") : "",
        sourceUrl: reviewed ? draft.sourceUrl : undefined,
      };
      addNeed(localStorage, need);
      saveNeed(localStorage, draft, true);
      setConfirmed(true);
      setStatus(
        "Need saved. It is now available in the organiser workspace on this browser.",
      );
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the need.");
    }
  }
  if (!loaded)
    return <p className="loading-state">Opening your recruiter workspace…</p>;
  return (
    <div className="workspace recruiter-workspace">
      <div className="workspace-top">
        <Link href="/">← Home</Link>
        <span role="status">{status || "Recruiter workspace"}</span>
      </div>
      <ol className="stepper">
        {["Company & role", "12 components", "Job skills", "Review"].map(
          (label, i) => (
            <li key={label} className={i === step ? "current-step" : ""}>
              <button
                type="button"
                disabled={i > 0 && !roleReady}
                onClick={() => go(i)}
              >
                <span>{i + 1}</span>
                <span>{label}</span>
              </button>
            </li>
          ),
        )}
      </ol>
      {error && (
        <div role="alert" className="error-panel">
          {error}
        </div>
      )}
      <div className={`intake-layout ${step === 1 ? "with-rail" : ""}`}>
        {step === 1 && (
          <details className="component-navigator">
            <summary>
              Browse the 12 components <span>Five shared competencies</span>
            </summary>
            <JourneyRail
              index={index}
              onSelect={(i) => {
                setIndex(i);
                setPending(null);
                ticket.current++;
                setBusy(false);
              }}
              selected={draft.requirements
                .filter((r) => r.major)
                .map((r) => r.skill)}
            />
          </details>
        )}
        <section className="form-panel">
          {step === 0 && (
            <>
              <div className="step-heading">
                <BackgroundBeams />
                <h1>Your company. Your role.</h1>
                <p>
                  Start with a job document or your own words. Context helps
                  explain skills; you decide the requirements.
                </p>
              </div>
              {!draft.company && !draft.title && (
                <button
                  type="button"
                  className="example-start"
                  onClick={() => {
                    update({
                      company: "NordChip",
                      title: "Junior embedded developer",
                      description:
                        "Help a fictional team build reliable firmware for sensor boards. Investigate a vague bug report, run checks and share findings with hardware colleagues.",
                      context: {
                        task: "Investigate a sensor that stops reporting after a restart",
                        audience:
                          "A team of five, including hardware engineers",
                        outcome: "A reproducible fix with clear checks",
                        challenge:
                          "Incomplete reports and unfamiliar internal tools",
                      },
                      workMode: "Hybrid",
                      location: "Espoo office and hardware lab",
                      autonomy: "A mentor available when needed",
                    });
                    setContextStage(1);
                  }}
                >
                  <WorkspaceIcon name="arrow" /> Try a fictional role{" "}
                  <small>Embedded developer · NordChip</small>
                </button>
              )}
              <div className="context-stages" aria-label="Job context steps">
                {["Company", "The role", "Ways of working"].map((label, i) => (
                  <button
                    type="button"
                    key={label}
                    aria-current={contextStage === i ? "step" : undefined}
                    onClick={() => setContextStage(i)}
                  >
                    <span>{i + 1}</span>
                    {label}
                  </button>
                ))}
              </div>
              <div hidden={contextStage !== 0} className="context-stage">
                <div className="context-grid">
                  <label className="field-label">
                    Event
                    <input
                      value={draft.eventName ?? ""}
                      maxLength={120}
                      onChange={(e) => update({ eventName: e.target.value })}
                    />
                  </label>
                  <label className="field-label">
                    Company name
                    <input
                      placeholder="e.g. NordChip (fictional demo)"
                      value={draft.company ?? ""}
                      maxLength={120}
                      onChange={(e) => update({ company: e.target.value })}
                    />
                  </label>
                </div>
                <details className="context-details">
                  <summary>
                    Company context{" "}
                    <span>Public website or a description you provide</span>
                  </summary>
                  <div className="optional-skills">
                    <label className="field-label">
                      Company website
                      <input
                        type="url"
                        placeholder="https://company.example/about"
                        value={url}
                        onChange={(e) => {
                          ticket.current++;
                          setBusy(false);
                          setUrl(e.target.value);
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={!integrations.context || busy || !url}
                      onClick={collect}
                    >
                      {busy ? "Collecting…" : "Read this company page"}
                    </button>
                    <p className="quiet-note">
                      {integrations.context
                        ? "Context.dev reads only the public company page you choose. No people searches."
                        : "Website collection is not configured yet. You can paste company context below."}
                    </p>
                    <label className="field-label">
                      Company activity, products and team
                      <textarea
                        rows={5}
                        value={draft.companyContext ?? ""}
                        maxLength={16000}
                        onChange={(e) =>
                          update({
                            companyContext: e.target.value,
                            sourceUrl: undefined,
                          })
                        }
                      />
                    </label>
                    {draft.sourceUrl && (
                      <p className="quiet-note">
                        Collected from{" "}
                        <a
                          href={draft.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {draft.sourceUrl}
                        </a>
                        . Review and remove anything irrelevant before
                        approving.
                      </p>
                    )}
                  </div>
                </details>
                <div className="form-actions">
                  <p className="quiet-note">
                    One event. Different companies. Their own needs.
                  </p>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() =>
                      draft.company?.trim()
                        ? setContextStage(1)
                        : setError("Enter your company name first.")
                    }
                  >
                    Continue to the role →
                  </button>
                </div>
              </div>
              <div hidden={contextStage !== 1} className="context-stage">
                <DocumentInput
                  label="Import a job description"
                  onText={(text) => {
                    if (text.length > 16000)
                      throw new Error(
                        "This job description is too long. Paste an extract of up to 16,000 characters.",
                      );
                    update({ description: text });
                  }}
                />
                <label className="field-label">
                  Job title
                  <input
                    value={draft.title}
                    placeholder="Junior embedded developer"
                    maxLength={120}
                    onChange={(e) => update({ title: e.target.value })}
                  />
                </label>
                <label className="field-label">
                  Job description
                  <textarea
                    rows={5}
                    value={draft.description}
                    maxLength={16000}
                    onChange={(e) => update({ description: e.target.value })}
                  />
                </label>
                <div className="form-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setContextStage(0)}
                  >
                    ← Company
                  </button>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() =>
                      draft.title.trim() && draft.description.trim()
                        ? setContextStage(2)
                        : setError("Add the job title and description first.")
                    }
                  >
                    Continue to working context →
                  </button>
                </div>
              </div>
              <div hidden={contextStage !== 2} className="context-stage">
                <div className="context-grid">
                  <label className="field-label">
                    Working arrangement
                    <select
                      value={draft.workMode}
                      onChange={(e) => update({ workMode: e.target.value })}
                    >
                      <option>On site</option>
                      <option>Hybrid</option>
                      <option>Remote</option>
                    </select>
                  </label>
                  <label className="field-label">
                    Workplace or working environment
                    <input
                      value={draft.location ?? ""}
                      maxLength={120}
                      placeholder="Espoo office, lab or distributed team"
                      onChange={(e) => update({ location: e.target.value })}
                    />
                  </label>
                </div>
                <label className="field-label">
                  What support will be available?
                  <select
                    value={draft.autonomy}
                    onChange={(e) => update({ autonomy: e.target.value })}
                  >
                    <option>With guidance at first</option>
                    <option>A mentor available when needed</option>
                    <option>Mostly independent work</option>
                    <option>Helping others with complex situations</option>
                  </select>
                </label>
                <div className="context-grid">
                  {JOB_QUESTIONS.map((q) => (
                    <label key={q.key} className="field-label">
                      {q.label}
                      <textarea
                        rows={2}
                        maxLength={240}
                        value={draft.context[q.key]}
                        placeholder={q.placeholder}
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
                <label className="consent-line">
                  <input
                    type="checkbox"
                    checked={reviewed}
                    onChange={(e) => {
                      setReviewed(e.target.checked);
                      setPending(null);
                      setAccepted({});
                      ticket.current++;
                      setBusy(false);
                    }}
                  />{" "}
                  I have reviewed the job and company context. It may be used to
                  suggest examples.
                </label>
                <p className="quiet-note">
                  Use synthetic job and candidate data in this demo. Working
                  arrangement informs examples, never candidate scores.
                </p>
                <div className="form-actions">
                  <span className="quiet-note">
                    You can continue without AI.
                  </span>
                  <button
                    className="primary-button"
                    onClick={() =>
                      roleReady
                        ? go(1)
                        : setError(
                            "Enter your company, job title and job description first.",
                          )
                    }
                  >
                    Explore the 12 components →
                  </button>
                </div>
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <NeedProposal
                title={draft.title}
                job={jobContext}
                company={draft.companyContext ?? ""}
                task={draft.context.task}
                reviewed={reviewed}
                connected={integrations.ai}
                onAccept={(proposal) =>
                  update({ requirements: proposal.requirements })
                }
              />
              <p className="eyebrow">
                COMPONENT {String(index + 1).padStart(2, "0")} / 12 · {c.code}
              </p>
              <div className="step-heading">
                <BackgroundBeams />
                <h1>{c.name}</h1>
                <p>
                  Compare situations, choose an expected level, then decide
                  whether this matters for your role.
                </p>
              </div>
              <p className="role-context">
                <strong>
                  {draft.company} · {draft.title}
                </strong>
                <br />
                {draft.workMode} · {draft.location}
                <br />
                {draft.context.task || draft.description.slice(0, 220)}
              </p>
              {mentions[c.code] && (
                <details className="context-suggestion">
                  <summary>A clue from your job description</summary>
                  <p>“{mentions[c.code]}”</p>
                  <small>
                    This keyword-based suggestion does not choose a priority or
                    a level.
                  </small>
                </details>
              )}
              <div className="priority-controls">
                <div>
                  <strong>How important is this for the role?</strong>
                  <p className="quiet-note">
                    {majors} / 3 majors · {minors} minors
                  </p>
                </div>
                <div>
                  {(
                    [
                      ["major", "Major · gold"],
                      ["minor", "Minor · red"],
                      ["none", "Not required"],
                    ] as const
                  ).map(([role, label]) => (
                    <button
                      key={role}
                      data-priority={role}
                      type="button"
                      aria-pressed={
                        role === "none"
                          ? !selected
                          : role === "major"
                            ? !!selected?.major
                            : !!selected && !selected.major
                      }
                      disabled={
                        role === "major" && !selected?.major && majors >= 3
                      }
                      onClick={() => select(c.code, role)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <LevelCards
                jobTitle={draft.title}
                skill={c.code}
                value={selected?.expected ?? levelChoices[c.code]}
                examples={accepted[c.code]?.examples}
                onChange={(level) => {
                  setLevelChoices({ ...levelChoices, [c.code]: level });
                  if (!selected) {
                    setStatus(
                      "Level noted. Choose Major or Minor to include this component.",
                    );
                    setError("");
                    return;
                  }
                  update({
                    requirements: draft.requirements.map((r) =>
                      r.skill === c.code ? { ...r, expected: level } : r,
                    ),
                  });
                }}
              />
              <details className="context-details">
                <summary>
                  Context behind these examples{" "}
                  <span>Sources and optional AI assistance</span>
                </summary>
                <div className="optional-skills">
                  <p className="quiet-note">
                    {integrations.ai
                      ? `${integrations.provider} can propose examples from the passages below. You review them before use.`
                      : "AI assistance is not connected yet. Hand-written examples remain fully usable."}
                  </p>
                  {passages.map((p) => (
                    <blockquote className="source-passage" key={p.id}>
                      <strong>
                        {p.title} · {p.id}
                      </strong>
                      <p>{p.text}</p>
                      {p.url && (
                        <a href={p.url} target="_blank" rel="noreferrer">
                          Source page →
                        </a>
                      )}
                    </blockquote>
                  ))}
                  <button
                    type="button"
                    className="secondary-button"
                    disabled={!integrations.ai || !reviewed || busy}
                    onClick={generate}
                  >
                    {busy
                      ? "Preparing suggestions…"
                      : "Suggest examples from reviewed context"}
                  </button>
                  {!reviewed && (
                    <p className="quiet-note">
                      Review the context checkbox in the first step to enable
                      this.
                    </p>
                  )}
                  {pending && (
                    <div className="ai-review">
                      <h3>Review the proposed examples</h3>
                      {([1, 2, 3] as const).map((l) => (
                        <p key={l}>
                          <strong>{LEVELS[l].name}:</strong>{" "}
                          {pending.examples[l]}
                        </p>
                      ))}
                      <p className="quiet-note">
                        Sources: {pending.sourceIds.join(", ")}
                      </p>
                      <button
                        type="button"
                        className="primary-button"
                        onClick={() => {
                          setAccepted({ ...accepted, [c.code]: pending });
                          setPending(null);
                        }}
                      >
                        Use these examples
                      </button>
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => setPending(null)}
                      >
                        Keep manual examples
                      </button>
                    </div>
                  )}
                </div>
              </details>
              <div className="form-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setPending(null);
                    ticket.current++;
                    setBusy(false);
                    if (index === 0) go(0);
                    else setIndex(index - 1);
                  }}
                >
                  ← Previous
                </button>
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => {
                    setPending(null);
                    ticket.current++;
                    setBusy(false);
                    if (index === 11) go(2);
                    else setIndex(index + 1);
                  }}
                >
                  {" "}
                  {index === 11 ? "Add technical skills" : "Next component"} →
                </button>
              </div>
            </>
          )}
          {step === 1 && majors === 3 && (
            <div className="review-shortcut">
              <button
                type="button"
                className="primary-button"
                onClick={() => go(3)}
              >
                Review my need →
              </button>
            </div>
          )}
          {step === 2 && (
            <>
              <div className="step-heading">
                <BackgroundBeams />
                <h1>Add specific know-how.</h1>
                <p>
                  Choose up to {MAX_JOB_SKILLS} technical skills from the closed
                  list, grouped by job family. They are drawn as bars next to
                  the rosace and are never major components.
                </p>
              </div>
              {JOB_FAMILIES.map((family) => (
                <div key={family.code} className="job-family">
                  <p className="eyebrow">{family.name.toUpperCase()}</p>
                  {JOB_SKILLS.filter((j) => j.family === family.code).map(
                    (j) => {
                      const r = draft.requirements.find(
                        (r) => r.skill === j.code,
                      );
                      return (
                        <div className="job-skill-block" key={j.code}>
                          <label className="consent-line">
                            <input
                              type="checkbox"
                              checked={!!r}
                              disabled={!r && jobs >= MAX_JOB_SKILLS}
                              onChange={(e) =>
                                select(
                                  j.code,
                                  e.target.checked ? "job" : "none",
                                )
                              }
                            />
                            {j.name}
                          </label>
                          {r && (
                            <LevelCards
                              jobTitle={draft.title}
                              skill={j.code}
                              value={r.expected}
                              onChange={(level) =>
                                update({
                                  requirements: draft.requirements.map((x) =>
                                    x.skill === j.code
                                      ? { ...x, expected: level }
                                      : x,
                                  ),
                                })
                              }
                            />
                          )}
                        </div>
                      );
                    },
                  )}
                </div>
              ))}
              <div className="form-actions">
                <button className="secondary-button" onClick={() => go(1)}>
                  ← Components
                </button>
                <button className="primary-button" onClick={() => go(3)}>
                  Review my need →
                </button>
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <div className="step-heading">
                <BackgroundBeams />
                <h1>{draft.title}</h1>
                <p>
                  {draft.company} · {draft.eventName} · {draft.workMode}
                </p>
              </div>
              {confirmed && (
                <div role="status" className="success-panel">
                  <div>
                    <strong>Need confirmed and saved</strong>
                    <p>Available in the organiser workspace in this browser.</p>
                    <Link href="/organiser">
                      Open the organiser workspace →
                    </Link>
                  </div>
                </div>
              )}
              <p className="review-description">{draft.description}</p>
              <div className="review-list">
                {draft.requirements.map((r) => (
                  <div key={r.skill}>
                    <i className={r.major ? "gold-dot" : "red-dot"} />
                    <div>
                      <strong>{skillName(r.skill)}</strong>
                      <small>
                        {r.major
                          ? "Major"
                          : isComponent(r.skill)
                            ? "Minor"
                            : "Job skill"}{" "}
                        · {LEVELS[r.expected].name}
                      </small>
                      <small>
                        How it’s checked: {verificationLabel(r.skill)} · To
                        check
                      </small>
                      <p className="quiet-note">
                        {verificationFor(r.skill).situation}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="text-button"
                      onClick={() => {
                        const i = COMPONENTS.findIndex(
                          (c) => c.code === r.skill,
                        );
                        if (i >= 0) {
                          setIndex(i);
                          go(1);
                        } else go(2);
                      }}
                    >
                      Edit
                    </button>
                  </div>
                ))}
              </div>
              <label className="capacity-field">
                <span>People to meet</span>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={Number.isNaN(draft.capacity) ? "" : draft.capacity}
                  onChange={(e) => update({ capacity: e.target.valueAsNumber })}
                />
              </label>
              <div className="form-actions">
                <button className="secondary-button" onClick={() => go(0)}>
                  Edit company & role
                </button>
                <button className="primary-button" onClick={confirm}>
                  Confirm and save need ✓
                </button>
              </div>
            </>
          )}
        </section>
        <LivePreview
          label="Live need preview"
          summary={`${majors} of 3 majors · ${minors} minors · ${jobs} job skills`}
        >
          <p className="eyebrow">
            {draft.company || "YOUR COMPANY"} · EXPECTED SKILLS
          </p>
          <Rosace
            title={draft.title || "Your role takes shape"}
            size={480}
            labels="short"
            activeSkill={step === 1 ? c.code : undefined}
            onSelect={roleReady ? exploreSkill : undefined}
            preview={
              step === 1 && !selected && levelChoices[c.code]
                ? { skill: c.code, level: levelChoices[c.code] }
                : undefined
            }
            expected={Object.fromEntries(
              draft.requirements
                .filter((r) => isComponent(r.skill))
                .map((r) => [r.skill, { level: r.expected, major: r.major }]),
            )}
          />
          <div className="chart-instruction">
            <WorkspaceIcon name="pointer" />
            {step === 1 && !selected && levelChoices[c.code]
              ? "Preview only · Choose Major or Minor to include this level"
              : roleReady
                ? "Select a branch to explore its levels"
                : "Your role will take shape here"}
          </div>
          <div className="preview-summary">
            <span>
              {majors}
              <small>of 3 majors</small>
            </span>
            <span>
              {minors}
              <small>minors</small>
            </span>
            <span>
              {jobs}
              <small>of {MAX_JOB_SKILLS} technical skills</small>
            </span>
          </div>
          <p className="quiet-note">
            Gold: majors. Red: minors. An empty branch is not selected.
            Technical skills are the bars below the rosace.
          </p>
          <SkillBars
            items={draft.requirements
              .filter((r) => !isComponent(r.skill))
              .map((r) => ({ code: r.skill, expected: r.expected }))}
          />
          <details className="chart-help">
            <summary>Read the levels</summary>
            <p>
              Grey disk: Foundation. Inner ring: Intermediate. Outer circle:
              Advanced.
            </p>
          </details>
        </LivePreview>
      </div>
      <div className="workspace-bottom">
        <Link href="/talent/new">Explore the talent journey →</Link>
        <button
          type="button"
          onClick={() => {
            try {
              localStorage.removeItem(NEED_STORAGE_KEY);
              setDraft(initial());
              setConfirmed(false);
              setReviewed(false);
              setAccepted({});
              setLevelChoices({});
              setContextStage(0);
              setUrl("");
              setIndex(0);
              go(0);
            } catch {
              setError("Could not clear this draft.");
            }
          }}
        >
          Clear the draft
        </button>
      </div>
    </div>
  );
}
