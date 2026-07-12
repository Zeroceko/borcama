import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient.js";
import { ArrowLeft, Mail, ShieldCheck, LogOut, CheckCircle2, KeyRound, Eye, EyeOff } from "lucide-react";

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
.auth-switch{margin-top:17px;padding-top:16px;border-top:1px solid #dedbce;text-align:center;font-size:12.5px;color:#66695d}
.auth-switch a{color:#14160f;font-weight:800;text-decoration:underline;text-underline-offset:3px}
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
@media(max-width:520px){.auth-card{padding:34px 24px;box-shadow:7px 7px 0 #ff6f59}.auth-back{top:16px;left:16px}.auth-title{width:170px}.auth-wrap{padding-top:80px}}
`;

export function useSession() {
  const [session, setSession] = useState(undefined); // undefined = yükleniyor, null = oturum yok

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
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
    if (error) setHata(error.status === 429 ? "Çok fazla deneme yapıldı. Lütfen biraz bekleyip tekrar deneyin." : kayitModu ? "Kayıt bağlantısı gönderilemedi. Lütfen tekrar deneyin." : "Bu e-postayla kayıtlı bir hesap bulunamadı veya giriş bağlantısı gönderilemedi.");
    else setGonderildi(true);
  }

  async function parolaylaGiris(e) {
    e.preventDefault();
    if (!eposta.trim() || !parola) return;
    setGonderiliyor(true); setHata("");
    const { error } = await supabase.auth.signInWithPassword({ email: eposta.trim(), password: parola, options: { captchaToken: captchaToken || undefined } });
    setGonderiliyor(false);
    if (error) setHata(error.status === 429 ? "Çok fazla deneme yapıldı. Lütfen biraz bekleyin." : "E-posta veya parola hatalı. Parolanız yoksa giriş linki kullanabilirsiniz.");
    else window.location.href = redirectTo;
  }

  async function parolaylaKayit(e) {
    e.preventDefault();
    if (!eposta.trim() || !parola) return;
    if (parola.length < 8) return setHata("Parolanız en az 8 karakter olmalı.");
    if (parola !== parolaTekrar) return setHata("Parolalar birbiriyle eşleşmiyor.");
    setGonderiliyor(true); setHata("");
    const { data, error } = await supabase.auth.signUp({
      email: eposta.trim(),
      password: parola,
      options: { emailRedirectTo: window.location.origin + redirectTo, captchaToken: captchaToken || undefined },
    });
    setGonderiliyor(false);
    if (error) setHata(error.status === 429 ? "Çok fazla deneme yapıldı. Lütfen biraz bekleyin." : "Hesap oluşturulamadı. E-posta adresini ve parolanı kontrol edip tekrar dene.");
    else if (data?.session) window.location.href = redirectTo;
    else setGonderildi(true);
  }

  function yontemDegistir(yeni) {
    setYontem(yeni); setHata(""); setGonderildi(false);
  }

  return (
    <div className="auth-wrap">
      <style>{CSS}</style>
      <a className="auth-back" href="/"><ArrowLeft size={15} /> Ana sayfaya dön</a>
      <div className="auth-card">
        <img className="auth-title" src="/borcama-logo.png" alt="Borcama" />
        <div className="auth-welcome">{kayitModu ? "Ücretsiz hesabını oluştur" : "Hesabına giriş yap"}</div>
        <div className="auth-sub">{kayitModu ? "E-posta adresini ve parolanı belirle, borçlarını tek yerde takip etmeye başla." : "İstersen tek kullanımlık bağlantıyla, istersen parolanla giriş yap."}</div>
        {!kayitModu && <div className="auth-tabs"><button className={"auth-tab " + (yontem === "parola" ? "active" : "")} onClick={() => yontemDegistir("parola")} type="button">Parola</button><button className={"auth-tab " + (yontem === "link" ? "active" : "")} onClick={() => yontemDegistir("link")} type="button">E-posta linki</button></div>}

        {hata && <div className="auth-error">{hata}</div>}

        {gonderildi ? (
          <div className="auth-sent">
            <CheckCircle2 size={34} />
            <div style={{ fontWeight: 700, fontSize: 15 }}>{kayitModu ? "E-postanı kontrol et" : "Link gönderildi"}</div>
            <div style={{ fontSize: 13, color: "#55584c" }}>
              <b style={{ color: "#14160f" }}>{eposta}</b> adresine {kayitModu ? "hesabını doğrulayacağın bir bağlantı" : "bir giriş linki"} yolladık. Gelen kutunu
              (ve spam klasörünü) kontrol edip bağlantıya tıkla.
            </div>
          </div>
        ) : yontem === "link" ? (
          <form onSubmit={linkGonder}>
            <input
              className="auth-input" type="email" placeholder="ornek@eposta.com" value={eposta}
              onChange={(e) => setEposta(e.target.value)} autoFocus required
            />
            {turnstileSiteKey && <div className="cf-turnstile" data-sitekey={turnstileSiteKey} data-callback="borcamaCaptchaTamam" style={{ marginBottom: 12 }} />}
            <button className="auth-btn" type="submit" disabled={gonderiliyor || Boolean(turnstileSiteKey && !captchaToken)}>
              <Mail size={16} /> {gonderiliyor ? "Gönderiliyor…" : kayitModu ? "Kayıt linki gönder" : "Giriş linki gönder"}
            </button>
          </form>
        ) : <form onSubmit={kayitModu ? parolaylaKayit : parolaylaGiris}><input className="auth-input" type="email" placeholder="ornek@eposta.com" value={eposta} onChange={(e) => setEposta(e.target.value)} autoFocus required/><div className="auth-password"><input className="auth-input" type={parolaGorunur ? "text" : "password"} placeholder={kayitModu ? "En az 8 karakter parola" : "Parolanız"} value={parola} onChange={(e) => setParola(e.target.value)} minLength={kayitModu ? 8 : undefined} required/><button className="auth-eye" type="button" aria-label={parolaGorunur ? "Parolayı gizle" : "Parolayı göster"} onClick={() => setParolaGorunur(!parolaGorunur)}>{parolaGorunur ? <EyeOff size={17}/> : <Eye size={17}/>}</button></div>{kayitModu && <input className="auth-input" type={parolaGorunur ? "text" : "password"} placeholder="Parolayı tekrar yaz" value={parolaTekrar} onChange={(e) => setParolaTekrar(e.target.value)} required/>}<div className="auth-help">{kayitModu ? "Parolan en az 8 karakter olmalı." : "Parolanız yoksa veya unuttuysanız “E-posta linki” ile giriş yapabilirsiniz."}</div>{turnstileSiteKey && <div className="cf-turnstile" data-sitekey={turnstileSiteKey} data-callback="borcamaCaptchaTamam" style={{ marginBottom: 12 }}/>}<button className="auth-btn" type="submit" disabled={gonderiliyor || !parola || Boolean(turnstileSiteKey && !captchaToken)}><KeyRound size={16}/>{gonderiliyor ? (kayitModu ? "Hesap oluşturuluyor…" : "Giriş yapılıyor…") : (kayitModu ? "Hesap oluştur" : "Parolayla giriş yap")}</button></form>}

        <div className="auth-switch">{kayitModu ? <>Zaten hesabın var mı? <a href="/login">Giriş yap</a></> : <>Henüz hesabın yok mu? <a href="/register">Kayıt ol</a></>}</div>

        <div className="auth-foot">
          <ShieldCheck size={13} />
          <span>Diğer kullanıcılar hesap verilerinize erişemez.</span>
        </div>
      </div>
    </div>
  );
}

export function CikisButonu({ className }) {
  return (
    <button className={className} onClick={() => supabase.auth.signOut()} title="Çıkış yap">
      <LogOut size={15} /> Çıkış
    </button>
  );
}
