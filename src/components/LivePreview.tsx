"use client";
import { useId, useState, type ReactNode } from "react";

/** A full chart on desktop and an expandable, sticky preview on small screens. */
export function LivePreview({
  label,
  summary,
  children,
}: {
  label: string;
  summary: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <aside
      className={`live-panel live-preview ${open ? "preview-open" : ""}`}
      aria-label={label}
      tabIndex={0}
    >
      <button
        className="preview-toggle"
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
      >
        <span>
          <strong>Your rosace</strong>
          <small aria-live="polite">{summary}</small>
        </span>
        <span>{open ? "Close −" : "View +"}</span>
      </button>
      <div id={id} className="preview-content">
        {children}
      </div>
    </aside>
  );
}
