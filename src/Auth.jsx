import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient.js";
import { Mail, ShieldCheck, LogOut, CheckCircle2 } from "lucide-react";

const CSS = `
.auth-wrap{
  min-height:100vh; display:flex; align-items:center; justify-content:center; padding:20px;
  font-family:'Inter',system-ui,sans-serif;
  background:radial-gradient(1100px 500px at 80% -10%, #17233C 0%, #0E1420 55%);
  color:#EDF1F9;
}
.auth-card{
  width:100%; max-width:380px; background:#161E2E; border:1px solid #26324A;
  border-radius:20px; padding:32px 28px;
}
.auth-eyebrow{font-size:11px;font-weight:700;letter-spacing:.22em;color:#43D9A3;text-transform:uppercase}
.auth-title{font-family:'Space Grotesk',sans-serif;font-size:22px;font-weight:700;margin:6px 0 4px;letter-spacing:-0.02em}
.auth-sub{font-size:13.5px;color:#8C99B3;line-height:1.5;margin-bottom:22px}
.auth-input{
  width:100%; padding:12px 14px; border-radius:10px; border:1px solid #26324A;
  background:#0E1420; color:#EDF1F9; font-size:14px; font-family:inherit; margin-bottom:12px;
}
.auth-input::placeholder{color:#5B6880}
.auth-btn{
  width:100%; padding:12px 0; border-radius:10px; border:none; background:#43D9A3; color:#08251B;
  font-weight:700; font-size:14px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;
}
.auth-btn:disabled{opacity:.6; cursor:default}
.auth-btn:hover:not(:disabled){filter:brightness(1.08)}
.auth-error{background:#3A1E22;border:1px solid #5C2B31;color:#F87171;font-size:13px;border-radius:10px;padding:10px 12px;margin-bottom:12px}
.auth-sent{display:flex;flex-direction:column;align-items:center;text-align:center;gap:10px;padding:10px 0}
.auth-sent svg{color:#43D9A3}
.auth-foot{margin-top:18px;font-size:12px;color:#5B6880;text-align:center;line-height:1.5}
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

export function GirisEkrani() {
  const [eposta, setEposta] = useState("");
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [gonderildi, setGonderildi] = useState(false);
  const [hata, setHata] = useState("");

  async function linkGonder(e) {
    e.preventDefault();
    if (!eposta.trim()) return;
    setGonderiliyor(true);
    setHata("");
    const { error } = await supabase.auth.signInWithOtp({
      email: eposta.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    setGonderiliyor(false);
    if (error) setHata("Link gönderilemedi: " + error.message);
    else setGonderildi(true);
  }

  return (
    <div className="auth-wrap">
      <style>{CSS}</style>
      <div className="auth-card">
        <div className="auth-eyebrow">Kişisel finans defteri</div>
        <div className="auth-title">Borç &amp; Harcama Takibi</div>
        <div className="auth-sub">
          Verilerinize her cihazdan ulaşmak için e-posta adresinizle giriş yapın. Şifre yok — e-postanıza
          gelen linke tıklamanız yeterli.
        </div>

        {hata && <div className="auth-error">{hata}</div>}

        {gonderildi ? (
          <div className="auth-sent">
            <CheckCircle2 size={34} />
            <div style={{ fontWeight: 700, fontSize: 15 }}>Link gönderildi</div>
            <div style={{ fontSize: 13, color: "#8C99B3" }}>
              <b style={{ color: "#EDF1F9" }}>{eposta}</b> adresine bir giriş linki yolladık. Gelen kutunuzu
              (ve spam klasörünü) kontrol edip linke tıklayın — bu sekmeye otomatik döneceksiniz.
            </div>
          </div>
        ) : (
          <form onSubmit={linkGonder}>
            <input
              className="auth-input" type="email" placeholder="ornek@eposta.com" value={eposta}
              onChange={(e) => setEposta(e.target.value)} autoFocus required
            />
            <button className="auth-btn" type="submit" disabled={gonderiliyor}>
              <Mail size={16} /> {gonderiliyor ? "Gönderiliyor…" : "Giriş linki gönder"}
            </button>
          </form>
        )}

        <div className="auth-foot">
          <ShieldCheck size={13} style={{ verticalAlign: "-2px", marginRight: 4 }} />
          Verileriniz yalnızca sizin hesabınıza bağlıdır, başka kimse göremez.
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
