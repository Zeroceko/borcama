// Kurulum akisi v3 ekranlarini (15 ekran) Playwright ile gezer; kontrast ve
// klavye denetimleri bunu kullanir. Iki dev sunucusu gerekir:
//   demo: Supabase ayarsiz (yerel demo; /summary?yeni=1 kurulum akisi),
//   auth: sahte Supabase anahtarli (VITE_SUPABASE_URL=https://demo.invalid
//         VITE_SUPABASE_ANON_KEY=demo); istekler burada taklit edilir.
// Ornek: npx vite --port 5179  ve
//        VITE_SUPABASE_URL=https://demo.invalid VITE_SUPABASE_ANON_KEY=demo npx vite --port 5182

export const EKRANLAR = ["karsilama", "kayit", "giris", "kod", "dil", "gorunum", "ulke", "hedef", "siklik", "gun", "gelir", "turler", "borc", "plan", "hazir"];
// Büyük ekran (≥1024, web) kabuğu: kayıt/giriş/kod web'de, kurulum sonrası
// uygulama ("Hazırsın" bandı, Bugün, "+ Ekle" menüsü, dört panel, hesap menüsü).
export const MASAUSTU_EKRANLARI = ["kayit-web", "giris-web", "kod-web", "bugun", "ekle-menu", "panel-harcama", "panel-odeme", "panel-ekstre", "panel-borc", "hesap-menu"];

export function argumanlar(argv = process.argv.slice(2)) {
  const deger = (ad, varsayilan) => {
    const i = argv.indexOf(`--${ad}`);
    return i >= 0 ? argv[i + 1] : varsayilan;
  };
  return {
    demo: deger("demo", "http://localhost:5179"),
    auth: deger("auth", "http://localhost:5182"),
    chrome: deger("chrome", process.env.CHROME || undefined),
  };
}

export async function tarayiciAc(chrome) {
  let playwright;
  try {
    playwright = await import("playwright-core");
  } catch {
    console.error("playwright-core yok: npm ci (devDependency) sonra tekrar dene.");
    process.exit(2);
  }
  return playwright.chromium.launch(chrome ? { executablePath: chrome } : {});
}

