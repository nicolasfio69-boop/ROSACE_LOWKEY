"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { emptyWorkspace, loadWorkspace } from "@/lib/workspace";
import { isComponent } from "@/lib/framework";
import type { WorkspaceRole } from "@/lib/workspace-role";
import { NEEDS, TALENTS } from "@/data/demo";
import { Rosace } from "./Rosace";
import { SkillBars } from "./SkillBars";
import { WorkspaceIcon } from "./WorkspaceIcon";

export function WorkspaceWelcome({ role }: { role: WorkspaceRole }) {
  const [workspace, setWorkspace] = useState(emptyWorkspace);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    try {
      setWorkspace(loadWorkspace(localStorage));
    } catch {
      setError(
        "Saved browser data could not be read. It has not been overwritten.",
      );
    }
    setReady(true);
  }, []);
  const card = workspace.talents[0]?.talent;
  const need = workspace.needs[0];
  const candidate = role === "candidate";
  const organiser = role === "organiser";
  const title = organiser
    ? "Prepare your event."
    : candidate
      ? "Your experience. Your next conversation."
      : "Make the role concrete.";
  const primary = organiser
    ? "/organiser"
    : candidate
      ? "/talent/new"
      : "/need/new";
  const primaryLabel = organiser
    ? "Open the event desk"
    : candidate
      ? card
        ? "Continue my skills card"
        : "Build my skills card"
      : "Define a recruiter need";
  return (
    <main className="site-shell welcome-workspace">
      <header className="welcome-heading">
        <h1>{title}</h1>
        <p>
          {organiser
            ? "Review proposed meetings, ties and people without suggestions before the event."
            : candidate
              ? "Turn an experience into concrete skills. You confirm each level; a recruiter records observations separately."
              : "Describe your company, the role and its working context. Concrete examples help you choose the skills that matter."}
        </p>
      </header>
      {error && (
        <p className="error-panel" role="alert">
          {error}
        </p>
      )}
      <div className="welcome-grid">
        <section className="welcome-next" aria-labelledby="welcome-next-title">
          <h2 id="welcome-next-title">
            {organiser
              ? "Espoo Tech Matchmaking"
              : candidate
                ? "Build from your experience"
                : "Your company and role"}
          </h2>
          <p>
            {organiser
              ? "A fictional event with NordChip, Lumora, Vireo Data and ten synthetic talent cards. Local decisions are shared between the demo spaces in this browser."
              : candidate
                ? "Import a fictional CV or start in your own words. Review the clues and confirm what you have done, with what support and in which situations."
                : "Import a fictional job description or describe the work yourself. Add the location, remote or on-site setup, team and expected outcomes."}
          </p>
          <Link className="primary-button" href={primary}>
            {primaryLabel}
            <WorkspaceIcon name="arrow" />
          </Link>
          <div className="welcome-steps">
            <div>
              <span>01</span>
              <p>
                {organiser
                  ? "Review the needs and suggested conversations."
                  : candidate
                    ? "Describe an experience or import a document."
                    : "Give the company and job context."}
              </p>
            </div>
            <div>
              <span>02</span>
              <p>
                {organiser
                  ? "Consider ties and people without a suggestion."
                  : candidate
                    ? "Confirm concrete levels, one skill at a time."
                    : "Choose 3 majors, relevant minors and up to 3 technical skills."}
              </p>
            </div>
            <div>
              <span>03</span>
              <p>
                {organiser
                  ? "Record your decision with a short reason."
                  : candidate
                    ? "Prepare exercises and conversations at your declared level."
                    : "Prepare questions and review what a candidate demonstrates."}
              </p>
            </div>
          </div>
          <nav className="welcome-links" aria-label="Next workspace actions">
            {organiser ? (
              <Link href="/conversations">
                Review conversations <WorkspaceIcon name="arrow" />
              </Link>
            ) : candidate ? (
              <Link href="/talent/checks">
                Open my checks <WorkspaceIcon name="arrow" />
              </Link>
            ) : (
              <>
                <Link href="/checks">
                  Prepare and review checks <WorkspaceIcon name="arrow" />
                </Link>
                <Link href="/conversations">
                  Prepare conversations <WorkspaceIcon name="arrow" />
                </Link>
              </>
            )}
          </nav>
        </section>
        <aside
          className="welcome-map"
          aria-label={organiser ? "Demo event summary" : "Your skills overview"}
        >
          {organiser ? (
            <>
              <h2>One event, different needs.</h2>
              <p>
                Review each company’s needs before approving who should meet.
              </p>
              <dl className="welcome-event-counts">
                <div>
                  <dt>{NEEDS.length + workspace.needs.length}</dt>
                  <dd>company needs</dd>
                </div>
                <div>
                  <dt>{TALENTS.length + workspace.talents.length}</dt>
                  <dd>fictional talent cards</dd>
                </div>
              </dl>
              <p className="quiet-note">
                Approval prepares a conversation. This demo does not send
                invitations or schedule meetings.
              </p>
            </>
          ) : (
            <>
              <h2>
                {candidate
                  ? card
                    ? "Your confirmed declarations"
                    : "Your rosace starts here"
                  : need
                    ? need.company
                    : "Your role takes shape here"}
              </h2>
              {candidate ? (
                <Rosace
                  size={440}
                  labels="short"
                  declared={
                    card
                      ? Object.fromEntries(
                          Object.entries(card.statements).map(
                            ([key, value]) => [key, value.level],
                          ),
                        )
                      : {}
                  }
                />
              ) : (
                <Rosace
                  size={440}
                  labels="short"
                  expected={Object.fromEntries(
                    (need?.requirements ?? [])
                      .filter((r) => isComponent(r.skill))
                      .map((r) => [
                        r.skill,
                        { level: r.expected, major: r.major },
                      ]),
                  )}
                />
              )}
              <p className="quiet-note">
                {candidate
                  ? card
                    ? "Dotted branches are your declarations, not verified results."
                    : "Branches appear as you confirm your levels. Save your card to return to it here."
                  : need
                    ? `${need.title}. Gold marks the three majors; red marks the minors.`
                    : "Choose the expected levels for a role. Gold marks the three majors; technical skills sit alongside the rosace."}
              </p>
              {candidate && card && (
                <SkillBars
                  items={Object.entries(card.statements)
                    .filter(([code]) => !isComponent(code))
                    .map(([code, value]) => ({ code, level: value.level }))}
                />
              )}
              {!candidate && need && (
                <SkillBars
                  items={need.requirements
                    .filter((r) => !isComponent(r.skill))
                    .map((r) => ({ code: r.skill, expected: r.expected }))}
                />
              )}
            </>
          )}
          {!ready && (
            <p role="status" className="quiet-note">
              Reading this browser’s workspace…
            </p>
          )}
        </aside>
      </div>
      <div className="welcome-help">
        <p>Optional preview</p>
        <Link href="/tour" className="welcome-help-quiet">
          3-minute event walkthrough
        </Link>
        <Link href="/overview" className="welcome-help-quiet">
          How Rosace works
        </Link>
      </div>
    </main>
  );
}
