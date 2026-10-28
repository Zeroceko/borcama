import { t, tOgeler } from "./i18n.js";
import React, { useLayoutEffect, useRef, useState } from "react";
import { izinBandiYeri, useKabukDurumu } from "./kabukDurumu.js";
import {
  googleAdsOlcumIzniAyarla,
  googleAdsOlcumTercihi,
} from "./googleAds.js";

export default function GoogleAdsConsent() {
  const [tercihYapildi, setTercihYapildi] = useState(
    () => googleAdsOlcumTercihi() !== null,
  );

  const kabuk = useKabukDurumu();
  const yol = typeof window === "undefined" ? "/" : window.location.pathname.replace(/\/+$/, "") || "/";
  const yer = izinBandiYeri({ yol, ...kabuk });
  const gorunur = !tercihYapildi && yer !== "yok";
  const bantRef = useRef(null);

  // Uygulamada bant üstte durur; yüksekliği kadar içerik aşağı itilir
  // (≥1024 kuralı CSS'te), hiçbir düğmeyi örtmez.
  useLayoutEffect(() => {
    const kok = document.documentElement;
    if (!gorunur || yer !== "ust" || !bantRef.current) {
      kok.classList.remove("gac-ustte");
      return undefined;
    }
    const olc = () => kok.style.setProperty("--gac-yukseklik", `${bantRef.current?.offsetHeight || 0}px`);
    olc();
    kok.classList.add("gac-ustte");
    const gozlem = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(olc);
    gozlem?.observe(bantRef.current);
    return () => {
      gozlem?.disconnect();
      kok.classList.remove("gac-ustte");
    };
  }, [gorunur, yer]);

  if (!gorunur) return null;

  function sec(izinVar) {
    googleAdsOlcumIzniAyarla(izinVar);
    setTercihYapildi(true);
  }

  return (
    <>
      <style>{CSS}</style>
      <aside ref={bantRef} className={`gac${yer === "ust" ? " ust" : ""}`} aria-label={t("web.olcum.aria")}>
      <div className="gac-text">
        <strong>{t("web.olcum.baslik")}</strong>
        <span>
          {tOgeler("web.olcum.metin", { link: <a key="l" href="/privacy">{t("web.olcum.link")}</a> })}
        </span>
      </div>
      <div className="gac-actions">
        <button type="button" className="gac-reject" onClick={() => sec(false)}>
          {t("web.olcum.reddet")}
        </button>
        <button type="button" className="gac-accept" onClick={() => sec(true)}>
          {t("web.olcum.izin")}
        </button>
      </div>
    </aside>
    </>
  );
}

const CSS = `
.gac,.gac *{box-sizing:border-box}.gac{position:fixed;z-index:2000;left:16px;right:16px;bottom:16px;display:flex;align-items:center;justify-content:space-between;gap:18px;width:min(760px,calc(100% - 32px));margin:0 auto;padding:15px 16px;border:1px solid #14160f33;border-radius:18px;background:#fffdf7;color:#14160f;box-shadow:0 16px 45px #14160f2b;font-family:'Space Grotesk',system-ui,sans-serif}.gac-text{display:grid;gap:4px;min-width:0;font-size:12px;line-height:1.45}.gac-text strong{font-size:13px}.gac-text a{color:#315c47;font-weight:800}.gac-actions{display:flex;flex:0 0 auto;gap:8px}.gac button{min-height:40px;padding:0 15px;border:1px solid #14160f40;border-radius:999px;background:#fff;color:#14160f;font:800 12px 'Space Grotesk',system-ui,sans-serif;cursor:pointer}.gac .gac-accept{border-color:#14160f;background:#cdf564}
@media(min-width:1024px){.gac.ust{top:0;bottom:auto;left:0;right:0;width:100%;max-width:none;margin:0;padding:12px max(32px,calc((100% - 1120px)/2));border-width:0 0 1px;border-radius:0;box-shadow:none}html.gac-ustte body{padding-top:var(--gac-yukseklik,0px)}}
@media(max-width:620px){.gac{left:10px;right:10px;bottom:10px;display:grid;gap:13px;width:calc(100% - 20px);padding:16px;border-radius:16px}.gac-text{font-size:12.5px;line-height:1.5}.gac-actions{display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr)}.gac button{min-height:44px;padding:0 10px}}
`;
