"use client";
import { BackgroundBeams } from "./BackgroundBeams";
import Link from "next/link";
import { useEffect, useState } from "react";
import { NEEDS, TALENTS } from "@/data/demo";
import { COMPONENTS, isComponent, skillName } from "@/lib/framework";
import { OBSERVATION_LABELS, type Observation } from "@/lib/scoring";
import {
  emptyWorkspace,
  loadWorkspace,
  recordObservation,
  type Workspace,
} from "@/lib/workspace";
import { prepareConversation } from "@/lib/conversation";
import { verificationFor, verificationLabel } from "@/lib/verification";
import { meanObservedValue } from "@/lib/observations";
import { SkillBars } from "./SkillBars";
import { Rosace } from "./Rosace";
import { LivePreview } from "./LivePreview";
export function ConversationBrief() {
  const [savedObservation, setSavedObservation] = useState("");
  const [mode, setMode] = useState<"prepare" | "observe">("prepare");
  const [workspace, setWorkspace] = useState<Workspace>(emptyWorkspace),
    [ids, setIds] = useState<{ need: string; talent: string } | null>(null),
    [error, setError] = useState("");
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    setIds({
      need: query.get("need") ?? "",
      talent: query.get("talent") ?? "",
    });
    try {
      setWorkspace(loadWorkspace(localStorage));
    } catch {
      setError("Local data could not be read.");
    }
  }, []);
  if (!ids) return <p className="loading-state">Preparing the conversation…</p>;
  const need = [...NEEDS, ...workspace.needs].find((n) => n.id === ids.need),
    talent = [...TALENTS, ...workspace.talents.map((t) => t.talent)].find(
      (t) => t.id === ids.talent,
    );
  if (!need || !talent)
    return (
      <div className="form-panel">
        <h1>Conversation not found</h1>
        <p>The local card may have been deleted or expired.</p>
        <Link href="/organiser">Return to the organiser</Link>
      </div>
    );
  const brief = prepareConversation(need, talent);
  const alignment = brief.alignment,
    seen = workspace.observations.filter(
      (s) => s.needId === need.id && s.talentId === talent.id,
    ),
    expected = Object.fromEntries(
      need.requirements
        .filter((r) => isComponent(r.skill))
        .map((r) => [r.skill, { level: r.expected, major: r.major }]),
    );
  const declared = Object.fromEntries(
    COMPONENTS.map((c) => [c.code, talent.statements[c.code]?.level ?? null]),
  );
  function observe(skill: string, observation: Observation) {
    if (skill === "C4.3") return;
    try {
      recordObservation(localStorage, {
        needId: ids!.need,
        talentId: ids!.talent,
        skill,
        observation,
        taskLevel: need!.requirements.find((r) => r.skill === skill)!.expected,
        source: "interview",
      });
      setWorkspace(loadWorkspace(localStorage));
      setError("");
      setSavedObservation(
        `Observation saved · ${skillName(skill)} · ${OBSERVATION_LABELS[observation]}`,
      );
    } catch {
      setSavedObservation("");
      setError("Could not save this observation.");
    }
  }
  return (
    <div className="workspace">
      <Link href="/conversations" className="back-link">
        ← Conversations
      </Link>
      <div className="step-heading">
        <BackgroundBeams />
        <h1>
          {talent.pseudonym} × {need.company}
        </h1>
        <p>
          {need.title} · Explore the evidence together and record only what you
          observe.
        </p>
      </div>
      {error && (
        <p role="alert" className="error-panel">
          {error}
        </p>
      )}
      <div className="brief-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            setMode("prepare");
            window.setTimeout(() => window.print(), 50);
          }}
        >
          Print this brief
        </button>
        <small>One page to keep on the table during an in-person meeting.</small>
      </div>
      <div className="brief-tabs" aria-label="Conversation stage">
        <button
          type="button"
          aria-pressed={mode === "prepare"}
          onClick={() => setMode("prepare")}
        >
          01 · Prepare together
        </button>
        <button
          type="button"
          aria-pressed={mode === "observe"}
          onClick={() => setMode("observe")}
        >
          02 · Record observations
        </button>
      </div>
      <div className="workspace-grid">
        <div className="form-panel">
          <div hidden={mode !== "prepare"}>
            <p className="eyebrow">WHY THIS CONVERSATION?</p>
            <div className="brief-facts">
              <div>
                <strong>A starting point</strong>
                <p>
                  {brief.connections.length
                    ? `Declared experience connects with ${brief.connections.slice(0, 3).join(", ")}.`
                    : "The card gives little detail for this role so far. A conversation can clarify relevant experience."}
                </p>
              </div>
              <div>
                <strong>Worth exploring</strong>
                <p>
                  {brief.toExplore.length
                    ? brief.toExplore.join(" · ")
                    : "Ask for a concrete example behind each declared level."}
                </p>
              </div>
            </div>
            <details className="context-details">
              <summary>
                Declared alignment · {alignment.points} out of {alignment.max}
              </summary>
              <p className="quiet-note">
                A preparation aid, not proof of ability. Above-expected levels
                do not earn extra points.
              </p>
            </details>
            <h2 style={{ marginTop: 24 }}>Your conversation guide</h2>
            <p className="quiet-note">
              Use at most 10 minutes in total for on-site situations. Select the
              situations relevant to this conversation.
            </p>
            {need.requirements
              .filter((r) => verificationFor(r.skill).modes.includes("onsite"))
              .map((r) => (
                <article className="question-brief" key={r.skill}>
                  <p className="eyebrow">
                    On-site situation · 10-minute shared allowance
                  </p>
                  <h3>{skillName(r.skill)}</h3>
                  <p>{verificationFor(r.skill).situation}</p>
                  <p>
                    Task level: {r.expected}. Observe the result, the help
                    needed and how the person responds to new information.
                  </p>
                  <div
                    className="tour-answers"
                    role="group"
                    aria-label={`On-site grade: ${skillName(r.skill)}`}
                  >
                    {Object.entries(OBSERVATION_LABELS).map(([code, label]) => (
                      <button
                        key={code}
                        aria-pressed={seen.some(
                          (s) =>
                            s.skill === r.skill &&
                            s.observation === code &&
                            (!s.source || s.source === "interview"),
                        )}
                        onClick={() => observe(r.skill, code as Observation)}
                      >
                        {code} — {label}
                      </button>
                    ))}
                  </div>
                </article>
              ))}
            {brief.questions.map((q, i) => (
              <article key={q.skill} className="question-brief">
                <p className="eyebrow">
                  {String(i + 1).padStart(2, "0")} /{" "}
                  {q.major ? "MAJOR COMPONENT" : "JOB SKILL"} · {q.name}
                </p>
                <div className="level-comparison">
                  <span>
                    Expected <strong>{q.expected}</strong>
                  </span>
                  <span>
                    Declared <strong>{q.declared}</strong>
                  </span>
                </div>
                <p className="brief-reason">{q.reason}</p>
                <h3>{q.question}</h3>
                <p>{q.followUp}</p>
                <details>
                  <summary>What to listen for in this role</summary>
                  <p>{q.descriptor}</p>
                  <div className="brief-work-example">
                    <p className="eyebrow">IN PRACTICE · {need.title}</p>
                    <p>{q.example}</p>
                    {q.jobReason && <p>Why it matters: {q.jobReason}</p>}
                  </div>
                </details>
              </article>
            ))}
          </div>
          <div hidden={mode !== "observe"}>
            <h2>After the conversation</h2>
            <p role="status" className="observation-status">
              {savedObservation ||
                "Choose what you observed. Each change is saved in this browser."}
            </p>
            <p className="quiet-note">
              A = Seen clearly · C = Seen in part · F = Not seen · NE = Not
              covered. Observations stay separate from declared levels.
            </p>
            {need.requirements.map((r) => {
              if (r.skill === "C4.3")
                return (
                  <article className="question-brief" key={r.skill}>
                    <strong>{skillName(r.skill)}</strong>
                    <p>Discussed, not observed</p>
                    <p>{verificationFor(r.skill).situation}</p>
                  </article>
                );
              const observation =
                seen.find(
                  (s) =>
                    s.skill === r.skill &&
                    (!s.source || s.source === "interview"),
                )?.observation ?? "NE";
              return (
                <label className="observation-row" key={r.skill}>
                  <span>
                    <strong>{skillName(r.skill)}</strong>
                    <small>
                      How it’s checked: {verificationLabel(r.skill)}
                    </small>
                  </span>
                  <select
                    value={observation}
                    onChange={(e) =>
                      observe(r.skill, e.target.value as Observation)
                    }
                  >
                    {Object.entries(OBSERVATION_LABELS).map(([code, label]) => (
                      <option key={code} value={code}>
                        {code} — {label}
                      </option>
                    ))}
                  </select>
                  <small>
                    {observation !== "NE"
                      ? `Saved · ${OBSERVATION_LABELS[observation]}`
                      : "Not covered"}
                  </small>
                </label>
              );
            })}
          </div>
        </div>
        <LivePreview
          label="Conversation rosace"
          summary={
            mode === "prepare"
              ? "Declared · Expected"
              : `${seen.filter((s) => s.observation !== "NE").length} observations saved`
          }
        >
          <div hidden={mode !== "prepare"}>
            <Rosace
              title="Declared vs expected"
              size={440}
              labels="short"
              declared={declared}
              expected={expected}
            />
            <p className="quiet-note">
              Dotted bars: declared. Black ticks: expected. Gold: major
              components.
            </p>
          </div>
          <div hidden={mode !== "observe"}>
            <Rosace
              title="Observed separately"
              size={440}
              labels="short"
              observedLevels={Object.fromEntries(
                need.requirements
                  .filter((r) => isComponent(r.skill))
                  .map((r) => {
                    return [
                      r.skill,
                      meanObservedValue(
                        seen.filter((s) => s.skill === r.skill),
                        r.expected,
                      ),
                    ];
                  }),
              )}
              observed={Object.fromEntries(
                need.requirements.map((r) => [r.skill, true]),
              )}
              expected={expected}
            />
            <p className="quiet-note">
              Solid bars: mean of observed task-level values. “Not covered”
              stays empty. These values never change the declared card.
            </p>
            <details className="chart-help">
              <summary>Compare with the original declaration</summary>
              <Rosace
                title="Original declaration · unchanged"
                size={440}
                labels="short"
                declared={declared}
                expected={expected}
              />
              <p className="quiet-note">
                Dotted bars are the talent’s confirmed declarations.
                Observations above are separate.
              </p>
            </details>
          </div>
          <SkillBars
            items={need.requirements
              .filter((r) => !isComponent(r.skill))
              .map((r) => ({
                code: r.skill,
                expected: r.expected,
                level: talent.statements[r.skill]?.level ?? null,
                ...(mode === "observe"
                  ? {
                      observedValue: meanObservedValue(
                        seen.filter((s) => s.skill === r.skill),
                        r.expected,
                      ),
                    }
                  : {}),
              }))}
          />
        </LivePreview>
      </div>
    </div>
  );
}
