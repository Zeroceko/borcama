// Kurulum akisi v3 kontrast denetimi (direktif §9). 15 ekran x acik/koyu
// tema x mobil (390x844) ve masaustu (1280x800, 1024x768; web kabugu, Hazirsin
// bandi, Bugün ust cubugu, "+ Ekle" menusu, sag paneller, hesap menusu dahil
// — docs/web-akis-direktifi.md PR-3): gorunen her metin ve girdi
// (deger ya da yer tutucu, pasif dugmeler dahil) icin hesaplanan on plan /
// arka plan renginden WCAG orani. Normal metin >= 4.5, buyuk metin >= 3.
// background-clip: text ogeleri ve aria-hidden bayrak emojisi haric.
// Bulgu varsa cikis kodu 1. Sunucular: scripts/onboarding-ekranlari.mjs.
//
//   node scripts/kontrast-denetimi.mjs [--demo URL] [--auth URL] [--chrome YOL]
import { argumanlar, ekranlariGez, tarayiciAc } from "./onboarding-ekranlari.mjs";

const { demo, auth, chrome } = argumanlar();
const browser = await tarayiciAc(chrome);

// Sayfada calisir: bulgulari dondurur.
function sayfadaDenetle() {
  const parca = (metin) => {
    const m = String(metin).match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const [r, g, b, a = 1] = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    return { r, g, b, a };
  };
  const ust = (on, alt) => {
    const a = on.a + alt.a * (1 - on.a);
    if (!a) return { r: 0, g: 0, b: 0, a: 0 };
    const k = (x, y) => (x * on.a + y * alt.a * (1 - on.a)) / a;
    return { r: k(on.r, alt.r), g: k(on.g, alt.g), b: k(on.b, alt.b), a };
  };
  const parlaklik = ({ r, g, b }) => {
    const c = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * c(r) + 0.7152 * c(g) + 0.0722 * c(b);
  };
  const oran = (x, y) => { const [a, b] = [parlaklik(x), parlaklik(y)].sort((p, q) => q - p); return (a + 0.05) / (b + 0.05); };
  const opaklik = (el) => { let o = 1; for (let e = el; e && e.nodeType === 1; e = e.parentElement) o *= Number(getComputedStyle(e).opacity); return o; };
  // Arka plan: oge ve atalarinin dolgulari ustten alta birlesir; gradyanli
  // seffaf katmanlar atlanir (alt zemin kullanilir).
  const arka = (el) => {
    const katmanlar = [];
    for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
      const s = getComputedStyle(e);
      const renk = parca(s.backgroundColor);
      if (renk && renk.a > 0) {
        katmanlar.push({ ...renk, a: renk.a * Number(s.opacity) });
        if (renk.a >= 1 && Number(s.opacity) >= 1) break;
      }
    }
    let sonuc = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = katmanlar.length - 1; i >= 0; i -= 1) sonuc = ust(katmanlar[i], sonuc);
    return sonuc;
  };
  const gorunur = (el) => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none" && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
  };
  const bulgular = [];
  const denetle = (el, metin, renkMetni, s) => {
    if (s.webkitBackgroundClip === "text" || s.backgroundClip === "text") return;
    if (el.closest(".oa-bayrak, .oa-mini.bolunmus")) return;
    const on = parca(renkMetni);
    // Gorunmez ogeler (opacity 0; or. gun kaydiricisinin range girdisi) metin degil.
    if (!on || opaklik(el) < 0.05) return;
    const alt = arka(el);
    const gercek = ust({ ...on, a: on.a * opaklik(el) }, alt);
    const r = oran(gercek, alt);
    const boyut = parseFloat(s.fontSize);
    const buyuk = boyut >= 24 || (boyut >= 18.66 && Number(s.fontWeight) >= 700);
    const esik = buyuk ? 3 : 4.5;
    if (r < esik) {
      const ad = `${el.tagName.toLowerCase()}${el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).join(".") : ""}`;
      bulgular.push({ oge: ad, metin: metin.slice(0, 40), oran: Math.round(r * 100) / 100, esik });
    }
  };
  // Kurulum/kayıt yüzeyi (.oa, sağdaki Bugün önizlemesi dahil) ve büyük ekran
  // kabuğunun uygulamadaki yeni parçaları (üst çubuk, bant, menü, sağ panel).
  for (const el of document.querySelectorAll(".oa *, .bt-header *, .bt-hazir-bant *, .mk-menu *, .sag-panel *")) {
    if (!gorunur(el)) continue;
    const s = getComputedStyle(el);
    if (el.matches("input, textarea")) {
      if (el.value) denetle(el, el.value, s.color, s);
      else if (el.placeholder) denetle(el, el.placeholder, getComputedStyle(el, "::placeholder").color, s);
      continue;
    }
    const metin = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join("").trim();
    if (metin) denetle(el, metin, s.color, s);
  }
  return bulgular;
}

let toplam = 0;
for (const [genislik, yukseklik] of [[390, 844], [1280, 800], [1024, 768]]) {
  for (const tema of ["light", "dark"]) {
    await ekranlariGez(browser, {
      demo, auth, genislik, yukseklik, tema,
      her: async (ad, page) => {
        // Gecis ve giris animasyonlari bitmeden renkler ara degerde olur.
        await page.evaluate(() => Promise.all(document.getAnimations().filter((a) => a.effect?.getTiming?.().iterations !== Infinity).map((a) => a.finished.catch(() => {}))));
        const bulgular = await page.evaluate(sayfadaDenetle);
        toplam += bulgular.length;
        const etiket = `${genislik}x${yukseklik} ${tema.padEnd(5)} ${ad.padEnd(10)}`;
        if (!bulgular.length) console.log(`${etiket} 0 bulgu`);
        for (const b of bulgular) console.log(`${etiket} ${b.oran} < ${b.esik}  ${b.oge}  "${b.metin}"`);
      },
    });
  }
}
await browser.close();
console.log(toplam ? `\n${toplam} kontrast bulgusu.` : "\nKontrast denetimi: 0 bulgu.");
process.exit(toplam ? 1 : 0);
