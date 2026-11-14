export const MAX_DOCUMENT_BYTES = 3 * 1024 * 1024;
export const MAX_DOCUMENT_TEXT = 30000;
/** Parse inside the browser: no upload endpoint and no document persistence. */
export async function readDocument(file: File): Promise<string> {
  if (file.size > MAX_DOCUMENT_BYTES)
    throw new Error("Choose a document smaller than 3 MB.");
  let text = "";
  const extension = file.name.toLowerCase().split(".").pop();
  if (extension === "txt" || extension === "md") text = await file.text();
  else if (extension === "docx") {
    const mammoth = await import("mammoth");
    text = (
      await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })
    ).value;
  } else if (extension === "pdf") {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url,
    ).toString();
    const task = pdfjs.getDocument({
      data: new Uint8Array(await file.arrayBuffer()),
    });
    try {
      const pdf = await task.promise;
      if (pdf.numPages > 20)
        throw new Error("Choose a PDF with no more than 20 pages.");
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text +=
          content.items
            .map((item) => ("str" in item ? item.str : ""))
            .join(" ") + "\n";
        if (text.length > MAX_DOCUMENT_TEXT) break;
      }
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Choose a PDF with no more than 20 pages."
      )
        throw error;
      throw new Error(
        "This PDF could not be read. Try another document or paste its text instead.",
      );
    } finally {
      await task.destroy();
    }
  } else throw new Error("Use a text PDF, DOCX, TXT or MD document.");
  if (!text.trim())
    throw new Error(
      "No readable text found. For a scanned PDF, paste the text instead.",
    );
  if (text.length > MAX_DOCUMENT_TEXT)
    throw new Error(
      "This document is too long. Paste a shorter extract (30,000 characters maximum).",
    );
  return text.trim();
}
