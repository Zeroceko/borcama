const GUVENLI_EDINIM_KARAKTERLERI = /[^\p{L}\p{N}._/ -]+/gu;
const GUVENLI_TIKLAMA_KARAKTERLERI = /[^A-Za-z0-9._~-]+/g;

export function edinimDegeriniNormalizeEt(value, limit = 100, { lower = false } = {}) {
  const temiz = String(value || "")
    .normalize("NFKC")
    .replace(GUVENLI_EDINIM_KARAKTERLERI, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, limit);
  return lower ? temiz.toLowerCase() : temiz;
}

export function tiklamaKimliginiNormalizeEt(value) {
  return String(value || "").trim().replace(GUVENLI_TIKLAMA_KARAKTERLERI, "").slice(0, 160);
}

export function edinimKaynaginiOlustur({ search = "", saved = null, referrer = "" } = {}) {
  const params = new URLSearchParams(search);
  const clickId = tiklamaKimliginiNormalizeEt(
    params.get("gclid") || params.get("gbraid") || params.get("wbraid") || "",
  );
  const kayitliKaynak = edinimDegeriniNormalizeEt(saved?.source, 100, { lower: true });
  const ilkTemasVar = Boolean(kayitliKaynak);
  const planParametresi = String(params.get("plan") || saved?.plan || "").toLowerCase();
  return {
    source: ilkTemasVar
      ? kayitliKaynak
      : edinimDegeriniNormalizeEt(params.get("utm_source") || (clickId ? "google" : "") || referrer, 100, { lower: true }) || "direct",
    medium: edinimDegeriniNormalizeEt(
      ilkTemasVar ? saved?.medium : (params.get("utm_medium") || (clickId ? "cpc" : "")),
      100,
      { lower: true },
    ),
    campaign: edinimDegeriniNormalizeEt(ilkTemasVar ? saved?.campaign : params.get("utm_campaign"), 120),
    content: edinimDegeriniNormalizeEt(ilkTemasVar ? saved?.content : params.get("utm_content"), 120),
    term: edinimDegeriniNormalizeEt(ilkTemasVar ? saved?.term : params.get("utm_term"), 120),
    click_id: tiklamaKimliginiNormalizeEt(ilkTemasVar ? saved?.click_id : clickId),
    plan: ["free", "pro"].includes(planParametresi) ? planParametresi : "",
  };
}
