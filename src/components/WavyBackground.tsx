"use client";
import { useEffect, useRef } from "react";
import { createNoise3D } from "simplex-noise";

/*
 * Wavy background, after the free Aceternity UI "Wavy Background" component
 * (canvas + simplex noise), recoloured in Centrale red and gold.
 * Changes from the original: it sizes itself to its container instead of the
 * window, pauses off screen and draws one still frame under reduced motion.
 */

const CENTRALE_WAVES = ["#C8102E", "#F0C300", "#8E1027", "#E8344E", "#F5D547"];

export function WavyBackground({
  colors = CENTRALE_WAVES,
  waveWidth = 50,
  backgroundFill = "#09090b",
  blur = 10,
  speed = "slow",
  waveOpacity = 0.42,
  className = "",
}: {
  colors?: string[];
  waveWidth?: number;
  backgroundFill?: string;
  blur?: number;
  speed?: "slow" | "fast";
  waveOpacity?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const noise = createNoise3D();
    const step = speed === "fast" ? 0.002 : 0.001;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    // Safari ignores ctx.filter, so the blur goes on the element instead.
    const safari =
      /Safari/.test(navigator.userAgent) &&
      !/Chrome|Chromium/.test(navigator.userAgent);
    if (safari) canvas.style.filter = `blur(${blur}px)`;

    let w = 0;
    let h = 0;
    let nt = reduced ? 40 : 0;
    let frame = 0;
    let visible = true;

    const resize = () => {
      w = canvas.width = Math.max(1, canvas.clientWidth);
      h = canvas.height = Math.max(1, canvas.clientHeight);
      if (!safari) ctx.filter = `blur(${blur}px)`;
    };
    const drawWaves = () => {
      nt += step;
      for (let i = 0; i < colors.length; i++) {
        ctx.beginPath();
        ctx.lineWidth = waveWidth;
        ctx.strokeStyle = colors[i % colors.length];
        for (let x = 0; x < w; x += 5) {
          const y = noise(x / 800, 0.3 * i, nt) * 100;
          ctx.lineTo(x, y + h * 0.55);
        }
        ctx.stroke();
        ctx.closePath();
      }
    };
    const render = () => {
      ctx.globalAlpha = 1;
      ctx.fillStyle = backgroundFill;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = waveOpacity;
      drawWaves();
    };
    const loop = () => {
      render();
      if (visible && !reduced) frame = requestAnimationFrame(loop);
    };

    resize();
    render();
    canvas.dataset.ready = "true";
    const sized = new ResizeObserver(() => {
      resize();
      render();
    });
    sized.observe(canvas);
    const seen = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(frame);
      if (visible && !reduced) frame = requestAnimationFrame(loop);
    });
    seen.observe(canvas);
    return () => {
      cancelAnimationFrame(frame);
      sized.disconnect();
      seen.disconnect();
    };
  }, [colors, waveWidth, backgroundFill, blur, speed, waveOpacity]);

  return (
    <div className={`shader-backdrop ${className}`} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
