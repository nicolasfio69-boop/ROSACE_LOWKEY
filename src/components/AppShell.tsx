"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WorkspaceIcon } from "./WorkspaceIcon";
import { Logo } from "./Logo";
const destinations = [
  {
    href: "/",
    label: "Overview",
    icon: "overview",
    subtitle: "A clearer starting point",
  },
  {
    href: "/need/new",
    label: "Recruiter need",
    icon: "need",
    subtitle: "Define what matters",
  },
  {
    href: "/talent/new",
    label: "Talent card",
    icon: "talent",
    subtitle: "Make experience visible",
  },
  {
    href: "/organiser",
    label: "Event desk",
    icon: "event",
    subtitle: "Human decisions, clear reasons",
  },
  {
    href: "/conversations",
    label: "Conversations",
    icon: "conversation",
    subtitle: "Prepare to meet",
  },
  {
    href: "/practice",
    label: "Practice studio",
    icon: "practice",
    subtitle: "Explore a concrete situation",
  },
];
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === "/brief" ? "/conversations" : pathname;
  const current = destinations.find((d) => d.href === active);
  return (
    <div className="app-shell">
      <a href="#workspace-content" className="skip-link">
        Skip to workspace
      </a>
      <aside className="app-sidebar">
        <Link href="/" className="app-brand" aria-label="Rosace home">
          <Logo size={36} />
          <span>SKILLS-BASED MATCHMAKING</span>
        </Link>
        <div className="sidebar-event">
          <span className="event-avatar">E</span>
          <div>
            <strong>Espoo Tech Matchmaking</strong>
            <small>Event workspace · Demo</small>
          </div>
        </div>
        <p className="sidebar-caption">YOUR WORKSPACE</p>
        <nav aria-label="Workspace navigation">
          {destinations.map((d) => (
            <Link
              key={d.href}
              href={d.href}
              aria-current={active === d.href ? "page" : undefined}
            >
              <span>
                <WorkspaceIcon name={d.icon} />
              </span>
              {d.label}
              {active === d.href && <i />}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span className="status-dot" />A person always decides.
            <p>
              Every suggestion shows its reasons.
              <br />
              Talents never see a rank or a score.
            </p>
          </div>
          <Link href="/demo">
            See the demo data <WorkspaceIcon name="arrow" />
          </Link>
          <small>Synthetic profiles · Local workspace</small>
        </div>
      </aside>
      <div className="app-main">
        <header className="app-topbar">
          <div>
            <span className="topbar-breadcrumb">
              Workspace <span>/</span>
            </span>
            <strong>{current?.label ?? "Demo data"}</strong>
          </div>
          <div className="topbar-right">
            <span className="local-indicator">
              <i />
              Local demo
            </span>
            <span className="workspace-avatar" aria-label="Demo workspace">
              R
            </span>
          </div>
        </header>
        <div id="workspace-content" className="app-content" tabIndex={-1}>
          {children}
        </div>
        <footer className="app-footer">
          <span>Rosace / Junction 2026</span>
          <span>
            Dotted bar: declared by the talent · Solid bar: observed by a
            recruiter
          </span>
        </footer>
      </div>
    </div>
  );
}
