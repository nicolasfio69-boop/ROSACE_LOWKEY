"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { NEEDS, TALENTS } from "@/data/demo";
import {
  COMPONENTS,
  isComponent,
  skillActivity,
  skillName,
  descriptor,
} from "@/lib/framework";
import {
  align,
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
import { Rosace } from "./Rosace";
export function ConversationBrief() {
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
  const alignment = align(need, talent),
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
      <div className="workspace-grid">
        <div className="form-panel">
          <h2>Why talk?</h2>
          <p className="quiet-note">
            Declared alignment: {alignment.points} out of {alignment.max}. This
            is a preparation aid, not proof of ability. Above-expected levels do
            not earn extra points.
          </p>
          <h3>Questions for this conversation</h3>
          {[
            ...need.requirements.filter((r) => r.major),
            ...need.requirements.filter((r) => !isComponent(r.skill)),
          ]
            .slice(0, 5)
            .map((r, i) => (
              <article key={r.skill} className="question-brief">
                <p className="eyebrow">
                  QUESTION {i + 1} · {skillName(r.skill)}
                </p>
                <h3>Tell me about a time when you {skillActivity(r.skill)}.</h3>
                <p>
                  What did you do yourself? What help did you need? What made it
                  difficult, and what happened?
                </p>
                <details>
                  <summary>What to listen for</summary>
                  <p>{descriptor(r.skill, r.expected)}</p>
                  <p>
                    A specific situation, the person’s own actions, the support
                    they needed and a concrete outcome. Clarify uncertainty
                    instead of guessing.
                  </p>
                </details>
              </article>
            ))}
          <p>
            <Link href="/practice">
              Explore a fictional exercise together →
            </Link>
          </p>
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
        <aside className="live-panel">
          <Rosace
            title="Declared vs expected"
            size={300}
            labels="short"
            declared={declared}
            expected={expected}
          />
          <p className="quiet-note">
            Dotted bars: declared. Black ticks: expected. Gold: major
            components.
          </p>
          <Rosace
            title="Observed separately"
            size={300}
            labels="short"
            observedLevels={Object.fromEntries(
              need.requirements
                .filter((r) => isComponent(r.skill))
                .map((r) => {
                  const observation =
                    seen.find((s) => s.skill === r.skill)?.observation ?? "NE";
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
        </aside>
      </div>
    </div>
  );
}
