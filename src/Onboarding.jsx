import React, { useRef, useState } from "react";
import { ArrowRight, Check, Diamond, Target, Wallet } from "lucide-react";
import { onboardingTamamla } from "./onboardingDurumu.js";
import { misafirModunuAc } from "./misafirModu.js";
import { t } from "./i18n.js";
import DilDugmesi from "./DilDugmesi.jsx";
import ParaBirimiSecici from "./ParaBirimiSecici.jsx";
import { kullaniciParaBirimi, paraBiriminiFormatla } from "./currencyInput.js";
import { ornekTutar } from "./bolgeKurallari.js";
import "./onboarding.css";

// iOS onboarding: dort ekran. Ilk uc ekran urunun ne yaptigini anlatir,
// dorduncusu karar ekranidir. Metinler Borcama'nin mevcut yetenekleriyle
// sinirlidir; banka baglantisi veya otomatik veri cekme vaadi yoktur.
// Metinler sozluk anahtaridir; ekranda t() ile secili dile cevrilir.
const ADIMLAR = [
  {
    sira: "01",
    baslik: "onboarding.adim1.baslik",
    aciklama: "onboarding.adim1.aciklama",
  },
  {
    sira: "02",
    baslik: "onboarding.adim2.baslik",
    aciklama: "onboarding.adim2.aciklama",
  },
  {
    sira: "03",
    baslik: "onboarding.adim3.baslik",
    aciklama: "onboarding.adim3.aciklama",
  },
];

// Temsili tutarlar kullanicinin para birimi ve diliyle, kurussuz gosterilir.
// Temsili tutarlar TRY icin yazildi; diger birimlerde olceklenir (14.000 $ gibi).
const temsiliTutar = (n) =>
  paraBiriminiFormatla(ornekTutar(n), kullaniciParaBirimi(), { minimumFractionDigits: 0, maximumFractionDigits: 0 });

// Tanitim gorselleri temsili tutarlar kullanir; gercek kullanici verisi degildir.
function BorcKartlari() {
  return (
    <div className="ob-kartlar" aria-hidden="true">
      <div className="ob-kart arka" />
      <div className="ob-kart orta">
        <span className="ob-cip" />
      </div>
      <div className="ob-kart on">
        <span className="ob-cip" />
        <span className="ob-kart-etiket">{t("onboarding.kart.toplamBorc")}</span>
        <span className="ob-kart-tutar">{temsiliTutar(284750)}</span>
        <span className="ob-kart-alt">{t("onboarding.kart.alt")}</span>
      </div>
    </div>
  );
}

function KapatmaSirasi() {
  const satirlar = [
    ["01", t("onboarding.sira.ekHesap"), t("onboarding.sira.ekHesapBilgi")],
    ["02", t("onboarding.sira.krediKarti"), t("onboarding.sira.krediKartiBilgi")],
    ["03", t("onboarding.sira.ihtiyacKredisi"), t("onboarding.sira.ihtiyacKredisiBilgi")],
  ];
  return (
    <div className="ob-panel" aria-hidden="true">
      <div className="ob-panel-ust">
        <Target size={22} />
        {t("onboarding.sira.baslik")}
      </div>
      {satirlar.map(([no, ad, bilgi]) => (
        <div className="ob-satir" key={no}>
          <span className="ob-rozet">{no}</span>
          <b>{ad}</b>
          <small>{bilgi}</small>
        </div>
      ))}
    </div>
  );
}

function AylikPlan() {
  const satirlar = [
    [t("onboarding.plan.gelir"), temsiliTutar(70000)],
    [t("onboarding.plan.odemeler"), `− ${temsiliTutar(42600)}`],
    [t("onboarding.plan.yasam"), `− ${temsiliTutar(19300)}`],
  ];
  return (
    <div className="ob-panel" aria-hidden="true">
      <div className="ob-panel-ust">
        <Wallet size={22} />
        {t("onboarding.plan.baslik")}
      </div>
      {satirlar.map(([ad, tutar]) => (
        <div className="ob-satir duz" key={ad}>
          <b>{ad}</b>
          <strong>{tutar}</strong>
        </div>
      ))}
      <div className="ob-ozet">
        <div>
          <span>{t("onboarding.plan.aySonunda")}</span>
          <strong>{t("onboarding.plan.kalir", { tutar: temsiliTutar(8100) })}</strong>
        </div>
      </div>
    </div>
  );
}

const GORSELLER = [BorcKartlari, KapatmaSirasi, AylikPlan];

// Tanitimi daha once gormus veya cikis yapmis kullaniciya dogrudan karar
// ekrani acilir; uc tanitim ekrani tekrar gosterilmez.
export const KARAR_ADIMI = ADIMLAR.length;

