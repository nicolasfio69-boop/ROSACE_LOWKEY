const paths: Record<string, string> = {
  overview: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
  need: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10 M12 10v4 M10 12h4",
  talent: "M12 3 21 12 12 21 3 12Z M8 12h8 M12 8v8",
  event: "M8 5h13 M8 12h13 M8 19h13 M3 5h1 M3 12h1 M3 19h1",
  conversation: "M4 4h16v12H10l-6 4z M8 8h8 M8 12h5",
  practice: "m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3z",
  arrow: "M5 12h14 M13 6l6 6-6 6",
  pointer: "m5 3 13 9-7 1-3 7z",
};
export function WorkspaceIcon({ name }: { name: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] ?? paths.arrow} />
    </svg>
  );
}
