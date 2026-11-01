import React, { useState, useEffect, useRef, useCallback } from "react";
import { runAuthAttempt, recoveryErrorMessage } from "./authAttempt.js";
import { supabase, supabaseHazir } from "./supabaseClient.js";
import {
  Check,
  Info,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  LogOut,
  Mail,
  ShieldCheck,
  X,
} from "lucide-react";
import { proNiyetiniOku, proNiyetiniKaydet, proNiyetiniTemizle } from "./proIntent.js";
// Girisin sonunda iOS'ta webview bastan yuklenmez (acilis ekrani ve
// "yukleniyor" gorunmez); web'de tam gecis korunur (sayfa olcumu).
import { girisHazirBildir, karsilamayaDon, sayfaDegistir, uygulamaIciGit } from "./onboardingKoprusu.js";
import { panodanKoduDinle } from "./nativeSekmeCubugu.js";
import { GizlilikMetni, KullaniciSozlesmesi } from "./Legal.jsx";
import {
  googleAdsYeniKullaniciDonusumu,
  googleAnalyticsProDenemeBaslangici,
} from "./googleAds.js";
import { funnelEtkinligiKaydet, funnelOturumKimligi } from "./funnelAnalytics.js";
import { girisAktivitesiKaydet, onboardingOlayiKaydet } from "./activityLog.js";
import { davetKodunuYoldanOku, referansKodunuDogrula, referansKodunuTemizle } from "./referrals.js";
import { nativeMi, yenilemeYonergesi, ortamAdi } from "./platform.js";
import { epostaDonusAdresi } from "./nativeDerinBaglanti.js";
import { appleGirisiVarMi, appleHataMesaji, appleIleGirisYap } from "./appleGiris.js";
import { dil, t } from "./i18n.js";
import Ceviri from "./Ceviri.jsx";
import DilDugmesi from "./DilDugmesi.jsx";
import { proSatistaDegil } from "./proSatis.js";
import { oturumGecisi } from "./oturumOlaylari.js";
import { hesapZatenVardi, kodGecerli, kodHataAnahtari, kodTemizle } from "./authKod.js";
import { useKlavye, useSistemKoyu } from "./Onboarding.jsx";
import { webdeKoyuMu } from "./siteTema.js";
import "./onboardingAkis.css";
import { KabukLogosu } from "./MasaustuKabuk.jsx";
import { EPOSTA_DESENI, KOD_TEKRAR_SN, PAROLA_EN_AZ, PAROLA_SEVIYELERI, botMu, epostaGecerli, hataAlani, modYolu, parolaGucu } from "./girisKurallari.js";
import "./girisKabuk.css";

const denemeMailiTetiklenenKullanicilar = new Set();
// Basliklar noktayla biter (kurulum akisiyla ayni ton).
const noktali = (metin) => (/[.!?]$/.test(metin) ? metin : `${metin}.`);
const TURNSTILE_SCRIPT_ID = "borcama-turnstile-script";
const TURNSTILE_RECOVERY_TIMEOUT_MS = 25000;
let turnstileYuklemeSozu = null;

function turnstileYukle() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (turnstileYuklemeSozu) return turnstileYuklemeSozu;

  turnstileYuklemeSozu = new Promise((resolve, reject) => {
    let script = document.getElementById(TURNSTILE_SCRIPT_ID);
    if (script?.dataset.turnstileFailed === "1") {
      script.remove();
      script = null;
    }
    const yeniScript = !script;
    if (yeniScript) {
      script = document.createElement("script");
      script.id = TURNSTILE_SCRIPT_ID;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
    }

    const hazir = () => {
      if (window.turnstile) resolve(window.turnstile);
      else hata();
    };
    const hata = () => {
      script.dataset.turnstileFailed = "1";
      turnstileYuklemeSozu = null;
      reject(new Error("TURNSTILE_SCRIPT_FAILED"));
    };
    script.addEventListener("load", hazir, { once: true });
    script.addEventListener("error", hata, { once: true });
    if (yeniScript) document.head.appendChild(script);
    else if (window.turnstile) hazir();
  });

  return turnstileYuklemeSozu;
}

function turnstileYuklemesiniYenile() {
  if (window.turnstile) return;
  turnstileYuklemeSozu = null;
  const script = document.getElementById(TURNSTILE_SCRIPT_ID);
  if (script) script.dataset.turnstileFailed = "1";
}

function TurnstileWidget({ siteKey, onToken, onStatus, widgetKey, koyu = false }) {
  const ref = useRef(null);
  useEffect(() => {
    onToken('');
    onStatus('loading');
    let widget;
    let turnstileApi;
    let active = true;
    let watchdog = window.setTimeout(() => {
      if (active) {
        turnstileYuklemesiniYenile();
        onStatus('error:watchdog');
      }
    }, TURNSTILE_RECOVERY_TIMEOUT_MS);
    const kontrolTamamlandi = (status) => {
      window.clearTimeout(watchdog);
      if (active) onStatus(status);
    };
    const render = (api) => {
      if (!active || !ref.current) return;
      turnstileApi = api;
      ref.current.replaceChildren();
      widget = api.render(ref.current, {
        sitekey: siteKey,
        appearance: 'interaction-only',
        execution: 'render',
        theme: koyu ? 'dark' : 'light',
        language: dil(),
        size: 'flexible',
        retry: 'auto',
        'refresh-expired': 'auto',
        'refresh-timeout': 'auto',
        callback: (token) => {
          if (!active) return;
          onToken(token);
          kontrolTamamlandi('ready');
        },
        'before-interactive-callback': () => {
          window.clearTimeout(watchdog);
          if (active) onStatus('interactive');
        },
        'expired-callback': () => {
          if (!active) return;
          onToken('');
          onStatus('loading');
        },
        'error-callback': (errorCode) => {
          if (!active) return;
          onToken('');
          kontrolTamamlandi(`error:${String(errorCode || "unknown")}`);
          return true;
        },
        'timeout-callback': () => {
          if (!active) return;
          onToken('');
          kontrolTamamlandi('timeout');
        },
        'unsupported-callback': () => {
          if (!active) return;
          onToken('');
          kontrolTamamlandi('unsupported');
        },
      });
    };
    turnstileYukle()
      .then(render)
      .catch(() => kontrolTamamlandi('error:script'));
    return () => {
      active = false;
      window.clearTimeout(watchdog);
      if (widget !== undefined && turnstileApi) turnstileApi.remove(widget);
    };
  }, [siteKey, widgetKey, onToken, onStatus, koyu]);
  return <div ref={ref} className="oa-turnstile" />;
}

async function proDenemesiniVeBaslangicMailiniTetikle(session) {
  const userId = session?.user?.id;
  const token = session?.access_token;
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!userId || !token || !supabaseUrl || denemeMailiTetiklenenKullanicilar.has(userId)) return;

  denemeMailiTetiklenenKullanicilar.add(userId);
  try {
    const cevap = await fetch(`${supabaseUrl}/functions/v1/shopier-entitlement`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!cevap.ok) throw new Error("TRIAL_BOOTSTRAP_FAILED");
    const sonuc = await cevap.json().catch(() => ({}));
    if (!nativeMi && sonuc.trialActive && sonuc.trialStartedAt) {
      void googleAnalyticsProDenemeBaslangici({
        userId,
        trialStartedAt: sonuc.trialStartedAt,
        trialDaysRemaining: sonuc.trialDaysRemaining,
      });
    }
  } catch {
    // Bir sonraki oturum kontrolünde yeniden denenebilsin. Sunucu tarafındaki
    // teslimat kaydı aynı kullanıcıya ikinci e-posta gitmesini engeller.
    denemeMailiTetiklenenKullanicilar.delete(userId);
  }
}

// Yuzey: onboardingAkis.css (.oa-* siniflari); giris/kayit kurulum akisiyla
// ayni gorsel dunyada. Davranis (Supabase, Apple, Turnstile, referans kodu,
// sozlesme onayi) degismedi.

