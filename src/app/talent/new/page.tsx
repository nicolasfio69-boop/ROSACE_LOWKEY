import Link from "next/link";
import { Logo } from "@/components/Logo";
import { TalentForm } from "@/components/TalentForm";
export default function NewTalent() {
  return (
    <main className="site-shell">
      <nav className="site-nav">
        <Link href="/" aria-label="Rosace home">
          <Logo size={40} />
        </Link>
        <span className="event-pill">Talent workspace · Espoo</span>
      </nav>
      <TalentForm />
    </main>
  );
}
