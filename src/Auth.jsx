import React, { useState, useEffect, useRef } from "react";
import { runAuthAttempt, recoveryErrorMessage } from "./authAttempt.js";
import { supabase, supabaseHazir } from "./supabaseClient.js";
import {
  Check,
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
import { GizlilikMetni, KullaniciSozlesmesi } from "./Legal.jsx";
import {
  googleAdsYeniKullaniciDonusumu,
  googleAnalyticsProDenemeBaslangici,
} from "./googleAds.js";
import { funnelEtkinligiKaydet, funnelOturumKimligi } from "./funnelAnalytics.js";
import { girisAktivitesiKaydet } from "./activityLog.js";
import { davetKodunuYoldanOku, referansKodunuDogrula, referansKodunuTemizle } from "./referrals.js";
import { nativeMi, yenilemeYonergesi, ortamAdi } from "./platform.js";
import { epostaDonusAdresi } from "./nativeDerinBaglanti.js";
import { appleGirisiVarMi, appleHataMesaji, appleIleGirisYap } from "./appleGiris.js";
import { dil, t } from "./i18n.js";
import Ceviri from "./Ceviri.jsx";
import DilDugmesi from "./DilDugmesi.jsx";
import { proSatistaDegil } from "./proSatis.js";
import { kodGecerli, kodHataAnahtari, kodTemizle } from "./authKod.js";
import { useSistemKoyu } from "./Onboarding.jsx";
import "./onboardingAkis.css";

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

function TurnstileWidget({ siteKey, onToken, onStatus, widgetKey }) {
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
  }, [siteKey, widgetKey, onToken, onStatus]);
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

  useEffect(() => {
    const sessionAyarla = (yeniSession) => {
      setSession(yeniSession);
      if (yeniSession?.user) {
        if (!nativeMi) void googleAdsYeniKullaniciDonusumu(yeniSession.user);
        void proDenemesiniVeBaslangicMailiniTetikle(yeniSession);
      }
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
      sessionAyarla(session);
      if (event === "SIGNED_IN") void girisAktivitesiKaydet(session);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return session;
}

export function GirisEkrani({ redirectTo = "/summary", kayitModu = false, preview = false }) {
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
  // Kayit yalniz tek kullanimlik kodla (parola yok); giriste parola ya da kod.
  const [yontem, setYontem] = useState(kayitModu ? "kod" : "parola");
  const [kodModu, setKodModu] = useState(false);
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
  const [captchaAttempt, setCaptchaAttempt] = useState(0);
  const [captchaDurumu, setCaptchaDurumu] = useState("loading");
  // Uygulama surumunde referans kodu hic okunmuyor; alan gizli oldugu icin
  // kod bos kaliyor ve kayitla birlikte sunucuya gonderilmiyor.
  const ilkReferansKodu = kayitModu && !nativeMi ? davetKodunuYoldanOku("", window.location.search) : "";
  const [referansKodu, setReferansKodu] = useState(ilkReferansKodu);
  const [referansDurumu, setReferansDurumu] = useState(ilkReferansKodu ? "checking" : "idle");
  const [referansAcik, setReferansAcik] = useState(Boolean(ilkReferansKodu));
  const turnstileSiteKey = preview && import.meta.env.DEV ? "" : import.meta.env.VITE_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (kayitModu && !preview) funnelEtkinligiKaydet("register_view");
  }, [kayitModu]);

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
      <>
        <TurnstileWidget
          siteKey={turnstileSiteKey}
          widgetKey={`${widgetKey}-${captchaAttempt}`}
          onToken={setCaptchaToken}
          onStatus={setCaptchaDurumu}
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
      </>
    );
  }

  // Tek kullanimlik kod: e-postaya hem kod hem baglanti gider (auth-email
  // hook'u). Kayitta hesap bu adimda acilir; parola hic sorulmaz.
  async function kodGonder(e) {
    e?.preventDefault?.();
    if (!eposta.trim()) return;
    if (kayitModu && (!sozlesmeKabul || !aydinlatmaOkundu))
      return setHata(t("auth.hata.sozlesme"));
    // Tasarim onizlemesinde (Supabase yok) kod ekrani gosterilir, e-posta gitmez.
    if (preview && import.meta.env.DEV) { setKod(""); setKodModu(true); return; }
    if (!supabaseHazir) return setHata(t("auth.hata.onizlemeEposta"));
    setGonderiliyor(true);
    setHata("");
    if (kayitModu) await funnelEtkinligiKaydet("register_view");
    const kayitZamani = new Date().toISOString();
    const kayitOlayKimligi = kayitModu ? crypto.randomUUID() : null;
    const { error } = await authIstegiYap(() => supabase.auth.signInWithOtp({
      email: eposta.trim(),
      options: {
        emailRedirectTo: epostaDonusAdresi(sonrakiSayfa),
        captchaToken: captchaToken || undefined,
        shouldCreateUser: kayitModu,
        data: kayitModu ? {
          terms_version: "1.0",
          terms_accepted_at: kayitZamani,
          privacy_version: "1.0",
          privacy_notice_read_at: kayitZamani,
          borcama_registration_created_at: kayitZamani,
          borcama_registration_method: "email_otp",
          borcama_registration_event_id: kayitOlayKimligi,
          funnel_session_id: funnelOturumKimligi(),
          referral_code: referansKodu || undefined,
        } : undefined,
      },
    }));
    setGonderiliyor(false);
    if (error) {
      setHata(
        error.status === 429
          ? t("auth.hata.cokDenemeTekrar")
          : kayitModu
            ? t("auth.hata.kodGonderilemedi")
            : t("auth.hata.kodGirisHesapYok"),
      );
      return;
    }
    setKod("");
    setKodModu(true);
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

  async function koduDogrula(e) {
    e.preventDefault();
    if (!kodGecerli(kod)) return;
    setGonderiliyor(true);
    setHata("");
    const { error } = await authIstegiYap(() => supabase.auth.verifyOtp({
      email: eposta.trim(),
      token: kodTemizle(kod),
      type: "email",
    }));
    if (error) {
      setGonderiliyor(false);
      setHata(t(kodHataAnahtari(error)));
      return;
    }
    oturumKalicilginiYaz();
    if (kayitModu) proNiyetiniTemizle();
    window.location.href = sonrakiSayfa;
  }

  async function parolaylaGiris(e) {
    e.preventDefault();
    if (!eposta.trim() || !parola) return;
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
        setHata(t("auth.hata.epostaDogrulanmamis"));
      else if (kod === "user_banned")
        setHata(t("auth.hata.hesapDurduruldu"));
      else if (kod === "invalid_credentials")
        setHata(t("auth.hata.bilgilerYanlis"));
      else
        setHata(
          kod
            ? t("auth.hata.girisTamamlanamadiKod", { kod })
            : t("auth.hata.girisTamamlanamadi"),
        );
    } else {
      oturumKalicilginiYaz();
      window.location.href = sonrakiSayfa;
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
      window.location.href = sonrakiSayfa;
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
    setGonderildi(false);
    setKodModu(false);
  }

  const koyu = useSistemKoyu();
  const formId = "auth-form";
  const captchaBekliyor = Boolean(turnstileSiteKey && !captchaToken);
  const ustSag = <DilDugmesi className="oa-cip kucuk oa-ust-sag" kisa />;
  const geriDugmesi = nativeMi ? (
    // Native kabukta ana sayfa yok; geri dugmesi karsilama ekranina doner.
    <a className="oa-geri" href="/summary" onClick={proNiyetiniTemizle} aria-label={t("auth.geri")}>
      <ChevronLeft size={20} strokeWidth={2.2} />
    </a>
  ) : (
    <a className="oa-geri" href="/?plan=free" onClick={proNiyetiniTemizle} aria-label={t("auth.anaSayfayaDon")}>
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
  const epostaAlani = (
    <label className="oa-alan">
      <span className="oa-mono-etiket">{t("auth.eposta")}</span>
      <input
        id="auth-email"
        autoComplete="email"
        type="email"
        inputMode="email"
        placeholder={t("auth.epostaOrnek")}
        value={eposta}
        onChange={(e) => setEposta(e.target.value)}
        autoFocus={!nativeMi}
        required
      />
    </label>
  );
  const parolaAlani = (id, etiket, yerTutucu, deger, degistir, otomatik, ekstra = {}) => (
    <label className="oa-alan">
      <span className="oa-mono-etiket">{etiket}</span>
      <span className="satir">
        <input
          id={id}
          autoComplete={otomatik}
          type={parolaGorunur ? "text" : "password"}
          placeholder={yerTutucu}
          value={deger}
          onChange={(e) => degistir(e.target.value)}
          required
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
  );

  let govde;
  let alt;
  if (kodModu) {
    const kodTamam = kodGecerli(kod);
    govde = (
      <div className="oa-posta">
        <span className="rozet" aria-hidden="true"><Mail size={30} strokeWidth={2.2} /></span>
        <span className="oa-mono-etiket">{t("auth.kod.gonderildi")}</span>
        <h1 className="oa-baslik">{t("auth.kod.baslik")}</h1>
        <p className="oa-aciklama">
          <Ceviri anahtar="auth.kod.aciklama" degerler={{ eposta: <mark>{eposta}</mark> }} />
        </p>
        <form id={formId} className="oa-form oa-kod-formu" onSubmit={koduDogrula}>
          <label className="oa-alan">
            <span className="oa-mono-etiket">{t("auth.kod.etiket")}</span>
            <input
              id="auth-code"
              className="oa-mono oa-kod-girdi"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              placeholder="••••••••"
              value={kod}
              onChange={(e) => setKod(kodTemizle(e.target.value))}
              autoFocus
              required
            />
          </label>
        </form>
        {hata && <p className="oa-hata" role="alert">{hata}</p>}
        {captchaAlani(`code-${kayitModu}`)}
      </div>
    );
    alt = (
      <>
        <button className="oa-dugme" type="submit" form={formId} disabled={gonderiliyor || !kodTamam || captchaBekliyor}>
          {gonderiliyor ? t("auth.kod.dogrulaniyor") : kayitModu ? t("auth.kod.dogrula") : t("auth.gonder.giris")}
        </button>
        <p className="oa-gecis">
          {t("auth.gonderildi.gelmedi")}{" "}
          <button className="oa-baglanti" type="button" disabled={gonderiliyor || captchaBekliyor} onClick={() => kodGonder()}>
            {t("auth.gonderildi.tekrar")}
          </button>
          <span aria-hidden="true"> · </span>
          <button className="oa-baglanti" type="button" onClick={() => { setKodModu(false); setHata(""); }}>
            {t("auth.kod.epostayiDegistir")}
          </button>
        </p>
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
            if (kayitModu) window.location.href = "/login";
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
    // Giriste parola ya da e-postaya gelen tek kullanimlik kod (web + uygulama;
    // kod linke bagli olmadigi icin App Store kurali bunu engellemez).
    const sekmeler = !kayitModu && (
      <div className="oa-sekmeler" role="tablist">
        {[["parola", "auth.sekme.parola"], ["kod", "auth.sekme.kod"]].map(([ad, anahtar]) => (
          <button key={ad} className={`oa-sekme${yontem === ad ? " secili" : ""}`} role="tab" aria-selected={yontem === ad} type="button" onClick={() => yontemDegistir(ad)}>
            {t(anahtar)}
          </button>
        ))}
      </div>
    );
    // Kayit her zaman kod modunda; giriste sekmeye gore.
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
          {kayitModu ? t("auth.kayit.aciklamaKod") : t("auth.giris.aciklamaKod")}
        </p>
        {appleDugmesi}
        {sekmeler}
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
            sayiyor. Tarayici surumunde alan aynen duruyor. */}
        {kayitModu && !nativeMi && (
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
        {kayitModu && (
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
        {!kayitModu && (
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
            {!linkModu && (
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
            )}
          </div>
        )}
        {captchaAlani(linkModu ? `code-send-${kayitModu}` : `password-${kayitModu}`)}
      </>
    );
    const pasif = gonderiliyor || captchaBekliyor || !eposta.trim()
      || (!linkModu && !parola)
      || (kayitModu && (!sozlesmeKabul || !aydinlatmaOkundu));
    alt = (
      <>
        <button className="oa-dugme" type="submit" form={formId} disabled={pasif}>
          {linkModu
            ? gonderiliyor ? t("auth.gonderiliyor") : t("auth.kod.gonder")
            : gonderiliyor ? t("auth.gonder.girisYapiliyor") : t("auth.gonder.giris")}
        </button>
        <p className="oa-gecis">
          {kayitModu ? (
            <>
              {t("auth.gecis.hesapVar")} <a href={ilkProPlani ? `/login?plan=${ilkProPlani}` : "/login"}>{t("auth.gecis.girisYap")}</a>
            </>
          ) : (
            <>
              {t("auth.gecis.hesapYok")} <a href={ilkProPlani ? `/register?plan=${ilkProPlani}` : "/register"}>{t("auth.gecis.kayitOl")}</a>
            </>
          )}
        </p>
        <div className="oa-yasal-satir">
          <button type="button" onClick={() => setYasalMetin("terms")}>{t("auth.kullaniciSozlesmesi")}</button>
          <span aria-hidden="true">·</span>
          <button type="button" onClick={() => setYasalMetin("privacy")}>{t("auth.gizlilikKvkk")}</button>
        </div>
        {!nativeMi && (
          <div className="oa-guvence">
            <ShieldCheck size={13} />
            <span>{t("auth.guvence")}</span>
          </div>
        )}
      </>
    );
  }

  return (
    <div className={`oa oa-auth${koyu ? " oa-koyu" : ""}`}>
      <div className="oa-kolon">
        <div className="oa-kabuk">
          {geriDugmesi}
          {/* Giris yapmadan dil degistirme (native ve web). */}
          {ustSag}
        </div>
        <div className="oa-govde" key={kodModu ? "kod" : gonderildi ? "gonderildi" : sifirlamaModu ? "sifirlama" : yontem}>{govde}</div>
        <div className="oa-alt">{alt}</div>
      </div>
      {yasalMetin && (
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
      )}
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

  const koyu = useSistemKoyu();
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
