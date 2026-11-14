"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { COMPONENTS } from "@/lib/framework";
import { exerciseFor, type ExerciseFeedback } from "@/lib/exercises";
export function Practice() {
  const [skill, setSkill] = useState("C1.1"),
    [answer, setAnswer] = useState(""),
    [consent, setConsent] = useState(false),
    [connected, setConnected] = useState(false),
    [provider, setProvider] = useState("Claude"),
    [busy, setBusy] = useState(false),
    [feedback, setFeedback] = useState<ExerciseFeedback | null>(null),
    [error, setError] = useState("");
  const version = useRef(0);
  useEffect(() => {
    fetch("/api/integrations")
      .then((r) => r.json())
      .then((r) => {
        setConnected(r.ai === true);
        setProvider(r.provider ?? "Claude");
      })
      .catch(() => {});
    return () => {
      version.current = -1;
    };
  }, []);
  const exercise = exerciseFor(skill);
  function reset() {
    version.current++;
    setBusy(false);
    setFeedback(null);
    setError("");
  }
  async function review() {
    const id = ++version.current;
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/exercise-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skill, answer, consent }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      if (id === version.current) setFeedback(data);
    } catch (e) {
      if (id === version.current)
        setError(
          e instanceof Error ? e.message : "Could not review the answer.",
        );
    } finally {
      if (id === version.current) setBusy(false);
    }
  }
  return (
    <div className="workspace">
      <Link className="back-link" href="/talent/new">
        ← Talent journey
      </Link>
      <div className="step-heading">
        <p className="eyebrow">TRY A SITUATION, START A CONVERSATION</p>
        <h1>Show how you would approach it.</h1>
        <p>
          A short written exercise helps explore your reasoning. It cannot
          verify a skill on its own and never changes your declared levels.
        </p>
      </div>
      <div className="workspace-grid">
        <section className="form-panel">
          <label className="field-label">
            Component to practise
            <select
              value={skill}
              onChange={(e) => {
                reset();
                setSkill(e.target.value);
                setAnswer("");
                setConsent(false);
              }}
            >
              {COMPONENTS.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <p className="role-context">{exercise.scenario}</p>
          <h2>{exercise.prompt}</h2>
          <label className="field-label">
            Your practice answer
            <textarea
              rows={9}
              maxLength={6000}
              value={answer}
              onChange={(e) => {
                reset();
                setAnswer(e.target.value);
                setConsent(false);
              }}
            />
          </label>
          <p className="quiet-note">
            Use fictional details. Your answer stays in this page’s memory and
            is cleared when you leave. It is sent to {provider} only if you
            explicitly request feedback.
          </p>
          <label className="consent-line">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => {
                reset();
                setConsent(e.target.checked);
              }}
            />{" "}
            Send this fictional practice answer to {provider} for feedback.
          </label>
          <button
            className="primary-button"
            disabled={!connected || !consent || !answer.trim() || busy}
            onClick={review}
          >
            {busy ? "Reviewing…" : "Request AI feedback"}
          </button>
          {!connected && (
            <p className="quiet-note">
              AI is not connected yet. The checklist works now; you can discuss
              your answer in an interview.
            </p>
          )}
          {error && (
            <p role="alert" className="error-panel">
              {error}
            </p>
          )}
          {feedback && (
            <div className="ai-review">
              <h2>Suggested feedback · review with a human</h2>
              {feedback.strengths.map((s, i) => (
                <blockquote className="source-passage" key={i}>
                  <p>“{s.quote}”</p>
                  <p>{s.comment}</p>
                </blockquote>
              ))}
              <h3>Questions to explore</h3>
              <ul>
                {feedback.questions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
              <p className="quiet-note">{feedback.limitations}</p>
            </div>
          )}
        </section>
        <aside className="live-panel">
          <p className="eyebrow">WHAT A REVIEWER CAN LOOK FOR</p>
          <h2>Discuss the reasoning.</h2>
          <ul className="practice-checks">
            {exercise.checks.map((check) => (
              <li key={check}>{check}</li>
            ))}
          </ul>
          <p className="quiet-note">
            Ask what help was needed, what the person would check and what
            remains uncertain. Keep declared skills and observed evidence
            separate.
          </p>
        </aside>
      </div>
    </div>
  );
}
