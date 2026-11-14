import { describe, it, expect } from "vitest";
import {
  readDocument,
  MAX_DOCUMENT_BYTES,
  MAX_DOCUMENT_TEXT,
} from "./document-import";
describe("local document import boundaries", () => {
  it("reads plain text without any upload", async () =>
    expect(await readDocument(new File([" Fictional job "], "job.txt"))).toBe(
      "Fictional job",
    ));
  it("rejects oversized files before parsing", async () =>
    expect(
      readDocument(
        new File([new Uint8Array(MAX_DOCUMENT_BYTES + 1)], "large.pdf"),
      ),
    ).rejects.toThrow("3 MB"));
  it("rejects unsupported, empty and overlong text", async () => {
    await expect(readDocument(new File(["text"], "job.exe"))).rejects.toThrow(
      "Use a text PDF",
    );
    await expect(readDocument(new File([" "], "empty.txt"))).rejects.toThrow(
      "No readable text",
    );
    await expect(
      readDocument(new File(["x".repeat(MAX_DOCUMENT_TEXT + 1)], "long.txt")),
    ).rejects.toThrow("too long");
  });
});