export function useSession() {
  const [session, setSession] = useState(undefined); // undefined = yükleniyor, null = oturum yok
  const oncekiOturum = useRef(undefined);

  useEffect(() => {
    // Yan etkiler yalnız gerçek girişte (oturumOlaylari.js, B14).
    const sessionAyarla = (yeniSession, event = null) => {
      const gecis = oturumGecisi(oncekiOturum.current, yeniSession, event);
      if (!gecis.guncelle) return;
      oncekiOturum.current = yeniSession;
      setSession(yeniSession);
      if (!gecis.yanEtki) return;
      if (!nativeMi) void googleAdsYeniKullaniciDonusumu(yeniSession.user);
      void proDenemesiniVeBaslangicMailiniTetikle(yeniSession);
      if (gecis.girisKaydi) void girisAktivitesiKaydet(yeniSession);
    };
    const oturumuYukle = async () => {
      if (
        localStorage.getItem("borcama_session_only") === "1" &&
        sessionStorage.getItem("borcama_session_active") !== "1"
      ) {
        localStorage.removeItem("borcama_session_only");
        await supabase.auth.signOut();
        setSession(null);
        return;
      }
      const { data } = await supabase.auth.getSession();
      sessionAyarla(data.session);
    };
    oturumuYukle();
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      sessionAyarla(session, event);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return session;
}

export function GirisEkrani({ redirectTo = "/summary", kayitModu: kayitBaslangic = false, preview = false }) {
  // Web'de giris ve kayit ayni ekranda sekmeyle degisir; uygulamada sayfa ayri.
  const [kayitModu, setKayitModu] = useState(kayitBaslangic);
  const sorgu = new URLSearchParams(window.location.search);
  const hamYonlendirme = sorgu.get("redirect");
  const sorguYonlendirmesi = hamYonlendirme?.startsWith("/") &&
    !hamYonlendirme.startsWith("//")
    ? hamYonlendirme
    : null;
  const ilkProPlani = proNiyetiniOku();
  // Native kabukta e-posta yonlendirmesi yalniz AASA'daki ve Supabase izin
  // listesindeki yollara gidebilir; /upgrade?plan=... ikisinde de yok, o yuzden
  // link uygulamaya donmez. Secilen plan zaten cihazda saklandigi icin Pro
  // ekrani acildiginda geri okunuyor. Tarayici davranisi degismiyor.
  // Web'de Pro satilmayan ulkede (proSatis.js) satin alma ekranina gidilmez.
  const proYonlendirmesi = !nativeMi && ilkProPlani && !proSatistaDegil()
    ? `/upgrade?plan=${ilkProPlani}`
    : null;
  const sonrakiSayfa = kayitModu
    ? sorguYonlendirmesi || "/summary"
    : sorguYonlendirmesi || proYonlendirmesi || redirectTo;
  // Giris ve kayit: Apple ya da e-postaya gelen 6 haneli kod. Parola yalniz
  // web'de mevcut parola hesaplari icin (?yontem=parola; eski form).
  const [yontem, setYontem] = useState(() => (!kayitModu && !nativeMi && sorgu.get("yontem") === "parola" ? "parola" : "kod"));
  const [tekrarZamani, setTekrarZamani] = useState(0);
  const [simdi, setSimdi] = useState(() => Date.now());
  const kokRef = useRef(null);
  useKlavye(kokRef);
  // Ilk kare boyandiktan sonra (iki rAF) native karsilama kaydirmaya baslar.
  useEffect(() => {
    let ikinci;
    const ilk = requestAnimationFrame(() => { ikinci = requestAnimationFrame(girisHazirBildir); });
    return () => { cancelAnimationFrame(ilk); cancelAnimationFrame(ikinci); };
  }, []);
  const [kodModu, setKodModu] = useState(false);
  const [hesapVardi, setHesapVardi] = useState(false);
  const [kod, setKod] = useState("");
  const [eposta, setEposta] = useState("");
  const [parola, setParola] = useState("");
  const [parolaGorunur, setParolaGorunur] = useState(false);
  const [oturumuAcikTut, setOturumuAcikTut] = useState(true);
  const [sozlesmeKabul, setSozlesmeKabul] = useState(false);
  const [aydinlatmaOkundu, setAydinlatmaOkundu] = useState(false);
  const [yasalMetin, setYasalMetin] = useState(null);
  const [sifirlamaModu, setSifirlamaModu] = useState(false);
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [gonderildi, setGonderildi] = useState(false);
  const [appleYukleniyor, setAppleYukleniyor] = useState(false);
  const [hata, setHata] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  // Web: kayitta istege bagli parola, alan alti hatalar ve bot tuzagi.
  const [kayitParolali, setKayitParolali] = useState(false);
  const [alanHata, setAlanHata] = useState({});
  const [tuzak, setTuzak] = useState("");
  // Dogrulanacak kodun turu: kodla giris/kayit "email", parolali kayit "signup".
  const [kodTuru, setKodTuru] = useState("email");
  // Kod gönderiminde ikinci istek için yeni Turnstile jetonu beklenir.
  const captchaBekleyen = useRef(null);
  // Kimligi sabit kalmali: TurnstileWidget'in effect'i onToken'a bagli;
  // her cizimde yeni fonksiyon widget'i surekli sifirlar ve jeton hic gelmez.
  const captchaJetonuGeldi = useCallback((jeton) => {
    setCaptchaToken(jeton);
    if (jeton && captchaBekleyen.current) {
      captchaBekleyen.current(jeton);
      captchaBekleyen.current = null;
    }
  }, []);
  // Kod ekranındaki bağlam: "hesapVar" (kayıtta var olan hesap),
  // "yeniHesap" (kayıtta yeni hesap), "girisYeniHesap" (girişte hesap yoktu).
  const [kodBaglami, setKodBaglami] = useState(null);
  // Girişte e-postanın hesabı yoksa aynı ekranda onaylar sorulur.
  const [girisHesapYok, setGirisHesapYok] = useState(false);
  const [captchaAttempt, setCaptchaAttempt] = useState(0);
  const [captchaDurumu, setCaptchaDurumu] = useState("loading");
  // "Kod gönder"e jeton gelmeden basıldı; jeton bekleniyor.
  const [captchaIsteniyor, setCaptchaIsteniyor] = useState(false);
  const captchaKutusu = useRef(null);
  // Uygulama surumunde referans kodu hic okunmuyor; alan gizli oldugu icin
  // kod bos kaliyor ve kayitla birlikte sunucuya gonderilmiyor.
  const ilkReferansKodu = kayitBaslangic && !nativeMi ? davetKodunuYoldanOku("", window.location.search) : "";
  const [referansKodu, setReferansKodu] = useState(ilkReferansKodu);
  const [referansDurumu, setReferansDurumu] = useState(ilkReferansKodu ? "checking" : "idle");
  const [referansAcik, setReferansAcik] = useState(Boolean(ilkReferansKodu));
  const turnstileSiteKey = preview && import.meta.env.DEV ? "" : import.meta.env.VITE_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (kayitModu && !preview) funnelEtkinligiKaydet("register_view");
  }, [kayitModu]);

  // Sekme degisince adres de degisir (yenileme ayni sekmede acar); form
  // durumu ve hatalar sifirlanir, yazilan e-posta korunur.
  function modDegistir(kayit) {
    if (kayit === kayitModu) return;
    setKayitModu(kayit);
    setYontem("kod");
    setKayitParolali(false);
    setParola("");
    setHata("");
    setAlanHata({});
    setGirisHesapYok(false);
    window.history.replaceState(window.history.state, "", modYolu(kayit, window.location.search));
  }

  // Web'de hata ilgili alanin altinda; uygulamada ve alansiz hatalarda tek satir.
  function alanHatasi(alan, mesaj) {
    if (!nativeMi && alan) setAlanHata({ [alan]: mesaj });
    else setHata(mesaj);
  }

  // Turnstile jetonu yoksa uretilmesi beklenir (etkilesim isterse kutu gorunur).
  async function jetonuHazirla() {
    if (!turnstileSiteKey || captchaToken) return captchaToken;
    setCaptchaIsteniyor(true);
    try {
      return await yeniCaptchaJetonu(90000);
    } finally {
      setCaptchaIsteniyor(false);
    }
  }

  function kodEkraninaGec(tur) {
    setKodTuru(tur);
    setKod("");
    setKodModu(true);
    setTekrarZamani(Date.now() + KOD_TEKRAR_SN * 1000);
    setSimdi(Date.now());
  }

  function kayitVerisi(yontem) {
    const kayitZamani = new Date().toISOString();
    return {
      terms_version: "1.0",
      terms_accepted_at: kayitZamani,
      privacy_version: "1.0",
      privacy_notice_read_at: kayitZamani,
      borcama_registration_created_at: kayitZamani,
      borcama_registration_method: yontem,
      borcama_registration_event_id: crypto.randomUUID(),
      funnel_session_id: funnelOturumKimligi(),
      referral_code: referansKodu || undefined,
    };
  }

  useEffect(() => {
    if (ilkProPlani) proNiyetiniKaydet(ilkProPlani);
  }, [ilkProPlani]);

  useEffect(() => {
    if (!kayitModu || !referansKodu) return undefined;
    let active = true;
    const timer = window.setTimeout(async () => {
      setReferansDurumu("checking");
      try {
        const result = await referansKodunuDogrula(referansKodu);
        if (active) setReferansDurumu(result.valid ? "valid" : "invalid");
      } catch {
        if (active) setReferansDurumu("unknown");
      }
    }, 350);
    return () => { active = false; window.clearTimeout(timer); };
  }, [kayitModu, referansKodu]);

  useEffect(() => {
    if (!yasalMetin) return undefined;
    const oncekiTasima = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const escIleKapat = (event) => {
      if (event.key === "Escape") setYasalMetin(null);
    };
    window.addEventListener("keydown", escIleKapat);
    return () => {
      document.body.style.overflow = oncekiTasima;
      window.removeEventListener("keydown", escIleKapat);
    };
  }, [yasalMetin]);

  // Kontrol kutusu etkileşim isteyince görünür alana alınır. Klavye açıkken
  // alttaki düğme kutunun üstüne biniyordu; kutu belirince klavye kapanır.
  useEffect(() => {
    if (captchaDurumu !== "interactive" && !captchaIsteniyor) return;
    if (captchaDurumu === "interactive") document.activeElement?.blur?.();
    captchaKutusu.current?.scrollIntoView?.({ block: "center", behavior: "smooth" });
  }, [captchaDurumu, captchaIsteniyor]);

  // Kod ekraninda 60 sn tekrar gonderme sayaci.
  useEffect(() => {
    if (!kodModu || tekrarZamani <= Date.now()) return undefined;
    const zamanlayici = window.setInterval(() => setSimdi(Date.now()), 1000);
    return () => window.clearInterval(zamanlayici);
  }, [kodModu, tekrarZamani]);

  // iOS kodu yalniz Mesajlar ve Mail'den onerebiliyor. Gmail gibi bir
  // uygulamadan kopyalanip donulunce native panodaki 6 haneli kodu gonderir;
  // kutular dolar ve dogrulama baslar.
  const koduDogrulaSon = useRef(null);
  koduDogrulaSon.current = koduDogrula;
  useEffect(() => {
    if (!kodModu) return undefined;
    return panodanKoduDinle((gelen) => {
      const temiz = kodTemizle(gelen);
      if (!kodGecerli(temiz)) return;
      setKod(temiz);
      setHata("");
      koduDogrulaSon.current?.(null, temiz);
    });
  }, [kodModu]);

  function authIstegiYap(request) {
    return runAuthAttempt(request, () => {
      setCaptchaToken("");
      setCaptchaDurumu("loading");
      setCaptchaAttempt((x) => x + 1);
      setGonderiliyor(false);
    });
  }

  function captchaAlani(widgetKey) {
    if (!turnstileSiteKey) return null;
    const hataKodu = captchaDurumu.startsWith("error:")
      ? captchaDurumu.slice("error:".length)
      : "";
    const tekrarGerekli = Boolean(hataKodu) || captchaDurumu === "timeout" || captchaDurumu === "unsupported";
    const engellenmis = hataKodu === "200500" || hataKodu === "script";
    const yapilandirmaHatasi = ["110100", "110110", "110200", "400020", "400021", "400070"].includes(hataKodu);
    return (
      <div ref={captchaKutusu} className={captchaDurumu === "interactive" ? "oa-captcha-etkin" : undefined}>
        {captchaDurumu === "interactive" && <p className="oa-ipucu oa-captcha-ipucu">{t("auth.captcha.isaretle")}</p>}
        <TurnstileWidget
          siteKey={turnstileSiteKey}
          widgetKey={`${widgetKey}-${captchaAttempt}`}
          onToken={captchaJetonuGeldi}
          onStatus={setCaptchaDurumu}
          koyu={koyu}
        />
        {tekrarGerekli && (
          <div className="oa-captcha" role="alert">
            <span>
              {yapilandirmaHatasi
                ? t("auth.captcha.yapilandirma")
                : engellenmis
                  ? t("auth.captcha.engellendi")
                  : captchaDurumu === "unsupported"
                    ? t("auth.captcha.desteklenmiyor")
                    : t("auth.captcha.tamamlanamadi")}
            </span>
            <button
              type="button"
              onClick={() => {
                if (["script", "watchdog"].includes(hataKodu)) {
                  turnstileYuklemesiniYenile();
                }
                setCaptchaToken("");
                setCaptchaDurumu("loading");
                setCaptchaAttempt((x) => x + 1);
              }}
            >
              {t("auth.captcha.yenidenDene")}
            </button>
          </div>
        )}
      </div>
    );
  }

  // Önceki istek jetonu tükettikten sonra Turnstile yenisini üretir; Turnstile
  // yoksa (yerel geliştirme) jeton gerekmez.
  function yeniCaptchaJetonu(sure = 20000) {
    if (!turnstileSiteKey) return Promise.resolve("");
    return new Promise((coz, reddet) => {
      const zamanAsimi = window.setTimeout(() => { captchaBekleyen.current = null; reddet(new Error("captcha")); }, sure);
      captchaBekleyen.current = (jeton) => { window.clearTimeout(zamanAsimi); coz(jeton); };
    });
  }

  const hesapYokHatasi = (error) => Boolean(error) && (error.code === "otp_disabled" || /signups? not allowed/i.test(error.message || ""));

  // Tek kullanimlik kod: e-postaya hem kod hem baglanti gider (auth-email
  // hook'u). Hesap yalnız onaylar işaretliyken ve yeni hesap gerekiyorsa
  // açılır. Kayıtta önce var olan hesaba kod istenir; hesap yoksa yeni hesap
  // kodu gönderilir. Girişte hesap yoksa aynı ekranda onaylar sorulur.
  async function kodGonder(e) {
    e?.preventDefault?.();
    if (!eposta.trim()) return;
    setAlanHata({});
    if (!nativeMi && !epostaGecerli(eposta)) return alanHatasi("eposta", t("auth.web.hata.eposta"));
    const yeniHesapIzni = kayitModu || girisHesapYok;
    if (yeniHesapIzni && (!sozlesmeKabul || !aydinlatmaOkundu))
      return setHata(t("auth.hata.sozlesme"));
    // Tuzak alani doluysa (bot) istek atilmaz; ekran olagan akisi taklit eder.
    if (botMu(tuzak)) return kodEkraninaGec("email");
    // Tasarim onizlemesinde (Supabase yok) kod ekrani gosterilir, e-posta gitmez.
    if (preview && import.meta.env.DEV) { setKodBaglami(kayitModu ? "yeniHesap" : girisHesapYok ? "girisYeniHesap" : null); kodEkraninaGec("email"); return; }
    if (!supabaseHazir) return setHata(t("auth.hata.onizlemeEposta"));
    setGonderiliyor(true);
    setHata("");
    if (yeniHesapIzni) await funnelEtkinligiKaydet("register_view");
    const yeniHesapVerisi = yeniHesapIzni ? kayitVerisi("email_otp") : undefined;
    const kodIste = (olustur, jeton) => authIstegiYap(() => supabase.auth.signInWithOtp({
      email: eposta.trim(),
      options: {
        emailRedirectTo: epostaDonusAdresi(sonrakiSayfa),
        captchaToken: jeton || undefined,
        shouldCreateUser: olustur,
        data: olustur ? yeniHesapVerisi : undefined,
      },
    }));
    let baglam = null;
    // Düğme jetonu beklemez: jeton henüz yoksa burada beklenir. Kontrol
    // etkileşim isterse kutu görünür kılınır ve işaretlenince kod gider.
    let jeton = captchaToken;
    if (turnstileSiteKey && !jeton) {
      setCaptchaIsteniyor(true);
      try {
        jeton = await yeniCaptchaJetonu(90000);
      } catch {
        setCaptchaIsteniyor(false);
        setGonderiliyor(false);
        setHata(t("auth.captcha.tamamlanamadi"));
        return;
      }
      setCaptchaIsteniyor(false);
    }
    let { error } = await kodIste(girisHesapYok, jeton);
    if (girisHesapYok) {
      baglam = "girisYeniHesap";
    } else if (!error) {
      baglam = kayitModu ? "hesapVar" : null;
    } else if (kayitModu && hesapYokHatasi(error)) {
      // Kayıt: hesap yok; yeni jetonla hesap açan kod gönderilir.
      setGonderiliyor(true);
      try {
        const jeton = await yeniCaptchaJetonu();
        ({ error } = await kodIste(true, jeton));
        baglam = "yeniHesap";
      } catch {
        error = { status: 0, message: "captcha" };
      }
    }
    setGonderiliyor(false);
    if (error) {
      if (!kayitModu && !girisHesapYok && hesapYokHatasi(error)) {
        // Giriş: bu e-postayla hesap yok; onaylar işaretlenince kod gönderilir.
        setGirisHesapYok(true);
        return;
      }
      setHata(
        error.status === 429
          ? t("auth.hata.cokDenemeTekrar")
          : yeniHesapIzni
            ? t("auth.hata.kodGonderilemedi")
            : t("auth.hata.kodGirisHesapYok"),
      );
      return;
    }
    void onboardingOlayiKaydet("auth_kod_gonderildi", {});
    setKodBaglami(baglam);
    kodEkraninaGec("email");
  }

  // Web: parola belirleyerek kayit. Supabase dogrulama kodunu ("signup")
  // e-postaya gonderir; hesap kod girilince acilir. Adres kayitliysa yanit
  // ayni kalir (Supabase e-posta yoklamaya izin vermez).
  async function parolaylaKayit(e) {
    e?.preventDefault?.();
    if (!eposta.trim() || gonderiliyor) return;
    setAlanHata({});
    setHata("");
    if (!epostaGecerli(eposta)) return alanHatasi("eposta", t("auth.web.hata.eposta"));
    if (parola.length < PAROLA_EN_AZ) return alanHatasi("parola", t("auth.web.hata.parolaKisa"));
    if (!sozlesmeKabul || !aydinlatmaOkundu) return setHata(t("auth.hata.sozlesme"));
    if (botMu(tuzak) || (preview && import.meta.env.DEV)) { setKodBaglami("yeniHesap"); return kodEkraninaGec("signup"); }
    if (!supabaseHazir) return setHata(t("auth.hata.onizlemeEposta"));
    setGonderiliyor(true);
    await funnelEtkinligiKaydet("register_view");
    let jeton;
    try {
      jeton = await jetonuHazirla();
    } catch {
      setGonderiliyor(false);
      return setHata(t("auth.captcha.tamamlanamadi"));
    }
    const { data, error } = await authIstegiYap(() => supabase.auth.signUp({
      email: eposta.trim(),
      password: parola,
      options: {
        emailRedirectTo: epostaDonusAdresi(sonrakiSayfa),
        captchaToken: jeton || undefined,
        data: kayitVerisi("email_password"),
      },
    }));
    if (error) {
      if (error.code === "weak_password") return alanHatasi("parola", t("auth.yenile.zayif"));
      if (error.code === "email_address_invalid") return alanHatasi("eposta", t("auth.web.hata.eposta"));
      return setHata(error.status === 429 ? t("auth.hata.cokDenemeTekrar") : t("auth.hata.kodGonderilemedi"));
    }
    // E-posta dogrulamasi kapaliysa oturum hemen gelir.
    if (data?.session) {
      oturumKalicilginiYaz();
      proNiyetiniTemizle();
      return uygulamaIciGit(sonrakiSayfa);
    }
    void onboardingOlayiKaydet("auth_kod_gonderildi", {});
    setKodBaglami("yeniHesap");
    kodEkraninaGec("signup");
  }

  async function koduTekrarGonder() {
    if (kodTuru !== "signup") return kodGonder();
    if (botMu(tuzak)) return kodEkraninaGec("signup");
    setGonderiliyor(true);
    setHata("");
    setAlanHata({});
    let jeton;
    try {
      jeton = await jetonuHazirla();
    } catch {
      setGonderiliyor(false);
      return setHata(t("auth.captcha.tamamlanamadi"));
    }
    const { error } = await authIstegiYap(() => supabase.auth.resend({
      type: "signup",
      email: eposta.trim(),
      options: { emailRedirectTo: epostaDonusAdresi(sonrakiSayfa), captchaToken: jeton || undefined },
    }));
    if (error) return setHata(error.status === 429 ? t("auth.hata.cokDenemeTekrar") : t("auth.hata.kodGonderilemedi"));
    setTekrarZamani(Date.now() + KOD_TEKRAR_SN * 1000);
    setSimdi(Date.now());
  }

  function oturumKalicilginiYaz() {
    if (oturumuAcikTut) {
      localStorage.removeItem("borcama_session_only");
      sessionStorage.removeItem("borcama_session_active");
    } else {
      localStorage.setItem("borcama_session_only", "1");
      sessionStorage.setItem("borcama_session_active", "1");
    }
  }

  async function koduDogrula(e, deger = kod) {
    e?.preventDefault?.();
    if (!kodGecerli(deger) || gonderiliyor) return;
    if (preview && import.meta.env.DEV) { setHata(t("auth.hata.onizleme")); return; }
    setGonderiliyor(true);
    setHata("");
    setAlanHata({});
    const { data, error } = await authIstegiYap(() => supabase.auth.verifyOtp({
      email: eposta.trim(),
      token: kodTemizle(deger),
      type: kodTuru,
    }));
    if (error) {
      setGonderiliyor(false);
      const anahtar = kodHataAnahtari(error);
      alanHatasi(anahtar === "auth.hata.kodYanlis" ? "kod" : null, t(anahtar));
      return;
    }
    void onboardingOlayiKaydet("auth_kod_dogrulandi", {});
    oturumKalicilginiYaz();
    if (kayitModu) proNiyetiniTemizle();
    // Kayıt ekranından var olan hesaba girildiyse önce söylenir (B12).
    if (kayitModu && kodBaglami !== "hesapVar" && hesapZatenVardi(data?.user)) {
      setGonderiliyor(false);
      setHesapVardi(true);
      return;
    }
    uygulamaIciGit(sonrakiSayfa);
  }

  // "Hesabın vardı" bilgisi 4 sn görünür, sonra kendiliğinden devam eder.
  useEffect(() => {
    if (!hesapVardi) return undefined;
    const zamanlayici = window.setTimeout(() => { uygulamaIciGit(sonrakiSayfa); }, 4000);
    return () => window.clearTimeout(zamanlayici);
  }, [hesapVardi]);

  async function parolaylaGiris(e) {
    e.preventDefault();
    if (!eposta.trim() || !parola) return;
    setAlanHata({});
    if (!nativeMi && !epostaGecerli(eposta)) return alanHatasi("eposta", t("auth.web.hata.eposta"));
    // Bot: istek atilmaz, olagan "bilgiler yanlis" yaniti gosterilir.
    if (botMu(tuzak)) return alanHatasi("parola", t("auth.hata.bilgilerYanlis"));
    setGonderiliyor(true);
    setHata("");
    const { error } = await authIstegiYap(() => supabase.auth.signInWithPassword({
      email: eposta.trim(),
      password: parola,
      options: { captchaToken: captchaToken || undefined },
    }));
    if (error) {
      const kod = error.code || "";
      if (error.status === 429 || kod === "over_request_rate_limit")
        setHata(t("auth.hata.cokDeneme"));
      else if (["captcha_failed", "captcha_provider_disabled"].includes(kod))
        setHata(t("auth.hata.captcha", { yenileme: yenilemeYonergesi }));
      else if (kod === "email_not_confirmed")
        alanHatasi(hataAlani(error), t("auth.hata.epostaDogrulanmamis"));
      else if (kod === "user_banned")
        setHata(t("auth.hata.hesapDurduruldu"));
      else if (kod === "invalid_credentials")
        alanHatasi(hataAlani(error), t("auth.hata.bilgilerYanlis"));
      else
        setHata(
          kod
            ? t("auth.hata.girisTamamlanamadiKod", { kod })
            : t("auth.hata.girisTamamlanamadi"),
        );
    } else {
      oturumKalicilginiYaz();
      uygulamaIciGit(sonrakiSayfa);
    }
  }

  async function sifirlamaLinkiGonder(e) {
    e.preventDefault();
    if (!eposta.trim()) return;
    if (!supabaseHazir) {
      setHata(t("auth.hata.onizlemeEposta"));
      return;
    }
    setGonderiliyor(true);
    setHata("");
    const { error } = await authIstegiYap(() => supabase.auth.resetPasswordForEmail(eposta.trim(), {
      redirectTo: epostaDonusAdresi("/reset-password"),
      captchaToken: captchaToken || undefined,
    }));
    if (error)
      setHata(recoveryErrorMessage(error));
    else setGonderildi(true);
  }

  async function appleIleGiris() {
    if (appleYukleniyor) return;
    setAppleYukleniyor(true);
    setHata("");
    try {
      const girildi = await appleIleGirisYap();
      if (!girildi) return;
      oturumKalicilginiYaz();
      uygulamaIciGit(sonrakiSayfa);
    } catch (appleHatasi) {
      // Kullanici Apple ekranini kapatirsa mesaj bos doner; hata gostermiyoruz.
      const mesaj = appleHataMesaji(appleHatasi);
      if (mesaj) setHata(mesaj);
    } finally {
      setAppleYukleniyor(false);
    }
  }

  function yontemDegistir(yeni) {
    setYontem(yeni);
    setHata("");
    setAlanHata({});
    setGonderildi(false);
    setKodModu(false);
  }

  const koyu = webdeKoyuMu({ native: nativeMi, sistemKoyu: useSistemKoyu() });
  const formId = "auth-form";
  const captchaBekliyor = Boolean(turnstileSiteKey && !captchaToken);
  const ustSag = <DilDugmesi className="oa-cip kucuk oa-ust-sag" kisa />;
  // iOS'ta giriş ↔ kayıt geçişi sayfa yenilemeden (açılış ekranı görünmez).
  const nativeGecis = (e) => {
    if (!nativeMi) return;
    e.preventDefault();
    const hedef = e.currentTarget.getAttribute("href");
    sayfaDegistir(hedef);
  };
  // Native kabukta ana sayfa yok; geri dugmesi karsilama ekranina doner
  // (web'de logo ana sayfaya doner).
  const geriDugmesi = (
    <a className="oa-geri" href="/summary" onClick={(e) => { e.preventDefault(); proNiyetiniTemizle(); karsilamayaDon(); }} aria-label={t("auth.geri")}>
      <ChevronLeft size={20} strokeWidth={2.2} />
    </a>
  );
  // Satirin tamami dokunulabilir; kutu gercek bir onay dugmesi (klavye),
  // metindeki sozlesme baglantilari ayri dugme kaldigi icin satir <div>.
  const onayKutusu = (id, secili, degistir, icerik) => (
    <div className={`oa-onay${secili ? " secili" : ""}`} onClick={() => degistir(!secili)}>
      <button className="oa-kutu" type="button" role="checkbox" aria-checked={secili} aria-labelledby={id} onClick={(e) => { e.stopPropagation(); degistir(!secili); }}>
        <Check size={13} strokeWidth={3.5} aria-hidden="true" />
      </button>
      <span id={id}>{icerik}</span>
    </div>
  );
  // Alan alti hata (yalniz web'de dolar): halka + metin, aria-invalid.
  const alanAltHata = (alan, id) => alanHata[alan] && <p className="oa-hata gk-alan-hata" id={id}>{alanHata[alan]}</p>;
  const alanIsaretleri = (alan, id) => (alanHata[alan] ? { "aria-invalid": true, "aria-describedby": id } : {});
  const epostaAlani = (
    <>
      <label className={`oa-alan${alanHata.eposta ? " hatali" : ""}`}>
        <span className="oa-mono-etiket">{t("auth.eposta")}</span>
        <input
          id="auth-email"
          autoComplete="email"
          type="email"
          inputMode="email"
          placeholder={t("auth.epostaOrnek")}
          value={eposta}
          onChange={(e) => {
            setEposta(e.target.value);
            if (girisHesapYok) setGirisHesapYok(false);
            if (alanHata.eposta) setAlanHata({});
          }}
          autoFocus={!nativeMi}
          required
          {...alanIsaretleri("eposta", "auth-email-hata")}
        />
      </label>
      {alanAltHata("eposta", "auth-email-hata")}
    </>
  );
  const parolaAlani = (id, etiket, yerTutucu, deger, degistir, otomatik, ekstra = {}) => (
    <>
    <label className={`oa-alan${alanHata.parola ? " hatali" : ""}`}>
      <span className="oa-mono-etiket">{etiket}</span>
      <span className="satir">
        <input
          id={id}
          autoComplete={otomatik}
          type={parolaGorunur ? "text" : "password"}
          placeholder={yerTutucu}
          value={deger}
          onChange={(e) => { degistir(e.target.value); if (alanHata.parola) setAlanHata({}); }}
          required
          {...alanIsaretleri("parola", `${id}-hata`)}
          {...ekstra}
        />
        <button
          className="oa-goz"
          type="button"
          aria-label={parolaGorunur ? t("auth.parola.gizle") : t("auth.parola.goster")}
          onClick={() => setParolaGorunur(!parolaGorunur)}
        >
          {parolaGorunur ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </span>
    </label>
    {alanAltHata("parola", `${id}-hata`)}
    </>
  );
  // Gorunmez tuzak alani: insanlar gormez ve odaklanmaz, botlar doldurur.
  const tuzakAlani = (
    <div className="gk-tuzak" aria-hidden="true">
      <label>
        Web sitesi
        <input type="text" name="website" tabIndex={-1} autoComplete="off" value={tuzak} onChange={(e) => setTuzak(e.target.value)} />
      </label>
    </div>
  );

  let govde;
  let alt;
  if (hesapVardi) {
    govde = (
      <>
        <span className="oa-mono-etiket">{t("auth.kod.etiket")}</span>
        <div className="oa-bilgi" role="status">
          <span className="ikon" aria-hidden="true"><Check size={16} strokeWidth={2.2} /></span>
          <span><b>{t("auth.kayit.hesapVardi")}</b></span>
        </div>
      </>
    );
    alt = (
      <button className="oa-dugme" type="button" onClick={() => { uygulamaIciGit(sonrakiSayfa); }}>
        {t("auth.kayit.hesapVardiDevam")}
      </button>
    );
  } else if (kodModu) {
    const kodTamam = kodGecerli(kod);
    const kalan = Math.max(0, Math.ceil((tekrarZamani - simdi) / 1000));
    const sure = `${Math.floor(kalan / 60)}:${String(kalan % 60).padStart(2, "0")}`;
    govde = (
      <>
        <span className="oa-mono-etiket">{t("auth.kod.etiket")}</span>
        <h1 className="oa-baslik">{t("auth.kod.baslik")}</h1>
        {kodBaglami && (
          <div className="oa-bilgi" role="status">
            <span className="ikon" aria-hidden="true"><Check size={16} strokeWidth={2.2} /></span>
            <span><b>{t(`auth.kod.baglam.${kodBaglami}`)}</b></span>
          </div>
        )}
        <p className="oa-aciklama">
          <Ceviri anahtar="auth.kod.aciklama" degerler={{ eposta: <mark>{eposta}</mark> }} />
        </p>
        <form id={formId} onSubmit={koduDogrula}>
          {nativeMi ? (
            <KodKutulari
              deger={kod}
              hatali={Boolean(hata)}
              onChange={(yeni) => { setKod(yeni); if (hata) setHata(""); }}
              onTamam={(tam) => koduDogrula(null, tam)}
            />
          ) : (
            <KodAlani
              deger={kod}
              hata={alanHata.kod}
              onChange={(yeni) => { setKod(yeni); if (alanHata.kod) setAlanHata({}); if (hata) setHata(""); }}
              onTamam={(tam) => koduDogrula(null, tam)}
            />
          )}
        </form>
        {hata && (nativeMi ? <p className="oa-hata" role="alert">{hata}</p> : <div className="gk-hata-kutu" role="alert">{hata}</div>)}
        {nativeMi ? (
          <div className="oa-satir-ara">
            <span>{t("auth.kod.gelmedi")}</span>
            <button className="oa-baglanti" type="button" disabled={gonderiliyor || kalan > 0} onClick={() => kodGonder()}>
              {kalan > 0 ? t("auth.kod.tekrarSure", { sure }) : t("auth.kod.tekrar")}
            </button>
          </div>
        ) : (
          <div className="gk-kod-satir">
            <button className="oa-baglanti" type="button" disabled={gonderiliyor || kalan > 0} onClick={koduTekrarGonder}>
              {kalan > 0 ? t("auth.web.kod.tekrarSayac", { sn: kalan }) : t("auth.web.kod.tekrar")}
            </button>
            <button className="oa-baglanti" type="button" onClick={() => { setKodModu(false); setKod(""); setHata(""); setAlanHata({}); }}>
              {t("auth.web.kod.baskaEposta")}
            </button>
          </div>
        )}
        {!nativeMi && kodTuru === "signup" && <p className="oa-ipucu">{t("auth.web.kod.hesapVarIpucu")}</p>}
        {captchaAlani(`code-${kayitModu}`)}
      </>
    );
    alt = (
      <>
        <button className="oa-dugme" type="submit" form={formId} disabled={gonderiliyor || !kodTamam}>
          {gonderiliyor ? t("auth.kod.dogrulaniyor") : t("auth.kod.devam")}
        </button>
        {nativeMi && (
          <p className="oa-gecis">
            {t("auth.kod.yanlisAdres")}{" "}
            <button className="oa-baglanti" type="button" onClick={() => { setKodModu(false); setKod(""); setHata(""); }}>
              {t("auth.kod.degistir")}
            </button>
          </p>
        )}
      </>
    );
  } else if (gonderildi) {
    const tekrarGonder = sifirlamaModu ? sifirlamaLinkiGonder : null;
    govde = (
      <div className="oa-posta">
        <span className="rozet" aria-hidden="true"><Mail size={30} strokeWidth={2.2} /></span>
        <span className="oa-mono-etiket">
          {sifirlamaModu ? t("auth.gonderildi.sifirlama") : kayitModu ? t("auth.gonderildi.kayit") : t("auth.gonderildi.link")}
        </span>
        <h1 className="oa-baslik">{noktali(t("auth.gonderildi.kayit"))}</h1>
        <p className="oa-aciklama">
          <Ceviri
            anahtar={
              sifirlamaModu
                ? "auth.gonderildi.sifirlamaMetni"
                : kayitModu
                  ? "auth.gonderildi.kayitMetni"
                  : "auth.gonderildi.linkMetni"
            }
            degerler={{ eposta: <mark>{eposta}</mark> }}
          />
        </p>
      </div>
    );
    alt = (
      <>
        <button
          className="oa-dugme"
          type="button"
          onClick={() => {
            setGonderildi(false);
            setSifirlamaModu(false);
            setHata("");
            if (kayitModu) uygulamaIciGit("/login");
          }}
        >
          {t("auth.girisEkraninaDon")}
        </button>
        {tekrarGonder && (
          <p className="oa-gecis">
            {t("auth.gonderildi.gelmedi")}{" "}
            <button className="oa-baglanti" type="button" disabled={gonderiliyor} onClick={() => tekrarGonder({ preventDefault() {} })}>
              {t("auth.gonderildi.tekrar")}
            </button>
          </p>
        )}
      </>
    );
  } else if (sifirlamaModu) {
    govde = (
      <>
        <span className="oa-mono-etiket">{t("auth.parolamiUnuttum")}</span>
        <h1 className="oa-baslik">{t("auth.parolamiUnuttum")}</h1>
        <p className="oa-aciklama">{t("auth.sifirlama.yardim")}</p>
        <form id={formId} className="oa-form" onSubmit={sifirlamaLinkiGonder}>
          {epostaAlani}
        </form>
        {hata && <p className="oa-hata" role="alert">{hata}</p>}
        {captchaAlani(`reset-${sifirlamaModu}`)}
      </>
    );
    alt = (
      <>
        <button className="oa-dugme" type="submit" form={formId} disabled={gonderiliyor || captchaBekliyor}>
          {gonderiliyor ? t("auth.gonderiliyor") : t("auth.sifirlama.gonder")}
        </button>
        <p className="oa-gecis">
          <button
            className="oa-baglanti"
            type="button"
            onClick={() => {
              setSifirlamaModu(false);
              setHata("");
            }}
          >
            {t("auth.girisEkraninaDon")}
          </button>
        </p>
      </>
    );
  } else if (!nativeMi) {
    // Web: sekmeli giris/kayit. Kayitta varsayilan sifresiz kod, istege bagli
    // parola. Giriste varsayilan kod (hesaplarin cogunun parolasi yok);
    // parolasi olan "Sifreyle gir"e gecer.
    const parolali = kayitModu ? kayitParolali : yontem === "parola";
    const onSubmit = preview && import.meta.env.DEV && parolali && !kayitModu
      ? (event) => { event.preventDefault(); setHata(t("auth.hata.onizleme")); }
      : !parolali ? kodGonder : kayitModu ? parolaylaKayit : parolaylaGiris;
    const guc = parolaGucu(parola);
    const yeniHesapOnayi = kayitModu || girisHesapYok;
    govde = (
      <>
        <h1 className="gk-baslik">{t(kayitModu ? "auth.web.kayit.baslik" : "auth.web.giris.baslik")}</h1>
        <p className="gk-alt-satir">{t(kayitModu ? "auth.web.kayit.alt" : "auth.web.giris.alt")}</p>
        <ModSekmeleri kayit={kayitModu} degistir={modDegistir} />
        <div role="tabpanel" id="gk-panel" aria-labelledby={kayitModu ? "gk-sekme-kayit" : "gk-sekme-giris"}>
          <form id={formId} className="oa-form" onSubmit={onSubmit} noValidate>
            {epostaAlani}
            {parolali && parolaAlani(
              "auth-password",
              t("auth.web.parola.etiket"),
              kayitModu ? t("auth.web.parola.yeni") : t("auth.web.parola.giris"),
              parola,
              setParola,
              kayitModu ? "new-password" : "current-password",
              kayitModu ? { minLength: PAROLA_EN_AZ } : {},
            )}
            {kayitModu && parolali && guc > 0 && <ParolaGucu seviye={guc} />}
            {tuzakAlani}
          </form>
          {hata && <div className="gk-hata-kutu" role="alert">{hata}</div>}
          {kayitModu && (
            <div className="oa-referans">
              <button
                className="oa-ek"
                type="button"
                aria-expanded={referansAcik}
                aria-controls="referans-kodu-alani"
                onClick={() => setReferansAcik((acik) => !acik)}
              >
                <span>
                  <span>{t("auth.referans.soru")}</span>
                  <small>{!referansAcik && referansKodu ? t("auth.referans.eklendi") : t("auth.referans.altSatir")}</small>
                </span>
                <ChevronRight size={16} aria-hidden="true" style={referansAcik ? { transform: "rotate(90deg)" } : undefined} />
              </button>
              {referansAcik && (
                <label className="oa-alan" id="referans-kodu-alani">
                  <span className="oa-mono-etiket">{t("auth.referans.baslik")} {t("auth.referans.istegeBagli")}</span>
                  <input
                    className="oa-mono"
                    type="text"
                    inputMode="text"
                    autoComplete="off"
                    placeholder={t("auth.referans.ornek")}
                    value={referansKodu}
                    onChange={(event) => {
                      const value = referansKodunuTemizle(event.target.value);
                      setReferansKodu(value);
                      setReferansDurumu(value ? "checking" : "idle");
                    }}
                    aria-describedby="referans-kodu-durumu"
                  />
                  <small id="referans-kodu-durumu" className={referansDurumu}>
                    {referansDurumu === "checking" ? t("auth.referans.kontrol") : referansDurumu === "valid" ? t("auth.referans.gecerli") : referansDurumu === "invalid" ? t("auth.referans.gecersiz") : referansDurumu === "unknown" ? t("auth.referans.bilinmiyor") : t("auth.referans.bos")}
                  </small>
                </label>
              )}
            </div>
          )}
          {girisHesapYok && (
            <div className="oa-bilgi" role="status">
              <span className="ikon" aria-hidden="true"><Info size={16} strokeWidth={2.2} /></span>
              <span><b>{t("auth.giris.hesapYokBaslik")}</b> {t("auth.giris.hesapYokAciklama")}</span>
            </div>
          )}
          {yeniHesapOnayi && (
            <div className="oa-onaylar">
              {onayKutusu("onay-sozlesme", sozlesmeKabul, setSozlesmeKabul, (
                <Ceviri
                  anahtar="auth.onay.sozlesme"
                  degerler={{
                    baglanti: (
                      <button type="button" onClick={(e) => { e.stopPropagation(); setYasalMetin("terms"); }}>
                        {t("auth.kullaniciSozlesmesi")}
                      </button>
                    ),
                  }}
                />
              ))}
              {onayKutusu("onay-aydinlatma", aydinlatmaOkundu, setAydinlatmaOkundu, (
                <Ceviri
                  anahtar="auth.onay.aydinlatma"
                  degerler={{
                    baglanti: (
                      <button type="button" onClick={(e) => { e.stopPropagation(); setYasalMetin("privacy"); }}>
                        {t("auth.aydinlatmaMetni")}
                      </button>
                    ),
                  }}
                />
              ))}
            </div>
          )}
          {!kayitModu && parolali && (
            <div className="oa-satir-ara">
              <label>
                <button
                  className={`oa-anahtar${oturumuAcikTut ? " acik" : ""}`}
                  type="button"
                  role="switch"
                  aria-checked={oturumuAcikTut}
                  aria-label={t("auth.oturumuAcikTut", { ortam: ortamAdi })}
                  onClick={() => setOturumuAcikTut(!oturumuAcikTut)}
                />
                {t("auth.oturumuAcikTut", { ortam: ortamAdi })}
              </label>
              <button
                className="oa-baglanti"
                type="button"
                onClick={() => {
                  setSifirlamaModu(true);
                  setHata("");
                  setAlanHata({});
                  setGonderildi(false);
                }}
              >
                {t("auth.parolamiUnuttum")}
              </button>
            </div>
          )}
          {captchaAlani(`${kayitModu ? "register" : "login"}-${parolali ? "password" : "code"}`)}
        </div>
      </>
    );
    const onaylarEksik = yeniHesapOnayi && (!sozlesmeKabul || !aydinlatmaOkundu);
    // Kod ve parolali kayit jetonu kendisi bekler; parolali giris dugmede bekler.
    const pasif = gonderiliyor || !eposta.trim() || (parolali && !parola) || onaylarEksik
      || (!kayitModu && parolali && captchaBekliyor);
    const onayIpucu = onaylarEksik && EPOSTA_DESENI.test(eposta.trim());
    const dugmeMetni = captchaIsteniyor
      ? t("auth.captcha.dogrulaniyor")
      : !parolali
        ? (gonderiliyor ? t("auth.gonderiliyor") : t("auth.gonder.kod"))
        : kayitModu
          ? (gonderiliyor ? t("auth.web.kayit.olusturuluyor") : t("auth.web.kayit.olustur"))
          : (gonderiliyor ? t("auth.gonder.girisYapiliyor") : t("auth.gonder.giris"));
    alt = (
      <>
        <button className="oa-dugme" type="submit" form={formId} disabled={pasif} aria-describedby={onayIpucu ? "auth-onay-ipucu" : undefined}>
          {dugmeMetni}
        </button>
        {onayIpucu && <p className="oa-ipucu" id="auth-onay-ipucu">{t("auth.ipucu.onaylar")}</p>}
        <p className="oa-gecis">
          {kayitModu ? (
            <button className="oa-baglanti soluk" type="button" onClick={() => { setKayitParolali(!kayitParolali); setParola(""); setHata(""); setAlanHata({}); }}>
              {kayitParolali ? t("auth.web.kayit.parolasiz") : t("auth.web.kayit.parolali")}
            </button>
          ) : (
            <button className="oa-baglanti soluk" type="button" onClick={() => yontemDegistir(parolali ? "kod" : "parola")}>
              {parolali ? t("auth.web.giris.kodla") : t("auth.web.giris.parolayla")}
            </button>
          )}
        </p>
        <div className="oa-yasal-satir">
          <button type="button" onClick={() => setYasalMetin("terms")}>{t("auth.kullaniciSozlesmesi")}</button>
          <span aria-hidden="true">·</span>
          <button type="button" onClick={() => setYasalMetin("privacy")}>{t("auth.gizlilikKvkk")}</button>
        </div>
      </>
    );
  } else {
    const appleDugmesi = appleGirisiVarMi && (
      <>
        <button
          className="oa-apple"
          type="button"
          onClick={appleIleGiris}
          disabled={appleYukleniyor || gonderiliyor}
        >
          <svg width="16" height="18" viewBox="0 0 14 17" fill="currentColor" aria-hidden="true">
            <path d="M11.6 9.02c.02 2.3 2.02 3.07 2.04 3.08-.02.05-.32 1.1-1.06 2.18-.64.94-1.3 1.87-2.35 1.89-1.03.02-1.36-.61-2.53-.61-1.18 0-1.54.59-2.51.63-1.01.04-1.78-1.01-2.42-1.94C1.46 12.33.46 8.85 1.8 6.5c.67-1.17 1.86-1.91 3.15-1.93.99-.02 1.93.67 2.53.67.61 0 1.75-.83 2.95-.71.5.02 1.91.2 2.81 1.53-.07.05-1.68.98-1.66 2.96M9.7 3.3c.53-.64.89-1.54.79-2.43-.76.03-1.69.51-2.24 1.15-.49.57-.92 1.48-.8 2.36.85.06 1.71-.43 2.25-1.08" />
          </svg>
          {appleYukleniyor
            ? t("auth.apple.yukleniyor")
            : kayitModu
              ? t("auth.apple.devam")
              : t("auth.apple.giris")}
        </button>
        <div className="oa-yada" aria-hidden="true">{t("auth.yaDa")}</div>
      </>
    );
    // Kod modu varsayilan; parola formu yalniz web'de "Parolayla gir" ile.
    const linkModu = kayitModu || yontem === "kod";
    const onSubmit = linkModu
      ? kodGonder
      : preview && import.meta.env.DEV
        ? (event) => { event.preventDefault(); setHata(t("auth.hata.onizleme")); }
        : parolaylaGiris;
    govde = (
      <>
        <span className="oa-mono-etiket">{kayitModu ? t("auth.etiket.kayit") : t("auth.etiket.giris")}</span>
        <h1 className="oa-baslik">{kayitModu ? t("auth.kayit.baslik") : t("auth.giris.baslik")}</h1>
        <p className="oa-aciklama">
          {kayitModu ? t("auth.kayit.aciklamaKisa") : !linkModu ? t("auth.giris.aciklamaWeb") : appleGirisiVarMi ? t("auth.giris.aciklama") : t("auth.giris.aciklamaEposta")}
        </p>
        {appleDugmesi}
        <form id={formId} className="oa-form" onSubmit={onSubmit}>
          {epostaAlani}
          {!linkModu && parolaAlani(
            "auth-password",
            t("auth.parola"),
            t("auth.parola.yerTutucuGiris"),
            parola,
            setParola,
            "current-password",
          )}
        </form>
        {hata && <p className="oa-hata" role="alert">{hata}</p>}
        {/* Referans kodu alani uygulama surumunde yok: App Store, kodla
            acilan Pro odulunu uygulama ici satin alma disi bir mekanizma
            sayiyor. Tarayici surumunde alan web dalinda. */}
        {girisHesapYok && (
          <div className="oa-bilgi" role="status">
            <span className="ikon" aria-hidden="true"><Info size={16} strokeWidth={2.2} /></span>
            <span><b>{t("auth.giris.hesapYokBaslik")}</b> {t("auth.giris.hesapYokAciklama")}</span>
          </div>
        )}
        {(kayitModu || girisHesapYok) && (
          <div className="oa-onaylar">
            {onayKutusu("onay-sozlesme", sozlesmeKabul, setSozlesmeKabul, (
              <Ceviri
                anahtar="auth.onay.sozlesme"
                degerler={{
                  baglanti: (
                    <button type="button" onClick={(e) => { e.stopPropagation(); setYasalMetin("terms"); }}>
                      {t("auth.kullaniciSozlesmesi")}
                    </button>
                  ),
                }}
              />
            ))}
            {onayKutusu("onay-aydinlatma", aydinlatmaOkundu, setAydinlatmaOkundu, (
              <Ceviri
                anahtar="auth.onay.aydinlatma"
                degerler={{
                  baglanti: (
                    <button type="button" onClick={(e) => { e.stopPropagation(); setYasalMetin("privacy"); }}>
                      {t("auth.aydinlatmaMetni")}
                    </button>
                  ),
                }}
              />
            ))}
          </div>
        )}
        {!kayitModu && !linkModu && (
          <div className="oa-satir-ara">
            <label>
              <button
                className={`oa-anahtar${oturumuAcikTut ? " acik" : ""}`}
                type="button"
                role="switch"
                aria-checked={oturumuAcikTut}
                aria-label={t("auth.oturumuAcikTut", { ortam: ortamAdi })}
                onClick={() => setOturumuAcikTut(!oturumuAcikTut)}
              />
              {t("auth.oturumuAcikTut", { ortam: ortamAdi })}
            </label>
            <button
              className="oa-baglanti"
              type="button"
              onClick={() => {
                setSifirlamaModu(true);
                setHata("");
                setGonderildi(false);
              }}
            >
              {t("auth.parolamiUnuttum")}
            </button>
          </div>
        )}
        {captchaAlani(linkModu ? `code-send-${kayitModu}` : `password-${kayitModu}`)}
      </>
    );
    const onaylarEksik = (kayitModu || girisHesapYok) && (!sozlesmeKabul || !aydinlatmaOkundu);
    // Kod akışında düğme jetonu beklemez (kodGonder bekler); parola girişi bekler.
    const pasif = gonderiliyor || (!linkModu && captchaBekliyor) || !eposta.trim()
      || (!linkModu && !parola)
      || onaylarEksik;
    // Pasif düğmenin nedeni: e-posta geçerli ama onaylar eksik.
    const onayIpucu = onaylarEksik && EPOSTA_DESENI.test(eposta.trim());
    alt = (
      <>
        <button className="oa-dugme" type="submit" form={formId} disabled={pasif} aria-describedby={onayIpucu ? "auth-onay-ipucu" : undefined}>
          {linkModu
            ? captchaIsteniyor ? t("auth.captcha.dogrulaniyor") : gonderiliyor ? t("auth.gonderiliyor") : t("auth.gonder.kod")
            : gonderiliyor ? t("auth.gonder.girisYapiliyor") : t("auth.gonder.giris")}
        </button>
        {onayIpucu && <p className="oa-ipucu" id="auth-onay-ipucu">{t("auth.ipucu.onaylar")}</p>}
        <p className="oa-gecis">
          {kayitModu ? (
            <>
              {t("auth.gecis.hesapVar")} <a href={ilkProPlani ? `/login?plan=${ilkProPlani}` : "/login"} onClick={nativeGecis}>{t("auth.gecis.girisYap")}</a>
            </>
          ) : (
            <>
              {t("auth.gecis.hesapYok")} <a href={ilkProPlani ? `/register?plan=${ilkProPlani}` : "/register"} onClick={nativeGecis}>{t("auth.gecis.kayitOl")}</a>
            </>
          )}
        </p>
        <div className="oa-yasal-satir">
          <button type="button" onClick={() => setYasalMetin("terms")}>{t("auth.kullaniciSozlesmesi")}</button>
          <span aria-hidden="true">·</span>
          <button type="button" onClick={() => setYasalMetin("privacy")}>{t("auth.gizlilikKvkk")}</button>
        </div>
      </>
    );
  }

  const yasalPerde = yasalMetin && (
    <div
      className="oa-yasal-perde"
      role="dialog"
      aria-modal="true"
      aria-label={
        yasalMetin === "terms"
          ? t("auth.kullaniciSozlesmesi")
          : t("auth.aydinlatmaMetni")
      }
      onClick={() => setYasalMetin(null)}
    >
      <div className="oa-yasal" onClick={(e) => e.stopPropagation()}>
        <div className="oa-yasal-ust">
          <span>
            {yasalMetin === "terms"
              ? t("auth.kullaniciSozlesmesi")
              : t("auth.aydinlatmaMetni")}
          </span>
          <button
            className="oa-geri"
            type="button"
            aria-label={t("auth.metniKapat")}
            onClick={() => setYasalMetin(null)}
          >
            <X size={18} />
          </button>
        </div>
        <div className="oa-yasal-icerik" tabIndex={0}>
          {yasalMetin === "terms" ? (
            <KullaniciSozlesmesi embedded />
          ) : (
            <GizlilikMetni embedded />
          )}
        </div>
      </div>
    </div>
  );
  const ekranAnahtari = kodModu ? "kod" : gonderildi ? "gonderildi" : sifirlamaModu ? "sifirlama" : yontem;

  // Web: solda marka sahnesi, sagda form (girisKabuk.css; 760 px altinda
  // sahne uste gecer).
  if (!nativeMi) {
    return (
      <div className={`oa oa-auth gk${koyu ? " oa-koyu" : ""}`} ref={kokRef}>
        <GirisSahnesi />
        <div className="gk-form">
          <header className="gk-ust">
            <KabukLogosu koyu={koyu} href="/?plan=free" onClick={proNiyetiniTemizle} />
            {ustSag}
          </header>
          <main className="gk-panel" key={ekranAnahtari}>
            {govde}
            <div className="gk-eylem">{alt}</div>
          </main>
          <p className="gk-not">
            <ShieldCheck size={16} strokeWidth={2.2} aria-hidden="true" />
            <span>{t("auth.web.not")}</span>
          </p>
        </div>
        {yasalPerde}
      </div>
    );
  }

  return (
    <div className={`oa oa-auth${koyu ? " oa-koyu" : ""}`} ref={kokRef}>
      <div className="oa-kolon">
        <div className="oa-kabuk">
          {geriDugmesi}
          {/* Giris yapmadan dil degistirme (native ve web). */}
          {ustSag}
        </div>
        <div className="oa-govde" key={ekranAnahtari}>{govde}</div>
        <div className="oa-alt">{alt}</div>
      </div>
      {yasalPerde}
    </div>
  );
}

export function ParolaYenileEkrani() {
  const session = useSession();
  const [parola, setParola] = useState("");
  const [tekrar, setTekrar] = useState("");
  const [gorunur, setGorunur] = useState(false);
  const [durum, setDurum] = useState({
    kaydediliyor: false,
    hata: "",
    tamam: false,
  });

  async function parolayiKaydet(e) {
    e.preventDefault();
    if (parola.length < 8)
      return setDurum({
        kaydediliyor: false,
        hata: t("auth.hata.parolaKisa"),
        tamam: false,
      });
    if (parola !== tekrar)
      return setDurum({
        kaydediliyor: false,
        hata: t("auth.hata.parolaEslesmiyor"),
        tamam: false,
      });
    setDurum({ kaydediliyor: true, hata: "", tamam: false });
    const { error } = await supabase.auth.updateUser({ password: parola });
    if (error?.code === "same_password") {
      setDurum({ kaydediliyor: false, hata: "", tamam: true });
      return;
    }
    let hataMesaji = "";
    if (error?.code === "weak_password")
      hataMesaji = t("auth.yenile.zayif");
    else if (
      [
        "reauthentication_needed",
        "reauth_nonce_missing",
        "reauthentication_not_valid",
      ].includes(error?.code)
    )
      hataMesaji = t("auth.yenile.yenidenDogrula");
    else if (error)
      hataMesaji = error.code
        ? t("auth.yenile.hataKod", { kod: error.code })
        : t("auth.yenile.hata");
    setDurum(
      error
        ? {
            kaydediliyor: false,
            hata: hataMesaji,
            tamam: false,
          }
        : { kaydediliyor: false, hata: "", tamam: true },
    );
  }

  const koyu = webdeKoyuMu({ native: nativeMi, sistemKoyu: useSistemKoyu() });
  let govde;
  let alt = null;
  if (session === undefined) {
    govde = <p className="oa-aciklama">{t("auth.yenile.kontrol")}</p>;
  } else if (!session) {
    govde = (
      <>
        <h1 className="oa-baslik">{t("auth.yenile.gecersizBaslik")}</h1>
        <p className="oa-aciklama">{t("auth.yenile.gecersizAciklama")}</p>
      </>
    );
    alt = <a className="oa-dugme" href="/login">{t("auth.yenile.yeniBaglanti")}</a>;
  } else if (durum.tamam) {
    govde = (
      <div className="oa-posta">
        <span className="rozet" aria-hidden="true"><Check size={30} strokeWidth={3} /></span>
        <h1 className="oa-baslik">{t("auth.yenile.hazir")}</h1>
        <p className="oa-aciklama">{t("auth.yenile.hazirAciklama")}</p>
      </div>
    );
    alt = <a className="oa-dugme" href="/summary">{t("auth.yenile.devam")}</a>;
  } else {
    govde = (
      <>
        <h1 className="oa-baslik">{t("auth.yenile.baslik")}</h1>
        <p className="oa-aciklama">{t("auth.yenile.aciklama")}</p>
        <form id="auth-form" className="oa-form" onSubmit={parolayiKaydet}>
          <label className="oa-alan">
            <span className="oa-mono-etiket">{t("auth.yenile.yeniParola")}</span>
            <span className="satir">
              <input
                type={gorunur ? "text" : "password"}
                placeholder={t("auth.yenile.yeniParola")}
                value={parola}
                onChange={(e) => setParola(e.target.value)}
                autoFocus={!nativeMi}
                required
                minLength={8}
              />
              <button
                className="oa-goz"
                type="button"
                aria-label={gorunur ? t("auth.parola.gizle") : t("auth.parola.goster")}
                onClick={() => setGorunur(!gorunur)}
              >
                {gorunur ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
          </label>
          <label className="oa-alan">
            <span className="oa-mono-etiket">{t("auth.yenile.yeniParolaTekrar")}</span>
            <input
              type={gorunur ? "text" : "password"}
              placeholder={t("auth.yenile.yeniParolaTekrar")}
              value={tekrar}
              onChange={(e) => setTekrar(e.target.value)}
              required
              minLength={8}
            />
          </label>
        </form>
        {durum.hata && <p className="oa-hata" role="alert">{durum.hata}</p>}
      </>
    );
    alt = (
      <button className="oa-dugme" type="submit" form="auth-form" disabled={durum.kaydediliyor || !parola || !tekrar}>
        {durum.kaydediliyor ? t("auth.yenile.kaydediliyor") : t("auth.yenile.kaydet")}
      </button>
    );
  }
  return (
    <div className={`oa oa-auth${koyu ? " oa-koyu" : ""}`}>
      <div className="oa-kolon">
        <div className="oa-kabuk">
          <a className="oa-geri" href="/login" aria-label={t("auth.girisEkraninaDon")}>
            <ChevronLeft size={20} strokeWidth={2.2} />
          </a>
        </div>
        <div className="oa-govde">
          <span className="oa-mono-etiket">{t("auth.parolamiUnuttum")}</span>
          {govde}
        </div>
        <div className="oa-alt">{alt}</div>
      </div>
    </div>
  );
}

export function CikisButonu({ className }) {
  return (
    <button
      className={className}
      onClick={() => supabase.auth.signOut()}
      title={t("auth.cikisYap")}
    >
      <LogOut size={15} /> {t("auth.cikis")}
    </button>
  );
}

// Web giris/kayit sekmeleri: beyaz gosterge yayli gecisle kayar; ok tuslari
// sekmeler arasinda gezer.
function ModSekmeleri({ kayit, degistir }) {
  const tuslar = (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const yeni = !kayit;
    degistir(yeni);
    document.getElementById(yeni ? "gk-sekme-kayit" : "gk-sekme-giris")?.focus();
  };
  const sekme = (id, secili, metin, deger) => (
    <button
      id={id}
      type="button"
      role="tab"
      aria-selected={secili}
      aria-controls="gk-panel"
      tabIndex={secili ? 0 : -1}
      onClick={() => degistir(deger)}
      onKeyDown={tuslar}
    >
      {metin}
    </button>
  );
  return (
    <div className={`gk-sekmeler${kayit ? "" : " giris"}`} role="tablist" aria-label={t("auth.web.sekme.etiket")}>
      <span className="gk-gosterge" aria-hidden="true" />
      {sekme("gk-sekme-kayit", kayit, t("auth.web.sekme.kayit"), true)}
      {sekme("gk-sekme-giris", !kayit, t("auth.web.sekme.giris"), false)}
    </div>
  );
}

function ParolaGucu({ seviye }) {
  return (
    <div className={`gk-guc s${seviye}`} aria-live="polite">
      <span className="cubuk" aria-hidden="true">
        {[1, 2, 3, 4].map((n) => <i key={n} className={n <= seviye ? "dolu" : undefined} />)}
      </span>
      <small>{t("auth.web.guc.etiket")} {t(`auth.web.guc.${PAROLA_SEVIYELERI[seviye]}`)}</small>
    </div>
  );
}

// Web kod adimi: tek alan; tarayicinin one-time-code onerisi ve yapistirma
// tek seferde doldurur, 6. hanede dogrulama baslar.
function KodAlani({ deger, onChange, onTamam, hata }) {
  return (
    <>
      <label className={`oa-alan${hata ? " hatali" : ""}`}>
        <span className="oa-mono-etiket">{t("auth.web.kod.etiket")}</span>
        <input
          id="auth-code"
          className="oa-mono gk-kod"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="••••••"
          value={deger}
          autoFocus
          aria-invalid={hata ? true : undefined}
          aria-describedby={hata ? "auth-code-hata" : undefined}
          onChange={(e) => {
            const yeni = kodTemizle(e.target.value);
            onChange(yeni);
            if (yeni.length === 6) onTamam?.(yeni);
          }}
        />
      </label>
      {hata && <p className="oa-hata gk-alan-hata" id="auth-code-hata">{hata}</p>}
    </>
  );
}

// Sol marka sahnesi (yalniz dekor): hap bicimleri, koyu blok, ziplayan top,
// suzulen ornek borc karti ve slogan. Karttaki veri ornektir.
function GirisSahnesi() {
  return (
    <div className="gk-sahne" aria-hidden="true">
      <span className="gk-sekil gk-hap bir" />
      <span className="gk-sekil gk-hap iki" />
      <span className="gk-sekil gk-blok" />
      <span className="gk-sekil gk-top" />
      <div className="gk-kart-yer">
        <div className="gk-kart">
          <div className="ust">
            <span className="rozet">{t("auth.web.sahne.rozet")}</span>
            <span className="kim">
              <b>{t("auth.web.sahne.kim")}</b>
              <small>{t("auth.web.sahne.kimAlt")}</small>
            </span>
            <span className="cip">{t("auth.web.sahne.kalan")}</span>
          </div>
          <span className="etiket">{t("auth.web.sahne.etiket")}</span>
          <strong className="tutar">{t("auth.web.sahne.tutar")}</strong>
          <div className="satir">
            <span>{t("auth.web.sahne.ne")}</span>
            <b>{t("auth.web.sahne.tarih")}</b>
          </div>
          <span className="ilerleme"><i /></span>
          <small className="plan">{t("auth.web.sahne.plan")}</small>
        </div>
      </div>
      <p className="gk-slogan">
        <span>{t("auth.web.slogan1")}</span>
        <span>{t("auth.web.slogan2")}</span>
      </p>
    </div>
  );
}

// Tek kullanimlik kod: 6 kutu. Yazinca sonrakine gecer, bos kutuda Backspace
// oncekine doner, 6 haneli yapistirma (ya da iOS'un Mail'den onerdigi kod,
// one-time-code) hepsini doldurur; 6. hane dolunca dogrulama baslar.
function KodKutulari({ deger, onChange, onTamam, hatali = false }) {
  const kutular = useRef([]);
  const haneler = Array.from({ length: 6 }, (_, i) => deger[i] || "");
  const yaz = (i, metin) => {
    const rakamlar = kodTemizle(metin);
    if (!rakamlar) {
      onChange(deger.slice(0, i) + deger.slice(i + 1));
      return;
    }
    // Tek hane ya da yapistirma: i'den itibaren doldur.
    const yeni = kodTemizle(deger.slice(0, i) + rakamlar + (rakamlar.length > 1 ? "" : deger.slice(i + 1)));
    onChange(yeni);
    const sonraki = Math.min(i + rakamlar.length, 5);
    kutular.current[sonraki]?.focus();
    if (yeni.length === 6) onTamam?.(yeni);
  };
  return (
    <div className={`oa-kod-kutular${hatali ? " hatali" : ""}`} role="group" aria-label={t("auth.kod.grup")}>
      {haneler.map((hane, i) => (
        <input
          key={i}
          ref={(el) => { kutular.current[i] = el; }}
          id={i === 0 ? "auth-code" : undefined}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={i === 0 ? 6 : 1}
          aria-label={t("auth.kod.hane", { n: i + 1 })}
          value={hane}
          autoFocus={i === 0}
          onFocus={(e) => e.target.select()}
          onChange={(e) => {
            const v = e.target.value;
            // Dolu kutuya yazilinca yeni rakam eskisinin yerine gecer.
            yaz(i, hane && v.length === 2 ? v.slice(-1) : v);
          }}
          onPaste={(e) => {
            e.preventDefault();
            yaz(i, e.clipboardData.getData("text"));
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !hane && i > 0) {
              e.preventDefault();
              onChange(deger.slice(0, i - 1) + deger.slice(i));
              kutular.current[i - 1]?.focus();
            }
          }}
        />
      ))}
    </div>
  );
}
