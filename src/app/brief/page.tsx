import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ConversationBrief } from "@/components/ConversationBrief";
export default function Brief() {
  return (
    <main className="site-shell">
      <nav className="site-nav">
        <Link href="/" aria-label="Rosace home">
          <Logo size={40} />
        </Link>
        <span className="event-pill">Conversation workspace</span>
      </nav>
      <ConversationBrief />
    </main>
  );
}
