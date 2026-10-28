// Ekran görüntüsü ve site denetim scriptleri için ortak yardımcılar:
// Supabase ayarı olmadan (demo modu) vite sunucusu ve sistem Chrome'u.

import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import { chromium } from "playwright-core";

export const kok = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Ortamdaki Supabase ayarı demo modunu kapatır; boş bir env klasörüyle ve
// VITE_ değişkenleri temizlenerek açılır. --url verilirse sunucu açılmaz.
export async function sunucuyuBaslat(argv = process.argv.slice(2)) {
  const i = argv.indexOf("--url");
  if (i >= 0 && argv[i + 1]) return { adres: argv[i + 1].replace(/\/$/, ""), kapat: async () => {} };
  for (const anahtar of Object.keys(process.env)) if (anahtar.startsWith("VITE_")) delete process.env[anahtar];
  const envDir = await mkdtemp(path.join(tmpdir(), "borcama-ekran-env-"));
  const sunucu = await createServer({
    root: kok,
    envDir,
    logLevel: "error",
    server: { port: 5199, strictPort: false, host: "127.0.0.1" },
  });
  await sunucu.listen();
  const adres = sunucu.resolvedUrls?.local?.[0]?.replace(/\/$/, "") || "http://127.0.0.1:5199";
  return { adres, kapat: () => sunucu.close() };
}

// Tarayıcı: sistemdeki Chrome; yoksa PLAYWRIGHT_CHROMIUM ile Chromium yolu.
export function tarayiciAc() {
  const yol = process.env.PLAYWRIGHT_CHROMIUM;
  if (yol) return chromium.launch({ executablePath: yol });
  return chromium.launch({ channel: "chrome" });
}

// Ölçüm izni bandı (ilk ziyaret) ölçülen sayfanın parçası değildir.
export async function baglamAc(b, secenekler) {
  const ctx = await b.newContext(secenekler);
  await ctx.addInitScript(() => {
    try { localStorage.setItem("borcama:reklam-olcum-izni", "hayir"); } catch { /* yok say */ }
  });
  return ctx;
}

// Siteyi açar, yazı tiplerini ve tembel görselleri yükler; koyu ise alt
// bilgideki anahtarla koyuya alır. Sayfa en üstte bırakılır.
export async function siteyiAc(ctx, adres, { koyu = false } = {}) {
  const sayfa = await ctx.newPage();
  await sayfa.goto(adres, { waitUntil: "networkidle" });
  if (koyu) await sayfa.click("#koyu-anahtar");
  await sayfa.evaluate(async () => {
    await document.fonts.ready;
    for (let y = 0; y < document.documentElement.scrollHeight; y += 400) {
      window.scrollTo({ top: y, behavior: "instant" });
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  });
  await sayfa.waitForTimeout(400);
  return sayfa;
}
