"use client";
import { useId } from "react";
/** Free Aceternity Background Beams, reduced to four decorative curves and CSS motion. */
export function BackgroundBeams() {
  const id = useId();
  return (
    <svg
      className="background-beams"
      viewBox="0 0 696 316"
      fill="none"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={id}>
          <stop stopColor="#C8102E" stopOpacity="0" />
          <stop offset=".5" stopColor="#C8102E" />
          <stop offset="1" stopColor="#F0C300" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3].map((i) => (
        <path
          key={i}
          d="M-380 -189C-380 -189 -312 216 152 343C616 470 684 875 684 875"
          transform={`translate(${i * 60} ${-i * 40 - 180})`}
          stroke={`url(#${id})`}
          strokeWidth="1.5"
          pathLength="100"
          style={{ animationDelay: `${i * -2}s` }}
        />
      ))}
    </svg>
  );
}
