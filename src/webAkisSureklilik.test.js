// Web akışı PR-2 (docs/web-akis-direktifi.md §3 PR-2): kurulum ↔ uygulama
// sürekliliği. B5/A3 tek plan tutarı, B6/B7 taslak ve adım adresi.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import {
  aySonuKalan,
  bosDurum,
  durumdanSonuc,
  onboardingSonucunuUygula,
  planOdemeleri,
  yasamVarsayilan,
} from "./onboardingAdimlari.js";
import { calculateRevolvingDebtScenario } from "./financialScenario.js";
import { getMonthlyBalancePresentation } from "./productActivation.js";
import {
  aylikPlanOdemesi,
  ilkAyKartKmhOdemesi,
  senaryoYasamButcesi,
  yasamButcesiKaydi,
  yasamButcesiTutari,
} from "./yasamButcesi.js";
import { adimYolu, gecmistenAdim, kurulumYoluMu, taslagiCoz, taslakAnahtari } from "./kurulumTaslagi.js";
import { webUygulamaYoluMu } from "./i18n.js";
import { izinBandiYeri } from "./kabukDurumu.js";
import { noindexYoluMu } from "./seoIndexing.js";

const oku = (yol) => readFile(new URL(yol, import.meta.url), "utf8");

// Kurulumu bitiren kullanıcının verisi ve uygulamanın aynı veriden kurduğu
// senaryo (App.jsx > Ozet / Plan ile aynı çağrı; kart kalemi borcKalemleri
// gibi bakiye + aylık faiz).
function kurulumdanUygulamaya({ gelir, borclar, simdi, faiz = 4.25, expenses }) {
  const durum = { ...bosDurum(), gelir: String(gelir), turler: [...new Set(borclar.map((b) => b.tur))], borclar };
  let n = 0;
  const veri = onboardingSonucunuUygula(
    { cards: [], loans: [], overdrafts: [], others: [], incomes: [], expenses: [], ayarlar: {} },
    durumdanSonuc(durum, { dil: "tr", ulke: "TR", paraBirimi: "TRY" }),
    { simdi, idUret: () => `id${n++}`, gelirAdi: "Maaş" },
  );
  if (expenses) veri.expenses = expenses;
  const yasamButcesi = senaryoYasamButcesi({ ayarlar: veri.ayarlar, expenses: veri.expenses });
  const senaryo = calculateRevolvingDebtScenario({
    income: veri.incomes.reduce((t, g) => t + g.tutar, 0),
    expenses: veri.expenses,
    cards: veri.cards,
    loans: veri.loans,
    debts: veri.cards.map((k) => ({ tur: "kart", bakiye: k.toplamEkstreBorcu, faiz })),
    currentDate: simdi,
    livingBudgetOverride: yasamButcesi,
  });
  return { durum, veri, yasamButcesi, senaryo };
}

test("B5: kurulum yaşam bütçesi varsayımını veriye yazar", () => {
  const { veri } = kurulumdanUygulamaya({
    gelir: 32000,
    borclar: [{ tur: "kart", banka: "Akbank", tutar: "6200", gun: "12" }],
    simdi: new Date(2026, 9, 28),
  });
  assert.deepEqual(veri.ayarlar.yasamButcesi, { tutar: yasamVarsayilan(32000), kaynak: "varsayim" });
  assert.equal(veri.ayarlar.yasamButcesi.tutar, 14400);
  // Gelir yoksa bütçe yazılmaz.
  const bos = onboardingSonucunuUygula({ ayarlar: {} }, durumdanSonuc(bosDurum()), { simdi: new Date(), idUret: () => "x", gelirAdi: "Maaş" });
  assert.equal(bos.ayarlar.yasamButcesi, undefined);
});

test("B5/A3: gelir 32.000, Akbank kart 6.200, gün 12 → kurulum = Bugün = Plan = Pro kartı", () => {
  for (const faiz of [0, 4.25]) {
    const simdi = new Date(2026, 9, 28);
    const { durum, senaryo, yasamButcesi } = kurulumdanUygulamaya({
      gelir: 32000,
      borclar: [{ tur: "kart", banka: "Akbank", tutar: "6200", gun: "12" }],
      simdi,
      faiz,
    });
    const kurulum = planOdemeleri({ gelir: 32000, borclar: durum.borclar });
    assert.equal(kurulum, 6200);
    assert.equal(yasamButcesi, 14400);
    assert.equal(senaryo.status, "ok");
    assert.equal(senaryo.livingBudget, 14400);
    // Bugün aylık plan + Plan ekranı (aylikPlanOdemesi) ve Pro kartı ilk ay.
    assert.equal(aylikPlanOdemesi(senaryo), kurulum);
    assert.equal(ilkAyKartKmhOdemesi(senaryo), kurulum);
    // Bugün "Aylık plan" kutusu: veri eksik değil, kurulumun ay sonu kalanı.
    const denge = getMonthlyBalancePresentation({
      income: 32000,
      mandatoryPayments: 0,
      expenses: 0,
      expenseCount: 0,
      livingBudget: yasamButcesi,
      planPayment: aylikPlanOdemesi(senaryo),
    });
    assert.equal(denge.tahmini, true);
    assert.equal(denge.tutar, aySonuKalan({ gelir: 32000, borclar: durum.borclar }));
    assert.equal(denge.tutar, 11400);
  }
});

