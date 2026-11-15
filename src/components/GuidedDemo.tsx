"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Rosace } from "./Rosace";
import { SkillBars } from "./SkillBars";
import { WorkspaceIcon } from "./WorkspaceIcon";
import { NEEDS, TALENTS } from "@/data/demo";
import { LEVELS, isComponent, skillName } from "@/lib/framework";
import {
  suggestForNeed,
  withoutSuggestion,
  NO_SUGGESTION_LABELS,
} from "@/lib/suggestions";
import { checkExercise } from "@/lib/verification";
import {
  demoPosition,
  demoTime,
  DEMO_DURATION_MS,
  CHAPTER_DURATION_MS,
  BEAT_DURATION_MS,
  TOUR_ROLE_EVENT,
} from "@/lib/demo-playback";

const NEED = NEEDS[0];
const TALENT = TALENTS.find((t) => t.id === "amira")!;
const CHAPTERS = [
  {
    role: "Recruiter",
    title: "Turn a job into concrete expectations.",
    text: "NordChip needs a junior embedded developer. Watch the job context become a need with three clear priorities.",
    beats: ["Job context", "Three priorities", "Technical work", "Need ready"],
  },
  {
    role: "Talent",
    title: "Turn an experience into a declared level.",
    text: "Amira reviews a fictional CV clue, answers factual questions and confirms her own level. Nothing is inferred from a job title alone.",
    beats: ["CV clue", "Factual questions", "Confirmed level", "Skills card"],
  },
  {
    role: "Organiser",
    title: "Prepare a relevant conversation.",
    text: "The organiser reviews the reasons, approves a meeting and checks the people left without a suggestion.",
    beats: [
      "Suggestions",
      "Why this meeting",
      "Human approval",
      "Nobody hidden",
    ],
  },
  {
    role: "Recruiter",
    title: "Check the work, then record what was seen.",
    text: "A timed answer receives an AI recommendation. The recruiter decides the grade; a separate on-site task checks teamwork.",
    beats: [
      "Submitted exercise",
      "AI recommendation",
      "Human validation",
      "On-site check",
    ],
  },
] as const;
const EXPECTED = Object.fromEntries(
  NEED.requirements
    .filter((r) => isComponent(r.skill))
    .map((r) => [r.skill, { level: r.expected, major: r.major }]),
);
const DECLARED = Object.fromEntries(
  Object.entries(TALENT.statements)
    .filter(([s]) => isComponent(s))
    .map(([s, v]) => [s, v.level]),
);
const MAJORS = NEED.requirements.filter((r) => r.major);
const RESULTS = NEEDS.map((n) => suggestForNeed(n, TALENTS));
const ONLINE = checkExercise("C5.1", 1);
const ANSWER =
  "I would ask whether power is stable, whether the connection is still open and what changed before startup. We know readings stopped; a power fault is only a hypothesis. I would check the power log first, then test the connection if power stayed stable.";

