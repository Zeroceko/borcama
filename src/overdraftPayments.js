const para = (deger) => Math.max(Number(deger) || 0, 0);

export const ekHesapOdemeGecmisiToplami = (gecmis = []) =>
  gecmis.reduce((toplam, odeme) => toplam + para(odeme?.tutar), 0);

function eskiGecmisToplamaDahilMi(hesap) {
  const toplamOdeme = para(hesap?.yapilanOdeme);
  const gecmisToplami = ekHesapOdemeGecmisiToplami(hesap?.odemeGecmisi);
  return gecmisToplami <= toplamOdeme + 0.01;
}

function odemeToplamaDahilMi(hesap, odeme) {
  if (typeof odeme?.toplamaDahil === "boolean") return odeme.toplamaDahil;
  return eskiGecmisToplamaDahilMi(hesap);
}

export function ekHesapOdemesiUygula(
  hesap,
  { tutar, tarih, kapat = false, duzenlenenOdeme = null, yeniId },
) {
  const kullanilan = para(hesap?.kullanilan);
  const mevcutOdeme = Math.min(para(hesap?.yapilanOdeme), kullanilan);
  const eskiGecmis = Array.isArray(hesap?.odemeGecmisi)
    ? hesap.odemeGecmisi
    : [];
  const eskiTutar = para(duzenlenenOdeme?.tutar);
  const eskiKayitDahil = duzenlenenOdeme
    ? odemeToplamaDahilMi(hesap, duzenlenenOdeme)
    : false;
  const kalan = Math.max(kullanilan - mevcutOdeme, 0);
  const azami = kapat
    ? kalan
    : kalan + (eskiKayitDahil ? eskiTutar : 0);
  const odemeTutari = Math.min(para(tutar), azami);
  const odemeTarihi = new Date(tarih);

  if (odemeTutari <= 0)
    return { tamam: false, hata: "Ödenecek güncel bakiye bulunamadı." };
  if (Number.isNaN(odemeTarihi.getTime()))
    return { tamam: false, hata: "Geçerli bir ödeme tarihi girin." };

  const kayit = {
    ...(duzenlenenOdeme || {}),
    id: duzenlenenOdeme?.id || yeniId,
    tutar: odemeTutari,
    tarih: odemeTarihi.toISOString(),
    toplamaDahil: true,
    duzenlenmeTarihi: duzenlenenOdeme
      ? new Date().toISOString()
      : undefined,
  };
  const odemeGecmisi = duzenlenenOdeme
    ? eskiGecmis.map((odeme) =>
        odeme.id === kayit.id ? kayit : odeme,
      )
    : [...eskiGecmis, kayit];
  const yapilanOdeme = kapat
    ? kullanilan
    : Math.min(
        mevcutOdeme - (eskiKayitDahil ? eskiTutar : 0) + odemeTutari,
        kullanilan,
      );

  return {
    tamam: true,
    hesap: { ...hesap, yapilanOdeme, odemeGecmisi },
    kayit,
  };
}

export function ekHesapOdemesiKaldir(hesap, odeme) {
  const kullanilan = para(hesap?.kullanilan);
  const mevcutOdeme = Math.min(para(hesap?.yapilanOdeme), kullanilan);
  const toplamaDahil = odemeToplamaDahilMi(hesap, odeme);
  const odemeGecmisi = (hesap?.odemeGecmisi || []).filter((kayit) =>
    odeme?.id ? kayit.id !== odeme.id : kayit.tarih !== odeme?.tarih,
  );
  return {
    ...hesap,
    yapilanOdeme: toplamaDahil
      ? Math.max(mevcutOdeme - para(odeme?.tutar), 0)
      : mevcutOdeme,
    odemeGecmisi,
  };
}
