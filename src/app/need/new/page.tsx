import Link from "next/link";
import { Logo } from "@/components/Logo";
import { NeedForm } from "@/components/NeedForm";

export default function NewNeed() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-8">
        <div className="flex items-center justify-between gap-4"><Logo size={44} /><Link href="/" className="underline">Back to demo overview</Link></div>
        <h1 className="mt-6 text-3xl font-semibold">Prepare a recruiter need</h1>
        <p className="mt-2 text-muted">Describe the job, choose what matters, and review the level you expect. You make the decision.</p>
        <p className="mt-2 text-sm text-muted">Use synthetic job details only. Your draft and confirmation are saved on this browser only, not shared across devices.</p>
      </header>
      <NeedForm />
    </main>
  );
}
