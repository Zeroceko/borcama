// Landing (site) metinlerinin WCAG kontrastını denetler (site yalnız açık tema)
// (docs/web-v3-direktifi.md §6). Her metin düğümü için hesaplanan ön/arka
// plan rengi (yarı saydam katmanlar harmanlanır), normal metin ≥ 4.5, büyük
// metin (≥ 24px ya da ≥ 18.66px kalın) ≥ 3. Pasif düğmeler dahil;
// background-clip: text ögeleri hariç. Bulgu varsa çıkış kodu 1.
//
// Kullanım: node scripts/site-kontrast-denetimi.mjs [--url http://127.0.0.1:5173]

import { baglamAc, siteyiAc, sunucuyuBaslat, tarayiciAc } from "./tarayiciAraci.mjs";

const GENISLIKLER = [1280, 390];

const { adres, kapat } = await sunucuyuBaslat();
const b = await tarayiciAc();
let toplam = 0;
try {
  for (const genislik of GENISLIKLER) {
    {
      const ctx = await baglamAc(b, { viewport: { width: genislik, height: 900 } });
      const sayfa = await siteyiAc(ctx, `${adres}/`);
      const bulgular = await sayfa.evaluate(() => {
        const ayristir = (c) => {
          const m = c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
          return m ? [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]] : null;
        };
        const parlaklik = ([r, g, bl]) => {
          const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
          return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(bl);
        };
        const oran = (a, c) => { const la = parlaklik(a); const lc = parlaklik(c); return (Math.max(la, lc) + 0.05) / (Math.min(la, lc) + 0.05); };
        const harmanla = (on, arka) => on[3] >= 1 ? on : [0, 1, 2].map((i) => on[i] * on[3] + arka[i] * (1 - on[3])).concat([1]);
        const sayfaZemini = ayristir(getComputedStyle(document.querySelector(".site")).backgroundColor);
        // Zemin rengi; gradyan zeminde (ör. mark'ın lime bandı) ilk opak durak.
        const zeminRengi = (cs) => {
          const c = ayristir(cs.backgroundColor);
          if (c && c[3] > 0) return c;
          for (const parca of cs.backgroundImage.match(/rgba?\([^)]*\)/g) || []) {
            const d = ayristir(parca);
            if (d && d[3] >= 1) return d;
          }
          return c;
        };
        const zemin = (el) => {
          const zincir = [];
          for (let e = el; e; e = e.parentElement) {
            const c = zeminRengi(getComputedStyle(e));
            if (c && c[3] > 0) zincir.push(c);
            if (c && c[3] >= 1) break;
          }
          zincir.reverse();
          let birikim = sayfaZemini;
          for (const c of zincir) birikim = harmanla(c, birikim);
          return birikim;
        };
        const sonuc = [];
        for (const el of document.querySelectorAll(".site *")) {
          const metin = [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim()).map((n) => n.textContent.trim()).join(" ");
          if (!metin) continue;
          const cs = getComputedStyle(el);
          if (cs.visibility === "hidden" || cs.display === "none" || cs.backgroundClip === "text") continue;
          const r = el.getBoundingClientRect();
          if (!r.width || !r.height) continue;
          const arka = zemin(el);
          const opaklik = parseFloat(cs.opacity) || 1;
          const renk = ayristir(cs.color);
          const on = harmanla([renk[0], renk[1], renk[2], renk[3] * opaklik], arka);
          const deger = oran(on, arka);
          const boyut = parseFloat(cs.fontSize);
          const kalin = parseInt(cs.fontWeight, 10) >= 700 || /Archivo/.test(cs.fontFamily);
          const gerek = boyut >= 24 || (boyut >= 18.66 && kalin) ? 3 : 4.5;
          if (deger < gerek) sonuc.push({ metin: metin.slice(0, 40), oran: +deger.toFixed(2), gerek, sinif: String(el.className || el.tagName) });
        }
        return sonuc;
      });
      toplam += bulgular.length;
      console.log(`${genislik}px açık: ${bulgular.length} bulgu`);
      for (const bulgu of bulgular) console.log(`  ${bulgu.oran} < ${bulgu.gerek} · ${bulgu.sinif} · "${bulgu.metin}"`);
      await ctx.close();
    }
  }
} finally {
  await b.close();
  await kapat();
}
if (toplam) process.exit(1);
