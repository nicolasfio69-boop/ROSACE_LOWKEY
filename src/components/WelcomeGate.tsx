"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "./Logo";
import { WorkspaceIcon } from "./WorkspaceIcon";
import {
  readEntryPreference,
  rememberEntryPreference,
  WORKSPACE_HOMES,
} from "@/lib/entry-preference";
import type { WorkspaceRole } from "@/lib/workspace-role";

const labels = {
  candidate: "Candidate",
  recruiter: "Recruiter",
  organiser: "Organiser",
};
export function WelcomeGate() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [role, setRole] = useState<WorkspaceRole>("candidate");
  const [stage, setStage] = useState<"choose" | "email" | "code">("choose");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    let saved: WorkspaceRole | null = null;
    try {
      saved = readEntryPreference(localStorage);
    } catch {
      /* The preview also works without storage. */
    }
    if (
      saved &&
      new URLSearchParams(window.location.search).get("choose") !== "1"
    ) {
      router.replace(WORKSPACE_HOMES[saved]);
    } else setReady(true);
  }, [router]);
  useEffect(() => {
    if (ready) heading.current?.focus();
  }, [stage, ready]);
  function choose(next: WorkspaceRole) {
    setRole(next);
    setStage("email");
    setCode("");
    setError("");
  }
  function enter() {
    try {
      rememberEntryPreference(localStorage, role);
    } catch {
      /* Navigation does not require storage. */
    }
    router.push(WORKSPACE_HOMES[role]);
  }
  if (!ready)
    return (
      <main className="entry-loading">
        <p role="status">Opening your workspace…</p>
      </main>
    );
  return (
    <div className="entry-shell">
      <header className="entry-header">
        <Link
          href="/?choose=1"
          aria-label="Rosace home"
          onClick={() => {
            setStage("choose");
            setCode("");
            setError("");
          }}
        >
          <Logo size={42} />
        </Link>
        <Link className="entry-demo-link" href="/tour">
          Explore the demo <WorkspaceIcon name="arrow" />
        </Link>
      </header>
      <main className="entry-main" id="entry-content">
        {stage === "choose" ? (
          <>
            <div className="entry-intro">
              <h1 ref={heading} tabIndex={-1}>
                What brings you here?
              </h1>
              <p className="entry-promise">
                AI-written CVs all look alike. Rosace turns each claim into a
                question you can check during the conversation.
              </p>
              <p>
                Prepare for a recruitment event in Espoo.
                <br />
                Choose your space to get started.
              </p>
            </div>
            <div className="entry-choices">
              <button
                className="entry-choice"
                onClick={() => choose("candidate")}
              >
                <WorkspaceIcon name="talent" />
                <strong>Candidate</strong>
                <span>Show what you can do.</span>
                <small>
                  Build your skills card and prepare for conversations.
                </small>
                <span className="entry-choice-action">
                  Choose candidate <WorkspaceIcon name="arrow" />
                </span>
              </button>
              <button
                className="entry-choice"
                onClick={() => choose("recruiter")}
              >
                <WorkspaceIcon name="need" />
                <strong>Recruiter</strong>
                <span>Describe the work that matters.</span>
                <small>Define a role and prepare to meet candidates.</small>
                <span className="entry-choice-action">
                  Choose recruiter <WorkspaceIcon name="arrow" />
                </span>
              </button>
            </div>
            <div className="entry-organiser">
              <span>Coordinating an event?</span>
              <button
                className="text-button"
                onClick={() => choose("organiser")}
              >
                Organiser access <WorkspaceIcon name="arrow" />
              </button>
            </div>
          </>
        ) : (
          <section className="entry-signin" aria-labelledby="signin-heading">
            <button
              className="text-button entry-back"
              onClick={() => {
                setStage(stage === "code" ? "email" : "choose");
                setError("");
                setCode("");
              }}
            >
              Back
            </button>
            <h1 ref={heading} tabIndex={-1} id="signin-heading">
              {stage === "email"
                ? `${labels[role]} sign-in`
                : "Preview the code step"}
            </h1>
            <p className="entry-stage">
              {stage === "email"
                ? "Step 1 of 2 · Demo account"
                : "Step 2 of 2 · Demo code"}
            </p>
            {role === "organiser" && (
              <p className="entry-invitation">
                Organiser accounts will be invitation-only. This preview opens a
                fictional event; it does not grant account access.
              </p>
            )}
            <p className="entry-preview-note">
              Sign-in preview only. No account is created and no email is sent.
              Use the fictional details below.
            </p>
            {stage === "email" ? (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  setStage("code");
                }}
              >
                <label className="field-label">
                  Demo email
                  <input type="email" value={`${role}@example.test`} readOnly />
                </label>
                <button className="primary-button" type="submit">
                  Preview email-code sign-in <WorkspaceIcon name="arrow" />
                </button>
              </form>
            ) : (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  if (code.trim() !== "123456") {
                    setError("Use the displayed demo code: 123456.");
                    return;
                  }
                  enter();
                }}
              >
                <p className="entry-demo-code">
                  Demo code <strong>123456</strong>
                </p>
                <label className="field-label">
                  Demo verification code
                  <input
                    value={code}
                    onChange={(event) => {
                      setCode(event.target.value);
                      setError("");
                    }}
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={6}
                    aria-describedby="code-help"
                    aria-invalid={!!error}
                  />
                </label>
                <p id="code-help" className="quiet-note">
                  This code previews the interaction. It does not verify your
                  identity.
                </p>
                {error && (
                  <p className="inline-error" role="alert">
                    {error}
                  </p>
                )}
                <button className="primary-button" type="submit">
                  Open {role} workspace <WorkspaceIcon name="arrow" />
                </button>
              </form>
            )}
            <button className="text-button entry-skip" onClick={enter}>
              Skip sign-in preview
            </button>
          </section>
        )}
      </main>
      <footer className="entry-footer">
        <span>
          Inspired by a real, working competency system designed at École
          Centrale de Lyon
        </span>
        <span>Fictional demo · A person always decides</span>
      </footer>
    </div>
  );
}
