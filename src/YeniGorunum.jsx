// Yeni görünüm: 3 sekme (Bugün, Borçlarım, Harcamalarım) + Daha fazla.
// Veri ve kayıt işlemleri App.jsx'ten gelir; bu dosya yalnız çizer. Klasik
// görünüm bu bileşenleri hiç bağlamaz.
import { BankaRozeti } from "./BankaRozeti.jsx";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Building2,
  CalendarDays,
  CreditCard,
  FileText,
  Menu,
  PieChart,
  Plus,
  ReceiptText,
  Wallet,
  X,
  ChevronRight,
} from "lucide-react";
import { t } from "./i18n.js";
import { bekleyenOdemeler, dahaFazlaMaddeleri, enAcilOdeme, harcamaListesi, harcamaOzeti, kartSenaryolari, odemeleriGrupla } from "./yeniGorunum.js";

const INK = "#14160f";
const LIME = "#cdf564";
const CORAL = "#ff6f59";
const KATEGORI_RENKLERI = ["#cdf564", "#ffb3a6", "#c9b6ff", "#ff6f59", "#9fd0ff", "#e3d9a8", "#7fd6a6", "#f2bb55"];

export const YENI_CSS = `
@media(max-width:899px){.bt-feedback-trigger{display:none!important}}
#bt-app-kok{--yg-ok:#2f8a4c;--yg-ok-bg:#e2f2de;--yg-warn:#b87500;--yg-warn-bg:#fbefd2;--yg-bad:#d8432c;--yg-bad-bg:#ffe3dc;--yg-soft:color-mix(in srgb,var(--text) 7%,transparent)}
.yg-kok{padding-bottom:110px}
#bt-app-kok.mk-koyu{--yg-ok:#7fd38f;--yg-ok-bg:#1f3322;--yg-warn:#f2bb55;--yg-warn-bg:#3a2e14;--yg-bad:#ff8a74;--yg-bad-bg:#3d1e18}
.yg-sayfa{max-width:560px;margin:0 auto;display:grid;gap:18px}
.yg-iki>.yg-kolon-sol,.yg-iki>.yg-kolon-sag{display:contents}
.yg-iki>.yg-kolon-sag>*{order:1}
.yg-iki>.yg-kolon-sol>.yg-ikincil{order:2}
@media(min-width:900px){
.yg-kok{padding-bottom:48px}
.yg-sayfa{max-width:none}
.yg-sayfa.yg-iki{grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:24px;align-items:start}
.yg-iki>.yg-kolon-sol,.yg-iki>.yg-kolon-sag{display:grid;gap:18px;align-content:start;min-width:0}
.yg-iki>.yg-kolon-sag>*,.yg-iki>.yg-kolon-sol>.yg-ikincil{order:0}
.yg-iki>.yg-kolon-sol{position:sticky;top:var(--yg-ust-bosluk,96px);max-height:calc(100vh - var(--yg-ust-bosluk,96px) - 16px);overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin;padding:2px 8px 8px 2px;margin:-2px -8px -8px -2px}
.yg-cipler{flex-wrap:wrap;overflow-x:visible}
}
.yg-ust-etiket{font:700 11.5px 'Space Grotesk',sans-serif;color:var(--dim)}
.yg-manset{background:${LIME};color:${INK};border-radius:22px;padding:20px;box-shadow:5px 5px 0 ${INK}}
.yg-manset.acil{background:${CORAL}}
.yg-manset.tamam{background:var(--yg-ok-bg);color:var(--text);box-shadow:5px 5px 0 var(--yg-ok)}
.yg-manset h1{font:700 clamp(20px,5vw,24px)/1.22 'Space Grotesk',sans-serif;margin:8px 0 4px;text-wrap:balance}
.yg-manset .yg-ust-etiket{color:inherit;opacity:.75}
.yg-manset-tutar{font:800 30px 'Archivo Black',sans-serif;margin:4px 0 14px;font-variant-numeric:tabular-nums}
.yg-manset-alt{display:flex;gap:12px;align-items:center;flex-wrap:wrap}
.yg-manset-alt small{font-size:12.5px;opacity:.85;flex:1 1 180px}
.yg-btn{border:0;border-radius:999px;padding:11px 18px;font:700 14px 'Space Grotesk',sans-serif;cursor:pointer}
.yg-btn.koyu{background:${INK};color:${LIME}}
.yg-btn.ana{background:${LIME};color:${INK};box-shadow:3px 3px 0 ${INK}}
.yg-btn.cizgi{background:transparent;color:var(--text);border:1.5px solid var(--text)}
.yg-grup-baslik{display:flex;align-items:center;gap:8px;margin:0 0 8px;font:700 13.5px 'Space Grotesk',sans-serif;color:var(--text)}
.yg-nokta{width:10px;height:10px;border-radius:50%;flex:none;display:inline-block}
.yg-grup-baslik .yg-sayac{margin-left:auto;font:700 12.5px 'Space Grotesk',sans-serif;color:var(--dim)}
.yg-liste{display:grid;gap:8px}
.yg-odeme{display:grid;grid-template-columns:42px minmax(0,1fr) auto;gap:12px;align-items:center;background:var(--panel);border:1px solid var(--line-soft);border-radius:16px;padding:12px}
.yg-odeme.gecikti{border-color:var(--yg-bad);background:var(--yg-bad-bg)}
.yg-odeme.soluk{opacity:.6}
.yg-rozet{width:42px;height:42px;border-radius:13px;display:grid;place-items:center;font:700 11.5px 'JetBrains Mono',monospace;color:${INK};flex:none}
.yg-ad{font-weight:700;font-size:14.5px;color:var(--text);line-height:1.25;overflow-wrap:anywhere}
.yg-alt{font-size:12.5px;color:var(--dim);margin-top:2px}
.yg-sag{text-align:right;display:grid;gap:6px;justify-items:end}
.yg-para{font:800 16px 'Archivo Black',sans-serif;font-variant-numeric:tabular-nums;white-space:nowrap;color:var(--text)}
.yg-odedim{border:1.5px solid var(--text);background:transparent;color:var(--text);border-radius:999px;padding:5px 11px;font:700 12.5px 'Space Grotesk',sans-serif;cursor:pointer}
.yg-odedim.tamam{background:var(--yg-ok);border-color:var(--yg-ok);color:#fff}
.yg-durum{display:inline-block;font:700 11px 'Space Grotesk',sans-serif;padding:2px 8px;border-radius:999px;margin-top:4px}
.yg-durum.kirmizi{background:var(--yg-bad);color:#fff}
.yg-durum.sari{background:var(--yg-warn-bg);color:var(--yg-warn)}
.yg-durum.yesil{background:var(--yg-ok-bg);color:var(--yg-ok)}
.yg-durum.ara{background:color-mix(in srgb,var(--yg-ok-bg) 55%,var(--yg-warn-bg));color:var(--yg-warn)}
.yg-kart{background:var(--panel);border:1px solid var(--line-soft);border-radius:20px;padding:18px}
.yg-kart h2{font:400 18px 'Archivo Black',sans-serif;margin:0 0 4px;color:var(--text);text-wrap:balance}
.yg-kart p{margin:0;color:var(--dim);font-size:13.5px}
.yg-ilerleme{height:10px;border-radius:999px;background:var(--yg-soft);overflow:hidden;margin:12px 0 6px}
.yg-ilerleme i{display:block;height:100%;background:${LIME};border-right:2px solid ${INK}}
.yg-satir-bilgi{display:flex;justify-content:space-between;gap:10px;font-size:12.5px;color:var(--dim);flex-wrap:wrap}
.yg-grafik{width:100%;height:auto;display:block;margin-top:10px}
.yg-bag{background:none;border:0;padding:0;color:var(--text);text-decoration:underline;text-underline-offset:3px;font:600 13px 'Space Grotesk',sans-serif;margin-top:10px;cursor:pointer}
.yg-aciklama{margin-top:8px;font-size:13px;color:var(--dim);background:var(--yg-soft);padding:10px 12px;border-radius:12px}
.yg-ozet-borc{display:grid;grid-template-columns:minmax(0,1fr) 112px;gap:14px;align-items:center}
.yg-halka{width:112px;height:112px;display:block}
.yg-buyuk{font:800 29px 'Archivo Black',sans-serif;font-variant-numeric:tabular-nums;margin:4px 0;color:var(--text)}
.yg-lejant{display:grid;gap:4px;margin-top:10px;font-size:12.5px;color:var(--text)}
.yg-lejant span{display:flex;align-items:center;gap:6px}
.yg-lejant b{margin-left:auto;font-family:'Archivo Black',sans-serif;font-weight:800}
.yg-borc{display:block;width:100%;text-align:left;background:var(--panel);border:1px solid var(--line-soft);border-radius:16px;padding:14px;color:var(--text);cursor:pointer;font:inherit}
.yg-borc-ust{display:flex;justify-content:space-between;gap:10px;align-items:center}
.yg-borc-ust>span{display:flex;gap:10px;align-items:center;min-width:0}
.yg-bolum{font:700 15px 'Space Grotesk',sans-serif;color:var(--text);margin:6px 0 -8px}
.yg-plan{background:${INK};color:#f4efe0;border-radius:20px;padding:18px}
.yg-plan p{margin:6px 0 12px;font-size:15.5px}
.yg-plan b{color:${LIME}}
.yg-cipler{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px}
.yg-cip{border:1.5px solid var(--line-soft);background:var(--panel);color:var(--text);border-radius:999px;padding:7px 13px;font:600 13px 'Space Grotesk',sans-serif;white-space:nowrap;cursor:pointer}
.yg-cip[aria-pressed="true"]{background:${INK};color:${LIME};border-color:${INK}}
.yg-bar-satir{display:grid;grid-template-columns:minmax(80px,120px) minmax(0,1fr) 92px;gap:10px;align-items:center;font-size:13.5px;padding:7px 0;color:var(--text)}
.yg-bar{height:12px;border-radius:999px;background:var(--yg-soft);overflow:hidden}
.yg-bar i{display:block;height:100%;border-radius:999px}
.yg-icgoru{background:var(--yg-warn-bg);color:var(--text);border-radius:16px;padding:14px;font-size:14px}
.yg-bos{text-align:center;padding:28px 18px;border:1px dashed var(--line-soft);border-radius:18px;color:var(--dim);display:grid;gap:12px;justify-items:center}
.yg-altbar{position:fixed;left:0;right:0;bottom:0;z-index:40;background:var(--panel);border-top:1px solid var(--line-soft);padding:8px max(12px,env(safe-area-inset-left,0px)) calc(8px + env(safe-area-inset-bottom,0px)) max(12px,env(safe-area-inset-right,0px))}
.yg-altbar-ic{max-width:560px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:4px}
.yg-sekme{border:0;background:transparent;border-radius:14px;padding:7px 2px;display:grid;justify-items:center;gap:3px;font:600 12px 'Space Grotesk',sans-serif;color:var(--dim);cursor:pointer}
.yg-sekme svg{width:22px;height:22px}
.yg-sekme[aria-current="page"]{background:${LIME};color:${INK}}
.yg-fab{position:fixed;right:max(18px,calc(env(safe-area-inset-right,0px) + 18px));bottom:calc(86px + env(safe-area-inset-bottom,0px));width:56px;height:56px;border-radius:18px;border:0;background:${CORAL};color:${INK};box-shadow:3px 3px 0 ${INK};display:grid;place-items:center;z-index:41;cursor:pointer}
.yg-fab svg{width:26px;height:26px}
.yg-fab.yg-fab-native{bottom:calc(min(var(--sekme-cubugu,56px),120px) + env(safe-area-inset-bottom,0px) + 14px)}
.yg-ortu{position:fixed;inset:0;background:rgba(10,10,8,.45);z-index:60;display:flex;align-items:flex-end;justify-content:center}
.yg-tabaka{background:var(--panel);color:var(--text);width:100%;max-width:520px;border-radius:24px 24px 0 0;padding:16px max(18px,env(safe-area-inset-left,0px)) calc(22px + env(safe-area-inset-bottom,0px)) max(18px,env(safe-area-inset-right,0px));max-height:88vh;overflow:auto}
@media(min-width:900px){.yg-ortu{align-items:center}.yg-tabaka{border-radius:24px}}
html.borcama-native .yg-ortu.bt-modal-arka{padding:var(--guvenli-ust,0px) 0 0;align-items:flex-end;overflow:visible}
html.borcama-native .yg-ortu.bt-modal-arka>*{margin:0}
.yg-tabaka-ust{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:10px}
.yg-tabaka h3{font:700 19px 'Space Grotesk',sans-serif;margin:2px 0 0}
.yg-kapat{border:0;background:var(--yg-soft);color:var(--text);width:34px;height:34px;border-radius:10px;display:grid;place-items:center;cursor:pointer;flex:none}
.yg-secenek{display:flex;gap:12px;align-items:center;width:100%;text-align:left;background:transparent;border:1px solid var(--line-soft);color:var(--text);border-radius:14px;padding:13px;margin-bottom:8px;font:inherit;cursor:pointer}
.yg-secenek svg{width:21px;height:21px;flex:none}
.yg-secenek small{display:block;color:var(--dim);font-size:12.5px}
.yg-secenek .yg-para{margin-left:auto}
.yg-tablo{width:100%;border-collapse:collapse;font-size:13.5px;margin-bottom:6px}
.yg-tablo td{padding:7px 2px;border-bottom:1px solid var(--line-soft);color:var(--text)}
.yg-tablo td:last-child{text-align:right;font-family:'Archivo Black',sans-serif;font-variant-numeric:tabular-nums}
.yg-tablo tr.vurgu td{font-weight:700;border-bottom:2px solid var(--text)}
.yg-alt-baslik{font:700 16px 'Space Grotesk',sans-serif;margin:18px 0 8px;color:var(--text)}
.yg-senaryo{display:grid;gap:8px}
.yg-senaryo>div{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px 12px;align-items:center;border:1px solid var(--line-soft);border-radius:14px;padding:12px}
.yg-senaryo small{grid-column:1/-1;color:var(--dim);font-size:12.5px}
.yg-senaryo .iyi{border-color:var(--yg-ok);background:var(--yg-ok-bg)}
.yg-senaryo .orta{border-color:var(--yg-warn);background:var(--yg-warn-bg)}
.yg-senaryo .kotu{border-color:var(--yg-bad);background:var(--yg-bad-bg)}
.yg-not{font-size:12px;color:var(--dim);margin:8px 0 0}
.yg-dugmeler{display:flex;gap:10px;margin-top:16px;flex-wrap:wrap}
.yg-girdi{width:100%;border:1.5px solid var(--line-soft);background:transparent;color:var(--text);border-radius:12px;padding:11px 12px;font:600 16px 'JetBrains Mono',monospace}
.yg-toast{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(156px + env(safe-area-inset-bottom,0px));background:${INK};color:#f4efe0;padding:11px 16px;border-radius:14px;font-size:13.5px;z-index:70;display:flex;gap:14px;align-items:center;width:max-content;max-width:min(440px,calc(100% - 32px))}
.yg-toast span{min-width:0}
.yg-toast button{white-space:nowrap;flex:none;background:none;border:0;color:${LIME};font-weight:700;padding:0;cursor:pointer}
.sag-panel{padding-top:env(safe-area-inset-top,0px)}
.yg-harcama{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px 12px;align-items:center;width:100%;text-align:left;background:var(--panel);border:1px solid var(--line-soft);border-radius:14px;padding:11px 13px;color:var(--text);font:inherit;cursor:pointer}
.yg-harcama .yg-alt{grid-column:1/-1;margin-top:0}
.yg-sil{background:transparent;border:0;color:var(--yg-bad);font:700 13.5px 'Space Grotesk',sans-serif;padding:11px 6px;cursor:pointer}
.yg-sil.onay{background:var(--yg-bad);color:#fff;border-radius:999px;padding:11px 18px}
@media (prefers-reduced-motion: no-preference){.yg-tabaka{animation:yg-yukari .2s ease-out}@keyframes yg-yukari{from{transform:translateY(24px);opacity:.5}}}
`;

