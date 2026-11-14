"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { NEEDS, TALENTS } from "@/data/demo";
import { COMPONENTS, isComponent, skillName } from "@/lib/framework";
import {
  OBSERVATION_LABELS,
  observedValue,
  type Observation,
} from "@/lib/scoring";
import {
  emptyWorkspace,
  loadWorkspace,
  recordObservation,
  type Workspace,
} from "@/lib/workspace";
import { prepareConversation } from "@/lib/conversation";
import { Rosace } from "./Rosace";
export function ConversationBrief() {
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
    try {
      recordObservation(localStorage, {
        needId: ids!.need,
        talentId: ids!.talent,
        skill,
        observation,
      });
      setWorkspace(loadWorkspace(localStorage));
      setError("");
    } catch {
      setError("Could not save this observation.");
    }
  }
  return (
    <div className="workspace">
      <Link href="/organiser" className="back-link">
        ← Organiser
      </Link>
      <div className="step-heading">
        <p className="eyebrow">A CONVERSATION, NOT A VERDICT</p>
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
            <p>
              <Link href="/practice">
                Explore a fictional exercise together →
              </Link>
            </p>
          </div>
          <div hidden={mode !== "observe"}>
            <h2>After the conversation</h2>
            <p className="quiet-note">
              A = Seen clearly · C = Seen in part · F = Not seen · NE = Not
              covered. Observations stay separate from declared levels.
            </p>
            {need.requirements.map((r) => {
              const observation =
                seen.find((s) => s.skill === r.skill)?.observation ?? "NE";
              return (
                <label className="observation-row" key={r.skill}>
                  <span>{skillName(r.skill)}</span>
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
                      ? `Observed value at expected level ${r.expected}: ${observedValue(r.expected, observation)}`
                      : "Not covered"}
                  </small>
                </label>
              );
            })}
          </div>
        </div>
        <aside className="live-panel">
          <div hidden={mode !== "prepare"}>
            <p className="eyebrow">EXPECTATIONS MEET EXPERIENCE</p>
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
            <p className="eyebrow">WHAT YOU ACTUALLY OBSERVED</p>
            <Rosace
              title="Observed separately"
              size={440}
              labels="short"
              observedLevels={Object.fromEntries(
                need.requirements
                  .filter((r) => isComponent(r.skill))
                  .map((r) => {
                    const observation =
                      seen.find((s) => s.skill === r.skill)?.observation ??
                      "NE";
                    return [r.skill, observedValue(r.expected, observation)];
                  }),
              )}
              observed={Object.fromEntries(
                need.requirements.map((r) => [r.skill, true]),
              )}
              expected={expected}
            />
            <p className="quiet-note">
              Solid bars: observation at the expected task level. “Not covered”
              stays empty. These values never change the declared card.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
