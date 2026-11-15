import type { CheckExercise } from "./verification";
export type CheckTiming = {
  startedAt: number;
  submittedAt: number;
  allowedSeconds: number;
};
export type CheckAttempt = {
  startedAt: number;
  deadline: number;
  exercise: CheckExercise;
};
export function startCheckAttempt(
  exercise: CheckExercise,
  now: number,
): CheckAttempt {
  return {
    startedAt: now,
    deadline: now + exercise.minutes * 60_000,
    exercise: { ...exercise, checks: [...exercise.checks] },
  };
}
export function secondsRemaining(attempt: CheckAttempt, now: number): number {
  return Math.max(0, Math.ceil((attempt.deadline - now) / 1000));
}
export function formatSeconds(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
}
export function cleanCheckTiming(
  value: unknown,
  minutes: number,
): CheckTiming | undefined {
  if (value === undefined) return undefined; // Earlier local submissions had no timer.
  if (!value || typeof value !== "object")
    throw new Error("Invalid exercise timing.");
  const t = value as CheckTiming;
  if (
    ![t.startedAt, t.submittedAt, t.allowedSeconds].every(Number.isFinite) ||
    t.startedAt < 0 ||
    t.submittedAt < t.startedAt ||
    t.allowedSeconds !== minutes * 60
  )
    throw new Error("Invalid exercise timing.");
  return {
    startedAt: t.startedAt,
    submittedAt: t.submittedAt,
    allowedSeconds: t.allowedSeconds,
  };
}
