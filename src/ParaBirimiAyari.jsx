import React from "react";
import { Coins } from "lucide-react";
import { t } from "./i18n.js";
import { DESTEKLENEN_PARA_BIRIMLERI, kullaniciParaBirimi, paraBirimiAdi, paraBirimiAyarla } from "./currencyInput.js";

// Ayarlar > Para birimi (native ve web). Tum tutar gosterimleri yeniden
// okunsun diye secimden sonra uygulama yeniden yuklenir. Kur cevirisi
// yapilmaz.
export default function ParaBirimiAyari() {
  const secili = kullaniciParaBirimi();
  return (
    <section className="bt-settings-card">
      <div className="bt-settings-title">
        <Coins size={18} /> {t("paraBirimi.baslik")}
      </div>
      <div className="bt-setting-row">
        <div>
          <strong>{t("paraBirimi.satir")}</strong>
          <small>{t("paraBirimi.aciklama")}</small>
        </div>
        <select
          className="bt-input"
          style={{ width: "auto", minWidth: 120 }}
          aria-label={t("paraBirimi.seciciEtiket")}
          value={secili}
          onChange={(olay) => {
            const yeni = olay.target.value;
            if (yeni === secili) return;
            paraBirimiAyarla(yeni);
            globalThis.location?.reload();
          }}
        >
          {DESTEKLENEN_PARA_BIRIMLERI.map((kod) => (
            <option key={kod} value={kod}>
              {kod} · {paraBirimiAdi(kod)}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}
