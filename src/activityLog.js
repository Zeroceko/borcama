import { temizMetin } from "./activityEvents.js";
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
