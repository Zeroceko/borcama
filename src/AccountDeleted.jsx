import React, { useEffect, useState } from "react";
import { HESAP_SILME_YONLENDIRME_SURESI_MS } from "./accountDeletion.js";

export default function HesapSilindiEkrani() {
  const toplamSaniye = HESAP_SILME_YONLENDIRME_SURESI_MS / 1000;
  const [kalanSaniye, setKalanSaniye] = useState(toplamSaniye);

  useEffect(() => {
    const sayac = window.setInterval(() => {
      setKalanSaniye((eski) => Math.max(0, eski - 1));
    }, 1000);
    const yonlendirme = window.setTimeout(() => {
      window.location.replace("/");
    }, HESAP_SILME_YONLENDIRME_SURESI_MS);
    return () => {
      window.clearInterval(sayac);
      window.clearTimeout(yonlendirme);
    };
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background: "#f4efe0",
        color: "#14160f",
        fontFamily: "Space Grotesk, system-ui, sans-serif",
      }}
    >
      <section
        role="status"
        aria-live="polite"
        style={{
          width: "min(100%, 560px)",
          padding: "clamp(28px, 7vw, 48px)",
          border: "3px solid #14160f",
          borderRadius: 28,
          background: "#fff",
          boxShadow: "10px 10px 0 #cdf564",
          textAlign: "center",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            width: 58,
            height: 58,
            display: "grid",
            placeItems: "center",
            margin: "0 auto 18px",
            borderRadius: "50%",
            background: "#cdf564",
            fontSize: 30,
            fontWeight: 900,
          }}
        >
          ✓
        </div>
        <h1 style={{ margin: "0 0 12px", fontSize: "clamp(30px, 7vw, 46px)" }}>
          Hesabın silindi.
        </h1>
        <p style={{ margin: "0 auto 24px", maxWidth: 430, color: "#5d6054", lineHeight: 1.65 }}>
          Borcama hesabın ve hesabına bağlı kayıtlar kalıcı olarak silindi.
          {" "}{kalanSaniye} saniye içinde ana sayfaya yönlendiriliyorsun.
        </p>
        <a
          href="/"
          style={{
            display: "inline-flex",
            minHeight: 48,
            alignItems: "center",
            justifyContent: "center",
            padding: "0 24px",
            border: "2px solid #14160f",
            borderRadius: 999,
            background: "#cdf564",
            color: "#14160f",
            fontWeight: 800,
            textDecoration: "none",
          }}
        >
          Ana sayfaya dön →
        </a>
      </section>
    </main>
  );
}