export async function sayfaAc(browser, { genislik, yukseklik, tema, native = false, dokunmatik = genislik < 760 }) {
  const ctx = await browser.newContext({
    viewport: { width: genislik, height: yukseklik },
    deviceScaleFactor: 1,
    isMobile: dokunmatik,
    hasTouch: dokunmatik,
    colorScheme: tema,
    locale: "tr-TR",
    timezoneId: "Europe/Istanbul",
  });
  if (native) await ctx.addInitScript(() => { window.CapacitorCustomPlatform = { name: "ios" }; });
  const page = await ctx.newPage();
  // Sahte Supabase ve /api: her istek 200 {} (kod gonderildi sayilir).
  await page.route(/demo\.invalid/, (r) => r.fulfill({ status: 200, contentType: "application/json", body: "{}" }));
  await page.route(/\/api\//, (r) => r.fulfill({ status: 200, contentType: "application/json", body: "{}" }));
  return { ctx, page };
}

// Web olcum izni cubugu tiklamalari ortmesin: reddedilir.
async function olcumuKapat(page) {
  const red = page.locator(".gac-reject");
  if (await red.count()) { await red.first().click(); await page.waitForTimeout(150); }
}

const devam = async (page) => {
  await page.locator(".oa-alt .oa-dugme").click();
  await page.waitForTimeout(450);
};

// Her ekranda `her(ad, page)` cagrilir. `yalniz` verilirse yalniz o ekranlar.
export async function ekranlariGez(browser, { demo, auth, genislik = 390, yukseklik = 844, tema = "light", her, yalniz = [...EKRANLAR, ...MASAUSTU_EKRANLARI] }) {
  const iste = (ad) => yalniz.includes(ad);
  const dokunmatik = genislik < 760;
  const cagir = async (ad, page) => { if (iste(ad)) { await olcumuKapat(page); await her(ad, page); } };

  // Hesap ekranlari (native kabuk taklidi: Apple dugmesi, referans kodu yok).
  if (["karsilama", "kayit", "giris", "kod"].some(iste)) {
    const { ctx, page } = await sayfaAc(browser, { genislik, yukseklik, tema, native: true });
    await page.goto(`${auth}/`);
    await page.waitForSelector(".oa-karsilama");
    await page.waitForTimeout(500);
    await cagir("karsilama", page);
    await page.goto(`${auth}/register`);
    await page.waitForSelector(".oa-auth");
    await page.locator("#auth-email").fill("ozer@eposta.com");
    await cagir("kayit", page);
    await page.goto(`${auth}/login`);
    await page.waitForSelector(".oa-auth");
    await page.locator("#auth-email").fill("ozer@eposta.com");
    await cagir("giris", page);
    await page.locator(".oa-alt .oa-dugme").click();
    await page.waitForSelector(".oa-kod-kutular");
    await page.keyboard.type("482");
    await page.waitForTimeout(400);
    await cagir("kod", page);
    await ctx.close();
  }

  // Büyük ekranda web kabuğu (üst çubuk + "ne olacak" paneli).
  if (genislik >= 1024 && ["kayit-web", "giris-web", "kod-web"].some(iste)) {
    const { ctx, page } = await sayfaAc(browser, { genislik, yukseklik, tema });
    await page.goto(`${auth}/register`);
    await page.waitForSelector(".oa-auth");
    await page.locator("#auth-email").fill("ozer@eposta.com");
    await cagir("kayit-web", page);
    await page.goto(`${auth}/login`);
    await page.waitForSelector(".oa-auth");
    await page.locator("#auth-email").fill("ozer@eposta.com");
    await cagir("giris-web", page);
    await page.locator(".oa-alt .oa-dugme").click();
    await page.waitForSelector(".oa-kod-kutular");
    await page.keyboard.type("482");
    await page.waitForTimeout(400);
    await cagir("kod-web", page);
    await ctx.close();
  }

  // Kurulum akisi (web, demo ?yeni=1).
  if (EKRANLAR.slice(4).some(iste)) {
    const { ctx, page } = await sayfaAc(browser, { genislik, yukseklik, tema });
    await page.goto(`${demo}/summary?yeni=1`);
    await page.waitForSelector(".oa-akis");
    await page.waitForTimeout(600);
    await olcumuKapat(page);
    await cagir("dil", page);
    await devam(page);
    await cagir("gorunum", page);
    await devam(page);
    await cagir("ulke", page);
    await devam(page);
    await page.locator(".oa-kart").nth(1).click();
    await cagir("hedef", page);
    await devam(page);
    await cagir("siklik", page);
    await devam(page);
    await page.locator(".oa-gun", { hasText: /^15$/ }).click();
    await page.waitForTimeout(400);
    await cagir("gun", page);
    await devam(page);
    if (dokunmatik) {
      for (const tus of ["3", "2", "000"]) await page.locator(".oa-tus", { hasText: new RegExp(`^${tus}$`) }).click();
    } else {
      await page.locator(".oa-tutar input").fill("32000");
    }
    await cagir("gelir", page);
    await devam(page);
    await page.locator(".oa-kart").nth(0).click();
    await page.locator(".oa-kart").nth(1).click();
    await cagir("turler", page);
    await devam(page);
    const alan = (i) => page.locator(".oa-alan input").nth(i);
    await page.locator(".oa-cip", { hasText: "Kredi" }).last().click();
    await alan(0).fill("QNB");
    await alan(1).fill("4150");
    await alan(2).fill("8");
    await alan(3).fill("5");
    await page.getByRole("button", { name: /başka borç ekle/i }).click();
    await page.locator(".oa-cip", { hasText: "Kredi kartı" }).click();
    await alan(0).fill("Akbank");
    await alan(1).fill("6200");
    await alan(2).fill("12");
    await page.waitForTimeout(300);
    await cagir("borc", page);
    await page.getByRole("button", { name: /bu kadar/i }).click();
    await page.waitForTimeout(450);
    await cagir("plan", page);
    await page.getByRole("button", { name: /planı aç/i }).click();
    // ≥1024 web: "Hazırsın" uygulamanın üstünde lime bant; dar ekranda perde.
    await page.waitForSelector(".oa-hazir, .bt-hazir-bant");
    await page.waitForTimeout(2200);
    await cagir("hazir", page);
    if (genislik >= 1024 && await page.locator(".bt-hazir-bant").count()) {
      await page.locator(".bt-hazir-bant-dugme").click();
      await page.waitForTimeout(500);
      await cagir("bugun", page);
      const ekle = () => page.getByRole("button", { name: /^\+?\s*Ekle$/ }).first();
      await ekle().click();
      await page.waitForTimeout(300);
      await cagir("ekle-menu", page);
      const adlar = ["panel-harcama", "panel-odeme", "panel-ekstre", "panel-borc"];
      for (let i = 0; i < adlar.length; i += 1) {
        if (i > 0) { await ekle().click(); await page.waitForTimeout(250); }
        await page.locator("[role=menu] [role=menuitem]").nth(i).click();
        await page.waitForSelector(".sag-panel");
        await page.waitForTimeout(450);
        await cagir(adlar[i], page);
        await page.keyboard.press("Escape");
        await page.waitForTimeout(350);
      }
      await page.locator(".bt-hesap-dugme").click();
      await page.waitForTimeout(300);
      await cagir("hesap-menu", page);
    }
    await ctx.close();
  }
}
