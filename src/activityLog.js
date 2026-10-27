import { onboardingOlayVerisi, temizMetin } from "./activityEvents.js";
import { demoModu, supabase } from "./supabaseClient.js";

export async function aktiviteleriKaydet(olaylar = []) {
  if (demoModu || !olaylar.length) return;
  try {
    const { data } = await supabase.auth.getUser();
    const userId = data?.user?.id;
    if (!userId) return;
    const { error } = await supabase.from("activity_logs").insert(
      olaylar.map((olay) => ({
        user_id: userId,
        event_type: temizMetin(olay.event_type, 48),
        entity_type: temizMetin(olay.entity_type, 32) || null,
        source: temizMetin(olay.source, 32) || "manual",
        path: temizMetin(window.location.pathname, 120),
        metadata: { label: temizMetin(olay.label) },
      })),
    );
    if (error) throw error;
  } catch {
    // Faaliyet kaydı, kullanıcının ana finansal kaydını asla engellemez.
  }
}

// Kurulum akisi olcumu: onboarding_adim, onboarding_atla, onboarding_tamam.
// Yalniz adim adi ve sayilar yazilir; kullanicinin girdigi tutarlar, banka
// adlari veya isim asla gonderilmez. Oturum yoksa (giris oncesi native
// onboarding, misafir) olay cihazda kuyruga girer; hesap acilinca
// bekleyenOnboardingOlaylariniGonder ile yazilir.
const OLAY_KUYRUGU = "borcama:onboarding:olaylar";

function kuyrukOku() {
  try {
    const liste = JSON.parse(localStorage.getItem(OLAY_KUYRUGU) || "[]");
    return Array.isArray(liste) ? liste : [];
  } catch {
    return [];
  }
}

function kuyrugaEkle(olay) {
  try {
    localStorage.setItem(OLAY_KUYRUGU, JSON.stringify([...kuyrukOku(), olay].slice(-40)));
  } catch {
    // Depolama kapali: olay kaybolur, akis etkilenmez.
  }
}

function olaySatiri(userId, olay) {
  return {
    user_id: userId,
    event_type: olay.event_type,
    entity_type: "onboarding",
    source: "onboarding",
    path: temizMetin(olay.path || window.location.pathname, 120),
    metadata: onboardingOlayVerisi(olay.metadata),
  };
}

export async function onboardingOlayiKaydet(eventType, metadata = {}) {
  if (demoModu || !/^onboarding_(adim|atla|tamam)$/.test(eventType)) return;
  const olay = { event_type: eventType, metadata: onboardingOlayVerisi(metadata), path: window.location.pathname };
  try {
    const { data } = await supabase.auth.getUser();
    const userId = data?.user?.id;
    if (!userId) {
      kuyrugaEkle(olay);
      return;
    }
    const { error } = await supabase.from("activity_logs").insert(olaySatiri(userId, olay));
    if (error) throw error;
  } catch {
    // Olcum akisi asla engellemez.
  }
}

export async function bekleyenOnboardingOlaylariniGonder() {
  const olaylar = kuyrukOku();
  if (demoModu || !olaylar.length) return;
  try {
    const { data } = await supabase.auth.getUser();
    const userId = data?.user?.id;
    if (!userId) return;
    const { error } = await supabase.from("activity_logs").insert(olaylar.map((olay) => olaySatiri(userId, olay)));
    if (error) throw error;
    localStorage.removeItem(OLAY_KUYRUGU);
  } catch {
    // Bir sonraki acilista yeniden denenir.
  }
}

export async function girisAktivitesiKaydet(session) {
  if (demoModu || !session?.user?.id) return;
  const anahtar = `borcama:login-log:${session.user.id}:${session.expires_at || "session"}`;
  if (sessionStorage.getItem(anahtar)) return;
  sessionStorage.setItem(anahtar, "1");
  try {
    const { error } = await supabase.from("activity_logs").insert({
      user_id: session.user.id,
      event_type: "login",
      entity_type: "session",
      source: "auth",
      path: temizMetin(window.location.pathname, 120),
      metadata: {},
    });
    if (error) throw error;
  } catch {
    sessionStorage.removeItem(anahtar);
  }
}
