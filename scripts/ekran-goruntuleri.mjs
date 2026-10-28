// Sitede kullanılan uygulama ekran görüntülerini üretir (public/ekranlar/).
//
// Uygulama Supabase ayarı olmadan vite ile demo modunda açılır; veri
// demoVerisiOlustur() sentetik verisidir, gerçek kullanıcı verisi yoktur.
// Çıktı: web-ozet (1280×800 masaüstü Bugün) ve iphone-bugun / iphone-borclar /
// iphone-plan (390×844), açık ve koyu (-koyu), 2x DPR çekilip site boyutuna
// küçültülür; png + webp.
//
// Kullanım: npm run ekranlar (tarayıcı: scripts/tarayiciAraci.mjs)

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { baglamAc, kok, sunucuyuBaslat, tarayiciAc } from "./tarayiciAraci.mjs";

const cikti = path.join(kok, "public", "ekranlar");

// Çekilen ekran, sitede gösterildiği genişliğin iki katına küçültülür.
const EKRANLAR = [
  { ad: "web-ozet", yol: "/summary", gorunum: { width: 1280, height: 800 }, genislik: 1280, kalite: 0.78 },
  { ad: "iphone-bugun", yol: "/summary", gorunum: { width: 390, height: 844 }, genislik: 560, mobil: true, kalite: 0.8 },
  { ad: "iphone-borclar", yol: "/debts", gorunum: { width: 390, height: 844 }, genislik: 560, mobil: true, kalite: 0.8 },
  { ad: "iphone-plan", yol: "/debt-plan", gorunum: { width: 390, height: 844 }, genislik: 560, mobil: true, kalite: 0.8 },
];

// Yalnız demo/web'e özgü üst katmanlar gizlenir: demo plan anahtarı,
// "Görüş bildir" düğmesi ve ölçüm izni bandı uygulamanın kendisi değildir.
// iPhone görüntülerinde durum çubuğu payı bırakılır (çerçevedeki dinamik ada
// içeriğin üstüne binmesin).
const GIZLE = ".bt-demo-plan,.bt-feedback-trigger{display:none!important}";
const IPHONE_UST = "#root{padding-top:50px;background:var(--bg,#f4efe0)}.bt-app{min-height:calc(100vh - 50px)}";

async function temaAyarla(sayfa, koyu) {
  await sayfa.evaluate(async (koyu) => {
    const kayit = await window.storage.get("borctakip:v1");
    const veri = JSON.parse(kayit.value);
    veri.ayarlar = { ...(veri.ayarlar || {}), tema: koyu ? "dark" : "light" };
    await window.storage.set("borctakip:v1", JSON.stringify(veri));
  }, koyu);
}

async function bekle(sayfa) {
  await sayfa.waitForSelector(".bt-app", { timeout: 20000 });
  await sayfa.evaluate(() => document.fonts.ready);
  await sayfa.waitForTimeout(700);
}

// PNG'yi tarayıcının kendi kodlayıcısıyla küçültüp png + webp üretir.
async function kodla(sayfa, png, genislik, kalite) {
  const sonuc = await sayfa.evaluate(async ({ veri, genislik, kalite }) => {
    const resim = new Image();
    resim.src = `data:image/png;base64,${veri}`;
    await resim.decode();
    const yukseklik = Math.round((resim.naturalHeight * genislik) / resim.naturalWidth);
    const tuval = document.createElement("canvas");
    tuval.width = genislik;
    tuval.height = yukseklik;
    const ctx = tuval.getContext("2d");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(resim, 0, 0, genislik, yukseklik);
    return {
      png: tuval.toDataURL("image/png").split(",")[1],
      webp: tuval.toDataURL("image/webp", kalite).split(",")[1],
      yukseklik,
    };
  }, { veri: png.toString("base64"), genislik, kalite });
  return { png: Buffer.from(sonuc.png, "base64"), webp: Buffer.from(sonuc.webp, "base64"), yukseklik: sonuc.yukseklik };
}

async function main() {
  await mkdir(cikti, { recursive: true });
  const { adres, kapat } = await sunucuyuBaslat();
  const b = await tarayiciAc();
  const ozet = [];
  try {
    for (const ekran of EKRANLAR) {
      for (const koyu of [false, true]) {
        const ctx = await baglamAc(b, {
          viewport: ekran.gorunum,
          deviceScaleFactor: 2,
          isMobile: Boolean(ekran.mobil),
          hasTouch: Boolean(ekran.mobil),
          locale: "tr-TR",
          timezoneId: "Europe/Istanbul",
        });
        const sayfa = await ctx.newPage();
        const hatalar = [];
        sayfa.on("pageerror", (hata) => hatalar.push(hata.message));
        await sayfa.goto(`${adres}${ekran.yol}`, { waitUntil: "networkidle" });
        await bekle(sayfa);
        await temaAyarla(sayfa, koyu);
        await sayfa.reload({ waitUntil: "networkidle" });
        await bekle(sayfa);
        await sayfa.addStyleTag({ content: GIZLE + (ekran.mobil ? IPHONE_UST : "") });
        await sayfa.evaluate(() => window.scrollTo(0, 0));
        await sayfa.waitForTimeout(300);
        if (hatalar.length) throw new Error(`${ekran.ad}: ${hatalar.join("; ")}`);
        const ham = await sayfa.screenshot({ type: "png" });
        const { png, webp, yukseklik } = await kodla(sayfa, ham, ekran.genislik, ekran.kalite);
        const ad = `${ekran.ad}${koyu ? "-koyu" : ""}`;
        await writeFile(path.join(cikti, `${ad}.png`), png);
        await writeFile(path.join(cikti, `${ad}.webp`), webp);
        ozet.push(`${ad}: ${ekran.genislik}×${yukseklik}, webp ${Math.round(webp.length / 1024)} KB, png ${Math.round(png.length / 1024)} KB`);
        await ctx.close();
      }
    }
  } finally {
    await b.close();
    await kapat();
  }
  console.log(ozet.join("\n"));
}

main().catch((hata) => {
  console.error(hata);
  process.exit(1);
});
