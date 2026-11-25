// Klasik görünümdeki kullanıcıya bir kez "Borcama 2.0'ı dene" duyurusu.
// Görüldü bilgisi hesap ayarlarına (borcama2DuyuruV1) yazılır; web ve iOS
// aynı kaydı okuduğu için iki yerde de yalnız bir kez çıkar.
import { useEffect } from "react";
import { Sparkles } from "lucide-react";
import { t } from "./i18n.js";

const MADDELER = ["bugun", "borclarim", "harcamalarim", "ekle", "menu"];

export function borcama2DuyurusuGosterilsinMi({ veri, yeniMi, mesgul }) {
  if (yeniMi || mesgul) return false;
  return !veri?.ayarlar?.borcama2DuyuruV1;
}

export function Borcama2Duyurusu({ dene, kapat }) {
  useEffect(() => {
    const onceki = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const tus = (e) => { if (e.key === "Escape") kapat(); };
    window.addEventListener("keydown", tus);
    return () => {
      document.body.style.overflow = onceki;
      window.removeEventListener("keydown", tus);
    };
  }, [kapat]);

  return (
    <div className="bt-modal-arka" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) kapat(); }}>
      <section className="bt-modal b2-duyuru" role="dialog" aria-modal="true" aria-labelledby="b2-duyuru-baslik">
        <div className="b2-rozet"><Sparkles size={14} aria-hidden="true" /> {t("yeni.duyuru.rozet")}</div>
        <h2 id="b2-duyuru-baslik">{t("yeni.duyuru.baslik")}</h2>
        <p className="b2-giris">{t("yeni.duyuru.giris")}</p>
        <ul className="b2-liste">
          {MADDELER.map((m) => (
            <li key={m}>
              <strong>{t(`yeni.duyuru.${m}.baslik`)}</strong>
              <span>{t(`yeni.duyuru.${m}.metin`)}</span>
            </li>
          ))}
        </ul>
        <p className="b2-not">{t("yeni.duyuru.not")}</p>
        <div className="b2-eylem">
          <button type="button" className="bt-btn birincil" onClick={dene} autoFocus>{t("yeni.duyuru.dene")}</button>
          <button type="button" className="bt-btn ikincil" onClick={kapat}>{t("yeni.duyuru.sonra")}</button>
        </div>
      </section>
    </div>
  );
}
