import React, { useState, useEffect, useMemo, useRef } from "react";
import { demoModu, supabase } from "./supabaseClient.js";
import {
  revenueCatHazir,
  revenueCatProKontrol,
  revenueCatProPaketleri,
  revenueCatProSatinAl,
} from "./revenuecat.js";
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  RotateCcw,
  Target,
  Flame,
  Snowflake,
  PieChart,
  TrendingUp,
  Wallet,
  Lightbulb,
  CalendarCheck,
  ReceiptText,
  Eye,
  EyeOff,
  Minus,
  MessageCircle,
  Send,
  KeyRound,
  AtSign,
  Palette,
  LogOut,
  Bell,
  Building2,
  Database,
  Settings,
  PiggyBank,
  RefreshCw,
  BarChart3,
  AlertTriangle,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  ArrowLeftRight,
  SlidersHorizontal,
} from "lucide-react";

/* ---------------- Sabit tasarım tokenları ---------------- */
const INK = "#14160f";
const CREAM = "#f4efe0";
const LIME = "#cdf564";
const CORAL = "#ff6f59";
const ROTASYONLAR = [-1.2, 1, -0.6, 1.4, -1];
const ACIK_TEMA = {
  bg: CREAM,
  panel: "#ffffff",
  panel2: "#f6f3e8",
  text: INK,
  dim: "#55584c",
  faint: "#8a8c7e",
  line: INK,
};
const KOYU_TEMA = {
  bg: "#0f110a",
  panel: "#191c12",
  panel2: "#22261a",
  text: CREAM,
  dim: "#b5b2a0",
  faint: "#8a8c7e",
  line: "#e8e4d2",
};

const BANKA_KOD = {
  VakıfBank: "VB",
  Halkbank: "HB",
  Enpara: "EP",
  "Garanti BBVA": "GB",
  QNB: "QNB",
  Akbank: "AKB",
  "İş Bankası": "İŞ",
  "Yapı Kredi": "YK",
  "Kuveyt Türk": "KT",
  Fibabanka: "FB",
};
function bankaKodu(banka) {
  const b = (banka || "").trim();
  if (BANKA_KOD[b]) return BANKA_KOD[b];
  return b.slice(0, 3).toUpperCase() || "??";
}
function rozetStil(bg, rot, boyut = 42) {
  return {
    flex: "0 0 auto",
    width: boyut,
    height: boyut,
    borderRadius: 10,
    background: bg,
    border: "2px solid " + INK,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'JetBrains Mono',monospace",
    fontSize: 11,
    fontWeight: 700,
    color: INK,
    transform: "rotate(" + rot + "deg)",
  };
}
function baslikGolgesiStil(isDark, fontSize) {
  return isDark
    ? {
        margin: 0,
        fontFamily: "'Archivo Black',sans-serif",
        fontSize,
        lineHeight: 1.05,
        color: LIME,
        textShadow: "3px 3px 0 " + CORAL,
      }
    : {
        margin: 0,
        fontFamily: "'Archivo Black',sans-serif",
        fontSize,
        lineHeight: 1.05,
        color: INK,
        textShadow: "3px 3px 0 " + LIME + ", 5px 5px 0 " + CORAL,
      };
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
.bt-demo-plan{display:inline-flex;align-items:center;gap:4px;padding:4px;border:1.5px dashed var(--line);border-radius:999px;background:var(--panel2)}
.bt-demo-plan>span{padding:0 6px;font:700 9px 'JetBrains Mono',monospace;letter-spacing:.04em;text-transform:uppercase;color:var(--dim)}
.bt-demo-plan button{border:0;border-radius:999px;background:transparent;color:var(--dim);padding:5px 9px;font:700 10.5px 'Space Grotesk',sans-serif;cursor:pointer}
.bt-demo-plan button.aktif{background:${LIME};color:${INK};box-shadow:inset 0 0 0 1.5px ${INK}}
.bt-date{font-family:'JetBrains Mono',monospace;font-size:13px;color:var(--dim)}
.bt-settings-link{display:inline-flex;align-items:center;gap:6px;border:1.5px solid var(--line);border-radius:999px;background:var(--panel);color:var(--text);padding:7px 11px;font:700 11.5px 'Space Grotesk',sans-serif;cursor:pointer}.bt-settings-link:hover,.bt-settings-link.aktif{background:${LIME};color:${INK};border-color:${INK}}
.bt-upgrade-link{display:inline-flex;align-items:center;gap:6px;border:1.5px solid ${INK};border-radius:999px;background:${LIME};color:${INK};padding:7px 11px;font:800 11.5px 'Space Grotesk',sans-serif;box-shadow:3px 3px 0 ${CORAL};cursor:pointer}.bt-upgrade-link:hover{transform:translateY(-1px)}
.bt-themebtn{position:relative;width:54px;height:30px;border-radius:16px;border:2px solid var(--line);background:var(--panel);cursor:pointer;padding:0;flex:0 0 auto}
.bt-themeknob{position:absolute;top:2px;width:22px;height:22px;border-radius:50%;background:${LIME};border:2px solid ${INK};transition:left .18s ease}
.bt-themelabel{font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--dim);width:34px}
.bt-exit{background:none;border:none;padding:0;font:inherit;font-size:14px;font-weight:600;color:var(--text);text-decoration:underline;cursor:pointer;display:flex;align-items:center;gap:4px}
.bt-exit:hover{color:${CORAL}}

.bt-nav{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:36px}
.bt-nav-ana{align-items:center}.bt-nav-ana .bt-pill{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:44px}.bt-nav-ana .bt-pill svg{width:18px;height:18px;flex:0 0 auto}.bt-nav-ana .bt-pill span{display:block;line-height:1}.bt-nav-alt{display:flex;gap:7px;flex-wrap:wrap;margin:-22px 0 28px;padding:7px;background:var(--panel2);border:1.5px solid var(--line);border-radius:16px}.bt-nav-alt .bt-pill{padding:7px 13px;font-size:12px;border-width:1.5px}
.bt-pill{padding:10px 18px;border-radius:999px;font-size:14px;font-weight:700;white-space:nowrap;cursor:pointer;font-family:'Space Grotesk',sans-serif;border:2px solid transparent;background:none}
.bt-pill:focus-visible{outline:3px solid ${CORAL};outline-offset:2px}
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
.bt-chip.secilebilir{font-family:'Space Grotesk',sans-serif;cursor:pointer;color:inherit;transition:opacity .15s,transform .15s}
.bt-chip.secilebilir:hover{transform:translateY(-1px)}
.bt-chip.haric{opacity:.45;border-style:dashed}
.bt-chip.haric .lbl,.bt-chip.haric .amt{text-decoration:line-through}

.bt-metric{background:var(--panel);border:2px solid var(--line);border-radius:16px;padding:22px}
.bt-metric-lbl{font-size:12.5px;font-weight:600;color:var(--dim);margin-bottom:10px}
.bt-metric-amt{font-family:'Archivo Black',sans-serif;font-size:clamp(20px,4vw,26px);color:var(--text);overflow-wrap:anywhere}
.bt-metric-cap{font-size:12px;color:var(--faint);margin-top:8px}

.bt-risk{background:${CORAL};border:2px solid ${INK};border-radius:20px;padding:clamp(18px,4vw,26px) clamp(20px,4.5vw,30px);margin-bottom:36px;transform:rotate(-.4deg)}
.bt-risk-inner{display:flex;align-items:baseline;gap:18px;flex-wrap:wrap}
.bt-risk-pct{font-family:'Archivo Black',sans-serif;font-size:36px;color:${INK}}
.bt-risk-txt{font-size:14px;color:${INK};font-weight:500;max-width:560px;line-height:1.5}
.bt-risk-txt a{color:${INK}}

.bt-oneriler{background:${INK};color:${CREAM};border:2px solid var(--line);border-radius:26px;padding:clamp(20px,4vw,32px);box-shadow:8px 8px 0 ${LIME};margin:4px 8px 34px 0;overflow:hidden}
.bt-oneriler-head{display:flex;align-items:flex-end;justify-content:space-between;gap:22px;margin-bottom:24px;flex-wrap:wrap}
.bt-oneriler-kicker{display:flex;align-items:center;gap:7px;color:${LIME};font:700 10.5px 'JetBrains Mono',monospace;letter-spacing:.07em;text-transform:uppercase;margin-bottom:8px}
.bt-oneriler h2{margin:0;font-family:'Archivo Black',sans-serif;font-size:clamp(25px,4vw,34px);color:${CREAM};line-height:1.05}
.bt-oneriler-head p{margin:8px 0 0;color:#bfc1b4;font-size:12.5px;line-height:1.5;max-width:520px}
.bt-oneri-mod{display:flex;gap:5px;padding:4px;background:#24271e;border:1.5px solid #55584c;border-radius:16px}
.bt-oneri-mod button{display:flex;align-items:center;gap:8px;border:0;border-radius:12px;background:transparent;color:#bfc1b4;padding:8px 11px;text-align:left;font:700 11px 'Space Grotesk',sans-serif;cursor:pointer}.bt-oneri-mod button svg{flex:0 0 auto}.bt-oneri-mod button span{display:grid;gap:1px}.bt-oneri-mod button b{font-size:10.5px}.bt-oneri-mod button small{font-size:8.5px;font-weight:500;opacity:.72}
.bt-oneri-mod button.aktif{background:${LIME};color:${INK};box-shadow:2px 2px 0 ${CORAL}}
.bt-oneri-sahne{position:relative;display:grid;grid-template-columns:minmax(0,1fr) 190px;gap:24px;align-items:center;min-height:330px;padding:clamp(22px,5vw,40px);background:${CREAM};color:${INK};border:2px solid ${INK};border-radius:22px;box-shadow:7px 7px 0 ${CORAL};overflow:hidden}.bt-oneri-sahne.acil{background:${CORAL}}.bt-oneri-sahne.firsat{background:${LIME}}.bt-oneri-sahne.dikkat{background:#ffcf6e}
.bt-oneri-deko{position:absolute;border:2px solid ${INK};pointer-events:none}.bt-oneri-deko.bir{width:95px;height:95px;border-radius:50%;background:${CORAL};right:135px;top:-46px}.bt-oneri-sahne.acil .bt-oneri-deko.bir{background:${LIME}}.bt-oneri-deko.iki{width:56px;height:56px;border-radius:14px;background:${LIME};left:-27px;bottom:28px;transform:rotate(22deg)}.bt-oneri-sahne.firsat .bt-oneri-deko.iki{background:${CORAL}}
.bt-oneri-sahne-icerik{position:relative;z-index:1;min-width:0}.bt-oneri-sahne-ust{display:flex;align-items:center;gap:10px;justify-content:space-between;flex-wrap:wrap;margin-bottom:30px}.bt-oneri-canli{display:flex;align-items:center;gap:7px;font:800 9.5px 'JetBrains Mono',monospace;letter-spacing:.08em;text-transform:uppercase}.bt-oneri-canli i{width:8px;height:8px;border-radius:50%;background:${INK};box-shadow:0 0 0 5px #14160f18;animation:btNabiz 1.8s ease-in-out infinite}.bt-oneri-sayac{font:700 9px 'JetBrains Mono',monospace;border:1.5px solid ${INK};border-radius:999px;padding:5px 8px;background:#ffffff55}
@keyframes btNabiz{50%{box-shadow:0 0 0 9px #14160f08}}
.bt-oneri-etiket{font:800 10px 'JetBrains Mono',monospace;letter-spacing:.08em;text-transform:uppercase;margin-bottom:9px}
.bt-oneri-sahne h3{margin:0;max-width:680px;font-family:'Archivo Black',sans-serif;font-size:clamp(25px,5vw,42px);line-height:1.04;letter-spacing:-.025em}.bt-oneri-sahne p{margin:15px 0 0;max-width:680px;font-size:13px;line-height:1.55;color:#484a40}
.bt-oneri-etki{display:grid;gap:3px;margin-top:18px;padding:11px 13px;border:1.5px solid ${INK};border-radius:12px;background:#ffffff77;max-width:680px}.bt-oneri-etki span{font:800 8.5px 'JetBrains Mono',monospace;letter-spacing:.08em;text-transform:uppercase;opacity:.62}.bt-oneri-etki strong{font:700 11px 'JetBrains Mono',monospace;line-height:1.45}
.bt-oneri-uyari{display:flex;align-items:flex-start;gap:7px;margin-top:12px;max-width:680px;color:#713529;font-size:10.5px;line-height:1.45}.bt-oneri-uyari svg{flex:0 0 auto;margin-top:1px}
.bt-oneri-aksiyon{display:inline-flex;align-items:center;justify-content:center;gap:5px;margin-top:20px;border:2px solid ${INK};border-radius:999px;background:${INK};color:${CREAM};padding:10px 15px;white-space:nowrap;font:800 11px 'Space Grotesk',sans-serif;cursor:pointer;box-shadow:3px 3px 0 ${CORAL}}.bt-oneri-sahne.acil .bt-oneri-aksiyon{box-shadow:3px 3px 0 ${LIME}}.bt-oneri-aksiyon:hover{transform:translate(-1px,-1px);box-shadow:5px 5px 0 ${CORAL}}
.bt-oneri-pusula{position:relative;z-index:1;aspect-ratio:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;border-radius:50%;background:${INK};color:${CREAM};border:2px solid ${INK};box-shadow:0 0 0 10px #ffffff55,0 0 0 12px ${INK};transform:rotate(2deg)}.bt-oneri-pusula:before,.bt-oneri-pusula:after{content:'';position:absolute;background:${LIME};border:2px solid ${INK}}.bt-oneri-pusula:before{width:22px;height:22px;left:-5px;top:30px;border-radius:50%}.bt-oneri-pusula:after{width:16px;height:16px;right:7px;bottom:30px;transform:rotate(20deg)}.bt-oneri-yildiz{position:absolute;top:22px;color:${LIME};font-size:24px}.bt-oneri-pusula-ikon{height:30px;color:${CORAL};margin-bottom:5px}.bt-oneri-pusula-ikon svg{width:28px;height:28px}.bt-oneri-pusula small{font:700 8px 'JetBrains Mono',monospace;letter-spacing:.06em;text-transform:uppercase;color:#aeb0a2}.bt-oneri-pusula strong{font-family:'Archivo Black',sans-serif;font-size:24px;color:${LIME};margin-top:2px}.bt-oneri-pusula span{max-width:120px;margin-top:8px;font-size:8.5px;line-height:1.3;color:#898c7d}
.bt-oneri-diger{margin-top:28px}.bt-oneri-diger-baslik{display:flex;justify-content:space-between;gap:12px;align-items:end;margin-bottom:11px}.bt-oneri-diger-baslik-ana{display:flex;align-items:center;gap:8px}.bt-oneri-diger-baslik-ikon{display:grid;place-items:center;width:29px;height:29px;border:1.5px solid ${INK};border-radius:9px;background:${LIME};color:${INK}}.bt-oneri-diger-baslik-baslik{font-family:'Archivo Black',sans-serif;font-size:14px}.bt-oneri-diger-sayac{display:grid;place-items:center;min-width:25px;height:25px;padding:0 6px;border:1px solid #5d6153;border-radius:999px;color:${LIME};font-size:10px;font-weight:800}.bt-oneri-diger-baslik small{color:#85887a;font-size:9.5px}
.bt-oneri-kartlar{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.bt-oneri-kart{position:relative;display:flex;flex-direction:column;align-items:flex-start;min-height:170px;padding:15px;text-align:left;background:${CREAM};color:${INK};border:2px solid ${INK};border-radius:16px;cursor:pointer;overflow:hidden;transition:transform .16s,box-shadow .16s}.bt-oneri-kart:nth-child(2){transform:rotate(.7deg)}.bt-oneri-kart:nth-child(3){transform:rotate(-.5deg)}.bt-oneri-kart:hover{transform:translateY(-3px);box-shadow:4px 4px 0 ${LIME}}.bt-oneri-kart.acil{box-shadow:inset 0 -6px 0 ${CORAL}}.bt-oneri-kart.firsat{box-shadow:inset 0 -6px 0 ${LIME}}.bt-oneri-kart.dikkat{box-shadow:inset 0 -6px 0 #ffcf6e}.bt-oneri-kart-no{position:absolute;right:10px;top:7px;font:800 24px 'JetBrains Mono',monospace;color:#14160f13}.bt-oneri-kart-ikon{display:grid;place-items:center;width:30px;height:30px;border:1.5px solid ${INK};border-radius:9px;background:${LIME};margin-bottom:14px}.bt-oneri-kart.acil .bt-oneri-kart-ikon,.bt-oneri-kart.dikkat .bt-oneri-kart-ikon{background:${CORAL}}.bt-oneri-kart-ikon svg{width:15px;height:15px}.bt-oneri-kart-etiket{font:800 8px 'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.05em;opacity:.62;margin-bottom:5px}.bt-oneri-kart>strong{font-size:12px;line-height:1.3;padding-right:8px}.bt-oneri-kart-alt{display:flex;align-items:center;gap:2px;margin-top:auto;padding-top:14px;font-size:9.5px;font-weight:800;text-decoration:underline}
.bt-oneri-kartlar:not(.tumu-acik) .bt-oneri-kart:nth-child(n+4){display:none}
.bt-oneri-bos{display:flex;align-items:center;gap:9px;background:#20231a;border:1.5px solid #4c5042;border-radius:14px;padding:16px;color:#bfc1b4;font-size:12px}.bt-oneri-bos svg{color:${LIME}}
.bt-oneriler-alt{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:18px;color:#85887a;font-size:9.5px;line-height:1.4}.bt-oneriler-alt .bt-link{color:${LIME};white-space:nowrap}
@media(max-width:760px){.bt-oneriler{margin-right:4px;padding:18px 13px;box-shadow:4px 4px 0 ${LIME};border-radius:19px}.bt-oneriler-head{align-items:stretch;gap:16px}.bt-oneri-mod{display:grid;grid-template-columns:1fr 1fr;width:100%;border-radius:14px}.bt-oneri-mod button{justify-content:center;padding:9px 7px}.bt-oneri-sahne{grid-template-columns:1fr;min-height:0;padding:22px 17px;gap:25px;box-shadow:4px 4px 0 ${CORAL};border-radius:18px}.bt-oneri-sahne-ust{margin-bottom:24px}.bt-oneri-sahne h3{font-size:clamp(25px,8vw,34px)}.bt-oneri-sahne p{font-size:12px}.bt-oneri-pusula{width:150px;justify-self:center}.bt-oneri-kartlar{display:flex;overflow-x:auto;padding:2px 2px 8px;scroll-snap-type:x mandatory}.bt-oneri-kart{flex:0 0 min(76vw,240px);scroll-snap-align:start}.bt-oneri-diger{margin-top:32px}.bt-oneri-diger-baslik{align-items:flex-start;flex-direction:column;gap:8px;margin-bottom:12px;padding:14px;background:#20231a;border:1.5px solid #4c5042;border-radius:14px}.bt-oneri-diger-baslik-ana{width:100%}.bt-oneri-diger-baslik-ikon{width:34px;height:34px}.bt-oneri-diger-baslik-baslik{font-size:17px!important;line-height:1.15}.bt-oneri-diger-sayac{margin-left:auto}.bt-oneri-diger-baslik small{padding-left:42px;color:#aeb0a2;font-size:11.5px!important;line-height:1.4}.bt-oneriler-alt{align-items:flex-start;flex-direction:column}.bt-oneriler-alt .bt-link{white-space:normal}}

/* Öneri merkezi: tek tipografi, sabit sahne ve yer değiştirmeyen sinyal kartları */
.bt-oneriler,.bt-oneriler button{font-family:'Space Grotesk',sans-serif}
.bt-oneriler-kicker{font-family:'Space Grotesk',sans-serif;font-size:11px;letter-spacing:.04em}
.bt-oneriler h2{font-family:'Space Grotesk',sans-serif;font-size:30px;font-weight:800;line-height:1.1}
.bt-oneriler-head p{font-size:13px}
.bt-oneri-hedef{display:grid;gap:7px}.bt-oneri-hedef-label{padding-left:5px;color:#bfc1b4;font-size:11px;font-weight:700}
.bt-oneri-mod button{padding:10px 13px;font-size:12px}.bt-oneri-mod button span{display:block}.bt-oneri-mod button b,.bt-oneri-mod button small{font:inherit}
.bt-oneri-sahne{height:420px;min-height:420px}
.bt-oneri-sahne-ust{margin-bottom:24px}
.bt-oneri-canli,.bt-oneri-sayac,.bt-oneri-etiket{font-family:'Space Grotesk',sans-serif;font-size:11px;letter-spacing:.04em}
.bt-oneri-sahne h3{font-family:'Space Grotesk',sans-serif;font-size:32px;font-weight:800;line-height:1.08}
.bt-oneri-sahne p{margin-top:12px;font-size:13px}
.bt-oneri-etki{margin-top:14px;padding:10px 12px}.bt-oneri-etki span{font-family:'Space Grotesk',sans-serif;font-size:11px;letter-spacing:.03em}.bt-oneri-etki strong{font-family:'Space Grotesk',sans-serif;font-size:12px}
.bt-oneri-uyari{margin-top:10px;font-size:12px;line-height:1.4}
.bt-oneri-aksiyon{margin-top:16px;font-size:12px}
.bt-oneri-pusula small{font-family:'Space Grotesk',sans-serif;font-size:10px;letter-spacing:.03em}.bt-oneri-pusula strong{font-family:'Space Grotesk',sans-serif;font-size:23px;font-weight:800}.bt-oneri-pusula span{font-size:10px}
.bt-oneri-diger-baslik-baslik{font-family:'Space Grotesk',sans-serif;font-size:15px;font-weight:800}.bt-oneri-diger-baslik small{font-size:12px}
.bt-oneri-kart{height:178px;min-height:178px;font-family:'Space Grotesk',sans-serif;transform:none!important;transition:background .16s,box-shadow .16s}.bt-oneri-kart:hover{transform:none;background:#fffaf0}.bt-oneri-kart.aktif{background:${LIME};box-shadow:inset 0 -6px 0 ${CORAL},0 0 0 2px ${LIME}}
.bt-oneri-kart-no{top:11px;right:11px;display:grid;place-items:center;width:25px;height:25px;border-radius:50%;background:#14160f0d;font-family:'Space Grotesk',sans-serif;font-size:11px;color:${INK}}
.bt-oneri-kart-etiket{font-family:'Space Grotesk',sans-serif;font-size:11px;letter-spacing:.03em}.bt-oneri-kart>strong{font-size:13px}.bt-oneri-kart-alt{font-size:11px}
.bt-oneriler-alt{font-size:11px}
@media(max-width:760px){
  .bt-oneriler h2{font-size:27px}
  .bt-oneri-hedef{width:100%}
  .bt-oneri-mod button{padding:10px 7px;font-size:11px}
  .bt-oneri-sahne{height:auto;min-height:590px}
  .bt-oneri-sahne h3{font-size:27px}
  .bt-oneri-kartlar{display:flex;grid-template-columns:none;gap:10px;overflow-x:auto;overflow-y:hidden;padding:1px 28px 9px 1px;scroll-snap-type:x mandatory;scroll-padding-left:1px;-webkit-overflow-scrolling:touch;scrollbar-width:none}
  .bt-oneri-kartlar::-webkit-scrollbar{display:none}
  .bt-oneri-kart{display:grid;grid-template-columns:38px minmax(0,1fr) auto;grid-template-areas:"icon label number" "icon title title" "icon action action";column-gap:11px;row-gap:3px;width:auto;height:110px;min-height:110px;flex:0 0 calc(100% - 30px);padding:12px 13px;align-items:start;scroll-snap-align:start;scroll-snap-stop:always;border-radius:14px}
  .bt-oneri-kartlar:not(.tumu-acik) .bt-oneri-kart:nth-child(n+4){display:grid}
  .bt-oneri-kart-no{position:static;grid-area:number;align-self:center;width:auto;min-width:27px;height:24px;padding:0 6px}
  .bt-oneri-kart-ikon{grid-area:icon;width:38px;height:38px;margin:0;align-self:center}
  .bt-oneri-kart-etiket{grid-area:label;align-self:center;margin:0;padding-top:2px}
  .bt-oneri-kart>strong{grid-area:title;padding:0;font-size:13px;line-height:1.3}
  .bt-oneri-kart-alt{grid-area:action;margin:0;padding-top:6px;font-size:10.5px}
  .bt-oneriler-alt .bt-link{display:none}
}

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
.bt-kart-odeme-durum{display:inline-flex;align-items:center;gap:5px;margin-top:6px;padding:4px 7px;border:1px solid #55584c;border-radius:999px;color:#bfc1b4;font-size:10px;font-weight:800}.bt-kart-odeme-durum.minimum{color:${LIME};border-color:${LIME}}.bt-kart-odeme-durum.kismi{color:#ffcf6e;border-color:#ffcf6e}.bt-kart-odeme-durum.tamami{color:${LIME};border-color:${LIME}}
.bt-kart-odeme-secenekler{display:grid;gap:9px;margin:18px 0}.bt-kart-odeme-secimi{width:100%;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center;padding:13px 14px;border:2px solid var(--line);border-radius:14px;background:var(--panel2);color:var(--text);text-align:left;cursor:pointer;font-family:inherit}.bt-kart-odeme-secimi:hover{background:${LIME};color:${INK}}.bt-kart-odeme-secimi:disabled{cursor:not-allowed;opacity:.45}.bt-kart-odeme-secimi strong{display:block;font-size:13px}.bt-kart-odeme-secimi small{display:block;margin-top:3px;color:var(--dim);font-size:10.5px}.bt-kart-odeme-secimi b{font-family:'JetBrains Mono',monospace;font-size:13px;white-space:nowrap}.bt-kart-odeme-ozet{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px}.bt-kart-odeme-ozet>div{padding:11px;border:1.5px solid var(--line);border-radius:12px;background:var(--panel2)}.bt-kart-odeme-ozet span{display:block;color:var(--dim);font-size:10px}.bt-kart-odeme-ozet strong{display:block;margin-top:4px;font-family:'JetBrains Mono',monospace;font-size:13px}

.bt-satir{display:flex;align-items:center;gap:16px;row-gap:8px;flex-wrap:wrap;padding:16px;border-radius:14px;background:var(--panel2);border:2px solid var(--line)}
.bt-satir-ad{font-size:14.5px;color:var(--text);font-weight:600}
.bt-satir-meta{font-size:12.5px;margin-top:3px;color:var(--dim)}
.bt-satir-tutar{font-family:'JetBrains Mono',monospace;font-size:16px;color:var(--text);font-weight:700}
.bt-satir-alt{font-size:11.5px;color:${CORAL};font-weight:700;margin-top:3px}
.bt-bar{height:6px;border-radius:4px;background:var(--panel);border:1px solid var(--line);overflow:hidden;margin-top:9px;max-width:220px}
.bt-bar div{height:100%}
.bt-odeme-gecmisi{flex:0 0 100%;width:100%;border-top:1.5px solid var(--line);padding-top:10px;margin-top:4px}
.bt-odeme-gecmisi summary{cursor:pointer;color:${CORAL};font-size:11.5px;font-weight:800;list-style:none;display:flex;align-items:center;gap:6px}
.bt-odeme-gecmisi summary::-webkit-details-marker{display:none}
.bt-odeme-gecmisi summary:before{content:'›';font-size:17px;line-height:1;transition:transform .15s}
.bt-odeme-gecmisi[open] summary:before{transform:rotate(90deg)}
.bt-odeme-liste{display:grid;gap:6px;margin-top:9px}
.bt-odeme-kaydi{display:grid;grid-template-columns:minmax(0,1fr) auto auto;align-items:center;gap:12px;padding:8px 10px 8px 12px;background:var(--panel);border:1.5px solid var(--line);border-radius:10px}
.bt-odeme-tarih{font-size:11.5px;color:var(--dim);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bt-odeme-tutar{font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:800;color:var(--text);white-space:nowrap}
.bt-odeme-islemler{display:flex;align-items:center;gap:1px}

.bt-strip{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;padding-bottom:20px;border-bottom:2px solid var(--line);margin-bottom:22px}
.bt-strip-count{font-size:13px;font-weight:600;color:var(--dim)}
.bt-strip-total{font-family:'Archivo Black',sans-serif;font-size:clamp(19px,4vw,24px);color:var(--text)}
.bt-odeme-ozet{padding:16px;border:1.5px solid var(--line);border-radius:14px;background:var(--panel2);margin-bottom:20px}
.bt-odeme-ozet-kapali{display:flex;justify-content:flex-end;margin-bottom:20px}
.bt-odeme-ozet-ust{display:flex;align-items:flex-end;justify-content:space-between;gap:14px;flex-wrap:wrap}
.bt-odeme-ozet-yuzde{font-family:'Archivo Black',sans-serif;font-size:28px;color:${LIME};text-shadow:2px 2px 0 ${INK}}
.bt-odeme-ilerleme{height:14px;border-radius:999px;background:var(--panel);border:2px solid var(--line);overflow:hidden;margin:12px 0}
.bt-odeme-ilerleme div{height:100%;background:linear-gradient(90deg,${CORAL},${LIME});transition:width .25s}
.bt-odeme-ozet-rakamlar{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
.bt-odeme-ozet-rakam{padding:10px 12px;border-radius:10px;background:var(--panel);border:1.5px solid var(--line)}
@media(max-width:600px){.bt-odeme-ozet-rakamlar{grid-template-columns:1fr}}

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
.bt-modalbaslik{display:flex;align-items:flex-start;justify-content:space-between;gap:14px}.bt-modalbaslik .bt-eyebrow{margin-bottom:9px}.bt-modalbaslik .bt-h2{margin:0}
.bt-feedback-trigger{position:fixed;right:clamp(14px,3vw,28px);bottom:clamp(14px,3vw,28px);z-index:40;display:inline-flex;align-items:center;gap:7px;padding:11px 16px;border:2px solid ${INK};border-radius:999px;background:${LIME};color:${INK};font:800 12.5px 'Space Grotesk',sans-serif;box-shadow:4px 4px 0 ${CORAL};cursor:pointer}
.bt-feedback-trigger:hover{transform:translateY(-1px)}
.bt-quick-add{position:fixed;right:clamp(14px,3vw,28px);bottom:clamp(70px,8vw,86px);z-index:40;display:inline-flex;align-items:center;gap:7px;padding:11px 16px;border:2px solid ${INK};border-radius:999px;background:${CORAL};color:${INK};font:800 12.5px 'Space Grotesk',sans-serif;box-shadow:4px 4px 0 ${LIME};cursor:pointer}
.bt-quick-add:hover{transform:translateY(-1px)}
.bt-quick-menu{position:fixed;right:clamp(14px,3vw,28px);bottom:clamp(120px,13vw,142px);z-index:41;width:min(310px,calc(100vw - 28px));display:grid;gap:7px;padding:10px;background:var(--panel);border:2px solid var(--line);border-radius:18px;box-shadow:7px 7px 0 ${LIME}}
.bt-quick-menu button{display:grid;grid-template-columns:34px minmax(0,1fr);align-items:center;gap:10px;width:100%;padding:10px;border:1.5px solid var(--line);border-radius:12px;background:var(--panel2);color:var(--text);font:inherit;text-align:left;cursor:pointer}
.bt-quick-menu button:hover{background:color-mix(in srgb,${LIME} 24%,var(--panel2))}.bt-quick-menu svg{grid-row:1/3;width:34px;height:34px;padding:7px;border:1.5px solid var(--line);border-radius:10px;background:${LIME};color:${INK}}.bt-quick-menu strong{font-size:12.5px}.bt-quick-menu small{display:block;margin-top:2px;color:var(--dim);font-size:10.5px;line-height:1.35}
.bt-borc-araclari{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:12px 14px;background:var(--panel);border:2px solid var(--line);border-radius:16px}.bt-borc-araclari.filtre-aktif{align-items:flex-start;background:color-mix(in srgb,${CORAL} 10%,var(--panel));border-color:${CORAL};box-shadow:4px 4px 0 color-mix(in srgb,${CORAL} 35%,transparent)}.bt-borc-araclari-baslik{display:flex;align-items:center;gap:10px;min-width:0}.bt-borc-araclari-ikon{display:grid;place-items:center;width:34px;height:34px;flex:0 0 34px;border:1.5px solid var(--line);border-radius:10px;background:${LIME};color:${INK}}.bt-borc-araclari.filtre-aktif .bt-borc-araclari-ikon{background:${CORAL}}.bt-borc-araclari-baslik span{display:block;color:var(--dim);font-size:10px;font-weight:800;letter-spacing:.04em;text-transform:uppercase}.bt-borc-araclari-baslik strong{display:block;margin-top:2px;font-size:13px;line-height:1.25}.bt-borc-araclari-aciklama{margin-top:5px;color:var(--dim);font-size:11px;line-height:1.4}.bt-borc-araclari-actions{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap}.bt-status-filter{display:inline-flex;align-items:center;gap:7px;padding:8px 11px;border:2px solid ${CORAL};border-radius:999px;background:color-mix(in srgb,${CORAL} 12%,var(--panel));color:${CORAL};font:800 11.5px 'Space Grotesk',sans-serif;cursor:pointer}.bt-status-filter:hover{background:color-mix(in srgb,${CORAL} 20%,var(--panel))}
.bt-feedback-textarea{min-height:130px;resize:vertical;line-height:1.5;padding-top:12px}
.bt-tour-arka{position:fixed;inset:0;z-index:140;display:grid;place-items:center;padding:22px;background:#0f110ad9;backdrop-filter:blur(7px);overflow-y:auto}
.bt-tour{position:relative;width:min(920px,100%);min-height:560px;display:grid;grid-template-columns:minmax(0,1.16fr) minmax(300px,.84fr);background:var(--panel);color:var(--text);border:3px solid ${INK};border-radius:26px;overflow:hidden;box-shadow:12px 12px 0 ${CORAL}}
.bt-tour-main{display:flex;min-width:0;flex-direction:column;padding:clamp(26px,4vw,44px)}
.bt-tour-kapat{position:absolute;z-index:2;top:16px;right:16px;width:38px;height:38px;display:grid;place-items:center;border:2px solid ${INK};border-radius:50%;background:${CREAM};color:${INK};cursor:pointer}
.bt-tour-progress{display:flex;align-items:center;gap:7px;margin-bottom:34px;padding-right:38px}.bt-tour-progress span{height:7px;flex:1;border:1.5px solid ${INK};border-radius:999px;background:var(--panel2);overflow:hidden}.bt-tour-progress span::after{content:"";display:block;width:0;height:100%;background:${LIME};transition:width .2s ease}.bt-tour-progress span.tamam::after,.bt-tour-progress span.aktif::after{width:100%}.bt-tour-progress span.aktif{box-shadow:0 0 0 3px color-mix(in srgb,${LIME} 35%,transparent)}
.bt-tour-sayac{display:inline-flex;align-items:center;gap:7px;width:max-content;margin-bottom:14px;border:1.5px solid var(--line);border-radius:999px;padding:6px 9px;color:var(--dim);font-size:11px;font-weight:800;letter-spacing:.02em}.bt-tour-sayac svg{color:${CORAL}}
.bt-tour h2{max-width:560px;margin:0;font-family:'Archivo Black',sans-serif;font-size:clamp(29px,4.5vw,46px);line-height:1.02;letter-spacing:-.035em}.bt-tour-aciklama{max-width:600px;margin:17px 0 0;color:var(--dim);font-size:15px;line-height:1.62}.bt-tour-liste{display:grid;gap:9px;margin:22px 0 0;padding:0;list-style:none}.bt-tour-liste li{display:flex;align-items:flex-start;gap:9px;font-size:13px;line-height:1.45}.bt-tour-liste li::before{content:"✓";flex:0 0 22px;height:22px;display:grid;place-items:center;border:1.5px solid ${INK};border-radius:50%;background:${LIME};color:${INK};font-size:11px;font-weight:900}
.bt-tour-actions{display:flex;align-items:center;gap:10px;margin-top:auto;padding-top:28px}.bt-tour-actions .bt-btn{justify-content:center}.bt-tour-atla{margin-right:auto;border:0;background:transparent;color:var(--dim);font:700 12px 'Space Grotesk',sans-serif;text-decoration:underline;text-underline-offset:4px;cursor:pointer}
.bt-tour-visual{position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden;padding:54px 28px 30px;background:${INK};color:${CREAM};border-left:3px solid ${INK}}.bt-tour-visual::before,.bt-tour-visual::after{content:"";position:absolute;border-radius:50%}.bt-tour-visual::before{width:240px;height:240px;right:-80px;top:-70px;background:${CORAL}}.bt-tour-visual::after{width:190px;height:190px;left:-80px;bottom:-60px;background:${LIME}}.bt-tour-demo{position:relative;z-index:1;width:100%;max-width:330px;display:grid;gap:12px;transform:rotate(-1deg)}.bt-tour-demo-top{display:flex;align-items:center;justify-content:space-between;color:#bfc1b4;font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}.bt-tour-demo-mark{display:grid;place-items:center;width:48px;height:48px;border:2px solid ${INK};border-radius:13px;background:${LIME};color:${INK};font-family:'Archivo Black',sans-serif;font-size:22px;box-shadow:4px 4px 0 ${CORAL}}.bt-tour-demo-card{padding:18px;border:2px solid ${INK};border-radius:18px;background:${CREAM};color:${INK};box-shadow:6px 6px 0 ${CORAL}}.bt-tour-demo-card strong{display:block;font-family:'Archivo Black',sans-serif;font-size:clamp(22px,3vw,30px);line-height:1.08}.bt-tour-demo-card small{display:block;margin-top:6px;color:#626456;font-size:11px;line-height:1.4}.bt-tour-demo-lines{display:grid;gap:8px;margin-top:16px}.bt-tour-demo-line{display:flex;align-items:center;justify-content:space-between;gap:10px;border-top:1px solid #b9baaE;padding-top:8px;font-size:11px;font-weight:700}.bt-tour-demo-line b{font-family:'JetBrains Mono',monospace;color:#5d7a2e}.bt-tour-demo-card.vurgu{background:${LIME}}.bt-tour-demo-card.vurgu small{color:#3f4433}
@media(max-width:760px){.bt-tour-arka{place-items:start center;padding:10px}.bt-tour{min-height:0;grid-template-columns:1fr;border-radius:20px;box-shadow:6px 6px 0 ${CORAL}}.bt-tour-main{padding:23px 18px 20px}.bt-tour-progress{margin-bottom:24px}.bt-tour h2{font-size:clamp(28px,9vw,38px)}.bt-tour-aciklama{font-size:14px}.bt-tour-visual{min-height:220px;padding:28px 22px;border-left:0;border-top:3px solid ${INK}}.bt-tour-demo{max-width:420px}.bt-tour-actions{flex-wrap:wrap}.bt-tour-atla{width:100%;order:3;margin:4px 0 0;text-align:center}.bt-tour-actions .bt-btn{flex:1}.bt-tour-kapat{top:12px;right:12px}}
.bt-product-tour{position:fixed;inset:0;z-index:140;pointer-events:none}.bt-product-tour-golge{position:fixed;z-index:0;background:#0f110ab8;pointer-events:auto}.bt-product-tour-hedef{position:fixed;z-index:1;border:3px solid ${LIME};border-radius:22px;box-shadow:0 0 0 4px #14160f,0 0 0 9px #cdf56455;pointer-events:none;animation:bt-tour-nabiz 1.7s ease-in-out infinite}.bt-product-tour-panel{position:fixed;z-index:3;max-height:calc(100vh - 36px);overflow-y:auto;padding:23px;background:var(--panel);color:var(--text);border:3px solid ${INK};border-radius:20px;box-shadow:7px 7px 0 ${CORAL};pointer-events:auto}.bt-product-tour-kapat{position:absolute;top:13px;right:13px;width:34px;height:34px;display:grid;place-items:center;border:2px solid ${INK};border-radius:50%;background:var(--panel2);color:var(--text);cursor:pointer}.bt-product-tour-progress{display:flex;gap:5px;margin:0 42px 18px 0}.bt-product-tour-progress span{height:6px;flex:1;border:1.5px solid ${INK};border-radius:999px;background:var(--panel2)}.bt-product-tour-progress span.aktif{background:${LIME}}.bt-product-tour-sayac{display:flex;align-items:center;gap:6px;margin-bottom:10px;color:var(--dim);font-size:10.5px;font-weight:800;letter-spacing:.02em}.bt-product-tour-sayac svg{color:${CORAL}}.bt-product-tour-panel h2{margin:0;padding-right:20px;font-family:'Archivo Black',sans-serif;font-size:clamp(22px,3vw,29px);line-height:1.08;letter-spacing:-.025em}.bt-product-tour-panel>p{margin:12px 0 0;color:var(--dim);font-size:13px;line-height:1.55}.bt-product-tour-ipucu{display:flex;align-items:flex-start;gap:8px;margin-top:15px;padding:10px 11px;border:1.5px solid var(--line);border-radius:12px;background:var(--panel2);font-size:11.5px;line-height:1.4;font-weight:700}.bt-product-tour-ipucu svg{flex:0 0 auto;margin-top:1px;color:#5d7a2e}.bt-product-tour-actions{display:flex;align-items:center;gap:7px;margin-top:18px}.bt-product-tour-actions .bt-btn{white-space:nowrap}.bt-product-tour-atla{margin-right:auto;border:0;background:transparent;color:var(--dim);font:700 11px 'Space Grotesk',sans-serif;text-decoration:underline;text-underline-offset:3px;cursor:pointer}@keyframes bt-tour-nabiz{50%{box-shadow:0 0 0 4px #14160f,0 0 0 13px #cdf56422}}
@media(max-width:700px){.bt-product-tour-golge{background:#0f110ac2}.bt-product-tour-hedef{border-radius:17px}.bt-product-tour-panel{max-height:min(48vh,390px);padding:18px 16px;border-radius:17px;box-shadow:5px 5px 0 ${CORAL}}.bt-product-tour-panel h2{font-size:21px}.bt-product-tour-panel>p{font-size:12px;line-height:1.45}.bt-product-tour-ipucu{margin-top:11px;padding:8px 9px}.bt-product-tour-actions{margin-top:13px;flex-wrap:wrap}.bt-product-tour-atla{order:3;width:100%;margin:2px 0 0;text-align:center}.bt-product-tour-actions .bt-btn{flex:1;justify-content:center}.bt-product-tour-progress{margin-bottom:13px}}
.bt-settings-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.bt-settings-card{background:var(--panel);border:2px solid var(--line);border-radius:18px;padding:20px}.bt-settings-card.wide{grid-column:1/-1}.bt-settings-title{display:flex;align-items:center;gap:9px;font-family:'Archivo Black',sans-serif;font-size:17px;margin-bottom:16px}.bt-setting-row{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:12px 0;border-top:1px solid color-mix(in srgb,var(--line) 22%,transparent)}.bt-setting-row:first-of-type{border-top:0}.bt-setting-row strong{display:block;font-size:13px}.bt-setting-row small{display:block;color:var(--dim);font-size:11px;margin-top:3px;overflow-wrap:anywhere}.bt-yakinda{font-size:10px;font-weight:800;color:var(--dim);border:1px solid var(--line);border-radius:999px;padding:4px 7px;white-space:nowrap}@media(max-width:700px){.bt-settings-grid{grid-template-columns:1fr}.bt-settings-card.wide{grid-column:auto}}
.bt-premium-card{grid-column:1/-1;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:18px;align-items:center;background:${INK};color:${CREAM};border:2px solid var(--line);border-radius:20px;padding:22px;box-shadow:6px 6px 0 ${CORAL}}.bt-premium-card h2{margin:3px 0 7px;font-family:'Archivo Black',sans-serif;font-size:clamp(20px,3vw,28px);color:${LIME};text-shadow:2px 2px 0 ${CORAL}}.bt-premium-card p{margin:0;color:#c8c7bb;font-size:12.5px;line-height:1.55;max-width:620px}.bt-premium-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}.bt-premium-actions .bt-btn{text-decoration:none;justify-content:center}.bt-premium-help{flex-basis:100%;margin-top:2px!important;text-align:right;font-size:10.5px!important;color:#aaa99e!important}.bt-premium-help a{color:${LIME};font-weight:800}.bt-pro-choice{display:grid;gap:8px;min-width:245px}.bt-pro-toggle{display:grid;grid-template-columns:1fr 1fr;padding:3px;border:1.5px solid #77796d;border-radius:999px;background:#292c20}.bt-pro-toggle button{min-height:36px;border:0;border-radius:999px;background:transparent;color:#c8c7bb;font:inherit;font-size:12px;font-weight:800;cursor:pointer}.bt-pro-toggle button.aktif{background:${CREAM};color:${INK}}.bt-premium-badge{display:inline-flex;align-items:center;gap:6px;border:1.5px solid ${LIME};border-radius:999px;padding:5px 9px;color:${LIME};font-size:10px;font-weight:800}.bt-premium-card .bt-btn.ikincil{color:${CREAM};border-color:#77796d}.bt-premium-card .bt-btn.ikincil:hover{background:#292c20}@media(max-width:700px){.bt-premium-card{grid-column:auto;grid-template-columns:1fr}.bt-premium-actions{justify-content:stretch}.bt-premium-actions .bt-btn,.bt-pro-choice{width:100%}.bt-premium-help{text-align:left}}
.bt-pro-modal-arka{overscroll-behavior:contain}.bt-pro-modal{width:min(760px,100%);max-width:none;padding:0;overflow:hidden;background:${INK};color:${CREAM};box-shadow:10px 10px 0 ${CORAL}}.bt-pro-modal-head{position:relative;padding:28px 30px 24px;border-bottom:1.5px solid #45483d;background:radial-gradient(circle at 88% 0%,#cdf56430 0 18%,transparent 19%),${INK}}.bt-pro-modal-head .bt-premium-badge{margin-bottom:13px}.bt-pro-modal-head h2{max-width:560px;margin:0;font-family:'Archivo Black',sans-serif;font-size:clamp(26px,5vw,40px);line-height:1.04;color:${CREAM}}.bt-pro-modal-head h2 span{color:${LIME};text-shadow:3px 3px 0 ${CORAL}}.bt-pro-modal-head p{max-width:590px;margin:12px 0 0;color:#bfc1b4;font-size:13px;line-height:1.55}.bt-pro-modal-kapat{position:absolute;right:20px;top:20px;width:38px;height:38px;display:grid;place-items:center;border:1.5px solid #77796d;border-radius:50%;background:#292c20;color:${CREAM};cursor:pointer}.bt-pro-modal-body{display:grid;grid-template-columns:minmax(0,1fr) minmax(260px,.78fr);gap:24px;padding:26px 30px 30px}.bt-pro-faydalar{display:grid;gap:10px}.bt-pro-fayda{display:grid;grid-template-columns:32px minmax(0,1fr);gap:10px;align-items:start;padding:11px;border:1px solid #45483d;border-radius:13px;background:#1d2017}.bt-pro-fayda svg{width:32px;height:32px;padding:7px;border:1.5px solid ${INK};border-radius:9px;background:${LIME};color:${INK}}.bt-pro-fayda strong{display:block;font-size:12.5px}.bt-pro-fayda small{display:block;margin-top:3px;color:#a9ab9e;font-size:10.5px;line-height:1.4}.bt-pro-satin-al{align-self:start;display:grid;gap:10px;padding:14px;border:1.5px solid #5b5e51;border-radius:16px;background:#24271e}.bt-pro-planlar{display:grid;grid-template-columns:1fr 1fr;gap:8px}.bt-pro-plan{padding:11px 9px;border:1.5px solid #5b5e51;border-radius:12px;background:transparent;color:${CREAM};font:inherit;text-align:left;cursor:pointer}.bt-pro-plan.aktif{border-color:${LIME};background:#cdf56418;box-shadow:inset 0 0 0 1px ${LIME}}.bt-pro-plan span{display:block;color:#a9ab9e;font-size:10px;font-weight:700}.bt-pro-plan strong{display:block;margin-top:4px;color:${CREAM};font-size:13px}.bt-pro-satin-al .bt-btn{width:100%;justify-content:center;min-height:44px}.bt-pro-guvence{display:flex;align-items:flex-start;gap:7px;color:#9fa294;font-size:9.5px;line-height:1.4}.bt-pro-guvence svg{flex:0 0 auto;margin-top:1px;color:${LIME}}.bt-pro-hata{padding:9px;border:1px solid ${CORAL};border-radius:10px;color:#ffc0b7;font-size:10px;line-height:1.4}@media(max-width:700px){.bt-pro-modal-arka{padding:8px}.bt-pro-modal{margin:8px 0;box-shadow:5px 5px 0 ${CORAL}}.bt-pro-modal-head{padding:23px 18px 19px}.bt-pro-modal-head h2{padding-right:38px;font-size:28px}.bt-pro-modal-head p{font-size:12px}.bt-pro-modal-kapat{right:14px;top:14px}.bt-pro-modal-body{grid-template-columns:1fr;gap:17px;padding:18px}.bt-pro-faydalar{gap:7px}.bt-pro-fayda{padding:9px}.bt-pro-satin-al{position:sticky;bottom:0}}
.bt-pro-kilit{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:14px;margin-top:26px;padding:16px;background:#24271e;border:1.5px solid #55584c;border-radius:16px}.bt-pro-kilit-ikon{display:grid;place-items:center;width:42px;height:42px;border:1.5px solid ${INK};border-radius:12px;background:${LIME};color:${INK};box-shadow:3px 3px 0 ${CORAL}}.bt-pro-kilit strong{display:block;color:${CREAM};font-size:14px}.bt-pro-kilit span{display:block;margin-top:3px;color:#9fa294;font-size:11.5px;line-height:1.45}.bt-pro-kilit .bt-btn{white-space:nowrap}
.bt-adfree-card{background:var(--panel2)}.bt-adfree-actions{display:flex;align-items:center;gap:6px;flex-wrap:wrap}.bt-adfree-actions a{text-decoration:none}
@media(max-width:700px){.bt-pro-kilit{grid-template-columns:auto minmax(0,1fr)}.bt-pro-kilit .bt-btn{grid-column:1/-1;width:100%;justify-content:center}.bt-adfree-actions{width:100%}.bt-adfree-actions .bt-btn{flex:1;justify-content:center}}
.bt-varlik-hero{background:${INK};color:${CREAM};border:2px solid var(--line);border-radius:22px;padding:clamp(20px,4vw,32px);display:grid;grid-template-columns:minmax(0,1.4fr) repeat(2,minmax(150px,.7fr));gap:18px;align-items:end}.bt-varlik-hero .bt-metric-lbl{color:#bfc1b4}.bt-varlik-toplam{font-family:'Archivo Black',sans-serif;font-size:clamp(30px,6vw,48px);color:${LIME};text-shadow:3px 3px 0 ${CORAL};overflow-wrap:anywhere}.bt-varlik-mini{border-left:1.5px solid #4a4d40;padding-left:18px}.bt-varlik-mini strong{display:block;font-family:'JetBrains Mono',monospace;font-size:18px;margin-top:5px}.bt-varlik-kaynak{display:flex;align-items:center;gap:7px;color:var(--dim);font-size:11.5px;line-height:1.45}.bt-varlik-kaynak.hata{color:${CORAL}}.bt-varlik-dagilim{display:grid;gap:10px}.bt-varlik-dagilim-satir{display:grid;grid-template-columns:minmax(100px,1fr) minmax(100px,2fr) auto;gap:10px;align-items:center;font-size:12.5px}.bt-varlik-dagilim-bar{height:9px;border:1.5px solid var(--line);border-radius:999px;overflow:hidden;background:var(--panel2)}.bt-varlik-dagilim-bar div{height:100%;background:linear-gradient(90deg,${LIME},${CORAL})}.bt-varlik-rozet{font-size:10px;font-weight:800;border:1.5px solid var(--line);border-radius:999px;padding:4px 7px;white-space:nowrap}.bt-varlik-rozet.otomatik{background:${LIME};color:${INK};border-color:${INK}}.bt-varlik-degisim{font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:800;margin-top:3px}.bt-varlik-degisim.arti{color:#5D7A2E}.bt-varlik-degisim.eksi{color:${CORAL}}
@media(max-width:760px){.bt-varlik-hero{grid-template-columns:1fr}.bt-varlik-mini{border-left:0;border-top:1.5px solid #4a4d40;padding:14px 0 0}.bt-varlik-dagilim-satir{grid-template-columns:minmax(80px,1fr) minmax(70px,1.3fr) auto}}

@media (max-width:600px){
  .bt-app{overflow-x:hidden}
  .bt-wrap{padding:20px 12px calc(112px + env(safe-area-inset-bottom))}
  .bt-header{display:block;margin-bottom:22px}
  .bt-headright{width:100%;gap:8px 10px;margin-top:18px}
  .bt-demo-plan{order:-1;width:100%;justify-content:flex-start;border-radius:14px}
  .bt-demo-plan>span{margin-right:auto}
  .bt-date{flex:1 0 100%}
  .bt-settings-link{padding:7px 9px}
  .bt-upgrade-link{padding:7px 9px}
  .bt-themelabel{width:auto;font-size:11px}
  .bt-exit{font-size:12px;margin-left:auto}
  .bt-nav{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin-bottom:24px}
  .bt-nav.bt-nav-ana{position:fixed;z-index:45;left:0;right:0;bottom:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px;margin:0;padding:8px max(8px,env(safe-area-inset-left)) calc(8px + env(safe-area-inset-bottom)) max(8px,env(safe-area-inset-right));background:color-mix(in srgb,var(--panel) 96%,transparent);border-top:2px solid var(--line);box-shadow:0 -8px 24px #00000012;backdrop-filter:blur(12px)}
  .bt-nav-ana .bt-pill{display:flex;min-width:0;min-height:54px;align-items:center;justify-content:center;flex-direction:column;gap:4px;border:0;border-radius:13px;padding:6px 2px;background:transparent;color:var(--dim);font-size:clamp(9px,2.7vw,10.5px);line-height:1.05;opacity:1;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
  .bt-nav-ana .bt-pill svg{width:19px;height:19px;flex:0 0 auto;stroke-width:2.2}
  .bt-nav-ana .bt-pill span{display:block;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .bt-nav-ana .bt-pill.aktif{background:${LIME};color:${INK};box-shadow:inset 0 0 0 1.5px ${INK},2px 2px 0 ${CORAL}}
  .bt-nav.bt-nav-alt{display:flex;flex-wrap:nowrap;overflow-x:auto;gap:6px;margin:0 0 22px;padding:6px}.bt-nav-alt .bt-pill{width:auto;flex:0 0 auto;padding:7px 11px;font-size:11px}
  .bt-pill{width:100%;padding:9px 4px;font-size:11.5px;text-align:center}
  .bt-grid{grid-template-columns:1fr;gap:12px}
  .bt-card{padding:16px;border-radius:16px}
  .bt-h2{font-size:17px;line-height:1.2}
  .bt-hero{padding:24px 17px;border-radius:19px}
  .bt-chip{width:100%;justify-content:space-between;padding:8px 11px}
  .bt-satir,.bt-satirD{padding:13px 12px;gap:10px}
  .bt-cardhead{align-items:flex-start}
  .bt-cardhead>.bt-input,.bt-cardhead>select{width:100%!important}
  .bt-form{padding:13px}
  .bt-form-butonlar{flex-wrap:wrap}
  .bt-form-butonlar .bt-btn{flex:1 1 120px;justify-content:center}
  .bt-secici{max-width:100%;overflow-x:auto;justify-content:flex-start}
  .bt-secici button{white-space:nowrap;padding:7px 11px}
  .bt-kat{display:grid;grid-template-columns:minmax(70px,1fr) minmax(55px,1.5fr) auto;gap:8px}
  .bt-kat-ad{width:auto!important;min-width:0;overflow-wrap:anywhere;font-size:11.5px}
  .bt-kat-tutar{width:auto!important;font-size:11px;white-space:nowrap}
  .bt-modal-arka{padding:10px;align-items:flex-start;overflow-y:auto}
  .bt-modal{padding:18px 16px;margin:12px 0;box-shadow:5px 5px 0 ${CORAL}}
  .bt-feedback-trigger{right:12px;bottom:76px;padding:10px 13px;font-size:11.5px}
  .bt-quick-add{right:12px;bottom:128px;width:46px;height:46px;padding:0;justify-content:center;border-radius:50%;box-shadow:3px 3px 0 ${LIME}}
  .bt-quick-add span{display:none}
  .bt-quick-menu{right:12px;bottom:184px;width:min(300px,calc(100vw - 24px));box-shadow:5px 5px 0 ${LIME}}
  .bt-borc-araclari,.bt-borc-araclari.filtre-aktif{align-items:stretch;flex-direction:column}.bt-borc-araclari-actions{display:grid;grid-template-columns:1fr;width:100%}.bt-borc-araclari-actions .bt-btn,.bt-borc-araclari-actions .bt-status-filter{width:100%;justify-content:center;min-height:42px}
  .bt-setting-row{align-items:flex-start;flex-direction:column}
  .bt-setting-row .bt-btn{width:100%;justify-content:center}
  .bt-alanlar{grid-template-columns:1fr}
  .bt-alan{grid-template-rows:auto 44px}
}
@media (min-width:601px) and (max-width:820px){.bt-alanlar{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (prefers-reduced-motion:reduce){ *{transition:none!important} }
`;

/* ---------------- Yardımcılar (iş mantığı — değişmedi) ---------------- */
const TL = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});
const TLk = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 2,
});
const TL_BIRIM = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  minimumFractionDigits: 2,
  maximumFractionDigits: 8,
});
const fmt = (n) => TLk.format(Number(n) || 0);
const fmt0 = (n) => TL.format(Number(n) || 0);
const fmtBirim = (n) => TL_BIRIM.format(Number(n) || 0);
const parseParaGirisi = (deger) => {
  const temiz = String(deger ?? "")
    .trim()
    .replace(/[₺\s]/g, "");
  if (!temiz) return 0;
  const standart = temiz.includes(",")
    ? temiz.replace(/\./g, "").replace(",", ".")
    : /^\d{1,3}(\.\d{3})+$/.test(temiz)
      ? temiz.replace(/\./g, "")
      : temiz;
  return Number(standart) || 0;
};
const PARA_BIRIMLERI = [
  { id: "TRY", ad: "Türk lirası (₺)", fiyat: null },
  { id: "USD", ad: "ABD doları ($)", fiyat: "usdTry" },
  { id: "EUR", ad: "Euro (€)", fiyat: "eurTry" },
];
const PARA_FORMATLARI = Object.fromEntries(
  PARA_BIRIMLERI.map((birim) => [
    birim.id,
    new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: birim.id,
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }),
  ]),
);
const fmtPara = (n, id = "TRY") =>
  (PARA_FORMATLARI[id] || PARA_FORMATLARI.TRY).format(Number(n) || 0);
const paraBirimi = (id) =>
  PARA_BIRIMLERI.find((birim) => birim.id === id) || PARA_BIRIMLERI[0];
const paraBirimiKuru = (kayit, fiyatlar = {}) => {
  if (varlikTuru(kayit.tur).fon) return 1;
  return +fiyatlar[paraBirimi(kayit.paraBirimi).fiyat] ||
    (paraBirimi(kayit.paraBirimi).id === "TRY" ? 1 : 0);
};
const KRIPTO_LISTESI = [
  ["bitcoin", "Bitcoin", "BTC"], ["ethereum", "Ethereum", "ETH"], ["tether", "Tether", "USDT"],
  ["binancecoin", "BNB", "BNB"], ["solana", "Solana", "SOL"], ["usd-coin", "USDC", "USDC"],
  ["ripple", "XRP", "XRP"], ["staked-ether", "Lido Staked Ether", "STETH"], ["dogecoin", "Dogecoin", "DOGE"],
  ["cardano", "Cardano", "ADA"], ["tron", "TRON", "TRX"], ["avalanche-2", "Avalanche", "AVAX"],
  ["wrapped-bitcoin", "Wrapped Bitcoin", "WBTC"], ["sui", "Sui", "SUI"], ["chainlink", "Chainlink", "LINK"],
  ["polkadot", "Polkadot", "DOT"], ["shiba-inu", "Shiba Inu", "SHIB"], ["leo-token", "UNUS SED LEO", "LEO"],
  ["hyperliquid", "Hyperliquid", "HYPE"], ["bitcoin-cash", "Bitcoin Cash", "BCH"], ["near", "NEAR Protocol", "NEAR"],
  ["wrapped-steth", "Wrapped stETH", "WSTETH"], ["litecoin", "Litecoin", "LTC"], ["aptos", "Aptos", "APT"],
  ["internet-computer", "Internet Computer", "ICP"], ["dai", "Dai", "DAI"], ["uniswap", "Uniswap", "UNI"],
  ["arbitrum", "Arbitrum", "ARB"], ["render-token", "Render", "RENDER"], ["kaspa", "Kaspa", "KAS"],
  ["cosmos", "Cosmos", "ATOM"], ["ethena", "Ethena", "ENA"], ["filecoin", "Filecoin", "FIL"],
  ["stellar", "Stellar", "XLM"], ["okb", "OKB", "OKB"], ["mantle", "Mantle", "MNT"],
  ["monero", "Monero", "XMR"], ["crypto-com-chain", "Cronos", "CRO"], ["aave", "Aave", "AAVE"],
  ["algorand", "Algorand", "ALGO"], ["vechain", "VeChain", "VET"], ["bittensor", "Bittensor", "TAO"],
  ["theta-token", "Theta Network", "THETA"], ["immutable-x", "Immutable", "IMX"], ["optimism", "Optimism", "OP"],
  ["maker", "Maker", "MKR"], ["bonk", "Bonk", "BONK"], ["jupiter-exchange-solana", "Jupiter", "JUP"],
  ["the-graph", "The Graph", "GRT"], ["rocket-pool", "Rocket Pool", "RPL"],
].sort((a, b) => a[1].localeCompare(b[1], "tr")).map(([coinId, ad, birim]) => ({ coinId, ad, birim }));
const VARLIK_TURLERI = [
  { id: "usd", kategori: "doviz", ad: "Dolar", birim: "USD", otomatik: true, fiyat: "usdTry" },
  { id: "eur", kategori: "doviz", ad: "Euro", birim: "EUR", otomatik: true, fiyat: "eurTry" },
  { id: "gbp", kategori: "doviz", ad: "Sterlin", birim: "GBP", otomatik: true, fiyat: "gbpTry" },
  { id: "chf", kategori: "doviz", ad: "İsviçre frangı", birim: "CHF", otomatik: true, fiyat: "chfTry" },
  { id: "gram_altin", kategori: "emtia", ad: "Gram altın (24 ayar)", birim: "gram", otomatik: true, fiyat: "goldGramTry", carpan: 1 },
  { id: "gram_altin_22", kategori: "emtia", ad: "Gram altın (22 ayar)", birim: "gram", otomatik: true, fiyat: "goldGramTry", carpan: 0.9167, tahmini: true },
  { id: "ceyrek_altin", kategori: "emtia", ad: "Çeyrek altın", birim: "adet", otomatik: true, fiyat: "goldGramTry", carpan: 1.6065, tahmini: true },
  { id: "yarim_altin", kategori: "emtia", ad: "Yarım altın", birim: "adet", otomatik: true, fiyat: "goldGramTry", carpan: 3.213, tahmini: true },
  { id: "tam_altin", kategori: "emtia", ad: "Tam altın", birim: "adet", otomatik: true, fiyat: "goldGramTry", carpan: 6.426, tahmini: true },
  { id: "cumhuriyet_altini", kategori: "emtia", ad: "Cumhuriyet altını", birim: "adet", otomatik: true, fiyat: "goldGramTry", carpan: 6.614, tahmini: true },
  { id: "gram_gumus", kategori: "emtia", ad: "Gram gümüş", birim: "gram", otomatik: true, fiyat: "silverGramTry" },
  { id: "platin", kategori: "emtia", ad: "Platin (ons)", birim: "ons", otomatik: true, fiyat: "platinumOunceTry" },
  { id: "petrol", kategori: "emtia", ad: "Petrol (WTI)", birim: "varil", otomatik: true, fiyat: "oilBarrelTry" },
  { id: "bakir", kategori: "emtia", ad: "Bakır", birim: "libre", otomatik: true, fiyat: "copperPoundTry" },
  ...KRIPTO_LISTESI.map((coin) => ({
    id: coin.coinId === "bitcoin" ? "bitcoin" : "kripto_" + coin.coinId,
    kategori: "kripto",
    ad: coin.ad,
    birim: coin.birim,
    otomatik: true,
    kripto: true,
    coinId: coin.coinId,
  })),
  { id: "kripto_diger", kategori: "kripto", ad: "Diğer (ekleyin)", birim: "", otomatik: false, kripto: true },
  { id: "bes", kategori: "bes", ad: "Bireysel emeklilik fonu", birim: "pay", otomatik: true, fon: true, kaynak: "BEFAS" },
  { id: "fon", kategori: "fon", ad: "Yatırım fonu", birim: "pay", otomatik: true, fon: true, kaynak: "TEFAS" },
  { id: "hisse", kategori: "hisse", ad: "Borsa İstanbul hissesi", birim: "adet", otomatik: true, hisse: true, piyasa: "BIST", kaynak: "Yahoo Finance" },
  { id: "hisse_abd", kategori: "hisse", ad: "ABD borsası hissesi", birim: "adet", otomatik: true, hisse: true, piyasa: "US", kaynak: "Yahoo Finance" },
  { id: "mevduat", kategori: "diger", ad: "Nakit / mevduat", birim: "", otomatik: false },
  { id: "gayrimenkul", kategori: "diger", ad: "Gayrimenkul", birim: "", otomatik: false },
  { id: "arac", kategori: "diger", ad: "Araç", birim: "", otomatik: false },
  { id: "diger", kategori: "diger", ad: "Diğer (ekleyin)", birim: "", otomatik: false },
];
const VARLIK_KATEGORILERI = [
  { id: "doviz", ad: "Döviz", turler: ["usd", "eur", "gbp", "chf"] },
  { id: "emtia", ad: "Emtia", turler: ["gram_altin", "gram_altin_22", "ceyrek_altin", "yarim_altin", "tam_altin", "cumhuriyet_altini", "gram_gumus", "platin", "petrol", "bakir"] },
  { id: "kripto", ad: "Kripto", turler: [...KRIPTO_LISTESI.map((coin) => coin.coinId === "bitcoin" ? "bitcoin" : "kripto_" + coin.coinId), "kripto_diger"] },
  { id: "bes", ad: "Bireysel emeklilik", turler: ["bes"] },
  { id: "fon", ad: "Fonlar", turler: ["fon"] },
  { id: "hisse", ad: "Hisseler", turler: ["hisse", "hisse_abd"] },
  { id: "diger", ad: "Diğer", turler: ["mevduat", "gayrimenkul", "arac", "diger"] },
];
const varlikTuru = (id) =>
  VARLIK_TURLERI.find((tur) => tur.id === id) || VARLIK_TURLERI.at(-1);
const varlikKategorisi = (id) =>
  VARLIK_KATEGORILERI.find((kategori) => kategori.id === id) ||
  VARLIK_KATEGORILERI.at(-1);
function varlikBirimFiyati(kayit, fiyatlar = {}) {
  const tur = varlikTuru(kayit.tur);
  if (tur.fon) {
    const kod = String(kayit.fonKodu || "").toUpperCase();
    return +fiyatlar.funds?.[kod]?.price || +kayit.fonBirimFiyati || 0;
  }
  if (tur.hisse) {
    const kod = String(kayit.hisseKodu || "").toUpperCase();
    return +fiyatlar.stocks?.[kod]?.price || +kayit.hisseBirimFiyati || 0;
  }
  if (tur.kripto) {
    const coinId = tur.coinId || "bitcoin";
    return +fiyatlar.crypto?.[coinId] ||
      (coinId === "bitcoin" ? +fiyatlar.bitcoinTry || 0 : 0) ||
      +kayit.kriptoBirimFiyati || 0;
  }
  return (+fiyatlar[tur.fiyat] || 0) * (tur.carpan || 1);
}
function varlikDegeri(kayit, fiyatlar = {}) {
  const tur = varlikTuru(kayit.tur);
  const kur = paraBirimiKuru(kayit, fiyatlar);
  if (!tur.otomatik)
    return Math.max(+kayit.guncelDeger || 0, 0) * kur;
  const otomatikDeger =
    Math.max(+kayit.miktar || 0, 0) * varlikBirimFiyati(kayit, fiyatlar);
  return otomatikDeger * (tur.hisse && tur.piyasa === "US" ? kur : 1);
}
function varlikOzetiHesapla(varliklar = [], fiyatlar = {}) {
  const kalemler = varliklar.map((kayit) => ({
    ...kayit,
    hesaplananDeger: varlikDegeri(kayit, fiyatlar),
  }));
  const toplam = kalemler.reduce((t, k) => t + k.hesaplananDeger, 0);
  const maliyet = kalemler.reduce(
    (t, k) =>
      t + Math.max(+k.toplamMaliyet || 0, 0) * paraBirimiKuru(k, fiyatlar),
    0,
  );
  return { kalemler, toplam, maliyet, kazanc: toplam - maliyet };
}
const AYLAR = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];
const ayEtiketi = (ay) => {
  const [y, m] = String(ay || "").split("-");
  return y && m ? AYLAR[(+m || 1) - 1] + " " + y : ay;
};
const ayEkle = (ay, adet) => {
  const [y, m] = String(ay).split("-").map(Number);
  return ayAnahtari(new Date(y, m - 1 + adet, 1));
};
const ayFarki = (ilk, son) => {
  const [iy, im] = ilk.split("-").map(Number);
  const [sy, sm] = son.split("-").map(Number);
  return (sy - iy) * 12 + sm - im;
};
const bugun = () => new Date();
const ayAnahtari = (d = bugun()) =>
  d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
const tarihSaatEtiketi = (deger) => {
  const d = new Date(deger);
  return Number.isNaN(d.getTime())
    ? "Tarih bilgisi yok"
    : d.toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" });
};
const yerelTarihSaatDegeri = (deger = new Date()) => {
  const d = new Date(deger);
  if (Number.isNaN(d.getTime())) return "";
  const yerel = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return yerel.toISOString().slice(0, 16);
};
const uid = () => Math.random().toString(36).slice(2, 10);

function sonrakiOdemeTarihi(gun) {
  const g = Math.min(Math.max(parseInt(gun) || 1, 1), 31);
  const simdi = bugun();
  let yil = simdi.getFullYear(),
    ay = simdi.getMonth();
  const buAySon = new Date(yil, ay + 1, 0).getDate();
  let tarih = new Date(yil, ay, Math.min(g, buAySon));
  if (
    tarih < new Date(simdi.getFullYear(), simdi.getMonth(), simdi.getDate())
  ) {
    ay += 1;
    const sonrakiSon = new Date(yil, ay + 1, 0).getDate();
    tarih = new Date(yil, ay, Math.min(g, sonrakiSon));
  }
  return tarih;
}
const kalanGun = (t) => {
  const s = bugun();
  return Math.round(
    (t - new Date(s.getFullYear(), s.getMonth(), s.getDate())) / 86400000,
  );
};
function kartSonOdemeTarihi(k) {
  if (k.sonOdemeTarihi) return new Date(k.sonOdemeTarihi + "T00:00:00");
  return sonrakiOdemeTarihi(k.sonOdemeGunu);
}
function buAyOdemeTarihi(gun) {
  const simdi = bugun();
  const g = Math.min(
    Math.max(parseInt(gun) || 1, 1),
    new Date(simdi.getFullYear(), simdi.getMonth() + 1, 0).getDate(),
  );
  return new Date(simdi.getFullYear(), simdi.getMonth(), g);
}
function kartGecikmeTarihi(k) {
  if (k.ekstreAyi && k.sonOdemeGunu) {
    const [yil, ay] = String(k.ekstreAyi).split("-").map(Number);
    if (yil && ay) {
      const kesimGunu = Math.min(Math.max(parseInt(k.kesimGunu) || 1, 1), 31);
      const sonOdemeGunu = Math.min(
        Math.max(parseInt(k.sonOdemeGunu) || 1, 1),
        31,
      );
      const odemeAyFarki = sonOdemeGunu <= kesimGunu ? 1 : 0;
      const odemeAyi = ay - 1 + odemeAyFarki;
      const ayinSonGunu = new Date(yil, odemeAyi + 1, 0).getDate();
      return new Date(yil, odemeAyi, Math.min(sonOdemeGunu, ayinSonGunu));
    }
  }
  return k.sonOdemeTarihi
    ? new Date(k.sonOdemeTarihi + "T00:00:00")
    : buAyOdemeTarihi(k.sonOdemeGunu);
}

const kartOdemeAyi = (kart) => ayAnahtari(kartGecikmeTarihi(kart));

const kartOdemeAnahtari = (kart) =>
  "kart-" +
  kart.id +
  "-ekstre-" +
  (kart.ekstreAyi || ayAnahtari());

const KATEGORILER = [
  "Market",
  "Yeme-İçme",
  "Ulaşım",
  "Fatura",
  "Kira",
  "Sağlık",
  "Giyim",
  "Eğlence",
  "Eğitim",
  "Diğer",
];
const BANKALAR = [
  "VakıfBank",
  "Halkbank",
  "QNB",
  "Enpara",
  "Akbank",
  "Garanti BBVA",
  "İş Bankası",
  "Yapı Kredi",
  "Kuveyt Türk",
  "Fibabanka",
];
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
  return (
    (((Math.max(+bakiye || 0, 0) * Math.max(+aylikOran || 0, 0)) / 100) *
      Math.max(+gecikenGun || 0, 0)) /
    30
  );
}
function kartHesabi(k) {
  const yeniModel =
    k.yeniDonemEkstreBorcu !== undefined ||
    k.toplamEkstreBorcu !== undefined ||
    k.oncekiDonemBorcu !== undefined ||
    k.yapilanOdeme !== undefined;
  if (!yeniModel) {
    const ana = +k.donemIciToplam > 0 ? +k.donemIciToplam : +k.borc || 0;
    return {
      onceki: ana,
      odeme: 0,
      devreden: ana,
      yeni: +k.donemIciEklenen || 0,
      faiz: 0,
      oran: tcmbKartAzamiFaizi(ana),
      toplam: ana + (+k.donemIciEklenen || 0),
      asgari: +k.asgari || 0,
    };
  }
  const oncekiDevreden = +k.oncekiAydanKalan || 0;
  const yeni =
    k.yeniDonemEkstreBorcu !== undefined
      ? +k.yeniDonemEkstreBorcu || 0
      : Math.max(
          (+k.toplamEkstreBorcu || +k.oncekiDonemBorcu || 0) - oncekiDevreden,
          0,
        );
  const onceki =
    k.yeniDonemEkstreBorcu !== undefined
      ? yeni + oncekiDevreden
      : +k.toplamEkstreBorcu || +k.oncekiDonemBorcu || 0;
  const odeme = Math.min(Math.max(+k.yapilanOdeme || 0, 0), onceki);
  const devreden = Math.max(onceki - odeme, 0);
  const oran = tcmbKartAzamiFaizi(onceki);
  const faiz = (devreden * oran) / 100;
  const toplam = devreden;
  const asgariOran = (+k.limit || 0) <= 50000 ? 20 : 40;
  return {
    onceki,
    oncekiDevreden,
    odeme,
    devreden,
    yeni,
    faiz,
    oran,
    toplam,
    asgari: (onceki * asgariOran) / 100,
  };
}
function ekstreSnapshot(k, ekstreAyi = k.ekstreAyi) {
  return {
    ekstreAyi,
    yeniDonemEkstreBorcu: k.yeniDonemEkstreBorcu,
    toplamEkstreBorcu: k.toplamEkstreBorcu ?? k.oncekiDonemBorcu,
    oncekiAydanKalan: k.oncekiAydanKalan,
    yapilanOdeme: k.yapilanOdeme,
    kesimGunu: k.kesimGunu,
    sonOdemeGunu: k.sonOdemeGunu,
    arsivlenmeTarihi: new Date().toISOString(),
  };
}

// İlk kullanıcı kayıtları Temmuz etiketiyle oluşmuştu; gerçekte Haziran 2026 ekstreleriydi.
// Bu dönüşüm kullanıcı başına yalnızca bir kez çalışır ve en ileri dönemi kartın güncel ekstresi yapar.
function ekstreDonemleriniDuzelt(veri) {
  const ayarlar = veri.ayarlar || {};
  if (ayarlar.ekstreDonemleriV2) return { veri, degisti: false };
  const cards = (veri.cards || []).map((kart) => {
    const k = { ...kart };
    const guncelVar =
      k.toplamEkstreBorcu !== undefined || k.oncekiDonemBorcu !== undefined;
    const guncelAy =
      k.ekstreAyi === "2026-07"
        ? "2026-06"
        : k.ekstreAyi || (guncelVar ? "2026-06" : "");
    const gecmis = (k.ekstreGecmisi || []).map((e) => ({
      ...e,
      ekstreAyi: e.ekstreAyi === "2026-07" ? "2026-06" : e.ekstreAyi,
    }));
    const adaylar = [...gecmis];
    if (guncelVar && guncelAy) adaylar.push(ekstreSnapshot(k, guncelAy));
    if (!adaylar.length) return k;
    const sonAy = adaylar
      .map((e) => e.ekstreAyi)
      .filter(Boolean)
      .sort()
      .at(-1);
    // Aynı aya çakışan kayıtlarda ekranda güncel olan açık kaydı koru.
    const sonKayit = [...adaylar].reverse().find((e) => e.ekstreAyi === sonAy);
    const arsiv = adaylar
      .filter((e) => e !== sonKayit && e.ekstreAyi && e.ekstreAyi !== sonAy)
      .filter(
        (e, i, a) => a.findIndex((x) => x.ekstreAyi === e.ekstreAyi) === i,
      );
    const duzeltilmis = {
      ...k,
      ...sonKayit,
      ekstreAyi: sonAy,
      ekstreGecmisi: arsiv,
    };
    return duzeltilmis;
  });
  return {
    veri: { ...veri, cards, ayarlar: { ...ayarlar, ekstreDonemleriV2: true } },
    degisti: true,
  };
}
function ekstreBorcModeliniDuzelt(veri) {
  const ayarlar = veri.ayarlar || {};
  if (ayarlar.ekstreBorcModeliV3) return { veri, degisti: false };
  const donustur = (kayit) => {
    if (
      !kayit ||
      kayit.yeniDonemEkstreBorcu !== undefined ||
      (kayit.toplamEkstreBorcu === undefined &&
        kayit.oncekiDonemBorcu === undefined)
    )
      return kayit;
    const girilen = +(kayit.toplamEkstreBorcu ?? kayit.oncekiDonemBorcu) || 0;
    const devreden = +kayit.oncekiAydanKalan || 0;
    // Devreden tutar girilen tutardan büyükse kullanıcı ilk alanı yeni dönem borcu olarak doldurmuştur.
    const yeniDonem =
      devreden > girilen ? girilen : Math.max(girilen - devreden, 0);
    return {
      ...kayit,
      yeniDonemEkstreBorcu: yeniDonem,
      toplamEkstreBorcu: yeniDonem + devreden,
    };
  };
  const cards = (veri.cards || []).map((k) => ({
    ...donustur(k),
    ekstreGecmisi: (k.ekstreGecmisi || []).map(donustur),
  }));
  return {
    veri: { ...veri, cards, ayarlar: { ...ayarlar, ekstreBorcModeliV3: true } },
    degisti: true,
  };
}
const VARSAYILAN_FAIZ_EK_HESAP = 4.25;
function ekHesapHesabi(k) {
  const kullanilan = Math.max(+k.kullanilan || 0, 0);
  const odeme = Math.min(Math.max(+k.yapilanOdeme || 0, 0), kullanilan);
  const kalan = Math.max(kullanilan - odeme, 0);
  const oran = +k.faiz > 0 ? +k.faiz : VARSAYILAN_FAIZ_EK_HESAP;
  return { kullanilan, odeme, kalan, oran, faiz: (kalan * oran) / 100 };
}
const odemeGecmisiToplami = (gecmis = []) =>
  gecmis.reduce((t, o) => t + Math.max(+o.tutar || 0, 0), 0);
const gecmisDisiEkHesapOdemesi = (k) =>
  Math.max(
    (+k.yapilanOdeme || 0) - odemeGecmisiToplami(k.odemeGecmisi || []),
    0,
  );
const BOS_VERI = {
  cards: [],
  loans: [],
  overdrafts: [],
  others: [],
  expenses: [],
  incomes: [],
  assets: [],
  feedbacks: [],
  paid: {},
  cardPaymentHistory: {},
  loanPaymentHistory: {},
  ayarlar: {},
  snapshots: {},
};

function demoVerisiOlustur() {
  const buAy = ayAnahtari();
  const oncekiAy = ayEkle(buAy, -1);
  const tarih = (ay, gun) => ay + "-" + String(gun).padStart(2, "0");
  return {
    ...BOS_VERI,
    cards: [
      {
        id: "demo-bonus",
        banka: "Garanti BBVA",
        ad: "Bonus",
        limit: 120000,
        kesimGunu: 10,
        sonOdemeGunu: 20,
        ekstreAyi: buAy,
        yeniDonemEkstreBorcu: 31000,
        oncekiAydanKalan: 11000,
        toplamEkstreBorcu: 42000,
        yapilanOdeme: 10000,
        ekstreGecmisi: [
          {
            ekstreAyi: oncekiAy,
            yeniDonemEkstreBorcu: 28500,
            oncekiAydanKalan: 0,
            toplamEkstreBorcu: 28500,
            yapilanOdeme: 17500,
            kesimGunu: 10,
            sonOdemeGunu: 20,
          },
        ],
      },
      {
        id: "demo-world",
        banka: "Yapı Kredi",
        ad: "World",
        limit: 50000,
        kesimGunu: 25,
        sonOdemeGunu: 7,
        ekstreAyi: buAy,
        yeniDonemEkstreBorcu: 46000,
        oncekiAydanKalan: 0,
        toplamEkstreBorcu: 46000,
        yapilanOdeme: 0,
        ekstreGecmisi: [],
      },
      {
        id: "demo-maximum",
        banka: "İş Bankası",
        ad: "Maximum",
        limit: 95000,
        kesimGunu: 22,
        sonOdemeGunu: 5,
        ekstreAyi: buAy,
        yeniDonemEkstreBorcu: 18500,
        oncekiAydanKalan: 0,
        toplamEkstreBorcu: 18500,
        yapilanOdeme: 3000,
        ekstreGecmisi: [],
      },
    ],
    loans: [
      {
        id: "demo-kredi",
        banka: "QNB",
        ad: "İhtiyaç kredisi",
        kalanBorc: 168000,
        taksit: 12400,
        kalanTaksit: 15,
        faiz: 3.49,
        odemeGunu: 8,
      },
    ],
    overdrafts: [
      {
        id: "demo-kmh",
        banka: "Enpara",
        limit: 50000,
        kullanilan: 27000,
        yapilanOdeme: 5000,
        faiz: 4.25,
        odemeGecmisi: [
          {
            id: "demo-kmh-odeme",
            tutar: 5000,
            tarih: new Date().toISOString(),
          },
        ],
      },
    ],
    expenses: [
      { id: "dh1", tarih: tarih(buAy, 3), kategori: "Market", tutar: 4200, kaynak: "Yapı Kredi · World" },
      { id: "dh2", tarih: tarih(buAy, 7), kategori: "Yeme-İçme", tutar: 6800, kaynak: "Garanti BBVA · Bonus" },
      { id: "dh3", tarih: tarih(buAy, 12), kategori: "Yeme-İçme", tutar: 5900, kaynak: "Garanti BBVA · Bonus" },
      { id: "dh4", tarih: tarih(buAy, 17), kategori: "Yeme-İçme", tutar: 5300, kaynak: "İş Bankası · Maximum" },
      { id: "dh5", tarih: tarih(buAy, 19), kategori: "Ulaşım", tutar: 3600, kaynak: "Yapı Kredi · World" },
      { id: "dh6", tarih: tarih(buAy, 22), kategori: "Fatura", tutar: 4100, kaynak: "Banka hesabı" },
      { id: "dh7", tarih: tarih(buAy, 25), kategori: "Market", tutar: 3900, kaynak: "Yapı Kredi · World" },
      { id: "do1", tarih: tarih(oncekiAy, 4), kategori: "Market", tutar: 3600, kaynak: "Yapı Kredi · World" },
      { id: "do2", tarih: tarih(oncekiAy, 11), kategori: "Yeme-İçme", tutar: 4500, kaynak: "Garanti BBVA · Bonus" },
      { id: "do3", tarih: tarih(oncekiAy, 18), kategori: "Yeme-İçme", tutar: 3500, kaynak: "İş Bankası · Maximum" },
      { id: "do4", tarih: tarih(oncekiAy, 24), kategori: "Market", tutar: 3400, kaynak: "Yapı Kredi · World" },
      { id: "do5", tarih: tarih(oncekiAy, 26), kategori: "Ulaşım", tutar: 3100, kaynak: "Banka hesabı" },
    ],
    incomes: [
      { id: "demo-maas", ad: "Maaş", tutar: 70000, tekrar: "Aylık", tarih: tarih(buAy, 1) },
    ],
    assets: [
      {
        id: "demo-mevduat",
        kategori: "diger",
        tur: "mevduat",
        ad: "Acil durum birikimi",
        kurum: "Banka hesabı",
        paraBirimi: "TRY",
        guncelDeger: 48000,
        toplamMaliyet: 48000,
      },
    ],
    paid: {},
    loanPaymentHistory: {},
    ayarlar: {
      ekstreDonemleriV2: true,
      ekstreBorcModeliV3: true,
      ilkKullanimRehberiV1: true,
    },
    snapshots: { [oncekiAy]: 250000 },
  };
}

const KATEGORI_META = {
  cards: { ad: "Kredi kartları", liste: "cards", rozetBg: LIME },
  loans: { ad: "Krediler", liste: "loans", rozetBg: "#c8c9be" },
  od: { ad: "Ek hesap / KMH", liste: "overdrafts", rozetBg: CORAL },
  others: {
    ad: "Devreden / gecikmiş / diğer",
    liste: "others",
    rozetBg: "#d8c9a0",
  },
};
const SEKME_YOLLARI = {
  ozet: "/summary",
  borclar: "/debts",
  odemeler: "/payments",
  plan: "/debt-plan",
  gelir: "/income",
  harcamalar: "/expenses",
  varliklar: "/assets",
  ayarlar: "/settings",
};
const YOL_SEKMELERI = Object.fromEntries(
  Object.entries(SEKME_YOLLARI).map(([sekme, yol]) => [yol, sekme]),
);

/* Tüm borçları tek listede toplayan model — plan ve banka kırılımı bunun üstünde çalışır */
function borcKalemleri(veri) {
  const kalemler = [];
  veri.cards.forEach((k) => {
    const hesap = kartHesabi(k);
    const guncelBorc = hesap.toplam;
    if (guncelBorc > 0) {
      const gecikmis = kalanGun(kartGecikmeTarihi(k)) < 0;
      const akdiOran = tcmbKartAzamiFaizi(guncelBorc);
      const gecikmeOran = tcmbKartAzamiGecikmeFaizi(guncelBorc);
      const ozelFaizVar = +k.faiz > 0;
      const asgariEksigi = gecikmis
        ? Math.min(Math.max(hesap.asgari - hesap.odeme, 0), guncelBorc)
        : 0;
      const akdiFaizBakiyesi = Math.max(guncelBorc - asgariEksigi, 0);
      const faizTutari = ozelFaizVar
        ? (guncelBorc * +k.faiz) / 100
        : (asgariEksigi * gecikmeOran) / 100 +
          (akdiFaizBakiyesi * akdiOran) / 100;
      kalemler.push({
        id: "kart-" + k.id,
        tur: "kart",
        banka: (k.banka || "").trim(),
        ad: k.banka + (k.ad ? " · " + k.ad : " · Kredi kartı"),
        bakiye: guncelBorc,
        faiz:
          k.toplamEkstreBorcu !== undefined || k.oncekiDonemBorcu !== undefined
            ? hesap.oran
            : ozelFaizVar
              ? +k.faiz
              : guncelBorc > 0
                ? (faizTutari / guncelBorc) * 100
                : akdiOran,
        faizTutari,
        faizTahmini: !ozelFaizVar,
        gecikmis,
        yapilanOdeme: hesap.odeme,
        asgari: hesap.asgari,
        asgariEksigi,
      });
    }
  });
  veri.overdrafts.forEach((k) => {
    const hesap = ekHesapHesabi(k);
    if (hesap.kalan > 0) {
      const bakiye = hesap.kalan;
      const faiz = hesap.oran;
      kalemler.push({
        id: "ek-" + k.id,
        tur: "ek",
        banka: (k.banka || "").trim(),
        ad: k.banka + " · Ek hesap (KMH)",
        bakiye,
        faiz,
        faizTutari: (bakiye * faiz) / 100,
        faizTahmini: !(+k.faiz > 0),
      });
    }
  });
  veri.loans.forEach((k) => {
    if ((+k.kalanBorc || 0) > 0) {
      const bakiye = +k.kalanBorc;
      const faiz = +k.faiz > 0 ? +k.faiz : 0;
      kalemler.push({
        id: "kredi-" + k.id,
        tur: "kredi",
        banka: (k.banka || "").trim(),
        ad: k.banka + (k.ad ? " · " + k.ad : " · Kredi"),
        bakiye,
        faiz,
        faizTutari: (bakiye * faiz) / 100,
        faizTahmini: false,
        sabitTaksit: true,
      });
    }
  });
  (veri.others || []).forEach((k) => {
    if ((+k.tutar || 0) > 0) {
      const bakiye = +k.tutar;
      const faiz = +k.faiz > 0 ? +k.faiz : 0;
      kalemler.push({
        id: "diger-" + k.id,
        tur: "diger",
        banka: (k.banka || "").trim(),
        ad: k.banka + (k.ad ? " · " + k.ad : " · Gecikmiş borç"),
        bakiye,
        faiz,
        faizTutari: (bakiye * faiz) / 100,
        faizTahmini: false,
        sabitTaksit: !(+k.faiz > 0),
      });
    }
  });
  return kalemler;
}

function borcamaOnerileriniHesapla({
  veri,
  kalemler,
  yaklasan,
  buAyHarcama,
  netNakit,
}) {
  const oneriler = [];
  const gecikmisler = yaklasan.filter(
    (odeme) =>
      kalanGun(odeme.tarih) < 0 &&
      !odeme.odendi &&
      Math.max(+odeme.tutar || 0, 0) > 0.01,
  );

  if (gecikmisler.length) {
    const gecikmisToplam = gecikmisler.reduce(
      (toplam, odeme) => toplam + Math.max(+odeme.tutar || 0, 0),
      0,
    );
    oneriler.push({
      id: "gecikmis-odemeler",
      modlar: ["nakit", "faiz"],
      oncelik: 100,
      tur: "acil",
      etiket: "Önce bunu çöz",
      baslik: gecikmisler.length + " gecikmiş ödeme bekliyor",
      aciklama:
        "Yeni bir borca ekstra ödeme yapmadan önce gecikmiş kayıtları kontrol et. Gecikme maliyeti ve kredi geçmişi açısından ilk sırada bunlar olmalı.",
      etki: "Bekleyen zorunlu tutar: " + fmt(gecikmisToplam),
      hedef: "odemeler",
      aksiyon: "Ödemeleri aç",
    });
  }

  (veri.cards || []).forEach((kart) => {
    const hesap = kartHesabi(kart);
    const limit = Math.max(+kart.limit || 0, 0);
    if (limit <= 50000 || hesap.onceki <= 0 || hesap.onceki > 50000) return;
    const mevcutMinimum = hesap.onceki * 0.4;
    const dusukLimitMinimumu = hesap.onceki * 0.2;
    const fark = Math.max(mevcutMinimum - dusukLimitMinimumu, 0);
    if (fark < 250) return;
    oneriler.push({
      id: "limit-" + kart.id,
      modlar: ["nakit"],
      oncelik: 86 + Math.min(fark / 10000, 5),
      tur: "firsat",
      etiket: "Aylık yük senaryosu",
      baslik: (kart.banka || "Kart") + " limitini gözden geçir",
      aciklama:
        "Kart limitin 50.000 TL veya altına indirilebilirse yasal minimum oranı sonraki ekstrelerde yaklaşık %40'tan %20'ye düşebilir.",
      etki:
        "Tahmini minimum " +
        fmt(mevcutMinimum) +
        " yerine " +
        fmt(dusukLimitMinimumu) +
        " · aylık fark " +
        fmt(fark),
      uyari:
        "Bu işlem borcu ya da faizi azaltmaz. Daha az ödeme yaparsan devreden borç ve sonraki ayın faizi artabilir; banka limit değişikliğini ayrıca değerlendirir.",
      hedef: "borclar",
      aksiyon: "Kartı incele",
    });
  });

  const faizliBorclar = kalemler
    .filter(
      (kalem) =>
        !kalem.sabitTaksit && kalem.bakiye > 0 && (+kalem.faiz || 0) > 0,
    )
    .sort((a, b) => b.faiz - a.faiz || b.faizTutari - a.faizTutari);
  if (faizliBorclar.length) {
    const hedef = faizliBorclar[0];
    const binLiraEtki = (1000 * hedef.faiz) / 100;
    oneriler.push({
      id: "faiz-onceligi-" + hedef.id,
      modlar: ["faiz"],
      oncelik: 92,
      tur: "firsat",
      etiket: "Faiz önceliği",
      baslik: "Ekstra ödemeyi önce " + hedef.ad + " borcuna yönlendir",
      aciklama:
        "Tüm zorunlu ödemeler ve gecikmiş kayıtlar tamamlandıktan sonra kalan bütçeyi, değişken faizli borçların içinde oranı en yüksek olana yönlendirmek toplam maliyeti daha hızlı düşürür.",
      etki:
        "Aylık yaklaşık %" +
        hedef.faiz.toLocaleString("tr-TR", { maximumFractionDigits: 2 }) +
        " · her 1.000 TL ek ödeme sonraki ay yaklaşık " +
        fmt(binLiraEtki) +
        " faiz oluşmasını önleyebilir",
      hedef: "plan",
      aksiyon: "Borç planını aç",
    });
  }

  (veri.cards || []).forEach((kart) => {
    const hesap = kartHesabi(kart);
    const limit = Math.max(+kart.limit || 0, 0);
    const kullanim = limit > 0 ? hesap.toplam / limit : 0;
    if (kullanim < 0.8) return;
    oneriler.push({
      id: "limit-kullanim-" + kart.id,
      modlar: ["nakit", "faiz"],
      oncelik: 74 + Math.min(kullanim * 10, 10),
      tur: kullanim >= 1 ? "acil" : "dikkat",
      etiket: "Limit kullanımı",
      baslik: (kart.banka || "Kart") + " limitinin %" + Math.round(kullanim * 100) + "'i dolu",
      aciklama:
        "Bu karttaki yeni harcamaları yavaşlatmak, minimum ödemenin ve devreden borcun büyümesini engellemeye yardımcı olur.",
      etki: "Kalan borç " + fmt(hesap.toplam) + " · limit " + fmt(limit),
      hedef: "borclar",
      aksiyon: "Kartı incele",
    });
  });

  if (netNakit !== null && netNakit < 0) {
    oneriler.push({
      id: "negatif-nakit",
      modlar: ["nakit"],
      oncelik: 90,
      tur: "dikkat",
      etiket: "Aylık denge",
      baslik: "Bu ayın planında " + fmt(Math.abs(netNakit)) + " açık var",
      aciklama:
        "Kayıtlı gelir, harcama ve zorunlu borç ödemelerine göre ay sonu eksiye düşüyor. Önce esnek harcamalardan bu tutar kadar alan açmayı hedefle.",
      etki: "Hedef: aylık nakit akışını en az ₺0 seviyesine getirmek",
      hedef: "harcamalar",
      aksiyon: "Harcamaları incele",
    });
  }

  const oncekiAy = ayEkle(ayAnahtari(), -1);
  const oncekiKategoriler = {};
  (veri.expenses || [])
    .filter((harcama) => (harcama.tarih || "").startsWith(oncekiAy))
    .forEach((harcama) => {
      const kategori = harcama.kategori || "Diğer";
      oncekiKategoriler[kategori] =
        (oncekiKategoriler[kategori] || 0) + (+harcama.tutar || 0);
    });
  const artislar = Object.entries(buAyHarcama.kategoriler || {})
    .map(([kategori, tutar]) => {
      const onceki = oncekiKategoriler[kategori] || 0;
      return { kategori, tutar, onceki, fark: tutar - onceki };
    })
    .filter((x) => x.onceki >= 500 && x.fark >= 500 && x.tutar >= x.onceki * 1.25)
    .sort((a, b) => b.fark - a.fark);
  if (artislar.length) {
    const artis = artislar[0];
    const yuzde = Math.round((artis.fark / artis.onceki) * 100);
    oneriler.push({
      id: "kategori-artisi-" + artis.kategori,
      modlar: ["nakit"],
      oncelik: 78,
      tur: "dikkat",
      etiket: "Harcama sinyali",
      baslik: artis.kategori + " harcamaları geçen aya göre %" + yuzde + " arttı",
      aciklama:
        "Bu kategoriyi geçen ayki seviyesine yaklaştırabilirsen borç ödemeleri için ek alan oluşturabilirsin.",
      etki: "Olası aylık alan: " + fmt(artis.fark),
      hedef: "harcamalar",
      aksiyon: "Kayıtları gör",
    });
  } else if (buAyHarcama.toplam > 0) {
    const [kategori, tutar] = Object.entries(buAyHarcama.kategoriler || {}).sort(
      (a, b) => b[1] - a[1],
    )[0] || ["", 0];
    if (kategori && tutar >= 1000 && tutar / buAyHarcama.toplam >= 0.35) {
      oneriler.push({
        id: "yogun-kategori-" + kategori,
        modlar: ["nakit"],
        oncelik: 64,
        tur: "bilgi",
        etiket: "Harcama dağılımı",
        baslik: "Bu ay en büyük harcama alanın: " + kategori,
        aciklama:
          "Toplam harcamanın %" +
          Math.round((tutar / buAyHarcama.toplam) * 100) +
          "'i bu kategoride. Küçük bir hedef bile ödeme bütçeni görünür biçimde artırabilir.",
        etki: "Bu ay " + fmt(tutar),
        hedef: "harcamalar",
        aksiyon: "Harcamaları aç",
      });
    }
  }

  if (!kalemler.length && !buAyHarcama.adet) {
    oneriler.push({
      id: "veri-ekle",
      modlar: ["nakit", "faiz"],
      oncelik: 20,
      tur: "bilgi",
      etiket: "İlk önerini oluştur",
      baslik: "Borç ve harcamalarını ekledikçe öneriler kişiselleşir",
      aciklama:
        "Borcama yalnızca kaydettiğin rakamlardan hareket eder. İlk kartını ve birkaç harcamanı eklediğinde önceliklerini hesaplamaya başlar.",
      hedef: "borclar",
      aksiyon: "Borç ekle",
    });
  }

  return oneriler.sort((a, b) => b.oncelik - a.oncelik);
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
  const [sekme, setSekmeState] = useState(
    () => YOL_SEKMELERI[window.location.pathname] || "ozet",
  );
  const [form, setForm] = useState(null);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [geriBildirimPenceresi, setGeriBildirimPenceresi] = useState(false);
  const [geriBildirimFormu, setGeriBildirimFormu] = useState({
    tur: "Fikir",
    mesaj: "",
  });
  const [geriBildirimGonderildi, setGeriBildirimGonderildi] = useState(false);
  const [parolaPenceresi, setParolaPenceresi] = useState(false);
  const [parolaFormu, setParolaFormu] = useState({
    parola: "",
    tekrar: "",
    gorunur: false,
  });
  const [parolaDurumu, setParolaDurumu] = useState({
    kaydediliyor: false,
    hata: "",
    tamam: false,
  });
  const [kullaniciEposta, setKullaniciEposta] = useState("");
  const [reklamsiz, setReklamsiz] = useState({
    yukleniyor: true,
    aktif: false,
    proAktif: demoModu,
    proBitis: null,
    proYonetimUrl: null,
    hata: "",
  });
  const [proPaketler, setProPaketler] = useState({
    yukleniyor: true,
    monthly: null,
    annual: null,
    hata: "",
  });
  const [proSatinAlma, setProSatinAlma] = useState({
    yukleniyor: false,
    hata: "",
    plan: null,
  });
  const planOnizlemesiAktif = import.meta.env.DEV;
  const [demoPlan, setDemoPlan] = useState(() => {
    if (!import.meta.env.DEV) return "gercek";
    return localStorage.getItem("borcama:demo-plan") === "free" ? "free" : "pro";
  });
  const etkinPro = planOnizlemesiAktif
    ? demoPlan === "pro"
    : reklamsiz.proAktif;
  const demoPlaniDegistir = (plan) => {
    setDemoPlan(plan);
    localStorage.setItem("borcama:demo-plan", plan);
  };
  const [borcKategori, setBorcKategori] = useState("cards");
  const [odemeFiltresi, setOdemeFiltresi] = useState("bekleyen");
  const [hizliMenuAcik, setHizliMenuAcik] = useState(false);
  const [proPenceresiAcik, setProPenceresiAcik] = useState(false);
  const [rehber, setRehber] = useState({ acik: false, adim: 0 });
  const [rehberKontrolEdildi, setRehberKontrolEdildi] = useState(false);
  const [piyasa, setPiyasa] = useState(() => {
    try {
      const kayit = JSON.parse(localStorage.getItem("borcama:piyasa:v1") || "null");
      return kayit?.prices
        ? { ...kayit, yukleniyor: false, hata: "" }
        : { prices: {}, updatedAt: null, yukleniyor: true, hata: "" };
    } catch {
      return { prices: {}, updatedAt: null, yukleniyor: true, hata: "" };
    }
  });
  const piyasaKodAnahtari = (veri.assets || [])
    .filter(
      (kayit) =>
        (varlikTuru(kayit.tur).fon && kayit.fonKodu) ||
        (varlikTuru(kayit.tur).hisse && kayit.hisseKodu),
    )
    .map((kayit) =>
      varlikTuru(kayit.tur).fon
        ? "F:" + String(kayit.fonKodu).trim().toUpperCase()
        : "H:" + String(kayit.hisseKodu).trim().toUpperCase(),
    )
    .sort()
    .join(",");

  async function piyasaFiyatlariniYenile() {
    setPiyasa((eski) => ({ ...eski, yukleniyor: true, hata: "" }));
    try {
      const fonKodlari = [
        ...new Set(
          (veri.assets || [])
            .filter((kayit) => varlikTuru(kayit.tur).fon && kayit.fonKodu)
            .map((kayit) => String(kayit.fonKodu).trim().toUpperCase()),
        ),
      ];
      const hisseKodlari = [
        ...new Set(
          (veri.assets || [])
            .filter((kayit) => varlikTuru(kayit.tur).hisse && varlikTuru(kayit.tur).piyasa !== "US" && kayit.hisseKodu)
            .map((kayit) => String(kayit.hisseKodu).trim().toUpperCase()),
        ),
      ];
      const hisseAbdKodlari = [
        ...new Set(
          (veri.assets || [])
            .filter((kayit) => varlikTuru(kayit.tur).hisse && varlikTuru(kayit.tur).piyasa === "US" && kayit.hisseKodu)
            .map((kayit) => String(kayit.hisseKodu).trim().toUpperCase()),
        ),
      ];
      const [piyasaYanit, fonYanit, hisseYanit, hisseAbdYanit] = await Promise.all([
        fetch("/api/market-prices", { headers: { Accept: "application/json" } }),
        fonKodlari.length
          ? fetch("/api/fund-prices?codes=" + encodeURIComponent(fonKodlari.join(",")), {
              headers: { Accept: "application/json" },
            })
          : Promise.resolve(null),
        hisseKodlari.length
          ? fetch("/api/stock-prices?codes=" + encodeURIComponent(hisseKodlari.join(",")), {
              headers: { Accept: "application/json" },
            })
          : Promise.resolve(null),
        hisseAbdKodlari.length
          ? fetch("/api/stock-prices?market=US&codes=" + encodeURIComponent(hisseAbdKodlari.join(",")), {
              headers: { Accept: "application/json" },
            })
          : Promise.resolve(null),
      ]);
      if (!piyasaYanit.ok) throw new Error("Fiyat servisi yanıt vermedi");
      const sonuc = await piyasaYanit.json();
      const fonSonucu = fonYanit?.ok ? await fonYanit.json() : null;
      const hisseSonucu = hisseYanit?.ok ? await hisseYanit.json() : null;
      const hisseAbdSonucu = hisseAbdYanit?.ok ? await hisseAbdYanit.json() : null;
      const hisseFiyatlari = { ...(hisseSonucu?.stocks || {}), ...(hisseAbdSonucu?.stocks || {}) };
      if (!sonuc?.prices) throw new Error("Fiyat verisi alınamadı");
      const yeni = {
        prices: {
          ...sonuc.prices,
          funds: fonSonucu?.funds || piyasa.prices?.funds || {},
          stocks: Object.keys(hisseFiyatlari).length ? hisseFiyatlari : piyasa.prices?.stocks || {},
        },
        updatedAt: sonuc.updatedAt || new Date().toISOString(),
        sources: [
          ...(sonuc.sources || []),
          ...new Set(Object.values(fonSonucu?.funds || {}).map((fon) => fon.source)),
          ...new Set(
            Object.values(hisseFiyatlari).map((hisse) => hisse.source),
          ),
        ],
        yukleniyor: false,
        hata:
          sonuc.partial ||
          fonSonucu?.partial ||
          hisseSonucu?.partial ||
          hisseAbdSonucu?.partial ||
          (fonKodlari.length && !fonYanit?.ok) ||
          (hisseKodlari.length && !hisseYanit?.ok) ||
          (hisseAbdKodlari.length && !hisseAbdYanit?.ok)
            ? "Bazı otomatik fiyatlar şu anda alınamadı."
            : "",
      };
      setPiyasa(yeni);
      localStorage.setItem("borcama:piyasa:v1", JSON.stringify(yeni));
    } catch {
      setPiyasa((eski) => ({
        ...eski,
        yukleniyor: false,
        hata: Object.keys(eski.prices || {}).length
          ? "Canlı fiyatlar yenilenemedi; son alınan değerler gösteriliyor."
          : "Canlı fiyatlar alınamadı. Varlıklardaki manuel değerler kullanılıyor.",
      }));
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const s = await window.storage.get("borctakip:v1");
        if (s && s.value) {
          const kayitliVeri = {
            ...BOS_VERI,
            ...JSON.parse(s.value),
          };
          const demoKaydiBos =
            demoModu &&
            [
              "cards",
              "loans",
              "overdrafts",
              "others",
              "expenses",
              "incomes",
              "assets",
            ].every((alan) => !(kayitliVeri[alan] || []).length);
          const kaynakVeri = demoKaydiBos
            ? {
                ...demoVerisiOlustur(),
                ayarlar: {
                  ...demoVerisiOlustur().ayarlar,
                  ...(kayitliVeri.ayarlar || {}),
                  ilkKullanimRehberiV1: true,
                },
              }
            : kayitliVeri;
          const donemSonucu = ekstreDonemleriniDuzelt(kaynakVeri);
          const borcSonucu = ekstreBorcModeliniDuzelt(donemSonucu.veri);
          setVeri(borcSonucu.veri);
          if (demoKaydiBos || donemSonucu.degisti || borcSonucu.degisti)
            await window.storage.set(
              "borctakip:v1",
              JSON.stringify(borcSonucu.veri),
            );
        } else {
          const ilkVeri = demoModu
            ? demoVerisiOlustur()
            : {
                ...BOS_VERI,
                ayarlar: { ekstreDonemleriV2: true, ekstreBorcModeliV3: true },
              };
          setVeri(ilkVeri);
          if (demoModu)
            await window.storage.set("borctakip:v1", JSON.stringify(ilkVeri));
        }
      } catch (e) {
        setHata(
          "Verileriniz yüklenemedi. Lütfen bağlantınızı kontrol edip sayfayı yenileyin.",
        );
      } finally {
        setYukleniyor(false);
      }
    })();
  }, []);

  useEffect(() => {
    const geriIleri = () =>
      setSekmeState(YOL_SEKMELERI[window.location.pathname] || "ozet");
    window.addEventListener("popstate", geriIleri);
    return () => window.removeEventListener("popstate", geriIleri);
  }, []);

  useEffect(() => {
    if (yukleniyor || rehberKontrolEdildi) return;
    setRehberKontrolEdildi(true);
    const zorla = new URLSearchParams(window.location.search).get("rehber") === "1";
    const finansKaydiVar = [
      "cards",
      "loans",
      "overdrafts",
      "others",
      "expenses",
      "incomes",
      "assets",
    ].some((alan) => (veri[alan] || []).length > 0);
    if (
      zorla ||
      (!finansKaydiVar && !veri.ayarlar?.ilkKullanimRehberiV1)
    ) {
      rehberAdiminaGit(0);
    }
  }, [yukleniyor, rehberKontrolEdildi, veri]);

  useEffect(() => {
    supabase.auth
      .getUser()
      .then(async ({ data }) => {
        const kullanici = data?.user;
        setKullaniciEposta(kullanici?.email || "");
        if (!revenueCatHazir || !kullanici?.id) {
          setProPaketler({
            yukleniyor: false,
            monthly: null,
            annual: null,
            hata: "Pro fiyatları şu anda alınamıyor.",
          });
          return;
        }
        try {
          const paketler = await revenueCatProPaketleri(kullanici.id);
          setProPaketler({
            yukleniyor: false,
            monthly: paketler.monthly || null,
            annual: paketler.annual || null,
            hata: "",
          });
        } catch {
          setProPaketler({
            yukleniyor: false,
            monthly: null,
            annual: null,
            hata: "Pro fiyatları şu anda alınamıyor.",
          });
        }
      });
  }, []);

  async function reklamsizKontrol() {
    setReklamsiz((eski) => ({ ...eski, yukleniyor: true, hata: "" }));
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("Oturum bulunamadı");
      const kullanici = data.session?.user;
      const [shopierSonucu, revenueCatSonucu] = await Promise.allSettled([
        fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/shopier-entitlement`,
          { headers: { Authorization: `Bearer ${token}` } },
        ).then(async (cevap) => {
          if (!cevap.ok) throw new Error("Hak bilgisi alınamadı");
          return cevap.json();
        }),
        revenueCatHazir && kullanici?.id
          ? revenueCatProKontrol(kullanici.id)
          : Promise.resolve({ active: false, unavailable: true }),
      ]);
      const sonuc = shopierSonucu.status === "fulfilled" ? shopierSonucu.value : {};
      const rc = revenueCatSonucu.status === "fulfilled" ? revenueCatSonucu.value : {};
      if (shopierSonucu.status === "rejected" && revenueCatSonucu.status === "rejected")
        throw new Error("Hak bilgisi alınamadı");
      setReklamsiz({
        yukleniyor: false,
        aktif: !!sonuc.adFreeLifetime,
        proAktif: !!sonuc.proActive || !!rc.active,
        proBitis: rc.active ? rc.expiresAt : sonuc.proExpiresAt || null,
        proYonetimUrl: rc.managementURL || null,
        hata: "",
      });
    } catch {
      setReklamsiz({
        yukleniyor: false,
        aktif: false,
        proAktif: demoModu,
        proBitis: null,
        proYonetimUrl: null,
        hata: "Satın alma durumu şu anda kontrol edilemedi.",
      });
    }
  }

  async function proSatinAl(plan = "monthly") {
    if (!revenueCatHazir) {
      setProSatinAlma({
        yukleniyor: false,
        hata: "Ödeme sistemi şu anda kullanılamıyor. Lütfen biraz sonra tekrar deneyin.",
        plan: null,
      });
      return;
    }
    setProSatinAlma({ yukleniyor: true, hata: "", plan });
    try {
      const { data } = await supabase.auth.getSession();
      const kullanici = data.session?.user;
      if (!kullanici?.id) throw new Error("Oturum bulunamadı.");
      const sonuc = await revenueCatProSatinAl({
        userId: kullanici.id,
        email: kullanici.email,
        plan,
      });
      if (sonuc.cancelled) return;
      if (!sonuc.active) throw new Error("Satın alma tamamlanamadı.");
      setReklamsiz((eski) => ({
        ...eski,
        yukleniyor: false,
        proAktif: true,
        proBitis: sonuc.expiresAt || null,
        proYonetimUrl: sonuc.managementURL || null,
        hata: "",
      }));
      window.location.assign("/welcome");
    } catch (error) {
      setProSatinAlma({
        yukleniyor: false,
        hata: "Ödeme ekranı açılamadı. Lütfen tekrar deneyin.",
        plan: null,
      });
    } finally {
      setProSatinAlma((eski) => ({ ...eski, yukleniyor: false, plan: null }));
    }
  }

  useEffect(() => {
    reklamsizKontrol();
  }, []);

  useEffect(() => {
    if (!yukleniyor) piyasaFiyatlariniYenile();
  }, [yukleniyor, piyasaKodAnahtari]);

  function setSekme(yeniSekme) {
    setSekmeState(yeniSekme);
    const yol = SEKME_YOLLARI[yeniSekme];
    if (yol && window.location.pathname !== yol)
      window.history.pushState({}, "", yol);
  }

  function rehberAdiminaGit(adim) {
    const hedefler = ["ozet", "borclar", "odemeler", "harcamalar", "varliklar"];
    const guvenliAdim = Math.max(0, Math.min(adim, hedefler.length - 1));
    setRehber({ acik: true, adim: guvenliAdim });
    setForm(null);
    if (guvenliAdim === 1) setBorcKategori("cards");
    setSekme(hedefler[guvenliAdim]);
  }

  function rehberiKapat() {
    setRehber({ acik: false, adim: 0 });
    ayarKaydet({ ilkKullanimRehberiV1: true });
    const url = new URL(window.location.href);
    if (url.searchParams.has("rehber")) {
      url.searchParams.delete("rehber");
      window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    }
  }

  function rehberiBitir(kartEkle = false) {
    rehberiKapat();
    if (kartEkle) {
      setBorcKategori("cards");
      setSekme("borclar");
      setForm({ liste: "cards", veri: {} });
    } else {
      setSekme("ozet");
    }
  }

  async function kaydet(yeni) {
    const kalemler = borcKalemleri(yeni);
    const toplam = kalemler.reduce((t, k) => t + k.bakiye, 0);
    yeni = {
      ...yeni,
      snapshots: { ...(yeni.snapshots || {}), [ayAnahtari()]: toplam },
    };
    setVeri(yeni);
    setKaydediliyor(true);
    try {
      await window.storage.set("borctakip:v1", JSON.stringify(yeni));
      setHata("");
    } catch (e) {
      setHata(
        e?.message === "VERI_CAKISMASI"
          ? "Verileriniz başka bir cihazda değiştirilmiş. Kayıp yaşanmaması için sayfayı yenileyip tekrar deneyin."
          : "Kayıt sırasında bir sorun oluştu. Değişiklikler bu oturumda duruyor; bir sonraki işlemde tekrar denenecek.",
      );
    } finally {
      setKaydediliyor(false);
    }
  }

  const isDark = (veri.ayarlar || {}).tema === "dark";
  const ozelBankalar = (veri.ayarlar || {}).ozelBankalar || [];
  const bankalar = useMemo(
    () => [...new Set([...BANKALAR, ...ozelBankalar])],
    [ozelBankalar],
  );
  const temaAnahtarlarSwitch = () =>
    ayarKaydet({ tema: isDark ? "light" : "dark" });
  const t = isDark ? KOYU_TEMA : ACIK_TEMA;
  const rootStyle = {
    "--bg": t.bg,
    "--panel": t.panel,
    "--panel2": t.panel2,
    "--text": t.text,
    "--dim": t.dim,
    "--faint": t.faint,
    "--line": t.line,
  };

  const kalemler = useMemo(() => borcKalemleri(veri), [veri]);

  const toplamlar = useMemo(() => {
    const kart = kalemler
      .filter((k) => k.tur === "kart")
      .reduce((t, k) => t + k.bakiye, 0);
    const kredi = kalemler
      .filter((k) => k.tur === "kredi")
      .reduce((t, k) => t + k.bakiye, 0);
    const ek = kalemler
      .filter((k) => k.tur === "ek")
      .reduce((t, k) => t + k.bakiye, 0);
    const diger = kalemler
      .filter((k) => k.tur === "diger")
      .reduce((t, k) => t + k.bakiye, 0);
    return { kart, kredi, ek, diger, genel: kart + kredi + ek + diger };
  }, [kalemler]);

  const varlikOzeti = useMemo(
    () => varlikOzetiHesapla(veri.assets || [], piyasa.prices),
    [veri.assets, piyasa.prices],
  );

  const aylikFaiz = useMemo(
    () =>
      kalemler
        .filter((k) => !k.sabitTaksit)
        .reduce((t, k) => t + k.faizTutari, 0),
    [kalemler],
  );

  const buAyOdenecek = useMemo(() => {
    const kartOdeme = veri.cards.reduce((t, k) => {
      if (kartOdemeAyi(k) !== ayAnahtari()) return t;
      const h = kartHesabi(k);
      const hedef =
        k.toplamEkstreBorcu !== undefined || k.oncekiDonemBorcu !== undefined
          ? h.asgari
          : +k.asgari > 0
            ? +k.asgari
            : +k.borc > 0
              ? +k.borc
              : h.onceki;
      return t + Math.max(hedef - h.odeme, 0);
    }, 0);
    const ay = ayAnahtari();
    const taksit = veri.loans.reduce(
      (t, k) =>
        t +
        ((+k.kalanBorc || 0) <= 0 ||
        veri.paid?.["kredi-" + k.id + "-" + ay]
          ? 0
          : +k.taksit || 0),
      0,
    );
    return kartOdeme + taksit;
  }, [veri]);

  const gecenAyDelta = useMemo(() => {
    const buAy = ayAnahtari();
    const aylar = Object.keys(veri.snapshots || {})
      .filter((a) => a < buAy)
      .sort();
    if (aylar.length === 0) return null;
    const onceki = veri.snapshots[aylar[aylar.length - 1]];
    return { fark: toplamlar.genel - onceki, ay: aylar[aylar.length - 1] };
  }, [veri, toplamlar]);

  const yaklasan = useMemo(() => {
    const liste = [];
    const ay = ayAnahtari();
    veri.cards.forEach((k) => {
      const h = kartHesabi(k);
      const anaBorc = h.toplam;
      if (anaBorc > 0) {
        const yeniModel =
          k.toplamEkstreBorcu !== undefined || k.oncekiDonemBorcu !== undefined;
        const yasalOran = (+k.limit || 0) <= 50000 ? 0.2 : 0.4;
        const hedefTutar = yeniModel
          ? h.onceki * yasalOran
          : +k.asgari > 0
            ? +k.asgari
            : anaBorc * yasalOran;
        const odemeAnahtari = kartOdemeAnahtari(k);
        const elleOdendi = !!veri.paid[odemeAnahtari];
        const odemeBilgisiYok = !yeniModel && !elleOdendi;
        const odemeKayitlari = veri.cardPaymentHistory?.[odemeAnahtari] || [];
        const girilenOdeme = yeniModel ? h.odeme : 0;
        const yapilanOdeme = Math.min(
          elleOdendi ? Math.max(girilenOdeme, hedefTutar) : girilenOdeme,
          h.onceki || anaBorc,
        );
        const tutar = Math.max(hedefTutar - yapilanOdeme, 0);
        const kalanToplam = anaBorc;
        const minimumTamam = hedefTutar > 0 && tutar <= 0;
        const tamamiOdendi = kalanToplam <= 0;
        liste.push({
          id: "kart-" + k.id,
          kartOdemesi: true,
          banka: k.banka,
          ad: k.banka + (k.ad ? " · " + k.ad : ""),
          tutar,
          kalanToplam,
          minimumOdeme: hedefTutar,
          hedefTutar,
          yapilanOdeme,
          odemeKayitSayisi: odemeKayitlari.length,
          odemeBilgisiYok,
          not: "kalan minimum ödeme",
          tarih: kartGecikmeTarihi(k),
          odendi: minimumTamam,
          minimumTamam,
          tamamiOdendi,
          anahtar: odemeAnahtari,
        });
      }
    });
    veri.loans.forEach((k) => {
      if ((+k.kalanBorc || 0) > 0) {
        const elleOdendi = !!veri.paid["kredi-" + k.id + "-" + ay];
        liste.push({
          id: "kredi-" + k.id,
          banka: k.banka,
          ad: k.banka + (k.ad ? " · " + k.ad : ""),
          tutar: elleOdendi ? 0 : +k.taksit || 0,
          hedefTutar: +k.taksit || 0,
          yapilanOdeme: elleOdendi ? +k.taksit || 0 : 0,
          not: "kalan taksit",
          tarih: buAyOdemeTarihi(k.odemeGunu),
          odendi: elleOdendi,
          anahtar: "kredi-" + k.id + "-" + ay,
        });
      }
    });
    return liste.sort((a, b) => a.tarih - b.tarih);
  }, [veri]);

  const gelecekOdemeler = useMemo(() => {
    const simdi = bugun();
    const yil = simdi.getFullYear();
    const ay = simdi.getMonth() + 1;
    return veri.loans
      .filter((k) => (+k.kalanBorc || 0) > 0 && (+k.taksit || 0) > 0)
      .map((k) => {
        const gun = Math.min(
          Math.max(parseInt(k.odemeGunu) || 1, 1),
          new Date(yil, ay + 1, 0).getDate(),
        );
        return {
          id: "gelecek-kredi-" + k.id,
          banka: k.banka,
          ad: k.banka + (k.ad ? " · " + k.ad : ""),
          tutar: +k.taksit || 0,
          hedefTutar: +k.taksit || 0,
          yapilanOdeme: 0,
          not: "gelecek ay taksiti",
          tarih: new Date(yil, ay, gun),
          odendi: false,
          anahtar: "kredi-" + k.id + "-" + ayAnahtari(new Date(yil, ay, 1)),
        };
      })
      .sort((a, b) => a.tarih - b.tarih);
  }, [veri]);

  const buAyHarcama = useMemo(() => {
    const ay = ayAnahtari();
    const buAy = veri.expenses.filter((h) => (h.tarih || "").startsWith(ay));
    const toplam = buAy.reduce((t, h) => t + (+h.tutar || 0), 0);
    const kategoriler = {};
    const kaynaklar = {};
    buAy.forEach((h) => {
      kategoriler[h.kategori] =
        (kategoriler[h.kategori] || 0) + (+h.tutar || 0);
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
      const dahil =
        g.tekrar === "Tek seferlik" ? (g.tarih || "").startsWith(ay) : true;
      if (dahil) {
        toplam += +g.tutar || 0;
        kaynaklar[g.ad] = (kaynaklar[g.ad] || 0) + (+g.tutar || 0);
      }
    });
    return { toplam, kaynaklar };
  }, [veri]);

  const netNakit =
    buAyGelir.toplam > 0
      ? buAyGelir.toplam - buAyOdenecek - buAyHarcama.toplam
      : null;

  const borcamaOnerileri = useMemo(
    () =>
      borcamaOnerileriniHesapla({
        veri,
        kalemler,
        yaklasan,
        buAyHarcama,
        netNakit,
      }),
    [veri, kalemler, yaklasan, buAyHarcama, netNakit],
  );

  function ekleGuncelle(liste, kayit) {
    const dizi = veri[liste];
    const varMi = dizi.some((x) => x.id === kayit.id);
    kaydet({
      ...veri,
      [liste]: varMi
        ? dizi.map((x) => (x.id === kayit.id ? kayit : x))
        : [...dizi, kayit],
    });
    setForm(null);
  }
  const sil = (liste, id) =>
    kaydet({ ...veri, [liste]: veri[liste].filter((x) => x.id !== id) });
  const odendiIsaretle = (anahtar, durum) => {
    const yeniPaid = { ...veri.paid, [anahtar]: durum };
    if (!anahtar.startsWith("kredi-"))
      return kaydet({ ...veri, paid: yeniPaid });
    const ay = anahtar.slice(-7);
    const id = anahtar.slice(6, -8);
    const kredi = veri.loans.find((x) => x.id === id);
    const ayGecmisi = { ...(veri.loanPaymentHistory?.[ay] || {}) };
    if (durum && kredi)
      ayGecmisi[id] = {
        krediId: id,
        banka: kredi.banka,
        ad: kredi.ad,
        taksit: kredi.taksit,
        kalanBorc: kredi.kalanBorc,
        kalanTaksit: kredi.kalanTaksit,
        odemeGunu: kredi.odemeGunu,
        odendiTarihi: new Date().toISOString(),
      };
    else delete ayGecmisi[id];
    const loanPaymentHistory = {
      ...(veri.loanPaymentHistory || {}),
      [ay]: ayGecmisi,
    };
    return kaydet({ ...veri, paid: yeniPaid, loanPaymentHistory });
  };
  const kartOdemesiKaydet = (anahtar, tutar, tur) => {
    const temizTutar = Math.max(+tutar || 0, 0);
    if (!anahtar || temizTutar <= 0) return;
    const oncekiKayitlar = veri.cardPaymentHistory?.[anahtar] || [];
    const yeniKayit = {
      id: "kart-odeme-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
      tutar: temizTutar,
      tur,
      tarih: new Date().toISOString(),
    };
    const eslesme = anahtar.match(/^kart-(.+)-ekstre-(\d{4}-\d{2})$/);
    const kartId = eslesme?.[1];
    const ekstreAyi = eslesme?.[2];
    const cards = (veri.cards || []).map((kart) => {
      if (kart.id !== kartId) return kart;
      if (kart.ekstreAyi === ekstreAyi) {
        const azami = kartHesabi(kart).onceki;
        return {
          ...kart,
          yapilanOdeme: Math.min(
            (+kart.yapilanOdeme || 0) + temizTutar,
            azami,
          ),
        };
      }
      return {
        ...kart,
        ekstreGecmisi: (kart.ekstreGecmisi || []).map((ekstre) => {
          if (ekstre.ekstreAyi !== ekstreAyi) return ekstre;
          const azami = kartHesabi({ ...kart, ...ekstre }).onceki;
          return {
            ...ekstre,
            yapilanOdeme: Math.min(
              (+ekstre.yapilanOdeme || 0) + temizTutar,
              azami,
            ),
          };
        }),
      };
    });
    return kaydet({
      ...veri,
      cards,
      cardPaymentHistory: {
        ...(veri.cardPaymentHistory || {}),
        [anahtar]: [...oncekiKayitlar, yeniKayit],
      },
    });
  };
  const ayarKaydet = (a) =>
    kaydet({ ...veri, ayarlar: { ...veri.ayarlar, ...a } });
  const bankaEkle = (ad) => {
    const temiz = ad.trim();
    if (!temiz) return "";
    const mevcut = bankalar.find(
      (b) => b.toLocaleLowerCase("tr-TR") === temiz.toLocaleLowerCase("tr-TR"),
    );
    if (mevcut) return mevcut;
    ayarKaydet({ ozelBankalar: [...ozelBankalar, temiz] });
    return temiz;
  };

  function harcamaKaydet(kayit, kartaEkle) {
    const dizi = veri.expenses;
    const varMi = dizi.some((x) => x.id === kayit.id);
    let yeni = {
      ...veri,
      expenses: varMi
        ? dizi.map((x) => (x.id === kayit.id ? kayit : x))
        : [...dizi, kayit],
    };
    if (kartaEkle && !varMi) {
      yeni = {
        ...yeni,
        cards: yeni.cards.map((c) => {
          if (c.banka + " · " + (c.ad || "Kredi kartı") !== kayit.kaynak)
            return c;
          return {
            ...c,
            donemIciEklenen: (+c.donemIciEklenen || 0) + (+kayit.tutar || 0),
          };
        }),
      };
    }
    kaydet(yeni);
    setForm(null);
  }

  async function geriBildirimGonder(e) {
    e.preventDefault();
    const mesaj = geriBildirimFormu.mesaj.trim();
    if (mesaj.length < 3) return;
    const kayit = {
      id: uid(),
      tur: geriBildirimFormu.tur,
      mesaj: mesaj.slice(0, 1000),
      ekran: window.location.pathname,
      created_at: new Date().toISOString(),
      durum: "yeni",
    };
    await kaydet({ ...veri, feedbacks: [...(veri.feedbacks || []), kayit] });
    setGeriBildirimGonderildi(true);
    setGeriBildirimFormu({ tur: "Fikir", mesaj: "" });
  }

  function geriBildirimKapat() {
    setGeriBildirimPenceresi(false);
    setGeriBildirimGonderildi(false);
    setGeriBildirimFormu({ tur: "Fikir", mesaj: "" });
  }

  async function parolaKaydet(e) {
    e.preventDefault();
    if (parolaFormu.parola.length < 8)
      return setParolaDurumu({
        kaydediliyor: false,
        hata: "Parolanız en az 8 karakter olmalı.",
        tamam: false,
      });
    if (parolaFormu.parola !== parolaFormu.tekrar)
      return setParolaDurumu({
        kaydediliyor: false,
        hata: "Parolalar birbiriyle eşleşmiyor.",
        tamam: false,
      });
    setParolaDurumu({ kaydediliyor: true, hata: "", tamam: false });
    const { error } = await supabase.auth.updateUser({
      password: parolaFormu.parola,
    });
    setParolaDurumu(
      error
        ? {
            kaydediliyor: false,
            hata: "Parola kaydedilemedi. Lütfen tekrar deneyin.",
            tamam: false,
          }
        : { kaydediliyor: false, hata: "", tamam: true },
    );
    if (!error) setParolaFormu({ parola: "", tekrar: "", gorunur: false });
  }

  function parolaPenceresiniKapat() {
    setParolaPenceresi(false);
    setParolaFormu({ parola: "", tekrar: "", gorunur: false });
    setParolaDurumu({ kaydediliyor: false, hata: "", tamam: false });
  }

  const s = bugun();
  const anaSekme =
    sekme === "plan"
      ? "ozet"
      : sekme === "gelir" || sekme === "harcamalar" || sekme === "odemeler"
        ? "hareketler"
        : sekme;

  function anaSekmeyeGit(hedef) {
    if (hedef === "hareketler")
      setSekme(
        sekme === "gelir" || sekme === "harcamalar" || sekme === "odemeler"
          ? sekme
          : "harcamalar",
      );
    else if (hedef === "borclar") setSekme("borclar");
    else setSekme(hedef);
    setForm(null);
    setHizliMenuAcik(false);
  }

  return (
    <div className="bt-app" style={rootStyle}>
      <style>{CSS}</style>
      <datalist id="bt-bankalar">
        {bankalar.map((b) => (
          <option key={b} value={b} />
        ))}
      </datalist>
      <div className="bt-wrap">
        <header className="bt-header">
          <div>
            <img
              src="/borcama-logo.png"
              alt="Borcama"
              style={{
                width: "clamp(150px,22vw,220px)",
                height: "auto",
                display: "block",
              }}
            />
          </div>
          <div className="bt-headright">
            {planOnizlemesiAktif && (
              <div className="bt-demo-plan" aria-label="Paket görünümü önizlemesi">
                <span>Demo görünümü</span>
                <button
                  type="button"
                  className={demoPlan === "free" ? "aktif" : ""}
                  onClick={() => demoPlaniDegistir("free")}
                  aria-pressed={demoPlan === "free"}
                >
                  Ücretsiz
                </button>
                <button
                  type="button"
                  className={demoPlan === "pro" ? "aktif" : ""}
                  onClick={() => demoPlaniDegistir("pro")}
                  aria-pressed={demoPlan === "pro"}
                >
                  Pro
                </button>
              </div>
            )}
            <div className="bt-date">
              {s.getDate()} {AYLAR[s.getMonth()]} {s.getFullYear()}
              {kaydediliyor && (
                <span style={{ marginLeft: 8 }}>● kaydediliyor</span>
              )}
            </div>
            {!reklamsiz.yukleniyor && !etkinPro && (
              <button
                className="bt-upgrade-link"
                type="button"
                onClick={() => window.location.assign("/upgrade?plan=monthly")}
              >
                <Sparkles size={14} /> Pro'ya Geç
              </button>
            )}
            <button
              className={
                "bt-settings-link " + (sekme === "ayarlar" ? "aktif" : "")
              }
              onClick={() => {
                setSekme("ayarlar");
                setForm(null);
              }}
            >
              <Settings size={14} /> Ayarlar
            </button>
            <button
              className="bt-themebtn"
              onClick={temaAnahtarlarSwitch}
              title="Tema değiştir"
            >
              <span
                className="bt-themeknob"
                style={{ left: isDark ? 26 : 2 }}
              />
            </button>
            <div className="bt-themelabel">{isDark ? "Koyu" : "Açık"}</div>
            <button className="bt-exit" onClick={cikisYap}>
              Çıkış →
            </button>
          </div>
        </header>

        <nav className="bt-nav bt-nav-ana">
          {[
            ["ozet", "Bugün", BarChart3],
            ["borclar", "Borçlar", Wallet],
            ["hareketler", "Hareketler", ArrowLeftRight],
            ["varliklar", "Varlıklar", PiggyBank],
          ].map(([k, ad, Ikon]) => (
            <button
              key={k}
              className={"bt-pill " + (anaSekme === k ? "aktif" : "pasif")}
              onClick={() => anaSekmeyeGit(k)}
              aria-label={ad}
            >
              <Ikon aria-hidden="true" />
              <span>{ad}</span>
            </button>
          ))}
        </nav>

        {anaSekme === "borclar" && (
          <nav className="bt-nav bt-nav-alt" aria-label="Borç bölümleri">
            {[
              ["cards", "Kartlar"],
              ["loans", "Krediler"],
              ["od", "Ek Hesap"],
            ].map(([k, ad]) => {
              const aktif =
                sekme === "borclar" &&
                (borcKategori === k ||
                  (k === "cards" && borcKategori === "kontrol"));
              return (
                <button
                  key={k}
                  className={"bt-pill " + (aktif ? "aktif" : "pasif")}
                  onClick={() => {
                    setBorcKategori(k);
                    setSekme("borclar");
                    setForm(null);
                  }}
                >
                  {ad}
                </button>
              );
            })}
          </nav>
        )}

        {anaSekme === "hareketler" && (
          <nav className="bt-nav bt-nav-alt" aria-label="Para hareketleri">
            {[
              ["harcamalar", "Harcamalar"],
              ["gelir", "Gelirler"],
              ["odemeler", "Ödemeler"],
            ].map(([k, ad]) => (
              <button
                key={k}
                className={"bt-pill " + (sekme === k ? "aktif" : "pasif")}
                onClick={() => {
                  setSekme(k);
                  setForm(null);
                }}
              >
                {ad}
              </button>
            ))}
          </nav>
        )}

        {yukleniyor ? (
          <div className="bt-bos">Verileriniz yükleniyor…</div>
        ) : (
          <>
            {hata && (
              <div
                className="bt-card"
                style={{ borderColor: CORAL, marginBottom: 16, fontSize: 13 }}
              >
                {hata}
              </div>
            )}
            {sekme === "ozet" && (
              <Ozet
                toplamlar={toplamlar}
                kalemler={kalemler}
                aylikFaiz={aylikFaiz}
                gecenAyDelta={gecenAyDelta}
                buAyOdenecek={buAyOdenecek}
                yaklasan={yaklasan}
                buAyHarcama={buAyHarcama}
                buAyGelir={buAyGelir}
                netNakit={netNakit}
                odendiIsaretle={odendiIsaretle}
                setSekme={setSekme}
                tutarlarGizli={!!veri.ayarlar?.ozetTutarlariGizli}
                tutarlariGizle={(gizli) =>
                  ayarKaydet({ ozetTutarlariGizli: gizli })
                }
                varlikOzeti={varlikOzeti}
                oneriler={borcamaOnerileri}
                proAktif={etkinPro}
                proAc={() => setProPenceresiAcik(true)}
              />
            )}
            {sekme === "borclar" && (
              <Borclar
                veri={veri}
                form={form}
                setForm={setForm}
                ekleGuncelle={ekleGuncelle}
                sil={sil}
                odendiIsaretle={odendiIsaretle}
                bankalar={bankalar}
                bankaEkle={bankaEkle}
                kategori={borcKategori}
                setKategori={setBorcKategori}
              />
            )}
            {sekme === "odemeler" && (
              <Odemeler
                veri={veri}
                yaklasan={yaklasan}
                gelecekOdemeler={gelecekOdemeler}
                odendiIsaretle={odendiIsaretle}
                kartOdemesiKaydet={kartOdemesiKaydet}
                filtre={odemeFiltresi}
                filtreDegistir={setOdemeFiltresi}
              />
            )}
            {sekme === "plan" && (
              <Plan
                kalemler={kalemler}
                aylikFaiz={aylikFaiz}
                setSekme={setSekme}
              />
            )}
            {sekme === "gelir" && (
              <Gelirler
                veri={veri}
                form={form}
                setForm={setForm}
                ekleGuncelle={ekleGuncelle}
                sil={sil}
                buAyGelir={buAyGelir}
              />
            )}
            {sekme === "harcamalar" && (
              <Harcamalar
                veri={veri}
                form={form}
                setForm={setForm}
                harcamaKaydet={harcamaKaydet}
                sil={sil}
                buAyHarcama={buAyHarcama}
                bankalar={bankalar}
              />
            )}
            {sekme === "varliklar" && (
              <Varliklar
                veri={veri}
                form={form}
                setForm={setForm}
                ekleGuncelle={ekleGuncelle}
                sil={sil}
                piyasa={piyasa}
                piyasaYenile={piyasaFiyatlariniYenile}
                ozet={varlikOzeti}
              />
            )}
            {sekme === "ayarlar" && (
              <Ayarlar
                eposta={kullaniciEposta}
                isDark={isDark}
                reklamsiz={{ ...reklamsiz, proAktif: etkinPro }}
                reklamsizKontrol={reklamsizKontrol}
                proSatinAl={proSatinAl}
                proSatinAlma={proSatinAlma}
                proPaketler={proPaketler}
                temaDegistir={temaAnahtarlarSwitch}
                parolaAc={() => setParolaPenceresi(true)}
                rehberAc={() => rehberAdiminaGit(0)}
                cikisYap={cikisYap}
              />
            )}
          </>
        )}
      </div>
      {hizliMenuAcik && (
        <div className="bt-quick-menu" id="bt-hizli-islemler" role="menu">
          <button type="button" role="menuitem" onClick={() => {
            setSekme("harcamalar");
            setForm({ liste: "expenses", veri: {} });
            setHizliMenuAcik(false);
          }}>
            <Plus /><span><strong>Harcama ekle</strong><small>Tutarı ve ödeme kaynağını kaydet.</small></span>
          </button>
          <button type="button" role="menuitem" onClick={() => {
            setOdemeFiltresi("bekleyen");
            setSekme("odemeler");
            setForm(null);
            setHizliMenuAcik(false);
          }}>
            <CalendarCheck /><span><strong>Ödeme gir</strong><small>Bekleyen kart veya kredi ödemesini seç.</small></span>
          </button>
          <button type="button" role="menuitem" onClick={() => {
            setBorcKategori("cards");
            setSekme("borclar");
            setForm(null);
            setHizliMenuAcik(false);
          }}>
            <ReceiptText /><span><strong>Ekstre ekle</strong><small>Kartını seçip yeni dönem ekstresini gir.</small></span>
          </button>
          <button type="button" role="menuitem" onClick={() => {
            setBorcKategori("cards");
            setSekme("borclar");
            setForm(null);
            setHizliMenuAcik(false);
          }}>
            <Wallet /><span><strong>Yeni borç ekle</strong><small>Kart, kredi veya ek hesap türünü seç.</small></span>
          </button>
        </div>
      )}
      <button
        className="bt-quick-add"
        type="button"
        aria-label={hizliMenuAcik ? "Hızlı işlemleri kapat" : "Hızlı işlem ekle"}
        aria-expanded={hizliMenuAcik}
        aria-controls="bt-hizli-islemler"
        title="Hızlı işlem ekle"
        onClick={() => setHizliMenuAcik((acik) => !acik)}
      >
        {hizliMenuAcik ? <X size={18} /> : <Plus size={18} />} <span>Hızlı işlem</span>
      </button>
      <button
        className="bt-feedback-trigger"
        onClick={() => setGeriBildirimPenceresi(true)}
      >
        <MessageCircle size={16} /> Görüş bildir
      </button>
      <ProTanitimPenceresi
        acik={proPenceresiAcik}
        kapat={() => setProPenceresiAcik(false)}
        proSatinAl={proSatinAl}
        proSatinAlma={proSatinAlma}
        proPaketler={proPaketler}
      />
      <IlkKullanimRehberi
        acik={rehber.acik}
        adim={rehber.adim}
        adimaGit={rehberAdiminaGit}
        kapat={rehberiKapat}
        bitir={rehberiBitir}
        kartVar={(veri.cards || []).length > 0}
      />
      {geriBildirimPenceresi && (
        <div
          className="bt-modal-arka"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) geriBildirimKapat();
          }}
        >
          <form
            className="bt-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bt-feedback-baslik"
            onSubmit={geriBildirimGonder}
          >
            {geriBildirimGonderildi ? (
              <>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    border: "2px solid var(--line)",
                    borderRadius: 13,
                    background: LIME,
                    display: "grid",
                    placeItems: "center",
                    marginBottom: 14,
                  }}
                >
                  <Check size={21} />
                </div>
                <div
                  id="bt-feedback-baslik"
                  className="bt-h2"
                  style={{ marginBottom: 8 }}
                >
                  Görüşün bize ulaştı.
                </div>
                <div
                  style={{
                    fontSize: 12.5,
                    color: "var(--dim)",
                    lineHeight: 1.55,
                  }}
                >
                  Teşekkürler. Bu geri bildirim Borcama yönetim ekranında
                  değerlendirilmek üzere kaydedildi.
                </div>
                <div className="bt-form-butonlar">
                  <button
                    className="bt-btn birincil"
                    type="button"
                    onClick={geriBildirimKapat}
                  >
                    Tamam
                  </button>
                </div>
              </>
            ) : (
              <>
                <div
                  id="bt-feedback-baslik"
                  className="bt-h2"
                  style={{ marginBottom: 8 }}
                >
                  <MessageCircle size={19} /> Görüş bildir
                </div>
                <div
                  style={{
                    fontSize: 12.5,
                    color: "var(--dim)",
                    lineHeight: 1.55,
                    marginBottom: 16,
                  }}
                >
                  Borcama’yı daha iyi yapmak için fikrini veya yaşadığın sorunu
                  paylaş.
                </div>
                <label className="bt-alan" style={{ display: "grid" }}>
                  Geri bildirim türü
                  <select
                    className="bt-input"
                    value={geriBildirimFormu.tur}
                    onChange={(e) =>
                      setGeriBildirimFormu({
                        ...geriBildirimFormu,
                        tur: e.target.value,
                      })
                    }
                  >
                    <option>Fikir</option>
                    <option>İyileştirme</option>
                    <option>Sorun</option>
                  </select>
                </label>
                <label
                  className="bt-alan"
                  style={{ display: "grid", marginTop: 12 }}
                >
                  Mesaj
                  <textarea
                    className="bt-input bt-feedback-textarea"
                    maxLength={1000}
                    placeholder="Ne düşünüyorsun?"
                    value={geriBildirimFormu.mesaj}
                    onChange={(e) =>
                      setGeriBildirimFormu({
                        ...geriBildirimFormu,
                        mesaj: e.target.value,
                      })
                    }
                  />
                </label>
                <div
                  style={{
                    fontSize: 10.5,
                    color: "var(--faint)",
                    textAlign: "right",
                    marginTop: 5,
                  }}
                >
                  {geriBildirimFormu.mesaj.length}/1000
                </div>
                <div className="bt-form-butonlar">
                  <button
                    className="bt-btn birincil"
                    type="submit"
                    disabled={geriBildirimFormu.mesaj.trim().length < 3}
                  >
                    <Send size={14} /> Gönder
                  </button>
                  <button
                    className="bt-btn ikincil"
                    type="button"
                    onClick={geriBildirimKapat}
                  >
                    Vazgeç
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      )}
      {parolaPenceresi && (
        <div
          className="bt-modal-arka"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) parolaPenceresiniKapat();
          }}
        >
          <form
            className="bt-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bt-parola-baslik"
            onSubmit={parolaKaydet}
          >
            {parolaDurumu.tamam ? (
              <>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    border: "2px solid var(--line)",
                    borderRadius: 13,
                    background: LIME,
                    display: "grid",
                    placeItems: "center",
                    marginBottom: 14,
                  }}
                >
                  <Check size={21} />
                </div>
                <div
                  id="bt-parola-baslik"
                  className="bt-h2"
                  style={{ marginBottom: 8 }}
                >
                  Parolan hazır.
                </div>
                <div
                  style={{
                    fontSize: 12.5,
                    color: "var(--dim)",
                    lineHeight: 1.55,
                  }}
                >
                  Bundan sonra giriş ekranından e-posta ve parolanla giriş
                  yapabilirsin. E-posta linki seçeneği de kullanılmaya devam
                  edecek.
                </div>
                <div className="bt-form-butonlar">
                  <button
                    className="bt-btn birincil"
                    type="button"
                    onClick={parolaPenceresiniKapat}
                  >
                    Tamam
                  </button>
                </div>
              </>
            ) : (
              <>
                <div
                  id="bt-parola-baslik"
                  className="bt-h2"
                  style={{ marginBottom: 8 }}
                >
                  <KeyRound size={19} /> Parola belirle veya değiştir
                </div>
                <div
                  style={{
                    fontSize: 12.5,
                    color: "var(--dim)",
                    lineHeight: 1.55,
                    marginBottom: 16,
                  }}
                >
                  En az 8 karakterli bir parola belirle. Parolan Supabase
                  tarafından güvenli biçimde saklanır.
                </div>
                {parolaDurumu.hata && (
                  <div
                    className="bt-card"
                    style={{
                      padding: 10,
                      borderColor: CORAL,
                      color: CORAL,
                      fontSize: 12,
                      marginBottom: 12,
                    }}
                  >
                    {parolaDurumu.hata}
                  </div>
                )}
                <label className="bt-alan" style={{ display: "grid" }}>
                  Yeni parola
                  <div style={{ position: "relative" }}>
                    <input
                      className="bt-input"
                      style={{ paddingRight: 45 }}
                      type={parolaFormu.gorunur ? "text" : "password"}
                      value={parolaFormu.parola}
                      onChange={(e) =>
                        setParolaFormu({
                          ...parolaFormu,
                          parola: e.target.value,
                        })
                      }
                      autoFocus
                      required
                    />
                    <button
                      className="bt-btn hayalet"
                      style={{ position: "absolute", right: 5, top: 5 }}
                      type="button"
                      aria-label={
                        parolaFormu.gorunur
                          ? "Parolayı gizle"
                          : "Parolayı göster"
                      }
                      onClick={() =>
                        setParolaFormu({
                          ...parolaFormu,
                          gorunur: !parolaFormu.gorunur,
                        })
                      }
                    >
                      {parolaFormu.gorunur ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </label>
                <label
                  className="bt-alan"
                  style={{ display: "grid", marginTop: 12 }}
                >
                  Yeni parola tekrar
                  <input
                    className="bt-input"
                    type={parolaFormu.gorunur ? "text" : "password"}
                    value={parolaFormu.tekrar}
                    onChange={(e) =>
                      setParolaFormu({ ...parolaFormu, tekrar: e.target.value })
                    }
                    required
                  />
                </label>
                <div className="bt-form-butonlar">
                  <button
                    className="bt-btn birincil"
                    type="submit"
                    disabled={parolaDurumu.kaydediliyor}
                  >
                    <KeyRound size={14} />
                    {parolaDurumu.kaydediliyor
                      ? "Kaydediliyor…"
                      : "Parolayı kaydet"}
                  </button>
                  <button
                    className="bt-btn ikincil"
                    type="button"
                    onClick={parolaPenceresiniKapat}
                  >
                    Vazgeç
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      )}
    </div>
  );
}

const REHBER_ADIMLARI = [
  {
    hedef: "ozet",
    etiket: "Başlangıç",
    baslik: "Finansal durumun tek bir yerde.",
    aciklama:
      "Borcama; borçlarını, ödeme takvimini, hareketlerini ve varlıklarını aynı görünümde toplar. Rehber boyunca gerçek ekranlar arasında ilerleyeceksin.",
    maddeler: [
      "Toplam borcunu ve bu ay ödenecekleri gör",
      "Kalan borç ile varlıklarını birlikte takip et",
    ],
    kartBaslik: "Bugünkü görünüm",
    kartDeger: "Tek net tablo",
    kartAlt: "Borçlar · Ödemeler · Varlıklar",
    satirlar: [
      ["Yaklaşan ödemeler", "Takvimde"],
      ["Finansal ilerleme", "Görünür"],
    ],
  },
  {
    hedef: "borclar",
    etiket: "Borçlar",
    baslik: "Önce borç kaynaklarını ekle.",
    aciklama:
      "Kredi kartı, kredi ve ek hesap bilgilerini bir kez tanımla. Sonraki aylarda yalnızca yeni ekstreyi ve yaptığın ödemeyi girmen yeterli.",
    maddeler: [
      "Kart limiti, kesim günü ve son ödeme gününü kaydet",
      "Yeni ekstreleri dönem dönem ekle ve geçmişe dön",
    ],
    kartBaslik: "Kredi kartı",
    kartDeger: "Yeni ekstre",
    kartAlt: "Dönem ve kalan borç birlikte",
    satirlar: [
      ["Gerçek ekstre", "₺ 42.600"],
      ["Kalan borç", "₺ 18.400"],
    ],
  },
  {
    hedef: "odemeler",
    etiket: "Ödemeler",
    baslik: "Bu ay ne ödeyeceğin belli olsun.",
    aciklama:
      "Bekleyen ödemeleri tek listede gör. Kart ödemeni minimum, kısmi veya tamamı olarak gir; kalan tutarlar kendiliğinden güncellensin.",
    maddeler: [
      "Toplam borç ile zorunlu minimumu ayrı gör",
      "Ödeme kayıtlarını geçmişte dönem bazında kontrol et",
    ],
    kartBaslik: "Aylık ödeme listesi",
    kartDeger: "%50 tamamlandı",
    kartAlt: "Yapılan ve kalan ödeme",
    satirlar: [
      ["Toplam minimum", "₺ 12.840"],
      ["Kalan ödeme", "₺ 24.200"],
    ],
  },
  {
    hedef: "harcamalar",
    etiket: "Gelir/Gider",
    baslik: "Harcamayı olduğunda kaydet.",
    aciklama:
      "Hızlı ekleme düğmesiyle harcamanı birkaç saniyede yaz. Hangi karttan yapıldığını seçtiğinde dönem sonunda banka ekstresiyle karşılaştırabilirsin.",
    maddeler: [
      "Harcamayı kart, hesap veya nakit kaynağına bağla",
      "Gelir ve harcamaları aylık olarak takip et",
    ],
    kartBaslik: "Hızlı hareket",
    kartDeger: "+ Harcama ekle",
    kartAlt: "Tutar · kategori · ödeme kaynağı",
    satirlar: [
      ["Manuel kayıtlar", "Toplanıyor"],
      ["Ekstre kontrolü", "Hazır"],
    ],
  },
  {
    hedef: "varliklar",
    etiket: "Hazırsın",
    baslik: "Şimdi kendi planını oluşturmaya başla.",
    aciklama:
      "İlk kartını veya borcunu eklediğinde özetin oluşmaya başlar. Varlıklarını da eklersen borçlarınla birlikte genel finansal durumunu görebilirsin.",
    maddeler: [
      "Döviz, emtia, fon, hisse, kripto ve BES takibi",
      "Borç kapatma planı ve ödeme ilerlemesi",
    ],
    kartBaslik: "Borcama",
    kartDeger: "Planın hazır",
    kartAlt: "Her ay güncelle, ilerlemeni gör",
    satirlar: [
      ["İlk adım", "Bir borç ekle"],
      ["Sonra", "Ödemeyi takip et"],
    ],
  },
];

function IlkKullanimRehberi({
  acik,
  adim,
  adimaGit,
  kapat,
  bitir,
  kartVar,
}) {
  const [hedefKutu, setHedefKutu] = useState(null);

  useEffect(() => {
    if (!acik) return;
    let zamanlayici;
    let kare;
    const icerik = REHBER_ADIMLARI[adim];
    const olc = () => {
      const hedef = document.querySelector(`[data-tour="${icerik.hedef}"]`);
      if (!hedef) return setHedefKutu(null);
      const r = hedef.getBoundingClientRect();
      const bosluk = window.innerWidth <= 700 ? 5 : 9;
      setHedefKutu({
        top: Math.max(r.top - bosluk, 6),
        left: Math.max(r.left - bosluk, 6),
        right: Math.min(r.right + bosluk, window.innerWidth - 6),
        bottom: Math.min(r.bottom + bosluk, window.innerHeight - 6),
      });
    };
    const hedefeGit = () => {
      const hedef = document.querySelector(`[data-tour="${icerik.hedef}"]`);
      if (!hedef) return olc();
      const r = hedef.getBoundingClientRect();
      if (r.top < 18 || r.bottom > window.innerHeight - 18)
        hedef.scrollIntoView({ behavior: "smooth", block: "center" });
      olc();
      zamanlayici = window.setTimeout(olc, 360);
    };
    const klavye = (e) => {
      if (e.key === "Escape") kapat();
      if (e.key === "ArrowRight" && adim < REHBER_ADIMLARI.length - 1)
        adimaGit(adim + 1);
      if (e.key === "ArrowLeft" && adim > 0) adimaGit(adim - 1);
    };
    kare = window.requestAnimationFrame(() =>
      window.requestAnimationFrame(hedefeGit),
    );
    window.addEventListener("keydown", klavye);
    window.addEventListener("resize", olc);
    window.addEventListener("scroll", olc, true);
    return () => {
      window.clearTimeout(zamanlayici);
      window.cancelAnimationFrame(kare);
      window.removeEventListener("keydown", klavye);
      window.removeEventListener("resize", olc);
      window.removeEventListener("scroll", olc, true);
    };
  }, [acik, adim, adimaGit, kapat]);

  if (!acik) return null;
  const icerik = REHBER_ADIMLARI[adim];
  const sonAdim = adim === REHBER_ADIMLARI.length - 1;
  const genislik = typeof window === "undefined" ? 1200 : window.innerWidth;
  const yukseklik = typeof window === "undefined" ? 800 : window.innerHeight;
  const mobil = genislik <= 700;
  const panelGenisligi = Math.min(390, genislik - 28);
  let panelStili = mobil
    ? { left: 12, right: 12, bottom: 76 }
    : { left: (genislik - panelGenisligi) / 2, bottom: 22 };
  if (!mobil && hedefKutu) {
    if (hedefKutu.right + panelGenisligi + 24 < genislik)
      panelStili = {
        left: hedefKutu.right + 18,
        top: Math.max(18, Math.min(hedefKutu.top, yukseklik - 440)),
      };
    else if (hedefKutu.left - panelGenisligi - 24 > 0)
      panelStili = {
        left: hedefKutu.left - panelGenisligi - 18,
        top: Math.max(18, Math.min(hedefKutu.top, yukseklik - 440)),
      };
  }

  return (
    <div className="bt-product-tour" role="presentation">
      {hedefKutu ? (
        <>
          <div className="bt-product-tour-golge" style={{ inset: `0 0 auto 0`, height: hedefKutu.top }} />
          <div className="bt-product-tour-golge" style={{ top: hedefKutu.bottom, right: 0, bottom: 0, left: 0 }} />
          <div className="bt-product-tour-golge" style={{ top: hedefKutu.top, left: 0, width: hedefKutu.left, height: hedefKutu.bottom - hedefKutu.top }} />
          <div className="bt-product-tour-golge" style={{ top: hedefKutu.top, right: 0, width: genislik - hedefKutu.right, height: hedefKutu.bottom - hedefKutu.top }} />
          <div
            className="bt-product-tour-hedef"
            style={{
              top: hedefKutu.top,
              left: hedefKutu.left,
              width: hedefKutu.right - hedefKutu.left,
              height: hedefKutu.bottom - hedefKutu.top,
            }}
          />
        </>
      ) : (
        <div className="bt-product-tour-golge" style={{ inset: 0 }} />
      )}
      <section
        className="bt-product-tour-panel"
        style={{ ...panelStili, width: panelGenisligi }}
        role="dialog"
        aria-modal="false"
        aria-labelledby="bt-tour-baslik"
      >
        <button
          className="bt-product-tour-kapat"
          type="button"
          aria-label="Kullanım rehberini kapat"
          onClick={kapat}
        >
          <X size={19} />
        </button>
        <div className="bt-product-tour-progress" aria-label={`Adım ${adim + 1} / ${REHBER_ADIMLARI.length}`}>
          {REHBER_ADIMLARI.map((_, i) => (
            <span key={i} className={i <= adim ? "aktif" : ""} />
          ))}
        </div>
        <div className="bt-product-tour-sayac">
          <Sparkles size={13} /> {icerik.etiket} · {adim + 1}/{REHBER_ADIMLARI.length}
        </div>
        <h2 id="bt-tour-baslik">{icerik.baslik}</h2>
        <p>{icerik.aciklama}</p>
        <div className="bt-product-tour-ipucu">
          <Check size={15} /> {icerik.maddeler[0]}
        </div>
        <div className="bt-product-tour-actions">
          <button className="bt-product-tour-atla" type="button" onClick={kapat}>
            Turu geç
          </button>
          {adim > 0 && (
            <button className="bt-btn kucuk ikincil" type="button" onClick={() => adimaGit(adim - 1)}>
              <ChevronLeft size={15} /> Geri
            </button>
          )}
          <button
            className="bt-btn kucuk birincil"
            type="button"
            onClick={() => (sonAdim ? bitir(!kartVar) : adimaGit(adim + 1))}
          >
            {sonAdim ? (kartVar ? "Başla" : "İlk kartımı ekle") : "Sonraki"}
            {sonAdim ? <Check size={15} /> : <ChevronRight size={15} />}
          </button>
        </div>
      </section>
    </div>
  );
}

function ProTanitimPenceresi({
  acik,
  kapat,
  proSatinAl,
  proSatinAlma,
  proPaketler,
}) {
  const [plan, setPlan] = useState("monthly");
  useEffect(() => {
    if (!acik) return;
    const oncekiBodyOverflow = document.body.style.overflow;
    const oncekiBodyPaddingRight = document.body.style.paddingRight;
    const oncekiHtmlOverflow = document.documentElement.style.overflow;
    const scrollbarGenisligi =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    if (scrollbarGenisligi > 0) {
      document.body.style.paddingRight = `${scrollbarGenisligi}px`;
    }

    const klavye = (e) => {
      if (e.key === "Escape") kapat();
    };
    window.addEventListener("keydown", klavye);
    return () => {
      window.removeEventListener("keydown", klavye);
      document.body.style.overflow = oncekiBodyOverflow;
      document.body.style.paddingRight = oncekiBodyPaddingRight;
      document.documentElement.style.overflow = oncekiHtmlOverflow;
    };
  }, [acik, kapat]);
  if (!acik) return null;
  const demoOnizleme =
    demoModu &&
    !proPaketler?.monthly?.formattedPrice &&
    !proPaketler?.annual?.formattedPrice;
  const aylikFiyat =
    proPaketler?.monthly?.formattedPrice || (demoOnizleme ? "₺99 / ay" : null);
  const yillikFiyat =
    proPaketler?.annual?.formattedPrice || (demoOnizleme ? "₺999 / yıl" : null);
  const seciliFiyat = plan === "annual" ? yillikFiyat : aylikFiyat;
  const hata = demoOnizleme
    ? "Demo önizlemesi · Canlı hesapta güncel yerel fiyat gösterilir."
    : proPaketler?.hata || proSatinAlma?.hata;
  return (
    <div
      className="bt-modal-arka bt-pro-modal-arka"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) kapat();
      }}
    >
      <section
        className="bt-modal bt-pro-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bt-pro-tanitim-baslik"
      >
        <div className="bt-pro-modal-head">
          <button
            type="button"
            className="bt-pro-modal-kapat"
            aria-label="Pro penceresini kapat"
            onClick={kapat}
          >
            <X size={18} />
          </button>
          <span className="bt-premium-badge">
            <Sparkles size={13} /> BORCAMA PRO
          </span>
          <h2 id="bt-pro-tanitim-baslik">
            Rakamlarını yalnızca görme. <span>Ne yapacağını da bil.</span>
          </h2>
          <p>
            Borcama Pro; kendi kayıtlarından ödeme önceliğini, faiz yükünü ve
            aylık baskıyı hesaplayarak en anlamlı finansal sinyalleri öne çıkarır.
          </p>
        </div>
        <div className="bt-pro-modal-body">
          <div className="bt-pro-faydalar">
            <div className="bt-pro-fayda">
              <TrendingUp />
              <div>
                <strong>Tüm kişisel önerileri aç</strong>
                <small>Faiz ve aylık ödeme hedeflerine göre hazırlanmış tüm sinyalleri gör.</small>
              </div>
            </div>
            <div className="bt-pro-fayda">
              <Target />
              <div>
                <strong>Ödeme önceliğini netleştir</strong>
                <small>Hangi borca önce odaklanmanın daha anlamlı olduğunu karşılaştır.</small>
              </div>
            </div>
            <div className="bt-pro-fayda">
              <EyeOff />
              <div>
                <strong>Reklamsız kullan</strong>
                <small>Finans ekranlarını dikkat dağıtan reklamlar olmadan takip et.</small>
              </div>
            </div>
          </div>
          <div className="bt-pro-satin-al">
            <div className="bt-pro-planlar" role="group" aria-label="Pro planı">
              <button
                type="button"
                className={"bt-pro-plan " + (plan === "monthly" ? "aktif" : "")}
                onClick={() => setPlan("monthly")}
              >
                <span>AYLIK</span>
                <strong>{aylikFiyat || "Yükleniyor…"}</strong>
              </button>
              <button
                type="button"
                className={"bt-pro-plan " + (plan === "annual" ? "aktif" : "")}
                onClick={() => setPlan("annual")}
              >
                <span>YILLIK</span>
                <strong>{yillikFiyat || "Yükleniyor…"}</strong>
              </button>
            </div>
            {hata && <div className="bt-pro-hata">{hata}</div>}
            <button
              type="button"
              className="bt-btn birincil"
              disabled={
                demoOnizleme ||
                proSatinAlma?.yukleniyor ||
                proPaketler?.yukleniyor ||
                !seciliFiyat
              }
              onClick={() => proSatinAl(plan)}
            >
              {demoOnizleme
                ? "Canlı hesapta ödeme adımı açılır"
                : proSatinAlma?.yukleniyor
                ? "Ödeme açılıyor…"
                : proPaketler?.yukleniyor
                  ? "Fiyat yükleniyor…"
                  : `Pro'ya geç · ${seciliFiyat || "Fiyat alınamadı"}`}
            </button>
            <div className="bt-pro-guvence">
              <KeyRound size={13} />
              <span>Güvenli ödeme ekranı açılır. Aboneliğini daha sonra Ayarlar’dan yönetebilir veya iptal edebilirsin.</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Ayarlar({
  eposta,
  isDark,
  reklamsiz,
  reklamsizKontrol,
  proSatinAl,
  proSatinAlma,
  proPaketler,
  temaDegistir,
  parolaAc,
  rehberAc,
  cikisYap,
}) {
  const [proPlan, setProPlan] = useState("monthly");
  const seciliPaket = proPaketler?.[proPlan];
  const seciliFiyat = seciliPaket?.formattedPrice;
  return (
    <div className="bt-stack">
      <div>
        <div className="bt-eyebrow">Hesabın</div>
        <div
          className="bt-display"
          style={{ fontSize: "clamp(28px,5vw,42px)" }}
        >
          Ayarlar
        </div>
        <div style={{ color: "var(--dim)", fontSize: 13, marginTop: 7 }}>
          Hesap, giriş, görünüm ve veri tercihlerini buradan yönet.
        </div>
      </div>
      <div className="bt-settings-grid">
        <section className="bt-premium-card">
          <div>
            <span className="bt-premium-badge">
              <Sparkles size={13} />
              {reklamsiz.proAktif ? "PRO AKTİF" : "AYLIK VE YILLIK PLAN"}
            </span>
            <h2>
              {reklamsiz.proAktif
                ? "Borcama Pro hesabında aktif."
                : "Borcama Pro ile tüm planını aç."}
            </h2>
            <p>
              {reklamsiz.proAktif
                ? `Tüm akıllı öneriler ve reklamsız kullanım açık${reklamsiz.proBitis ? `. Erişim tarihi: ${new Date(reklamsiz.proBitis).toLocaleDateString("tr-TR")}` : "."}`
                : "Aylık veya yıllık planı seç. Tüm kişisel öneriler, faiz ve aylık yük analizleri ile reklamsız kullanım dahil."}
              {!reklamsiz.proAktif && proPaketler?.hata ? ` ${proPaketler.hata}` : ""}
              {reklamsiz.hata ? ` ${reklamsiz.hata}` : ""}
              {proSatinAlma.hata ? ` ${proSatinAlma.hata}` : ""}
            </p>
          </div>
          <div className="bt-premium-actions">
            {!reklamsiz.proAktif && (
              <div className="bt-pro-choice">
                <div className="bt-pro-toggle" role="group" aria-label="Pro faturalama dönemi">
                  <button
                    type="button"
                    className={proPlan === "monthly" ? "aktif" : ""}
                    onClick={() => setProPlan("monthly")}
                  >
                    Aylık
                  </button>
                  <button
                    type="button"
                    className={proPlan === "annual" ? "aktif" : ""}
                    onClick={() => setProPlan("annual")}
                  >
                    Yıllık
                  </button>
                </div>
                <button
                  className="bt-btn birincil"
                  type="button"
                  disabled={proSatinAlma.yukleniyor || proPaketler?.yukleniyor || !seciliFiyat}
                  onClick={() => proSatinAl(proPlan)}
                >
                  {proSatinAlma.yukleniyor
                    ? "Ödeme açılıyor…"
                    : proPaketler?.yukleniyor
                      ? "Fiyat yükleniyor…"
                      : `Pro'ya geç · ${seciliFiyat || "Fiyat alınamadı"}`}
                </button>
              </div>
            )}
            {reklamsiz.proAktif && reklamsiz.proYonetimUrl && (
              <a
                className="bt-btn birincil"
                href={reklamsiz.proYonetimUrl}
                target="_blank"
                rel="noreferrer"
              >
                Aboneliği yönet / iptal et
              </a>
            )}
            <button
              className="bt-btn ikincil"
              type="button"
              disabled={reklamsiz.yukleniyor}
              onClick={reklamsizKontrol}
            >
              <RefreshCw size={14} />
              {reklamsiz.yukleniyor
                ? "Kontrol ediliyor…"
                : reklamsiz.proAktif
                  ? "Durumu yenile"
                  : "Pro aldım, kontrol et"}
            </button>
            {reklamsiz.proAktif && (
              <p className="bt-premium-help">
                İptal edersen sonraki yenileme durur; Pro erişimin mevcut döneminin sonuna kadar sürer. {" "}
                <a href="/landing-v2#sss" target="_blank" rel="noreferrer">Yardım</a>
              </p>
            )}
          </div>
        </section>
        <section className="bt-settings-card">
          <div className="bt-settings-title">
            <AtSign size={18} /> Hesap
          </div>
          <div className="bt-setting-row">
            <div>
              <strong>E-posta adresi</strong>
              <small>{eposta || "Yükleniyor…"}</small>
            </div>
          </div>
          <div className="bt-setting-row">
            <div>
              <strong>Parola</strong>
              <small>Parola belirle veya mevcut parolanı değiştir.</small>
            </div>
            <button className="bt-btn kucuk ikincil" onClick={parolaAc}>
              <KeyRound size={14} /> Parolayı yönet
            </button>
          </div>
          <div className="bt-setting-row">
            <div>
              <strong>Oturum</strong>
              <small>Bu cihazdaki Borcama oturumunu kapat.</small>
            </div>
            <button className="bt-btn kucuk ikincil" onClick={cikisYap}>
              <LogOut size={14} /> Çıkış yap
            </button>
          </div>
        </section>
        <section className="bt-settings-card">
          <div className="bt-settings-title">
            <KeyRound size={18} /> Giriş yöntemleri
          </div>
          <div className="bt-setting-row">
            <div>
              <strong>E-posta linki</strong>
              <small>
                Tek kullanımlık güvenli bağlantıyla parolasız giriş.
              </small>
            </div>
            <span className="bt-yakinda" style={{ color: "#5D7A2E" }}>
              Aktif
            </span>
          </div>
          <div className="bt-setting-row">
            <div>
              <strong>Parola ile giriş</strong>
              <small>
                Parola belirledikten sonra e-posta ve parolanı kullan.
              </small>
            </div>
            <span className="bt-yakinda" style={{ color: "#5D7A2E" }}>
              Kullanılabilir
            </span>
          </div>
        </section>
        <section className="bt-settings-card">
          <div className="bt-settings-title">
            <Palette size={18} /> Görünüm
          </div>
          <div className="bt-setting-row">
            <div>
              <strong>Tema</strong>
              <small>Şu an {isDark ? "koyu" : "açık"} tema kullanılıyor.</small>
            </div>
            <button className="bt-btn kucuk ikincil" onClick={temaDegistir}>
              {isDark ? "Açık temaya geç" : "Koyu temaya geç"}
            </button>
          </div>
          <div className="bt-setting-row">
            <div>
              <strong>Kullanım rehberi</strong>
              <small>Borcama'nın temel akışını adım adım yeniden gör.</small>
            </div>
            <button className="bt-btn kucuk ikincil" onClick={rehberAc}>
              <BookOpen size={14} /> Rehberi aç
            </button>
          </div>
        </section>
        <section className="bt-settings-card">
          <div className="bt-settings-title">
            <Bell size={18} /> Bildirimler
          </div>
          <div className="bt-setting-row">
            <div>
              <strong>Ödeme hatırlatmaları</strong>
              <small>Yaklaşan kredi ve kart ödemeleri.</small>
            </div>
            <span className="bt-yakinda">Yakında</span>
          </div>
          <div className="bt-setting-row">
            <div>
              <strong>Ekstre hatırlatmaları</strong>
              <small>Yeni dönem ekstresi giriş zamanı.</small>
            </div>
            <span className="bt-yakinda">Yakında</span>
          </div>
        </section>
        <section className="bt-settings-card wide">
          <div className="bt-settings-title">
            <Database size={18} /> Veri ve yönetim
          </div>
          <div className="bt-setting-row">
            <div>
              <strong>Bankaları yönet</strong>
              <small>Özel banka adlarını düzenle veya kaldır.</small>
            </div>
            <span className="bt-yakinda">
              <Building2 size={11} /> Yakında
            </span>
          </div>
          <div className="bt-setting-row">
            <div>
              <strong>Verileri dışa aktar</strong>
              <small>Borcama kayıtlarının kişisel bir kopyasını indir.</small>
            </div>
            <span className="bt-yakinda">Yakında</span>
          </div>
          <div className="bt-setting-row">
            <div>
              <strong>Hesabı ve verileri sil</strong>
              <small>Tüm Borcama verilerini kalıcı olarak kaldır.</small>
            </div>
            <span className="bt-yakinda">Yakında</span>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ---------------- Özet ---------------- */
function Ozet({
  toplamlar,
  kalemler,
  aylikFaiz,
  gecenAyDelta,
  buAyOdenecek,
  yaklasan,
  buAyHarcama,
  buAyGelir,
  netNakit,
  odendiIsaretle,
  setSekme,
  tutarlarGizli,
  tutarlariGizle,
  varlikOzeti,
  oneriler,
  proAktif,
  proAc,
}) {
  const [tumBankalar, setTumBankalar] = useState(false);
  const [haricTurler, setHaricTurler] = useState([]);
  const gelir = buAyGelir.toplam;
  const oran = gelir > 0 ? (buAyOdenecek / gelir) * 100 : null;

  const parcalar = [
    { tur: "kart", ad: "Kredi kartları", tutar: toplamlar.kart, renk: LIME },
    { tur: "kredi", ad: "Krediler", tutar: toplamlar.kredi, renk: CORAL },
    { tur: "ek", ad: "Ek hesap / KMH", tutar: toplamlar.ek, renk: "#c8c9be" },
    {
      tur: "diger",
      ad: "Gecikmiş / diğer",
      tutar: toplamlar.diger,
      renk: "#55584c",
    },
  ];
  const gosterilenToplam = parcalar
    .filter((p) => !haricTurler.includes(p.tur))
    .reduce((t, p) => t + p.tutar, 0);
  const tutarGoster = (tutar) => (tutarlarGizli ? "₺ ••••••" : fmt(tutar));
  const turDegistir = (tur) =>
    setHaricTurler((eski) =>
      eski.includes(tur) ? eski.filter((x) => x !== tur) : [...eski, tur],
    );

  const bankalar = useMemo(() => {
    const m = {};
    kalemler.forEach((k) => {
      m[k.banka || "Diğer"] = (m[k.banka || "Diğer"] || 0) + k.bakiye;
    });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [kalemler]);
  const maxBanka = bankalar.length ? bankalar[0][1] : 1;
  const gorunenBankalar = tumBankalar ? bankalar : bankalar.slice(0, 3);

  const gecikmisler = yaklasan.filter(
    (o) => kalanGun(o.tarih) < 0 && !o.odendi && (+o.tutar || 0) > 0.01,
  );
  const yaklasanlar = yaklasan.filter(
    (o) => kalanGun(o.tarih) >= 0 && !o.odendi && (+o.tutar || 0) > 0.01,
  );
  const gorunenGecikmisler = gecikmisler.slice(0, 3);
  const gorunenYaklasanlar = yaklasanlar.slice(
    0,
    Math.max(3 - gorunenGecikmisler.length, 0),
  );
  const gizliOdemeSayisi =
    gecikmisler.length + yaklasanlar.length -
    gorunenGecikmisler.length - gorunenYaklasanlar.length;

  const metrikler = [
    {
      lbl: "Bu ay ödenmesi gereken",
      amt: fmt0(buAyOdenecek),
      cap: "Kredi taksitleri + kart asgarileri",
    },
    {
      lbl: "Bu ay geliriniz",
      amt: fmt0(gelir),
      cap:
        gelir > 0
          ? Object.keys(buAyGelir.kaynaklar).length + " kaynak"
          : "Gelir sekmesinden ekleyin",
    },
    {
      lbl: "Bu ay harcamanız",
      amt: fmt0(buAyHarcama.toplam),
      cap: buAyHarcama.adet + " kayıt",
    },
  ];
  if (varlikOzeti.toplam > 0) {
    metrikler.unshift({
      lbl: "Toplam varlıklarınız",
      amt: tutarlarGizli ? "₺ ••••••" : fmt0(varlikOzeti.toplam),
      cap: varlikOzeti.kalemler.length + " varlık kaydı",
    });
    const netDeger = varlikOzeti.toplam - toplamlar.genel;
    metrikler.push({
      lbl: "Net finansal durum",
      amt: tutarlarGizli ? "₺ ••••••" : fmt0(netDeger),
      cap: "Toplam varlıklar − toplam borçlar",
      coral: netDeger < 0,
    });
  }
  if (netNakit !== null)
    metrikler.push({
      lbl: "Net nakit akışı",
      amt: (netNakit >= 0 ? "+" : "") + fmt0(netNakit),
      cap: "Gelir − ödemeler − harcamalar",
      coral: netNakit < 0,
    });

  return (
    <div className="bt-stack">
      <div className="bt-hero" data-tour="ozet">
        <span className="deko-daire" />
        <span className="deko-kare" />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            position: "relative",
            zIndex: 1,
          }}
        >
          <div className="bt-hero-label" style={{ margin: 0 }}>
            {haricTurler.length
              ? "Seçili borçların toplamı"
              : "Tüm bankalardaki toplam borcunuz"}
          </div>
          <button
            className="bt-btn hayalet"
            style={{ color: CREAM, padding: 7 }}
            title={tutarlarGizli ? "Tutarları göster" : "Tutarları gizle"}
            aria-label={tutarlarGizli ? "Tutarları göster" : "Tutarları gizle"}
            onClick={() => tutarlariGizle(!tutarlarGizli)}
          >
            {tutarlarGizli ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        </div>
        <div className="bt-hero-tutar" style={{ marginTop: 16 }}>
          {tutarGoster(gosterilenToplam)}
        </div>
        {haricTurler.length > 0 && (
          <div
            style={{
              color: "#c8c9be",
              fontSize: 11.5,
              margin: "-7px 0 13px",
              position: "relative",
              zIndex: 1,
            }}
          >
            {haricTurler.length} kategori toplamdan çıkarıldı ·{" "}
            <button
              className="bt-link"
              style={{ color: LIME }}
              onClick={() => setHaricTurler([])}
            >
              Tümünü geri ekle
            </button>
          </div>
        )}
        {gecenAyDelta && (
          <div
            className="bt-hero-delta"
            style={{
              background: gecenAyDelta.fark <= 0 ? "#cdf56428" : "#ff6f5928",
              color: gecenAyDelta.fark <= 0 ? LIME : CORAL,
            }}
          >
            {tutarlarGizli
              ? "Geçen aya göre değişim gizli"
              : gecenAyDelta.fark === 0
                ? "Geçen aydan bu yana değişmedi"
                : (gecenAyDelta.fark < 0
                    ? fmt0(-gecenAyDelta.fark) + " azaldı"
                    : fmt0(gecenAyDelta.fark) + " arttı") + " (geçen aya göre)"}
          </div>
        )}
        <div className="bt-serit">
          {gosterilenToplam > 0 &&
            parcalar
              .filter((p) => !haricTurler.includes(p.tur))
              .map((p) =>
                p.tutar > 0 ? (
                  <div
                    key={p.ad}
                    style={{
                      width: (p.tutar / gosterilenToplam) * 100 + "%",
                      background: p.renk,
                    }}
                  />
                ) : null,
              )}
        </div>
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            position: "relative",
            zIndex: 1,
          }}
        >
          {parcalar.map((p) => (
            <button
              key={p.ad}
              className={
                "bt-chip secilebilir " +
                (haricTurler.includes(p.tur) ? "haric" : "")
              }
              title={
                haricTurler.includes(p.tur)
                  ? "Toplama geri ekle"
                  : "Toplamdan çıkar"
              }
              onClick={() => turDegistir(p.tur)}
            >
              <span className="dot" style={{ background: p.renk }} />
              <span className="lbl">{p.ad}</span>
              <span className="amt">{tutarGoster(p.tutar)}</span>
              {haricTurler.includes(p.tur) && <Minus size={12} color={CREAM} />}
            </button>
          ))}
        </div>
      </div>

      <div className="bt-grid">
        {metrikler.map((m, i) => (
          <div
            key={m.lbl}
            className="bt-metric"
            style={{
              transform: "rotate(" + [-1.1, 0.8, -0.6, 1.2][i % 4] + "deg)",
              borderColor: m.coral ? CORAL : undefined,
            }}
          >
            <div className="bt-metric-lbl">{m.lbl}</div>
            <div
              className="bt-metric-amt"
              style={{ color: m.coral ? CORAL : undefined }}
            >
              {m.amt}
            </div>
            <div className="bt-metric-cap">{m.cap}</div>
          </div>
        ))}
      </div>

      {oran !== null && (
        <div
          className="bt-risk"
          style={{
            background: oran < 30 ? LIME : oran < 50 ? "#ffcf6e" : CORAL,
          }}
        >
          <div className="bt-risk-inner">
            <div className="bt-risk-pct">%{Math.round(oran)}</div>
            <div className="bt-risk-txt">
              Gelirinizin bu kadarı zorunlu borç ödemesine gidiyor —{" "}
              {oran < 30
                ? "sağlıklı seviyede"
                : oran < 50
                  ? "dikkat gerektiren seviyede"
                  : "riskli seviye"}
              . Detaylar için{" "}
              <button
                className="bt-link"
                style={{ color: INK, textDecoration: "underline" }}
                onClick={() => setSekme("plan")}
              >
                Borç Planı
              </button>
              'na bakın.
            </div>
          </div>
        </div>
      )}

      <BorcamaOnerileri
        oneriler={oneriler}
        setSekme={setSekme}
        proAktif={proAktif}
        proAc={proAc}
      />

      {bankalar.length > 0 && (
        <div className="bt-card">
          <div className="bt-h2">Banka bazında yükünüz</div>
          {gorunenBankalar.map(([banka, tutar]) => (
            <div key={banka} className="bt-banka-row">
              <div className="bt-banka-top">
                <span>{banka}</span>
                <span className="bt-mono">{tutarGoster(tutar)}</span>
              </div>
              <div className="bt-banka-bar">
                <div
                  style={{
                    width:
                      Math.max(2, Math.round((tutar / maxBanka) * 100)) + "%",
                  }}
                />
              </div>
            </div>
          ))}
          {bankalar.length > 3 && (
            <button
              className="bt-link"
              style={{ marginTop: 18 }}
              onClick={() => setTumBankalar(!tumBankalar)}
            >
              {tumBankalar
                ? "Daha az göster"
                : "Tümünü gör (+" + (bankalar.length - 3) + ")"}
            </button>
          )}
        </div>
      )}

      <div className="bt-hero2">
        {gecikmisler.length > 0 && (
          <>
            <div
              className="bt-display"
              style={{ fontSize: 16, color: CORAL, marginBottom: 16 }}
            >
              Gecikmiş ödemeler
            </div>
            <div className="bt-stack" style={{ gap: 10, marginBottom: 24 }}>
              {gorunenGecikmisler.map((o, i) => (
                <OdemeSatiri
                  key={o.id}
                  o={o}
                  i={i}
                  gecikmis
                  odendiIsaretle={odendiIsaretle}
                  kartOdemesiAc={() => setSekme("odemeler")}
                />
              ))}
            </div>
          </>
        )}
        <div
          className="bt-display"
          style={{ fontSize: 16, color: LIME, marginBottom: 16 }}
        >
          Yaklaşan ödemeler
        </div>
        {yaklasanlar.length === 0 ? (
          <div style={{ color: "#8a8c7e", fontSize: 13 }}>
            Henüz ödeme takvimi yok.{" "}
            <button className="bt-link" onClick={() => setSekme("borclar")}>
              Borçlar sekmesinden
            </button>{" "}
            kart ve kredilerinizi ekleyin.
          </div>
        ) : (
          <div className="bt-stack" style={{ gap: 10 }}>
            {gorunenYaklasanlar.map((o, i) => (
              <OdemeSatiri
                key={o.id}
                o={o}
                i={i}
                gecikmis={false}
                odendiIsaretle={odendiIsaretle}
                kartOdemesiAc={() => setSekme("odemeler")}
              />
            ))}
          </div>
        )}
        {(gizliOdemeSayisi > 0 || gecikmisler.length + yaklasanlar.length > 0) && (
          <button
            className="bt-btn ikincil"
            type="button"
            onClick={() => setSekme("odemeler")}
            style={{ marginTop: 16 }}
          >
            <CalendarCheck size={15} /> Tüm ödeme planını gör
            {gizliOdemeSayisi > 0 ? ` (+${gizliOdemeSayisi})` : ""}
          </button>
        )}
      </div>

      {aylikFaiz > 0 && (
        <div
          style={{ textAlign: "center", fontSize: 12, color: "var(--faint)" }}
        >
          Bu ay tahmini {fmt0(aylikFaiz)} faiz işleyecek — ayrıntıları borç
          planında görün.
        </div>
      )}
    </div>
  );
}

function BorcamaOnerileri({
  oneriler = [],
  setSekme,
  proAktif = false,
  proAc,
}) {
  const [mod, setMod] = useState("nakit");
  const [tumuAcik, setTumuAcik] = useState(false);
  const [seciliId, setSeciliId] = useState("");
  const filtreli = oneriler.filter((oneri) => oneri.modlar.includes(mod));
  const secili = filtreli.find((oneri) => oneri.id === seciliId) || filtreli[0];
  useEffect(() => {
    if (!filtreli.some((oneri) => oneri.id === seciliId))
      setSeciliId(filtreli[0]?.id || "");
  }, [mod, oneriler, seciliId]);
  const ikon = (tur) => {
    if (tur === "acil") return <Flame />;
    if (tur === "dikkat") return <AlertTriangle />;
    if (tur === "firsat") return <Sparkles />;
    return <Lightbulb />;
  };
  const zamanEtiketi = (oneri) =>
    oneri?.oncelik >= 90 ? "Şimdi" : oneri?.oncelik >= 75 ? "Bu hafta" : "İncele";

  return (
    <section className="bt-oneriler" aria-labelledby="borcama-oneriler-baslik">
      <div className="bt-oneriler-head">
        <div>
          <div className="bt-oneriler-kicker">
            <Lightbulb size={15} />
            {proAktif ? "Rakamlarından hesaplandı" : "Ücretsiz öneri önizlemesi"}
          </div>
          <h2 id="borcama-oneriler-baslik">Borcama'dan öneriler</h2>
          <p>
            Aylık ödeme baskısını mı, toplam faiz maliyetini mi azaltmak
            istiyorsun? Önceliğini seç, önerileri ona göre sıralayalım.
          </p>
        </div>
        <div className="bt-oneri-hedef">
          <span className="bt-oneri-hedef-label">Önceliğin ne?</span>
          <div className="bt-oneri-mod" aria-label="Öneri önceliği">
            <button
              className={mod === "nakit" ? "aktif" : ""}
              onClick={() => {
                setMod("nakit");
                setTumuAcik(false);
              }}
            >
              <Wallet size={17} />
              <span>Aylık ödemeyi azalt</span>
            </button>
            <button
              className={mod === "faiz" ? "aktif" : ""}
              onClick={() => {
                if (proAktif) {
                  setMod("faiz");
                  setTumuAcik(false);
                } else proAc?.();
              }}
            >
              <TrendingUp size={17} />
              <span>Toplam faizi azalt{proAktif ? "" : " · Pro"}</span>
            </button>
          </div>
        </div>
      </div>

      {secili ? (
        <>
          <article className={"bt-oneri-sahne " + secili.tur}>
            <span className="bt-oneri-deko bir" />
            <span className="bt-oneri-deko iki" />
            <div className="bt-oneri-sahne-icerik">
              <div className="bt-oneri-sahne-ust">
                <span className="bt-oneri-canli"><i /> Sıradaki en iyi hamle</span>
                <span className="bt-oneri-sayac">
                  {proAktif
                    ? filtreli.findIndex((oneri) => oneri.id === secili.id) + 1 + "/" + filtreli.length + " sinyal"
                    : "1 ücretsiz öneri"}
                </span>
              </div>
              <div className="bt-oneri-etiket">{secili.etiket}</div>
              <h3>{secili.baslik}</h3>
              <p>{secili.aciklama}</p>
              {secili.etki && (
                <div className="bt-oneri-etki">
                  <span>Tahmini etki</span>
                  <strong>{secili.etki}</strong>
                </div>
              )}
              {secili.uyari && (
                <div className="bt-oneri-uyari">
                  <AlertTriangle size={14} /> {secili.uyari}
                </div>
              )}
              <button
                className="bt-oneri-aksiyon"
                onClick={() => setSekme(secili.hedef)}
              >
                {secili.aksiyon} <ChevronRight size={17} />
              </button>
            </div>
            <div className="bt-oneri-pusula" aria-label={zamanEtiketi(secili) + " önceliği"}>
              <div className="bt-oneri-yildiz">✦</div>
              <div className="bt-oneri-pusula-ikon">{ikon(secili.tur)}</div>
              <small>Önerilen zaman</small>
              <strong>{zamanEtiketi(secili)}</strong>
              <span>
                {proAktif
                  ? filtreli.length + " finansal sinyal tarandı"
                  : "Tüm analizler Borcama Pro'da"}
              </span>
            </div>
          </article>

          {!proAktif && filtreli.length > 1 && (
            <div className="bt-pro-kilit">
              <div className="bt-pro-kilit-ikon"><Sparkles size={20} /></div>
              <div>
                <strong>{filtreli.length - 1} kişisel öneri daha hazır</strong>
                <span>
                  Tüm sinyalleri, faiz önceliğini ve aylık plan analizini Borcama
                  Pro ile aç.
                </span>
              </div>
              <button className="bt-btn birincil" onClick={proAc}>Pro'yu incele</button>
            </div>
          )}

          {proAktif && filtreli.length > 1 && (
            <div className="bt-oneri-diger">
              <div className="bt-oneri-diger-baslik">
                <div className="bt-oneri-diger-baslik-ana">
                  <span className="bt-oneri-diger-baslik-ikon"><Sparkles size={16} /></span>
                  <span className="bt-oneri-diger-baslik-baslik">Finansal sinyaller</span>
                  <span className="bt-oneri-diger-sayac">{filtreli.length}</span>
                </div>
                <small>Karta dokun, ayrıntısı yukarıda açılsın.</small>
              </div>
              <div className={"bt-oneri-kartlar " + (tumuAcik ? "tumu-acik" : "")}>
                {filtreli.map((oneri, index) => (
                  <button
                    key={oneri.id}
                    className={
                      "bt-oneri-kart " +
                      oneri.tur +
                      (oneri.id === secili.id ? " aktif" : "")
                    }
                    aria-pressed={oneri.id === secili.id}
                    onClick={() => setSeciliId(oneri.id)}
                  >
                    <span className="bt-oneri-kart-no">0{index + 1}</span>
                    <span className="bt-oneri-kart-ikon">{ikon(oneri.tur)}</span>
                    <span className="bt-oneri-kart-etiket">{oneri.etiket}</span>
                    <strong>{oneri.baslik}</strong>
                    <span className="bt-oneri-kart-alt">
                      {zamanEtiketi(oneri)} <ChevronRight size={15} />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bt-oneri-bos">
          <Check size={18} /> Bu hedef için şu anda dikkat gerektiren bir sinyal
          yok.
        </div>
      )}

      <div className="bt-oneriler-alt">
        <span>
          Tahmini senaryodur; banka koşullarını ve güncel sözleşmeni kontrol et.
        </span>
        {proAktif && filtreli.length > 3 && (
          <button className="bt-link" onClick={() => setTumuAcik(!tumuAcik)}>
            {tumuAcik ? "Daha az göster" : "Tüm önerileri gör (" + filtreli.length + ")"}
          </button>
        )}
      </div>
    </section>
  );
}

function OdemeSatiri({ o, i, gecikmis, odendiIsaretle, kartOdemesiAc }) {
  const gun = kalanGun(o.tarih);
  const kartDurumu = o.tamamiOdendi
    ? { sinif: "tamami", metin: "Tamamı ödendi" }
    : o.minimumTamam
      ? { sinif: "minimum", metin: "Asgari ödeme tamamlandı · kalan borç var" }
      : o.yapilanOdeme > 0
        ? { sinif: "kismi", metin: "Kısmi ödeme yapıldı" }
        : { sinif: "", metin: "Henüz ödeme yapılmadı" };
  return (
    <div className="bt-satirD">
      <div
        style={rozetStil(
          gecikmis ? CORAL : LIME,
          ROTASYONLAR[i % ROTASYONLAR.length],
        )}
      >
        {bankaKodu(o.banka)}
      </div>
      <div style={{ flex: 1, minWidth: 140 }}>
        <div
          className="bt-satirD-ad"
          style={{
            textDecoration:
              o.kartOdemesi ? (o.tamamiOdendi ? "line-through" : "none") : o.odendi ? "line-through" : "none",
          }}
        >
          {o.ad}
        </div>
        <div
          className="bt-satirD-alt"
          style={{
            color: gecikmis ? CORAL : "#8a8c7e",
            fontWeight: gecikmis ? 600 : 400,
          }}
        >
          {o.kartOdemesi
            ? (o.not ? o.not + " · " : "") +
              (o.minimumTamam && !o.tamamiOdendi
              ? "asgari ödeme tamamlandı · kalan borç devam ediyor"
              : gecikmis
                ? -gun + " gün gecikti"
                : gun === 0
                  ? "bugün son gün"
                  : gun + " gün kaldı")
            : o.odendi
            ? "ödendi"
            : gecikmis
              ? -gun + " gün gecikti"
              : gun === 0
                ? "bugün son gün"
                : gun + " gün kaldı"}
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div className="bt-satirD-tutar">
          {fmt(o.kartOdemesi ? o.kalanToplam : o.tutar)}
        </div>
        <div className="bt-satirD-tur">
          {o.kartOdemesi ? "Kalan toplam borç" : o.not}
        </div>
        {o.kartOdemesi && (
          <div
            className="bt-satirD-tur"
            style={{
              color: o.tutar > 0.01 ? CORAL : "#5D7A2E",
              fontWeight: 800,
              marginTop: 3,
            }}
          >
            {o.tutar > 0.01
              ? "Kalan asgari ödeme: " + fmt(o.tutar)
              : "Asgari ödeme tamamlandı"}
          </div>
        )}
        <div
          className="bt-satirD-tur"
          style={{
            color: o.odemeBilgisiYok ? "#8a8c7e" : "#5D7A2E",
            fontWeight: 700,
          }}
        >
          Yapılan ödeme:{" "}
          {o.odemeBilgisiYok ? "Eski kayıtta bilgi yok" : fmt(o.yapilanOdeme)}
          {o.odemeKayitSayisi > 0 ? ` · ${o.odemeKayitSayisi} yeni kayıt` : ""}
        </div>
        {o.kartOdemesi && (
          <div className={"bt-kart-odeme-durum " + kartDurumu.sinif}>
            {kartDurumu.metin}
          </div>
        )}
      </div>
      {o.kartOdemesi ? (
        o.tamamiOdendi ? (
          <div className="bt-btn kucuk heroghost" style={{ cursor: "default" }}>
            <Check size={12} /> Tamamı ödendi
          </div>
        ) : (
          <button
            className="bt-btn kucuk heroghost"
            onClick={() => kartOdemesiAc?.(o)}
          >
            <Plus size={12} /> Ödeme gir
          </button>
        )
      ) : (
        <button
          className="bt-btn kucuk heroghost"
          onClick={() => odendiIsaretle(o.anahtar, !o.odendi)}
        >
          {o.odendi ? (
            <>
              <RotateCcw size={12} /> Geri al
            </>
          ) : (
            <>
              <Check size={12} /> Ödendi
            </>
          )}
        </button>
      )}
    </div>
  );
}

function Odemeler({
  veri,
  yaklasan,
  gelecekOdemeler = [],
  odendiIsaretle,
  kartOdemesiKaydet,
  filtre = "bekleyen",
  filtreDegistir,
}) {
  const [kartOdemePenceresi, setKartOdemePenceresi] = useState(null);
  const [kismiOdemeTutari, setKismiOdemeTutari] = useState("");
  const donemler = useMemo(() => {
    const aylar = new Set([ayAnahtari()]);
    (veri.cards || []).forEach((kart) => {
      if (kart.ekstreAyi) aylar.add(kartOdemeAyi(kart));
      (kart.ekstreGecmisi || []).forEach((ekstre) => {
        if (ekstre.ekstreAyi)
          aylar.add(kartOdemeAyi({ ...kart, ...ekstre }));
      });
    });
    Object.keys(veri.loanPaymentHistory || {}).forEach((ay) => aylar.add(ay));
    return [...aylar].filter(Boolean).sort().reverse();
  }, [veri.cards, veri.loanPaymentHistory]);
  // Ödeme ekranı ekstre ayına değil, borcun gerçekten ödeneceği aya açılır.
  // Örn. Temmuz ekstresi Ağustos'ta ödenecekse Ağustos ödeme dönemindedir.
  const varsayilanDonem = ayAnahtari();
  const [donem, setDonem] = useState(varsayilanDonem);
  const donemElleSecildi = useRef(false);
  useEffect(() => {
    if (!donemElleSecildi.current && donem !== varsayilanDonem) {
      setDonem(varsayilanDonem);
      return;
    }
    if (!donemler.includes(donem)) {
      donemElleSecildi.current = false;
      setDonem(varsayilanDonem);
    }
  }, [donem, donemler, varsayilanDonem]);

  const donemOdemeleri = useMemo(() => {
    const liste = [];
    (veri.cards || []).forEach((kart) => {
      const ekstreler = [
        kart.ekstreAyi ? kart : null,
        ...(kart.ekstreGecmisi || []).map((ekstre) => ({
          ...kart,
          ...ekstre,
        })),
      ].filter(Boolean);
      ekstreler
        .filter((kayit) => kartOdemeAyi(kayit) === donem)
        .forEach((kayit) => {
          const h = kartHesabi(kayit);
          if (h.onceki <= 0 && h.toplam <= 0) return;
          const hedefTutar = h.asgari;
          const odemeAnahtari = kartOdemeAnahtari(kayit);
          const elleOdendi = !!veri.paid?.[odemeAnahtari];
          const odemeKayitlari =
            veri.cardPaymentHistory?.[odemeAnahtari] || [];
          const yapilanOdeme = Math.min(
            elleOdendi ? Math.max(h.odeme, hedefTutar) : h.odeme,
            h.onceki,
          );
          const tutar = Math.max(hedefTutar - yapilanOdeme, 0);
          const kalanToplam = h.toplam;
          const minimumTamam = hedefTutar > 0 && tutar <= 0.01;
          const tamamiOdendi = kalanToplam <= 0.01;
          liste.push({
            id: "kart-" + kart.id + "-" + kayit.ekstreAyi,
            kartOdemesi: true,
            banka: kart.banka,
            ad: kart.banka + (kart.ad ? " · " + kart.ad : ""),
            ekstreAyi: kayit.ekstreAyi,
            tutar,
            kalanToplam,
            minimumOdeme: hedefTutar,
            hedefTutar,
            yapilanOdeme,
            odemeKayitSayisi: odemeKayitlari.length,
            not: ayEtiketi(kayit.ekstreAyi) + " ekstresi",
            tarih: kartGecikmeTarihi(kayit),
            odendi: minimumTamam,
            minimumTamam,
            tamamiOdendi,
            anahtar: odemeAnahtari,
          });
        });
    });

    if (donem === ayAnahtari()) {
      liste.push(...yaklasan.filter((x) => !x.kartOdemesi));
    } else {
      Object.values(veri.loanPaymentHistory?.[donem] || {}).forEach((odeme) => {
        const tarih = new Date(
          +donem.slice(0, 4),
          +donem.slice(5, 7) - 1,
          Math.min(Math.max(+odeme.odemeGunu || 1, 1), 28),
        );
        liste.push({
          id: "gecmis-kredi-" + odeme.krediId + "-" + donem,
          banka: odeme.banka,
          ad: odeme.banka + (odeme.ad ? " · " + odeme.ad : ""),
          tutar: 0,
          hedefTutar: +odeme.taksit || 0,
          yapilanOdeme: +odeme.taksit || 0,
          not: "ödenen taksit",
          tarih,
          odendi: true,
          anahtar: "kredi-" + odeme.krediId + "-" + donem,
        });
      });
    }
    return liste.sort((a, b) => a.tarih - b.tarih);
  }, [
    donem,
    veri.cards,
    veri.cardPaymentHistory,
    veri.loanPaymentHistory,
    veri.paid,
    yaklasan,
  ]);

  const sirali = donemOdemeleri;
  const hedefiTamamlanan = sirali.filter((x) => x.odendi);
  const odemeYapilan = sirali.filter((x) => (+x.yapilanOdeme || 0) > 0);
  // Kartta minimumun tamamlanması ödeme hedefini kapatır; borcu kapatmaz.
  // Kalan toplam sıfırlanana kadar kart "Bekleyen ödemeler" içinde kalır.
  const bekleyen = sirali.filter((x) =>
    x.kartOdemesi ? !x.tamamiOdendi : !x.odendi,
  );
  const toplam = sirali.reduce((t, x) => t + (+x.hedefTutar || 0), 0);
  const kalan = sirali.reduce((t, x) => t + (+x.tutar || 0), 0);
  const odenen = sirali.reduce((t, x) => t + (+x.yapilanOdeme || 0), 0);
  const kalanToplamOdeme = sirali.reduce(
    (t, x) =>
      t +
      (x.kartOdemesi
        ? +x.kalanToplam || 0
        : x.odendi
          ? 0
          : +x.tutar || 0),
    0,
  );
  const eskiKayitSayisi = sirali.filter((x) => x.odemeBilgisiYok).length;
  return (
    <div className="bt-stack">
      <div className="bt-secici" aria-label="Ödeme kayıtları" style={{ width: "max-content" }}>
        <button
          type="button"
          className={filtre === "bekleyen" ? "aktif" : ""}
          onClick={() => filtreDegistir?.("bekleyen")}
        >
          Bekleyen
        </button>
        <button
          type="button"
          className={filtre === "odenen" ? "aktif" : ""}
          onClick={() => filtreDegistir?.("odenen")}
        >
          Ödeme yapılanlar
        </button>
      </div>
      <div className="bt-card" data-tour="odemeler">
        <div className="bt-cardhead">
          <div>
            <div className="bt-eyebrow">
              ÖDEME TAKVİMİ
            </div>
            <div className="bt-h2" style={{ margin: "5px 0 0" }}>
              {ayEtiketi(donem)} ödeme dönemi
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <select
              className="bt-input"
              aria-label="Ödeme dönemi"
              value={donem}
              onChange={(e) => {
                donemElleSecildi.current = true;
                setDonem(e.target.value);
              }}
              style={{ width: 170 }}
            >
              {donemler.map((ay) => (
                <option key={ay} value={ay}>
                  {ayEtiketi(ay)}
                </option>
              ))}
            </select>
            <div className="bt-mono" style={{ fontWeight: 800 }}>
              {hedefiTamamlanan.length}/{sirali.length} asgari/taksit hedefi
              tamamlandı
            </div>
          </div>
        </div>
        <div className="bt-grid" style={{ marginTop: 16 }}>
          <div className="bt-metric">
            <div className="bt-metric-lbl">Aktif ödeme hedefi</div>
            <div className="bt-metric-amt">{fmt(toplam)}</div>
            <div className="bt-metric-cap">
              Kart minimumları ve kredi taksitleri
            </div>
          </div>
          <div className="bt-metric">
            <div className="bt-metric-lbl">Yapılan ödemeler</div>
            <div className="bt-metric-amt">{fmt(odenen)}</div>
            <div className="bt-metric-cap">Bu listeye işlenen tutar</div>
          </div>
          <div className="bt-metric">
            <div className="bt-metric-lbl">Kalan toplam ödeme</div>
            <div className="bt-metric-amt">{fmt(kalanToplamOdeme)}</div>
            <div className="bt-metric-cap">
              Kartların kalan borcu ve bekleyen kredi taksitleri
            </div>
          </div>
          <div className="bt-metric">
            <div className="bt-metric-lbl">Kalan zorunlu ödeme</div>
            <div className="bt-metric-amt">{fmt(kalan)}</div>
            <div className="bt-metric-cap">
              Bu dönem zorunlu olarak ödenmesi gereken tutar
            </div>
          </div>
        </div>
      </div>
      <div className="bt-ipucu">
        <CalendarCheck size={16} />
        <div>
          Ekstreler, harcamanın yapıldığı ayda değil son ödeme tarihinin olduğu
          ödeme döneminde gösterilir. Ödediğiniz tutarı asgari, kısmi veya
          tamamı olarak kaydedin.
        </div>
      </div>
      {eskiKayitSayisi > 0 && (
        <div className="bt-ipucu" style={{ borderColor: CORAL }}>
          <Lightbulb size={16} />
          <div>
            <b>{eskiKayitSayisi} eski kart kaydı:</b> Kart ve borç bilgileri
            korunuyor; ancak eski formatta yapılan ödeme ayrı tutulmadığı için
            ödeme tutarı “bilgi yok” olarak gösteriliyor. Yeni ekstre girişinden
            itibaren bu alan otomatik takip edilir.
          </div>
        </div>
      )}
      {filtre === "bekleyen" && (
        <div className="bt-card">
          <div className="bt-h2">Bekleyen ödemeler</div>
          {bekleyen.length === 0 ? (
            <div className="bt-bos">Bekleyen ödeme yok.</div>
          ) : (
            <div className="bt-stack" style={{ gap: 10 }}>
              {bekleyen.map((o, i) => (
                <OdemeSatiri
                  key={o.id}
                  o={o}
                  i={i}
                  gecikmis={
                    kalanGun(o.tarih) < 0 &&
                    !(o.kartOdemesi && o.minimumTamam)
                  }
                  odendiIsaretle={odendiIsaretle}
                  kartOdemesiAc={(odeme) => {
                    setKismiOdemeTutari("");
                    setKartOdemePenceresi(odeme);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
      {filtre === "odenen" && (
        <div className="bt-card">
          <div className="bt-h2">Ödeme yapılanlar</div>
          {odemeYapilan.length === 0 ? (
            <div className="bt-bos">Bu ay henüz ödeme kaydı yok.</div>
          ) : (
            <div className="bt-stack" style={{ gap: 10 }}>
              {odemeYapilan.map((o, i) => (
                <OdemeSatiri
                  key={o.id}
                  o={o}
                  i={i}
                  gecikmis={false}
                  odendiIsaretle={odendiIsaretle}
                  kartOdemesiAc={(odeme) => {
                    setKismiOdemeTutari("");
                    setKartOdemePenceresi(odeme);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
      {filtre === "bekleyen" && donem === ayAnahtari() && (
        <div className="bt-card">
          <div className="bt-h2">Gelecek ayın bilinen ödemeleri</div>
          {gelecekOdemeler.length === 0 ? (
            <div className="bt-bos">
              Gelecek ay için kayıtlı kredi taksiti yok. Kredi kartı ekstreleri,
              yeni dönem girildiğinde burada görünecek.
            </div>
          ) : (
            <div className="bt-stack" style={{ gap: 10 }}>
              {gelecekOdemeler.map((o, i) => (
                <OdemeSatiri
                  key={o.id}
                  o={o}
                  i={i}
                  gecikmis={false}
                  odendiIsaretle={odendiIsaretle}
                />
              ))}
            </div>
          )}
        </div>
      )}
      {kartOdemePenceresi && (
        <div
          className="bt-modal-arka"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setKartOdemePenceresi(null);
          }}
        >
          <div className="bt-modal" role="dialog" aria-modal="true" aria-labelledby="kart-odeme-baslik">
            <div className="bt-modalbaslik">
              <div>
                <div className="bt-eyebrow">Kredi kartı ödemesi</div>
                <div id="kart-odeme-baslik" className="bt-h2">
                  {kartOdemePenceresi.ad}
                </div>
              </div>
              <button className="bt-btn hayalet" onClick={() => setKartOdemePenceresi(null)} aria-label="Kapat">
                <X size={17} />
              </button>
            </div>
            <div className="bt-kart-odeme-ozet">
              <div>
                <span>Kalan minimum</span>
                <strong>{fmt(kartOdemePenceresi.tutar)}</strong>
              </div>
              <div>
                <span>Kalan toplam borç</span>
                <strong>{fmt(kartOdemePenceresi.kalanToplam)}</strong>
              </div>
            </div>
            <div className="bt-kart-odeme-secenekler">
              <button
                className="bt-kart-odeme-secimi"
                type="button"
                disabled={kartOdemePenceresi.tutar <= 0}
                onClick={() => {
                  kartOdemesiKaydet(kartOdemePenceresi.anahtar, kartOdemePenceresi.tutar, "minimum");
                  setKartOdemePenceresi(null);
                }}
              >
                <span><strong>Minimumu ödedim</strong><small>Bu dönemin zorunlu ödeme tutarını tamamlar.</small></span>
                <b>{kartOdemePenceresi.tutar > 0 ? fmt(kartOdemePenceresi.tutar) : "Tamamlandı"}</b>
              </button>
              <div className="bt-kart-odeme-secimi" style={{ cursor: "default" }}>
                <span><strong>Kısmi ödeme yaptım</strong><small>Ödediğin gerçek tutarı yaz.</small></span>
                <span />
                <input
                  className="bt-input"
                  inputMode="decimal"
                  placeholder="Örn. 5.000"
                  value={kismiOdemeTutari}
                  onChange={(e) => setKismiOdemeTutari(e.target.value)}
                  style={{ gridColumn: "1/-1", width: "100%" }}
                />
                <button
                  className="bt-btn birincil"
                  type="button"
                  disabled={
                    !(parseParaGirisi(kismiOdemeTutari) > 0) ||
                    parseParaGirisi(kismiOdemeTutari) > kartOdemePenceresi.kalanToplam
                  }
                  onClick={() => {
                    kartOdemesiKaydet(
                      kartOdemePenceresi.anahtar,
                      parseParaGirisi(kismiOdemeTutari),
                      "kismi",
                    );
                    setKartOdemePenceresi(null);
                  }}
                  style={{ gridColumn: "1/-1", justifyContent: "center" }}
                >
                  Kısmi ödemeyi kaydet
                </button>
              </div>
              <button
                className="bt-kart-odeme-secimi"
                type="button"
                onClick={() => {
                  kartOdemesiKaydet(
                    kartOdemePenceresi.anahtar,
                    kartOdemePenceresi.kalanToplam,
                    "tamami",
                  );
                  setKartOdemePenceresi(null);
                }}
              >
                <span><strong>Tamamını ödedim</strong><small>Ekstrenin kalan borcunu tamamen kapatır.</small></span>
                <b>{fmt(kartOdemePenceresi.kalanToplam)}</b>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Borçlar (kategori pilleriyle tek panel) ---------------- */
function Borclar({
  veri,
  form,
  setForm,
  ekleGuncelle,
  sil,
  odendiIsaretle,
  bankalar,
  bankaEkle,
  kategori,
  setKategori,
}) {
  const [seciliEkstreAyi, setSeciliEkstreAyi] = useState("guncel");
  const [seciliKrediAyi, setSeciliKrediAyi] = useState("guncel");
  const [yeniBanka, setYeniBanka] = useState("");
  const [bankaPenceresi, setBankaPenceresi] = useState(false);
  const [silinecekEkHesapOdemesi, setSilinecekEkHesapOdemesi] = useState(null);
  const oncekiKategori = useRef("cards");
  const meta = KATEGORI_META[kategori] || KATEGORI_META.cards;
  const guncelEkstreAyi = useMemo(() => {
    const aylar = veri.cards
      .flatMap((k) => [
        k.ekstreAyi,
        ...(k.ekstreGecmisi || []).map((e) => e.ekstreAyi),
      ])
      .filter(Boolean)
      .sort();
    return aylar.at(-1) || ayAnahtari();
  }, [veri.cards]);
  const ekstreAylar = useMemo(
    () =>
      [
        ...new Set(
          veri.cards
            .flatMap((k) => (k.ekstreGecmisi || []).map((e) => e.ekstreAyi))
            .filter(Boolean),
        ),
      ]
        .sort()
        .reverse(),
    [veri.cards],
  );
  const gelecekKrediAylar = useMemo(
    () => Array.from({ length: 6 }, (_, i) => ayEkle(ayAnahtari(), i + 1)),
    [],
  );
  const krediAylar = useMemo(
    () =>
      [
        ...new Set(
          [
            ...Object.keys(veri.loanPaymentHistory || {}).filter(
              (ay) =>
                Object.keys(veri.loanPaymentHistory?.[ay] || {}).length > 0,
            ),
            ...Object.keys(veri.paid || {})
              .filter((k) => k.startsWith("kredi-") && veri.paid[k])
              .map((k) => k.slice(-7)),
          ].filter((ay) => ay && ay !== ayAnahtari()),
        ),
      ]
        .sort()
        .reverse(),
    [veri.loanPaymentHistory, veri.paid],
  );
  const arsivGorunumu = kategori === "cards" && seciliEkstreAyi !== "guncel";
  const krediGelecekGorunumu =
    kategori === "loans" && gelecekKrediAylar.includes(seciliKrediAyi);
  const krediArsivGorunumu =
    kategori === "loans" &&
    seciliKrediAyi !== "guncel" &&
    !krediGelecekGorunumu;
  const kayitlar =
    kategori === "kontrol"
      ? []
      : arsivGorunumu
        ? veri.cards.flatMap((k) => {
            const e = [...(k.ekstreGecmisi || [])]
              .reverse()
              .find((x) => x.ekstreAyi === seciliEkstreAyi);
            return e ? [{ ...k, ...e, _arsiv: true }] : [];
          })
        : krediArsivGorunumu
          ? veri.loans.flatMap((k) => {
              const gecmis = veri.loanPaymentHistory?.[seciliKrediAyi]?.[k.id];
              const odendi =
                !!veri.paid?.["kredi-" + k.id + "-" + seciliKrediAyi];
              return gecmis || odendi
                ? [
                    {
                      ...k,
                      ...(gecmis || {}),
                      _arsiv: true,
                      _odendi: odendi,
                      _donem: seciliKrediAyi,
                    },
                  ]
                : [];
            })
          : krediGelecekGorunumu
            ? veri.loans.flatMap((k) => {
                const fark = ayFarki(ayAnahtari(), seciliKrediAyi);
                const kalanTaksit = +k.kalanTaksit || null;
                if (
                  (+k.kalanBorc || 0) <= 0 ||
                  (kalanTaksit !== null && kalanTaksit <= fark)
                )
                  return [];
                return [
                  {
                    ...k,
                    _gelecek: true,
                    _donem: seciliKrediAyi,
                    _kalanTaksitProj:
                      kalanTaksit === null
                        ? null
                        : Math.max(kalanTaksit - fark - 1, 0),
                  },
                ];
              })
            : veri[meta.liste] || [];
  const saltOkunurGorunum =
    arsivGorunumu || krediArsivGorunumu || krediGelecekGorunumu;
  const acik = form && form.liste === meta.liste;
  const yeniEkstreModu = kategori === "cards" && acik && form.yeniEkstre;
  const ekstreDuzenleModu = kategori === "cards" && acik && form.ekstreDuzenle;
  const ekstreFormu = yeniEkstreModu || ekstreDuzenleModu;
  const ekHesapOdemeModu =
    kategori === "od" && acik && (form.odemeGir || form.odemeDuzenle);
  const [f, setF] = useState({});
  const otomatikGecikenler = useMemo(() => {
    const ay = ayAnahtari();
    const liste = [];
    veri.cards.forEach((k) => {
      const h = kartHesabi(k);
      const tarih = kartGecikmeTarihi(k);
      const gun = -kalanGun(tarih);
      const asgariOran = (+k.limit || 0) <= 50000 ? 0.2 : 0.4;
      const asgariTamam = h.odeme >= h.onceki * asgariOran;
      const odendi = !!veri.paid?.[kartOdemeAnahtari(k)];
      if (gun > 0 && h.toplam > 0) {
        const minimumTamam = asgariTamam || odendi;
        const oran = minimumTamam
          ? tcmbKartAzamiFaizi(h.onceki || h.toplam)
          : tcmbKartAzamiGecikmeFaizi(h.onceki || h.toplam);
        liste.push({
          id: "kart-" + k.id,
          tur: minimumTamam ? "Devreden kart borcu" : "Gecikmiş kart borcu",
          durum: minimumTamam ? "devreden" : "gecikmis",
          banka: k.banka,
          ad: k.ad || "Kredi kartı",
          tarih,
          gun,
          bakiye: h.toplam,
          oran,
          faiz: minimumTamam
            ? (h.toplam * oran) / 100
            : gunlukBirikmisFaiz(h.toplam, oran, gun),
        });
      }
    });
    veri.loans.forEach((k) => {
      const tarih = buAyOdemeTarihi(k.odemeGunu);
      const gun = -kalanGun(tarih);
      const odendi = !!veri.paid?.["kredi-" + k.id + "-" + ay];
      if (gun > 0 && (+k.kalanBorc || 0) > 0 && !odendi) {
        const bakiye = +k.taksit || 0;
        const oran = +k.faiz || 0;
        liste.push({
          id: "kredi-" + k.id,
          tur: "Kredi taksiti",
          banka: k.banka,
          ad: k.ad || "Kredi",
          tarih,
          gun,
          bakiye,
          oran,
          faiz: gunlukBirikmisFaiz(bakiye, oran, gun),
        });
      }
    });
    return liste.sort((a, b) => b.gun - a.gun);
  }, [veri]);
  const devredenSayisi = otomatikGecikenler.filter(
    (kayit) => kayit.durum === "devreden",
  ).length;
  const gecikmisSayisi = otomatikGecikenler.length - devredenSayisi;
  useEffect(() => {
    if (!acik) return;
    if (form.odemeGir || form.odemeDuzenle) {
      const hesap = ekHesapHesabi(form.veri || {});
      setF({
        odemeTutari: form.odemeDuzenle
          ? form.odemeDuzenle.tutar
          : form.kapat
            ? hesap.kalan
            : "",
        odemeTarihi: yerelTarihSaatDegeri(
          form.odemeDuzenle?.tarih || new Date(),
        ),
      });
    } else if (form.yeniEkstre) {
      const eski = form.veri || {};
      const sonDonem = [
        eski.ekstreAyi,
        ...(eski.ekstreGecmisi || []).map((e) => e.ekstreAyi),
      ]
        .filter(Boolean)
        .sort()
        .at(-1);
      setF({
        ekstreAyi: sonDonem ? ayEkle(sonDonem, 1) : guncelEkstreAyi,
        yeniDonemEkstreBorcu: "",
        oncekiAydanKalan: kartHesabi(eski).toplam || "",
        yapilanOdeme: "0",
        limit: eski.limit || "",
        kesimGunu: eski.kesimGunu || "",
        sonOdemeGunu: eski.sonOdemeGunu || "",
      });
    } else if (form.ekstreDuzenle) {
      const eski = form.veri || {};
      const yeniModel =
        eski.yeniDonemEkstreBorcu !== undefined ||
        eski.toplamEkstreBorcu !== undefined ||
        eski.oncekiDonemBorcu !== undefined;
      const hesap = kartHesabi(eski);
      setF({
        ekstreAyi: eski.ekstreAyi || ayAnahtari(),
        yeniDonemEkstreBorcu: yeniModel ? hesap.yeni : "",
        oncekiAydanKalan: eski.oncekiAydanKalan || "",
        yapilanOdeme: yeniModel ? eski.yapilanOdeme || "0" : "",
        limit: eski.limit || "",
        kesimGunu: eski.kesimGunu || "",
        sonOdemeGunu:
          eski.sonOdemeGunu ||
          (eski.sonOdemeTarihi ? +eski.sonOdemeTarihi.slice(-2) : ""),
      });
    } else setF(form.veri || {});
  }, [acik, form, kategori, guncelEkstreAyi]);

  const ALAN_TANIMLARI = {
    cards: [
      { k: "banka", e: "Banka", t: "text", z: true },
      { k: "ad", e: "Kart adı (Bonus, World…)", t: "text", z: true },
      { k: "limit", e: "Toplam kart limiti (₺)", t: "number", z: true },
      { k: "kesimGunu", e: "Ekstre kesim günü", t: "number", z: true },
      {
        k: "sonOdemeGunu",
        e: "Son ödeme günü (ayın kaçı)",
        t: "number",
        z: true,
      },
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
      {
        k: "kullanilan",
        e: "Kullanılan toplam tutar (₺)",
        t: "number",
        z: true,
      },
      { k: "yapilanOdeme", e: "Bugüne kadar yapılan ödeme (₺)", t: "number" },
      { k: "faiz", e: "Aylık faiz oranı (%)", t: "number" },
    ],
    others: [
      { k: "banka", e: "Alacaklı (banka / kurum / kişi)", t: "text", z: true },
      { k: "ad", e: "Açıklama (2023 kart borcu, icra…)", t: "text" },
      { k: "tutar", e: "Güncel tutar (₺)", t: "number", z: true },
      { k: "faiz", e: "Aylık faiz / gecikme oranı (%)", t: "number" },
    ],
  };
  const alanlar = ekHesapOdemeModu
    ? [
        { k: "odemeTutari", e: "Ödeme tutarı (₺)", t: "number", z: true },
        {
          k: "odemeTarihi",
          e: "Ödeme tarihi ve saati",
          t: "datetime-local",
          z: true,
        },
      ]
    : ekstreFormu
      ? [
          { k: "ekstreAyi", e: "Ekstre dönemi", t: "month", z: true },
          {
            k: "yeniDonemEkstreBorcu",
            e: "Güncel dönem borcu (₺)",
            t: "number",
            z: true,
          },
          { k: "oncekiAydanKalan", e: "Geçen aydan devreden (₺)", t: "number" },
          { k: "yapilanOdeme", e: "Toplam ödenen (₺)", t: "number", z: true },
          { k: "kesimGunu", e: "Ekstre kesim günü", t: "number" },
          {
            k: "sonOdemeGunu",
            e: "Son ödeme günü (ayın kaçı)",
            t: "number",
            z: true,
          },
        ]
      : ALAN_TANIMLARI[kategori];

  function toplamHesapla() {
    if (kategori === "cards")
      return kayitlar.reduce((t, k) => t + kartHesabi(k).toplam, 0);
    if (kategori === "loans")
      return kayitlar.reduce(
        (t, k) =>
          t +
          (krediArsivGorunumu || krediGelecekGorunumu
            ? +k.taksit || 0
            : +k.kalanBorc || 0),
        0,
      );
    if (kategori === "od")
      return kayitlar.reduce((t, k) => t + ekHesapHesabi(k).kalan, 0);
    return (
      kayitlar.reduce((t, k) => t + (+k.tutar || 0), 0) +
      (kategori === "others"
        ? otomatikGecikenler.reduce((t, k) => t + (+k.bakiye || 0), 0)
        : 0)
    );
  }
  function sayacHesapla() {
    const n = kayitlar.length;
    if (kategori === "cards") return n + " kredi kartı";
    if (kategori === "loans")
      return krediArsivGorunumu
        ? n + " ödenmiş taksit"
        : krediGelecekGorunumu
          ? n + " planlanan taksit"
          : n + " kredi";
    if (kategori === "od") return n + " ek hesap / KMH";
    if (kategori === "others") return n + otomatikGecikenler.length + " borç";
    return n + " kayıt";
  }

  const odemeOzeti = (() => {
    let toplam = 0,
      odenen = 0,
      kalan = 0,
      baslik = "";
    if (kategori === "cards" && !arsivGorunumu) {
      baslik = "Kredi kartlarında ödeme ilerlemesi";
      veri.cards.forEach((k) => {
        const h = kartHesabi(k);
        toplam += h.onceki;
        odenen += h.odeme;
        kalan += h.toplam;
      });
    } else if (
      kategori === "loans" &&
      !krediArsivGorunumu &&
      !krediGelecekGorunumu
    ) {
      baslik = "Kredilerde ödeme ilerlemesi";
      veri.loans.forEach((k) => {
        const krediOdemeleri = Object.values(veri.loanPaymentHistory || {})
          .map((ay) => ay?.[k.id])
          .filter(Boolean);
        const kayitliOdeme = krediOdemeleri.reduce(
          (t, odeme) => t + (+odeme.taksit || +k.taksit || 0),
          0,
        );
        const krediToplami = Math.max(+k.kalanBorc || 0, 0);
        const odenenTutar = Math.min(kayitliOdeme, krediToplami);
        toplam += krediToplami;
        odenen += odenenTutar;
        kalan += Math.max(krediToplami - odenenTutar, 0);
      });
    } else if (kategori === "od") {
      baslik = "Ek hesap / KMH ödeme ilerlemesi";
      veri.overdrafts.forEach((k) => {
        const h = ekHesapHesabi(k);
        toplam += h.kullanilan;
        odenen += h.odeme;
        kalan += h.kalan;
      });
    } else if (kategori === "others") {
      baslik = "Devreden ve gecikmiş borçlarda ödeme ilerlemesi";
      otomatikGecikenler.forEach((g) => {
        if (g.id.startsWith("kart-")) {
          const kart = veri.cards.find((k) => "kart-" + k.id === g.id);
          const h = kart ? kartHesabi(kart) : null;
          toplam += h?.onceki || g.bakiye;
          odenen += h?.odeme || 0;
          kalan += h?.toplam || g.bakiye;
        } else {
          toplam += +g.bakiye || 0;
          kalan += +g.bakiye || 0;
        }
      });
      veri.others.forEach((k) => {
        toplam += +k.tutar || 0;
        kalan += +k.tutar || 0;
      });
    }
    if (!baslik || toplam <= 0) return null;
    return {
      baslik,
      toplam,
      odenen: Math.min(odenen, toplam),
      kalan,
      oran: Math.min(Math.max((odenen / toplam) * 100, 0), 100),
    };
  })();

  function gonder() {
    for (const a of alanlar) if (a.z && !String(f[a.k] ?? "").trim()) return;
    if (ekHesapOdemeModu) {
      const eski = form.veri;
      const hesap = ekHesapHesabi(eski);
      const eskiGecmis = eski.odemeGecmisi || [];
      const gecmisDisi = gecmisDisiEkHesapOdemesi(eski);
      const digerGecmis = form.odemeDuzenle
        ? eskiGecmis.filter((o) => o.id !== form.odemeDuzenle.id)
        : eskiGecmis;
      const azamiOdeme = Math.max(
        hesap.kullanilan - gecmisDisi - odemeGecmisiToplami(digerGecmis),
        0,
      );
      const odeme = Math.min(Math.max(+f.odemeTutari || 0, 0), azamiOdeme);
      if (odeme <= 0) return;
      const tarih = new Date(f.odemeTarihi);
      if (Number.isNaN(tarih.getTime())) return;
      const kayit = {
        ...(form.odemeDuzenle || {}),
        id: form.odemeDuzenle?.id || uid(),
        tutar: odeme,
        tarih: tarih.toISOString(),
        duzenlenmeTarihi: form.odemeDuzenle
          ? new Date().toISOString()
          : undefined,
      };
      const odemeGecmisi = form.odemeDuzenle
        ? eskiGecmis.map((o) => (o.id === kayit.id ? kayit : o))
        : [...eskiGecmis, kayit];
      ekleGuncelle("overdrafts", {
        ...eski,
        yapilanOdeme: gecmisDisi + odemeGecmisiToplami(odemeGecmisi),
        odemeGecmisi,
      });
      return;
    }
    const ekstreVerisi = ekstreFormu
      ? {
          ...f,
          toplamEkstreBorcu:
            (+f.yeniDonemEkstreBorcu || 0) + (+f.oncekiAydanKalan || 0),
        }
      : f;
    if (yeniEkstreModu) {
      const eski = form.veri;
      const mevcutDonem = eski.ekstreAyi || guncelEkstreAyi;
      if (ekstreVerisi.ekstreAyi < mevcutDonem) {
        const arsiv = {
          ...ekstreVerisi,
          arsivlenmeTarihi: new Date().toISOString(),
        };
        ekleGuncelle("cards", {
          ...eski,
          ekstreGecmisi: [
            ...(eski.ekstreGecmisi || []).filter(
              (e) => e.ekstreAyi !== ekstreVerisi.ekstreAyi,
            ),
            arsiv,
          ],
        });
        return;
      }
      const arsiv = ekstreSnapshot(eski, mevcutDonem);
      ekleGuncelle("cards", {
        ...eski,
        ...ekstreVerisi,
        ekstreGecmisi: [
          ...(eski.ekstreGecmisi || []).filter(
            (e) => e.ekstreAyi !== mevcutDonem,
          ),
          arsiv,
        ],
      });
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

  function ekHesapOdemesiSil(kart, odeme) {
    setSilinecekEkHesapOdemesi({ kart, odeme });
  }

  function ekHesapOdemesiSilmeyiOnayla() {
    if (!silinecekEkHesapOdemesi) return;
    const { kart, odeme } = silinecekEkHesapOdemesi;
    const odemeGecmisi = (kart.odemeGecmisi || []).filter((o) =>
      odeme.id ? o.id !== odeme.id : o.tarih !== odeme.tarih,
    );
    const yapilanOdeme =
      gecmisDisiEkHesapOdemesi(kart) + odemeGecmisiToplami(odemeGecmisi);
    ekleGuncelle("overdrafts", { ...kart, yapilanOdeme, odemeGecmisi });
    setSilinecekEkHesapOdemesi(null);
  }

  return (
    <div className="bt-stack">
      <div
        className={
          "bt-borc-araclari " +
          (kategori === "others" ? "filtre-aktif" : "")
        }
      >
        <div>
          <div className="bt-borc-araclari-baslik">
            <div className="bt-borc-araclari-ikon">
              {kategori === "others" ? (
                <AlertTriangle size={17} />
              ) : (
                <SlidersHorizontal size={17} />
              )}
            </div>
            <div>
              <span>
                {kategori === "others"
                  ? "Filtrelenmiş görünüm"
                  : "Borç görünümü"}
              </span>
              <strong>
                {kategori === "others"
                  ? "Devreden ve gecikmiş borçlar"
                  : "Ekstre kontrolü ve riskli borçlar"}
              </strong>
            </div>
          </div>
          <div className="bt-borc-araclari-aciklama">
            {kategori === "others"
              ? `${devredenSayisi} devreden · ${gecikmisSayisi} gecikmiş kayıt gösteriliyor. Bu kayıtlar kart ve kredilerinden otomatik oluşur.`
              : "Ana borç listenden ayrılmadan ekstrelerini karşılaştır veya yalnızca devreden ve gecikmiş kayıtları gör."}
          </div>
        </div>
        <div className="bt-borc-araclari-actions">
          {kategori === "others" ? (
            <button
              type="button"
              className="bt-btn kucuk ikincil"
              onClick={() => {
                setKategori(oncekiKategori.current || "cards");
                setForm(null);
              }}
            >
              <ChevronLeft size={14} /> Önceki borç listesine dön
            </button>
          ) : (
            <>
              <button
                type="button"
                className="bt-status-filter"
                onClick={() => {
                  oncekiKategori.current =
                    kategori === "kontrol" ? "cards" : kategori;
                  setKategori("others");
                  setForm(null);
                }}
              >
                <AlertTriangle size={14} />
                {otomatikGecikenler.length > 0
                  ? `${otomatikGecikenler.length} riskli kayıt`
                  : "Devreden / gecikmiş"}
              </button>
              {(kategori === "cards" || kategori === "kontrol") && (
                <button
                  className="bt-btn kucuk ikincil"
                  onClick={() => {
                    setKategori(
                      kategori === "kontrol" ? "cards" : "kontrol",
                    );
                    setForm(null);
                  }}
                >
                  {kategori === "kontrol"
                    ? "Kredi kartlarına dön"
                    : "Ekstre kontrolünü aç"}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {kategori === "cards" && (
        <div className="bt-card" style={{ padding: 14 }}>
          <div className="bt-cardhead" style={{ margin: 0 }}>
            <div>
              <div className="bt-h2" style={{ margin: 0 }}>
                Ekstre dönemi
              </div>
              <div
                style={{ fontSize: 11.5, color: "var(--dim)", marginTop: 4 }}
              >
                Güncel kartları veya arşivlenmiş geçmiş ekstreleri görüntüleyin.
              </div>
            </div>
            <select
              className="bt-input"
              style={{ width: "min(240px,100%)", margin: 0 }}
              value={seciliEkstreAyi}
              onChange={(e) => {
                setSeciliEkstreAyi(e.target.value);
                setForm(null);
              }}
            >
              <option value="guncel">
                {ayEtiketi(guncelEkstreAyi)} (Güncel)
              </option>
              {ekstreAylar
                .filter((ay) => ay !== guncelEkstreAyi)
                .map((ay) => (
                  <option key={ay} value={ay}>
                    {ayEtiketi(ay)}
                  </option>
                ))}
            </select>
          </div>
        </div>
      )}
      {kategori === "loans" && (
        <div className="bt-card" style={{ padding: 14 }}>
          <div className="bt-cardhead" style={{ margin: 0 }}>
            <div>
              <div className="bt-h2" style={{ margin: 0 }}>
                Kredi ödeme dönemi
              </div>
              <div
                style={{ fontSize: 11.5, color: "var(--dim)", marginTop: 4 }}
              >
                Güncel, gelecek 6 ay veya geçmişte ödenen taksitleri
                görüntüleyin.
              </div>
            </div>
            <select
              className="bt-input"
              style={{ width: "min(240px,100%)", margin: 0 }}
              value={seciliKrediAyi}
              onChange={(e) => {
                setSeciliKrediAyi(e.target.value);
                setForm(null);
              }}
            >
              <option value="guncel">{ayEtiketi(ayAnahtari())} (Güncel)</option>
              {gelecekKrediAylar.map((ay) => (
                <option key={ay} value={ay}>
                  {ayEtiketi(ay)} (Gelecek)
                </option>
              ))}
              {krediAylar.map((ay) => (
                <option key={ay} value={ay}>
                  {ayEtiketi(ay)} (Geçmiş)
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {kategori === "kontrol" ? (
        <EkstreKontrol veri={veri} />
      ) : (
        <div className="bt-card" data-tour="borclar">
          <div className="bt-strip">
            <div className="bt-strip-count">{sayacHesapla()}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div className="bt-strip-total bt-mono">
                {fmt(toplamHesapla())}
              </div>
              {!acik && !saltOkunurGorunum && kategori !== "others" && (
                <button
                  className="bt-btn kucuk ikincil"
                  onClick={() => setForm({ liste: meta.liste, veri: {} })}
                >
                  <Plus size={14} />{" "}
                  {kategori === "cards"
                    ? "Yeni kart ekle"
                    : kategori === "loans"
                      ? "Yeni kredi ekle"
                      : "Yeni ek hesap ekle"}
                </button>
              )}
            </div>
          </div>

          {!acik && odemeOzeti && (
            <BorcOdemeGrafigi
              ozet={odemeOzeti}
              depolamaAnahtari={kategori}
            />
          )}

          {acik && (
            <div className="bt-form">
              {yeniEkstreModu && (
                <div className="bt-ipucu" style={{ marginBottom: 14 }}>
                  <Lightbulb size={16} />
                  <div>
                    <b>
                      {form.veri.banka} · {form.veri.ad || "Kredi kartı"}
                    </b>{" "}
                    için yeni dönem ekstresi giriliyor. Mevcut ekstre geçmişe
                    taşınacak; silinmeyecek.
                  </div>
                </div>
              )}
              {ekstreDuzenleModu && (
                <div className="bt-ipucu" style={{ marginBottom: 14 }}>
                  <Lightbulb size={16} />
                  <div>
                    <b>
                      {form.veri.banka} · {form.veri.ad || "Kredi kartı"}
                    </b>{" "}
                    güncel ekstresi düzenleniyor. Toplam ekstre ve yapılan
                    ödemeyi girince kalan borç yeniden hesaplanır.
                  </div>
                </div>
              )}
              {ekHesapOdemeModu &&
                (() => {
                  const h = ekHesapHesabi(form.veri);
                  return (
                    <div className="bt-ipucu" style={{ marginBottom: 14 }}>
                      <Lightbulb size={16} />
                      <div>
                        <b>
                          {form.veri.banka} ·{" "}
                          {form.odemeDuzenle
                            ? "Ödeme kaydını düzenle"
                            : "Ek hesap"}
                        </b>
                        <br />
                        Kullanılan {fmt(h.kullanilan)} · toplam ödenen{" "}
                        {fmt(h.odeme)} · kalan <b>{fmt(h.kalan)}</b>
                      </div>
                    </div>
                  );
                })()}
              <div className="bt-alanlar">
                {alanlar.map((a) => (
                  <label key={a.k} className="bt-alan">
                    {a.e}
                    {a.z ? " *" : ""}
                    {a.k === "banka" && kategori !== "others" ? (
                      <select
                        className="bt-input"
                        value={f.banka ?? ""}
                        onChange={(e) => {
                          if (e.target.value === "__diger__")
                            setBankaPenceresi(true);
                          else setF({ ...f, banka: e.target.value });
                        }}
                      >
                        <option value="">Banka seçin…</option>
                        {bankalar.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                        <option value="__diger__">Diğer…</option>
                      </select>
                    ) : (
                      <input
                        className="bt-input"
                        type={a.t}
                        min={a.t === "number" ? 0 : undefined}
                        step={a.k === "faiz" ? "0.01" : undefined}
                        value={f[a.k] ?? ""}
                        onChange={(e) => setF({ ...f, [a.k]: e.target.value })}
                      />
                    )}
                  </label>
                ))}
              </div>
              {kategori === "cards" &&
                f.yeniDonemEkstreBorcu !== "" &&
                f.yeniDonemEkstreBorcu !== undefined &&
                (() => {
                  const h = kartHesabi(f);
                  return (
                    <div className="bt-ipucu" style={{ marginTop: 14 }}>
                      <Lightbulb size={16} />
                      <div>
                        <b>Otomatik hesap:</b> Güncel dönem {fmt(h.yeni)} +
                        devreden {fmt(h.oncekiDevreden)} ={" "}
                        <b>{fmt(h.onceki)} toplam borç</b>. Toplam ödenen{" "}
                        {fmt(h.odeme)} sonrası <b>{fmt(h.devreden)} kalır</b>.
                        Tahmini aylık faiz {fmt(h.faiz)} (%{h.oran.toFixed(2)}).
                        Yasal minimum ödeme: <b>{fmt(h.asgari)}</b> (
                        {(+f.limit || 0) <= 50000 ? "%20" : "%40"}, kart
                        limitine göre).
                      </div>
                    </div>
                  );
                })()}
              {ekHesapOdemeModu &&
                f.odemeTutari &&
                (() => {
                  const h = ekHesapHesabi(form.veri);
                  const gecmisDisi = gecmisDisiEkHesapOdemesi(form.veri);
                  const digerGecmis = form.odemeDuzenle
                    ? (form.veri.odemeGecmisi || []).filter(
                        (o) => o.id !== form.odemeDuzenle.id,
                      )
                    : form.veri.odemeGecmisi || [];
                  const azami = Math.max(
                    h.kullanilan -
                      gecmisDisi -
                      odemeGecmisiToplami(digerGecmis),
                    0,
                  );
                  const odeme = Math.min(+f.odemeTutari || 0, azami);
                  const toplamOdeme =
                    gecmisDisi + odemeGecmisiToplami(digerGecmis) + odeme;
                  const kalan = Math.max(h.kullanilan - toplamOdeme, 0);
                  return (
                    <div className="bt-ipucu" style={{ marginTop: 14 }}>
                      <Lightbulb size={16} />
                      <div>
                        <b>Ödeme sonrası:</b> Kalan borç <b>{fmt(kalan)}</b> ·
                        tahmini aylık faiz {fmt((kalan * h.oran) / 100)} (%
                        {h.oran.toFixed(2)}).
                      </div>
                    </div>
                  );
                })()}
              <div className="bt-form-butonlar">
                <button className="bt-btn birincil" onClick={gonder}>
                  <Check size={14} />{" "}
                  {ekHesapOdemeModu
                    ? form.odemeDuzenle
                      ? "Ödemeyi güncelle"
                      : form.kapat
                        ? "Borcu kapat"
                        : "Ödemeyi kaydet"
                    : yeniEkstreModu
                      ? "Yeni ekstreyi kaydet"
                      : ekstreDuzenleModu
                        ? "Ekstreyi güncelle"
                        : f.id
                          ? "Güncelle"
                          : "Kaydet"}
                </button>
                <button
                  className="bt-btn ikincil"
                  onClick={() => setForm(null)}
                >
                  Vazgeç
                </button>
              </div>
            </div>
          )}

          {kategori === "others" && otomatikGecikenler.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  fontSize: 11.5,
                  color: "var(--dim)",
                  marginBottom: 12,
                }}
              >
                Asgarisi ödenen kart bakiyesi devreden borç, asgarisi
                karşılanmayan bakiye gecikmiş borç olarak gösterilir. Faizler
                yaklaşık değerdir.
              </div>
              <div className="bt-stack" style={{ gap: 10 }}>
                {otomatikGecikenler.map((g, i) => (
                  <GecikmisBorcSatiri key={g.id} g={g} i={i} />
                ))}
              </div>
            </div>
          )}

          {kayitlar.length === 0 &&
          !acik &&
          !(kategori === "others" && otomatikGecikenler.length > 0) ? (
            <div className="bt-bos">
              {arsivGorunumu
                ? ayEtiketi(seciliEkstreAyi) + " için arşivlenmiş ekstre yok."
                : krediArsivGorunumu
                  ? ayEtiketi(seciliKrediAyi) +
                    " için ödenmiş kredi taksiti kaydı yok."
                  : krediGelecekGorunumu
                    ? ayEtiketi(seciliKrediAyi) +
                      " döneminde planlanan kredi taksiti yok."
                    : "Henüz kayıt yok."}
            </div>
          ) : (
            <div className="bt-stack" style={{ gap: 12 }}>
              {kategori === "others" && kayitlar.length > 0 && (
                <div>
                  <div className="bt-h2" style={{ marginBottom: 5 }}>
                    Diğer kayıtlı borçlar
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--dim)" }}>
                    Daha önce manuel eklenmiş borçlar.
                  </div>
                </div>
              )}
              {kayitlar.map((k, i) => (
                <BorclarSatiri
                  key={k.id}
                  k={k}
                  i={i}
                  kategori={kategori}
                  meta={meta}
                  setForm={setForm}
                  sil={sil}
                  ekHesapOdemesiSil={ekHesapOdemesiSil}
                  paid={veri.paid}
                  odendiIsaretle={odendiIsaretle}
                  arsiv={saltOkunurGorunum}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {bankaPenceresi && (
        <div
          className="bt-modal-arka"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setBankaPenceresi(false);
          }}
        >
          <form
            className="bt-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bt-yeni-banka-baslik"
            onSubmit={bankaGonder}
          >
            <div
              id="bt-yeni-banka-baslik"
              className="bt-h2"
              style={{ marginBottom: 8 }}
            >
              Yeni banka ekle
            </div>
            <div
              style={{ fontSize: 12.5, color: "var(--dim)", marginBottom: 16 }}
            >
              Banka adı bir kez kaydedilir ve bundan sonra tüm banka
              listelerinde görünür.
            </div>
            <input
              className="bt-input"
              autoFocus
              placeholder="Banka veya finans kurumu adı"
              value={yeniBanka}
              onChange={(e) => setYeniBanka(e.target.value)}
            />
            <div className="bt-form-butonlar">
              <button className="bt-btn birincil" type="submit">
                <Plus size={14} /> Ekle ve seç
              </button>
              <button
                className="bt-btn ikincil"
                type="button"
                onClick={() => {
                  setBankaPenceresi(false);
                  setYeniBanka("");
                }}
              >
                Vazgeç
              </button>
            </div>
          </form>
        </div>
      )}
      {silinecekEkHesapOdemesi && (
        <div
          className="bt-modal-arka"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSilinecekEkHesapOdemesi(null);
          }}
        >
          <div
            className="bt-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bt-odeme-sil-baslik"
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: CORAL,
                border: "2px solid var(--line)",
                display: "grid",
                placeItems: "center",
                marginBottom: 14,
              }}
            >
              <Trash2 size={20} />
            </div>
            <div
              id="bt-odeme-sil-baslik"
              className="bt-h2"
              style={{ marginBottom: 8 }}
            >
              Ödeme kaydı silinsin mi?
            </div>
            <div
              style={{ fontSize: 12.5, color: "var(--dim)", lineHeight: 1.55 }}
            >
              Bu işlem{" "}
              <b style={{ color: "var(--text)" }}>
                {silinecekEkHesapOdemesi.kart.banka}
              </b>{" "}
              ek hesabındaki{" "}
              <b style={{ color: "var(--text)" }}>
                {fmt(silinecekEkHesapOdemesi.odeme.tutar)}
              </b>{" "}
              tutarındaki ödeme kaydını kaldıracak. Kalan borç ve faiz yeniden
              hesaplanacak.
            </div>
            <div className="bt-metric" style={{ padding: 11, marginTop: 14 }}>
              <div className="bt-metric-lbl">Kayıt tarihi</div>
              <div style={{ fontWeight: 700, marginTop: 3 }}>
                {tarihSaatEtiketi(silinecekEkHesapOdemesi.odeme.tarih)}
              </div>
            </div>
            <div className="bt-form-butonlar">
              <button
                className="bt-btn birincil"
                style={{ background: CORAL }}
                type="button"
                onClick={ekHesapOdemesiSilmeyiOnayla}
              >
                <Trash2 size={14} /> Evet, sil
              </button>
              <button
                className="bt-btn ikincil"
                type="button"
                onClick={() => setSilinecekEkHesapOdemesi(null)}
              >
                Vazgeç
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BorcOdemeGrafigi({ ozet, depolamaAnahtari = "genel" }) {
  const kayitAnahtari =
    "borcama_odeme_grafigi_acik_" + depolamaAnahtari;
  const [acik, setAcik] = useState(
    () => localStorage.getItem(kayitAnahtari) !== "0",
  );

  function gorunumuDegistir() {
    const yeni = !acik;
    setAcik(yeni);
    localStorage.setItem(kayitAnahtari, yeni ? "1" : "0");
  }

  if (!acik)
    return (
      <div className="bt-odeme-ozet-kapali">
        <button
          className="bt-btn kucuk ikincil"
          type="button"
          aria-expanded="false"
          onClick={gorunumuDegistir}
        >
          <Plus size={14} /> Ödeme grafiğini göster
        </button>
      </div>
    );

  return (
    <div className="bt-odeme-ozet">
      <div className="bt-odeme-ozet-ust">
        <div>
          <div className="bt-metric-lbl">Toplam ödeme grafiği</div>
          <div className="bt-h2" style={{ marginTop: 4 }}>
            {ozet.baslik}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="bt-odeme-ozet-yuzde">%{Math.round(ozet.oran)}</div>
          <button
            className="bt-btn kucuk ikincil"
            type="button"
            aria-expanded={acik}
            onClick={gorunumuDegistir}
          >
            {acik ? <Minus size={14} /> : <Plus size={14} />}
            {acik ? "Kapat" : "Aç"}
          </button>
        </div>
      </div>
      <>
          <div
            className="bt-odeme-ilerleme"
            aria-label={"Ödeme ilerlemesi yüzde " + Math.round(ozet.oran)}
          >
            <div style={{ width: ozet.oran + "%" }} />
          </div>
          <div className="bt-odeme-ozet-rakamlar">
            <div className="bt-odeme-ozet-rakam">
              <div className="bt-metric-lbl">Toplam borç</div>
              <div className="bt-mono" style={{ fontWeight: 800, marginTop: 4 }}>
                {fmt(ozet.toplam)}
              </div>
            </div>
            <div className="bt-odeme-ozet-rakam">
              <div className="bt-metric-lbl">Toplam ödenen</div>
              <div
                className="bt-mono"
                style={{ fontWeight: 800, marginTop: 4, color: "#5D7A2E" }}
              >
                {fmt(ozet.odenen)}
              </div>
            </div>
            <div className="bt-odeme-ozet-rakam">
              <div className="bt-metric-lbl">Kalan borç</div>
              <div
                className="bt-mono"
                style={{ fontWeight: 800, marginTop: 4, color: CORAL }}
              >
                {fmt(ozet.kalan)}
              </div>
            </div>
          </div>
      </>
    </div>
  );
}

function ekstreDonemi(kart) {
  const gun = Math.min(Math.max(+kart.kesimGunu || 1, 1), 31);
  const simdi = bugun();
  let bitis = new Date(
    simdi.getFullYear(),
    simdi.getMonth(),
    Math.min(
      gun,
      new Date(simdi.getFullYear(), simdi.getMonth() + 1, 0).getDate(),
    ),
  );
  if (bitis > simdi)
    bitis = new Date(
      simdi.getFullYear(),
      simdi.getMonth() - 1,
      Math.min(
        gun,
        new Date(simdi.getFullYear(), simdi.getMonth(), 0).getDate(),
      ),
    );
  const oncekiKesim = new Date(
    bitis.getFullYear(),
    bitis.getMonth() - 1,
    Math.min(gun, new Date(bitis.getFullYear(), bitis.getMonth(), 0).getDate()),
  );
  const baslangic = new Date(oncekiKesim);
  baslangic.setDate(baslangic.getDate() + 1);
  const iso = (d) =>
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0");
  return { baslangic: iso(baslangic), bitis: iso(bitis) };
}

function ayaGoreEkstreDonemi(kart, ay) {
  const [yil, ayNo] = String(ay).split("-").map(Number);
  const gun = Math.min(Math.max(+kart.kesimGunu || 1, 1), 31);
  const bitis = new Date(
    yil,
    ayNo - 1,
    Math.min(gun, new Date(yil, ayNo, 0).getDate()),
  );
  const oncekiKesim = new Date(
    yil,
    ayNo - 2,
    Math.min(gun, new Date(yil, ayNo - 1, 0).getDate()),
  );
  const baslangic = new Date(oncekiKesim);
  baslangic.setDate(baslangic.getDate() + 1);
  const iso = (d) =>
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0");
  return { baslangic: iso(baslangic), bitis: iso(bitis) };
}

function harcamaEkstrePayi(harcama, kart, ekstreAyi) {
  if (!harcama?.tarih || !ekstreAyi) return 0;
  const taksitSayisi = Math.min(
    Math.max(parseInt(harcama.taksitSayisi) || 1, 1),
    60,
  );
  const [yil, ay, gun] = harcama.tarih.split("-").map(Number);
  if (!yil || !ay || !gun) return 0;
  const kesimGunu = Math.min(Math.max(parseInt(kart.kesimGunu) || 1, 1), 31);
  const ilkEkstreAyi = ayAnahtari(
    new Date(yil, ay - 1 + (gun > kesimGunu ? 1 : 0), 1),
  );
  const taksitSirasi = ayFarki(ilkEkstreAyi, ekstreAyi);
  if (taksitSirasi < 0 || taksitSirasi >= taksitSayisi) return 0;

  const toplamKurus = Math.round((+harcama.tutar || 0) * 100);
  const normalTaksitKurus = Math.floor(toplamKurus / taksitSayisi);
  return (
    (taksitSirasi === taksitSayisi - 1
      ? toplamKurus - normalTaksitKurus * (taksitSayisi - 1)
      : normalTaksitKurus) / 100
  );
}

function EkstreKontrol({ veri }) {
  const [seciliAy, setSeciliAy] = useState(() => ayAnahtari());
  const kontrolAylar = useMemo(
    () =>
      [
        ...new Set(
          [
            ayAnahtari(),
            ...veri.cards.flatMap((k) => [
              k.ekstreAyi,
              ...(k.ekstreGecmisi || []).map((e) => e.ekstreAyi),
            ]),
          ].filter(Boolean),
        ),
      ]
        .sort()
        .reverse(),
    [veri.cards],
  );
  const kaynaklar = useMemo(() => {
    const m = {};
    veri.expenses.forEach((h) => {
      const kaynak = h.kaynak || "Kaynak belirtilmemiş";
      if (!m[kaynak]) m[kaynak] = { toplam: 0, adet: 0 };
      m[kaynak].toplam += +h.tutar || 0;
      m[kaynak].adet += 1;
    });
    return Object.entries(m).sort((a, b) => b[1].toplam - a[1].toplam);
  }, [veri.expenses]);

  return (
    <div className="bt-stack">
      <div className="bt-card" style={{ padding: 14 }}>
        <div className="bt-cardhead" style={{ margin: 0 }}>
          <div>
            <div className="bt-h2" style={{ margin: 0 }}>
              Kontrol dönemi
            </div>
            <div style={{ fontSize: 11.5, color: "var(--dim)", marginTop: 4 }}>
              Gerçek ekstre ve manuel harcamaları seçtiğiniz dönemde
              karşılaştırın.
            </div>
          </div>
          <select
            className="bt-input"
            style={{ width: "min(240px,100%)", margin: 0 }}
            value={seciliAy}
            onChange={(e) => setSeciliAy(e.target.value)}
          >
            {kontrolAylar.map((ay) => (
              <option key={ay} value={ay}>
                {ayEtiketi(ay)}
                {ay === ayAnahtari() ? " (Güncel)" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="bt-ipucu">
        <Lightbulb size={16} />
        <div>
          <b>Ekstre kontrolü:</b> Harcamalar bölümünde karta yazdığınız işlemler
          seçili dönemde “Manuel kaydedilenler” kutusunda birikir. Banka
          ekstresi henüz girilmediyse “Gerçek ekstre” sıfır görünür.
        </div>
      </div>
      {veri.cards.length === 0 ? (
        <div className="bt-card">
          <div className="bt-bos">
            Kontrol için önce bir kredi kartı ekleyin.
          </div>
        </div>
      ) : (
        veri.cards.map((k, i) => {
          const donem = ayaGoreEkstreDonemi(k, seciliAy);
          const etiket = k.banka + " · " + (k.ad || "Kredi kartı");
          const manuelHarcamalar = veri.expenses
            .filter((h) => h.kaynak === etiket)
            .map((h) => ({
              ...h,
              donemTutari: harcamaEkstrePayi(h, k, seciliAy),
            }))
            .filter((h) => h.donemTutari > 0);
          const manuel = manuelHarcamalar.reduce(
            (t, h) => t + h.donemTutari,
            0,
          );
          const ekstreKaydi =
            k.ekstreAyi === seciliAy
              ? k
              : [...(k.ekstreGecmisi || [])]
                  .reverse()
                  .find((e) => e.ekstreAyi === seciliAy);
          const ekstreYeni = !ekstreKaydi
            ? 0
            : ekstreKaydi.yeniDonemEkstreBorcu !== undefined
              ? +ekstreKaydi.yeniDonemEkstreBorcu || 0
              : Math.max(
                  (+ekstreKaydi.toplamEkstreBorcu || 0) -
                    (+ekstreKaydi.oncekiAydanKalan || 0),
                  0,
                );
          return (
            <div className="bt-card" key={k.id}>
              <div className="bt-cardhead">
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={rozetStil(
                      LIME,
                      ROTASYONLAR[i % ROTASYONLAR.length],
                      36,
                    )}
                  >
                    {bankaKodu(k.banka)}
                  </div>
                  <div>
                    <div className="bt-satir-ad">{etiket}</div>
                    <div className="bt-satir-meta">
                      Dönem içi:{" "}
                      {donem.baslangic.split("-").reverse().join(".")} –{" "}
                      {donem.bitis.split("-").reverse().join(".")}
                    </div>
                  </div>
                </div>
                <div
                  className="bt-mono"
                  style={{ fontWeight: 700, color: "var(--dim)" }}
                >
                  {ayEtiketi(seciliAy)}
                </div>
              </div>
              <div className="bt-grid" style={{ marginTop: 16 }}>
                <div className="bt-metric">
                  <div className="bt-metric-lbl">Gerçek ekstre</div>
                  <div className="bt-metric-amt">{fmt(ekstreYeni)}</div>
                  <div className="bt-metric-cap">
                    {ekstreKaydi
                      ? "Bankadan girilen dönem borcu"
                      : "Bu dönem için ekstre henüz girilmedi"}
                  </div>
                </div>
                <div className="bt-metric">
                  <div className="bt-metric-lbl">Manuel kaydedilenler</div>
                  <div className="bt-metric-amt">{fmt(manuel)}</div>
                  <div className="bt-metric-cap">
                    Bu dönemdeki {manuelHarcamalar.length} harcama
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
      {kaynaklar.length > 0 && (
        <div className="bt-card">
          <div className="bt-h2">
            <Wallet size={16} /> Tüm harcamalar hangi kaynağa yazıldı?
          </div>
          {kaynaklar.map(([ad, x]) => (
            <div className="bt-kat" key={ad}>
              <div className="bt-kat-ad" style={{ width: 180 }}>
                {ad}
              </div>
              <div className="bt-kat-bar">
                <div style={{ width: "100%", background: CORAL }} />
              </div>
              <div className="bt-kat-tutar">
                {fmt(x.toplam)}{" "}
                <span style={{ color: "var(--faint)", fontSize: 10 }}>
                  ({x.adet})
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BorclarSatiri({
  k,
  i,
  kategori,
  meta,
  setForm,
  sil,
  ekHesapOdemesiSil,
  paid,
  odendiIsaretle,
  arsiv = false,
}) {
  let baslik = k.banka,
    ekAd = k.ad,
    tutar,
    altMeta,
    barGoster = false,
    barOran = null,
    barRenk = LIME,
    altYazi = null,
    tutarEtiketi = null,
    kartDetay = null,
    ekHesapDetay = null,
    kod = bankaKodu(k.banka);
  const krediOdemeAnahtari =
    kategori === "loans" ? "kredi-" + k.id + "-" + ayAnahtari() : null;
  const buAyKrediOdendi =
    krediOdemeAnahtari !== null && !!paid?.[krediOdemeAnahtari];

  if (kategori === "cards") {
    const hesap = kartHesabi(k);
    const ekstreVar =
      k.yeniDonemEkstreBorcu !== undefined ||
      k.toplamEkstreBorcu !== undefined ||
      k.oncekiDonemBorcu !== undefined ||
      +k.borc > 0 ||
      +k.donemIciToplam > 0;
    tutar = hesap.toplam;
    const kullanilabilirVar = +k.kullanilabilirLimit > 0;
    const kullanilan = kullanilabilirVar
      ? (+k.limit || 0) - +k.kullanilabilirLimit
      : tutar;
    barOran = +k.limit > 0 ? kullanilan / +k.limit : null;
    const gecikmeTarihi = kartGecikmeTarihi(k);
    const gecikenGun = arsiv ? 0 : Math.max(-kalanGun(gecikmeTarihi), 0);
    const asgariOran = (+k.limit || 0) <= 50000 ? 0.2 : 0.4;
    const asgariTutar = hesap.onceki * asgariOran;
    const asgariTamam = hesap.odeme + 0.01 >= asgariTutar;
    const donem = arsiv ? k.ekstreAyi : k.ekstreAyi || ayAnahtari();
    const odendi =
      !!paid?.[kartOdemeAnahtari({ ...k, ekstreAyi: donem })] ||
      (ekstreVar && hesap.toplam <= 0);
    const borcKapandi = ekstreVar && hesap.toplam <= 0;
    const durum = borcKapandi
      ? "Ödendi"
      : asgariTamam || odendi
        ? "Asgari ödendi · kalan borç var"
        : hesap.odeme > 0
          ? "Kısmi ödendi · asgari eksik"
        : "Ödenmemiş";
    const gecikmis = ekstreVar && gecikenGun > 0 && !asgariTamam && !odendi;
    barRenk = gecikmis ? CORAL : LIME;
    barGoster = barOran !== null;
    altMeta = !ekstreVar
      ? "Henüz ekstre girilmedi · kesim ayın " +
        k.kesimGunu +
        ". günü · son ödeme ayın " +
        k.sonOdemeGunu +
        ". günü"
      : k.toplamEkstreBorcu !== undefined || k.oncekiDonemBorcu !== undefined
        ? "Ekstre " +
          fmt(hesap.onceki) +
          " · ödendi " +
          fmt(hesap.odeme) +
          " · kalan " +
          fmt(hesap.devreden) +
          (arsiv
            ? " · " + ayEtiketi(k.ekstreAyi)
            : " · son ödeme " + gecikmeTarihi.toLocaleDateString("tr-TR"))
        : "Son ödeme: " + gecikmeTarihi.toLocaleDateString("tr-TR");
    if (gecikmis) {
      const gecikmeOrani = tcmbKartAzamiGecikmeFaizi(
        hesap.onceki || hesap.toplam,
      );
      const birikenFaiz = gunlukBirikmisFaiz(
        hesap.toplam,
        gecikmeOrani,
        gecikenGun,
      );
      altYazi =
        gecikenGun + " gün gecikti · tahmini biriken faiz " + fmt(birikenFaiz);
    }
    tutarEtiketi = ekstreVar ? "Kalan borç · " + durum : "Ekstre bekleniyor";
    kartDetay = ekstreVar
      ? {
          donem,
          guncel: hesap.yeni,
          devreden: hesap.oncekiDevreden || 0,
          ekstre: hesap.onceki,
          odeme: hesap.odeme,
          kalan: hesap.toplam,
          odemeBilgisiYok:
            k.yeniDonemEkstreBorcu === undefined &&
            k.toplamEkstreBorcu === undefined &&
            k.oncekiDonemBorcu === undefined,
          durum,
        }
      : null;
  } else if (kategori === "loans") {
    tutar = arsiv ? +k.taksit || 0 : +k.kalanBorc || 0;
    altMeta = k._gelecek
      ? ayEtiketi(k._donem) +
        " · planlanan taksit · ayın " +
        k.odemeGunu +
        ". günü" +
        (k._kalanTaksitProj !== null
          ? " · ödeme sonrası " + k._kalanTaksitProj + " taksit kalacak"
          : "")
      : arsiv
        ? ayEtiketi(k._donem) +
          " · taksit ödendi" +
          (+k.kalanBorc > 0
            ? " · kayıt anındaki kalan borç " + fmt(k.kalanBorc)
            : "")
        : "Taksit " +
          fmt(k.taksit) +
          " · her ayın " +
          k.odemeGunu +
          ". günü" +
          (+k.kalanTaksit > 0 ? " · " + k.kalanTaksit + " taksit kaldı" : "") +
          (buAyKrediOdendi ? " · bu ayki taksit ödendi" : "");
  } else if (kategori === "od") {
    const hesap = ekHesapHesabi(k);
    ekHesapDetay = hesap;
    tutar = hesap.kalan;
    altMeta =
      "Kullanılan " +
      fmt(hesap.kullanilan) +
      " · ödenen " +
      fmt(hesap.odeme) +
      (+k.limit > 0 ? " · limit " + fmt(k.limit) : "");
    tutarEtiketi = hesap.kalan > 0 ? "Kalan borç" : "Borç kapandı";
    altYazi =
      hesap.kalan > 0
        ? "Tahmini aylık faiz " +
          fmt(hesap.faiz) +
          " · %" +
          hesap.oran.toFixed(2)
        : null;
  } else {
    tutar = +k.tutar || 0;
    altMeta = k.ad || "—";
  }

  return (
    <div className="bt-satir">
      <div style={rozetStil(meta.rozetBg, ROTASYONLAR[i % ROTASYONLAR.length])}>
        {kod}
      </div>
      <div style={{ flex: 1, minWidth: 150 }}>
        <div className="bt-satir-ad">
          {baslik}
          {ekAd && kategori !== "others" ? (
            <span style={{ color: "var(--dim)", fontWeight: 500 }}>
              {" "}
              · {ekAd}
            </span>
          ) : null}
        </div>
        <div className="bt-satir-meta">{altMeta}</div>
        {!arsiv &&
          kategori === "cards" &&
          (k.ekstreGecmisi || []).length > 0 && (
            <div className="bt-satir-meta" style={{ marginTop: 3 }}>
              {k.ekstreGecmisi.length} eski ekstre arşivlendi
            </div>
          )}
        {barGoster && (
          <div className="bt-bar">
            <div
              style={{
                width: Math.min(barOran * 100, 100) + "%",
                background: barRenk,
              }}
            />
          </div>
        )}
        {kartDetay && <EkstreSatirDetayi detay={kartDetay} />}
      </div>
      <div style={{ textAlign: "right" }}>
        <div className="bt-satir-tutar">{fmt(tutar)}</div>
        {tutarEtiketi && (
          <div
            className="bt-satirD-tur"
            style={{ fontWeight: 800, color: tutar > 0 ? CORAL : "#5D7A2E" }}
          >
            {tutarEtiketi}
          </div>
        )}
        {altYazi && <div className="bt-satir-alt">{altYazi}</div>}
      </div>
      {!arsiv && (
        <div
          style={{
            display: "flex",
            gap: 4,
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          {kategori === "cards" && (
            <button
              className="bt-btn kucuk ikincil"
              title="Yeni dönem ekstresi gir"
              onClick={() =>
                setForm({ liste: "cards", veri: k, yeniEkstre: true })
              }
            >
              <Plus size={13} /> Yeni ekstre
            </button>
          )}
          {kategori === "cards" && (
            <button
              className="bt-btn kucuk ikincil"
              title="Güncel ekstreyi düzenle"
              onClick={() =>
                setForm({ liste: "cards", veri: k, ekstreDuzenle: true })
              }
            >
              <Pencil size={13} /> Ekstreyi düzenle
            </button>
          )}
          {kategori === "od" && ekHesapDetay?.kalan > 0 && (
            <button
              className="bt-btn kucuk ikincil"
              title="Kısmi ödeme gir"
              onClick={() =>
                setForm({ liste: "overdrafts", veri: k, odemeGir: true })
              }
            >
              Ödeme gir
            </button>
          )}
          {kategori === "od" && ekHesapDetay?.kalan > 0 && (
            <button
              className="bt-btn kucuk ikincil"
              title="Kalan borcun tamamını öde"
              onClick={() =>
                setForm({
                  liste: "overdrafts",
                  veri: k,
                  odemeGir: true,
                  kapat: true,
                })
              }
            >
              <Check size={13} /> Borcu kapat
            </button>
          )}
          {kategori === "loans" && (+k.kalanBorc || 0) > 0 && (
            <button
              className="bt-btn kucuk ikincil"
              title={
                buAyKrediOdendi
                  ? "Bu ayki taksit ödeme kaydını geri al"
                  : "Bu ayki kredi taksitini ödendi olarak işaretle"
              }
              onClick={() =>
                odendiIsaretle?.(krediOdemeAnahtari, !buAyKrediOdendi)
              }
            >
              {buAyKrediOdendi ? (
                <>
                  <RotateCcw size={13} /> Ödemeyi geri al
                </>
              ) : (
                <>
                  <Check size={13} /> Bu ayki taksiti ödedim
                </>
              )}
            </button>
          )}
          <button
            className="bt-btn hayalet"
            onClick={() => setForm({ liste: meta.liste, veri: k })}
          >
            <Pencil size={15} />
          </button>
          <button
            className="bt-btn hayalet tehlike"
            onClick={() => sil(meta.liste, k.id)}
          >
            <Trash2 size={15} />
          </button>
        </div>
      )}
      {kategori === "od" && (k.odemeGecmisi || []).length > 0 && (
        <details className="bt-odeme-gecmisi">
          <summary>Ödeme geçmişi · {k.odemeGecmisi.length} kayıt</summary>
          <div className="bt-odeme-liste">
            {[...k.odemeGecmisi].reverse().map((o) => (
              <div key={o.id || o.tarih} className="bt-odeme-kaydi">
                <div className="bt-odeme-tarih">
                  {tarihSaatEtiketi(o.tarih)}
                </div>
                <div className="bt-odeme-tutar">{fmt(o.tutar)}</div>
                <div className="bt-odeme-islemler">
                  <button
                    className="bt-btn hayalet"
                    title="Ödemeyi düzenle"
                    onClick={() =>
                      setForm({ liste: "overdrafts", veri: k, odemeDuzenle: o })
                    }
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    className="bt-btn hayalet tehlike"
                    title="Ödemeyi sil"
                    onClick={() => ekHesapOdemesiSil(k, o)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function EkstreSatirDetayi({ detay }) {
  return (
    <details style={{ marginTop: 10 }}>
      <summary
        style={{
          cursor: "pointer",
          color: CORAL,
          fontSize: 11.5,
          fontWeight: 800,
        }}
      >
        {ayEtiketi(detay.donem)} ekstresini görüntüle
      </summary>
      <div className="bt-grid" style={{ marginTop: 10, gap: 8 }}>
        <div className="bt-metric" style={{ padding: 11 }}>
          <div className="bt-metric-lbl">Güncel dönem borcu</div>
          <div className="bt-mono" style={{ fontWeight: 800 }}>
            {fmt(detay.guncel)}
          </div>
        </div>
        <div className="bt-metric" style={{ padding: 11 }}>
          <div className="bt-metric-lbl">Geçen aydan devreden</div>
          <div className="bt-mono" style={{ fontWeight: 800 }}>
            {fmt(detay.devreden)}
          </div>
        </div>
        <div className="bt-metric" style={{ padding: 11 }}>
          <div className="bt-metric-lbl">Toplam borç</div>
          <div className="bt-mono" style={{ fontWeight: 800 }}>
            {fmt(detay.ekstre)}
          </div>
        </div>
        <div className="bt-metric" style={{ padding: 11 }}>
          <div className="bt-metric-lbl">Toplam ödenen</div>
          <div className="bt-mono" style={{ fontWeight: 800 }}>
            {detay.odemeBilgisiYok ? "Bilgi yok" : fmt(detay.odeme)}
          </div>
        </div>
        <div className="bt-metric" style={{ padding: 11 }}>
          <div className="bt-metric-lbl">Kalan borç</div>
          <div className="bt-mono" style={{ fontWeight: 800 }}>
            {fmt(detay.kalan)}
          </div>
        </div>
        <div
          style={{
            gridColumn: "1/-1",
            fontSize: 11.5,
            fontWeight: 800,
            color: detay.durum === "Ödendi" ? "#5D7A2E" : CORAL,
          }}
        >
          Durum: {detay.durum}
        </div>
      </div>
    </details>
  );
}

function GecikmisBorcSatiri({ g, i }) {
  return (
    <div className="bt-satir" style={{ borderColor: CORAL }}>
      <div style={rozetStil(CORAL, ROTASYONLAR[i % ROTASYONLAR.length])}>
        {bankaKodu(g.banka)}
      </div>
      <div style={{ flex: 1, minWidth: 150 }}>
        <div className="bt-satir-ad">
          {g.banka}{" "}
          <span style={{ color: "var(--dim)", fontWeight: 500 }}>· {g.ad}</span>
        </div>
        <div className="bt-satir-meta">
          {g.tur} · son ödeme {g.tarih.toLocaleDateString("tr-TR")} · aylık %
          {g.oran.toFixed(2)}
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div className="bt-satir-tutar">{fmt(g.bakiye)}</div>
        <div className="bt-satirD-tur" style={{ fontWeight: 800 }}>
          Kalan borç
        </div>
        <div className="bt-satir-alt">
          {g.durum === "devreden"
            ? "Asgari ödendi · tahmini aylık akdi faiz " + fmt(g.faiz)
            : g.gun +
              " gün gecikti · biriken tahmini gecikme faizi " +
              fmt(g.faiz)}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Borç Planı ---------------- */
function Plan({ kalemler, aylikFaiz, setSekme }) {
  const [strateji, setStrateji] = useState("cig");
  const [ekstra, setEkstra] = useState("");

  const doner = kalemler.filter((k) => !k.sabitTaksit);
  const sabit = kalemler.filter((k) => k.sabitTaksit);

  const kartFaiz = doner
    .filter((k) => k.tur === "kart")
    .reduce((t, k) => t + k.faizTutari, 0);
  const ekFaiz = doner
    .filter((k) => k.tur === "ek")
    .reduce((t, k) => t + k.faizTutari, 0);
  const digerFaiz = doner
    .filter((k) => k.tur === "diger")
    .reduce((t, k) => t + k.faizTutari, 0);
  const gecikmisler = doner.filter((k) => k.gecikmis);
  const gecikmisFaiz = gecikmisler.reduce((t, k) => t + k.faizTutari, 0);

  const sirali = useMemo(() => {
    const d = [...doner];
    if (strateji === "cig")
      d.sort((a, b) => b.faiz - a.faiz || b.bakiye - a.bakiye);
    else d.sort((a, b) => a.bakiye - b.bakiye);
    return d;
  }, [doner, strateji]);

  const hedef = sirali[0];
  const ekstraTutar = +ekstra || 0;
  const kurtarilan = hedef
    ? (Math.min(ekstraTutar, hedef.bakiye) * hedef.faiz) / 100
    : 0;

  if (kalemler.length === 0)
    return (
      <div className="bt-card" style={{ textAlign: "center" }}>
        <div className="bt-bos">
          Plan oluşturmak için önce{" "}
          <button className="bt-link" onClick={() => setSekme("borclar")}>
            Borçlar sekmesinden
          </button>{" "}
          borçlarınızı ekleyin.
        </div>
      </div>
    );

  return (
    <div className="bt-stack">
      <div className="bt-hero">
        <span className="deko-daire" />
        <span className="deko-kare" />
        <div className="bt-hero-label">Bu ay için tahmini toplam faiz</div>
        <div className="bt-hero-tutar">{fmt0(aylikFaiz)}</div>
        <div
          className="bt-hero-delta"
          style={{ background: "#ffffff14", color: "#c8c9be" }}
        >
          Yılda karşılığı ≈ {fmt0(aylikFaiz * 12)}
        </div>
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            position: "relative",
            zIndex: 1,
            marginTop: 6,
          }}
        >
          {kartFaiz > 0 && (
            <div className="bt-chip">
              <span className="dot" style={{ background: LIME }} />
              <span className="lbl">Kredi kartları</span>
              <span className="amt">{fmt0(kartFaiz)}</span>
            </div>
          )}
          {ekFaiz > 0 && (
            <div className="bt-chip">
              <span className="dot" style={{ background: CORAL }} />
              <span className="lbl">Ek hesap / KMH</span>
              <span className="amt">{fmt0(ekFaiz)}</span>
            </div>
          )}
          {digerFaiz > 0 && (
            <div className="bt-chip">
              <span className="dot" style={{ background: "#55584c" }} />
              <span className="lbl">Gecikmiş / diğer</span>
              <span className="amt">{fmt0(digerFaiz)}</span>
            </div>
          )}
        </div>
        {gecikmisler.length > 0 && (
          <div
            style={{
              marginTop: 16,
              fontSize: 12.5,
              color: CORAL,
              fontWeight: 600,
            }}
          >
            {gecikmisler.length} kart vadesi geçmiş, bunlardan ayda{" "}
            {fmt0(gecikmisFaiz)} gecikme faizi işliyor
          </div>
        )}
      </div>

      <div className="bt-ipucu">
        <Lightbulb size={16} />
        <div>
          <b>Çığ yöntemi</b> önce en yüksek faizli borcu kapatır — en az faiz
          ödersiniz. <b>Kartopu yöntemi</b> önce en küçük borcu kapatır — hızlı
          kapanan borçlar motivasyon verir. Diğer borçların asgarisini
          aksatmadan, artan her kuruşu sıradaki tek hedefe yığın.
        </div>
      </div>

      <div className="bt-card">
        <div className="bt-cardhead">
          <div className="bt-h2" style={{ margin: 0 }}>
            <Target size={16} /> Kapatma sıranız
          </div>
          <div className="bt-secici">
            <button
              className={strateji === "cig" ? "aktif" : ""}
              onClick={() => setStrateji("cig")}
            >
              <Flame size={14} color={CORAL} /> Çığ
            </button>
            <button
              className={strateji === "kartopu" ? "aktif" : ""}
              onClick={() => setStrateji("kartopu")}
            >
              <Snowflake size={14} /> Kartopu
            </button>
          </div>
        </div>

        {doner.length === 0 ? (
          <div className="bt-bos">Faiz işleyen (kart / KMH) borcunuz yok.</div>
        ) : (
          <div className="bt-stack" style={{ gap: 12, marginTop: 22 }}>
            {sirali.map((k, i) => {
              const kartFaizAciklamasi =
                k.tur === "kart" && k.faizTahmini
                  ? k.gecikmis
                    ? k.asgariEksigi > 0
                      ? (k.yapilanOdeme > 0
                          ? fmt0(k.yapilanOdeme) + " ödeme kaydedildi. "
                          : "Ödeme kaydı yok. ") +
                        "Asgari ödeme " +
                        fmt0(k.asgariEksigi) +
                        " eksik görünüyor. Bankanız bu kısma gecikme faizi, kalan borca normal kart faizi uygulayabilir"
                      : (k.yapilanOdeme > 0
                          ? fmt0(k.yapilanOdeme) + " ödeme kaydedildi. "
                          : "Asgari ödeme karşılandı. ") +
                        "Kalan borç " +
                        fmt0(k.bakiye) +
                        ". Bankanız bu tutara normal kart faizi uygulayabilir"
                    : (k.yapilanOdeme > 0
                        ? fmt0(k.yapilanOdeme) + " ödeme kaydedildi. "
                        : "Ödeme kaydı yok. ") +
                      "Kalan borcun tamamı son ödeme tarihine kadar kapanmazsa faiz oluşabilir"
                  : null;
              return (
                <div
                  key={k.id}
                  className="bt-satir"
                  style={
                    i === 0
                      ? { borderColor: LIME, background: "#cdf56414" }
                      : {}
                  }
                >
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 999,
                      background: i === 0 ? LIME : "var(--panel2)",
                      border: "2px solid var(--line)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                    className="bt-mono"
                  >
                    {i + 1}
                  </div>
                  <div
                    style={rozetStil(
                      k.tur === "diger"
                        ? "#d8c9a0"
                        : k.tur === "ek"
                          ? CORAL
                          : LIME,
                      ROTASYONLAR[i % ROTASYONLAR.length],
                      36,
                    )}
                  >
                    {bankaKodu(k.banka)}
                  </div>
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div className="bt-satir-ad">
                      {k.ad}{" "}
                      {i === 0 && (
                        <span style={{ color: "#5D7A2E", fontWeight: 700 }}>
                          ← önce bunu kapatın
                        </span>
                      )}
                    </div>
                    <div className="bt-satir-meta">
                      {kartFaizAciklamasi
                        ? kartFaizAciklamasi
                        : "Aylık %" +
                          k.faiz.toFixed(2) +
                          (k.faizTahmini
                            ? k.gecikmis
                              ? " (TCMB yasal azami GECİKME oranı)"
                              : " (TCMB yasal azami oranı)"
                            : "") +
                          " · ayda ≈ " +
                          fmt0(k.faizTutari) +
                          " faiz"}
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
            <div
              style={{
                fontSize: 12,
                color: "var(--faint)",
                margin: "18px 0 10px",
              }}
            >
              Sıralamanın dışındakiler (sabit taksitli krediler / faiz
              girilmemiş borçlar):
            </div>
            <div className="bt-stack" style={{ gap: 10 }}>
              {sabit.map((k, i) => (
                <div key={k.id} className="bt-satir" style={{ opacity: 0.75 }}>
                  <div
                    style={rozetStil(
                      "#c8c9be",
                      ROTASYONLAR[i % ROTASYONLAR.length],
                      36,
                    )}
                  >
                    {bankaKodu(k.banka)}
                  </div>
                  <div style={{ flex: 1 }} className="bt-satir-ad">
                    {k.ad}
                  </div>
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
            <input
              className="bt-input"
              type="number"
              min={0}
              placeholder="örn. 5000"
              value={ekstra}
              onChange={(e) => setEkstra(e.target.value)}
            />
          </label>
          {ekstraTutar > 0 && (
            <div className="bt-ipucu" style={{ marginTop: 16 }}>
              <Target size={16} />
              <div>
                Bu parayı <b>{hedef.ad}</b> borcuna yatırın → her ay yaklaşık{" "}
                <b>{fmt0(kurtarilan)}</b> faiz ödemekten kurtulursunuz
                {ekstraTutar >= hedef.bakiye && (
                  <>
                    {" "}
                    ve bu borç <b>tamamen kapanır</b>
                  </>
                )}
                .
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------- Varlıklarım ---------------- */
function Varliklar({
  veri,
  form,
  setForm,
  ekleGuncelle,
  sil,
  piyasa,
  piyasaYenile,
  ozet,
}) {
  const acik = form?.liste === "assets";
  const f = acik ? form.veri || {} : {};
  const seciliTur = varlikTuru(f.tur || "usd");
  const formParaBirimi = seciliTur.fon ? "TRY" : paraBirimi(f.paraBirimi).id;
  const seciliKategori = varlikKategorisi(
    f.kategori || seciliTur.kategori || "doviz",
  );
  const kategoriTurleri = seciliKategori.turler.map(varlikTuru);
  const seciliKriptoTryFiyati = seciliTur.kripto && seciliTur.coinId
    ? +piyasa.prices?.crypto?.[seciliTur.coinId] || 0
    : 0;
  const seciliKriptoFiyati = seciliTur.kripto && seciliTur.coinId
    ? formParaBirimi === "USD"
      ? +piyasa.prices?.cryptoUsd?.[seciliTur.coinId] || 0
      : formParaBirimi === "EUR"
        ? seciliKriptoTryFiyati / (+piyasa.prices?.eurTry || 1)
        : seciliKriptoTryFiyati
    : 0;
  const seciliOtomatikBirimFiyati = seciliTur.fon
    ? +f.fonBirimFiyati || 0
    : seciliTur.hisse
      ? +f.hisseBirimFiyati || 0
      : seciliKriptoTryFiyati;
  const seciliGosterimBirimFiyati = seciliTur.kripto
    ? seciliKriptoFiyati
      : seciliOtomatikBirimFiyati / Math.max(paraBirimiKuru(f, piyasa.prices), 1);
  const besPayAdedi = seciliTur.id === "bes" && +f.fonBirimFiyati > 0
    ? (+f.besToplamTutar || 0) / +f.fonBirimFiyati
    : 0;
  const gosterimMiktari = seciliTur.id === "bes" ? besPayAdedi : (+f.miktar || 0);
  const [silinecek, setSilinecek] = useState(null);
  const [filtre, setFiltre] = useState("tumu");
  const [fonAraniyor, setFonAraniyor] = useState(false);
  const [fonHata, setFonHata] = useState("");
  const [hisseAraniyor, setHisseAraniyor] = useState(false);
  const [hisseHata, setHisseHata] = useState("");
  const [digerPenceresi, setDigerPenceresi] = useState(false);
  const [digerPopupTuru, setDigerPopupTuru] = useState("diger");
  const [digerFormu, setDigerFormu] = useState({ ad: "", kurum: "", guncelDeger: "", paraBirimi: "TRY" });
  const [digerHata, setDigerHata] = useState("");
  const filtreler = [
    ["tumu", "Tümü"],
    ["doviz", "Döviz"],
    ["emtia", "Emtia"],
    ["kripto", "Kripto"],
    ["bes", "BES"],
    ["fon", "Fonlar"],
    ["hisse", "Hisseler"],
    ["diger", "Diğer"],
  ];
  const varlikGrubu = (tur) => varlikTuru(tur).kategori || "diger";
  const gorunenKalemler = ozet.kalemler.filter(
    (k) => filtre === "tumu" || varlikGrubu(k.tur) === filtre,
  );
  const otomatikKalemler = ozet.kalemler.filter(
    (k) => varlikTuru(k.tur).otomatik,
  );
  const otomatikToplam = otomatikKalemler.reduce(
    (t, k) => t + k.hesaplananDeger,
    0,
  );
  const dagilim = useMemo(() => {
    const gruplar = {};
    ozet.kalemler.forEach((k) => {
      const ad = varlikTuru(k.tur).ad;
      gruplar[ad] = (gruplar[ad] || 0) + k.hesaplananDeger;
    });
    return Object.entries(gruplar).sort((a, b) => b[1] - a[1]);
  }, [ozet.kalemler]);

  const fSet = (parca) =>
    setForm((eski) => ({
      ...eski,
      veri: { ...(eski?.veri || {}), ...parca },
    }));

  async function fonBilgisiniGetir(kod) {
    const temizKod = String(kod || "").trim().toUpperCase();
    if (!/^[A-Z0-9]{2,8}$/.test(temizKod))
      throw new Error("Geçerli bir fon kodu girin.");
    const onbellek = piyasa.prices?.funds?.[temizKod];
    if (onbellek) return onbellek;
    const yanit = await fetch(
      "/api/fund-prices?codes=" + encodeURIComponent(temizKod),
      { headers: { Accept: "application/json" } },
    );
    const sonuc = await yanit.json().catch(() => ({}));
    const bilgi = sonuc?.funds?.[temizKod];
    if (!yanit.ok || !bilgi)
      throw new Error(sonuc?.errors?.[0]?.message || "Fon bulunamadı.");
    return bilgi;
  }

  async function fonuBul() {
    setFonAraniyor(true);
    setFonHata("");
    try {
      const kod = String(f.fonKodu || "").trim().toUpperCase();
      const bilgi = await fonBilgisiniGetir(kod);
      fSet({
        fonKodu: kod,
        ad: bilgi.name,
        fonBirimFiyati: bilgi.price,
        fonKaynagi: bilgi.source,
        fonKategori: bilgi.category,
      });
    } catch (hata) {
      setFonHata(hata.message || "Fon fiyatı alınamadı.");
    } finally {
      setFonAraniyor(false);
    }
  }

  async function hisseBilgisiniGetir(kod, piyasaTuru = "BIST") {
    const temizKod = String(kod || "")
      .trim()
      .toUpperCase()
      .replace(/\.IS$/, "");
    if (!/^[A-Z0-9]{2,10}$/.test(temizKod))
      throw new Error(`Geçerli bir ${piyasaTuru === "US" ? "ABD" : "BIST"} hisse kodu girin.`);
    const onbellek = piyasa.prices?.stocks?.[temizKod];
    if (onbellek) return onbellek;
    const yanit = await fetch(
      "/api/stock-prices?market=" + encodeURIComponent(piyasaTuru) + "&codes=" + encodeURIComponent(temizKod),
      { headers: { Accept: "application/json" } },
    );
    const sonuc = await yanit.json().catch(() => ({}));
    const bilgi = sonuc?.stocks?.[temizKod];
    if (!yanit.ok || !bilgi)
      throw new Error(sonuc?.errors?.[0]?.message || "Hisse bulunamadı.");
    return bilgi;
  }

  async function hisseyiBul() {
    setHisseAraniyor(true);
    setHisseHata("");
    try {
      const kod = String(f.hisseKodu || "")
        .trim()
        .toUpperCase()
        .replace(/\.IS$/, "");
      const bilgi = await hisseBilgisiniGetir(kod, seciliTur.piyasa);
      fSet({
        hisseKodu: kod,
        ad: bilgi.name,
        hisseBirimFiyati: bilgi.price,
        hisseParaBirimi: bilgi.currency,
        hisseKaynagi: bilgi.source,
        hisseFiyatTarihi: bilgi.priceAt,
      });
    } catch (hata) {
      setHisseHata(hata.message || "Hisse fiyatı alınamadı.");
    } finally {
      setHisseAraniyor(false);
    }
  }

  async function kaydet(e) {
    e.preventDefault();
    const tur = varlikTuru(f.tur || "usd");
    if (tur.otomatik && (tur.id === "bes" ? !(+f.besToplamTutar > 0) : !(+f.miktar > 0))) return;
    if (!tur.otomatik && !(+f.guncelDeger > 0)) return;
    let fonBilgisi = null;
    let hisseBilgisi = null;
    if (tur.fon) {
      setFonAraniyor(true);
      setFonHata("");
      try {
        fonBilgisi = await fonBilgisiniGetir(f.fonKodu);
      } catch (hata) {
        setFonHata(hata.message || "Fon fiyatı alınamadı.");
        setFonAraniyor(false);
        return;
      }
      setFonAraniyor(false);
    }
    if (tur.hisse) {
      setHisseAraniyor(true);
      setHisseHata("");
      try {
        hisseBilgisi = await hisseBilgisiniGetir(f.hisseKodu, tur.piyasa);
      } catch (hata) {
        setHisseHata(hata.message || "Hisse fiyatı alınamadı.");
        setHisseAraniyor(false);
        return;
      }
      setHisseAraniyor(false);
    }
    ekleGuncelle("assets", {
      ...f,
      id: f.id || uid(),
      kategori: tur.kategori,
      tur: tur.id,
      ad: (fonBilgisi?.name || hisseBilgisi?.name || f.ad || tur.ad).trim(),
      fonKodu: tur.fon
        ? String(f.fonKodu || "").trim().toUpperCase()
        : undefined,
      fonBirimFiyati: tur.fon
        ? fonBilgisi?.price || +f.fonBirimFiyati || 0
        : undefined,
      fonKaynagi: tur.fon ? fonBilgisi?.source || tur.kaynak : undefined,
      fonKategori: tur.fon ? fonBilgisi?.category || f.fonKategori : undefined,
      hisseKodu: tur.hisse
        ? String(f.hisseKodu || "")
            .trim()
            .toUpperCase()
            .replace(/\.IS$/, "")
        : undefined,
      hisseBirimFiyati: tur.hisse
        ? hisseBilgisi?.price || +f.hisseBirimFiyati || 0
        : undefined,
      hisseKaynagi: tur.hisse
        ? hisseBilgisi?.source || tur.kaynak
        : undefined,
      hissePiyasa: tur.hisse ? tur.piyasa : undefined,
      hisseParaBirimi: tur.hisse ? hisseBilgisi?.currency || f.hisseParaBirimi || "TRY" : undefined,
      hisseFiyatTarihi: tur.hisse
        ? hisseBilgisi?.priceAt || f.hisseFiyatTarihi
        : undefined,
      kriptoBirimFiyati: tur.kripto && tur.coinId
        ? varlikBirimFiyati({ tur: tur.id }, piyasa.prices) || +f.kriptoBirimFiyati || 0
        : undefined,
      miktar: tur.otomatik
        ? tur.id === "bes"
          ? Math.max((+f.besToplamTutar || 0) / Math.max(+fonBilgisi?.price || +f.fonBirimFiyati || 0, 0.00000001), 0)
          : Math.max(+f.miktar || 0, 0)
        : undefined,
      besToplamTutar: tur.id === "bes" ? Math.max(+f.besToplamTutar || 0, 0) : undefined,
      guncelDeger: Math.max(+f.guncelDeger || 0, 0),
      toplamMaliyet: Math.max(+f.toplamMaliyet || 0, 0),
      paraBirimi: seciliTur.fon
        ? "TRY"
        : tur.hisse && tur.piyasa === "US"
          ? (hisseBilgisi?.currency || f.hisseParaBirimi || "USD")
          : paraBirimi(f.paraBirimi).id,
      guncellenmeTarihi: new Date().toISOString(),
    });
  }

  function digerEkleBaslat() {
    setForm({ liste: "assets", veri: { kategori: "diger", tur: "diger" } });
    setDigerFormu({ ad: "", kurum: "", guncelDeger: "", paraBirimi: "TRY" });
    setDigerHata("");
    setDigerPenceresi(true);
  }

  function bosKategoriEkle() {
    const kategori = varlikKategorisi(filtre === "tumu" ? "doviz" : filtre);
    const ilkTur = varlikTuru(kategori.turler[0]);
    setForm({
      liste: "assets",
      veri: {
        kategori: kategori.id,
        tur: ilkTur.id,
        paraBirimi: ilkTur.kripto && ilkTur.coinId ? "USD" : "TRY",
      },
    });
  }

  const fiyatTarihi = piyasa.updatedAt
    ? new Date(piyasa.updatedAt).toLocaleString("tr-TR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="bt-stack">
      <div className="bt-varlik-hero" data-tour="varliklar">
        <div>
          <div className="bt-metric-lbl">Toplam varlıklarınız</div>
          <div className="bt-varlik-toplam">{fmt(ozet.toplam)}</div>
          <div style={{ color: "#bfc1b4", fontSize: 12, marginTop: 8 }}>
            {ozet.kalemler.length} kayıt · Borçlardan bağımsız varlık toplamı
          </div>
        </div>
        <div className="bt-varlik-mini">
          <div className="bt-metric-lbl">Otomatik değerlenen</div>
          <strong>{fmt(otomatikToplam)}</strong>
        </div>
        <div className="bt-varlik-mini">
          <div className="bt-metric-lbl">Toplam kazanç / kayıp</div>
          <strong style={{ color: ozet.kazanc < 0 ? CORAL : LIME }}>
            {ozet.maliyet > 0
              ? (ozet.kazanc >= 0 ? "+" : "") + fmt(ozet.kazanc)
              : "—"}
          </strong>
        </div>
      </div>

      <div className="bt-card">
        <div className="bt-cardhead" style={{ marginBottom: 0 }}>
          <div>
            <div className="bt-h2" style={{ marginBottom: 5 }}>
              <PiggyBank size={20} /> Varlıklarım
            </div>
            <div className={"bt-varlik-kaynak " + (piyasa.hata ? "hata" : "")}>
              <RefreshCw size={13} />
              {piyasa.yukleniyor
                ? "Piyasa fiyatları güncelleniyor…"
                : piyasa.hata ||
                  (fiyatTarihi
                    ? "Son fiyat güncellemesi: " + fiyatTarihi
                    : "Otomatik fiyatlar henüz alınmadı")}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              className="bt-btn kucuk ikincil"
              onClick={piyasaYenile}
              disabled={piyasa.yukleniyor}
            >
              <RefreshCw size={14} /> Fiyatları yenile
            </button>
            {!acik && (
              <button
                className="bt-btn birincil"
                onClick={() =>
                  setForm({
                    liste: "assets",
                    veri: { kategori: "doviz", tur: "usd" },
                  })
                }
              >
                <Plus size={16} /> Varlık ekle
              </button>
            )}
          </div>
        </div>
      </div>

      <nav
        className="bt-nav bt-nav-alt"
        style={{ margin: 0 }}
        aria-label="Varlık türleri"
      >
        {filtreler.map(([k, ad]) => (
          <button
            key={k}
            className={"bt-pill " + (filtre === k ? "aktif" : "pasif")}
            onClick={() => setFiltre(k)}
          >
            {ad}
          </button>
        ))}
      </nav>

      {acik && (
        <form className="bt-form" onSubmit={kaydet}>
          <div className="bt-h2" style={{ marginBottom: 16 }}>
            {f.id ? "Varlığı düzenle" : "Yeni varlık ekle"}
          </div>
          <div className="bt-alanlar">
            <label className="bt-alan">
              <span>Varlık kategorisi *</span>
              <select
                className="bt-input"
                value={seciliKategori.id}
                onChange={(e) => {
                  const kategori = varlikKategorisi(e.target.value);
                  fSet({
                    kategori: kategori.id,
                    tur: kategori.turler[0],
                    ad: "",
                    miktar: "",
                    guncelDeger: "",
                    fonKodu: "",
                    fonBirimFiyati: "",
                    besToplamTutar: "",
                    hisseKodu: "",
                    hisseBirimFiyati: "",
                    hisseParaBirimi: "",
                    paraBirimi: varlikTuru(kategori.turler[0]).kripto && varlikTuru(kategori.turler[0]).coinId ? "USD" : f.paraBirimi || "TRY",
                  });
                  setFonHata("");
                  setHisseHata("");
                }}
              >
                {VARLIK_KATEGORILERI.map((kategori) => (
                  <option key={kategori.id} value={kategori.id}>
                    {kategori.ad}
                  </option>
                ))}
              </select>
            </label>
            <label className="bt-alan">
              <span>{seciliKategori.ad} türü *</span>
              <select
                className="bt-input"
                value={seciliTur.id}
                onChange={(e) => {
                  const tur = e.target.value;
                  fSet({
                    tur,
                    ad: "",
                    miktar: "",
                    guncelDeger: "",
                    fonKodu: "",
                    fonBirimFiyati: "",
                    besToplamTutar: "",
                    hisseKodu: "",
                    hisseBirimFiyati: "",
                    hisseParaBirimi: "",
                    paraBirimi: varlikTuru(tur).kripto && varlikTuru(tur).coinId ? "USD" : f.paraBirimi || "TRY",
                  });
                  if (tur === "diger" || tur === "kripto_diger") {
                    setDigerPopupTuru(tur);
                    setDigerFormu({
                      ad: f.ad || "",
                      kurum: f.kurum || "",
                      guncelDeger: f.guncelDeger || "",
                      paraBirimi: f.paraBirimi || "TRY",
                    });
                    setDigerHata("");
                    setDigerPenceresi(true);
                  }
                }}
              >
                {kategoriTurleri.map((tur) => (
                  <option key={tur.id} value={tur.id}>
                    {tur.ad}
                  </option>
                ))}
              </select>
            </label>
            {seciliTur.fon && (
              <label className="bt-alan">
                <span>{seciliTur.kaynak} fon kodu *</span>
                <div style={{ display: "flex", gap: 8, minWidth: 0 }}>
                  <input
                    className="bt-input"
                    style={{ minWidth: 0, flex: 1, textTransform: "uppercase" }}
                    required
                    maxLength={8}
                    value={f.fonKodu || ""}
                    placeholder={seciliTur.id === "bes" ? "Örn. AEA" : "Örn. TI2"}
                    onChange={(e) => {
                      fSet({
                        fonKodu: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""),
                        fonBirimFiyati: "",
                      });
                      setFonHata("");
                    }}
                  />
                  <button
                    className="bt-btn ikincil kucuk"
                    type="button"
                    onClick={fonuBul}
                    disabled={fonAraniyor || !f.fonKodu}
                  >
                    <RefreshCw size={14} /> {fonAraniyor ? "Aranıyor" : "Fiyatı bul"}
                  </button>
                </div>
              </label>
            )}
            {seciliTur.hisse && (
              <label className="bt-alan">
                <span>{seciliTur.piyasa === "US" ? "ABD borsası hisse kodu *" : "Borsa İstanbul hisse kodu *"}</span>
                <div style={{ display: "flex", gap: 8, minWidth: 0 }}>
                  <input
                    className="bt-input"
                    style={{ minWidth: 0, flex: 1, textTransform: "uppercase" }}
                    required
                    maxLength={10}
                    value={f.hisseKodu || ""}
                    placeholder={seciliTur.piyasa === "US" ? "Örn. AAPL" : "Örn. THYAO"}
                    onChange={(e) => {
                      fSet({
                        hisseKodu: e.target.value
                          .toUpperCase()
                          .replace(/[^A-Z0-9]/g, ""),
                        hisseBirimFiyati: "",
                        hisseParaBirimi: "",
                      });
                      setHisseHata("");
                    }}
                  />
                  <button
                    className="bt-btn ikincil kucuk"
                    type="button"
                    onClick={hisseyiBul}
                    disabled={hisseAraniyor || !f.hisseKodu}
                  >
                    <RefreshCw size={14} /> {hisseAraniyor ? "Aranıyor" : "Fiyatı bul"}
                  </button>
                </div>
              </label>
            )}
            {seciliTur.kripto && seciliTur.coinId && (
              <label className="bt-alan">
                <span>Güncel {seciliTur.birim} fiyatı ({formParaBirimi})</span>
                <input
                  className="bt-input"
                  readOnly
                  value={seciliKriptoFiyati > 0 ? fmtPara(seciliKriptoFiyati, formParaBirimi) : "Fiyat yükleniyor…"}
                />
              </label>
            )}
            {(seciliTur.id === "diger" || seciliTur.id === "kripto_diger") && <label className="bt-alan">
              <span>Varlık adı</span>
              <input
                className="bt-input"
                value={f.ad || ""}
                placeholder={seciliTur.ad}
                onChange={(e) => fSet({ ad: e.target.value })}
              />
            </label>}
            {seciliTur.fon ? (
              <label className="bt-alan">
                <span>Fonun tam adı</span>
                <input
                  className="bt-input"
                  readOnly
                  value={f.ad || ""}
                  placeholder="Fon kodunu girip fiyatı bul'a basın"
                />
              </label>
            ) : (
              <label className="bt-alan">
                <span>Banka / kurum</span>
                <input
                  className="bt-input"
                  value={f.kurum || ""}
                  placeholder="Örn. İş Bankası"
                  onChange={(e) => fSet({ kurum: e.target.value })}
                />
              </label>
            )}
            {!seciliTur.fon && <label className="bt-alan">
              <span>Para birimi *</span>
              <select className="bt-input" value={formParaBirimi} onChange={(e) => fSet({ paraBirimi: e.target.value })}>
                {PARA_BIRIMLERI.map((birim) => <option key={birim.id} value={birim.id}>{birim.ad}</option>)}
              </select>
            </label>}
            {seciliTur.fon && (
              <label className="bt-alan">
                <span>Son pay fiyatı (₺)</span>
                <input
                  className="bt-input"
                  readOnly
                  value={f.fonBirimFiyati ? fmtBirim(f.fonBirimFiyati) : "Fiyatı bul'a basın"}
                />
              </label>
            )}
            {seciliTur.hisse && (
              <label className="bt-alan">
                <span>Son hisse fiyatı ({f.hisseParaBirimi || (seciliTur.piyasa === "US" ? "USD" : "₺")})</span>
                <input
                  className="bt-input"
                  readOnly
                  value={f.hisseBirimFiyati
                    ? (f.hisseParaBirimi && f.hisseParaBirimi !== "TRY" ? fmtPara(f.hisseBirimFiyati, f.hisseParaBirimi) : fmtBirim(f.hisseBirimFiyati))
                    : "Fiyatı bul'a basın"}
                />
              </label>
            )}
            {seciliTur.id === "bes" ? (
              <>
                <label className="bt-alan">
                  <span>Toplam BES tutarı (₺) *</span>
                  <input
                    className="bt-input"
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={f.besToplamTutar ?? (f.miktar && f.fonBirimFiyati ? +f.miktar * +f.fonBirimFiyati : "")}
                    onChange={(e) => fSet({ besToplamTutar: e.target.value })}
                  />
                </label>
                <label className="bt-alan">
                  <span>Tahmini pay adedi</span>
                  <input
                    className="bt-input"
                    readOnly
                    value={besPayAdedi > 0 ? besPayAdedi.toLocaleString("tr-TR", { maximumFractionDigits: 6 }) + " pay" : "Fon fiyatı bulunduktan sonra hesaplanır"}
                  />
                </label>
              </>
            ) : seciliTur.otomatik ? (
              <label className="bt-alan">
                <span>{seciliTur.fon ? "Pay adedi" : seciliTur.hisse ? "Hisse adedi" : `Miktar (${seciliTur.birim})`} *</span>
                <input
                  className="bt-input"
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={f.miktar ?? ""}
                  onChange={(e) => fSet({ miktar: e.target.value })}
                />
              </label>
            ) : (
              <label className="bt-alan">
                <span>Güncel toplam değer ({formParaBirimi}) *</span>
                <input
                  className="bt-input"
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={f.guncelDeger ?? ""}
                  onChange={(e) => fSet({ guncelDeger: e.target.value })}
                />
              </label>
            )}
            <label className="bt-alan">
              <span>Toplam alış maliyeti ({formParaBirimi})</span>
              <input
                className="bt-input"
                type="number"
                min="0"
                step="any"
                value={f.toplamMaliyet ?? ""}
                onChange={(e) => fSet({ toplamMaliyet: e.target.value })}
              />
            </label>
          </div>
          {seciliTur.fon && (f.fonBirimFiyati > 0 || fonHata) && (
            <div
              className="bt-ipucu"
              style={{ marginTop: 14, borderColor: fonHata ? CORAL : undefined }}
            >
              {fonHata ? <AlertTriangle size={16} /> : <Check size={16} />}
              <div>
                {fonHata ? (
                  fonHata
                ) : (
                  <>
                    <b>{f.ad || f.fonKodu}</b> · Son pay fiyatı {fmtBirim(f.fonBirimFiyati)} · {f.fonKaynagi || seciliTur.kaynak}
                  </>
                )}
              </div>
            </div>
          )}
          {seciliTur.hisse && (f.hisseBirimFiyati > 0 || hisseHata) && (
            <div
              className="bt-ipucu"
              style={{ marginTop: 14, borderColor: hisseHata ? CORAL : undefined }}
            >
              {hisseHata ? <AlertTriangle size={16} /> : <Check size={16} />}
              <div>
                {hisseHata ? (
                  hisseHata
                ) : (
                  <>
                    <b>{f.ad || f.hisseKodu}</b> · Son fiyat {fmtBirim(f.hisseBirimFiyati)} · Borsa İstanbul
                  </>
                )}
              </div>
            </div>
          )}
          {seciliTur.otomatik && (
            <div className="bt-ipucu" style={{ marginTop: 14 }}>
              <Lightbulb size={16} />
              <div>
                {seciliTur.fon
                  ? `${seciliTur.kaynak} tarafından açıklanan son pay fiyatı kullanılır. Fon fiyatları çoğunlukla iş günü sonunda güncellenir.`
                  : seciliTur.hisse
                    ? "Borsa İstanbul fiyatı otomatik güncellenir. Gösterilen fiyat gecikmeli olabilir; alım-satım kararı için aracı kurum ekranınızı kullanın."
                  : seciliTur.tahmini
                  ? `${seciliTur.ad} değeri gram altının içerdiği saf altın miktarı üzerinden yaklaşık hesaplanır. Kuyumcu alış/satış farkı dahil değildir.`
                  : `${seciliTur.ad} fiyatı otomatik güncellenir. Siz yalnızca sahip olduğunuz miktarı değiştirirsiniz.`}
              </div>
            </div>
          )}
          {(seciliTur.fon || seciliTur.hisse || (seciliTur.kripto && seciliTur.coinId)) && gosterimMiktari > 0 &&
            seciliOtomatikBirimFiyati > 0 && (
              <div className="bt-card" style={{ marginTop: 14, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", fontSize: 13 }}>
                  <span>Güncel yaklaşık değer</span>
                  <strong>{fmtPara(gosterimMiktari * seciliGosterimBirimFiyati, formParaBirimi)}</strong>
                </div>
                {+f.toplamMaliyet > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", fontSize: 13, marginTop: 7, color: (+f.miktar || 0) * seciliGosterimBirimFiyati - (+f.toplamMaliyet || 0) >= 0 ? "#5D7A2E" : CORAL }}>
                    <span>Tahmini kâr / zarar</span>
                    <strong>{fmtPara(gosterimMiktari * seciliGosterimBirimFiyati - (+f.toplamMaliyet || 0), formParaBirimi)}</strong>
                  </div>
                )}
              </div>
            )}
          <div className="bt-form-butonlar">
            <button className="bt-btn birincil" type="submit">
              <Check size={15} /> Kaydet
            </button>
            <button
              className="bt-btn ikincil"
              type="button"
              onClick={() => setForm(null)}
            >
              Vazgeç
            </button>
          </div>
        </form>
      )}

      {ozet.kalemler.length === 0 && !acik ? (
        <div className="bt-card bt-bos" style={{ display: "grid", justifyItems: "center", gap: 14 }}>
          Henüz varlık eklemediniz. Dolar, altın, Bitcoin veya BES kaydınızı
          ekleyerek başlayın.
          <button className="bt-btn birincil" type="button" onClick={bosKategoriEkle}><Plus size={15} /> Varlık ekle</button>
        </div>
      ) : gorunenKalemler.length === 0 && !acik ? (
        <div className="bt-card bt-bos" style={{ display: "grid", justifyItems: "center", gap: 14 }}>
          Bu kategoride henüz varlık kaydı yok.
          <button className="bt-btn birincil" type="button" onClick={bosKategoriEkle}>
            <Plus size={15} /> {filtre === "hisse" ? "Hisse ekle" : filtre === "fon" ? "Fon ekle" : filtre === "kripto" ? "Kripto ekle" : "Varlık ekle"}
          </button>
        </div>
      ) : (
        <div className="bt-stack">
          {[...gorunenKalemler]
            .sort((a, b) => b.hesaplananDeger - a.hesaplananDeger)
            .map((k, i) => {
              const tur = varlikTuru(k.tur);
              const birimFiyat = varlikBirimFiyati(k, piyasa.prices);
              const fark =
                +k.toplamMaliyet > 0
                  ? k.hesaplananDeger -
                    +k.toplamMaliyet * paraBirimiKuru(k, piyasa.prices)
                  : null;
              return (
                <div className="bt-satir" key={k.id}>
                  <div
                    style={rozetStil(
                      tur.otomatik ? LIME : i % 2 ? CORAL : "#d8c9a0",
                      ROTASYONLAR[i % ROTASYONLAR.length],
                    )}
                  >
                    {tur.hisse && k.hisseKodu
                      ? k.hisseKodu.slice(0, 3)
                      : tur.fon && k.fonKodu
                      ? k.fonKodu.slice(0, 3)
                      : k.tur === "bitcoin"
                      ? "₿"
                        : tur.kategori === "emtia"
                        ? "Au"
                        : tur.birim || tur.ad.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 170 }}>
                    <div className="bt-satir-ad">{k.ad || tur.ad}</div>
                    <div className="bt-satir-meta">
                      {k.kurum ? k.kurum + " · " : ""}
                      {tur.fon && k.fonKodu ? k.fonKodu + " · " : ""}
                      {tur.hisse && k.hisseKodu ? k.hisseKodu + " · " : ""}
                      {tur.otomatik
                        ? (+k.miktar || 0).toLocaleString("tr-TR", {
                            maximumFractionDigits:
                              tur.kategori === "kripto"
                                ? 8
                                : tur.fon || k.tur === "bes"
                                  ? 2
                                  : 4,
                          }) +
                          " " +
                          tur.birim
                        : tur.ad}
                    </div>
                    {tur.otomatik && (
                      <div className="bt-satir-meta">
                        {birimFiyat > 0
                          ? "Birim fiyat " +
                            (tur.fon || tur.hisse
                              ? (tur.hisse && k.hisseParaBirimi && k.hisseParaBirimi !== "TRY"
                                ? fmtPara(birimFiyat, k.hisseParaBirimi)
                                : fmtBirim(birimFiyat))
                              : fmt(birimFiyat)) +
                            (tur.hisse
                              ? " · gecikmeli"
                              : tur.fon
                              ? " · " +
                                (piyasa.prices?.funds?.[k.fonKodu]?.source ||
                                  k.fonKaynagi ||
                                  tur.kaynak)
                              : tur.tahmini
                                ? " · yaklaşık"
                                : " · otomatik")
                          : "Manuel yedek değer kullanılıyor"}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="bt-satir-tutar">
                      {fmt(k.hesaplananDeger)}
                    </div>
                    {fark !== null && (
                      <div
                        className={
                          "bt-varlik-degisim " + (fark >= 0 ? "arti" : "eksi")
                        }
                      >
                        {fark >= 0 ? "+" : ""}
                        {fmt(fark)}
                      </div>
                    )}
                  </div>
                  <span
                    className={
                      "bt-varlik-rozet " + (tur.otomatik ? "otomatik" : "")
                    }
                  >
                    {tur.otomatik ? "Otomatik" : "Manuel"}
                  </span>
                  <div style={{ display: "flex", gap: 2 }}>
                    <button
                      className="bt-btn hayalet"
                      title="Düzenle"
                      onClick={() => setForm({ liste: "assets", veri: k })}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      className="bt-btn hayalet tehlike"
                      title="Sil"
                      onClick={() => setSilinecek(k)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {dagilim.length > 1 && (
        <div className="bt-card">
          <div className="bt-h2">
            <BarChart3 size={19} /> Varlık dağılımı
          </div>
          <div className="bt-varlik-dagilim">
            {dagilim.map(([ad, tutar]) => (
              <div className="bt-varlik-dagilim-satir" key={ad}>
                <span>{ad}</span>
                <div className="bt-varlik-dagilim-bar">
                  <div
                    style={{
                      width:
                        Math.max(2, (tutar / Math.max(ozet.toplam, 1)) * 100) +
                        "%",
                    }}
                  />
                </div>
                <strong className="bt-mono">%{Math.round((tutar / ozet.toplam) * 100)}</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      {silinecek && (
        <div className="bt-modal-arka" role="presentation">
          <div className="bt-modal" role="dialog" aria-modal="true">
            <div className="bt-h2">Varlık silinsin mi?</div>
            <p style={{ color: "var(--dim)", fontSize: 13, lineHeight: 1.6 }}>
              <b style={{ color: "var(--text)" }}>{silinecek.ad}</b> kaydı
              silinecek. Bu işlem toplam varlık değerinizi de günceller.
            </p>
            <div className="bt-form-butonlar">
              <button
                className="bt-btn birincil"
                style={{ background: CORAL }}
                onClick={() => {
                  sil("assets", silinecek.id);
                  setSilinecek(null);
                }}
              >
                <Trash2 size={14} /> Evet, sil
              </button>
              <button
                className="bt-btn ikincil"
                onClick={() => setSilinecek(null)}
              >
                Vazgeç
              </button>
            </div>
          </div>
        </div>
      )}
      {digerPenceresi && (
        <div className="bt-modal-arka" role="presentation">
          <div className="bt-modal" role="dialog" aria-modal="true" aria-labelledby="diger-varlik-baslik">
            <div className="bt-h2" id="diger-varlik-baslik">
              {digerPopupTuru === "kripto_diger" ? "Diğer kripto ekle" : "Diğer varlık ekle"}
            </div>
            <p style={{ color: "var(--dim)", fontSize: 13, lineHeight: 1.6 }}>
              {digerPopupTuru === "kripto_diger"
                ? "Listede olmayan kripto varlığın adını ve bugünkü yaklaşık değerini gir."
                : "Listede olmayan varlığın adını ve bugünkü yaklaşık değerini gir."}
            </p>
            <div className="bt-alanlar" style={{ marginTop: 14 }}>
              <label className="bt-alan">
                <span>Varlık adı *</span>
                <input className="bt-input" autoFocus value={digerFormu.ad} placeholder="Örn. Koleksiyon" onChange={(e) => setDigerFormu((eski) => ({ ...eski, ad: e.target.value }))} />
              </label>
              <label className="bt-alan">
                <span>Kurum / not</span>
                <input className="bt-input" value={digerFormu.kurum} placeholder="Örn. Evde" onChange={(e) => setDigerFormu((eski) => ({ ...eski, kurum: e.target.value }))} />
              </label>
              <label className="bt-alan">
                <span>Güncel değer ({paraBirimi(digerFormu.paraBirimi).id}) *</span>
                <input className="bt-input" type="number" min="0" step="any" value={digerFormu.guncelDeger} onChange={(e) => setDigerFormu((eski) => ({ ...eski, guncelDeger: e.target.value }))} />
              </label>
              <label className="bt-alan">
                <span>Para birimi *</span>
                <select className="bt-input" value={paraBirimi(digerFormu.paraBirimi).id} onChange={(e) => setDigerFormu((eski) => ({ ...eski, paraBirimi: e.target.value }))}>
                  {PARA_BIRIMLERI.map((birim) => <option key={birim.id} value={birim.id}>{birim.ad}</option>)}
                </select>
              </label>
            </div>
            {digerHata && <div className="bt-ipucu" style={{ marginTop: 14, borderColor: CORAL }}><AlertTriangle size={16} />{digerHata}</div>}
            <div className="bt-form-butonlar">
              <button className="bt-btn birincil" type="button" onClick={() => {
                if (!digerFormu.ad.trim() || !(+digerFormu.guncelDeger > 0)) {
                  setDigerHata("Varlık adı ve güncel değer gerekli.");
                  return;
                }
                fSet({ tur: digerPopupTuru, ad: digerFormu.ad.trim(), kurum: digerFormu.kurum.trim(), guncelDeger: digerFormu.guncelDeger, paraBirimi: digerFormu.paraBirimi });
                setDigerPenceresi(false);
              }}><Check size={15} /> Ekle</button>
              <button className="bt-btn ikincil" type="button" onClick={() => { fSet({ tur: digerPopupTuru === "kripto_diger" ? "bitcoin" : "mevduat" }); setDigerPenceresi(false); }}>Vazgeç</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Gelirler ---------------- */
function Gelirler({ veri, form, setForm, ekleGuncelle, sil, buAyGelir }) {
  const acik = form && form.liste === "incomes";
  const [f, setF] = useState({});
  useEffect(() => {
    if (acik) setF(form.veri || {});
  }, [acik, form]);
  const kaynaklar = Object.entries(buAyGelir.kaynaklar).sort(
    (a, b) => b[1] - a[1],
  );
  const enBuyuk = Math.max(...Object.values(buAyGelir.kaynaklar), 1);

  const alanlar = [
    { k: "ad", e: "Kaynak adı (Maaş, Kira geliri…)", t: "text", z: true },
    { k: "tutar", e: "Tutar (₺)", t: "number", z: true },
    {
      k: "tekrar",
      e: "Tekrar",
      t: "select",
      options: ["Her ay", "Tek seferlik"],
    },
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
          <div className="bt-h2" style={{ margin: 0 }}>
            <TrendingUp size={16} /> Gelir kaynakları
          </div>
          {!acik && (
            <button
              className="bt-btn kucuk ikincil"
              onClick={() => setForm({ liste: "incomes", veri: {} })}
            >
              <Plus size={14} /> Ekle
            </button>
          )}
        </div>
        <div style={{ fontSize: 12.5, color: "var(--dim)", marginBottom: 16 }}>
          Maaş, ek iş, kira geliri gibi tüm gelir kaynaklarınızı ekleyin.
          Düzenli olanlar her ay otomatik sayılır; tek seferlik olanlar yalnızca
          o ay için sayılır.
        </div>
        {acik && (
          <div className="bt-form">
            <div className="bt-alanlar">
              {alanlar.map((a) => (
                <label key={a.k} className="bt-alan">
                  {a.e}
                  {a.z ? " *" : ""}
                  {a.t === "select" ? (
                    <select
                      className="bt-input"
                      value={f[a.k] ?? a.options[0]}
                      onChange={(e) => setF({ ...f, [a.k]: e.target.value })}
                    >
                      {a.options.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className="bt-input"
                      type={a.t}
                      min={a.t === "number" ? 0 : undefined}
                      value={f[a.k] ?? ""}
                      onChange={(e) => setF({ ...f, [a.k]: e.target.value })}
                    />
                  )}
                </label>
              ))}
            </div>
            <div className="bt-form-butonlar">
              <button className="bt-btn birincil" onClick={gonder}>
                <Check size={14} /> {f.id ? "Güncelle" : "Kaydet"}
              </button>
              <button className="bt-btn ikincil" onClick={() => setForm(null)}>
                Vazgeç
              </button>
            </div>
          </div>
        )}
        {(veri.incomes || []).length === 0 && !acik ? (
          <div className="bt-bos">Henüz kayıt yok.</div>
        ) : (
          <div className="bt-stack" style={{ gap: 12 }}>
            {(veri.incomes || []).map((g, i) => (
              <div key={g.id} className="bt-satir">
                <div
                  style={rozetStil(LIME, ROTASYONLAR[i % ROTASYONLAR.length])}
                >
                  <TrendingUp size={16} color={INK} />
                </div>
                <div style={{ flex: 1, minWidth: 150 }}>
                  <div className="bt-satir-ad">{g.ad}</div>
                  <div className="bt-satir-meta">
                    {g.tekrar === "Tek seferlik"
                      ? "Tek seferlik" +
                        (g.tarih
                          ? " · " + g.tarih.split("-").reverse().join(".")
                          : "")
                      : "Her ay tekrarlanıyor"}
                  </div>
                </div>
                <div className="bt-satir-tutar">{fmt(g.tutar)}</div>
                <div style={{ display: "flex", gap: 2 }}>
                  <button
                    className="bt-btn hayalet"
                    onClick={() => setForm({ liste: "incomes", veri: g })}
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    className="bt-btn hayalet tehlike"
                    onClick={() => sil("incomes", g.id)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {kaynaklar.length > 0 && (
        <div className="bt-card">
          <div className="bt-h2">
            <PieChart size={16} /> Bu ay gelir dağılımı
          </div>
          {kaynaklar.map(([ad, tutar]) => (
            <div key={ad} className="bt-kat">
              <div className="bt-kat-ad" style={{ width: 130 }}>
                {ad}
              </div>
              <div className="bt-kat-bar">
                <div
                  style={{
                    width: (tutar / enBuyuk) * 100 + "%",
                    background: LIME,
                  }}
                />
              </div>
              <div className="bt-kat-tutar">{fmt(tutar)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Harcamalar ---------------- */
function Harcamalar({
  veri,
  form,
  setForm,
  harcamaKaydet,
  sil,
  buAyHarcama,
  bankalar,
}) {
  const acik = form && form.liste === "expenses";
  const [f, setF] = useState({});
  const [gorunenAy, setGorunenAy] = useState(ayAnahtari());
  useEffect(() => {
    if (acik) {
      setF(
        form.veri.id
          ? form.veri
          : {
              tarih: new Date().toISOString().slice(0, 10),
              kategori: "Market",
              ...form.veri,
            },
      );
    }
  }, [acik, form]);

  const sirali = useMemo(
    () =>
      [...veri.expenses].sort((a, b) =>
        (b.tarih || "").localeCompare(a.tarih || ""),
      ),
    [veri.expenses],
  );
  const harcamaAylar = useMemo(
    () =>
      [
        ...new Set([
          ayAnahtari(),
          ...veri.expenses.map((h) => (h.tarih || "").slice(0, 7)),
        ]),
      ]
        .filter(Boolean)
        .sort()
        .reverse(),
    [veri.expenses],
  );
  const gorunenHarcamalar = useMemo(
    () => sirali.filter((h) => (h.tarih || "").slice(0, 7) === gorunenAy),
    [sirali, gorunenAy],
  );
  const enBuyuk = Math.max(...Object.values(buAyHarcama.kategoriler), 1);
  const seciliKart = veri.cards.find(
    (k) => k.banka + " · " + (k.ad || "Kredi kartı") === f.kaynak,
  );

  function gonder() {
    if (!f.tutar || !f.tarih) return;
    const taksitSayisi = seciliKart
      ? Math.min(Math.max(parseInt(f.taksitSayisi) || 1, 1), 60)
      : 1;
    harcamaKaydet(
      { id: f.id || uid(), ...f, tutar: +f.tutar, taksitSayisi },
      false,
    );
  }

  return (
    <div className="bt-stack">
      <div className="bt-card" data-tour="harcamalar">
        <div className="bt-cardhead">
          <div className="bt-h2" style={{ margin: 0 }}>
            <Wallet size={16} /> Harcamalar
          </div>
          {!acik && (
            <button
              className="bt-btn kucuk birincil"
              onClick={() => setForm({ liste: "expenses", veri: {} })}
            >
              <Plus size={14} /> Yeni harcama
            </button>
          )}
        </div>
        {acik && (
          <div className="bt-form">
            <div className="bt-alanlar">
              <label className="bt-alan">
                Tutar (₺) *
                <input
                  className="bt-input"
                  type="number"
                  min={0}
                  value={f.tutar ?? ""}
                  onChange={(e) => setF({ ...f, tutar: e.target.value })}
                />
              </label>
              <label className="bt-alan">
                Tarih *
                <input
                  className="bt-input"
                  type="date"
                  value={f.tarih ?? ""}
                  onChange={(e) => setF({ ...f, tarih: e.target.value })}
                />
              </label>
              <label className="bt-alan">
                Ödeme kaynağı
                <select
                  className="bt-input"
                  value={f.kaynak ?? ""}
                  onChange={(e) => setF({ ...f, kaynak: e.target.value })}
                >
                  <option value="">Seçin…</option>
                  <option value="Nakit">Nakit</option>
                  <optgroup label="Kredi kartları">
                    {veri.cards.length > 0 ? (
                      veri.cards.map((k) => {
                        const ad = k.banka + " · " + (k.ad || "Kredi kartı");
                        return (
                          <option key={k.id} value={ad}>
                            {ad}
                          </option>
                        );
                      })
                    ) : (
                      <option disabled>Henüz kart yok</option>
                    )}
                  </optgroup>
                  <optgroup label="Banka hesabı">
                    {bankalar.map((b) => (
                      <option key={b} value={b + " · Hesap"}>
                        {b} · Hesap
                      </option>
                    ))}
                  </optgroup>
                </select>
              </label>
              <label className="bt-alan">
                Kategori
                <select
                  className="bt-input"
                  value={f.kategori ?? "Market"}
                  onChange={(e) => setF({ ...f, kategori: e.target.value })}
                >
                  {KATEGORILER.map((k) => (
                    <option key={k}>{k}</option>
                  ))}
                </select>
              </label>
              <label className="bt-alan">
                Taksit sayısı
                <input
                  className="bt-input"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={60}
                  step={1}
                  disabled={!seciliKart}
                  value={seciliKart ? (f.taksitSayisi ?? 1) : 1}
                  onChange={(e) =>
                    setF({ ...f, taksitSayisi: e.target.value })
                  }
                />
                <small style={{ color: "var(--dim)" }}>
                  {!seciliKart
                    ? "Taksit için önce kredi kartı seçin"
                    : Math.max(parseInt(f.taksitSayisi) || 1, 1) === 1
                      ? "Tek çekim"
                      : "Aylık yaklaşık " +
                        fmt(
                          (+f.tutar || 0) /
                            Math.max(parseInt(f.taksitSayisi) || 1, 1),
                        )}
                </small>
              </label>
              <label className="bt-alan">
                Açıklama
                <input
                  className="bt-input"
                  type="text"
                  placeholder="ör. haftalık market"
                  value={f.aciklama ?? ""}
                  onChange={(e) => setF({ ...f, aciklama: e.target.value })}
                />
              </label>
            </div>
            <div className="bt-form-butonlar">
              <button className="bt-btn birincil" onClick={gonder}>
                <Check size={14} /> {f.id ? "Güncelle" : "Kaydet"}
              </button>
              <button className="bt-btn ikincil" onClick={() => setForm(null)}>
                Vazgeç
              </button>
            </div>
          </div>
        )}
        {!acik && sirali.length === 0 && (
          <div className="bt-bos">Henüz harcama kaydı yok.</div>
        )}
      </div>

      {Object.keys(buAyHarcama.kategoriler).length > 0 && (
        <div className="bt-card">
          <div className="bt-cardhead">
            <div className="bt-h2" style={{ margin: 0 }}>
              <PieChart size={16} /> Bu ay kategori dağılımı
            </div>
            <div className="bt-mono" style={{ fontSize: 13 }}>
              {fmt(buAyHarcama.toplam)}
            </div>
          </div>
          {Object.entries(buAyHarcama.kategoriler)
            .sort((a, b) => b[1] - a[1])
            .map(([kat, tutar]) => (
              <div key={kat} className="bt-kat">
                <div className="bt-kat-ad">{kat}</div>
                <div className="bt-kat-bar">
                  <div
                    style={{
                      width: (tutar / enBuyuk) * 100 + "%",
                      background: LIME,
                    }}
                  />
                </div>
                <div className="bt-kat-tutar">{fmt(tutar)}</div>
              </div>
            ))}
        </div>
      )}

      {Object.keys(buAyHarcama.kaynaklar).length > 0 && (
        <div className="bt-card">
          <div className="bt-h2">
            <Wallet size={16} /> Bu ay hangi bankadan ne kadar harcadınız
          </div>
          {Object.entries(buAyHarcama.kaynaklar)
            .sort((a, b) => b[1] - a[1])
            .map(([kaynak, tutar]) => {
              const eb = Math.max(...Object.values(buAyHarcama.kaynaklar), 1);
              return (
                <div key={kaynak} className="bt-kat">
                  <div className="bt-kat-ad" style={{ width: 150 }}>
                    {kaynak}
                  </div>
                  <div className="bt-kat-bar">
                    <div
                      style={{
                        width: (tutar / eb) * 100 + "%",
                        background: CORAL,
                      }}
                    />
                  </div>
                  <div className="bt-kat-tutar">{fmt(tutar)}</div>
                </div>
              );
            })}
        </div>
      )}

      {sirali.length > 0 && (
        <div className="bt-card">
          <div className="bt-cardhead">
            <div className="bt-h2" style={{ margin: 0 }}>
              {ayEtiketi(gorunenAy)} harcamaları
            </div>
            <select
              className="bt-input"
              aria-label="Harcama dönemi"
              value={gorunenAy}
              onChange={(e) => setGorunenAy(e.target.value)}
              style={{ width: 170 }}
            >
              {harcamaAylar.map((ay) => (
                <option key={ay} value={ay}>
                  {ayEtiketi(ay)}
                </option>
              ))}
            </select>
          </div>
          {gorunenHarcamalar.length === 0 ? (
            <div className="bt-bos">Bu ay için harcama kaydı yok.</div>
          ) : (
          <div className="bt-stack" style={{ gap: 10 }}>
            {gorunenHarcamalar.map((h) => (
              <div key={h.id} className="bt-satir">
                <div style={{ flex: 1, minWidth: 150 }}>
                  <div className="bt-satir-ad">
                    {h.kategori}
                    {h.aciklama && (
                      <span style={{ color: "var(--dim)", fontWeight: 500 }}>
                        {" "}
                        · {h.aciklama}
                      </span>
                    )}
                  </div>
                  <div className="bt-satir-meta">
                    {h.tarih && h.tarih.split("-").reverse().join(".")}
                    {h.kaynak && <> · {h.kaynak}</>}
                    {(+h.taksitSayisi || 1) > 1 && (
                      <>
                        {" "}· {h.taksitSayisi} taksit · aylık{" "}
                        {fmt((+h.tutar || 0) / +h.taksitSayisi)}
                      </>
                    )}
                  </div>
                </div>
                <div className="bt-satir-tutar">{fmt(h.tutar)}</div>
                <div style={{ display: "flex", gap: 2 }}>
                  <button
                    className="bt-btn hayalet"
                    onClick={() => setForm({ liste: "expenses", veri: h })}
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    className="bt-btn hayalet tehlike"
                    onClick={() => sil("expenses", h.id)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      )}
    </div>
  );
}
