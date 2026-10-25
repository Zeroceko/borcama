// Ölçüm için yardımcılar. Supabase'e dokunmadığı için doğrudan test edilebilir.

// Otomasyon ve tarayıcı botları ziyaretçi sayısını şişirir (ör. 3 Ekim 2026
// gecesi tek saatte 201 "direct" oturum). Aynı desen analytics-event
// fonksiyonunda sunucu tarafında da uygulanır.
export const BOT_KULLANICI_AJANI =
  /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|gtmetrix|pingdom|uptime|monitor|preview|prerender|puppeteer|playwright|phantomjs|selenium|python-requests|curl|wget|httpclient|facebookexternalhit|embedly|quora link|whatsapp|telegrambot/i;

export function otomasyonTarayicisiMi(nav = typeof navigator === "undefined" ? null : navigator) {
  if (!nav) return false;
  if (nav.webdriver === true) return true;
  return BOT_KULLANICI_AJANI.test(String(nav.userAgent || ""));
}

// Yeni sekme, değiştirici tuş veya orta tıklama tarayıcıya bırakılır; mevcut
// sayfa kapanmadığı için olay zaten gönderilebilir.
export function ayniSekmeTiklamasiMi(olay, baglanti) {
  if (!olay || olay.defaultPrevented) return false;
  if (olay.button !== undefined && olay.button !== 0) return false;
  if (olay.metaKey || olay.ctrlKey || olay.shiftKey || olay.altKey) return false;
  const hedef = baglanti?.getAttribute?.("target");
  if (hedef && hedef !== "_self") return false;
  return Boolean(baglanti?.getAttribute?.("href"));
}

// Bağlantıya tıklanınca sayfa hemen değişir ve ölçüm isteği iptal olabilir.
// Olayı kaydedip en fazla `beklemeMs` kadar bekler, sonra yönlendirir.
export function olayiKaydedipGit(olay, baglanti, kaydet, { beklemeMs = 700, git } = {}) {
  if (!ayniSekmeTiklamasiMi(olay, baglanti)) {
    kaydet();
    return false;
  }
  olay.preventDefault();
  const href = baglanti.getAttribute("href");
  const yonlendir = git || ((adres) => window.location.assign(adres));
  let gitti = false;
  const birKez = () => {
    if (gitti) return;
    gitti = true;
    yonlendir(href);
  };
  Promise.resolve()
    .then(kaydet)
    .catch(() => false)
    .then(birKez);
  setTimeout(birKez, beklemeMs);
  return true;
}

// Sayfanın en az yarısı görüldü mü? Kısa sayfalarda ilk ekran yeterlidir.
export function sayfaYarisiGorulduMu({ scrollY = 0, innerHeight = 0, scrollHeight = 0 }) {
  if (!scrollHeight || !innerHeight) return false;
  return scrollY + innerHeight >= scrollHeight * 0.5;
}
