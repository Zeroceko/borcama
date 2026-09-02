export function edinimKaynaginiOlustur({ search = "", saved = null, referrer = "" } = {}) {
  const params = new URLSearchParams(search);
  const clickId = params.get("gclid") || params.get("gbraid") || params.get("wbraid") || "";
  const ilkTemasVar = Boolean(saved?.source);
  return {
    source: ilkTemasVar ? saved.source : (params.get("utm_source") || (clickId ? "google" : "") || referrer || "direct"),
    medium: ilkTemasVar ? (saved.medium || "") : (params.get("utm_medium") || (clickId ? "cpc" : "")),
    campaign: ilkTemasVar ? (saved.campaign || "") : (params.get("utm_campaign") || ""),
    content: ilkTemasVar ? (saved.content || "") : (params.get("utm_content") || ""),
    term: ilkTemasVar ? (saved.term || "") : (params.get("utm_term") || ""),
    click_id: ilkTemasVar ? (saved.click_id || "") : clickId,
    plan: params.get("plan") || saved?.plan || "",
  };
}
