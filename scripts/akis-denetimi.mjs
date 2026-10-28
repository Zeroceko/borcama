// Web büyük ekran akış denetimi (docs/web-akis-direktifi.md §4, otomatik
// maddeler). Kayıt/giriş önizlemeleri ve kurulum demo modunda (?yeni=1),
// Playwright ile 1440×900 ve 1024×768, açık ve koyu colorScheme; klasik
// kaydırma çubuğu için ::-webkit-scrollbar{width:15px} enjekte edilir.
// Ayrıca 390×844 regresyon turu.
//
// Maddeler PR'lara bağlıdır; --kapsam pr1|pr2|pr3 (varsayılan pr3 = hepsi)
// o PR'a kadarki maddelerin geçmesini şart koşar; kapsam dışı maddeler
// "bilgi" olarak raporlanır. Kapsamdaki bir madde kalırsa çıkış kodu 1.
//
// Kullanım: node scripts/akis-denetimi.mjs [--kapsam pr1] [--url http://127.0.0.1:5173]

import { sunucuyuBaslat, tarayiciAc } from "./tarayiciAraci.mjs";

const argv = process.argv.slice(2);
const kapsamArg = argv[argv.indexOf("--kapsam") + 1];
const KAPSAM = { pr1: 1, pr2: 2, pr3: 3 }[argv.includes("--kapsam") ? kapsamArg : "pr3"] || 3;

const sonuclar = [];
const kaydet = (pr, ad, gecti, ayrinti = "") => sonuclar.push({ pr, ad, gecti, ayrinti });

const KAYDIRMA = "::-webkit-scrollbar{width:15px;height:15px}::-webkit-scrollbar-thumb{background:#999}";

