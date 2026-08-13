import { parseStatementText } from "./statementParser.js";

const MAX_FILE_SIZE = 12 * 1024 * 1024;
const OCR_WORKER = "https://cdn.jsdelivr.net/npm/tesseract.js@v7.0.0/dist/worker.min.js";
const OCR_CORE = "https://cdn.jsdelivr.net/npm/tesseract.js-core@v7.0.0";
const PDF_ASSET_ROOT = "https://cdn.jsdelivr.net/npm/pdfjs-dist@6.2.108";

function assertFile(file) {
  if (!file) throw new Error("Bir ekstre dosyası seçin.");
  if (file.size > MAX_FILE_SIZE) throw new Error("Dosya en fazla 12 MB olabilir.");
  const acceptedTypes = ["application/pdf", "image/png", "image/jpeg"];
  const acceptedExtension = /\.(pdf|png|jpe?g)$/i.test(file.name || "");
  if (!acceptedTypes.includes(file.type) && !acceptedExtension)
    throw new Error("PDF, PNG veya JPG formatında bir dosya seçin.");
}

async function canvasBlob(canvas) {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Sayfa görüntüsü hazırlanamadı."))),
      "image/png",
      0.94,
    ),
  );
}

async function pdfPages(file, progress) {
  const pdfjs = await import("pdfjs-dist");
  const workerUrl = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl.default;
  const pdfDocument = await pdfjs.getDocument({
    data: await file.arrayBuffer(),
    cMapUrl: `${PDF_ASSET_ROOT}/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `${PDF_ASSET_ROOT}/standard_fonts/`,
    wasmUrl: `${PDF_ASSET_ROOT}/wasm/`,
  }).promise;
  const count = Math.min(pdfDocument.numPages, 2);
  const pages = [];
  for (let pageNumber = 1; pageNumber <= count; pageNumber += 1) {
    progress?.({ stage: "render", page: pageNumber, pages: count, progress: 0 });
    const page = await pdfDocument.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 2.15 });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const context = canvas.getContext("2d", { alpha: false });
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: context, viewport }).promise;
    pages.push(await canvasBlob(canvas));
  }
  return pages;
}

async function imagePages(file) {
  return [file];
}

export async function readStatementFile(file, progress) {
  assertFile(file);
  progress?.({ stage: "prepare", progress: 0 });
  const pages =
    file.type === "application/pdf"
      ? await pdfPages(file, progress)
      : await imagePages(file);
  const { createWorker, PSM } = await import("tesseract.js");
  let activePage = 1;
  const worker = await createWorker(["tur", "eng"], 1, {
    workerPath: OCR_WORKER,
    corePath: OCR_CORE,
    cachePath: "borcama-ocr-v2",
    workerBlobURL: true,
    logger(message) {
      progress?.({
        stage: message.status || "ocr",
        page: activePage,
        pages: pages.length,
        progress: Number(message.progress || 0),
      });
    },
  });
  try {
    await worker.setParameters({
      tessedit_pageseg_mode: PSM.AUTO,
      preserve_interword_spaces: "1",
      user_defined_dpi: "180",
    });
    const texts = [];
    for (let index = 0; index < pages.length; index += 1) {
      activePage = index + 1;
      const result = await worker.recognize(pages[index]);
      texts.push(result.data.text || "");
    }
    const text = texts.join("\n\n--- SAYFA ---\n\n");
    const parsed = parseStatementText(text, {
      pagesRead: pages.length,
      sourceType: file.type === "application/pdf" ? "pdf" : "image",
    });
    return parsed;
  } finally {
    await worker.terminate();
  }
}

export { MAX_FILE_SIZE };