test("B5/A3: gelir yetmezse ödeme kurulumdaki gibi gelirin yettiği kadar", () => {
  const { durum, senaryo } = kurulumdanUygulamaya({
    gelir: 20000,
    borclar: [{ tur: "kart", banka: "Akbank", tutar: "15000", gun: "12" }, { tur: "kart", banka: "QNB", tutar: "4000", gun: "20" }],
    simdi: new Date(2026, 9, 28),
  });
  const kurulum = planOdemeleri({ gelir: 20000, borclar: durum.borclar });
  assert.equal(kurulum, 11000);
  assert.equal(aylikPlanOdemesi(senaryo), kurulum);
  assert.equal(ilkAyKartKmhOdemesi(senaryo), kurulum);
});

test("B5/A3: bu ay taksidi düşen kredi kurulumla aynı toplanır", () => {
  const { durum, senaryo } = kurulumdanUygulamaya({
    gelir: 32000,
    borclar: [
      { tur: "kart", banka: "Akbank", tutar: "6200", gun: "12" },
      { tur: "kredi", banka: "Garanti", taksit: "3000", kalanTaksit: "10", gun: "25" },
    ],
    simdi: new Date(2026, 9, 5),
  });
  const kurulum = planOdemeleri({ gelir: 32000, borclar: durum.borclar });
  assert.equal(kurulum, 9200);
  assert.equal(aylikPlanOdemesi(senaryo), kurulum);
  // Pro kartı yalnız kart ve KMH'yi gösterir.
  assert.equal(ilkAyKartKmhOdemesi(senaryo), 6200);
});

test("B5: yaşam bütçesi ne zaman senaryoya geçer", () => {
  const varsayim = { yasamButcesi: { tutar: 14400, kaynak: "varsayim" } };
  const kullanici = { yasamButcesi: yasamButcesiKaydi("18000", "kullanici") };
  assert.equal(senaryoYasamButcesi({ ayarlar: varsayim, expenses: [] }), 14400);
  // Harcama kaydı gelince kurulum varsayımı yerine gerçek harcama tahmini.
  assert.equal(senaryoYasamButcesi({ ayarlar: varsayim, expenses: [{ tutar: 100 }] }), null);
  // Kullanıcının girdiği bütçe her zaman geçerli.
  assert.equal(senaryoYasamButcesi({ ayarlar: kullanici, expenses: [{ tutar: 100 }] }), 18000);
  assert.equal(senaryoYasamButcesi({ ayarlar: {}, expenses: [] }), null);
  assert.equal(yasamButcesiTutari({ yasamButcesi: { tutar: "abc" } }), null);
  assert.deepEqual(yasamButcesiKaydi(-5, "bilinmeyen"), { tutar: 0, kaynak: "kullanici" });
  // Bütçe yoksa eski davranış: harcama yokken "veri eksik".
  const eski = getMonthlyBalancePresentation({ income: 32000, mandatoryPayments: 0, expenses: 0, expenseCount: 0 });
  assert.equal(eski.tutar, null);
});

test("B5: Plan'da girilen bütçe senaryoyu ve aylık planı değiştirir", () => {
  const simdi = new Date(2026, 9, 28);
  const { veri } = kurulumdanUygulamaya({
    gelir: 32000,
    borclar: [{ tur: "kart", banka: "Akbank", tutar: "6200", gun: "12" }],
    simdi,
  });
  veri.ayarlar = { ...veri.ayarlar, yasamButcesi: yasamButcesiKaydi(28000, "kullanici") };
  const senaryo = calculateRevolvingDebtScenario({
    income: 32000,
    expenses: [],
    cards: veri.cards,
    loans: veri.loans,
    debts: [{ tur: "kart", bakiye: 6200, faiz: 0 }],
    currentDate: simdi,
    livingBudgetOverride: senaryoYasamButcesi({ ayarlar: veri.ayarlar, expenses: [] }),
  });
  assert.equal(senaryo.livingBudget, 28000);
  assert.equal(aylikPlanOdemesi(senaryo), 4000);
  assert.equal(aylikPlanOdemesi(senaryo), planOdemeleri({ gelir: 32000, borclar: [{ tur: "kart", tutar: "6200" }], yasam: 28000 }));
});

