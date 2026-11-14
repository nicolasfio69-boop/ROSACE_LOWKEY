"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
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
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not record the decision.",
      );
    }
  }
  if (!ready)
    return <p className="loading-state">Opening the event workspace…</p>;
  return (
    <div className="workspace">
      <p className="eyebrow">ESPOO TECH MATCHMAKING · ORGANISER</p>
      <div className="step-heading">
        <h1>Turn suggestions into conversations.</h1>
        <p>
          Review needs, ties and people without suggestions. Every decision is
          yours, with a short reason.
        </p>
      </div>
      <div className="role-links">
        <Link href="/need/new" className="primary-button">
          Prepare a company need →
        </Link>
        <Link href="/talent/new" className="secondary-button">
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
      <div className="organiser-grid">
        {results.map((result) => (
          <section className="form-panel" key={result.need.id}>
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
                Tie at the cut:{" "}
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
              {talents.map((talent) => {
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
                      ? "Not eligible under the current rule"
                      : "No suggestion for this need";
                return (
                  <article className="meeting-card" key={talent.id}>
                    <div>
                      <strong>{talent.pseudonym}</strong>
                      <span className="small-badge">{label}</span>
                    </div>
                    <p className="quiet-note">
                      Alignment: {a.points} out of {a.max}. To check:{" "}
                      {[...a.missingMajors, ...a.missingJobSkills]
                        .map(skillName)
                        .join(", ") || "No missing major or job requirement"}
                      .
                    </p>
                    <label className="field-label">
                      Reason for {talent.pseudonym}
                      <input
                        maxLength={300}
                        placeholder="Why include or remove this person?"
                        value={reasons[key] ?? ""}
                        onChange={(e) =>
                          setReasons({ ...reasons, [key]: e.target.value })
                        }
                      />
                    </label>
                    <div className="role-links">
                      <button
                        className="secondary-button"
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
                      <p className="decision-note">
                        {decision.approved ? "Approved" : "Removed"} ·{" "}
                        {decision.reason}
                      </p>
                    )}
                  </article>
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