export default function Onboarding({ baslangic = 0 }) {
  const [adim, setAdim] = useState(baslangic);
  const [cikiyor, setCikiyor] = useState(false);
  const dokunus = useRef(null);

  function bitir(hedef) {
    onboardingTamamla();
    setCikiyor(true);
    // Once ekran soner, sonra gecis yapilir. Tam sayfa gecis: native kabukta
    // ayni kaynakta kaldigi icin uygulama yeniden yuklenip hedefle acilir.
    window.setTimeout(() => window.location.assign(hedef), 240);
  }

  function ileri() {
    setAdim((o) => Math.min(o + 1, ADIMLAR.length));
  }

  function geri() {
    setAdim((o) => Math.max(o - 1, 0));
  }

  function dokunusBasla(olay) {
    const nokta = olay.changedTouches?.[0];
    dokunus.current = nokta ? { x: nokta.clientX, y: nokta.clientY } : null;
  }

  function dokunusBitti(olay) {
    const baslangic = dokunus.current;
    const nokta = olay.changedTouches?.[0];
    dokunus.current = null;
    if (!baslangic || !nokta) return;
    const yatay = nokta.clientX - baslangic.x;
    const dikey = nokta.clientY - baslangic.y;
    // Dikey kaydirmayi yatay gecis sanmamak icin esik.
    if (Math.abs(yatay) < 50 || Math.abs(yatay) <= Math.abs(dikey)) return;
    if (yatay < 0) ileri();
    // Karar ekranindan tanitim ekranlarina geri donulmez; kullanici akisi
    // bitirmis sayilir.
    else if (adim < ADIMLAR.length) geri();
  }

  const kararEkrani = adim === ADIMLAR.length;
  const icerik = ADIMLAR[adim];
  const Gorsel = GORSELLER[adim];

  return (
    <div
      className={`ob adim-${adim}${cikiyor ? " cikiyor" : ""}`}
      onTouchStart={dokunusBasla}
      onTouchEnd={dokunusBitti}
    >
      <div className="ob-ust">
        <img className="ob-logo" src="/borcama-logo-368.png" alt="Borcama" width="368" height="90" />
        {/* Dil dugmesi ilk tanitim ekraninda ve karar ekraninda; yalniz native. */}
        <div className="ob-ust-sag">
          {(adim === 0 || kararEkrani) && <DilDugmesi className="ob-dil" />}
          {!kararEkrani && (
            <button className="ob-atla" type="button" onClick={() => setAdim(ADIMLAR.length)}>
              {t("onboarding.atla")}
            </button>
          )}
        </div>
      </div>

      {kararEkrani ? (
        <div className="ob-karar">
          <span className="ob-daire" aria-hidden="true" />
          <span className="ob-kose" aria-hidden="true" />
          <div className="ob-karar-icerik">
            <span className="ob-tik" aria-hidden="true">
              <Check size={30} strokeWidth={3} />
            </span>
            <h1 className="ob-baslik">
              {t("onboarding.karar.baslik")}
              <br />
              <em>{t("onboarding.karar.vurgu")}</em>
            </h1>
            <p className="ob-aciklama">
              {t("onboarding.karar.aciklama")}
            </p>
          </div>
          <p className="ob-guvence">
            <Diamond size={15} />
            {t("onboarding.karar.guvence")}
          </p>
          {/* Para birimi secimi yalniz native'de; kur cevirisi yok. */}
          <ParaBirimiSecici className="ob-para-birimi" />
          <div className="ob-dugmeler">
            <button className="ob-dugme birincil" type="button" onClick={() => bitir("/register")}>
              {t("onboarding.karar.ucretsizBasla")}
              <ArrowRight size={19} />
            </button>
            <button className="ob-dugme" type="button" onClick={() => bitir("/login")}>
              {t("onboarding.karar.girisYap")}
            </button>
            {/* Hesapsiz kullanim: kayit olmadan uygulamanin tamami kullanilabilir,
                veriler cihazda kalir. Hesap sonradan acilinca kayitlar tasinir. */}
            <button
              className="ob-dugme ob-dugme-duz"
              type="button"
              onClick={() => {
                misafirModunuAc();
                bitir("/summary");
              }}
            >
              {t("onboarding.karar.misafir")}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="ob-govde">
            <Gorsel />
          </div>
          <div className="ob-alt">
            <span className="ob-sira">{icerik.sira}</span>
            <h1 className="ob-baslik">{t(icerik.baslik)}</h1>
            <p className="ob-aciklama">{t(icerik.aciklama)}</p>
            <div className="ob-pager">
              <div className="ob-noktalar" aria-hidden="true">
                {ADIMLAR.map((a, i) => (
                  <span key={a.sira} className={i === adim ? "etkin" : ""} />
                ))}
              </div>
              <button className="ob-ileri" type="button" onClick={ileri} aria-label={t("onboarding.sonraki")}>
                <ArrowRight size={26} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
