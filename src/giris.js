import { dilSozlugunuYukle, webOturumuVar, webUygulamaYoluMu } from "./i18n.js";
import { nativeMi } from "./platform.js";
import { ulkeTazeMi, ulkeyiGuncelle } from "./ulke.js";

// Uygulama girisi. Secili dil Turkce/Ingilizce disindaysa sozlugu, modul
// duzeyinde ceviri yapan dosyalar degerlendirilmeden once yuklenir; Turkce
// ve Ingilizcede hicbir sey indirilmez.
//
// Web: ziyaretci ulkesi (Pro satis karari, yeni kullanicinin para birimi)
// kayitli degilse ya da eskiyse yalniz uygulama ici ekranlarda sorulur ve en
// fazla ~1,5 sn beklenir ki ilk cizim dogru kararla yapilsin. Landing, SEO ve
// CRM sayfalari ulkeye ihtiyac duymaz; istek atilmaz. "/" oturum acmis
// kullaniciya uygulamayi gosterdiginden orada istek arka planda atilir.
function ulkeHazirligi() {
  const konum = globalThis.location;
  if (nativeMi || String(konum?.hostname || "").toLowerCase() === "crm.borcama.com" || ulkeTazeMi()) {
    return Promise.resolve();
  }
  const yol = konum?.pathname || "";
  if (webUygulamaYoluMu(yol)) return ulkeyiGuncelle();
  if (webUygulamaYoluMu(yol, { oturumVar: webOturumuVar() })) void ulkeyiGuncelle();
  return Promise.resolve();
}

Promise.allSettled([dilSozlugunuYukle(), ulkeHazirligi()]).finally(() => import("./main.jsx"));
