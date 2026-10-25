import { funnelEtkinligiKaydet } from "./funnelAnalytics.js";
import { olayiKaydedipGit, sayfaYarisiGorulduMu } from "./funnelNavigation.js";

// Landing'de kayda giden her bağlantı tıklamasını ve sayfanın yarısının
// görülmesini ölçer. Bağlantıları tek tek değiştirmek yerine kök elemana
// tek dinleyici eklenir; yeni CTA eklendiğinde ölçüm kendiliğinden kapsar.
export function landingOlcumunuBaslat(kok) {
  if (!kok || typeof window === "undefined") return () => {};

  const tiklama = (olay) => {
    const baglanti = olay.target?.closest?.('a[href^="/register"]');
    if (!baglanti || !kok.contains(baglanti)) return;
    olayiKaydedipGit(olay, baglanti, () => funnelEtkinligiKaydet("landing_cta_click"));
  };

  let yariGoruldu = false;
  const kaydirma = () => {
    if (yariGoruldu) return;
    if (!sayfaYarisiGorulduMu({
      scrollY: window.scrollY,
      innerHeight: window.innerHeight,
      scrollHeight: document.documentElement.scrollHeight,
    })) return;
    yariGoruldu = true;
    window.removeEventListener("scroll", kaydirma);
    funnelEtkinligiKaydet("landing_scroll_half");
  };

  kok.addEventListener("click", tiklama);
  window.addEventListener("scroll", kaydirma, { passive: true });
  return () => {
    kok.removeEventListener("click", tiklama);
    window.removeEventListener("scroll", kaydirma);
  };
}

