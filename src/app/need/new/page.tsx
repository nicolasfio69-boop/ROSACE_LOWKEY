import Link from "next/link";
import { Logo } from "@/components/Logo";
import { NeedForm } from "@/components/NeedForm";

export default function NewNeed() {
  return (
    <main className="site-shell">
      <nav className="site-nav" aria-label="Main navigation">
        <Link href="/" aria-label="Rosace home">
          <Logo size={40} />
        </Link>
        <div className="nav-links">
          <Link href="/demo">Demo overview</Link>
          <span className="event-pill">Recruiter workspace</span>
        </div>
      </nav>
      <NeedForm />
    </main>
  );
}
