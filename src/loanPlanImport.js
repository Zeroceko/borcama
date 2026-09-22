import { parseLoanPlanText } from "./loanPlanParser.js";
import { textContentToText } from "./statementImport.js";

const MAX_FILE_SIZE = 12 * 1024 * 1024;
const PDF_ASSET_ROOT = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38";

function assertFile(file) {
  if (!file) throw new Error("Bir ödeme planı PDF'i seçin.");
  if (file.size > MAX_FILE_SIZE) throw new Error("Dosya en fazla 12 MB olabilir.");
  if (file.type !== "application/pdf" && !/\.pdf$/i.test(file.name || "")) {
    throw new Error("Ödeme planı için PDF formatında bir dosya seçin.");
  }
}

export async function readLoanPlanFile(file, progress, options = {}) {
  assertFile(file);
  progress?.({ stage: "prepare", page: 1, pages: 1, progress: 0 });
  const [pdfjs, workerModule] = await Promise.all([
    import("pdfjs-dist"),
    import("./pdfWorkerUrl.js"),
  ]);
  const pdfWorkerUrl = workerModule.default;
  pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
  const document = await pdfjs.getDocument({
    data: await file.arrayBuffer(),
    cMapUrl: `${PDF_ASSET_ROOT}/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `${PDF_ASSET_ROOT}/standard_fonts/`,
    wasmUrl: `${PDF_ASSET_ROOT}/wasm/`,
  }).promise;
  const pageCount = Math.min(document.numPages, 120);
  const texts = [];
  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
    progress?.({ stage: "read", page: pageNumber, pages: pageCount, progress: (pageNumber - 1) / pageCount });
    const page = await document.getPage(pageNumber);
    texts.push(textContentToText(await page.getTextContent()));
  }
  const text = texts.filter(Boolean).join("\n\n--- SAYFA ---\n\n");
  if (text.replace(/\s/g, "").length < 120) {
    throw new Error("Bu PDF'de okunabilir metin bulunamadı. Taranmış belge yerine bankadan indirilen orijinal PDF'i deneyin.");
  }
  const result = parseLoanPlanText(text, { sourceType: "pdf", pagesRead: pageCount, ...options });
  progress?.({ stage: "done", page: pageCount, pages: pageCount, progress: 1 });
  return result;
}

export { MAX_FILE_SIZE };