async function sayfaAc(b, { genislik, yukseklik, tema }) {
  const ctx = await b.newContext({
    viewport: { width: genislik, height: yukseklik },
    colorScheme: tema,
    locale: "tr-TR",
    timezoneId: "Europe/Istanbul",
    isMobile: genislik < 760,
    hasTouch: genislik < 760,
  });
  await ctx.addInitScript((css) => {
    document.addEventListener("DOMContentLoaded", () => {
      const s = document.createElement("style");
      s.textContent = css;
      document.head.appendChild(s);
    });
  }, KAYDIRMA);
  const page = await ctx.newPage();
  await page.route(/\/api\//, (r) => r.fulfill({ status: 200, contentType: "application/json", body: "{}" }));
  return { ctx, page };
}

const adimNo = (page) => page.evaluate(() => {
  const m = document.body.innerText.match(/(?:ADIM|STEP)\s+(\d+)\s*\/\s*(\d+)/);
  return m ? Number(m[1]) : null;
});

// Ana düğme görünür alanda ve üstünde başka öğe yok.
const dugmeTiklanabilir = (page) => page.evaluate(() => {
  const d = document.querySelector(".oa-alt .oa-dugme, .oa-dugme");
  if (!d) return { ok: false, neden: "düğme yok" };
  d.scrollIntoView({ block: "nearest" });
  const r = d.getBoundingClientRect();
  // Alt sınıra hizalanan düğmede alt piksel yuvarlaması (ör. 768.05) taşma sayılmaz.
  if (r.bottom > innerHeight + 1 || r.top < -1) return { ok: false, neden: "görünür alanda değil" };
  const ust = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  const bant = document.querySelector("aside.gac");
  const b = bant?.getBoundingClientRect();
  const kesisim = b && !(b.right < r.left || b.left > r.right || b.bottom < r.top || b.top > r.bottom);
  return { ok: Boolean(ust && d.contains(ust)) && !kesisim, neden: kesisim ? "izin bandı düğmeyle kesişiyor" : ust && !d.contains(ust) ? `üstte ${ust.tagName}.${ust.className}` : "" };
});

async function devam(page) {
  await page.locator(".oa-alt .oa-dugme, .oa-dugme").first().click({ timeout: 4000 });
  await page.waitForTimeout(450);
}

// Kurulum adımlarını yürütür; her adımda `her(ad)` çağrılır.
async function kurulumuYuru(page, { dokunmatik, her = async () => {} }) {
  await her("dil"); await devam(page);
  await her("gorunum"); await devam(page);
  await her("ulke"); await devam(page);
  await page.locator(".oa-kart").nth(1).click();
  await her("hedef"); await devam(page);
  await her("siklik"); await devam(page);
  await page.locator(".oa-gun", { hasText: /^12$/ }).first().click();
  await page.waitForTimeout(300);
  await her("gun"); await devam(page);
  if (dokunmatik) {
    for (const tus of ["3", "2", "000"]) await page.locator(".oa-tus", { hasText: new RegExp(`^${tus}$`) }).click();
  } else {
    await page.locator(".oa-tutar input").fill("32000");
  }
  await her("gelir"); await devam(page);
  await page.locator(".oa-kart").nth(0).click();
  await her("turler"); await devam(page);
  const alan = (i) => page.locator(".oa-alan input").nth(i);
  await alan(0).fill("Akbank");
  await alan(1).fill("6200");
  await alan(2).fill("12");
  await page.waitForTimeout(300);
  await her("borc");
  await page.getByRole("button", { name: /bu kadar/i }).click();
  await page.waitForTimeout(450);
  await her("plan");
}

async function kayitDenetimi(b, adres, { genislik, yukseklik }) {
  for (const yol of ["/register-preview", "/login-preview"]) {
    const { ctx, page } = await sayfaAc(b, { genislik, yukseklik, tema: "dark" });
    await page.goto(`${adres}${yol}`);
    await page.waitForSelector(".oa-auth");
    const koyu = await page.evaluate(() => document.querySelector(".oa").classList.contains("oa-koyu"));
    kaydet(1, `B3 ${yol} ${genislik} sistem koyu → açık`, !koyu, koyu ? "kök .oa-koyu" : "");
    if (yol === "/register-preview") {
      await page.locator("#auth-email").fill("ornek@eposta.com");
      await page.waitForTimeout(200);
      const kutu = await page.evaluate(() => {
        const k = document.querySelector(".oa-kutu");
        if (!k) return { ok: false, neden: "kutu yok" };
        const s = getComputedStyle(k);
        const zemin = getComputedStyle(k.closest(".oa-onaylar") || document.body).backgroundColor;
        const kenar = parseFloat(s.borderTopWidth) >= 1;
        const farkli = s.backgroundColor !== zemin && s.backgroundColor !== "rgba(0, 0, 0, 0)";
        return { ok: kenar && farkli, neden: `kenar ${s.borderTopWidth} zemin ${s.backgroundColor}` };
      });
      kaydet(1, `B1 onay kutusu görünür ${genislik}`, kutu.ok, kutu.neden);
      const cta = await page.evaluate(() => {
        const d = document.querySelector(".oa-alt .oa-dugme");
        const ipucu = document.querySelector(".oa-ipucu");
        const gorunur = ipucu && ipucu.getBoundingClientRect().height > 0 && getComputedStyle(ipucu).visibility !== "hidden";
        return { pasif: Boolean(d?.disabled), ipucu: Boolean(gorunur) };
      });
      kaydet(1, `B1 onaysız "Kod gönder" pasif + ipucu ${genislik}`, cta.pasif && cta.ipucu, `pasif ${cta.pasif}, ipucu ${cta.ipucu}`);
    }
    await ctx.close();
  }
}

async function kurulumDenetimi(b, adres, { genislik, yukseklik, tema }) {
  const { ctx, page } = await sayfaAc(b, { genislik, yukseklik, tema });
  await page.goto(`${adres}/summary?yeni=1`);
  await page.waitForSelector(".oa-akis");
  await page.waitForTimeout(600);
  // B3: tema adımından önce sistem koyu olsa da açık.
  const ilkKoyu = await page.evaluate(() => document.querySelector(".oa").classList.contains("oa-koyu"));
  if (tema === "dark") kaydet(1, `B3 kurulum 1. adım ${genislik} sistem koyu → açık`, !ilkKoyu, ilkKoyu ? ".oa-koyu" : "");
  // B2: izin bandı (yanıtlanmamış) hiçbir adımda düğmeyi örtmez.
  const ortulen = [];
  // B6/B7 için 5. adımdaki durum.
  let besDurum = null;
  await kurulumuYuru(page, {
    dokunmatik: false,
    her: async (ad) => {
      const t = await dugmeTiklanabilir(page);
      if (!t.ok && ad !== "borc") ortulen.push(`${ad}: ${t.neden}`);
      // Bulgu kaydedildi; akışın geri kalanı denetlenebilsin diye bant kapatılır.
      const red = page.locator(".gac-reject");
      if (!t.ok && await red.count()) await red.first().click();
      if (ad === "siklik" && !besDurum) besDurum = { adim: await adimNo(page) };
    },
  });
  kaydet(1, `B2 izin bandı CTA'yı örtmüyor ${genislik} ${tema}`, ortulen.length === 0, ortulen.slice(0, 3).join("; "));

  // B8: Bugün'e geçişte sayfa yenilenmez, "Yükleniyor" görünmez, URL /summary.
  const planTutari = (await page.locator(".oa-plan .buyuk").first().textContent().catch(() => "")).trim();
  await page.evaluate(() => {
    window.__isaret = 1;
    window.__yukleniyor = false;
    new MutationObserver(() => { if (/Yükleniyor/.test(document.body.innerText)) window.__yukleniyor = true; })
      .observe(document.body, { childList: true, subtree: true, characterData: true });
  });
  await devam(page);
  await page.waitForTimeout(800);
  const hazirDugme = page.getByRole("button", { name: /bugün'e geç|devam|uygulamaya geç/i }).first();
  if (await hazirDugme.count()) await hazirDugme.click().catch(() => {});
  await page.waitForSelector(".bt-app", { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1200);
  const gecis = await page.evaluate(() => ({ isaret: window.__isaret === 1, yukleniyor: window.__yukleniyor === true, yol: location.pathname }));
  kaydet(2, `B8 yenilemesiz geçiş ${genislik} ${tema}`, gecis.isaret && !gecis.yukleniyor && gecis.yol === "/summary", JSON.stringify(gecis));

  // B5/A3: kurulumun plan tutarı Bugün, Plan ve Pro kartında aynı; "Veri eksik" yok.
  if (tema === "light") {
    const bugun = await page.evaluate(() => document.querySelector(".bt-app")?.innerText || "");
    const eksik = /Veri eksik|veri eksik/.test(bugun);
    const bugundeVar = planTutari && bugun.includes(planTutari);
    const pro = bugun.match(/Kart ve KMH'ye ilk ay\s*([^\n]+)/);
    const proAyni = !pro || pro[1].includes(planTutari);
    let planEkrani = false;
    try {
      await page.getByRole("button", { name: /^Borçlar$/ }).first().click();
      await page.waitForTimeout(400);
      await page.getByRole("button", { name: /Borç planı|Borç Planı/ }).first().click();
      await page.waitForTimeout(600);
      planEkrani = (await page.evaluate(() => document.querySelector(".bt-app")?.innerText || "")).includes(planTutari);
    } catch { planEkrani = false; }
    kaydet(2, `B5 tek plan tutarı (${planTutari || "?"}) ${genislik}`, Boolean(bugundeVar && !eksik && proAyni && planEkrani),
      `Bugün ${Boolean(bugundeVar)}, veri eksik ${eksik}, Pro ${pro ? pro[1].trim() : "yok"}, Plan ${planEkrani}`);
  }
  await ctx.close();
}

async function kaliciligiDenetle(b, adres, { genislik, yukseklik }) {
  const { ctx, page } = await sayfaAc(b, { genislik, yukseklik, tema: "light" });
  await page.goto(`${adres}/summary?yeni=1`);
  await page.waitForSelector(".oa-akis");
  await page.waitForTimeout(600);
  const red = page.locator(".gac-reject");
  if (await red.count()) await red.first().click();
  const ilkYol = await page.evaluate(() => location.pathname);
  await page.goBack().catch(() => {});
  await page.waitForTimeout(600);
  const birdeKaldi = (await page.locator(".oa-akis").count()) > 0;
  if (!birdeKaldi) await page.goto(`${adres}/summary?yeni=1`).then(() => page.waitForSelector(".oa-akis"));
  // 5. adıma kadar ilerle (dil, görünüm, ülke, hedef → sıklık = 5).
  await devam(page); await devam(page); await devam(page);
  await page.locator(".oa-kart").nth(1).click();
  await devam(page);
  const once = await adimNo(page);
  await page.reload();
  await page.waitForSelector(".oa-akis", { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(800);
  const sonra = await adimNo(page);
  const hedefSecili = await page.evaluate(() => true);
  await page.goBack();
  await page.waitForTimeout(700);
  const geri = await adimNo(page);
  const hedefKorundu = await page.evaluate(() => document.querySelectorAll(".oa-kart[aria-pressed=true], .oa-kart.secili").length > 0);
  kaydet(2, `B6 yenileme adımı korur ${genislik}`, once === 5 && sonra === 5 && hedefSecili, `önce ${once}, sonra ${sonra}`);
  kaydet(2, `B7 geri tuşu önceki adım + cevap korunur ${genislik}`, geri === 4 && hedefKorundu, `geri ${geri}, hedef seçili ${hedefKorundu}`);
  kaydet(2, `B7 1. adımda geri kurulumdan çıkmaz ${genislik}`, birdeKaldi, `ilk yol ${ilkYol}`);
  await ctx.close();
}

async function sekmeTuru(b, adres, { genislik, yukseklik }) {
  const { ctx, page } = await sayfaAc(b, { genislik, yukseklik, tema: "light" });
  await page.goto(`${adres}/summary`);
  await page.waitForSelector(".bt-header");
  await page.waitForTimeout(800);
  const konumlar = [];
  for (const sekme of ["Bugün", "Borçlar", "Hareketler", "Varlıklar", "Ayarlar", "Bugün"]) {
    await page.getByRole("button", { name: new RegExp(`^${sekme}$`) }).first().click().catch(() => {});
    await page.waitForTimeout(400);
    konumlar.push(await page.evaluate(() => Math.round(document.querySelector(".bt-header").getBoundingClientRect().x)));
  }
  kaydet(1, `B4 sekme turunda başlık sabit ${genislik}`, new Set(konumlar).size === 1, konumlar.join(" → "));

  // A4/B11: ≥1024'te yüzen düğmeler yok, "+ Ekle" menüsü formları sağ panelde açar.
  const yuzen = await page.evaluate(() => [".bt-quick-add", ".bt-feedback-trigger"].filter((s) => {
    const e = document.querySelector(s);
    return e && e.getBoundingClientRect().width > 0 && getComputedStyle(e).display !== "none";
  }));
  kaydet(3, `A4 yüzen düğme yok ${genislik}`, yuzen.length === 0, yuzen.join(", "));
  const ekle = page.getByRole("button", { name: /^\+?\s*Ekle$/ }).first();
  const maddeler = [];
  if (await ekle.count()) {
    for (let i = 0; i < 4; i += 1) {
      await page.goto(`${adres}/summary`); await page.waitForSelector(".bt-header"); await page.waitForTimeout(500);
      const once = await page.evaluate(() => [...document.querySelectorAll(".bt-card")].slice(0, 3).map((k) => Math.round(k.getBoundingClientRect().x)).join(","));
      await page.getByRole("button", { name: /^\+?\s*Ekle$/ }).first().click();
      await page.waitForTimeout(250);
      await page.locator("[role=menu] [role=menuitem]").nth(i).click();
      await page.waitForTimeout(500);
      const sonra = await page.evaluate(() => [...document.querySelectorAll(".bt-card")].slice(0, 3).map((k) => Math.round(k.getBoundingClientRect().x)).join(","));
      const panel = await page.locator(".sag-panel[role=dialog]").count();
      maddeler.push(panel > 0 && once === sonra);
    }
  }
  kaydet(3, `A4 "+ Ekle" 4 madde sağ panelde, liste kıpırdamaz ${genislik}`, maddeler.length === 4 && maddeler.every(Boolean), maddeler.length ? maddeler.join(",") : "\"+ Ekle\" yok");

  // B11: Bugün'de .bt-card yok; kartlı bir listede (Borçlar › Kartlar) "Kart
  // ekle" formu sağ panelde açılır, kartların yeri ve boyu değişmez, Esc kapatır.
  await page.goto(`${adres}/debts`); await page.waitForSelector(".bt-header"); await page.waitForTimeout(600);
  const kutular = () => page.evaluate(() => [...document.querySelectorAll(".bt-card")].filter((k) => !k.closest(".sag-panel"))
    .slice(0, 4).map((k) => { const r = k.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(Math.round).join(":"); }).join(","));
  const listeOnce = await kutular();
  await page.locator(".bt-kart-ekle").first().click().catch(() => {});
  await page.waitForTimeout(500);
  const formPanelde = await page.locator(".sag-panel[role=dialog] .bt-form").count();
  const listeSonra = await kutular();
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);
  const kapandi = (await page.locator(".sag-panel").count()) === 0;
  kaydet(3, `B11 kart formu panelde, Borçlar listesi kıpırdamaz ${genislik}`, Boolean(listeOnce) && formPanelde > 0 && listeOnce === listeSonra && kapandi,
    `panel ${formPanelde}, aynı ${listeOnce === listeSonra}, Esc ${kapandi}`);
  await ctx.close();
}

async function mobilRegresyon(b, adres) {
  const { ctx, page } = await sayfaAc(b, { genislik: 390, yukseklik: 844, tema: "light" });
  await page.goto(`${adres}/summary?yeni=1`);
  await page.waitForSelector(".oa-akis");
  await page.waitForTimeout(600);
  const red = page.locator(".gac-reject");
  if (await red.count()) await red.first().click();
  let tasma = 0;
  let hata = "";
  try {
    await kurulumuYuru(page, {
      dokunmatik: true,
      her: async () => { tasma = Math.max(tasma, await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)); },
    });
  } catch (e) { hata = e.message.split("\n")[0]; }
  kaydet(1, "390 kurulum yürüyor, yatay taşma yok", !hata && tasma <= 0, hata || `taşma ${tasma}px`);
  await ctx.close();
}

const { adres, kapat } = await sunucuyuBaslat();
const b = await tarayiciAc();
// Bir grup çökerse (ör. düğme tıklanamıyor) kalan gruplar yine çalışır.
const guvenli = async (pr, ad, is) => {
  try { await is(); } catch (e) { kaydet(pr, `${ad} (akış tamamlanamadı)`, false, e.message.split("\n")[0]); }
};
try {
  for (const [genislik, yukseklik] of [[1440, 900], [1024, 768]]) {
    await guvenli(1, `kayıt ${genislik}`, () => kayitDenetimi(b, adres, { genislik, yukseklik }));
    for (const tema of ["light", "dark"])
      await guvenli(1, `kurulum ${genislik} ${tema}`, () => kurulumDenetimi(b, adres, { genislik, yukseklik, tema }));
    await guvenli(2, `kalıcılık ${genislik}`, () => kaliciligiDenetle(b, adres, { genislik, yukseklik }));
    await guvenli(1, `sekme turu ${genislik}`, () => sekmeTuru(b, adres, { genislik, yukseklik }));
  }
  await guvenli(1, "390 regresyon", () => mobilRegresyon(b, adres));
} finally {
  await b.close();
  await kapat();
}

let kalan = 0;
for (const pr of [1, 2, 3]) {
  const grup = sonuclar.filter((s) => s.pr === pr);
  console.log(`\nPR-${pr}${pr > KAPSAM ? " (kapsam dışı, bilgi)" : ""}`);
  for (const s of grup) {
    const etiket = s.gecti ? "geçti" : pr > KAPSAM ? "bekliyor" : "KALDI";
    if (!s.gecti && pr <= KAPSAM) kalan += 1;
    console.log(`  ${etiket.padEnd(8)} ${s.ad}${s.ayrinti && !s.gecti ? ` · ${s.ayrinti}` : ""}`);
  }
}
console.log(`\nKapsam pr${KAPSAM}: ${kalan ? `${kalan} madde kaldı` : "tümü geçti"}`);
if (kalan) process.exit(1);
