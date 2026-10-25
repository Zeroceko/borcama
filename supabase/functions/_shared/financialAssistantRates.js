// Asistanın döviz/altın çevirisi yapabilmesi için Borcama piyasa servisinden
// güncel kurlar. Servis yanıt vermezse null döner; asistan kur bilmediğini söyler.
const yuvarla = (deger, basamak = 4) => {
  const n = Number(deger);
  return Number.isFinite(n) && n > 0 ? Math.round(n * 10 ** basamak) / 10 ** basamak : null;
};

export function piyasaKurlariniOzetle(veri) {
  const p = veri?.prices || {};
  const kurlar = {
    guncellenme: typeof veri?.updatedAt === "string" ? veri.updatedAt : null,
    kaynak: "TCMB döviz satış kuru; altın/gümüş Gold API; kripto CoinGecko (Borcama piyasa servisi)",
    usdTry: yuvarla(p.usdTry),
    eurTry: yuvarla(p.eurTry),
    gbpTry: yuvarla(p.gbpTry),
    chfTry: yuvarla(p.chfTry),
    gramAltinTry: yuvarla(p.goldGramTry, 2),
    gramGumusTry: yuvarla(p.silverGramTry, 2),
    bitcoinTry: yuvarla(p.bitcoinTry, 0),
  };
  return kurlar.usdTry ? kurlar : null;
}

export async function guncelPiyasaKurlari(fetchFn = fetch) {
  try {
    const yanit = await fetchFn("https://borcama.com/api/market-prices", {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(3000),
    });
    if (!yanit.ok) return null;
    return piyasaKurlariniOzetle(await yanit.json());
  } catch {
    return null;
  }
}