const oranYaz = (oran) => Number(oran || 0).toLocaleString("tr-TR", { maximumFractionDigits: 2 });

export function YeniTabaka({ baslik, onKapat, children }) {
  useEffect(() => {
    const tus = (e) => e.key === "Escape" && onKapat();
    window.addEventListener("keydown", tus);
    return () => window.removeEventListener("keydown", tus);
  }, [onKapat]);
  return (
    // bt-modal-arka: iOS'ta native sekme çubuğu pencere açıkken gizlenir.
    <div className="yg-ortu bt-modal-arka" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onKapat()}>
      <div className="yg-tabaka" role="dialog" aria-modal="true" aria-label={baslik}>
        <div className="yg-tabaka-ust">
          <h3>{baslik}</h3>
          <button className="yg-kapat" type="button" aria-label={t("ortak.kapat")} onClick={onKapat}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function YeniToast({ toast, onBitti }) {
  useEffect(() => {
    if (!toast) return undefined;
    const z = setTimeout(onBitti, 4000);
    return () => clearTimeout(z);
  }, [toast, onBitti]);
  if (!toast) return null;
  return (
    <div className="yg-toast" role="status">
      <span>{toast.metin}</span>
      {toast.geriAl && (
        <button type="button" onClick={() => { toast.geriAl(); onBitti(); }}>{t("yeni.geriAl")}</button>
      )}
    </div>
  );
}

export function YeniAltBar({ sekme, onSec, onEkle, onDahaFazla, nativeCubuk = false }) {
  // iOS'ta sekmeler isletim sisteminin cubugunda; burada yalniz "+" kalir.
  if (nativeCubuk) {
    return (
      <button className="yg-fab yg-fab-native" type="button" aria-label={t("yeni.ekle.baslik")} onClick={onEkle}>
        <Plus aria-hidden="true" />
      </button>
    );
  }
  const sekmeler = [
    ["ozet", t("yeni.sekme.bugun"), CalendarDays],
    ["borclarim", t("yeni.sekme.borclarim"), CreditCard],
    ["harcamalarim", t("yeni.sekme.harcamalarim"), PieChart],
  ];
  return (
    <>
      <nav className="yg-altbar" aria-label={t("yeni.menuAria")}>
        <div className="yg-altbar-ic">
          {sekmeler.map(([k, ad, Ikon]) => (
            <button key={k} type="button" className="yg-sekme" aria-current={sekme === k ? "page" : undefined} onClick={() => onSec(k)}>
              <Ikon aria-hidden="true" />{ad}
            </button>
          ))}
          <button type="button" className="yg-sekme" onClick={onDahaFazla}>
            <Menu aria-hidden="true" />{t("yeni.sekme.dahaFazla")}
          </button>
        </div>
      </nav>
      <button className="yg-fab" type="button" aria-label={t("yeni.ekle.baslik")} onClick={onEkle}>
        <Plus aria-hidden="true" />
      </button>
    </>
  );
}

function zamanMetni(o) {
  if (o.odendi || o.kartDurumu === "minimum" || o.kartDurumu === "tamami") return o.tarihMetni;
  if (o.gun < 0) return t("yeni.zaman.gecikti", { n: -o.gun });
  if (o.gun === 0) return t("yeni.zaman.bugun");
  if (o.gun === 1) return t("yeni.zaman.yarin");
  return t("yeni.zaman.kaldi", { n: o.gun, tarih: o.tarihMetni });
}

function odemeAltMetni(o, para) {
  if (o.tur === "kredi")
    return o.taksit
      ? t("yeni.odeme.krediTaksit", { no: o.taksit.no, toplam: o.taksit.toplam, zaman: zamanMetni(o) })
      : t("yeni.odeme.kredi", { zaman: zamanMetni(o) });
  if (o.kartDurumu === "minimum") return t("yeni.odeme.kartMinimumTamam", { tamami: para(o.kalanToplam, o.paraBirimi), zaman: zamanMetni(o) });
  return t("yeni.odeme.kart", { minimum: para(o.tutar, o.paraBirimi), tamami: para(o.kalanToplam, o.paraBirimi), zaman: zamanMetni(o) });
}

function OdemeSatiri({ o, para, onOdedim }) {
  let etiket = null;
  if (o.tur === "kart" && o.kartDurumu === "tamami") etiket = <span className="yg-durum yesil">{t("yeni.durum.odendi")}</span>;
  else if (o.tur === "kart" && o.kartDurumu === "minimum")
    etiket = <span className="yg-durum ara">{t("yeni.durum.minimumOdendi", { tutar: para(o.kalanFaiz, o.paraBirimi) })}</span>;
  else if (o.odendi) etiket = <span className="yg-durum yesil">{t("yeni.durum.odendi")}</span>;
  else if (o.gun < 0) etiket = <span className="yg-durum kirmizi">{t("yeni.durum.gecikti")}</span>;
  else if (o.gun <= 3) etiket = <span className="yg-durum sari">{t("yeni.durum.yaklasiyor")}</span>;
  const kapandi = o.tur === "kart" ? o.kartDurumu === "tamami" : o.odendi;
  const gosterilenTutar = o.tur === "kart" && o.kartDurumu === "minimum" ? o.kalanToplam : o.odendi && o.tur === "kredi" ? o.hedef : o.tutar;
  return (
    <div className={"yg-odeme" + (o.gun < 0 && !o.odendi ? " gecikti" : "") + (kapandi ? " soluk" : "")}>
      <BankaRozeti banka={o.banka || o.ad} boyut={42} />
      <div style={{ minWidth: 0 }}>
        <div className="yg-ad">{o.ad}</div>
        <div className="yg-alt">{odemeAltMetni(o, para)}</div>
        {etiket}
      </div>
      <div className="yg-sag">
        <span className="yg-para">{para(gosterilenTutar, o.paraBirimi)}</span>
        {o.gelecek ? (
          <span className="yg-alt">{t("yeni.odeme.gelecekAy")}</span>
        ) : kapandi ? (
          <button type="button" className="yg-odedim tamam" onClick={() => onOdedim(o)}>{t("yeni.odeme.odendiGeriAl")}</button>
        ) : (
          <button type="button" className="yg-odedim" onClick={() => onOdedim(o)}>{t("yeni.odeme.odedim")}</button>
        )}
      </div>
    </div>
  );
}

function TrendGrafigi({ noktalar, para, ayAdi }) {
  if (noktalar.length < 2) return null;
  const W = 360, H = 150, sol = 8, sag = 8, ust = 24, alt = 26;
  const degerler = noktalar.map((n) => n.tutar);
  let min = Math.min(...degerler), max = Math.max(...degerler);
  if (max - min < 1) { max += 1; min -= 1; }
  const pay = (max - min) * 0.15;
  min -= pay; max += pay;
  const x = (i) => sol + (i * (W - sol - sag)) / (noktalar.length - 1);
  const y = (v) => ust + ((max - v) * (H - ust - alt)) / (max - min);
  const yol = noktalar.map((n, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(n.tutar).toFixed(1)}`).join(" ");
  const son = noktalar[noktalar.length - 1];
  return (
    <svg className="yg-grafik" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("yeni.trend.aria")}>
      <path d={`${yol} L${x(noktalar.length - 1)},${H - alt} L${x(0)},${H - alt} Z`} fill="color-mix(in srgb, #cdf564 45%, transparent)" />
      <path d={yol} fill="none" stroke="var(--text)" strokeWidth="2.5" strokeLinejoin="round" />
      {noktalar.map((n, i) => (
        <text key={n.ay} x={x(i)} y={H - 6} textAnchor={i === 0 ? "start" : i === noktalar.length - 1 ? "end" : "middle"} fontSize="11" fill="var(--dim)">{ayAdi(n.ay)}</text>
      ))}
      <circle cx={x(noktalar.length - 1)} cy={y(son.tutar)} r="5" fill="#cdf564" stroke="var(--text)" strokeWidth="2" />
      <text x={x(noktalar.length - 1)} y={y(son.tutar) - 10} textAnchor="end" fontSize="12" fontWeight="700" fill="var(--text)">{para(son.tutar)}</text>
    </svg>
  );
}

export function YeniBugun({ odemeler, ayOzeti, trend, para, ayAdi, onOdedim, tarihMetni, bos = false, onEkle }) {
  const gruplar = useMemo(() => odemeleriGrupla(odemeler), [odemeler]);
  const acil = useMemo(() => enAcilOdeme(odemeler), [odemeler]);
  const KOVA = {
    gecikti: [t("yeni.kova.gecikti"), "var(--yg-bad)"],
    bugun: [t("yeni.kova.bugun"), "var(--yg-warn)"],
    yarin: [t("yeni.kova.yarin"), "var(--yg-warn)"],
    buHafta: [t("yeni.kova.buHafta"), "var(--yg-warn)"],
    sonraki: [t("yeni.kova.sonraki"), "var(--dim)"],
  };
  if (bos) {
    return (
      <div className="yg-sayfa">
        <section className="yg-manset">
          <div className="yg-ust-etiket">{t("yeni.sekme.bugun")}</div>
          <h1>{t("yeni.bos.baslik")}</h1>
          <small>{t("yeni.bos.aciklama")}</small>
        </section>
        <div>
          <button type="button" className="yg-secenek" onClick={() => onEkle("ekstre")}>
            <ReceiptText aria-hidden="true" />
            <span><b>{t("yeni.ekle.ekstre")}</b><small>{t("yeni.ekle.ekstreAlt")}</small></span>
          </button>
          <button type="button" className="yg-secenek" onClick={() => onEkle("kart")}>
            <CreditCard aria-hidden="true" />
            <span><b>{t("yeni.ekle.kart")}</b><small>{t("yeni.ekle.kartAlt")}</small></span>
          </button>
          <button type="button" className="yg-secenek" onClick={() => onEkle("kredi")}>
            <Building2 aria-hidden="true" />
            <span><b>{t("yeni.ekle.kredi")}</b><small>{t("yeni.ekle.krediAlt")}</small></span>
          </button>
        </div>
      </div>
    );
  }
  let manset;
  if (!acil) {
    manset = (
      <section className="yg-manset tamam">
        <div className="yg-ust-etiket">{t("yeni.sekme.bugun")}</div>
        <h1>{odemeler.length ? t("yeni.manset.hepsiTamam") : t("yeni.manset.odemeYok")}</h1>
        <small>{t("yeni.manset.hatirlatacagiz")}</small>
      </section>
    );
  } else {
    const banka = acil.banka || acil.ad;
    const cumle = acil.gun < 0
      ? t("yeni.manset.gecikti", { ad: acil.ad, n: -acil.gun })
      : acil.gun === 0
        ? acil.tur === "kredi" && acil.taksit
          ? t("yeni.manset.bugunTaksit", { banka, no: acil.taksit.no })
          : t("yeni.manset.bugun", { ad: acil.ad })
        : acil.gun === 1
          ? acil.tur === "kredi" && acil.taksit
            ? t("yeni.manset.yarinTaksit", { banka, no: acil.taksit.no })
            : t("yeni.manset.yarin", { ad: acil.ad })
          : t("yeni.manset.sonra", { ad: acil.ad, n: acil.gun });
    const ek = acil.gun < 0
      ? t("yeni.manset.ekGecikti")
      : acil.tur === "kredi"
        ? t("yeni.manset.ekKredi")
        : t("yeni.manset.ekKart");
    manset = (
      <section className={"yg-manset" + (acil.gun < 0 ? " acil" : "")}>
        <div className="yg-ust-etiket">{acil.gun < 0 ? t("yeni.manset.onceBu") : t("yeni.manset.siradaki")}</div>
        <h1>{cumle}</h1>
        <div className="yg-manset-tutar">{para(acil.tutar, acil.paraBirimi)}</div>
        <div className="yg-manset-alt">
          <button type="button" className="yg-btn koyu" onClick={() => onOdedim(acil)}>{t("yeni.odeme.odedim")}</button>
          <small>{ek}</small>
        </div>
      </section>
    );
  }
  return (
    <div className="yg-sayfa yg-iki">
      <div className="yg-kolon-sol">
      {manset}
      {ayOzeti.toplam > 0 && (
        <section className="yg-kart yg-ikincil">
          <h2>{t("yeni.ay.baslik")}</h2>
          <p>
            {ayOzeti.odenen + 0.01 >= ayOzeti.toplam
              ? t("yeni.ay.hepsi", { toplam: para(ayOzeti.toplam) })
              : t("yeni.ay.kalan", { toplam: para(ayOzeti.toplam), kalan: para(ayOzeti.toplam - ayOzeti.odenen) })}
          </p>
          <div className="yg-ilerleme"><i style={{ width: Math.min(100, Math.round((ayOzeti.odenen / ayOzeti.toplam) * 100)) + "%" }} /></div>
          <div className="yg-satir-bilgi">
            <span>{t("yeni.ay.odenen", { tutar: para(ayOzeti.odenen) })}</span>
            <span>{t("yeni.ay.kalanKisa", { tutar: para(Math.max(ayOzeti.toplam - ayOzeti.odenen, 0)) })}</span>
          </div>
        </section>
      )}
      {trend.length >= 2 && (() => {
        const fark = trend[trend.length - 1].tutar - trend[0].tutar;
        return (
          <section className="yg-kart yg-ikincil">
            <h2>{fark <= 0 ? t("yeni.trend.azaliyor") : t("yeni.trend.artiyor")}</h2>
            <p>
              {fark <= 0
                ? t("yeni.trend.azaldi", { n: trend.length, tutar: para(-fark) })
                : t("yeni.trend.artti", { n: trend.length, tutar: para(fark) })}
            </p>
            <TrendGrafigi noktalar={trend} para={para} ayAdi={ayAdi} />
          </section>
        );
      })()}
      </div>
      <div className="yg-kolon-sag">
      {gruplar.map((g) => (
        <section key={g.kova} aria-label={KOVA[g.kova][0]}>
          <div className="yg-grup-baslik">
            <span className="yg-nokta" style={{ background: KOVA[g.kova][1] }} />
            {KOVA[g.kova][0]}
            <span className="yg-sayac">{g.acikToplam > 0 ? para(g.acikToplam) : t("yeni.kova.tamam")}</span>
          </div>
          <div className="yg-liste">
            {g.odemeler.map((o) => <OdemeSatiri key={o.id} o={o} para={para} onOdedim={onOdedim} />)}
          </div>
        </section>
      ))}
      </div>
    </div>
  );
}

function Halka({ dilimler }) {
  const toplam = dilimler.reduce((t2, d) => t2 + d.tutar, 0);
  if (!toplam) return null;
  let aci = -Math.PI / 2;
  const r = 46, c = 60;
  const enBuyuk = dilimler.slice().sort((a, b) => b.tutar - a.tutar)[0];
  return (
    <svg className="yg-halka" width="112" height="112" viewBox="0 0 120 120" role="img" aria-label={t("yeni.borc.dagilimAria")}>
      {dilimler.filter((d) => d.tutar > 0).map((d) => {
        const pay = d.tutar / toplam;
        if (pay >= 0.999) return <circle key={d.ad} cx={c} cy={c} r={r} fill="none" stroke={d.renk} strokeWidth="18" />;
        const a2 = aci + pay * Math.PI * 2;
        const yol = `M${c + r * Math.cos(aci)},${c + r * Math.sin(aci)} A${r},${r} 0 ${a2 - aci > Math.PI ? 1 : 0} 1 ${c + r * Math.cos(a2)},${c + r * Math.sin(a2)}`;
        aci = a2;
        return <path key={d.ad} d={yol} fill="none" stroke={d.renk} strokeWidth="18" />;
      })}
      <text x="60" y="58" textAnchor="middle" fontSize="15" fontWeight="700" fill="var(--text)">%{Math.round((enBuyuk.tutar / toplam) * 100)}</text>
      <text x="60" y="74" textAnchor="middle" fontSize="11" fill="var(--dim)">{enBuyuk.ad.toLocaleLowerCase("tr-TR")}</text>
    </svg>
  );
}

export function YeniBorclarim({ toplam, dilimler, gunlukFaizTutari, krediler, kartlar, ekHesaplar, planCumlesi, para, onKart, onKredi, onEkHesap }) {
  const [nedenAcik, setNedenAcik] = useState(false);
  const bos = !krediler.length && !kartlar.length && !ekHesaplar.length;
  return (
    <div className="yg-sayfa yg-iki">
      <div className="yg-kolon-sol">
      <section className="yg-kart">
        <div className="yg-ozet-borc">
          <div style={{ minWidth: 0 }}>
            <div className="yg-ust-etiket">{t("yeni.borc.toplam")}</div>
            <div className="yg-buyuk">{para(toplam)}</div>
            {gunlukFaizTutari > 0 && (
              <>
                <p>{t("yeni.borc.gunlukFaiz", { tutar: para(gunlukFaizTutari) })}</p>
                <button type="button" className="yg-bag" onClick={() => setNedenAcik((a) => !a)} aria-expanded={nedenAcik}>{t("yeni.borc.buNe")}</button>
              </>
            )}
          </div>
          <Halka dilimler={dilimler} />
        </div>
        {nedenAcik && <div className="yg-aciklama">{t("yeni.borc.faizAciklama")}</div>}
        <div className="yg-lejant">
          {dilimler.filter((d) => d.tutar > 0).map((d) => (
            <span key={d.ad}><i className="yg-nokta" style={{ background: d.renk }} />{d.ad}<b>{para(d.tutar)}</b></span>
          ))}
        </div>
      </section>
      {planCumlesi && (
        <section className="yg-plan yg-ikincil">
          <div className="yg-ust-etiket" style={{ color: LIME }}>{t("yeni.plan.etiket")}</div>
          <p style={{ marginBottom: 0 }}>{planCumlesi}</p>
        </section>
      )}
      </div>
      <div className="yg-kolon-sag">
      {bos && (
        <div className="yg-bos">
          <span>{t("yeni.borc.bos")}</span>
        </div>
      )}
      {krediler.length > 0 && <div className="yg-bolum">{t("yeni.borc.krediler")}</div>}
      {krediler.length > 0 && (
        <div className="yg-liste">
          {krediler.map((k) => (
            <button key={k.id} type="button" className="yg-borc" onClick={() => onKredi(k)}>
              <div className="yg-borc-ust">
                <span><BankaRozeti banka={k.banka} boyut={38} /><b className="yg-ad">{k.ad}</b></span>
                <span className="yg-para">{para(k.kalan, k.paraBirimi)}</span>
              </div>
              {k.taksit ? (
                <>
                  <div className="yg-ilerleme"><i style={{ width: (k.taksit.odenen / k.taksit.toplam) * 100 + "%" }} /></div>
                  <div className="yg-satir-bilgi">
                    <span>{t("yeni.borc.taksitOdendi", { odenen: k.taksit.odenen, toplam: k.taksit.toplam })}</span>
                    <span>{t("yeni.borc.taksitGunu", { tutar: para(k.aylik, k.paraBirimi), gun: k.odemeGunu || "?" })}</span>
                  </div>
                </>
              ) : (
                <div className="yg-alt" style={{ marginTop: 6 }}>{t("yeni.borc.taksitGunu", { tutar: para(k.aylik, k.paraBirimi), gun: k.odemeGunu || "?" })}</div>
              )}
              {k.kartEkstresinde && <div className="yg-alt">{t("yeni.borc.kartEkstresinde")}</div>}
            </button>
          ))}
        </div>
      )}
      {kartlar.length > 0 && <div className="yg-bolum">{t("yeni.borc.kartlar")}</div>}
      {kartlar.length > 0 && (
        <div className="yg-liste">
          {kartlar.map((k) => (
            <button key={k.id} type="button" className="yg-borc" onClick={() => onKart(k)}>
              <div className="yg-borc-ust">
                <span><BankaRozeti banka={k.banka} boyut={38} /><b className="yg-ad">{k.ad}</b></span>
                <span className="yg-para">{para(k.kalanToplam, k.paraBirimi)}</span>
              </div>
              <div className="yg-alt" style={{ marginTop: 6 }}>
                {k.sonOdemeMetni ? t("yeni.borc.sonGun", { tarih: k.sonOdemeMetni }) : t("yeni.borc.sonGunYok")} · {t("yeni.borc.aylikFaiz", { oran: oranYaz(k.akdi) })}
              </div>
              {k.kalanToplam > 0.01 && (k.durum === "odenmedi" || k.durum === "kismi") && (
                <div className="yg-alt">{t("yeni.borc.odemezsen", { tutar: para(k.senaryo.hic.faiz, k.paraBirimi) })} · <u>{t("yeni.borc.hesapOzeti")}</u></div>
              )}
              {k.durum === "tamami" ? <span className="yg-durum yesil">{t("yeni.durum.odendi")}</span>
                : k.durum === "minimum" ? <span className="yg-durum ara">{t("yeni.durum.minimumOdendi", { tutar: para(k.senaryo.minimum.faiz, k.paraBirimi) })}</span>
                  : k.gecikti ? <span className="yg-durum kirmizi">{t("yeni.durum.gecikti")}</span> : null}
            </button>
          ))}
        </div>
      )}
      {ekHesaplar.length > 0 && <div className="yg-bolum">{t("yeni.borc.ekHesap")}</div>}
      {ekHesaplar.length > 0 && (
        <div className="yg-liste">
          {ekHesaplar.map((k) => (
            <button key={k.id} type="button" className="yg-borc" onClick={() => onEkHesap(k)}>
              <div className="yg-borc-ust">
                <span><BankaRozeti banka={k.banka} boyut={38} /><b className="yg-ad">{k.ad}</b></span>
                <span className="yg-para">{para(k.kalan, k.paraBirimi)}</span>
              </div>
              <div className="yg-alt" style={{ marginTop: 6 }}>{t("yeni.borc.ekHesapAlt", { oran: oranYaz(k.oran), tutar: para(k.aylikFaiz, k.paraBirimi) })}</div>
              <span className="yg-durum sari">{t("yeni.borc.herGunFaiz")}</span>
            </button>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}

export function YeniHarcamalarim({ kalemler, kartlar, ayMetni, para, onEkstreYukle, onHarcamaEkle, onHarcama }) {
  const [kart, setKart] = useState("hepsi");
  const kartAdlari = useMemo(() => {
    const kullanilan = new Set(kalemler.map((k) => k.kartId).filter(Boolean));
    return kartlar.filter((k) => kullanilan.has(k.id));
  }, [kalemler, kartlar]);
  const ozet = useMemo(() => harcamaOzeti(kalemler, kart), [kalemler, kart]);
  const liste = useMemo(() => harcamaListesi(kalemler, kart), [kalemler, kart]);
  const [gosterilen, setGosterilen] = useState(20);
  if (!kalemler.length) {
    return (
      <div className="yg-sayfa">
        <div className="yg-ust-etiket">{ayMetni}</div>
        <div className="yg-bos">
          <PieChart size={28} aria-hidden="true" />
          <b style={{ color: "var(--text)" }}>{t("yeni.harcama.bosBaslik")}</b>
          <span>{t("yeni.harcama.bosAciklama")}</span>
          <div className="yg-dugmeler" style={{ justifyContent: "center" }}>
            <button type="button" className="yg-btn ana" onClick={onEkstreYukle}>{t("yeni.ekle.ekstre")}</button>
            <button type="button" className="yg-btn cizgi" onClick={onHarcamaEkle}>{t("yeni.ekle.harcama")}</button>
          </div>
        </div>
      </div>
    );
  }
  const enCok = ozet.kategoriler[0];
  const kartAdi = kart === "hepsi" ? null : kartAdlari.find((k) => k.id === kart)?.ad;
  const enBuyukKart = kart === "hepsi"
    ? kartAdlari
      .map((k) => ({ ...k, toplam: harcamaOzeti(kalemler, k.id).toplam }))
      .sort((a, b) => b.toplam - a.toplam)[0]
    : null;
  const icgoru = kart === "hepsi"
    ? enBuyukKart
      ? t("yeni.harcama.icgoruKart", { kart: enBuyukKart.ad, tutar: para(enBuyukKart.toplam), kategori: enCok?.kategori || "", kategoriTutar: para(enCok?.tutar || 0) })
      : t("yeni.harcama.icgoruHepsi", { kategori: enCok?.kategori || "", tutar: para(enCok?.tutar || 0) })
    : t("yeni.harcama.icgoruTekKart", { kart: kartAdi, kategori: enCok?.kategori || "", tutar: para(enCok?.tutar || 0) });
  const enBuyuk = enCok?.tutar || 1;
  return (
    <div className="yg-sayfa yg-iki">
      <div className="yg-kolon-sol">
      <div>
        <div className="yg-ust-etiket">{ayMetni}</div>
        <div className="yg-buyuk">{para(ozet.toplam)}</div>
      </div>
      {kartAdlari.length > 0 && (
        <div className="yg-cipler" role="group" aria-label={t("yeni.harcama.kartSec")}>
          {[{ id: "hepsi", ad: t("yeni.harcama.butunKartlar") }, ...kartAdlari].map((k) => (
            <button key={k.id} type="button" className="yg-cip" aria-pressed={kart === k.id} onClick={() => setKart(k.id)}>{k.ad}</button>
          ))}
        </div>
      )}
      {enCok && <div className="yg-icgoru">{icgoru}</div>}
      <section className="yg-kart">
        <h2>{t("yeni.harcama.nereye")}</h2>
        <p>{t("yeni.harcama.nereyeAlt")}</p>
        <div style={{ marginTop: 10 }}>
          {ozet.kategoriler.map((k, i) => (
            <div className="yg-bar-satir" key={k.kategori}>
              <span>{k.kategori}</span>
              <span className="yg-bar"><i style={{ width: (k.tutar / enBuyuk) * 100 + "%", background: KATEGORI_RENKLERI[i % KATEGORI_RENKLERI.length] }} /></span>
              <span className="yg-para" style={{ fontSize: 13.5, textAlign: "right" }}>{para(k.tutar)}</span>
            </div>
          ))}
        </div>
      </section>
      </div>
      <div className="yg-kolon-sag">
      <section aria-label={t("yeni.harcama.liste")}>
        <div className="yg-grup-baslik">
          {t("yeni.harcama.liste")}
          <span className="yg-sayac">{liste.length}</span>
        </div>
        <div className="yg-liste">
          {liste.slice(0, gosterilen).map((h, i) => (
            <button key={(h.id || "h") + "-" + i} type="button" className="yg-harcama" onClick={() => onHarcama(h)}>
              <b className="yg-ad">{h.ad}</b>
              <span className="yg-para">{para(h.tutar)}</span>
              <span className="yg-alt">{[h.tarihMetni, h.kategori, h.kartAdi].filter(Boolean).join(" · ")}</span>
            </button>
          ))}
        </div>
        {liste.length > gosterilen && (
          <button type="button" className="yg-bag" onClick={() => setGosterilen((n) => n + 20)}>{t("yeni.harcama.dahaFazla", { n: liste.length - gosterilen })}</button>
        )}
      </section>
      <button type="button" className="yg-btn cizgi" onClick={onHarcamaEkle} style={{ justifySelf: "start" }}>{t("yeni.ekle.harcama")}</button>
      </div>
    </div>
  );
}

export function KartDetayTabakasi({ kart, para, onKapat, onOde, onEkstreYukle, onDuzenle, onSil }) {
  const s = kart.senaryo;
  const v = kart.vergiOrani > 0;
  return (
    <YeniTabaka baslik={kart.ad} onKapat={onKapat}>
      {kart.gecikti && kart.durum !== "tamami" && (
        <div className="yg-icgoru" style={{ background: "var(--yg-bad-bg)", marginBottom: 12 }}>
          {t("yeni.kart.gecikti", { tarih: kart.sonOdemeMetni || "", tutar: para(kart.minimumKalan, kart.paraBirimi) })}
        </div>
      )}
      <div className="yg-ust-etiket">{kart.donemMetni ? t("yeni.kart.ozetBaslik", { donem: kart.donemMetni }) : t("yeni.kart.ozetBaslikYok")}</div>
      <table className="yg-tablo">
        <tbody>
          {kart.oncekiDevreden > 0 && <tr><td>{t("yeni.kart.gecenAydan")}</td><td>{para(kart.oncekiDevreden, kart.paraBirimi)}</td></tr>}
          {kart.yeniHarcama > 0 && <tr><td>{t("yeni.kart.buAyHarcama")}</td><td>{para(kart.yeniHarcama, kart.paraBirimi)}</td></tr>}
          <tr className="vurgu"><td>{t("yeni.kart.buAyBorc")}</td><td>{para(kart.onceki, kart.paraBirimi)}</td></tr>
          <tr><td>{t("yeni.kart.yapilanOdeme")}</td><td>{kart.odeme > 0 ? "−" : ""}{para(kart.odeme, kart.paraBirimi)}</td></tr>
          <tr><td>{t("yeni.kart.kalan")}</td><td>{para(kart.kalanToplam, kart.paraBirimi)}</td></tr>
          <tr><td>{t("yeni.kart.minimum")}</td><td>{para(kart.minimum, kart.paraBirimi)}</td></tr>
          <tr><td>{t("yeni.kart.sonGun")}</td><td style={{ fontFamily: "inherit" }}>{kart.sonOdemeMetni || "—"}</td></tr>
          {kart.limit > 0 && <tr><td>{t("yeni.kart.limit")}</td><td>{para(kart.limit, kart.paraBirimi)} · {para(Math.max(kart.limit - kart.kalanToplam, 0), kart.paraBirimi)}</td></tr>}
        </tbody>
      </table>
      {kart.enCok && <p className="yg-not">{t("yeni.kart.enCok", { liste: kart.enCok })}</p>}
      {kart.kalanToplam > 0.01 && (
        <>
          <div className="yg-alt-baslik">{t("yeni.kart.neOlur")}</div>
          <div className="yg-senaryo">
            <div className="iyi"><b>{t("yeni.kart.tamamini", { tutar: para(kart.kalanToplam, kart.paraBirimi) })}</b><span className="yg-para">{t("yeni.kart.sifirFaiz")}</span><small>{t("yeni.kart.tamaminiAlt")}</small></div>
            <div className="orta"><b>{t("yeni.kart.minimumu", { tutar: para(s.minimum.odeme, kart.paraBirimi) })}</b><span className="yg-para">≈ {para(s.minimum.faiz, kart.paraBirimi)}</span><small>{t(v ? "yeni.kart.minimumuAlt" : "yeni.kart.minimumuAltVergisiz", { kalan: para(s.minimum.kalan, kart.paraBirimi), oran: oranYaz(kart.akdi) })}</small></div>
            <div className="kotu"><b>{t("yeni.kart.hic")}</b><span className="yg-para">≈ {para(s.hic.faiz, kart.paraBirimi)}</span><small>{t(v ? "yeni.kart.hicAlt" : "yeni.kart.hicAltVergisiz", { oran: oranYaz(kart.gecikme) })}</small></div>
          </div>
          <p className="yg-not">{t(v ? "yeni.kart.not" : "yeni.kart.notVergisiz")}</p>
        </>
      )}
      <div className="yg-dugmeler">
        {kart.kalanToplam > 0.01 && <button type="button" className="yg-btn ana" onClick={onOde}>{t("yeni.odeme.odedim")}</button>}
        <button type="button" className="yg-btn cizgi" onClick={onEkstreYukle}>{t("yeni.kart.yeniOzet")}</button>
        <button type="button" className="yg-btn cizgi" onClick={onDuzenle}>{t("yeni.kart.tumKart")}</button>
        <SilDugmesi onSil={onSil} />
      </div>
    </YeniTabaka>
  );
}

export function KartOdemeTabakasi({ odeme, para, onKapat, onKaydet }) {
  const [baska, setBaska] = useState(false);
  const [tutar, setTutar] = useState("");
  const girdi = useRef(null);
  useEffect(() => { if (baska) girdi.current?.focus(); }, [baska]);
  const tamami = Math.max(odeme.kalanToplam || 0, 0);
  const minimum = Math.max(odeme.tutar || 0, 0);
  const sayi = Number(String(tutar).replace(/\./g, "").replace(",", "."));
  return (
    <YeniTabaka baslik={t("yeni.kartOde.baslik", { ad: odeme.ad })} onKapat={onKapat}>
      <p style={{ margin: "0 0 12px", color: "var(--dim)", fontSize: 13.5 }}>{t("yeni.kartOde.aciklama")}</p>
      <button type="button" className="yg-secenek" onClick={() => onKaydet(tamami, "tamami")} disabled={tamami <= 0}>
        <span><b>{t("yeni.kartOde.tamamini")}</b><small>{t("yeni.kartOde.tamaminiAlt")}</small></span>
        <span className="yg-para">{para(tamami, odeme.paraBirimi)}</span>
      </button>
      {minimum > 0.01 && minimum < tamami - 0.01 && (
        <button type="button" className="yg-secenek" onClick={() => onKaydet(minimum, "minimum")}>
          <span><b>{t("yeni.kartOde.minimumu")}</b><small>{t("yeni.kartOde.minimumuAlt")}</small></span>
          <span className="yg-para">{para(minimum, odeme.paraBirimi)}</span>
        </button>
      )}
      {!baska ? (
        <button type="button" className="yg-secenek" onClick={() => setBaska(true)}>
          <span><b>{t("yeni.kartOde.baska")}</b><small>{t("yeni.kartOde.baskaAlt")}</small></span>
        </button>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (sayi > 0) onKaydet(Math.min(sayi, tamami || sayi), "kismi");
          }}
          style={{ display: "grid", gap: 10 }}
        >
          <label htmlFor="yg-baska-tutar" className="yg-ust-etiket">{t("yeni.kartOde.tutarEtiket")}</label>
          <input id="yg-baska-tutar" ref={girdi} className="yg-girdi" inputMode="decimal" value={tutar} onChange={(e) => setTutar(e.target.value)} placeholder="0" />
          <button type="submit" className="yg-btn ana" disabled={!(sayi > 0)}>{t("yeni.kartOde.kaydet")}</button>
        </form>
      )}
    </YeniTabaka>
  );
}

const DAHA_FAZLA_METIN = {
  ayarlar: ["yeni.daha.ayarlar", "yeni.daha.ayarlarAlt"],
  asistan: ["yeni.daha.asistan", "yeni.daha.asistanAlt"],
  gorus: ["yeni.daha.gorus", "yeni.daha.gorusAlt"],
  klasik: ["yeni.daha.klasik", "yeni.daha.klasikAlt"],
};

export function DahaFazlaTabakasi({ onSec, onKapat, gorusVar = false }) {
  return (
    <YeniTabaka baslik={t("yeni.sekme.dahaFazla")} onKapat={onKapat}>
      {dahaFazlaMaddeleri({ gorusVar }).map((k) => (
        <button key={k} type="button" className="yg-secenek" onClick={() => onSec(k)}>
          <span><b>{t(DAHA_FAZLA_METIN[k][0])}</b><small>{t(DAHA_FAZLA_METIN[k][1])}</small></span>
          <ChevronRight size={18} style={{ marginLeft: "auto" }} aria-hidden="true" />
        </button>
      ))}
    </YeniTabaka>
  );
}

export function EkleTabakasi({ onSec, onKapat }) {
  const maddeler = [
    ["ekstre", ReceiptText, t("yeni.ekle.ekstre"), t("yeni.ekle.ekstreAlt")],
    ["kredi-plan", FileText, t("yeni.ekle.krediPlan"), t("yeni.ekle.krediPlanAlt")],
    ["harcama", Plus, t("yeni.ekle.harcama"), t("yeni.ekle.harcamaAlt")],
    ["odeme", CalendarDays, t("yeni.ekle.odeme"), t("yeni.ekle.odemeAlt")],
    ["kart", CreditCard, t("yeni.ekle.kart"), t("yeni.ekle.kartAlt")],
    ["kredi", Building2, t("yeni.ekle.kredi"), t("yeni.ekle.krediAlt")],
    ["ek", Wallet, t("yeni.ekle.ek"), t("yeni.ekle.ekAlt")],
  ];
  return (
    <YeniTabaka baslik={t("yeni.ekle.baslik")} onKapat={onKapat}>
      {maddeler.map(([k, Ikon, ad, alt]) => (
        <button key={k} type="button" className="yg-secenek" onClick={() => onSec(k)}>
          <Ikon aria-hidden="true" />
          <span><b>{ad}</b><small>{alt}</small></span>
        </button>
      ))}
    </YeniTabaka>
  );
}

// İki adımlı silme: ilk dokunuş sorar, ikincisi siler (sonra "Geri al" çıkar).
function SilDugmesi({ onSil }) {
  const [soruyor, setSoruyor] = useState(false);
  if (!onSil) return null;
  return soruyor ? (
    <button type="button" className="yg-sil onay" onClick={onSil}>{t("yeni.sil.evet")}</button>
  ) : (
    <button type="button" className="yg-sil" onClick={() => setSoruyor(true)}>{t("yeni.sil.sil")}</button>
  );
}

export function KrediDetayTabakasi({ kredi, odeme, para, onKapat, onOdedim, onDuzenle, onSil }) {
  const birim = kredi.paraBirimi;
  return (
    <YeniTabaka baslik={kredi.ad} onKapat={onKapat}>
      {odeme && !odeme.odendi && odeme.gun < 0 && (
        <div className="yg-icgoru" style={{ background: "var(--yg-bad-bg)", marginBottom: 12 }}>
          {t("yeni.kredi.gecikti", { n: -odeme.gun, tutar: para(odeme.tutar, birim) })}
        </div>
      )}
      <table className="yg-tablo">
        <tbody>
          <tr className="vurgu"><td>{t("yeni.kredi.kalan")}</td><td>{para(kredi.kalan, birim)}</td></tr>
          <tr><td>{t("yeni.kredi.aylik")}</td><td>{para(kredi.aylik, birim)}</td></tr>
          {kredi.taksit && <tr><td>{t("yeni.kredi.taksit")}</td><td>{kredi.taksit.odenen} / {kredi.taksit.toplam}</td></tr>}
          <tr><td>{t("yeni.kredi.odemeGunu")}</td><td style={{ fontFamily: "inherit" }}>{kredi.odemeGunu ? t("yeni.kredi.herAyGun", { gun: kredi.odemeGunu }) : "—"}</td></tr>
          {odeme && (
            <tr><td>{t("yeni.kredi.sonraki")}</td><td>{odeme.odendi ? t("yeni.durum.odendi") : `${odeme.tarihMetni} · ${para(odeme.tutar, birim)}`}</td></tr>
          )}
        </tbody>
      </table>
      {kredi.taksit && <div className="yg-ilerleme"><i style={{ width: (kredi.taksit.odenen / kredi.taksit.toplam) * 100 + "%" }} /></div>}
      {kredi.kartEkstresinde && <p className="yg-not">{t("yeni.borc.kartEkstresinde")}</p>}
      <div className="yg-dugmeler">
        {odeme && !odeme.gelecek && !kredi.kartEkstresinde && (
          <button type="button" className={"yg-btn " + (odeme.odendi ? "cizgi" : "ana")} onClick={() => onOdedim(odeme)}>
            {odeme.odendi ? t("yeni.odeme.odendiGeriAl") : t("yeni.odeme.odedim")}
          </button>
        )}
        <button type="button" className="yg-btn cizgi" onClick={onDuzenle}>{t("yeni.duzenle")}</button>
        <SilDugmesi onSil={onSil} />
      </div>
    </YeniTabaka>
  );
}

export function EkHesapDetayTabakasi({ hesap, para, onKapat, onOdemeGir, onDuzenle, onSil }) {
  const birim = hesap.paraBirimi;
  return (
    <YeniTabaka baslik={hesap.ad} onKapat={onKapat}>
      <table className="yg-tablo">
        <tbody>
          <tr className="vurgu"><td>{t("yeni.ek.kalan")}</td><td>{para(hesap.kalan, birim)}</td></tr>
          {hesap.limit > 0 && <tr><td>{t("yeni.ek.limit")}</td><td>{para(hesap.limit, birim)}</td></tr>}
          <tr><td>{t("yeni.ek.oran")}</td><td>%{oranYaz(hesap.oran)}</td></tr>
          <tr><td>{t("yeni.ek.aylikFaiz")}</td><td>≈ {para(hesap.aylikFaiz, birim)}</td></tr>
          <tr><td>{t("yeni.ek.gunlukFaiz")}</td><td>≈ {para(hesap.aylikFaiz / 30, birim)}</td></tr>
        </tbody>
      </table>
      <p className="yg-not">{t("yeni.ek.not")}</p>
      <div className="yg-dugmeler">
        <button type="button" className="yg-btn ana" onClick={onOdemeGir}>{t("yeni.ek.odemeGir")}</button>
        <button type="button" className="yg-btn cizgi" onClick={onDuzenle}>{t("yeni.duzenle")}</button>
        <SilDugmesi onSil={onSil} />
      </div>
    </YeniTabaka>
  );
}

export function HarcamaTabakasi({ harcama, para, onKapat, onDuzenle, onSil }) {
  return (
    <YeniTabaka baslik={harcama.ad} onKapat={onKapat}>
      <table className="yg-tablo">
        <tbody>
          <tr className="vurgu"><td>{t("yeni.harcama.tutar")}</td><td>{para(harcama.tutar)}</td></tr>
          {harcama.tarihMetni && <tr><td>{t("yeni.harcama.tarih")}</td><td style={{ fontFamily: "inherit" }}>{harcama.tarihMetni}</td></tr>}
          {harcama.kategori && <tr><td>{t("yeni.harcama.kategori")}</td><td style={{ fontFamily: "inherit" }}>{harcama.kategori}</td></tr>}
          {harcama.kartAdi && <tr><td>{t("yeni.harcama.kart")}</td><td style={{ fontFamily: "inherit" }}>{harcama.kartAdi}</td></tr>}
        </tbody>
      </table>
      <div className="yg-dugmeler">
        <button type="button" className="yg-btn ana" onClick={onDuzenle}>{t("yeni.duzenle")}</button>
        <SilDugmesi onSil={onSil} />
      </div>
    </YeniTabaka>
  );
}

export function OdemeSecTabakasi({ odemeler, para, onSec, onKapat }) {
  const liste = bekleyenOdemeler(odemeler);
  return (
    <YeniTabaka baslik={t("yeni.odemeSec.baslik")} onKapat={onKapat}>
      {liste.length ? (
        <>
          <p style={{ margin: "0 0 12px", color: "var(--dim)", fontSize: 13.5 }}>{t("yeni.odemeSec.aciklama")}</p>
          {liste.map((o) => (
            <button key={o.id} type="button" className="yg-secenek" onClick={() => onSec(o)}>
              <span><b>{o.ad}</b><small>{o.tarihMetni}</small></span>
              <span className="yg-para">{para(o.tur === "kart" ? o.kalanToplam : o.tutar, o.paraBirimi)}</span>
            </button>
          ))}
        </>
      ) : (
        <p style={{ margin: 0, color: "var(--dim)" }}>{t("yeni.odemeSec.bos")}</p>
      )}
    </YeniTabaka>
  );
}

export { kartSenaryolari };
