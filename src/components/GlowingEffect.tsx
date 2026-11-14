"use client";
import { useEffect, useRef } from "react";

/*
 * Glowing border that follows the pointer, after the free Aceternity UI
 * "Glowing Effect" component, in Centrale red and gold and without Motion.
 * Place it as the first child of a card with `position: relative`.
 */
export function GlowingEffect({
  spread = 40,
  proximity = 64,
  inactiveZone = 0.01,
  borderWidth = 2,
}: {
  spread?: number;
  proximity?: number;
  inactiveZone?: number;
  borderWidth?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let current = 0;
    let target = 0;
    let frame = 0;

    const animate = () => {
      const diff = ((((target - current + 180) % 360) + 360) % 360) - 180;
      current += diff * 0.12;
      el.style.setProperty("--start", String(current));
      if (Math.abs(diff) > 0.5) frame = requestAnimationFrame(animate);
    };

    const onMove = (e: PointerEvent) => {
      const { left, top, width, height } = el.getBoundingClientRect();
      const cx = left + width / 2;
      const cy = top + height / 2;
      const inactive = 0.5 * Math.min(width, height) * inactiveZone;
      const near =
        e.clientX > left - proximity &&
        e.clientX < left + width + proximity &&
        e.clientY > top - proximity &&
        e.clientY < top + height + proximity;
      const inCentre = Math.hypot(e.clientX - cx, e.clientY - cy) < inactive;
      el.style.setProperty("--active", near && !inCentre ? "1" : "0");
      if (!near || inCentre) return;
      target =
        (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI + 90;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(animate);
    };

    document.body.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      document.body.removeEventListener("pointermove", onMove);
    };
  }, [proximity, inactiveZone]);

  return (
    <span
      ref={ref}
      className="glowing-effect"
      aria-hidden="true"
      style={
        {
          "--spread": spread,
          "--glow-border": `${borderWidth}px`,
        } as React.CSSProperties
      }
    />
  );
}
