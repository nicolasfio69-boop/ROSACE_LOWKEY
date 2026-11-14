"use client";
import { WorkspaceIcon } from "./WorkspaceIcon";
import Link from "next/link";
import { useEffect, useState } from "react";
import { NEEDS, TALENTS } from "@/data/demo";
import { emptyWorkspace, loadWorkspace, type Workspace } from "@/lib/workspace";
export function Conversations() {
  const [workspace, setWorkspace] = useState<Workspace>(emptyWorkspace),
    [error, setError] = useState("");
  useEffect(() => {
    function read() {
      try {
        setWorkspace(loadWorkspace(localStorage));
        setError("");
      } catch {
        setError(
          "Could not read saved conversations. Open the event desk to review local data.",
        );
      }
    }
    read();
    window.addEventListener("storage", read);
    return () => window.removeEventListener("storage", read);
  }, []);
  const needs = [...NEEDS, ...workspace.needs],
    talents = [...TALENTS, ...workspace.talents.map((t) => t.talent)];
  const latest = new Map(
    workspace.journal.map((m) => [JSON.stringify([m.needId, m.talentId]), m]),
  );
  const approved = [...latest.values()]
    .filter((m) => m.approved)
    .flatMap((m) => {
      const need = needs.find((n) => n.id === m.needId),
        talent = talents.find((t) => t.id === m.talentId);
      return need && talent
        ? [{ need, talent, reason: m.reason, demo: false }]
        : [];
    });
  const cases = approved.length
    ? approved
    : [
        {
          need: NEEDS[0],
          talent: TALENTS[0],
          reason:
            "Explore how experience in a fictional robotics club connects with an embedded developer role.",
          demo: true,
        },
        {
          need: NEEDS[1],
          talent: TALENTS[1],
          reason:
            "Explore a second role and see which questions emerge from an incomplete card.",
          demo: true,
        },
      ];
  return (
    <div className="workspace">
      <div className="step-heading">
        <h1>Prepare each conversation.</h1>
        <p>
          {approved.length
            ? "These conversations were approved by the demo organiser. Prepare the discussion, then record what you observed."
            : "Try a fictional conversation below. Approve a meeting in the event desk to build your own conversation list."}
        </p>
      </div>
      {error && (
        <p className="error-panel" role="alert">
          {error}
        </p>
      )}
      <div className="conversation-grid">
        {cases.map(({ need, talent, reason, demo }) => (
          <article
            className="conversation-card"
            key={`${need.id}:${talent.id}`}
          >
            <span className="eyebrow">
              {demo ? "FICTIONAL WALKTHROUGH" : "APPROVED BY THE ORGANISER"} /{" "}
              {need.company}
            </span>
            <h2>
              {talent.pseudonym} × {need.company}
            </h2>
            <strong style={{ fontSize: 12 }}>{need.title}</strong>
            <p>{reason}</p>
            <Link
              className="primary-button"
              href={`/brief?need=${encodeURIComponent(need.id)}&talent=${encodeURIComponent(talent.id)}`}
            >
              Prepare conversation <WorkspaceIcon name="arrow" />
            </Link>
          </article>
        ))}
      </div>
      <div className="role-links">
        <Link className="secondary-button" href="/organiser">
          Review meetings in the event desk →
        </Link>
      </div>
      <p className="quiet-note">
        Approval prepares a conversation. This demo does not send invitations or
        schedule meetings.
      </p>
    </div>
  );
}
