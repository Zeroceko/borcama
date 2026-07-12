import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "./supabaseClient.js";
import { Plus, Pencil, Trash2, Check, RotateCcw, Target, Flame, Snowflake, PieChart, TrendingUp, Wallet, Lightbulb, CalendarCheck } from "lucide-react";

/* ---------------- Sabit tasarım tokenları ---------------- */
const INK = "#14160f";
const CREAM = "#f4efe0";
const LIME = "#cdf564";
const CORAL = "#ff6f59";
const ROTASYONLAR = [-1.2, 1, -0.6, 1.4, -1];

const ACIK_TEMA = { bg: CREAM, panel: "#ffffff", panel2: "#f6f3e8", text: INK, dim: "#55584c", faint: "#8a8c7e", line: INK };
const KOYU_TEMA = { bg: "#0f110a", panel: "#191c12", panel2: "#22261a", text: CREAM, dim: "#b5b2a0", faint: "#8a8c7e", line: "#e8e4d2" };

const BANKA_KOD = { "VakıfBank": "VB", "Halkbank": "HB", "Enpara": "EP", "Garanti BBVA": "GB", "QNB": "QNB", "Akbank": "AKB", "İş Bankası": "İŞ", "Yapı Kredi": "YK", "Kuveyt Türk": "KT", "Fibabanka": "FB" };
function bankaKodu(banka) {
  const b = (banka || "").trim();
  if (BANKA_KOD[b]) return BANKA_KOD[b];
  return b.slice(0, 3).toUpperCase() || "??";
}
function rozetStil(bg, rot, boyut = 42) {
  return {
    flex: "0 0 auto", width: boyut, height: boyut, borderRadius: 10, background: bg,
    border: "2px solid " + INK, display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700, color: INK,
    transform: "rotate(" + rot + "deg)",
  };
}
function baslikGolgesiStil(isDark, fontSize) {
  return isDark
    ? { margin: 0, fontFamily: "'Archivo Black',sans-serif", fontSize, lineHeight: 1.05, color: LIME, textShadow: "3px 3px 0 " + CORAL }
    : { margin: 0, fontFamily: "'Archivo Black',sans-serif", fontSize, lineHeight: 1.05, color: INK, textShadow: "3px 3px 0 " + LIME + ", 5px 5px 0 " + CORAL };
}

/* ---------------- Stil ---------------- */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap');

*{box-sizing:border-box}
::selection{background:${LIME};color:${INK}}
.bt-app{font-family:'Space Grotesk',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;transition:background .2s ease,color .2s ease;font-variant-numeric:tabular-nums}
.bt-wrap{max-width:1080px;margin:0 auto;padding:clamp(28px,5vw,48px) clamp(16px,4vw,28px) 120px}
.bt-display{font-family:'Archivo Black',sans-serif}
.bt-mono{font-family:'JetBrains Mono',monospace}

.bt-header{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;row-gap:24px;flex-wrap:wrap;margin-bottom:32px}
.bt-eyebrow{display:inline-block;background:${LIME};border:2px solid ${INK};border-radius:6px;padding:4px 10px;font-family:'JetBrains Mono',monospace;
  font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:${INK};margin-bottom:14px;transform:rotate(-1deg)}
.bt-headright{display:flex;align-items:center;gap:16px;flex-wrap:wrap}
.bt-date{font-family:'JetBrains Mono',monospace;font-size:13px;color:var(--dim)}
.bt-themebtn{position:relative;width:54px;height:30px;border-radius:16px;border:2px solid var(--line);background:var(--panel);cursor:pointer;padding:0;flex:0 0 auto}
.bt-themeknob{position:absolute;top:2px;width:22px;height:22px;border-radius:50%;background:${LIME};border:2px solid ${INK};transition:left .18s ease}
.bt-themelabel{font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--dim);width:34px}
.bt-exit{background:none;border:none;padding:0;font:inherit;font-size:14px;font-weight:600;color:var(--text);text-decoration:underline;cursor:pointer;display:flex;align-items:center;gap:4px}
.bt-exit:hover{color:${CORAL}}

.bt-nav{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:36px}
.bt-pill{padding:10px 18px;border-radius:999px;font-size:14px;font-weight:700;white-space:nowrap;cursor:pointer;font-family:'Space Grotesk',sans-serif;border:2px solid transparent;background:none}
.bt-pill.aktif{background:${LIME};border-color:${INK};color:${INK}}
.bt-pill.pasif{background:var(--panel);border-color:var(--line);color:var(--text);opacity:.65}
.bt-pill.pasif:hover{opacity:1}

.bt-card{background:var(--panel);border:2px solid var(--line);border-radius:20px;padding:clamp(18px,4vw,30px)}
.bt-stack{display:flex;flex-direction:column;gap:16px}
.bt-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px}
.bt-cardhead{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;gap:10px;flex-wrap:wrap}
.bt-h2{margin:0 0 22px;font-family:'Archivo Black',sans-serif;font-size:19px;color:var(--text);display:flex;align-items:center;gap:10px}

