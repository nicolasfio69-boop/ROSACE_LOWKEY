"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  roleForPath,
  roleDestination,
  type WorkspaceRole,
} from "@/lib/workspace-role";
import { usePathname, useRouter } from "next/navigation";
import { WorkspaceIcon } from "./WorkspaceIcon";
import { Logo } from "./Logo";
import { AuroraBackground } from "./AuroraBackground";
const allDestinations = [
  {
    href: "/tour",
    label: "3-minute demo",
    icon: "pointer",
    subtitle: "The whole event, step by step",
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
    href: "/talent/checks",
    label: "My checks",
    icon: "pointer",
    subtitle: "Answer at your declared level",
  },
  {
    href: "/checks",
    label: "Checks",
    icon: "pointer",
    subtitle: "Review a concrete situation",
  },
];
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [rememberedRole, setRememberedRole] =
    useState<WorkspaceRole>("recruiter");
  const role = roleForPath(pathname) ?? rememberedRole;
  useEffect(() => {
    const inferred = roleForPath(pathname);
    if (inferred) {
      setRememberedRole(inferred);
      try {
        localStorage.setItem("rosace.workspace-role", inferred);
      } catch {
        /* Navigation works without storage. */
      }
      return;
    }
    try {
      const saved = localStorage.getItem("rosace.workspace-role");
      if (
        saved === "candidate" ||
        saved === "recruiter" ||
        saved === "organiser"
      )
        setRememberedRole(saved);
    } catch {
      /* The route still identifies the role without storage. */
    }
  }, [pathname]);
  const allowed =
    role === "candidate"
      ? ["/tour", "/talent/new", "/talent/checks"]
      : role === "organiser"
        ? ["/tour", "/organiser", "/conversations"]
        : ["/tour", "/need/new", "/checks", "/conversations"];
  const destinations = allDestinations.filter((d) => allowed.includes(d.href));
  function switchRole(next: WorkspaceRole) {
    setRememberedRole(next);
    try {
      localStorage.setItem("rosace.workspace-role", next);
    } catch {
      /* Navigation remains available. */
    }
    const path = roleDestination(next, pathname);
    router.push(
      path +
        (["/checks", "/talent/checks"].includes(path)
          ? window.location.search
          : ""),
    );
  }
  const active = pathname === "/brief" ? "/conversations" : pathname;
  const current = destinations.find((d) => d.href === active);
  return (
    <div className="app-shell">
      <AuroraBackground />
      <a href="#workspace-content" className="skip-link">
        Skip to workspace
      </a>
      <aside className="app-sidebar">
        <Link href="/" className="app-brand" aria-label="Rosace home">
          <Logo size={36} />
          <span aria-hidden="true">SKILLS-BASED MATCHMAKING</span>
        </Link>
        <div className="sidebar-event">
          <span className="event-avatar">E</span>
          <div>
            <strong>Espoo Tech Matchmaking</strong>
            <small>Event workspace · Demo</small>
          </div>
        </div>
        <p className="sidebar-caption">{role.toUpperCase()} WORKSPACE</p>
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
          <small>Synthetic profiles · Local workspace</small>
        </div>
      </aside>
      <div className="app-main">
        <header className="app-topbar">
          <div>
            <span className="topbar-breadcrumb">
              Workspace <span>/</span>
            </span>
            <strong>
              {current?.label ?? (pathname === "/" ? "Overview" : "Demo data")}
            </strong>
          </div>
          <div className="topbar-right">
            <label className="role-switch">
              <span>View as</span>
              <select
                aria-label="Workspace role"
                value={role}
                onChange={(e) => switchRole(e.target.value as WorkspaceRole)}
              >
                <option value="candidate">Candidate</option>
                <option value="recruiter">Recruiter</option>
                <option value="organiser">Organiser</option>
              </select>
            </label>
            <label className="mobile-destination">
              <span className="sr-only">Workspace page</span>
              <select
                aria-label="Workspace page"
                value={
                  active && destinations.some((d) => d.href === active)
                    ? active
                    : ""
                }
                onChange={(event) => {
                  window.location.assign(event.target.value);
                }}
              >
                <option value="" disabled>
                  More tools
                </option>
                {destinations.map((d) => (
                  <option key={d.href} value={d.href}>
                    {d.label}
                  </option>
                ))}
              </select>
            </label>
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
          <span>Demo roles · No authenticated accounts · Your browser</span>
        </footer>
      </div>
    </div>
  );
}
