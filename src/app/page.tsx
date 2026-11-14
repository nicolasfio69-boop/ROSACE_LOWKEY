import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Rosace } from "@/components/Rosace";
import { NEEDS } from "@/data/demo";
import { isComponent } from "@/lib/framework";

export default function Home() {
  const example = NEEDS[0];
  return (
    <main className="site-shell">
      <nav className="site-nav" aria-label="Main navigation">
        <Logo size={40} />
        <div className="nav-links">
          <Link href="/organiser">Organiser workspace</Link>
          <Link href="/demo">Demo data</Link>
          <span className="event-pill">Junction · Espoo 2026</span>
        </div>
      </nav>
      <section className="hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="status-dot" /> BETTER CONVERSATIONS START HERE
          </p>
          <h1>
            See the person.
            <br />
            <em>Start a conversation.</em>
          </h1>
          <p className="hero-description">
            A CV starts the story. A conversation brings it to life. Define what
            matters for your role, then prepare to explore it together.
          </p>
          <Link href="/need/new" className="primary-button">
            Prepare a recruiter need <span aria-hidden="true">→</span>
          </Link>
          <div className="role-links">
            <Link href="/talent/new" className="secondary-button">
              I am a talent →
            </Link>
            <Link href="/organiser" className="text-button">
              I organise the event →
            </Link>
          </div>
          <p className="hero-note">Your judgement. A clearer starting point.</p>
          <div className="hero-facts">
            <span>
              <strong>3</strong> priorities that matter
            </span>
            <span>
              <strong>1</strong> shared skills framework
            </span>
          </div>
        </div>
        <div className="hero-visual">
          <div className="visual-topline">
            <span className="eyebrow">A ROLE, MADE VISIBLE</span>
            <span className="small-badge">Synthetic example</span>
          </div>
          <Rosace
            title={example.title}
            expected={Object.fromEntries(
              example.requirements
                .filter((r) => isComponent(r.skill))
                .map((r) => [r.skill, { level: r.expected, major: r.major }]),
            )}
            size={390}
            labels="short"
          />
          <div className="visual-caption">
            <span className="gold-dot" />
            <p>
              <strong>Three priorities. One clear picture.</strong>
              <br />
              Gold branches show what matters most.
            </p>
          </div>
          <div className="floating-note">
            <span aria-hidden="true">✦</span> A reason to talk.
            <br />
            <small>Not a verdict on a person.</small>
          </div>
        </div>
      </section>
      <section className="journey-section" aria-labelledby="journey-title">
        <div>
          <p className="eyebrow">FROM A ROLE TO A REAL CONVERSATION</p>
          <h2 id="journey-title">Make space for what a CV cannot show.</h2>
        </div>
        <div className="journey-grid">
          {[
            [
              "01",
              "Define what matters",
              "Choose the skills and level your role actually needs.",
              "Available now",
            ],
            [
              "02",
              "Let talent tell their story",
              "Turn experience into a skills card they can review and confirm.",
              "Available locally",
            ],
            [
              "03",
              "Meet with a purpose",
              "Explore the open questions together. A human makes the decision.",
              "Available locally",
            ],
          ].map(([n, title, body, status]) => (
            <article key={n} className="journey-card">
              <span className="journey-number">{n}</span>
              <h3>{title}</h3>
              <p>{body}</p>
              <span
                className={n === "01" ? "available-label" : "planned-label"}
              >
                {status}
              </span>
            </article>
          ))}
        </div>
      </section>
      <footer className="site-footer">
        <p>Built for meaningful encounters. Powered by human judgement.</p>
        <Link href="/demo">View synthetic needs & talent cards →</Link>
      </footer>
    </main>
  );
}
