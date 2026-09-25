function temizMetin(deger) {
  return String(deger || "").trim();
}

export function kartHarcamaKaynagi(kart = {}) {
  const banka = temizMetin(kart.banka) || "Banka";
  const ad = temizMetin(kart.ad) || "Kredi kartı";
  const son4 = temizMetin(kart.kartSon4);
  return {
    id: kart.id,
    tur: "card",
    secimDegeri: `card:${kart.id}`,
    kayitEtiketi: `${banka} · ${ad}`,
    gorunenEtiket: `${banka} · ${ad}${son4 ? ` •••• ${son4}` : ""}`,
  };
}

export function hesapHarcamaKaynagi(hesap = {}) {
  const kurum = temizMetin(hesap.kurum) || "Banka hesabı";
  const ad = temizMetin(hesap.ad) || "Hesap";
  const etiket = kurum.toLocaleLowerCase("tr-TR") === ad.toLocaleLowerCase("tr-TR")
    ? kurum
    : `${kurum} · ${ad}`;
  return {
    id: hesap.id,
    tur: "account",
    secimDegeri: `account:${hesap.id}`,
    kayitEtiketi: etiket,
    gorunenEtiket: etiket,
  };
}

export function harcamaKaynaklariniOlustur(veri = {}) {
  return {
    kartlar: (veri.cards || []).filter((kart) => kart?.id).map(kartHarcamaKaynagi),
    hesaplar: (veri.assets || [])
      .filter((varlik) => varlik?.id && varlik.tur === "mevduat")
      .map(hesapHarcamaKaynagi),
  };
}

export function harcamaKaynagiSecimDegeri(form = {}, kaynaklar = {}) {
  if (form.kaynak === "Nakit") return "cash";
  if (form.kaynakId && form.kaynakTuru)
    return `${form.kaynakTuru}:${form.kaynakId}`;
  const tumu = [...(kaynaklar.kartlar || []), ...(kaynaklar.hesaplar || [])];
  return tumu.find((kaynak) => kaynak.kayitEtiketi === form.kaynak)?.secimDegeri || "";
}
