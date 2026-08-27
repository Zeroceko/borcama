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
    <>
      <style>{CSS}</style>
      <aside className="gac" aria-label="Analytics ve reklam ölçüm tercihi">
      <div className="gac-text">
        <strong>Ölçüm tercihin</strong>
        <span>
          Borcama, site kullanımını ve reklamların hesap kaydı getirip
          getirmediğini ölçmek için isteğe bağlı Google Analytics ve Google Ads
          ölçümü kullanır. E-posta ve finansal bilgiler bu ölçüme eklenmez.
          Ayrıntılar için{" "}
          <a href="/privacy">Gizlilik ve KVKK</a>.
        </span>
      </div>
      <div className="gac-actions">
        <button type="button" className="gac-reject" onClick={() => sec(false)}>
          Reddet
        </button>
        <button type="button" className="gac-accept" onClick={() => sec(true)}>
          Ölçüme izin ver
        </button>
      </div>
    </aside>
    </>
  );
}

const CSS = `
.gac,.gac *{box-sizing:border-box}.gac{position:fixed;z-index:2000;left:16px;right:16px;bottom:16px;display:flex;align-items:center;justify-content:space-between;gap:18px;width:min(760px,calc(100% - 32px));margin:0 auto;padding:15px 16px;border:1px solid #14160f33;border-radius:18px;background:#fffdf7;color:#14160f;box-shadow:0 16px 45px #14160f2b;font-family:'Space Grotesk',system-ui,sans-serif}.gac-text{display:grid;gap:4px;min-width:0;font-size:12px;line-height:1.45}.gac-text strong{font-size:13px}.gac-text a{color:#315c47;font-weight:800}.gac-actions{display:flex;flex:0 0 auto;gap:8px}.gac button{min-height:40px;padding:0 15px;border:1px solid #14160f40;border-radius:999px;background:#fff;color:#14160f;font:800 12px 'Space Grotesk',system-ui,sans-serif;cursor:pointer}.gac .gac-accept{border-color:#14160f;background:#cdf564}
@media(max-width:620px){.gac{left:10px;right:10px;bottom:10px;display:grid;gap:13px;width:calc(100% - 20px);padding:16px;border-radius:16px}.gac-text{font-size:12.5px;line-height:1.5}.gac-actions{display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr)}.gac button{min-height:44px;padding:0 10px}}
`;
