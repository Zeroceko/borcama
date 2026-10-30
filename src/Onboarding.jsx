import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Building2,
  CalendarCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Delete,
  Plus,
  SlidersHorizontal,
  Target,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { onboardingTamamla } from "./onboardingDurumu.js";
import { misafirModunuAc } from "./misafirModu.js";
import { DESTEKLENEN_DILLER, DIL_ADLARI, belgeDiliniAyarla, dil, dilAyarla, dilSozlugunuYukle, locale, t } from "./i18n.js";
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
import { dokunusGeriBildirimi } from "./platform.js";
import { BANK_LOGOS } from "./bankLogos.js";
import { onboardingOlayiKaydet } from "./activityLog.js";
import {
  BORC_TURLERI,
  HEDEFLER,
  SIKLIKLAR,
  TEMALAR,
  TUM_ULKELER,
  bayrak,
  adimGecilebilirMi,
  adimSirasi,
  durumdanSonuc,
  onboardingSonucunuUygula,

  aylikOdeme,
  aylikOdemeler,
  borcBakiyesi,
  borcGecerli,
  borcAdiminiAtla,
  bosDurum,
  gunlukTutar,
  ilkBitecekBorc,
  ilkOdeme,
  numaraliAdimlar,
  oneCikanUlkeler,
  hedefDegistir,
  sonrakiHaftaGunuTarihi,
  kalanGun,
  planOdemeleri,
  oncekiAdim,
  sonrakiAdim,
  sonrakiGunTarihi,
  sonrakiMaas,
  tutar,
} from "./onboardingAdimlari.js";
import { nativeOnboardingBaslat } from "./onboardingKoprusu.js";
import "./onboardingAkis.css";
import { webdeKoyuMu } from "./siteTema.js";
import { kabukDurumunuBildir } from "./kabukDurumu.js";
import { MasaustuUstCubuk, useMasaustu } from "./MasaustuKabuk.jsx";
import { adimYolu, gecmistenAdim, oturumKullaniciId, taslagiCoz, taslagiOku, taslagiSil, taslagiYaz, taslakAnahtari } from "./kurulumTaslagi.js";

// Uygulama modulu bu dille yuklendi; kurulumda dil degisirse modul duzeyindeki
// metinler icin bitiste sayfa yine yenilenir (i18n.js > diliDegistirVeYenile).
const ACILIS_DILI = dil();

// Iki parca:
// 1. Onboarding (varsayilan): yalniz native kabukta, oturumu olmayan
//    kullaniciya acilis + 3 slaytli karsilama. "Basla" kayda, "Zaten hesabim
//    var" girise, misafir baglantisi hesapsiz kullanima goturur.
// 2. KurulumAkisi: kayit veya misafir sonrasi ilk acilista (web + iOS)
//    App.jsx icinde tam ekran; dil, gorunum, ulke, gelir, ilk borc, plan.
//    Veri mevcut kayit yapisina yazilir (onboardingAdimlari.js > veriyeYaz).
// Yuzey: docs/onboarding-v3-direktifi.md; stiller onboardingAkis.css.
// Metinler sozluk anahtaridir (src/locales/bolumler/onboarding.js).

