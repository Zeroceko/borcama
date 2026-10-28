// Landing'de ardışık üst düzey bölümlerin (üst çubuk, hero, bölümler,
// kapanış, alt bilgi) görünür içerikleri arasındaki boşluğu ölçer
// (docs/web-v3-direktifi.md §3). Hedef: 1280'de 72 ± 2, 390'da 48 ± 2;
// üst çubuk → hero ayrı raporlanır. Hedef dışı aralık varsa çıkış kodu 1.
//
// Kullanım: node scripts/bolum-araliklari.mjs [--url http://127.0.0.1:5173]

import { baglamAc, siteyiAc, sunucuyuBaslat, tarayiciAc } from "./tarayiciAraci.mjs";

const GENISLIKLER = [
  { genislik: 1280, hedef: 72 },
  { genislik: 390, hedef: 48 },
];
const TOLERANS = 2;

const { adres, kapat } = await sunucuyuBaslat();
const b = await tarayiciAc();
let hata = 0;
try {
  for (const { genislik, hedef } of GENISLIKLER) {
    for (const koyu of [false, true]) {
      const ctx = await baglamAc(b, { viewport: { width: genislik, height: 900 } });
      const sayfa = await siteyiAc(ctx, `${adres}/`, { koyu });
      const araliklar = await sayfa.evaluate(() => {
        const bolumler = [...document.querySelectorAll(".site header.ust, .site main > section, .site footer.alt")];
        // Görünür kutu: overflow ile kırpan atalar (ör. .tel-kirp) hesaba katılır.
        const kutu = (el) => {
          const r = el.getBoundingClientRect();
          let [ust, alt] = [r.top, r.bottom];
          for (let e = el.parentElement; e; e = e.parentElement) {
            if (getComputedStyle(e).overflowY === "visible") continue;
            const k = e.getBoundingClientRect();
            ust = Math.max(ust, k.top);
            alt = Math.min(alt, k.bottom);
          }
          return [ust + scrollY, alt + scrollY];
        };
        const kendiMetniVar = (el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
        // Görünür içerik: metin taşıyan düğümler, yapraklar, zemini olan kutular ve görseller.
        const icerik = (bolum) => {
          let ust = Infinity;
          let alt = -Infinity;
          for (const el of bolum.querySelectorAll("*")) {
            const r = el.getBoundingClientRect();
            const cs = getComputedStyle(el);
            if (!r.height || !r.width || cs.visibility === "hidden") continue;
            if (el.children.length && !kendiMetniVar(el) && cs.backgroundColor === "rgba(0, 0, 0, 0)" && el.tagName !== "IMG") continue;
            const [t, a] = kutu(el);
            if (a <= t) continue;
            ust = Math.min(ust, t);
            alt = Math.max(alt, a);
          }
          return [Math.round(ust), Math.round(alt)];
        };
        const ad = (el) => (el.id || el.className || el.tagName).toString().split(" ").slice(-1)[0];
        const sonuc = [];
        let onceki = null;
        for (const bolum of bolumler) {
          const [ust, alt] = icerik(bolum);
          if (onceki) sonuc.push({ from: onceki.ad, to: ad(bolum), gap: ust - onceki.alt });
          onceki = { ad: ad(bolum), alt };
        }
        return sonuc;
      });
      const satirlar = araliklar.map((a, i) => {
        const ustCubuk = i === 0;
        const tamam = ustCubuk || Math.abs(a.gap - hedef) <= TOLERANS;
        if (!tamam) hata += 1;
        return `  ${tamam ? "ok " : "HATA"} ${a.from} → ${a.to}: ${a.gap}px${ustCubuk ? " (üst çubuk, hedef dışı)" : ""}`;
      });
      console.log(`${genislik}px ${koyu ? "koyu" : "açık"} (hedef ${hedef} ± ${TOLERANS})\n${satirlar.join("\n")}`);
      await ctx.close();
    }
  }
} finally {
  await b.close();
  await kapat();
}
if (hata) {
  console.error(`${hata} aralık hedef dışında.`);
  process.exit(1);
}
