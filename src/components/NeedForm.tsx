"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Rosace } from "./Rosace";
import { COMPONENTS, JOB_SKILLS, LEVELS, descriptor, isComponent, skillName, type ExpectedLevel } from "@/lib/framework";
import { JOB_QUESTIONS, levelExample, prepareNeed, type NeedDraft, type DraftResult } from "@/lib/need-draft";
import { MAJOR_COUNT, MAX_MINORS, MAX_JOB_SKILLS, type Requirement } from "@/lib/scoring";

import { decodeStoredNeed, emptyNeedDraft, NEED_STORAGE_KEY, saveNeed } from "@/lib/need-storage";

const inputClass = "mt-1 w-full rounded border border-line bg-white p-2 focus:outline-2 focus:outline-brand";
const panelClass = "rounded-lg border border-line bg-white p-4";

export function NeedForm() {
  const [draft, setDraft] = useState<NeedDraft>(emptyNeedDraft);
  const [result, setResult] = useState<DraftResult | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [storageError, setStorageError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(NEED_STORAGE_KEY);
      if (raw) {
        const stored = decodeStoredNeed(raw);
        setDraft(stored.draft);
        if (stored.confirmed) setResult(prepareNeed(stored.draft));
        setSaved(true);
      }
    } catch {
      setStorageError("Your saved need could not be restored. You can continue editing; saving will replace the unreadable copy.");
    }
    setLoaded(true);
  }, []);

  function persist(next: NeedDraft, confirmed: boolean) {
    try {
      saveNeed(window.localStorage, next, confirmed);
      setSaved(true);
      setStorageError("");
    } catch {
      setSaved(false);
      setStorageError("Your latest changes could not be saved in this browser. Keep this page open and retry saving.");
    }
  }

  function clearSavedNeed() {
    try {
      window.localStorage.removeItem(NEED_STORAGE_KEY);
      setDraft(emptyNeedDraft());
      setResult(null);
      setSaved(false);
      setStorageError("");
    } catch {
      setStorageError("The saved need could not be deleted. Please allow browser storage and try again.");
    }
  }

  const majors = draft.requirements.filter((r) => r.major).length;
  const minors = draft.requirements.filter((r) => isComponent(r.skill) && !r.major).length;
  const jobs = draft.requirements.filter((r) => !isComponent(r.skill)).length;
  const validation = prepareNeed(draft);

  function update(patch: Partial<NeedDraft>) {
    const next = { ...draft, ...patch };
    setDraft(next);
    setResult(null);
    persist(next, false);
  }

  function select(skill: string, role: "none" | "major" | "minor" | "job") {
    const previous = draft.requirements.find((r) => r.skill === skill);
    const requirements = draft.requirements.filter((r) => r.skill !== skill);
    if (role !== "none") requirements.push({ skill, major: role === "major", expected: previous?.expected ?? 1 });
    update({ requirements });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const checked = prepareNeed(draft);
    setResult(checked);
    if (checked.ok) persist(draft, true);
  }

  function levels(requirement: Requirement) {
    return (
      <fieldset className="mt-4 space-y-2">
        <legend className="font-medium">Expected level for {skillName(requirement.skill)}</legend>
        {([1, 2, 3] as const).map((level) => (
          <label key={level} className={`block cursor-pointer rounded border p-3 ${requirement.expected === level ? "border-brand bg-paper" : "border-line"}`}>
            <span className="flex items-center gap-2 font-semibold">
              <input type="radio" name={`level-${requirement.skill}`} value={level} checked={requirement.expected === level} onChange={() => update({ requirements: draft.requirements.map((r) => r.skill === requirement.skill ? { ...r, expected: level as ExpectedLevel } : r) })} />
              {LEVELS[level].name}
            </span>
            <span className="mt-1 block text-sm">{descriptor(requirement.skill, level)}</span>
            <span className="mt-2 block text-sm text-muted">Hand-written job example: {levelExample(requirement.skill, level, draft)}</span>
          </label>
        ))}
      </fieldset>
    );
  }

  if (!loaded) return <p role="status">Loading your saved need…</p>;

  return (
    <form onSubmit={submit} className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-6">
        <div className={panelClass}>
          <p role="status">{saved ? "Saved in this browser. Your work will be restored when you return." : "Your edits are saved automatically in this browser."}</p>
          {storageError && <p role="alert" className="mt-2 text-brand">{storageError}</p>}
          {storageError && <button type="button" className="mt-2 mr-4 underline" onClick={() => persist(draft, result?.ok === true)}>Retry saving</button>}
          <button type="button" className="mt-2 underline" onClick={clearSavedNeed}>Clear saved need and start again</button>
        </div>
        <section className={panelClass} aria-labelledby="job-heading">
          <h2 id="job-heading" className="text-xl font-semibold">1. Describe the job</h2>
          <label className="mt-4 block">Job title<input className={inputClass} required maxLength={120} value={draft.title} onChange={(e) => update({ title: e.target.value })} /></label>
          <label className="mt-4 block">Short description<textarea className={inputClass} required maxLength={1000} rows={3} value={draft.description} onChange={(e) => update({ description: e.target.value })} /></label>
          <h3 className="mt-4 font-semibold">Four optional questions to make the examples concrete</h3>
          {JOB_QUESTIONS.map((q) => <label key={q.key} className="mt-3 block">{q.label}<input className={inputClass} maxLength={240} placeholder={q.placeholder} value={draft.context[q.key]} onChange={(e) => update({ context: { ...draft.context, [q.key]: e.target.value } })} /></label>)}
        </section>
        <section aria-labelledby="components-heading">
          <h2 id="components-heading" className="text-xl font-semibold">2. Choose Centrale components</h2>
          <p className="my-2 text-muted">Choose exactly three majors and up to two minors. Select a level card for each. Foundation is selected initially.</p>
          <p className="mb-4 text-sm" aria-live="polite">Majors: {majors} of {MAJOR_COUNT} · Minors: {minors} of {MAX_MINORS}</p>
          <div className="space-y-4">
            {COMPONENTS.map((component) => {
              const selected = draft.requirements.find((r) => r.skill === component.code);
              return <article key={component.code} className={`${panelClass} ${selected?.major ? "border-t-4 border-t-gold" : ""}`}>
                <h3 className="font-semibold">{component.code} · {component.name}</h3>
                <label className="mt-2 block text-sm">Priority for {component.short}
                  <select aria-label={`Priority for ${component.short}`} className={inputClass} value={selected ? selected.major ? "major" : "minor" : "none"} onChange={(e) => select(component.code, e.target.value as "none" | "major" | "minor")}>
                    <option value="none">Not selected</option>
                    <option value="major" disabled={!selected?.major && majors >= MAJOR_COUNT}>Major (gold)</option>
                    <option value="minor" disabled={(!selected || selected.major) && minors >= MAX_MINORS}>Minor (red)</option>
                  </select>
                </label>
                {selected && levels(selected)}
              </article>;
            })}
          </div>
        </section>
        <section aria-labelledby="skills-heading">
          <h2 id="skills-heading" className="text-xl font-semibold">3. Add up to two job skills</h2>
          <p className="my-2 text-muted">These sit alongside the Centrale base and are never majors.</p>
          <div className="space-y-4">{JOB_SKILLS.map((skill) => {
            const selected = draft.requirements.find((r) => r.skill === skill.code);
            return <article key={skill.code} className={panelClass}>
              <label className="flex items-center gap-2 font-semibold"><input type="checkbox" checked={!!selected} disabled={!selected && jobs >= MAX_JOB_SKILLS} onChange={(e) => select(skill.code, e.target.checked ? "job" : "none")} />{skill.name}</label>
              {selected && levels(selected)}
            </article>;
          })}</div>
        </section>
        <section className={panelClass} aria-labelledby="review-heading">
          <h2 id="review-heading" className="text-xl font-semibold">4. Review your need</h2>
          <label className="mt-3 block">How many people do you want to meet?<input className={inputClass} type="number" min={1} step={1} required value={Number.isNaN(draft.capacity) ? "" : draft.capacity} onChange={(e) => update({ capacity: e.target.valueAsNumber })} /></label>
          <p className="mt-3 text-sm text-muted">Review the descriptors and examples before confirming. No AI is used.</p>
          {!validation.ok && <ul id="need-errors" className="mt-3 list-inside list-disc text-sm text-brand">{validation.errors.map((error) => <li key={error}>{error}</li>)}</ul>}
          <button type="submit" aria-describedby={!validation.ok ? "need-errors" : undefined} className="mt-4 rounded bg-brand px-4 py-2 font-semibold text-white">Confirm need</button>
          {result && !result.ok && <p role="alert" className="mt-3 text-brand">Need not confirmed. Resolve the issues listed above.</p>}
          {result?.ok && <div role="status" className="mt-4 rounded border border-line p-4">
            <h3 className="font-semibold">Need confirmed</h3>
            <p>{result.need.title} · {result.need.capacity} people to meet</p><p>{result.description}</p>
            <p className="mt-2 text-sm text-muted">{saved ? "Confirmation saved in this browser. Edit any field to revise your need and confirm again." : "Confirmed on this page, but not saved. Retry saving before leaving."}</p>
          </div>}
        </section>
      </div>
      <aside className={`${panelClass} lg:sticky lg:top-4`} aria-label="Live need preview">
        <h2 className="text-lg font-semibold">Your need, as you choose</h2>
        <Rosace title={draft.title || "New need"} size={300} labels="short" expected={Object.fromEntries(draft.requirements.filter((r) => isComponent(r.skill)).map((r) => [r.skill, { level: r.expected, major: r.major }]))} />
        <p className="text-sm text-muted">Gold: majors · Red: minors. Empty branches are not filled in.</p>
        <p className="mt-2 text-sm text-muted">Grey disk: Foundation · Inner ring: Intermediate · Outer circle: Advanced.</p>
        <ul className="mt-4 space-y-2 text-sm">{draft.requirements.filter((r) => isComponent(r.skill)).map((r) => <li key={r.skill}>{r.major ? "Major" : "Minor"}: {skillName(r.skill)} · {LEVELS[r.expected].name}</li>)}</ul>
        <h3 className="mt-4 font-semibold">Job skills alongside the rosace</h3>
        {jobs === 0 ? <p className="text-sm text-muted">None selected (optional).</p> : <ul className="mt-2 space-y-2 text-sm">{draft.requirements.filter((r) => !isComponent(r.skill)).map((r) => <li key={r.skill}>{skillName(r.skill)} · {LEVELS[r.expected].name}</li>)}</ul>}
      </aside>
    </form>
  );
}
