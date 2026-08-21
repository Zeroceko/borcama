import React, { useState } from "react";
import {
  googleAdsOlcumIzniAyarla,
  googleAdsOlcumTercihi,
} from "./googleAds.js";

export default function GoogleAdsConsent() {
  const [tercihYapildi, setTercihYapildi] = useState(
    () => googleAdsOlcumTercihi() !== null,
  );

  if (tercihYapildi) return null;

  function sec(izinVar) {
    googleAdsOlcumIzniAyarla(izinVar);
    setTercihYapildi(true);
  }

  return (
    <aside style={STILLER.kutu} aria-label="Reklam ölçüm tercihi">
      <div style={STILLER.metin}>
        <strong style={STILLER.baslik}>Ölçüm tercihin</strong>
        <span>
          Borcama, reklamların hesap kaydı getirip getirmediğini ölçmek için
          isteğe bağlı Google Ads ölçümü kullanır. E-posta ve finansal
          bilgilerin bu ölçüme eklenmez. Ayrıntılar için{" "}
          <a href="/privacy" style={STILLER.link}>Gizlilik ve KVKK</a>.
        </span>
      </div>
      <div style={STILLER.aksiyonlar}>
        <button type="button" style={STILLER.reddet} onClick={() => sec(false)}>
          Reddet
        </button>
        <button type="button" style={STILLER.kabul} onClick={() => sec(true)}>
          Ölçüme izin ver
        </button>
      </div>
    </aside>
  );
}

const STILLER = {
  kutu: {
    position: "fixed",
    zIndex: 2000,
    left: 16,
    right: 16,
    bottom: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 18,
    width: "min(760px, calc(100% - 32px))",
    margin: "0 auto",
    padding: "15px 16px",
    border: "1px solid #14160f33",
    borderRadius: 18,
    background: "#fffdf7",
    color: "#14160f",
    boxShadow: "0 16px 45px #14160f2b",
    fontFamily: "Space Grotesk, system-ui, sans-serif",
  },
  metin: { display: "grid", gap: 4, fontSize: 12, lineHeight: 1.45 },
  baslik: { fontSize: 13 },
  link: { color: "#315c47", fontWeight: 800 },
  aksiyonlar: { display: "flex", flex: "0 0 auto", gap: 8 },
  reddet: {
    minHeight: 38,
    padding: "0 14px",
    border: "1px solid #14160f40",
    borderRadius: 999,
    background: "#fff",
    color: "#14160f",
    fontWeight: 800,
    cursor: "pointer",
  },
  kabul: {
    minHeight: 38,
    padding: "0 16px",
    border: "1px solid #14160f",
    borderRadius: 999,
    background: "#cdf564",
    color: "#14160f",
    fontWeight: 800,
    cursor: "pointer",
  },
};
