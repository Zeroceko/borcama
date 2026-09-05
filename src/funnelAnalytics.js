import { supabase, supabaseHazir } from "./supabaseClient.js";
import { edinimKaynaginiOlustur } from "./acquisition.js";
import { aktifLandingDeneyiOku } from "./landingExperiment.js";
export { edinimKaynaginiOlustur } from "./acquisition.js";

const OTURUM_ANAHTARI = "borcama:funnel-session";
const KAYNAK_ANAHTARI = "borcama:funnel-source";
const OTURUM_TOKEN_ANAHTARI = "borcama:funnel-session-token";
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

export async function funnelEtkinligiKaydet(eventName, experiment = null) {
  if (!supabaseHazir || !IZINLI_ETKINLIKLER.has(eventName)) return false;
  const sessionId = oturumKimligi();
  if (!sessionId) return false;
  const kaynak = kaynakBilgisi();
  const deney = experiment || aktifLandingDeneyiOku();
  try {
    const { data, error } = await supabase.functions.invoke("analytics-event", {
      body: {
        event_name: eventName,
        session_id: sessionId,
        session_token: sessionStorage.getItem(OTURUM_TOKEN_ANAHTARI) || "",
        path: window.location.pathname,
        ...kaynak,
        experiment_id: deney.experiment_id || "",
        experiment_variant: deney.experiment_variant || "",
      },
    });
    if (error) return false;
    if (data?.session_token)
      sessionStorage.setItem(OTURUM_TOKEN_ANAHTARI, String(data.session_token));
    return true;
  } catch {
    return false;
  }
}
