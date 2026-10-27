import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronRight, Plus, X } from "lucide-react";
import { onboardingTamamla } from "./onboardingDurumu.js";
import { misafirModunuAc } from "./misafirModu.js";
import { DESTEKLENEN_DILLER, DIL_ADLARI, belgeDiliniAyarla, dil, dilAyarla, dilSozlugunuYukle, locale, t } from "./i18n.js";
import DilDugmesi from "./DilDugmesi.jsx";
import ParaBirimiSecici from "./ParaBirimiSecici.jsx";
import {
  DESTEKLENEN_PARA_BIRIMLERI,
  bolgeAyarla,
  bolgedenParaBirimi,
  cihazBolgesi,
  kullaniciParaBirimi,
  paraBirimiAdi,
  paraBirimiAyarla,
  paraBirimiSimgesi,
  paraBiriminiFormatla,
} from "./currencyInput.js";
import { ornekTutar } from "./bolgeKurallari.js";
import { sekmeCubugunuGoster } from "./nativeSekmeCubugu.js";
import { onboardingOlayiKaydet } from "./activityLog.js";
import {
  BORC_TURLERI,
  HEDEFLER,
  SIK_ULKELER,
  SIKLIKLAR,
  TUM_ULKELER,
  adimGecilebilirMi,
  adimSirasi,
  bayrak,
  durumdanSonuc,
  onboardingSonucunuUygula,
  aySonuKalan,
  aylikOdeme,
  aylikOdemeler,
  borcBakiyesi,
  borcGecerli,
  bosDurum,
  gunlukTutar,
  ilkBitecekBorc,
  ilkOdeme,
  numaraliAdimlar,
  planOdemeleri,
  oncekiAdim,
  sonrakiAdim,
  sonrakiGunTarihi,
  sonrakiMaas,
  tutar,
  yasamOnerileri,
} from "./onboardingAdimlari.js";
import { nativeOnboardingBaslat } from "./onboardingKoprusu.js";
import "./onboardingAkis.css";

// Iki parca:
// 1. Onboarding (varsayilan): yalniz native kabukta, oturumu olmayan
//    kullaniciya acilis + karsilama. "Basla" kayda, "Zaten hesabim var"
//    girise, misafir baglantisi hesapsiz kullanima goturur.
// 2. KurulumAkisi: kayit veya misafir sonrasi ilk acilista (web + iOS)
//    App.jsx icinde tam ekran; dil, ulke, gelir, ilk borc, plan. Veri
//    mevcut kayit yapisina yazilir (onboardingAdimlari.js > veriyeYaz).
// Metinler sozluk anahtaridir (src/locales/bolumler/onboarding.js).

