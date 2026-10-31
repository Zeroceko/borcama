import React, { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import { nativeMi } from "./platform.js";
import { t } from "./i18n.js";
import { kullanimIzniniAyarla, kullanimIzniniEsitle, kullanimIzniVarMi } from "./kullanimIstatistigi.js";

// Kullanim istatistikleri izni. Yalniz native'de ve hesapli kullanicida
// gorunur; varsayilan kapali, tek dokunusla geri alinir.
export default function KullanimIstatistigiAyari() {
  const [acik, setAcik] = useState(() => kullanimIzniVarMi());
  const [islemde, setIslemde] = useState(false);
  const [hata, setHata] = useState(false);
  const [metinAcik, setMetinAcik] = useState(false);

  useEffect(() => {
    if (!nativeMi) return undefined;
    let iptal = false;
    kullanimIzniniEsitle().then((izin) => {
      if (!iptal) setAcik(izin);
    });
    return () => {
      iptal = true;
    };
  }, []);

  if (!nativeMi) return null;

  async function degistir() {
    setIslemde(true);
    setHata(false);
    try {
      const istenen = !acik;
      const sonuc = await kullanimIzniniAyarla(istenen);
      setAcik(sonuc);
      if (sonuc !== istenen) setHata(true);
    } finally {
      setIslemde(false);
    }
  }

  return (
    <section className="bt-settings-card">
      <div className="bt-settings-title">
        <BarChart3 size={18} /> {t("bilesen.kullanim.baslik")}
      </div>
      <div className="bt-setting-row">
        <div>
          <strong>{t("bilesen.kullanim.satir")}</strong>
          <small>
            {acik ? t("bilesen.kullanim.acikAciklama") : t("bilesen.kullanim.kapaliAciklama")}
          </small>
          {hata && (
            <small style={{ color: "var(--coral)", marginTop: 6 }}>{t("bilesen.kullanim.hata")}</small>
          )}
          <button
            className="bt-kullanim-metin-dugme"
            type="button"
            aria-expanded={metinAcik}
            onClick={() => setMetinAcik((o) => !o)}
          >
            {metinAcik ? t("bilesen.kullanim.ayrintiKapat") : t("bilesen.kullanim.ayrintiAc")}
          </button>
        </div>
        <button className="bt-btn kucuk ikincil bt-kullanim-dugme" type="button" disabled={islemde} onClick={degistir}>
          {acik ? t("bilesen.kullanim.kapat") : t("bilesen.kullanim.ac")}
        </button>
      </div>
      {metinAcik && (
        <div className="bt-kullanim-metin">
          {["metin1", "metin2", "metin3", "metin4", "metin5"].map((anahtar) => (
            <p key={anahtar}>{t(`bilesen.kullanim.${anahtar}`)}</p>
          ))}
          <a href="/privacy" target="_blank" rel="noreferrer">{t("bilesen.kullanim.gizlilik")}</a>
        </div>
      )}
    </section>
  );
}
