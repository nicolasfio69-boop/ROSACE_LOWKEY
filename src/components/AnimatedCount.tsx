"use client";
import { useEffect, useState } from "react";
export function AnimatedCount({ value }: { value: number }) {
  const [shown, setShown] = useState(value);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const stop = () => {
      cancelAnimationFrame(frame);
      setShown(value);
    };
    if (media.matches) return;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / 550);
      setShown(Math.round(value * (1 - (1 - progress) ** 3)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    media.addEventListener("change", stop);
    return () => {
      cancelAnimationFrame(frame);
      media.removeEventListener("change", stop);
    };
  }, [value]);
  return (
    <span aria-label={String(value)}>
      <span aria-hidden="true">{shown}</span>
    </span>
  );
}