const tamTutar = (n, birim = kullaniciParaBirimi()) =>
  paraBiriminiFormatla(n, birim, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const gunAyEtiketi = (tarih) =>
  new Intl.DateTimeFormat(locale(), { day: "numeric", month: "short" }).format(tarih);

const gunAyHaftaEtiketi = (tarih) =>
  new Intl.DateTimeFormat(locale(), { day: "numeric", month: "short", weekday: "long" }).format(tarih);

function Baslik({ gri, vurgu }) {
  return (
    <h1 className="oa-baslik">
      <span className="oa-baslik-gri">{gri}</span> {vurgu}
    </h1>
  );
}

function BirincilDugme({ children, onClick, disabled = false, type = "button" }) {
  return (
    <button className="oa-dugme" type={type} onClick={onClick} disabled={disabled}>
      {children}
      <ArrowRight size={18} aria-hidden="true" />
    </button>
  );
}

/* ---------------- 1. Giris oncesi: acilis + karsilama (native) ---------------- */

function OrnekPlan() {
  // Temsili tutarlar TRY icin yazildi; diger birimlerde olceklenir.
  return (
    <div className="oa-ornek" role="img" aria-label={t("onboarding.karsilama.ornekAria")}>
      <div className="oa-plan-kart">
        <span className="oa-mono-etiket">{t("onboarding.karsilama.ornekEtiket")}</span>
        <strong className="oa-plan-tutar">{tamTutar(ornekTutar(26000))}</strong>
        <small>{t("onboarding.karsilama.ornekAlt")}</small>
        <span className="oa-serit" aria-hidden="true"><i /><i /><i /></span>
      </div>
      <div className="oa-sayaclar">
        <div className="oa-sayac">
          <span className="oa-mono-etiket">{t("onboarding.karsilama.sonOdeme")}</span>
          <strong><b className="oa-rozet">19</b> {t("onboarding.karsilama.gun")}</strong>
        </div>
        <div className="oa-sayac">
          <span className="oa-mono-etiket">{t("onboarding.karsilama.borcBitisi")}</span>
          <strong>4 {t("onboarding.karsilama.ay")}</strong>
        </div>
      </div>
    </div>
  );
}

export default function Onboarding({ acilis = true }) {
  const [ekran, setEkran] = useState(acilis ? "acilis" : "karsilama");
  const [cikiyor, setCikiyor] = useState(false);

  useEffect(() => {
    if (ekran !== "acilis") return undefined;
    const zamanlayici = window.setTimeout(() => setEkran("karsilama"), 1000);
    return () => window.clearTimeout(zamanlayici);
  }, [ekran]);

  function git(hedef, misafir = false) {
    onboardingTamamla();
    if (misafir) misafirModunuAc();
    setCikiyor(true);
    // Tam sayfa gecis: native kabukta ayni kaynakta kaldigi icin uygulama
    // yeniden yuklenip hedefle acilir.
    window.setTimeout(() => window.location.assign(hedef), 200);
  }

  if (ekran === "acilis") {
    return (
      <div className="oa oa-acilis" onClick={() => setEkran("karsilama")}>
        <span className="oa-acilis-daire" aria-hidden="true" />
        <span className="oa-acilis-alt" aria-hidden="true" />
        <div className="oa-acilis-icerik">
          <img className="oa-acilis-logo" src="/borcama-logo-368.png" alt="Borcama" width="368" height="90" />
          <p className="oa-mono">{t("onboarding.acilis.slogan")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`oa oa-zemin-mint${cikiyor ? " cikiyor" : ""}`}>
      <div className="oa-kolon">
        <div className="oa-karsilama-ust">
          <img className="oa-logo" src="/borcama-logo-368.png" alt="Borcama" width="368" height="90" />
          <div className="oa-cipler">
            <DilDugmesi className="ob-dil" />
            <ParaBirimiSecici className="ob-para-birimi oa-para-cip" />
          </div>
        </div>
        <div className="oa-govde">
          <Baslik gri={t("onboarding.karsilama.baslikGri")} vurgu={t("onboarding.karsilama.baslik")} />
          <p className="oa-aciklama">{t("onboarding.karsilama.aciklama")}</p>
          <OrnekPlan />
        </div>
        <div className="oa-alt">
          <BirincilDugme onClick={() => git("/register")}>{t("onboarding.karsilama.basla")}</BirincilDugme>
          <button className="oa-baglanti" type="button" onClick={() => git("/login")}>
            {t("onboarding.karsilama.hesabimVar")}
          </button>
          {/* Hesapsiz kullanim: veriler cihazda kalir, hesap acilinca tasinir.
              Misafir de kurulum akisini gorur. */}
          <button className="oa-baglanti soluk" type="button" onClick={() => git("/summary", true)}>
            {t("onboarding.karar.misafir")}
          </button>
        </div>
      </div>
    </div>
  );
}

// iOS kabugu native (SwiftUI) onboarding sunuyorsa web yalniz acilis zemini
// cizer; akis native'de calisir, sonuc onboardingKoprusu.js ile uygulanir.
export function NativeOnboarding() {
  useEffect(() => nativeOnboardingBaslat(), []);
  return (
    <div className="oa oa-acilis" aria-hidden="true">
      <div className="oa-acilis-icerik">
        <img className="oa-acilis-logo" src="/borcama-logo-368.png" alt="" width="368" height="90" />
      </div>
    </div>
  );
}

/* ---------------- 2. Kurulum akisi (web + iOS) ---------------- */

function ulkeAdi(kod) {
  try {
    return new Intl.DisplayNames([locale()], { type: "region" }).of(kod) || kod;
  } catch {
    return kod;
  }
}

function SecimSatiri({ secili, onClick, children, sag, etiket, ...props }) {
  return (
    <button className={`oa-secim${secili ? " secili" : ""}`} type="button" onClick={onClick} aria-pressed={secili} aria-label={etiket} {...props}>
      <span className="oa-secim-metin">{children}</span>
      {sag && <span className="oa-secim-sag">{sag}</span>}
      {secili && <span className="oa-tik" aria-hidden="true"><Check size={13} strokeWidth={3} /></span>}
    </button>
  );
}

// Tutar alani: yalniz tam sayi; yazarken binlik ayiriciyla gosterilir.
function TutarAlani({ deger, onChange, etiket, buyuk = false, otomatikOdak = false, yerTutucu = "0" }) {
  const birim = kullaniciParaBirimi();
  const gorunen = deger ? new Intl.NumberFormat(locale()).format(Number(deger)) : "";
  return (
    <label className={`oa-tutar${buyuk ? " buyuk" : ""}`}>
      <span className="oa-gizli">{etiket}</span>
      <span className="oa-tutar-simge" aria-hidden="true">{paraBirimiSimgesi(birim)}</span>
      <input
        inputMode="decimal"
        autoComplete="off"
        value={gorunen}
        placeholder={yerTutucu}
        autoFocus={otomatikOdak}
        onChange={(olay) => onChange(olay.target.value.replace(/\D/g, "").replace(/^0+/, "").slice(0, 12))}
      />
    </label>
  );
}

function Alan({ etiket, children }) {
  return (
    <label className="oa-alan">
      <span className="oa-mono-etiket">{etiket}</span>
      {children}
    </label>
  );
}

const gunDegeri = (deger) => {
  const sayi = parseInt(String(deger).replace(/\D/g, ""), 10);
  return Number.isFinite(sayi) ? String(Math.min(Math.max(sayi, 1), 31)) : "";
};

function BorcFormu({ borc, setBorc }) {
  const ayarla = (alan) => (deger) => setBorc({ ...borc, [alan]: deger });
  const ornek = (deger) => (deger ? t("onboarding.borc.ornek", { deger }) : "");
  const metin = (alan, etiket, yerTutucu = "") => (
    <Alan etiket={etiket}>
      <input className="oa-girdi" value={borc[alan] || ""} placeholder={ornek(yerTutucu)} onChange={(o) => ayarla(alan)(o.target.value)} />
    </Alan>
  );
  const gun = (alan, etiket) => (
    <Alan etiket={etiket}>
      <input className="oa-girdi oa-mono" inputMode="numeric" value={borc[alan] || ""} placeholder={ornek("15")} onChange={(o) => ayarla(alan)(gunDegeri(o.target.value))} />
    </Alan>
  );
  const para = (alan, etiket) => (
    <Alan etiket={etiket}>
      <TutarAlani deger={borc[alan] || ""} onChange={ayarla(alan)} etiket={etiket} yerTutucu="" />
    </Alan>
  );
  if (borc.tur === "kart") {
    return (
      <>
        {metin("banka", t("onboarding.borc.banka"), "Akbank")}
        {para("tutar", t("onboarding.borc.buAykiBorc"))}
        {gun("gun", t("onboarding.borc.sonOdemeGunu"))}
      </>
    );
  }
  if (borc.tur === "kredi") {
    return (
      <>
        {metin("banka", t("onboarding.borc.banka"), "QNB")}
        {para("taksit", t("onboarding.borc.taksit"))}
        <Alan etiket={t("onboarding.borc.kalanTaksit")}>
          <input className="oa-girdi oa-mono" inputMode="numeric" value={borc.kalanTaksit || ""} placeholder={ornek("18")} onChange={(o) => ayarla("kalanTaksit")(o.target.value.replace(/\D/g, "").slice(0, 3))} />
        </Alan>
        {gun("gun", t("onboarding.borc.odemeGunu"))}
      </>
    );
  }
  if (borc.tur === "kmh") {
    return (
      <>
        {metin("banka", t("onboarding.borc.banka"), "Enpara")}
        {para("tutar", t("onboarding.borc.kullanilan"))}
      </>
    );
  }
  return (
    <>
      {metin("banka", t("onboarding.borc.kime"))}
      {para("tutar", t("onboarding.borc.tutar"))}
    </>
  );
}

// Zemin adim adim mint ve krem arasinda doner (koyu yesil kullanilmaz).
const ZEMINLER = ["krem", "krem", "mint", "krem", "krem", "mint", "krem", "krem", "mint", "krem", "krem"];

export function KurulumAkisi({ veri, native = false, kaydet }) {
  const [durum, setDurum] = useState(bosDurum);
  const [adim, setAdim] = useState("dil");
  const [secilenDil, setSecilenDil] = useState(dil());
  const [, setSozlukSurumu] = useState(0);
  const [ulke, setUlke] = useState(() => {
    const tespit = cihazBolgesi();
    return /^[A-Z]{2}$/.test(tespit) ? tespit : "TR";
  });
  const [birim, setBirim] = useState(() => kullaniciParaBirimi());
  const [yasamKendim, setYasamKendim] = useState(false);
  const [yasamAtlandi, setYasamAtlandi] = useState(false);
  const [taslak, setTaslak] = useState(null);
  const [taslakHata, setTaslakHata] = useState(false);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [kayitHatasi, setKayitHatasi] = useState(false);
  const baslangic = useRef(Date.now());
  const adimBaslangici = useRef(Date.now());

  // Akis tam ekran; iOS'ta native sekme cubugu akis bitince (yeniden
  // yuklemede) geri gelir.
  useEffect(() => {
    sekmeCubugunuGoster(false);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [adim]);

  const sira = useMemo(
    () => adimSirasi({ native, siklik: durum.siklik, borcYok: durum.borcYok }),
    [native, durum.siklik, durum.borcYok],
  );
  const numarali = numaraliAdimlar(sira);
  const no = numarali.indexOf(adim) + 1;
  const guncelle = (alanlar) => setDurum((eski) => ({ ...eski, ...alanlar }));

  // Yasam adiminda gelirin %45'i onceden secili gelir (yanki dolu).
  useEffect(() => {
    if (adim === "yasam" && durum.yasam === null && !yasamKendim) {
      setDurum((eski) => ({ ...eski, yasam: yasamOnerileri(eski.gelir)[1] || null }));
    }
  }, [adim, durum.yasam, yasamKendim]);

  // Ilk borc formu, secilen ilk turle acilir.
  useEffect(() => {
    if (adim === "borc" && !taslak) setTaslak({ tur: durum.turler[0] || "kart" });
  }, [adim, taslak, durum.turler]);

  function adimaGec(hedef, { atlandi = false } = {}) {
    if (!hedef) return;
    void onboardingOlayiKaydet(atlandi ? "onboarding_atla" : "onboarding_adim", {
      adim,
      sure_ms: Date.now() - adimBaslangici.current,
    });
    if (atlandi) guncelle({ atlanan: [...durum.atlanan, adim] });
    adimBaslangici.current = Date.now();
    setAdim(hedef);
  }

  const ileri = (secenekler) => adimaGec(sonrakiAdim(adim, sira), secenekler);
  const geri = () => {
    const onceki = oncekiAdim(adim, sira);
    if (onceki) setAdim(onceki);
  };

  async function dilSec(kod) {
    setSecilenDil(kod);
    dilAyarla(kod);
    await dilSozlugunuYukle(kod);
    belgeDiliniAyarla();
    // Sozluk yuklenince ekran yeni dille yeniden cizilir.
    setSozlukSurumu((n) => n + 1);
  }

  function ulkeSec(kod) {
    setUlke(kod);
    setBirim(bolgedenParaBirimi(`und-${kod}`));
  }

  function ulkeyiKaydetVeIlerle() {
    paraBirimiAyarla(birim);
    bolgeAyarla(ulke);
    ileri();
  }

  function taslagiEkle() {
    if (!taslak || !borcGecerli(taslak)) {
      setTaslakHata(true);
      return false;
    }
    const borclar = [...durum.borclar, taslak];
    guncelle({ borclar });
    // Siradaki tur: secilip henuz eklenmemis ilk tur, yoksa ayni tur.
    const eklenenler = new Set(borclar.map((b) => b.tur));
    const siradaki = durum.turler.find((tur) => !eklenenler.has(tur)) || taslak.tur;
    setTaslak({ tur: siradaki });
    setTaslakHata(false);
    return borclar;
  }

  function borcAdiminiBitir() {
    // Formda yazilmis ama eklenmemis bir borc varsa once o eklenir.
    const doluMu = taslak && ["banka", "tutar", "taksit", "kalanTaksit", "gun"].some((alan) => String(taslak[alan] || "").trim());
    if (doluMu) {
      if (!taslagiEkle()) return;
    } else if (!durum.borclar.length) {
      setTaslakHata(true);
      return;
    }
    ileri();
  }

  async function planiKaydet() {
    setKaydediliyor(true);
    setKayitHatasi(false);
    let n = 0;
    const sonuc = durumdanSonuc(durum, { dil: secilenDil, ulke, paraBirimi: birim, sure_ms: Date.now() - baslangic.current });
    const yeni = onboardingSonucunuUygula(veri, sonuc, {
      native,
      simdi: new Date(),
      idUret: () => `${Date.now().toString(36)}${(n++).toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      gelirAdi: t("onboarding.gelir.kayitAdi"),
    });
    const tamam = await kaydet(yeni);
    setKaydediliyor(false);
    if (tamam === false) {
      setKayitHatasi(true);
      return;
    }
    void onboardingOlayiKaydet("onboarding_tamam", {
      borc_sayisi: sonuc.borclar.length,
      gelir_var: sonuc.gelir > 0,
      sure_ms: sonuc.sure_ms,
    });
    adimaGec("hazir");
  }

  function bitir() {
    if (native) onboardingTamamla();
    // Yeniden yukleme: secilen dil ve para birimi tum ekranlara uygulanir,
    // iOS'ta native sekmeler geri gelir.
    window.location.assign("/summary");
  }

  const gelir = tutar(durum.gelir);
  const borclar = durum.borcYok ? [] : durum.borclar;
  const odemeler = planOdemeleri({ gelir, borclar, yasam: tutar(durum.yasam) });
  const yasam = tutar(durum.yasam);
  const kalan = aySonuKalan({ gelir, borclar, yasam });
  const ilkBiten = ilkBitecekBorc({ gelir, borclar, yasam });
  const ilkOdemeBilgisi = ilkOdeme(borclar);
  const zemin = adim === "hazir" ? "krem" : ZEMINLER[(no - 1) % ZEMINLER.length];

  let icerik = null;
  let dugme = null;

  if (adim === "dil") {
    icerik = (
      <>
        <Baslik gri={t("onboarding.dil.baslikGri")} vurgu={t("onboarding.dil.baslik")} />
        <p className="oa-aciklama">{t("onboarding.dil.aciklama")}</p>
        <div className="oa-liste">
          {DESTEKLENEN_DILLER.map((kod) => (
            <SecimSatiri key={kod} secili={secilenDil === kod} onClick={() => dilSec(kod)} sag={kod.toUpperCase()} lang={kod} etiket={DIL_ADLARI[kod]}>
              {DIL_ADLARI[kod]}
            </SecimSatiri>
          ))}
        </div>
      </>
    );
    dugme = <BirincilDugme onClick={() => ileri()}>{t("onboarding.devam")}</BirincilDugme>;
  } else if (adim === "ulke") {
    const sik = [ulke, ...SIK_ULKELER.filter((kod) => kod !== ulke)].slice(0, 4);
    const tumListe = [...new Set(TUM_ULKELER)].sort((a, b) => ulkeAdi(a).localeCompare(ulkeAdi(b), locale()));
    icerik = (
      <>
        <Baslik gri={t("onboarding.ulke.baslikGri")} vurgu={t("onboarding.ulke.baslik")} />
        <p className="oa-aciklama">{t("onboarding.ulke.aciklama")}</p>
        <div className="oa-liste">
          {sik.map((kod) => {
            const ulkeBirimi = kod === ulke ? birim : bolgedenParaBirimi(`und-${kod}`);
            return (
              <SecimSatiri key={kod} secili={kod === ulke} onClick={() => ulkeSec(kod)} sag={`${ulkeBirimi} ${paraBirimiSimgesi(ulkeBirimi)}`} etiket={`${ulkeAdi(kod)}, ${ulkeBirimi}`}>
                <span aria-hidden="true">{bayrak(kod)}</span> {ulkeAdi(kod)}
              </SecimSatiri>
            );
          })}
        </div>
        <div className="oa-ek-satirlar">
          <label className="oa-ek-satir">
            <span>{t("onboarding.ulke.baskaUlke")}</span>
            <ChevronRight size={16} aria-hidden="true" />
            <select aria-label={t("onboarding.ulke.ulkeSec")} value={ulke} onChange={(o) => ulkeSec(o.target.value)}>
              {tumListe.map((kod) => <option key={kod} value={kod}>{ulkeAdi(kod)}</option>)}
            </select>
          </label>
          <label className="oa-ek-satir">
            <span>{t("onboarding.ulke.baskaPara", { kod: `${birim} ${paraBirimiSimgesi(birim)}` })}</span>
            <ChevronRight size={16} aria-hidden="true" />
            <select aria-label={t("onboarding.ulke.paraSec")} value={birim} onChange={(o) => setBirim(o.target.value)}>
              {DESTEKLENEN_PARA_BIRIMLERI.map((kod) => <option key={kod} value={kod}>{kod} · {paraBirimiAdi(kod)}</option>)}
            </select>
          </label>
        </div>
      </>
    );
    dugme = <BirincilDugme onClick={ulkeyiKaydetVeIlerle}>{t("onboarding.devam")}</BirincilDugme>;
  } else if (adim === "isim") {
    icerik = (
      <>
        <Baslik gri={t("onboarding.isim.baslikGri")} vurgu={t("onboarding.isim.baslik")} />
        <p className="oa-aciklama">{t("onboarding.isim.aciklama")}</p>
        <input
          className="oa-girdi buyuk"
          value={durum.ad}
          maxLength={40}
          autoComplete="given-name"
          placeholder={t("onboarding.isim.yerTutucu")}
          aria-label={t("onboarding.isim.yerTutucu")}
          onChange={(o) => guncelle({ ad: o.target.value })}
        />
      </>
    );
    dugme = <BirincilDugme onClick={() => ileri({ atlandi: !durum.ad.trim() })}>{t("onboarding.devam")}</BirincilDugme>;
  } else if (adim === "hedef") {
    icerik = (
      <>
        <Baslik gri={t("onboarding.hedef.baslikGri")} vurgu={t("onboarding.hedef.baslik")} />
        <p className="oa-aciklama">{t("onboarding.hedef.aciklama")}</p>
        <div className="oa-liste">
          {HEDEFLER.map((hedef) => (
            <SecimSatiri key={hedef} secili={durum.hedef === hedef} onClick={() => guncelle({ hedef })} etiket={t(`onboarding.hedef.${hedef}`)}>
              {t(`onboarding.hedef.${hedef}`)}
            </SecimSatiri>
          ))}
        </div>
      </>
    );
    dugme = <BirincilDugme onClick={() => ileri()}>{t("onboarding.devam")}</BirincilDugme>;
  } else if (adim === "siklik") {
    icerik = (
      <>
        <Baslik gri={t("onboarding.siklik.baslikGri")} vurgu={t("onboarding.siklik.baslik")} />
        <p className="oa-aciklama">{t("onboarding.siklik.aciklama")}</p>
        <div className="oa-liste">
          {SIKLIKLAR.map((siklik) => (
            <SecimSatiri
              key={siklik}
              secili={durum.siklik === siklik}
              onClick={() => guncelle({ siklik })}
              sag={siklik === "ikiKez" ? t("onboarding.siklik.ikiKezIpucu") : null}
              etiket={t(`onboarding.siklik.${siklik}`)}
            >
              {t(`onboarding.siklik.${siklik}`)}
            </SecimSatiri>
          ))}
        </div>
      </>
    );
    dugme = <BirincilDugme onClick={() => ileri()}>{t("onboarding.devam")}</BirincilDugme>;
  } else if (adim === "gun") {
    const maas = sonrakiMaas(durum.maasGunu);
    icerik = (
      <>
        <Baslik gri={t("onboarding.gun.baslikGri")} vurgu={t("onboarding.gun.baslik")} />
        <p className="oa-aciklama">{t("onboarding.gun.aciklama")}</p>
        <GunSeridi secili={durum.maasGunu} onSec={(maasGunu) => guncelle({ maasGunu })} />
        <p className="oa-yanki" aria-live="polite">
          <VurguluMetin anahtar="onboarding.gun.yanki" degisken="tarih" deger={gunAyHaftaEtiketi(maas.tarih)} />
          <br />
          {maas.kalan === 0 ? t("onboarding.gun.bugun") : t("onboarding.gun.kalan", { gun: maas.kalan })}
        </p>
      </>
    );
    dugme = <BirincilDugme onClick={() => ileri()}>{t("onboarding.devam")}</BirincilDugme>;
  } else if (adim === "gelir") {
    icerik = (
      <>
        <Baslik gri={t("onboarding.gelir.baslikGri")} vurgu={t("onboarding.gelir.baslik")} />
        <p className="oa-aciklama">{t("onboarding.gelir.aciklama")}</p>
        <TutarAlani buyuk otomatikOdak deger={durum.gelir} onChange={(deger) => guncelle({ gelir: deger })} etiket={t("onboarding.gelir.etiket")} />
        <p className="oa-alt-not">{t("onboarding.gelir.herAy")}</p>
        {gelir > 0 && (
          <p className="oa-yanki" aria-live="polite">
            <VurguluMetin anahtar="onboarding.gelir.yanki" degisken="tutar" deger={tamTutar(gunlukTutar(gelir))} />
          </p>
        )}
      </>
    );
    dugme = (
      <BirincilDugme onClick={() => ileri()} disabled={!adimGecilebilirMi("gelir", durum)}>
        {t("onboarding.gelir.dugme")}
      </BirincilDugme>
    );
  } else if (adim === "turler") {
    const sec = (tur) => {
      const turler = durum.turler.includes(tur) ? durum.turler.filter((x) => x !== tur) : [...durum.turler, tur];
      guncelle({ turler, borcYok: false, borclar: durum.borclar.filter((b) => turler.includes(b.tur)) });
      setTaslak(null);
    };
    icerik = (
      <>
        <Baslik gri={t("onboarding.turler.baslikGri")} vurgu={t("onboarding.turler.baslik")} />
        <p className="oa-aciklama">{t("onboarding.turler.aciklama")}</p>
        <div className="oa-liste">
          {BORC_TURLERI.map((tur) => (
            <SecimSatiri key={tur} secili={durum.turler.includes(tur)} onClick={() => sec(tur)} etiket={t(`onboarding.turler.${tur}`)}>
              {t(`onboarding.turler.${tur}`)}
            </SecimSatiri>
          ))}
        </div>
        <div className="oa-ek-satirlar">
          <button
            className={`oa-ek-satir${durum.borcYok ? " secili" : ""}`}
            type="button"
            aria-pressed={durum.borcYok}
            onClick={() => {
              guncelle({ borcYok: !durum.borcYok, turler: [], borclar: [] });
              setTaslak(null);
            }}
          >
            <span>{t("onboarding.turler.yok")}</span>
            {durum.borcYok ? <Check size={16} aria-hidden="true" /> : <ChevronRight size={16} aria-hidden="true" />}
          </button>
        </div>
      </>
    );
    dugme = (
      <BirincilDugme onClick={() => ileri()} disabled={!adimGecilebilirMi("turler", durum)}>
        {durum.turler.length > 0 ? t("onboarding.turler.dugme", { n: durum.turler.length }) : t("onboarding.devam")}
      </BirincilDugme>
    );
  } else if (adim === "borc" && taslak) {
    const anlik = borcGecerli(taslak) ? [...durum.borclar, taslak] : durum.borclar;
    icerik = (
      <>
        <Baslik gri={t("onboarding.borc.baslikGri")} vurgu={t(`onboarding.borc.baslik.${taslak.tur}`)} />
        <p className="oa-aciklama">{t(`onboarding.borc.aciklama.${taslak.tur}`)}</p>
        {durum.turler.length > 1 && (
          <div className="oa-cip-satiri" role="group">
            {durum.turler.map((tur) => (
              <button key={tur} type="button" className={`oa-cip${taslak.tur === tur ? " secili" : ""}`} aria-pressed={taslak.tur === tur} aria-label={t(`onboarding.turler.${tur}`)} onClick={() => setTaslak({ tur })}>
                {t(`onboarding.turler.${tur}`)}
              </button>
            ))}
          </div>
        )}
        {durum.borclar.length > 0 && (
          <ul className="oa-eklenenler">
            {durum.borclar.map((borc, i) => (
              <li key={`${borc.tur}-${i}`}>
                <span>{borc.banka}</span>
                <span className="oa-mono">{tamTutar(borc.tur === "kredi" ? tutar(borc.taksit) : tutar(borc.tutar))}</span>
                <button
                  type="button"
                  aria-label={t("onboarding.borc.kaldir", { ad: borc.banka })}
                  onClick={() => guncelle({ borclar: durum.borclar.filter((_, j) => j !== i) })}
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="oa-form">
          <BorcFormu borc={taslak} setBorc={(yeni) => { setTaslak(yeni); setTaslakHata(false); }} />
        </div>
        {taslakHata && <p className="oa-hata" role="alert">{t("onboarding.borc.eksik")}</p>}
        <button className="oa-ekle" type="button" onClick={taslagiEkle}>
          <Plus size={15} aria-hidden="true" /> {t("onboarding.borc.baskaEkle")}
        </button>
        {aylikOdemeler(anlik) > 0 && (
          <p className="oa-yanki" aria-live="polite">
            <VurguluMetin anahtar="onboarding.borc.yanki" degisken="tutar" deger={tamTutar(aylikOdemeler(anlik))} />
          </p>
        )}
      </>
    );
    // Formda eksik borc varken ya da hic borc yokken "Bu kadar" pasif.
    const taslakBos = !["banka", "tutar", "taksit", "kalanTaksit", "gun"].some((alan) => String(taslak[alan] || "").trim());
    const bitirilebilir = borcGecerli(taslak) || (taslakBos && durum.borclar.length > 0);
    dugme = <BirincilDugme onClick={borcAdiminiBitir} disabled={!bitirilebilir}>{t("onboarding.borc.dugme")}</BirincilDugme>;
  } else if (adim === "yasam") {
    const oneriler = yasamOnerileri(gelir);
    icerik = (
      <>
        <Baslik gri={t("onboarding.yasam.baslikGri")} vurgu={t("onboarding.yasam.baslik")} />
        <p className="oa-aciklama">{t("onboarding.yasam.aciklama")}</p>
        <div className="oa-cip-satiri">
          {oneriler.map((oneri) => (
            <button
              key={oneri}
              type="button"
              className={`oa-cip oa-mono${!yasamKendim && durum.yasam === oneri ? " dolu" : ""}`}
              aria-pressed={!yasamKendim && durum.yasam === oneri}
              onClick={() => { setYasamKendim(false); guncelle({ yasam: oneri }); }}
            >
              {tamTutar(oneri)}
            </button>
          ))}
          <button type="button" className={`oa-cip${yasamKendim ? " secili" : ""}`} aria-pressed={yasamKendim} onClick={() => { setYasamKendim(true); guncelle({ yasam: "" }); }}>
            {t("onboarding.yasam.kendim")}
          </button>
        </div>
        {yasamKendim && (
          <TutarAlani otomatikOdak deger={durum.yasam || ""} onChange={(deger) => guncelle({ yasam: deger })} etiket={t("onboarding.yasam.etiket")} />
        )}
        {yasam > 0 && (
          <p className="oa-yanki" aria-live="polite">
            <VurguluMetin
              anahtar={kalan >= 0 ? "onboarding.yasam.yanki" : "onboarding.yasam.acik"}
              degisken="tutar"
              deger={tamTutar(Math.abs(kalan))}
            />
          </p>
        )}
      </>
    );
    const yasamiAtla = () => {
      setYasamKendim(false);
      setYasamAtlandi(true);
      guncelle({ yasam: 0 });
      ileri({ atlandi: true });
    };
    dugme = (
      <>
        <BirincilDugme
          onClick={() => {
            if (yasam <= 0) return yasamiAtla();
            setYasamAtlandi(false);
            guncelle({ atlanan: durum.atlanan.filter((a) => a !== "yasam") });
            ileri();
          }}
        >
          {t("onboarding.devam")}
        </BirincilDugme>
        <button className="oa-baglanti soluk" type="button" onClick={yasamiAtla}>{t("onboarding.atla")}</button>
      </>
    );
  } else if (adim === "plan") {
    icerik = (
      <>
        <Baslik gri={t("onboarding.plan.baslikGri")} vurgu={t("onboarding.plan.baslik")} />
        <p className="oa-aciklama">{t("onboarding.plan.aciklama")}</p>
        <div className={`oa-plan-kart${kalan < 0 ? " eksi" : ""}`}>
          <span className="oa-mono-etiket">{t("onboarding.plan.etiket")}</span>
          <strong className="oa-plan-tutar">{tamTutar(kalan)}</strong>
          <small>
            {yasamAtlandi || yasam <= 0
              ? t("onboarding.plan.formulYasamsiz", { gelir: tamTutar(gelir), odemeler: tamTutar(odemeler) })
              : t("onboarding.plan.formul", { gelir: tamTutar(gelir), odemeler: tamTutar(odemeler), yasam: tamTutar(yasam) })}
          </small>
          <PlanSeridi gelir={gelir} odemeler={odemeler} yasam={yasam} />
        </div>
        {ilkBiten && (
          <div className="oa-siradaki">
            <span className="oa-sira-no">1</span>
            <span className="oa-siradaki-metin">
              <strong>{ilkBiten.borc.banka}</strong>
              {parseInt(ilkBiten.borc.gun, 10) >= 1 && (
                <small>{t("onboarding.plan.siradaki", { tarih: gunAyEtiketi(sonrakiGunTarihi(ilkBiten.borc.gun)), tutar: tamTutar(
                  ilkBiten.borc.tur === "kredi" || !ilkBiten.ay ? aylikOdeme(ilkBiten.borc) : Math.ceil(borcBakiyesi(ilkBiten.borc) / ilkBiten.ay),
                ) })}</small>
              )}
            </span>
            <span className="oa-siradaki-tutar oa-mono">{tamTutar(borcBakiyesi(ilkBiten.borc))}</span>
          </div>
        )}
        <p className="oa-yanki">
          {!ilkBiten
            ? t("onboarding.plan.borcsuz")
            : ilkBiten.ay === null
              ? t("onboarding.plan.yetmiyor")
              : ilkBiten.ay === 1
                ? t("onboarding.plan.buAyBiter", { ad: ilkBiten.borc.banka })
                : t("onboarding.plan.biter", { ad: ilkBiten.borc.banka, ay: ilkBiten.ay })}
          {ilkOdemeBilgisi && <> {t("onboarding.plan.ilkOdeme", { tarih: gunAyEtiketi(ilkOdemeBilgisi.tarih) })}</>}
        </p>
        {kayitHatasi && <p className="oa-hata" role="alert">{t("onboarding.plan.hata")}</p>}
      </>
    );
    dugme = (
      <BirincilDugme onClick={planiKaydet} disabled={kaydediliyor}>
        {kaydediliyor ? t("ortak.kaydediliyor") : t("onboarding.plan.dugme")}
      </BirincilDugme>
    );
  } else if (adim === "hazir") {
    const ad = native ? durum.ad.trim() : "";
    icerik = (
      <div className="oa-hazir">
        <span className="oa-hazir-rozet" aria-hidden="true"><Check size={34} strokeWidth={3} /></span>
        <p className="oa-mono">{t("onboarding.hazir.rozet")}</p>
        <h1 className="oa-baslik">{ad ? t("onboarding.hazir.baslikAd", { ad }) : t("onboarding.hazir.baslik")}</h1>
        <p className="oa-aciklama">
          {ilkOdemeBilgisi
            ? t("onboarding.hazir.aciklama", { tarih: gunAyEtiketi(ilkOdemeBilgisi.tarih) })
            : t("onboarding.hazir.aciklamaBorcsuz")}
        </p>
      </div>
    );
    dugme = <BirincilDugme onClick={bitir}>{t("onboarding.hazir.dugme")}</BirincilDugme>;
  }

  return (
    <div className={`oa oa-akis oa-zemin-${zemin}`} lang={secilenDil}>
      <form
        className="oa-kolon"
        onSubmit={(olay) => {
          olay.preventDefault();
        }}
      >
        {adim !== "hazir" && (
          <div className="oa-kabuk-ust">
            {oncekiAdim(adim, sira) ? (
              <button className="oa-geri" type="button" onClick={geri} aria-label={t("onboarding.geri")}>
                <ArrowLeft size={17} />
              </button>
            ) : (
              <span className="oa-geri-bos" aria-hidden="true" />
            )}
            <div className="oa-ilerleme" role="progressbar" aria-valuemin={1} aria-valuemax={numarali.length} aria-valuenow={no} aria-label={t("onboarding.ilerlemeAria", { n: no, toplam: numarali.length })}>
              {numarali.map((a, i) => (
                <span key={a} className={i + 1 < no ? "tamam" : i + 1 === no ? "sirada" : ""} />
              ))}
            </div>
          </div>
        )}
        <div className="oa-govde" key={adim}>
          {adim !== "hazir" && <span className="oa-mono-etiket oa-adim">{t("onboarding.adimEtiketi", { n: no, toplam: numarali.length })}</span>}
          {icerik}
        </div>
        <div className="oa-alt">{dugme}</div>
      </form>
    </div>
  );
}

// Sozluk metnindeki {degisken}'i vurgulu (lime) gosterir.
function VurguluMetin({ anahtar, degisken, deger }) {
  const isaret = "\u0000";
  const [once = "", sonra = ""] = t(anahtar, { [degisken]: isaret }).split(isaret);
  return (
    <>
      {once}
      <mark>{deger}</mark>
      {sonra}
    </>
  );
}

function GunSeridi({ secili, onSec }) {
  const kap = useRef(null);
  // Secili gun seridin ortasina gelir; yalniz serit kayar, sayfa kaymaz.
  useEffect(() => {
    const serit = kap.current;
    const gun = serit?.querySelector(".secili");
    if (!serit || !gun) return;
    serit.scrollTo({ left: gun.offsetLeft - serit.clientWidth / 2 + gun.offsetWidth / 2 });
  }, [secili]);
  return (
    <div className="oa-gun-seridi" ref={kap} role="radiogroup" aria-label={t("onboarding.gun.baslik")}>
      {Array.from({ length: 31 }, (_, i) => i + 1).map((gun) => (
        <button
          key={gun}
          type="button"
          role="radio"
          aria-checked={secili === gun}
          aria-label={t("onboarding.gun.gunAria", { gun })}
          className={`oa-gun${secili === gun ? " secili" : ""}`}
          onClick={() => onSec(gun)}
        >
          {gun}
        </button>
      ))}
    </div>
  );
}

function PlanSeridi({ gelir, odemeler, yasam }) {
  if (!(gelir > 0)) return null;
  const pay = (n) => `${Math.max(0, Math.min(100, (n / gelir) * 100))}%`;
  const kalan = Math.max(gelir - odemeler - yasam, 0);
  return (
    <span className="oa-serit" aria-hidden="true">
      <i style={{ flexBasis: pay(odemeler) }} />
      <i style={{ flexBasis: pay(yasam) }} />
      <i style={{ flexBasis: pay(kalan) }} />
    </span>
  );
}
