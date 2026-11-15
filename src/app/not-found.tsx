import Link from "next/link";

export default function NotFound() {
  return (
    <div className="workspace not-found">
      <div className="step-heading">
        <h1>This page does not exist.</h1>
        <p>
          The link may be old. Every workspace is reachable from the welcome
          page.
        </p>
      </div>
      <div className="role-links">
        <Link href="/?choose=1" className="primary-button">
          Back to welcome
        </Link>
        <Link href="/tour" className="text-button">
          Watch the 3-minute demo →
        </Link>
      </div>
    </div>
  );
}
