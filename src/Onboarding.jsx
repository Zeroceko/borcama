import React, { useRef, useState } from "react";
import { ArrowRight, Check, Diamond, Target, Wallet } from "lucide-react";
import { onboardingTamamla } from "./onboardingDurumu.js";
import "./onboarding.css";

// iOS onboarding: dort ekran. Ilk uc ekran urunun ne yaptigini anlatir,
// dorduncusu karar ekranidir. Metinler Borcama'nin mevcut yetenekleriyle
// sinirlidir; banka baglantisi veya otomatik veri cekme vaadi yoktur.
const ADIMLAR = [
  {
    sira: "01",
    baslik: "Borçların tek yerde.",
    aciklama: "Kart, kredi ve ek hesaplarını aynı tabloda gör. Ne kadar borcun kaldığını karıştırma.",
  },
  {
    sira: "02",
    baslik: "Önce neyi kapatacağını bil.",
    aciklama: "Faiz yükünü ve yaklaşan ödemelerini birlikte gör. İlk adımını netleştir.",
  },
  {
    sira: "03",
    baslik: "Ay sonunda ne kalacağını gör.",
    aciklama: "Gelirini, zorunlu ödemelerini ve harcamalarını tek aylık planda buluştur.",
  },
];

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
        <span className="ob-kart-etiket">Toplam borç</span>
        <span className="ob-kart-tutar">₺284.750</span>
        <span className="ob-kart-alt">3 hesap · tek tablo</span>
      </div>
    </div>
  );
}

function KapatmaSirasi() {
  const satirlar = [
    ["01", "Ek hesap", "%4,50 aylık"],
    ["02", "Kredi kartı", "Son ödeme 6 gün"],
    ["03", "İhtiyaç kredisi", "Planında ilerliyor"],
  ];
  return (
    <div className="ob-panel" aria-hidden="true">
      <div className="ob-panel-ust">
        <Target size={22} />
        Kapatma sıran
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
    ["Gelir", "₺70.000"],
    ["Ödemeler", "− ₺42.600"],
    ["Yaşam giderleri", "− ₺19.300"],
  ];
  return (
    <div className="ob-panel" aria-hidden="true">
      <div className="ob-panel-ust">
        <Wallet size={22} />
        Bu ay
      </div>
      {satirlar.map(([ad, tutar]) => (
        <div className="ob-satir duz" key={ad}>
          <b>{ad}</b>
          <strong>{tutar}</strong>
        </div>
      ))}
      <div className="ob-ozet">
        <div>
          <span>Ay sonunda</span>
          <strong>₺8.100 kalır</strong>
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
        {!kararEkrani && (
          <button className="ob-atla" type="button" onClick={() => setAdim(ADIMLAR.length)}>
            Atla
          </button>
        )}
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
              Paran nereye gidiyor?
              <br />
              <em>Artık bil.</em>
            </h1>
            <p className="ob-aciklama">
              Borçlarını, ödeme günlerini ve aylık planını tek yerde takip et.
            </p>
          </div>
          <p className="ob-guvence">
            <Diamond size={15} />
            Banka şifresi ve kredi kartı bilgisi gerekmez.
          </p>
          <div className="ob-dugmeler">
            <button className="ob-dugme birincil" type="button" onClick={() => bitir("/register")}>
              Ücretsiz başla
              <ArrowRight size={19} />
            </button>
            <button className="ob-dugme" type="button" onClick={() => bitir("/login")}>
              Giriş yap
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
            <h1 className="ob-baslik">{icerik.baslik}</h1>
            <p className="ob-aciklama">{icerik.aciklama}</p>
            <div className="ob-pager">
              <div className="ob-noktalar" aria-hidden="true">
                {ADIMLAR.map((a, i) => (
                  <span key={a.sira} className={i === adim ? "etkin" : ""} />
                ))}
              </div>
              <button className="ob-ileri" type="button" onClick={ileri} aria-label="Sonraki">
                <ArrowRight size={26} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
