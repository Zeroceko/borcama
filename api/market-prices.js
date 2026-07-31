const ONDALIK = /^-?\d+(?:[.,]\d+)?$/;

function sayi(deger) {
  const temiz = String(deger ?? "").trim().replace(",", ".");
  return ONDALIK.test(temiz) ? Number(temiz) : 0;
}

function dovizOku(xml, kod) {
  const blok = xml.match(
    new RegExp(`<Currency[^>]+(?:Kod|CurrencyCode)="${kod}"[\\s\\S]*?<\\/Currency>`),
  )?.[0];
  if (!blok) return 0;
  return sayi(
    blok.match(/<ForexSelling>([^<]+)<\/ForexSelling>/)?.[1] ||
      blok.match(/<ForexBuying>([^<]+)<\/ForexBuying>/)?.[1],
  );
}

async function jsonGet(url) {
  const yanit = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "Borcama/1.0 (https://borcama.com)",
    },
    signal: AbortSignal.timeout(8000),
  });
  if (!yanit.ok) throw new Error(`Kaynak hatası: ${yanit.status}`);
  return yanit.json();
}

const KRIPTO_IDLERI = [
  "bitcoin", "ethereum", "tether", "binancecoin", "solana", "usd-coin", "ripple", "staked-ether", "dogecoin", "cardano",
  "tron", "avalanche-2", "wrapped-bitcoin", "sui", "chainlink", "polkadot", "shiba-inu", "leo-token", "hyperliquid", "bitcoin-cash",
  "near", "wrapped-steth", "litecoin", "aptos", "internet-computer", "dai", "uniswap", "arbitrum", "render-token", "kaspa",
  "cosmos", "ethena", "filecoin", "stellar", "okb", "mantle", "monero", "crypto-com-chain", "aave", "algorand", "vechain",
  "bittensor", "theta-token", "immutable-x", "optimism", "maker", "bonk", "jupiter-exchange-solana", "the-graph", "rocket-pool",
];

async function kriptoFiyatlari() {
  try {
    const veri = await jsonGet(
      "https://api.coingecko.com/api/v3/simple/price?ids=" +
        encodeURIComponent(KRIPTO_IDLERI.join(",")) +
        "&vs_currencies=try,usd",
    );
    const prices = {};
    const usdPrices = {};
    KRIPTO_IDLERI.forEach((id) => {
      const fiyat = sayi(veri?.[id]?.try);
      if (fiyat > 0) prices[id] = fiyat;
      const usdFiyat = sayi(veri?.[id]?.usd);
      if (usdFiyat > 0) usdPrices[id] = usdFiyat;
    });
    const tryFiyati = prices.bitcoin || 0;
    const usdFiyati = sayi(veri?.bitcoin?.usd);
    if (!usdFiyati) throw new Error("CoinGecko fiyatı boş");
    return { prices, usdPrices, tryFiyati, usdFiyati, kaynak: "CoinGecko" };
  } catch {
    const veri = await jsonGet("https://api.coinbase.com/v2/prices/BTC-USD/spot");
    const usdFiyati = sayi(veri?.data?.amount);
    if (!usdFiyati) throw new Error("Coinbase fiyatı boş");
    return { prices: {}, usdPrices: { bitcoin: usdFiyati }, tryFiyati: 0, usdFiyati, kaynak: "Coinbase" };
  }
}

