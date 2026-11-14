"use client";
import { useRef, useState } from "react";
import { LEVELS, type ExpectedLevel } from "@/lib/framework";
import { approveExercise } from "@/lib/workspace";
import type { ExerciseProposal } from "@/lib/ai-proposals";
export function ExerciseDesigner({
  needId,
  title,
  job,
  company,
  skill,
  level,
  connected,
  onApproved,
}: {
  needId: string;
  title: string;
  job: string;
  company: string;
  skill: string;
  level: ExpectedLevel;
  connected: boolean;
  onApproved: () => void;
}) {
  const [reviewed, setReviewed] = useState(false),
    [proposal, setProposal] = useState<ExerciseProposal | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [approved, setApproved] = useState(false);
  const revision = useRef(0);
  async function request() {
    const version = ++revision.current;
    setBusy(true);
    setError("");
    setApproved(false);
    try {
      const r = await fetch("/api/check-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          needId,
          title,
          job,
          company,
          skill,
          level,
          reviewed,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw Error(data.error);
      if (version === revision.current) setProposal(data);
    } catch (e) {
      if (version === revision.current)
        setError(e instanceof Error ? e.message : "Proposal unavailable.");
    } finally {
      if (version === revision.current) setBusy(false);
    }
  }
  function accept() {
    if (!proposal || !reviewed) return;
    try {
      approveExercise(localStorage, needId, proposal);
      onApproved();
      setProposal(null);
      setApproved(true);
    } catch {
      setError("Could not save the approved exercise.");
    }
  }
  return (
    <details className="context-details">
      <summary>Prepare an exercise with Claude</summary>
      <p>
        For this job at {LEVELS[level].name}. The written demo exercise stays
        available until you accept a proposal.
      </p>
      <details>
        <summary>Context sent for retrieval</summary>
        <p>{job}</p>
        {company && <p>{company}</p>}
      </details>
      <label className="consent-line">
        <input
          type="checkbox"
          checked={reviewed}
          onChange={(e) => {
            setReviewed(e.target.checked);
            revision.current++;
            setBusy(false);
            setProposal(null);
          }}
        />
        I reviewed this fictional job and company context for Claude.
      </label>
      <button
        className="secondary-button"
        disabled={!connected || !reviewed || busy}
        onClick={request}
      >
        {busy ? "Drafting an exercise…" : "Propose an exercise"}
      </button>
      {!connected && (
        <p className="quiet-note">
          Claude is not configured. The written demo works now.
        </p>
      )}
      {error && <p role="alert">{error}</p>}
      {approved && (
        <p role="status">
          Exercise approved · available in the candidate workspace.
        </p>
      )}
      {proposal && (
        <div className="ai-review">
          <h3>Draft · not visible to candidates yet</h3>
          <p className="check-prompt">{proposal.prompt}</p>
          <ul>
            {proposal.checks.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <p>{proposal.minutes} minutes · human grading only</p>
          {proposal.passages.map((p) => (
            <blockquote key={p.id} className="source-passage">
              <small>
                {p.title} · {p.id}
              </small>
              <p>{p.text}</p>
            </blockquote>
          ))}
          <button className="primary-button" onClick={accept}>
            Approve this exercise
          </button>
          <button className="text-button" onClick={() => setProposal(null)}>
            Discard draft
          </button>
        </div>
      )}
    </details>
  );
}