const tamTutar = (n, birim = kullaniciParaBirimi()) =>
  paraBiriminiFormatla(n, birim, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const gunAyEtiketi = (tarih) =>
  new Intl.DateTimeFormat(locale(), { day: "numeric", month: "short" }).format(tarih);

const gunAyUzunEtiketi = (tarih) =>
  new Intl.DateTimeFormat(locale(), { day: "numeric", month: "long" }).format(tarih);

const gunAyHaftaEtiketi = (tarih) =>
  new Intl.DateTimeFormat(locale(), { day: "numeric", month: "short", weekday: "long" }).format(tarih);

const sayiBicimi = (n) => new Intl.NumberFormat(locale()).format(Number(n) || 0);

// Cihaz temasi (prefers-color-scheme); "system" secimi bunu izler, degisince
// aninda yeniden cizilir.
function ortamSorgusu(sorgu) {
  return typeof window !== "undefined" && typeof window.matchMedia === "function" ? window.matchMedia(sorgu) : null;
}

export function useSistemKoyu() {
  const [koyu, setKoyu] = useState(() => Boolean(ortamSorgusu("(prefers-color-scheme: dark)")?.matches));
  useEffect(() => {
    const sorgu = ortamSorgusu("(prefers-color-scheme: dark)");
    if (!sorgu) return undefined;
    const degisti = (olay) => setKoyu(olay.matches);
    sorgu.addEventListener("change", degisti);
    return () => sorgu.removeEventListener("change", degisti);
  }, []);
  return koyu;
}

export const temaKoyuMu = (tema, sistemKoyu) => tema === "dark" || (tema === "system" && sistemKoyu);

// Klavye (K12): tarayicida visualViewport'tan klavye yuksekligi --klavye
// olarak koke yazilir (.oa-alt bu kadar yukselir); odaklanan alan gorunur
// alana kaydirilir. iOS kabugu klavyeyi "borcamaKlavye" olayiyla bildirir
// ({ yukseklik, sure }): CTA klavyeyle ayni surede ve egride kayar, webview
// klavye bittikten sonra bir kerede kuculup "hoplamaz". Olay bir kez
// geldiyse visualViewport yok sayilir.
export function useKlavye(kokRef) {
  useEffect(() => {
    const kok = kokRef.current;
    if (!kok || typeof window === "undefined") return undefined;
    const vv = window.visualViewport;
    let nativeKlavye = false;
    const guncelle = () => {
      if (nativeKlavye) return;
      const yukseklik = vv ? Math.max(0, window.innerHeight - vv.height - vv.offsetTop) : 0;
      kok.style.setProperty("--klavye", `${Math.round(yukseklik)}px`);
    };
    const nativeKlavyeOlayi = (olay) => {
      nativeKlavye = true;
      const { yukseklik = 0, sure = 0.25 } = olay.detail || {};
      kok.style.setProperty("--klavye-sure", `${Math.max(0, +sure || 0)}s`);
      kok.style.setProperty("--klavye", `${Math.max(0, Math.round(+yukseklik || 0))}px`);
    };
    let zamanlayici;
    const odak = (olay) => {
      const alan = olay.target;
      if (!alan?.matches?.("input, textarea, select")) return;
      window.clearTimeout(zamanlayici);
      zamanlayici = window.setTimeout(() => alan.scrollIntoView?.({ block: "center", behavior: "smooth" }), 50);
    };
    guncelle();
    vv?.addEventListener("resize", guncelle);
    vv?.addEventListener("scroll", guncelle);
    window.addEventListener("borcamaKlavye", nativeKlavyeOlayi);
    kok.addEventListener("focusin", odak);
    return () => {
      window.removeEventListener("borcamaKlavye", nativeKlavyeOlayi);
      window.clearTimeout(zamanlayici);
      vv?.removeEventListener("resize", guncelle);
      vv?.removeEventListener("scroll", guncelle);
      kok.removeEventListener("focusin", odak);
    };
  }, [kokRef]);
}

// Dokunmatik cihazda tutar uygulama ici tus takimiyla girilir.
function useKabaIsaretci() {
  const [kaba] = useState(() => Boolean(ortamSorgusu("(pointer: coarse)")?.matches));
  return kaba;
}

/* ---------------- Ortak parcalar ---------------- */

// Sozlukteki iki parcali basliklar (baslikGri + baslik) tek renk, tek satirda
// basilir; anahtarlar native koprusu icin kaliyor.
function Baslik({ gri, vurgu }) {
  return <h1 className="oa-baslik">{[gri, vurgu].filter(Boolean).join(" ")}</h1>;
}

function BirincilDugme({ children, onClick, disabled = false, type = "button", form }) {
  return (
    <button
      className="oa-dugme"
      type={type}
      form={form}
      disabled={disabled}
      onClick={(olay) => {
        dokunusGeriBildirimi("orta");
        onClick?.(olay);
      }}
    >
      {children}
    </button>
  );
}

function Halka() {
  return (
    <span className="oa-halka" aria-hidden="true">
      <Check size={13} strokeWidth={3.5} />
    </span>
  );
}

// Ust kabuk: geri (40px daire) · parcali ilerleme · sagda "Simdilik gec".
function Kabuk({ geri, geriEtiket, no, toplam, atla, atlaEtiket, sag }) {
  return (
    <div className="oa-kabuk">
      {geri ? (
        <button className="oa-geri" type="button" onClick={geri} aria-label={geriEtiket || t("onboarding.geri")}>
          <ChevronLeft size={20} strokeWidth={2.2} />
        </button>
      ) : (
        <span className="oa-geri-bos" aria-hidden="true" />
      )}
      {toplam > 0 && (
        <div className="oa-ilerleme" role="progressbar" aria-valuemin={1} aria-valuemax={toplam} aria-valuenow={no} aria-label={t("onboarding.ilerlemeAria", { n: no, toplam })}>
          {Array.from({ length: toplam }, (_, i) => (
            <span key={i} className={i + 1 < no ? "tamam" : i + 1 === no ? "sirada" : ""} />
          ))}
        </div>
      )}
      {atla && (
        <button className="oa-atla" type="button" onClick={atla}>
          {atlaEtiket || t("onboarding.atla")}
        </button>
      )}
      {sag}
    </div>
  );
}

function SecimSatiri({ secili, onClick, children, alt, sag, kod, bayrak: bayrakEmoji, ...props }) {
  return (
    <button
      className={`oa-secim${secili ? " secili" : ""}`}
      type="button"
      aria-pressed={secili}
      onClick={() => {
        dokunusGeriBildirimi("hafif");
        onClick();
      }}
      {...props}
    >
      {kod && <span className="oa-kod" aria-hidden="true">{kod}</span>}
      {bayrakEmoji && <span className="oa-bayrak" aria-hidden="true">{bayrakEmoji}</span>}
      <span className="metin">
        {children}
        {alt && <small>{alt}</small>}
      </span>
      {sag && <span className="sag">{sag}</span>}
      <Halka />
    </button>
  );
}

function SecimKarti({ secili, onClick, ikon: Ikon, children }) {
  return (
    <button
      className={`oa-kart${secili ? " secili" : ""}`}
      type="button"
      aria-pressed={secili}
      onClick={() => {
        dokunusGeriBildirimi("hafif");
        onClick();
      }}
    >
      <span className="ikon" aria-hidden="true"><Ikon size={20} strokeWidth={2.2} /></span>
      <span>{children}</span>
      <Halka />
    </button>
  );
}

// Kenarliksiz ek satir; `secenekler` verilirse ustune gorunmez <select> serilir.
function EkSatir({ children, alt, secili = false, onClick, secenekler, deger, onSec, etiket }) {
  const icerik = (
    <>
      <span>
        <span>{children}</span>
        {alt && <small>{alt}</small>}
      </span>
      {secili ? <Check size={16} aria-hidden="true" /> : <ChevronRight size={16} aria-hidden="true" />}
    </>
  );
  if (secenekler) {
    return (
      <label className="oa-ek">
        {icerik}
        <select aria-label={etiket} value={deger} onChange={(o) => onSec(o.target.value)}>
          {secenekler.map(([kod, ad]) => <option key={kod} value={kod}>{ad}</option>)}
        </select>
      </label>
    );
  }
  return (
    <button className={`oa-ek${secili ? " secili" : ""}`} type="button" aria-pressed={secili} onClick={onClick}>
      {icerik}
    </button>
  );
}

const normalize = (ad) => String(ad || "").toLowerCase().replace(/ı/g, "i").replace(/[^a-z0-9]/g, "");

// Banka logosu (bankLogos.js) varsa 28px logo, yoksa mono kod rozeti.
export function BankaLogosu({ ad, kisi = false }) {
  if (kisi) return <span className="oa-kod" aria-hidden="true">{t("onboarding.karsilama.kisiRozet")}</span>;
  const n = normalize(ad);
  const anahtar = Object.keys(BANK_LOGOS).find((k) => n.startsWith(k) || k.startsWith(n.slice(0, 5)));
  if (anahtar) return <img className="oa-banka" src={BANK_LOGOS[anahtar]} alt="" />;
  return <span className="oa-kod" aria-hidden="true">{String(ad || "").trim().slice(0, 3).toUpperCase() || "?"}</span>;
}

// Sozluk metnindeki {degisken}'i vurgulu (lime mark) ya da kalin gosterir.
function VurguluMetin({ anahtar, degisken, deger, kalin = false, ek = {} }) {
  const isaret = "\u0000";
  const [once = "", sonra = ""] = t(anahtar, { ...ek, [degisken]: isaret }).split(isaret);
  return (
    <>
      {once}
      {kalin ? <b>{deger}</b> : <mark>{deger}</mark>}
      {sonra}
    </>
  );
}

function BilgiKarti({ ikon: Ikon, kalin, children }) {
  return (
    <div className="oa-bilgi">
      <span className="ikon" aria-hidden="true"><Ikon size={16} strokeWidth={2.2} /></span>
      <span><b>{kalin}</b> {children}</span>
    </div>
  );
}

/* ---------------- Tutar: buyuk gosterim + tus takimi ---------------- */

// Dokunmatikte: simge + sayi + yanip sonen imlec; masaustunde ayni gorunumde
// gercek girdi. Deger ham rakam dizisi ("32000").
function TutarGosterimi({ deger, etiket, girdi = false, onChange, otomatikOdak = false, onEnter }) {
  const birim = kullaniciParaBirimi();
  const bos = !deger;
  return (
    <div className="oa-tutar" aria-live="polite" aria-label={etiket}>
      <span className="simge" aria-hidden="true">{paraBirimiSimgesi(birim)}</span>
      {girdi ? (
        <input
          inputMode="decimal"
          autoComplete="off"
          aria-label={etiket}
          value={deger ? sayiBicimi(deger) : ""}
          placeholder="0"
          autoFocus={otomatikOdak}
          onKeyDown={(olay) => { if (olay.key === "Enter" && onEnter) { olay.preventDefault(); onEnter(); } }}
          onChange={(olay) => onChange(olay.target.value.replace(/\D/g, "").replace(/^0+/, "").slice(0, 12))}
        />
      ) : (
        <>
          <span className={`deger${bos ? " bos" : ""}`}>{bos ? "0" : sayiBicimi(deger)}</span>
          <i className="imlec" aria-hidden="true" />
        </>
      )}
    </div>
  );
}

const TUSLAR = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "000", "0", "sil"];

