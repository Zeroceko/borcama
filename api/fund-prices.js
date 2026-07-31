const FON_KODU = /^[A-Z0-9]{2,8}$/;

function kodlariOku(req) {
  const ham = new URL(req.url || "/", "http://localhost").searchParams.get("codes") || "";
  return [...new Set(
    ham
      .split(",")
      .map((kod) => kod.trim().toUpperCase())
      .filter((kod) => FON_KODU.test(kod)),
  )].slice(0, 25);
}

async function fonFiyati(kod) {
  const yanit = await fetch("https://www.tefas.gov.tr/api/funds/fonBilgiGetir", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": "Borcama/1.0 (https://borcama.com)",
    },
    body: JSON.stringify({ dil: "TR", fonKodu: kod }),
    signal: AbortSignal.timeout(10000),
  });
  if (!yanit.ok) throw new Error(`TEFAS/BEFAS: ${yanit.status}`);
  const veri = await yanit.json();
  const fon = veri?.resultList?.[0];
  const fiyat = Number(fon?.sonFiyat);
  if (!fon || !Number.isFinite(fiyat) || fiyat <= 0)
    throw new Error(`${kod} için güncel fiyat bulunamadı`);

  const ad = String(fon.fonUnvan || "").trim();
  const emeklilik = /EMEKL[Iİ]L[Iİ]K|EMEKL[Iİ]L[Iİ]Ğ[Iİ]/i.test(ad);
  return {
    code: kod,
    name: ad,
    price: Number(fiyat.toFixed(8)),
    dailyReturn: Number(fon.gunlukGetiri) || 0,
    category: String(fon.fonKategori || "").trim(),
    source: emeklilik ? "BEFAS" : "TEFAS",
  };
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Yalnızca GET destekleniyor." });
  }

  const codes = kodlariOku(req);
  if (!codes.length)
    return res.status(400).json({ error: "Geçerli bir fon kodu girin." });

  const sonuclar = await Promise.allSettled(codes.map(fonFiyati));
  const funds = {};
  const errors = [];
  sonuclar.forEach((sonuc, i) => {
    if (sonuc.status === "fulfilled") funds[codes[i]] = sonuc.value;
    else errors.push({ code: codes[i], message: sonuc.reason?.message || "Fiyat alınamadı" });
  });

  res.setHeader("Cache-Control", "public, s-maxage=900, stale-while-revalidate=3600");
  return res.status(Object.keys(funds).length ? 200 : 404).json({
    funds,
    updatedAt: new Date().toISOString(),
    partial: errors.length > 0,
    errors,
  });
}
