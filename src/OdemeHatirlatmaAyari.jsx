import React, { useState } from "react";
import { BellRing } from "lucide-react";
import { nativeMi } from "./platform.js";
import { t } from "./i18n.js";
import { hassasModAcikMi, hassasModuAyarla, hatirlatmaAcikMi, hatirlatmayiAyarla } from "./odemeBildirimi.js";

// Odeme hatirlatmasi ayari. Yalniz native'de gorunur; kullanici acikca
// acmadan hicbir bildirim kurulmaz.
export default function OdemeHatirlatmaAyari() {
  const [acik, setAcik] = useState(() => hatirlatmaAcikMi());
  const [hassas, setHassas] = useState(() => hassasModAcikMi());
  const [islemde, setIslemde] = useState(false);
  const [uyari, setUyari] = useState("");

  if (!nativeMi) return null;

  async function degistir() {
    setIslemde(true);
    setUyari("");
    try {
      const sonuc = await hatirlatmayiAyarla(!acik);
      setAcik(sonuc);
      if (!acik && !sonuc) {
        setUyari(t("bilesen.hatirlatma.izinYok"));
      }
    } finally {
      setIslemde(false);
    }
  }

  async function hassasDegistir() {
    setIslemde(true);
    try {
      setHassas(await hassasModuAyarla(!hassas));
    } finally {
      setIslemde(false);
    }
  }

  return (
    <section className="bt-settings-card">
      <div className="bt-settings-title">
        <BellRing size={18} /> {t("bilesen.hatirlatma.baslik")}
      </div>
      <div className="bt-setting-row">
        <div>
          <strong>{t("bilesen.hatirlatma.satir")}</strong>
          <small>
            {acik
              ? t("bilesen.hatirlatma.acikAciklama")
              : t("bilesen.hatirlatma.kapaliAciklama")}
          </small>
          {uyari && (
            <small style={{ color: "var(--coral)", marginTop: 6 }}>{uyari}</small>
          )}
        </div>
        <button className="bt-btn kucuk ikincil" type="button" disabled={islemde} onClick={degistir}>
          {acik ? t("bilesen.hatirlatma.kapat") : t("bilesen.hatirlatma.ac")}
        </button>
      </div>
      {acik && (
        <div className="bt-setting-row">
          <div>
            <strong>{t("bilesen.hatirlatma.hassas")}</strong>
            <small>
              {hassas
                ? t("bilesen.hatirlatma.hassasAcikAciklama")
                : t("bilesen.hatirlatma.hassasKapaliAciklama")}
            </small>
          </div>
          <button className="bt-btn kucuk ikincil" type="button" disabled={islemde} onClick={hassasDegistir}>
            {hassas ? t("bilesen.hatirlatma.hassasKapat") : t("bilesen.hatirlatma.hassasAc")}
          </button>
        </div>
      )}
    </section>
  );
}
