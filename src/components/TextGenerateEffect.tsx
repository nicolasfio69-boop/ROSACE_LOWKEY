/** Lightweight CSS adaptation of Aceternity UI's free word-by-word reveal. */
export function TextGenerateEffect({ words }: { words: string }) {
  return (
    <span>
      <span className="sr-only">{words}</span>
      {words.split(" ").map((word, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="text-generate-word"
          style={{ animationDelay: `${i * 70}ms` }}
        >
          {word}{" "}
        </span>
      ))}
    </span>
  );
}
