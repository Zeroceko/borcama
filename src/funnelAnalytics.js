import { supabase, supabaseHazir } from "./supabaseClient.js";
import { edinimKaynaginiOlustur } from "./acquisition.js";
export { edinimKaynaginiOlustur } from "./acquisition.js";

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
  let kayitli = null;
  try { kayitli = JSON.parse(sessionStorage.getItem(KAYNAK_ANAHTARI) || "null"); } catch { kayitli = null; }
  let referrer = "";
  try {
    referrer = document.referrer ? new URL(document.referrer).hostname : "";
  } catch {
    referrer = "";
  }
  const sonuc = edinimKaynaginiOlustur({ search: window.location.search, saved: kayitli, referrer });
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
