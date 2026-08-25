const LISTELER = {
  cards: ["card", "Kredi kartı"], loans: ["loan", "Kredi"],
  overdrafts: ["overdraft", "Ek hesap / KMH"], others: ["other_debt", "Diğer borç"],
  expenses: ["expense", "Harcama"], incomes: ["income", "Gelir"], assets: ["asset", "Varlık"],
};
const temizMetin = (deger, uzunluk = 80) => String(deger || "").replace(/[\r\n\t]+/g, " ").trim().slice(0, uzunluk);
const kayitEtiketi = (kayit, varsayilan) => temizMetin([temizMetin(kayit?.banka, 40), temizMetin(kayit?.ad || kayit?.kategori || kayit?.tur, 40)].filter(Boolean).join(" · ") || varsayilan);
const kimlikHaritasi = (liste) => new Map((Array.isArray(liste) ? liste : []).map((x) => [String(x?.id || ""), x]));
function kartEkstreleri(veri) { const sonuc = new Map(); for (const kart of Array.isArray(veri?.cards) ? veri.cards : []) for (const ekstre of [kart, ...(Array.isArray(kart.ekstreGecmisi) ? kart.ekstreGecmisi : [])]) if (ekstre?.ekstreAyi) sonuc.set(`${kart.id}:${ekstre.ekstreAyi}`, { kart, ekstre }); return sonuc; }
function kartOdemeKayitlari(veri) { const sonuc = new Map(); for (const [donem, kayitlar] of Object.entries(veri?.cardPaymentHistory || {})) for (const kayit of Array.isArray(kayitlar) ? kayitlar : []) if (kayit?.id) sonuc.set(String(kayit.id), { donem, kayit }); return sonuc; }
function krediOdemeKayitlari(veri) { const sonuc = new Map(); for (const [donem, kayitlar] of Object.entries(veri?.loanPaymentHistory || {})) for (const [krediId, kayit] of Object.entries(kayitlar || {})) sonuc.set(`${donem}:${krediId}`, kayit); return sonuc; }

export function aktiviteOlaylariniCikar(eski = {}, yeni = {}) {
  const olaylar = [];
  const ekle = (event_type, entity_type, label, source = "manual") => olaylar.push({ event_type, entity_type, source, label: temizMetin(label) });
  for (const [alan, [tur, ad]] of Object.entries(LISTELER)) {
    const once = kimlikHaritasi(eski?.[alan]), sonra = kimlikHaritasi(yeni?.[alan]);
    for (const [id, kayit] of sonra) if (id && !once.has(id)) ekle(`${tur}_added`, tur, kayitEtiketi(kayit, ad));
    for (const [id, kayit] of once) if (id && !sonra.has(id)) ekle("record_deleted", tur, kayitEtiketi(kayit, ad));
  }
  const eskiEkstreler = kartEkstreleri(eski);
  for (const [anahtar, { kart, ekstre }] of kartEkstreleri(yeni)) if (!eskiEkstreler.has(anahtar)) ekle("statement_added", "statement", kayitEtiketi(kart, "Kredi kartı"), ekstre?.ekstreBelgeOzeti || ekstre?.belgedenToplamEkstreBorcu ? "file_upload" : "manual");
  const eskiKartOdemeleri = kartOdemeKayitlari(eski);
  for (const [id, { donem }] of kartOdemeKayitlari(yeni)) if (!eskiKartOdemeleri.has(id)) ekle("payment_added", "card", `Kredi kartı · ${donem}`);
  const eskiKrediOdemeleri = krediOdemeKayitlari(eski);
  for (const [anahtar, kayit] of krediOdemeKayitlari(yeni)) { const onceki = eskiKrediOdemeleri.get(anahtar); if (!onceki || onceki?.odendiTarihi !== kayit?.odendiTarihi) ekle("payment_added", "loan", kayitEtiketi(kayit, "Kredi")); }
  for (const hesap of Array.isArray(yeni?.overdrafts) ? yeni.overdrafts : []) { const onceki = (eski?.overdrafts || []).find((x) => x.id === hesap.id); const oncekiOdemeler = kimlikHaritasi(onceki?.odemeGecmisi); for (const [id] of kimlikHaritasi(hesap?.odemeGecmisi)) if (!oncekiOdemeler.has(id)) ekle("payment_added", "overdraft", kayitEtiketi(hesap, "Ek hesap / KMH")); }
  return olaylar.slice(0, 12);
}

export { temizMetin };
