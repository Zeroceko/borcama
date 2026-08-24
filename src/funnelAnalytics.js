import { supabase, supabaseHazir } from "./supabaseClient.js";

const OTURUM_ANAHTARI = "borcama:funnel-session";
const KAYNAK_ANAHTARI = "borcama:funnel-source";
const IZINLI_ETKINLIKLER = new Set(["landing_visit", "register_view"]);

function oturumKimligi() {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem(OTURUM_ANAHTARI);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(OTURUM_ANAHTARI, id);
  }
  return id;
}

function kaynakBilgisi() {
  const params = new URLSearchParams(window.location.search);
  const kayitli = JSON.parse(sessionStorage.getItem(KAYNAK_ANAHTARI) || "null");
  let referrer = "";
  try {
    referrer = document.referrer ? new URL(document.referrer).hostname : "";
  } catch {
    referrer = "";
  }
  const clickId = params.get("gclid") || params.get("gbraid") || params.get("wbraid") || "";
  const sonuc = {
    source: params.get("utm_source") || (clickId ? "google" : "") || kayitli?.source || referrer || "direct",
    medium: params.get("utm_medium") || (clickId ? "cpc" : "") || kayitli?.medium || "",
    campaign: params.get("utm_campaign") || kayitli?.campaign || "",
    content: params.get("utm_content") || kayitli?.content || "",
    term: params.get("utm_term") || kayitli?.term || "",
    click_id: clickId || kayitli?.click_id || "",
    plan: params.get("plan") || kayitli?.plan || "",
  };
  sessionStorage.setItem(KAYNAK_ANAHTARI, JSON.stringify(sonuc));
  return sonuc;
}

export function funnelOturumKimligi() {
  return oturumKimligi();
}

export function funnelKaynakBilgisi() {
  return kaynakBilgisi();
}

export function funnelEtkinligiKaydet(eventName) {
  if (!supabaseHazir || !IZINLI_ETKINLIKLER.has(eventName)) return;
  const sessionId = oturumKimligi();
  if (!sessionId) return;
  const kaynak = kaynakBilgisi();
  void supabase.functions.invoke("analytics-event", {
    body: {
      event_name: eventName,
      session_id: sessionId,
      path: window.location.pathname,
      ...kaynak,
    },
  }).catch(() => undefined);
}
