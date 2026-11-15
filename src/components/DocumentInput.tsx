"use client";
import { useRef, useState } from "react";
import { readDocument } from "@/lib/document-import";
export function DocumentInput({
  label,
  onText,
}: {
  label: string;
  onText: (text: string) => void;
}) {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const generation = useRef(0);
  return (
    <div className="document-input">
      <label>
        {label}
        <input
          type="file"
          accept=".pdf,.docx,.txt,.md"
          disabled={busy}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const id = ++generation.current;
            setBusy(true);
            setStatus("Reading on this device…");
            try {
              const text = await readDocument(file);
              if (generation.current === id) {
                onText(text);
                setStatus("Text extracted. Review it below before continuing.");
              }
            } catch (error) {
              setStatus(
                error instanceof Error
                  ? error.message
                  : "Could not read this file. Paste its text instead.",
              );
            } finally {
              setBusy(false);
              e.target.value = "";
            }
          }}
        />
      </label>
      <p className="quiet-note">
        PDF with text, DOCX, TXT or MD · up to 3 MB · parsed on this device
      </p>
      <p role="status" className="quiet-note">
        {status}
      </p>
    </div>
  );
}