function TusTakimi({ deger, onChange }) {
  const bas = (tus) => {
    dokunusGeriBildirimi("hafif");
    if (tus === "sil") return onChange(deger.slice(0, -1));
    if (deger.length >= 12) return;
    onChange((deger + tus).replace(/^0+/, "").slice(0, 12));
  };
  return (
    <div className="oa-tuslar">
      {TUSLAR.map((tus) =>
        tus === "sil" ? (
          <button key={tus} className="oa-tus" type="button" aria-label={t("onboarding.tuslar.sil")} onClick={() => bas(tus)}>
            <Delete size={26} strokeWidth={2.2} />
          </button>
        ) : (
          <button key={tus} className={`oa-tus${tus === "000" ? " uclu" : ""}`} type="button" onClick={() => bas(tus)}>
            {tus}
          </button>
        ),
      )}
    </div>
  );
}

// Formdaki kucuk tutar alani (borc formu).
function TutarAlani({ deger, onChange, etiket }) {
  const birim = kullaniciParaBirimi();
  return (
    <span className="oa-tutar kucuk">
      <span className="simge" aria-hidden="true">{paraBirimiSimgesi(birim)}</span>
      <input
        className="oa-mono"
        inputMode="decimal"
        autoComplete="off"
        aria-label={etiket}
        value={deger ? sayiBicimi(deger) : ""}
        placeholder="0"
        onChange={(olay) => onChange(olay.target.value.replace(/\D/g, "").replace(/^0+/, "").slice(0, 12))}
      />
    </span>
  );
}

/* ---------------- 1. Giris oncesi: acilis + karsilama (native) ---------------- */

const SLAYTLAR = [1, 2, 3];

// Uygulamanin gercek ekranindan maket: maasa kadar kalan, borc listesi.
function Maket({ slayt }) {
  const simdi = new Date();
  const maas = sonrakiMaas(15, simdi);
  const gun = Math.max(maas.kalan, 1);
  return (
    <div className="oa-mockup" role="img" aria-label={t("onboarding.karsilama.ornekAria")}>
      <span className="oa-mono-etiket">{t("onboarding.karsilama.ornekEtiket")}</span>
      <span className="m-hero">{tamTutar(ornekTutar(8450))}</span>
      <span className={`m-gun${slayt === 3 ? " vurgu" : ""}`}>
        <VurguluMetin anahtar="onboarding.karsilama.maketKalan" degisken="gun" deger={gun} kalin />
      </span>
      <span className="oa-mono-etiket" style={{ marginTop: 4 }}>{t("onboarding.karsilama.borclar")}</span>
      <div className={`m-borc${slayt !== 3 ? " ilk" : ""}`}>
        <BankaLogosu ad="Akbank" />
        <span>Akbank<small>{t("onboarding.karsilama.maketSonOdeme", { tarih: gunAyEtiketi(sonrakiGunTarihi(12, simdi)) })}</small></span>
        <b>{tamTutar(ornekTutar(6200))}</b>
      </div>
      <div className="m-borc">
        <BankaLogosu ad="QNB" />
        <span>{t("onboarding.karsilama.maketKredi")}<small>{t("onboarding.karsilama.maketTaksit", { n: 8 })}</small></span>
        <b>{tamTutar(ornekTutar(4150))}</b>
      </div>
      <div className="m-borc">
        <BankaLogosu ad="Enpara" />
        <span>{t("onboarding.karsilama.maketEkHesap")}<small>{t("onboarding.karsilama.maketKullanilan")}</small></span>
        <b>{tamTutar(ornekTutar(1900))}</b>
      </div>
      <div className="m-borc">
        <BankaLogosu kisi />
        <span>{t("onboarding.karsilama.maketKisiAd")}<small>{t("onboarding.karsilama.maketKisi")}</small></span>
        <b>{tamTutar(ornekTutar(3000))}</b>
      </div>
    </div>
  );
}