test("B6/B7: kurulum adresi ve taslak doğrulaması", () => {
  assert.equal(adimYolu("siklik", "?yeni=1"), "/kurulum/siklik?yeni=1");
  assert.equal(kurulumYoluMu("/kurulum/gelir"), true);
  assert.equal(kurulumYoluMu("/kurulum"), true);
  assert.equal(kurulumYoluMu("/kurulumlar"), false);
  assert.equal(kurulumYoluMu("/summary"), false);
  assert.equal(taslakAnahtari("u1"), "borcama:kurulum-taslak:u1");
  assert.equal(taslakAnahtari(null), "borcama:kurulum-taslak:misafir");
  const secenek = { diller: ["tr", "en"], birimler: ["TRY", "EUR"] };
  const durum = { ...bosDurum(), hedefler: ["aySonu"], gelir: "32000", siklik: "aylik" };
  const taslak = taslagiCoz(JSON.stringify({ adim: "siklik", durum, secilenDil: "en", ulke: "DE", birim: "EUR" }), secenek);
  assert.equal(taslak.adim, "siklik");
  assert.deepEqual(taslak.durum.hedefler, ["aySonu"]);
  assert.equal(taslak.durum.gelir, "32000");
  assert.equal(taslak.secilenDil, "en");
  assert.equal(taslak.ulke, "DE");
  assert.equal(taslak.birim, "EUR");
  // Geçersiz: bozuk JSON, bilinmeyen adım, web'de isim, kapanış, sırada olmayan borç adımı.
  assert.equal(taslagiCoz("{bozuk", secenek), null);
  assert.equal(taslagiCoz({ adim: "yok", durum }, secenek), null);
  assert.equal(taslagiCoz({ adim: "isim", durum }, secenek), null);
  assert.equal(taslagiCoz({ adim: "hazir", durum }, secenek), null);
  assert.equal(taslagiCoz({ adim: "borc", durum: { ...durum, borcYok: true } }, secenek), null);
  assert.equal(taslagiCoz({ adim: "dil" }, secenek), null);
  // Alan düzeyinde bozuk değerler varsayılana düşer.
  const bozuk = taslagiCoz({ adim: "hedef", durum: { hedefler: ["x"], maasGunu: 99, gelir: "<b>", borclar: [{ tur: "kart", banka: 5 }, { tur: "x" }] }, secilenDil: "zz", birim: "XXX" }, secenek);
  assert.deepEqual(bozuk.durum.hedefler, ["borc"]);
  assert.equal(bozuk.durum.maasGunu, 1);
  assert.equal(bozuk.durum.gelir, "");
  assert.deepEqual(bozuk.durum.borclar, [{ tur: "kart", banka: "5" }]);
  assert.equal(bozuk.secilenDil, null);
  assert.equal(bozuk.birim, null);
  // Geçmiş girdisi: koruma girdisi ve sırada olmayan adım null.
  const sira = ["dil", "gorunum", "ulke", "hedef"];
  assert.equal(gecmistenAdim({ kurulumAdim: "hedef" }, sira), "hedef");
  assert.equal(gecmistenAdim({ kurulumKoruma: true }, sira), null);
  assert.equal(gecmistenAdim({ kurulumAdim: "borc" }, sira), null);
  assert.equal(gecmistenAdim(null, sira), null);
});

test("B6/B7: /kurulum/<adim> uygulama yolu, çok dilli, izin bandı yok, indekslenmez", async () => {
  assert.equal(webUygulamaYoluMu("/kurulum/gelir"), true);
  assert.equal(izinBandiYeri({ yol: "/kurulum/gelir", kurulum: false, uygulama: false }), "yok");
  assert.equal(noindexYoluMu("/kurulum/gelir"), true);
  const vercel = JSON.parse(await oku("../vercel.json"));
  assert.ok(vercel.rewrites.some((r) => r.source === "/kurulum/:path*" && r.destination === "/index.html"));
  const main = await oku("./main.jsx");
  assert.match(main, /kurulumYoluMu\(yol\)/);
});

test("B8/B13: web bitişi yenilemesiz, iOS yeniden yükler; kurulum sonrası tek kart", async () => {
  const onboarding = await oku("./Onboarding.jsx");
  assert.match(onboarding, /if \(web && onBitti && dil\(\) === ACILIS_DILI\) \{\s*onBitti\(\);\s*return;/);
  assert.match(onboarding, /window\.location\.assign\("\/summary"\)/);
  const app = await oku("./App.jsx");
  assert.match(app, /onBitti=\{kurulumuBitir\}/);
  assert.match(app, /bt-aktivasyon bt-aktivasyon-devam/);
  // Kurulumdan sonraki kartta "Adım n/3" sayacı yok.
  const devam = app.slice(app.indexOf("if (kurulumSonrasi) {"), app.indexOf("const aktifAdim"));
  assert.doesNotMatch(devam, /aktivasyon\.sayac/);
});
