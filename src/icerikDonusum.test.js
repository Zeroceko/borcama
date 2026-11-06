import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";
import {
  BIRIKIM_KAYIT_ADRESI,
  BORC_KAYIT_ADRESI,
  HESAPLI_EK_TERIMLER,
  HESAPLI_REHBERLER,
  ICERIK_YERLERI,
  YAPISKAN_KAPALI_ANAHTARI,
  birikimKutusu,
  miniBorcHesabi,
  olcumYeri,
  rehberHesabiGosterilsinMi,
  sozlukHesabiGosterilsinMi,
  sureMetni,
  yapiskanCubukGorunsunMu,
  yapiskanKapatildiMi,
  yapiskaniKapat,
  yerlesimliKaynak,
} from "./icerikDonusum.js";
import { FINANSAL_SOZLUK, finansalSozlukTerimi } from "./financialGlossary.js";
import { KART_ORTA_KADEME_AZAMI_AKDI_FAIZ, REHBERLER, rehberBul } from "./seoRehberler.js";
import { borcKapatmaHesapla } from "./seoTools.js";

const oku = (yol) => readFile(new URL(yol, import.meta.url), "utf8");

describe("içerik yerleşimi ölçümü", () => {
  it("yalnız bilinen yerleşim adlarını kabul eder; tutar ve serbest metin geçmez", () => {
    assert.equal(olcumYeri("sozluk_hesap"), "sozluk_hesap");
    assert.equal(olcumYeri("50000"), "");
    assert.equal(olcumYeri("sozluk_hesap_50000"), "");
    assert.equal(olcumYeri(undefined), "");
  });

  it("yerleşim adları tekil ve content alanına sığar", () => {
    const adlar = Object.values(ICERIK_YERLERI);
    assert.equal(new Set(adlar).size, adlar.length);
    for (const ad of adlar) assert.match(ad, /^[a-z_]{1,40}$/);
  });

  it("yerleşim yalnız content alanını değiştirir, kaynağı bozmaz", () => {
    const kaynak = { source: "google", medium: "organic", campaign: "", content: "ana_cta", term: "", click_id: "", plan: "" };
    assert.deepEqual(yerlesimliKaynak(kaynak, "rehber_hesap"), { ...kaynak, content: "rehber_hesap" });
    assert.deepEqual(yerlesimliKaynak(kaynak, "bilinmeyen"), kaynak);
    assert.equal(kaynak.content, "ana_cta");
  });

  it("kayıt bağlantıları sabittir ve tutar taşımaz", () => {
    assert.equal(BORC_KAYIT_ADRESI, "/register?plan=free&redirect=%2Fdebts");
    assert.equal(BIRIKIM_KAYIT_ADRESI, "/register?plan=free&redirect=%2Fassets");
  });
});