function NeedScene({ beat }: { beat: number }) {
  return (
    <div className="tour-scene">
      <div className="demo-evidence">
        <h2>NordChip · junior embedded developer</h2>
        <dl className="demo-context">
          <div>
            <dt>Company</dt>
            <dd>NordChip · fictional sensor company</dd>
          </div>
          <div>
            <dt>Work</dt>
            <dd>Firmware for sensor boards; vague customer bug reports.</dd>
          </div>
          <div>
            <dt>Team</dt>
            <dd>Five people, working with hardware engineers.</dd>
          </div>
        </dl>
        {beat >= 1 && (
          <div className="demo-reveal">
            <h3>Three major components</h3>
            {MAJORS.map((r) => (
              <div className="demo-requirement" key={r.skill}>
                <strong>{skillName(r.skill)}</strong>
                <span>{LEVELS[r.expected].name}</span>
                <p>{r.example}</p>
              </div>
            ))}
          </div>
        )}
        {beat >= 2 && (
          <p className="demo-reveal">
            Technical work: C firmware and board communication protocols. These
            are separate from the three majors.
          </p>
        )}
        {beat === 3 && (
          <p className="demo-result">
            Recorded demo action: the recruiter confirms this need and plans to
            meet three people.
          </p>
        )}
      </div>
      <figure className="tour-rosace">
        <figcaption>Expected levels · gold marks the three majors</figcaption>
        <Rosace
          size={440}
          labels="short"
          expected={beat >= 1 ? EXPECTED : {}}
          majors={MAJORS.map((r) => r.skill)}
        />
        {beat >= 2 && (
          <SkillBars
            items={NEED.requirements
              .filter((r) => !isComponent(r.skill))
              .map((r) => ({ code: r.skill, expected: r.expected }))}
          />
        )}
      </figure>
    </div>
  );
}
function TalentScene({ beat }: { beat: number }) {
  return (
    <div className="tour-scene">
      <div className="demo-evidence">
        <h2>Amira’s fictional experience</h2>
        <blockquote className="check-answer">
          “Programmed the robot controller in C on an STM32 board.”
        </blockquote>
        <p>
          This suggests asking about embedded C. The sentence alone does not
          establish a level.
        </p>
        {beat >= 1 && (
          <div className="demo-reveal">
            <h3>Her answers in this fictional scenario</h3>
            <dl className="demo-context">
              <div>
                <dt>Did you do it?</dt>
                <dd>Yes, on the robotics controller.</dd>
              </div>
              <div>
                <dt>With what support?</dt>
                <dd>Independently.</dd>
              </div>
              <div>
                <dt>In what situation?</dt>
                <dd>Changing requirements; the team depended on the result.</dd>
              </div>
            </dl>
          </div>
        )}
        {beat >= 2 && (
          <p className="demo-result">
            Recorded demo action: Amira confirms Advanced for embedded C. It
            remains her declaration.
          </p>
        )}
        {beat === 3 && (
          <p>
            The other prefilled declarations complete her card. Missing protocol
            details stay unknown, not zero.
          </p>
        )}
      </div>
      <figure className="tour-rosace">
        <figcaption>Amira’s declarations · dotted, not verified</figcaption>
        <Rosace
          size={440}
          labels="short"
          declared={beat === 3 ? DECLARED : {}}
        />
        {beat >= 2 && (
          <SkillBars items={[{ code: "J.EMBEDDED_C", level: 3 }]} />
        )}
      </figure>
    </div>
  );
}
function OrganiserScene({ beat }: { beat: number }) {
  const amira =
    RESULTS[0].suggested.find((s) => s.talentId === "amira") ??
    RESULTS[0].tied.find((s) => s.talentId === "amira");
  const others = withoutSuggestion(RESULTS, TALENTS);
  return (
    <div className="tour-scene">
      <div className="demo-evidence">
        <h2>NordChip’s suggested conversations</h2>
        {RESULTS[0].suggested.map((a) => (
          <div className="demo-requirement" key={a.talentId}>
            <strong>
              {TALENTS.find((t) => t.id === a.talentId)?.pseudonym}
            </strong>
            <span>
              {a.points} out of {a.max}
            </span>
            <p>
              {a.missingMajors.length
                ? `To check: ${a.missingMajors.map(skillName).join(", ")}.`
                : "Declared major levels meet the need."}
            </p>
          </div>
        ))}
        <p className="quiet-note">
          Only the organiser/recruiter reviews alignment. It is not a hiring
          decision.
        </p>
      </div>
      <div className="demo-evidence">
        {beat >= 1 ? (
          <>
            <h2>Why meet Amira?</h2>
            <p>
              Her embedded C declaration fits the work. Problem analysis and
              learning unfamiliar tools need a conversation.
            </p>
            {amira && (
              <p>
                The suggestion covers {amira.coveredWeight} out of{" "}
                {amira.totalWeight} requirement weights. Unknowns remain
                visible.
              </p>
            )}
          </>
        ) : (
          <>
            <h2>A person reviews the suggestions.</h2>
            <p>
              Ties at the capacity limit are left to the organiser. The tool
              does not choose between tied people.
            </p>
          </>
        )}
        {beat >= 2 && (
          <div className="demo-result">
            <strong>Recorded human approval</strong>
            <p>
              “Discuss the sensor work and check the analysis and learning
              gaps.” This prewritten demo decision does not save or send
              anything.
            </p>
          </div>
        )}
        {beat === 3 && (
          <>
            <h3>People without a suggestion</h3>
            {others.map(({ talent, reason }) => (
              <p key={talent.id}>
                <strong>{talent.pseudonym}</strong> —{" "}
                {NO_SUGGESTION_LABELS[reason]}
              </p>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
function CheckScene({ beat }: { beat: number }) {
  return (
    <div className="tour-scene">
      <div className="demo-evidence">
        <h2>
          {beat === 3
            ? "Work with others · Intermediate"
            : "Break down a problem · Foundation"}
        </h2>
        <p className="quiet-note">
          {beat === 3
            ? "Prefilled fictional recording · part of the shared 10-minute meeting allowance"
            : "Prefilled fictional recording · 6-minute exercise, shown in a few seconds"}
        </p>
        {beat === 0 && (
          <>
            <p>{ONLINE.prompt}</p>
            <h3>Submitted answer</h3>
            <blockquote className="check-answer">{ANSWER}</blockquote>
          </>
        )}
        {beat === 1 && (
          <div className="demo-result">
            <strong>Illustrative AI recommendation: A — Seen clearly</strong>
            <p>
              The answer separates the known failure from a power hypothesis and
              gives a first check. This is a prewritten example, not a live
              Claude call.
            </p>
            <blockquote className="check-answer">
              “We know readings stopped; a power fault is only a hypothesis.”
            </blockquote>
            <p>The recommendation has not changed the rosace.</p>
          </div>
        )}
        {beat === 2 && (
          <div className="demo-result">
            <strong>Human validation</strong>
            <p>
              Recorded demo action: the recruiter reads the answer and confirms
              A at Foundation. Only now does the C5.1 branch become solid.
            </p>
            <span>
              Online exercise · Graded by the recruiter · fictional example
            </span>
          </div>
        )}
        {beat === 3 && (
          <div className="demo-reveal">
            <h3>At the meeting: Work with others</h3>
            <p>
              In a short paired task, agree a sensor interface and split the
              checks. Ask: “What does your partner need from you to finish?”
            </p>
            <p>
              Recorded observation: Amira agrees the interface but leaves
              ownership of one check unclear. The recruiter records C at
              Intermediate, giving an observed value of 1.2.
            </p>
            <p className="quiet-note">
              Long-term commitments stay “Discussed, not observed”. Total
              on-site allowance: 10 minutes.
            </p>
          </div>
        )}
      </div>
      <div className="tour-pair">
        <figure className="tour-rosace">
          <figcaption>Observed only after human validation</figcaption>
          <Rosace
            size={440}
            labels="short"
            observedLevels={{
              ...(beat >= 2 ? { "C5.1": 1 } : {}),
              ...(beat === 3 ? { "C4.1": 1.2 } : {}),
            }}
          />
          <p className="quiet-note">
            Amira’s declared Foundation in problem analysis stays unchanged.
            Empty branches mean no observation, not failure.
          </p>
        </figure>
        <details className="context-details">
          <summary>Compare with Amira’s declarations</summary>
          <Rosace size={440} labels="short" declared={DECLARED} />
        </details>
      </div>
    </div>
  );
}
export function GuidedDemo() {
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const position = demoPosition(elapsed);
  const current = CHAPTERS[position.chapter];
  useEffect(() => {
    setPlaying(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);
  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    const resetClock = () => {
      last = performance.now();
    };
    document.addEventListener("visibilitychange", resetClock);
    const id = window.setInterval(() => {
      const now = performance.now();
      const delta = now - last;
      last = now;
      if (!document.hidden)
        setElapsed((t) => Math.min(DEMO_DURATION_MS, t + delta));
    }, 200);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", resetClock);
    };
  }, [playing]);
  useEffect(() => {
    if (position.complete) setPlaying(false);
  }, [position.complete]);
  const shownChapter = useRef<number | null>(null);
  useEffect(() => {
    // The sidebar follows the role of the chapter on screen.
    window.dispatchEvent(
      new CustomEvent(TOUR_ROLE_EVENT, {
        detail: CHAPTERS[position.chapter].role,
      }),
    );
    // A new chapter starts at the top, so its title is never hidden.
    if (
      shownChapter.current !== null &&
      shownChapter.current !== position.chapter
    ) {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    }
    shownChapter.current = position.chapter;
  }, [position.chapter]);
  function jump(chapter: number, beat = 0) {
    setPlaying(false);
    setElapsed(chapter * CHAPTER_DURATION_MS + beat * BEAT_DURATION_MS);
  }
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input,textarea,select,button,a")) return;
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        setPlaying(false);
        setElapsed(
          (t) =>
            Math.max(
              0,
              Math.min(
                3,
                demoPosition(t).chapter + (event.key === "ArrowRight" ? 1 : -1),
              ),
            ) * CHAPTER_DURATION_MS,
        );
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  return (
    <div className="tour demo-recording">
      <div className="demo-player">
        <div>
          <strong>Watch a fictional event unfold</strong>
          <p>
            All data and decisions are prewritten. Nothing is saved or sent.
          </p>
        </div>
        <div className="demo-playback">
          <button
            className="primary-button"
            onClick={() => {
              if (position.complete) setElapsed(0);
              setPlaying((p) => !p);
            }}
          >
            {playing
              ? "Pause demo"
              : position.complete
                ? "Replay demo"
                : "Play demo"}
          </button>
          <button className="text-button" onClick={() => jump(0)}>
            Restart
          </button>
          <span aria-label="Playback time">{demoTime(elapsed)} / 3:00</span>
        </div>
      </div>
      <nav className="tour-steps" aria-label="Demo steps">
        {CHAPTERS.map((s, i) => (
          <button
            type="button"
            key={s.role + i}
            aria-current={i === position.chapter ? "step" : undefined}
            onClick={() => jump(i)}
          >
            <span>{i + 1}</span>
            {s.role}
          </button>
        ))}
      </nav>
      <section className="tour-body">
        <header className="tour-head">
          <h1>{current.title}</h1>
          <p>{current.text}</p>
        </header>
        <nav className="demo-beats" aria-label="Chapter moments">
          {current.beats.map((beat, i) => (
            <button
              key={beat}
              aria-pressed={position.beat === i}
              onClick={() => jump(position.chapter, i)}
            >
              {beat}
            </button>
          ))}
        </nav>
        <p className="demo-caption" role="status">
          {position.complete
            ? "Demo complete. Replay or try a workspace."
            : `${position.chapter + 1} of 4 · ${current.beats[position.beat]} · ${playing ? "Playing" : "Paused"}`}
        </p>
        {position.chapter === 0 && <NeedScene beat={position.beat} />}
        {position.chapter === 1 && <TalentScene beat={position.beat} />}
        {position.chapter === 2 && <OrganiserScene beat={position.beat} />}
        {position.chapter === 3 && <CheckScene beat={position.beat} />}
      </section>
      <footer className="tour-nav">
        <button
          className="secondary-button"
          disabled={position.chapter === 0}
          onClick={() => jump(position.chapter - 1)}
        >
          Back
        </button>
        <small>
          Pause or jump to any moment. Reduced-motion mode starts paused.
        </small>
        {position.chapter < 3 ? (
          <button
            className="primary-button"
            onClick={() => jump(position.chapter + 1)}
          >
            Next: {CHAPTERS[position.chapter + 1].role.toLowerCase()}{" "}
            <WorkspaceIcon name="arrow" />
          </button>
        ) : (
          <Link className="primary-button" href="/recruiter">
            Open recruiter workspace <WorkspaceIcon name="arrow" />
          </Link>
        )}
      </footer>
    </div>
  );
}