.bt-hero{position:relative;overflow:hidden;background:${INK};border:2px solid var(--line);border-radius:24px;padding:clamp(24px,5vw,44px) clamp(20px,4.5vw,40px);margin-bottom:28px}
.bt-hero .deko-daire{position:absolute;top:-24px;right:60px;width:56px;height:56px;border-radius:50%;background:${CORAL};border:2px solid ${INK};transform:rotate(8deg)}
.bt-hero .deko-kare{position:absolute;bottom:20px;right:-18px;width:44px;height:44px;background:${LIME};border:2px solid ${INK};border-radius:10px;transform:rotate(20deg)}
.bt-hero-label{font-size:13px;font-weight:600;letter-spacing:.08em;color:#c8c9be;text-transform:uppercase;margin-bottom:16px}
.bt-hero-tutar{font-family:'Archivo Black',sans-serif;font-size:clamp(30px,7.5vw,58px);line-height:1;color:${LIME};text-shadow:3px 3px 0 ${CORAL};margin-bottom:16px;overflow-wrap:anywhere}
.bt-hero-delta{display:inline-flex;align-items:center;gap:5px;font-size:12.5px;font-weight:700;padding:5px 12px;border-radius:999px;margin-bottom:16px;font-family:'JetBrains Mono',monospace}
.bt-serit{display:flex;height:10px;border-radius:6px;overflow:hidden;border:2px solid ${INK};margin-bottom:20px;background:#2a2c22}
.bt-serit div{min-width:3px}
.bt-chip{display:flex;align-items:center;gap:6px;font-size:13px;padding:7px 14px;border-radius:20px;background:#20221a;border:2px solid #2a2c22}
.bt-chip .dot{width:8px;height:8px;border-radius:50%;flex:0 0 auto}
.bt-chip .lbl{color:#c8c9be}
.bt-chip .amt{font-family:'JetBrains Mono',monospace;color:${CREAM};font-weight:700}

.bt-metric{background:var(--panel);border:2px solid var(--line);border-radius:16px;padding:22px}
.bt-metric-lbl{font-size:12.5px;font-weight:600;color:var(--dim);margin-bottom:10px}
.bt-metric-amt{font-family:'Archivo Black',sans-serif;font-size:clamp(20px,4vw,26px);color:var(--text);overflow-wrap:anywhere}
.bt-metric-cap{font-size:12px;color:var(--faint);margin-top:8px}

.bt-risk{background:${CORAL};border:2px solid ${INK};border-radius:20px;padding:clamp(18px,4vw,26px) clamp(20px,4.5vw,30px);margin-bottom:36px;transform:rotate(-.4deg)}
.bt-risk-inner{display:flex;align-items:baseline;gap:18px;flex-wrap:wrap}
.bt-risk-pct{font-family:'Archivo Black',sans-serif;font-size:36px;color:${INK}}
.bt-risk-txt{font-size:14px;color:${INK};font-weight:500;max-width:560px;line-height:1.5}
.bt-risk-txt a{color:${INK}}

.bt-banka-row+.bt-banka-row{margin-top:18px}
.bt-banka-top{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:8px;font-size:14px;font-weight:600;color:var(--text)}
.bt-banka-bar{height:10px;border-radius:6px;background:var(--panel2);border:2px solid var(--line);overflow:hidden}
.bt-banka-bar div{height:100%;background:${LIME}}

.bt-hero2{background:${INK};border:2px solid var(--line);border-radius:20px;padding:clamp(18px,4vw,30px)}
.bt-satirD{display:flex;align-items:center;gap:14px;row-gap:8px;flex-wrap:wrap;padding:14px 16px;border-radius:12px;background:#20221a}
.bt-satirD-ad{font-size:14px;color:${CREAM};font-weight:600}
.bt-satirD-alt{font-size:12.5px;margin-top:2px}
.bt-satirD-tutar{font-family:'JetBrains Mono',monospace;font-size:15px;color:${CREAM};font-weight:600}
.bt-satirD-tur{font-size:11.5px;color:#8a8c7e;margin-top:2px}

.bt-satir{display:flex;align-items:center;gap:16px;row-gap:8px;flex-wrap:wrap;padding:16px;border-radius:14px;background:var(--panel2);border:2px solid var(--line)}
.bt-satir-ad{font-size:14.5px;color:var(--text);font-weight:600}
.bt-satir-meta{font-size:12.5px;margin-top:3px;color:var(--dim)}
.bt-satir-tutar{font-family:'JetBrains Mono',monospace;font-size:16px;color:var(--text);font-weight:700}
.bt-satir-alt{font-size:11.5px;color:${CORAL};font-weight:700;margin-top:3px}
.bt-bar{height:6px;border-radius:4px;background:var(--panel);border:1px solid var(--line);overflow:hidden;margin-top:9px;max-width:220px}
.bt-bar div{height:100%}

.bt-strip{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;padding-bottom:20px;border-bottom:2px solid var(--line);margin-bottom:22px}
.bt-strip-count{font-size:13px;font-weight:600;color:var(--dim)}
.bt-strip-total{font-family:'Archivo Black',sans-serif;font-size:clamp(19px,4vw,24px);color:var(--text)}

.bt-btn{display:inline-flex;align-items:center;gap:6px;border-radius:999px;cursor:pointer;font-weight:700;font-family:'Space Grotesk',sans-serif;
  padding:10px 18px;font-size:13px;border:2px solid transparent;transition:filter .15s}
.bt-btn:hover{filter:brightness(.96)}
.bt-btn.birincil{background:${LIME};color:${INK};border-color:${INK}}
.bt-btn.ikincil{background:transparent;color:var(--text);border-color:var(--line)}
.bt-btn.ikincil:hover{background:var(--panel2)}
.bt-btn.hayalet{background:transparent;color:var(--dim);border:none;padding:7px;border-radius:10px}
.bt-btn.hayalet:hover{color:var(--text);background:var(--panel2)}
.bt-btn.tehlike:hover{color:${CORAL}}
.bt-btn.kucuk{padding:6px 13px;font-size:12px}
.bt-btn.heroghost{background:transparent;color:${CREAM};border-color:#3a3d2e}
.bt-btn.heroghost:hover{background:#2a2c22}

.bt-form{background:var(--panel2);border:2px solid var(--line);border-radius:16px;padding:16px;margin-bottom:14px}
.bt-alanlar{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px 16px;align-items:start}
.bt-alan{display:grid;grid-template-rows:minmax(38px,auto) 44px;align-content:start;gap:5px;min-width:0;font-size:12px;font-weight:600;color:var(--dim)}
.bt-input{padding:10px 13px;border-radius:10px;border:2px solid var(--line);font-size:14px;color:var(--text);
  background:var(--panel);font-family:'Space Grotesk',sans-serif;width:100%;height:44px;min-width:0}
.bt-input::placeholder{color:var(--faint)}
.bt-form-butonlar{display:flex;gap:8px;margin-top:14px}

.bt-kat{display:flex;align-items:center;gap:12px;margin-bottom:9px}
.bt-kat-ad{width:88px;font-size:13px;font-weight:600;flex-shrink:0}
.bt-kat-bar{flex:1;height:9px;background:var(--panel2);border:2px solid var(--line);border-radius:999px;overflow:hidden}
.bt-kat-bar div{height:100%}
.bt-kat-tutar{width:112px;text-align:right;font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:700;flex-shrink:0}

.bt-ipucu{display:flex;gap:10px;background:var(--panel2);border:2px solid var(--line);border-radius:16px;padding:13px 14px;font-size:13px;color:var(--dim);line-height:1.55}
.bt-ipucu svg{flex-shrink:0;margin-top:1px}
.bt-ipucu b{color:var(--text)}

.bt-secici{display:flex;gap:4px;background:var(--panel2);border:2px solid var(--line);padding:4px;border-radius:999px}
.bt-secici button{display:flex;align-items:center;gap:6px;padding:7px 14px;border:none;border-radius:999px;background:transparent;
  color:var(--dim);font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:13px;cursor:pointer}
.bt-secici button.aktif{background:var(--panel);color:var(--text);box-shadow:inset 0 0 0 2px var(--line)}

.bt-bos{text-align:center;padding:48px 0;color:var(--faint);font-size:14px}
.bt-link{border:none;background:none;color:${CORAL};font-weight:700;cursor:pointer;font-size:inherit;padding:0;font-family:inherit}
.bt-modal-arka{position:fixed;inset:0;z-index:50;background:#0f110acc;display:flex;align-items:center;justify-content:center;padding:20px}
.bt-modal{width:100%;max-width:420px;background:var(--panel);border:2px solid var(--line);border-radius:20px;padding:24px;box-shadow:8px 8px 0 ${CORAL}}

@media (max-width:600px){
  .bt-pill span{display:none}
  .bt-kat-ad{width:70px}
  .bt-kat-tutar{width:90px}
  .bt-alanlar{grid-template-columns:1fr}
  .bt-alan{grid-template-rows:auto 44px}
}
@media (min-width:601px) and (max-width:820px){.bt-alanlar{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (prefers-reduced-motion:reduce){ *{transition:none!important} }
`;

/* ---------------- Yardımcılar (iş mantığı — değişmedi) ---------------- */
const TL = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });
const TLk = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 2 });
const fmt = (n) => TLk.format(Number(n) || 0);
const fmt0 = (n) => TL.format(Number(n) || 0);
const AYLAR = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
const ayEtiketi = (ay) => { const [y, m] = String(ay || "").split("-"); return y && m ? AYLAR[(+m || 1) - 1] + " " + y : ay; };
const ayEkle = (ay, adet) => { const [y, m] = String(ay).split("-").map(Number); return ayAnahtari(new Date(y, m - 1 + adet, 1)); };
const ayFarki = (ilk, son) => { const [iy, im] = ilk.split("-").map(Number); const [sy, sm] = son.split("-").map(Number); return (sy - iy) * 12 + sm - im; };
const bugun = () => new Date();
const ayAnahtari = (d = bugun()) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
const uid = () => Math.random().toString(36).slice(2, 10);

function sonrakiOdemeTarihi(gun) {
  const g = Math.min(Math.max(parseInt(gun) || 1, 1), 31);
  const simdi = bugun();
  let yil = simdi.getFullYear(), ay = simdi.getMonth();
  const buAySon = new Date(yil, ay + 1, 0).getDate();
  let tarih = new Date(yil, ay, Math.min(g, buAySon));
  if (tarih < new Date(simdi.getFullYear(), simdi.getMonth(), simdi.getDate())) {
    ay += 1;
    const sonrakiSon = new Date(yil, ay + 1, 0).getDate();
    tarih = new Date(yil, ay, Math.min(g, sonrakiSon));
  }
  return tarih;
}
const kalanGun = (t) => {
  const s = bugun();
  return Math.round((t - new Date(s.getFullYear(), s.getMonth(), s.getDate())) / 86400000);
};
function kartSonOdemeTarihi(k) {
  if (k.sonOdemeTarihi) return new Date(k.sonOdemeTarihi + "T00:00:00");
  return sonrakiOdemeTarihi(k.sonOdemeGunu);
}
function buAyOdemeTarihi(gun) {
  const simdi = bugun();
  const g = Math.min(Math.max(parseInt(gun) || 1, 1), new Date(simdi.getFullYear(), simdi.getMonth() + 1, 0).getDate());
  return new Date(simdi.getFullYear(), simdi.getMonth(), g);
}
function kartGecikmeTarihi(k) {
  return k.sonOdemeTarihi ? new Date(k.sonOdemeTarihi + "T00:00:00") : buAyOdemeTarihi(k.sonOdemeGunu);
}

const KATEGORILER = ["Market","Yeme-İçme","Ulaşım","Fatura","Kira","Sağlık","Giyim","Eğlence","Eğitim","Diğer"];
const BANKALAR = ["VakıfBank","Halkbank","QNB","Enpara","Akbank","Garanti BBVA","İş Bankası","Yapı Kredi","Kuveyt Türk","Fibabanka"];
function tcmbKartAzamiFaizi(bakiye) {
  if (bakiye >= 180000) return 4.25;
  if (bakiye >= 30000) return 3.75;
  return 3.25;
}
function tcmbKartAzamiGecikmeFaizi(bakiye) {
  if (bakiye >= 180000) return 4.55;
  if (bakiye >= 30000) return 4.05;
  return 3.55;
}
function gunlukBirikmisFaiz(bakiye, aylikOran, gecikenGun) {
  return Math.max(+bakiye || 0, 0) * Math.max(+aylikOran || 0, 0) / 100 * Math.max(+gecikenGun || 0, 0) / 30;
}
function kartHesabi(k) {
  const yeniModel = k.yeniDonemEkstreBorcu !== undefined || k.toplamEkstreBorcu !== undefined || k.oncekiDonemBorcu !== undefined || k.yapilanOdeme !== undefined;
  if (!yeniModel) {
    const ana = +k.donemIciToplam > 0 ? +k.donemIciToplam : +k.borc || 0;
    return { onceki: ana, odeme: 0, devreden: ana, yeni: +k.donemIciEklenen || 0, faiz: 0, oran: tcmbKartAzamiFaizi(ana), toplam: ana + (+k.donemIciEklenen || 0), asgari: +k.asgari || 0 };
  }
  const oncekiDevreden = +k.oncekiAydanKalan || 0;
  const yeni = k.yeniDonemEkstreBorcu !== undefined
    ? (+k.yeniDonemEkstreBorcu || 0)
    : Math.max((+k.toplamEkstreBorcu || +k.oncekiDonemBorcu || 0) - oncekiDevreden, 0);
  const onceki = k.yeniDonemEkstreBorcu !== undefined ? yeni + oncekiDevreden : (+k.toplamEkstreBorcu || +k.oncekiDonemBorcu || 0);
  const odeme = Math.min(Math.max(+k.yapilanOdeme || 0, 0), onceki);
  const devreden = Math.max(onceki - odeme, 0);
  const oran = tcmbKartAzamiFaizi(onceki);
  const faiz = (devreden * oran) / 100;
  const toplam = devreden;
  const asgariOran = (+k.limit || 0) <= 50000 ? 20 : 40;
  return { onceki, oncekiDevreden, odeme, devreden, yeni, faiz, oran, toplam, asgari: (onceki * asgariOran) / 100 };
}
function ekstreSnapshot(k, ekstreAyi = k.ekstreAyi) {
  return { ekstreAyi, yeniDonemEkstreBorcu: k.yeniDonemEkstreBorcu, toplamEkstreBorcu: k.toplamEkstreBorcu ?? k.oncekiDonemBorcu, oncekiAydanKalan: k.oncekiAydanKalan, yapilanOdeme: k.yapilanOdeme, kesimGunu: k.kesimGunu, sonOdemeGunu: k.sonOdemeGunu, arsivlenmeTarihi: new Date().toISOString() };
}

// İlk kullanıcı kayıtları Temmuz etiketiyle oluşmuştu; gerçekte Haziran 2026 ekstreleriydi.
// Bu dönüşüm kullanıcı başına yalnızca bir kez çalışır ve en ileri dönemi kartın güncel ekstresi yapar.
function ekstreDonemleriniDuzelt(veri) {
  const ayarlar = veri.ayarlar || {};
  if (ayarlar.ekstreDonemleriV2) return { veri, degisti: false };
  const cards = (veri.cards || []).map((kart) => {
    const k = { ...kart };
    const guncelVar = k.toplamEkstreBorcu !== undefined || k.oncekiDonemBorcu !== undefined;
    const guncelAy = k.ekstreAyi === "2026-07" ? "2026-06" : (k.ekstreAyi || (guncelVar ? "2026-06" : ""));
    const gecmis = (k.ekstreGecmisi || []).map((e) => ({ ...e, ekstreAyi: e.ekstreAyi === "2026-07" ? "2026-06" : e.ekstreAyi }));
    const adaylar = [...gecmis];
    if (guncelVar && guncelAy) adaylar.push(ekstreSnapshot(k, guncelAy));
    if (!adaylar.length) return k;
    const sonAy = adaylar.map((e) => e.ekstreAyi).filter(Boolean).sort().at(-1);
    // Aynı aya çakışan kayıtlarda ekranda güncel olan açık kaydı koru.
    const sonKayit = [...adaylar].reverse().find((e) => e.ekstreAyi === sonAy);
    const arsiv = adaylar.filter((e) => e !== sonKayit && e.ekstreAyi && e.ekstreAyi !== sonAy)
      .filter((e, i, a) => a.findIndex((x) => x.ekstreAyi === e.ekstreAyi) === i);
    const duzeltilmis = { ...k, ...sonKayit, ekstreAyi: sonAy, ekstreGecmisi: arsiv };
    return duzeltilmis;
  });
  return { veri: { ...veri, cards, ayarlar: { ...ayarlar, ekstreDonemleriV2: true } }, degisti: true };
}
function ekstreBorcModeliniDuzelt(veri) {
  const ayarlar = veri.ayarlar || {};
  if (ayarlar.ekstreBorcModeliV3) return { veri, degisti: false };
  const donustur = (kayit) => {
    if (!kayit || kayit.yeniDonemEkstreBorcu !== undefined || (kayit.toplamEkstreBorcu === undefined && kayit.oncekiDonemBorcu === undefined)) return kayit;
    const girilen = +(kayit.toplamEkstreBorcu ?? kayit.oncekiDonemBorcu) || 0;
    const devreden = +kayit.oncekiAydanKalan || 0;
    // Devreden tutar girilen tutardan büyükse kullanıcı ilk alanı yeni dönem borcu olarak doldurmuştur.
    const yeniDonem = devreden > girilen ? girilen : Math.max(girilen - devreden, 0);
    return { ...kayit, yeniDonemEkstreBorcu: yeniDonem, toplamEkstreBorcu: yeniDonem + devreden };
  };
  const cards = (veri.cards || []).map((k) => ({ ...donustur(k), ekstreGecmisi: (k.ekstreGecmisi || []).map(donustur) }));
  return { veri: { ...veri, cards, ayarlar: { ...ayarlar, ekstreBorcModeliV3: true } }, degisti: true };
}
const VARSAYILAN_FAIZ_EK_HESAP = 4.25;
const BOS_VERI = { cards: [], loans: [], overdrafts: [], others: [], expenses: [], incomes: [], paid: {}, loanPaymentHistory: {}, ayarlar: {}, snapshots: {} };

const KATEGORI_META = {
  cards: { ad: "Kredi kartları", liste: "cards", rozetBg: LIME },
  loans: { ad: "Krediler", liste: "loans", rozetBg: "#c8c9be" },
  od: { ad: "Ek hesap / KMH", liste: "overdrafts", rozetBg: CORAL },
  others: { ad: "Devreden / gecikmiş / diğer", liste: "others", rozetBg: "#d8c9a0" },
};
const SEKME_YOLLARI = { ozet: "/summary", borclar: "/debts", odemeler: "/payments", plan: "/debt-plan", gelir: "/income", harcamalar: "/expenses" };
const YOL_SEKMELERI = Object.fromEntries(Object.entries(SEKME_YOLLARI).map(([sekme, yol]) => [yol, sekme]));

/* Tüm borçları tek listede toplayan model — plan ve banka kırılımı bunun üstünde çalışır */
function borcKalemleri(veri) {
  const kalemler = [];
  veri.cards.forEach((k) => {
    const hesap = kartHesabi(k);
    const anaBakiye = hesap.devreden;
    const yeniHarcama = hesap.yeni;
    const guncelBorc = hesap.toplam;
    if (guncelBorc > 0) {
      const gecikmis = kalanGun(kartSonOdemeTarihi(k)) < 0;
      const akdiOran = tcmbKartAzamiFaizi(guncelBorc);
      const gecikmeOran = tcmbKartAzamiGecikmeFaizi(guncelBorc);
      const ozelFaizVar = +k.faiz > 0;
      const faizTutari = (k.toplamEkstreBorcu !== undefined || k.oncekiDonemBorcu !== undefined) ? hesap.faiz : ozelFaizVar
        ? (guncelBorc * (+k.faiz)) / 100
        : gecikmis
          ? (anaBakiye * gecikmeOran) / 100 + (yeniHarcama * akdiOran) / 100
          : (guncelBorc * akdiOran) / 100;
      kalemler.push({
        id: "kart-" + k.id, tur: "kart", banka: (k.banka || "").trim(),
        ad: k.banka + (k.ad ? " · " + k.ad : " · Kredi kartı"),
        bakiye: guncelBorc,
        faiz: (k.toplamEkstreBorcu !== undefined || k.oncekiDonemBorcu !== undefined) ? hesap.oran : ozelFaizVar ? +k.faiz : (guncelBorc > 0 ? (faizTutari / guncelBorc) * 100 : akdiOran),
        faizTutari, faizTahmini: !ozelFaizVar, gecikmis, yeniHarcama,
      });
    }
  });
  veri.overdrafts.forEach((k) => {
    if ((+k.kullanilan || 0) > 0) {
      const bakiye = +k.kullanilan;
      const faiz = +k.faiz > 0 ? +k.faiz : VARSAYILAN_FAIZ_EK_HESAP;
      kalemler.push({
        id: "ek-" + k.id, tur: "ek", banka: (k.banka || "").trim(),
        ad: k.banka + " · Ek hesap (KMH)",
        bakiye, faiz, faizTutari: (bakiye * faiz) / 100, faizTahmini: !(+k.faiz > 0),
      });
    }
  });
  veri.loans.forEach((k) => {
    if ((+k.kalanBorc || 0) > 0) {
      const bakiye = +k.kalanBorc;
      const faiz = +k.faiz > 0 ? +k.faiz : 0;
      kalemler.push({
        id: "kredi-" + k.id, tur: "kredi", banka: (k.banka || "").trim(),
        ad: k.banka + (k.ad ? " · " + k.ad : " · Kredi"),
        bakiye, faiz, faizTutari: (bakiye * faiz) / 100, faizTahmini: false, sabitTaksit: true,
      });
    }
  });
  (veri.others || []).forEach((k) => {
    if ((+k.tutar || 0) > 0) {
      const bakiye = +k.tutar;
      const faiz = +k.faiz > 0 ? +k.faiz : 0;
      kalemler.push({
        id: "diger-" + k.id, tur: "diger", banka: (k.banka || "").trim(),
        ad: k.banka + (k.ad ? " · " + k.ad : " · Gecikmiş borç"),
        bakiye, faiz, faizTutari: (bakiye * faiz) / 100, faizTahmini: false, sabitTaksit: !(+k.faiz > 0),
      });
    }
  });
  return kalemler;
}

/* ---------------- Ana bileşen ---------------- */
export default function BorcTakip() {
  // Bu satır web sürümünde (supabaseClient bağlı) gerçek çıkışla değiştirilir; artifact önizlemesinde zararsızdır.
  const cikisYap = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };
  const [veri, setVeri] = useState(BOS_VERI);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState("");
  const [sekme, setSekmeState] = useState(() => YOL_SEKMELERI[window.location.pathname] || "ozet");
  const [form, setForm] = useState(null);
  const [kaydediliyor, setKaydediliyor] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const s = await window.storage.get("borctakip:v1");
        if (s && s.value) {
          const donemSonucu = ekstreDonemleriniDuzelt({ ...BOS_VERI, ...JSON.parse(s.value) });
          const borcSonucu = ekstreBorcModeliniDuzelt(donemSonucu.veri);
          setVeri(borcSonucu.veri);
          if (donemSonucu.degisti || borcSonucu.degisti) await window.storage.set("borctakip:v1", JSON.stringify(borcSonucu.veri));
        } else {
          setVeri({ ...BOS_VERI, ayarlar: { ekstreDonemleriV2: true, ekstreBorcModeliV3: true } });
        }
      } catch (e) { setHata("Verileriniz yüklenemedi. Lütfen bağlantınızı kontrol edip sayfayı yenileyin."); }
      finally { setYukleniyor(false); }
    })();
  }, []);

  useEffect(() => {
    const geriIleri = () => setSekmeState(YOL_SEKMELERI[window.location.pathname] || "ozet");
    window.addEventListener("popstate", geriIleri);
    return () => window.removeEventListener("popstate", geriIleri);
  }, []);

  function setSekme(yeniSekme) {
    setSekmeState(yeniSekme);
    const yol = SEKME_YOLLARI[yeniSekme];
    if (yol && window.location.pathname !== yol) window.history.pushState({}, "", yol);
  }

  async function kaydet(yeni) {
    const kalemler = borcKalemleri(yeni);
    const toplam = kalemler.reduce((t, k) => t + k.bakiye, 0);
    yeni = { ...yeni, snapshots: { ...(yeni.snapshots || {}), [ayAnahtari()]: toplam } };
    setVeri(yeni);
    setKaydediliyor(true);
    try {
      await window.storage.set("borctakip:v1", JSON.stringify(yeni));
      setHata("");
    } catch (e) {
      setHata(e?.message === "VERI_CAKISMASI"
        ? "Verileriniz başka bir cihazda değiştirilmiş. Kayıp yaşanmaması için sayfayı yenileyip tekrar deneyin."
        : "Kayıt sırasında bir sorun oluştu. Değişiklikler bu oturumda duruyor; bir sonraki işlemde tekrar denenecek.");
    } finally { setKaydediliyor(false); }
  }

  const isDark = (veri.ayarlar || {}).tema === "dark";
  const ozelBankalar = (veri.ayarlar || {}).ozelBankalar || [];
  const bankalar = useMemo(() => [...new Set([...BANKALAR, ...ozelBankalar])], [ozelBankalar]);
  const temaAnahtarlarSwitch = () => ayarKaydet({ tema: isDark ? "light" : "dark" });
  const t = isDark ? KOYU_TEMA : ACIK_TEMA;
  const rootStyle = { "--bg": t.bg, "--panel": t.panel, "--panel2": t.panel2, "--text": t.text, "--dim": t.dim, "--faint": t.faint, "--line": t.line };

  const kalemler = useMemo(() => borcKalemleri(veri), [veri]);

  const toplamlar = useMemo(() => {
    const kart = kalemler.filter((k) => k.tur === "kart").reduce((t, k) => t + k.bakiye, 0);
    const kredi = kalemler.filter((k) => k.tur === "kredi").reduce((t, k) => t + k.bakiye, 0);
    const ek = kalemler.filter((k) => k.tur === "ek").reduce((t, k) => t + k.bakiye, 0);
    const diger = kalemler.filter((k) => k.tur === "diger").reduce((t, k) => t + k.bakiye, 0);
    return { kart, kredi, ek, diger, genel: kart + kredi + ek + diger };
  }, [kalemler]);

  const aylikFaiz = useMemo(
    () => kalemler.filter((k) => !k.sabitTaksit).reduce((t, k) => t + k.faizTutari, 0),
    [kalemler]
  );

  const buAyOdenecek = useMemo(() => {
    const kartOdeme = veri.cards.reduce((t, k) => {
      const h = kartHesabi(k);
      return t + (k.toplamEkstreBorcu !== undefined || k.oncekiDonemBorcu !== undefined ? h.asgari : (+k.asgari > 0 ? +k.asgari : (+k.borc > 0 ? +k.borc : h.onceki)));
    }, 0);
    const taksit = veri.loans.reduce((t, k) => t + (+k.taksit || 0), 0);
    return kartOdeme + taksit;
  }, [veri]);

  const gecenAyDelta = useMemo(() => {
    const buAy = ayAnahtari();
    const aylar = Object.keys(veri.snapshots || {}).filter((a) => a < buAy).sort();
    if (aylar.length === 0) return null;
    const onceki = veri.snapshots[aylar[aylar.length - 1]];
    return { fark: toplamlar.genel - onceki, ay: aylar[aylar.length - 1] };
  }, [veri, toplamlar]);

  const yaklasan = useMemo(() => {
    const liste = [];
    const ay = ayAnahtari();
    veri.cards.forEach((k) => {
      const h = kartHesabi(k); const anaBorc = h.toplam;
      if (anaBorc > 0) {
        const yeniModel = k.toplamEkstreBorcu !== undefined || k.oncekiDonemBorcu !== undefined;
        const yasalOran = (+k.limit || 0) <= 50000 ? .20 : .40;
        const hedefTutar = yeniModel ? h.onceki * yasalOran : (+k.asgari > 0 ? +k.asgari : anaBorc * yasalOran);
        const elleOdendi = !!veri.paid["kart-" + k.id + "-" + ay];
        const odemeBilgisiYok = !yeniModel && !elleOdendi;
        const girilenOdeme = yeniModel ? h.odeme : 0;
        const yapilanOdeme = elleOdendi ? Math.max(girilenOdeme, hedefTutar) : girilenOdeme;
        const tutar = Math.max(hedefTutar - yapilanOdeme, 0);
        const otomatikOdendi = !elleOdendi && hedefTutar > 0 && tutar <= 0;
        liste.push({
          id: "kart-" + k.id, banka: k.banka, ad: k.banka + (k.ad ? " · " + k.ad : ""),
          tutar, hedefTutar, yapilanOdeme, odemeBilgisiYok, not: "kalan minimum ödeme",
          tarih: kartGecikmeTarihi(k),
          odendi: elleOdendi || otomatikOdendi, otomatikOdendi, anahtar: "kart-" + k.id + "-" + ay,
        });
      }
    });
    veri.loans.forEach((k) => {
      if ((+k.kalanBorc || 0) > 0) {
        const elleOdendi = !!veri.paid["kredi-" + k.id + "-" + ay];
        liste.push({
          id: "kredi-" + k.id, banka: k.banka, ad: k.banka + (k.ad ? " · " + k.ad : ""),
          tutar: elleOdendi ? 0 : (+k.taksit || 0), hedefTutar: +k.taksit || 0, yapilanOdeme: elleOdendi ? (+k.taksit || 0) : 0, not: "kalan taksit",
          tarih: buAyOdemeTarihi(k.odemeGunu),
          odendi: elleOdendi, anahtar: "kredi-" + k.id + "-" + ay,
        });
      }
    });
    return liste.sort((a, b) => a.tarih - b.tarih);
  }, [veri]);

  const buAyHarcama = useMemo(() => {
    const ay = ayAnahtari();
    const buAy = veri.expenses.filter((h) => (h.tarih || "").startsWith(ay));
    const toplam = buAy.reduce((t, h) => t + (+h.tutar || 0), 0);
    const kategoriler = {};
    const kaynaklar = {};
    buAy.forEach((h) => {
      kategoriler[h.kategori] = (kategoriler[h.kategori] || 0) + (+h.tutar || 0);
      const kaynak = h.kaynak || "Belirtilmemiş";
      kaynaklar[kaynak] = (kaynaklar[kaynak] || 0) + (+h.tutar || 0);
    });
    return { toplam, kategoriler, kaynaklar, adet: buAy.length };
  }, [veri]);

  const buAyGelir = useMemo(() => {
    const ay = ayAnahtari();
    const kaynaklar = {};
    let toplam = 0;
    (veri.incomes || []).forEach((g) => {
      const dahil = g.tekrar === "Tek seferlik" ? (g.tarih || "").startsWith(ay) : true;
      if (dahil) {
        toplam += +g.tutar || 0;
        kaynaklar[g.ad] = (kaynaklar[g.ad] || 0) + (+g.tutar || 0);
      }
    });
    return { toplam, kaynaklar };
  }, [veri]);

  const netNakit = buAyGelir.toplam > 0 ? buAyGelir.toplam - buAyOdenecek - buAyHarcama.toplam : null;

  function ekleGuncelle(liste, kayit) {
    const dizi = veri[liste];
    const varMi = dizi.some((x) => x.id === kayit.id);
    kaydet({ ...veri, [liste]: varMi ? dizi.map((x) => (x.id === kayit.id ? kayit : x)) : [...dizi, kayit] });
    setForm(null);
  }
  const sil = (liste, id) => kaydet({ ...veri, [liste]: veri[liste].filter((x) => x.id !== id) });
  const odendiIsaretle = (anahtar, durum) => {
    const yeniPaid = { ...veri.paid, [anahtar]: durum };
    if (!anahtar.startsWith("kredi-")) return kaydet({ ...veri, paid: yeniPaid });
    const ay = anahtar.slice(-7); const id = anahtar.slice(6, -8); const kredi = veri.loans.find((x) => x.id === id);
    const ayGecmisi = { ...(veri.loanPaymentHistory?.[ay] || {}) };
    if (durum && kredi) ayGecmisi[id] = { krediId: id, banka: kredi.banka, ad: kredi.ad, taksit: kredi.taksit, kalanBorc: kredi.kalanBorc, kalanTaksit: kredi.kalanTaksit, odemeGunu: kredi.odemeGunu, odendiTarihi: new Date().toISOString() };
    else delete ayGecmisi[id];
    const loanPaymentHistory = { ...(veri.loanPaymentHistory || {}), [ay]: ayGecmisi };
    return kaydet({ ...veri, paid: yeniPaid, loanPaymentHistory });
  };
  const ayarKaydet = (a) => kaydet({ ...veri, ayarlar: { ...veri.ayarlar, ...a } });
  const bankaEkle = (ad) => {
    const temiz = ad.trim();
    if (!temiz) return "";
    const mevcut = bankalar.find((b) => b.toLocaleLowerCase("tr-TR") === temiz.toLocaleLowerCase("tr-TR"));
    if (mevcut) return mevcut;
    ayarKaydet({ ozelBankalar: [...ozelBankalar, temiz] });
    return temiz;
  };

  function harcamaKaydet(kayit, kartaEkle) {
    const dizi = veri.expenses;
    const varMi = dizi.some((x) => x.id === kayit.id);
    let yeni = { ...veri, expenses: varMi ? dizi.map((x) => (x.id === kayit.id ? kayit : x)) : [...dizi, kayit] };
    if (kartaEkle && !varMi) {
      yeni = {
        ...yeni,
        cards: yeni.cards.map((c) => {
          if (c.banka + " · " + (c.ad || "Kredi kartı") !== kayit.kaynak) return c;
          return { ...c, donemIciEklenen: (+c.donemIciEklenen || 0) + (+kayit.tutar || 0) };
        }),
      };
    }
    kaydet(yeni);
    setForm(null);
  }

  const s = bugun();

  return (
    <div className="bt-app" style={rootStyle}>
      <style>{CSS}</style>
      <datalist id="bt-bankalar">{bankalar.map((b) => <option key={b} value={b} />)}</datalist>
      <div className="bt-wrap">
        <header className="bt-header">
          <div><img src="/borcama-logo.png" alt="Borcama" style={{ width: "clamp(150px,22vw,220px)", height: "auto", display: "block" }} /></div>
          <div className="bt-headright">
            <div className="bt-date">{s.getDate()} {AYLAR[s.getMonth()]} {s.getFullYear()}{kaydediliyor && <span style={{ marginLeft: 8 }}>● kaydediliyor</span>}</div>
            <button className="bt-themebtn" onClick={temaAnahtarlarSwitch} title="Tema değiştir">
              <span className="bt-themeknob" style={{ left: isDark ? 26 : 2 }} />
            </button>
            <div className="bt-themelabel">{isDark ? "Koyu" : "Açık"}</div>
            <button className="bt-exit" onClick={cikisYap}>Çıkış →</button>
          </div>
        </header>

        <nav className="bt-nav">
          {[["ozet","Özet"],["borclar","Borçlar"],["odemeler","Ödemeler"],["plan","Borç Planı"],["gelir","Gelir"],["harcamalar","Harcamalar"]].map(([k, ad]) => (
            <button key={k} className={"bt-pill " + (sekme === k ? "aktif" : "pasif")} onClick={() => { setSekme(k); setForm(null); }}>{ad}</button>
          ))}
        </nav>

        {yukleniyor ? (
          <div className="bt-bos">Verileriniz yükleniyor…</div>
        ) : (
          <>
            {hata && <div className="bt-card" style={{ borderColor: CORAL, marginBottom: 16, fontSize: 13 }}>{hata}</div>}
            {sekme === "ozet" && <Ozet toplamlar={toplamlar} kalemler={kalemler} aylikFaiz={aylikFaiz} gecenAyDelta={gecenAyDelta} buAyOdenecek={buAyOdenecek} yaklasan={yaklasan} buAyHarcama={buAyHarcama} buAyGelir={buAyGelir} netNakit={netNakit} odendiIsaretle={odendiIsaretle} setSekme={setSekme} />}
            {sekme === "borclar" && <Borclar veri={veri} form={form} setForm={setForm} ekleGuncelle={ekleGuncelle} sil={sil} bankalar={bankalar} bankaEkle={bankaEkle} />}
            {sekme === "odemeler" && <Odemeler yaklasan={yaklasan} odendiIsaretle={odendiIsaretle} />}
            {sekme === "plan" && <Plan kalemler={kalemler} aylikFaiz={aylikFaiz} setSekme={setSekme} />}
            {sekme === "gelir" && <Gelirler veri={veri} form={form} setForm={setForm} ekleGuncelle={ekleGuncelle} sil={sil} buAyGelir={buAyGelir} />}
            {sekme === "harcamalar" && <Harcamalar veri={veri} form={form} setForm={setForm} harcamaKaydet={harcamaKaydet} sil={sil} buAyHarcama={buAyHarcama} bankalar={bankalar} />}
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------- Özet ---------------- */
function Ozet({ toplamlar, kalemler, aylikFaiz, gecenAyDelta, buAyOdenecek, yaklasan, buAyHarcama, buAyGelir, netNakit, odendiIsaretle, setSekme }) {
  const [tumBankalar, setTumBankalar] = useState(false);
  const gelir = buAyGelir.toplam;
  const oran = gelir > 0 ? (buAyOdenecek / gelir) * 100 : null;

  const parcalar = [
    { ad: "Kredi kartları", tutar: toplamlar.kart, renk: LIME },
    { ad: "Krediler", tutar: toplamlar.kredi, renk: CORAL },
    { ad: "Ek hesap / KMH", tutar: toplamlar.ek, renk: "#c8c9be" },
    { ad: "Gecikmiş / diğer", tutar: toplamlar.diger, renk: "#55584c" },
  ];

  const bankalar = useMemo(() => {
    const m = {};
    kalemler.forEach((k) => { m[k.banka || "Diğer"] = (m[k.banka || "Diğer"] || 0) + k.bakiye; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [kalemler]);
  const maxBanka = bankalar.length ? bankalar[0][1] : 1;
  const gorunenBankalar = tumBankalar ? bankalar : bankalar.slice(0, 3);

  const gecikmisler = yaklasan.filter((o) => kalanGun(o.tarih) < 0 && !o.odendi);
  const yaklasanlar = yaklasan.filter((o) => !(kalanGun(o.tarih) < 0) || o.odendi);

  const metrikler = [
    { lbl: "Bu ay ödenmesi gereken", amt: fmt(buAyOdenecek), cap: "Kredi taksitleri + kart asgarileri" },
    { lbl: "Bu ay geliriniz", amt: fmt(gelir), cap: gelir > 0 ? Object.keys(buAyGelir.kaynaklar).length + " kaynak" : "Gelir sekmesinden ekleyin" },
    { lbl: "Bu ay harcamanız", amt: fmt(buAyHarcama.toplam), cap: buAyHarcama.adet + " kayıt" },
  ];
  if (netNakit !== null) metrikler.push({ lbl: "Net nakit akışı", amt: (netNakit >= 0 ? "+" : "") + fmt(netNakit), cap: "Gelir − ödemeler − harcamalar", coral: netNakit < 0 });

  return (
    <div className="bt-stack">
      <div className="bt-hero">
        <span className="deko-daire" /><span className="deko-kare" />
        <div className="bt-hero-label">Tüm bankalardaki toplam borcunuz</div>
        <div className="bt-hero-tutar">{fmt(toplamlar.genel)}</div>
        {gecenAyDelta && (
          <div className="bt-hero-delta" style={{ background: gecenAyDelta.fark <= 0 ? "#cdf56428" : "#ff6f5928", color: gecenAyDelta.fark <= 0 ? LIME : CORAL }}>
            {gecenAyDelta.fark === 0 ? "Geçen aydan bu yana değişmedi" : (gecenAyDelta.fark < 0 ? fmt0(-gecenAyDelta.fark) + " azaldı" : fmt0(gecenAyDelta.fark) + " arttı") + " (geçen aya göre)"}
          </div>
        )}
        <div className="bt-serit">
          {toplamlar.genel > 0 && parcalar.map((p) => p.tutar > 0 ? <div key={p.ad} style={{ width: (p.tutar / toplamlar.genel) * 100 + "%", background: p.renk }} /> : null)}
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", position: "relative", zIndex: 1 }}>
          {parcalar.map((p) => (
            <div key={p.ad} className="bt-chip">
              <span className="dot" style={{ background: p.renk }} />
              <span className="lbl">{p.ad}</span>
              <span className="amt">{fmt(p.tutar)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bt-grid">
        {metrikler.map((m, i) => (
          <div key={m.lbl} className="bt-metric" style={{ transform: "rotate(" + [-1.1, 0.8, -0.6, 1.2][i % 4] + "deg)", borderColor: m.coral ? CORAL : undefined }}>
            <div className="bt-metric-lbl">{m.lbl}</div>
            <div className="bt-metric-amt" style={{ color: m.coral ? CORAL : undefined }}>{m.amt}</div>
            <div className="bt-metric-cap">{m.cap}</div>
          </div>
        ))}
      </div>

      {oran !== null && (
        <div className="bt-risk" style={{ background: oran < 30 ? LIME : oran < 50 ? "#ffcf6e" : CORAL }}>
          <div className="bt-risk-inner">
            <div className="bt-risk-pct">%{Math.round(oran)}</div>
            <div className="bt-risk-txt">
              Gelirinizin bu kadarı zorunlu borç ödemesine gidiyor — {oran < 30 ? "sağlıklı seviyede" : oran < 50 ? "dikkat gerektiren seviyede" : "riskli seviye"}.
              Detaylar için <button className="bt-link" style={{ color: INK, textDecoration: "underline" }} onClick={() => setSekme("plan")}>Borç Planı</button>'na bakın.
            </div>
          </div>
        </div>
      )}

      {bankalar.length > 0 && (
        <div className="bt-card">
          <div className="bt-h2">Banka bazında yükünüz</div>
          {gorunenBankalar.map(([banka, tutar]) => (
            <div key={banka} className="bt-banka-row">
              <div className="bt-banka-top"><span>{banka}</span><span className="bt-mono">{fmt(tutar)}</span></div>
              <div className="bt-banka-bar"><div style={{ width: Math.max(2, Math.round((tutar / maxBanka) * 100)) + "%" }} /></div>
            </div>
          ))}
          {bankalar.length > 3 && (
            <button className="bt-link" style={{ marginTop: 18 }} onClick={() => setTumBankalar(!tumBankalar)}>
              {tumBankalar ? "Daha az göster" : "Tümünü gör (+" + (bankalar.length - 3) + ")"}
            </button>
          )}
        </div>
      )}

      <div className="bt-hero2">
        {gecikmisler.length > 0 && (
          <>
            <div className="bt-display" style={{ fontSize: 16, color: CORAL, marginBottom: 16 }}>Gecikmiş ödemeler</div>
            <div className="bt-stack" style={{ gap: 10, marginBottom: 24 }}>
              {gecikmisler.map((o, i) => (
                <OdemeSatiri key={o.id} o={o} i={i} gecikmis odendiIsaretle={odendiIsaretle} />
              ))}
            </div>
          </>
        )}
        <div className="bt-display" style={{ fontSize: 16, color: LIME, marginBottom: 16 }}>Yaklaşan ödemeler</div>
        {yaklasanlar.length === 0 ? (
          <div style={{ color: "#8a8c7e", fontSize: 13 }}>
            Henüz ödeme takvimi yok. <button className="bt-link" onClick={() => setSekme("borclar")}>Borçlar sekmesinden</button> kart ve kredilerinizi ekleyin.
          </div>
        ) : (
          <div className="bt-stack" style={{ gap: 10 }}>
            {yaklasanlar.map((o, i) => <OdemeSatiri key={o.id} o={o} i={i} gecikmis={false} odendiIsaretle={odendiIsaretle} />)}
          </div>
        )}
      </div>

      {aylikFaiz > 0 && (
        <div style={{ textAlign: "center", fontSize: 12, color: "var(--faint)" }}>
          Bu ay tahmini {fmt0(aylikFaiz)} faiz işleyecek — detayları Borç Planı sekmesinde görün.
        </div>
      )}
    </div>
  );
}

function OdemeSatiri({ o, i, gecikmis, odendiIsaretle }) {
  const gun = kalanGun(o.tarih);
  return (
    <div className="bt-satirD">
      <div style={rozetStil(gecikmis ? CORAL : LIME, ROTASYONLAR[i % ROTASYONLAR.length])}>{bankaKodu(o.banka)}</div>
      <div style={{ flex: 1, minWidth: 140 }}>
        <div className="bt-satirD-ad" style={{ textDecoration: o.odendi ? "line-through" : "none" }}>{o.ad}</div>
        <div className="bt-satirD-alt" style={{ color: gecikmis ? CORAL : "#8a8c7e", fontWeight: gecikmis ? 600 : 400 }}>
          {o.odendi ? "ödendi" : gecikmis ? (-gun) + " gün gecikti" : gun === 0 ? "bugün son gün" : gun + " gün kaldı"}
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div className="bt-satirD-tutar">{fmt(o.tutar)}</div>
        <div className="bt-satirD-tur">{o.not}</div>
        <div className="bt-satirD-tur" style={{ color: o.odemeBilgisiYok ? "#8a8c7e" : "#5D7A2E", fontWeight: 700 }}>Yapılan ödeme: {o.odemeBilgisiYok ? "Eski kayıtta bilgi yok" : fmt(o.yapilanOdeme)}</div>
      </div>
      {o.otomatikOdendi ? <div className="bt-btn kucuk heroghost" style={{ cursor: "default" }}><Check size={12}/> Ekstreye işlendi</div> : <button className="bt-btn kucuk heroghost" onClick={() => odendiIsaretle(o.anahtar, !o.odendi)}>
        {o.odendi ? <><RotateCcw size={12} /> Geri al</> : <><Check size={12} /> Ödendi</>}
      </button>}
    </div>
  );
}

function Odemeler({ yaklasan, odendiIsaretle }) {
  const sirali = [...yaklasan].sort((a, b) => a.tarih - b.tarih);
  const odendi = sirali.filter((x) => x.odendi);
  const bekleyen = sirali.filter((x) => !x.odendi);
  const toplam = sirali.reduce((t, x) => t + (+x.hedefTutar || 0), 0);
  const kalan = sirali.reduce((t, x) => t + (+x.tutar || 0), 0);
  const odenen = sirali.reduce((t, x) => t + (+x.yapilanOdeme || 0), 0);
  const simdi = bugun();
  const eskiKayitSayisi = sirali.filter((x) => x.odemeBilgisiYok).length;
  return <div className="bt-stack">
    <div className="bt-card">
      <div className="bt-cardhead"><div><div className="bt-eyebrow">{AYLAR[simdi.getMonth()]} {simdi.getFullYear()}</div><div className="bt-h2" style={{ margin: "5px 0 0" }}>Aylık ödeme listesi</div></div><div className="bt-mono" style={{ fontWeight: 800 }}>{odendi.length}/{sirali.length} tamamlandı</div></div>
      <div className="bt-grid" style={{ marginTop: 16 }}><div className="bt-metric"><div className="bt-metric-lbl">Bu ay ödeme hedefi</div><div className="bt-metric-amt">{fmt(toplam)}</div><div className="bt-metric-cap">Kart minimumları ve kredi taksitleri</div></div><div className="bt-metric"><div className="bt-metric-lbl">Yapılan ödemeler</div><div className="bt-metric-amt">{fmt(odenen)}</div><div className="bt-metric-cap">Kalan {fmt(kalan)}</div></div></div>
    </div>
    <div className="bt-ipucu"><CalendarCheck size={16}/><div>Ödemeyi yaptığınızda işaretleyin. Kayıt yalnızca bu aya aittir; yeni ay başladığında yeni ödeme listesi otomatik oluşur.</div></div>
    {eskiKayitSayisi>0&&<div className="bt-ipucu" style={{ borderColor: CORAL }}><Lightbulb size={16}/><div><b>{eskiKayitSayisi} eski kart kaydı:</b> Kart ve borç bilgileri korunuyor; ancak eski formatta yapılan ödeme ayrı tutulmadığı için ödeme tutarı “bilgi yok” olarak gösteriliyor. Yeni ekstre girişinden itibaren bu alan otomatik takip edilir.</div></div>}
    <div className="bt-card"><div className="bt-h2">Bekleyen ödemeler</div>{bekleyen.length===0?<div className="bt-bos">Bu ay için bekleyen ödeme yok.</div>:<div className="bt-stack" style={{gap:10}}>{bekleyen.map((o,i)=><OdemeSatiri key={o.id} o={o} i={i} gecikmis={kalanGun(o.tarih)<0} odendiIsaretle={odendiIsaretle}/>)}</div>}</div>
    {odendi.length>0&&<div className="bt-card"><div className="bt-h2">Tamamlananlar</div><div className="bt-stack" style={{gap:10}}>{odendi.map((o,i)=><OdemeSatiri key={o.id} o={o} i={i} gecikmis={false} odendiIsaretle={odendiIsaretle}/>)}</div></div>}
  </div>;
}

/* ---------------- Borçlar (kategori pilleriyle tek panel) ---------------- */
function Borclar({ veri, form, setForm, ekleGuncelle, sil, bankalar, bankaEkle }) {
  const [kategori, setKategori] = useState("cards");
  const [seciliEkstreAyi, setSeciliEkstreAyi] = useState("guncel");
  const [seciliKrediAyi, setSeciliKrediAyi] = useState("guncel");
  const [yeniBanka, setYeniBanka] = useState("");
  const [bankaPenceresi, setBankaPenceresi] = useState(false);
  const meta = KATEGORI_META[kategori] || KATEGORI_META.cards;
  const guncelEkstreAyi = useMemo(() => {
    const aylar = veri.cards.flatMap((k) => [k.ekstreAyi, ...(k.ekstreGecmisi || []).map((e) => e.ekstreAyi)]).filter(Boolean).sort();
    return aylar.at(-1) || ayAnahtari();
  }, [veri.cards]);
  const ekstreAylar = useMemo(() => [...new Set(veri.cards.flatMap((k) => (k.ekstreGecmisi || []).map((e) => e.ekstreAyi)).filter(Boolean))].sort().reverse(), [veri.cards]);
  const gelecekKrediAylar = useMemo(() => Array.from({ length: 6 }, (_, i) => ayEkle(ayAnahtari(), i + 1)), []);
  const krediAylar = useMemo(() => [...new Set([
    ...Object.keys(veri.loanPaymentHistory || {}).filter((ay) => Object.keys(veri.loanPaymentHistory?.[ay] || {}).length > 0),
    ...Object.keys(veri.paid || {}).filter((k) => k.startsWith("kredi-") && veri.paid[k]).map((k) => k.slice(-7)),
  ].filter((ay) => ay && ay !== ayAnahtari()))].sort().reverse(), [veri.loanPaymentHistory, veri.paid]);
  const arsivGorunumu = kategori === "cards" && seciliEkstreAyi !== "guncel";
  const krediGelecekGorunumu = kategori === "loans" && gelecekKrediAylar.includes(seciliKrediAyi);
  const krediArsivGorunumu = kategori === "loans" && seciliKrediAyi !== "guncel" && !krediGelecekGorunumu;
  const kayitlar = kategori === "kontrol" ? [] : arsivGorunumu
    ? veri.cards.flatMap((k) => { const e = [...(k.ekstreGecmisi || [])].reverse().find((x) => x.ekstreAyi === seciliEkstreAyi); return e ? [{ ...k, ...e, _arsiv: true }] : []; })
    : krediArsivGorunumu ? veri.loans.flatMap((k) => {
      const gecmis = veri.loanPaymentHistory?.[seciliKrediAyi]?.[k.id];
      const odendi = !!veri.paid?.["kredi-" + k.id + "-" + seciliKrediAyi];
      return gecmis || odendi ? [{ ...k, ...(gecmis || {}), _arsiv: true, _odendi: odendi, _donem: seciliKrediAyi }] : [];
    })
    : krediGelecekGorunumu ? veri.loans.flatMap((k) => {
      const fark = ayFarki(ayAnahtari(), seciliKrediAyi); const kalanTaksit = +k.kalanTaksit || null;
      if ((+k.kalanBorc || 0) <= 0 || (kalanTaksit !== null && kalanTaksit <= fark)) return [];
      return [{ ...k, _gelecek: true, _donem: seciliKrediAyi, _kalanTaksitProj: kalanTaksit === null ? null : Math.max(kalanTaksit - fark - 1, 0) }];
    })
    : (veri[meta.liste] || []);
  const saltOkunurGorunum = arsivGorunumu || krediArsivGorunumu || krediGelecekGorunumu;
  const acik = form && form.liste === meta.liste;
  const yeniEkstreModu = kategori === "cards" && acik && form.yeniEkstre;
  const ekstreDuzenleModu = kategori === "cards" && acik && form.ekstreDuzenle;
  const ekstreFormu = yeniEkstreModu || ekstreDuzenleModu;
  const [f, setF] = useState({});
  const otomatikGecikenler = useMemo(() => {
    const ay = ayAnahtari();
    const liste = [];
    veri.cards.forEach((k) => {
      const h = kartHesabi(k); const tarih = kartGecikmeTarihi(k); const gun = -kalanGun(tarih);
      const asgariOran = (+k.limit || 0) <= 50000 ? .20 : .40;
      const asgariTamam = h.odeme >= h.onceki * asgariOran;
      const odendi = !!veri.paid?.["kart-" + k.id + "-" + ay];
      if (gun > 0 && h.toplam > 0) {
        const minimumTamam = asgariTamam || odendi;
        const oran = minimumTamam ? tcmbKartAzamiFaizi(h.onceki || h.toplam) : tcmbKartAzamiGecikmeFaizi(h.onceki || h.toplam);
        liste.push({ id: "kart-" + k.id, tur: minimumTamam ? "Devreden kart borcu" : "Gecikmiş kart borcu", durum: minimumTamam ? "devreden" : "gecikmis", banka: k.banka, ad: k.ad || "Kredi kartı", tarih, gun, bakiye: h.toplam, oran, faiz: minimumTamam ? (h.toplam * oran) / 100 : gunlukBirikmisFaiz(h.toplam, oran, gun) });
      }
    });
    veri.loans.forEach((k) => {
      const tarih = buAyOdemeTarihi(k.odemeGunu); const gun = -kalanGun(tarih);
      const odendi = !!veri.paid?.["kredi-" + k.id + "-" + ay];
      if (gun > 0 && (+k.kalanBorc || 0) > 0 && !odendi) {
        const bakiye = +k.taksit || 0; const oran = +k.faiz || 0;
        liste.push({ id: "kredi-" + k.id, tur: "Kredi taksiti", banka: k.banka, ad: k.ad || "Kredi", tarih, gun, bakiye, oran, faiz: gunlukBirikmisFaiz(bakiye, oran, gun) });
      }
    });
    return liste.sort((a, b) => b.gun - a.gun);
  }, [veri]);
  useEffect(() => {
    if (!acik) return;
    if (form.yeniEkstre) {
      const eski = form.veri || {};
      const sonDonem = [eski.ekstreAyi, ...(eski.ekstreGecmisi || []).map((e) => e.ekstreAyi)].filter(Boolean).sort().at(-1);
      setF({ ekstreAyi: sonDonem ? ayEkle(sonDonem, 1) : guncelEkstreAyi, yeniDonemEkstreBorcu: "", oncekiAydanKalan: kartHesabi(eski).toplam || "", yapilanOdeme: "0", limit: eski.limit || "", kesimGunu: eski.kesimGunu || "", sonOdemeGunu: eski.sonOdemeGunu || "" });
    } else if (form.ekstreDuzenle) {
      const eski = form.veri || {}; const yeniModel = eski.yeniDonemEkstreBorcu !== undefined || eski.toplamEkstreBorcu !== undefined || eski.oncekiDonemBorcu !== undefined;
      const hesap = kartHesabi(eski);
      setF({ ekstreAyi: eski.ekstreAyi || ayAnahtari(), yeniDonemEkstreBorcu: yeniModel ? hesap.yeni : "", oncekiAydanKalan: eski.oncekiAydanKalan || "", yapilanOdeme: yeniModel ? (eski.yapilanOdeme || "0") : "", limit: eski.limit || "", kesimGunu: eski.kesimGunu || "", sonOdemeGunu: eski.sonOdemeGunu || (eski.sonOdemeTarihi ? +eski.sonOdemeTarihi.slice(-2) : "") });
    } else setF(form.veri || {});
  }, [acik, form, kategori, guncelEkstreAyi]);

  const ALAN_TANIMLARI = {
    cards: [
      { k: "banka", e: "Banka", t: "text", z: true },
      { k: "ad", e: "Kart adı (Bonus, World…)", t: "text", z: true },
      { k: "limit", e: "Toplam kart limiti (₺)", t: "number", z: true },
      { k: "kesimGunu", e: "Ekstre kesim günü", t: "number", z: true },
      { k: "sonOdemeGunu", e: "Son ödeme günü (ayın kaçı)", t: "number", z: true },
    ],
    loans: [
      { k: "banka", e: "Banka", t: "text", z: true },
      { k: "ad", e: "Kredi türü (ihtiyaç, taşıt…)", t: "text" },
      { k: "kalanBorc", e: "Kalan toplam borç (₺)", t: "number", z: true },
      { k: "taksit", e: "Aylık taksit (₺)", t: "number", z: true },
      { k: "kalanTaksit", e: "Kalan taksit sayısı", t: "number" },
      { k: "faiz", e: "Aylık faiz oranı (%)", t: "number" },
      { k: "odemeGunu", e: "Ödeme günü", t: "number", z: true },
    ],
    od: [
      { k: "banka", e: "Banka", t: "text", z: true },
      { k: "limit", e: "Ek hesap limiti (₺)", t: "number" },
      { k: "kullanilan", e: "Kullanılan tutar (₺)", t: "number", z: true },
      { k: "faiz", e: "Aylık faiz oranı (%)", t: "number" },
    ],
    others: [
      { k: "banka", e: "Alacaklı (banka / kurum / kişi)", t: "text", z: true },
      { k: "ad", e: "Açıklama (2023 kart borcu, icra…)", t: "text" },
      { k: "tutar", e: "Güncel tutar (₺)", t: "number", z: true },
      { k: "faiz", e: "Aylık faiz / gecikme oranı (%)", t: "number" },
    ],
  };
  const alanlar = ekstreFormu ? [
    { k: "ekstreAyi", e: "Ekstre dönemi", t: "month", z: true },
    { k: "yeniDonemEkstreBorcu", e: "Güncel dönem borcu (₺)", t: "number", z: true },
    { k: "oncekiAydanKalan", e: "Geçen aydan devreden (₺)", t: "number" },
    { k: "yapilanOdeme", e: "Toplam ödenen (₺)", t: "number", z: true },
    { k: "kesimGunu", e: "Ekstre kesim günü", t: "number" },
    { k: "sonOdemeGunu", e: "Son ödeme günü (ayın kaçı)", t: "number", z: true },
  ] : ALAN_TANIMLARI[kategori];

  function toplamHesapla() {
    if (kategori === "cards") return kayitlar.reduce((t, k) => t + kartHesabi(k).toplam, 0);
    if (kategori === "loans") return kayitlar.reduce((t, k) => t + (krediArsivGorunumu || krediGelecekGorunumu ? (+k.taksit || 0) : (+k.kalanBorc || 0)), 0);
    if (kategori === "od") return kayitlar.reduce((t, k) => t + (+k.kullanilan || 0), 0);
    return kayitlar.reduce((t, k) => t + (+k.tutar || 0), 0);
  }
  function sayacHesapla() {
    const n = kayitlar.length;
    if (kategori === "cards") return n + " kredi kartı";
    if (kategori === "loans") return krediArsivGorunumu ? n + " ödenmiş taksit" : krediGelecekGorunumu ? n + " planlanan taksit" : n + " kredi";
    if (kategori === "od") return n + " ek hesap / KMH";
    return n + " kayıt";
  }

  function gonder() {
    for (const a of alanlar) if (a.z && !String(f[a.k] ?? "").trim()) return;
    const ekstreVerisi = ekstreFormu ? { ...f, toplamEkstreBorcu: (+f.yeniDonemEkstreBorcu || 0) + (+f.oncekiAydanKalan || 0) } : f;
    if (yeniEkstreModu) {
      const eski = form.veri;
      const mevcutDonem = eski.ekstreAyi || guncelEkstreAyi;
      if (ekstreVerisi.ekstreAyi < mevcutDonem) {
        const arsiv = { ...ekstreVerisi, arsivlenmeTarihi: new Date().toISOString() };
        ekleGuncelle("cards", { ...eski, ekstreGecmisi: [...(eski.ekstreGecmisi || []).filter((e) => e.ekstreAyi !== ekstreVerisi.ekstreAyi), arsiv] });
        return;
      }
      const arsiv = ekstreSnapshot(eski, mevcutDonem);
      ekleGuncelle("cards", { ...eski, ...ekstreVerisi, ekstreGecmisi: [...(eski.ekstreGecmisi || []).filter((e) => e.ekstreAyi !== mevcutDonem), arsiv] });
      return;
    }
    if (ekstreDuzenleModu) {
      ekleGuncelle("cards", { ...form.veri, ...ekstreVerisi });
      return;
    }
    ekleGuncelle(meta.liste, { id: f.id || uid(), ...f });
  }

  function bankaGonder(e) {
    e.preventDefault();
    const temiz = yeniBanka.trim();
    if (!temiz) return;
    const banka = bankaEkle(temiz);
    setF({ ...f, banka });
    setYeniBanka("");
    setBankaPenceresi(false);
  }

  return (
    <div className="bt-stack">
      <div className="bt-nav" style={{ marginBottom: 0 }}>
        {Object.entries(KATEGORI_META).map(([key, m]) => (
          <button key={key} className={"bt-pill " + (kategori === key ? "aktif" : "pasif")} style={{ fontSize: 13.5 }}
            onClick={() => { setKategori(key); setForm(null); }}>{m.ad}</button>
        ))}
        <button className={"bt-pill " + (kategori === "kontrol" ? "aktif" : "pasif")} style={{ fontSize: 13.5 }}
          onClick={() => { setKategori("kontrol"); setForm(null); }}>Ekstre kontrolü</button>
      </div>

      {kategori === "cards" && <div className="bt-card" style={{ padding: 14 }}><div className="bt-cardhead" style={{ margin: 0 }}><div><div className="bt-h2" style={{ margin: 0 }}>Ekstre dönemi</div><div style={{ fontSize: 11.5, color: "var(--dim)", marginTop: 4 }}>Güncel kartları veya arşivlenmiş geçmiş ekstreleri görüntüleyin.</div></div><select className="bt-input" style={{ width: "min(240px,100%)", margin: 0 }} value={seciliEkstreAyi} onChange={(e) => { setSeciliEkstreAyi(e.target.value); setForm(null); }}><option value="guncel">{ayEtiketi(guncelEkstreAyi)} (Güncel)</option>{ekstreAylar.filter((ay) => ay !== guncelEkstreAyi).map((ay) => <option key={ay} value={ay}>{ayEtiketi(ay)}</option>)}</select></div></div>}
      {kategori === "loans" && <div className="bt-card" style={{ padding: 14 }}><div className="bt-cardhead" style={{ margin: 0 }}><div><div className="bt-h2" style={{ margin: 0 }}>Kredi ödeme dönemi</div><div style={{ fontSize: 11.5, color: "var(--dim)", marginTop: 4 }}>Güncel, gelecek 6 ay veya geçmişte ödenen taksitleri görüntüleyin.</div></div><select className="bt-input" style={{ width: "min(240px,100%)", margin: 0 }} value={seciliKrediAyi} onChange={(e) => { setSeciliKrediAyi(e.target.value); setForm(null); }}><option value="guncel">{ayEtiketi(ayAnahtari())} (Güncel)</option>{gelecekKrediAylar.map((ay) => <option key={ay} value={ay}>{ayEtiketi(ay)} (Gelecek)</option>)}{krediAylar.map((ay) => <option key={ay} value={ay}>{ayEtiketi(ay)} (Geçmiş)</option>)}</select></div></div>}

      {kategori === "kontrol" ? <EkstreKontrol veri={veri} /> : <div className="bt-card">
        <div className="bt-strip">
          <div className="bt-strip-count">{sayacHesapla()}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div className="bt-strip-total bt-mono">{fmt(toplamHesapla())}</div>
            {!acik && !saltOkunurGorunum && <button className="bt-btn kucuk ikincil" onClick={() => setForm({ liste: meta.liste, veri: {} })}><Plus size={14} /> {kategori === "cards" ? "Yeni kart ekle" : kategori === "loans" ? "Yeni kredi ekle" : kategori === "od" ? "Yeni ek hesap ekle" : "Yeni borç ekle"}</button>}
          </div>
        </div>

        {acik && (
          <div className="bt-form">
            {yeniEkstreModu && <div className="bt-ipucu" style={{ marginBottom: 14 }}><Lightbulb size={16}/><div><b>{form.veri.banka} · {form.veri.ad || "Kredi kartı"}</b> için yeni dönem ekstresi giriliyor. Mevcut ekstre geçmişe taşınacak; silinmeyecek.</div></div>}
            {ekstreDuzenleModu && <div className="bt-ipucu" style={{ marginBottom: 14 }}><Lightbulb size={16}/><div><b>{form.veri.banka} · {form.veri.ad || "Kredi kartı"}</b> güncel ekstresi düzenleniyor. Toplam ekstre ve yapılan ödemeyi girince kalan borç yeniden hesaplanır.</div></div>}
            <div className="bt-alanlar">
              {alanlar.map((a) => (
                <label key={a.k} className="bt-alan">
                  {a.e}{a.z ? " *" : ""}
                  {a.k === "banka" && kategori !== "others" ? (
                    <select className="bt-input" value={f.banka ?? ""} onChange={(e) => {
                      if (e.target.value === "__diger__") setBankaPenceresi(true);
                      else setF({ ...f, banka: e.target.value });
                    }}>
                      <option value="">Banka seçin…</option>
                      {bankalar.map((b) => <option key={b} value={b}>{b}</option>)}
                      <option value="__diger__">Diğer…</option>
                    </select>
                  ) : (
                    <input className="bt-input" type={a.t} min={a.t === "number" ? 0 : undefined}
                      step={a.k === "faiz" ? "0.01" : undefined}
                      value={f[a.k] ?? ""} onChange={(e) => setF({ ...f, [a.k]: e.target.value })} />
                  )}
                </label>
              ))}
            </div>
            {kategori === "cards" && f.yeniDonemEkstreBorcu !== "" && f.yeniDonemEkstreBorcu !== undefined && (() => {
              const h = kartHesabi(f);
              return <div className="bt-ipucu" style={{ marginTop: 14 }}><Lightbulb size={16} /><div>
                <b>Otomatik hesap:</b> Güncel dönem {fmt(h.yeni)} + devreden {fmt(h.oncekiDevreden)} = <b>{fmt(h.onceki)} toplam borç</b>. Toplam ödenen {fmt(h.odeme)} sonrası <b>{fmt(h.devreden)} kalır</b>. Tahmini aylık faiz {fmt(h.faiz)} (%{h.oran.toFixed(2)}). Yasal minimum ödeme: <b>{fmt(h.asgari)}</b> ({(+f.limit || 0) <= 50000 ? "%20" : "%40"}, kart limitine göre).
              </div></div>;
            })()}
            <div className="bt-form-butonlar">
              <button className="bt-btn birincil" onClick={gonder}><Check size={14} /> {yeniEkstreModu ? "Yeni ekstreyi kaydet" : ekstreDuzenleModu ? "Ekstreyi güncelle" : f.id ? "Güncelle" : "Kaydet"}</button>
              <button className="bt-btn ikincil" onClick={() => setForm(null)}>Vazgeç</button>
            </div>
          </div>
        )}

        {kategori === "others" && otomatikGecikenler.length > 0 && <div style={{ marginBottom: 20 }}>
          <div className="bt-h2" style={{ marginBottom: 6 }}>Devreden ve geciken borçlar</div>
          <div style={{ fontSize: 11.5, color: "var(--dim)", marginBottom: 12 }}>Asgarisi ödenen kart bakiyesi devreden borç, asgarisi karşılanmayan bakiye gecikmiş borç olarak gösterilir. Faizler yaklaşık değerdir.</div>
          <div className="bt-stack" style={{ gap: 10 }}>{otomatikGecikenler.map((g, i) => <GecikmisBorcSatiri key={g.id} g={g} i={i} />)}</div>
        </div>}

        {kayitlar.length === 0 && !acik && !(kategori === "others" && otomatikGecikenler.length > 0) ? (
          <div className="bt-bos">{arsivGorunumu ? ayEtiketi(seciliEkstreAyi) + " için arşivlenmiş ekstre yok." : krediArsivGorunumu ? ayEtiketi(seciliKrediAyi) + " için ödenmiş kredi taksiti kaydı yok." : krediGelecekGorunumu ? ayEtiketi(seciliKrediAyi) + " döneminde planlanan kredi taksiti yok." : "Henüz kayıt yok."}</div>
        ) : (
          <div className="bt-stack" style={{ gap: 12 }}>
            {kayitlar.map((k, i) => (
              <BorclarSatiri key={k.id} k={k} i={i} kategori={kategori} meta={meta} setForm={setForm} sil={sil} paid={veri.paid} arsiv={saltOkunurGorunum} />
            ))}
          </div>
        )}
      </div>}

      {bankaPenceresi && (
        <div className="bt-modal-arka" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setBankaPenceresi(false); }}>
          <form className="bt-modal" role="dialog" aria-modal="true" aria-labelledby="bt-yeni-banka-baslik" onSubmit={bankaGonder}>
            <div id="bt-yeni-banka-baslik" className="bt-h2" style={{ marginBottom: 8 }}>Yeni banka ekle</div>
            <div style={{ fontSize: 12.5, color: "var(--dim)", marginBottom: 16 }}>Banka adı bir kez kaydedilir ve bundan sonra tüm banka listelerinde görünür.</div>
            <input className="bt-input" autoFocus placeholder="Banka veya finans kurumu adı" value={yeniBanka} onChange={(e) => setYeniBanka(e.target.value)} />
            <div className="bt-form-butonlar">
              <button className="bt-btn birincil" type="submit"><Plus size={14} /> Ekle ve seç</button>
              <button className="bt-btn ikincil" type="button" onClick={() => { setBankaPenceresi(false); setYeniBanka(""); }}>Vazgeç</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function ekstreDonemi(kart) {
  const gun = Math.min(Math.max(+kart.kesimGunu || 1, 1), 31);
  const simdi = bugun();
  let bitis = new Date(simdi.getFullYear(), simdi.getMonth(), Math.min(gun, new Date(simdi.getFullYear(), simdi.getMonth() + 1, 0).getDate()));
  if (bitis > simdi) bitis = new Date(simdi.getFullYear(), simdi.getMonth() - 1, Math.min(gun, new Date(simdi.getFullYear(), simdi.getMonth(), 0).getDate()));
  const oncekiKesim = new Date(bitis.getFullYear(), bitis.getMonth() - 1, Math.min(gun, new Date(bitis.getFullYear(), bitis.getMonth(), 0).getDate()));
  const baslangic = new Date(oncekiKesim); baslangic.setDate(baslangic.getDate() + 1);
  const iso = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  return { baslangic: iso(baslangic), bitis: iso(bitis) };
}

function aktifEkstreDonemi(kart) {
  const gun = Math.min(Math.max(+kart.kesimGunu || 1, 1), 31);
  const simdi = bugun();
  const buAyKesim = new Date(simdi.getFullYear(), simdi.getMonth(), Math.min(gun, new Date(simdi.getFullYear(), simdi.getMonth() + 1, 0).getDate()));
  const sonKesim = simdi >= buAyKesim
    ? buAyKesim
    : new Date(simdi.getFullYear(), simdi.getMonth() - 1, Math.min(gun, new Date(simdi.getFullYear(), simdi.getMonth(), 0).getDate()));
  const sonrakiKesim = new Date(sonKesim.getFullYear(), sonKesim.getMonth() + 1, Math.min(gun, new Date(sonKesim.getFullYear(), sonKesim.getMonth() + 2, 0).getDate()));
  const baslangic = new Date(sonKesim); baslangic.setDate(baslangic.getDate() + 1);
  const iso = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  return { baslangic: iso(baslangic), bitis: iso(sonrakiKesim) };
}

function EkstreKontrol({ veri }) {
  const kaynaklar = useMemo(() => {
    const m = {};
    veri.expenses.forEach((h) => {
      const kaynak = h.kaynak || "Kaynak belirtilmemiş";
      if (!m[kaynak]) m[kaynak] = { toplam: 0, adet: 0 };
      m[kaynak].toplam += +h.tutar || 0; m[kaynak].adet += 1;
    });
    return Object.entries(m).sort((a, b) => b[1].toplam - a[1].toplam);
  }, [veri.expenses]);

  return <div className="bt-stack">
    <div className="bt-ipucu"><Lightbulb size={16} /><div><b>Ekstre kontrolü:</b> Bankadan gelen son ekstre ile devam eden dönemde karta yazdığınız harcamalar yan yana görünür. Yeni harcama girdikçe “Manuel kaydedilenler” otomatik artar.</div></div>
    {veri.cards.length === 0 ? <div className="bt-card"><div className="bt-bos">Kontrol için önce bir kredi kartı ekleyin.</div></div> : veri.cards.map((k, i) => {
      const donem = aktifEkstreDonemi(k); const etiket = k.banka + " · " + (k.ad || "Kredi kartı");
      const manuelHarcamalar = veri.expenses.filter((h) => h.kaynak === etiket && h.tarih >= donem.baslangic && h.tarih <= donem.bitis);
      const manuel = manuelHarcamalar.reduce((t, h) => t + (+h.tutar || 0), 0);
      const ekstreYeni = k.yeniDonemEkstreBorcu !== undefined ? (+k.yeniDonemEkstreBorcu || 0) : Math.max((+k.toplamEkstreBorcu || 0) - (+k.oncekiAydanKalan || 0), 0);
      return <div className="bt-card" key={k.id}>
        <div className="bt-cardhead"><div style={{ display: "flex", alignItems: "center", gap: 12 }}><div style={rozetStil(LIME, ROTASYONLAR[i % ROTASYONLAR.length], 36)}>{bankaKodu(k.banka)}</div><div><div className="bt-satir-ad">{etiket}</div><div className="bt-satir-meta">Dönem içi: {donem.baslangic.split("-").reverse().join(".")} – {donem.bitis.split("-").reverse().join(".")}</div></div></div><div className="bt-mono" style={{ fontWeight: 700, color: "var(--dim)" }}>{ayEtiketi(k.ekstreAyi || ayAnahtari())}</div></div>
        <div className="bt-grid" style={{ marginTop: 16 }}><div className="bt-metric"><div className="bt-metric-lbl">Gerçek ekstre</div><div className="bt-metric-amt">{fmt(ekstreYeni)}</div><div className="bt-metric-cap">Bankadan girilen son dönem borcu</div></div><div className="bt-metric"><div className="bt-metric-lbl">Manuel kaydedilenler</div><div className="bt-metric-amt">{fmt(manuel)}</div><div className="bt-metric-cap">Devam eden dönemdeki {manuelHarcamalar.length} harcama</div></div></div>
      </div>;
    })}
    {kaynaklar.length > 0 && <div className="bt-card"><div className="bt-h2"><Wallet size={16} /> Tüm harcamalar hangi kaynağa yazıldı?</div>{kaynaklar.map(([ad, x]) => <div className="bt-kat" key={ad}><div className="bt-kat-ad" style={{ width: 180 }}>{ad}</div><div className="bt-kat-bar"><div style={{ width: "100%", background: CORAL }} /></div><div className="bt-kat-tutar">{fmt(x.toplam)} <span style={{ color: "var(--faint)", fontSize: 10 }}>({x.adet})</span></div></div>)}</div>}
  </div>;
}

function BorclarSatiri({ k, i, kategori, meta, setForm, sil, paid, arsiv = false }) {
  let baslik = k.banka, ekAd = k.ad, tutar, altMeta, barGoster = false, barOran = null, barRenk = LIME, altYazi = null, tutarEtiketi = null, kartDetay = null, kod = bankaKodu(k.banka);

  if (kategori === "cards") {
    const hesap = kartHesabi(k);
    const ekstreVar = k.yeniDonemEkstreBorcu !== undefined || k.toplamEkstreBorcu !== undefined || k.oncekiDonemBorcu !== undefined || +k.borc > 0 || +k.donemIciToplam > 0;
    tutar = hesap.toplam;
    const kullanilabilirVar = +k.kullanilabilirLimit > 0;
    const kullanilan = kullanilabilirVar ? (+k.limit || 0) - (+k.kullanilabilirLimit) : tutar;
    barOran = +k.limit > 0 ? kullanilan / +k.limit : null;
    const gecikmeTarihi = kartGecikmeTarihi(k);
    const gecikenGun = arsiv ? 0 : Math.max(-kalanGun(gecikmeTarihi), 0);
    const asgariOran = (+k.limit || 0) <= 50000 ? .20 : .40;
    const asgariTamam = hesap.odeme >= hesap.onceki * asgariOran;
    const donem = arsiv ? k.ekstreAyi : (k.ekstreAyi || ayAnahtari());
    const odendi = !!paid?.["kart-" + k.id + "-" + donem] || (ekstreVar && hesap.toplam <= 0);
    const borcKapandi = ekstreVar && hesap.toplam <= 0;
    const durum = borcKapandi ? "Ödendi" : hesap.odeme > 0 || odendi ? "Kısmi ödendi · kalan borç var" : "Ödenmemiş";
    const gecikmis = ekstreVar && gecikenGun > 0 && !asgariTamam && !odendi;
    barRenk = gecikmis ? CORAL : LIME;
    barGoster = barOran !== null;
    altMeta = !ekstreVar ? "Henüz ekstre girilmedi · kesim ayın " + k.kesimGunu + ". günü · son ödeme ayın " + k.sonOdemeGunu + ". günü" : k.toplamEkstreBorcu !== undefined || k.oncekiDonemBorcu !== undefined
      ? "Ekstre " + fmt(hesap.onceki) + " · ödendi " + fmt(hesap.odeme) + " · kalan " + fmt(hesap.devreden) + (arsiv ? " · " + ayEtiketi(k.ekstreAyi) : " · son ödeme " + gecikmeTarihi.toLocaleDateString("tr-TR"))
      : "Son ödeme: " + gecikmeTarihi.toLocaleDateString("tr-TR");
    if (gecikmis) {
      const gecikmeOrani = tcmbKartAzamiGecikmeFaizi(hesap.onceki || hesap.toplam);
      const birikenFaiz = gunlukBirikmisFaiz(hesap.toplam, gecikmeOrani, gecikenGun);
      altYazi = gecikenGun + " gün gecikti · tahmini biriken faiz " + fmt(birikenFaiz);
    }
    tutarEtiketi = ekstreVar ? "Kalan borç · " + durum : "Ekstre bekleniyor";
    kartDetay = ekstreVar ? { donem, guncel: hesap.yeni, devreden: hesap.oncekiDevreden || 0, ekstre: hesap.onceki, odeme: hesap.odeme, kalan: hesap.toplam, odemeBilgisiYok: k.yeniDonemEkstreBorcu === undefined && k.toplamEkstreBorcu === undefined && k.oncekiDonemBorcu === undefined, durum } : null;
  } else if (kategori === "loans") {
    tutar = arsiv ? (+k.taksit || 0) : (+k.kalanBorc || 0);
    altMeta = k._gelecek ? ayEtiketi(k._donem) + " · planlanan taksit · ayın " + k.odemeGunu + ". günü" + (k._kalanTaksitProj !== null ? " · ödeme sonrası " + k._kalanTaksitProj + " taksit kalacak" : "") : arsiv ? ayEtiketi(k._donem) + " · taksit ödendi" + (+k.kalanBorc > 0 ? " · kayıt anındaki kalan borç " + fmt(k.kalanBorc) : "") : "Taksit " + fmt(k.taksit) + " · her ayın " + k.odemeGunu + ". günü" + (+k.kalanTaksit > 0 ? " · " + k.kalanTaksit + " taksit kaldı" : "");
  } else if (kategori === "od") {
    tutar = +k.kullanilan || 0;
    altMeta = +k.limit > 0 ? "Limit " + fmt(k.limit) : "Limit girilmedi";
  } else {
    tutar = +k.tutar || 0;
    altMeta = k.ad || "—";
  }

  return (
    <div className="bt-satir">
      <div style={rozetStil(meta.rozetBg, ROTASYONLAR[i % ROTASYONLAR.length])}>{kod}</div>
      <div style={{ flex: 1, minWidth: 150 }}>
        <div className="bt-satir-ad">{baslik}{ekAd && kategori !== "others" ? <span style={{ color: "var(--dim)", fontWeight: 500 }}> · {ekAd}</span> : null}</div>
        <div className="bt-satir-meta">{altMeta}</div>
        {!arsiv && kategori === "cards" && (k.ekstreGecmisi || []).length > 0 && <div className="bt-satir-meta" style={{ marginTop: 3 }}>{k.ekstreGecmisi.length} eski ekstre arşivlendi</div>}
        {barGoster && (
          <div className="bt-bar"><div style={{ width: Math.min(barOran * 100, 100) + "%", background: barRenk }} /></div>
        )}
        {kartDetay && <EkstreSatirDetayi detay={kartDetay} />}
      </div>
      <div style={{ textAlign: "right" }}>
        <div className="bt-satir-tutar">{fmt(tutar)}</div>
        {tutarEtiketi && <div className="bt-satirD-tur" style={{ fontWeight: 800, color: tutar > 0 ? CORAL : "#5D7A2E" }}>{tutarEtiketi}</div>}
        {altYazi && <div className="bt-satir-alt">{altYazi}</div>}
      </div>
      {!arsiv && <div style={{ display: "flex", gap: 2 }}>
        {kategori === "cards" && <button className="bt-btn kucuk ikincil" title="Yeni dönem ekstresi gir" onClick={() => setForm({ liste: "cards", veri: k, yeniEkstre: true })}><Plus size={13} /> Yeni ekstre</button>}
        {kategori === "cards" && <button className="bt-btn kucuk ikincil" title="Güncel ekstreyi düzenle" onClick={() => setForm({ liste: "cards", veri: k, ekstreDuzenle: true })}><Pencil size={13} /> Ekstreyi düzenle</button>}
        <button className="bt-btn hayalet" onClick={() => setForm({ liste: meta.liste, veri: k })}><Pencil size={15} /></button>
        <button className="bt-btn hayalet tehlike" onClick={() => sil(meta.liste, k.id)}><Trash2 size={15} /></button>
      </div>}
    </div>
  );
}

function EkstreSatirDetayi({ detay }) {
  return <details style={{ marginTop: 10 }}><summary style={{ cursor: "pointer", color: CORAL, fontSize: 11.5, fontWeight: 800 }}>{ayEtiketi(detay.donem)} ekstresini görüntüle</summary><div className="bt-grid" style={{ marginTop: 10, gap: 8 }}>
    <div className="bt-metric" style={{ padding: 11 }}><div className="bt-metric-lbl">Güncel dönem borcu</div><div className="bt-mono" style={{ fontWeight: 800 }}>{fmt(detay.guncel)}</div></div>
    <div className="bt-metric" style={{ padding: 11 }}><div className="bt-metric-lbl">Geçen aydan devreden</div><div className="bt-mono" style={{ fontWeight: 800 }}>{fmt(detay.devreden)}</div></div>
    <div className="bt-metric" style={{ padding: 11 }}><div className="bt-metric-lbl">Toplam borç</div><div className="bt-mono" style={{ fontWeight: 800 }}>{fmt(detay.ekstre)}</div></div>
    <div className="bt-metric" style={{ padding: 11 }}><div className="bt-metric-lbl">Toplam ödenen</div><div className="bt-mono" style={{ fontWeight: 800 }}>{detay.odemeBilgisiYok ? "Bilgi yok" : fmt(detay.odeme)}</div></div>
    <div className="bt-metric" style={{ padding: 11 }}><div className="bt-metric-lbl">Kalan borç</div><div className="bt-mono" style={{ fontWeight: 800 }}>{fmt(detay.kalan)}</div></div>
    <div style={{ gridColumn: "1/-1", fontSize: 11.5, fontWeight: 800, color: detay.durum === "Ödendi" ? "#5D7A2E" : CORAL }}>Durum: {detay.durum}</div>
  </div></details>;
}

function GecikmisBorcSatiri({ g, i }) {
  return <div className="bt-satir" style={{ borderColor: CORAL }}>
    <div style={rozetStil(CORAL, ROTASYONLAR[i % ROTASYONLAR.length])}>{bankaKodu(g.banka)}</div>
    <div style={{ flex: 1, minWidth: 150 }}><div className="bt-satir-ad">{g.banka} <span style={{ color: "var(--dim)", fontWeight: 500 }}>· {g.ad}</span></div><div className="bt-satir-meta">{g.tur} · son ödeme {g.tarih.toLocaleDateString("tr-TR")} · aylık %{g.oran.toFixed(2)}</div></div>
    <div style={{ textAlign: "right" }}><div className="bt-satir-tutar">{fmt(g.bakiye)}</div><div className="bt-satirD-tur" style={{ fontWeight: 800 }}>Kalan borç</div><div className="bt-satir-alt">{g.durum === "devreden" ? "Asgari ödendi · tahmini aylık akdi faiz " + fmt(g.faiz) : g.gun + " gün gecikti · biriken tahmini gecikme faizi " + fmt(g.faiz)}</div></div>
  </div>;
}

/* ---------------- Borç Planı ---------------- */
function Plan({ kalemler, aylikFaiz, setSekme }) {
  const [strateji, setStrateji] = useState("cig");
  const [ekstra, setEkstra] = useState("");

  const doner = kalemler.filter((k) => !k.sabitTaksit);
  const sabit = kalemler.filter((k) => k.sabitTaksit);

  const kartFaiz = doner.filter((k) => k.tur === "kart").reduce((t, k) => t + k.faizTutari, 0);
  const ekFaiz = doner.filter((k) => k.tur === "ek").reduce((t, k) => t + k.faizTutari, 0);
  const digerFaiz = doner.filter((k) => k.tur === "diger").reduce((t, k) => t + k.faizTutari, 0);
  const gecikmisler = doner.filter((k) => k.gecikmis);
  const gecikmisFaiz = gecikmisler.reduce((t, k) => t + k.faizTutari, 0);

  const sirali = useMemo(() => {
    const d = [...doner];
    if (strateji === "cig") d.sort((a, b) => b.faiz - a.faiz || b.bakiye - a.bakiye);
    else d.sort((a, b) => a.bakiye - b.bakiye);
    return d;
  }, [doner, strateji]);

  const hedef = sirali[0];
  const ekstraTutar = +ekstra || 0;
  const kurtarilan = hedef ? (Math.min(ekstraTutar, hedef.bakiye) * hedef.faiz) / 100 : 0;

  if (kalemler.length === 0)
    return (
      <div className="bt-card" style={{ textAlign: "center" }}>
        <div className="bt-bos">
          Plan oluşturmak için önce <button className="bt-link" onClick={() => setSekme("borclar")}>Borçlar sekmesinden</button> borçlarınızı ekleyin.
        </div>
      </div>
    );

  return (
    <div className="bt-stack">
      <div className="bt-hero">
        <span className="deko-daire" /><span className="deko-kare" />
        <div className="bt-hero-label">Bu ay işleyen tahmini toplam faiz</div>
        <div className="bt-hero-tutar">{fmt0(aylikFaiz)}</div>
        <div className="bt-hero-delta" style={{ background: "#ffffff14", color: "#c8c9be" }}>Yılda karşılığı ≈ {fmt0(aylikFaiz * 12)}</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", position: "relative", zIndex: 1, marginTop: 6 }}>
          {kartFaiz > 0 && <div className="bt-chip"><span className="dot" style={{ background: LIME }} /><span className="lbl">Kredi kartları</span><span className="amt">{fmt0(kartFaiz)}</span></div>}
          {ekFaiz > 0 && <div className="bt-chip"><span className="dot" style={{ background: CORAL }} /><span className="lbl">Ek hesap / KMH</span><span className="amt">{fmt0(ekFaiz)}</span></div>}
          {digerFaiz > 0 && <div className="bt-chip"><span className="dot" style={{ background: "#55584c" }} /><span className="lbl">Gecikmiş / diğer</span><span className="amt">{fmt0(digerFaiz)}</span></div>}
        </div>
        {gecikmisler.length > 0 && (
          <div style={{ marginTop: 16, fontSize: 12.5, color: CORAL, fontWeight: 600 }}>
            {gecikmisler.length} kart vadesi geçmiş, bunlardan ayda {fmt0(gecikmisFaiz)} gecikme faizi işliyor
          </div>
        )}
      </div>

      <div className="bt-ipucu">
        <Lightbulb size={16} />
        <div>
          <b>Çığ yöntemi</b> önce en yüksek faizli borcu kapatır — en az faiz ödersiniz. <b>Kartopu yöntemi</b> önce en küçük borcu kapatır — hızlı kapanan borçlar motivasyon verir.
          Diğer borçların asgarisini aksatmadan, artan her kuruşu sıradaki tek hedefe yığın.
        </div>
      </div>

      <div className="bt-card">
        <div className="bt-cardhead">
          <div className="bt-h2" style={{ margin: 0 }}><Target size={16} /> Kapatma sıranız</div>
          <div className="bt-secici">
            <button className={strateji === "cig" ? "aktif" : ""} onClick={() => setStrateji("cig")}><Flame size={14} color={CORAL} /> Çığ</button>
            <button className={strateji === "kartopu" ? "aktif" : ""} onClick={() => setStrateji("kartopu")}><Snowflake size={14} /> Kartopu</button>
          </div>
        </div>

        {doner.length === 0 ? (
          <div className="bt-bos">Faiz işleyen (kart / KMH) borcunuz yok.</div>
        ) : (
          <div className="bt-stack" style={{ gap: 12, marginTop: 22 }}>
            {sirali.map((k, i) => {
              const karisikFaiz = k.gecikmis && k.yeniHarcama > 0 && k.faizTahmini;
              return (
                <div key={k.id} className="bt-satir" style={i === 0 ? { borderColor: LIME, background: "#cdf56414" } : {}}>
                  <div style={{ width: 26, height: 26, borderRadius: 999, background: i === 0 ? LIME : "var(--panel2)", border: "2px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }} className="bt-mono">{i + 1}</div>
                  <div style={rozetStil(k.tur === "diger" ? "#d8c9a0" : k.tur === "ek" ? CORAL : LIME, ROTASYONLAR[i % ROTASYONLAR.length], 36)}>{bankaKodu(k.banka)}</div>
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div className="bt-satir-ad">{k.ad} {i === 0 && <span style={{ color: "#5D7A2E", fontWeight: 700 }}>← önce bunu kapatın</span>}</div>
                    <div className="bt-satir-meta">
                      {karisikFaiz
                        ? "Eski bakiyeye gecikme faizi, eklediğiniz " + fmt0(k.yeniHarcama) + " yeni harcamaya akdi faiz uygulanıyor"
                        : "Aylık %" + k.faiz.toFixed(2) + (k.faizTahmini ? (k.gecikmis ? " (TCMB yasal azami GECİKME oranı)" : " (TCMB yasal azami oranı)") : "") + " · ayda ≈ " + fmt0(k.faizTutari) + " faiz"}
                    </div>
                  </div>
                  <div className="bt-satir-tutar">{fmt(k.bakiye)}</div>
                </div>
              );
            })}
          </div>
        )}

        {sabit.length > 0 && (
          <>
            <div style={{ fontSize: 12, color: "var(--faint)", margin: "18px 0 10px" }}>Sıralamanın dışındakiler (sabit taksitli krediler / faiz girilmemiş borçlar):</div>
            <div className="bt-stack" style={{ gap: 10 }}>
              {sabit.map((k, i) => (
                <div key={k.id} className="bt-satir" style={{ opacity: .75 }}>
                  <div style={rozetStil("#c8c9be", ROTASYONLAR[i % ROTASYONLAR.length], 36)}>{bankaKodu(k.banka)}</div>
                  <div style={{ flex: 1 }} className="bt-satir-ad">{k.ad}</div>
                  <div className="bt-satir-tutar">{fmt(k.bakiye)}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {hedef && (
        <div className="bt-card">
          <div className="bt-h2">Ekstra ödeme simülasyonu</div>
          <label className="bt-alan" style={{ maxWidth: 240 }}>
            Elinize geçen ekstra tutar (₺)
            <input className="bt-input" type="number" min={0} placeholder="örn. 5000" value={ekstra} onChange={(e) => setEkstra(e.target.value)} />
          </label>
          {ekstraTutar > 0 && (
            <div className="bt-ipucu" style={{ marginTop: 16 }}>
              <Target size={16} />
              <div>
                Bu parayı <b>{hedef.ad}</b> borcuna yatırın → her ay yaklaşık <b>{fmt0(kurtarilan)}</b> faiz ödemekten kurtulursunuz
                {ekstraTutar >= hedef.bakiye && <> ve bu borç <b>tamamen kapanır</b></>}.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------- Gelirler ---------------- */
function Gelirler({ veri, form, setForm, ekleGuncelle, sil, buAyGelir }) {
  const acik = form && form.liste === "incomes";
  const [f, setF] = useState({});
  useEffect(() => { if (acik) setF(form.veri || {}); }, [acik, form]);
  const kaynaklar = Object.entries(buAyGelir.kaynaklar).sort((a, b) => b[1] - a[1]);
  const enBuyuk = Math.max(...Object.values(buAyGelir.kaynaklar), 1);

  const alanlar = [
    { k: "ad", e: "Kaynak adı (Maaş, Kira geliri…)", t: "text", z: true },
    { k: "tutar", e: "Tutar (₺)", t: "number", z: true },
    { k: "tekrar", e: "Tekrar", t: "select", options: ["Her ay", "Tek seferlik"] },
    { k: "tarih", e: "Tarih (sadece tek seferlikse)", t: "date" },
  ];
  function gonder() {
    for (const a of alanlar) if (a.z && !String(f[a.k] ?? "").trim()) return;
    ekleGuncelle("incomes", { id: f.id || uid(), ...f });
  }

  return (
    <div className="bt-stack">
      <div className="bt-card">
        <div className="bt-cardhead">
          <div className="bt-h2" style={{ margin: 0 }}><TrendingUp size={16} /> Gelir kaynakları</div>
          {!acik && <button className="bt-btn kucuk ikincil" onClick={() => setForm({ liste: "incomes", veri: {} })}><Plus size={14} /> Ekle</button>}
        </div>
        <div style={{ fontSize: 12.5, color: "var(--dim)", marginBottom: 16 }}>
          Maaş, ek iş, kira geliri gibi tüm gelir kaynaklarınızı ekleyin. Düzenli olanlar her ay otomatik sayılır; tek seferlik olanlar yalnızca o ay için sayılır.
        </div>
        {acik && (
          <div className="bt-form">
            <div className="bt-alanlar">
              {alanlar.map((a) => (
                <label key={a.k} className="bt-alan">
                  {a.e}{a.z ? " *" : ""}
                  {a.t === "select" ? (
                    <select className="bt-input" value={f[a.k] ?? a.options[0]} onChange={(e) => setF({ ...f, [a.k]: e.target.value })}>
                      {a.options.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input className="bt-input" type={a.t} min={a.t === "number" ? 0 : undefined} value={f[a.k] ?? ""} onChange={(e) => setF({ ...f, [a.k]: e.target.value })} />
                  )}
                </label>
              ))}
            </div>
            <div className="bt-form-butonlar">
              <button className="bt-btn birincil" onClick={gonder}><Check size={14} /> {f.id ? "Güncelle" : "Kaydet"}</button>
              <button className="bt-btn ikincil" onClick={() => setForm(null)}>Vazgeç</button>
            </div>
          </div>
        )}
        {(veri.incomes || []).length === 0 && !acik ? (
          <div className="bt-bos">Henüz kayıt yok.</div>
        ) : (
          <div className="bt-stack" style={{ gap: 12 }}>
            {(veri.incomes || []).map((g, i) => (
              <div key={g.id} className="bt-satir">
                <div style={rozetStil(LIME, ROTASYONLAR[i % ROTASYONLAR.length])}><TrendingUp size={16} color={INK} /></div>
                <div style={{ flex: 1, minWidth: 150 }}>
                  <div className="bt-satir-ad">{g.ad}</div>
                  <div className="bt-satir-meta">{g.tekrar === "Tek seferlik" ? "Tek seferlik" + (g.tarih ? " · " + g.tarih.split("-").reverse().join(".") : "") : "Her ay tekrarlanıyor"}</div>
                </div>
                <div className="bt-satir-tutar">{fmt(g.tutar)}</div>
                <div style={{ display: "flex", gap: 2 }}>
                  <button className="bt-btn hayalet" onClick={() => setForm({ liste: "incomes", veri: g })}><Pencil size={15} /></button>
                  <button className="bt-btn hayalet tehlike" onClick={() => sil("incomes", g.id)}><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {kaynaklar.length > 0 && (
        <div className="bt-card">
          <div className="bt-h2"><PieChart size={16} /> Bu ay gelir dağılımı</div>
          {kaynaklar.map(([ad, tutar]) => (
            <div key={ad} className="bt-kat">
              <div className="bt-kat-ad" style={{ width: 130 }}>{ad}</div>
              <div className="bt-kat-bar"><div style={{ width: (tutar / enBuyuk) * 100 + "%", background: LIME }} /></div>
              <div className="bt-kat-tutar">{fmt(tutar)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Harcamalar ---------------- */
function Harcamalar({ veri, form, setForm, harcamaKaydet, sil, buAyHarcama, bankalar }) {
  const acik = form && form.liste === "expenses";
  const [f, setF] = useState({});
  useEffect(() => {
    if (acik) {
      setF(form.veri.id ? form.veri : { tarih: new Date().toISOString().slice(0, 10), kategori: "Market", ...form.veri });
    }
  }, [acik, form]);

  const sirali = useMemo(() => [...veri.expenses].sort((a, b) => (b.tarih || "").localeCompare(a.tarih || "")), [veri.expenses]);
  const enBuyuk = Math.max(...Object.values(buAyHarcama.kategoriler), 1);

  function gonder() {
    if (!f.tutar || !f.tarih) return;
    harcamaKaydet({ id: f.id || uid(), ...f, tutar: +f.tutar }, false);
  }

  return (
    <div className="bt-stack">
      <div className="bt-card">
        <div className="bt-cardhead">
          <div className="bt-h2" style={{ margin: 0 }}><Wallet size={16} /> Harcamalar</div>
          {!acik && <button className="bt-btn kucuk birincil" onClick={() => setForm({ liste: "expenses", veri: {} })}><Plus size={14} /> Yeni harcama</button>}
        </div>
        {acik && (
          <div className="bt-form">
            <div className="bt-alanlar">
              <label className="bt-alan">Tutar (₺) *<input className="bt-input" type="number" min={0} value={f.tutar ?? ""} onChange={(e) => setF({ ...f, tutar: e.target.value })} /></label>
              <label className="bt-alan">Tarih *<input className="bt-input" type="date" value={f.tarih ?? ""} onChange={(e) => setF({ ...f, tarih: e.target.value })} /></label>
              <label className="bt-alan">Ödeme kaynağı
                <select className="bt-input" value={f.kaynak ?? ""} onChange={(e) => setF({ ...f, kaynak: e.target.value })}>
                  <option value="">Seçin…</option>
                  <option value="Nakit">Nakit</option>
                  <optgroup label="Kredi kartları">
                    {veri.cards.length > 0 ? veri.cards.map((k) => { const ad = k.banka + " · " + (k.ad || "Kredi kartı"); return <option key={k.id} value={ad}>{ad}</option>; }) : <option disabled>Henüz kart yok</option>}
                  </optgroup>
                  <optgroup label="Banka hesabı">
                    {bankalar.map((b) => <option key={b} value={b + " · Hesap"}>{b} · Hesap</option>)}
                  </optgroup>
                </select>
              </label>
              <label className="bt-alan">Kategori
                <select className="bt-input" value={f.kategori ?? "Market"} onChange={(e) => setF({ ...f, kategori: e.target.value })}>
                  {KATEGORILER.map((k) => <option key={k}>{k}</option>)}
                </select>
              </label>
              <label className="bt-alan">Açıklama<input className="bt-input" type="text" placeholder="ör. haftalık market" value={f.aciklama ?? ""} onChange={(e) => setF({ ...f, aciklama: e.target.value })} /></label>
            </div>
            <div className="bt-form-butonlar">
              <button className="bt-btn birincil" onClick={gonder}><Check size={14} /> {f.id ? "Güncelle" : "Kaydet"}</button>
              <button className="bt-btn ikincil" onClick={() => setForm(null)}>Vazgeç</button>
            </div>
          </div>
        )}
        {!acik && sirali.length === 0 && <div className="bt-bos">Henüz harcama kaydı yok.</div>}
      </div>

      {Object.keys(buAyHarcama.kategoriler).length > 0 && (
        <div className="bt-card">
          <div className="bt-cardhead"><div className="bt-h2" style={{ margin: 0 }}><PieChart size={16} /> Bu ay kategori dağılımı</div><div className="bt-mono" style={{ fontSize: 13 }}>{fmt(buAyHarcama.toplam)}</div></div>
          {Object.entries(buAyHarcama.kategoriler).sort((a, b) => b[1] - a[1]).map(([kat, tutar]) => (
            <div key={kat} className="bt-kat">
              <div className="bt-kat-ad">{kat}</div>
              <div className="bt-kat-bar"><div style={{ width: (tutar / enBuyuk) * 100 + "%", background: LIME }} /></div>
              <div className="bt-kat-tutar">{fmt(tutar)}</div>
            </div>
          ))}
        </div>
      )}

      {Object.keys(buAyHarcama.kaynaklar).length > 0 && (
        <div className="bt-card">
          <div className="bt-h2"><Wallet size={16} /> Bu ay hangi bankadan ne kadar harcadınız</div>
          {Object.entries(buAyHarcama.kaynaklar).sort((a, b) => b[1] - a[1]).map(([kaynak, tutar]) => {
            const eb = Math.max(...Object.values(buAyHarcama.kaynaklar), 1);
            return (
              <div key={kaynak} className="bt-kat">
                <div className="bt-kat-ad" style={{ width: 150 }}>{kaynak}</div>
                <div className="bt-kat-bar"><div style={{ width: (tutar / eb) * 100 + "%", background: CORAL }} /></div>
                <div className="bt-kat-tutar">{fmt(tutar)}</div>
              </div>
            );
          })}
        </div>
      )}

      {sirali.length > 0 && (
        <div className="bt-card">
          <div className="bt-h2">Son harcamalar</div>
          <div className="bt-stack" style={{ gap: 10 }}>
            {sirali.slice(0, 50).map((h) => (
              <div key={h.id} className="bt-satir">
                <div style={{ flex: 1, minWidth: 150 }}>
                  <div className="bt-satir-ad">{h.kategori}{h.aciklama && <span style={{ color: "var(--dim)", fontWeight: 500 }}> · {h.aciklama}</span>}</div>
                  <div className="bt-satir-meta">{h.tarih && h.tarih.split("-").reverse().join(".")}{h.kaynak && <> · {h.kaynak}</>}</div>
                </div>
                <div className="bt-satir-tutar">{fmt(h.tutar)}</div>
                <div style={{ display: "flex", gap: 2 }}>
                  <button className="bt-btn hayalet" onClick={() => setForm({ liste: "expenses", veri: h })}><Pencil size={15} /></button>
                  <button className="bt-btn hayalet tehlike" onClick={() => sil("expenses", h.id)}><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
