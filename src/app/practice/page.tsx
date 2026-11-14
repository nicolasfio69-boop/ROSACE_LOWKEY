import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Practice } from "@/components/Practice";
export default function PracticePage() {
  return (
    <main className="site-shell">
      <nav className="site-nav">
        <Link href="/" aria-label="Rosace home">
          <Logo size={40} />
        </Link>
        <span className="event-pill">Practice · Fictional situations</span>
      </nav>
      <Practice />
    </main>
  );
}
