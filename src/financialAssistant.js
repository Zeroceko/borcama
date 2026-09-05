import { demoModu, supabase } from "./supabaseClient.js";

const tl = (value) => new Intl.NumberFormat("tr-TR", {
  style: "currency", currency: "TRY", maximumFractionDigits: 0,
}).format(Number(value) || 0);

function demoYaniti(question, context) {
  const soru = String(question || "").toLocaleLowerCase("tr-TR");
  const ozet = context?.ozet || {};
  const oranEslesmesi = soru.match(/%\s*(\d+(?:[,.]\d+)?)/);
  const sayilar = [...soru.matchAll(/\d[\d.\s]*/g)]
    .map((eslesme) => Number(eslesme[0].replace(/[.\s]/g, "")))
    .filter(Number.isFinite);
  const tutar = sayilar.length ? Math.max(...sayilar) : 0;
  const aylikOran = Number(String(oranEslesmesi?.[1] || "").replace(",", ".")) || 0;

  if (/kredi|bor[cç].*al|bor[cç]lan/.test(soru)) {
    const faiz = tutar && aylikOran ? tutar * aylikOran / 100 : 0;
    const acik = Number(ozet.aylikAcik) || 0;
    const dusukMaliyetli = aylikOran > 0 && aylikOran <= 1.5;
    return {
      title: dusukMaliyetli ? "Pahalı borcu kapatacaksa mantıklı olabilir" : (acik > 0 ? "Yeni kredi aylık açığını büyütebilir" : "Karar için toplam maliyeti karşılaştır"),
      answer: `${tutar ? `${tl(tutar)} kredi` : "Bu kredi"}${aylikOran ? ` aylık %${String(aylikOran).replace(".", ",")} nominal faizle` : ""}${faiz ? ` ilk ay yaklaşık ${tl(faiz)} çıplak faiz üretir` : " değerlendirilebilir"}. ${dusukMaliyetli ? "Kart/KMH gibi daha pahalı bir borcu tamamen kapatıyor ve tekrar borçlanma yaratmıyorsa olumlu bir refinansman olabilir." : "Mevcut borcun maliyetinden düşük olduğunu doğrulamak gerekir."} Kesin karar için vade, taksit, KKDF, BSMV ve toplam geri ödemeyi ekle.${acik > 0 ? ` Taksit, mevcut ${tl(acik)} aylık açığa rağmen bütçeye sığmalı.` : ""}`,
      actionLabel: "Borç planını aç",
      route: "plan",
      quota: null,
    };
  }

  if (/harcama|gider|nereye.*gid/.test(soru)) {
    const kategoriler = context?.giderKategorileri || [];
    const ilk = kategoriler[0];
    return {
      title: ilk ? `En yüksek kayıtlı giderin ${ilk.kategori}` : "Gider ayrıntısı henüz yeterli değil",
      answer: ilk ? `${tl(ilk.tutar)} ile ilk sırada. Bu yalnız demo kayıtlarının özetidir; gerçek hesabında ekstre ve gider kategorilerin üzerinden karşılaştırırım.` : "Sağlıklı yorum için gider veya ekstre kayıtlarının kategorilere ayrılması gerekiyor.",
      actionLabel: "Harcamaları aç", route: "harcamalar", quota: null,
    };
  }

  return {
    title: Number(ozet.aylikAcik) > 0 ? `Aylık planda ${tl(ozet.aylikAcik)} açık var` : "Demo kayıtlarına göre plan dengede",
    answer: `Gelir ${tl(ozet.aylikGelir)}, zorunlu ödeme ${tl(ozet.zorunluOdeme)} ve kayıtlı harcama ${tl(ozet.kayitliHarcama)}. Sorunu kredi, yapılandırma, ödeme veya gider ayrıntısıyla yazarsan bu tabloya göre daha net açıklayabilirim.`,
    actionLabel: "Borç planını aç", route: "plan", quota: null,
  };
}

export async function finansalAsistanaSor({ question, context }) {
  if (demoModu) return demoYaniti(question, context);
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("AUTH_REQUIRED");
  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/financial-assistant`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ question, context }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error || "ASSISTANT_UNAVAILABLE");
    error.quota = payload.quota;
    throw error;
  }
  return payload;
}
