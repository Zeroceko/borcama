// CRM "Günlük" ekranının saf hesapları. Girdi: Backoffice yanıtındaki
// analytics.olcum.oturumlar (son 30 günün oturumları; kimliksiz) ve users.
// Günler ve saatler Türkiye saatine göre.

const TR_GUN = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" });
const TR_SAAT = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Istanbul", hour: "2-digit", hourCycle: "h23" });

export function trGunu(deger) {
  const d = new Date(deger);
  return Number.isFinite(d.getTime()) ? TR_GUN.format(d) : null;
}

export function trSaati(deger) {
  const d = new Date(deger);
  return Number.isFinite(d.getTime()) ? Number(TR_SAAT.format(d)) : null;
}

// "2026-11-06" günü için n gün önceki gün (takvim günü, saat dilimine bağlı değil).
export function gunKaydir(gun, n) {
  const d = new Date(`${gun}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function kaynakAdi(kaynak) {
  const k = String(kaynak || "").trim().toLowerCase().replace(/^(www|m|l|lm)\./, "");
  if (!k || k === "direct" || k === "(direct)") return "direct";
  if (k === "ig" || k === "instagram.com") return "instagram";
  if (k === "facebook.com") return "facebook";
  if (k === "t.co" || k === "x.com" || k === "twitter.com") return "x";
  if (k === "borcama.com" || k === "crm.borcama.com") return "site içi";
  return k;
}

export const sayfaAdi = (yol) => (yol === "/" ? "Ana sayfa" : yol);

function kaynakGrubu(ad) {
  if (ad === "direct") return "direct";
  if (["google", "bing", "yandex", "duckduckgo", "yahoo"].some((m) => ad === m || ad.startsWith(`${m}.`))) return "arama";
  return "diger";
}

const bosGun = (gun) => ({ gun, ziyaret: 0, arama: 0, direct: 0, diger: 0, kayitEkrani: 0, yari: 0, cta: 0, urune: 0, appStore: 0, hesap: 0, dogrulanan: 0 });

function oturumuEkle(g, o) {
  const ol = new Set(o.olaylar || []);
  if (ol.has("register_view")) g.kayitEkrani += 1;
  if (!o.giris) return;
  g.ziyaret += 1;
  g[kaynakGrubu(kaynakAdi(o.kaynak))] += 1;
  if (ol.has("landing_scroll_half")) g.yari += 1;
  if (ol.has("landing_cta_click")) g.cta += 1;
  if (ol.has("content_product_click") || ol.has("debt_payoff_product_click") || ol.has("deposit_product_click")) g.urune += 1;
  if (ol.has("landing_appstore_click")) g.appStore += 1;
}

// Son `gunSayisi` günün satırları, en yeni önce. Ziyaret = sitede bir sayfaya
// giriş yapan oturum; kayıt ekranı girişsiz oturumları da sayar.
export function gunlukSeri(oturumlar = [], kullanicilar = [], { gunSayisi = 30, simdi = Date.now() } = {}) {
  const bugun = trGunu(simdi);
  const gunler = new Map(Array.from({ length: gunSayisi }, (_, i) => {
    const gun = gunKaydir(bugun, -i);
    return [gun, bosGun(gun)];
  }));
  for (const o of oturumlar) {
    const g = gunler.get(trGunu(o.t));
    if (g) oturumuEkle(g, o);
  }
  for (const u of kullanicilar) {
    const g = gunler.get(trGunu(u.created_at));
    if (!g) continue;
    g.hesap += 1;
    if (u.email_confirmed_at) g.dogrulanan += 1;
  }
  return [...gunler.values()];
}

// Seçilen günün önceki 7 gününün ortalaması; o kadar geriye veri yoksa null.
export function oncekiOrtalama(seri, gun, alan, pencere = 7) {
  const i = seri.findIndex((s) => s.gun === gun);
  if (i < 0) return null;
  const onceki = seri.slice(i + 1, i + 1 + pencere);
  if (onceki.length < pencere) return null;
  return onceki.reduce((t, s) => t + s[alan], 0) / pencere;
}

function sirala(harita) {
  return [...harita.values()].sort((a, b) => b.ziyaret - a.ziyaret || b.kayitEkrani - a.kayitEkrani || a.ad.localeCompare(b.ad, "tr"));
}

export function gunDetayi(oturumlar = [], gun) {
  const saatler = Array(24).fill(0);
  const kaynaklar = new Map();
  const sayfalar = new Map();
  for (const o of oturumlar) {
    if (trGunu(o.t) !== gun || !o.giris) continue;
    const ol = new Set(o.olaylar || []);
    const kayit = ol.has("register_view") ? 1 : 0;
    const urune = ol.has("content_product_click") || ol.has("debt_payoff_product_click") || ol.has("deposit_product_click") || ol.has("landing_cta_click") ? 1 : 0;
    saatler[trSaati(o.t)] += 1;
    const kAd = kaynakAdi(o.kaynak);
    const kAnahtar = `${kAd}|${o.kanal || ""}`;
    const k = kaynaklar.get(kAnahtar) || { ad: kAd, kanal: o.kanal || "", ziyaret: 0, kayitEkrani: 0 };
    k.ziyaret += 1;
    k.kayitEkrani += kayit;
    kaynaklar.set(kAnahtar, k);
    const s = sayfalar.get(o.giris) || { ad: o.giris, ziyaret: 0, urune: 0, kayitEkrani: 0 };
    s.ziyaret += 1;
    s.urune += urune;
    s.kayitEkrani += kayit;
    sayfalar.set(o.giris, s);
  }
  return { saatler, kaynaklar: sirala(kaynaklar), sayfalar: sirala(sayfalar) };
}

const yuzdeFark = (deger, ort) => Math.round(((deger - ort) / ort) * 100);

// Günün kısa yorumu: ortalamaya göre ziyaret, baskın kaynak ve sayfa, huni.
export function gunYorumu(seri, gun, detay) {
  const s = seri.find((x) => x.gun === gun);
  if (!s) return [];
  const satirlar = [];
  const ort = oncekiOrtalama(seri, gun, "ziyaret");
  if (!s.ziyaret) satirlar.push("Bu gün siteye giriş yok.");
  else if (ort === null || ort === 0) satirlar.push(`${s.ziyaret} ziyaret.`);
  else {
    const fark = yuzdeFark(s.ziyaret, ort);
    const ortMetni = ort.toLocaleString("tr-TR", { maximumFractionDigits: 1 });
    satirlar.push(Math.abs(fark) < 15
      ? `${s.ziyaret} ziyaret, önceki 7 günün ortalamasıyla (${ortMetni}) aynı düzeyde.`
      : `${s.ziyaret} ziyaret, önceki 7 günün ortalamasının (${ortMetni}) %${Math.abs(fark)} ${fark > 0 ? "üstünde" : "altında"}.`);
  }
  const ilkKaynak = detay?.kaynaklar?.[0];
  if (ilkKaynak && s.ziyaret >= 3 && ilkKaynak.ziyaret / s.ziyaret >= 0.5) satirlar.push(`Ziyaretin çoğu ${ilkKaynak.ad} kaynağından (${ilkKaynak.ziyaret}/${s.ziyaret}).`);
  const ilkSayfa = detay?.sayfalar?.[0];
  if (ilkSayfa && s.ziyaret >= 3 && ilkSayfa.ziyaret / s.ziyaret >= 0.4) satirlar.push(`En çok girilen sayfa: ${sayfaAdi(ilkSayfa.ad)} (${ilkSayfa.ziyaret}).`);
  if (s.kayitEkrani || s.hesap) satirlar.push(`${s.kayitEkrani} kayıt ekranı, ${s.hesap} yeni hesap${s.hesap ? ` (${s.dogrulanan} doğrulandı)` : ""}.`);
  else if (s.ziyaret >= 5) satirlar.push("Kayıt ekranına geçen olmadı.");
  return satirlar;
}
