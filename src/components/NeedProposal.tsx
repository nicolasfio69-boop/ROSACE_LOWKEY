"use client";
import { useRef, useState } from "react";
import { LEVELS, skillName } from "@/lib/framework";
import type { RequirementProposal } from "@/lib/ai-proposals";
export function NeedProposal({
  title,
  job,
  company,
  task,
  reviewed,
  connected,
  onAccept,
}: {
  title: string;
  job: string;
  company: string;
  task: string;
  reviewed: boolean;
  connected: boolean;
  onAccept: (p: RequirementProposal) => void;
}) {
  const [proposal, setProposal] = useState<RequirementProposal | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const current = useRef("");
  const context = JSON.stringify({ title, job, company, task });
  current.current = context;
  const [proposalContext, setProposalContext] = useState("");
  async function request() {
    setBusy(true);
    setError("");
    const version = context;
    try {
      const r = await fetch("/api/need-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, job, company, task, reviewed }),
      });
      const data = await r.json();
      if (!r.ok) throw Error(data.error);
      if (current.current === version) {
        setProposal(data);
        setProposalContext(version);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Proposal unavailable.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <details className="context-details">
      <summary>Suggest requirements with Claude</summary>
      <p>
        Claude retrieves relevant passages from the reviewed job and company
        context. Review the reasons and sources before replacing your selection.
      </p>
      <button
        className="secondary-button"
        disabled={!connected || !reviewed || busy}
        onClick={request}
      >
        {busy ? "Preparing a proposal…" : "Suggest components for this role"}
      </button>
      {!connected && (
        <p className="quiet-note">
          Claude is not configured. You can choose requirements manually.
        </p>
      )}
      {!reviewed && (
        <p className="quiet-note">
          Review the context checkbox in Company & role first.
        </p>
      )}
      {error && <p role="alert">{error}</p>}
      {proposal && proposalContext === context && (
        <div className="ai-review">
          <h3>Proposal · not applied</h3>
          {proposal.requirements.map((r) => (
            <article key={r.skill} className="question-brief">
              <strong>
                {skillName(r.skill)} · {r.major ? "Major" : "Supporting"} ·{" "}
                {LEVELS[r.expected].name}
              </strong>
              <p>{r.reason}</p>
              {proposal.passages
                .filter((p) => r.sourceIds.includes(p.id))
                .map((p) => (
                  <blockquote className="source-passage" key={p.id}>
                    <small>
                      {p.title} · {p.id}
                    </small>
                    <p>{p.text}</p>
                  </blockquote>
                ))}
            </article>
          ))}
          <button
            className="primary-button"
            disabled={!reviewed}
            onClick={() => {
              onAccept(proposal);
              setProposal(null);
            }}
          >
            Use these requirements
          </button>
          <button className="text-button" onClick={() => setProposal(null)}>
            Discard proposal
          </button>
        </div>
      )}
    </details>
  );
}
