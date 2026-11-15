/** A fictional, read-only recording: playback never records real decisions. */
export const DEMO_DURATION_MS = 180_000;
export const CHAPTER_DURATION_MS = DEMO_DURATION_MS / 4;
export const BEAT_DURATION_MS = CHAPTER_DURATION_MS / 4;
export function demoPosition(elapsed: number) {
  const bounded = Math.max(
    0,
    Math.min(DEMO_DURATION_MS, Number.isFinite(elapsed) ? elapsed : 0),
  );
  const chapter = Math.min(3, Math.floor(bounded / CHAPTER_DURATION_MS));
  const beat = Math.min(
    3,
    Math.floor((bounded - chapter * CHAPTER_DURATION_MS) / BEAT_DURATION_MS),
  );
  return {
    chapter,
    beat,
    elapsed: bounded,
    complete: bounded === DEMO_DURATION_MS,
  };
}
export function demoTime(elapsed: number) {
  const seconds = Math.floor(demoPosition(elapsed).elapsed / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

/** Lets the workspace sidebar show the role of the tour chapter on screen. */
export const TOUR_ROLE_EVENT = "rosace:tour-role";