async function yahooEmtiaFiyatlari() {
  const kontratlar = { oilBarrelUsd: "CL=F", copperPoundUsd: "HG=F" };
  const sonuclar = await Promise.allSettled(
    Object.values(kontratlar).map(async (sembol) => {
      const yanit = await fetch(
        "https://query2.finance.yahoo.com/v8/finance/chart/" +
          encodeURIComponent(sembol) + "?interval=1d&range=5d",
        {
          headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0 (compatible; Borcama/1.0)" },
          signal: AbortSignal.timeout(8000),
        },
      );
      if (!yanit.ok) throw new Error(`Yahoo emtia: ${yanit.status}`);
      const meta = (await yanit.json())?.chart?.result?.[0]?.meta;
      const fiyat = sayi(meta?.regularMarketPrice);
      if (!fiyat) throw new Error(`${sembol} fiyatı boş`);
      return fiyat;
    }),
  );
  const fiyatlar = {};
  Object.keys(kontratlar).forEach((alan, i) => {
    if (sonuclar[i].status === "fulfilled") fiyatlar[alan] = sonuclar[i].value;
  });
  if (!Object.keys(fiyatlar).length) throw new Error("Emtia fiyatları alınamadı");
  return { fiyatlar, kaynak: "Yahoo Finance" };
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Yalnızca GET destekleniyor." });
  }

  const prices = {};
  const sources = [];
  const errors = [];

  const [tcmb, kripto, altin, gumus, platin, emtia] = await Promise.allSettled([
    fetch("https://www.tcmb.gov.tr/kurlar/today.xml", {
      headers: { "User-Agent": "Borcama/1.0 (https://borcama.com)" },
      signal: AbortSignal.timeout(8000),
    }).then(async (yanit) => {
      if (!yanit.ok) throw new Error(`TCMB: ${yanit.status}`);
      return yanit.text();
    }),
    kriptoFiyatlari(),
    jsonGet("https://api.gold-api.com/price/XAU"),
    jsonGet("https://api.gold-api.com/price/XAG"),
    jsonGet("https://api.gold-api.com/price/XPT"),
    yahooEmtiaFiyatlari(),
  ]);

  if (tcmb.status === "fulfilled") {
    prices.usdTry = dovizOku(tcmb.value, "USD");
    prices.eurTry = dovizOku(tcmb.value, "EUR");
    prices.gbpTry = dovizOku(tcmb.value, "GBP");
    prices.chfTry = dovizOku(tcmb.value, "CHF");
    if (prices.usdTry && prices.eurTry && prices.gbpTry && prices.chfTry)
      sources.push("TCMB");
    else errors.push("TCMB kurlarının bir bölümü okunamadı");
  } else errors.push("TCMB kurları alınamadı");

  if (kripto.status === "fulfilled") {
    prices.crypto = kripto.value.prices || {};
    prices.cryptoUsd = kripto.value.usdPrices || {};
    prices.bitcoinUsd = sayi(kripto.value?.usdFiyati);
    prices.bitcoinTry =
      sayi(kripto.value?.tryFiyati) || prices.bitcoinUsd * prices.usdTry;
    if (prices.bitcoinTry) sources.push(kripto.value.kaynak);
    else errors.push("Bitcoin fiyatı okunamadı");
  } else errors.push("Bitcoin fiyatı alınamadı");

  if (altin.status === "fulfilled") {
    prices.goldOunceUsd = sayi(altin.value?.price);
    if (prices.goldOunceUsd && prices.usdTry) {
      prices.goldGramTry = (prices.goldOunceUsd * prices.usdTry) / 31.1034768;
      sources.push("Gold API");
    } else errors.push("Gram altın hesaplanamadı");
  } else errors.push("Ons altın fiyatı alınamadı");

  if (gumus.status === "fulfilled") {
    prices.silverOunceUsd = sayi(gumus.value?.price);
    if (prices.silverOunceUsd && prices.usdTry)
      prices.silverGramTry = (prices.silverOunceUsd * prices.usdTry) / 31.1034768;
    else errors.push("Gümüş fiyatı hesaplanamadı");
  } else errors.push("Gümüş fiyatı alınamadı");

  if (platin.status === "fulfilled") {
    prices.platinumOunceUsd = sayi(platin.value?.price);
    if (prices.platinumOunceUsd && prices.usdTry)
      prices.platinumOunceTry = prices.platinumOunceUsd * prices.usdTry;
    else errors.push("Platin fiyatı hesaplanamadı");
  } else errors.push("Platin fiyatı alınamadı");

  if (emtia.status === "fulfilled" && prices.usdTry) {
    prices.oilBarrelTry = (emtia.value.fiyatlar.oilBarrelUsd || 0) * prices.usdTry;
    prices.copperPoundTry = (emtia.value.fiyatlar.copperPoundUsd || 0) * prices.usdTry;
    sources.push(emtia.value.kaynak);
  } else errors.push("Petrol ve bakır fiyatları alınamadı");

  Object.keys(prices).forEach((anahtar) => {
    if (anahtar === "crypto") {
      Object.keys(prices.crypto || {}).forEach((coinId) => {
        if (!Number.isFinite(prices.crypto[coinId]) || prices.crypto[coinId] <= 0)
          delete prices.crypto[coinId];
        else prices.crypto[coinId] = Number(prices.crypto[coinId].toFixed(8));
      });
      Object.keys(prices.cryptoUsd || {}).forEach((coinId) => {
        if (!Number.isFinite(prices.cryptoUsd[coinId]) || prices.cryptoUsd[coinId] <= 0)
          delete prices.cryptoUsd[coinId];
        else prices.cryptoUsd[coinId] = Number(prices.cryptoUsd[coinId].toFixed(8));
      });
      return;
    }
    if (anahtar === "cryptoUsd") return;
    if (!Number.isFinite(prices[anahtar]) || prices[anahtar] <= 0)
      delete prices[anahtar];
    else prices[anahtar] = Number(prices[anahtar].toFixed(6));
  });

  res.setHeader(
    "Cache-Control",
    "public, s-maxage=900, stale-while-revalidate=3600",
  );
  return res.status(Object.keys(prices).length ? 200 : 503).json({
    prices,
    sources,
    updatedAt: new Date().toISOString(),
    partial: errors.length > 0,
    errors,
  });
}
