import { WorkspaceIcon } from "@/components/WorkspaceIcon";
import Link from "next/link";
import { Rosace } from "@/components/Rosace";
import { NEEDS } from "@/data/demo";
import { isComponent } from "@/lib/framework";
export default function Home() {
  const example = NEEDS[0];
  return (
    <main className="site-shell">
      <div className="dashboard-intro">
        <div>
          <p className="eyebrow">YOUR NEXT MEANINGFUL CONVERSATION</p>
          <h1>
            Beyond a CV.
            <br />
            <em>A clearer picture of potential.</em>
          </h1>
        </div>
        <p>
          Bring the work into focus. Let people describe their experience. Make
          room for a conversation that matters.
        </p>
      </div>
      <section className="overview-feature">
        <div className="overview-copy">
          <span className="eyebrow">01 / START WITH THE REAL WORK</span>
          <h2>
            What does doing
            <br />
            this job actually look like?
          </h2>
          <p>
            Turn a role into concrete situations. Choose the skills that matter
            and watch your need take shape.
          </p>
          <Link className="primary-button" href="/need/new">
            Prepare a recruiter need <WorkspaceIcon name="arrow" />
          </Link>
          <p className="quiet-note" style={{ marginTop: 18, marginBottom: 0 }}>
            12 components. 3 priorities. Your judgement.
          </p>
        </div>
        <div className="overview-rosace">
          <span className="eyebrow">A ROLE, MADE VISIBLE</span>
          <Rosace
            title={example.title}
            size={430}
            labels="short"
            expected={Object.fromEntries(
              example.requirements
                .filter((r) => isComponent(r.skill))
                .map((r) => [r.skill, { level: r.expected, major: r.major }]),
            )}
          />
          <small>Gold = major components · Fictional NordChip example</small>
        </div>
      </section>
      <section className="overview-paths" aria-label="Continue the journey">
        {[
          {
            icon: "talent",
            title: "Make experience visible",
            text: "Start from a CV or your own words. Build a skills card you can review and confirm.",
            href: "/talent/new",
            link: "Explore the talent journey",
          },
          {
            icon: "event",
            title: "Make space for people",
            text: "Review suggestions, resolve ties and see who still needs a conversation.",
            href: "/organiser",
            link: "Open the event desk",
          },
          {
            icon: "conversation",
            title: "Meet with a purpose",
            text: "Prepare useful questions. Keep what is declared separate from what you observe.",
            href: "/conversations",
            link: "Prepare a conversation",
          },
        ].map((item) => (
          <article className="overview-path" key={item.href}>
            <span className="path-icon">
              <WorkspaceIcon name={item.icon} />
            </span>
            <h2>{item.title}</h2>
            <p>{item.text}</p>
            <Link href={item.href}>{item.link} →</Link>
          </article>
        ))}
      </section>
      <div className="overview-footnote">
        <span>
          Built for Espoo recruitment events. Designed around human decisions.
        </span>
        <Link href="/demo">Explore the fictional demo data →</Link>
      </div>
    </main>
  );
}
