/** A visual cue for autonomy, not another measurement of skill. */
export function LevelScene({ level }: { level: 1 | 2 | 3 }) {
  const person = (x: number, y: number, muted = false) => (
    <g
      transform={`translate(${x} ${y})`}
      fill="none"
      stroke={muted ? "#bdb6ab" : "#8e1027"}
      strokeWidth="1.6"
    >
      <circle cy="-8" r="4" />
      <path d="M-7 9v-5a7 7 0 0 1 14 0v5" />
    </g>
  );
  return (
    <svg viewBox="0 0 130 62" className="level-scene" aria-hidden="true">
      <rect
        x="1"
        y="1"
        width="128"
        height="60"
        rx="12"
        fill={level === 3 ? "#f8f0dc" : "#f5f3ed"}
      />
      {level === 1 ? (
        <>
          {person(35, 30)}
          {person(60, 30, true)}
          <path d="M76 30h10m-3-3 3 3-3 3" fill="none" stroke="#a49c8b" />
          <rect
            x="96"
            y="22"
            width="15"
            height="18"
            rx="2"
            fill="white"
            stroke="#a49c8b"
          />
          <path d="m99 31 3 3 6-7" fill="none" stroke="#8e1027" />
        </>
      ) : level === 2 ? (
        <>
          {person(32, 30)}
          <path d="M47 30h16m-3-3 3 3-3 3" fill="none" stroke="#a49c8b" />
          <rect
            x="75"
            y="19"
            width="28"
            height="23"
            rx="3"
            fill="white"
            stroke="#a49c8b"
          />
          <path
            d="m82 30 5 5 9-10"
            fill="none"
            stroke="#8e1027"
            strokeWidth="2"
          />
        </>
      ) : (
        <>
          {person(29, 30, true)}
          {person(56, 30)}
          <path d="M69 30h13" stroke="#a49c8b" />
          <path
            d="m100 14 5 10 11 2-8 8 2 12-10-5-10 5 2-12-8-8 11-2z"
            fill="white"
            stroke="#b89642"
          />
          <path
            d="m95 30 4 4 7-8"
            fill="none"
            stroke="#8e1027"
            strokeWidth="1.5"
          />
        </>
      )}
    </svg>
  );
}