describe("hesabın göründüğü sayfalar", () => {
  it("borçla ilgili sözlük terimlerinde görünür, birikim ve bütçe terimlerinde görünmez", () => {
    for (const slug of ["asgari-odeme", "kredi-karti-borcu", "ek-hesap-kmh", "kmh-borcu", "faiz", "gecikme-faizi", "akdi-faiz", "borc-yapilandirma", "kart-yapilandirma", "borc-kapatma-plani", "icra-takibi", "kalan-anapara"])
      assert.ok(sozlukHesabiGosterilsinMi(finansalSozlukTerimi(slug)), slug);
    for (const slug of ["alacak", "tasfiye", "bank-run", "mevduat-faizi", "stopaj", "butce", "enflasyon", "politika-faizi", "kur-makasi"])
      assert.equal(sozlukHesabiGosterilsinMi(finansalSozlukTerimi(slug)), false, slug);
    assert.equal(sozlukHesabiGosterilsinMi(null), false);
  });

  it("ek terim listesindeki her terim sözlükte var", () => {
    for (const slug of HESAPLI_EK_TERIMLER) assert.ok(finansalSozlukTerimi(slug), slug);
    const sayi = FINANSAL_SOZLUK.filter(sozlukHesabiGosterilsinMi).length;
    assert.ok(sayi >= 80 && sayi < FINANSAL_SOZLUK.length, `hesaplı terim sayısı ${sayi}`);
  });

  it("üç kart borcu rehberinde ve eski borç rehberlerinde görünür, mevduat ve maaş rehberlerinde görünmez", () => {
    for (const slug of HESAPLI_REHBERLER) assert.ok(rehberBul(slug), slug);
    for (const slug of ["kredi-karti-faiz-oranlari-2026", "kredi-karti-borcu-yapilandirma", "kredi-karti-borcu-odenmezse-ne-olur", "borc-kapatma-plani-nasil-hazirlanir"])
      assert.ok(rehberHesabiGosterilsinMi(rehberBul(slug)), slug);
    const hesapsiz = REHBERLER.filter((rehber) => !rehberHesabiGosterilsinMi(rehber)).map((rehber) => rehber.slug);
    assert.ok(hesapsiz.length > 0);
    for (const slug of hesapsiz) assert.match(slug, /mevduat|maas|kidem/);
  });

  it("birikim kutusu yalnız fon niyetli tasfiye ve bank run sayfalarında, ayrı yerleşim adıyla", () => {
    assert.equal(birikimKutusu("tasfiye").yer, ICERIK_YERLERI.TASFIYE_BIRIKIM);
    assert.equal(birikimKutusu("bank-run").yer, ICERIK_YERLERI.BANK_RUN_BIRIKIM);
    assert.equal(birikimKutusu("faiz"), null);
  });
});

describe("Borcum ne zaman biter? mini hesabı", () => {
  it("örnek faiz, faiz rehberindeki TCMB orta kademe oranıyla aynı", () => {
    const faizRehberi = rehberBul("kredi-karti-faiz-oranlari-2026");
    const metin = faizRehberi.sections.map(([, govde]) => govde).join(" ");
    const oran = KART_ORTA_KADEME_AZAMI_AKDI_FAIZ.oran.replace(".", ",");
    assert.match(metin, new RegExp(`30\\.000 ile 180\\.000 TL arasındaysa akdi faiz yüzde ${oran}`));
    assert.match(faizRehberi.title, new RegExp(KART_ORTA_KADEME_AZAMI_AKDI_FAIZ.donem));
  });

  it("boş alanlarda sonuç göstermez", () => {
    assert.equal(miniBorcHesabi({ borc: "", aylikFaiz: "3.75", aylikOdeme: "" }).durum, "bos");
  });

  it("araç sayfasıyla aynı formülle süre ve toplam faizi verir", () => {
    const girdi = { borc: "100000", aylikFaiz: "3.75", aylikOdeme: "12000" };
    const arac = borcKapatmaHesapla(girdi);
    const mini = miniBorcHesabi(girdi);
    assert.equal(mini.durum, "tamam");
    assert.equal(mini.ay, arac.ay);
    assert.equal(mini.toplamFaiz, arac.toplamFaiz);
    assert.equal(mini.sure, sureMetni(arac.ay));
  });

  it("faizi karşılamayan ödemede ve 50 yılı aşan planda uyarı durumuna geçer", () => {
    assert.equal(miniBorcHesabi({ borc: "100000", aylikFaiz: "3.75", aylikOdeme: "3000" }).durum, "yetersiz-odeme");
    assert.equal(miniBorcHesabi({ borc: "100000", aylikFaiz: "0.1", aylikOdeme: "100.01" }).durum, "cok-uzun");
  });

  it("süreyi ay ve yıl olarak yazar", () => {
    assert.equal(sureMetni(9), "9 ay");
    assert.equal(sureMetni(12), "12 ay (1 yıl)");
    assert.equal(sureMetni(26), "26 ay (2 yıl 2 ay)");
  });
});