export default function Onboarding({ acilis = true }) {
  const [ekran, setEkran] = useState(acilis ? "acilis" : "karsilama");
  const [cikiyor, setCikiyor] = useState(false);
  const [slayt, setSlayt] = useState(1);
  const koyu = useSistemKoyu();
  const dokunus = useRef(null);

  useEffect(() => {
    if (ekran !== "acilis") return undefined;
    const zamanlayici = window.setTimeout(() => setEkran("karsilama"), 1000);
    return () => window.clearTimeout(zamanlayici);
  }, [ekran]);

  // Slaytlar 3.6 saniyede doner; kaydirma da degistirir.
  useEffect(() => {
    if (ekran !== "karsilama") return undefined;
    const zamanlayici = window.setInterval(() => setSlayt((s) => (s % 3) + 1), 3600);
    return () => window.clearInterval(zamanlayici);
  }, [ekran, slayt]);

  function git(hedef, misafir = false) {
    onboardingTamamla();
    if (misafir) misafirModunuAc();
    setCikiyor(true);
    // Tam sayfa gecis: native kabukta ayni kaynakta kaldigi icin uygulama
    // yeniden yuklenip hedefle acilir.
    window.setTimeout(() => window.location.assign(hedef), 200);
  }

  const logo = koyu ? "/borcama-logo-koyu.png" : "/borcama-logo-368.png";

  if (ekran === "acilis") {
    return (
      <div className={`oa oa-acilis${koyu ? " oa-koyu" : ""}`} onClick={() => setEkran("karsilama")}>
        <img className="oa-logo" src={logo} alt="Borcama" width="368" height="90" />
      </div>
    );
  }

  return (
    <div
      className={`oa oa-karsilama${koyu ? " oa-koyu" : ""}${cikiyor ? " cikiyor" : ""}`}
      onTouchStart={(o) => { dokunus.current = o.touches[0]?.clientX ?? null; }}
      onTouchEnd={(o) => {
        const bas = dokunus.current;
        const son = o.changedTouches[0]?.clientX;
        if (bas === null || son === undefined || Math.abs(son - bas) < 40) return;
        setSlayt((s) => (son < bas ? (s % 3) + 1 : ((s + 1) % 3) + 1));
      }}
    >
      <div className="oa-kolon">
        <div className="oa-govde">
          <img className="oa-logo" src={logo} alt="Borcama" width="368" height="90" />
          <div className="oa-noktalar" aria-hidden="true">
            {SLAYTLAR.map((s) => <i key={s} className={s === slayt ? "aktif" : ""} />)}
          </div>
          <div className="oa-slayt" key={slayt}>
            <p className="oa-slogan">{t(`onboarding.karsilama.slayt${slayt}`)}</p>
            <p className="oa-slogan-alt">{t(`onboarding.karsilama.slayt${slayt}Alt`)}</p>
          </div>
          <Maket slayt={slayt} />
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
  const koyu = useSistemKoyu();
  useEffect(() => nativeOnboardingBaslat(), []);
  return (
    <div className={`oa oa-acilis${koyu ? " oa-koyu" : ""}`} aria-hidden="true">
      <img className="oa-logo" src={koyu ? "/borcama-logo-koyu.png" : "/borcama-logo-368.png"} alt="" width="368" height="90" />
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

// Dilin adi secili dilde (alt satir): "English" altinda "Ingilizce".
function dilinAdi(kod, secili) {
  try {
    const ad = new Intl.DisplayNames([secili], { type: "language" }).of(kod) || "";
    return ad.charAt(0).toLocaleUpperCase(secili) + ad.slice(1);
  } catch {
    return "";
  }
}

const HEDEF_IKONLARI = { borc: Target, aySonu: CalendarCheck, kontrol: SlidersHorizontal };
const TUR_IKONLARI = { kart: CreditCard, kredi: Building2, kmh: Wallet, kisi: Users };

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
      <input value={borc[alan] || ""} placeholder={ornek(yerTutucu)} onChange={(o) => ayarla(alan)(o.target.value)} />
    </Alan>
  );
  const gun = (alan, etiket) => (
    <Alan etiket={etiket}>
      <input className="oa-mono" inputMode="numeric" value={borc[alan] || ""} placeholder={ornek("15")} onChange={(o) => ayarla(alan)(gunDegeri(o.target.value))} />
    </Alan>
  );
  const para = (alan, etiket) => (
    <Alan etiket={etiket}>
      <TutarAlani deger={borc[alan] || ""} onChange={ayarla(alan)} etiket={etiket} />
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
          <input className="oa-mono" inputMode="numeric" value={borc.kalanTaksit || ""} placeholder={ornek("18")} onChange={(o) => ayarla("kalanTaksit")(o.target.value.replace(/\D/g, "").slice(0, 3))} />
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

// Eklenen borcun alt satiri: kart/kredi/kmh/kisi kisa etiketi.
function borcAltSatiri(borc) {
  if (borc.tur === "kredi") return `${t("onboarding.turler.kredi")}, ${t("onboarding.karsilama.maketTaksit", { n: parseInt(borc.kalanTaksit, 10) || 0 })}`;
  return t(`onboarding.turler.${borc.tur}`);
}

function TemaSecimi({ secili, onSec }) {
  const kart = (tema, ad, sinif) => (
    <button
      key={tema}
      className={`oa-tema${secili === tema ? " secili" : ""}`}
      type="button"
      role="radio"
      aria-checked={secili === tema}
      onClick={() => {
        dokunusGeriBildirimi("hafif");
        onSec(tema);
      }}
    >
      <span className={`oa-mini${sinif}`} aria-hidden="true">
        <i className="m-cizgi" />
        <span className="m-tutar">{tamTutar(ornekTutar(8450))}</span>
        <i className="m-bar lime" />
        <i className="m-bar coral" />
        <i className="m-bar mint" />
        <i className="m-alt" />
      </span>
      <span className="ad">{ad}<Halka /></span>
    </button>
  );
  return (
    <div className="oa-temalar" role="radiogroup" aria-label={t("onboarding.gorunum.baslik")}>
      {kart("system", t("onboarding.gorunum.sistem"), " bolunmus")}
      {kart("light", t("onboarding.gorunum.acik"), "")}
      {kart("dark", t("onboarding.gorunum.koyu"), " koyu")}
    </div>
  );
}

// Web, ≥1024 (docs/web-akis-direktifi.md §3 PR-3): uygulamanin ust cubugu
// (logo, "Adim n/10", Cikis) ve iki sutun: solda adim (560 px), sagda canli
// Bugün onizlemesi (`onizleme(taslakVeri, { koyu, adim })`, App.jsx). Hazirsin
// adiminda `onHazir({ ilkOdeme, bitir })` cagrilir; uygulama cizilir, ustte
// lime bant.
export function KurulumAkisi({ veri, native = false, kaydet, onBitti, onHazir, onizleme, cikisYap }) {
  // Web: adim /kurulum/<adim> adresinde ve tarayici gecmisinde; adim ve
  // cevaplar sekme oturumunda saklanir (yenileme ve geri tusu, B6/B7).
  // Native (iOS) bunlari kullanmaz.
  const web = !native;
  const [taslakAnahtar] = useState(() => taslakAnahtari(oturumKullaniciId()));
  const [ilkTaslak] = useState(() => {
    if (!web) return null;
    const ham = taslagiOku(taslakAnahtar);
    const cozulen = ham ? taslagiCoz(ham, { native, diller: DESTEKLENEN_DILLER, birimler: DESTEKLENEN_PARA_BIRIMLERI }) : null;
    if (ham && !cozulen) taslagiSil(taslakAnahtar);
    return cozulen;
  });
  const [durum, setDurum] = useState(() => ilkTaslak?.durum || bosDurum());
  const [adim, setAdim] = useState(() => ilkTaslak?.adim || "dil");
  // Dil secimi kayitli (dilAyarla); yenilemede gecerli dil zaten odur.
  const [secilenDil, setSecilenDil] = useState(dil());
  const [, setSozlukSurumu] = useState(0);
  const [ulke, setUlke] = useState(() => {
    if (ilkTaslak?.ulke) return ilkTaslak.ulke;
    const tespit = cihazBolgesi();
    return /^[A-Z]{2}$/.test(tespit) ? tespit : "TR";
  });
  // One cikan liste tespit edilen ulkeye gore bir kez kurulur; secimle degismez.
  const [oneCikan] = useState(() => oneCikanUlkeler(cihazBolgesi()));
  const [birim, setBirim] = useState(() => ilkTaslak?.birim || kullaniciParaBirimi());
  const [taslak, setTaslak] = useState(null);
  const [taslakHata, setTaslakHata] = useState(false);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [kayitHatasi, setKayitHatasi] = useState(false);
  const baslangic = useRef(Date.now());
  const adimBaslangici = useRef(Date.now());
  const sistemKoyu = useSistemKoyu();
  const kabaIsaretci = useKabaIsaretci();
  const kokRef = useRef(null);
  useKlavye(kokRef);
  const masaustu = useMasaustu() && !native;
  // Web'de tema sorusundan (2. adım) önce site temasıyla açılır; kayıt
  // ekranından gelen kullanıcı aynı görünümde kalır.
  const koyu = !native && adim === "dil"
    ? webdeKoyuMu({ native, sistemKoyu })
    : temaKoyuMu(durum.tema, sistemKoyu);

  // Akis tam ekran; iOS'ta native sekme cubugu akis bitince (yeniden
  // yuklemede) geri gelir.
  useEffect(() => {
    sekmeCubugunuGoster(false);
  }, []);
  // Web: sayfa zemini (kaydirma cubugu boslugu dahil) akisin temasiyla ayni.
  useEffect(() => {
    if (!web) return;
    const kok = document.querySelector(".oa.oa-akis");
    const zemin = kok ? getComputedStyle(kok).getPropertyValue("--oa-zemin").trim() : "";
    if (zemin) document.body.style.backgroundColor = zemin;
  }, [web, koyu, adim]);
  // Web'de kurulum acikken olcum izni bandi cizilmez (B2).
  useEffect(() => {
    if (native) return undefined;
    kabukDurumunuBildir({ kurulum: true });
    return () => kabukDurumunuBildir({ kurulum: false });
  }, [native]);

  const sira = useMemo(
    () => adimSirasi({ native, siklik: durum.siklik, borcYok: durum.borcYok }),
    [native, durum.siklik, durum.borcYok],
  );
  const numarali = numaraliAdimlar(sira);
  const no = numarali.indexOf(adim) + 1;
  const guncelle = (alanlar) => setDurum((eski) => ({ ...eski, ...alanlar }));

  // Gecmis dinleyicisi guncel adim ve siraya ref ile bakar.
  const adimRef = useRef(adim);
  const siraRef = useRef(sira);
  adimRef.current = adim;
  siraRef.current = sira;

  // Web: ilk giriste gecmise bir koruma girdisi (/kurulum/dil) ve gecerli
  // adim yazilir; 1. adimda geri tusu kurulumdan cikmaz. Yenilemede gecmis
  // durumu korunur, ikinci koruma eklenmez (StrictMode'da da tek sefer).
  useEffect(() => {
    if (!web) return;
    const arama = window.location.search;
    const mevcut = window.history.state;
    if (mevcut && typeof mevcut === "object" && mevcut.kurulumAdim) {
      window.history.replaceState({ ...mevcut, kurulumAdim: adimRef.current }, "", adimYolu(adimRef.current, arama));
      return;
    }
    window.history.replaceState({ kurulumKoruma: true }, "", adimYolu("dil", arama));
    window.history.pushState({ kurulumAdim: adimRef.current, kurulumOnceki: null }, "", adimYolu(adimRef.current, arama));
  }, [web]);

  // Geri/ileri: gecerli bir kurulum adimina gidilir. Koruma girdisine ya da
  // artik sirada olmayan adima gelinirse ve kayittan sonra (hazir) akista
  // kalinir.
  useEffect(() => {
    if (!web) return undefined;
    const gecmisDegisti = (olay) => {
      const hedef = adimRef.current === "hazir" ? null : gecmistenAdim(olay.state, siraRef.current);
      if (hedef) {
        adimBaslangici.current = Date.now();
        setAdim(hedef);
        return;
      }
      window.history.pushState({ kurulumAdim: adimRef.current, kurulumOnceki: null }, "", adimYolu(adimRef.current, window.location.search));
    };
    window.addEventListener("popstate", gecmisDegisti);
    return () => window.removeEventListener("popstate", gecmisDegisti);
  }, [web]);

  // Taslak: her degisimde sekme oturumuna; kayittan sonra silinir.
  useEffect(() => {
    if (!web || adim === "hazir") return;
    taslagiYaz(taslakAnahtar, { adim, durum, secilenDil, ulke, birim });
  }, [web, taslakAnahtar, adim, durum, secilenDil, ulke, birim]);

  // Onizleme taslagi: girilen cevaplar (borc adiminda yazilmakta olan gecerli
  // borc dahil) uygulamanin kayit yoluyla bos veriye yazilir.
  const taslakVeri = useMemo(() => {
    if (!masaustu || !onizleme || adim === "hazir") return null;
    const yazilan = adim === "borc" && taslak && borcGecerli(taslak) ? [taslak] : [];
    const sonuc = durumdanSonuc({ ...durum, borclar: [...durum.borclar, ...yazilan] }, { dil: secilenDil, ulke, paraBirimi: birim });
    let n = 0;
    return onboardingSonucunuUygula(veri, sonuc, {
      native: false,
      simdi: new Date(),
      idUret: () => `onizleme-${n++}`,
      gelirAdi: t("onboarding.gelir.kayitAdi"),
    });
  }, [masaustu, onizleme, adim, taslak, durum, secilenDil, ulke, birim, veri]);

  function adimaYonel(hedef) {
    setAdim(hedef);
    if (web) window.history.pushState({ kurulumAdim: hedef, kurulumOnceki: adim }, "", adimYolu(hedef, window.location.search));
  }

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
    adimaYonel(hedef);
  }

  const ileri = (secenekler) => adimaGec(sonrakiAdim(adim, sira), secenekler);
  // Web'de uygulamadaki geri dugmesi tarayicinin geri tusuyla ayni yoldan
  // gider (onceki girdi onceki adimsa); degilse (ör. yenilemeden sonra
  // gecmiste yoksa) adim yerinde degisir.
  const geri = () => {
    const onceki = oncekiAdim(adim, sira);
    if (!onceki) return;
    if (web && window.history.state?.kurulumOnceki === onceki) {
      window.history.back();
      return;
    }
    adimBaslangici.current = Date.now();
    setAdim(onceki);
    if (web) window.history.replaceState({ kurulumAdim: onceki, kurulumOnceki: null }, "", adimYolu(onceki, window.location.search));
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
    if (web) taslagiSil(taslakAnahtar);
    adimaGec("hazir");
  }

  function bitir() {
    if (native) onboardingTamamla();
    // Web: sayfa yenilenmez (B8); tema veriden, para birimi ve bolge
    // secildikleri anda kayitli. Dil degistiyse modul duzeyindeki metinler
    // icin yine yenilenir. iOS: yeniden yukleme native sekmeleri geri getirir.
    if (web && onBitti && dil() === ACILIS_DILI) {
      onBitti();
      return;
    }
    window.location.assign("/summary");
  }

  const gelir = tutar(durum.gelir);
  const borclar = durum.borcYok ? [] : durum.borclar;
  // Yasam gideri sorulmuyor: plan gelirin %45'ini yasam icin ayrilmis sayar
  // (onboardingAdimlari.js > yasamVarsayilan); Plan ekraninda degisir.
  const odemeler = planOdemeleri({ gelir, borclar });
  const ilkBiten = ilkBitecekBorc({ gelir, borclar });
  const ilkOdemeBilgisi = ilkOdeme(borclar);

  // Masaustunde "Hazirsin" telefon karti yerine uygulamanin kendisi: App
  // bilgiyi alip Bugün'u cizer (boyamadan once; ara ekran gorunmez).
  const hazirUygulamada = web && masaustu && adim === "hazir" && Boolean(onHazir);
  useLayoutEffect(() => {
    if (!hazirUygulamada) return;
    onHazir({ ilkOdeme: ilkOdemeBilgisi ? gunAyEtiketi(ilkOdemeBilgisi.tarih) : null, bitir });
  }, [hazirUygulamada]);

  let icerik = null;
  let dugme = null;
  let atla = null;
  let govdeSinifi = "oa-govde";

  if (adim === "dil") {
    icerik = (
      <>
        <Baslik gri={t("onboarding.dil.baslikGri")} vurgu={t("onboarding.dil.baslik")} />
        <p className="oa-aciklama">{t("onboarding.dil.aciklama")}</p>
        <div className="oa-liste">
          {DESTEKLENEN_DILLER.map((kod) => (
            <SecimSatiri key={kod} secili={secilenDil === kod} onClick={() => dilSec(kod)} kod={kod.toUpperCase()} alt={kod === secilenDil ? null : dilinAdi(kod, secilenDil)} lang={kod}>
              {DIL_ADLARI[kod]}
            </SecimSatiri>
          ))}
        </div>
      </>
    );
    dugme = <BirincilDugme onClick={() => ileri()}>{t("onboarding.devam")}</BirincilDugme>;
  } else if (adim === "gorunum") {
    icerik = (
      <>
        <Baslik vurgu={t("onboarding.gorunum.baslik")} />
        <p className="oa-aciklama">{t("onboarding.gorunum.aciklama")}</p>
        <TemaSecimi secili={durum.tema} onSec={(tema) => guncelle({ tema: TEMALAR.includes(tema) ? tema : "system" })} />
      </>
    );
    dugme = <BirincilDugme onClick={() => ileri()}>{t("onboarding.devam")}</BirincilDugme>;
  } else if (adim === "ulke") {
    const tumListe = [...new Set(TUM_ULKELER)].sort((a, b) => ulkeAdi(a).localeCompare(ulkeAdi(b), locale()));
    icerik = (
      <>
        <Baslik gri={t("onboarding.ulke.baslikGri")} vurgu={t("onboarding.ulke.baslik")} />
        <p className="oa-aciklama">{t("onboarding.ulke.aciklama")}</p>
        <div className="oa-liste">
          {oneCikan.map((kod) => {
            const ulkeBirimi = kod === ulke ? birim : bolgedenParaBirimi(`und-${kod}`);
            return (
              <SecimSatiri key={kod} secili={kod === ulke} onClick={() => ulkeSec(kod)} bayrak={bayrak(kod)} sag={`${ulkeBirimi} ${paraBirimiSimgesi(ulkeBirimi)}`}>
                {ulkeAdi(kod)}
              </SecimSatiri>
            );
          })}
        </div>
        <EkSatir
          alt={oneCikan.includes(ulke) ? t("onboarding.ulke.baskaUlkeAlt") : `${ulke} · ${ulkeAdi(ulke)}`}
          secenekler={tumListe.map((kod) => [kod, ulkeAdi(kod)])}
          deger={ulke}
          onSec={ulkeSec}
          etiket={t("onboarding.ulke.ulkeSec")}
        >
          {t("onboarding.ulke.baskaUlke")}
        </EkSatir>
        <EkSatir
          secenekler={DESTEKLENEN_PARA_BIRIMLERI.map((kod) => [kod, `${kod} · ${paraBirimiAdi(kod)}`])}
          deger={birim}
          onSec={setBirim}
          etiket={t("onboarding.ulke.paraSec")}
        >
          {t("onboarding.ulke.baskaPara", { kod: `${birim} ${paraBirimiSimgesi(birim)}` })}
        </EkSatir>
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
    atla = () => {
      guncelle({ ad: "" });
      ileri({ atlandi: true });
    };
    dugme = <BirincilDugme onClick={() => ileri({ atlandi: !durum.ad.trim() })}>{t("onboarding.devam")}</BirincilDugme>;
  } else if (adim === "hedef") {
    icerik = (
      <>
        <Baslik gri={t("onboarding.hedef.baslikGri")} vurgu={t("onboarding.hedef.baslik")} />
        <p className="oa-aciklama">{t("onboarding.hedef.aciklamaCoklu")} {t("onboarding.hedef.aciklama")}</p>
        <div className="oa-izgara">
          {HEDEFLER.map((hedef) => (
            <SecimKarti
              key={hedef}
              secili={durum.hedefler.includes(hedef)}
              ikon={HEDEF_IKONLARI[hedef]}
              onClick={() => guncelle({ hedefler: hedefDegistir(durum.hedefler, hedef) })}
            >
              {t(`onboarding.hedef.${hedef}`)}
            </SecimKarti>
          ))}
        </div>
      </>
    );
    dugme = (
      <BirincilDugme onClick={() => ileri()} disabled={!adimGecilebilirMi("hedef", durum)}>
        {t("onboarding.devam")}
      </BirincilDugme>
    );
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
              alt={siklik === "duzensiz" ? t("onboarding.siklik.duzensizAlt") : null}
            >
              {t(`onboarding.siklik.${siklik}`)}
            </SecimSatiri>
          ))}
        </div>
      </>
    );
    dugme = <BirincilDugme onClick={() => ileri()}>{t("onboarding.devam")}</BirincilDugme>;
  } else if (adim === "gun") {
    // Ayda bir: ayin gunu; ayda iki: ilk maasin gunu; haftalik: haftanin gunu.
    const haftalik = durum.siklik === "haftalik";
    const ek = haftalik ? ".haftalik" : durum.siklik === "ikiKez" ? ".ikiKez" : "";
    const maas = haftalik
      ? (() => {
          const tarih = sonrakiHaftaGunuTarihi(durum.maasHaftaGunu);
          return { tarih, kalan: kalanGun(tarih) };
        })()
      : sonrakiMaas(durum.maasGunu);
    // Donem: son maastan (bir ay once) sonraki maasin bir gun oncesine.
    const donemBasi = new Date(maas.tarih.getFullYear(), maas.tarih.getMonth() - 1, maas.tarih.getDate());
    const donemSonu = new Date(maas.tarih.getFullYear(), maas.tarih.getMonth(), maas.tarih.getDate() - 1);
    const haftaGunuAdi = new Intl.DateTimeFormat(locale(), { weekday: "long" }).format(maas.tarih);
    icerik = (
      <>
        <Baslik gri={t(`onboarding.gun.baslikGri${ek}`)} vurgu={t(`onboarding.gun.baslik${ek}`)} />
        <p className="oa-aciklama">{t(`onboarding.gun.aciklama${ek}`)}</p>
        <div className="oa-gun-kutu">
          <span className="oa-mono-etiket">{haftalik ? t("onboarding.gun.baslik.haftalik") : t("onboarding.gun.gunEtiketi")}</span>
          {haftalik ? (
            <HaftaGunleri secili={durum.maasHaftaGunu} onSec={(maasHaftaGunu) => guncelle({ maasHaftaGunu })} />
          ) : (
            <GunSecici secili={durum.maasGunu} onSec={(maasGunu) => guncelle({ maasGunu })} />
          )}
        </div>
        <p className="oa-yanki" aria-live="polite">
          <VurguluMetin anahtar={haftalik ? "onboarding.gun.yankiHafta" : "onboarding.gun.yanki"} degisken="tarih" deger={gunAyHaftaEtiketi(maas.tarih)} />{" "}
          {maas.kalan === 0 ? t("onboarding.gun.bugun") : t("onboarding.gun.kalan", { gun: maas.kalan })}
        </p>
        {haftalik ? (
          <BilgiKarti ikon={CalendarCheck} kalin={t("onboarding.gun.donemHafta", { gun: haftaGunuAdi })} />
        ) : (
          <BilgiKarti ikon={CalendarCheck} kalin={t("onboarding.gun.donem", { bas: gunAyEtiketi(donemBasi), bit: gunAyEtiketi(donemSonu) })}>
            {t("onboarding.gun.donemAciklama", { tarih: gunAyUzunEtiketi(maas.tarih) })}
          </BilgiKarti>
        )}
      </>
    );
    dugme = <BirincilDugme onClick={() => ileri()}>{t("onboarding.devam")}</BirincilDugme>;
  } else if (adim === "gelir") {
    govdeSinifi = "oa-govde dikey";
    icerik = (
      <>
        <Baslik gri={t("onboarding.gelir.baslikGri")} vurgu={t("onboarding.gelir.baslik")} />
        <p className="oa-aciklama">{t("onboarding.gelir.aciklama")}</p>
        <TutarGosterimi deger={durum.gelir} etiket={t("onboarding.gelir.etiket")} girdi={!kabaIsaretci} otomatikOdak onEnter={() => { if (adimGecilebilirMi("gelir", durum)) ileri(); }} onChange={(deger) => guncelle({ gelir: deger })} />
        <p className="oa-alt-not">{durum.siklik === "aylik" ? t("onboarding.gelir.etiketKisa") : t("onboarding.gelir.etiketKisaOrtalama")}</p>
        {gelir > 0 && (
          <p className="oa-yanki" aria-live="polite">
            <VurguluMetin anahtar="onboarding.gelir.yanki" degisken="tutar" deger={tamTutar(gunlukTutar(gelir))} />
          </p>
        )}
        {kabaIsaretci && <TusTakimi deger={durum.gelir} onChange={(deger) => guncelle({ gelir: deger })} />}
      </>
    );
    dugme = (
      <BirincilDugme onClick={() => ileri()} disabled={!adimGecilebilirMi("gelir", durum)}>
        {t("onboarding.devam")}
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
        <div className="oa-izgara">
          {BORC_TURLERI.map((tur) => (
            <SecimKarti key={tur} secili={durum.turler.includes(tur)} ikon={TUR_IKONLARI[tur]} onClick={() => sec(tur)}>
              {t(`onboarding.turler.${tur}`)}
            </SecimKarti>
          ))}
        </div>
        <EkSatir
          alt={t("onboarding.turler.yokAlt")}
          secili={durum.borcYok}
          onClick={() => {
            dokunusGeriBildirimi("hafif");
            guncelle({ borcYok: !durum.borcYok, turler: [], borclar: [] });
            setTaslak(null);
          }}
        >
          {t("onboarding.turler.yok")}
        </EkSatir>
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
          <div className="oa-cipler" role="group">
            {durum.turler.map((tur) => (
              <button
                key={tur}
                type="button"
                className={`oa-cip${taslak.tur === tur ? " secili" : ""}`}
                aria-pressed={taslak.tur === tur}
                onClick={() => {
                  dokunusGeriBildirimi("hafif");
                  setTaslak({ tur });
                  setTaslakHata(false);
                }}
              >
                {t(`onboarding.turler.${tur}`)}
              </button>
            ))}
          </div>
        )}
        <div className="oa-form">
          <BorcFormu borc={taslak} setBorc={(yeni) => { setTaslak(yeni); setTaslakHata(false); }} />
        </div>
        {taslakHata && <p className="oa-hata" role="alert">{t("onboarding.borc.eksik")}</p>}
        <button className="oa-ekle" type="button" onClick={taslagiEkle}>
          <Plus size={15} strokeWidth={2.4} aria-hidden="true" /> {t("onboarding.borc.baskaEkle")}
        </button>
        {durum.borclar.length > 0 && (
          <ul className="oa-eklenenler">
            {durum.borclar.map((borc, i) => (
              <li key={`${borc.tur}-${i}`} className="oa-eklenen">
                <BankaLogosu ad={borc.banka} kisi={borc.tur === "kisi"} />
                <span>{borc.banka} · {borcAltSatiri(borc)}</span>
                <b>{tamTutar(borc.tur === "kredi" ? tutar(borc.taksit) : tutar(borc.tutar))}</b>
                <button
                  type="button"
                  aria-label={t("onboarding.borc.kaldir", { ad: borc.banka })}
                  onClick={() => guncelle({ borclar: durum.borclar.filter((_, j) => j !== i) })}
                >
                  <X size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
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
    // Atlama: eklenen borclar kalir, yarim form yok sayilir; hic borc yoksa
    // borcsuz devam (plan adimina). Sira guncellenmeden once hedef bulunur.
    atla = () => {
      const hedef = sonrakiAdim("borc", sira);
      setDurum((eski) => borcAdiminiAtla(eski));
      setTaslak(null);
      setTaslakHata(false);
      void onboardingOlayiKaydet("onboarding_atla", { adim: "borc", sure_ms: Date.now() - adimBaslangici.current });
      adimBaslangici.current = Date.now();
      adimaYonel(hedef);
    };
    dugme = <BirincilDugme onClick={borcAdiminiBitir} disabled={!bitirilebilir}>{t("onboarding.borc.dugme")}</BirincilDugme>;
  } else if (adim === "plan") {
    icerik = (
      <>
        <Baslik gri={t("onboarding.plan.baslikGri")} vurgu={t("onboarding.plan.baslik")} />
        <p className="oa-aciklama">{t("onboarding.plan.aciklama")}</p>
        <PlanKarti gelir={gelir} odemeler={odemeler} />
        {ilkBiten && (
          <div className="oa-sira">
            <span className="no" aria-hidden="true">1</span>
            <BankaLogosu ad={ilkBiten.borc.banka} kisi={ilkBiten.borc.tur === "kisi"} />
            <span className="metin">
              {ilkBiten.borc.banka}
              {parseInt(ilkBiten.borc.gun, 10) >= 1 && (
                <small>{t("onboarding.plan.siradaki", { tarih: gunAyEtiketi(sonrakiGunTarihi(ilkBiten.borc.gun)), tutar: tamTutar(
                  ilkBiten.borc.tur === "kredi" || !ilkBiten.ay ? aylikOdeme(ilkBiten.borc) : Math.ceil(borcBakiyesi(ilkBiten.borc) / ilkBiten.ay),
                ) })}</small>
              )}
            </span>
            <span className="tutar">{tamTutar(borcBakiyesi(ilkBiten.borc))}</span>
          </div>
        )}
        <p className="oa-yanki">
          {!ilkBiten
            ? t("onboarding.plan.borcsuz")
            : ilkBiten.ay === null
              ? t("onboarding.plan.yetmiyor")
              : ilkBiten.ay === 1
                ? t("onboarding.plan.buAyBiter", { ad: ilkBiten.borc.banka })
                : <VurguluMetin anahtar="onboarding.plan.biterVurgu" degisken="sure" deger={t("onboarding.plan.ayda", { ay: ilkBiten.ay })} ek={{ ad: ilkBiten.borc.banka }} />}
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
  }

  if (adim === "hazir" && hazirUygulamada) {
    return <div className={`oa oa-akis mk-web${koyu ? " oa-koyu" : ""}`} lang={secilenDil} />;
  }

  if (adim === "hazir") {
    const ad = native ? durum.ad.trim() : "";
    return (
      <div className={`oa oa-akis${koyu ? " oa-koyu" : ""}`} lang={secilenDil}>
        <div className="oa-hazir">
          <div>
            <img className="oa-hazir-logo" src="/borcama-logo-368.png" alt="Borcama" width="368" height="90" />
            <span className="oa-mono-etiket">{t("onboarding.hazir.rozet")}</span>
            <h1>{ad ? t("onboarding.hazir.baslikAd", { ad }) : t("onboarding.hazir.baslik")}</h1>
            <p>
              {ilkOdemeBilgisi
                ? t("onboarding.hazir.aciklama", { tarih: gunAyEtiketi(ilkOdemeBilgisi.tarih) })
                : t("onboarding.hazir.aciklamaBorcsuz")}
            </p>
          </div>
          <div className="oa-alt">
            <BirincilDugme onClick={bitir}>{t("onboarding.hazir.dugme")}</BirincilDugme>
          </div>
        </div>
      </div>
    );
  }

  const adimEtiketi = t("onboarding.adimEtiketi", { n: no, toplam: numarali.length });
  const kolon = (
    <form
      className="oa-kolon"
      onSubmit={(olay) => {
        olay.preventDefault();
      }}
    >
      <Kabuk geri={oncekiAdim(adim, sira) ? geri : null} no={no} toplam={numarali.length} atla={atla} />
      <div className={govdeSinifi} key={adim}>
        {/* Masaustunde adim etiketi ust cubukta. */}
        {!masaustu && <span className="oa-mono-etiket">{adimEtiketi}</span>}
        {icerik}
      </div>
      <div className="oa-alt">{dugme}</div>
    </form>
  );

  if (masaustu) {
    return (
      <div className={`oa oa-akis mk-web${koyu ? " oa-koyu" : ""}`} lang={secilenDil} ref={kokRef}>
        <MasaustuUstCubuk
          koyu={koyu}
          sag={
            <>
              <span className="oa-mono-etiket mk-ust-adim">{adimEtiketi}</span>
              {cikisYap && (
                <button className="oa-baglanti soluk" type="button" onClick={cikisYap}>
                  {t("ayarlar.hesap.cikisYap")}
                </button>
              )}
            </>
          }
        />
        <div className={`mk-izgara${onizleme ? " mk-kurulum" : " mk-tek"}`}>
          {kolon}
          {onizleme && (
            <aside className="mk-onizleme" aria-label={t("web.kurulum.onizlemeAria")}>
              <span className="oa-mono-etiket">{t("web.kurulum.onizleme")}</span>
              {onizleme(taslakVeri, { koyu, adim })}
            </aside>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`oa oa-akis${koyu ? " oa-koyu" : ""}`} lang={secilenDil} ref={kokRef}>
      {kolon}
    </div>
  );
}

// Gun secici: 31'lik serit (secili coral, ortaya kayar) + kaydirici rayi.
function GunSecici({ secili, onSec }) {
  const kap = useRef(null);
  useEffect(() => {
    const serit = kap.current;
    const gun = serit?.querySelector(".secili");
    if (!serit || !gun) return;
    serit.scrollTo({ left: gun.offsetLeft - serit.clientWidth / 2 + gun.offsetWidth / 2, behavior: "smooth" });
  }, [secili]);
  const sec = (gun) => {
    dokunusGeriBildirimi("hafif");
    onSec(gun);
  };
  return (
    <>
      <div
        className="oa-gun-seridi"
        ref={kap}
        role="radiogroup"
        aria-label={t("onboarding.gun.baslik")}
        onWheel={(olay) => {
          if (Math.abs(olay.deltaY) > Math.abs(olay.deltaX)) kap.current.scrollLeft += olay.deltaY;
        }}
        onKeyDown={(olay) => {
          const fark = olay.key === "ArrowRight" ? 1 : olay.key === "ArrowLeft" ? -1 : 0;
          if (!fark) return;
          olay.preventDefault();
          const yeni = Math.min(31, Math.max(1, secili + fark));
          sec(yeni);
          kap.current.querySelectorAll(".oa-gun")[yeni - 1]?.focus();
        }}
      >
        {Array.from({ length: 31 }, (_, i) => i + 1).map((gun) => (
          <button
            key={gun}
            type="button"
            role="radio"
            aria-checked={secili === gun}
            aria-label={t("onboarding.gun.gunAria", { gun })}
            className={`oa-gun${secili === gun ? " secili" : ""}`}
            onClick={() => sec(gun)}
          >
            {gun}
          </button>
        ))}
      </div>
      <div className="oa-kaydirici" style={{ "--yuzde": `${Math.round(((secili - 1) / 30) * 72)}%` }}>
        <i aria-hidden="true" />
        <b aria-hidden="true" />
        <input type="range" min={1} max={31} value={secili} aria-label={t("onboarding.gun.gunEtiketi")} onChange={(o) => sec(parseInt(o.target.value, 10))} />
      </div>
    </>
  );
}

// Haftanin gunleri (1 = Pazartesi ... 7 = Pazar), secili dilde kisa adla.
function HaftaGunleri({ secili, onSec }) {
  // 5 Ocak 2026 Pazartesi; ad uretmek icin sabit bir hafta.
  const ad = (gun, bicim) => new Intl.DateTimeFormat(locale(), { weekday: bicim }).format(new Date(2026, 0, 4 + gun));
  return (
    <div className="oa-hafta" role="radiogroup" aria-label={t("onboarding.gun.baslik.haftalik")}>
      {[1, 2, 3, 4, 5, 6, 7].map((gun) => (
        <button
          key={gun}
          type="button"
          role="radio"
          aria-checked={secili === gun}
          aria-label={ad(gun, "long")}
          className={`oa-gun${secili === gun ? " secili" : ""}`}
          onClick={() => {
            dokunusGeriBildirimi("hafif");
            onSec(gun);
          }}
        >
          {ad(gun, "short")}
        </button>
      ))}
    </div>
  );
}

// Plan karti: her maasta odemelere giden tutar, yasam varsayimi satiri ve
// iki dilimli serit (odemeler / gelirin kalani). Odemeler geliri asarsa serit
// tamamen coral.
function PlanKarti({ gelir, odemeler }) {
  const kalan = Math.max(gelir - odemeler, 0);
  const eksi = odemeler > gelir;
  const pay = (n) => `${Math.max(0, Math.min(100, (n / (gelir || 1)) * 100))}%`;
  return (
    <div className="oa-plan">
      <span className="oa-mono-etiket">{t("onboarding.plan.etiket")}</span>
      <span className="buyuk">{tamTutar(odemeler)}</span>
      <small>{t("onboarding.plan.varsayim", { gelir: tamTutar(gelir) })}</small>
      {gelir > 0 && (
        <span className={`oa-serit${eksi ? " eksi" : ""}`} aria-hidden="true">
          <i className="odemeler" style={eksi ? undefined : { width: pay(odemeler) }} />
          {!eksi && <i className="kalan" style={{ width: pay(kalan) }} />}
        </span>
      )}
      <ul className="oa-plan-aciklama">
        <li><i className="odemeler" />{t("onboarding.plan.odemeler")}<b>{tamTutar(odemeler)}</b></li>
        <li><i className="kalan" />{t("onboarding.plan.gelirinKalani")}<b>{tamTutar(kalan)}</b></li>
      </ul>
    </div>
  );
}
