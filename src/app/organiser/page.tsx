import Link from "next/link";
import { Logo } from "@/components/Logo";
import { OrganiserWorkspace } from "@/components/OrganiserWorkspace";
export default function Organiser() {
  return (
    <main className="site-shell">
      <nav className="site-nav">
        <Link href="/" aria-label="Rosace home">
          <Logo size={40} />
        </Link>
        <span className="event-pill">Organiser · Synthetic demo</span>
      </nav>
      <OrganiserWorkspace />
    </main>
  );
}
