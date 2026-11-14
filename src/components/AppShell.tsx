"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  roleForPath,
  roleDestination,
  type WorkspaceRole,
} from "@/lib/workspace-role";
import { usePathname, useRouter } from "next/navigation";
import { WorkspaceIcon } from "./WorkspaceIcon";
import {
  rememberEntryPreference,
  WORKSPACE_HOMES,
} from "@/lib/entry-preference";
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
  const profileMenu = useRef<HTMLDetailsElement>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const router = useRouter();
  const [rememberedRole, setRememberedRole] =
    useState<WorkspaceRole>("recruiter");
  const role = roleForPath(pathname) ?? rememberedRole;
  useEffect(() => {
    function closeOutside(event: PointerEvent) {
      if (
        profileMenu.current &&
        !profileMenu.current.contains(event.target as Node)
      )
        profileMenu.current.open = false;
    }
    function closeWithEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && profileMenu.current?.open) {
        profileMenu.current.open = false;
        profileMenu.current.querySelector("summary")?.focus();
      }
    }
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeWithEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeWithEscape);
    };
  }, []);
  useEffect(() => {
    if (profileMenu.current) profileMenu.current.open = false;
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
  const destinations = [
    {
      href: WORKSPACE_HOMES[role],
      label: "My workspace",
      icon: "overview",
      subtitle: "Your next step",
    },
    ...allDestinations.filter((d) => allowed.includes(d.href)),
  ];
  function switchRole(next: WorkspaceRole) {
    setRememberedRole(next);
    if (profileMenu.current) profileMenu.current.open = false;
    try {
      rememberEntryPreference(localStorage, next);
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
  if (pathname === "/")
    return (
      <div className="app-shell entry-root">
        <AuroraBackground />
        <a href="#entry-content" className="skip-link">
          Skip to welcome
        </a>
        {children}
      </div>
    );
  return (
    <div className="app-shell">
      <AuroraBackground />
      <a href="#workspace-content" className="skip-link">
        Skip to workspace
      </a>
      <aside className="app-sidebar">
        <Link href={WORKSPACE_HOMES[role]} className="app-brand">
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
              {current?.label ??
                (pathname === "/overview" ? "Overview" : "Demo data")}
            </strong>
          </div>
          <div className="topbar-right">
            <details
              className="profile-menu"
              ref={profileMenu}
              onToggle={(event) => setProfileOpen(event.currentTarget.open)}
            >
              <summary
                role="button"
                aria-expanded={profileOpen}
                aria-controls="profile-choices"
              >
                <WorkspaceIcon name="talent" />
                <span>
                  {role === "candidate"
                    ? "Candidate"
                    : role === "recruiter"
                      ? "Recruiter"
                      : "Organiser"}
                  <small>Demo profile</small>
                </span>
                <span className="profile-chevron" aria-hidden="true">
                  <WorkspaceIcon name="arrow" />
                </span>
              </summary>
              <div className="profile-menu-content" id="profile-choices">
                <p>Switch demo workspace</p>
                {(["candidate", "recruiter", "organiser"] as const).map(
                  (next) => (
                    <button
                      key={next}
                      type="button"
                      onClick={() => switchRole(next)}
                    >
                      {next[0].toUpperCase() + next.slice(1)}
                      {next === role && <small>Current</small>}
                    </button>
                  ),
                )}
                <Link href="/?choose=1">Back to welcome</Link>
                <small>
                  Fictional profiles. No authenticated accounts or access
                  permissions.
                </small>
              </div>
            </details>
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
