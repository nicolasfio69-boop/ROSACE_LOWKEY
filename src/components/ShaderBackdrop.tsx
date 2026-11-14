"use client";
import { useEffect, useRef } from "react";

/*
 * Animated ribbons in Centrale red and gold on a night background.
 * Plain WebGL, no dependency. It pauses off screen, draws a single
 * still frame when the person prefers reduced motion, and falls back
 * to the CSS gradient of `.shader-backdrop` when WebGL is missing.
 */

const VERTEX = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`;

const FRAGMENT = `
precision mediump float;
uniform vec2 res;
uniform float t;
uniform float strength;

float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

void main() {
  vec2 uv = gl_FragCoord.xy / res;
  float aspect = res.x / res.y;
  vec2 q = vec2(uv.x * aspect, uv.y);
  vec3 red = vec3(0.784, 0.063, 0.180);
  vec3 gold = vec3(0.941, 0.765, 0.0);
  vec3 col = vec3(0.035, 0.035, 0.043);

  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    float speed = 0.10 + fi * 0.035;
    float y = 0.52
      + 0.16 * sin(q.x * (1.1 + fi * 0.23) + t * speed + fi * 1.7)
      + 0.05 * sin(q.x * (3.1 - fi * 0.3) - t * speed * 1.6 + fi);
    float d = abs(uv.y - y);
    float width = 0.0035 + 0.002 * fi;
    float glow = width / (d + width) ;
    glow = pow(glow, 1.6);
    vec3 tint = mix(red, gold, smoothstep(0.15, 0.95, uv.x + 0.15 * sin(t * 0.2 + fi)));
    if (i == 2) tint = mix(gold, red, uv.x);
    col += tint * glow * (0.55 - fi * 0.06);
  }

  // Soft red light from the top left, like a spotlight.
  float spot = smoothstep(1.1, 0.0, length((uv - vec2(0.12, 1.05)) * vec2(aspect * 0.7, 1.0)));
  col += red * spot * 0.22;

  // Vignette and film grain keep the gradient from banding.
  col *= smoothstep(1.35, 0.35, length(uv - 0.5));
  col += (hash(gl_FragCoord.xy + t) - 0.5) * 0.025;
  gl_FragColor = vec4(col * strength, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function ShaderBackdrop({
  strength = 1,
  className = "",
}: {
  strength?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) return;
    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    if (!vs || !fs) return;
    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const position = gl.getAttribLocation(program, "p");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(program, "res");
    const uTime = gl.getUniformLocation(program, "t");
    gl.uniform1f(gl.getUniformLocation(program, "strength"), strength);
    canvas.dataset.ready = "true";

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let frame = 0;
    let visible = true;
    const start = performance.now();

    const resize = () => {
      const scale = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * scale));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };
    const draw = (now: number) => {
      gl.uniform1f(uTime, reduced ? 12 : (now - start) / 1000 + 12);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    const loop = (now: number) => {
      draw(now);
      if (visible && !reduced) frame = requestAnimationFrame(loop);
    };

    resize();
    draw(start);
    const observer = new ResizeObserver(() => {
      resize();
      draw(performance.now());
    });
    observer.observe(canvas);
    const seen = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(frame);
      if (visible && !reduced) frame = requestAnimationFrame(loop);
    });
    seen.observe(canvas);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      seen.disconnect();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [strength]);

  return (
    <div className={`shader-backdrop ${className}`} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
