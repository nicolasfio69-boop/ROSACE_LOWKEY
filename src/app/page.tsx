import { WorkspaceIcon } from "@/components/WorkspaceIcon";
import Link from "next/link";
import { Rosace } from "@/components/Rosace";
import { NEEDS } from "@/data/demo";
import { isComponent } from "@/lib/framework";

const STEPS = [
  {
    icon: "need",
    step: "01",
    title: "Prepare a recruiter need",
    text: "Choose 3 major components, up to 2 minors and 2 job skills. Compare concrete examples to set the expected levels.",
    href: "/need/new",
    link: "Open the recruiter form",
  },
  {
    icon: "talent",
    step: "02",
    title: "Build a talent card",
    text: "Start from a CV or from your own words. Each claim stays declared until a recruiter observes it. The talent never sees a rank or a score.",
    href: "/talent/new",
    link: "Open the talent card",
  },
  {
    icon: "event",
    step: "03",
    title: "Run the event desk",
    text: "See who is suggested for each need and why. Ties at the cut and people without a suggestion go to the organiser, who decides.",
    href: "/organiser",
    link: "Open the event desk",
  },
  {
    icon: "conversation",
    step: "04",
    title: "Prepare a conversation",
    text: "Get questions that check what was declared. Note what you observe as a separate, solid bar on the rosace.",
    href: "/conversations",
    link: "Prepare a conversation",
  },
];

export default function Home() {
  const example = NEEDS[0];
  return (
    <main className="site-shell">
      <section className="home-hero">
        <div className="home-hero-copy">
          <p className="hero-kicker">
            <span className="status-dot" /> Espoo Tech Matchmaking · demo
          </p>
          <h1>
            Start with the work.
            <br />
            Prepare the conversation.
          </h1>
          <p>
            A company says which skills matter for a role. A talent turns their
            CV into a skills card. Rosace suggests who should meet and shows the
            reasons. A person always makes the decision.
          </p>
          <div className="home-hero-actions">
            <Link className="hero-button" href="/need/new">
              Prepare a recruiter need <WorkspaceIcon name="arrow" />
            </Link>
            <Link className="hero-link" href="/talent/new">
              Build a talent card
            </Link>
          </div>
          <dl className="hero-facts">
            <div>
              <dt>12</dt>
              <dd>Centrale components</dd>
            </div>
            <div>
              <dt>3</dt>
              <dd>majors per role, in gold</dd>
            </div>
            <div>
              <dt>0</dt>
              <dd>scores shown to talents</dd>
            </div>
          </dl>
        </div>
        <figure className="home-hero-rosace">
          <figcaption>
            <span>{example.company}</span>
            <strong>{example.title}</strong>
          </figcaption>
          <Rosace
            size={380}
            labels="short"
            expected={Object.fromEntries(
              example.requirements
                .filter((r) => isComponent(r.skill))
                .map((r) => [r.skill, { level: r.expected, major: r.major }]),
            )}
          />
          <small>
            <i className="legend-gold" /> The 3 majors{" "}
            <i className="legend-red" /> Other components · Fictional example
          </small>
        </figure>
      </section>
      <section className="overview-paths" aria-label="How the event works">
        {STEPS.map((item) => (
          <article className="overview-path" key={item.href}>
            <div className="path-head">
              <span className="path-icon">
                <WorkspaceIcon name={item.icon} />
              </span>
              <span className="path-step">{item.step}</span>
            </div>
            <h2>{item.title}</h2>
            <p>{item.text}</p>
            <Link href={item.href}>{item.link} →</Link>
          </article>
        ))}
      </section>
      <div className="overview-footnote">
        <span>
          Synthetic data only. No nationality, language, age, gender or degree
          is used to suggest anyone.
        </span>
        <Link href="/organiser">Review the event’s suggestions →</Link>
      </div>
    </main>
  );
}
