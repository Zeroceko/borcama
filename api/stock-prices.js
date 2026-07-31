const HISSE_KODU = /^[A-Z0-9]{2,10}$/;

function kodlariOku(req) {
  const ham = new URL(req.url || "/", "http://localhost").searchParams.get("codes") || "";
  return [...new Set(
    ham
      .split(",")
      .map((kod) => kod.trim().toUpperCase().replace(/\.IS$/, ""))
      .filter((kod) => HISSE_KODU.test(kod)),
  )].slice(0, 25);
}

function piyasaOku(req) {
  return new URL(req.url || "/", "http://localhost").searchParams.get("market") === "US"
    ? "US"
    : "BIST";
}

async function yahooGet(host, sembol) {
  const yanit = await fetch(
    `https://${host}/v8/finance/chart/${encodeURIComponent(sembol)}?interval=1d&range=1mo`,
    {
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; Borcama/1.0; +https://borcama.com)",
      },
      signal: AbortSignal.timeout(10000),
    },
  );
  if (!yanit.ok) throw new Error(`Fiyat kaynağı: ${yanit.status}`);
  return yanit.json();
}

async function hisseFiyati(kod, piyasa) {
  const sembol = piyasa === "US" ? kod : `${kod}.IS`;
  let veri;
  try {
    veri = await yahooGet("query2.finance.yahoo.com", sembol);
  } catch {
    veri = await yahooGet("query1.finance.yahoo.com", sembol);
  }
  const meta = veri?.chart?.result?.[0]?.meta;
  const fiyat = Number(meta?.regularMarketPrice);
  if (!meta || !Number.isFinite(fiyat) || fiyat <= 0)
    throw new Error(`${kod} için güncel fiyat bulunamadı`);
  return {
    code: kod,
    symbol: sembol,
    name: String(meta.longName || meta.shortName || kod).trim(),
    price: Number(fiyat.toFixed(4)),
    currency: String(meta.currency || "TRY"),
    exchange: piyasa === "US" ? String(meta.exchangeName || meta.fullExchangeName || "ABD borsası") : "Borsa İstanbul",
    priceAt: meta.regularMarketTime
      ? new Date(meta.regularMarketTime * 1000).toISOString()
      : null,
    source: "Yahoo Finance",
  };
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Yalnızca GET destekleniyor." });
  }
  const codes = kodlariOku(req);
  const piyasa = piyasaOku(req);
  if (!codes.length)
    return res.status(400).json({ error: `Geçerli bir ${piyasa === "US" ? "ABD" : "BIST"} hisse kodu girin.` });

  const sonuclar = await Promise.allSettled(codes.map((kod) => hisseFiyati(kod, piyasa)));
  const stocks = {};
  const errors = [];
  sonuclar.forEach((sonuc, i) => {
    if (sonuc.status === "fulfilled") stocks[codes[i]] = sonuc.value;
    else errors.push({ code: codes[i], message: sonuc.reason?.message || "Fiyat alınamadı" });
  });

  res.setHeader("Cache-Control", "public, s-maxage=900, stale-while-revalidate=3600");
  return res.status(Object.keys(stocks).length ? 200 : 404).json({
    stocks,
    updatedAt: new Date().toISOString(),
    delayed: true,
    partial: errors.length > 0,
    errors,
  });
}
