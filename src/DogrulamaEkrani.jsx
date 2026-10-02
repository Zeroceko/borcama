import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient.js";
import { derinBaglantiAyristir } from "./derinBaglantiAdres.js";

// E-postadaki dogrulama baglantisi iOS'ta universal link oldugu icin uygulama
// kuruluysa bu ekran hic gorunmez; baglanti dogrudan uygulamada acilir. Bu
// ekran uygulamanin kurulu olmadigi durumlar icindir: bilgisayar, Android ya
// da uygulamayi silmis bir kullanici. Ayni tek kullanimlik anahtarla oturumu
// tarayicida kurar ve kullaniciyi uygulamaya birakir.
export default function DogrulamaEkrani() {
  const [hata, setHata] = useState("");

  useEffect(() => {
    let iptal = false;
    (async () => {
      const veri = derinBaglantiAyristir(window.location.href);
      if (!veri || veri.hata) {
        if (!iptal) setHata("Bağlantı geçersiz ya da süresi dolmuş.");
        return;
      }
      try {
        if (veri.dogrulamaAnahtari) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: veri.dogrulamaAnahtari,
            type: veri.tur || "signup",
          });
          if (error) throw error;
        } else if (veri.erisimAnahtari && veri.yenilemeAnahtari) {
          const { error } = await supabase.auth.setSession({
            access_token: veri.erisimAnahtari,
            refresh_token: veri.yenilemeAnahtari,
          });
          if (error) throw error;
        } else {
          throw new Error("Bağlantıda doğrulama bilgisi yok.");
        }
      } catch {
        if (!iptal) setHata("Bağlantı geçersiz ya da süresi dolmuş.");
        return;
      }
      if (!iptal) window.location.assign(veri.hedef);
    })();
    return () => {
      iptal = true;
    };
  }, []);

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background: "#f4efe0",
        color: "#14160f",
        fontFamily: "Space Grotesk, system-ui, sans-serif",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: 420 }}>
        <img
          src="/borcama-logo-368.png"
          alt="Borcama"
          width="368"
          height="90"
          style={{ width: 150, height: "auto", marginBottom: 18 }}
        />
        <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: hata ? "#a53a2a" : "#5d6054" }}>
          {hata || "Hesabın doğrulanıyor…"}
        </p>
        {hata && (
          <p style={{ marginTop: 18 }}>
            <a href="/login" style={{ color: "#315c47", fontWeight: 800 }}>
              Giriş ekranına dön
            </a>
          </p>
        )}
      </div>
    </main>
  );
}