describe("mobil yapışkan kayıt çubuğu", () => {
  const sayfa = { scrollY: 1200, innerHeight: 800, scrollHeight: 3800, mobil: true };

  it("mobilde kaydırılabilir mesafenin %40'ı geçilince görünür", () => {
    assert.equal(yapiskanCubukGorunsunMu({ ...sayfa, scrollY: 1100 }), false);
    assert.equal(yapiskanCubukGorunsunMu(sayfa), true);
  });

  it("masaüstünde, kapatıldıysa, izin bandı açıkken, sayfa sonu köprüsü veya klavye açıkken görünmez", () => {
    assert.equal(yapiskanCubukGorunsunMu({ ...sayfa, mobil: false }), false);
    assert.equal(yapiskanCubukGorunsunMu({ ...sayfa, kapatildi: true }), false);
    assert.equal(yapiskanCubukGorunsunMu({ ...sayfa, izinBandiAcik: true }), false);
    assert.equal(yapiskanCubukGorunsunMu({ ...sayfa, kopruGorunur: true }), false);
    assert.equal(yapiskanCubukGorunsunMu({ ...sayfa, girdiOdakta: true }), false);
  });

  it("kısa sayfada görünmez", () => {
    assert.equal(yapiskanCubukGorunsunMu({ scrollY: 100, innerHeight: 800, scrollHeight: 900, mobil: true }), false);
  });

  it("kapatma oturum deposunda tutulur; depo hata verirse sayfa bozulmaz", () => {
    const veri = new Map();
    const depo = { getItem: (k) => veri.get(k) ?? null, setItem: (k, v) => veri.set(k, v) };
    assert.equal(yapiskanKapatildiMi(depo), false);
    assert.equal(yapiskaniKapat(depo), true);
    assert.equal(veri.get(YAPISKAN_KAPALI_ANAHTARI), "1");
    assert.equal(yapiskanKapatildiMi(depo), true);
    const bozuk = { getItem() { throw new Error("SecurityError"); }, setItem() { throw new Error("QuotaExceeded"); } };
    assert.equal(yapiskanKapatildiMi(bozuk), false);
    assert.equal(yapiskaniKapat(bozuk), false);
    assert.equal(yapiskanKapatildiMi(null), false);
  });
});

describe("yerleşim bağlantıları", () => {
  it("her yeni yerleşim sayfada kendi adıyla ölçülür, mevcut olay adları kullanılır", async () => {
    const [seo, analytics] = await Promise.all([oku("./SeoPages.jsx"), oku("./funnelAnalytics.js")]);
    for (const anahtar of ["SOZLUK_HESAP", "REHBER_HESAP", "SOZLUK_YAPISKAN", "REHBER_YAPISKAN", "SOZLUK_SON", "REHBER_SON", "ALT_CTA"])
      assert.match(seo, new RegExp(`ICERIK_YERLERI\\.${anahtar}\\b`), anahtar);
    assert.match(seo, /<MiniBorcHesabi yer=\{ICERIK_YERLERI\.SOZLUK_HESAP\}\/>/);
    assert.match(seo, /<MiniBorcHesabi yer=\{ICERIK_YERLERI\.REHBER_HESAP\}\/>/);
    assert.match(seo, /<YapiskanKayitCubugu yer=\{ICERIK_YERLERI\.SOZLUK_YAPISKAN\}\/>/);
    assert.match(seo, /<YapiskanKayitCubugu yer=\{ICERIK_YERLERI\.REHBER_YAPISKAN\}\/>/);
    assert.match(seo, /funnelEtkinligiKaydet\("debt_payoff_result_view", null, \{ yer \}\)/);
    assert.match(seo, /funnelTiklamasiKaydedipGit\(olay, "content_product_click", kutu\.yer\)/);
    // Mini hesap ve çubuk sabit kayıt adresine gider; tutar state'i href'e girmez.
    assert.match(seo, /href=\{BORC_KAYIT_ADRESI\}/);
    assert.match(seo, /href=\{BIRIKIM_KAYIT_ADRESI\}/);
    assert.doesNotMatch(seo, /href=\{`[^`]*\$\{(borc|odeme|faiz|sonuc)/);
    assert.doesNotMatch(seo, /funnelEtkinligiKaydet\([^)]*(borc|odeme|toplamFaiz)/);
    // İstemci yerleşimi yalnız content alanına yazar; yeni olay adı eklenmez.
    assert.match(analytics, /yerlesimliKaynak\(kaynakBilgisi\(\), yer\)/);
    for (const ad of ["content_product_click", "debt_payoff_result_view"]) assert.match(analytics, new RegExp(`"${ad}"`));
  });
});
