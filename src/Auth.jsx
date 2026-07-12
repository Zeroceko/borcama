import React, { useState, useEffect } from "react";
import { supabase, supabaseHazir } from "./supabaseClient.js";
import {
  ArrowLeft,
  Mail,
  ShieldCheck,
  LogOut,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff,
  X,
} from "lucide-react";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap');
.auth-wrap,.auth-wrap *{box-sizing:border-box}
.auth-wrap{
  min-height:100vh; display:flex; align-items:center; justify-content:center; padding:20px;
  font-family:'Space Grotesk',sans-serif;
  background:
    radial-gradient(circle at 88% 12%,#ff6f5966 0 8%,transparent 8.3%),
    radial-gradient(circle at 12% 88%,#cdf56499 0 12%,transparent 12.3%),
    linear-gradient(135deg,#f4efe0 0 64%,#d8e6df 64% 100%);
  color:#14160f;
  position:relative;overflow:hidden;
}
.auth-wrap::before{content:'';position:absolute;width:170px;height:170px;border:3px solid #14160f;border-radius:38px;right:-65px;bottom:-65px;transform:rotate(18deg);background:#ff6f59}
.auth-back{position:absolute;top:24px;left:clamp(20px,4vw,48px);z-index:2;display:inline-flex;align-items:center;gap:7px;padding:10px 15px;border:2px solid #14160f;border-radius:999px;background:#fff;color:#14160f;text-decoration:none;font-size:13px;font-weight:700;box-shadow:3px 3px 0 #14160f}
.auth-back:hover{transform:translate(2px,2px);box-shadow:1px 1px 0 #14160f}
.auth-card{
  position:relative;z-index:1;width:100%; max-width:440px; background:#ffffff; border:3px solid #14160f;
  border-radius:26px; padding:40px 36px;box-shadow:12px 12px 0 #ff6f59;
}
.auth-title{display:block;width:190px;height:auto;margin:0 0 18px}
.auth-welcome{font-size:17px;font-weight:800;margin-bottom:7px}
.auth-sub{font-size:13.5px;color:#55584c;line-height:1.55;margin:0 0 24px}
.auth-input{
  width:100%; padding:12px 14px; border-radius:10px; border:2px solid #14160f;
  background:#f4efe0; color:#14160f; font-size:14px; font-family:inherit; margin-bottom:12px;
}
.auth-input::placeholder{color:#8a8c7e}
.auth-tabs{display:grid;grid-template-columns:1fr 1fr;gap:7px;padding:5px;border:2px solid #14160f;border-radius:999px;background:#f4efe0;margin-bottom:18px}
.auth-tab{border:0;border-radius:999px;padding:8px 10px;background:transparent;color:#55584c;font-family:inherit;font-weight:700;font-size:12px;cursor:pointer}
.auth-tab.active{background:#14160f;color:#fff}
.auth-password{position:relative}.auth-password .auth-input{padding-right:46px}.auth-eye{position:absolute;right:7px;top:7px;width:34px;height:34px;display:grid;place-items:center;border:0;background:transparent;cursor:pointer;color:#55584c}
.auth-help{font-size:11.5px;color:#777a6d;line-height:1.45;margin:-2px 0 12px}
.auth-reset-link{display:block;margin:-4px 0 13px auto;padding:0;border:0;background:none;color:#315c47;font:700 11.5px 'Space Grotesk',sans-serif;text-decoration:underline;text-underline-offset:3px;cursor:pointer}
.auth-remember{display:flex;align-items:center;gap:9px;margin:2px 0 14px;font-size:12.5px;font-weight:600;color:#55584c;cursor:pointer}
.auth-remember input{appearance:none;width:18px;height:18px;flex:0 0 auto;margin:0;border:2px solid #14160f;border-radius:5px;background:#fff;display:grid;place-items:center;cursor:pointer}
.auth-remember input:checked{background:#cdf564}
.auth-remember input:checked::after{content:'✓';font-size:13px;font-weight:900;line-height:1;color:#14160f}
.auth-consents{display:grid;gap:10px;margin:4px 0 16px;padding:13px;background:#f4efe0;border:1px solid #d9d5c7;border-radius:12px}.auth-consents .auth-remember{align-items:flex-start;margin:0;font-size:11.5px;line-height:1.45}
.auth-switch{margin-top:17px;padding-top:16px;border-top:1px solid #dedbce;text-align:center;font-size:12.5px;color:#66695d}
.auth-switch a{color:#14160f;font-weight:800;text-decoration:underline;text-underline-offset:3px}
.auth-legal{text-align:center;margin-top:11px;font-size:10.5px;color:#8a8c7e}.auth-legal span{margin:0 5px}
.auth-legal button,.auth-consents button{padding:0;border:0;background:none;color:#315c47;font:inherit;font-weight:800;text-decoration:underline;text-underline-offset:2px;cursor:pointer}.auth-legal-modal{position:fixed;z-index:20;inset:0;background:#09291fcc;display:grid;place-items:center;padding:18px}.auth-legal-dialog{width:min(860px,100%);height:min(760px,92vh);background:#f4efe0;border:3px solid #14160f;border-radius:24px;box-shadow:10px 10px 0 #cdf564;display:flex;flex-direction:column;overflow:hidden}.auth-legal-head{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 18px;background:#fff;border-bottom:2px solid #14160f;font-size:14px;font-weight:800}.auth-legal-close{width:36px;height:36px;border:2px solid #14160f;border-radius:50%;background:#cdf564;display:grid;place-items:center;cursor:pointer}.auth-legal-frame{width:100%;flex:1;border:0;background:#f4efe0}
.auth-btn{
  width:100%; padding:12px 0; border-radius:999px; border:2px solid #14160f; background:#cdf564; color:#14160f;
  font-weight:700; font-size:14px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;
}
.auth-btn:disabled{opacity:.6; cursor:default}
.auth-btn:hover:not(:disabled){filter:brightness(0.96)}
.auth-error{background:#ff6f5922;border:2px solid #ff6f59;color:#a53a2a;font-size:13px;border-radius:12px;padding:10px 12px;margin-bottom:12px}
.auth-sent{display:flex;flex-direction:column;align-items:center;text-align:center;gap:10px;padding:10px 0}
.auth-sent svg{color:#5D7A2E}
.auth-foot{margin-top:18px;font-size:12px;color:#8a8c7e;line-height:1.5;display:flex;align-items:flex-start;justify-content:center;gap:6px;text-align:left}
.auth-foot svg{flex:0 0 auto;margin-top:2px}
@media(max-width:520px){.auth-wrap{align-items:flex-start;min-height:100dvh;padding:78px 12px 32px;overflow-x:hidden;overflow-y:auto}.auth-card{padding:28px 20px;box-shadow:6px 6px 0 #ff6f59;border-radius:20px}.auth-back{top:15px;left:12px}.auth-title{width:155px}.auth-tabs{margin-bottom:15px}.auth-legal-modal{padding:7px}.auth-legal-dialog{height:96dvh;border-radius:16px;box-shadow:4px 4px 0 #cdf564}.auth-legal-head{padding:10px 12px}.auth-consents{padding:11px}.auth-btn{min-height:46px}}
`;

export function useSession() {
  const [session, setSession] = useState(undefined); // undefined = yükleniyor, null = oturum yok

  useEffect(() => {
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
      setSession(data.session);
    };
    oturumuYukle();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) =>
      setSession(session),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  return session;
}

export function GirisEkrani({ redirectTo = "/summary", kayitModu = false }) {
  const [yontem, setYontem] = useState("parola");
  const [eposta, setEposta] = useState("");
  const [parola, setParola] = useState("");
  const [parolaTekrar, setParolaTekrar] = useState("");
  const [parolaGorunur, setParolaGorunur] = useState(false);
  const [oturumuAcikTut, setOturumuAcikTut] = useState(true);
  const [sozlesmeKabul, setSozlesmeKabul] = useState(false);
  const [aydinlatmaOkundu, setAydinlatmaOkundu] = useState(false);
  const [yasalMetin, setYasalMetin] = useState(null);
  const [sifirlamaModu, setSifirlamaModu] = useState(false);
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [gonderildi, setGonderildi] = useState(false);
  const [hata, setHata] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!turnstileSiteKey) return;
    window.borcamaCaptchaTamam = (token) => setCaptchaToken(token);
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
    return () => {
      delete window.borcamaCaptchaTamam;
      script.remove();
    };
  }, [turnstileSiteKey]);

  async function linkGonder(e) {
    e.preventDefault();
    if (!eposta.trim()) return;
    setGonderiliyor(true);
    setHata("");
    const { error } = await supabase.auth.signInWithOtp({
      email: eposta.trim(),
      options: {
        emailRedirectTo: window.location.origin + redirectTo,
        captchaToken: captchaToken || undefined,
        shouldCreateUser: kayitModu,
      },
    });
    setGonderiliyor(false);
    if (error)
      setHata(
        error.status === 429
          ? "Çok fazla deneme yapıldı. Lütfen biraz bekleyip tekrar deneyin."
          : kayitModu
            ? "Kayıt bağlantısı gönderilemedi. Lütfen tekrar deneyin."
            : "Bu e-postayla kayıtlı bir hesap bulunamadı veya giriş bağlantısı gönderilemedi.",
      );
    else setGonderildi(true);
  }

  async function parolaylaGiris(e) {
    e.preventDefault();
    if (!eposta.trim() || !parola) return;
    setGonderiliyor(true);
    setHata("");
    const { error } = await supabase.auth.signInWithPassword({
      email: eposta.trim(),
      password: parola,
      options: { captchaToken: captchaToken || undefined },
    });
    setGonderiliyor(false);
    if (error) {
      const kod = error.code || "";
      if (error.status === 429 || kod === "over_request_rate_limit")
        setHata("Çok fazla deneme yapıldı. Lütfen biraz bekleyin.");
      else if (["captcha_failed", "captcha_provider_disabled"].includes(kod))
        setHata(
          "Güvenlik doğrulaması başarısız oldu. Sayfayı yenileyip tekrar deneyin.",
        );
      else if (kod === "email_not_confirmed")
        setHata(
          "E-posta adresiniz henüz doğrulanmamış. Gelen kutunuzdaki doğrulama bağlantısını açın.",
        );
      else if (kod === "user_banned")
        setHata("Bu hesabın girişi geçici olarak durdurulmuş.");
      else if (kod === "invalid_credentials")
        setHata(
          "E-posta veya parola eşleşmiyor. Parolanızı kontrol edin ya da yenileme bağlantısı isteyin.",
        );
      else
        setHata(
          `Giriş tamamlanamadı${kod ? ` (Hata: ${kod})` : ""}. Lütfen tekrar deneyin.`,
        );
    } else {
      if (oturumuAcikTut) {
        localStorage.removeItem("borcama_session_only");
        sessionStorage.removeItem("borcama_session_active");
      } else {
        localStorage.setItem("borcama_session_only", "1");
        sessionStorage.setItem("borcama_session_active", "1");
      }
      window.location.href = redirectTo;
    }
  }

  async function sifirlamaLinkiGonder(e) {
    e.preventDefault();
    if (!eposta.trim()) return;
    if (!supabaseHazir) {
      setHata(
        "Yerel önizleme e-posta gönderemez. Parola yenileme işlemini canlı borcama.com giriş ekranından yapmalısınız.",
      );
      return;
    }
    setGonderiliyor(true);
    setHata("");
    const { error } = await supabase.auth.resetPasswordForEmail(eposta.trim(), {
      redirectTo: window.location.origin + "/reset-password",
      captchaToken: captchaToken || undefined,
    });
    setGonderiliyor(false);
    if (error)
      setHata(
        error.status === 429
          ? "Çok fazla deneme yapıldı. Lütfen biraz bekleyin."
          : "Parola yenileme bağlantısı gönderilemedi. Lütfen tekrar deneyin.",
      );
    else setGonderildi(true);
  }

  async function parolaylaKayit(e) {
    e.preventDefault();
    if (!eposta.trim() || !parola) return;
    if (!sozlesmeKabul || !aydinlatmaOkundu)
      return setHata(
        "Devam etmek için Kullanıcı Sözleşmesi'ni kabul etmeli ve KVKK Aydınlatma Metni'ni okuduğunuzu belirtmelisiniz.",
      );
    if (parola.length < 8) return setHata("Parolanız en az 8 karakter olmalı.");
    if (parola !== parolaTekrar)
      return setHata("Parolalar birbiriyle eşleşmiyor.");
    setGonderiliyor(true);
    setHata("");
    const { data, error } = await supabase.auth.signUp({
      email: eposta.trim(),
      password: parola,
      options: {
        emailRedirectTo: window.location.origin + redirectTo,
        captchaToken: captchaToken || undefined,
        data: {
          terms_version: "1.0",
          terms_accepted_at: new Date().toISOString(),
          privacy_version: "1.0",
          privacy_notice_read_at: new Date().toISOString(),
        },
      },
    });
    setGonderiliyor(false);
    if (error)
      setHata(
        error.status === 429
          ? "Çok fazla deneme yapıldı. Lütfen biraz bekleyin."
          : "Hesap oluşturulamadı. E-posta adresini ve parolanı kontrol edip tekrar dene.",
      );
    else if (data?.session) window.location.href = redirectTo;
    else setGonderildi(true);
  }

  function yontemDegistir(yeni) {
    setYontem(yeni);
    setHata("");
    setGonderildi(false);
  }

  return (
    <div className="auth-wrap">
      <style>{CSS}</style>
      <a className="auth-back" href="/">
        <ArrowLeft size={15} /> Ana sayfaya dön
      </a>
      <div className="auth-card">
        <img className="auth-title" src="/borcama-logo.png" alt="Borcama" />
        <div className="auth-welcome">
          {kayitModu ? "Ücretsiz hesabını oluştur" : "Hesabına giriş yap"}
        </div>
        <div className="auth-sub">
          {kayitModu
            ? "E-posta adresini ve parolanı belirle, borçlarını tek yerde takip etmeye başla."
            : "İstersen tek kullanımlık bağlantıyla, istersen parolanla giriş yap."}
        </div>
        {!kayitModu && (
          <div className="auth-tabs">
            <button
              className={"auth-tab " + (yontem === "parola" ? "active" : "")}
              onClick={() => yontemDegistir("parola")}
              type="button"
            >
              Parola
            </button>
            <button
              className={"auth-tab " + (yontem === "link" ? "active" : "")}
              onClick={() => yontemDegistir("link")}
              type="button"
            >
              E-posta linki
            </button>
          </div>
        )}

        {hata && <div className="auth-error">{hata}</div>}

        {gonderildi ? (
          <div className="auth-sent">
            <CheckCircle2 size={34} />
            <div style={{ fontWeight: 700, fontSize: 15 }}>
              {sifirlamaModu
                ? "Parola yenileme bağlantısı gönderildi"
                : kayitModu
                  ? "E-postanı kontrol et"
                  : "Link gönderildi"}
            </div>
            <div style={{ fontSize: 13, color: "#55584c" }}>
              <b style={{ color: "#14160f" }}>{eposta}</b> adresine{" "}
              {sifirlamaModu
                ? "parolanı yenileyebileceğin bir bağlantı"
                : kayitModu
                  ? "hesabını doğrulayacağın bir bağlantı"
                  : "bir giriş linki"}{" "}
              yolladık. Gelen kutunu (ve spam klasörünü) kontrol edip bağlantıya
              tıkla.
            </div>
          </div>
        ) : sifirlamaModu ? (
          <form onSubmit={sifirlamaLinkiGonder}>
            <div className="auth-help" style={{ marginBottom: 14 }}>
              Hesabındaki e-posta adresini yaz. Yeni parola belirleyebileceğin
              güvenli bağlantıyı gönderelim.
            </div>
            <input
              className="auth-input"
              type="email"
              placeholder="ornek@eposta.com"
              value={eposta}
              onChange={(e) => setEposta(e.target.value)}
              autoFocus
              required
            />
            {turnstileSiteKey && (
              <div
                className="cf-turnstile"
                data-sitekey={turnstileSiteKey}
                data-callback="borcamaCaptchaTamam"
                style={{ marginBottom: 12 }}
              />
            )}
            <button
              className="auth-btn"
              type="submit"
              disabled={
                gonderiliyor || Boolean(turnstileSiteKey && !captchaToken)
              }
            >
              <Mail size={16} />{" "}
              {gonderiliyor ? "Gönderiliyor…" : "Parola yenileme linki gönder"}
            </button>
            <button
              className="auth-reset-link"
              style={{ margin: "14px auto 0" }}
              type="button"
              onClick={() => {
                setSifirlamaModu(false);
                setHata("");
              }}
            >
              Giriş ekranına dön
            </button>
          </form>
        ) : yontem === "link" ? (
          <form onSubmit={linkGonder}>
            <input
              className="auth-input"
              type="email"
              placeholder="ornek@eposta.com"
              value={eposta}
              onChange={(e) => setEposta(e.target.value)}
              autoFocus
              required
            />
            {turnstileSiteKey && (
              <div
                className="cf-turnstile"
                data-sitekey={turnstileSiteKey}
                data-callback="borcamaCaptchaTamam"
                style={{ marginBottom: 12 }}
              />
            )}
            <button
              className="auth-btn"
              type="submit"
              disabled={
                gonderiliyor || Boolean(turnstileSiteKey && !captchaToken)
              }
            >
              <Mail size={16} />{" "}
              {gonderiliyor
                ? "Gönderiliyor…"
                : kayitModu
                  ? "Kayıt linki gönder"
                  : "Giriş linki gönder"}
            </button>
          </form>
        ) : (
          <form onSubmit={kayitModu ? parolaylaKayit : parolaylaGiris}>
            <input
              className="auth-input"
              type="email"
              placeholder="ornek@eposta.com"
              value={eposta}
              onChange={(e) => setEposta(e.target.value)}
              autoFocus
              required
            />
            <div className="auth-password">
              <input
                className="auth-input"
                type={parolaGorunur ? "text" : "password"}
                placeholder={
                  kayitModu ? "En az 8 karakter parola" : "Parolanız"
                }
                value={parola}
                onChange={(e) => setParola(e.target.value)}
                minLength={kayitModu ? 8 : undefined}
                required
              />
              <button
                className="auth-eye"
                type="button"
                aria-label={
                  parolaGorunur ? "Parolayı gizle" : "Parolayı göster"
                }
                onClick={() => setParolaGorunur(!parolaGorunur)}
              >
                {parolaGorunur ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {kayitModu && (
              <input
                className="auth-input"
                type={parolaGorunur ? "text" : "password"}
                placeholder="Parolayı tekrar yaz"
                value={parolaTekrar}
                onChange={(e) => setParolaTekrar(e.target.value)}
                required
              />
            )}
            <div className="auth-help">
              {kayitModu
                ? "Parolan en az 8 karakter olmalı."
                : "Parolanız yoksa veya unuttuysanız “E-posta linki” ile giriş yapabilirsiniz."}
            </div>
            {!kayitModu && (
              <button
                className="auth-reset-link"
                type="button"
                onClick={() => {
                  setSifirlamaModu(true);
                  setHata("");
                  setGonderildi(false);
                }}
              >
                Parolamı unuttum
              </button>
            )}
            {kayitModu && (
              <div className="auth-consents">
                <label className="auth-remember">
                  <input
                    type="checkbox"
                    checked={sozlesmeKabul}
                    onChange={(e) => setSozlesmeKabul(e.target.checked)}
                    required
                  />
                  <span>
                    <button
                      type="button"
                      onClick={() => setYasalMetin("terms")}
                    >
                      Kullanıcı Sözleşmesi
                    </button>
                    'ni okudum ve kabul ediyorum.
                  </span>
                </label>
                <label className="auth-remember">
                  <input
                    type="checkbox"
                    checked={aydinlatmaOkundu}
                    onChange={(e) => setAydinlatmaOkundu(e.target.checked)}
                    required
                  />
                  <span>
                    <button
                      type="button"
                      onClick={() => setYasalMetin("privacy")}
                    >
                      Gizlilik ve KVKK Aydınlatma Metni
                    </button>
                    'ni okudum.
                  </span>
                </label>
              </div>
            )}
            {!kayitModu && (
              <label className="auth-remember">
                <input
                  type="checkbox"
                  checked={oturumuAcikTut}
                  onChange={(e) => setOturumuAcikTut(e.target.checked)}
                />
                <span>Bu tarayıcıda oturumu açık tut</span>
              </label>
            )}
            {turnstileSiteKey && (
              <div
                className="cf-turnstile"
                data-sitekey={turnstileSiteKey}
                data-callback="borcamaCaptchaTamam"
                style={{ marginBottom: 12 }}
              />
            )}
            <button
              className="auth-btn"
              type="submit"
              disabled={
                gonderiliyor ||
                !parola ||
                (kayitModu && (!sozlesmeKabul || !aydinlatmaOkundu)) ||
                Boolean(turnstileSiteKey && !captchaToken)
              }
            >
              <KeyRound size={16} />
              {gonderiliyor
                ? kayitModu
                  ? "Hesap oluşturuluyor…"
                  : "Giriş yapılıyor…"
                : kayitModu
                  ? "Hesap oluştur"
                  : "Parolayla giriş yap"}
            </button>
          </form>
        )}

        <div className="auth-switch">
          {kayitModu ? (
            <>
              Zaten hesabın var mı? <a href="/login">Giriş yap</a>
            </>
          ) : (
            <>
              Henüz hesabın yok mu? <a href="/register">Kayıt ol</a>
            </>
          )}
        </div>
        <div className="auth-legal">
          <button type="button" onClick={() => setYasalMetin("terms")}>
            Kullanıcı Sözleşmesi
          </button>
          <span>·</span>
          <button type="button" onClick={() => setYasalMetin("privacy")}>
            Gizlilik ve KVKK
          </button>
        </div>

        <div className="auth-foot">
          <ShieldCheck size={13} />
          <span>Diğer kullanıcılar hesap verilerinize erişemez.</span>
        </div>
      </div>
      {yasalMetin && (
        <div
          className="auth-legal-modal"
          role="dialog"
          aria-modal="true"
          aria-label={
            yasalMetin === "terms"
              ? "Kullanıcı Sözleşmesi"
              : "Gizlilik ve KVKK Aydınlatma Metni"
          }
          onClick={() => setYasalMetin(null)}
        >
          <div
            className="auth-legal-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="auth-legal-head">
              <span>
                {yasalMetin === "terms"
                  ? "Kullanıcı Sözleşmesi"
                  : "Gizlilik ve KVKK Aydınlatma Metni"}
              </span>
              <button
                className="auth-legal-close"
                type="button"
                aria-label="Metni kapat"
                onClick={() => setYasalMetin(null)}
              >
                <X size={18} />
              </button>
            </div>
            <iframe
              className="auth-legal-frame"
              title={
                yasalMetin === "terms"
                  ? "Kullanıcı Sözleşmesi"
                  : "Gizlilik ve KVKK Aydınlatma Metni"
              }
              src={`/${yasalMetin}?embed=1`}
            />
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
        hata: "Parolanız en az 8 karakter olmalı.",
        tamam: false,
      });
    if (parola !== tekrar)
      return setDurum({
        kaydediliyor: false,
        hata: "Parolalar birbiriyle eşleşmiyor.",
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
      hataMesaji =
        "Parola en az 8 karakter olmalı.";
    else if (
      [
        "reauthentication_needed",
        "reauth_nonce_missing",
        "reauthentication_not_valid",
      ].includes(error?.code)
    )
      hataMesaji =
        "Güvenlik doğrulaması yenilenmeli. Giriş ekranından yeni bir parola yenileme bağlantısı iste.";
    else if (error)
      hataMesaji = `Parola yenilenemedi. Yeni bir bağlantı isteyip tekrar dene${error.code ? ` (Hata: ${error.code})` : ""}.`;
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

  return (
    <div className="auth-wrap">
      <style>{CSS}</style>
      <a className="auth-back" href="/login">
        <ArrowLeft size={15} /> Giriş ekranına dön
      </a>
      <div className="auth-card">
        <img className="auth-title" src="/borcama-logo.png" alt="Borcama" />
        {session === undefined ? (
          <div className="auth-sub">Güvenli bağlantı kontrol ediliyor…</div>
        ) : !session ? (
          <>
            <div className="auth-welcome">
              Bağlantı geçersiz veya süresi dolmuş
            </div>
            <div className="auth-sub">
              Giriş ekranındaki “Parolamı unuttum” bağlantısından yeni bir
              parola yenileme e-postası isteyebilirsin.
            </div>
            <a
              className="auth-btn"
              href="/login"
              style={{ textDecoration: "none" }}
            >
              Yeni bağlantı iste
            </a>
          </>
        ) : durum.tamam ? (
          <div className="auth-sent">
            <CheckCircle2 size={34} />
            <div style={{ fontWeight: 700, fontSize: 15 }}>Parolan hazır</div>
            <div style={{ fontSize: 13, color: "#55584c" }}>
              Bu parolayla hesabını kullanmaya devam edebilirsin.
            </div>
            <a
              className="auth-btn"
              href="/summary"
              style={{ textDecoration: "none", marginTop: 8 }}
            >
              Borcama'ya devam et
            </a>
          </div>
        ) : (
          <>
            <div className="auth-welcome">Yeni parolanı belirle</div>
            <div className="auth-sub">
              En az 8 karakterli bir parola seç.
            </div>
            {durum.hata && <div className="auth-error">{durum.hata}</div>}
            <form onSubmit={parolayiKaydet}>
              <div className="auth-password">
                <input
                  className="auth-input"
                  type={gorunur ? "text" : "password"}
                  placeholder="Yeni parola"
                  value={parola}
                  onChange={(e) => setParola(e.target.value)}
                  autoFocus
                  required
                  minLength={8}
                />
                <button
                  className="auth-eye"
                  type="button"
                  aria-label={gorunur ? "Parolayı gizle" : "Parolayı göster"}
                  onClick={() => setGorunur(!gorunur)}
                >
                  {gorunur ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              <input
                className="auth-input"
                type={gorunur ? "text" : "password"}
                placeholder="Yeni parolayı tekrar yaz"
                value={tekrar}
                onChange={(e) => setTekrar(e.target.value)}
                required
                minLength={8}
              />
              <button
                className="auth-btn"
                type="submit"
                disabled={durum.kaydediliyor || !parola || !tekrar}
              >
                <KeyRound size={16} />
                {durum.kaydediliyor ? "Kaydediliyor…" : "Yeni parolayı kaydet"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export function CikisButonu({ className }) {
  return (
    <button
      className={className}
      onClick={() => supabase.auth.signOut()}
      title="Çıkış yap"
    >
      <LogOut size={15} /> Çıkış
    </button>
  );
}
