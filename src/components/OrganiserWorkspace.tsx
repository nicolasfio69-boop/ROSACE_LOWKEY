"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { NEEDS, TALENTS } from "@/data/demo";
import {
  suggestForNeed,
  withoutSuggestion,
  NO_SUGGESTION_LABELS,
} from "@/lib/suggestions";
import {
  loadWorkspace,
  recordMeeting,
  WORKSPACE_KEY,
  emptyWorkspace,
  type Workspace,
} from "@/lib/workspace";
import { skillName } from "@/lib/framework";

export function OrganiserWorkspace() {
  const reasonInputs = useRef<Record<string, HTMLInputElement | null>>({});
  const [decisionErrors, setDecisionErrors] = useState<Record<string, string>>(
    {},
  );
  const [activeNeed, setActiveNeed] = useState("");
  const [workspace, setWorkspace] = useState<Workspace>(emptyWorkspace),
    [ready, setReady] = useState(false),
    [error, setError] = useState(""),
    [reasons, setReasons] = useState<Record<string, string>>({});
  function reload() {
    try {
      setWorkspace(loadWorkspace(localStorage));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load local data.");
    }
  }
  useEffect(() => {
    reload();
    setReady(true);
    window.addEventListener("storage", reload);
    return () => window.removeEventListener("storage", reload);
  }, []);
  const needs = [...NEEDS, ...workspace.needs],
    talents = [...TALENTS, ...workspace.talents.map((t) => t.talent)],
    results = needs.map((need) => suggestForNeed(need, talents)),
    missing = withoutSuggestion(results, talents);
  function decide(needId: string, talentId: string, approved: boolean) {
    const key = `${needId}:${talentId}`;
    try {
      recordMeeting(localStorage, {
        needId,
        talentId,
        approved,
        reason: reasons[key] ?? "",
      });
      reload();
      setDecisionErrors((previous) => ({ ...previous, [key]: "" }));
    } catch (e) {
      setDecisionErrors((previous) => ({
        ...previous,
        [key]:
          e instanceof Error ? e.message : "Could not record the decision.",
      }));
      reasonInputs.current[key]?.focus();
    }
  }
  if (!ready)
    return <p className="loading-state">Opening the event workspace…</p>;
  return (
    <div className="workspace">
      <p className="eyebrow">ESPOO TECH MATCHMAKING · ORGANISER</p>
      <div className="step-heading">
        <h1>Review the proposed meetings.</h1>
        <p>
          Review needs, ties and people without suggestions. Every decision is
          yours, with a short reason.
        </p>
      </div>
      <div className="role-links">
        <Link href="/need/new" className="text-button">
          Prepare a company need →
        </Link>
        <Link href="/talent/new" className="text-button">
          Create a fictional talent card →
        </Link>
      </div>
      <p className="quiet-note">
        Local demo: all roles share this browser. Existing examples are
        fictional. Saved needs and consented talent cards appear below; there
        are no real accounts or shared server data yet.
      </p>
      {error && (
        <p role="alert" className="error-panel">
          {error}
        </p>
      )}
      <section className="form-panel no-suggestion">
        <h2>People without a suggestion</h2>
        {missing.length ? (
          missing.map(({ talent, reason }) => (
            <p key={talent.id}>
              <strong>{talent.pseudonym}</strong> ·{" "}
              {NO_SUGGESTION_LABELS[reason]}
            </p>
          ))
        ) : (
          <p>Every talent has a suggestion or a tie to review.</p>
        )}
      </section>
      <div className="need-switcher" aria-label="Choose a company need">
        {results.map((result) => (
          <button
            type="button"
            key={result.need.id}
            aria-pressed={
              (activeNeed || results[0]?.need.id) === result.need.id
            }
            onClick={() => setActiveNeed(result.need.id)}
          >
            <span>{result.need.company}</span>
            <strong>{result.need.title}</strong>
            <small>
              {result.suggested.length} suggestions · {result.tied.length} tied
              for review
            </small>
          </button>
        ))}
      </div>
      <div className="organiser-grid">
        {results.map((result) => (
          <section
            className="form-panel"
            key={result.need.id}
            hidden={(activeNeed || results[0]?.need.id) !== result.need.id}
          >
            <p className="eyebrow">{result.need.company}</p>
            <h2>{result.need.title}</h2>
            <p className="quiet-note">
              Capacity: {result.need.capacity} ·{" "}
              {result.need.requirements
                .filter((r) => r.major)
                .map((r) => skillName(r.skill))
                .join(" · ")}
            </p>
            {result.tied.length > 0 && (
              <p className="role-context">
                Same fit for the last place:{" "}
                {result.tied
                  .map(
                    (a) => talents.find((t) => t.id === a.talentId)?.pseudonym,
                  )
                  .join(", ")}
                . No tie is broken automatically.
              </p>
            )}
            <details open>
              <summary>Review the people for this need</summary>
              {talents.map((talent, candidateIndex) => {
                const key = `${result.need.id}:${talent.id}`;
                const a = [
                  ...result.suggested,
                  ...result.tied,
                  ...result.others,
                  ...result.ineligible,
                ].find((a) => a.talentId === talent.id)!;
                const decision = workspace.journal
                  .filter(
                    (m) =>
                      m.needId === result.need.id && m.talentId === talent.id,
                  )
                  .at(-1);
                const label = result.suggested.includes(a)
                  ? "Suggested"
                  : result.tied.includes(a)
                    ? "Tie — organiser decision"
                    : result.ineligible.includes(a)
                      ? "More information needed"
                      : "No suggestion for this need";
                return (
                  <details className="meeting-card" key={talent.id} style={{animationDelay:`${candidateIndex * 70}ms`}}>
                    <summary className="candidate-summary">
                      <span className="candidate-avatar" aria-hidden="true">
                        {talent.pseudonym.slice(0, 1)}
                      </span>
                      <div>
                        <strong>{talent.pseudonym}</strong>
                        <span className="small-badge">{label}</span>
                      </div>
                      <span className="candidate-open">Review →</span>
                    </summary>
                    <p className="quiet-note">
                      {a.complete
                        ? "Enough of this need is filled in"
                        : "More information is needed"}{" "}
                      · {a.rows.filter((row) => row.level !== null).length} of{" "}
                      {a.rows.length} requirements described.
                      <br />
                      Declared alignment: {a.points} out of {a.max}. To check:{" "}
                      {[...a.missingMajors, ...a.missingJobSkills]
                        .map(skillName)
                        .join(", ") || "No missing major or job requirement"}
                      .
                    </p>
                    <label className="field-label">
                      Reason for {talent.pseudonym}
                      <input
                        ref={(node) => {
                          reasonInputs.current[key] = node;
                        }}
                        aria-invalid={!!decisionErrors[key]}
                        aria-describedby={
                          decisionErrors[key]
                            ? `reason-error-${key}`
                            : undefined
                        }
                        maxLength={300}
                        placeholder="Why include or remove this person?"
                        value={reasons[key] ?? ""}
                        onChange={(e) => {
                          setReasons({ ...reasons, [key]: e.target.value });
                          setDecisionErrors((previous) => ({
                            ...previous,
                            [key]: "",
                          }));
                        }}
                      />
                    </label>
                    {decisionErrors[key] && (
                      <p
                        role="alert"
                        className="inline-error"
                        id={`reason-error-${key}`}
                      >
                        {decisionErrors[key]}
                      </p>
                    )}
                    <div className="role-links">
                      <button
                        className="primary-button"
                        onClick={() => decide(result.need.id, talent.id, true)}
                      >
                        Approve / add
                      </button>
                      <button
                        className="secondary-button"
                        onClick={() => decide(result.need.id, talent.id, false)}
                      >
                        Remove
                      </button>
                      <Link
                        className="text-button"
                        href={`/brief?need=${encodeURIComponent(result.need.id)}&talent=${encodeURIComponent(talent.id)}`}
                      >
                        Prepare conversation →
                      </Link>
                    </div>
                    {decision && (
                      <p className="decision-note" role="status">
                        {decision.approved ? "Approved" : "Removed"} ·{" "}
                        {decision.reason}
                      </p>
                    )}
                  </details>
                );
              })}
            </details>
          </section>
        ))}
      </div>
      <section className="form-panel">
        <h2>Decision journal</h2>
        {workspace.journal.length === 0 ? (
          <p className="quiet-note">No decisions recorded yet.</p>
        ) : (
          <ol>
            {workspace.journal.map((m, i) => (
              <li className="journal-entry" key={i}>
                {new Date(m.at).toLocaleString()} ·{" "}
                {talents.find((t) => t.id === m.talentId)?.pseudonym ??
                  m.talentId}{" "}
                · {needs.find((n) => n.id === m.needId)?.title ?? m.needId} ·{" "}
                {m.approved ? "Approved" : "Removed"}
                <p>{m.reason}</p>
              </li>
            ))}
          </ol>
        )}
        <button
          className="secondary-button"
          onClick={() => {
            if (
              window.confirm(
                "Delete all locally saved needs, talent cards, decisions and observations? The synthetic examples will remain.",
              )
            ) {
              try {
                localStorage.removeItem(WORKSPACE_KEY);
                reload();
              } catch {
                setError("Could not clear local data.");
              }
            }
          }}
        >
          Clear local event data
        </button>
      </section>
    </div>
  );
}
