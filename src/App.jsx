import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { demoModu, supabase } from "./supabaseClient.js";
import { apiAdresi, dokunusGeriBildirimi, nativeMi, yenilemeYonergesi, yenilemeYonergesiKucuk, ortamSozcugu } from "./platform.js";
import { dil, isoTarihGoster, locale, t, tDeger } from "./i18n.js";
import Ceviri from "./Ceviri.jsx";
import { kodBazliFiyatlariBirlestir, piyasaFiyatlariniBirlestir } from "./piyasaFiyatBirlestir.js";
import { misafirModuAcik } from "./misafirModu.js";
import {
  nativeSekmeCubuguVarMi,
  sekmeCubuguHazirla,
  sekmeCubuguTemasi,
  sekmeCubugunuGoster,
  sekmeCubugunuSec,
} from "./nativeSekmeCubugu.js";
import { BiyometrikAyar } from "./BiyometrikKilit.jsx";
import OdemeHatirlatmaAyari from "./OdemeHatirlatmaAyari.jsx";
import DilAyari from "./DilAyari.jsx";
import ParaBirimiAyari from "./ParaBirimiAyari.jsx";
import {
  bankaSecenekleri,
  belgeOkumaAcik,
  bolgeAsgariOdemesi,
  bolgeProfili,
  ekHesapFaizOrani,
  esikTutar,
  kartFaizOranlari,
  ornekTutar,
  profilUlkeAdi,
  tryKaydiVar,
  turkiyeKurallariGecerli,
  vergiFonOrani,
} from "./bolgeKurallari.js";
import {
  aktifKurTablosu,
  borcListesiniAnaBirimeCevir,
  kurBekleyenKayitlar,
  kurCarpani,
  kurTablosuOlustur,
  kurTablosunuAyarla,
} from "./dovizKuru.js";
import { bildirimleriPlanla, yaklasaniKaydet } from "./odemeBildirimi.js";
import {
  kayitliProSatisDurumu,
  proSatisDurumuBelirle,
  proSatisDurumunuKaydet,
  proSatistaDegil as proMagazadaSatistaDegil,
} from "./proSatis.js";
import {
  revenueCatHazir,
  revenueCatNativeTeklifleri,
  revenueCatProKontrol,
  revenueCatProPaketleri,
  revenueCatProSatinAl,
  revenueCatSatinAlimlariGeriYukle,
} from "./revenuecat.js";
import {
  paddleKartGuncellemeEkraniAc,
  paddleKartYonetimiHazir,
} from "./paddle.js";
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
  MoreHorizontal,
  Upload,
  ShieldCheck,
  ArrowRight,
  Info,
  ScanSearch,
  Gift,
  Copy,
  Share2,
} from "lucide-react";
import { belgeKaydiParaBirimi, readStatementFile } from "./statementImport.js";
import { validateStatementResult } from "./statementParser.js";
import { formatStatementTransactionDate } from "./statementTransactions.js";
import { readLoanPlanFile } from "./loanPlanImport.js";
import { validateLoanPlanResult } from "./loanPlanParser.js";
import { loanPaymentAmount, summarizeLoanRecord } from "./loanPlanSummary.js";
import { krediKaydiniHazirla, krediTaksitIlerlemesi } from "./loanEntry.js";
import {
  paraBiriminiFormatla,
  paraGirdisiniCoz,
  paraGirdisiniFormatla,
  kullaniciParaBirimi,
  kullaniciParaFormatla,
  paraBirimiSimgesi,
  kayitParaBirimi,
  DESTEKLENEN_PARA_BIRIMLERI,
  paraBirimiAdi,
} from "./currencyInput.js";
import {
  matchStatementToCard,
  savedCardLast4,
} from "./statementCardMatcher.js";
import {
  listUploadedStatements,
  moveUploadedStatement,
  removeUploadedStatement,
} from "./statementArchive.js";
import {
  googleAdsOlcumIzniAyarla,
  googleAdsOlcumTercihi,
  googleAdsSatinAlmaDonusumu,
} from "./googleAds.js";
import { revenueCatProHakkiniSenkronizeEt } from "./revenuecatSync.js";
import { aktiviteOlaylariniCikar } from "./activityEvents.js";
import { aktiviteleriKaydet } from "./activityLog.js";
import { calculateRevolvingDebtScenario } from "./financialScenario.js";
import { loanIsDueInMonth, loanPaymentKey, loanStartsInMonths } from "./loanSchedule.js";
import { rehberDurumu, rehberiErtele, rehberiMezunEt, rehberOnerisiniKapat } from "./borcamaRehberi.js";
import {
  gecmisleKapananKrediAlanlari,
  krediKapanisiOncedenKutlandiMi,
  krediKapanisKutlamasiniIsaretle,
  KREDI_KAPANISI_GECMIS,
  kutlanacakKapaliKredi,
  loanClosesAfterPayment,
  loanIsClosed,
} from "./loanCompletion.js";
import {
  buAyDuzenliBorcToplami,
  duzenliBorcOdemeleri,
} from "./recurringObligations.js";
import { getFinancialScenarioCopy } from "./financialScenarioCopy.js";
import {
  getActivationState,
  getMonthlyBalancePresentation,
} from "./productActivation.js";
import { buildTodayDebtPlan } from "./todayDebtPlan.js";
import {
  expenseInstallmentAmountForPeriod,
  statementPeriodForTransaction,
  statementPeriodsForExpense,
} from "./statementPeriod.js";
import {
  ekHesapBorcuEkle,
  ekHesapOdemesiKaldir,
  ekHesapOdemesiUygula,
} from "./overdraftPayments.js";
import {
  isMandatoryPaymentPending,
  mergeArchivedCardStatement,
  summarizeMandatoryPayments,
} from "./paymentSummary.js";
import { summarizeComparableAssets } from "./assetSummary.js";
import {
  HESAP_SILME_ONAYI,
  borcamaHesabiniSil,
  borcamaYerelVerileriniTemizle,
  hesapSilmeHataMesaji,
  hesapSilmeOnayiGecerli,
} from "./accountDeletion.js";
import {
  applyCardRestructuring,
  bindCardRestructuringsToStatement,
  calculateRestructuringInstallment,
  cardRestructuredAmount,
  cardRestructurableBalance,
  latestCardRestructuring,
} from "./cardRestructuring.js";
import { BANK_LOGOS } from "./bankLogos.js";
import { davetDurumunuGetir } from "./referrals.js";
import { asistanBaglamiOlustur, asistanKullaniciTercihleri } from "./assistantContext.js";
import { finansalAsistanaSor } from "./financialAssistant.js";
import { asistanYanitiniSunumaDonustur, yanitIsaretleriniCevir } from "./assistantPresentation.js";
import { appendAssistantExchange, MAX_ASSISTANT_EXCHANGES } from "../supabase/functions/_shared/financialAssistantConversation.js";
import {
  harcamaKaynagiSecimDegeri,
  harcamaKaynaklariniOlustur,
} from "./expenseSources.js";
import {
  KREDI_KARTI_ASGARI_LIMIT_ESIGI,
  krediKartiAsgariOrani,
  yasalAsgariUygulanir,
} from "./creditCardMinimum.js";
import { demoVerisiOlustur } from "./demoAccount.js";

/* ---------------- Sabit tasarım tokenları ---------------- */
const INK = "#14160f";
const CREAM = "#f4efe0";
const LIME = "#cdf564";
const CORAL = "#ff6f59";
const ROTASYONLAR = [-1.2, 1, -0.6, 1.4, -1];

function YerindeForm({ hedef, children }) {
  if (!hedef) return children;
  if (typeof document === "undefined") return null;
  const dugum = document.getElementById(hedef);
  return dugum ? createPortal(children, dugum) : null;
}

const ACIK_TEMA = {
  bg: CREAM,
  panel: "#ffffff",
  panel2: "#f6f3e8",
  text: INK,
  dim: "#55584c",
  faint: "#8a8c7e",
  line: "#6f7367",
  lineSoft: "#14160f1c",
  summaryBg: "#d9e7e1",
  summarySoft: "#eef2e5",
  summaryText: INK,
  summaryMuted: "#484c41",
  summaryAmount: INK,
  summaryShadow: `3px 3px 0 ${LIME}, 5px 5px 0 ${CORAL}`,
  debtCard: "#82a92e",
  debtLoan: "#e65340",
  debtAccount: "#899285",
  debtOther: "#454a40",
};
const KOYU_TEMA = {
  bg: "#0f110a",
  panel: "#191c12",
  panel2: "#22261a",
  text: CREAM,
  dim: "#b5b2a0",
  faint: "#8a8c7e",
  line: "#e8e4d2",
  lineSoft: "#e8e4d22e",
  summaryBg: INK,
  summarySoft: "#191c12",
  summaryText: CREAM,
  summaryMuted: "#cdd0c1",
  summaryAmount: LIME,
  summaryShadow: `3px 3px 0 ${CORAL}`,
  debtCard: LIME,
  debtLoan: CORAL,
  debtAccount: "#c8c9be",
  debtOther: "#8f9386",
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
  Ziraat: "ZB",
  "Ziraat Bankası": "ZB",
  DenizBank: "DB",
  ING: "ING",
  "ING Bank": "ING",
  TEB: "TEB",
  "Türk Ekonomi Bankası": "TEB",
  HSBC: "HSBC",
  "Türkiye Finans": "TF",
};
function bankaKodu(banka) {
  const b = (banka || "").trim();
  if (BANKA_KOD[b]) return BANKA_KOD[b];
  return b.slice(0, 3).toUpperCase() || "??";
}
function kartSon4Eki(kart) {
  const son4 = savedCardLast4(kart);
  return son4 ? ` · •••• ${son4}` : "";
}
function kartGorunenAdi(kart) {
  return `${kart?.banka || t("ortak.banka")} · ${kart?.ad || t("cekirdek.krediKarti")}${kartSon4Eki(kart)}`;
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
const BANKA_LOGO_ANAHTARI = {
  VakıfBank: "vakifbank",
  Halkbank: "halkbank",
  Enpara: "enpara",
  "Garanti BBVA": "garanti",
  QNB: "qnb",
  Akbank: "akbank",
  "İş Bankası": "isbank",
  "Yapı Kredi": "yapikredi",
  "Kuveyt Türk": "kuveytturk",
  Fibabanka: "fibabanka",
  Ziraat: "ziraat",
  "Ziraat Bankası": "ziraat",
  DenizBank: "denizbank",
  ING: "ing",
  "ING Bank": "ing",
  TEB: "teb",
  "Türk Ekonomi Bankası": "teb",
  HSBC: "hsbc",
  "Türkiye Finans": "turkiyefinans",
};
const BANKA_MARKA_STILI = {
  halkbank: { renk: "#005596", zemin: "#dceefa" },
  vakifbank: { renk: "#f5b800", zemin: "#fff1b8" },
  qnb: { renk: "#6f2c91", zemin: "#eadcf2" },
  enpara: { renk: "#7b2e91", zemin: "#eadcf1" },
  garanti: { renk: "#188447", zemin: "#dcefe3" },
  akbank: { renk: "#d71920", zemin: "#f8dedf" },
  isbank: { renk: "#005ca9", zemin: "#dcecf8" },
  yapikredi: { renk: "#17479e", zemin: "#dee6f6" },
  kuveytturk: { renk: "#009b77", zemin: "#d8f0e9" },
  fibabanka: { renk: "#668b9b", zemin: "#e1eaed" },
  ziraat: { renk: "#d71920", zemin: "#f9dfe0" },
  denizbank: { renk: "#005baa", zemin: "#dcecf8" },
  ing: { renk: "#ff6200", zemin: "#ffeadc" },
  teb: { renk: "#00529b", zemin: "#dcebf7" },
  hsbc: { renk: "#db0011", zemin: "#fae0e2" },
  turkiyefinans: { renk: "#00a6a6", zemin: "#daf2ef" },
};
function BankaRozeti({ banka, bg = LIME, rot = 0, boyut = 42, className }) {
  const logoAnahtari = BANKA_LOGO_ANAHTARI[(banka || "").trim()];
  const logo = BANK_LOGOS[logoAnahtari];
  const marka = BANKA_MARKA_STILI[logoAnahtari] || { renk: INK, zemin: bg };
  return (
    <div
      className={["bt-banka-rozet", className].filter(Boolean).join(" ")}
      style={{
        ...rozetStil(logo ? marka.zemin : bg, rot, boyut),
        position: "relative",
        overflow: "hidden",
        padding: logo ? Math.max(Math.round(boyut * 0.13), 4) : 0,
        border: logo ? `1.5px solid ${marka.renk}` : `2px solid ${INK}`,
        background: logo ? marka.zemin : bg,
        boxShadow: logo ? `3px 3px 0 ${CORAL}` : `3px 3px 0 ${bg === CORAL ? LIME : CORAL}`,
      }}
      aria-hidden="true"
    >
      {logo ? (
        <img
          src={logo}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            position: "relative",
            zIndex: 1,
            mixBlendMode: "multiply",
            filter: "saturate(1.08) contrast(1.08)",
          }}
        />
      ) : (
        bankaKodu(banka)
      )}
    </div>
  );
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
.bt-budget-check{position:relative;z-index:1;margin:18px 0;border:1px solid var(--line-soft);border-radius:20px;background:var(--panel);color:var(--text);overflow:hidden;box-shadow:0 8px 22px #14160f08}
.bt-budget-check summary{display:flex;align-items:center;gap:14px;cursor:pointer;padding:18px 20px;list-style:none;background:linear-gradient(110deg,#cdf56425,transparent 75%)}
.bt-budget-check summary::-webkit-details-marker{display:none}.bt-budget-check summary:focus-visible{outline:3px solid #5d7a2e;outline-offset:-4px;border-radius:18px}
.bt-budget-check-icon{display:grid;place-items:center;flex-shrink:0;width:44px;height:44px;border-radius:14px;background:#cdf564;color:#14160f;box-shadow:3px 3px 0 #ff6f59}
.bt-budget-check-title{flex:1;min-width:0}.bt-budget-check-title strong{display:block;font-size:18px;line-height:1.25}.bt-budget-check-title small{display:block;margin-top:5px;font-size:13px;line-height:1.4;color:var(--dim)}
.bt-budget-check-arrow{flex-shrink:0;transition:transform .2s}.bt-budget-check[open] .bt-budget-check-arrow{transform:rotate(90deg)}
.bt-budget-check-body{padding:0 20px 20px}.bt-budget-check-ledger{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;padding-top:16px;border-top:1px solid var(--line-soft)}
.bt-budget-check-ledger button{display:flex;flex-direction:column;align-items:flex-start;gap:9px;min-width:0;text-align:left;padding:14px;border:1px solid var(--line-soft);border-radius:14px;background:var(--panel-soft,var(--panel));color:var(--text);cursor:pointer;font:inherit}.bt-budget-check-ledger button:hover{border-color:#5d7a2e;background:#cdf56420}.bt-budget-check-ledger span{font-size:13px;color:var(--dim)}.bt-budget-check-ledger strong{font:700 clamp(15px,2vw,20px) 'JetBrains Mono',monospace;overflow-wrap:anywhere}.bt-budget-check-ledger small{display:flex;align-items:center;gap:4px;font-size:12px;font-weight:700;color:var(--text)}
.bt-budget-check-note{display:flex;align-items:flex-start;gap:9px;margin:14px 0 0;font-size:13px;line-height:1.5;color:var(--dim)}.bt-budget-check-note svg{flex-shrink:0;margin-top:2px}
@media(max-width:560px){.bt-budget-check summary{padding:16px;gap:12px}.bt-budget-check-title strong{font-size:16px}.bt-budget-check-body{padding:0 16px 16px}.bt-budget-check-ledger{grid-template-columns:1fr}.bt-budget-check-ledger button{display:grid;grid-template-columns:1fr auto;align-items:center;gap:6px 12px}.bt-budget-check-ledger small{grid-column:1/-1}.bt-budget-check-icon{width:38px;height:38px}}
*{box-sizing:border-box}
::selection{background:${LIME};color:${INK}}
.bt-app{font-family:'Space Grotesk',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;transition:background .2s ease,color .2s ease;font-variant-numeric:tabular-nums}
.bt-wrap{max-width:1080px;margin:0 auto;padding:clamp(28px,5vw,48px) clamp(16px,4vw,28px) 120px}
.bt-display{font-family:'Archivo Black',sans-serif}
.bt-mono{font-family:'JetBrains Mono',monospace}

.bt-header{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;row-gap:24px;flex-wrap:wrap;margin-bottom:32px}
.bt-headright{display:flex;align-items:center;gap:16px;flex-wrap:wrap}
.bt-tema-secim{display:inline-flex;gap:4px;padding:4px;border:1px solid var(--line-soft);border-radius:999px;background:var(--panel2)}.bt-tema-secim button{min-width:64px;padding:7px 14px;border:0;border-radius:999px;background:transparent;color:var(--dim);font:700 13px 'Space Grotesk',sans-serif;cursor:pointer}.bt-tema-secim button.aktif{background:${LIME};color:${INK};box-shadow:0 2px 8px #14160f1f}
.bt-demo-plan{display:inline-flex;align-items:center;gap:4px;padding:4px;border:1px dashed var(--line-soft);border-radius:999px;background:var(--panel2)}
.bt-demo-plan>span{padding:0 6px;font:700 9px 'JetBrains Mono',monospace;letter-spacing:.04em;text-transform:uppercase;color:var(--dim)}
.bt-demo-plan button{border:0;border-radius:999px;background:transparent;color:var(--dim);padding:5px 9px;font:700 10.5px 'Space Grotesk',sans-serif;cursor:pointer}
.bt-demo-plan button.aktif{background:${LIME};color:${INK};box-shadow:inset 0 0 0 1.5px ${INK}}
.bt-date{font-family:'JetBrains Mono',monospace;font-size:13px;color:var(--dim)}
.bt-settings-link{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line-soft);border-radius:999px;background:var(--panel);color:var(--text);padding:7px 11px;font:700 11.5px 'Space Grotesk',sans-serif;box-shadow:0 3px 10px #14160f08;cursor:pointer}.bt-settings-link:hover,.bt-settings-link.aktif{background:${LIME};color:${INK};border-color:color-mix(in srgb,${INK} 55%,transparent)}
.bt-assistant-header{display:none}
.bt-upgrade-link{display:inline-flex;align-items:center;gap:6px;border:1.5px solid ${INK};border-radius:999px;background:${LIME};color:${INK};padding:7px 11px;font:800 11.5px 'Space Grotesk',sans-serif;box-shadow:3px 3px 0 ${CORAL};cursor:pointer}.bt-upgrade-link:hover{transform:translateY(-1px)}
.bt-trial-son{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:13px;margin:-14px 0 24px;padding:14px 16px;border:1px solid color-mix(in srgb,${CORAL} 62%,var(--line-soft));border-radius:17px;background:color-mix(in srgb,${CORAL} 9%,var(--panel));box-shadow:0 8px 22px #14160f0a}.bt-trial-son-ikon{display:grid;place-items:center;width:38px;height:38px;border-radius:11px;background:${CORAL};color:${INK}}.bt-trial-son strong{display:block;font-size:13.5px}.bt-trial-son p{margin:3px 0 0;color:var(--dim);font-size:11.5px;line-height:1.45}.bt-trial-son-actions{display:flex;align-items:center;gap:7px}.bt-trial-son-kapat{border:0;background:transparent;color:var(--dim);font:700 11px 'Space Grotesk',sans-serif;text-decoration:underline;text-underline-offset:3px;cursor:pointer}.bt-trial-son .bt-btn{white-space:nowrap}

.bt-nav{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:36px}
.bt-nav-ana{align-items:center}.bt-nav-ana .bt-pill{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:44px}.bt-nav-ana .bt-pill svg{width:18px;height:18px;flex:0 0 auto}.bt-nav-ana .bt-pill span{display:block;line-height:1}.bt-nav-alt{display:flex;gap:7px;flex-wrap:wrap;margin:-22px 0 28px;padding:7px;background:var(--panel2);border:1px solid var(--line-soft);border-radius:16px}.bt-nav-alt .bt-pill{padding:7px 13px;font-size:12px;border-width:1px}
.bt-pill{padding:10px 18px;border-radius:999px;font-size:14px;font-weight:700;white-space:nowrap;cursor:pointer;font-family:'Space Grotesk',sans-serif;border:1px solid transparent;background:none}
.bt-pill:focus-visible{outline:3px solid ${CORAL};outline-offset:2px}
.bt-pill.aktif{background:${LIME};border-color:color-mix(in srgb,${INK} 62%,transparent);color:${INK};box-shadow:0 4px 12px #14160f0a}
.bt-pill.pasif{background:var(--panel);border-color:var(--line-soft);color:var(--text);opacity:.72}
.bt-pill.pasif:hover{opacity:1}

.bt-card{background:var(--panel);border:1px solid var(--line-soft);border-radius:20px;padding:clamp(18px,4vw,30px);box-shadow:0 8px 24px #14160f08}
.bt-stack{display:flex;flex-direction:column;gap:16px}
.bt-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px}
.bt-cardhead{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;gap:10px;flex-wrap:wrap}
.bt-h2{margin:0 0 22px;font-family:'Archivo Black',sans-serif;font-size:19px;color:var(--text);display:flex;align-items:center;gap:10px}

.bt-hero{position:relative;overflow:hidden;background:var(--summary-bg);color:var(--summary-text);border:1px solid var(--line-soft);border-radius:24px;padding:clamp(24px,5vw,40px) clamp(20px,4.5vw,38px);margin-bottom:0;box-shadow:0 14px 34px #14160f0d}
.bt-hero .deko-daire{position:absolute;top:-24px;right:60px;width:56px;height:56px;border-radius:50%;background:${CORAL};border:2px solid ${INK};transform:rotate(8deg)}
.bt-hero .deko-kare{position:absolute;bottom:20px;right:-18px;width:44px;height:44px;background:${LIME};border:2px solid ${INK};border-radius:10px;transform:rotate(20deg)}
.bt-hero-label{font-size:13px;font-weight:600;letter-spacing:.08em;color:var(--summary-muted);text-transform:uppercase;margin-bottom:16px}
.bt-hero-label-row{display:flex;align-items:center;gap:7px;margin-bottom:16px}.bt-hero-label-row .bt-hero-label{margin:0;line-height:1.2}.bt-hero-label-row .bt-tutar-toggle{display:inline-flex;align-items:center;justify-content:center;flex:0 0 28px;width:28px;height:28px;padding:0!important;border-radius:50%!important;color:var(--summary-muted)!important;transform:translateY(-1px)}.bt-hero-label-row .bt-tutar-toggle svg{display:block;flex:0 0 auto}.bt-tutar-toggle:hover{color:var(--summary-text)!important;background:color-mix(in srgb,var(--panel) 72%,transparent)!important}
.bt-hero-tutar{font-family:'Archivo Black',sans-serif;font-size:clamp(30px,7.5vw,58px);line-height:1;color:var(--summary-amount);text-shadow:var(--summary-shadow);margin-bottom:16px;overflow-wrap:anywhere}
.bt-hero-delta-grup{display:grid;justify-items:start;gap:7px;margin-bottom:16px}.bt-hero-delta{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:800;padding:6px 11px;border:1px solid currentColor;border-radius:999px;margin:0;font-family:'JetBrains Mono',monospace}.bt-hero-delta-kaynak{max-width:440px;color:var(--summary-muted);font-size:10.5px;line-height:1.4}
.bt-hero-delta.azaldi{background:#f0ffd2;color:#466611}.bt-hero-delta.artti{background:#ffe4de;color:#9a3023}
.bt-hero-grid{position:relative;z-index:1;display:grid;grid-template-columns:minmax(0,1.25fr) minmax(250px,.75fr);gap:clamp(20px,4vw,38px);align-items:start;margin-top:0}
.bt-onemli-panel{min-width:0}.bt-onemli-liste{display:grid;gap:9px}.bt-onemli-satir{display:grid;grid-template-columns:36px minmax(0,1fr) auto;gap:10px;align-items:center;width:100%;padding:12px;border:1px solid color-mix(in srgb,var(--line) 16%,transparent);border-radius:14px;background:color-mix(in srgb,var(--panel) 72%,var(--summary-bg));color:var(--summary-text);text-align:left;font-family:inherit;cursor:pointer;box-shadow:0 6px 16px #14160f08}.bt-onemli-ikon{display:grid;place-items:center;width:36px;height:36px;border-radius:10px;background:${LIME};color:${INK}}.bt-onemli-satir.acil .bt-onemli-ikon{background:${CORAL}}.bt-onemli-satir.plan{background:${INK};color:#fff}.bt-onemli-satir.plan .bt-onemli-ikon{background:${LIME};color:${INK}}.bt-onemli-satir.plan small{color:#d5d8cc}.bt-onemli-satir.plan>svg{color:${LIME}}.bt-onemli-satir strong{display:block;font-size:13.5px;line-height:1.25}.bt-onemli-satir small{display:block;margin-top:3px;color:var(--summary-muted);font-size:10.5px;line-height:1.3}.bt-onemli-satir small b{color:inherit;font-weight:750}.bt-onemli-satir>svg{color:var(--summary-muted)}.bt-onemli-satir:hover{transform:translateY(-1px)}.bt-onemli-bos{padding:10px 0;color:var(--summary-muted);font-size:11px;line-height:1.4}
.bt-ozet-kisa{position:relative;z-index:1;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));margin:6px 0 14px;border-top:1px solid color-mix(in srgb,var(--line) 28%,transparent);border-bottom:1px solid color-mix(in srgb,var(--line) 28%,transparent)}
.bt-ozet-kisa>div{min-width:0;padding:16px}.bt-ozet-kisa>div:first-child{padding-left:0}.bt-ozet-kisa>div+div{border-left:1px solid color-mix(in srgb,var(--line) 20%,transparent)}.bt-ozet-kisa span{display:block;margin-bottom:7px;color:var(--summary-muted);font-size:12.5px;font-weight:750}.bt-ozet-kisa strong{display:block;color:var(--summary-text);font:700 clamp(16px,2.3vw,21px) 'JetBrains Mono',monospace;line-height:1.15;overflow-wrap:anywhere}
.bt-ozet-durum{position:relative;z-index:1;display:flex;align-items:center;gap:9px 18px;flex-wrap:wrap;margin:0 0 17px;color:var(--summary-muted);font-size:11px;line-height:1.45}.bt-ozet-durum b{color:var(--summary-text);font-family:'JetBrains Mono',monospace}
.bt-serit{display:flex;height:10px;border-radius:999px;overflow:hidden;border:1px solid var(--line-soft);margin-bottom:16px;background:color-mix(in srgb,var(--summary-bg) 45%,var(--panel))}
.bt-serit div{min-width:4px}.bt-serit div+div{border-left:1px solid color-mix(in srgb,var(--line) 55%,transparent)}
.bt-chip{display:flex;align-items:center;gap:7px;font-size:12px;padding:8px 12px;border-radius:20px;background:color-mix(in srgb,var(--panel) 88%,var(--summary-bg));border:1px solid var(--line-soft)}
.bt-chip .dot{width:10px;height:10px;border:1px solid color-mix(in srgb,var(--line) 45%,transparent);border-radius:50%;flex:0 0 auto}
.bt-chip .lbl{color:var(--summary-muted)}
.bt-chip .amt{font-family:'JetBrains Mono',monospace;color:var(--summary-text);font-weight:700}
.bt-chip.secilebilir{font-family:'Space Grotesk',sans-serif;cursor:pointer;color:inherit;transition:opacity .15s,transform .15s}
.bt-chip.secilebilir:hover{transform:translateY(-1px)}
.bt-chip.haric{opacity:.45;border-style:dashed}
.bt-chip.haric .lbl,.bt-chip.haric .amt{text-decoration:line-through}
.bt-satir.bt-odendi{opacity:.68}.bt-satir.bt-odendi .bt-satir-ad,.bt-satir.bt-odendi .bt-satir-tutar{text-decoration:line-through;text-decoration-thickness:2px}.bt-satir.bt-odendi .bt-btn{opacity:1;text-decoration:none}
.bt-borc-dagilim{position:relative;z-index:1;margin-top:8px}.bt-borc-dagilim>summary{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;padding:13px 15px;list-style:none;color:var(--summary-text);border:1px solid color-mix(in srgb,var(--line) 16%,transparent);border-radius:14px;background:color-mix(in srgb,var(--panel) 62%,var(--summary-bg));cursor:pointer}.bt-borc-dagilim>summary>span{display:flex;align-items:center;gap:11px}.bt-borc-dagilim>summary>span>span{display:grid;gap:2px}.bt-borc-dagilim>summary b{font-size:13px}.bt-borc-dagilim>summary small{color:var(--summary-muted);font-size:10.5px;font-weight:500}.bt-borc-dagilim>summary::-webkit-details-marker{display:none}.bt-borc-dagilim>summary::after{content:'+';display:grid;place-items:center;width:29px;height:29px;border:1px solid var(--line-soft);border-radius:50%;background:var(--panel);font-size:18px}.bt-borc-dagilim[open]>summary::after{content:'−'}.bt-borc-dagilim-icerik{padding:14px 2px 2px}
.bt-bugun-plan{display:grid;gap:17px;padding:clamp(18px,4vw,26px);border:1px solid color-mix(in srgb,${CORAL} 42%,var(--line-soft));border-radius:21px;background:linear-gradient(135deg,var(--panel),color-mix(in srgb,${CORAL} 6%,var(--panel)));box-shadow:0 10px 28px #14160f0a}.bt-bugun-plan-head{display:flex;align-items:end;justify-content:space-between;gap:16px}.bt-bugun-plan-head h2{margin:0;color:var(--text);font:800 clamp(21px,3vw,27px)/1.1 'Space Grotesk',sans-serif}.bt-bugun-plan-head p{margin:5px 0 0;color:var(--dim);font-size:11.5px;line-height:1.45}.bt-bugun-plan-grid{display:grid;grid-template-columns:minmax(220px,.65fr) minmax(0,1.35fr);gap:12px}.bt-bugun-faiz{display:flex;flex-direction:column;justify-content:space-between;min-height:156px;padding:18px;border-radius:16px;background:${INK};color:#fff}.bt-bugun-faiz span{color:#c9d0c8;font-size:10.5px;font-weight:750}.bt-bugun-faiz strong{display:block;margin:10px 0 8px;color:${LIME};font:800 clamp(25px,4vw,35px)/1 'JetBrains Mono',monospace}.bt-bugun-faiz small{color:#aeb8b0;font-size:9.5px;line-height:1.45}.bt-bugun-sira{display:grid;gap:7px}.bt-bugun-sira-satir{display:grid;grid-template-columns:30px minmax(0,1fr) auto;gap:10px;align-items:center;padding:11px 12px;border:1px solid var(--line-soft);border-radius:13px;background:var(--panel2)}.bt-bugun-sira-no{display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:${LIME};color:${INK};font:800 10.5px 'JetBrains Mono',monospace}.bt-bugun-sira-satir strong{display:block;color:var(--text);font-size:12.5px;line-height:1.25}.bt-bugun-sira-satir small{display:block;margin-top:3px;color:var(--dim);font-size:9.5px;line-height:1.35}.bt-bugun-sira-tutar{color:var(--text);font:750 12px 'JetBrains Mono',monospace;white-space:nowrap}.bt-bugun-sira-devami{color:var(--dim);font-size:10px;text-align:right}.bt-bugun-plan-kilit,.bt-bugun-plan-bos{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:14px;align-items:center;min-height:156px;padding:18px;border:1px dashed color-mix(in srgb,${LIME} 75%,var(--line-soft));border-radius:16px;background:color-mix(in srgb,${LIME} 9%,var(--panel2))}.bt-bugun-plan-kilit strong,.bt-bugun-plan-bos strong{display:block;color:var(--text);font-size:14px}.bt-bugun-plan-kilit span,.bt-bugun-plan-bos span{display:block;margin-top:5px;color:var(--dim);font-size:11px;line-height:1.45}
@media(max-width:700px){.bt-bugun-plan-head{align-items:flex-start;flex-direction:column}.bt-bugun-plan-grid{grid-template-columns:1fr}.bt-bugun-faiz{min-height:0}.bt-bugun-plan-kilit,.bt-bugun-plan-bos{grid-template-columns:1fr;min-height:0}.bt-bugun-plan-kilit .bt-btn{justify-self:start}.bt-bugun-sira-satir{grid-template-columns:28px minmax(0,1fr)}.bt-bugun-sira-no{width:28px;height:28px}.bt-bugun-sira-tutar{grid-column:2}.bt-bugun-sira-devami{text-align:left}}

.bt-metric{background:var(--panel);border:1px solid var(--line-soft);border-radius:16px;padding:22px;box-shadow:0 7px 20px #14160f08}
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

/* Öneriler, uygulamanın açık yüzey hiyerarşisine bağlı kalır. */
.bt-oneriler{background:var(--panel);color:var(--text);border:1px solid var(--line-soft);border-left:6px solid ${LIME};border-radius:22px;padding:clamp(20px,4vw,30px);box-shadow:0 12px 30px #14160f0a;margin:4px 0 30px;overflow:hidden}
.bt-oneriler-head{align-items:center;margin-bottom:20px}.bt-oneriler h2{color:var(--text);font-size:clamp(24px,3.2vw,31px)}.bt-oneriler-head p{color:var(--dim);max-width:580px;font-size:12.5px}
.bt-oneri-hedef-label{color:var(--dim)}.bt-oneri-mod{background:var(--panel2);border:1px solid var(--line-soft);border-radius:14px}.bt-oneri-mod button{color:var(--dim)}.bt-oneri-mod button.aktif{background:${LIME};color:${INK};box-shadow:none}
.bt-oneri-sahne{height:auto;min-height:270px;grid-template-columns:minmax(0,1fr) 150px;gap:24px;padding:clamp(22px,4vw,32px);background:var(--panel2)!important;color:var(--text);border:1px solid var(--line-soft);border-left:6px solid #ffcf6e;border-radius:18px;box-shadow:none}.bt-oneri-sahne.acil{border-left-color:${CORAL}}.bt-oneri-sahne.firsat{border-left-color:${LIME}}.bt-oneri-deko{display:none}.bt-oneri-sahne-ust{margin-bottom:18px}.bt-oneri-canli i{background:${CORAL};box-shadow:none;animation:none}.bt-oneri-sayac{border:1px solid var(--line-soft);background:var(--panel);color:var(--dim)}.bt-oneri-sahne h3{color:var(--text);font-size:clamp(24px,3.5vw,31px)}.bt-oneri-sahne p{color:var(--dim)}.bt-oneri-etki{border:1px solid var(--line-soft);background:var(--panel)}.bt-oneri-aksiyon{background:${LIME};color:${INK};border:1.5px solid ${INK};box-shadow:none}.bt-oneri-sahne.acil .bt-oneri-aksiyon{box-shadow:none}
.bt-oneri-pusula{aspect-ratio:auto;min-height:150px;border-radius:18px;background:var(--panel);color:var(--text);border:1px solid var(--line-soft);box-shadow:none;transform:none}.bt-oneri-pusula:before,.bt-oneri-pusula:after,.bt-oneri-yildiz{display:none}.bt-oneri-pusula-ikon{color:${CORAL}}.bt-oneri-pusula small{color:var(--dim)}.bt-oneri-pusula strong{color:var(--text)}.bt-oneri-pusula span{color:var(--faint)}
.bt-oneri-diger{margin-top:20px}.bt-oneri-diger-baslik-ikon{border:1px solid var(--line-soft)}.bt-oneri-diger-sayac{border-color:var(--line-soft);color:var(--dim)}.bt-oneri-diger-baslik small{color:var(--faint)}.bt-oneri-kartlar{gap:9px}.bt-oneri-kart{height:150px;min-height:150px;background:var(--panel2);border:1px solid var(--line-soft);box-shadow:none!important}.bt-oneri-kart:hover{background:color-mix(in srgb,${LIME} 12%,var(--panel2))}.bt-oneri-kart.aktif{background:color-mix(in srgb,${LIME} 22%,var(--panel));box-shadow:inset 4px 0 0 ${LIME}!important}.bt-oneri-kart-ikon{border:1px solid var(--line-soft)}.bt-oneriler-alt{color:var(--faint)}.bt-oneriler-alt .bt-link{color:#5d7a2e}
@media(max-width:760px){.bt-oneriler{padding:18px 14px;border-left-width:4px;box-shadow:none}.bt-oneri-sahne{grid-template-columns:1fr;min-height:0;padding:20px 16px}.bt-oneri-pusula{min-height:0;padding:15px;display:grid;grid-template-columns:auto 1fr;gap:3px 10px;text-align:left}.bt-oneri-pusula-ikon{grid-row:1/4;height:auto;margin:0}.bt-oneri-pusula span{max-width:none}.bt-oneri-diger-baslik{padding:0;background:none;border:0}.bt-oneri-diger-baslik small{padding-left:0}.bt-oneri-kart{height:108px;min-height:108px}.bt-onemli-panel{padding:15px}.bt-onemli-panel h3{font-size:12.5px}.bt-onemli-satir{grid-template-columns:34px minmax(0,1fr) auto;gap:9px}.bt-onemli-ikon{width:34px;height:34px}}

.bt-banka-row+.bt-banka-row{margin-top:18px}
.bt-banka-top{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:8px;font-size:14px;font-weight:600;color:var(--text)}
.bt-banka-bar{height:10px;border-radius:6px;background:var(--panel2);border:1px solid var(--line-soft);overflow:hidden}
.bt-banka-bar div{height:100%;background:${LIME}}

.bt-hero2{background:var(--summary-soft);border:1px solid var(--line-soft);border-radius:20px;padding:clamp(18px,4vw,30px)}
.bt-bugun-aksiyon{min-width:0;display:grid;grid-template-columns:42px minmax(0,1fr);grid-template-areas:"ikon icerik" "ikon aksiyon";column-gap:13px;row-gap:13px;align-content:center;padding:18px;border:1px solid var(--line-soft);border-left:5px solid ${LIME};border-radius:18px;background:var(--panel);box-shadow:0 10px 24px #14160f0a}.bt-bugun-aksiyon.acil{border-left-color:${CORAL};background:color-mix(in srgb,${CORAL} 7%,var(--panel))}.bt-bugun-aksiyon-ikon{grid-area:ikon;display:grid;place-items:center;width:42px;height:42px;border-radius:12px;background:${LIME};color:${INK}}.bt-bugun-aksiyon.acil .bt-bugun-aksiyon-ikon{background:${CORAL}}.bt-bugun-aksiyon-icerik{grid-area:icerik;min-width:0;align-self:center}.bt-bugun-aksiyon h3{margin:0;color:var(--text);font:800 clamp(20px,2.5vw,25px)/1.08 'Space Grotesk',sans-serif}.bt-bugun-aksiyon p{margin:7px 0 0;color:var(--dim);font-size:12px;line-height:1.45}.bt-bugun-aksiyon p b{color:var(--text)}.bt-bugun-aksiyon .bt-btn{grid-area:aksiyon;justify-self:start;min-height:40px}
.bt-bugun-odemeler{background:var(--summary-soft);border:1px solid var(--line-soft);border-radius:20px;padding:clamp(18px,4vw,26px)}.bt-bugun-bolum-head{display:flex;align-items:end;justify-content:space-between;gap:16px;margin-bottom:14px}.bt-bugun-bolum-head h2{margin:0;color:var(--text);font:800 clamp(20px,3vw,25px)/1.1 'Space Grotesk',sans-serif}.bt-bugun-bolum-head p{margin:5px 0 0;color:var(--dim);font-size:11.5px}.bt-bugun-bolum-head .bt-link{white-space:nowrap}.bt-bugun-odeme-listesi{display:grid;gap:8px}.bt-bugun-odeme{display:grid;grid-template-columns:42px minmax(0,1fr) auto;gap:12px;align-items:center;padding:12px 14px;border:1px solid var(--line-soft);border-radius:14px;background:var(--panel)}.bt-bugun-odeme-ikon{display:grid;place-items:center;width:42px;height:42px;border-radius:12px;background:${LIME};color:${INK};font:800 11px 'JetBrains Mono',monospace}.bt-bugun-odeme.gecikmis .bt-bugun-odeme-ikon{background:${CORAL}}.bt-bugun-odeme strong{display:block;color:var(--text);font-size:13.5px;line-height:1.25}.bt-bugun-odeme small{display:block;margin-top:3px;color:var(--dim);font-size:11px}.bt-bugun-odeme.gecikmis small{color:${CORAL};font-weight:750}.bt-bugun-odeme-tutar{text-align:right}.bt-bugun-odeme-tutar b{display:block;color:var(--text);font:750 14px 'JetBrains Mono',monospace}.bt-bugun-odeme-tutar span{display:block;margin-top:3px;color:var(--dim);font-size:10px}.bt-bugun-odeme-bos{padding:20px;border:1px dashed var(--line-soft);border-radius:14px;background:var(--panel);color:var(--dim);font-size:12px;text-align:center}
.bt-bugun-icgoru{display:grid;grid-template-columns:40px minmax(0,1fr) auto;gap:13px;align-items:center;padding:15px 17px;border:1px solid var(--line-soft);border-left:5px solid ${LIME};border-radius:17px;background:var(--panel);color:var(--text);text-align:left;font-family:inherit;cursor:pointer;box-shadow:0 7px 20px #14160f08}.bt-bugun-icgoru:hover{background:color-mix(in srgb,${LIME} 8%,var(--panel))}.bt-bugun-icgoru>span:first-child{display:grid;place-items:center;width:40px;height:40px;border-radius:12px;background:color-mix(in srgb,${LIME} 45%,var(--panel2));color:${INK}}.bt-bugun-icgoru strong{display:block;font-size:13.5px}.bt-bugun-icgoru small{display:block;margin-top:3px;color:var(--dim);font-size:11px;line-height:1.4}
.bt-bugun-icgoruler{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:10px}.bt-pro-senaryo{position:relative;overflow:hidden;padding:clamp(20px,4vw,30px);border:1px solid color-mix(in srgb,${LIME} 55%,var(--line-soft));border-radius:22px;background:linear-gradient(135deg,#173c30 0%,#0b2d25 68%,#12382e 100%);color:#f8f5e8;box-shadow:7px 7px 0 color-mix(in srgb,${CORAL} 78%,transparent)}.bt-pro-senaryo:after{content:"";position:absolute;right:-45px;top:-55px;width:145px;height:145px;border-radius:50%;background:color-mix(in srgb,${LIME} 76%,transparent);opacity:.88}.bt-pro-senaryo-ust{position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:20px;color:#dbe7d9;font-size:11px;font-weight:750}.bt-pro-senaryo-rozet{display:inline-flex;align-items:center;gap:7px;padding:7px 10px;border:1px solid color-mix(in srgb,${LIME} 75%,transparent);border-radius:999px;background:#0b241e;color:${LIME};font-weight:850}.bt-pro-senaryo-ana{position:relative;z-index:1;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:24px;align-items:end}.bt-pro-senaryo h2{max-width:720px;margin:0;color:#fffaf0;font:800 clamp(25px,4vw,36px)/1.04 'Space Grotesk',sans-serif}.bt-pro-senaryo p{max-width:760px;margin:10px 0 0;color:#c7d1ca;font-size:12.5px;line-height:1.55}.bt-pro-senaryo .bt-btn{white-space:nowrap}.bt-pro-senaryo-metrikler{position:relative;z-index:1;display:grid;grid-template-columns:repeat(3,1fr);gap:1px;margin-top:24px;overflow:hidden;border:1px solid #ffffff26;border-radius:15px;background:#ffffff26}.bt-pro-senaryo-metrikler>div{padding:15px 17px;background:#0d2b24}.bt-pro-senaryo-metrikler span{display:block;color:#aebdb5;font-size:10.5px;line-height:1.35}.bt-pro-senaryo-metrikler strong{display:block;margin-top:6px;color:#fffaf0;font:750 clamp(15px,2.4vw,19px) 'JetBrains Mono',monospace}.bt-pro-senaryo .bt-pro-senaryo-not{position:relative;z-index:1;margin:12px 0 0;padding:10px 12px;border:1px solid #ffffff20;border-radius:11px;background:#ffffff0d;color:#e6ece7}.bt-pro-senaryo.kilitli{background:linear-gradient(135deg,#173c30,#12382e)}
.bt-plan-senaryo{padding:clamp(18px,3vw,26px);border:1px solid color-mix(in srgb,${LIME} 55%,var(--line-soft));border-radius:20px;background:linear-gradient(135deg,color-mix(in srgb,${LIME} 13%,#fff),#fff 58%,color-mix(in srgb,${CORAL} 8%,#fff));box-shadow:0 15px 34px #2534260d}.bt-plan-senaryo.oncelikli{display:flex;flex-direction:column}.bt-plan-senaryo.oncelikli>.bt-plan-senaryo-ust{order:1}.bt-plan-senaryo.oncelikli>.bt-plan-karar{order:2}.bt-plan-senaryo.oncelikli>.bt-plan-cozum{order:3}.bt-plan-senaryo.oncelikli>.bt-plan-detay{order:4}.bt-plan-senaryo-ust{display:flex;align-items:flex-start;justify-content:space-between;gap:24px}.bt-plan-senaryo-kicker{display:block;margin-bottom:7px;color:#5d7a2e;font:800 10.5px 'JetBrains Mono',monospace;letter-spacing:.08em}.bt-plan-senaryo-ust h2{margin:0;font:800 clamp(22px,3vw,30px)/1.12 'Space Grotesk',sans-serif}.bt-plan-senaryo-ust p{max-width:720px;margin:8px 0 0;color:var(--dim);font-size:13px;line-height:1.55}.bt-plan-senaryo-durum{flex:0 0 auto;padding:8px 11px;border:1px solid color-mix(in srgb,${LIME} 80%,var(--line-soft));border-radius:999px;background:color-mix(in srgb,${LIME} 24%,#fff);font-weight:850;font-size:12px}.bt-plan-senaryo-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:20px}.bt-plan-senaryo-grid>div{min-height:86px;padding:14px;border:1px solid var(--line-soft);border-radius:14px;background:#fff}.bt-plan-senaryo-grid span{display:block;color:var(--dim);font-size:11px;line-height:1.35}.bt-plan-senaryo-grid strong{display:block;margin-top:7px;font:750 15px/1.35 'JetBrains Mono',monospace}.bt-plan-senaryo-grid small{display:block;margin-top:6px;color:var(--dim);font-size:10.5px;line-height:1.4}.bt-plan-senaryo-not{display:grid;grid-template-columns:auto minmax(0,1fr);gap:12px;margin-top:12px;padding:13px 14px;border-radius:13px;background:color-mix(in srgb,var(--panel2) 72%,#fff);font-size:12px;line-height:1.5}.bt-plan-senaryo-not span{color:var(--dim)}.bt-plan-karar{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(180px,.65fr);gap:12px;margin-top:18px}.bt-plan-karar-ana,.bt-plan-karar-yan{padding:20px;border-radius:16px}.bt-plan-karar-ana{background:${INK};color:#fff;box-shadow:5px 5px 0 ${CORAL}}.bt-plan-karar-ana span,.bt-plan-karar-yan span{display:block;font-size:11px;font-weight:750}.bt-plan-karar-ana strong{display:block;margin-top:7px;color:${LIME};font:800 clamp(30px,5vw,46px)/1 'Archivo Black',sans-serif}.bt-plan-karar-ana small{display:block;margin-top:9px;color:#ffffffc2;line-height:1.45}.bt-plan-karar-yan{border:1px solid color-mix(in srgb,${LIME} 65%,var(--line-soft));background:color-mix(in srgb,${LIME} 18%,#fff)}.bt-plan-karar-yan strong{display:block;margin-top:7px;font:800 22px/1.15 'JetBrains Mono',monospace}.bt-plan-detay{margin-top:12px;border:1px solid var(--line-soft);border-radius:14px;background:#fff}.bt-plan-detay>summary{cursor:pointer;padding:14px 16px;font-weight:850;list-style:none}.bt-plan-detay>summary::-webkit-details-marker{display:none}.bt-plan-detay>summary:after{content:'+';float:right;font-size:20px;line-height:1}.bt-plan-detay[open]>summary:after{content:'−'}.bt-plan-detay .bt-plan-senaryo-grid{margin:0;padding:0 12px 12px}.bt-plan-detay .bt-plan-senaryo-not{margin:0 12px 12px}.bt-plan-cozum{margin-top:14px;padding:18px;border:1px solid color-mix(in srgb,${LIME} 68%,var(--line-soft));border-left:5px solid ${LIME};border-radius:16px;background:color-mix(in srgb,${LIME} 12%,#fff)}.bt-plan-cozum h3{margin:0;color:var(--text);font:800 18px/1.2 'Space Grotesk',sans-serif}.bt-plan-cozum p{margin:6px 0 0;color:var(--dim);font-size:12px;line-height:1.5}.bt-plan-cozum-adimlar{display:grid;gap:8px;margin:14px 0 0;padding:0;list-style:none}.bt-plan-cozum-adimlar li{display:grid;grid-template-columns:26px minmax(0,1fr);gap:10px;align-items:start;padding:11px 12px;border:1px solid var(--line-soft);border-radius:12px;background:#fff;color:var(--text);font-size:12px;line-height:1.5}.bt-plan-cozum-adimlar b{display:grid;place-items:center;width:26px;height:26px;border-radius:50%;background:${INK};color:${LIME};font:800 11px 'JetBrains Mono',monospace}.bt-plan-cozum-adimlar strong{font-weight:850}.bt-plan-cozum-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}.bt-plan-senaryo-actions{display:flex;justify-content:flex-end;margin-top:14px}
.bt-plan-giris{display:grid;gap:22px;padding:clamp(20px,4vw,32px);border:1px solid var(--line-soft);border-radius:22px;background:linear-gradient(145deg,var(--summary-bg),color-mix(in srgb,${LIME} 9%,var(--panel)));box-shadow:0 14px 34px #14160f0b}.bt-plan-giris-ust{display:flex;align-items:center;justify-content:space-between;gap:12px;color:var(--dim);font-size:11px}.bt-plan-giris-ust .bt-link{display:inline-flex;align-items:center;gap:5px;color:var(--text);font-weight:800}.bt-plan-giris-ana{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(230px,.65fr);gap:24px;align-items:end}.bt-plan-giris h1{max-width:720px;margin:0;color:var(--text);font:800 clamp(29px,5vw,44px)/1.02 'Space Grotesk',sans-serif}.bt-plan-giris p{max-width:700px;margin:12px 0 0;color:var(--dim);font-size:13px;line-height:1.55}.bt-plan-faiz-ozeti{padding:17px;border:1px solid color-mix(in srgb,${CORAL} 50%,var(--line-soft));border-radius:16px;background:color-mix(in srgb,${CORAL} 8%,var(--panel))}.bt-plan-faiz-ozeti span,.bt-plan-faiz-ozeti small{display:block;color:var(--dim);font-size:10.5px}.bt-plan-faiz-ozeti strong{display:block;margin:7px 0 5px;color:var(--text);font:800 clamp(22px,4vw,31px) 'JetBrains Mono',monospace}.bt-plan-faiz-kirilim{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.bt-plan-gecikme{padding:12px 14px;border-left:4px solid ${CORAL};border-radius:12px;background:color-mix(in srgb,${CORAL} 9%,var(--panel));color:var(--text);font-size:12px;font-weight:750}.bt-borc-donem-satiri{display:flex;align-items:center;justify-content:space-between;gap:14px;margin:-5px 0 20px;padding:12px 14px;border:1px solid var(--line-soft);border-radius:14px;background:var(--panel2)}.bt-borc-donem-satiri>div{min-width:0}.bt-borc-donem-satiri strong{display:block;color:var(--text);font-size:13px}.bt-borc-donem-satiri span{display:block;margin-top:3px;color:var(--dim);font-size:10.5px}.bt-borc-donem-satiri .bt-input{width:min(240px,100%);margin:0}
.bt-plan-kisayol{display:grid;grid-template-columns:42px minmax(0,1fr) auto;align-items:center;gap:13px;padding:14px 16px;border:1px solid color-mix(in srgb,${LIME} 64%,var(--line-soft));border-radius:17px;background:linear-gradient(110deg,color-mix(in srgb,${LIME} 16%,var(--panel)),var(--panel) 58%,color-mix(in srgb,${CORAL} 7%,var(--panel)));box-shadow:0 9px 25px #14160f0a}.bt-plan-kisayol-ikon{display:grid;place-items:center;width:42px;height:42px;border-radius:13px;background:${INK};color:${LIME};box-shadow:3px 3px 0 color-mix(in srgb,${CORAL} 75%,transparent)}.bt-plan-kisayol-metin{min-width:0}.bt-plan-kisayol-metin strong{display:block;color:var(--text);font:800 15px/1.2 'Space Grotesk',sans-serif}.bt-plan-kisayol-metin span{display:block;margin-top:4px;color:var(--dim);font-size:11px;line-height:1.4}.bt-plan-kisayol .bt-btn{white-space:nowrap}
.bt-bugun-bos{display:grid;justify-items:start;gap:14px;padding:clamp(26px,6vw,54px);border:1px solid var(--line-soft);border-radius:24px;background:var(--summary-bg);box-shadow:0 14px 34px #14160f0d}.bt-bugun-bos-ikon{display:grid;place-items:center;width:54px;height:54px;border-radius:16px;background:${LIME};color:${INK};box-shadow:4px 4px 0 ${CORAL}}.bt-bugun-bos h1{max-width:650px;margin:4px 0 0;color:var(--text);font:800 clamp(29px,6vw,48px)/1.02 'Space Grotesk',sans-serif}.bt-bugun-bos p{max-width:580px;margin:0;color:var(--dim);font-size:14px;line-height:1.55}.bt-bugun-bos>p{font-size:16px;line-height:1.5}.bt-bugun-bos .bt-btn{min-height:46px}
.bt-aktivasyon{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:24px;align-items:center;padding:20px 22px;border:1px solid color-mix(in srgb,${LIME} 58%,var(--line-soft));border-radius:20px;background:linear-gradient(110deg,color-mix(in srgb,${LIME} 13%,var(--panel)),var(--panel));box-shadow:0 10px 28px #14160f0a}.bt-aktivasyon-kopya{min-width:0}.bt-aktivasyon-sayac{display:block;margin-bottom:7px;color:#5d7a2e;font:800 12px 'JetBrains Mono',monospace}.bt-aktivasyon h2{margin:0;color:var(--text);font:800 clamp(21px,3vw,26px)/1.12 'Space Grotesk',sans-serif}.bt-aktivasyon p{margin:7px 0 0;color:var(--dim);font-size:13.5px;line-height:1.45}.bt-aktivasyon-ilerleme{display:grid;grid-template-columns:repeat(3,minmax(34px,1fr));gap:7px;max-width:360px;margin-top:16px}.bt-aktivasyon-ilerleme span{height:7px;border:1px solid var(--line-soft);border-radius:999px;background:var(--panel)}.bt-aktivasyon-ilerleme span.tamam{border-color:color-mix(in srgb,${LIME} 74%,var(--line-soft));background:${LIME}}.bt-aktivasyon-ilerleme span.sirada{border-color:color-mix(in srgb,${CORAL} 70%,var(--line-soft));background:color-mix(in srgb,${CORAL} 38%,var(--panel))}.bt-aktivasyon-aksiyon{display:grid;justify-items:end}.bt-aktivasyon-aksiyon .bt-btn{min-width:132px;justify-content:center}.bt-bugun-bos .bt-aktivasyon{width:100%;margin-top:5px;background:color-mix(in srgb,var(--panel) 78%,transparent)}.bt-ozet-kisa small{display:block;margin-top:6px;color:var(--summary-muted);font-size:9.5px;line-height:1.35}
@media(max-width:600px){.bt-bugun-aksiyon{grid-template-columns:38px minmax(0,1fr);padding:15px;column-gap:11px}.bt-bugun-aksiyon-ikon{width:38px;height:38px}.bt-bugun-aksiyon p span{display:block;margin-top:2px}.bt-bugun-bolum-head{align-items:flex-start;flex-direction:column;gap:8px}.bt-bugun-odeme{grid-template-columns:38px minmax(0,1fr);padding:11px}.bt-bugun-odeme-ikon{width:38px;height:38px}.bt-bugun-odeme-tutar{grid-column:2;text-align:left;display:flex;align-items:baseline;gap:7px}.bt-bugun-odeme-tutar span{margin:0}.bt-bugun-icgoru{grid-template-columns:38px minmax(0,1fr);padding:13px}.bt-bugun-icgoru>span:first-child{width:38px;height:38px}.bt-bugun-icgoru>svg{display:none}.bt-pro-senaryo{padding:19px 16px;box-shadow:4px 4px 0 color-mix(in srgb,${CORAL} 78%,transparent)}.bt-pro-senaryo-ana{grid-template-columns:1fr;gap:17px;align-items:start}.bt-pro-senaryo-ana .bt-btn{justify-self:start}.bt-pro-senaryo-metrikler{grid-template-columns:1fr;margin-top:18px}.bt-pro-senaryo-metrikler>div{display:flex;justify-content:space-between;align-items:center;gap:14px;padding:12px 14px}.bt-pro-senaryo-metrikler strong{margin:0;font-size:14px}.bt-plan-giris-ana{grid-template-columns:1fr}.bt-plan-giris-ust{align-items:flex-start;flex-direction:column}.bt-borc-donem-satiri{align-items:stretch;flex-direction:column}.bt-borc-donem-satiri .bt-input{width:100%}.bt-bugun-bos{padding:28px 20px}}
@media(max-width:700px){.bt-plan-senaryo-ust{flex-direction:column;gap:14px}.bt-plan-senaryo-grid{grid-template-columns:1fr 1fr}.bt-plan-senaryo-not{grid-template-columns:1fr}.bt-plan-karar{grid-template-columns:1fr}.bt-plan-cozum{padding:15px 13px}.bt-plan-cozum-actions{display:grid;grid-template-columns:1fr}.bt-plan-cozum-actions .bt-btn{width:100%}.bt-plan-senaryo-actions{justify-content:stretch}.bt-plan-senaryo-actions .bt-btn{width:100%}}
@media(max-width:620px){.bt-plan-kisayol{grid-template-columns:38px minmax(0,1fr);padding:13px}.bt-plan-kisayol-ikon{width:38px;height:38px}.bt-plan-kisayol .bt-btn{grid-column:1/-1;width:100%;justify-content:center}}
@media(max-width:700px){.bt-aktivasyon{grid-template-columns:1fr;gap:18px;padding:18px}.bt-aktivasyon-aksiyon,.bt-aktivasyon-aksiyon>.bt-btn{width:100%;justify-self:stretch}.bt-aktivasyon-aksiyon>.bt-btn{justify-content:center}.bt-aktivasyon-aksiyon{justify-items:stretch}.bt-aktivasyon-ilerleme{max-width:none}}
@media(max-width:460px){.bt-plan-senaryo-grid{grid-template-columns:1fr}.bt-plan-senaryo-grid>div{min-height:auto}}
.bt-satirD{display:flex;align-items:center;gap:14px;row-gap:8px;flex-wrap:wrap;padding:14px 16px;border:1px solid var(--line-soft);border-radius:12px;background:var(--panel)}
.bt-satirD-ad{font-size:14px;color:var(--text);font-weight:600}
.bt-satirD-alt{font-size:12.5px;margin-top:2px}
.bt-satirD-tutar{font-family:'JetBrains Mono',monospace;font-size:15px;color:var(--text);font-weight:600}
.bt-satirD-tur{font-size:11.5px;color:#8a8c7e;margin-top:2px}
.bt-kart-odeme-durum{display:inline-flex;align-items:center;gap:5px;margin-top:6px;padding:5px 9px;border:1px solid var(--line-soft);border-radius:999px;background:var(--panel);color:var(--dim);font-size:10px;font-weight:800}.bt-kart-odeme-durum.minimum{color:#4c6818;border-color:#86ad30;background:#f2f9df}.bt-kart-odeme-durum.kismi{color:#8a5700;border-color:#e2a83e;background:#fff5dc}.bt-kart-odeme-durum.tamami{color:#315c47;border-color:#6b9a7f;background:#e9f5ed}
.bt-kart-odeme-secenekler{display:grid;gap:9px;margin:18px 0}.bt-kart-odeme-secimi{width:100%;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center;padding:13px 14px;border:1px solid var(--line-soft);border-radius:14px;background:var(--panel2);color:var(--text);text-align:left;box-shadow:0 4px 14px #14160f08;cursor:pointer;font-family:inherit}.bt-kart-odeme-secimi:hover{background:${LIME};color:${INK}}.bt-kart-odeme-secimi:disabled{cursor:not-allowed;opacity:.45}.bt-kart-odeme-secimi strong{display:block;font-size:13px}.bt-kart-odeme-secimi small{display:block;margin-top:3px;color:var(--dim);font-size:10.5px}.bt-kart-odeme-secimi b{font-family:'JetBrains Mono',monospace;font-size:13px;white-space:nowrap}.bt-kart-odeme-ozet{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px}.bt-kart-odeme-ozet>div{padding:11px;border:1px solid var(--line-soft);border-radius:12px;background:var(--panel2)}.bt-kart-odeme-ozet span{display:block;color:var(--dim);font-size:10px}.bt-kart-odeme-ozet strong{display:block;margin-top:4px;font-family:'JetBrains Mono',monospace;font-size:13px}

.bt-satir{display:flex;align-items:center;gap:16px;row-gap:8px;flex-wrap:wrap;padding:16px;border-radius:14px;background:var(--panel2);border:1px solid var(--line-soft)}
.bt-harcama-kayit{display:grid;gap:8px}
.bt-harcama-inline-edit{margin:0 10px 4px;padding:18px;border:1px solid color-mix(in srgb,${LIME} 62%,var(--line-soft));border-left:5px solid ${LIME};border-radius:15px;background:color-mix(in srgb,${LIME} 8%,var(--panel));box-shadow:0 10px 24px #14160f0a;scroll-margin-top:96px}
.bt-harcama-inline-edit-baslik{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}.bt-harcama-inline-edit-baslik strong{color:var(--text);font:800 15px/1.2 'Space Grotesk',sans-serif}.bt-harcama-inline-edit-baslik span{color:var(--dim);font-size:11px}
.bt-satir.bt-kredi-karti{display:grid;grid-template-columns:auto minmax(260px,1fr) auto;grid-template-areas:"rozet bilgi tutar" "islemler islemler islemler" "editor editor editor";align-items:center;column-gap:16px;row-gap:12px}.bt-kredi-karti>.bt-kart-rozet{grid-area:rozet}.bt-kredi-karti>.bt-kart-bilgi{grid-area:bilgi}.bt-kredi-karti>.bt-kart-tutar{grid-area:tutar;min-width:150px}.bt-kredi-karti>.bt-kart-islemler{grid-area:islemler;justify-content:flex-start!important}.bt-inline-ekstre-hedef{grid-area:editor;width:100%;scroll-margin-top:24px}.bt-inline-ekstre-hedef:empty{display:none}.bt-inline-ekstre-hedef>.bt-form{margin:2px 0 0;background:var(--panel);border:1px solid var(--line-soft);border-radius:14px;box-shadow:0 12px 30px #14160f0d}
.bt-satir-ad{font-size:14.5px;color:var(--text);font-weight:600}
.bt-satir-meta{font-size:12.5px;margin-top:3px;color:var(--dim)}
.bt-satir-tutar{font-family:'JetBrains Mono',monospace;font-size:16px;color:var(--text);font-weight:700}
.bt-kart-tutar>.bt-satirD-tur{display:inline-flex;align-items:center;justify-content:flex-end;gap:4px;margin:3px 0 0 auto;padding:0;border:0;background:transparent;font:800 11.5px 'Space Grotesk',sans-serif;cursor:pointer}.bt-kart-tutar>.bt-satirD-tur:disabled{cursor:default}.bt-kart-odeme-gecmisi-acik{grid-area:editor;margin-top:0}.bt-odeme-gecmisi-baslik{display:grid;gap:3px;margin-bottom:10px}.bt-odeme-gecmisi-baslik strong{font-size:13px}.bt-odeme-gecmisi-baslik span{color:var(--dim);font-size:10.5px}.bt-sabit-gider-ozet{display:grid;grid-template-columns:auto minmax(0,1fr);align-items:center;gap:22px;background:linear-gradient(135deg,color-mix(in srgb,${LIME} 20%,var(--panel)),var(--panel))}.bt-sabit-gider-ozet span{display:block;color:var(--dim);font-size:10.5px;font-weight:750}.bt-sabit-gider-ozet strong{display:block;margin-top:5px;font:800 24px 'JetBrains Mono',monospace}.bt-sabit-gider-ozet p{margin:0;color:var(--dim);font-size:12px;line-height:1.5}
.bt-satir-alt{font-size:11.5px;color:${CORAL};font-weight:700;margin-top:3px}
.bt-kredi-satiri{align-items:flex-start}.bt-kredi-bilgi{flex:1 1 620px!important}.bt-kredi-baslik{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.bt-kredi-durum{display:inline-flex;align-items:center;padding:3px 7px;border-radius:999px;background:color-mix(in srgb,${LIME} 24%,var(--panel));color:#506a24;font-size:9.5px;font-weight:850}.bt-kredi-metrikler{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:7px;margin-top:10px}.bt-kredi-metrik{padding:9px 10px;border:1px solid var(--line-soft);border-radius:10px;background:var(--panel)}.bt-kredi-metrik span{display:block;color:var(--dim);font-size:9.5px;font-weight:700}.bt-kredi-metrik strong{display:block;margin-top:3px;color:var(--text);font-size:11.5px}.bt-kredi-metrik small{display:block;margin-top:3px;color:var(--dim);font-size:8.5px;line-height:1.3}.bt-kredi-kapatma{border-color:color-mix(in srgb,${LIME} 76%,var(--line-soft));background:color-mix(in srgb,${LIME} 15%,var(--panel))}.bt-kredi-kapatma strong{font-family:'JetBrains Mono',monospace;font-size:12.5px}.bt-kredi-ayrim{margin-top:8px;color:var(--dim);font-size:10.5px;line-height:1.45}.bt-kredi-islemler{flex:1 0 100%;justify-content:flex-start!important}.bt-kredi-satiri.bt-kredi-bu-ay-odendi{opacity:1}.bt-kredi-satiri.bt-kredi-bu-ay-odendi .bt-satir-ad,.bt-kredi-satiri.bt-kredi-bu-ay-odendi .bt-satir-tutar{text-decoration:none}
.bt-bar{height:6px;border-radius:4px;background:var(--panel);border:1px solid var(--line-soft);overflow:hidden;margin-top:9px;max-width:220px}
.bt-bar div{height:100%}
.bt-satir-menu{position:relative}.bt-satir-menu>summary{list-style:none}.bt-satir-menu>summary::-webkit-details-marker{display:none}.bt-satir-menu-panel{position:absolute;z-index:12;right:0;bottom:calc(100% + 7px);display:grid;min-width:190px;padding:6px;background:var(--panel);border:2px solid var(--line);border-radius:12px;box-shadow:4px 4px 0 ${CORAL}}.bt-satir-menu-panel button{width:100%;justify-content:flex-start;border:0!important;box-shadow:none!important}.bt-satir-menu-panel button:hover{background:var(--panel2)}
.bt-ekstre-yukle{width:min(1040px,calc(100vw - 40px));max-width:none;max-height:calc(100dvh - 40px);overflow:auto}.bt-privacy-first{display:grid;grid-template-columns:44px minmax(0,1fr);gap:13px;align-items:start;margin-bottom:14px;padding:15px 17px;border:1.5px solid color-mix(in srgb,${LIME} 78%,var(--line));border-radius:15px;background:color-mix(in srgb,${LIME} 16%,var(--panel))}.bt-privacy-first>span:first-child{display:grid;place-items:center;width:44px;height:44px;border-radius:12px;background:${LIME};color:${INK};box-shadow:3px 3px 0 ${CORAL}}.bt-privacy-first strong{display:block;color:var(--text);font-size:14px}.bt-privacy-first p{margin:5px 0 0;color:var(--dim);font-size:11.5px;line-height:1.5}.bt-privacy-first-list{display:flex;gap:7px;flex-wrap:wrap;margin-top:9px}.bt-privacy-first-list span{padding:5px 8px;border:1px solid var(--line-soft);border-radius:999px;background:var(--panel);color:var(--text);font-size:9.5px;font-weight:800}.bt-upload-zone{display:grid;place-items:center;min-height:190px;padding:24px;border:2px dashed var(--line);border-radius:16px;background:var(--panel2);text-align:center;cursor:pointer}.bt-upload-zone:hover{background:color-mix(in srgb,${LIME} 18%,var(--panel2))}.bt-upload-zone input{position:absolute;opacity:0;pointer-events:none}.bt-upload-icon{width:54px;height:54px;display:grid;place-items:center;margin-bottom:12px;border:2px solid var(--line);border-radius:15px;background:${LIME};box-shadow:3px 3px 0 ${CORAL}}.bt-upload-manual{display:flex;justify-content:center;margin-top:10px}.bt-upload-icon+strong{font-size:14px}.bt-upload-progress{height:10px;margin:14px 0 7px;border:2px solid var(--line);border-radius:999px;overflow:hidden;background:var(--panel2)}.bt-upload-progress>div{height:100%;background:${LIME};transition:width .2s}.bt-extract-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;margin-bottom:20px}.bt-confidence{flex:0 0 auto;padding:7px 10px;border:1.5px solid var(--line);border-radius:999px;background:${LIME};color:${INK};font-size:10.5px;font-weight:900}.bt-confidence.hata{background:${CORAL};color:${INK}}.bt-extract-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}.bt-extract-grid label{display:grid;align-content:start;gap:7px;color:var(--dim);font-size:10.5px;font-weight:700}.bt-extract-grid .genis,.bt-extract-grid .yarim{grid-column:span 2}.bt-field-help{color:var(--dim);font-size:10px;font-weight:500;line-height:1.4}.bt-auto-card-match{grid-column:span 2;display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:11px;min-height:68px;padding:11px 13px;border:1px solid color-mix(in srgb,${LIME} 70%,var(--line-soft));border-radius:13px;background:color-mix(in srgb,${LIME} 14%,var(--panel2))}.bt-auto-card-match>span:first-child{display:grid;place-items:center;width:34px;height:34px;border-radius:10px;background:${LIME};color:${INK}}.bt-auto-card-match strong{display:block;color:var(--text);font-size:12px}.bt-auto-card-match small{display:block;margin-top:3px;color:var(--dim);font-size:10.5px;line-height:1.35}.bt-auto-card-match button{border:0;background:transparent;color:var(--text);font:750 10.5px 'Space Grotesk',sans-serif;text-decoration:underline;text-underline-offset:3px;cursor:pointer}.bt-extract-details{margin-top:16px;border:1.5px solid var(--line);border-radius:14px;background:var(--panel2)}.bt-extract-details>summary{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px;list-style:none;cursor:pointer;color:var(--text);font-size:11.5px;font-weight:850}.bt-extract-details>summary::-webkit-details-marker{display:none}.bt-extract-details>summary::after{content:'+';display:grid;place-items:center;width:25px;height:25px;border:1.5px solid var(--line);border-radius:50%;font-size:17px;line-height:1}.bt-extract-details[open]>summary::after{content:'−'}.bt-extract-details .bt-extract-grid{padding:0 14px 14px}.bt-loan-plan-preview{display:grid;gap:7px;padding:0 14px 14px}.bt-loan-plan-preview>div{display:grid;grid-template-columns:1fr auto auto;gap:12px;align-items:center;padding:9px 10px;border:1px solid var(--line-soft);border-radius:10px;background:var(--panel)}.bt-loan-plan-preview span,.bt-loan-plan-preview strong{font-size:11px}.bt-loan-plan-preview small{color:var(--dim);font-size:10px}.bt-loan-plan-preview p{margin:3px 0 0;color:var(--dim);font-size:10px}.bt-extract-warning{display:flex;gap:8px;padding:10px 12px;margin-top:12px;border:1.5px solid ${CORAL};border-radius:12px;background:color-mix(in srgb,${CORAL} 9%,var(--panel));color:var(--text);font-size:11px;line-height:1.45}.bt-extract-warnings{display:grid;grid-template-columns:auto minmax(0,1fr);gap:9px;margin-top:13px;padding:11px 13px;border:1.5px solid ${CORAL};border-radius:12px;background:color-mix(in srgb,${CORAL} 9%,var(--panel));color:var(--text)}.bt-extract-warnings svg{margin-top:2px}.bt-extract-warnings p{margin:0;font-size:10.5px;line-height:1.45}.bt-extract-warnings p+p{margin-top:4px}.bt-privacy-note{display:flex;gap:8px;align-items:flex-start;margin-top:12px;color:var(--dim);font-size:10.5px;line-height:1.45}.bt-ekstre-yukle .bt-form-butonlar .hayalet{margin-left:auto}
.bt-loan-plan-totals{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin-top:15px}.bt-loan-plan-totals>div{padding:12px;border:1px solid var(--line-soft);border-radius:12px;background:var(--panel2)}.bt-loan-plan-totals span{display:block;color:var(--dim);font-size:9.5px;font-weight:750}.bt-loan-plan-totals strong{display:block;margin-top:5px;color:var(--text);font:800 14px 'JetBrains Mono',monospace}.bt-loan-plan-totals small{display:block;margin-top:7px;color:var(--dim);font-size:9px;line-height:1.35}@media(max-width:600px){.bt-loan-plan-totals{grid-template-columns:1fr}.bt-loan-plan-totals>div{display:flex;align-items:center;justify-content:space-between;gap:10px}.bt-loan-plan-totals strong{margin:0}}
.bt-transaction-review>summary>span{display:grid;gap:2px}.bt-transaction-review>summary small{color:var(--dim);font-size:9.5px;font-weight:650}.bt-transaction-list{display:grid;gap:8px;padding:0 14px 14px}.bt-transaction-row{display:grid;grid-template-columns:auto minmax(150px,1fr) minmax(115px,150px) auto;gap:10px;align-items:center;padding:9px 10px;border:1px solid var(--line-soft);border-radius:11px;background:var(--panel)}.bt-transaction-row.disarida{opacity:.48}.bt-transaction-row>input{width:17px;height:17px;accent-color:${LIME}}.bt-transaction-row>div{min-width:0}.bt-transaction-row>div strong{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10.5px}.bt-transaction-row>div small{display:block;margin-top:2px;color:var(--dim);font-size:9px}.bt-transaction-row>.bt-input{min-height:34px;padding:7px 9px;font-size:10px}.bt-transaction-row>strong:last-child{font:850 11px 'Space Mono',monospace;white-space:nowrap}.bt-transaction-coverage{display:flex;gap:8px;flex-wrap:wrap;padding:9px 10px;border-radius:10px;background:color-mix(in srgb,${LIME} 14%,var(--panel2));font-size:9.5px}.bt-transaction-coverage.kontrol{background:color-mix(in srgb,${CORAL} 10%,var(--panel2))}.bt-transaction-note{margin:0;color:var(--dim);font-size:9.5px;line-height:1.45}
.bt-odeme-gecmisi{flex:0 0 100%;width:100%;border-top:1.5px solid var(--line);padding-top:10px;margin-top:4px}
.bt-odeme-gecmisi summary{cursor:pointer;color:${CORAL};font-size:11.5px;font-weight:800;list-style:none;display:flex;align-items:center;gap:6px}
.bt-odeme-gecmisi summary::-webkit-details-marker{display:none}
.bt-odeme-gecmisi summary:before{content:'›';font-size:17px;line-height:1;transition:transform .15s}
.bt-odeme-gecmisi[open] summary:before{transform:rotate(90deg)}
.bt-odeme-liste{display:grid;gap:6px;margin-top:9px}
.bt-odeme-kaydi{display:grid;grid-template-columns:minmax(0,1fr) auto auto;align-items:center;gap:12px;padding:8px 10px 8px 12px;background:var(--panel);border:1.5px solid var(--line);border-radius:10px}
.bt-islem-aciklama{margin:5px 0 16px;color:var(--dim);font-size:12px;line-height:1.45}.bt-islem-listesi{display:grid;gap:9px}.bt-islem-satiri{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:12px 14px;border:1.5px solid var(--line);border-radius:12px;background:var(--panel2)}.bt-islem-satiri>div{min-width:0}.bt-islem-satiri strong{display:block;font-size:13px}.bt-islem-satiri span{display:block;margin-top:3px;color:var(--dim);font-size:11px;line-height:1.4}.bt-islem-satiri .bt-islem-durum{margin:0;color:#5D7A2E;font-weight:800;white-space:nowrap}
.bt-odeme-tarih{font-size:11.5px;color:var(--dim);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bt-odeme-tutar{font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:800;color:var(--text);white-space:nowrap}
.bt-odeme-islemler{display:flex;align-items:center;gap:1px}

.bt-strip{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;padding-bottom:20px;border-bottom:1px solid var(--line-soft);margin-bottom:22px}
.bt-strip-count{font-size:13px;font-weight:600;color:var(--dim)}
.bt-strip-total-block{display:grid;justify-items:end;gap:2px}.bt-strip-total-label{color:var(--dim);font-size:9.5px;font-weight:800;letter-spacing:.04em;text-transform:uppercase}.bt-strip-total{font-family:'Archivo Black',sans-serif;font-size:clamp(19px,4vw,24px);color:var(--text)}
.bt-kapatilan-krediler{display:grid;gap:12px;margin-top:28px;padding-top:22px;border-top:1px solid var(--line-soft)}.bt-kapatilan-krediler-baslik{display:flex;align-items:center;gap:10px}.bt-kapatilan-krediler-baslik>span{display:grid;place-items:center;width:34px;height:34px;border-radius:11px;background:${LIME};color:${INK}}.bt-kapatilan-krediler-baslik strong{display:block;color:var(--text);font-size:15px}.bt-kapatilan-krediler-baslik small{display:block;margin-top:2px;color:var(--dim);font-size:10.5px}.bt-kapatilan-kredi{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:13px;padding:14px;border:1px solid color-mix(in srgb,${LIME} 55%,var(--line-soft));border-radius:14px;background:color-mix(in srgb,${LIME} 9%,var(--panel2))}.bt-kapatilan-kredi strong{display:block;font-size:13.5px}.bt-kapatilan-kredi small{display:block;margin-top:3px;color:var(--dim);font-size:10.5px}.bt-kapatilan-kredi-durum{display:inline-flex;align-items:center;gap:5px;padding:6px 9px;border-radius:999px;background:${LIME};color:${INK};font-size:10px;font-weight:850;white-space:nowrap}
.bt-kutlama-arka{background:radial-gradient(circle at 50% 38%,#cdf56436,transparent 34%),#0f110ad9}.bt-kutlama{position:relative;max-width:480px;overflow:hidden;text-align:center;padding:34px 30px 30px!important;background:linear-gradient(145deg,color-mix(in srgb,${LIME} 22%,var(--panel)),var(--panel) 62%);box-shadow:9px 9px 0 ${CORAL}!important}.bt-kutlama-ikon{position:relative;z-index:2;display:grid;place-items:center;width:78px;height:78px;margin:0 auto 18px;border:2px solid ${INK};border-radius:24px;background:${LIME};color:${INK};box-shadow:5px 5px 0 ${CORAL};transform:rotate(-3deg);animation:bt-kutlama-giris .48s cubic-bezier(.2,.85,.3,1.25)}.bt-kutlama h2{position:relative;z-index:2;margin:0;font-family:'Archivo Black',sans-serif;font-size:clamp(27px,6vw,40px);line-height:1.02;color:var(--text)}.bt-kutlama p{position:relative;z-index:2;margin:13px auto 0;max-width:360px;color:var(--dim);font-size:13.5px;line-height:1.55}.bt-kutlama p strong{color:var(--text)}.bt-kutlama-actions{position:relative;z-index:2;display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-top:24px}.bt-konfeti{position:absolute;inset:0;pointer-events:none}.bt-konfeti i{position:absolute;width:10px;height:20px;border:2px solid ${INK};border-radius:3px;animation:bt-konfeti-dus 1.7s ease-out both}.bt-konfeti i:nth-child(1){left:8%;top:-24px;background:${CORAL};transform:rotate(18deg);animation-delay:.05s}.bt-konfeti i:nth-child(2){left:22%;top:-24px;background:${LIME};transform:rotate(-23deg);animation-delay:.22s}.bt-konfeti i:nth-child(3){left:42%;top:-24px;background:#8fd7d1;transform:rotate(31deg);animation-delay:.12s}.bt-konfeti i:nth-child(4){left:61%;top:-24px;background:#ffcf6e;transform:rotate(-15deg);animation-delay:.3s}.bt-konfeti i:nth-child(5){left:78%;top:-24px;background:${CORAL};transform:rotate(26deg);animation-delay:.16s}.bt-konfeti i:nth-child(6){left:91%;top:-24px;background:${LIME};transform:rotate(-28deg);animation-delay:.36s}@keyframes bt-kutlama-giris{from{opacity:0;transform:scale(.55) rotate(-12deg)}to{opacity:1;transform:scale(1) rotate(-3deg)}}@keyframes bt-konfeti-dus{0%{opacity:0;translate:0 -20px}15%{opacity:1}100%{opacity:0;translate:12px 420px;rotate:280deg}}
.bt-kart-ust{display:grid;grid-template-columns:minmax(270px,.9fr) minmax(390px,1.1fr);align-items:stretch;gap:14px;margin-bottom:22px}.bt-kart-ust-ozet{position:relative;display:grid;align-content:space-between;gap:15px;min-width:0;min-height:138px;padding:17px 18px;overflow:hidden;border:1px solid color-mix(in srgb,${LIME} 58%,var(--line-soft));border-radius:18px;background:linear-gradient(135deg,color-mix(in srgb,${LIME} 25%,var(--panel)),color-mix(in srgb,#b9d9d0 35%,var(--panel)));box-shadow:0 10px 25px #14160f0a}.bt-kart-ust-ozet:after{content:"";position:absolute;right:-22px;top:-28px;width:86px;height:86px;border-radius:50%;background:color-mix(in srgb,${CORAL} 82%,transparent);opacity:.78}.bt-kart-ust-baslik{position:relative;z-index:1;display:flex;align-items:center;gap:10px}.bt-kart-ust-ikon{display:grid;place-items:center;width:34px;height:34px;flex:0 0 34px;border-radius:11px;background:${LIME};color:${INK};box-shadow:2px 2px 0 color-mix(in srgb,${CORAL} 76%,transparent)}.bt-kart-ust-baslik>div{display:grid;justify-items:start;gap:4px}.bt-kart-ust-baslik strong{color:var(--text);font-size:15px}.bt-kart-ust-baslik span{display:inline-flex;padding:3px 7px;border-radius:999px;background:color-mix(in srgb,var(--panel) 72%,transparent);color:var(--dim);font-size:10px;font-weight:700}.bt-kart-borc{position:relative;z-index:1;text-align:left}.bt-kart-borc span{display:block;margin-bottom:5px;color:var(--dim);font-size:10.5px;font-weight:700}.bt-kart-borc strong{display:block;color:var(--text);font:800 clamp(23px,3.2vw,29px) 'Archivo Black',sans-serif}.bt-kart-ust-islemler{display:grid;grid-template-rows:auto 1fr auto;align-content:stretch;gap:12px;padding:17px 18px;border:1px solid color-mix(in srgb,${CORAL} 24%,var(--line-soft));border-radius:18px;background:linear-gradient(135deg,color-mix(in srgb,${CORAL} 7%,var(--panel)),var(--panel));box-shadow:0 10px 25px #14160f08}.bt-kart-islem-baslik{display:grid;gap:2px}.bt-kart-islem-baslik strong{color:var(--text);font-size:14px}.bt-kart-islem-baslik span{color:var(--dim);font-size:10.5px}.bt-kart-ust-ana,.bt-kart-ust-araclar{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));align-items:stretch;gap:8px;width:100%}.bt-kart-ust-ana .bt-btn{width:100%;min-height:39px;justify-content:center}.bt-kart-ust-araclar{padding-top:9px;border-top:1px solid var(--line-soft)}.bt-kart-ust-araclar .bt-btn{width:100%;justify-content:center;padding:7px 10px;border:1px solid var(--line-soft);background:color-mix(in srgb,var(--panel2) 72%,transparent);font-size:11px;color:var(--dim)}.bt-kart-ust-araclar .bt-btn:hover{color:var(--text);background:var(--panel2)}
.bt-kart-ust-ana.tek{grid-template-columns:1fr}.bt-kart-ekle{margin-top:10px;position:relative;z-index:1}.bt-kart-bos-metin{max-width:235px;font-size:12px!important;line-height:1.45}.bt-arac-bos{display:grid;justify-items:start;gap:8px;padding:24px;border:1px dashed var(--line-soft);border-radius:16px;background:var(--panel2)}.bt-arac-bos h3{margin:0;color:var(--text);font:800 19px/1.2 'Space Grotesk',sans-serif}.bt-arac-bos p{margin:0;color:var(--dim);font-size:12.5px;line-height:1.5}.bt-arac-bos-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:5px}
.bt-odeme-ozet{padding:16px;border:1px solid var(--line-soft);border-radius:14px;background:var(--panel2);margin-bottom:20px}
.bt-odeme-ozet-kapali{margin-bottom:20px}
.bt-odeme-onizleme{width:100%;display:grid;gap:11px;padding:14px 16px;border:1px solid var(--line-soft);border-radius:15px;background:linear-gradient(110deg,color-mix(in srgb,${LIME} 9%,var(--panel)),var(--panel));color:var(--text);font-family:inherit;text-align:left;cursor:pointer;box-shadow:0 7px 20px #14160f08;transition:background .15s,transform .15s}.bt-odeme-onizleme:hover{background:color-mix(in srgb,${LIME} 13%,var(--panel));transform:translateY(-1px)}.bt-odeme-onizleme-ust{display:grid;grid-template-columns:36px minmax(0,1fr) auto;align-items:center;gap:11px}.bt-odeme-onizleme-ikon{display:grid;place-items:center;width:36px;height:36px;border-radius:11px;background:color-mix(in srgb,${LIME} 56%,var(--panel));color:${INK}}.bt-odeme-onizleme-metin strong{display:block;font-size:13.5px}.bt-odeme-onizleme-metin small{display:block;margin-top:3px;color:var(--dim);font-size:10.5px}.bt-odeme-onizleme-son{display:flex;align-items:center;gap:12px}.bt-odeme-onizleme-son strong{font:800 20px 'JetBrains Mono',monospace;color:#5d7a2e}.bt-odeme-onizleme-son span{display:inline-flex;align-items:center;gap:4px;color:var(--dim);font-size:10.5px;font-weight:750}.bt-odeme-onizleme .bt-odeme-ilerleme{height:9px;margin:0;background:var(--panel2)}
.bt-odeme-ozet-ust{display:flex;align-items:flex-end;justify-content:space-between;gap:14px;flex-wrap:wrap}
.bt-odeme-ozet-yuzde{font-family:'Archivo Black',sans-serif;font-size:28px;color:${LIME};text-shadow:2px 2px 0 ${INK}}
.bt-odeme-ilerleme{height:14px;border-radius:999px;background:var(--panel);border:1px solid var(--line-soft);overflow:hidden;margin:12px 0}
.bt-odeme-ilerleme>div,.bt-odeme-ilerleme>span{display:block;height:100%;background:linear-gradient(90deg,${CORAL},${LIME});transition:width .25s}
.bt-odeme-ozet-rakamlar{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
.bt-odeme-ozet-rakam{padding:10px 12px;border-radius:10px;background:var(--panel);border:1px solid var(--line-soft)}
@media(max-width:760px){.bt-kart-ust{grid-template-columns:1fr;align-items:stretch;gap:12px}.bt-kart-ust-islemler{justify-items:stretch}}
@media(max-width:600px){.bt-odeme-ozet-rakamlar{grid-template-columns:1fr}.bt-kart-ust-ozet{min-height:116px}.bt-kart-ust-ana{display:grid;grid-template-columns:1fr 1fr;width:100%}.bt-kart-ust-araclar{gap:2px}.bt-odeme-onizleme{padding:13px}.bt-odeme-onizleme-ust{grid-template-columns:34px minmax(0,1fr) auto}.bt-odeme-onizleme-ikon{width:34px;height:34px}.bt-odeme-onizleme-son span{display:none}.bt-odeme-onizleme-son strong{font-size:17px}}
@media(max-width:600px){.bt-kapatilan-kredi{grid-template-columns:auto minmax(0,1fr)}.bt-kapatilan-kredi-durum{grid-column:2;justify-self:start}.bt-kutlama{padding:28px 20px 24px!important}}

.bt-btn{display:inline-flex;align-items:center;gap:6px;border-radius:999px;cursor:pointer;font-weight:700;font-family:'Space Grotesk',sans-serif;
  padding:10px 18px;font-size:13px;border:1px solid transparent;transition:filter .15s,box-shadow .15s}
.bt-btn:hover{filter:brightness(.96)}
.bt-btn.birincil{background:${LIME};color:${INK};border-color:color-mix(in srgb,${INK} 58%,transparent);box-shadow:0 4px 12px #14160f0a}
.bt-btn.ikincil{background:transparent;color:var(--text);border-color:var(--line-soft)}
.bt-btn.ikincil:hover{background:var(--panel2)}
.bt-btn.hayalet{background:transparent;color:var(--dim);border:none;padding:7px;border-radius:10px}
.bt-btn.hayalet:hover{color:var(--text);background:var(--panel2)}
.bt-kart-ust-araclar .bt-btn.hayalet{width:100%;min-height:36px;justify-content:center;padding:7px 10px;border:1px solid color-mix(in srgb,var(--text) 24%,var(--line-soft));border-radius:12px;background:color-mix(in srgb,var(--panel2) 82%,var(--panel));color:var(--text);font-size:11px;box-shadow:0 3px 10px #14160f08}
.bt-kart-ust-araclar .bt-btn.hayalet:hover{border-color:color-mix(in srgb,${LIME} 58%,var(--text));background:color-mix(in srgb,${LIME} 13%,var(--panel2));color:var(--text)}
.bt-btn.tehlike:hover{color:${CORAL}}
.bt-btn.kucuk{padding:6px 13px;font-size:12px}
.bt-btn.heroghost{background:var(--panel);color:var(--text);border-color:var(--line-soft)}
.bt-btn.heroghost:hover{background:var(--panel2)}

.bt-form{background:var(--panel2);border:1px solid var(--line-soft);border-radius:16px;padding:16px;margin-bottom:14px}
.bt-yapilandirma-oranlar{margin-top:16px;padding:12px;min-width:0;border:1px solid var(--line-soft);border-radius:12px;background:var(--panel2)}
.bt-yapilandirma-oranlar>summary{display:list-item;width:auto;height:auto;min-height:24px;cursor:pointer;font-size:14px;font-weight:700;line-height:1.5;color:var(--text);overflow-wrap:normal}
.bt-yapilandirma-oranlar>summary span{font-size:12px;font-weight:400;color:var(--dim)}
.bt-yapilandirma-oranlar>summary:focus-visible{outline:2px solid var(--text);outline-offset:4px;border-radius:4px}
.bt-siradaki{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:0 0 16px;padding:10px 14px;border:2px solid ${INK};border-radius:16px;background:#062d20;color:#f4efe0;box-shadow:6px 6px 0 ${CORAL};animation:bt-rehber-gir .35s ease-out}.bt-siradaki.mezun{background:${LIME};color:${INK}}.bt-siradaki-ikon{display:grid;place-items:center;flex:0 0 auto;width:34px;height:34px;border-radius:11px;background:${LIME};color:${INK}}.bt-siradaki.mezun .bt-siradaki-ikon{background:${INK};color:${LIME}}.bt-siradaki-metin{display:grid;gap:1px;min-width:0;flex:1 1 220px}.bt-siradaki-metin em{justify-self:start;padding:3px 8px;border-radius:999px;background:#ffffff1f;color:${LIME};font-style:normal;font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase}.bt-siradaki.mezun .bt-siradaki-metin em{background:#14160f14;color:${INK}}.bt-siradaki-metin b{font-size:15px;line-height:1.3}.bt-siradaki-metin span{color:#c9d6cf;font-size:13px;line-height:1.4}.bt-siradaki.mezun .bt-siradaki-metin span{color:#2b3b31}.bt-siradaki-aksiyon{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.bt-siradaki-aksiyon .bt-btn{white-space:nowrap;background:${LIME};color:${INK};border-color:${INK}}.bt-siradaki.mezun .bt-siradaki-aksiyon .bt-btn{background:${INK};color:${LIME}}.bt-siradaki-ikincil{border:0;background:none;color:#c9d6cf;font-family:inherit;font-size:13px;font-weight:600;text-decoration:underline;cursor:pointer;padding:6px}.bt-siradaki.mezun .bt-siradaki-ikincil{color:${INK}}.bt-siradaki.canli{animation:bt-rehber-gir .45s cubic-bezier(.22,1,.36,1),bt-rehber-isik 3.2s ease-in-out .5s infinite}@keyframes bt-rehber-isik{0%,100%{box-shadow:6px 6px 0 ${CORAL},0 0 0 0 #cdf56400,0 0 0 0 #cdf56400}50%{box-shadow:6px 6px 0 ${CORAL},0 0 0 3px #cdf5648c,0 0 26px 8px #cdf56459}}.bt-siradaki.canli .bt-siradaki-ikon{animation:bt-rehber-ikon-isik 3.2s ease-in-out .5s infinite}@keyframes bt-rehber-ikon-isik{0%,100%{box-shadow:0 0 0 0 #cdf56400}50%{box-shadow:0 0 14px 4px #cdf564b3}}.bt-siradaki-secenekler{display:flex;flex-wrap:wrap;gap:6px}.bt-siradaki-aksiyon.secim{flex-basis:100%}.bt-siradaki-baglantilar{display:inline-flex;align-items:center;gap:4px}@keyframes bt-rehber-gir{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}@media (prefers-reduced-motion:reduce){.bt-siradaki,.bt-siradaki.canli,.bt-siradaki.canli .bt-siradaki-ikon{animation:none}}@media(max-width:600px){.bt-siradaki{padding:10px 12px;box-shadow:4px 4px 0 ${CORAL}}.bt-siradaki-aksiyon{display:grid;grid-template-columns:1fr;gap:6px}.bt-siradaki-baglantilar{justify-content:space-between}.bt-siradaki-secenekler{display:grid;grid-template-columns:1fr 1fr;width:100%}.bt-siradaki-secenekler .bt-btn{justify-content:center}.bt-siradaki-metin b{font-size:15px}.bt-siradaki-aksiyon{width:100%}.bt-siradaki-aksiyon .bt-btn{justify-content:center}}
.bt-alan-ek{margin-top:12px}.bt-alan-ek>summary{cursor:pointer;font-size:13px;font-weight:700;color:var(--dim);padding:6px 0}.bt-alan-ek[open]>summary{margin-bottom:8px}
.bt-alanlar{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px 16px;align-items:start}
.bt-modal.bt-yapilandirma-modal{max-width:680px;max-height:calc(100dvh - 32px);overflow-y:auto;box-sizing:border-box;min-width:0}.bt-yapilandirma-modal .bt-alanlar{grid-template-columns:repeat(2,minmax(0,1fr))}.bt-yapilandirma-modal .bt-alan{min-width:0}.bt-yapilandirma-modal .bt-input{width:100%;min-width:0;max-width:100%;box-sizing:border-box;font-size:16px}.bt-yapilandirma-modal .bt-ekstre-bilgi{min-width:0;overflow-wrap:anywhere}.bt-yapilandirma-modal .bt-modalbaslik>div{min-width:0}.bt-yapilandirma-modal .bt-ipucu>div{min-width:0;overflow-wrap:anywhere}@media(max-width:600px){.bt-yapilandirma-modal .bt-alanlar{grid-template-columns:minmax(0,1fr)}.bt-yapilandirma-modal .bt-form-butonlar{flex-wrap:wrap}}
.bt-alan{display:grid;grid-template-rows:minmax(38px,auto) 44px;align-content:start;gap:5px;min-width:0;font-size:12px;font-weight:600;color:var(--dim)}
.bt-input{padding:10px 13px;border-radius:10px;border:1.5px solid var(--line-soft);font-size:14px;color:var(--text);
  background:var(--panel);font-family:'Space Grotesk',sans-serif;width:100%;height:44px;min-width:0}
.bt-input:focus{outline:none;border-color:var(--line);box-shadow:0 0 0 3px color-mix(in srgb,${LIME} 48%,transparent)}
.bt-input::placeholder{color:var(--faint)}
.bt-form-butonlar{display:flex;gap:8px;margin-top:14px}
.bt-kaynak-modal{max-width:620px;max-height:calc(100dvh - 40px);overflow-y:auto}.bt-kaynak-modal-aciklama{margin:7px 0 18px;color:var(--dim);font-size:12.5px;line-height:1.5}.bt-kaynak-modal-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px 14px}.bt-kaynak-modal-form .bt-alan{grid-template-rows:auto 44px}.bt-kaynak-modal-form .genis{grid-column:1/-1}.bt-kaynak-modal-actions{grid-column:1/-1;display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:3px}.bt-kaynak-modal-actions .bt-btn{justify-content:center}.bt-kaynak-ekle-hata{grid-column:1/-1;color:${CORAL};font-size:11px;font-weight:700}

.bt-kat{display:flex;align-items:center;gap:12px;margin-bottom:9px}
.bt-kat-ad{width:88px;font-size:13px;font-weight:600;flex-shrink:0}
.bt-kat-bar{flex:1;height:9px;background:var(--panel2);border:1px solid var(--line-soft);border-radius:999px;overflow:hidden}
.bt-kat-bar div{height:100%}
.bt-kat-tutar{width:112px;text-align:right;font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:700;flex-shrink:0}

.bt-ipucu{display:flex;gap:10px;background:var(--panel2);border:1px solid var(--line-soft);border-radius:16px;padding:13px 14px;font-size:13px;color:var(--dim);line-height:1.55}
.bt-ipucu svg{flex-shrink:0;margin-top:1px}
.bt-ipucu b{color:var(--text)}

.bt-secici{display:flex;gap:4px;background:var(--panel2);border:1px solid var(--line-soft);padding:4px;border-radius:999px}
.bt-secici button{display:flex;align-items:center;gap:6px;padding:7px 14px;border:none;border-radius:999px;background:transparent;
  color:var(--dim);font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:13px;cursor:pointer}
.bt-secici button.aktif{background:var(--panel);color:var(--text);box-shadow:inset 0 0 0 2px var(--line)}

.bt-bos{text-align:center;padding:48px 0;color:var(--faint);font-size:14px}
.bt-baslangic-plani{display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,.72fr);gap:26px;align-items:center;padding:26px;border:1px solid var(--line-soft);border-radius:20px;background:var(--panel2);text-align:left;color:var(--text)}
.bt-baslangic-plani h3{margin:0;font-family:'Archivo Black',sans-serif;font-size:clamp(22px,3vw,30px);line-height:1.08}.bt-baslangic-plani>div>p{max-width:600px;margin:9px 0 0;color:var(--dim);font-size:13px;line-height:1.55}.bt-baslangic-adimlar{display:grid;gap:8px;margin-top:20px}.bt-baslangic-adim{display:grid;grid-template-columns:27px minmax(0,1fr);gap:9px;align-items:center;font-size:12.5px;font-weight:700}.bt-baslangic-adim b{display:grid;place-items:center;width:27px;height:27px;border-radius:9px;background:var(--panel);border:1px solid var(--line-soft);font:800 10px 'JetBrains Mono',monospace}.bt-baslangic-aksiyonlar{display:grid;gap:9px;padding:16px;border:1px solid var(--line-soft);border-radius:16px;background:var(--panel)}.bt-baslangic-aksiyonlar .bt-btn{width:100%;justify-content:center}.bt-baslangic-not{color:var(--faint);font-size:10.5px;line-height:1.45;text-align:center}
.bt-baslangic-plani.kisa{grid-template-columns:1fr;margin-top:18px;padding:20px 22px}.bt-baslangic-plani.kisa h3{font-size:20px}.bt-baslangic-plani.kisa>div>p{margin-top:6px;font-size:12px}.bt-baslangic-plani.kisa .bt-baslangic-adimlar{grid-template-columns:1fr;gap:8px;margin-top:14px;max-width:760px}.bt-baslangic-plani.kisa .bt-baslangic-adim{grid-template-columns:30px minmax(0,1fr) auto;align-items:center;padding:10px 11px;border:1px solid var(--line-soft);border-radius:12px;background:var(--panel)}.bt-baslangic-plani.kisa .bt-baslangic-adim>span{display:grid;gap:2px}.bt-baslangic-plani.kisa .bt-baslangic-adim strong{font-size:12.5px}.bt-baslangic-plani.kisa .bt-baslangic-adim small{color:var(--dim);font-size:10.5px;line-height:1.35}.bt-baslangic-plani.kisa .bt-baslangic-adim.tamam{background:color-mix(in srgb,${LIME} 12%,var(--panel));color:var(--dim)}.bt-baslangic-plani.kisa .bt-baslangic-adim.tamam b{background:${LIME};border-color:color-mix(in srgb,${LIME} 75%,var(--line-soft))}.bt-baslangic-plani.kisa .bt-btn{min-width:108px;justify-content:center}
.bt-adim-tamam{display:inline-flex!important;grid-auto-flow:column;align-items:center;gap:5px!important;color:#5d7a2e;font-size:11px;font-weight:850}
@media(max-width:720px){.bt-baslangic-plani{grid-template-columns:1fr;padding:20px 16px;gap:20px}}
@media(max-width:720px){.bt-baslangic-plani.kisa .bt-baslangic-adimlar{grid-template-columns:1fr}}
@media(max-width:560px){.bt-baslangic-plani.kisa .bt-baslangic-adim{grid-template-columns:30px minmax(0,1fr)}.bt-baslangic-plani.kisa .bt-baslangic-adim .bt-btn{grid-column:1/-1;width:100%}}
.bt-link{border:none;background:none;color:${CORAL};font-weight:700;cursor:pointer;font-size:inherit;padding:0;font-family:inherit}
.bt-modal-arka{position:fixed;inset:0;z-index:50;background:#0f110acc;display:flex;align-items:center;justify-content:center;padding:20px}
.bt-modal{width:100%;max-width:420px;background:var(--panel);border:2px solid var(--line);border-radius:20px;padding:24px;box-shadow:8px 8px 0 ${CORAL}}
.bt-baslangic-secim{max-width:540px}.bt-baslangic-secim-aciklama{margin:8px 0 20px;color:var(--dim);font-size:13.5px;line-height:1.5}.bt-baslangic-yontemler{display:grid;grid-template-columns:1fr 1fr;gap:10px}.bt-baslangic-yontem{display:grid;grid-template-columns:40px minmax(0,1fr);gap:12px;align-items:center;padding:16px;border:1px solid var(--line-soft);border-radius:15px;background:var(--panel2);color:var(--text);text-align:left;font-family:inherit;cursor:pointer}.bt-baslangic-yontem:hover{border-color:color-mix(in srgb,${LIME} 74%,var(--line-soft));background:color-mix(in srgb,${LIME} 15%,var(--panel))}.bt-baslangic-yontem>span:first-child{display:grid;place-items:center;width:40px;height:40px;border-radius:12px;background:${LIME};color:${INK}}.bt-baslangic-yontem.manuel>span:first-child{background:color-mix(in srgb,${CORAL} 75%,var(--panel))}.bt-baslangic-yontem strong{display:block;font-size:13.5px}.bt-baslangic-yontem small{display:block;margin-top:3px;color:var(--dim);font-size:10.5px;line-height:1.4}.bt-baslangic-sonra{width:100%;justify-content:center;margin-top:12px}
@media(max-width:520px){.bt-baslangic-yontemler{grid-template-columns:1fr}}
.bt-modal.bt-ekstre-yukle{width:min(980px,calc(100vw - 48px));max-width:none;max-height:calc(100dvh - 48px);padding:clamp(22px,3vw,32px);overflow-y:auto;overscroll-behavior:contain}
.bt-modal.bt-ekstre-arsiv{width:min(820px,calc(100vw - 48px));max-width:none;max-height:calc(100dvh - 48px);overflow-y:auto;overscroll-behavior:contain}
.bt-ekstre-arsiv-aciklama,.bt-ekstre-sil-aciklama{margin:7px 0 0;color:var(--dim);font-size:13px;line-height:1.55;max-width:620px}
.bt-ekstre-arsiv-gizlilik{margin:16px 0;padding:11px 13px;border-radius:12px;background:var(--panel2);color:var(--dim);font-size:12px;line-height:1.45}
.bt-ekstre-arsiv-mesaj{margin-top:14px}.bt-ekstre-arsiv-liste{display:grid;gap:10px}
.bt-ekstre-arsiv-satir{display:grid;grid-template-columns:minmax(0,1fr) minmax(260px,.8fr);align-items:center;gap:18px;padding:16px;border:1px solid var(--line-soft);border-radius:16px;background:var(--panel)}
.bt-ekstre-arsiv-bilgi{display:grid;gap:5px;min-width:0}.bt-ekstre-arsiv-bilgi strong{font-size:15px}.bt-ekstre-arsiv-bilgi span{font-size:14px;font-weight:750}.bt-ekstre-arsiv-bilgi small{color:var(--dim);font-size:11.5px}
.bt-ekstre-arsiv-islemler{display:flex;align-items:flex-end;justify-content:flex-end;gap:8px}.bt-ekstre-arsiv-islemler label{display:grid;gap:5px;min-width:190px}.bt-ekstre-arsiv-islemler label>span{font-size:10.5px;font-weight:750;color:var(--dim)}.bt-ekstre-arsiv-islemler .bt-input{margin:0;padding:9px 11px}
.bt-tehlike-yazi{color:#b43b2a}.bt-tehlike{background:${CORAL}!important}.bt-sil-ikon{width:42px;height:42px;border-radius:12px;background:${CORAL};display:grid;place-items:center;margin-bottom:14px}.bt-ekstre-sil-secenekler{display:grid;gap:9px;margin-top:18px}.bt-ekstre-sil-secenekler .bt-btn{justify-content:center}
.bt-modalbaslik{display:flex;align-items:flex-start;justify-content:space-between;gap:14px}.bt-modalbaslik .bt-h2{margin:0}
.bt-feedback-trigger{position:fixed;right:clamp(14px,3vw,28px);bottom:clamp(14px,3vw,28px);z-index:40;display:inline-flex;align-items:center;gap:7px;padding:11px 16px;border:2px solid ${INK};border-radius:999px;background:${LIME};color:${INK};font:800 12.5px 'Space Grotesk',sans-serif;box-shadow:4px 4px 0 ${CORAL};cursor:pointer}
.bt-feedback-trigger:hover{transform:translateY(-1px)}
.bt-nav-ana .bt-assistant-nav{background:${INK};color:${CREAM};border-color:${INK}}.bt-nav-ana .bt-assistant-nav svg{color:${LIME}}.bt-nav-ana .bt-assistant-nav:hover{transform:translateY(-1px);box-shadow:3px 3px 0 ${CORAL}}.bt-assistant-beta{display:inline-flex;align-items:center;margin-left:5px;padding:2px 5px;border:1px solid currentColor;border-radius:999px;color:${LIME};font:850 8px 'Space Grotesk',sans-serif;letter-spacing:.05em;text-transform:uppercase;vertical-align:middle}
.bt-assistant-modal{max-width:620px;max-height:calc(100dvh - 40px);overflow-y:auto;padding:26px}.bt-assistant-head{display:grid;grid-template-columns:44px minmax(0,1fr) auto;gap:12px;align-items:center;padding-bottom:18px;border-bottom:1px solid var(--line-soft)}.bt-assistant-mark{display:grid;place-items:center;width:44px;height:44px;border-radius:13px;background:${INK};color:${LIME};box-shadow:3px 3px 0 ${CORAL}}.bt-assistant-head h2{margin:0;font-family:'Archivo Black',sans-serif;font-size:21px}.bt-assistant-head p{margin:4px 0 0;color:var(--dim);font-size:12px}.bt-assistant-head .bt-assistant-beta{color:var(--dim);font-family:'Space Grotesk',sans-serif}.bt-assistant-close{display:grid;place-items:center;width:36px;height:36px;border:1px solid var(--line-soft);border-radius:50%;background:var(--panel2);color:var(--text);cursor:pointer}.bt-assistant-section-label{display:block;margin:0 0 8px;color:var(--dim);font-size:10px;font-weight:850;letter-spacing:.07em;text-transform:uppercase}.bt-assistant-composer{margin:18px 0 14px;padding:14px;border:1px solid var(--line-soft);border-radius:16px;background:var(--panel2)}.bt-assistant-custom{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;margin:0}.bt-assistant-custom .bt-input{margin:0;background:var(--panel)}.bt-assistant-custom .bt-btn{min-width:82px;justify-content:center}.bt-assistant-composer>small{display:block;margin-top:8px;color:var(--faint);font-size:10.5px;line-height:1.4}.bt-assistant-shortcuts{margin:0 0 14px}.bt-assistant-prompts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.bt-assistant-prompts button{display:grid;grid-template-columns:32px minmax(0,1fr) auto;gap:9px;align-items:center;min-width:0;padding:10px;border:1px solid var(--line-soft);border-radius:13px;background:var(--panel);color:var(--text);font-family:'Space Grotesk',sans-serif;text-align:left;cursor:pointer}.bt-assistant-prompts button:hover{border-color:color-mix(in srgb,${LIME} 70%,var(--line-soft));background:color-mix(in srgb,${LIME} 8%,var(--panel))}.bt-assistant-prompts button.aktif{border-color:${INK};box-shadow:inset 3px 0 0 ${LIME}}.bt-assistant-prompt-icon{display:grid;place-items:center;width:32px;height:32px;border-radius:10px;background:color-mix(in srgb,${LIME} 72%,var(--panel));color:${INK}}.bt-assistant-prompt-copy{min-width:0}.bt-assistant-prompt-copy strong{display:block;font-size:11px;line-height:1.25}.bt-assistant-prompt-copy small{display:block;margin-top:2px;color:var(--faint);font-size:9.5px;line-height:1.3}.bt-assistant-prompts button>svg{color:var(--faint)}.bt-assistant-answer{padding:18px;border:1px solid var(--line-soft);border-radius:17px;background:color-mix(in srgb,${LIME} 10%,var(--panel));font-size:13px;line-height:1.58}.bt-assistant-answer-label{display:block;margin-bottom:5px;color:var(--dim);font-size:9.5px;font-weight:850;letter-spacing:.07em;text-transform:uppercase}.bt-assistant-answer>strong{display:block;margin-bottom:10px;font-size:16px;line-height:1.3}.bt-assistant-answer p{margin:0;color:var(--dim);white-space:pre-line}.bt-assistant-summary{padding:12px 13px;border-left:4px solid ${LIME};border-radius:0 11px 11px 0;background:var(--panel);color:var(--text)!important;font-weight:720;line-height:1.5}.bt-assistant-list{display:grid;gap:8px;margin:11px 0 0;padding:0;list-style:none}.bt-assistant-list li{position:relative;padding:10px 12px 10px 36px;border:1px solid var(--line-soft);border-radius:12px;background:var(--panel);color:var(--dim);line-height:1.48}.bt-assistant-list li::before{content:'✓';position:absolute;left:12px;top:10px;display:grid;place-items:center;width:17px;height:17px;border-radius:50%;background:${LIME};color:${INK};font-size:10px;font-weight:900}.bt-assistant-emphasis{color:var(--text);font-weight:850}.bt-assistant-next{margin-top:10px;padding:10px 12px;border-radius:11px;background:${INK};color:${CREAM};line-height:1.45}.bt-assistant-next b{color:${LIME}}.bt-assistant-check{display:flex;align-items:flex-start;gap:7px;margin-top:12px;padding:9px 10px;border:1px solid var(--line-soft);border-radius:10px;background:var(--panel2);color:var(--dim);font-size:10.5px;line-height:1.4}.bt-assistant-check svg{flex:0 0 auto;margin-top:1px;color:var(--dim)}.bt-assistant-answer>small{display:block;margin-top:10px;padding-top:10px;border-top:1px solid var(--line-soft);color:var(--faint);font-size:10px;line-height:1.45}.bt-assistant-answer-footer{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;margin-top:13px}.bt-assistant-action .bt-btn{justify-content:center}.bt-assistant-answer-footer .bt-assistant-quota{margin-top:0}
@media(max-width:520px){.bt-assistant-modal{padding:18px 15px}.bt-assistant-head{grid-template-columns:40px minmax(0,1fr) auto;padding-bottom:14px}.bt-assistant-mark{width:40px;height:40px}.bt-assistant-head h2{font-size:18px}.bt-assistant-head p{font-size:10.5px}.bt-assistant-composer{margin-top:14px;padding:11px}.bt-assistant-custom{grid-template-columns:1fr}.bt-assistant-custom .bt-btn{width:100%}.bt-assistant-prompts{grid-template-columns:1fr}.bt-assistant-prompt-copy small{font-size:10px}.bt-assistant-answer-footer{align-items:stretch;flex-direction:column}.bt-assistant-action .bt-btn{width:100%}}
.bt-assistant-upsell{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;flex:1 0 100%;box-sizing:border-box;padding:12px 14px;border:1px solid ${INK};border-radius:14px;background:color-mix(in srgb,${LIME} 35%,var(--panel2));font-size:12px;line-height:1.45}.bt-assistant-upsell b{display:block;font-size:13px}.bt-assistant-upsell .bt-btn{white-space:nowrap}
.bt-assistant-consent{margin:12px 0;padding:14px;border:1px solid var(--line-soft);border-radius:14px;background:var(--panel2);font-size:11.5px;line-height:1.5;color:var(--dim)}.bt-assistant-consent strong{display:block;margin-bottom:5px;color:var(--text);font-size:13px}.bt-assistant-consent .bt-btn{margin-top:11px}.bt-assistant-quota{display:flex;align-items:center;gap:7px;width:max-content;max-width:100%;margin-top:10px;padding:7px 10px;border:1px solid var(--line-soft);border-radius:999px;background:var(--panel);color:var(--dim);font-size:11px;line-height:1}.bt-assistant-quota strong{color:var(--text);font-size:14px}.bt-assistant-quota-plan{padding:4px 7px;border-radius:999px;background:var(--lime);color:var(--ink);font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.05em}.bt-assistant-loading{display:inline-flex;align-items:center;gap:7px}.bt-assistant-loading svg{animation:bt-spin .9s linear infinite}@keyframes bt-spin{to{transform:rotate(360deg)}}
.bt-quick-add{position:fixed;right:clamp(14px,3vw,28px);bottom:clamp(70px,8vw,86px);z-index:40;display:inline-flex;align-items:center;gap:7px;padding:11px 16px;border:2px solid ${INK};border-radius:999px;background:${CORAL};color:${INK};font:800 12.5px 'Space Grotesk',sans-serif;box-shadow:4px 4px 0 ${LIME};cursor:pointer}
.bt-quick-add:hover{transform:translateY(-1px)}
.bt-quick-menu{position:fixed;right:clamp(14px,3vw,28px);bottom:clamp(120px,13vw,142px);z-index:41;width:min(310px,calc(100vw - 28px));display:grid;gap:7px;padding:10px;background:var(--panel);border:2px solid var(--line);border-radius:18px;box-shadow:7px 7px 0 ${LIME}}
.bt-quick-menu button{display:grid;grid-template-columns:34px minmax(0,1fr);align-items:center;gap:10px;width:100%;padding:10px;border:1.5px solid var(--line);border-radius:12px;background:var(--panel2);color:var(--text);font:inherit;text-align:left;cursor:pointer}
.bt-quick-menu button:hover{background:color-mix(in srgb,${LIME} 24%,var(--panel2))}.bt-quick-menu svg{grid-row:1/3;width:34px;height:34px;padding:7px;border:1.5px solid var(--line);border-radius:10px;background:${LIME};color:${INK}}.bt-quick-menu strong{font-size:12.5px}.bt-quick-menu small{display:block;margin-top:2px;color:var(--dim);font-size:10.5px;line-height:1.35}
.bt-borc-araclari{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:12px 14px;background:color-mix(in srgb,var(--panel) 96%,var(--bg));border:1px solid var(--line-soft);border-radius:16px;box-shadow:0 7px 20px #14160f0a}.bt-borc-araclari.filtre-aktif{align-items:flex-start;background:color-mix(in srgb,${CORAL} 10%,var(--panel));border-color:color-mix(in srgb,${CORAL} 58%,transparent);box-shadow:inset 4px 0 0 ${CORAL}}.bt-borc-araclari-baslik{display:flex;align-items:center;gap:10px;min-width:0}.bt-borc-araclari-ikon{display:grid;place-items:center;width:34px;height:34px;flex:0 0 34px;border:1px solid var(--line-soft);border-radius:10px;background:${LIME};color:${INK}}.bt-borc-araclari.filtre-aktif .bt-borc-araclari-ikon{background:${CORAL}}.bt-borc-araclari-baslik span{display:block;color:var(--dim);font-size:10px;font-weight:800;letter-spacing:.04em;text-transform:uppercase}.bt-borc-araclari-baslik strong{display:block;margin-top:2px;font-size:13px;line-height:1.25}.bt-borc-araclari-aciklama{margin-top:5px;color:var(--dim);font-size:11px;line-height:1.4}.bt-borc-araclari-actions{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap}.bt-status-filter{display:inline-flex;align-items:center;gap:7px;padding:8px 11px;border:1px solid color-mix(in srgb,${CORAL} 68%,transparent);border-radius:999px;background:color-mix(in srgb,${CORAL} 12%,var(--panel));color:${CORAL};font:800 11.5px 'Space Grotesk',sans-serif;cursor:pointer}.bt-status-filter:hover{background:color-mix(in srgb,${CORAL} 20%,var(--panel))}
.bt-ekstre-bilgi{position:relative}.bt-ekstre-bilgi>summary{display:grid;place-items:center;width:34px;height:34px;border:1px solid var(--line-soft);border-radius:50%;background:var(--panel);color:var(--dim);cursor:pointer;list-style:none;transition:.18s ease}.bt-ekstre-bilgi>summary::-webkit-details-marker{display:none}.bt-ekstre-bilgi>summary:hover,.bt-ekstre-bilgi>summary:focus-visible,.bt-ekstre-bilgi[open]>summary{border-color:color-mix(in srgb,${LIME} 70%,var(--line-soft));background:color-mix(in srgb,${LIME} 20%,var(--panel));color:var(--text);outline:none}.bt-ekstre-bilgi-kutu{position:absolute;z-index:30;right:0;top:calc(100% + 9px);width:min(310px,calc(100vw - 32px));padding:12px 14px;border:1px solid var(--line-soft);border-radius:14px;background:var(--panel);box-shadow:0 14px 32px #14160f1f;color:var(--dim);font-size:12px;line-height:1.5;text-align:left}.bt-ekstre-bilgi-kutu strong{display:block;margin-bottom:3px;color:var(--text);font-size:12.5px}
.bt-feedback-modal{max-height:calc(100dvh - 40px);overflow-y:auto;overscroll-behavior:contain}
.bt-feedback-field{grid-template-rows:auto auto!important;min-height:0}
.bt-feedback-textarea{display:block;width:100%;min-height:150px;max-height:280px;resize:vertical;line-height:1.5;padding-top:12px;overflow-y:auto}
.bt-feedback-count{margin-top:6px;color:var(--faint);font-size:10.5px;text-align:right;line-height:1}
.bt-feedback-footer{position:relative;display:flex;gap:8px;margin-top:16px;padding-top:14px;border-top:1px solid var(--line-soft);background:var(--panel)}
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
.bt-settings-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.bt-settings-card{background:var(--panel);border:1px solid var(--line-soft);border-radius:18px;padding:20px;box-shadow:0 8px 24px #14160f08}.bt-settings-card.wide{grid-column:1/-1}.bt-settings-title{display:flex;align-items:center;gap:9px;font-family:'Archivo Black',sans-serif;font-size:17px;margin-bottom:16px}.bt-setting-row{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:12px 0;border-top:1px solid var(--line-soft)}.bt-setting-row:first-of-type{border-top:0}.bt-setting-row strong{display:block;font-size:13px}.bt-setting-row small{display:block;color:var(--dim);font-size:11px;margin-top:3px;overflow-wrap:anywhere}.bt-yakinda{font-size:10px;font-weight:800;color:var(--dim);border:1px solid var(--line-soft);border-radius:999px;padding:4px 7px;white-space:nowrap}.bt-btn.bt-danger{border-color:color-mix(in srgb,${CORAL} 70%,var(--line));background:color-mix(in srgb,${CORAL} 12%,var(--panel));color:var(--text)}.bt-btn.bt-danger:hover:not(:disabled){background:${CORAL};color:${INK}}.bt-account-delete-modal{max-width:520px}.bt-account-delete-warning{display:grid;gap:8px;margin:16px 0;padding:14px;border:1px solid color-mix(in srgb,${CORAL} 55%,var(--line-soft));border-radius:14px;background:color-mix(in srgb,${CORAL} 10%,var(--panel));font-size:12px;line-height:1.5;color:var(--dim)}.bt-account-delete-warning strong{color:var(--text);font-size:13px}.bt-account-delete-list{margin:0;padding-left:18px}.bt-account-delete-list li+li{margin-top:5px}.bt-account-delete-confirm{display:grid;gap:7px;margin-top:16px}.bt-account-delete-confirm label{font-size:11px;font-weight:800;color:var(--text)}.bt-account-delete-confirm code{font-family:'JetBrains Mono',monospace;background:var(--panel2);padding:2px 5px;border-radius:5px}.bt-account-delete-confirm .bt-input{margin:0;text-transform:uppercase}@media(max-width:700px){.bt-settings-grid{grid-template-columns:1fr}.bt-settings-card.wide{grid-column:auto}.bt-setting-row{align-items:flex-start;flex-direction:column}.bt-setting-row>.bt-btn{width:100%;justify-content:center}.bt-account-delete-modal{width:100%}}
.bt-premium-card{grid-column:1/-1;display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,.62fr);gap:22px;align-items:center;background:var(--panel);color:var(--text);border:1px solid var(--line-soft);border-radius:20px;padding:22px 24px;box-shadow:0 10px 28px #14160f0a;overflow:hidden}.bt-premium-copy{display:flex;min-width:0;flex-direction:column;justify-content:center;align-items:flex-start}.bt-premium-card h2{max-width:680px;margin:10px 0 7px;font-family:'Archivo Black',sans-serif;font-size:clamp(22px,2.6vw,29px);line-height:1.08;letter-spacing:-.025em;color:var(--text);text-shadow:none}.bt-premium-card p{margin:0;color:var(--dim);font-size:12px;line-height:1.5;max-width:620px}.bt-premium-meta{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-top:14px}.bt-premium-meta span{display:inline-flex;align-items:center;min-height:29px;padding:5px 9px;border:1px solid var(--line-soft);border-radius:999px;background:var(--panel2);color:var(--dim);font-size:10.5px;font-weight:800}.bt-premium-meta span.vurgu{border-color:color-mix(in srgb,${LIME} 70%,var(--line-soft));background:color-mix(in srgb,${LIME} 22%,var(--panel));color:#4d681b}.bt-premium-actions{display:grid;grid-template-columns:minmax(0,1fr) auto;align-content:center;gap:8px;padding:14px;border:1px solid var(--line-soft);border-radius:16px;background:var(--panel2)}.bt-premium-actions .bt-btn{text-decoration:none;justify-content:center;white-space:nowrap}.bt-premium-actions>a.bt-btn,.bt-premium-actions>.bt-btn:first-of-type{min-height:42px}.bt-premium-help{grid-column:1/-1;margin:3px 2px 0!important;text-align:left;font-size:10px!important;color:var(--faint)!important}.bt-premium-help a{color:#5d7a2e;font-weight:800}.bt-pro-choice{grid-column:1/-1;display:grid;gap:8px;min-width:245px}.bt-pro-toggle{display:grid;grid-template-columns:1fr 1fr;padding:3px;border:1px solid var(--line-soft);border-radius:999px;background:var(--panel)}.bt-pro-toggle button{min-height:36px;border:0;border-radius:999px;background:transparent;color:var(--dim);font:inherit;font-size:12px;font-weight:800;cursor:pointer}.bt-pro-toggle button.aktif{background:${LIME};color:${INK}}.bt-pro-sartlar{display:grid;gap:7px;margin-top:4px;padding-top:9px;border-top:1px solid var(--line-soft)}.bt-pro-sartlar-ust{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:6px;font-size:11.5px}.bt-pro-sartlar-ust strong{font-weight:800;color:var(--text)}.bt-pro-sartlar-ust span{color:var(--dim);font-weight:700}.bt-pro-sartlar p{margin:0;font-size:10.5px;line-height:1.5;color:var(--faint)}.bt-pro-sartlar-baglantilar{display:flex;flex-wrap:wrap;gap:4px 12px}.bt-pro-sartlar-baglantilar a{color:#5d7a2e;font-size:10.5px;font-weight:800;text-decoration:underline}.bt-pro-sartlar-hata{color:#a53a2a!important}.bt-premium-badge{display:inline-flex;align-items:center;gap:6px;border:1px solid color-mix(in srgb,${LIME} 70%,var(--line-soft));border-radius:999px;padding:5px 9px;background:color-mix(in srgb,${LIME} 20%,var(--panel));color:#4d681b;font-size:10px;font-weight:800}.bt-premium-card .bt-btn.ikincil{color:var(--text);border-color:var(--line-soft)}.bt-premium-card .bt-btn.ikincil:hover{background:var(--panel)}@media(max-width:900px){.bt-premium-card{grid-template-columns:1fr;gap:16px}.bt-premium-card h2{max-width:620px}.bt-premium-actions{grid-template-columns:1fr 1fr}}@media(max-width:600px){.bt-premium-card{grid-column:auto;padding:18px 16px}.bt-premium-card h2{margin-top:9px;font-size:23px}.bt-premium-actions{grid-template-columns:1fr;padding:11px}.bt-premium-actions .bt-btn,.bt-pro-choice{width:100%}.bt-premium-help{grid-column:auto}.bt-premium-meta{margin-top:12px}}
.bt-referral-card{grid-column:1/-1;display:grid;grid-template-columns:minmax(0,1fr) minmax(300px,.7fr);gap:22px;padding:24px;border:1px solid color-mix(in srgb,${LIME} 75%,var(--line-soft));border-radius:20px;background:linear-gradient(125deg,color-mix(in srgb,${LIME} 23%,var(--panel)),color-mix(in srgb,${CORAL} 9%,var(--panel)));overflow:hidden}.bt-referral-copy h2{margin:8px 0 7px;font:clamp(22px,3vw,30px)/1.08 'Archivo Black',sans-serif;letter-spacing:-.025em}.bt-referral-copy p{max-width:650px;margin:0;color:var(--dim);font-size:12px;line-height:1.55}.bt-referral-stats{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}.bt-referral-stats span{padding:6px 9px;border:1px solid var(--line-soft);border-radius:999px;background:var(--panel);font-size:10.5px;font-weight:800}.bt-referral-panel{align-self:center;padding:15px;border:1px solid var(--line-soft);border-radius:16px;background:var(--panel)}.bt-referral-code{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:46px;padding:10px 13px;border:1px dashed var(--line);border-radius:12px;background:var(--panel2)}.bt-referral-code strong{font:700 14px 'JetBrains Mono',monospace;letter-spacing:.05em}.bt-referral-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:9px}.bt-referral-message{margin-top:8px;color:#5d7a2e;font-size:10.5px;font-weight:700}.bt-referral-error{color:#a53a2a}.bt-referral-campaign{display:grid;grid-template-columns:42px minmax(0,1fr) auto;align-items:center;gap:13px;padding:13px 15px;border:1px solid color-mix(in srgb,${LIME} 70%,var(--line-soft));border-radius:17px;background:linear-gradient(105deg,color-mix(in srgb,${LIME} 19%,var(--panel)),color-mix(in srgb,${CORAL} 7%,var(--panel)));box-shadow:0 8px 22px #14160f09}.bt-referral-campaign-ikon{display:grid;place-items:center;width:42px;height:42px;border-radius:12px;background:${INK};color:${LIME};box-shadow:3px 3px 0 ${CORAL}}.bt-referral-campaign strong{display:block;color:var(--text);font-size:13.5px}.bt-referral-campaign small{display:block;margin-top:3px;color:var(--dim);font-size:10.5px;line-height:1.35}.bt-referral-campaign .bt-btn{min-height:38px;padding:9px 13px;white-space:nowrap;text-decoration:none}@media(max-width:760px){.bt-referral-card{grid-template-columns:1fr;padding:18px 16px}.bt-referral-actions{display:flex;align-items:center;gap:7px;flex-wrap:wrap}.bt-referral-actions .bt-btn{width:auto;min-height:38px;padding:9px 11px;font-size:11px}.bt-referral-campaign{grid-template-columns:38px minmax(0,1fr);gap:11px}.bt-referral-campaign-ikon{width:38px;height:38px}.bt-referral-campaign .bt-btn{grid-column:2;justify-self:start}.bt-referral-campaign small{font-size:10px}}
.bt-pro-modal-arka{overscroll-behavior:contain}.bt-pro-modal{width:min(760px,100%);max-width:none;padding:0;overflow:hidden;background:${INK};color:${CREAM};box-shadow:10px 10px 0 ${CORAL}}.bt-pro-modal-head{position:relative;padding:28px 30px 24px;border-bottom:1.5px solid #45483d;background:radial-gradient(circle at 88% 0%,#cdf56430 0 18%,transparent 19%),${INK}}.bt-pro-modal-head .bt-premium-badge{margin-bottom:13px}.bt-pro-modal-head h2{max-width:560px;margin:0;font-family:'Archivo Black',sans-serif;font-size:clamp(26px,5vw,40px);line-height:1.04;color:${CREAM}}.bt-pro-modal-head h2 span{color:${LIME};text-shadow:3px 3px 0 ${CORAL}}.bt-pro-modal-head p{max-width:590px;margin:12px 0 0;color:#bfc1b4;font-size:13px;line-height:1.55}.bt-pro-modal-kapat{position:absolute;right:20px;top:20px;width:38px;height:38px;display:grid;place-items:center;border:1.5px solid #77796d;border-radius:50%;background:#292c20;color:${CREAM};cursor:pointer}.bt-pro-modal-body{display:grid;grid-template-columns:minmax(0,1fr) minmax(260px,.78fr);gap:24px;padding:26px 30px 30px}.bt-pro-faydalar{display:grid;gap:10px}.bt-pro-fayda{display:grid;grid-template-columns:32px minmax(0,1fr);gap:10px;align-items:start;padding:11px;border:1px solid #45483d;border-radius:13px;background:#1d2017}.bt-pro-fayda svg{width:32px;height:32px;padding:7px;border:1.5px solid ${INK};border-radius:9px;background:${LIME};color:${INK}}.bt-pro-fayda strong{display:block;font-size:12.5px}.bt-pro-fayda small{display:block;margin-top:3px;color:#a9ab9e;font-size:10.5px;line-height:1.4}.bt-pro-satin-al{align-self:start;display:grid;gap:10px;padding:14px;border:1.5px solid #5b5e51;border-radius:16px;background:#24271e}.bt-pro-planlar{display:grid;grid-template-columns:1fr 1fr;gap:8px}.bt-pro-plan{padding:11px 9px;border:1.5px solid #5b5e51;border-radius:12px;background:transparent;color:${CREAM};font:inherit;text-align:left;cursor:pointer}.bt-pro-plan.aktif{border-color:${LIME};background:#cdf56418;box-shadow:inset 0 0 0 1px ${LIME}}.bt-pro-plan span{display:block;color:#a9ab9e;font-size:10px;font-weight:700}.bt-pro-plan strong{display:block;margin-top:4px;color:${CREAM};font-size:13px}.bt-pro-satin-al .bt-btn{width:100%;justify-content:center;min-height:44px}.bt-pro-guvence{display:flex;align-items:flex-start;gap:7px;color:#9fa294;font-size:9.5px;line-height:1.4}.bt-pro-guvence svg{flex:0 0 auto;margin-top:1px;color:${LIME}}.bt-pro-hata{padding:9px;border:1px solid ${CORAL};border-radius:10px;color:#ffc0b7;font-size:10px;line-height:1.4}@media(max-width:700px){.bt-pro-modal-arka{padding:8px}.bt-pro-modal{margin:8px 0;box-shadow:5px 5px 0 ${CORAL}}.bt-pro-modal-head{padding:23px 18px 19px}.bt-pro-modal-head h2{padding-right:38px;font-size:28px}.bt-pro-modal-head p{font-size:12px}.bt-pro-modal-kapat{right:14px;top:14px}.bt-pro-modal-body{grid-template-columns:1fr;gap:17px;padding:18px}.bt-pro-faydalar{gap:7px}.bt-pro-fayda{padding:9px}.bt-pro-satin-al{position:sticky;bottom:0}}
.bt-pro-kilit{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:14px;margin-top:26px;padding:16px;background:#24271e;border:1.5px solid #55584c;border-radius:16px}.bt-pro-kilit-ikon{display:grid;place-items:center;width:42px;height:42px;border:1.5px solid ${INK};border-radius:12px;background:${LIME};color:${INK};box-shadow:3px 3px 0 ${CORAL}}.bt-pro-kilit strong{display:block;color:${CREAM};font-size:14px}.bt-pro-kilit span{display:block;margin-top:3px;color:#9fa294;font-size:11.5px;line-height:1.45}.bt-pro-kilit .bt-btn{white-space:nowrap}
.bt-adfree-card{background:var(--panel2)}.bt-adfree-actions{display:flex;align-items:center;gap:6px;flex-wrap:wrap}.bt-adfree-actions a{text-decoration:none}
@media(max-width:700px){.bt-pro-kilit{grid-template-columns:auto minmax(0,1fr)}.bt-pro-kilit .bt-btn{grid-column:1/-1;width:100%;justify-content:center}.bt-adfree-actions{width:100%}.bt-adfree-actions .bt-btn{flex:1;justify-content:center}}
.bt-varlik-hero{background:${INK};color:${CREAM};border:2px solid var(--line);border-radius:22px;padding:clamp(20px,4vw,32px);display:grid;grid-template-columns:minmax(0,1.4fr) repeat(2,minmax(150px,.7fr));gap:18px;align-items:end}.bt-varlik-hero .bt-metric-lbl{color:#bfc1b4}.bt-varlik-toplam{font-family:'Archivo Black',sans-serif;font-size:clamp(30px,6vw,48px);color:${LIME};text-shadow:3px 3px 0 ${CORAL};overflow-wrap:anywhere}.bt-varlik-mini{border-left:1.5px solid #4a4d40;padding-left:18px}.bt-varlik-mini strong{display:block;font-family:'JetBrains Mono',monospace;font-size:18px;margin-top:5px}.bt-varlik-kaynak{display:flex;align-items:center;gap:7px;color:var(--dim);font-size:11.5px;line-height:1.45}.bt-varlik-kaynak.hata{color:${CORAL}}.bt-varlik-dagilim{display:grid;gap:10px}.bt-varlik-dagilim-satir{display:grid;grid-template-columns:minmax(100px,1fr) minmax(100px,2fr) auto;gap:10px;align-items:center;font-size:12.5px}.bt-varlik-dagilim-bar{height:9px;border:1.5px solid var(--line);border-radius:999px;overflow:hidden;background:var(--panel2)}.bt-varlik-dagilim-bar div{height:100%;background:linear-gradient(90deg,${LIME},${CORAL})}.bt-varlik-rozet{font-size:10px;font-weight:800;border:1.5px solid var(--line);border-radius:999px;padding:4px 7px;white-space:nowrap}.bt-varlik-rozet.otomatik{background:${LIME};color:${INK};border-color:${INK}}.bt-varlik-degisim{font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:800;margin-top:3px}.bt-varlik-degisim.arti{color:#5D7A2E}.bt-varlik-degisim.eksi{color:${CORAL}}
@media(max-width:760px){.bt-varlik-hero{grid-template-columns:1fr}.bt-varlik-mini{border-left:0;border-top:1.5px solid #4a4d40;padding:14px 0 0}.bt-varlik-dagilim-satir{grid-template-columns:minmax(80px,1fr) minmax(70px,1.3fr) auto}}

@media (min-width:601px) and (max-width:900px){.bt-modal.bt-ekstre-yukle{width:min(760px,calc(100vw - 28px))}.bt-extract-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.bt-extract-grid .genis{grid-column:1/-1}}
@media (max-width:600px){
  .bt-app{overflow-x:hidden}
  .bt-wrap{padding:20px 12px calc(112px + env(safe-area-inset-bottom))}
  .bt-header{display:block;margin-bottom:22px}
  .bt-headright{width:100%;gap:8px 10px;margin-top:18px}
  .bt-demo-plan{order:-1;width:100%;justify-content:flex-start;border-radius:14px}
  .bt-demo-plan>span{margin-right:auto}
  .bt-date{flex:1 0 100%}
  .bt-settings-link{padding:7px 9px}
  .bt-assistant-header{display:inline-flex;align-items:center;gap:7px;margin-right:auto;padding:8px 11px;border:1px solid ${INK};border-radius:999px;background:${INK};color:${CREAM};font:800 11px 'Space Grotesk',sans-serif;cursor:pointer}.bt-assistant-header svg{color:${LIME}}.bt-assistant-header .bt-assistant-beta{font-size:7px}
  .bt-upgrade-link{padding:7px 9px}
  .bt-trial-son{grid-template-columns:auto minmax(0,1fr);margin:-8px 0 20px;padding:13px}.bt-trial-son-actions{grid-column:1/-1;display:grid;grid-template-columns:1fr auto;width:100%}.bt-trial-son .bt-btn{justify-content:center;min-height:42px}
  .bt-nav{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin-bottom:24px}
  .bt-nav.bt-nav-ana{position:fixed;z-index:45;left:0;right:0;bottom:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px;margin:0;padding:8px max(6px,env(safe-area-inset-left)) calc(8px + env(safe-area-inset-bottom)) max(6px,env(safe-area-inset-right));background:color-mix(in srgb,var(--panel) 96%,transparent);border-top:1px solid var(--line-soft);box-shadow:0 -8px 24px #14160f12;backdrop-filter:blur(12px)}
  .bt-nav-ana .bt-pill{display:flex;min-width:0;min-height:54px;align-items:center;justify-content:center;flex-direction:column;gap:4px;border:0;border-radius:13px;padding:6px 2px;background:transparent;color:var(--dim);font-size:clamp(9px,2.7vw,10.5px);line-height:1.05;opacity:1;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
  .bt-nav-ana .bt-pill svg{width:19px;height:19px;flex:0 0 auto;stroke-width:2.2}
  .bt-nav-ana .bt-pill span{display:block;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .bt-nav-ana .bt-pill.aktif{background:${LIME};color:${INK};box-shadow:inset 0 0 0 1.5px ${INK},2px 2px 0 ${CORAL}}
  .bt-nav-ana .bt-assistant-nav{display:none}
  .bt-nav.bt-nav-alt{display:flex;flex-wrap:nowrap;overflow-x:auto;gap:6px;margin:0 0 22px;padding:6px}.bt-nav-alt .bt-pill{width:auto;flex:0 0 auto;padding:7px 11px;font-size:11px}
  .bt-pill{width:100%;padding:9px 4px;font-size:11.5px;text-align:center}
  .bt-grid{grid-template-columns:1fr;gap:12px}
  .bt-card{padding:16px;border-radius:16px}
  .bt-h2{font-size:17px;line-height:1.2}
  .bt-hero{padding:24px 17px;border-radius:19px}
  .bt-hero-grid{grid-template-columns:1fr;gap:14px}
  .bt-ozet-kisa{grid-template-columns:repeat(2,minmax(0,1fr))}.bt-ozet-kisa>div{padding:13px 8px}.bt-ozet-kisa>div:first-child{padding-left:0}.bt-ozet-kisa>div:nth-child(3){grid-column:1/-1;padding-left:0;border-left:0;border-top:1px solid color-mix(in srgb,var(--line) 20%,transparent)}.bt-ozet-kisa strong{font-size:15px}.bt-ozet-kisa span{font-size:11px;line-height:1.25}.bt-ozet-durum{align-items:flex-start;flex-direction:column;gap:4px}
  .bt-chip{width:100%;justify-content:space-between;padding:8px 11px}
  .bt-satir,.bt-satirD{padding:13px 12px;gap:10px}
  .bt-kredi-metrikler{grid-template-columns:1fr 1fr}.bt-kredi-metrik{padding:8px 9px}
  .bt-harcama-inline-edit{margin:0;padding:15px 12px;border-left-width:4px}.bt-harcama-inline-edit-baslik{align-items:flex-start;flex-direction:column;gap:4px}
  .bt-satir.bt-kredi-karti{grid-template-columns:auto minmax(0,1fr);grid-template-areas:"rozet bilgi" "tutar tutar" "islemler islemler" "editor editor";column-gap:11px}.bt-kredi-karti>.bt-kart-tutar{text-align:left!important;min-width:0}.bt-kart-tutar>.bt-satirD-tur{margin-left:0;justify-content:flex-start}.bt-kredi-karti>.bt-kart-islemler{display:grid!important;grid-template-columns:1fr 1fr auto;width:100%;gap:7px!important}.bt-kredi-karti>.bt-kart-islemler .bt-btn{justify-content:center;min-width:0;padding-inline:9px}.bt-kredi-karti>.bt-kart-islemler .bt-satir-menu{min-width:0}.bt-sabit-gider-ozet{grid-template-columns:1fr;gap:8px}
  .bt-cardhead{align-items:flex-start}
  .bt-cardhead>.bt-input,.bt-cardhead>select{width:100%!important}
  .bt-form{padding:13px}
  .bt-form-butonlar{flex-wrap:wrap}
  .bt-form-butonlar .bt-btn{flex:1 1 120px;justify-content:center}
  .bt-kaynak-modal-form{grid-template-columns:1fr}.bt-kaynak-modal-form .genis{grid-column:auto}.bt-kaynak-modal-actions .bt-btn{flex:1 1 120px}
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
  .bt-borc-araclari,.bt-borc-araclari.filtre-aktif{align-items:stretch;flex-direction:column}.bt-borc-araclari-actions{display:grid;grid-template-columns:1fr auto;width:100%}.bt-borc-araclari-actions .bt-btn,.bt-borc-araclari-actions .bt-status-filter{width:100%;justify-content:center;min-height:42px}.bt-ekstre-bilgi>summary{width:42px;height:42px}.bt-ekstre-bilgi-kutu{position:fixed;left:16px;right:16px;top:auto;bottom:20px;width:auto;font-size:13px}
  .bt-setting-row{align-items:flex-start;flex-direction:column}
  .bt-setting-row .bt-btn{width:100%;justify-content:center}
  .bt-alanlar{grid-template-columns:1fr}
  .bt-alan{grid-template-rows:auto 44px}
  .bt-islem-satiri{align-items:flex-start;flex-direction:column}
  .bt-islem-satiri .bt-btn{width:100%;justify-content:center}
  .bt-modal.bt-ekstre-yukle{width:100%;max-height:none;padding:18px 16px}.bt-extract-grid{grid-template-columns:1fr}.bt-extract-grid .genis,.bt-extract-grid .yarim,.bt-auto-card-match{grid-column:auto}.bt-auto-card-match{grid-template-columns:auto minmax(0,1fr)}.bt-auto-card-match button{grid-column:2;justify-self:start}.bt-extract-head{flex-direction:column}.bt-extract-details .bt-extract-grid{padding:0 12px 12px}.bt-transaction-row{grid-template-columns:auto minmax(0,1fr) auto}.bt-transaction-row>.bt-input{grid-column:2/-1}.bt-ekstre-yukle .bt-form-butonlar .bt-btn{width:100%}.bt-ekstre-yukle .bt-form-butonlar .hayalet{margin-left:0}
  .bt-modal.bt-ekstre-arsiv{width:100%;max-height:none}.bt-ekstre-arsiv-satir{grid-template-columns:1fr}.bt-ekstre-arsiv-islemler{justify-content:stretch;align-items:stretch;flex-direction:column}.bt-ekstre-arsiv-islemler label{min-width:0}.bt-ekstre-arsiv-islemler .bt-btn{justify-content:center}
}
@media (min-width:601px) and (max-width:820px){.bt-alanlar{grid-template-columns:repeat(2,minmax(0,1fr))}}
/* Sakin yüzey sistemi: normal yüzeylerde çizgi değil boşluk ve ton hiyerarşi kurar. */
.bt-hero .deko-daire,.bt-hero .deko-kare{border-width:1px}
.bt-risk{border:1px solid color-mix(in srgb,${CORAL} 52%,transparent);transform:none}
.bt-satir-menu-panel,.bt-modal,.bt-quick-menu,.bt-borc-araclari,.bt-varlik-hero{border:1px solid var(--line-soft);box-shadow:0 14px 36px #14160f12}
.bt-borc-araclari{background:color-mix(in srgb,var(--panel) 96%,var(--bg));box-shadow:0 7px 20px #14160f0a}
.bt-borc-araclari.filtre-aktif{border-color:color-mix(in srgb,${CORAL} 58%,transparent);box-shadow:inset 4px 0 0 ${CORAL}}
.bt-borc-araclari-ikon,.bt-kart-odeme-ozet>div,.bt-odeme-kaydi,.bt-islem-satiri,.bt-odeme-gecmisi,.bt-varlik-dagilim-bar,.bt-varlik-rozet{border-width:1px;border-color:var(--line-soft)}
.bt-status-filter{border-width:1px}
.bt-upload-zone{border-width:1px;border-color:var(--line-soft)}
.bt-upload-icon,.bt-upload-progress,.bt-extract-details,.bt-extract-details>summary::after,.bt-confidence{border-width:1px;border-color:var(--line-soft)}
.bt-feedback-trigger,.bt-quick-add{border-width:1px;box-shadow:0 8px 20px #14160f16}
@media (prefers-reduced-motion:reduce){ *{transition:none!important}.bt-kutlama-ikon,.bt-konfeti i{animation:none!important}.bt-konfeti{display:none} }
`;

/* ---------------- Yardımcılar (iş mantığı — değişmedi) ---------------- */
// `birim` verilirse ve ana birimden farkliysa tutar o birimde yazilir (borc
// bazinda para birimi). Verilmezse ya da ana birimse cikti eskisiyle ayni.
const fmt = (n, birim) =>
  birim && birim !== kullaniciParaBirimi() ? paraBiriminiFormatla(n, birim) : kullaniciParaFormatla(n);
const fmt0 = (n, birim) =>
  birim && birim !== kullaniciParaBirimi()
    ? paraBiriminiFormatla(n, birim, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    : kullaniciParaFormatla(n, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

/* ---------------- Borc bazinda para birimi ----------------
   Kayitta `paraBirimi` yoksa ana birimdedir (eski veri, web). Ana birimden
   farkli kayit kendi biriminde gosterilir; toplamlara ana birime kurla
   cevrilerek girer. Kur bilinmiyorsa toplama katilmaz, ayrica sayilir. */
const BORC_LISTELERI = ["cards", "loans", "overdrafts", "others"];
// Kaydin birimi ana birimden farkliysa birim kodu, degilse undefined
// (fmt(n, yabanciBirim(k)) ana birimde eski ciktiyi verir).
const yabanciBirim = (kayit) => {
  const birim = kayitParaBirimi(kayit);
  return birim === kullaniciParaBirimi() ? undefined : birim;
};
// Kaydin tutarlarini ana birime ceviren carpan; kur yoksa null.
const kayitKurCarpani = (kayit, tablo = aktifKurTablosu()) =>
  kurCarpani(kayitParaBirimi(kayit), kullaniciParaBirimi(), tablo);
// Ana birime cevrilmis tutar; kur yoksa 0 (cagiran kurBekliyor ile ayirir).
const anaTutar = (tutar, kayit, tablo) => {
  const carpan = kayitKurCarpani(kayit, tablo);
  return carpan === null ? 0 : (Number(tutar) || 0) * carpan;
};
const kurBekliyor = (kayit, tablo) => kayitKurCarpani(kayit, tablo) === null;
// Odeme satirlari (yaklasan, donem odemeleri) kaydin biriminde tutulur;
// yabanci birimde `paraBirimi` tasir. Toplamlar icin ana birim tutari.
const odemeKuru = (odeme, tablo = aktifKurTablosu()) =>
  odeme?.paraBirimi ? kurCarpani(odeme.paraBirimi, kullaniciParaBirimi(), tablo) : 1;
const odemeAnaBirimde = (odeme, tablo) => {
  const kur = odemeKuru(odeme, tablo);
  if (kur === 1) return odeme;
  if (kur === null) return null;
  const sonuc = { ...odeme };
  ["tutar", "hedefTutar", "yapilanOdeme", "kalanToplam", "minimumOdeme", "kalanKrediBorcu", "bakiye"].forEach((alan) => {
    if (sonuc[alan] !== undefined) sonuc[alan] = (+sonuc[alan] || 0) * kur;
  });
  return sonuc;
};
const odemeleriAnaBirimeCevir = (liste = [], tablo) => liste.map((o) => odemeAnaBirimde(o, tablo)).filter(Boolean);
const tumBorcKayitlari = (veri) => BORC_LISTELERI.flatMap((liste) => veri?.[liste] || []);
// Toplamlarin yanindaki "≈ kur tarihi" ve "{n} kayit kur bekliyor" notu icin.
function kurDurumu(veri, tablo = aktifKurTablosu()) {
  const ana = kullaniciParaBirimi();
  const yabanci = tumBorcKayitlari(veri).filter((k) => k && kayitParaBirimi(k, ana) !== ana);
  const bekleyen = kurBekleyenKayitlar(yabanci, { anaBirim: ana, kayitBirimi: (k) => kayitParaBirimi(k, ana), tablo });
  return {
    cevrildi: yabanci.length > bekleyen.length,
    bekleyen: bekleyen.length,
    tarih: tablo?.tarih || null,
  };
}
// Senaryo ve asistan gibi kayit dizisi bekleyen hesaplar icin ana birime
// cevrilmis borc listeleri. Tek birimli kullanicida ayni diziler doner.
function anaBirimBorcVerisi(veri, tablo = aktifKurTablosu()) {
  const ana = kullaniciParaBirimi();
  if (!tumBorcKayitlari(veri).some((k) => k && kayitParaBirimi(k, ana) !== ana)) return veri;
  const secenek = { anaBirim: ana, kayitBirimi: (k) => kayitParaBirimi(k, ana), tablo };
  return {
    ...veri,
    ...Object.fromEntries(BORC_LISTELERI.map((liste) => [liste, borcListesiniAnaBirimeCevir(veri?.[liste] || [], liste, secenek)])),
  };
}
function KurNotu({ durum, koyu = false }) {
  if (!durum || (!durum.cevrildi && !durum.bekleyen)) return null;
  const tarih = durum.tarih ? new Date(durum.tarih) : null;
  const tarihMetni = tarih && !Number.isNaN(tarih.getTime())
    ? tarih.toLocaleDateString(locale(), { day: "numeric", month: "short" })
    : "";
  return (
    <small className="bt-kur-notu" style={{ display: "block", fontSize: 11.5, color: koyu ? "var(--summary-muted)" : "var(--dim)", marginTop: 4 }}>
      {durum.cevrildi && (tarihMetni ? t("paraBirimi.kur.cevrildiTarih", { tarih: tarihMetni }) : t("paraBirimi.kur.cevrildi"))}
      {durum.cevrildi && durum.bekleyen > 0 && " · "}
      {durum.bekleyen > 0 && t("paraBirimi.kur.bekliyor", { n: durum.bekleyen })}
    </small>
  );
}
// Borc formundaki kucuk para birimi secici (web ve iOS ayni). Ana birim
// secilirse alan kayda yazilmaz; eski kayitlar gibi ana birimde kalir.
function BorcParaBirimiSecici({ deger, onChange }) {
  const ana = kullaniciParaBirimi();
  const secili = DESTEKLENEN_PARA_BIRIMLERI.includes(deger) ? deger : ana;
  return (
    <label className="bt-alan bt-borc-para-birimi">
      <span>{t("paraBirimi.borc.etiket")}</span>
      <select
        className="bt-input"
        aria-label={t("paraBirimi.borc.etiket")}
        value={secili}
        onChange={(e) => onChange(e.target.value === ana ? undefined : e.target.value)}
      >
        {DESTEKLENEN_PARA_BIRIMLERI.map((kod) => (
          <option key={kod} value={kod}>
            {kod} · {paraBirimiAdi(kod)}
          </option>
        ))}
      </select>
    </label>
  );
}
// TRY disinda oran girilmemis borclarda kullanilan ulke ortalamasinin kisa
// aciklamasi: "ABD ortalamasi, degistirebilirsin".
function ortalamaEtiketi(birim = kullaniciParaBirimi()) {
  const ulke = profilUlkeAdi(bolgeProfili(birim));
  return ulke ? t("bolge.ortalama", { ulke }) : t("bolge.tipik");
}
function ortalamaKaynagi(birim = kullaniciParaBirimi()) {
  const ulke = profilUlkeAdi(bolgeProfili(birim));
  return ulke ? t("bolge.kaynakUlke", { ulke }) : t("bolge.kaynakTipik");
}
// TRY disinda faiz alani bos birakilirsa kullanilacak aylik oran ipucu.
function varsayilanFaizIpucu(yillik, birim = kullaniciParaBirimi()) {
  if (turkiyeKurallariGecerli(birim)) return undefined;
  const aylikOran = (Number(yillik) || 0) / 12;
  return t("bolge.alanIpucu", { oran: aylikOran.toLocaleString(locale(), { maximumFractionDigits: 2 }), kaynak: ortalamaKaynagi(birim) });
}
// Ornek tutarlar TRY icin yazildi; diger birimlerde yasam maliyeti olcegine
// gore kuculturulur. TRY'de sozluk metni aynen kalir.
const ornekTutarMetni = (anahtar, tryTutari) =>
  turkiyeKurallariGecerli() ? t(anahtar) : fmt0(ornekTutar(tryTutari));
const ornekSayiMetni = (anahtar, tryTutari) =>
  turkiyeKurallariGecerli() ? t(anahtar) : t("ortak.ornekTutar", { tutar: ornekTutar(tryTutari).toLocaleString(locale()) });
// Satir bilesenlerinde yerel `fmt` golgesi icin (kaydin kendi birimi).
const fmtBirimli = (n, birim) => fmt(n, birim);
const fmtBirim = (n) => kullaniciParaFormatla(n, { minimumFractionDigits: 2, maximumFractionDigits: 8 });

function ParaInput({ value, onValueChange, ...props }) {
  return (
    <input
      {...props}
      type="text"
      inputMode="decimal"
      value={paraGirdisiniFormatla(value)}
      onChange={(event) => onValueChange?.(paraGirdisiniCoz(event.target.value), event)}
    />
  );
}

function sayisalAlanBilgisi(hedef) {
  if (!(hedef instanceof HTMLInputElement)) return null;
  const sayisal =
    hedef.type === "number" ||
    hedef.inputMode === "numeric" ||
    hedef.inputMode === "decimal";
  if (!sayisal) return null;
  const adim = hedef.getAttribute("step");
  const ondalik =
    hedef.inputMode === "decimal" ||
    adim === "any" ||
    (adim && Number(adim) > 0 && !Number.isInteger(Number(adim)));
  return { hedef, ondalik };
}

function sayisalDegerGecerli(deger, ondalik) {
  return ondalik ? /^\d*(?:[.,]\d*)?$/.test(deger) : /^\d*$/.test(deger);
}

function sayisalTusKontrol(event) {
  const bilgi = sayisalAlanBilgisi(event.target);
  if (!bilgi || event.ctrlKey || event.metaKey || event.altKey) return;
  if (["e", "E", "+", "-"].includes(event.key)) event.preventDefault();
  if (!bilgi.ondalik && [".", ","].includes(event.key)) event.preventDefault();
}

function sayisalOnceGirdiKontrol(event) {
  const bilgi = sayisalAlanBilgisi(event.target);
  if (!bilgi || event.data == null || event.isComposing) return;
  const { hedef, ondalik } = bilgi;
  const bas = hedef.selectionStart ?? hedef.value.length;
  const son = hedef.selectionEnd ?? bas;
  const sonraki = hedef.value.slice(0, bas) + event.data + hedef.value.slice(son);
  if (!sayisalDegerGecerli(sonraki, ondalik)) event.preventDefault();
}

function sayisalYapistirmaKontrol(event) {
  const bilgi = sayisalAlanBilgisi(event.target);
  if (!bilgi) return;
  const { hedef, ondalik } = bilgi;
  const yapistirilan = event.clipboardData?.getData("text")?.trim() || "";
  const bas = hedef.selectionStart ?? hedef.value.length;
  const son = hedef.selectionEnd ?? bas;
  const sonraki = hedef.value.slice(0, bas) + yapistirilan + hedef.value.slice(son);
  if (!sayisalDegerGecerli(sonraki, ondalik)) event.preventDefault();
}
const parseParaGirisi = (deger) => {
  const temiz = String(deger ?? "")
    .trim()
    .replace(/[₺\s]/g, "");
  if (!temiz) return 0;
  // Ingilizcede virgul binlik, nokta ondalik ayiricidir (1,234.56).
  if (dil() === "en") return Number(temiz.replace(/[$€£]/g, "").replace(/,/g, "")) || 0;
  const standart = temiz.includes(",")
    ? temiz.replace(/\./g, "").replace(",", ".")
    : /^\d{1,3}(\.\d{3})+$/.test(temiz)
      ? temiz.replace(/\./g, "")
      : temiz;
  return Number(standart) || 0;
};
const PARA_BIRIMLERI = [
  { id: "TRY", ad: t("cekirdek.paraBirimi.TRY"), fiyat: null },
  { id: "USD", ad: t("cekirdek.paraBirimi.USD"), fiyat: "usdTry" },
  { id: "EUR", ad: t("cekirdek.paraBirimi.EUR"), fiyat: "eurTry" },
];
const fmtPara = (n, id = "TRY") =>
  paraBiriminiFormatla(n, PARA_BIRIMLERI.some((birim) => birim.id === id) ? id : "TRY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  });
const paraBirimi = (id) =>
  PARA_BIRIMLERI.find((birim) => birim.id === id) || PARA_BIRIMLERI[0];
const paraBirimiKuru = (kayit, fiyatlar = {}) => {
  // TRY disi kullanici biriminde kur cevirisi yapilmaz; tutar oldugu gibi.
  if (!piyasaDegerlemesiAcik()) return 1;
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
  { id: "gram_altin", kategori: "emtia", ad: "Gram altın (24 ayar)", birim: t("cekirdek.birim.gram"), otomatik: true, fiyat: "goldGramTry", carpan: 1 },
  { id: "gram_altin_22", kategori: "emtia", ad: "Gram altın (22 ayar)", birim: t("cekirdek.birim.gram"), otomatik: true, fiyat: "goldGramTry", carpan: 0.9167, tahmini: true },
  { id: "ceyrek_altin", kategori: "emtia", ad: "Çeyrek altın", birim: t("cekirdek.birim.adet"), otomatik: true, fiyat: "goldGramTry", carpan: 1.6065, tahmini: true },
  { id: "yarim_altin", kategori: "emtia", ad: "Yarım altın", birim: t("cekirdek.birim.adet"), otomatik: true, fiyat: "goldGramTry", carpan: 3.213, tahmini: true },
  { id: "tam_altin", kategori: "emtia", ad: "Tam altın", birim: t("cekirdek.birim.adet"), otomatik: true, fiyat: "goldGramTry", carpan: 6.426, tahmini: true },
  { id: "cumhuriyet_altini", kategori: "emtia", ad: "Cumhuriyet altını", birim: t("cekirdek.birim.adet"), otomatik: true, fiyat: "goldGramTry", carpan: 6.614, tahmini: true },
  { id: "gram_gumus", kategori: "emtia", ad: "Gram gümüş", birim: t("cekirdek.birim.gram"), otomatik: true, fiyat: "silverGramTry" },
  { id: "platin", kategori: "emtia", ad: "Platin (ons)", birim: t("cekirdek.birim.ons"), otomatik: true, fiyat: "platinumOunceTry" },
  { id: "petrol", kategori: "emtia", ad: "Petrol (WTI)", birim: t("cekirdek.birim.varil"), otomatik: true, fiyat: "oilBarrelTry" },
  { id: "bakir", kategori: "emtia", ad: "Bakır", birim: t("cekirdek.birim.libre"), otomatik: true, fiyat: "copperPoundTry" },
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
  { id: "bes", kategori: "bes", ad: "Bireysel emeklilik fonu", birim: t("cekirdek.birim.pay"), otomatik: true, fon: true, kaynak: "BEFAS" },
  { id: "fon", kategori: "fon", ad: "Yatırım fonu", birim: t("cekirdek.birim.pay"), otomatik: true, fon: true, kaynak: "TEFAS" },
  { id: "hisse", kategori: "hisse", ad: "Borsa İstanbul hissesi", birim: t("cekirdek.birim.adet"), otomatik: true, hisse: true, piyasa: "BIST", kaynak: "Yahoo Finance" },
  { id: "hisse_abd", kategori: "hisse", ad: "ABD borsası hissesi", birim: t("cekirdek.birim.adet"), otomatik: true, hisse: true, piyasa: "US", kaynak: "Yahoo Finance" },
  { id: "nakit", kategori: "nakit", ad: "Nakit", birim: "", otomatik: false },
  { id: "mevduat", kategori: "nakit", ad: "Vadeli / vadesiz mevduat", birim: "", otomatik: false },
  { id: "gayrimenkul", kategori: "diger", ad: "Gayrimenkul", birim: "", otomatik: false },
  { id: "arac", kategori: "diger", ad: "Araç", birim: "", otomatik: false },
  { id: "diger", kategori: "diger", ad: "Diğer (ekleyin)", birim: "", otomatik: false },
];
const VARLIK_KATEGORILERI = [
  { id: "nakit", ad: t("cekirdek.varlikKategori.nakit"), turler: ["nakit", "mevduat"] },
  { id: "doviz", ad: t("cekirdek.varlikKategori.doviz"), turler: ["usd", "eur", "gbp", "chf"] },
  { id: "emtia", ad: t("cekirdek.varlikKategori.emtia"), turler: ["gram_altin", "gram_altin_22", "ceyrek_altin", "yarim_altin", "tam_altin", "cumhuriyet_altini", "gram_gumus", "platin", "petrol", "bakir"] },
  { id: "kripto", ad: t("cekirdek.varlikKategori.kripto"), turler: [...KRIPTO_LISTESI.map((coin) => coin.coinId === "bitcoin" ? "bitcoin" : "kripto_" + coin.coinId), "kripto_diger"] },
  { id: "bes", ad: t("cekirdek.varlikKategori.bes"), turler: ["bes"] },
  { id: "fon", ad: t("cekirdek.varlikKategori.fon"), turler: ["fon"] },
  { id: "hisse", ad: t("cekirdek.varlikKategori.hisse"), turler: ["hisse", "hisse_abd"] },
  { id: "diger", ad: t("cekirdek.varlikKategori.diger"), turler: ["gayrimenkul", "arac", "diger"] },
];
const varlikTuru = (id) =>
  VARLIK_TURLERI.find((tur) => tur.id === id) || VARLIK_TURLERI.at(-1);
// Piyasa fiyatlari (doviz, altin, fon, hisse, kripto) TRY bazli geliyor ve
// kur cevirisi yapmiyoruz. Bu yuzden kullanici birimi TRY degilse otomatik
// degerleme kapanir: yalniz elle deger girilen turler sunulur ve tum
// varliklar girilen guncel degerle, kullanicinin biriminde hesaplanir.
// Web'de birim daima TRY oldugundan davranis degismez.
function piyasaDegerlemesiAcik() {
  return kullaniciParaBirimi() === "TRY";
}
const kategoriTurIdleri = (kategori) =>
  piyasaDegerlemesiAcik()
    ? kategori.turler
    : kategori.turler.filter((id) => !varlikTuru(id).otomatik);
const gorunurVarlikKategorileri = () =>
  VARLIK_KATEGORILERI.filter((kategori) => kategoriTurIdleri(kategori).length > 0);
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
  if (!piyasaDegerlemesiAcik()) return Math.max(+kayit.guncelDeger || 0, 0);
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
  const ozet = summarizeComparableAssets(kalemler.map((k) => ({
    value: k.hesaplananDeger,
    cost: Math.max(+k.toplamMaliyet || 0, 0) * paraBirimiKuru(k, fiyatlar),
    costKnown: k.maliyetBiliniyor === true,
  })));
  return { kalemler, toplam: ozet.total, maliyet: ozet.cost, kazanc: ozet.gain, karsilastirilabilirDeger: ozet.comparableValue, maliyetBilinenKalemSayisi: ozet.comparableCount, maliyetEksikKalemSayisi: ozet.missingCostCount };
}
// Ay adlari secili dilden gelir; tr-TR ciktisi eski sabit listeyle ayni
// ("Ekim 2026").
const ayEtiketi = (ay) => {
  const [y, m] = String(ay || "").split("-");
  if (!y || !m) return ay;
  return new Intl.DateTimeFormat(locale(), { month: "long", year: "numeric" })
    .format(new Date(Number(y), (+m || 1) - 1, 1));
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
    ? t("cekirdek.tarihYok")
    : d.toLocaleString(locale(), { dateStyle: "medium", timeStyle: "short" });
};
const yerelTarihSaatDegeri = (deger = new Date()) => {
  const d = new Date(deger);
  if (Number.isNaN(d.getTime())) return "";
  const yerel = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return yerel.toISOString().slice(0, 16);
};
const yerelTarihDegeri = (deger = new Date()) =>
  yerelTarihSaatDegeri(deger).slice(0, 10);
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
  if (k.sonOdemeTarihi)
    return new Date(k.sonOdemeTarihi + "T00:00:00");
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
  return buAyOdemeTarihi(k.sonOdemeGunu);
}

const kartOdemeAyi = (kart) => ayAnahtari(kartGecikmeTarihi(kart));

const kartOdemeAnahtari = (kart) =>
  "kart-" +
  kart.id +
  "-ekstre-" +
  (kart.ekstreAyi || ayAnahtari());

// TRY'de kart faizi TCMB azami oranindan gelir, alan gosterilmez. TRY disinda
// kullanici kendi aylik oranini girer; girmezse faiz varsayilmaz.
function kartFaizAlani(ek, birim = kullaniciParaBirimi()) {
  if (turkiyeKurallariGecerli(birim)) return [];
  return [{ k: "faiz", e: t("borclar.alan.kartFaizi"), t: "number", p: varsayilanFaizIpucu(bolgeProfili(birim)?.kartYillikFaiz, birim), ...(ek ? { ek: true } : {}) }];
}
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
  "Ziraat Bankası",
  "DenizBank",
  "ING Bank",
  "TEB",
  "HSBC",
  "Türkiye Finans",
];
function gunlukBirikmisFaiz(bakiye, aylikOran, gecikenGun) {
  return (
    (((Math.max(+bakiye || 0, 0) * Math.max(+aylikOran || 0, 0)) / 100) *
      Math.max(+gecikenGun || 0, 0)) /
    30
  );
}
function kartHesabi(k) {
  // Kurallar kaydin kendi birimine gore: TRY kartta TCMB/BDDK, digerinde
  // o birimin ulke ortalamasi.
  const birim = kayitParaBirimi(k);
  const yapilandirilan = cardRestructuredAmount(k);
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
      devreden: Math.max(ana + (+k.donemIciEklenen || 0) - yapilandirilan, 0),
      yeni: +k.donemIciEklenen || 0,
      faiz: 0,
      oran: kartFaizOranlari(ana, k.faiz, birim).akdi,
      toplam: Math.max(ana + (+k.donemIciEklenen || 0) - yapilandirilan, 0),
      asgari: Math.min(+k.asgari || 0, Math.max(ana + (+k.donemIciEklenen || 0) - yapilandirilan, 0)),
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
  const belgeToplami = +k.belgedenToplamEkstreBorcu || 0;
  const onceki = belgeToplami
    ? belgeToplami
    : k.yeniDonemEkstreBorcu !== undefined
      ? yeni + oncekiDevreden
      : +k.toplamEkstreBorcu || +k.oncekiDonemBorcu || 0;
  const odeme = Math.min(Math.max(+k.yapilanOdeme || 0, 0), onceki);
  const devreden = Math.max(onceki - odeme - yapilandirilan, 0);
  const oran = kartFaizOranlari(onceki, k.faiz, birim).akdi;
  const faiz = (devreden * oran) / 100;
  const toplam = devreden;
  const asgariOran = krediKartiAsgariOrani(k.limit) * 100;
  return {
    onceki,
    oncekiDevreden,
    odeme,
    devreden,
    yeni,
    faiz,
    oran,
    toplam,
    asgari: Math.min(
      +k.asgari > 0
        ? +k.asgari
        : yasalAsgariUygulanir(birim)
          ? (onceki * asgariOran) / 100
          // TRY disinda asgari girilmemisse ulke kuralina gore tahmin.
          : bolgeAsgariOdemesi(onceki, oran, bolgeProfili(birim)),
      devreden,
    ),
  };
}
function ekstreSnapshot(k, ekstreAyi = k.ekstreAyi) {
  return {
    ekstreAyi,
    yeniDonemEkstreBorcu: k.yeniDonemEkstreBorcu,
    toplamEkstreBorcu: k.toplamEkstreBorcu ?? k.oncekiDonemBorcu,
    oncekiAydanKalan: k.oncekiAydanKalan,
    yapilanOdeme: k.yapilanOdeme,
    asgari: k.asgari,
    belgedenToplamEkstreBorcu: k.belgedenToplamEkstreBorcu,
    ekstreBelgeOzeti: k.ekstreBelgeOzeti,
    hesapKesimTarihi: k.hesapKesimTarihi,
    sonOdemeTarihi: k.sonOdemeTarihi,
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
function ekHesapHesabi(k) {
  const kullanilan = Math.max(+k.kullanilan || 0, 0);
  const odeme = Math.min(Math.max(+k.yapilanOdeme || 0, 0), kullanilan);
  const kalan = Math.max(kullanilan - odeme, 0);
  // TRY'de oran girilmemisse %4,25 referans; TRY disinda varsayim yok.
  const { oran, tahmini, varsayilan, ucretle } = ekHesapFaizOrani(k.faiz, kayitParaBirimi(k));
  return { kullanilan, odeme, kalan, oran, faiz: (kalan * oran) / 100, tahmini, varsayilan, ucretle };
}
// Borcu süren ek hesaplar listede, kapananlar (kalan 0) "Kapattığın borçlar" başlığı altında.
function ekHesaplariAyir(liste) {
  const acik = [];
  const kapanan = [];
  for (const k of liste) (ekHesapHesabi(k).kalan > 0 ? acik : kapanan).push(k);
  return { acik, kapanan };
}
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
  activityHistory: [],
  ayarlar: {},
  snapshots: {},
};

const KATEGORI_META = {
  cards: { ad: t("cekirdek.borcKategori.cards"), liste: "cards", rozetBg: LIME },
  loans: { ad: t("cekirdek.borcKategori.loans"), liste: "loans", rozetBg: "#c8c9be" },
  od: { ad: t("cekirdek.borcKategori.od"), liste: "overdrafts", rozetBg: CORAL },
  others: {
    ad: t("cekirdek.borcKategori.others"),
    liste: "others",
    rozetBg: "#d8c9a0",
  },
};
const SEKME_YOLLARI = {
  ozet: "/summary",
  borclar: "/debts",
  "sabit-giderler": "/fixed-expenses",
  "sabit-gelirler": "/fixed-income",
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
// Kalem tutarlari ana birimdedir: ana birim disindaki kayit kurla cevrilir
// (kalemde `paraBirimi`, `kur` ve kendi birimindeki `kayitBakiye` kalir);
// kuru bilinmeyen kayit kaleme girmez (kurDurumu ile ayrica sayilir). Faiz
// oranlari aylik % oldugu icin siralama birimden bagimsizdir.
function kalemiAnaBirimeCevir(kalem, kayit, tablo) {
  const birim = yabanciBirim(kayit);
  if (!birim) return kalem;
  const kur = kayitKurCarpani(kayit, tablo);
  if (kur === null) return null;
  const cevrilmis = { ...kalem, paraBirimi: birim, kur, kayitBakiye: kalem.bakiye };
  ["bakiye", "faizTutari", "yapilanOdeme", "asgari", "asgariEksigi", "minimumOdeme"].forEach((alan) => {
    if (typeof cevrilmis[alan] === "number") cevrilmis[alan] *= kur;
  });
  return cevrilmis;
}
function borcKalemleri(veri, tablo = aktifKurTablosu()) {
  const kalemler = [];
  const ekle = (kalem, kayit) => {
    const sonuc = kalemiAnaBirimeCevir(kalem, kayit, tablo);
    if (sonuc) kalemler.push(sonuc);
  };
  veri.cards.forEach((k) => {
    const hesap = kartHesabi(k);
    const guncelBorc = hesap.toplam;
    if (guncelBorc > 0) {
      const birim = kayitParaBirimi(k);
      const gecikmis = kalanGun(kartGecikmeTarihi(k)) < 0;
      const oranlar = kartFaizOranlari(guncelBorc, k.faiz, birim);
      const akdiOran = oranlar.akdi;
      const gecikmeOran = oranlar.gecikme;
      const ozelFaizVar = +k.faiz > 0;
      const asgariEksigi = gecikmis
        ? Math.min(Math.max(hesap.asgari - hesap.odeme, 0), guncelBorc)
        : 0;
      const akdiFaizBakiyesi = Math.max(guncelBorc - asgariEksigi, 0);
      const faizTutari = ozelFaizVar
        ? (guncelBorc * +k.faiz) / 100
        : (asgariEksigi * gecikmeOran) / 100 +
          (akdiFaizBakiyesi * akdiOran) / 100;
      ekle({
        id: "kart-" + k.id,
        tur: "kart",
        banka: (k.banka || "").trim(),
        ad: kartGorunenAdi(k),
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
        // TRY disinda TCMB referansi yok: oran ya kullanicinindir ya da hic yoktur.
        faizTahmini: !ozelFaizVar && oranlar.referans,
        faizVarsayilan: oranlar.varsayilan,
        gecikmis,
        yapilanOdeme: hesap.odeme,
        asgari: hesap.asgari,
        asgariEksigi,
        minimumOdeme: Math.max(hesap.asgari - hesap.odeme, 0),
        minimumOran:
          hesap.onceki > 0 && hesap.asgari > 0
            ? Math.min(Math.max(hesap.asgari / hesap.onceki, 0), 1)
            : 0,
        vergiFonOrani: vergiFonOrani(birim),
      }, k);
    }
  });
  veri.overdrafts.forEach((k) => {
    const hesap = ekHesapHesabi(k);
    if (hesap.kalan > 0) {
      const bakiye = hesap.kalan;
      const faiz = hesap.oran;
      ekle({
        id: "ek-" + k.id,
        tur: "ek",
        banka: (k.banka || "").trim(),
        ad: t("cekirdek.kalem.ekHesap", { banka: k.banka }),
        bakiye,
        faiz,
        faizTutari: (bakiye * faiz) / 100,
        faizTahmini: hesap.tahmini,
        faizVarsayilan: hesap.varsayilan,
        minimumOdeme: 0,
        minimumOran: 0,
        vergiFonOrani: vergiFonOrani(kayitParaBirimi(k)),
      }, k);
    }
  });
  veri.loans.forEach((k) => {
    if ((+k.kalanBorc || 0) > 0) {
      const bakiye = +k.kalanBorc;
      const faiz = +k.faiz > 0 ? +k.faiz : 0;
      ekle({
        id: "kredi-" + k.id,
        tur: "kredi",
        banka: (k.banka || "").trim(),
        ad: k.ad ? k.banka + " · " + k.ad : t("cekirdek.kalem.kredi", { banka: k.banka }),
        bakiye,
        faiz,
        faizTutari: (bakiye * faiz) / 100,
        faizTahmini: false,
        sabitTaksit: true,
      }, k);
    }
  });
  (veri.others || []).forEach((k) => {
    if ((+k.tutar || 0) > 0) {
      const bakiye = +k.tutar;
      const faiz = +k.faiz > 0 ? +k.faiz : 0;
      ekle({
        id: "diger-" + k.id,
        tur: "diger",
        banka: (k.banka || "").trim(),
        ad: k.ad ? k.banka + " · " + k.ad : t("cekirdek.kalem.gecikmisBorc", { banka: k.banka }),
        bakiye,
        faiz,
        faizTutari: (bakiye * faiz) / 100,
        faizTahmini: false,
        sabitTaksit: !(+k.faiz > 0),
      }, k);
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
    const gecikmisToplam = odemeleriAnaBirimeCevir(gecikmisler).reduce(
      (toplam, odeme) => toplam + Math.max(+odeme.tutar || 0, 0),
      0,
    );
    oneriler.push({
      id: "gecikmis-odemeler",
      modlar: ["nakit", "faiz"],
      oncelik: 100,
      tur: "acil",
      etiket: t("cekirdek.oneri.gecikmis.etiket"),
      baslik: t("cekirdek.oneri.gecikmis.baslik", { adet: gecikmisler.length }),
      aciklama: t("cekirdek.oneri.gecikmis.aciklama"),
      etki: t("cekirdek.oneri.gecikmis.etki", { tutar: fmt(gecikmisToplam) }),
      hedef: "odemeler",
      aksiyon: t("cekirdek.oneri.gecikmis.aksiyon"),
    });
  }

  (veri.cards || []).forEach((kart) => {
    // Limit dusurme onerisi BDDK kuralina dayanir; yalniz TRY'de gosterilir.
    if (!yasalAsgariUygulanir(kayitParaBirimi(kart))) return;
    const kartBirimi = yabanciBirim(kart);
    const hesap = kartHesabi(kart);
    const limit = Math.max(+kart.limit || 0, 0);
    if (
      limit <= KREDI_KARTI_ASGARI_LIMIT_ESIGI ||
      hesap.onceki <= 0 ||
      hesap.onceki > KREDI_KARTI_ASGARI_LIMIT_ESIGI
    ) return;
    const mevcutMinimum = hesap.onceki * 0.4;
    const dusukLimitMinimumu = hesap.onceki * 0.2;
    const fark = Math.max(mevcutMinimum - dusukLimitMinimumu, 0);
    if (fark < 250) return;
    oneriler.push({
      id: "limit-" + kart.id,
      modlar: ["nakit"],
      oncelik: 86 + Math.min(fark / 10000, 5),
      tur: "firsat",
      etiket: t("cekirdek.oneri.limit.etiket"),
      baslik: t("cekirdek.oneri.limit.baslik", { banka: kart.banka || t("cekirdek.oneri.kart") }),
      aciklama: t("cekirdek.oneri.limit.aciklama"),
      etki: t("cekirdek.oneri.limit.etki", {
        mevcut: fmt(mevcutMinimum, kartBirimi),
        dusuk: fmt(dusukLimitMinimumu, kartBirimi),
        fark: fmt(fark, kartBirimi),
      }),
      uyari: t("cekirdek.oneri.limit.uyari"),
      hedef: "borclar",
      aksiyon: t("cekirdek.oneri.kartiIncele"),
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
    // "Her 1.000 TL ek odeme" ornegi; TRY disinda para birimine gore olceklenir.
    const ornekEkOdeme = ornekTutar(1000);
    const binLiraEtki = (ornekEkOdeme * hedef.faiz) / 100;
    oneriler.push({
      id: "faiz-onceligi-" + hedef.id,
      modlar: ["faiz"],
      oncelik: 92,
      tur: "firsat",
      etiket: t("cekirdek.oneri.faiz.etiket"),
      baslik: t("cekirdek.oneri.faiz.baslik", { ad: hedef.ad }),
      aciklama: t("cekirdek.oneri.faiz.aciklama"),
      etki: t(turkiyeKurallariGecerli() ? "cekirdek.oneri.faiz.etki" : "cekirdek.oneri.faiz.etkiTutarli", {
        oran: hedef.faiz.toLocaleString(locale(), { maximumFractionDigits: 2 }),
        tutar: fmt(binLiraEtki),
        ornek: fmt0(ornekEkOdeme),
      }),
      hedef: "plan",
      aksiyon: t("cekirdek.oneri.faiz.aksiyon"),
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
      etiket: t("cekirdek.oneri.kullanim.etiket"),
      baslik: t("cekirdek.oneri.kullanim.baslik", {
        banka: kart.banka || t("cekirdek.oneri.kart"),
        yuzde: Math.round(kullanim * 100),
      }),
      aciklama: t("cekirdek.oneri.kullanim.aciklama"),
      etki: t("cekirdek.oneri.kullanim.etki", { borc: fmt(hesap.toplam, yabanciBirim(kart)), limit: fmt(limit, yabanciBirim(kart)) }),
      hedef: "borclar",
      aksiyon: t("cekirdek.oneri.kartiIncele"),
    });
  });

  if (netNakit !== null && netNakit < 0) {
    oneriler.push({
      id: "negatif-nakit",
      modlar: ["nakit"],
      oncelik: 90,
      tur: "dikkat",
      etiket: t("cekirdek.oneri.nakit.etiket"),
      baslik: t("cekirdek.oneri.nakit.baslik", { tutar: fmt(Math.abs(netNakit)) }),
      aciklama: t("cekirdek.oneri.nakit.aciklama"),
      etki: t("cekirdek.oneri.nakit.etki"),
      hedef: "harcamalar",
      aksiyon: t("cekirdek.oneri.harcamalariIncele"),
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
    .filter((x) => x.onceki >= esikTutar(500) && x.fark >= esikTutar(500) && x.tutar >= x.onceki * 1.25)
    .sort((a, b) => b.fark - a.fark);
  if (artislar.length) {
    const artis = artislar[0];
    const yuzde = Math.round((artis.fark / artis.onceki) * 100);
    oneriler.push({
      id: "kategori-artisi-" + artis.kategori,
      modlar: ["nakit"],
      oncelik: 78,
      tur: "dikkat",
      etiket: t("cekirdek.oneri.artis.etiket"),
      baslik: t("cekirdek.oneri.artis.baslik", { kategori: tDeger(artis.kategori), yuzde }),
      aciklama: t("cekirdek.oneri.artis.aciklama"),
      etki: t("cekirdek.oneri.artis.etki", { tutar: fmt(artis.fark) }),
      hedef: "harcamalar",
      aksiyon: t("cekirdek.oneri.artis.aksiyon"),
    });
  } else if (buAyHarcama.toplam > 0) {
    const [kategori, tutar] = Object.entries(buAyHarcama.kategoriler || {}).sort(
      (a, b) => b[1] - a[1],
    )[0] || ["", 0];
    if (kategori && tutar >= esikTutar(1000) && tutar / buAyHarcama.toplam >= 0.35) {
      oneriler.push({
        id: "yogun-kategori-" + kategori,
        modlar: ["nakit"],
        oncelik: 64,
        tur: "bilgi",
        etiket: t("cekirdek.oneri.yogun.etiket"),
        baslik: t("cekirdek.oneri.yogun.baslik", { kategori: tDeger(kategori) }),
        aciklama: t("cekirdek.oneri.yogun.aciklama", {
          yuzde: Math.round((tutar / buAyHarcama.toplam) * 100),
        }),
        etki: t("cekirdek.oneri.yogun.etki", { tutar: fmt(tutar) }),
        hedef: "harcamalar",
        aksiyon: t("cekirdek.oneri.yogun.aksiyon"),
      });
    }
  }

  if (!kalemler.length && !buAyHarcama.adet) {
    oneriler.push({
      id: "veri-ekle",
      modlar: ["nakit", "faiz"],
      oncelik: 20,
      tur: "bilgi",
      etiket: t("cekirdek.oneri.ilk.etiket"),
      baslik: t("cekirdek.oneri.ilk.baslik"),
      aciklama: t("cekirdek.oneri.ilk.aciklama"),
      hedef: "borclar",
      aksiyon: t("cekirdek.oneri.ilk.aksiyon"),
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
  const [asistanPenceresi, setAsistanPenceresi] = useState(false);
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
    kontrolEdildi: false,
    aktif: false,
    proAktif: demoModu,
    proBitis: null,
    proYonetimUrl: null,
    proKaynak: null,
    proYenilenecek: false,
    trialAktif: false,
    trialBaslangic: null,
    trialBitis: null,
    trialKalanGun: 0,
    hata: "",
  });
  const [proPaketler, setProPaketler] = useState({
    yukleniyor: true,
    monthly: null,
    annual: null,
    hata: "",
  });
  // Native: kullanicinin App Store ulkesinde Pro satista mi ("var" | "yok" |
  // null). Son bilinen durum cihazda saklanir; acilista onunla baslanir ki
  // teklifler yuklenirken Pro yuzeyleri gorunup kaybolmasin. Web'de daima "var".
  const [proSatisDurumu, setProSatisDurumu] = useState(() => kayitliProSatisDurumu());
  const [proGeriYukleme, setProGeriYukleme] = useState({ yukleniyor: false, hata: "" });
  const [proSatinAlma, setProSatinAlma] = useState({
    yukleniyor: false,
    hata: "",
    plan: null,
  });
  const [yeniUyelikOnizlemesi] = useState(
    () =>
      demoModu &&
      new URLSearchParams(window.location.search).get("yeni") === "1",
  );
  const veriDepolamaAnahtari = yeniUyelikOnizlemesi
    ? "borctakip:v999"
    : "borctakip:v1";
  const planOnizlemesiAktif = import.meta.env.DEV;
  const [demoPlan, setDemoPlan] = useState(() => {
    if (!import.meta.env.DEV) return "gercek";
    if (
      demoModu &&
      new URLSearchParams(window.location.search).get("yeni") === "1"
    )
      return "pro";
    return localStorage.getItem("borcama:demo-plan") === "free" ? "free" : "pro";
  });
  // Pro satilmayan magazada (native) satin alma yuzeyleri gizlenir ve Pro'ya
  // bagli ozellikler ucretsiz acilir; ucretli aboneligi olan kullanici (ör.
  // Turkiye'de alip baska ulkeye gecen) normal Pro akisini gormeye devam eder.
  const ucretliPro = reklamsiz.proAktif && !reklamsiz.trialAktif;
  const proSatistaDegil = proSatisDurumu === "yok" && !ucretliPro;
  // Satis durumu henuz bilinmiyorsa (ilk acilis) "Pro'ya Gec" teklifler
  // yuklenene kadar bekler; gosterilip sonra kaybolmaz.
  const proSatisBekleniyor = nativeMi && proSatisDurumu === null && proPaketler.yukleniyor;
  const etkinPro = planOnizlemesiAktif
    ? demoPlan === "pro" || proSatistaDegil
    : reklamsiz.proAktif || proSatistaDegil;
  const demoPlaniDegistir = (plan) => {
    setDemoPlan(plan);
    localStorage.setItem("borcama:demo-plan", plan);
  };
  const [borcKategori, setBorcKategori] = useState("cards");
  const [ekstreYuklemeIstegi, setEkstreYuklemeIstegi] = useState(0);
  const [odemeFiltresi, setOdemeFiltresi] = useState("bekleyen");
  const [hizliMenuAcik, setHizliMenuAcik] = useState(false);
  const [proPenceresiAcik, setProPenceresiAcik] = useState(false);
  const [trialHatirlaticiAcik, setTrialHatirlaticiAcik] = useState(false);
  const [borcKutlamasi, setBorcKutlamasi] = useState(null);
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
        fetch(apiAdresi("/api/market-prices"), { headers: { Accept: "application/json" } }),
        fonKodlari.length
          ? fetch(apiAdresi("/api/fund-prices?codes=" + encodeURIComponent(fonKodlari.join(","))), {
              headers: { Accept: "application/json" },
            })
          : Promise.resolve(null),
        hisseKodlari.length
          ? fetch(apiAdresi("/api/stock-prices?codes=" + encodeURIComponent(hisseKodlari.join(","))), {
              headers: { Accept: "application/json" },
            })
          : Promise.resolve(null),
        hisseAbdKodlari.length
          ? fetch(apiAdresi("/api/stock-prices?market=US&codes=" + encodeURIComponent(hisseAbdKodlari.join(","))), {
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
      const oncekiFiyatlar = piyasa.prices || {};
      const yeni = {
        prices: {
          ...piyasaFiyatlariniBirlestir(oncekiFiyatlar, sonuc.prices, !!sonuc.partial),
          funds: kodBazliFiyatlariBirlestir(oncekiFiyatlar.funds, fonSonucu?.funds),
          stocks: kodBazliFiyatlariBirlestir(oncekiFiyatlar.stocks, hisseFiyatlari),
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
            ? t("kabuk.piyasa.kismi")
            : "",
      };
      setPiyasa(yeni);
      localStorage.setItem("borcama:piyasa:v1", JSON.stringify(yeni));
    } catch {
      setPiyasa((eski) => ({
        ...eski,
        yukleniyor: false,
        hata: Object.keys(eski.prices || {}).length
          ? t("kabuk.piyasa.eskiDegerler")
          : t("kabuk.piyasa.alinamadi"),
      }));
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const s = await window.storage.get(veriDepolamaAnahtari);
        if (s && s.value) {
          const kayitliVeri = {
            ...BOS_VERI,
            ...JSON.parse(s.value),
          };
          const demoKaydiBos =
            demoModu &&
            !yeniUyelikOnizlemesi &&
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
              veriDepolamaAnahtari,
              JSON.stringify(borcSonucu.veri),
            );
        } else {
          const ilkVeri = demoModu && !yeniUyelikOnizlemesi
            ? demoVerisiOlustur()
            : {
                ...BOS_VERI,
                ayarlar: { ekstreDonemleriV2: true, ekstreBorcModeliV3: true },
              };
          setVeri(ilkVeri);
          if (demoModu)
            await window.storage.set(veriDepolamaAnahtari, JSON.stringify(ilkVeri));
        }
      } catch (e) {
        setHata(
          t("kabuk.hata.yuklenemedi", { yonerge: yenilemeYonergesiKucuk }),
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
    const url = new URL(window.location.href);
    if (url.searchParams.get("feedback") !== "1") return;
    setGeriBildirimPenceresi(true);
    url.searchParams.delete("feedback");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("assistant") !== "1") return;
    setAsistanPenceresi(true);
    url.searchParams.delete("assistant");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }, []);

  useEffect(() => {
    if (yukleniyor || rehberKontrolEdildi) return;
    setRehberKontrolEdildi(true);
    const zorla = new URLSearchParams(window.location.search).get("rehber") === "1";
    if (zorla) rehberAdiminaGit(0);
  }, [yukleniyor, rehberKontrolEdildi, veri]);

  useEffect(() => {
    supabase.auth
      .getUser()
      .then(async ({ data }) => {
        const kullanici = data?.user;
        setKullaniciEposta(kullanici?.email || "");
        if (!revenueCatHazir || !kullanici?.id) {
          // Misafir (native): hesap olmadan anonim RevenueCat ile bu App Store
          // ulkesinde Pro satista mi ogrenilir; satilmiyorsa Pro yuzeyleri
          // misafirde de gizlenir. Satin alma yine hesap ister.
          if (nativeMi && revenueCatHazir) {
            try {
              proSatisKarariniUygula({ paketler: await revenueCatNativeTeklifleri() });
            } catch (error) {
              proSatisKarariniUygula({ hata: error });
            }
          }
          setProPaketler({
            yukleniyor: false,
            monthly: null,
            annual: null,
            hata: t("kabuk.pro.fiyatYok"),
          });
          return;
        }
        try {
          const paketler = await revenueCatProPaketleri(kullanici.id);
          proSatisKarariniUygula({ paketler });
          setProPaketler({
            yukleniyor: false,
            monthly: paketler.monthly || null,
            annual: paketler.annual || null,
            hata: "",
          });
        } catch (error) {
          proSatisKarariniUygula({ hata: error });
          setProPaketler({
            yukleniyor: false,
            monthly: null,
            annual: null,
            hata: t("kabuk.pro.fiyatYok"),
          });
        }
      });
  }, []);

  function proSatisKarariniUygula(sonuc) {
    if (!nativeMi) return;
    const durum = proSatisDurumuBelirle(sonuc);
    if (!durum) return;
    proSatisDurumunuKaydet(durum);
    setProSatisDurumu(durum);
  }

  async function reklamsizKontrol() {
    // Yalniz ilk sorguda "yukleniyor" isaretlenir. Her yenilemede isaretlenince
    // ustteki "Pro'ya Gec" dugmesi kaybolup geri geliyor, ekran titriyordu.
    setReklamsiz((eski) => ({
      ...eski,
      yukleniyor: !eski.kontrolEdildi,
      hata: "",
    }));
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
      const proEngelli = ["admin_revoked", "self_revoked"].includes(sonuc.source);
      // App Store aboneligi aktifken hicbir yerel bayrak Pro'yu kapatamaz:
      // odeme yapmis kullanici hicbir kosulda erisimsiz kalmamali.
      const ucretliProAktif = !!rc.active || (!proEngelli && !!sonuc.proActive);
      const trialAktif = !ucretliProAktif && !proEngelli && !!sonuc.trialActive;
      setReklamsiz({
        yukleniyor: false,
        kontrolEdildi: true,
        aktif: !!sonuc.adFreeLifetime,
        proAktif: ucretliProAktif || trialAktif,
        proBitis: rc.active
          ? rc.expiresAt
          : !proEngelli
            ? sonuc.proExpiresAt || (trialAktif ? sonuc.trialEndsAt : null)
            : null,
        proYonetimUrl: rc.managementURL || null,
        proKaynak: rc.active ? "revenuecat" : ucretliProAktif ? sonuc.source || null : trialAktif ? "trial" : sonuc.source || null,
        proYenilenecek: !!rc.willRenew,
        trialAktif,
        trialBaslangic: sonuc.trialStartedAt || null,
        trialBitis: sonuc.trialEndsAt || null,
        trialKalanGun: trialAktif ? Math.max(1, +sonuc.trialDaysRemaining || 1) : 0,
        hata: "",
      });
    } catch {
      setReklamsiz({
        yukleniyor: false,
        kontrolEdildi: true,
        aktif: false,
        proAktif: demoModu,
        proBitis: null,
        proYonetimUrl: null,
        proKaynak: null,
        proYenilenecek: false,
        trialAktif: false,
        trialBaslangic: null,
        trialBitis: null,
        trialKalanGun: 0,
        hata: t("kabuk.pro.durumKontrol"),
      });
    }
  }

  async function manuelProIptal() {
    setReklamsiz((eski) => ({ ...eski, yukleniyor: true, hata: "" }));
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("Oturum bulunamadı");
      const cevap = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/shopier-entitlement`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "revoke_self_manual_pro" }),
        },
      );
      const sonuc = await cevap.json();
      if (!cevap.ok) throw new Error(sonuc.error || "Paket güncellenemedi");
      setReklamsiz((eski) => ({
        ...eski,
        yukleniyor: false,
        kontrolEdildi: true,
        proAktif: false,
        proBitis: null,
        proYonetimUrl: null,
        proKaynak: "self_revoked",
        proYenilenecek: false,
        trialAktif: false,
        trialBaslangic: null,
        trialBitis: null,
        trialKalanGun: 0,
        hata: "",
      }));
    } catch {
      setReklamsiz((eski) => ({
        ...eski,
        yukleniyor: false,
        kontrolEdildi: true,
        hata: t("kabuk.pro.ucretsizGecis"),
      }));
    }
  }

  async function paddleProIptal() {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw new Error("UNAUTHORIZED");
    const cevap = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/shopier-entitlement`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "cancel_paddle_subscription" }),
      },
    );
    const sonuc = await cevap.json().catch(() => ({}));
    if (!cevap.ok) throw new Error(sonuc.error || "PADDLE_CANCELLATION_FAILED");
    setReklamsiz((eski) => ({
      ...eski,
      proYenilenecek: false,
      proBitis: sonuc.effectiveAt || eski.proBitis,
      hata: "",
    }));
    return sonuc;
  }

  async function paddleOdemeKartiGuncelle(onCompleted) {
    if (!paddleKartYonetimiHazir) throw new Error("PADDLE_CLIENT_NOT_CONFIGURED");
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw new Error("UNAUTHORIZED");
    const cevap = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/shopier-entitlement`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "create_paddle_payment_update" }),
      },
    );
    const sonuc = await cevap.json().catch(() => ({}));
    if (!cevap.ok) throw new Error(sonuc.error || "PADDLE_PAYMENT_UPDATE_FAILED");
    await paddleKartGuncellemeEkraniAc(sonuc.transactionId, onCompleted);
  }

  async function hesabiSil(onay) {
    const sonuc = await borcamaHesabiniSil({
      supabase,
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
      onay,
    });
    borcamaYerelVerileriniTemizle();
    await supabase.auth.signOut({ scope: "local" }).catch(() => {});
    window.location.replace("/?account_deleted=1");
    return sonuc;
  }

  // App Store Guideline 3.1.1: satin alimlari geri yukleme yolu, satin alma
  // ekraninin kendisinde bulunmalidir.
  async function proSatinAlimlariGeriYukle() {
    setProGeriYukleme({ yukleniyor: true, hata: "" });
    try {
      const { data } = await supabase.auth.getSession();
      const kullanici = data.session?.user;
      if (!kullanici?.id) throw new Error("Oturum bulunamadı.");
      const sonuc = await revenueCatSatinAlimlariGeriYukle(kullanici.id);
      if (sonuc.active) {
        setProGeriYukleme({ yukleniyor: false, hata: "" });
        await reklamsizKontrol();
        return;
      }
      setProGeriYukleme({
        yukleniyor: false,
        hata: t("kabuk.pro.geriYuklenecekYok"),
      });
    } catch {
      setProGeriYukleme({
        yukleniyor: false,
        hata: t("kabuk.pro.geriYuklenemedi"),
      });
    }
  }

  async function proSatinAl(plan = "monthly") {
    if (!revenueCatHazir) {
      setProSatinAlma({
        yukleniyor: false,
        hata: t("kabuk.pro.odemeSistemiYok"),
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
      if (!nativeMi) await googleAdsSatinAlmaDonusumu(sonuc);
      await revenueCatProHakkiniSenkronizeEt();
      setReklamsiz((eski) => ({
        ...eski,
        yukleniyor: false,
        kontrolEdildi: true,
        proAktif: true,
        proBitis: sonuc.expiresAt || null,
        proYonetimUrl: sonuc.managementURL || null,
        proKaynak: "revenuecat",
        proYenilenecek: !!sonuc.willRenew,
        trialAktif: false,
        hata: "",
      }));
      window.location.assign("/welcome");
    } catch (error) {
      setProSatinAlma({
        yukleniyor: false,
        hata: t("kabuk.pro.odemeEkrani"),
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
    if (reklamsiz.yukleniyor || !reklamsiz.trialAktif) {
      setTrialHatirlaticiAcik(false);
      return;
    }
    if (reklamsiz.trialKalanGun < 1 || reklamsiz.trialKalanGun > 5) {
      setTrialHatirlaticiAcik(false);
      return;
    }
    const bugun = new Date().toISOString().slice(0, 10);
    const denemeAnahtari = reklamsiz.trialBitis || "aktif-deneme";
    const kapatmaAnahtari = `borcama:trial-hatirlatici:${denemeAnahtari}`;
    setTrialHatirlaticiAcik(localStorage.getItem(kapatmaAnahtari) !== bugun);
  }, [
    reklamsiz.yukleniyor,
    reklamsiz.trialAktif,
    reklamsiz.trialKalanGun,
    reklamsiz.trialBitis,
  ]);

  function trialHatirlaticiyiKapat() {
    const bugun = new Date().toISOString().slice(0, 10);
    const denemeAnahtari = reklamsiz.trialBitis || "aktif-deneme";
    localStorage.setItem(`borcama:trial-hatirlatici:${denemeAnahtari}`, bugun);
    setTrialHatirlaticiAcik(false);
  }

  useEffect(() => {
    if (!yukleniyor) piyasaFiyatlariniYenile();
  }, [yukleniyor, piyasaKodAnahtari]);

  function setSekme(yeniSekme) {
    setSekmeState(yeniSekme);
    const yol = SEKME_YOLLARI[yeniSekme];
    if (yol && window.location.pathname !== yol)
      window.history.pushState({}, "", yol);
  }

  function aktivasyonAdiminiBaslat(gorev) {
    setForm(null);
    if (gorev?.id === "debt") {
      setBorcKategori("cards");
      setEkstreYuklemeIstegi((eski) => eski + 1);
      setSekme("borclar");
      return;
    }
    if (gorev?.id === "income") {
      setSekme("gelir");
      setForm({ liste: "incomes", veri: {} });
      return;
    }
    if (gorev?.id === "activity") {
      setSekme("harcamalar");
      setForm({ liste: "expenses", veri: {} });
      return;
    }
    setSekme(gorev?.hedef || "ozet");
  }

  function rehberAksiyonu(oneri, secenek) {
    if (secenek) {
      // Rehberden doğrudan ilgili borç formunu aç.
      setBorcKategori(secenek);
      setSekme("borclar");
      setForm({ liste: KATEGORI_META[secenek]?.liste || "cards", veri: {} });
      return;
    }
    if (oneri.tur === "kurulum") return aktivasyonAdiminiBaslat(oneri.gorev);
    if (oneri.tur === "mezuniyet") return ayarKaydet({ rehber: rehberiMezunEt(veri.ayarlar?.rehber) });
    if (oneri.id === "sabit-gider") {
      setSekme("sabit-giderler");
      setForm({ liste: "expenses", veri: {} });
      return;
    }
    setForm(null);
    if (oneri.tur === "ekstre") {
      setBorcKategori("cards");
      setEkstreYuklemeIstegi((eski) => eski + 1);
    }
    setSekme(oneri.hedef || "ozet");
  }

  function rehberAdiminaGit(adim) {
    const hedefler = ["ozet", "borclar", "odemeler"];
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
    const aktiviteOlaylari = aktiviteOlaylariniCikar(veri, yeni);
    const kalemler = borcKalemleri(yeni);
    const toplam = kalemler.reduce((t, k) => t + k.bakiye, 0);
    yeni = {
      ...yeni,
      snapshots: { ...(yeni.snapshots || {}), [ayAnahtari()]: toplam },
    };
    setVeri(yeni);
    setKaydediliyor(true);
    try {
      await window.storage.set(veriDepolamaAnahtari, JSON.stringify(yeni));
      void aktiviteleriKaydet(aktiviteOlaylari);
      setHata("");
    } catch (e) {
      setHata(
        e?.message === "VERI_CAKISMASI"
          ? t("kabuk.hata.cakisma", { yonerge: yenilemeYonergesi.toLocaleLowerCase("tr") })
          : t("kabuk.hata.kayit"),
      );
    } finally {
      setKaydediliyor(false);
    }
  }

  // Hesapsiz kullanim: hesaba bagli isler (Pro, asistan, cikis, davet, hesap
  // silme) kayit ekranina yonlendirilir; geri kalan her sey cihazda calisir.
  const misafir = misafirModuAcik();
  const isDark = (veri.ayarlar || {}).tema === "dark";
  const ozelBankalar = (veri.ayarlar || {}).ozelBankalar || [];
  // TRY disinda Turk banka listesi gosterilmez; kullanicinin ekledigi ve
  // kayitlarinda gecen bankalar kalir, "Diger" ile serbest metin girilir.
  const bankalar = useMemo(
    () => bankaSecenekleri({
      turkBankalari: BANKALAR,
      ozelBankalar,
      kayitliBankalar: [...(veri.cards || []), ...(veri.loans || []), ...(veri.overdrafts || [])].map((k) => k?.banka),
      // TRY borcu olan kullaniciya (ana birimi ne olursa olsun) Turk bankalari da listelenir.
      ...(tryKaydiVar(tumBorcKayitlari(veri)) ? { birim: "TRY" } : {}),
    }),
    [ozelBankalar, veri.cards, veri.loans, veri.overdrafts, veri.others],
  );
  const temaAnahtarlarSwitch = () =>
    ayarKaydet({ tema: isDark ? "light" : "dark" });
  const temaRenkleri = isDark ? KOYU_TEMA : ACIK_TEMA;
  const rootStyle = {
    "--bg": temaRenkleri.bg,
    "--panel": temaRenkleri.panel,
    "--panel2": temaRenkleri.panel2,
    "--text": temaRenkleri.text,
    "--dim": temaRenkleri.dim,
    "--faint": temaRenkleri.faint,
    "--line": temaRenkleri.line,
    "--line-soft": temaRenkleri.lineSoft,
    "--summary-bg": temaRenkleri.summaryBg,
    "--summary-soft": temaRenkleri.summarySoft,
    "--summary-text": temaRenkleri.summaryText,
    "--summary-muted": temaRenkleri.summaryMuted,
    "--summary-amount": temaRenkleri.summaryAmount,
    "--summary-shadow": temaRenkleri.summaryShadow,
    "--debt-card": temaRenkleri.debtCard,
    "--debt-loan": temaRenkleri.debtLoan,
    "--debt-account": temaRenkleri.debtAccount,
    "--debt-other": temaRenkleri.debtOther,
  };

  // Borc bazinda para birimi: son bilinen kur (yerelde saklanir). Ana
  // birimdeki kayitlarda carpan 1 oldugundan tek birimli kullanicida etkisiz.
  const kurTablosu = useMemo(
    () => kurTablosunuAyarla(kurTablosuOlustur(piyasa.prices, piyasa.updatedAt)),
    [piyasa.prices, piyasa.updatedAt],
  );
  const kurNotuDurumu = useMemo(() => kurDurumu(veri, kurTablosu), [veri, kurTablosu]);
  const kalemler = useMemo(() => borcKalemleri(veri, kurTablosu), [veri, kurTablosu]);

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
    // Tutarlar kaydin biriminde; ana birime cevrilerek toplanir (kur yoksa disarida).
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
      return t + anaTutar(Math.max(hedef - h.odeme, 0), k, kurTablosu);
    }, 0);
    const ay = ayAnahtari();
    const taksit = veri.loans.reduce(
      (t, k) =>
        t +
        ((+k.kalanBorc || 0) <= 0 ||
        veri.paid?.["kredi-" + k.id + "-" + ay]
          ? 0
          : anaTutar(+k.taksit || 0, k, kurTablosu)),
      0,
    );
    return kartOdeme + taksit;
  }, [veri, kurTablosu]);

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
        const yasalOran = krediKartiAsgariOrani(k.limit);
        // TRY disi birimde BDDK orani uygulanmaz; girilen asgari kullanilir.
        const kartBirimi = kayitParaBirimi(k);
        const yasalAsgari = yasalAsgariUygulanir(kartBirimi);
        const hedefTutar = yeniModel
          ? yasalAsgari ? h.onceki * yasalOran : h.asgari
          : +k.asgari > 0
            ? +k.asgari
            : yasalAsgari ? anaBorc * yasalOran : bolgeAsgariOdemesi(anaBorc, h.oran, bolgeProfili(kartBirimi));
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
          ad: kartGorunenAdi(k),
          tutar,
          kalanToplam,
          minimumOdeme: hedefTutar,
          hedefTutar,
          yapilanOdeme,
          odemeKayitSayisi: odemeKayitlari.length,
          odemeBilgisiYok,
          not: t("kabuk.odeme.kalanMinimum"),
          tarih: kartGecikmeTarihi(k),
          odendi: minimumTamam,
          minimumTamam,
          tamamiOdendi,
          anahtar: odemeAnahtari,
          ...(yabanciBirim(k) ? { paraBirimi: yabanciBirim(k) } : {}),
        });
      }
    });
    veri.loans.forEach((k) => {
      if ((+k.kalanBorc || 0) > 0 && loanIsDueInMonth(k, bugun())) {
        const anahtar = "kredi-" + k.id + "-" + ay;
        const odemeKaydi = veri.loanPaymentHistory?.[ay]?.[k.id];
        const taksit = +k.taksit || 0;
        const yapilanOdeme = Math.max(
          +(odemeKaydi?.tutar ?? (veri.paid[anahtar] ? taksit : 0)) || 0,
          0,
        );
        const elleOdendi = yapilanOdeme + 0.01 >= taksit;
        liste.push({
          id: "kredi-" + k.id,
          krediId: k.id,
          banka: k.banka,
          ad: k.banka + (k.ad ? " · " + k.ad : ""),
          tutar: Math.max(taksit - yapilanOdeme, 0),
          hedefTutar: taksit,
          yapilanOdeme,
          kalanKrediBorcu: +k.kalanBorc || 0,
          not: t("kabuk.odeme.buAykiTaksit"),
          tarih: buAyOdemeTarihi(k.odemeGunu),
          odendi: elleOdendi,
          anahtar,
          ...(yabanciBirim(k) ? { paraBirimi: yabanciBirim(k) } : {}),
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
      .filter((k) => (+k.kalanBorc || 0) > 0 && (+k.taksit || 0) > 0 && loanIsDueInMonth(k, new Date(yil, ay, 1)))
      .map((k) => {
        const gun = Math.min(
          Math.max(parseInt(k.odemeGunu) || 1, 1),
          new Date(yil, ay + 1, 0).getDate(),
        );
        return {
          id: "gelecek-kredi-" + k.id,
          krediId: k.id,
          banka: k.banka,
          ad: k.banka + (k.ad ? " · " + k.ad : ""),
          tutar: +k.taksit || 0,
          hedefTutar: +k.taksit || 0,
          yapilanOdeme: 0,
          kalanKrediBorcu: +k.kalanBorc || 0,
          not: t("kabuk.odeme.gelecekAyTaksiti"),
          tarih: new Date(yil, ay, gun),
          odendi: false,
          anahtar: "kredi-" + k.id + "-" + ayAnahtari(new Date(yil, ay, 1)),
          ...(yabanciBirim(k) ? { paraBirimi: yabanciBirim(k) } : {}),
        };
      })
      .sort((a, b) => a.tarih - b.tarih);
  }, [veri]);

  const buAyHarcama = useMemo(() => {
    const ay = ayAnahtari();
    const kategoriler = {};
    const kaynaklar = {};
    let toplam = 0;
    let adet = 0;
    veri.expenses.forEach((h) => {
      const kart = veri.cards.find(
        (k) => h.kaynak === k.banka + " · " + (k.ad || "Kredi kartı"),
      );
      const tutar = h.tekrar === "Her ay"
        ? +h.tutar || 0
        : kart
        ? expenseInstallmentAmountForPeriod(h, kart, ay)
        : (h.tarih || "").startsWith(ay)
          ? +h.tutar || 0
          : 0;
      if (tutar <= 0) return;
      toplam += tutar;
      adet += 1;
      kategoriler[h.kategori] = (kategoriler[h.kategori] || 0) + tutar;
      const kaynak = h.kaynak || "Belirtilmemiş";
      kaynaklar[kaynak] = (kaynaklar[kaynak] || 0) + tutar;
    });
    return { toplam, kategoriler, kaynaklar, adet };
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

  function ekleGuncelle(liste, kayit, secenekler = {}) {
    const dizi = veri[liste];
    const oncekiKayit = dizi.find((x) => x.id === kayit.id) || null;
    const varMi = !!oncekiKayit;
    // Yeni kayda eklenme zamanı: rehber, eklenmeden önce geçmiş ödeme için hatırlatma yapmaz.
    if (!varMi && !kayit.eklendi) kayit = { ...kayit, eklendi: new Date().toISOString() };
    const yeniVeri = {
      ...veri,
      [liste]: varMi
        ? dizi.map((x) => (x.id === kayit.id ? kayit : x))
        : [...dizi, kayit],
    };
    kaydet(islemEkle(yeniVeri, {
      tur: varMi ? "guncelleme" : "ekleme",
      baslik: kayit.banka || kayit.ad || t("islem.finansalKayit"),
      detay: varMi ? t("islem.kayitGuncellendi") : t("islem.yeniKayit"),
      geriAl: { tip: "liste", liste, id: kayit.id, oncekiKayit },
    }));
    if (!secenekler.formuKoru) setForm(null);
  }
  const sil = (liste, id) => {
    const oncekiKayit = veri[liste].find((x) => x.id === id);
    if (!oncekiKayit) return;
    const yeniVeri = { ...veri, [liste]: veri[liste].filter((x) => x.id !== id) };
    kaydet(islemEkle(yeniVeri, {
      tur: "silme",
      baslik: oncekiKayit.banka || oncekiKayit.ad || t("islem.finansalKayit"),
      detay: t("islem.kayitSilindi"),
      geriAl: { tip: "liste", liste, id, oncekiKayit },
    }));
  };

  const kartYapilandir = (plan) => {
    const sonuc = applyCardRestructuring(veri, {
      ...plan,
      restructuringId: uid(),
      loanId: uid(),
      createdAt: new Date().toISOString(),
    });
    if (sonuc.error) return sonuc.error;
    // Yapilandirma kredisi kartin para birimini devralir.
    const kartBirimi = sonuc.cardBefore.paraBirimi;
    const yeniVeri = kartBirimi
      ? { ...sonuc.data, loans: sonuc.data.loans.map((kredi) => kredi.id === sonuc.loan.id ? { ...kredi, paraBirimi: kartBirimi } : kredi) }
      : sonuc.data;
    kaydet(islemEkle(yeniVeri, {
      tur: "guncelleme",
      baslik: t("islem.yapilandirmaBaslik", { banka: sonuc.cardBefore.banka || t("islem.kart") }),
      detay: t("islem.yapilandirmaDetay", { tutar: fmt(plan.amount, yabanciBirim(sonuc.cardBefore)) }),
      geriAl: {
        tip: "kart_yapilandirma",
        kartId: sonuc.cardBefore.id,
        oncekiKart: sonuc.cardBefore,
        krediId: sonuc.loan.id,
      },
    }));
    return null;
  };

  function ekstreArsivIslemi(islem) {
    const sonuc = islem.tip === "tasi"
      ? moveUploadedStatement(veri, islem)
      : removeUploadedStatement(veri, {
          ...islem,
          removeFinancialRecord: islem.tip === "kaydi_sil",
        });
    if (sonuc.error) return sonuc.error;
    const kaynakKart = veri.cards.find((kart) => kart.id === islem.cardId);
    const hedefKart = veri.cards.find((kart) => kart.id === islem.targetCardId);
    const detay = islem.tip === "tasi"
      ? t("islem.ekstreTasindi", { ay: ayEtiketi(islem.period), hedef: hedefKart?.banka || t("islem.digerKarta") })
      : islem.tip === "kaydi_sil"
        ? t("islem.ekstreVeKayitSilindi", { ay: ayEtiketi(islem.period) })
        : t("islem.yuklemeKaldirildi", { ay: ayEtiketi(islem.period) });
    kaydet(islemEkle(sonuc.data, {
      tur: islem.tip === "tasi" ? "guncelleme" : "silme",
      baslik: t("islem.ekstreArsivi", { banka: kaynakKart?.banka || t("islem.kart") }),
      detay,
    }));
    return null;
  }

  function islemEkle(yeniVeri, islem) {
    const kayit = {
      id: "islem-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
      tarih: new Date().toISOString(),
      ...islem,
    };
    return {
      ...yeniVeri,
      activityHistory: [kayit, ...(yeniVeri.activityHistory || [])].slice(0, 30),
    };
  }

  function islemiGeriAl(islemId) {
    const islem = (veri.activityHistory || []).find((x) => x.id === islemId);
    if (!islem || islem.geriAlindi || !islem.geriAl) return;
    const geriAl = islem.geriAl;
    let yeniVeri = { ...veri };
    if (geriAl.tip === "liste") {
      const liste = [...(veri[geriAl.liste] || [])];
      const indeks = liste.findIndex((x) => x.id === geriAl.id);
      if (geriAl.oncekiKayit) {
        if (indeks >= 0) liste[indeks] = geriAl.oncekiKayit;
        else liste.push(geriAl.oncekiKayit);
      } else if (indeks >= 0) liste.splice(indeks, 1);
      yeniVeri[geriAl.liste] = liste;
    } else if (geriAl.tip === "kart_odeme") {
      yeniVeri.cards = (veri.cards || []).map((kart) =>
        kart.id === geriAl.kartId ? geriAl.oncekiKart : kart,
      );
      yeniVeri.cardPaymentHistory = {
        ...(veri.cardPaymentHistory || {}),
        [geriAl.anahtar]: geriAl.oncekiGecmis || [],
      };
    } else if (geriAl.tip === "kredi_odeme") {
      yeniVeri.loans = (veri.loans || []).map((kredi) =>
        kredi.id === geriAl.krediId ? geriAl.oncekiKredi : kredi,
      );
      const ayGecmisi = { ...(veri.loanPaymentHistory?.[geriAl.ay] || {}) };
      if (geriAl.oncekiOdeme) ayGecmisi[geriAl.krediId] = geriAl.oncekiOdeme;
      else delete ayGecmisi[geriAl.krediId];
      yeniVeri.loanPaymentHistory = {
        ...(veri.loanPaymentHistory || {}),
        [geriAl.ay]: ayGecmisi,
      };
      yeniVeri.paid = {
        ...(veri.paid || {}),
        [geriAl.anahtar]: !!geriAl.oncekiPaid,
      };
    } else if (geriAl.tip === "kart_yapilandirma") {
      yeniVeri.cards = (veri.cards || []).map((kart) =>
        kart.id === geriAl.kartId ? geriAl.oncekiKart : kart,
      );
      yeniVeri.loans = (veri.loans || []).filter((kredi) => kredi.id !== geriAl.krediId);
    }
    yeniVeri.activityHistory = (veri.activityHistory || []).map((x) =>
      x.id === islemId ? { ...x, geriAlindi: true } : x,
    );
    kaydet(yeniVeri);
  }
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
    const oncekiKart = (veri.cards || []).find((kart) => kart.id === kartId);
    const yeniVeri = {
      ...veri,
      cards,
      cardPaymentHistory: {
        ...(veri.cardPaymentHistory || {}),
        [anahtar]: [...oncekiKayitlar, yeniKayit],
      },
    };
    return kaydet(islemEkle(yeniVeri, {
      tur: "odeme",
      baslik: oncekiKart
        ? oncekiKart.banka + (oncekiKart.ad ? " · " + oncekiKart.ad : "")
        : t("islem.krediKartiOdemesi"),
      detay: t("islem.kartOdemesiKaydedildi", { tutar: fmt(temizTutar) }),
      geriAl: {
        tip: "kart_odeme",
        kartId,
        anahtar,
        oncekiKart,
        oncekiGecmis: oncekiKayitlar,
      },
    }));
  };

  const kartOdemesiDegistir = (anahtar, odemeId, yeniTutar) => {
    const oncekiKayitlar = veri.cardPaymentHistory?.[anahtar] || [];
    const oncekiOdeme = oncekiKayitlar.find((kayit) => kayit.id === odemeId);
    if (!oncekiOdeme) return;
    const siliniyor = yeniTutar === null;
    const temizTutar = siliniyor ? 0 : Math.max(+yeniTutar || 0, 0);
    if (!siliniyor && temizTutar <= 0) return;
    const fark = temizTutar - (+oncekiOdeme.tutar || 0);
    const eslesme = anahtar.match(/^kart-(.+)-ekstre-(\d{4}-\d{2})$/);
    const kartId = eslesme?.[1];
    const ekstreAyi = eslesme?.[2];
    const odemeyiUygula = (kayit) => {
      const azami = kartHesabi(kayit).onceki;
      return {
        ...kayit,
        yapilanOdeme: Math.min(Math.max((+kayit.yapilanOdeme || 0) + fark, 0), azami),
      };
    };
    const cards = (veri.cards || []).map((kart) => {
      if (kart.id !== kartId) return kart;
      if (kart.ekstreAyi === ekstreAyi) return odemeyiUygula(kart);
      return {
        ...kart,
        ekstreGecmisi: (kart.ekstreGecmisi || []).map((ekstre) => {
          if (ekstre.ekstreAyi !== ekstreAyi) return ekstre;
          const guncellenen = odemeyiUygula({ ...kart, ...ekstre });
          return { ...ekstre, yapilanOdeme: guncellenen.yapilanOdeme };
        }),
      };
    });
    const yeniKayitlar = siliniyor
      ? oncekiKayitlar.filter((kayit) => kayit.id !== odemeId)
      : oncekiKayitlar.map((kayit) =>
          kayit.id === odemeId ? { ...kayit, tutar: temizTutar } : kayit,
        );
    kaydet({
      ...veri,
      cards,
      cardPaymentHistory: {
        ...(veri.cardPaymentHistory || {}),
        [anahtar]: yeniKayitlar,
      },
    });
  };

  const krediOdemesiKaydet = (anahtar, tutar, tur) => {
    const ay = anahtar?.slice(-7);
    const krediId = anahtar?.slice(6, -8);
    const kredi = (veri.loans || []).find((x) => x.id === krediId);
    const temizTutar = Math.max(+tutar || 0, 0);
    if (!kredi || !ay || temizTutar <= 0) return;
    const oncekiAyGecmisi = veri.loanPaymentHistory?.[ay] || {};
    const oncekiOdeme = oncekiAyGecmisi[krediId] || null;
    const oncekiPaid = !!veri.paid?.[anahtar];
    const taksit = Math.max(+kredi.taksit || 0, 0);
    const oncekiTutar = Math.max(+(oncekiOdeme?.tutar ?? 0) || 0, 0);
    const toplamTutar = oncekiTutar + temizTutar;
    const kapandi = loanClosesAfterPayment({
      loan: kredi,
      history: veri.loanPaymentHistory,
      period: ay,
      periodPaymentTotal: toplamTutar,
      paymentType: tur,
    });
    const kapanisTarihi = kapandi ? new Date().toISOString() : null;
    const odemeKaydi = {
      krediId,
      banka: kredi.banka,
      ad: kredi.ad,
      taksit,
      tutar: toplamTutar,
      tur,
      kalanBorc: kredi.kalanBorc,
      kalanTaksit: kredi.kalanTaksit,
      odemeGunu: kredi.odemeGunu,
      odendiTarihi: new Date().toISOString(),
    };
    const loans = (veri.loans || []).map((x) =>
      x.id === krediId && kapandi
        ? { ...x, kalanBorc: 0, kalanTaksit: 0, kapatildiTarihi: kapanisTarihi, kapanisKutlandi: new Date().toISOString() }
        : x,
    );
    const yeniVeri = {
      ...veri,
      loans,
      paid: { ...(veri.paid || {}), [anahtar]: kapandi || toplamTutar + 0.01 >= taksit },
      loanPaymentHistory: {
        ...(veri.loanPaymentHistory || {}),
        [ay]: { ...oncekiAyGecmisi, [krediId]: odemeKaydi },
      },
    };
    const kayitIslemi = kaydet(islemEkle(yeniVeri, {
      tur: "odeme",
      baslik: kredi.banka + (kredi.ad ? " · " + kredi.ad : ""),
      detay: kapandi
        ? t("islem.krediKapatildi")
        : t("islem.krediOdemesiKaydedildi", { tutar: fmt(temizTutar) }),
      geriAl: {
        tip: "kredi_odeme",
        krediId,
        ay,
        anahtar,
        oncekiKredi: kredi,
        oncekiOdeme,
        oncekiPaid,
      },
    }));
    if (kapandi) {
      setBorcKutlamasi({
        tur: "Kredi",
        baslik: kredi.banka + (kredi.ad ? " · " + kredi.ad : ""),
      });
    }
    return kayitIslemi;
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
        hata: t("kabuk.parola.enAz8"),
        tamam: false,
      });
    if (parolaFormu.parola !== parolaFormu.tekrar)
      return setParolaDurumu({
        kaydediliyor: false,
        hata: t("kabuk.parola.eslesmiyor"),
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
            hata: t("kabuk.parola.kaydedilemedi"),
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
      ? "borclar"
      : sekme === "gelir" ||
          sekme === "sabit-gelirler" ||
          sekme === "sabit-giderler" ||
          sekme === "harcamalar" ||
          sekme === "odemeler"
        ? "hareketler"
        : sekme;

  function anaSekmeyeGit(hedef) {
    if (hedef === "hareketler")
      setSekme(
        sekme === "gelir" ||
          sekme === "sabit-gelirler" ||
          sekme === "sabit-giderler" ||
          sekme === "harcamalar" ||
          sekme === "odemeler"
          ? sekme
          : "sabit-giderler",
      );
    else if (hedef === "borclar") setSekme("borclar");
    else setSekme(hedef);
    setForm(null);
    setHizliMenuAcik(false);
  }

  // iOS'ta alt gezinme cubugu isletim sisteminin kendi UITabBar'i. Dokunus
  // native taraftan geliyor; guncel yonlendirme islevine ref uzerinden
  // ulasiyoruz ki dinleyici ilk render'daki eski durumu tasimasin.
  const sekmeGidisRef = useRef(null);
  useEffect(() => {
    sekmeGidisRef.current = anaSekmeyeGit;
  });
  useEffect(() => {
    if (!nativeSekmeCubuguVarMi) return;
    sekmeCubuguHazirla((anahtar) => sekmeGidisRef.current?.(anahtar));
    // Cubuk pencereye bagli oldugu icin uygulama kabugu kapandiginda
    // (cikis, hukuki sayfalar) gizleniyor; aksi halde giris ekraninin
    // uzerinde asili kalirdi.
    sekmeCubugunuGoster(true);
    return () => sekmeCubugunuGoster(false);
  }, []);
  useEffect(() => {
    if (!nativeSekmeCubuguVarMi) return;
    sekmeCubuguTemasi(isDark);
  }, [isDark]);
  useEffect(() => {
    if (!nativeSekmeCubuguVarMi) return;
    sekmeCubugunuSec(anaSekme);
    // Native sekme cubugunda kullanici yeni sekmenin en ustunden baslamayi
    // bekler; onceki ekranin kaydirma konumu tasinmiyor.
    window.scrollTo({ top: 0 });
  }, [anaSekme]);

  return (
    <div
      className="bt-app"
      style={rootStyle}
      onKeyDownCapture={sayisalTusKontrol}
      onBeforeInputCapture={sayisalOnceGirdiKontrol}
      onPasteCapture={sayisalYapistirmaKontrol}
    >
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
              src={isDark ? "/borcama-logo-koyu.png" : "/borcama-logo.png"}
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
              <div className="bt-demo-plan" aria-label={t("kabuk.demo.aria")}>
                <span>{yeniUyelikOnizlemesi ? t("kabuk.demo.yeniUyelik") : t("kabuk.demo.gorunum")}</span>
                <button
                  type="button"
                  className={demoPlan === "free" ? "aktif" : ""}
                  onClick={() => demoPlaniDegistir("free")}
                  aria-pressed={demoPlan === "free"}
                >
                  {t("kabuk.demo.ucretsiz")}
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
              {s.toLocaleDateString(locale(), { day: "numeric", month: "long", year: "numeric" })}
              {kaydediliyor && (
                <span style={{ marginLeft: 8 }}>{t("kabuk.kaydediliyor")}</span>
              )}
            </div>
            <button
              className="bt-assistant-header"
              type="button"
              onClick={() =>
                misafir
                  ? window.location.assign("/register")
                  : setAsistanPenceresi(true)
              }
              aria-label={t("kabuk.sor")}
            >
              <Sparkles size={14} aria-hidden="true" />
              <span>{t("kabuk.sor")}</span>
            </button>
            {reklamsiz.kontrolEdildi && !etkinPro && !proSatisBekleniyor && (
              <button
                className="bt-upgrade-link"
                type="button"
                onClick={() =>
                  window.location.assign(misafir ? "/register" : "/upgrade?plan=monthly")
                }
              >
                <Sparkles size={14} /> {t("kabuk.proyaGec")}
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
              <Settings size={14} /> {t("kabuk.ayarlar")}
            </button>
          </div>
        </header>

        <nav className={"bt-nav bt-nav-ana" + (nativeSekmeCubuguVarMi ? " bt-nav-gizli" : "")}>
          {[
            ["ozet", t("sekme.ozet"), BarChart3],
            ["borclar", t("sekme.borclar"), Wallet],
            ["hareketler", t("sekme.hareketler"), ArrowLeftRight],
            ["varliklar", t("sekme.varliklar"), PiggyBank],
          ].map(([k, ad, Ikon]) => (
            <button
              key={k}
              className={"bt-pill " + (anaSekme === k ? "aktif" : "pasif")}
              onClick={() => {
                dokunusGeriBildirimi();
                anaSekmeyeGit(k);
              }}
              aria-label={ad}
            >
              <Ikon aria-hidden="true" />
              <span>{ad}</span>
            </button>
          ))}
          <button
            className="bt-pill bt-assistant-nav"
            type="button"
            onClick={() => {
              dokunusGeriBildirimi();
              if (misafir) window.location.assign("/register");
              else setAsistanPenceresi(true);
            }}
            aria-label={t("kabuk.sor")}
          >
            <Sparkles aria-hidden="true" />
            <span>{t("kabuk.sor")}</span>
          </button>
        </nav>


        {anaSekme === "borclar" && (
          <nav className="bt-nav bt-nav-alt" aria-label={t("kabuk.borcNav.aria")}>
            {[
              ["cards", t("kabuk.borcNav.kartlar")],
              ["loans", t("kabuk.borcNav.krediler")],
              ["od", t("kabuk.borcNav.ekHesap")],
              ["plan", t("kabuk.borcNav.plan")],
            ].map(([k, ad]) => {
              const aktif =
                k === "plan"
                  ? sekme === "plan"
                  : sekme === "borclar" &&
                    (borcKategori === k ||
                      (k === "cards" && borcKategori === "kontrol"));
              return (
                <button
                  key={k}
                  className={"bt-pill " + (aktif ? "aktif" : "pasif")}
                  onClick={() => {
                    if (k === "plan") setSekme("plan");
                    else {
                      setBorcKategori(k);
                      setSekme("borclar");
                    }
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
          <nav className="bt-nav bt-nav-alt" aria-label={t("kabuk.hareketNav.aria")}>
            {[
              ["odemeler", t("kabuk.hareketNav.odemeler")],
              ["sabit-giderler", t("kabuk.hareketNav.sabitGiderler")],
              ["harcamalar", t("kabuk.hareketNav.harcamalar")],
              ["sabit-gelirler", t("kabuk.hareketNav.sabitGelirler")],
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

        {(() => {
          const kaynakKayit = (o) => String(o.id || "").startsWith("kart-")
            ? veri.cards.find((k) => "kart-" + k.id === o.id)
            : String(o.id || "").startsWith("kredi-") ? veri.loans.find((k) => "kredi-" + k.id === o.id) : null;
          const rehber = rehberDurumu(veri, { simdi: new Date(), yaklasan: yaklasan.map((o) => ({ ...o, eklendi: kaynakKayit(o)?.eklendi })) });
          if (!rehber.oneri) return null;
          // Kurulumda Bugün ekranında büyük kart var; ilk adım atılmadan şerit gösterilmez.
          if (rehber.asama === "kurulum" && (anaSekme === "ozet" || rehber.kurulum.tamamlanan === 0)) return null;
          if (form) return null;
          return <RehberSeridi oneri={rehber.oneri} onAksiyon={rehberAksiyonu} onErtele={(id) => ayarKaydet({ rehber: rehberiErtele(veri.ayarlar?.rehber, id) })} onKapat={(id) => ayarKaydet({ rehber: rehberOnerisiniKapat(veri.ayarlar?.rehber, id) })} />;
        })()}

        {trialHatirlaticiAcik && !proSatistaDegil && (
          <section className="bt-trial-son" aria-label={t("kabuk.trial.aria")}>
            <div className="bt-trial-son-ikon">
              <Sparkles size={19} aria-hidden="true" />
            </div>
            <div>
              <strong>
                {t(
                  reklamsiz.trialKalanGun === 1
                    ? "kabuk.trial.baslikTekil"
                    : "kabuk.trial.baslikCogul",
                  { gun: reklamsiz.trialKalanGun },
                )}
              </strong>
              <p>{t("kabuk.trial.aciklama")}</p>
            </div>
            <div className="bt-trial-son-actions">
              <button
                className="bt-btn kucuk birincil"
                type="button"
                onClick={() => setProPenceresiAcik(true)}
              >
                {t("kabuk.trial.devam")}
              </button>
              <button
                className="bt-trial-son-kapat"
                type="button"
                onClick={trialHatirlaticiyiKapat}
              >
                {t("kabuk.trial.simdilikDegil")}
              </button>
            </div>
          </section>
        )}

        {yukleniyor ? (
          <div className="bt-bos">{t("kabuk.yukleniyor")}</div>
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
                veri={veri}
                toplamlar={toplamlar}
                kalemler={kalemler}
                aylikFaiz={aylikFaiz}
                gecenAyDelta={gecenAyDelta}
                buAyOdenecek={buAyOdenecek}
                yaklasan={yaklasan}
                buAyHarcama={buAyHarcama}
                buAyGelir={buAyGelir}
                setSekme={setSekme}
                aktivasyonAdiminiBaslat={aktivasyonAdiminiBaslat}
                tutarlarGizli={!!veri.ayarlar?.ozetTutarlariGizli}
                tutarlariGizle={(gizli) =>
                  ayarKaydet({ ozetTutarlariGizli: gizli })
                }
                varlikOzeti={varlikOzeti}
                oneriler={borcamaOnerileri}
                kurNotu={kurNotuDurumu}
                proAktif={etkinPro}
                trialKalanGun={reklamsiz.trialAktif && !proSatistaDegil ? reklamsiz.trialKalanGun : 0}
                proAc={() => setProPenceresiAcik(true)}
              />
            )}
            {sekme === "borclar" && (
              <Borclar
                veri={veri}
                kaydet={kaydet}
                islemEkle={islemEkle}
                form={form}
                setForm={setForm}
                ekleGuncelle={ekleGuncelle}
                sil={sil}
                odendiIsaretle={odendiIsaretle}
                kartOdemesiKaydet={kartOdemesiKaydet}
                kartOdemesiDegistir={kartOdemesiDegistir}
                krediOdemesiKaydet={krediOdemesiKaydet}
                kartYapilandir={kartYapilandir}
                bankalar={bankalar}
                bankaEkle={bankaEkle}
                kategori={borcKategori}
                setKategori={setBorcKategori}
                odemelereGit={() => {
                  setOdemeFiltresi("bekleyen");
                  setSekme("odemeler");
                  setForm(null);
                }}
                planaGit={() => {
                  setSekme("plan");
                  setForm(null);
                }}
                ekstreArsivIslemi={ekstreArsivIslemi}
                ekstreYuklemeIstegi={ekstreYuklemeIstegi}
                ekstreYuklemeIsteginiTuket={() => setEkstreYuklemeIstegi(0)}
                gelirEkle={() => {
                  setSekme("gelir");
                  setForm({ liste: "incomes", veri: {} });
                }}
                hareketEkle={() => {
                  setSekme("harcamalar");
                  setForm({ liste: "expenses", veri: {} });
                }}
                borcKutla={setBorcKutlamasi}
                kurNotu={kurNotuDurumu}
              />
            )}
            {sekme === "odemeler" && (
              <Odemeler
                veri={veri}
                yaklasan={yaklasan}
                gelecekOdemeler={gelecekOdemeler}
                odendiIsaretle={odendiIsaretle}
                kartOdemesiKaydet={kartOdemesiKaydet}
                krediOdemesiKaydet={krediOdemesiKaydet}
                filtre={odemeFiltresi}
                filtreDegistir={setOdemeFiltresi}
                islemler={veri.activityHistory || []}
                islemiGeriAl={islemiGeriAl}
                kurNotu={kurNotuDurumu}
              />
            )}
            {sekme === "plan" && (
              <Plan
                kalemler={kalemler}
                kurNotu={kurNotuDurumu}
                aylikFaiz={aylikFaiz}
                setSekme={setSekme}
                veri={veri}
                gelir={buAyGelir.toplam}
                proAktif={etkinPro}
                proAc={() => setProPenceresiAcik(true)}
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
            {sekme === "sabit-gelirler" && (
              <Gelirler
                veri={veri}
                form={form}
                setForm={setForm}
                ekleGuncelle={ekleGuncelle}
                sil={sil}
                buAyGelir={buAyGelir}
                sabit
              />
            )}
            {sekme === "sabit-giderler" && (
              <Harcamalar
                veri={veri}
                form={form}
                setForm={setForm}
                ekleGuncelle={ekleGuncelle}
                harcamaKaydet={harcamaKaydet}
                sil={sil}
                buAyHarcama={buAyHarcama}
                bankalar={bankalar}
                kredilereGit={() => {
                  setBorcKategori("loans");
                  setSekme("borclar");
                  setForm(null);
                }}
                sabit
              />
            )}
            {sekme === "harcamalar" && (
              <Harcamalar
                veri={veri}
                form={form}
                setForm={setForm}
                ekleGuncelle={ekleGuncelle}
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
                proSatisYok={proSatistaDegil}
                reklamsizKontrol={reklamsizKontrol}
                manuelProIptal={manuelProIptal}
                paddleProIptal={paddleProIptal}
                paddleOdemeKartiGuncelle={paddleOdemeKartiGuncelle}
                proSatinAl={proSatinAl}
                proSatinAlma={proSatinAlma}
                proPaketler={proPaketler}
                proGeriYukle={proSatinAlimlariGeriYukle}
                proGeriYukleme={proGeriYukleme}
                temaDegistir={temaAnahtarlarSwitch}
                parolaAc={() => setParolaPenceresi(true)}
                rehberAc={() => rehberAdiminaGit(0)}
                cikisYap={cikisYap}
                hesabiSil={hesabiSil}
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
            <Plus /><span><strong>{t("kabuk.hizli.harcama")}</strong><small>{t("kabuk.hizli.harcamaAlt")}</small></span>
          </button>
          <button type="button" role="menuitem" onClick={() => {
            setOdemeFiltresi("bekleyen");
            setSekme("odemeler");
            setForm(null);
            setHizliMenuAcik(false);
          }}>
            <CalendarCheck /><span><strong>{t("kabuk.hizli.odeme")}</strong><small>{t("kabuk.hizli.odemeAlt")}</small></span>
          </button>
          <button type="button" role="menuitem" onClick={() => {
            setBorcKategori("cards");
            setSekme("borclar");
            setForm(null);
            setHizliMenuAcik(false);
          }}>
            <ReceiptText /><span><strong>{t("kabuk.hizli.ekstre")}</strong><small>{t("kabuk.hizli.ekstreAlt")}</small></span>
          </button>
          <button type="button" role="menuitem" onClick={() => {
            setBorcKategori("cards");
            setSekme("borclar");
            setForm(null);
            setHizliMenuAcik(false);
          }}>
            <Wallet /><span><strong>{t("kabuk.hizli.yeniBorc")}</strong><small>{t("kabuk.hizli.yeniBorcAlt")}</small></span>
          </button>
        </div>
      )}
      <button
        className="bt-quick-add"
        type="button"
        aria-label={hizliMenuAcik ? t("kabuk.hizli.kapat") : t("kabuk.hizli.ekle")}
        aria-expanded={hizliMenuAcik}
        aria-controls="bt-hizli-islemler"
        title={t("kabuk.hizli.ekle")}
        onClick={() => setHizliMenuAcik((acik) => !acik)}
      >
        {hizliMenuAcik ? <X size={18} /> : <Plus size={18} />} <span>{t("kabuk.hizli.etiket")}</span>
      </button>
      {/* Geri bildirim dugmesi beta testi ozelligi olarak degerlendirildigi
          icin uygulama surumunde gosterilmiyor (Guideline 2.2). Tarayici
          surumunde duruyor. */}
      {!nativeMi && (
        <button
          className="bt-feedback-trigger"
          onClick={() => setGeriBildirimPenceresi(true)}
        >
          <MessageCircle size={16} /> Görüş bildir
        </button>
      )}
      <BorcamaAsistani
        key={kullaniciEposta || "demo"}
        acik={asistanPenceresi}
        kapat={() => setAsistanPenceresi(false)}
        gelir={buAyGelir.toplam}
        zorunluOdeme={buAyOdenecek}
        harcama={buAyHarcama.toplam}
        oneriler={borcamaOnerileri}
        veri={veri}
        kalemler={kalemler}
        proAktif={etkinPro}
        proSatisYok={proSatistaDegil}
        proAc={proSatistaDegil ? undefined : () => {
          setAsistanPenceresi(false);
          setProPenceresiAcik(true);
        }}
        yapayZekaIzni={!!veri.ayarlar?.finansalAsistanIzniV1}
        yapayZekaIzniVer={() => ayarKaydet({ finansalAsistanIzniV1: true })}
        git={(hedef) => {
          setSekme(hedef);
          setForm(null);
          setAsistanPenceresi(false);
        }}
        gorusBildir={() => {
          setAsistanPenceresi(false);
          setGeriBildirimPenceresi(true);
        }}
      />
      <ProTanitimPenceresi
        acik={proPenceresiAcik && !proSatistaDegil}
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
      {borcKutlamasi && (
        <BorcKapatmaKutlamasi
          kutlama={borcKutlamasi}
          kapat={() => setBorcKutlamasi(null)}
          kredilereGit={() => {
            setSekme("borclar");
            setBorcKategori(borcKutlamasi.tur === "Kredi" ? "loans" : "od");
            setForm(null);
            setBorcKutlamasi(null);
          }}
        />
      )}
      {geriBildirimPenceresi && (
        <div
          className="bt-modal-arka"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) geriBildirimKapat();
          }}
        >
          <form
            className="bt-modal bt-feedback-modal"
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
                  className="bt-alan bt-feedback-field"
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
                  className="bt-feedback-count"
                >
                  {geriBildirimFormu.mesaj.length}/1000
                </div>
                <div className="bt-feedback-footer">
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
                  {t("kabuk.parola.hazir")}
                </div>
                <div
                  style={{
                    fontSize: 12.5,
                    color: "var(--dim)",
                    lineHeight: 1.55,
                  }}
                >
                  {t("kabuk.parola.hazirAciklama")}
                  {!nativeMi && " E-posta linki seçeneği de kullanılmaya devam edecek."}
                </div>
                <div className="bt-form-butonlar">
                  <button
                    className="bt-btn birincil"
                    type="button"
                    onClick={parolaPenceresiniKapat}
                  >
                    {t("ortak.tamam")}
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
                  <KeyRound size={19} /> {t("kabuk.parola.baslik")}
                </div>
                <div
                  style={{
                    fontSize: 12.5,
                    color: "var(--dim)",
                    lineHeight: 1.55,
                    marginBottom: 16,
                  }}
                >
                  {t("kabuk.parola.aciklama")}
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
                  {t("kabuk.parola.yeni")}
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
                          ? t("kabuk.parola.gizle")
                          : t("kabuk.parola.goster")
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
                  {t("kabuk.parola.yeniTekrar")}
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
                      ? t("ortak.kaydediliyor")
                      : t("kabuk.parola.kaydet")}
                  </button>
                  <button
                    className="bt-btn ikincil"
                    type="button"
                    onClick={parolaPenceresiniKapat}
                  >
                    {t("ortak.vazgec")}
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
    etiket: t("kabuk.rehber.0.etiket"),
    baslik: t("kabuk.rehber.0.baslik"),
    aciklama:
      t("kabuk.rehber.0.aciklama"),
    maddeler: [
      t("kabuk.rehber.0.madde1"),
      t("kabuk.rehber.0.madde2"),
    ],
    kartBaslik: t("kabuk.rehber.0.kartBaslik"),
    kartDeger: t("kabuk.rehber.0.kartDeger"),
    kartAlt: t("kabuk.rehber.0.kartAlt"),
    satirlar: [
      [t("kabuk.rehber.0.satir1"), t("kabuk.rehber.0.satir1Deger")],
      [t("kabuk.rehber.0.satir2"), t("kabuk.rehber.0.satir2Deger")],
    ],
  },
  {
    hedef: "borclar",
    etiket: t("kabuk.rehber.1.etiket"),
    baslik: t("kabuk.rehber.1.baslik"),
    aciklama:
      t("kabuk.rehber.1.aciklama"),
    maddeler: [
      t("kabuk.rehber.1.madde1"),
      t("kabuk.rehber.1.madde2"),
    ],
    kartBaslik: t("kabuk.rehber.1.kartBaslik"),
    kartDeger: t("kabuk.rehber.1.kartDeger"),
    kartAlt: t("kabuk.rehber.1.kartAlt"),
    satirlar: [
      [t("kabuk.rehber.1.satir1"), ornekTutarMetni("kabuk.rehber.1.satir1Deger", 42600)],
      [t("kabuk.rehber.1.satir2"), ornekTutarMetni("kabuk.rehber.1.satir2Deger", 18400)],
    ],
  },
  {
    hedef: "odemeler",
    etiket: t("kabuk.rehber.2.etiket"),
    baslik: t("kabuk.rehber.2.baslik"),
    aciklama:
      t("kabuk.rehber.2.aciklama"),
    maddeler: [
      t("kabuk.rehber.2.madde1"),
      t("kabuk.rehber.2.madde2"),
    ],
    kartBaslik: t("kabuk.rehber.2.kartBaslik"),
    kartDeger: t("kabuk.rehber.2.kartDeger"),
    kartAlt: t("kabuk.rehber.2.kartAlt"),
    satirlar: [
      [t("kabuk.rehber.2.satir1"), ornekTutarMetni("kabuk.rehber.2.satir1Deger", 12840)],
      [t("kabuk.rehber.2.satir2"), ornekTutarMetni("kabuk.rehber.2.satir2Deger", 24200)],
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
          aria-label={t("asistan.rehber.kapatAria")}
          onClick={kapat}
        >
          <X size={19} />
        </button>
        <div className="bt-product-tour-progress" aria-label={t("asistan.rehber.adimAria", { n: adim + 1, toplam: REHBER_ADIMLARI.length })}>
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
            {t("asistan.rehber.turuGec")}
          </button>
          {adim > 0 && (
            <button className="bt-btn kucuk ikincil" type="button" onClick={() => adimaGit(adim - 1)}>
              <ChevronLeft size={15} /> {t("ortak.geri")}
            </button>
          )}
          <button
            className="bt-btn kucuk birincil"
            type="button"
            onClick={() => (sonAdim ? bitir(!kartVar) : adimaGit(adim + 1))}
          >
            {sonAdim ? (kartVar ? t("asistan.rehber.basla") : t("asistan.rehber.ilkKart")) : t("asistan.rehber.sonraki")}
            {sonAdim ? <Check size={15} /> : <ChevronRight size={15} />}
          </button>
        </div>
      </section>
    </div>
  );
}

// Günlük asistan soru hakkı; sunucudaki consume_financial_assistant_question ile aynı.
const ASISTAN_UCRETSIZ_SORU = 5;
const ASISTAN_PRO_SORU = 20;
const ASISTAN_PRO_AYLIK_SORU = 80;
function BorcamaAsistani({ acik, kapat, gelir, zorunluOdeme, harcama, oneriler, veri, kalemler, git, gorusBildir, proAktif, proAc, proSatisYok = false, yapayZekaIzni, yapayZekaIzniVer }) {
  const [secim, setSecim] = useState("durum");
  const [soru, setSoru] = useState("");
  const [modelYaniti, setModelYaniti] = useState(null);
  const [konusmaGecmisi, setKonusmaGecmisi] = useState([]);
  const [yanitlananSoru, setYanitlananSoru] = useState("");
  const [modelDurumu, setModelDurumu] = useState({ yukleniyor: false, hata: "", kota: null });
  const yeniKonusma = () => {
    if (modelDurumu.yukleniyor) return;
    setKonusmaGecmisi([]);
    setYanitlananSoru("");
    setSecim("durum");
    setSoru("");
    setModelYaniti(null);
    setModelDurumu({ yukleniyor: false, hata: "", kota: modelDurumu.kota });
  };
  if (!acik) return null;

  const aylikKalan = gelir - zorunluOdeme - harcama;
  const anaBirimVeri = anaBirimBorcVerisi(veri);
  const senaryo = calculateRevolvingDebtScenario({
    income: gelir,
    expenses: veri?.expenses || [],
    cards: anaBirimVeri?.cards || [],
    loans: anaBirimVeri?.loans || [],
    debts: (kalemler || []).filter((kalem) => ["kart", "ek"].includes(kalem.tur)),
    currentDate: bugun(),
  });
  const planAcigi = senaryo.status === "structural_gap" ? senaryo.monthlyGap : Math.max(-aylikKalan, 0);
  const planAlani = planAcigi > 0 ? -planAcigi : aylikKalan;
  const ilkOneri = oneriler?.[0];
  const yanitlar = {
    durum: {
      baslik: planAlani < 0 ? t("asistan.durum.baslikAcik", { tutar: fmt0(Math.abs(planAlani)) }) : t("asistan.durum.baslikAlan", { tutar: fmt0(planAlani) }),
      metin: gelir > 0
        ? senaryo.status === "structural_gap"
          ? t("asistan.durum.metinYapisal", { gelir: fmt0(gelir), yasam: fmt0(senaryo.livingBudget) })
          : t("asistan.durum.metin", { gelir: fmt0(gelir), zorunlu: fmt0(zorunluOdeme), harcama: fmt0(harcama) })
        : t("asistan.durum.gelirYok"),
      hedef: gelir > 0 ? "odemeler" : "sabit-gelirler",
      aksiyon: gelir > 0 ? t("asistan.durum.odemeleriGor") : t("asistan.durum.gelirEkle"),
    },
    ilk: {
      baslik: ilkOneri?.baslik || t("asistan.ilk.baslik"),
      metin: ilkOneri?.aciklama || t("asistan.ilk.metin"),
      hedef: ilkOneri?.hedef || "borclar",
      aksiyon: ilkOneri?.aksiyon || t("asistan.ilk.aksiyon"),
    },
    acik: {
      baslik: planAcigi > 0 ? t("asistan.acik.baslikVar") : t("asistan.acik.baslikYok"),
      metin: senaryo.status === "structural_gap"
        ? t("asistan.acik.metinYapisal", { taksit: fmt0(senaryo.fixedLoanPayments), yasam: fmt0(senaryo.livingBudget), kartButce: fmt0(senaryo.initialDebtBudget) })
        : t("asistan.acik.metin", { zorunlu: fmt0(zorunluOdeme), harcama: fmt0(harcama) }),
      hedef: "plan",
      aksiyon: t("asistan.acik.aksiyon"),
    },
    duzelt: {
      baslik: t("asistan.duzelt.baslik"),
      metin: t("asistan.duzelt.metin"),
      hedef: "borclar",
      aksiyon: t("asistan.duzelt.aksiyon"),
    },
  };
  const yanit = yanitlar[secim];
  const hizliIncelemeler = [
    { id: "durum", baslik: t("asistan.hizli.durum.baslik"), aciklama: t("asistan.hizli.durum.aciklama"), ikon: BarChart3 },
    { id: "ilk", baslik: t("asistan.hizli.ilk.baslik"), aciklama: t("asistan.hizli.ilk.aciklama"), ikon: CalendarCheck },
    { id: "acik", baslik: t("asistan.hizli.acik.baslik"), aciklama: t("asistan.hizli.acik.aciklama"), ikon: ScanSearch },
    { id: "duzelt", baslik: t("asistan.hizli.duzelt.baslik"), aciklama: t("asistan.hizli.duzelt.aciklama"), ikon: ReceiptText },
  ];
  const soruSor = async (event) => {
    event.preventDefault();
    if (!yapayZekaIzni || soru.trim().length < (konusmaGecmisi.length ? 1 : 3) || modelDurumu.yukleniyor) return;
    const metin = soru.trim().slice(0, 500);
    setSecim("model");
    setModelYaniti(null);
    setModelDurumu({ yukleniyor: true, hata: "", kota: null });
    try {
      const context = {
        ...asistanBaglamiOlustur({
          veri, gelir, zorunluOdeme, harcama, planAcigi, kalemler, tarih: bugun(),
          turkiyeKurallari: turkiyeKurallariGecerli(),
          bolgeOrtalamasi: (() => {
            const profil = bolgeProfili();
            if (!profil) return null;
            return `Oranı girilmemiş kart ve ek hesaplarda ${profil.ulke || "bilinmeyen bölge"} için tipik yıllık oranlar kullanıldı: kart %${profil.kartYillikFaiz}, ek hesap %${profil.ekHesapYillikFaiz} (aylık oran = yıllık / 12). Kesin banka oranı değildir.`;
          })(),
          paraBirimleri: {
            anaBirim: kullaniciParaBirimi(),
            kayitBirimi: (kayit) => kayitParaBirimi(kayit),
            cevir: (tutar, birim) => {
              const kur = kurCarpani(birim, kullaniciParaBirimi());
              return kur === null ? null : (Number(tutar) || 0) * kur;
            },
          },
        }),
        // Web'de (tr + TRY) bos; baglam bugunkuyle birebir ayni kalir.
        ...asistanKullaniciTercihleri({ dilKodu: dil(), paraBirimi: kullaniciParaBirimi() }),
      };
      const sonuc = await finansalAsistanaSor({ question: metin, context, history: konusmaGecmisi });
      setModelYaniti(sonuc);
      setKonusmaGecmisi((gecmis) => appendAssistantExchange(gecmis, { question: metin, answer: sonuc.answer }));
      setYanitlananSoru(metin);
      setSoru("");
      setModelDurumu({ yukleniyor: false, hata: "", kota: sonuc.quota || null });
    } catch (error) {
      const mesaj = error?.message === "DAILY_LIMIT"
        ? error.quota?.period === "month"
          ? t("asistan.hata.limitProAy", { limit: error.quota?.monthly_limit || ASISTAN_PRO_AYLIK_SORU })
          : (proSatisYok || (error.quota?.limit ? error.quota.limit >= ASISTAN_PRO_SORU : proAktif))
          ? t("asistan.hata.limitPro", { limit: error.quota?.limit || ASISTAN_PRO_SORU })
          : t("asistan.hata.limitUcretsiz", { limit: error.quota?.limit || ASISTAN_UCRETSIZ_SORU, pro: ASISTAN_PRO_SORU })
        : error?.message === "DEMO_MODE"
          ? t("asistan.hata.demo")
          : t("asistan.hata.genel");
      setModelDurumu({ yukleniyor: false, hata: mesaj, kota: error?.quota || null });
    }
  };
  // Plan etiketi sunucunun uyguladığı limitten okunur; istemcideki Pro durumu
  // (ör. iOS test aboneliği) sunucuyla farklıysa kullanıcı yanlış bilgilenmez.
  const asistanProKotasi = modelDurumu.kota?.limit ? modelDurumu.kota.limit >= ASISTAN_PRO_SORU : proAktif;
  const gosterilenYanit = secim === "model" ? {
    baslik: modelYaniti?.title || (modelDurumu.yukleniyor ? t("asistan.model.yukleniyor") : t("asistan.model.olusturulamadi")),
    metin: modelYaniti?.answer || modelDurumu.hata || t("asistan.model.karsilastiriyor"),
    aksiyon: modelYaniti?.actionLabel || t("asistan.model.aksiyon"),
  } : secim === "bilinmiyor" ? {
    baslik: t("asistan.bilinmiyor.baslik"),
    metin: t("asistan.bilinmiyor.metin"),
    aksiyon: "Görüş bildir",
  } : yanit;
  const yanitSunumu = secim === "model" && modelYaniti?.answer
    ? asistanYanitiniSunumaDonustur(modelYaniti.answer)
    : null;
  const vurgula = (metin, acikRenk = false) => String(metin || "").split(/((?:₺\s*)?\d[\d.]*(?:,\d+)?\s*(?:TL)?|%\s*\d+(?:[,.]\d+)?|\b(?:açık|risk|gecikmiş|önce)\b)/gi)
    .filter(Boolean).map((parca, index) => /^(?:₺|\d|%|açık$|risk$|gecikmiş$|önce$)/i.test(parca.trim())
      ? <span className="bt-assistant-emphasis" style={acikRenk ? { color: CREAM } : undefined} key={index}>{parca}</span>
      : parca);

  return (
    <div className="bt-modal-arka" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && kapat()}>
      <section className="bt-modal bt-assistant-modal" role="dialog" aria-modal="true" aria-labelledby="bt-assistant-title">
        <div className="bt-assistant-head">
          <span className="bt-assistant-mark"><Sparkles size={20}/></span>
          <div><h2 id="bt-assistant-title">{t("asistan.baslik")}</h2><p>{t("asistan.altBaslik")}</p></div>
          <button className="bt-assistant-close" type="button" aria-label={t("asistan.kapatAria")} onClick={kapat}><X size={17}/></button>
        </div>
        {!yapayZekaIzni && (
          <div className="bt-assistant-consent">
            <strong>{t("asistan.izin.baslik")}</strong>
            {t("asistan.izin.metin")}
            <button className="bt-btn kucuk birincil" type="button" onClick={yapayZekaIzniVer}>{t("asistan.izin.etkinlestir")}</button>
          </div>
        )}
        <div className="bt-assistant-composer">
          <span className="bt-assistant-section-label">{t("asistan.soruEtiketi")}</span>
          <form className="bt-assistant-custom" onSubmit={soruSor}>
            <input className="bt-input" value={soru} maxLength={500} onChange={(e) => setSoru(e.target.value)} placeholder={konusmaGecmisi.length ? t("asistan.placeholderDevam") : turkiyeKurallariGecerli() ? t("asistan.placeholder") : t("asistan.placeholderTutarli", { tutar: fmt0(ornekTutar(10000)) })} aria-label={t("asistan.soruAria")} disabled={!yapayZekaIzni || modelDurumu.yukleniyor}/>
            <button className="bt-btn birincil" type="submit" disabled={!yapayZekaIzni || soru.trim().length < (konusmaGecmisi.length ? 1 : 3) || modelDurumu.yukleniyor}>{modelDurumu.yukleniyor ? <span className="bt-assistant-loading"><RefreshCw size={14}/> {t("asistan.bakiyorum")}</span> : <>{t("asistan.sor")} <Send size={14}/></>}</button>
          </form>
          <small>{t("asistan.baglamNotu", { n: MAX_ASSISTANT_EXCHANGES })}</small>
          {!!konusmaGecmisi.length && <button className="bt-btn kucuk ikincil" type="button" onClick={yeniKonusma} disabled={modelDurumu.yukleniyor} style={{ marginTop: 10 }}>{t("asistan.yeniKonusma")}</button>}
        </div>
        <div className="bt-assistant-shortcuts">
          <span className="bt-assistant-section-label">{t("asistan.hizliEtiket")}</span>
          <div className="bt-assistant-prompts" role="group" aria-label={t("asistan.hizliAria")}>
            {hizliIncelemeler.map(({ id, baslik, aciklama, ikon: Ikon }) => (
              <button key={id} type="button" disabled={modelDurumu.yukleniyor} className={secim === id ? "aktif" : ""} aria-pressed={secim === id} onClick={() => { setSecim(id); setModelDurumu({ yukleniyor: false, hata: "", kota: modelDurumu.kota }); }}>
                <span className="bt-assistant-prompt-icon"><Ikon size={16}/></span>
                <span className="bt-assistant-prompt-copy"><strong>{baslik}</strong><small>{aciklama}</small></span>
                <ChevronRight size={14}/>
              </button>
            ))}
          </div>
        </div>
        {!!konusmaGecmisi.length && <details style={{ marginBottom: 14 }}>
          <summary style={{ cursor: "pointer", fontSize: 12 }}>{t("asistan.gecmis", { n: konusmaGecmisi.length })}</summary>
          {konusmaGecmisi.map((tur, index) => <div key={index} style={{ padding: "12px 0", borderBottom: "1px solid var(--line-soft)", fontSize: 12, lineHeight: 1.5 }}>
            <strong>{t("asistan.sen", { soru: tur.question })}</strong>
            <p style={{ margin: "6px 0 0", whiteSpace: "pre-line", color: "var(--dim)" }}>{yanitIsaretleriniCevir(tur.answer, dil(), t("asistan.yapmanGereken"))}</p>
          </div>)}
        </details>}
        <div className="bt-assistant-answer" aria-live="polite">
          <span className="bt-assistant-answer-label">{secim === "model" ? t("asistan.etiketModel") : t("asistan.etiketKayit")}</span>
          {secim === "model" && modelYaniti && <p style={{ marginBottom: 10 }}>{t("asistan.sorun", { soru: yanitlananSoru })}</p>}
          <strong>{gosterilenYanit.baslik}</strong>
          {yanitSunumu ? <>
            {yanitSunumu.kisaCevap && <p className="bt-assistant-summary">{vurgula(yanitSunumu.kisaCevap)}</p>}
            {!!yanitSunumu.maddeler.length && <ul className="bt-assistant-list">{yanitSunumu.maddeler.map((madde, index) => <li key={index}>{vurgula(madde)}</li>)}</ul>}
            {yanitSunumu.sonrakiAdim && <div className="bt-assistant-next"><b>{t("asistan.yapmanGereken")}</b> {vurgula(yanitSunumu.sonrakiAdim, true)}</div>}
          </> : <p>{gosterilenYanit.metin}</p>}
          <div className="bt-assistant-check"><AlertTriangle size={14}/><span><b>{t("asistan.kontrolBaslik")}</b> {t("asistan.kontrolMetin")}</span></div>
          <small>{t("asistan.uyari")}</small>
          <div className="bt-assistant-answer-footer">
            {!(nativeMi && secim === "bilinmiyor") && !(secim === "model" && modelYaniti?.route === "none") && <div className="bt-assistant-action"><button className="bt-btn birincil" type="button" onClick={() => secim === "bilinmiyor" ? gorusBildir() : git(secim === "model" ? (modelYaniti?.route || "ozet") : yanit.hedef)} disabled={secim === "model" && !modelYaniti}>{gosterilenYanit.aksiyon} <ArrowRight size={14}/></button></div>}
            {modelDurumu.kota && <div className="bt-assistant-quota">{!proSatisYok && <span className="bt-assistant-quota-plan">{asistanProKotasi ? "Pro" : t("asistan.kota.ucretsiz")}</span>}<strong>{modelDurumu.kota.remaining}</strong><span>{modelDurumu.kota.remaining === 1 ? t("asistan.kota.kaldiTekil") : t("asistan.kota.kaldiCogul")}</span></div>}
            {!asistanProKotasi && proAc && modelDurumu.kota && modelDurumu.kota.remaining <= 0 && (
              <div className="bt-assistant-upsell">
                <span><b>{t("asistan.upsell.baslik")}</b> {t("asistan.upsell.metin", { n: ASISTAN_PRO_SORU })}</span>
                <button className="bt-btn birincil" type="button" onClick={proAc}><Sparkles size={14} aria-hidden="true" /> {t("asistan.upsell.buton")}</button>
              </div>
            )}
          </div>
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
            aria-label={t("asistan.proTanitim.kapatAria")}
            onClick={kapat}
          >
            <X size={18} />
          </button>
          <span className="bt-premium-badge">
            <Sparkles size={13} /> BORCAMA PRO
          </span>
          <h2 id="bt-pro-tanitim-baslik">
            {t("asistan.proTanitim.baslik")} <span>{t("asistan.proTanitim.baslikVurgu")}</span>
          </h2>
          <p>
            {t("asistan.proTanitim.aciklama")}
          </p>
        </div>
        <div className="bt-pro-modal-body">
          <div className="bt-pro-faydalar">
            <div className="bt-pro-fayda">
              <TrendingUp />
              <div>
                <strong>{t("asistan.proTanitim.fayda1Baslik")}</strong>
                <small>{t("asistan.proTanitim.fayda1Metin")}</small>
              </div>
            </div>
            <div className="bt-pro-fayda">
              <Target />
              <div>
                <strong>{t("asistan.proTanitim.fayda2Baslik")}</strong>
                <small>{t("asistan.proTanitim.fayda2Metin")}</small>
              </div>
            </div>
            <div className="bt-pro-fayda">
              <TrendingUp />
              <div>
                <strong>{t("asistan.proTanitim.fayda3Baslik")}</strong>
                <small>{t("asistan.proTanitim.fayda3Metin")}</small>
              </div>
            </div>
          </div>
          <div className="bt-pro-satin-al">
            <div className="bt-pro-planlar" role="group" aria-label={t("asistan.proTanitim.planAria")}>
              <button
                type="button"
                className={"bt-pro-plan " + (plan === "monthly" ? "aktif" : "")}
                onClick={() => setPlan("monthly")}
              >
                <span>{t("asistan.proTanitim.aylik")}</span>
                <strong>{aylikFiyat || t("ortak.yukleniyor")}</strong>
              </button>
              <button
                type="button"
                className={"bt-pro-plan " + (plan === "annual" ? "aktif" : "")}
                onClick={() => setPlan("annual")}
              >
                <span>{t("asistan.proTanitim.yillik")}</span>
                <strong>{yillikFiyat || t("ortak.yukleniyor")}</strong>
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
                ? t("asistan.proTanitim.odemeAciliyor")
                : proPaketler?.yukleniyor
                  ? t("asistan.proTanitim.fiyatYukleniyor")
                  : t("asistan.proTanitim.proyaGec", { fiyat: seciliFiyat || t("asistan.proTanitim.fiyatAlinamadi") })}
            </button>
            <div className="bt-pro-guvence">
              <KeyRound size={13} />
              <span>{t("asistan.proTanitim.guvence")}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function DavetKarti() {
  const [durum, setDurum] = useState({ yukleniyor: true, hata: "", veri: null, mesaj: "" });
  useEffect(() => {
    let active = true;
    if (demoModu) {
      setDurum({ yukleniyor: false, hata: "", mesaj: "", veri: { code: "BRCM7K4M2Q", inviteUrl: "https://borcama.com/davet/BRCM7K4M2Q", totals: { waiting: 1, rewarded: 2, review: 0, earnedDays: 60, pendingDays: 0, billingScheduledDays: 30 } } });
      return undefined;
    }
    davetDurumunuGetir().then((veri) => {
      if (active) setDurum({ yukleniyor: false, hata: "", veri, mesaj: "" });
    }).catch(() => {
      if (active) setDurum({ yukleniyor: false, hata: "Davet bilgilerin şu anda yüklenemedi.", veri: null, mesaj: "" });
    });
    return () => { active = false; };
  }, []);

  const kopyala = async () => {
    if (!durum.veri?.inviteUrl) return;
    try {
      await navigator.clipboard.writeText(durum.veri.inviteUrl);
      setDurum((old) => ({ ...old, mesaj: "Davet bağlantın kopyalandı." }));
    } catch {
      setDurum((old) => ({ ...old, mesaj: "Bağlantı kopyalanamadı; kodu elle paylaşabilirsin." }));
    }
  };
  const paylas = async () => {
    if (!durum.veri?.inviteUrl) return;
    const text = "Borcama'ya davet bağlantımla katıl. E-postanı doğruladığında ikimiz de 30 gün Pro kazanalım.";
    if (navigator.share) {
      try { await navigator.share({ title: "Borcama daveti", text, url: durum.veri.inviteUrl }); return; } catch { return; }
    }
    await kopyala();
  };
  const totals = durum.veri?.totals || {};
  return (
    <section className="bt-referral-card" id="arkadasini-davet-et">
      <div className="bt-referral-copy">
        <span className="bt-premium-badge"><Gift size={13}/> Arkadaşını davet et</span>
        <h2>İkiniz de 30 gün Pro kazanın.</h2>
        <p>Arkadaşın kalıcı bağlantınla kayıt olup e-postasını doğruladığında ödül otomatik eklenir. Ücretli Pro kullanıyorsan sıradaki tahsilatın ödül süresi boyunca ertelenir, ardından aboneliğin otomatik devam eder.</p>
        {!durum.yukleniyor && !durum.hata && <div className="bt-referral-stats"><span>{totals.waiting || 0} doğrulama bekliyor</span><span>{totals.rewarded || 0} başarılı davet</span><span>{totals.earnedDays || 0} gün kazanıldı</span>{totals.billingScheduledDays > 0 && <span>Sıradaki yenilemede {totals.billingScheduledDays} gün ücretsiz</span>}{totals.pendingDays > 0 && <span>{totals.pendingDays} gün hazırlanıyor</span>}{totals.review > 0 && <span>{totals.review} incelemede</span>}</div>}
      </div>
      <div className="bt-referral-panel">
        <div className="bt-referral-code"><span>{durum.yukleniyor ? "Kod hazırlanıyor…" : durum.hata ? "Kod yüklenemedi" : "Kalıcı kodun"}</span><strong>{durum.veri?.code || "—"}</strong></div>
        <div className="bt-referral-actions">
          <button className="bt-btn birincil" type="button" disabled={!durum.veri} onClick={kopyala}><Copy size={14}/> Bağlantıyı kopyala</button>
          <button className="bt-btn ikincil" type="button" disabled={!durum.veri} onClick={paylas}><Share2 size={14}/> Paylaş</button>
        </div>
        {(durum.mesaj || durum.hata) && <div className={`bt-referral-message ${durum.hata ? "bt-referral-error" : ""}`}>{durum.hata || durum.mesaj}</div>}
      </div>
    </section>
  );
}

function Ayarlar({
  eposta,
  isDark,
  reklamsiz,
  reklamsizKontrol,
  manuelProIptal,
  paddleProIptal,
  paddleOdemeKartiGuncelle,
  proSatinAl,
  proSatinAlma,
  proPaketler,
  proGeriYukle,
  proGeriYukleme,
  temaDegistir,
  parolaAc,
  rehberAc,
  cikisYap,
  hesabiSil,
  proSatisYok = false,
}) {
  const [proPlan, setProPlan] = useState("monthly");
  const [ucretsizOnayi, setUcretsizOnayi] = useState(false);
  const [paketYonetimiAcik, setPaketYonetimiAcik] = useState(false);
  const [iptalOnayi, setIptalOnayi] = useState(false);
  const [iptalDurumu, setIptalDurumu] = useState({ yukleniyor: false, hata: "", tamam: false });
  const [kartDurumu, setKartDurumu] = useState({ yukleniyor: false, hata: "", tamam: false });
  const [olcumIzni, setOlcumIzni] = useState(() => googleAdsOlcumTercihi() === true);
  // Hesapsiz kullanimda hesaba bagli bolumler gizleniyor.
  const misafir = misafirModuAcik();
  const [hesapSilmeAcik, setHesapSilmeAcik] = useState(false);
  const [hesapSilmeMetni, setHesapSilmeMetni] = useState("");
  const [hesapSilmeDurumu, setHesapSilmeDurumu] = useState({ yukleniyor: false, hata: "" });
  const denemeAktif = !!reklamsiz.trialAktif;
  const seciliPaket = proPaketler?.[proPlan];
  const seciliFiyat = seciliPaket?.formattedPrice;
  useEffect(() => {
    if (!paketYonetimiAcik && !hesapSilmeAcik) return undefined;
    const onceki = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = onceki;
    };
  }, [paketYonetimiAcik, hesapSilmeAcik]);
  const paketPenceresiniKapat = () => {
    if (iptalDurumu.yukleniyor) return;
    setPaketYonetimiAcik(false);
    setIptalOnayi(false);
    setIptalDurumu({ yukleniyor: false, hata: "", tamam: false });
    setKartDurumu({ yukleniyor: false, hata: "", tamam: false });
  };
  const paddleYenilemeyiIptalEt = async () => {
    setIptalDurumu({ yukleniyor: true, hata: "", tamam: false });
    try {
      await paddleProIptal();
      setIptalDurumu({ yukleniyor: false, hata: "", tamam: true });
      setIptalOnayi(false);
    } catch (error) {
      const kod = String(error?.message || "");
      const metin = kod.includes("NOT_CONFIGURED")
        ? "Abonelik iptali henüz sunucuya bağlanmamış."
        : kod.includes("NOT_FOUND")
          ? "Hesabına ait etkin Paddle aboneliği bulunamadı."
          : kod.includes("AMBIGUOUS")
            ? "Birden fazla etkin abonelik bulundu. Güvenli işlem için destek gerekiyor."
            : "İptal işlemi tamamlanamadı. Lütfen tekrar dene.";
      setIptalDurumu({ yukleniyor: false, hata: metin, tamam: false });
    }
  };
  const paddleKartiniGuncelle = async () => {
    setKartDurumu({ yukleniyor: true, hata: "", tamam: false });
    try {
      await paddleOdemeKartiGuncelle(() => {
        setKartDurumu({ yukleniyor: false, hata: "", tamam: true });
        reklamsizKontrol();
      });
      setKartDurumu((eski) => ({ ...eski, yukleniyor: false }));
    } catch (error) {
      const kod = String(error?.message || "");
      const metin = kod.includes("CLIENT_NOT_CONFIGURED")
        ? "Kart yönetimi henüz canlı ortama bağlanmamış."
        : kod.includes("permission") || kod.includes("forbidden")
          ? "Paddle kart güncelleme izni eksik."
          : kod.includes("NOT_FOUND")
            ? "Hesabına ait etkin abonelik bulunamadı."
            : "Kart güncelleme ekranı açılamadı. Lütfen tekrar dene.";
      setKartDurumu({ yukleniyor: false, hata: metin, tamam: false });
    }
  };
  const hesapSilmePenceresiniKapat = () => {
    if (hesapSilmeDurumu.yukleniyor) return;
    setHesapSilmeAcik(false);
    setHesapSilmeMetni("");
    setHesapSilmeDurumu({ yukleniyor: false, hata: "" });
  };
  const hesabiKaliciSil = async () => {
    if (!hesapSilmeOnayiGecerli(hesapSilmeMetni)) return;
    setHesapSilmeDurumu({ yukleniyor: true, hata: "" });
    try {
      await hesabiSil(hesapSilmeMetni);
    } catch (error) {
      setHesapSilmeDurumu({
        yukleniyor: false,
        hata: hesapSilmeHataMesaji(error?.message),
      });
    }
  };
  return (
    <div className="bt-stack">
      <div>
        <div
          className="bt-display"
          style={{ fontSize: "clamp(28px,5vw,42px)" }}
        >
          {t("ayarlar.baslik")}
        </div>
        <div style={{ color: "var(--dim)", fontSize: 13, marginTop: 7 }}>
          {t("ayarlar.altBaslik")}
        </div>
      </div>
      <div className="bt-settings-grid">
        {/* Hesapsiz kullanimda abonelik satin alinamaz; App Store aboneligi
            hesaba baglandigi icin once hesap acilmasi gerekiyor. Satin alma
            arayuzu yerine ne yapilacagini soyleyen bir kart gosteriliyor. */}
        {/* Pro'nun satilmadigi App Store ulkesinde abonelik karti hic yok. */}
        {proSatisYok ? null : misafir ? (
          <section className="bt-premium-card">
            <div className="bt-premium-copy">
              <span className="bt-premium-badge">
                <Sparkles size={13} /> {t("ayarlar.pro.rozetPlan")}
              </span>
              <h2>{t("ayarlar.pro.misafirBaslik")}</h2>
              <p>
                {t("ayarlar.pro.misafirMetin")}
              </p>
              <button
                className="bt-btn birincil"
                type="button"
                onClick={() => window.location.assign("/register")}
              >
                <Sparkles size={15} /> {t("ayarlar.pro.hesapAc")}
              </button>
            </div>
          </section>
        ) : (
        <section className="bt-premium-card">
          <div className="bt-premium-copy">
            <span className="bt-premium-badge">
              <Sparkles size={13} />
              {denemeAktif ? t("ayarlar.pro.rozetDeneme") : reklamsiz.proAktif ? t("ayarlar.pro.rozetAktif") : t("ayarlar.pro.rozetPlan")}
            </span>
            <h2>
              {denemeAktif
                ? t(Number(reklamsiz.trialKalanGun) === 1 ? "ayarlar.pro.denemeBaslikTekil" : "ayarlar.pro.denemeBaslikCogul", { gun: reklamsiz.trialKalanGun })
                : reklamsiz.proAktif
                ? t("ayarlar.pro.aktifBaslik")
                : t("ayarlar.pro.ucretsizBaslik")}
            </h2>
            <p>
              {denemeAktif
                ? t("ayarlar.pro.denemeMetin")
                : reklamsiz.proAktif
                ? t("ayarlar.pro.aktifMetin")
                : t("ayarlar.pro.ucretsizMetin")}
              {reklamsiz.proAktif &&
              reklamsiz.proYonetimUrl &&
              !reklamsiz.proYenilenecek
                ? t("ayarlar.pro.yenilemeKapali")
                : ""}
              {!reklamsiz.proAktif && proPaketler?.hata ? ` ${proPaketler.hata}` : ""}
              {reklamsiz.hata ? ` ${reklamsiz.hata}` : ""}
              {proSatinAlma.hata ? ` ${proSatinAlma.hata}` : ""}
            </p>
            {reklamsiz.proAktif && (
              <div className="bt-premium-meta" aria-label={t("ayarlar.pro.durumEtiketi")}>
                <span className="vurgu">{denemeAktif ? t("ayarlar.pro.kartsizDeneme") : t("ayarlar.pro.erisimAcik")}</span>
                {reklamsiz.proBitis && (
                  <span>
                    {t("ayarlar.pro.tarihSatiri", {
                      etiket: denemeAktif ? t("ayarlar.pro.denemeBitisi") : reklamsiz.proYenilenecek ? t("ayarlar.pro.sonrakiYenileme") : t("ayarlar.pro.erisimBitisi"),
                      tarih: new Date(reklamsiz.proBitis).toLocaleDateString(locale(), {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }),
                    })}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="bt-premium-actions">
            {(!reklamsiz.proAktif || denemeAktif) && (
              <div className="bt-pro-choice">
                <div className="bt-pro-toggle" role="group" aria-label={t("ayarlar.pro.donemEtiketi")}>
                  <button
                    type="button"
                    className={proPlan === "monthly" ? "aktif" : ""}
                    onClick={() => setProPlan("monthly")}
                  >
                    {t("ayarlar.pro.aylik")}
                  </button>
                  <button
                    type="button"
                    className={proPlan === "annual" ? "aktif" : ""}
                    onClick={() => setProPlan("annual")}
                  >
                    {t("ayarlar.pro.yillik")}
                  </button>
                </div>
                <button
                  className="bt-btn birincil"
                  type="button"
                  disabled={proSatinAlma.yukleniyor || proPaketler?.yukleniyor || !seciliFiyat}
                  onClick={() => proSatinAl(proPlan)}
                >
                  {proSatinAlma.yukleniyor
                    ? t("ayarlar.pro.odemeAciliyor")
                    : proPaketler?.yukleniyor
                      ? t("ayarlar.pro.fiyatYukleniyor")
                      : denemeAktif
                        ? t("ayarlar.pro.denemeSonrasiSurdur", { fiyat: seciliFiyat || t("ayarlar.pro.fiyatAlinamadi") })
                        : t("ayarlar.pro.proyaGec", { fiyat: seciliFiyat || t("ayarlar.pro.fiyatAlinamadi") })}
                </button>
                {/* App Store Guideline 3.1.2: satin alma ekraninda abonelik
                    adi, suresi ve fiyati ile kullanim sartlari ve gizlilik
                    politikasi baglantilari gorunur olmalidir. */}
                <div className="bt-pro-sartlar">
                  <div className="bt-pro-sartlar-ust">
                    <strong>
                      {proPlan === "annual" ? t("ayarlar.pro.planYillik") : t("ayarlar.pro.planAylik")}
                    </strong>
                    <span>
                      {proPlan === "annual" ? t("ayarlar.pro.sure1Yil") : t("ayarlar.pro.sure1Ay")}
                      {seciliFiyat ? ` · ${seciliFiyat}` : ""}
                    </span>
                  </div>
                  <p>
                    {t("ayarlar.pro.otomatikYenilenir")}{" "}
                    {nativeMi
                      ? t("ayarlar.pro.yenilemeAppStore")
                      : "Yenilemeyi istediğin zaman kapatabilirsin."}
                  </p>
                  <div className="bt-pro-sartlar-baglantilar">
                    <a href="/terms" target="_blank" rel="noreferrer">{t("ayarlar.pro.kullanimSartlari")}</a>
                    <a href="/privacy" target="_blank" rel="noreferrer">{t("ayarlar.pro.gizlilikPolitikasi")}</a>
                    <a href="/refund-policy" target="_blank" rel="noreferrer">{t("ayarlar.pro.iadePolitikasi")}</a>
                  </div>
                  {nativeMi && (
                    <>
                      <button
                        className="bt-btn kucuk ikincil"
                        type="button"
                        disabled={proGeriYukleme?.yukleniyor}
                        onClick={proGeriYukle}
                      >
                        {proGeriYukleme?.yukleniyor
                          ? t("ayarlar.pro.geriYukleniyor")
                          : t("ayarlar.pro.geriYukle")}
                      </button>
                      {proGeriYukleme?.hata && (
                        <p className="bt-pro-sartlar-hata">{proGeriYukleme.hata}</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
            {reklamsiz.proAktif && !denemeAktif && reklamsiz.proYonetimUrl && (
              <button
                className="bt-btn birincil"
                type="button"
                onClick={() => setPaketYonetimiAcik(true)}
              >
                {t("ayarlar.pro.paketimiYonet")}
              </button>
            )}
            {reklamsiz.proAktif && !denemeAktif &&
              !reklamsiz.proYonetimUrl &&
              ["admin_manual", "shopier"].includes(reklamsiz.proKaynak) && (
                <button
                  className="bt-btn ikincil"
                  type="button"
                  disabled={reklamsiz.yukleniyor}
                  onClick={() => {
                    if (!ucretsizOnayi) {
                      setUcretsizOnayi(true);
                      return;
                    }
                    manuelProIptal();
                    setUcretsizOnayi(false);
                  }}
                >
                  {ucretsizOnayi
                    ? t("ayarlar.pro.ucretsizeGecOnayla")
                    : t("ayarlar.pro.ucretsizeGec")}
                </button>
              )}
            <button
              className="bt-btn ikincil"
              type="button"
              disabled={reklamsiz.yukleniyor}
              onClick={reklamsizKontrol}
            >
              <RefreshCw size={14} />
              {reklamsiz.yukleniyor
                ? t("ayarlar.pro.kontrolEdiliyor")
                : reklamsiz.proAktif
                  ? t("ayarlar.pro.durumuYenile")
                  : t("ayarlar.pro.proAldim")}
            </button>
            {reklamsiz.proAktif && !denemeAktif && (
              <p className="bt-premium-help">
                {reklamsiz.proYonetimUrl
                  ? t("ayarlar.pro.iptalYardim")
                  : t("ayarlar.pro.manuelYardim")}
                <a href="/faq" target="_blank" rel="noreferrer">{t("ayarlar.pro.yardim")}</a>
              </p>
            )}
          </div>
        </section>
        )}
        {/* Davet programi uygulama surumunde gosterilmiyor: App Store, kodla
            acilan Pro odulunu uygulama ici satin alma disi bir mekanizma
            sayiyor. Tarayici surumunde program aynen devam ediyor. */}
        {!misafir && !nativeMi && <DavetKarti />}
        {/* Hesap bolumu yalnizca hesabi olan kullanici icin anlamli. */}
        {!misafir && (
        <section className="bt-settings-card">
          <div className="bt-settings-title">
            <AtSign size={18} /> {t("ayarlar.hesap.baslik")}
          </div>
          <div className="bt-setting-row">
            <div>
              <strong>{t("ayarlar.hesap.eposta")}</strong>
              <small>{eposta || t("ortak.yukleniyor")}</small>
            </div>
          </div>
          <div className="bt-setting-row">
            <div>
              <strong>{t("ayarlar.hesap.parola")}</strong>
              <small>{t("ayarlar.hesap.parolaAciklama")}</small>
            </div>
            <button className="bt-btn kucuk ikincil" onClick={parolaAc}>
              <KeyRound size={14} /> {t("ayarlar.hesap.parolaYonet")}
            </button>
          </div>
          <div className="bt-setting-row">
            <div>
              <strong>{t("ayarlar.hesap.oturum")}</strong>
              <small>{t("ayarlar.hesap.oturumAciklama")}</small>
            </div>
            <button className="bt-btn kucuk ikincil" onClick={cikisYap}>
              <LogOut size={14} /> {t("ayarlar.hesap.cikisYap")}
            </button>
          </div>
        </section>
        )}
        {!misafir && (
        <section className="bt-settings-card">
          <div className="bt-settings-title">
            <KeyRound size={18} /> {t("ayarlar.giris.baslik")}
          </div>
          {/* E-posta linkiyle giris uygulama surumunden kaldirilmisti; satir
              uygulamada artik gosterilmiyor. Tarayici surumunde duruyor. */}
          {!nativeMi && (
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
          )}
          <div className="bt-setting-row">
            <div>
              <strong>{t("ayarlar.giris.parolaIle")}</strong>
              <small>
                {t("ayarlar.giris.parolaIleAciklama")}
              </small>
            </div>
            <span className="bt-yakinda" style={{ color: "#5D7A2E" }}>
              {t("ayarlar.giris.kullanilabilir")}
            </span>
          </div>
        </section>
        )}
        <BiyometrikAyar />
        <OdemeHatirlatmaAyari />
        <DilAyari />
        <ParaBirimiAyari />
        <section className="bt-settings-card">
          <div className="bt-settings-title">
            <Palette size={18} /> {t("ayarlar.gorunum.baslik")}
          </div>
          <div className="bt-setting-row">
            <div>
              <strong>{t("ayarlar.gorunum.tema")}</strong>
              <small>{t("ayarlar.gorunum.temaAciklama")}</small>
            </div>
            <div className="bt-tema-secim" role="group" aria-label={t("ayarlar.gorunum.tema")}>
              {[["Açık", false], ["Koyu", true]].map(([ad, koyu]) => (
                <button
                  key={ad}
                  type="button"
                  className={isDark === koyu ? "aktif" : ""}
                  aria-pressed={isDark === koyu}
                  onClick={() => {
                    if (isDark !== koyu) temaDegistir();
                  }}
                >
                  {koyu ? t("ayarlar.gorunum.koyu") : t("ayarlar.gorunum.acik")}
                </button>
              ))}
            </div>
          </div>
          <div className="bt-setting-row">
            <div>
              <strong>{t("ayarlar.gorunum.rehber")}</strong>
              <small>{t("ayarlar.gorunum.rehberAciklama")}</small>
            </div>
            <button className="bt-btn kucuk ikincil" onClick={rehberAc}>
              <BookOpen size={14} /> {t("ayarlar.gorunum.rehberiAc")}
            </button>
          </div>
        </section>
        {!nativeMi && <section className="bt-settings-card">
          <div className="bt-settings-title">
            <ShieldCheck size={18} /> Gizlilik ve ölçüm
          </div>
          <div className="bt-setting-row">
            <div>
              <strong>Google Analytics ve reklam ölçümü</strong>
              <small>
                Site kullanımını ve reklam kaynaklı kayıtları ölçer; e-posta ve finansal kayıtlar gönderilmez.
              </small>
            </div>
            <button
              className="bt-btn kucuk ikincil"
              type="button"
              onClick={() => {
                const yeniIzin = !olcumIzni;
                setOlcumIzni(yeniIzin);
                void googleAdsOlcumIzniAyarla(yeniIzin);
              }}
            >
              {olcumIzni ? "Ölçümü kapat" : "Ölçüme izin ver"}
            </button>
          </div>
        </section>}
        {/* Misafir uygulama surumunde bu kartta satir kalmiyor; bos kart gosterilmez. */}
        {!(nativeMi && misafir) && (
        <section className="bt-settings-card wide">
          <div className="bt-settings-title">
            <Database size={18} /> {t("ayarlar.veri.baslik")}
          </div>
          {!nativeMi && (
            <>
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
            </>
          )}
          {!misafir && (
          <div className="bt-setting-row">
            <div>
              <strong>{t("ayarlar.veri.hesabiSil")}</strong>
              <small>{t("ayarlar.veri.hesabiSilAciklama")}</small>
            </div>
            <button
              className="bt-btn kucuk bt-danger"
              type="button"
              onClick={() => setHesapSilmeAcik(true)}
            >
              <Trash2 size={14} /> {t("ayarlar.veri.hesabimiSil")}
            </button>
          </div>
          )}
        </section>
        )}
      </div>
      {paketYonetimiAcik && reklamsiz.proYonetimUrl && (
        <div
          className="bt-modal-arka"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) paketPenceresiniKapat();
          }}
        >
          <div
            className="bt-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="paket-yonetimi-baslik"
          >
            <div className="bt-modalbaslik">
              <div>
                <div id="paket-yonetimi-baslik" className="bt-h2">
                  {t("ayarlar.paket.baslik")}
                </div>
              </div>
              <button
                className="bt-btn ikon hayalet"
                type="button"
                aria-label={t("ayarlar.paket.pencereyiKapat")}
                onClick={paketPenceresiniKapat}
              >
                <X size={18} />
              </button>
            </div>
            <p style={{ color: "var(--dim)", fontSize: 13, lineHeight: 1.55 }}>
              {nativeMi
                ? t("ayarlar.paket.appStoreAciklama")
                : "Yenilemeyi durdurabilir veya ödeme kartını Borcama'dan ayrılmadan güncelleyebilirsin. Kart ekranı Paddle tarafından güvenli biçimde açılır; Borcama kart bilgilerini görmez veya saklamaz."}
            </p>
            <div
              style={{
                margin: "18px 0",
                padding: 14,
                borderRadius: 14,
                background: "var(--panel-2)",
                border: "1px solid var(--line-soft)",
              }}
            >
              <strong style={{ display: "block", fontSize: 13 }}>
                {t("ayarlar.paket.aktif")}
              </strong>
              <span style={{ display: "block", marginTop: 5, color: "var(--dim)", fontSize: 11 }}>
                {reklamsiz.proBitis
                  ? t("ayarlar.pro.tarihSatiri", { etiket: reklamsiz.proYenilenecek ? t("ayarlar.pro.sonrakiYenileme") : t("ayarlar.pro.erisimBitisi"), tarih: new Date(reklamsiz.proBitis).toLocaleDateString(locale(), { day: "numeric", month: "long", year: "numeric" }) })
                  : t("ayarlar.paket.portalBilgisi")}
              </span>
            </div>
            {iptalOnayi && !iptalDurumu.tamam && (
              <div
                style={{
                  margin: "0 0 16px",
                  padding: 14,
                  borderRadius: 14,
                  background: "rgba(255,107,87,.10)",
                  border: "1px solid rgba(255,107,87,.38)",
                }}
              >
                <strong style={{ display: "block", fontSize: 13 }}>
                  Otomatik yenilemeyi durdurmak istiyor musun?
                </strong>
                <span style={{ display: "block", marginTop: 5, color: "var(--dim)", fontSize: 11, lineHeight: 1.5 }}>
                  Bir sonraki dönemde ücret alınmaz. Mevcut Pro erişimin dönem
                  sonuna kadar devam eder.
                </span>
              </div>
            )}
            {iptalDurumu.tamam && (
              <div className="bt-bildirim basarili" style={{ marginBottom: 16 }}>
                Otomatik yenileme durduruldu. Pro erişimin mevcut döneminin sonuna
                kadar devam edecek.
              </div>
            )}
            {iptalDurumu.hata && (
              <div className="bt-bildirim hata" style={{ marginBottom: 16 }}>
                {iptalDurumu.hata}
              </div>
            )}
            {kartDurumu.tamam && (
              <div className="bt-bildirim basarili" style={{ marginBottom: 16 }}>
                Ödeme kartın güncellendi.
              </div>
            )}
            {kartDurumu.hata && (
              <div className="bt-bildirim hata" style={{ marginBottom: 16 }}>
                {kartDurumu.hata}
              </div>
            )}
            <div className="bt-form-butonlar">
              {iptalDurumu.tamam ? (
                <button className="bt-btn birincil" type="button" onClick={paketPenceresiniKapat}>
                  Tamam
                </button>
              ) : iptalOnayi ? (
                <>
                  <button
                    className="bt-btn birincil"
                    type="button"
                    disabled={iptalDurumu.yukleniyor}
                    onClick={paddleYenilemeyiIptalEt}
                    style={{ background: "var(--coral)" }}
                  >
                    {iptalDurumu.yukleniyor ? "İptal ediliyor…" : "Evet, yenilemeyi durdur"}
                  </button>
                  <button
                    className="bt-btn ikincil"
                    type="button"
                    disabled={iptalDurumu.yukleniyor}
                    onClick={() => setIptalOnayi(false)}
                  >
                    Vazgeç
                  </button>
                </>
              ) : nativeMi ? (
                <>
                  {/* App Store aboneligi yalniz Apple tarafindan yonetilir;
                      Paddle iptal ve kart guncelleme yollari native'de
                      gosterilmez (Guideline 3.1.1). */}
                  {reklamsiz.proYonetimUrl && (
                    <button
                      className="bt-btn birincil"
                      type="button"
                      onClick={() => window.open(reklamsiz.proYonetimUrl, "_system")}
                    >
                      {t("ayarlar.paket.appStoreYonet")}
                      <ArrowRight size={15} />
                    </button>
                  )}
                  <button className="bt-btn hayalet" type="button" onClick={paketPenceresiniKapat}>
                    {t("ortak.kapat")}
                  </button>
                </>
              ) : (
                <>
                  {reklamsiz.proYenilenecek && (
                    <button
                      className="bt-btn birincil"
                      type="button"
                      onClick={() => setIptalOnayi(true)}
                      style={{ background: "var(--coral)" }}
                    >
                      Yenilemeyi iptal et
                    </button>
                  )}
                  <button
                    className="bt-btn ikincil"
                    type="button"
                    disabled={kartDurumu.yukleniyor}
                    onClick={paddleKartiniGuncelle}
                  >
                    {kartDurumu.yukleniyor ? "Kart ekranı açılıyor…" : "Ödeme kartını güncelle"}
                    <ArrowRight size={15} />
                  </button>
                  <button className="bt-btn hayalet" type="button" onClick={paketPenceresiniKapat}>
                    Kapat
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {hesapSilmeAcik && (
        <div
          className="bt-modal-arka"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) hesapSilmePenceresiniKapat();
          }}
        >
          <div
            className="bt-modal bt-account-delete-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="hesap-silme-baslik"
            aria-describedby="hesap-silme-aciklama"
          >
            <div className="bt-modalbaslik">
              <div id="hesap-silme-baslik" className="bt-h2">{t("ayarlar.silme.baslik")}</div>
              <button
                className="bt-btn ikon hayalet"
                type="button"
                aria-label={t("ayarlar.paket.pencereyiKapat")}
                disabled={hesapSilmeDurumu.yukleniyor}
                onClick={hesapSilmePenceresiniKapat}
              >
                <X size={18} />
              </button>
            </div>
            <div id="hesap-silme-aciklama" className="bt-account-delete-warning">
              <strong>{t("ayarlar.silme.geriAlinamaz")}</strong>
              <ul className="bt-account-delete-list">
                <li>{t("ayarlar.silme.madde1")}</li>
                <li>{t("ayarlar.silme.madde2")}</li>
                <li>{t("ayarlar.silme.madde3")}</li>
              </ul>
            </div>
            <div className="bt-account-delete-confirm">
              <label htmlFor="hesap-silme-onayi">
                <Ceviri anahtar="ayarlar.silme.onayYaz" degerler={{ ifade: <code>{t("ayarlar.silme.onayIfadesi")}</code> }} />
              </label>
              <input
                id="hesap-silme-onayi"
                className="bt-input"
                value={hesapSilmeMetni}
                onChange={(event) => {
                  setHesapSilmeMetni(event.target.value);
                  if (hesapSilmeDurumu.hata)
                    setHesapSilmeDurumu({ yukleniyor: false, hata: "" });
                }}
                placeholder={t("ayarlar.silme.onayIfadesi")}
                autoComplete="off"
                autoFocus
                disabled={hesapSilmeDurumu.yukleniyor}
              />
            </div>
            {hesapSilmeDurumu.hata && (
              <div className="bt-bildirim hata" style={{ marginTop: 14 }}>
                {hesapSilmeDurumu.hata}
              </div>
            )}
            <div className="bt-form-butonlar" style={{ marginTop: 18 }}>
              <button
                className="bt-btn birincil"
                type="button"
                style={{ background: "var(--coral)" }}
                disabled={!hesapSilmeOnayiGecerli(hesapSilmeMetni) || hesapSilmeDurumu.yukleniyor}
                onClick={hesabiKaliciSil}
              >
                {hesapSilmeDurumu.yukleniyor ? t("ayarlar.silme.siliniyor") : t("ayarlar.silme.kaliciSil")}
              </button>
              <button
                className="bt-btn ikincil"
                type="button"
                disabled={hesapSilmeDurumu.yukleniyor}
                onClick={hesapSilmePenceresiniKapat}
              >
                {t("ortak.vazgec")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Özet ---------------- */
// İlk plan kurulumu bitene kadar Bugün dışındaki ekranlarda sıradaki adımı gösterir;
// kullanıcı bir adımı bitirdiğinde nereye gideceğini aramaz.
function RehberSeridi({ oneri, onAksiyon, onErtele, onKapat }) {
  const [secimAcik, setSecimAcik] = useState(false);
  return (
    <div key={oneri.id} className={"bt-siradaki canli" + (oneri.tur === "mezuniyet" ? " mezun" : "")} role="status">
      <span className="bt-siradaki-ikon" aria-hidden="true"><Sparkles size={17} /></span>
      <div className="bt-siradaki-metin">
        <b>{oneri.baslik}</b>
        <span>{oneri.adim ? t("ozet.rehber.adim", { adim: oneri.adim }) : ""}{oneri.aciklama}</span>
      </div>
      <div className={"bt-siradaki-aksiyon" + (secimAcik && oneri.secenekler ? " secim" : "")}>
        {secimAcik && oneri.secenekler ? (
          <div className="bt-siradaki-secenekler">
            {oneri.secenekler.map(([deger, ad]) => (
              <button key={deger} className="bt-btn birincil kucuk" type="button" onClick={() => onAksiyon(oneri, deger)}>{ad}</button>
            ))}
          </div>
        ) : (
          <button className="bt-btn birincil kucuk" type="button" onClick={() => (oneri.secenekler ? setSecimAcik(true) : onAksiyon(oneri))}>
            {oneri.aksiyonEtiketi || t("ortak.devamEt")} {oneri.tur !== "mezuniyet" && <ChevronRight size={14} />}
          </button>
        )}
        {(oneri.kapatEtiketi || oneri.ertelenebilir) && (
          <span className="bt-siradaki-baglantilar">
            {oneri.kapatEtiketi && <button className="bt-siradaki-ikincil" type="button" onClick={() => onKapat(oneri.id)}>{oneri.kapatEtiketi}</button>}
            {oneri.ertelenebilir && <button className="bt-siradaki-ikincil" type="button" title={t("ozet.rehber.erteleIpucu")} onClick={() => onErtele(oneri.id)}>{t("ortak.kapat")}</button>}
          </span>
        )}
      </div>
    </div>
  );
}

function AktivasyonKutusu({ durum, onBaslat }) {
  if (durum.tamam || !durum.siradaki) return null;
  const aktifAdim = Math.min(durum.tamamlanan + 1, durum.toplam);
  return (
    <section className="bt-aktivasyon" aria-label={t("ozet.aktivasyon.aria")}>
      <div className="bt-aktivasyon-kopya">
        <span className="bt-aktivasyon-sayac">
          {t("ozet.aktivasyon.sayac", { aktif: aktifAdim, toplam: durum.toplam })}
        </span>
        <h2>{durum.siradaki.baslik}</h2>
        <p>{durum.siradaki.aciklama}</p>
        <div
          className="bt-aktivasyon-ilerleme"
          aria-label={t("ozet.aktivasyon.ilerlemeAria", { tamam: durum.tamamlanan, toplam: durum.toplam })}
        >
          {durum.gorevler.map((gorev, index) => (
            <span
              className={gorev.tamam ? "tamam" : index === durum.tamamlanan ? "sirada" : ""}
              key={gorev.id}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
      <div className="bt-aktivasyon-aksiyon">
        <button
          className="bt-btn birincil"
          type="button"
          onClick={() => onBaslat(durum.siradaki)}
        >
          {durum.tamamlanan === 0 ? t("ozet.aktivasyon.basla") : t("ortak.devamEt")} <ChevronRight size={16} />
        </button>
      </div>
    </section>
  );
}

function Ozet({
  veri,
  toplamlar,
  kalemler,
  aylikFaiz,
  gecenAyDelta,
  buAyOdenecek,
  yaklasan,
  buAyHarcama,
  buAyGelir,
  setSekme,
  aktivasyonAdiminiBaslat,
  tutarlarGizli,
  tutarlariGizle,
  varlikOzeti,
  oneriler,
  kurNotu = null,
  proAktif,
  trialKalanGun = 0,
  proAc,
}) {
  const [haricTurler, setHaricTurler] = useState([]);
  // Senaryo kayit dizileriyle calisir; ana birime cevrilmis kopya (tek
  // birimli kullanicida ayni veri).
  const anaBirimVeri = useMemo(() => anaBirimBorcVerisi(veri), [veri]);
  const gelir = buAyGelir.toplam;
  const aktivasyon = getActivationState(veri);
  const aylikDenge = getMonthlyBalancePresentation({
    income: gelir,
    mandatoryPayments: buAyOdenecek,
    expenses: buAyHarcama.toplam,
    expenseCount: buAyHarcama.adet,
  });

  const parcalar = [
    { tur: "kart", ad: t("ozet.parca.kart"), tutar: toplamlar.kart, renk: "var(--debt-card)" },
    { tur: "kredi", ad: t("ozet.parca.kredi"), tutar: toplamlar.kredi, renk: "var(--debt-loan)" },
    { tur: "ek", ad: t("ozet.parca.ek"), tutar: toplamlar.ek, renk: "var(--debt-account)" },
    {
      tur: "diger",
      ad: t("ozet.parca.diger"),
      tutar: toplamlar.diger,
      renk: "var(--debt-other)",
    },
  ];
  const gosterilenToplam = parcalar
    .filter((p) => !haricTurler.includes(p.tur))
    .reduce((t, p) => t + p.tutar, 0);
  const bugunBorcPlani = useMemo(
    () => buildTodayDebtPlan({ data: veri, debtItems: kalemler }),
    [veri, kalemler],
  );
  // `birim`: yabanci birimdeki kaydin kendi birimi (yoksa ana birim).
  const tutarGoster = (tutar, birim) =>
    tutarlarGizli ? `${birim ? paraBirimiSimgesi(birim) : paraBirimiSimgesi()} ••••••` : fmt0(tutar, birim);
  const gunGecikti = (n) => t(n === 1 ? "ozet.gunGecikti.tekil" : "ozet.gunGecikti.cogul", { n });
  const gunKaldi = (n) => t(n === 1 ? "ozet.gunKaldi.tekil" : "ozet.gunKaldi.cogul", { n });
  const ayMetni = (n) => t(n === 1 ? "ozet.ayTekil" : "ozet.ayCogul", { n });
  const turDegistir = (tur) =>
    setHaricTurler((eski) =>
      eski.includes(tur) ? eski.filter((x) => x !== tur) : [...eski, tur],
    );

  // Odeme verisi degistikce hatirlatmalar yeniden kurulur. Ayar kapaliysa
  // bildirimleriPlanla yalniz mevcut planlari temizler.
  useEffect(() => {
    if (!nativeMi) return;
    yaklasaniKaydet(yaklasan);
    bildirimleriPlanla(yaklasan);
  }, [yaklasan]);

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
  const oncelikliOdeme = gecikmisler[0] || yaklasanlar[0] || null;
  const oncelikliGun = oncelikliOdeme ? kalanGun(oncelikliOdeme.tarih) : null;
  const oncelikliBaslik = gecikmisler.length
    ? t(gecikmisler.length === 1 ? "ozet.gecikmisTekil" : "ozet.gecikmisCogul", { n: gecikmisler.length })
    : oncelikliOdeme
      ? t("ozet.siradakiYaklasiyor")
      : t("ozet.bekleyenYok");
  const oncelikliAciklama = gecikmisler.length
    ? `${gunGecikti(-oncelikliGun)} · ${tutarGoster(oncelikliOdeme.tutar, oncelikliOdeme.paraBirimi)}`
    : oncelikliOdeme
      ? `${oncelikliGun === 0 ? t("ozet.bugunSonGun") : gunKaldi(oncelikliGun)} · ${tutarGoster(oncelikliOdeme.tutar, oncelikliOdeme.paraBirimi)}`
      : t("ozet.yeniOdemeBilgi");
  const gorunenOdemeler = [...gorunenGecikmisler, ...gorunenYaklasanlar].slice(0, 3);
  const yeniKullanici = gosterilenToplam <= 0.01 && yaklasan.length === 0;
  const borcsuzlukSenaryosu = calculateRevolvingDebtScenario({
    income: gelir,
    expenses: veri?.expenses || [],
    cards: anaBirimVeri?.cards || [],
    loans: anaBirimVeri?.loans || [],
    debts: (kalemler || []).filter((kalem) =>
      ["kart", "ek"].includes(kalem.tur),
    ),
    currentDate: bugun(),
  });
  const senaryoMetni = getFinancialScenarioCopy(borcsuzlukSenaryosu);
  const onerilenYasamButcesi = borcsuzlukSenaryosu.recommendation?.recommendedLivingBudget;
  const harcamaAzaltmaFirsati = Math.max(
    borcsuzlukSenaryosu.recommendation?.livingReductionNeeded || 0,
    0,
  );
  const onerilenBorcsuzlukSenaryosu =
    harcamaAzaltmaFirsati > 1 && Number.isFinite(onerilenYasamButcesi)
      ? calculateRevolvingDebtScenario({
          income: gelir,
          expenses: veri?.expenses || [],
          cards: anaBirimVeri?.cards || [],
          loans: anaBirimVeri?.loans || [],
          debts: (kalemler || []).filter((kalem) => ["kart", "ek"].includes(kalem.tur)),
          currentDate: bugun(),
          livingBudgetOverride: onerilenYasamButcesi,
        })
      : null;
  const hizlananAy =
    borcsuzlukSenaryosu.status === "ok" && onerilenBorcsuzlukSenaryosu?.status === "ok"
      ? Math.max(borcsuzlukSenaryosu.months - onerilenBorcsuzlukSenaryosu.months, 0)
      : 0;
  const odemeZamani = (odeme) => {
    const gun = kalanGun(odeme.tarih);
    if (gun < 0) return gunGecikti(-gun);
    if (gun === 0) return t("ozet.bugunSonGun");
    return gunKaldi(gun);
  };

  if (yeniKullanici) {
    return (
      <div className="bt-bugun-bos" data-tour="ozet">
        <span className="bt-bugun-bos-ikon"><ReceiptText size={25} /></span>
        <h1>{t("ozet.bos.baslik")}</h1>
        <p>{t("ozet.bos.aciklama")}</p>
        <AktivasyonKutusu durum={aktivasyon} onBaslat={aktivasyonAdiminiBaslat} />
      </div>
    );
  }

  return (
    <div className="bt-stack">
      {!aktivasyon.tamam && (
        <AktivasyonKutusu durum={aktivasyon} onBaslat={aktivasyonAdiminiBaslat} />
      )}
      <div className="bt-hero" data-tour="ozet">
        <span className="deko-daire" />
        <span className="deko-kare" />
        <div className="bt-hero-grid">
          <div>
            <div className="bt-hero-label-row">
              <div className="bt-hero-label">
                {t("ozet.borcToplamin")}
              </div>
              <button
                className="bt-btn hayalet bt-tutar-toggle"
                type="button"
                title={tutarlarGizli ? t("ozet.tutarlariGoster") : t("ozet.tutarlariGizle")}
                aria-label={tutarlarGizli ? t("ozet.tutarlariGoster") : t("ozet.tutarlariGizle")}
                onClick={() => tutarlariGizle(!tutarlarGizli)}
              >
                {tutarlarGizli ? <Eye size={17} /> : <EyeOff size={17} />}
              </button>
            </div>
            <div className="bt-hero-tutar">
              {tutarGoster(gosterilenToplam)}
            </div>
            <KurNotu durum={kurNotu} koyu />
            <div
              aria-hidden={!haricTurler.length}
              style={{
                color: "var(--summary-muted)",
                fontSize: 11.5,
                minHeight: 18,
                margin: "-7px 0 13px",
                visibility: haricTurler.length ? "visible" : "hidden",
              }}
            >
              {t("ozet.haricSayisi", { n: haricTurler.length || 0 })}{" "}
              <button className="bt-link" onClick={() => setHaricTurler([])} tabIndex={haricTurler.length ? 0 : -1}>
                {t("ozet.tumunuGeriEkle")}
              </button>
            </div>
            {gecenAyDelta && (
              <div className="bt-hero-delta-grup">
                <div className={"bt-hero-delta " + (gecenAyDelta.fark <= 0 ? "azaldi" : "artti")}>
                  {tutarlarGizli
                    ? t("ozet.delta.gizli")
                    : gecenAyDelta.fark === 0
                      ? t("ozet.delta.degismedi")
                      : gecenAyDelta.fark < 0
                        ? t("ozet.delta.azaldi", { tutar: fmt0(-gecenAyDelta.fark) })
                        : t("ozet.delta.artti", { tutar: fmt0(gecenAyDelta.fark) })}
                </div>
                <small className="bt-hero-delta-kaynak">
                  {t("ozet.delta.kaynak", { ay: ayEtiketi(gecenAyDelta.ay) })}
                </small>
              </div>
            )}
          </div>
          <aside className="bt-onemli-panel" aria-label={t("ozet.aksiyonlarAria")}>
            <div className="bt-onemli-liste">
              {oncelikliOdeme && (
                <button
                  className={"bt-onemli-satir " + (gecikmisler.length ? "acil" : "")}
                  type="button"
                  onClick={() => setSekme("odemeler")}
                >
                  <span className="bt-onemli-ikon" aria-hidden="true">
                    {gecikmisler.length ? <AlertTriangle size={18} /> : <CalendarCheck size={18} />}
                  </span>
                  <span>
                    <strong>{oncelikliOdeme.ad}</strong>
                    <small>{gecikmisler.length ? oncelikliBaslik : t("ozet.siradakiOdeme")} · {oncelikliAciklama}</small>
                  </span>
                  <ChevronRight size={17} aria-hidden="true" />
                </button>
              )}
              {["ok", "long_horizon", "structural_gap"].includes(borcsuzlukSenaryosu.status) && (
                <button className="bt-onemli-satir plan" type="button" onClick={() => setSekme("plan")}>
                  <span className="bt-onemli-ikon" aria-hidden="true"><TrendingUp size={18} /></span>
                  <span>
                    <strong>
                      {borcsuzlukSenaryosu.status === "structural_gap"
                        ? t("ozet.aylikAcik", { tutar: tutarGoster(borcsuzlukSenaryosu.monthlyGap) })
                        : t("ozet.borcPlaninaGec")}
                    </strong>
                    <small>
                      {borcsuzlukSenaryosu.status === "structural_gap"
                        ? t("ozet.nasilKapatacagin")
                        : aylikFaiz > 0
                          ? t("ozet.faizSiraGor", { tutar: fmt0(aylikFaiz) })
                          : t("ozet.siraHedefGor")}
                    </small>
                  </span>
                  <ChevronRight size={17} aria-hidden="true" />
                </button>
              )}
              {!oncelikliOdeme && !["ok", "long_horizon", "structural_gap"].includes(borcsuzlukSenaryosu.status) && (
                <div className="bt-onemli-bos">{t("ozet.kritikYok")}</div>
              )}
            </div>
          </aside>
        </div>
        <div className="bt-ozet-kisa" aria-label={t("ozet.buAyOzetAria")}>
          <div>
            <span>{t("ozet.kalanZorunlu")}</span>
            <strong>{tutarGoster(buAyOdenecek)}</strong>
          </div>
          <div>
            <span>{t("ozet.aylikPlan")}</span>
            <strong>
              {borcsuzlukSenaryosu.status === "structural_gap"
                ? t("ozet.acikTutar", { tutar: tutarGoster(borcsuzlukSenaryosu.monthlyGap) })
                : aylikDenge.tutar !== null
                  ? `${aylikDenge.tutar >= 0 ? "+" : ""}${tutarGoster(aylikDenge.tutar)}`
                  : t("ozet.veriEksik")}
            </strong>
            <small>
              {borcsuzlukSenaryosu.status === "structural_gap"
                ? t("ozet.acikAciklama")
                : aylikDenge.aciklama}
            </small>
          </div>
          <div>
            <span>{t("ozet.ayIciHarcama")}</span>
            <strong>{tutarGoster(buAyHarcama.toplam)}</strong>
          </div>
        </div>
        <div className="bt-borc-dagilim" aria-label={t("ozet.dagilimAria")}>
          <div className="bt-borc-dagilim-icerik">
            <div className="bt-serit">
              {gosterilenToplam > 0 && parcalar
                .filter((p) => !haricTurler.includes(p.tur))
                .map((p) => p.tutar > 0 ? (
                  <div key={p.ad} style={{ width: (p.tutar / gosterilenToplam) * 100 + "%", background: p.renk }} />
                ) : null)}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {parcalar.map((p) => (
                <button
                  key={p.ad}
                  className={"bt-chip secilebilir " + (haricTurler.includes(p.tur) ? "haric" : "")}
                  title={haricTurler.includes(p.tur) ? t("ozet.toplamaGeriEkle") : t("ozet.toplamdanCikar")}
                  onClick={() => turDegistir(p.tur)}
                >
                  <span className="dot" style={{ background: p.renk }} />
                  <span className="lbl">{p.ad}</span>
                  <span className="amt">{tutarGoster(p.tutar)}</span>
                  {haricTurler.includes(p.tur) && <Minus size={12} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section className="bt-bugun-plan" aria-labelledby="bugun-borc-plani-baslik">
        <div className="bt-bugun-plan-head">
          <div>
            <h2 id="bugun-borc-plani-baslik">{t("ozet.plan.baslik")}</h2>
            <p>{t("ozet.plan.aciklama")}</p>
          </div>
          <button className="bt-link" type="button" onClick={() => setSekme("plan")}>
            {t("ozet.plan.tumu")} <ChevronRight size={14} />
          </button>
        </div>
        <div className="bt-bugun-plan-grid">
          <div className="bt-bugun-faiz">
            <span>{t("ozet.plan.faizBaslik")}</span>
            <strong>{tutarGoster(bugunBorcPlani.monthlyInterest)}</strong>
            <small>
              {t("ozet.plan.faizNot")}
            </small>
          </div>
          {proAktif ? (
            bugunBorcPlani.priorityItems.length ? (
              <div className="bt-bugun-sira">
                {bugunBorcPlani.priorityItems.slice(0, 3).map((item, index) => (
                  <div className="bt-bugun-sira-satir" key={item.id}>
                    <span className="bt-bugun-sira-no">{index + 1}</span>
                    <span>
                      <strong>{item.ad}</strong>
                      <small>
                        {t("ozet.plan.siraFaiz", {
                          oran: Number(item.faiz || 0).toLocaleString(locale(), { maximumFractionDigits: 2 }),
                          tutar: item.paraBirimi ? tutarGoster(item.faizTutari / item.kur, item.paraBirimi) : tutarGoster(item.faizTutari),
                        })}
                      </small>
                    </span>
                    <span className="bt-bugun-sira-tutar">{item.paraBirimi ? tutarGoster(item.kayitBakiye, item.paraBirimi) : tutarGoster(item.bakiye)}</span>
                  </div>
                ))}
                {bugunBorcPlani.priorityItems.length > 3 && (
                  <div className="bt-bugun-sira-devami">
                    {t("ozet.plan.devami", { n: bugunBorcPlani.priorityItems.length - 3 })}
                  </div>
                )}
              </div>
            ) : (
              <div className="bt-bugun-plan-bos">
                <div>
                  <strong>{t("ozet.plan.bosBaslik")}</strong>
                  <span>{t("ozet.plan.bosAciklama")}</span>
                </div>
              </div>
            )
          ) : (
            <div className="bt-bugun-plan-kilit">
              <div>
                <strong>{t("ozet.plan.kilitBaslik")}</strong>
                <span>{t("ozet.plan.kilitAciklama")}</span>
              </div>
              <button className="bt-btn birincil" type="button" onClick={proAc}>
                {t("ozet.plan.siraGor")} <Sparkles size={15} />
              </button>
            </div>
          )}
        </div>
      </section>

      {!nativeMi && (
      <section className="bt-referral-campaign" aria-label="Arkadaşını davet et kampanyası">
        <span className="bt-referral-campaign-ikon" aria-hidden="true"><Gift size={19}/></span>
        <div>
          <strong>Arkadaşını davet et, ikiniz de 30 gün Pro kazanın.</strong>
          <small>Kalıcı bağlantını bir kez oluştur; doğrulanan her uygun davette ödülün eklensin.</small>
        </div>
        <a className="bt-btn kucuk ikincil" href="/settings?source=referral-campaign#arkadasini-davet-et">
          Davet et <ChevronRight size={15}/>
        </a>
      </section>
      )}

      {(gelir > 0 || proAktif) && (
        <section className={"bt-pro-senaryo " + (proAktif ? "aktif" : "kilitli")}>
          <div className="bt-pro-senaryo-ust">
            {!proMagazadaSatistaDegil() && <span className="bt-pro-senaryo-rozet"><Sparkles size={15} /> Borcama Pro</span>}
            {proAktif && trialKalanGun > 0 && <span>{t(trialKalanGun === 1 ? "ozet.pro.denemeTekil" : "ozet.pro.denemeCogul", { n: trialKalanGun })}</span>}
          </div>
          {proAktif && borcsuzlukSenaryosu.status === "ok" ? (
            <>
              <div className="bt-pro-senaryo-ana">
                <div>
                  <h2>
                    {hizlananAy > 0
                      ? t(hizlananAy === 1 ? "ozet.pro.hizlanmaBaslikTekil" : "ozet.pro.hizlanmaBaslikCogul", { n: hizlananAy })
                      : senaryoMetni.title}
                  </h2>
                  <p>
                    {hizlananAy > 0 ? (
                      <Ceviri
                        anahtar="ozet.pro.hizlanmaMetin"
                        degerler={{
                          azaltma: <b>{tutarGoster(harcamaAzaltmaFirsati)}</b>,
                          sure: <b>{t("ozet.pro.aydanAya", { once: borcsuzlukSenaryosu.months, sonra: onerilenBorcsuzlukSenaryosu.months })}</b>,
                        }}
                      />
                    ) : (
                      <Ceviri
                        anahtar="ozet.pro.tahminMetin"
                        degerler={{ neden: senaryoMetni.reason, sure: <b>{ayMetni(borcsuzlukSenaryosu.months)}</b> }}
                      />
                    )}
                  </p>
                </div>
                <button className="bt-btn birincil" type="button" onClick={() => setSekme("plan")}>
                  {t("ozet.pro.planiAc")} <ChevronRight size={16} />
                </button>
              </div>
              <div className="bt-pro-senaryo-metrikler">
                <div><span>{t("ozet.pro.mevcutPlan")}</span><strong>{ayMetni(borcsuzlukSenaryosu.months)}</strong></div>
                <div>
                  <span>{hizlananAy > 0 ? t("ozet.pro.harcamaHedefiyle") : t("ozet.pro.ilkAyKartKmh")}</span>
                  <strong>
                    {hizlananAy > 0
                      ? ayMetni(onerilenBorcsuzlukSenaryosu.months)
                      : tutarGoster(Math.max(borcsuzlukSenaryosu.initialDebtBudget, 0))}
                  </strong>
                </div>
                <div>
                  <span>{hizlananAy > 0 ? t("ozet.pro.aylikAzaltilacak") : t("ozet.pro.toplamFaiz")}</span>
                  <strong>{hizlananAy > 0 ? tutarGoster(harcamaAzaltmaFirsati) : tutarGoster(borcsuzlukSenaryosu.totalInterest)}</strong>
                </div>
              </div>
              {borcsuzlukSenaryosu.living.confidence === "low" && (
                <p className="bt-pro-senaryo-not">
                  {t("ozet.pro.geciciTahmin")}
                </p>
              )}
            </>
          ) : proAktif && borcsuzlukSenaryosu.status === "missing_spending_history" ? (
            <div className="bt-pro-senaryo-ana">
              <div>
                <h2>{senaryoMetni.title}</h2>
                <p>{senaryoMetni.reason}</p>
              </div>
              <button className="bt-btn birincil" type="button" onClick={() => setSekme("borclar")}>
                {t("ozet.pro.ekstreEkle")} <ChevronRight size={16} />
              </button>
            </div>
          ) : proAktif && borcsuzlukSenaryosu.status === "missing_income" ? (
            <div className="bt-pro-senaryo-ana">
              <div>
                <h2>{senaryoMetni.title}</h2>
                <p>{senaryoMetni.reason}</p>
              </div>
              <button className="bt-btn birincil" type="button" onClick={() => setSekme("gelir")}>
                {t("ozet.pro.gelirEkle")} <ChevronRight size={16} />
              </button>
            </div>
          ) : proAktif && borcsuzlukSenaryosu.status === "no_revolving_debt" ? (
            <div className="bt-pro-senaryo-ana">
              <div>
                <h2>{senaryoMetni.title}</h2>
                <p>{senaryoMetni.reason}</p>
              </div>
              <button className="bt-btn birincil" type="button" onClick={() => setSekme("borclar")}>
                {t("ozet.pro.borclariGor")} <ChevronRight size={16} />
              </button>
            </div>
          ) : proAktif ? (
            <>
              <div className="bt-pro-senaryo-ana">
                <div>
                  <h2>
                    {borcsuzlukSenaryosu.status === "structural_gap"
                      ? t("ozet.pro.planAcikVar", { tutar: tutarGoster(borcsuzlukSenaryosu.monthlyGap) })
                      : borcsuzlukSenaryosu.recommendation.livingReductionNeeded > 0
                      ? t("ozet.pro.harcamaAzalt", { tutar: tutarGoster(borcsuzlukSenaryosu.recommendation.livingReductionNeeded) })
                      : senaryoMetni.title}
                  </h2>
                  <p>
                    <Ceviri
                      anahtar="ozet.pro.mevcutHarcamaMetin"
                      degerler={{
                        mevcut: <b>{tutarGoster(borcsuzlukSenaryosu.livingBudget)}</b>,
                        hedef: <b>{tutarGoster(borcsuzlukSenaryosu.recommendation.recommendedLivingBudget)}</b>,
                      }}
                    />
                    {onerilenBorcsuzlukSenaryosu?.status === "structural_gap" && " " + t("ozet.pro.azaltimYetmez")}
                  </p>
                </div>
                <button className="bt-btn birincil" type="button" onClick={() => setSekme("plan")}>
                  {t("ozet.pro.planiAc")} <ChevronRight size={16} />
                </button>
              </div>
              <div className="bt-pro-senaryo-metrikler">
                <div><span>{t("ozet.pro.mevcutYasam")}</span><strong>{tutarGoster(borcsuzlukSenaryosu.livingBudget)}</strong></div>
                <div><span>{t("ozet.pro.ilkHedef")}</span><strong>{tutarGoster(borcsuzlukSenaryosu.recommendation.recommendedLivingBudget)}</strong></div>
                <div><span>{t("ozet.pro.aylikAzaltilacak")}</span><strong>{tutarGoster(borcsuzlukSenaryosu.recommendation.livingReductionNeeded)}</strong></div>
              </div>
            </>
          ) : (
            <div className="bt-pro-senaryo-ana">
              <div>
                <h2>{t("ozet.pro.kilitBaslik")}</h2>
                <p>
                  {t("ozet.pro.kilitAciklama")}
                </p>
              </div>
              <button className="bt-btn birincil" type="button" onClick={proAc}>
                {t("ozet.pro.planiGor")} <Sparkles size={16} />
              </button>
            </div>
          )}
        </section>
      )}

      <section className="bt-bugun-odemeler" aria-labelledby="bugun-odemeler-baslik">
        <div className="bt-bugun-bolum-head">
          <div>
            <h2 id="bugun-odemeler-baslik">
              {gecikmisler.length ? t("ozet.odemeler.baslikGecikmis") : t("ozet.odemeler.baslik")}
            </h2>
            <p>
              {gecikmisler.length
                ? t(gecikmisler.length === 1 ? "ozet.odemeler.gecikmisAciklamaTekil" : "ozet.odemeler.gecikmisAciklamaCogul", { n: gecikmisler.length })
                : t("ozet.odemeler.aciklama")}
            </p>
          </div>
          <button className="bt-link" type="button" onClick={() => setSekme("odemeler")}>
            {t("ozet.odemeler.tumu")} <ChevronRight size={14} />
          </button>
        </div>
        {gorunenOdemeler.length ? (
          <div className="bt-bugun-odeme-listesi">
            {gorunenOdemeler.map((odeme) => {
              const gecikmis = kalanGun(odeme.tarih) < 0;
              const rozet = (odeme.ad || t("ozet.odemeler.rozetVarsayilan"))
                .split(/\s+/)
                .map((parca) => parca[0])
                .join("")
                .slice(0, 3)
                .toLocaleUpperCase("tr-TR");
              return (
                <div className={"bt-bugun-odeme " + (gecikmis ? "gecikmis" : "")} key={odeme.id}>
                  <span className="bt-bugun-odeme-ikon">{rozet}</span>
                  <span>
                    <strong>{odeme.ad}</strong>
                    <small>{odemeZamani(odeme)}</small>
                  </span>
                  <span className="bt-bugun-odeme-tutar">
                    <b>{tutarGoster(odeme.tutar, odeme.paraBirimi)}</b>
                    <span>{odeme.tur === "kredi" ? t("ozet.odemeler.taksit") : t("ozet.odemeler.minimum")}</span>
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bt-bugun-odeme-bos">{t("ozet.odemeler.bos")}</div>
        )}
      </section>
    </div>
  );
}

function BorcamaOnerileri({
  oneriler = [],
  setSekme,
  proAktif = false,
  trialKalanGun = 0,
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
    oneri?.oncelik >= 90 ? t("ozet.oneri.simdi") : oneri?.oncelik >= 75 ? t("ozet.oneri.buHafta") : t("ozet.oneri.incele");

  return (
    <section className="bt-oneriler" aria-labelledby="borcama-oneriler-baslik">
      <div className="bt-oneriler-head">
        <div>
          <h2 id="borcama-oneriler-baslik">{t("ozet.oneri.baslik")}</h2>
          <p>
            {t("ozet.oneri.aciklama")}
          </p>
        </div>
        <div className="bt-oneri-hedef">
          <span className="bt-oneri-hedef-label">{t("ozet.oneri.oncelikSoru")}</span>
          <div className="bt-oneri-mod" aria-label={t("ozet.oneri.oncelikAria")}>
            <button
              className={mod === "nakit" ? "aktif" : ""}
              onClick={() => {
                setMod("nakit");
                setTumuAcik(false);
              }}
            >
              <Wallet size={17} />
              <span>{t("ozet.oneri.aylikAzalt")}</span>
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
              <span>{t("ozet.oneri.faizAzalt")}{proAktif ? "" : " · Pro"}</span>
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
                <span className="bt-oneri-sayac">
                  {proAktif
                    ? t("ozet.oneri.sayac", { sira: filtreli.findIndex((oneri) => oneri.id === secili.id) + 1, toplam: filtreli.length })
                    : t("ozet.oneri.ucretsiz")}
                </span>
              </div>
              <h3>{secili.baslik}</h3>
              <p>{secili.aciklama}</p>
              {secili.etki && (
                <div className="bt-oneri-etki">
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
            <div className="bt-oneri-pusula" aria-label={t("ozet.oneri.oncelikiAria", { zaman: zamanEtiketi(secili) })}>
              <div className="bt-oneri-yildiz">✦</div>
              <div className="bt-oneri-pusula-ikon">{ikon(secili.tur)}</div>
              <strong>{zamanEtiketi(secili)}</strong>
              <span>
                {proAktif
                  ? t(filtreli.length === 1 ? "ozet.oneri.taranTekil" : "ozet.oneri.taranCogul", { n: filtreli.length })
                  : t("ozet.oneri.tumAnalizPro")}
              </span>
            </div>
          </article>

          {!proAktif && filtreli.length > 1 && (
            <div className="bt-pro-kilit">
              <div className="bt-pro-kilit-ikon"><Sparkles size={20} /></div>
              <div>
                <strong>{t(filtreli.length - 1 === 1 ? "ozet.oneri.dahaHazirTekil" : "ozet.oneri.dahaHazirCogul", { n: filtreli.length - 1 })}</strong>
                <span>{t("ozet.oneri.kilitAciklama")}</span>
              </div>
              <button className="bt-btn birincil" onClick={proAc}>{t("ozet.oneri.proyuIncele")}</button>
            </div>
          )}

          {proAktif && filtreli.length > 1 && (
            <div className="bt-oneri-diger">
              <div className="bt-oneri-diger-baslik">
                <div className="bt-oneri-diger-baslik-ana">
                  <span className="bt-oneri-diger-baslik-ikon"><Sparkles size={16} /></span>
                  <span className="bt-oneri-diger-baslik-baslik">{t("ozet.oneri.finansalSinyaller")}</span>
                  <span className="bt-oneri-diger-sayac">{filtreli.length}</span>
                </div>
                <small>{t("ozet.oneri.karttaDokun")}</small>
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
          <Check size={18} /> {t("ozet.oneri.bos")}
        </div>
      )}

      <div className="bt-oneriler-alt">
        <span>
          {t("ozet.oneri.altNot")}
        </span>
        {proAktif && filtreli.length > 3 && (
          <button className="bt-link" onClick={() => setTumuAcik(!tumuAcik)}>
            {tumuAcik ? t("ozet.oneri.dahaAz") : t("ozet.oneri.tumunuGor", { n: filtreli.length })}
          </button>
        )}
      </div>
    </section>
  );
}

function OdemeSatiri({
  o,
  i,
  gecikmis,
  odendiIsaretle,
  kartOdemesiAc,
  krediOdemesiAc,
  saltOkunur = false,
}) {
  // Odeme satiri kaydin kendi biriminde.
  const fmt = (n) => fmtBirimli(n, o.paraBirimi);
  const gun = kalanGun(o.tarih);
  const gercektenGecikmis =
    gun < 0 &&
    !(o.kartOdemesi ? o.minimumTamam || o.tamamiOdendi || o.yapilandirmaIleKapandi : o.odendi);
  const kartDurumu = o.yapilandirmaIleKapandi
    ? { sinif: "minimum", metin: t("odemeler.satir.yapilandirildi") }
    : o.tamamiOdendi
    ? { sinif: "tamami", metin: t("odemeler.satir.tamamiOdendi") }
    : o.minimumTamam
      ? { sinif: "minimum", metin: t("odemeler.satir.asgariTamamKalanVar") }
      : o.yapilanOdeme > 0
        ? { sinif: "kismi", metin: t("odemeler.satir.kismiYapildi") }
        : { sinif: "", metin: t("odemeler.satir.henuzYok") };
  const gecikmeMetni =
    -gun === 1
      ? t("odemeler.satir.geciktiTekil", { n: -gun })
      : t("odemeler.satir.geciktiCogul", { n: -gun });
  const kalanGunMetni =
    gun === 1
      ? t("odemeler.satir.kaldiTekil", { n: gun })
      : t("odemeler.satir.kaldiCogul", { n: gun });
  return (
    <div className="bt-satirD">
      <BankaRozeti
        banka={o.banka}
        bg={gercektenGecikmis ? CORAL : LIME}
        rot={ROTASYONLAR[i % ROTASYONLAR.length]}
      />
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
            color: gercektenGecikmis ? CORAL : "#8a8c7e",
            fontWeight: gercektenGecikmis ? 600 : 400,
          }}
        >
          {o.kartOdemesi
            ? (o.not ? o.not + " · " : "") +
              (o.yapilandirmaIleKapandi
              ? t("odemeler.satir.kartYapilandirmaya")
              : o.minimumTamam && !o.tamamiOdendi
              ? t("odemeler.satir.asgariTamamDevam")
              : gercektenGecikmis
                ? gecikmeMetni
                : gun === 0
                  ? t("odemeler.satir.bugunSonGun")
                  : kalanGunMetni)
            : o.odendi
            ? t("odemeler.satir.odendi")
            : gercektenGecikmis
              ? gecikmeMetni
              : gun === 0
                ? t("odemeler.satir.bugunSonGun")
                : kalanGunMetni}
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div className="bt-satirD-tutar">
          {fmt(o.kartOdemesi ? o.kalanToplam : o.tutar)}
        </div>
        <div className="bt-satirD-tur">
          {o.kartOdemesi ? t("odemeler.kalanToplamBorc") : o.not}
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
            {o.yapilandirmaIleKapandi
              ? t("odemeler.satir.zorunluKartYok")
              : o.tutar > 0.01
                ? t("odemeler.satir.kalanAsgari", { tutar: fmt(o.tutar) })
                : t("odemeler.satir.asgariTamam")}
          </div>
        )}
        <div
          className="bt-satirD-tur"
          style={{
            color: o.odemeBilgisiYok ? "#8a8c7e" : "#5D7A2E",
            fontWeight: 700,
          }}
        >
          {o.yapilandirmaIleKapandi
            ? t("odemeler.satir.yapilandirmayaTasinan", { tutar: fmt(o.yapilandirilanTutar) })
            : t("odemeler.satir.yapilanOdeme", {
                tutar: o.odemeBilgisiYok ? t("odemeler.satir.eskiBilgiYok") : fmt(o.yapilanOdeme),
              })}
          {o.odemeKayitSayisi > 0
            ? ` · ${
                o.odemeKayitSayisi === 1
                  ? t("odemeler.satir.yeniKayitTekil", { n: o.odemeKayitSayisi })
                  : t("odemeler.satir.yeniKayitCogul", { n: o.odemeKayitSayisi })
              }`
            : ""}
        </div>
        {o.kartOdemesi && (
          <div className={"bt-kart-odeme-durum " + kartDurumu.sinif}>
            {kartDurumu.metin}
          </div>
        )}
      </div>
      {saltOkunur ? (
        <button
          className="bt-btn kucuk heroghost"
          onClick={() => kartOdemesiAc?.(o)}
        >
          {t("odemeler.satir.odemelereGit")} <ChevronRight size={12} />
        </button>
      ) : o.kartOdemesi ? (
        o.yapilandirmaIleKapandi ? (
          <div className="bt-btn kucuk heroghost" style={{ cursor: "default" }}>
            <Check size={12} /> {t("odemeler.satir.yapilandirmaPlani")}
          </div>
        ) : o.tamamiOdendi ? (
          <div className="bt-btn kucuk heroghost" style={{ cursor: "default" }}>
            <Check size={12} /> {t("odemeler.satir.tamamiOdendi")}
          </div>
        ) : (
          <button
            className="bt-btn kucuk heroghost"
            onClick={() => kartOdemesiAc?.(o)}
          >
            <Plus size={12} /> {t("odemeler.satir.odemeGir")}
          </button>
        )
      ) : (
        <button
          className="bt-btn kucuk heroghost"
          onClick={() => krediOdemesiAc?.(o)}
        >
          {o.odendi ? (
            <>
              <Pencil size={12} /> {t("odemeler.satir.odemeyiDuzenle")}
            </>
          ) : (
            <>
              <Plus size={12} /> {t("odemeler.satir.odemeGir")}
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
  krediOdemesiKaydet,
  filtre = "bekleyen",
  filtreDegistir,
  islemler = [],
  islemiGeriAl,
  kurNotu = null,
}) {
  const [kartOdemePenceresi, setKartOdemePenceresi] = useState(null);
  const [krediOdemePenceresi, setKrediOdemePenceresi] = useState(null);
  const [kismiOdemeTutari, setKismiOdemeTutari] = useState("");
  const donemler = useMemo(() => {
    const aylar = new Set([ayAnahtari()]);
    (veri.cards || []).forEach((kart) => {
      if (kart.ekstreAyi) aylar.add(kartOdemeAyi(kart));
      (kart.ekstreGecmisi || []).forEach((ekstre) => {
        if (ekstre.ekstreAyi)
          aylar.add(kartOdemeAyi(mergeArchivedCardStatement(kart, ekstre)));
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
        ...(donem === ayAnahtari()
          ? []
          : (kart.ekstreGecmisi || []).map((ekstre) =>
              mergeArchivedCardStatement(kart, ekstre),
            )),
      ].filter(Boolean);
      ekstreler
        .filter((kayit) => kartOdemeAyi(kayit) === donem)
        .forEach((kayit) => {
          const h = kartHesabi(kayit);
          const yapilandirmaIleKapandi = Boolean(latestCardRestructuring(kart)) && h.toplam <= 0.01;
          if (h.onceki <= 0 && h.toplam <= 0 && !yapilandirmaIleKapandi) return;
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
          const minimumTamam = hedefTutar > 0.01 && tutar <= 0.01;
          const tamamiOdendi = !yapilandirmaIleKapandi && kalanToplam <= 0.01;
          liste.push({
            id: "kart-" + kart.id + "-" + kayit.ekstreAyi,
            kartOdemesi: true,
            banka: kart.banka,
            ad: kartGorunenAdi(kart),
            ekstreAyi: kayit.ekstreAyi,
            tutar,
            kalanToplam,
            minimumOdeme: hedefTutar,
            hedefTutar,
            yapilanOdeme,
            odemeKayitSayisi: odemeKayitlari.length,
            not: t("odemeler.kartNotu", {
              ekstre: ayEtiketi(kayit.ekstreAyi),
              odeme: ayEtiketi(donem),
            }),
            tarih: kartGecikmeTarihi(kayit),
            odendi: minimumTamam,
            minimumTamam,
            tamamiOdendi,
            yapilandirmaIleKapandi,
            yapilandirilanTutar: yapilandirmaIleKapandi ? latestCardRestructuring(kart)?.tutar || 0 : 0,
            anahtar: odemeAnahtari,
            ...(yabanciBirim(kart) ? { paraBirimi: yabanciBirim(kart) } : {}),
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
        const hedefTutar = +odeme.taksit || 0;
        const yapilanOdeme = +(odeme.tutar ?? odeme.taksit) || 0;
        liste.push({
          id: "gecmis-kredi-" + odeme.krediId + "-" + donem,
          banka: odeme.banka,
          ad: odeme.banka + (odeme.ad ? " · " + odeme.ad : ""),
          krediId: odeme.krediId,
          tutar: Math.max(hedefTutar - yapilanOdeme, 0),
          hedefTutar,
          yapilanOdeme,
          kalanKrediBorcu: +odeme.kalanBorc || 0,
          not: t("odemeler.odenenTaksit"),
          tarih,
          odendi: yapilanOdeme + 0.01 >= hedefTutar,
          anahtar: "kredi-" + odeme.krediId + "-" + donem,
          ...(() => {
            const kredi = (veri.loans || []).find((k) => k.id === odeme.krediId);
            return kredi && yabanciBirim(kredi) ? { paraBirimi: yabanciBirim(kredi) } : {};
          })(),
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
  const zorunluHedefler = sirali.filter((x) => +x.hedefTutar > 0.01 && !x.yapilandirmaIleKapandi);
  const hedefiTamamlanan = zorunluHedefler.filter((x) => x.odendi);
  // Ödenen kayıtlar da seçili ödeme ayına aittir. Böylece aynı kartın bütün
  // arşiv ekstreleri tek ekranda tekrarlanmaz; geçmiş aylar dönem seçicisinden
  // ayrı ayrı incelenebilir.
  const odemeYapilan = sirali
    .filter((x) => (+x.yapilanOdeme || 0) > 0 || x.yapilandirmaIleKapandi)
    .sort((a, b) => b.tarih - a.tarih);
  // Asgari tamamlandıysa o ayın zorunlu kart ödemesi tamamlanmıştır. Kalan
  // devreden bakiye borç ekranında görünür; burada tekrar bekliyor denmez.
  const bekleyen = sirali.filter(isMandatoryPaymentPending);
  const {
    total: toplam,
    covered: odenen,
    remaining: kalan,
  } = summarizeMandatoryPayments(odemeleriAnaBirimeCevir(sirali));
  const eskiKayitSayisi = sirali.filter((x) => x.odemeBilgisiYok).length;
  return (
    <div className="bt-stack">
      {(() => {
        const aktifKayitlar = bekleyen;
        return (
          <div className={`bt-card bt-odeme-aktif-liste ${aktifKayitlar.length ? "" : "bt-odeme-tamam"}`}>
            <div className="bt-cardhead">
              <div className="bt-h2">{aktifKayitlar.length ? t("odemeler.bekleyenBaslik") : t("odemeler.tamamBaslik")}</div>
              {aktifKayitlar.length > 0 && <div className="bt-chip">
                {aktifKayitlar.length === 1
                  ? t("odemeler.kayitTekil", { n: aktifKayitlar.length })
                  : t("odemeler.kayitCogul", { n: aktifKayitlar.length })}
              </div>}
            </div>
            {aktifKayitlar.length === 0 ? (
              <div style={{ color: "var(--dim)", fontSize: 12 }}>{t("odemeler.aktifBos")}</div>
            ) : (
              <div className="bt-stack" style={{ gap: 10, marginTop: 14 }}>
                {aktifKayitlar.map((o, i) => (
                  <OdemeSatiri
                    key={o.id}
                    o={o}
                    i={i}
                    gecikmis={
                      kalanGun(o.tarih) < 0 &&
                      !(o.kartOdemesi && (o.minimumTamam || o.yapilandirmaIleKapandi))
                    }
                    odendiIsaretle={odendiIsaretle}
                    kartOdemesiAc={(odeme) => {
                      setKismiOdemeTutari("");
                      setKartOdemePenceresi(odeme);
                    }}
                    krediOdemesiAc={(odeme) => {
                      setKismiOdemeTutari("");
                      setKrediOdemePenceresi(odeme);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })()}
      <div className="bt-card" data-tour="odemeler">
        <div className="bt-cardhead">
          <div>
            <div className="bt-h2" style={{ margin: 0 }}>
              {t("odemeler.odemeAyi", { ay: ayEtiketi(donem) })}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <select
              className="bt-input"
              aria-label={t("odemeler.donemAria")}
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
              {t("odemeler.hedefTamam", {
                tamam: hedefiTamamlanan.length,
                toplam: zorunluHedefler.length,
              })}
            </div>
          </div>
        </div>
        <div className="bt-grid" style={{ marginTop: 16 }}>
          <div className="bt-metric">
            <div className="bt-metric-lbl">{t("odemeler.metrik.zorunlu")}</div>
            <div className="bt-metric-amt">{fmt(toplam)}</div>
            <KurNotu durum={kurNotu} />
            <div className="bt-metric-cap">
              {t("odemeler.metrik.zorunluAlt")}
            </div>
          </div>
          <div className="bt-metric">
            <div className="bt-metric-lbl">{t("odemeler.metrik.tamamlanan")}</div>
            <div className="bt-metric-amt">{fmt(odenen)}</div>
            <div className="bt-metric-cap">
              {t("odemeler.metrik.tamamlananAlt")}
            </div>
          </div>
          <div className="bt-metric">
            <div className="bt-metric-lbl">{t("odemeler.metrik.kalan")}</div>
            <div className="bt-metric-amt">{fmt(kalan)}</div>
            <div className="bt-metric-cap">
              {t("odemeler.metrik.kalanAlt")}
            </div>
          </div>
        </div>
      </div>
      <div className="bt-ipucu">
        <CalendarCheck size={16} />
        <div>
          <Ceviri
            anahtar="odemeler.ipucu"
            degerler={{ vurgu: <b>{t("odemeler.ipucuVurgu", { ay: ayEtiketi(donem) })}</b> }}
          />
        </div>
      </div>
      {eskiKayitSayisi > 0 && (
        <div className="bt-ipucu" style={{ borderColor: CORAL }}>
          <Lightbulb size={16} />
          <div>
            <Ceviri
              anahtar="odemeler.eskiKayit"
              degerler={{ baslik: <b>{t("odemeler.eskiKayitBaslik", { n: eskiKayitSayisi })}</b> }}
            />
          </div>
        </div>
      )}
      {odemeYapilan.length > 0 && (
        <details className="bt-card bt-plan-detay">
          <summary>{t("odemeler.odenenlerOzet", { n: odemeYapilan.length })}</summary>
          <div className="bt-stack" style={{ gap: 10, padding: "0 12px 12px" }}>
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
                krediOdemesiAc={(odeme) => {
                  setKismiOdemeTutari("");
                  setKrediOdemePenceresi(odeme);
                }}
              />
            ))}
          </div>
        </details>
      )}
      {islemler.length > 0 && (
        <details className="bt-card bt-plan-detay">
          <summary>{t("odemeler.islemGecmisi")}</summary>
          <div style={{ padding: "0 12px 12px" }}>
          <div className="bt-islem-aciklama">
            {t("odemeler.islemAciklama")}
          </div>
            <div className="bt-islem-listesi">
              {islemler.map((islem) => (
                <div className="bt-islem-satiri" key={islem.id}>
                  <div>
                    <strong>{tDeger(islem.baslik)}</strong>
                    <span>{tDeger(islem.detay)} · {tarihSaatEtiketi(islem.tarih)}</span>
                  </div>
                  {islem.geriAlindi ? (
                    <span className="bt-islem-durum">{t("odemeler.geriAlindi")}</span>
                  ) : islem.geriAl ? (
                    <button
                      type="button"
                      className="bt-btn kucuk ikincil"
                      onClick={() => islemiGeriAl?.(islem.id)}
                    >
                      <RotateCcw size={13} /> {t("odemeler.geriAl")}
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </details>
      )}
      {donem === ayAnahtari() && (
        <div className="bt-card">
          <div className="bt-h2">{t("odemeler.gelecekBaslik")}</div>
          {gelecekOdemeler.length === 0 ? (
            <div className="bt-bos">
              {t("odemeler.gelecekBos")}
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
                  krediOdemesiAc={(odeme) => {
                    setKismiOdemeTutari("");
                    setKrediOdemePenceresi(odeme);
                  }}
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
                <div id="kart-odeme-baslik" className="bt-h2">
                  {kartOdemePenceresi.ad}
                </div>
              </div>
              <button className="bt-btn hayalet" onClick={() => setKartOdemePenceresi(null)} aria-label={t("ortak.kapat")}>
                <X size={17} />
              </button>
            </div>
            <div className="bt-kart-odeme-ozet">
              <div>
                <span>{t("odemeler.modal.kalanMinimum")}</span>
                <strong>{fmt(kartOdemePenceresi.tutar, kartOdemePenceresi.paraBirimi)}</strong>
              </div>
              <div>
                <span>{t("odemeler.kalanToplamBorc")}</span>
                <strong>{fmt(kartOdemePenceresi.kalanToplam, kartOdemePenceresi.paraBirimi)}</strong>
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
                <span><strong>{t("odemeler.modal.minimumuOdedim")}</strong><small>{t("odemeler.modal.minimumuOdedimAlt")}</small></span>
                <b>{kartOdemePenceresi.tutar > 0 ? fmt(kartOdemePenceresi.tutar, kartOdemePenceresi.paraBirimi) : t("odemeler.modal.tamamlandi")}</b>
              </button>
              <div className="bt-kart-odeme-secimi" style={{ cursor: "default" }}>
                <span><strong>{t("odemeler.modal.kismiYaptim")}</strong><small>{t("odemeler.modal.kismiYaptimAlt")}</small></span>
                <span />
                <ParaInput
                  className="bt-input"
                  placeholder={ornekSayiMetni("odemeler.modal.tutarOrnek", 5000)}
                  value={kismiOdemeTutari}
                  onValueChange={setKismiOdemeTutari}
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
                  {t("odemeler.modal.kismiKaydet")}
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
                <span><strong>{t("odemeler.modal.tamaminiOdedim")}</strong><small>{t("odemeler.modal.tamaminiOdedimAlt")}</small></span>
                <b>{fmt(kartOdemePenceresi.kalanToplam, kartOdemePenceresi.paraBirimi)}</b>
              </button>
            </div>
          </div>
        </div>
      )}
      {krediOdemePenceresi && (
        <div
          className="bt-modal-arka"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setKrediOdemePenceresi(null);
          }}
        >
          <div className="bt-modal" role="dialog" aria-modal="true" aria-labelledby="kredi-odeme-baslik">
            <div className="bt-modalbaslik">
              <div>
                <div id="kredi-odeme-baslik" className="bt-h2">
                  {krediOdemePenceresi.ad}
                </div>
              </div>
              <button className="bt-btn hayalet" onClick={() => setKrediOdemePenceresi(null)} aria-label={t("ortak.kapat")}>
                <X size={17} />
              </button>
            </div>
            <div className="bt-kart-odeme-ozet">
              <div>
                <span>
                  {t("odemeler.modal.kalanTaksit", {
                    donem: krediOdemePenceresi.donemEtiketi || t("odemeler.modal.buAy"),
                  })}
                </span>
                <strong>{fmt(krediOdemePenceresi.tutar, krediOdemePenceresi.paraBirimi)}</strong>
              </div>
              <div>
                <span>{t("odemeler.modal.kalanKrediBorcu")}</span>
                <strong>{fmt(krediOdemePenceresi.kalanKrediBorcu, krediOdemePenceresi.paraBirimi)}</strong>
              </div>
            </div>
            <div className="bt-kart-odeme-secenekler">
              <button
                className="bt-kart-odeme-secimi"
                type="button"
                onClick={() => {
                  krediOdemesiKaydet(
                    krediOdemePenceresi.anahtar,
                    krediOdemePenceresi.tutar,
                    "taksit",
                  );
                  setKrediOdemePenceresi(null);
                }}
              >
                <span>
                  <strong>
                    {t("odemeler.modal.taksitiOdedim", {
                      donem: krediOdemePenceresi.donemEtiketi || t("odemeler.modal.buAy"),
                    })}
                  </strong>
                  <small>{t("odemeler.modal.taksitiOdedimAlt")}</small>
                </span>
                <b>{fmt(krediOdemePenceresi.tutar, krediOdemePenceresi.paraBirimi)}</b>
              </button>
              <div className="bt-kart-odeme-secimi" style={{ cursor: "default" }}>
                <span><strong>{t("odemeler.modal.farkliTutar")}</strong><small>{t("odemeler.modal.farkliTutarAlt")}</small></span>
                <span />
                <ParaInput
                  className="bt-input"
                  placeholder={ornekSayiMetni("odemeler.modal.tutarOrnek", 5000)}
                  value={kismiOdemeTutari}
                  onValueChange={setKismiOdemeTutari}
                  style={{ gridColumn: "1/-1", width: "100%" }}
                />
                <button
                  className="bt-btn birincil"
                  type="button"
                  disabled={
                    !(parseParaGirisi(kismiOdemeTutari) > 0) ||
                    parseParaGirisi(kismiOdemeTutari) > krediOdemePenceresi.kalanKrediBorcu
                  }
                  onClick={() => {
                    krediOdemesiKaydet(
                      krediOdemePenceresi.anahtar,
                      parseParaGirisi(kismiOdemeTutari),
                      "kismi",
                    );
                    setKrediOdemePenceresi(null);
                  }}
                  style={{ gridColumn: "1/-1", justifyContent: "center" }}
                >
                  {t("odemeler.modal.odemeyiKaydet")}
                </button>
              </div>
              <button
                className="bt-kart-odeme-secimi"
                type="button"
                onClick={() => {
                  krediOdemesiKaydet(
                    krediOdemePenceresi.anahtar,
                    krediOdemePenceresi.kalanKrediBorcu,
                    "kapat",
                  );
                  setKrediOdemePenceresi(null);
                }}
              >
                <span><strong>{t("odemeler.modal.krediKapattim")}</strong><small>{t("odemeler.modal.krediKapattimAlt")}</small></span>
                <b>{fmt(krediOdemePenceresi.kalanKrediBorcu, krediOdemePenceresi.paraBirimi)}</b>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BorcUzerindenOdemeModal({
  odeme,
  onClose,
  kartOdemesiKaydet,
  krediOdemesiKaydet,
}) {
  const [kismiTutar, setKismiTutar] = useState("");
  const fmt = (n) => fmtBirimli(n, odeme?.paraBirimi);
  const kartMi = odeme?.tur === "kart";
  useEffect(() => {
    const oncekiOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = oncekiOverflow;
    };
  }, []);
  if (!odeme) return null;
  const girilenTutar = parseParaGirisi(kismiTutar);
  const kalanToplam = kartMi ? odeme.kalanToplam : odeme.kalanKrediBorcu;
  const kalanHedef = Math.max(+odeme.tutar || 0, 0);
  const kaydet = (tutar, tur) => {
    if (kartMi) kartOdemesiKaydet?.(odeme.anahtar, tutar, tur);
    else krediOdemesiKaydet?.(odeme.anahtar, tutar, tur);
    onClose?.();
  };
  return (
    <div
      className="bt-modal-arka"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        className="bt-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="borc-odeme-baslik"
      >
        <div className="bt-modalbaslik">
          <div>
            <div id="borc-odeme-baslik" className="bt-h2">{odeme.ad}</div>
          </div>
          <button className="bt-btn hayalet" onClick={onClose} aria-label={t("ortak.kapat")}>
            <X size={17} />
          </button>
        </div>
        <div className="bt-kart-odeme-ozet">
          <div>
            <span>
              {kartMi
                ? t("odemeler.modal.kalanMinimum")
                : t("odemeler.modal.kalanTaksit", { donem: t("odemeler.modal.buAy") })}
            </span>
            <strong>{fmt(kalanHedef)}</strong>
          </div>
          <div>
            <span>{kartMi ? t("odemeler.kalanToplamBorc") : t("odemeler.modal.kalanKrediBorcu")}</span>
            <strong>{fmt(kalanToplam)}</strong>
          </div>
        </div>
        <div className="bt-kart-odeme-secenekler">
          <button
            className="bt-kart-odeme-secimi"
            type="button"
            disabled={kalanHedef <= 0}
            onClick={() => kaydet(kalanHedef, kartMi ? "minimum" : "taksit")}
          >
            <span>
              <strong>{kartMi ? t("odemeler.modal.minimumuOdedim") : t("odemeler.modal.buTaksitiOdedim")}</strong>
              <small>{kartMi ? t("odemeler.modal.minimumuOdedimAlt") : t("odemeler.modal.buTaksitiOdedimAlt")}</small>
            </span>
            <b>{kalanHedef > 0 ? fmt(kalanHedef) : t("odemeler.modal.tamamlandi")}</b>
          </button>
          <div className="bt-kart-odeme-secimi" style={{ cursor: "default" }}>
            <span>
              <strong>{kartMi ? t("odemeler.modal.kismiYaptim") : t("odemeler.modal.farkliTutar")}</strong>
              <small>{t("odemeler.modal.farkliTutarAlt")}</small>
            </span>
            <span />
            <ParaInput
              className="bt-input"
              placeholder={ornekSayiMetni("odemeler.modal.tutarOrnek", 5000)}
              value={kismiTutar}
              onValueChange={setKismiTutar}
              style={{ gridColumn: "1/-1", width: "100%" }}
            />
            <button
              className="bt-btn birincil"
              type="button"
              disabled={!(girilenTutar > 0) || girilenTutar > kalanToplam}
              onClick={() => kaydet(girilenTutar, "kismi")}
              style={{ gridColumn: "1/-1", justifyContent: "center" }}
            >
              {t("odemeler.modal.odemeyiKaydet")}
            </button>
          </div>
          <button
            className="bt-kart-odeme-secimi"
            type="button"
            disabled={kalanToplam <= 0}
            onClick={() => kaydet(kalanToplam, kartMi ? "tamami" : "kapat")}
          >
            <span>
              <strong>{kartMi ? t("odemeler.modal.tamaminiOdedim") : t("odemeler.modal.krediKapattim")}</strong>
              <small>{kartMi ? t("odemeler.modal.tamaminiOdedimAlt") : t("odemeler.modal.krediSifirlar")}</small>
            </span>
            <b>{fmt(kalanToplam)}</b>
          </button>
        </div>
      </div>
    </div>
  );
}

function StatementImportModal({ cards, initialCardId = "", onClose, onUse, onManual }) {
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [selectedCard, setSelectedCard] = useState(initialCardId);
  const [automaticCardMatch, setAutomaticCardMatch] = useState(null);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  function numberOrNull(value) {
    if (value === "" || value === null || value === undefined) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function derive(next) {
    const statementTotal = numberOrNull(next.statementTotal);
    const currentPurchases = numberOrNull(next.currentPurchases);
    const fees = numberOrNull(next.fees);
    const previousBalance = numberOrNull(next.previousBalance);
    const periodPayments = numberOrNull(next.periodPayments);
    if (statementTotal === null)
      return { ...next, blockingErrors: validateStatementResult(next) };
    const knownNew =
      (currentPurchases !== null ? Math.max(currentPurchases, 0) : 0) +
      (fees !== null ? Math.max(fees, 0) : 0);
    if (knownNew > 0 && statementTotal + 0.01 >= knownNew) {
      const derived = {
        ...next,
        currentPeriodDebt: Math.round(knownNew * 100) / 100,
        carriedBalance:
          Math.round(Math.max(statementTotal - knownNew, 0) * 100) / 100,
      };
      return { ...derived, blockingErrors: validateStatementResult(derived) };
    }
    if (previousBalance !== null) {
      const carriedBalance = Math.max(
        previousBalance - Math.max(periodPayments || 0, 0),
        0,
      );
      const derived = {
        ...next,
        carriedBalance: Math.round(carriedBalance * 100) / 100,
        currentPeriodDebt:
          Math.round(Math.max(statementTotal - carriedBalance, 0) * 100) / 100,
      };
      return { ...derived, blockingErrors: validateStatementResult(derived) };
    }
    const derived = { ...next, carriedBalance: 0, currentPeriodDebt: statementTotal };
    return { ...derived, blockingErrors: validateStatementResult(derived) };
  }

  function update(key, value) {
    setResult((current) => {
      const next = { ...current, [key]: value };
      return [
        "statementTotal",
        "currentPurchases",
        "fees",
        "previousBalance",
        "periodPayments",
      ].includes(key)
        ? derive(next)
        : next;
    });
  }

  function updateTransaction(key, patch) {
    setResult((current) => ({
      ...current,
      transactions: (current.transactions || []).map((item) =>
        item.key === key ? { ...item, ...patch } : item,
      ),
    }));
  }

  async function handleFile(file) {
    setError("");
    setResult(null);
    setBusy(true);
    setProgress({ stage: "prepare", progress: 0, page: 1, pages: 1 });
    try {
      const parsed = await readStatementFile(file, setProgress);
      setResult(parsed);
      const match = matchStatementToCard(cards, parsed);
      setAutomaticCardMatch(match);
      setSelectedCard(match?.card?.id || initialCardId || "__new__");
      setProgress({ stage: "done", progress: 1, page: parsed.pagesRead, pages: parsed.pagesRead });
    } catch (caught) {
      const technicalMessage = String(caught?.message || "");
      const isPdfCompatibilityError =
        /getOrInsertComputed|Promise\.withResolvers|pdf\.worker/i.test(
          technicalMessage,
        );
      setError(
        isPdfCompatibilityError
          ? t("ekstre.pdfHazirlanamadi", { ortam: ortamSozcugu, yenileme: yenilemeYonergesi })
          : technicalMessage ||
              t("ekstre.okunamadi"),
      );
    } finally {
      setBusy(false);
    }
  }

  const totalProgress = progress
    ? Math.min(
        100,
        Math.round(
          (((progress.page || 1) - 1 + (progress.progress || 0)) /
            Math.max(progress.pages || 1, 1)) *
            100,
        ),
      )
    : 0;
  const stageLabel =
    progress?.stage === "render"
      ? t("ekstre.asama.render", { sayfa: progress.page, toplam: progress.pages })
      : progress?.stage === "done"
        ? t("ekstre.asama.bitti")
        : progress?.stage === "prepare"
          ? t("ekstre.asama.hazirlik")
          : t("ekstre.asama.okuma", { sayfa: progress?.page || 1, toplam: progress?.pages || 1 });

  const canUse =
    result &&
    selectedCard &&
    result.statementTotal !== null &&
    result.statementTotal !== "" &&
    result.statementPeriod &&
    result.dueDate &&
    !result.blockingErrors?.length;

  return (
    <div
      className="bt-modal-arka"
      role="presentation"
      onMouseDown={(event) => {
        if (!busy && event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="bt-modal bt-ekstre-yukle"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ekstre-yukle-baslik"
      >
        <div className="bt-extract-head">
          <div>
            <div id="ekstre-yukle-baslik" className="bt-h2" style={{ margin: "4px 0 6px" }}>
              {t("ekstre.baslik")}
            </div>
            <div style={{ color: "var(--dim)", fontSize: 12, lineHeight: 1.5 }}>
              {t("ekstre.aciklama")}
            </div>
          </div>
          {result && (
            <div className={`bt-confidence${result.blockingErrors?.length ? " hata" : ""}`}>
              {result.blockingErrors?.length
                ? t("ekstre.kontrolGerekli")
                : t("ekstre.alanEslesmesi", { oran: result.confidence })}
            </div>
          )}
        </div>

        {!result && (
          <>
            <div className="bt-privacy-first" role="note">
              <span><ShieldCheck size={22} /></span>
              <div>
                <strong>{t("ekstre.gizlilik.baslik")}</strong>
                <p>
                  {t("ekstre.gizlilik.metin", { ortam: ortamSozcugu })}
                </p>
                <div className="bt-privacy-first-list" aria-label={t("ekstre.gizlilik.ozet")}>
                  <span>{t("ekstre.gizlilik.cihazda")}</span>
                  <span>{t("ekstre.gizlilik.hamSaklanmaz")}</span>
                  <span>{t("ekstre.gizlilik.onay")}</span>
                </div>
              </div>
            </div>
            <label className="bt-upload-zone">
              <input
                type="file"
                accept="application/pdf,image/png,image/jpeg"
                disabled={busy}
                onChange={(event) => handleFile(event.target.files?.[0])}
              />
              <span className="bt-upload-icon"><Upload size={24} /></span>
              <strong>{busy ? stageLabel : t("ekstre.dosyaSec")}</strong>
              <span style={{ marginTop: 6, color: "var(--dim)", fontSize: 11.5 }}>
                {t("ekstre.dosyaSinir")}
              </span>
            </label>
            {onManual && (
              <div className="bt-upload-manual">
                <button className="bt-btn ikincil kucuk" type="button" onClick={onManual}>
                  <Pencil size={14} /> {t("ekstre.manuel")}
                </button>
              </div>
            )}
          </>
        )}

        {(busy || progress) && !result && (
          <div>
            <div className="bt-upload-progress" aria-label={t("ekstre.yuzde", { oran: totalProgress })}>
              <div style={{ width: `${Math.max(totalProgress, busy ? 4 : 0)}%` }} />
            </div>
            <div style={{ color: "var(--dim)", fontSize: 10.5 }}>{stageLabel}</div>
          </div>
        )}

        {error && (
          <div className="bt-extract-warning">
            <AlertTriangle size={16} /> <span>{error}</span>
          </div>
        )}

        {result && (
          <>
            <div className="bt-extract-grid">
              {automaticCardMatch && selectedCard === automaticCardMatch.card.id ? (
                <div className="bt-auto-card-match">
                  <span><Check size={17} /></span>
                  <span>
                    <strong>
                      {kartGorunenAdi(automaticCardMatch.card)}
                    </strong>
                    <small>
                      {t("ekstre.otomatikEslesti")}
                      {result.cardLast4 ? ` · •••• ${result.cardLast4}` : ""}
                    </small>
                  </span>
                  <button type="button" onClick={() => setAutomaticCardMatch(null)}>
                    {t("ekstre.degistir")}
                  </button>
                </div>
              ) : (
                <label className="genis">
                  {t("ekstre.hangiKart")}
                  <select
                    className="bt-input"
                    value={selectedCard}
                    onChange={(event) => setSelectedCard(event.target.value)}
                  >
                    <option value="">{t("ekstre.kartSecin")}</option>
                    {cards.map((card) => (
                      <option key={card.id} value={card.id}>
                        {kartGorunenAdi(card)}
                      </option>
                    ))}
                    <option value="__new__">{t("ekstre.yeniKart")}</option>
                  </select>
                </label>
              )}
              <label>
                {t("ortak.banka")}
                <input className="bt-input" value={result.bank || ""} onChange={(e) => update("bank", e.target.value)} />
              </label>
              <label>
                {t("ekstre.alan.kart")}
                <input className="bt-input" value={result.cardBrand || ""} onChange={(e) => update("cardBrand", e.target.value)} />
              </label>
              <label>
                {t("ekstre.alan.donem")}
                <input className="bt-input" type="month" value={result.statementPeriod || ""} onChange={(e) => update("statementPeriod", e.target.value)} />
              </label>
              <label>
                {t("ekstre.alan.kesim")}
                <input className="bt-input" type="date" value={result.statementDate || ""} onChange={(e) => update("statementDate", e.target.value)} />
              </label>
              <label>
                {t("ekstre.alan.sonOdeme")}
                <input className="bt-input" type="date" value={result.dueDate || ""} onChange={(e) => update("dueDate", e.target.value)} />
              </label>
              <label>
                {t("ekstre.alan.limit")}
                <ParaInput className="bt-input" value={result.creditLimit ?? ""} onValueChange={(value) => update("creditLimit", value)} />
              </label>
              <label className="yarim">
                {t("ekstre.alan.toplam")}
                <ParaInput className="bt-input" value={result.statementTotal ?? ""} onValueChange={(value) => update("statementTotal", value)} />
              </label>
              <label className="yarim">
                {t("ekstre.alan.asgari")}
                <ParaInput className="bt-input" value={result.minimumPayment ?? ""} onValueChange={(value) => update("minimumPayment", value)} />
              </label>
            </div>

            <details className="bt-extract-details">
              <summary>{t("ekstre.devreden.ozet")}</summary>
              <div className="bt-extract-grid">
                <label>
                  {t("ekstre.alan.onceki")}
                  <ParaInput className="bt-input" value={result.previousBalance ?? ""} onValueChange={(value) => update("previousBalance", value)} />
                </label>
                <label>
                  {t("ekstre.alan.odemeler")}
                  <ParaInput className="bt-input" value={result.periodPayments ?? ""} onValueChange={(value) => update("periodPayments", value)} />
                </label>
                <label>
                  {t("ekstre.alan.yeniHarcama")}
                  <ParaInput className="bt-input" value={result.currentPurchases ?? ""} onValueChange={(value) => update("currentPurchases", value)} />
                </label>
                <label>
                  {t("ekstre.alan.ucretler")}
                  <ParaInput className="bt-input" value={result.fees ?? ""} onValueChange={(value) => update("fees", value)} />
                </label>
                <label>
                  {t("ekstre.alan.devreden")}
                  <ParaInput className="bt-input" value={result.carriedBalance ?? ""} onValueChange={(value) => update("carriedBalance", value)} />
                </label>
                <label>
                  {t("ekstre.alan.donemBorcu")}
                  <ParaInput className="bt-input" value={result.currentPeriodDebt ?? ""} onValueChange={(value) => update("currentPeriodDebt", value)} />
                </label>
              </div>
            </details>

            {!!result.transactions?.length && (
              <details className="bt-extract-details bt-transaction-review" open>
                <summary>
                  <span>
                    {t("ekstre.kalemler.baslik")}
                    <small>
                      {(() => {
                        const secilenler = result.transactions.filter((item) => item.selected);
                        return t(secilenler.length === 1 ? "ekstre.kalemler.sayiTekil" : "ekstre.kalemler.sayiCogul", {
                          n: secilenler.length,
                          tutar: fmt(secilenler.reduce((sum, item) => sum + (+item.amount || 0), 0)),
                        });
                      })()}
                    </small>
                  </span>
                </summary>
                <div className="bt-transaction-list">
                  {result.transactions.map((item) => (
                    <div className={`bt-transaction-row${item.selected ? "" : " disarida"}`} key={item.key}>
                      <input type="checkbox" checked={item.selected}
                        aria-label={t("ekstre.kalem.dahilEt", { ad: item.description })}
                        onChange={(event) => updateTransaction(item.key, { selected: event.target.checked })} />
                      <div><strong>{item.description}</strong><small>{formatStatementTransactionDate(item.date)}</small></div>
                      <select className="bt-input" value={item.category}
                        aria-label={t("ekstre.kalem.kategori", { ad: item.description })}
                        onChange={(event) => updateTransaction(item.key, { category: event.target.value })}>
                        {KATEGORILER.map((category) => <option key={category} value={category}>{tDeger(category)}</option>)}
                      </select>
                      <strong>{fmt(item.amount)}</strong>
                    </div>
                  ))}
                  <div className={`bt-transaction-coverage${result.coverage !== null && Math.abs(result.coverage - 100) > 3 ? " kontrol" : ""}`}>
                    <span>{t("ekstre.kapsam.bulunan")} <strong>{fmt(result.detectedTotal)}</strong></span>
                    {result.currentPurchases !== null && <span>{t("ekstre.kapsam.ekstreToplami")} <strong>{fmt(result.currentPurchases)}</strong></span>}
                    {result.coverage !== null && <span>{t("ekstre.kapsam.eslesme")} <strong>{t("ekstre.kapsam.oran", { oran: result.coverage })}</strong></span>}
                  </div>
                  {result.coverage !== null && Math.abs(result.coverage - 100) > 3 && (
                    <p className="bt-transaction-note">{t("ekstre.kapsam.not")}</p>
                  )}
                </div>
              </details>
            )}

            {!!(result.warnings?.length || result.blockingErrors?.length) && (
              <div className="bt-extract-warnings" role={result.blockingErrors?.length ? "alert" : undefined}>
                <AlertTriangle size={16} />
                <div>
                  {result.warnings?.map((warning) => <p key={warning}>{warning}</p>)}
                  {result.blockingErrors?.map((warning) => <p key={warning}><strong>{warning}</strong></p>)}
                </div>
              </div>
            )}

            <div className="bt-privacy-note">
              <ShieldCheck size={15} />
              <span>{t("ekstre.gizlilikNotu")}</span>
            </div>

            <div className="bt-form-butonlar">
              <button
                className="bt-btn birincil"
                type="button"
                disabled={!canUse}
                onClick={() => onUse(derive(result), selectedCard)}
              >
                <Check size={14} /> {t("ekstre.kaydet")}
              </button>
              <button
                className="bt-btn ikincil"
                type="button"
                onClick={() => {
                  setResult(null);
                  setProgress(null);
                  setError("");
                  setAutomaticCardMatch(null);
                }}
              >
                {t("ekstre.baskaDosya")}
              </button>
              <button className="bt-btn hayalet" type="button" onClick={onClose}>
                <X size={14} /> {t("ortak.vazgec")}
              </button>
            </div>
          </>
        )}

        {!busy && !result && (
          <button className="bt-btn hayalet" type="button" onClick={onClose} style={{ marginTop: 10 }}>
            <X size={14} /> {t("ortak.vazgec")}
          </button>
        )}
      </div>
    </div>
  );
}

function LoanPlanImportModal({ loans, onClose, onUse }) {
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState("__new__");

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, []);

  function update(key, value) {
    setResult((current) => {
      const next = { ...current, [key]: value };
      return { ...next, blockingErrors: validateLoanPlanResult(next) };
    });
  }

  async function handleFile(file) {
    setError("");
    setResult(null);
    setBusy(true);
    setProgress({ stage: "prepare", progress: 0, page: 1, pages: 1 });
    try {
      const parsed = await readLoanPlanFile(file, setProgress);
      setResult(parsed);
      // Aynı banka ve kredi türünde birden fazla kredi olabilir. Yeni bir PDF'in
      // mevcut kaydı sessizce ezmemesi için hedef her dosyada yeniden "yeni kredi" olur.
      setSelectedLoan("__new__");
    } catch (caught) {
      const technicalMessage = String(caught?.message || "");
      setError(
        /getOrInsertComputed|Promise\.withResolvers|pdf\.worker/i.test(technicalMessage)
          ? t("ekstre.plan.pdfHazirlanamadi")
          : technicalMessage || t("ekstre.plan.okunamadi"),
      );
      setProgress(null);
    } finally {
      setBusy(false);
    }
  }

  const totalProgress = progress
    ? Math.min(100, Math.round((((progress.page || 1) - 1 + (progress.progress || 0)) / Math.max(progress.pages || 1, 1)) * 100))
    : 0;
  const canUse = result && !result.blockingErrors?.length && selectedLoan;

  return (
    <div className="bt-modal-arka" role="presentation" onMouseDown={(event) => {
      if (!busy && event.target === event.currentTarget) onClose();
    }}>
      <div className="bt-modal bt-ekstre-yukle" role="dialog" aria-modal="true" aria-labelledby="kredi-plani-yukle-baslik">
        <div className="bt-extract-head">
          <div>
            <div id="kredi-plani-yukle-baslik" className="bt-h2" style={{ margin: "4px 0 6px" }}>
              {t("ekstre.plan.baslik")}
            </div>
            <div style={{ color: "var(--dim)", fontSize: 12, lineHeight: 1.5 }}>
              {t("ekstre.plan.aciklama")}
            </div>
          </div>
          {result && (
            <div className={`bt-confidence${result.blockingErrors?.length ? " hata" : ""}`}>
              {result.blockingErrors?.length ? t("ekstre.kontrolGerekli") : t("ekstre.alanEslesmesi", { oran: result.confidence })}
            </div>
          )}
        </div>

        {!result && (
          <>
            <div className="bt-privacy-first" role="note">
              <span><ShieldCheck size={22} /></span>
              <div>
                <strong>{t("ekstre.plan.gizlilikBaslik")}</strong>
                <p>{t("ekstre.plan.gizlilikMetin")}</p>
                <div className="bt-privacy-first-list" aria-label={t("ekstre.gizlilik.ozet")}>
                  <span>{t("ekstre.gizlilik.cihazda")}</span><span>{t("ekstre.gizlilik.hamSaklanmaz")}</span><span>{t("ekstre.gizlilik.onay")}</span>
                </div>
              </div>
            </div>
            <label className="bt-upload-zone">
              <input type="file" accept="application/pdf" disabled={busy} onChange={(event) => handleFile(event.target.files?.[0])} />
              <span className="bt-upload-icon"><Upload size={24} /></span>
              <strong>{busy ? t("ekstre.plan.okunuyor") : t("ekstre.plan.dosyaSec")}</strong>
              <span style={{ marginTop: 6, color: "var(--dim)", fontSize: 11.5 }}>
                {t("ekstre.plan.dosyaSinir")}
              </span>
            </label>
          </>
        )}

        {(busy || progress) && !result && (
          <div>
            <div className="bt-upload-progress" aria-label={t("ekstre.yuzde", { oran: totalProgress })}>
              <div style={{ width: `${Math.max(totalProgress, busy ? 4 : 0)}%` }} />
            </div>
            <div style={{ color: "var(--dim)", fontSize: 10.5 }}>
              {progress?.stage === "read" ? t("ekstre.plan.pdfOkunuyor", { sayfa: progress.page, toplam: progress.pages }) : t("ekstre.asama.hazirlik")}
            </div>
          </div>
        )}

        {error && <div className="bt-extract-warning"><AlertTriangle size={16} /><span>{error}</span></div>}

        {result && (
          <>
            <div className="bt-extract-grid">
              <label className="genis">
                {t("ekstre.plan.nereye")}
                <select className="bt-input" value={selectedLoan} onChange={(event) => setSelectedLoan(event.target.value)}>
                  <option value="__new__">{t("ekstre.plan.yeniKredi")}</option>
                  {loans.map((loan) => <option key={loan.id} value={loan.id}>{loan.banka} · {loan.ad || t("ekstre.plan.krediVarsayilan")}</option>)}
                </select>
                <small className="bt-field-help">
                  {t("ekstre.plan.hedefYardim")}
                </small>
              </label>
              <label>{t("ortak.banka")}<input className="bt-input" value={result.bank || ""} onChange={(event) => update("bank", event.target.value)} /></label>
              <label>{t("ekstre.plan.krediTuru")}<input className="bt-input" value={result.productName || ""} onChange={(event) => update("productName", event.target.value)} /></label>
              <label>{t("ekstre.plan.kalanAnapara")}<ParaInput className="bt-input" value={result.remainingPrincipal ?? ""} onValueChange={(value) => update("remainingPrincipal", value)} /></label>
              <label>{t("ekstre.plan.aylikTaksit")}<ParaInput className="bt-input" value={result.installment ?? ""} onValueChange={(value) => update("installment", value)} /></label>
              <label>{t("ekstre.plan.kalanTaksit")}<input className="bt-input" type="number" value={result.remainingInstallments ?? ""} onChange={(event) => update("remainingInstallments", event.target.value)} /></label>
              <label>{t("ekstre.plan.aylikFaiz")}<input className="bt-input" type="number" step="0.01" value={result.monthlyInterestRate ?? ""} onChange={(event) => update("monthlyInterestRate", event.target.value)} /></label>
              <label>{t("ekstre.plan.sonrakiTaksit")}<input className="bt-input" type="date" value={result.firstPaymentDate || ""} onChange={(event) => update("firstPaymentDate", event.target.value)} /></label>
              <label>{t("ekstre.plan.ilkTutar")}<ParaInput className="bt-input" value={result.originalPrincipal ?? ""} onValueChange={(value) => update("originalPrincipal", value)} /></label>
            </div>

            <div className="bt-loan-plan-totals" aria-label={t("ekstre.plan.ozetAria")}>
              <div><span>{t("ekstre.plan.kalanAnaparaKisa")}</span><strong>{fmt(result.remainingPrincipal)}</strong></div>
              <div><span>{t("ekstre.plan.kalanToplam")}</span><strong>{fmt(result.remainingPaymentTotal)}</strong></div>
              <div><span>{t("ekstre.plan.kalanFaiz")}</span><strong>{fmt(result.remainingFinancingCost)}</strong><small>{t("ekstre.plan.erkenKapamaDegil")}</small></div>
            </div>

            <details className="bt-extract-details">
              <summary>{t("ekstre.plan.satirlar", { n: result.schedule.length })}</summary>
              <div className="bt-loan-plan-preview">
                {result.schedule.slice(0, 5).map((row) => (
                  <div key={`${row.number}-${row.dueDate}`}>
                    <span>{t("ekstre.plan.taksitNo", { n: row.number })} · {row.dueDate ? isoTarihGoster(row.dueDate) : t("ekstre.tarihOkunamadi")}</span>
                    <strong>{fmt(row.installment)}</strong>
                    <small>{t("ekstre.plan.satirKalan", { tutar: fmt(row.remainingPrincipal) })}</small>
                  </div>
                ))}
                {result.schedule.length > 5 && <p>{t("ekstre.plan.toplamSatir", { n: result.schedule.length })}</p>}
              </div>
            </details>

            {!!(result.warnings?.length || result.blockingErrors?.length) && (
              <div className="bt-extract-warnings" role={result.blockingErrors?.length ? "alert" : undefined}>
                <AlertTriangle size={16} /><div>
                  {result.warnings?.map((warning) => <p key={warning}>{warning}</p>)}
                  {result.blockingErrors?.map((warning) => <p key={warning}><strong>{warning}</strong></p>)}
                </div>
              </div>
            )}
            <div className="bt-privacy-note"><ShieldCheck size={15} /><span>{t("ekstre.plan.not")}</span></div>
            <div className="bt-form-butonlar">
              <button className="bt-btn birincil" type="button" disabled={!canUse} onClick={() => onUse(result, selectedLoan)}>
                <Check size={14} /> {t("ekstre.plan.kaydet")}
              </button>
              <button className="bt-btn ikincil" type="button" onClick={() => { setResult(null); setProgress(null); setError(""); }}>
                {t("ekstre.plan.baskaPdf")}
              </button>
              <button className="bt-btn hayalet" type="button" onClick={onClose}><X size={14} /> {t("ortak.vazgec")}</button>
            </div>
          </>
        )}
        {!busy && !result && <button className="bt-btn hayalet" type="button" onClick={onClose} style={{ marginTop: 10 }}><X size={14} /> {t("ortak.vazgec")}</button>}
      </div>
    </div>
  );
}

/* ---------------- Borçlar (kategori pilleriyle tek panel) ---------------- */
function BorcKapatmaKutlamasi({ kutlama, kapat, kredilereGit }) {
  useEffect(() => {
    const oncekiOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event) => {
      if (event.key === "Escape") kapat();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = oncekiOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [kapat]);

  return (
    <div
      className="bt-modal-arka bt-kutlama-arka"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) kapat();
      }}
    >
      <section
        className="bt-modal bt-kutlama"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bt-kutlama-baslik"
      >
        <div className="bt-konfeti" aria-hidden="true">
          {Array.from({ length: 6 }, (_, index) => <i key={index} />)}
        </div>
        <div className="bt-kutlama-ikon" aria-hidden="true">
          <Gift size={38} />
        </div>
        <h2 id="bt-kutlama-baslik">{t("ekstre.kutlama.baslik")}</h2>
        <p>
          <Ceviri anahtar="ekstre.kutlama.tamamlandi" degerler={{ baslik: <strong>{kutlama.baslik}</strong> }} />{" "}{kutlama.tur === "Kredi"
            ? t("ekstre.kutlama.kredi")
            : t("ekstre.kutlama.ekHesap")}
        </p>
        <div className="bt-kutlama-actions">
          <button className="bt-btn birincil" type="button" onClick={kredilereGit}>
            <Check size={15} /> {kutlama.tur === "Kredi" ? t("ekstre.kutlama.krediyiGor") : t("ekstre.kutlama.ekHesabiGor")}
          </button>
          <button className="bt-btn ikincil" type="button" onClick={kapat} autoFocus>
            {t("ortak.tamam")}
          </button>
        </div>
      </section>
    </div>
  );
}

function KapatilanKrediSatiri({ kredi, index }) {
  const kapanisEtiketi = kredi.kapatildiTarihi
    ? new Date(kredi.kapatildiTarihi).toLocaleDateString(locale())
    : t("ekstre.kapatilan.tamamlandi");
  return (
    <div className="bt-kapatilan-kredi">
      <BankaRozeti
        banka={kredi.banka}
        bg={LIME}
        rot={ROTASYONLAR[index % ROTASYONLAR.length]}
        boyut={38}
      />
      <div>
        <strong>
          {kredi.banka}{kredi.ad ? ` · ${kredi.ad}` : ""}
        </strong>
        <small>
          {kredi.taksit ? t("ekstre.kapatilan.aylikTaksit", { tutar: fmt(kredi.taksit, yabanciBirim(kredi)) }) : ""}
          {kapanisEtiketi}
        </small>
      </div>
      <span className="bt-kapatilan-kredi-durum">
        <Check size={12} /> {t("ekstre.kapatilan.durum")}
      </span>
    </div>
  );
}

function Borclar({
  veri,
  kaydet,
  islemEkle,
  form,
  setForm,
  ekleGuncelle,
  sil,
  odendiIsaretle,
  kartOdemesiKaydet,
  kartOdemesiDegistir,
  krediOdemesiKaydet,
  kartYapilandir,
  bankalar,
  bankaEkle,
  kategori,
  setKategori,
  odemelereGit,
  planaGit,
  ekstreArsivIslemi,
  ekstreYuklemeIstegi = 0,
  ekstreYuklemeIsteginiTuket,
  gelirEkle,
  hareketEkle,
  borcKutla,
  kurNotu = null,
}) {
  const [seciliEkstreAyi, setSeciliEkstreAyi] = useState("guncel");
  const [seciliKrediAyi, setSeciliKrediAyi] = useState("guncel");
  const [yeniBanka, setYeniBanka] = useState("");
  const [bankaPenceresi, setBankaPenceresi] = useState(false);
  const [silinecekEkHesapOdemesi, setSilinecekEkHesapOdemesi] = useState(null);
  const [silinecekBorc, setSilinecekBorc] = useState(null);
  const [odemePenceresi, setOdemePenceresi] = useState(null);
  const [yapilandirmaPenceresi, setYapilandirmaPenceresi] = useState(null);
  const [baslangicSecimiAcik, setBaslangicSecimiAcik] = useState(false);
  const [ekstreAkisKarti, setEkstreAkisKarti] = useState(null);
  const [manuelEkstreSecimiAcik, setManuelEkstreSecimiAcik] = useState(false);
  const [ekstreYuklemePenceresi, setEkstreYuklemePenceresi] = useState(false);
  const [krediEklemeSecimiAcik, setKrediEklemeSecimiAcik] = useState(false);
  const [krediPlaniYuklemePenceresi, setKrediPlaniYuklemePenceresi] = useState(false);
  const [ekstreArsiviAcik, setEkstreArsiviAcik] = useState(false);
  const [silinecekYukleme, setSilinecekYukleme] = useState(null);
  const [arsivMesaji, setArsivMesaji] = useState("");
  const gecmisKrediKutlamalari = useRef(new Set());
  const yuklenenEkstreler = useMemo(
    () => listUploadedStatements(veri.cards),
    [veri.cards],
  );
  const aktivasyon = getActivationState(veri);
  const aktivasyonGorevleri = Object.fromEntries(
    aktivasyon.gorevler.map((gorev) => [gorev.id, gorev]),
  );
  useEffect(() => {
    if (ekstreYuklemeIstegi <= 0) return;
    setEkstreAkisKarti(null);
    setBaslangicSecimiAcik(true);
    ekstreYuklemeIsteginiTuket?.();
  }, [ekstreYuklemeIstegi, ekstreYuklemeIsteginiTuket]);
  useEffect(() => {
    if (!ekstreArsiviAcik && !silinecekYukleme) return undefined;
    const onceki = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = onceki; };
  }, [ekstreArsiviAcik, silinecekYukleme]);
  function manuelEkstreAkisiniAc() {
    setBaslangicSecimiAcik(false);
    setEkstreYuklemePenceresi(false);
    if (ekstreAkisKarti) {
      setManuelEkstreSecimiAcik(false);
      setForm({ liste: "cards", veri: ekstreAkisKarti, yeniEkstre: true });
      setEkstreAkisKarti(null);
      return;
    }
    if (veri.cards.length > 0) {
      setManuelEkstreSecimiAcik(true);
      return;
    }
    setForm({ liste: "cards", veri: {} });
  }
  function genelEkstreAkisiniAc() {
    setEkstreAkisKarti(null);
    setBaslangicSecimiAcik(true);
  }
  // Ekstre okuyucu yalniz Turk bankalarinin belgelerini taniyor. TRY disinda
  // "okut / elle gir" secimi gosterilmez; istek dogrudan elle girise gider.
  useEffect(() => {
    if (baslangicSecimiAcik && !belgeOkumaAcik(undefined, tumBorcKayitlari(veri))) manuelEkstreAkisiniAc();
  }, [baslangicSecimiAcik]);
  function ekstreYontemSeciminiKapat() {
    setBaslangicSecimiAcik(false);
    setEkstreAkisKarti(null);
  }
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
                if (!loanIsDueInMonth(k, new Date(seciliKrediAyi + "-01T12:00:00"))) return [];
                const fark = Math.max(ayFarki(ayAnahtari(), seciliKrediAyi) - loanStartsInMonths(k, bugun()), 0);
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
  const guncelKrediGorunumu =
    kategori === "loans" && !krediArsivGorunumu && !krediGelecekGorunumu;
  const kapatilanKrediler = guncelKrediGorunumu
    ? (veri.loans || [])
        .filter((kredi) => loanIsClosed(kredi, veri.loanPaymentHistory))
        .sort((a, b) =>
          String(b.kapatildiTarihi || "").localeCompare(
            String(a.kapatildiTarihi || ""),
          ),
        )
    : [];
  const gorunenKayitlar = guncelKrediGorunumu
    ? kayitlar.filter((kredi) => !loanIsClosed(kredi, veri.loanPaymentHistory))
    : kategori === "od"
      ? ekHesaplariAyir(kayitlar).acik
      : kayitlar;
  const kapananEkHesaplar =
    kategori === "od" ? ekHesaplariAyir(kayitlar).kapanan : [];
  const saltOkunurGorunum =
    arsivGorunumu || krediArsivGorunumu || krediGelecekGorunumu;
  const acik = form && form.liste === meta.liste;
  const yeniEkstreModu = kategori === "cards" && acik && form.yeniEkstre;
  const ekstreDuzenleModu = kategori === "cards" && acik && form.ekstreDuzenle;
  const ekstreFormu = yeniEkstreModu || ekstreDuzenleModu;
  const ekHesapOdemeModu =
    kategori === "od" && acik && (form.odemeGir || form.odemeDuzenle);
  const ekHesapBorcModu = kategori === "od" && acik && form.yeniBorc;
  const [ekHesapBorcHatasi, setEkHesapBorcHatasi] = useState("");
  const [krediGirisHatasi, setKrediGirisHatasi] = useState("");
  const [f, setF] = useState({});
  const yerindeFormHedefi = acik && form.veri?.id
    ? `borc-form-${form.veri.id}`
    : null;
  const yeniKayitHedefi = acik && !form.veri?.id ? "borc-yeni-formu" : null;

  useEffect(() => {
    if (!guncelKrediGorunumu) return;
    const kredi = kutlanacakKapaliKredi(kapatilanKrediler, gecmisKrediKutlamalari.current);
    if (!kredi) return;
    gecmisKrediKutlamalari.current.add(kredi.id);

    let yerelIzVar = false;
    try {
      yerelIzVar = Boolean(localStorage.getItem(`borcama:kredi-kutlamasi:${kredi.id}`));
    } catch {
      // Depolama engelliyse yalnız kullanıcı verisindeki işaret esas alınır.
    }
    const oncedenKutlandi = Boolean(kredi.kapanisKutlandi) ||
      krediKapanisiOncedenKutlandiMi(kredi, yerelIzVar);
    void kaydet({
      ...veri,
      loans: krediKapanisKutlamasiniIsaretle(
        veri.loans || [],
        kredi.id,
        kredi.kapanisKutlandi ||
          (oncedenKutlandi ? KREDI_KAPANISI_GECMIS : new Date().toISOString()),
        gecmisleKapananKrediAlanlari(kredi, veri.loanPaymentHistory),
      ),
    });
    if (oncedenKutlandi) return;
    borcKutla?.({
      tur: "Kredi",
      baslik: kredi.banka + (kredi.ad ? ` · ${kredi.ad}` : ""),
    });
  }, [borcKutla, guncelKrediGorunumu, kapatilanKrediler, kaydet, veri]);

  useEffect(() => {
    if (!yerindeFormHedefi) return;
    const kare = requestAnimationFrame(() => {
      document.getElementById(yerindeFormHedefi)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
    return () => cancelAnimationFrame(kare);
  }, [yerindeFormHedefi]);

  useEffect(() => {
    if (!yeniKayitHedefi) return;
    const kare = requestAnimationFrame(() => {
      document.getElementById(yeniKayitHedefi)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
    return () => cancelAnimationFrame(kare);
  }, [yeniKayitHedefi]);

  const otomatikGecikenler = useMemo(() => {
    const ay = ayAnahtari();
    const liste = [];
    veri.cards.forEach((k) => {
      const h = kartHesabi(k);
      const tarih = kartGecikmeTarihi(k);
      const gun = -kalanGun(tarih);
      const asgariTamam = h.odeme + 0.01 >= h.asgari;
      const odendi = !!veri.paid?.[kartOdemeAnahtari(k)];
      if (gun > 0 && h.toplam > 0) {
        const minimumTamam = asgariTamam || odendi;
        const oranlar = kartFaizOranlari(h.onceki || h.toplam, k.faiz, kayitParaBirimi(k));
        const oran = minimumTamam ? oranlar.akdi : oranlar.gecikme;
        liste.push({
          id: "kart-" + k.id,
          tur: minimumTamam ? t("borclar.gecikme.devredenKart") : t("borclar.gecikme.gecikmisKart"),
          durum: minimumTamam ? "devreden" : "gecikmis",
          banka: k.banka,
          ad: k.ad || t("borclar.krediKarti"),
          tarih,
          gun,
          bakiye: h.toplam,
          oran,
          faiz: minimumTamam
            ? (h.toplam * oran) / 100
            : gunlukBirikmisFaiz(h.toplam, oran, gun),
          ...(yabanciBirim(k) ? { paraBirimi: yabanciBirim(k) } : {}),
        });
      }
    });
    veri.loans.forEach((k) => {
      if (!loanIsDueInMonth(k, bugun())) return;
      const tarih = buAyOdemeTarihi(k.odemeGunu);
      const gun = -kalanGun(tarih);
      const odendi = !!veri.paid?.["kredi-" + k.id + "-" + ay];
      if (gun > 0 && (+k.kalanBorc || 0) > 0 && !odendi) {
        const bakiye = +k.taksit || 0;
        const oran = +k.faiz || 0;
        liste.push({
          id: "kredi-" + k.id,
          tur: t("borclar.gecikme.krediTaksiti"),
          banka: k.banka,
          ad: k.ad || t("borclar.kredi"),
          tarih,
          gun,
          bakiye,
          oran,
          faiz: gunlukBirikmisFaiz(bakiye, oran, gun),
          ...(yabanciBirim(k) ? { paraBirimi: yabanciBirim(k) } : {}),
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
    setEkHesapBorcHatasi("");
    setKrediGirisHatasi("");
    if (form.yeniBorc) {
      setF({ yeniBorcTutari: "" });
    } else if (form.odemeGir || form.odemeDuzenle) {
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
      if (form.imported) {
        const imported = form.imported;
        setF({
          ...belgeKaydiParaBirimi(kullaniciParaBirimi()),
          ekstreAyi: imported.statementPeriod || guncelEkstreAyi,
          yeniDonemEkstreBorcu: imported.currentPeriodDebt ?? imported.statementTotal ?? "",
          oncekiAydanKalan: imported.carriedBalance ?? 0,
          yapilanOdeme: "0",
          asgari: imported.minimumPayment ?? "",
          belgedenToplamEkstreBorcu: imported.statementTotal ?? "",
          limit: imported.creditLimit || eski.limit || "",
          kesimGunu: imported.statementDate
            ? Number(imported.statementDate.slice(-2))
            : eski.kesimGunu || "",
          sonOdemeGunu: imported.dueDate
            ? Number(imported.dueDate.slice(-2))
            : eski.sonOdemeGunu || "",
          hesapKesimTarihi: imported.statementDate || undefined,
          sonOdemeTarihi: imported.dueDate || undefined,
          ekstreBelgeOzeti: {
            banka: imported.bank,
            kart: imported.cardBrand,
            kartSon4: imported.cardLast4 || eski.kartSon4 || "",
            ekstreTarihi: imported.statementDate,
            sonOdemeTarihi: imported.dueDate,
            oncekiBakiye: imported.previousBalance,
            donemIciOdemeler: imported.periodPayments,
            harcamalar: imported.currentPurchases,
            faizVeUcretler: imported.fees,
            guven: imported.confidence,
            kaynak: imported.sourceType,
          },
          kartSon4: imported.cardLast4 || eski.kartSon4 || "",
        });
        return;
      }
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

  // Tutar alani etiketlerindeki {simge} formdaki kaydin biriminden gelir
  // (GBP kartta "(£)", TL kartta "(₺)"); ana birimde ortak simgeyle ayni.
  const formSimge = { simge: paraBirimiSimgesi(kayitParaBirimi(f?.paraBirimi ? f : form?.veri)) };
  const ALAN_TANIMLARI = {
    // Yeni kartta yalnız borcu görmek için gerekenler zorunlu; kart ve bu ayın
    // ekstresi tek formda birlikte oluşur. Ayrıntılar "Daha fazla bilgi"de.
    cards: form?.veri?.id ? [
      { k: "banka", e: t("ortak.banka"), t: "text", z: true },
      { k: "ad", e: t("borclar.alan.kartAdi"), t: "text", z: true },
      { k: "limit", e: t("borclar.alan.kartLimiti", formSimge), t: "number", z: true, para: true },
      { k: "kesimGunu", e: t("borclar.alan.kesimGunu"), t: "number", z: true },
      {
        k: "sonOdemeGunu",
        e: t("borclar.alan.sonOdemeGunu"),
        t: "number",
        z: true,
      },
      ...kartFaizAlani(false, f?.paraBirimi),
    ] : [
      { k: "banka", e: t("ortak.banka"), t: "text", z: true },
      { k: "yeniDonemEkstreBorcu", e: t("borclar.alan.buAykiEkstre", formSimge), t: "number", z: true, para: true, p: t("borclar.alan.buAykiEkstreIpucu") },
      { k: "sonOdemeGunu", e: t("borclar.alan.sonOdemeGunu"), t: "number", z: true, p: t("borclar.alan.ornek", { n: 15 }) },
      { k: "ad", e: t("borclar.alan.kartAdi"), t: "text", ek: true },
      { k: "limit", e: t("borclar.alan.kartLimiti", formSimge), t: "number", para: true, ek: true },
      { k: "kesimGunu", e: t("borclar.alan.kesimGunu"), t: "number", ek: true },
      { k: "oncekiAydanKalan", e: t("borclar.alan.devreden", formSimge), t: "number", para: true, ek: true },
      ...kartFaizAlani(true, f?.paraBirimi),
    ],
    // Yeni kredide yalnız kalan borcu ve ödeme gününü bulmaya yetenler zorunlu.
    loans: form?.veri?.id ? [
      { k: "banka", e: t("ortak.banka"), t: "text", z: true },
      { k: "ad", e: t("borclar.alan.krediAdi"), t: "text", z: true },
      { k: "anaPara", e: t("borclar.alan.krediTutari", formSimge), t: "number", z: !form?.veri?.id, para: true },
      { k: "faiz", e: t("borclar.alan.aylikFaiz"), t: "number" },
      { k: "toplamTaksit", e: t("borclar.alan.toplamTaksit"), t: "number", z: !form?.veri?.id },
      { k: "taksit", e: t("borclar.alan.aylikTaksit", formSimge), t: "number", z: true, para: true },
      { k: "odenenTaksit", e: t("borclar.alan.odenenTaksit"), t: "number", z: !form?.veri?.id },
      { k: "kalanTaksit", e: t("borclar.alan.kalanTaksit"), t: "number" },
      { k: "odemeGunu", e: t("borclar.alan.odemeGunu"), t: "number", p: t("borclar.alan.odemeGunuIpucu") },
      { k: "ilkOdemeTarihi", e: t("borclar.alan.ilkTaksit"), t: "date", z: !form?.veri?.id },
    ] : [
      { k: "banka", e: t("ortak.banka"), t: "text", z: true },
      { k: "taksit", e: t("borclar.alan.aylikTaksit", formSimge), t: "number", z: true, para: true },
      { k: "kalanTaksit", e: t("borclar.alan.kalanTaksit"), t: "number", z: true, p: t("borclar.alan.ornek", { n: 18 }) },
      { k: "odemeGunu", e: t("borclar.alan.odemeGunuAyin"), t: "number", z: true, p: t("borclar.alan.ornek", { n: 5 }) },
      { k: "ad", e: t("borclar.alan.krediAdiOrnek"), t: "text", ek: true },
      { k: "faiz", e: t("borclar.alan.aylikFaiz"), t: "number", ek: true },
      { k: "anaPara", e: t("borclar.alan.krediTutari", formSimge), t: "number", para: true, ek: true },
      { k: "toplamTaksit", e: t("borclar.alan.toplamTaksit"), t: "number", ek: true },
      { k: "odenenTaksit", e: t("borclar.alan.odenenTaksit"), t: "number", ek: true },
      { k: "ilkOdemeTarihi", e: t("borclar.alan.ilkTaksit"), t: "date", ek: true },
    ],
    od: [
      { k: "banka", e: t("ortak.banka"), t: "text", z: true },
      { k: "limit", e: t("borclar.alan.ekHesapLimiti", formSimge), t: "number", para: true },
      {
        k: "kullanilan",
        e: t("borclar.alan.kullanilan", formSimge),
        t: "number",
        z: true,
        para: true,
      },
      { k: "yapilanOdeme", e: t("borclar.alan.yapilanOdeme", formSimge), t: "number", para: true },
      { k: "faiz", e: t("borclar.alan.aylikFaiz"), t: "number", p: varsayilanFaizIpucu(bolgeProfili(f?.paraBirimi)?.ekHesapYillikFaiz, f?.paraBirimi) },
    ],
    others: [
      { k: "banka", e: t("borclar.alan.alacakli"), t: "text", z: true },
      { k: "ad", e: t("borclar.alan.aciklama"), t: "text" },
      { k: "tutar", e: t("borclar.alan.guncelTutar", formSimge), t: "number", z: true, para: true },
      { k: "faiz", e: t("borclar.alan.faizGecikme"), t: "number" },
    ],
  };
  const alanlar = ekHesapBorcModu
    ? [{ k: "yeniBorcTutari", e: t("borclar.alan.yeniBorcTutari", formSimge), t: "number", z: true, para: true }]
    : ekHesapOdemeModu
    ? [
        { k: "odemeTutari", e: t("borclar.alan.odemeTutari", formSimge), t: "number", z: true, para: true },
        {
          k: "odemeTarihi",
          e: t("borclar.alan.odemeTarihi"),
          t: "datetime-local",
          z: true,
        },
      ]
    : ekstreFormu
      ? [
          { k: "ekstreAyi", e: t("borclar.alan.ekstreDonemi"), t: "month", z: true },
          ...(form.imported
            ? [
                {
                  k: "belgedenToplamEkstreBorcu",
                  e: t("borclar.alan.bankaToplam", formSimge),
                  t: "number",
                  z: true,
                  para: true,
                },
                {
                  k: "asgari",
                  e: t("borclar.alan.bankaAsgari", formSimge),
                  t: "number",
                  para: true,
                },
              ]
            : []),
          {
            k: "yeniDonemEkstreBorcu",
            e: t("borclar.alan.buDonemBorc", formSimge),
            t: "number",
            z: true,
            para: true,
          },
          { k: "oncekiAydanKalan", e: t("borclar.alan.devreden", formSimge), t: "number", para: true },
          { k: "kesimGunu", e: t("borclar.alan.kesimGunu"), t: "number" },
          {
            k: "sonOdemeGunu",
            e: t("borclar.alan.sonOdemeGunu"),
            t: "number",
            z: true,
          },
        ]
      : ALAN_TANIMLARI[kategori];
  const krediIlerlemesi = kategori === "loans" ? krediTaksitIlerlemesi(f) : null;

  // Toplamlar ana birimde: her kayit kendi biriminden kurla cevrilir.
  function toplamHesapla() {
    if (kategori === "cards")
      return kayitlar.reduce((t, k) => t + anaTutar(kartHesabi(k).toplam, k), 0);
    if (kategori === "loans")
      return gorunenKayitlar.reduce(
        (t, k) =>
          t +
          anaTutar(krediArsivGorunumu || krediGelecekGorunumu
            ? +k.taksit || 0
            : summarizeLoanRecord(k, veri.loanPaymentHistory).remainingPaymentTotal, k),
        0,
      );
    if (kategori === "od")
      return kayitlar.reduce((t, k) => t + anaTutar(ekHesapHesabi(k).kalan, k), 0);
    return (
      kayitlar.reduce((t, k) => t + anaTutar(+k.tutar || 0, k), 0) +
      (kategori === "others"
        ? odemeleriAnaBirimeCevir(otomatikGecikenler).reduce((t, k) => t + (+k.bakiye || 0), 0)
        : 0)
    );
  }
  const borcSatiri = (k, i) => (
    <BorclarSatiri
      key={k.id}
      k={k}
      i={i}
      kategori={kategori}
      meta={meta}
      setForm={setForm}
      sil={sil}
      silmeOnayiAc={(liste, kayit) => setSilinecekBorc({ liste, kayit })}
      ekHesapOdemesiSil={ekHesapOdemesiSil}
      paid={veri.paid}
      krediOdemeGecmisi={veri.loanPaymentHistory}
      odendiIsaretle={odendiIsaretle}
      odemelereGit={odemelereGit}
      kartOdemesiAc={(odeme) => setOdemePenceresi(odeme)}
      kartOdemeGecmisi={veri.cardPaymentHistory}
      kartOdemesiDegistir={kartOdemesiDegistir}
      krediOdemesiAc={(odeme) => setOdemePenceresi(odeme)}
      kartYapilandirmaAc={(kart) => setYapilandirmaPenceresi(kart)}
      yeniEkstreAc={(kart) => {
        setEkstreAkisKarti(kart);
        setBaslangicSecimiAcik(true);
      }}
      arsiv={saltOkunurGorunum}
    />
  );
  function sayacHesapla() {
    const n = gorunenKayitlar.length;
    const sayi = (ad, adet = n) =>
      t(`borclar.sayac.${ad}${adet === 1 ? "Tekil" : "Cogul"}`, { n: adet });
    if (kategori === "cards") return sayi("kart");
    if (kategori === "loans")
      return krediArsivGorunumu
        ? sayi("odenmisTaksit")
        : krediGelecekGorunumu
          ? sayi("planlananTaksit")
          : sayi("kredi");
    if (kategori === "od") return sayi("ekHesap");
    if (kategori === "others") return sayi("borc", n + otomatikGecikenler.length);
    return sayi("kayit");
  }

  const odemeOzeti = (() => {
    let toplam = 0,
      odenen = 0,
      kalan = 0,
      baslik = "";
    if (kategori === "cards" && !arsivGorunumu) {
      baslik = t("borclar.ilerleme.kart");
      veri.cards.forEach((k) => {
        const h = kartHesabi(k);
        toplam += anaTutar(h.onceki, k);
        odenen += anaTutar(h.odeme, k);
        kalan += anaTutar(h.toplam, k);
      });
    } else if (
      kategori === "loans" &&
      !krediArsivGorunumu &&
      !krediGelecekGorunumu
    ) {
      baslik = t("borclar.ilerleme.kredi");
      veri.loans.forEach((k) => {
        const ozet = summarizeLoanRecord(k, veri.loanPaymentHistory);
        toplam += anaTutar(ozet.scheduledTotal, k);
        odenen += anaTutar(ozet.paidSinceBaseline, k);
        kalan += anaTutar(ozet.remainingPaymentTotal, k);
      });
    } else if (kategori === "od") {
      baslik = t("borclar.ilerleme.ekHesap");
      veri.overdrafts.forEach((k) => {
        const h = ekHesapHesabi(k);
        toplam += anaTutar(h.kullanilan, k);
        odenen += anaTutar(h.odeme, k);
        kalan += anaTutar(h.kalan, k);
      });
    } else if (kategori === "others") {
      baslik = t("borclar.ilerleme.gecikmis");
      otomatikGecikenler.forEach((g) => {
        const kur = odemeKuru(g);
        if (kur === null) return;
        if (g.id.startsWith("kart-")) {
          const kart = veri.cards.find((k) => "kart-" + k.id === g.id);
          const h = kart ? kartHesabi(kart) : null;
          toplam += (h?.onceki || g.bakiye) * kur;
          odenen += (h?.odeme || 0) * kur;
          kalan += (h?.toplam || g.bakiye) * kur;
        } else {
          toplam += (+g.bakiye || 0) * kur;
          kalan += (+g.bakiye || 0) * kur;
        }
      });
      veri.others.forEach((k) => {
        toplam += anaTutar(+k.tutar || 0, k);
        kalan += anaTutar(+k.tutar || 0, k);
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
    for (const a of alanlar) {
      if (a.z && !String(f[a.k] ?? "").trim()) {
        if (kategori === "loans") setKrediGirisHatasi(t("borclar.hata.alaniDoldur", { alan: a.e }));
        return;
      }
    }
    if (ekHesapBorcModu) {
      const sonuc = ekHesapBorcuEkle(form.veri, { tutar: f.yeniBorcTutari, yeniId: uid() });
      if (!sonuc.tamam) { setEkHesapBorcHatasi(sonuc.hata); return; }
      ekleGuncelle("overdrafts", sonuc.hesap);
      return;
    }
    if (ekHesapOdemeModu) {
      const eski = form.veri;
      const oncekiKalan = ekHesapHesabi(eski).kalan;
      const sonuc = ekHesapOdemesiUygula(eski, {
        tutar: f.odemeTutari,
        tarih: f.odemeTarihi,
        kapat: !!form.kapat,
        duzenlenenOdeme: form.odemeDuzenle || null,
        yeniId: uid(),
      });
      if (!sonuc.tamam) return;
      ekleGuncelle("overdrafts", sonuc.hesap);
      if (oncekiKalan > 0 && ekHesapHesabi(sonuc.hesap).kalan <= 0) {
        borcKutla?.({
          tur: "Ek hesap",
          baslik:
            sonuc.hesap.banka +
            (sonuc.hesap.ad ? " · " + sonuc.hesap.ad : ""),
        });
      }
      return;
    }
    const ekstreVerisi = ekstreFormu
      ? {
          ...f,
          hesapKesimTarihi: f.hesapKesimTarihi || undefined,
          sonOdemeTarihi: f.sonOdemeTarihi || undefined,
          toplamEkstreBorcu:
            +f.belgedenToplamEkstreBorcu ||
            (+f.yeniDonemEkstreBorcu || 0) + (+f.oncekiAydanKalan || 0),
        }
      : f;
    if (yeniEkstreModu) {
      const eski = form.veri;
      if (form.yeniKartBelgeden) {
        ekleGuncelle("cards", {
          ...eski,
          ...ekstreVerisi,
          id: eski.id || uid(),
        });
        return;
      }
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
        yapilandirmaKayitlari: bindCardRestructuringsToStatement(eski, mevcutDonem),
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
    if (kategori === "cards" && !f.id && String(f.yeniDonemEkstreBorcu ?? "").trim() !== "") {
      // Hızlı kart: kart ve bu ayın ekstresi birlikte; borç hemen görünür.
      ekleGuncelle("cards", {
        id: uid(),
        ...f,
        ekstreAyi: guncelEkstreAyi,
        yapilanOdeme: "0",
        toplamEkstreBorcu: (+f.yeniDonemEkstreBorcu || 0) + (+f.oncekiAydanKalan || 0),
      });
      return;
    }
    let kaydedilecek = f;
    if (kategori === "loans") {
      // Hızlı kredi: toplam/ödenen taksit girilmediyse kalan borç = aylık taksit × kalan taksit.
      const hizliKredi = !f.id && !String(f.toplamTaksit ?? "").trim() && !String(f.odenenTaksit ?? "").trim();
      const sonuc = krediKaydiniHazirla(hizliKredi && !(+f.kalanBorc > 0)
        ? { ...f, kalanBorc: Math.round((+f.taksit || 0) * (+f.kalanTaksit || 0) * 100) / 100 }
        : f);
      if (!sonuc.tamam) {
        setKrediGirisHatasi(sonuc.hata);
        return;
      }
      kaydedilecek = sonuc.kredi;
    }
    ekleGuncelle(meta.liste, { id: f.id || uid(), ...kaydedilecek,
      ...(kategori === "loans" && f.ilkOdemeTarihi ? { odemeGunu: Number(f.ilkOdemeTarihi.slice(-2)) } : {}),
    });
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
    ekleGuncelle("overdrafts", ekHesapOdemesiKaldir(kart, odeme));
    setSilinecekEkHesapOdemesi(null);
  }

  function krediSilmeyiOnayla() {
    if (!silinecekBorc) return;
    sil(silinecekBorc.liste, silinecekBorc.kayit.id);
    setSilinecekBorc(null);
  }

  function belgedenEkstreVerisi(imported, eski = {}) {
    const yeni = imported.currentPeriodDebt ?? imported.statementTotal ?? "";
    const devreden = imported.carriedBalance ?? 0;
    return {
      ...belgeKaydiParaBirimi(kullaniciParaBirimi()),
      ekstreAyi: imported.statementPeriod || guncelEkstreAyi,
      yeniDonemEkstreBorcu: yeni,
      oncekiAydanKalan: devreden,
      yapilanOdeme: "0",
      asgari: imported.minimumPayment ?? "",
      belgedenToplamEkstreBorcu: imported.statementTotal ?? "",
      toplamEkstreBorcu:
        imported.statementTotal ?? (+yeni || 0) + (+devreden || 0),
      limit: imported.creditLimit || eski.limit || "",
      kesimGunu: imported.statementDate
        ? Number(imported.statementDate.slice(-2))
        : eski.kesimGunu || "",
      sonOdemeGunu: imported.dueDate
        ? Number(imported.dueDate.slice(-2))
        : eski.sonOdemeGunu || "",
      hesapKesimTarihi: imported.statementDate || undefined,
      sonOdemeTarihi: imported.dueDate || undefined,
      ekstreBelgeOzeti: {
        banka: imported.bank,
        kart: imported.cardBrand,
        ekstreTarihi: imported.statementDate,
        sonOdemeTarihi: imported.dueDate,
        oncekiBakiye: imported.previousBalance,
        donemIciOdemeler: imported.periodPayments,
        harcamalar: imported.currentPurchases,
        faizVeUcretler: imported.fees,
        guven: imported.confidence,
        kaynak: imported.sourceType,
        kartSon4: imported.cardLast4 || eski.kartSon4 || "",
        yuklenmeTarihi: new Date().toISOString(),
      },
      kartSon4: imported.cardLast4 || eski.kartSon4 || "",
    };
  }

  function belgedenEkstreKaydet(imported, cardId) {
    const eskiKart = veri.cards.find((kart) => kart.id === cardId);
    const temelKart = eskiKart || {
      id: uid(), banka: imported.bank || "Diğer",
      ad: imported.cardBrand || "Kredi kartı", ekstreGecmisi: [],
    };
    const ekstreVerisi = belgedenEkstreVerisi(imported, temelKart);
    const mevcutDonem = temelKart.ekstreAyi || guncelEkstreAyi;
    let kart;
    if (!eskiKart || ekstreVerisi.ekstreAyi === mevcutDonem) {
      kart = {
        ...temelKart, ...ekstreVerisi,
        ekstreGecmisi: (temelKart.ekstreGecmisi || []).filter((ekstre) => ekstre.ekstreAyi !== mevcutDonem),
      };
    } else if (ekstreVerisi.ekstreAyi < mevcutDonem) {
      kart = {
        ...temelKart,
        ekstreGecmisi: [
          ...(temelKart.ekstreGecmisi || []).filter((ekstre) => ekstre.ekstreAyi !== ekstreVerisi.ekstreAyi),
          { ...ekstreVerisi, arsivlenmeTarihi: new Date().toISOString() },
        ],
      };
    } else {
      kart = {
        ...temelKart, ...ekstreVerisi,
        yapilandirmaKayitlari: bindCardRestructuringsToStatement(temelKart, mevcutDonem),
        ekstreGecmisi: [
          ...(temelKart.ekstreGecmisi || []).filter((ekstre) => ekstre.ekstreAyi !== mevcutDonem),
          ekstreSnapshot(temelKart, mevcutDonem),
        ],
      };
    }

    const kaynak = `${kart.banka} · ${kart.ad || "Kredi kartı"}`;
    const mevcutAnahtarlar = new Set((veri.expenses || []).map((item) => item.ekstreAktarimAnahtari).filter(Boolean));
    const aktarilanlar = (imported.transactions || [])
      .filter((item) => item.selected)
      .filter((item) => !mevcutAnahtarlar.has(`${kart.id}|${imported.statementPeriod}|${item.key}`))
      .map((item) => ({
        id: uid(), ad: item.description, aciklama: item.description,
        kategori: item.category || "Diğer", tutar: +item.amount || 0,
        tarih: item.date, tekrar: "Tek seferlik", taksitSayisi: 1,
        kaynak, ekstreAyi: imported.statementPeriod,
        ekstreAktarimAnahtari: `${kart.id}|${imported.statementPeriod}|${item.key}`,
        ekstreAktarimi: true,
      }));
    const cards = eskiKart
      ? veri.cards.map((item) => item.id === kart.id ? kart : item)
      : [...veri.cards, kart];
    const yeniVeri = { ...veri, cards, expenses: [...(veri.expenses || []), ...aktarilanlar] };
    kaydet(islemEkle(yeniVeri, {
      tur: eskiKart ? "guncelleme" : "ekleme",
      baslik: kartGorunenAdi(kart),
      detay: aktarilanlar.length
        ? t("islem.ekstreVeHarcamalar", { n: aktarilanlar.length })
        : t("islem.ekstreKaydedildi"),
      geriAl: null,
    }));
    setEkstreYuklemePenceresi(false);
    setEkstreAkisKarti(null);
  }

  function belgedenKrediPlaniKaydet(imported, loanId) {
    const mevcut = veri.loans.find((loan) => loan.id === loanId);
    const mevcutOdemeler = mevcut
      ? Object.values(veri.loanPaymentHistory || {}).map((ayKayitlari) => ayKayitlari?.[mevcut.id]).filter(Boolean)
      : [];
    const odemeGecmisiBaslangicToplami = mevcutOdemeler.reduce((toplam, odeme) => toplam + loanPaymentAmount(odeme), 0);
    const tamamlananTaksitBaslangici = mevcutOdemeler.reduce((toplam, odeme) =>
      toplam + (loanPaymentAmount(odeme) + 0.01 >= (+imported.installment || 0) && (+imported.installment || 0) > 0 ? 1 : 0), 0);
    const plan = {
      ...(mevcut || {}),
      id: mevcut?.id || uid(),
      ...belgeKaydiParaBirimi(kullaniciParaBirimi()),
      banka: imported.bank,
      ad: imported.productName || mevcut?.ad || "Kredi",
      anaPara: +imported.originalPrincipal || mevcut?.anaPara || "",
      kalanBorc: +imported.remainingPaymentTotal || 0,
      kalanAnapara: +imported.remainingPrincipal || "",
      taksit: +imported.installment || 0,
      kalanTaksit: +imported.remainingInstallments || 0,
      faiz: +imported.monthlyInterestRate || "",
      toplamGeriOdeme: +imported.totalRepayment || mevcut?.toplamGeriOdeme || "",
      kalanOdemeToplami: +imported.remainingPaymentTotal || "",
      kalanFinansmanMaliyeti: +imported.remainingFinancingCost || 0,
      ilkOdemeTarihi: imported.firstPaymentDate,
      odemeGunu: imported.firstPaymentDate ? Number(imported.firstPaymentDate.slice(-2)) : mevcut?.odemeGunu,
      odemePlani: (imported.schedule || []).map((row) => ({
        sira: row.number,
        tarih: row.dueDate,
        taksit: row.installment,
        anapara: row.principal,
        faiz: row.interest,
        vergi: row.taxes,
        sigorta: row.insurance,
        kalanAnapara: row.remainingPrincipal,
      })),
      odemePlaniBelgeOzeti: {
        banka: imported.bank,
        kaynak: imported.sourceType,
        sayfaSayisi: imported.pagesRead,
        satirSayisi: imported.schedule?.length || 0,
        sonrakiTaksitNo: imported.nextInstallmentNumber || null,
        odemeGecmisiBaslangicToplami,
        tamamlananTaksitBaslangici,
        guven: imported.confidence,
        yuklenmeTarihi: new Date().toISOString(),
      },
    };
    const loans = mevcut
      ? veri.loans.map((loan) => loan.id === mevcut.id ? plan : loan)
      : [...veri.loans, plan];
    kaydet(islemEkle({ ...veri, loans }, {
      tur: mevcut ? "guncelleme" : "ekleme",
      baslik: `${plan.banka} · ${plan.ad}`,
      detay: mevcut ? t("islem.planGuncellendi") : t("islem.planEklendi"),
      geriAl: null,
    }));
    setKrediPlaniYuklemePenceresi(false);
  }

  function ekstreyiTasi(yukleme, hedefKartId) {
    setArsivMesaji("");
    const hata = ekstreArsivIslemi({
      tip: "tasi",
      cardId: yukleme.cardId,
      period: yukleme.period,
      targetCardId: hedefKartId,
    });
    if (hata === "TARGET_PERIOD_EXISTS") {
      setArsivMesaji(t("borclar.arsiv.donemVar"));
      return;
    }
    if (hata) {
      setArsivMesaji(t("borclar.arsiv.tasinamadi", { yonerge: yenilemeYonergesi }));
      return;
    }
    setArsivMesaji(t("borclar.arsiv.tasindi"));
  }

  function yuklemeyiSil(finansalKaydiSil) {
    if (!silinecekYukleme) return;
    const hata = ekstreArsivIslemi({
      tip: finansalKaydiSil ? "kaydi_sil" : "yuklemeyi_sil",
      cardId: silinecekYukleme.cardId,
      period: silinecekYukleme.period,
    });
    setSilinecekYukleme(null);
    setArsivMesaji(hata
      ? t("borclar.arsiv.kaldirilamadi", { yonerge: yenilemeYonergesi })
      : finansalKaydiSil
        ? t("borclar.arsiv.kayitSilindi")
        : t("borclar.arsiv.yuklemeKaldirildi"));
  }

  return (
    <div className="bt-stack">
      <section className="bt-plan-kisayol" aria-label={t("borclar.plan.aria")}>
        <span className="bt-plan-kisayol-ikon" aria-hidden="true">
          <Target size={20} />
        </span>
        <div className="bt-plan-kisayol-metin">
          <strong>{t("borclar.plan.baslik")}</strong>
          <span>{t("borclar.plan.aciklama")}</span>
        </div>
        <button className="bt-btn kucuk birincil" type="button" onClick={planaGit}>
          {t("borclar.plan.ac")} <ChevronRight size={15} />
        </button>
      </section>
      {kategori === "kontrol" && (
        <div className="bt-borc-araclari">
          <div>
            <div className="bt-borc-araclari-baslik">
              <div className="bt-borc-araclari-ikon"><ReceiptText size={17} /></div>
              <div>
                <strong>{t("borclar.kontrol.baslik")}</strong>
              </div>
            </div>
            <div className="bt-borc-araclari-aciklama">
              {t("borclar.kontrol.aciklama")}
            </div>
          </div>
          <div className="bt-borc-araclari-actions">
            <button
              className="bt-btn kucuk ikincil"
              onClick={() => {
                setKategori("cards");
                setForm(null);
              }}
            >
              {t("borclar.kontrol.kartlaraDon")}
            </button>
            <details className="bt-ekstre-bilgi">
              <summary aria-label={t("borclar.kontrol.bilgiAria")}>
                <Info size={17} aria-hidden="true" />
              </summary>
              <div className="bt-ekstre-bilgi-kutu" role="note">
                <strong>{t("borclar.kontrol.nasil")}</strong>
                {t("borclar.kontrol.nasilMetin")}
              </div>
            </details>
          </div>
        </div>
      )}
      {kategori === "others" && (
        <div className="bt-borc-araclari filtre-aktif">
          <div>
            <div className="bt-borc-araclari-baslik">
              <div className="bt-borc-araclari-ikon"><AlertTriangle size={17} /></div>
              <div><strong>{t("borclar.gecikenler.baslik")}</strong></div>
            </div>
            <div className="bt-borc-araclari-aciklama">
              {t("borclar.gecikenler.aciklama", { devreden: devredenSayisi, gecikmis: gecikmisSayisi })}
            </div>
          </div>
        </div>
      )}

      {kategori === "kontrol" ? (
        <EkstreKontrol
          veri={veri}
          onKartEkle={() => {
            setKategori("cards");
            setForm({ liste: "cards", veri: {} });
          }}
          onEkstreYukle={genelEkstreAkisiniAc}
        />
      ) : (
        <div className="bt-card" data-tour="borclar">
          {kategori === "cards" ? (
            <div className="bt-kart-ust">
              <div className="bt-kart-ust-ozet">
                <div className="bt-kart-ust-baslik">
                  <span className="bt-kart-ust-ikon"><Wallet size={17} /></span>
                  <div>
                    <strong>{t("borclar.kart.baslik")}</strong>
                    <span>{kayitlar.length
                      ? t(kayitlar.length === 1 ? "borclar.kart.kayitliTekil" : "borclar.kart.kayitliCogul", { n: kayitlar.length })
                      : t("borclar.kart.henuzYok")}</span>
                  </div>
                </div>
                <div className="bt-kart-borc">
                  {kayitlar.length ? (
                    <>
                      <span>{t("borclar.kart.kalanBorc")}</span>
                      <strong>{fmt(toplamHesapla())}</strong>
                      <KurNotu durum={kurNotu} />
                    </>
                  ) : (
                    <span className="bt-kart-bos-metin">
                      {t("borclar.kart.bosMetin")}
                    </span>
                  )}
                  <button
                    className="bt-btn kucuk ikincil bt-kart-ekle"
                    type="button"
                    onClick={() => setForm({ liste: meta.liste, veri: {} })}
                  >
                    <Plus size={14} /> {t("borclar.kart.ekle")}
                  </button>
                </div>
              </div>
              {!acik && !saltOkunurGorunum && (
                <div className="bt-kart-ust-islemler">
                  <div className="bt-kart-islem-baslik">
                    <strong>{t("borclar.ekstre.islemler")}</strong>
                    <span>{t(belgeOkumaAcik(undefined, tumBorcKayitlari(veri)) ? "borclar.ekstre.islemlerAciklama" : "borclar.ekstre.islemlerAciklamaManuel")}</span>
                  </div>
                  <div className="bt-kart-ust-ana tek">
                    <button
                      className="bt-btn kucuk birincil"
                      onClick={genelEkstreAkisiniAc}
                    >
                      <Plus size={14} /> {t(belgeOkumaAcik(undefined, tumBorcKayitlari(veri)) ? "borclar.ekstre.ekle" : "borclar.ekstre.ekleManuel")}
                    </button>
                  </div>
                  <div className="bt-kart-ust-araclar" aria-label={t("borclar.ekstre.araclarAria")}>
                    <button
                      className="bt-btn kucuk hayalet"
                      onClick={() => {
                        setKategori("kontrol");
                        setForm(null);
                      }}
                    >
                      <ScanSearch size={14} /> {t("borclar.kontrol.baslik")}
                    </button>
                    <button
                      className="bt-btn kucuk hayalet"
                      onClick={() => {
                        setArsivMesaji("");
                        setEkstreArsiviAcik(true);
                      }}
                    >
                      <BookOpen size={14} /> {t("borclar.arsiv.baslik")}
                      {yuklenenEkstreler.length > 0 ? ` (${yuklenenEkstreler.length})` : ""}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bt-strip">
              <div className="bt-strip-count">{sayacHesapla()}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
                <div className="bt-strip-total-block">
                  <span className="bt-strip-total-label">
                    {kategori === "loans" && !krediArsivGorunumu && !krediGelecekGorunumu ? t("borclar.serit.kalanToplam") : t("ortak.toplam")}
                  </span>
                  <div className="bt-strip-total bt-mono">
                    {fmt(toplamHesapla())}
                  </div>
                  <KurNotu durum={kurNotu} />
                </div>
                {!acik && !saltOkunurGorunum && kategori !== "others" && (
                  <button
                    className="bt-btn kucuk ikincil"
                    type="button"
                    onClick={() => {
                      if (kategori === "loans") {
                        // Odeme plani okuyucusu yalniz Turk bankalarini taniyor;
                        // TRY disinda dogrudan elle giris formu acilir.
                        if (belgeOkumaAcik(undefined, tumBorcKayitlari(veri))) setKrediEklemeSecimiAcik(true);
                        else setForm({ liste: "loans", veri: {} });
                        return;
                      }
                      setForm({ liste: meta.liste, veri: {} });
                    }}
                  >
                    <Plus size={14} /> {kategori === "loans" ? t("borclar.serit.yeniKredi") : t("borclar.serit.yeniEkHesap")}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Form açıkken dönem seçicisi gizlenir; formun alanı sanılmasın (dönem değişince form zaten kapanır). */}
          {!acik && kategori === "cards" && veri.cards.length > 0 && (
            <div className="bt-borc-donem-satiri">
              <div>
                <strong>{t("borclar.donem.ekstreBaslik")}</strong>
                <span>{t("borclar.donem.ekstreAciklama")}</span>
              </div>
              <select
                className="bt-input"
                value={seciliEkstreAyi}
                onChange={(e) => {
                  setSeciliEkstreAyi(e.target.value);
                  setForm(null);
                }}
              >
                <option value="guncel">{t("borclar.donem.guncel", { ay: ayEtiketi(guncelEkstreAyi) })}</option>
                {ekstreAylar
                  .filter((ay) => ay !== guncelEkstreAyi)
                  .map((ay) => <option key={ay} value={ay}>{ayEtiketi(ay)}</option>)}
              </select>
            </div>
          )}

          {!acik && kategori === "loans" && veri.loans.length > 0 && (
            <div className="bt-borc-donem-satiri">
              <div>
                <strong>{t("borclar.donem.krediBaslik")}</strong>
                <span>{t("borclar.donem.krediAciklama")}</span>
              </div>
              <select
                className="bt-input"
                value={seciliKrediAyi}
                onChange={(e) => {
                  setSeciliKrediAyi(e.target.value);
                  setForm(null);
                }}
              >
                <option value="guncel">{t("borclar.donem.guncel", { ay: ayEtiketi(ayAnahtari()) })}</option>
                {gelecekKrediAylar.map((ay) => <option key={ay} value={ay}>{t("borclar.donem.gelecek", { ay: ayEtiketi(ay) })}</option>)}
                {krediAylar.map((ay) => <option key={ay} value={ay}>{t("borclar.donem.gecmis", { ay: ayEtiketi(ay) })}</option>)}
              </select>
            </div>
          )}

          {!acik && odemeOzeti && (
            <BorcOdemeGrafigi
              ozet={odemeOzeti}
              depolamaAnahtari={kategori}
            />
          )}

          {acik && (
            <YerindeForm hedef={yerindeFormHedefi}>
              <div className="bt-form" id={yeniKayitHedefi || undefined}>
              {ekHesapBorcModu && (
                <div className="bt-ipucu" style={{ marginBottom: 14 }}>
                  <Lightbulb size={16} />
                  <div>
                    <b>{t("borclar.form.yeniBorcBaslik", { banka: form.veri.banka })}</b> {t("borclar.form.yeniBorcAciklama")}
                    <br />{t("borclar.form.guncelKalan")} <b>{fmt(ekHesapHesabi(form.veri).kalan, yabanciBirim(form.veri))}</b>
                    {Number(f.yeniBorcTutari) > 0 && <> · {t("borclar.form.eklemeSonrasi")} <b>{fmt(ekHesapHesabi(form.veri).kalan + Number(f.yeniBorcTutari), yabanciBirim(form.veri))}</b></>}
                  </div>
                </div>
              )}
              {ekHesapBorcHatasi && ekHesapBorcModu && <p role="alert">{ekHesapBorcHatasi}</p>}
              {yeniEkstreModu && (
                <div className="bt-ipucu" style={{ marginBottom: 14 }}>
                  <Lightbulb size={16} />
                  <div>
                    <Ceviri
                      anahtar="borclar.form.yeniEkstre"
                      degerler={{ kart: <b>{kartGorunenAdi(form.veri)}</b> }}
                    />
                  </div>
                </div>
              )}
              {ekstreDuzenleModu && (
                <div className="bt-ipucu" style={{ marginBottom: 14 }}>
                  <Lightbulb size={16} />
                  <div>
                    <Ceviri
                      anahtar="borclar.form.ekstreDuzenle"
                      degerler={{ kart: <b>{kartGorunenAdi(form.veri)}</b> }}
                    />
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
                            ? t("borclar.form.odemeKaydiDuzenle")
                            : t("borclar.form.ekHesap")}
                        </b>
                        <br />
                        <Ceviri
                          anahtar="borclar.form.ekHesapOzet"
                          degerler={{
                            kullanilan: fmt(h.kullanilan, yabanciBirim(form.veri)),
                            odenen: fmt(h.odeme, yabanciBirim(form.veri)),
                            kalan: <b>{fmt(h.kalan, yabanciBirim(form.veri))}</b>,
                          }}
                        />
                      </div>
                    </div>
                  );
                })()}
              <div className="bt-alanlar">
                {alanlar.filter((a) => !a.ek).map((a) => (
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
                        <option value="">{t("borclar.alan.bankaSecin")}</option>
                        {(f?.paraBirimi === "TRY" ? [...new Set([...BANKALAR, ...bankalar])] : bankalar).map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                        <option value="__diger__">{t("borclar.alan.diger")}</option>
                      </select>
                    ) : (
                      <input
                        className="bt-input"
                        type={a.para ? "text" : a.t}
                        inputMode={a.para ? "decimal" : undefined}
                        min={!a.para && a.t === "number" ? 0 : undefined}
                        step={a.k === "faiz" ? "0.01" : undefined}
                        readOnly={
                          kategori === "loans" &&
                          ((krediIlerlemesi?.gecerli && a.k === "kalanTaksit") ||
                            (a.k === "odemeGunu" && !!f.ilkOdemeTarihi))
                        }
                        placeholder={a.p}
                        value={a.para ? paraGirdisiniFormatla(
                          f[a.k] ?? ""
                        ) : (
                          kategori === "loans" && krediIlerlemesi?.gecerli && a.k === "kalanTaksit"
                            ? krediIlerlemesi.kalanTaksit
                            : kategori === "loans" && a.k === "odemeGunu" && f.ilkOdemeTarihi
                              ? Number(f.ilkOdemeTarihi.slice(-2))
                              : f[a.k] ?? ""
                        )}
                        onChange={(e) => {
                          setKrediGirisHatasi("");
                          const deger = a.para ? paraGirdisiniCoz(e.target.value) : e.target.value;
                          setF({
                            ...f,
                            [a.k]: deger,
                            ...(kategori === "loans" && a.k === "ilkOdemeTarihi"
                              ? { odemeGunu: deger ? Number(deger.slice(-2)) : "" }
                              : {}),
                          });
                        }}
                      />
                    )}
                  </label>
                ))}
                {!ekHesapBorcModu && !ekHesapOdemeModu && !ekstreFormu && (
                  <BorcParaBirimiSecici
                    deger={f?.paraBirimi}
                    onChange={(kod) => setF({ ...f, paraBirimi: kod })}
                  />
                )}
              </div>
              {alanlar.some((a) => a.ek) && (
                <details className="bt-alan-ek">
                  <summary>{t("borclar.alan.dahaFazla")}</summary>
                  <div className="bt-alanlar">
                    {alanlar.filter((a) => a.ek).map((a) => (
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
                        <option value="">{t("borclar.alan.bankaSecin")}</option>
                        {bankalar.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                        <option value="__diger__">{t("borclar.alan.diger")}</option>
                      </select>
                    ) : (
                      <input
                        className="bt-input"
                        type={a.para ? "text" : a.t}
                        inputMode={a.para ? "decimal" : undefined}
                        min={!a.para && a.t === "number" ? 0 : undefined}
                        step={a.k === "faiz" ? "0.01" : undefined}
                        readOnly={
                          kategori === "loans" &&
                          ((krediIlerlemesi?.gecerli && a.k === "kalanTaksit") ||
                            (a.k === "odemeGunu" && !!f.ilkOdemeTarihi))
                        }
                        placeholder={a.p}
                        value={a.para ? paraGirdisiniFormatla(
                          f[a.k] ?? ""
                        ) : (
                          kategori === "loans" && krediIlerlemesi?.gecerli && a.k === "kalanTaksit"
                            ? krediIlerlemesi.kalanTaksit
                            : kategori === "loans" && a.k === "odemeGunu" && f.ilkOdemeTarihi
                              ? Number(f.ilkOdemeTarihi.slice(-2))
                              : f[a.k] ?? ""
                        )}
                        onChange={(e) => {
                          setKrediGirisHatasi("");
                          const deger = a.para ? paraGirdisiniCoz(e.target.value) : e.target.value;
                          setF({
                            ...f,
                            [a.k]: deger,
                            ...(kategori === "loans" && a.k === "ilkOdemeTarihi"
                              ? { odemeGunu: deger ? Number(deger.slice(-2)) : "" }
                              : {}),
                          });
                        }}
                      />
                    )}
                  </label>
                    ))}
                  </div>
                </details>
              )}
              {kategori === "loans" && (
                <div
                  className="bt-ipucu"
                  role={krediGirisHatasi || krediIlerlemesi?.hata ? "alert" : undefined}
                  style={{
                    marginTop: 14,
                    borderColor: krediGirisHatasi || krediIlerlemesi?.hata ? CORAL : undefined,
                  }}
                >
                  <Lightbulb size={16} />
                  <div>
                    {krediGirisHatasi || krediIlerlemesi?.hata ? (
                      krediGirisHatasi || krediIlerlemesi.hata
                    ) : krediIlerlemesi?.gecerli ? (
                      <>
                        <b>{t("borclar.form.otomatikPlan")}</b>{" "}
                        <Ceviri
                          anahtar="borclar.form.taksitKaldi"
                          degerler={{
                            n: krediIlerlemesi.kalanTaksit,
                            tutar: <b>{fmt(krediIlerlemesi.kalanToplamOdeme, yabanciBirim(f))}</b>,
                          }}
                        />
                      </>
                    ) : !f.id && +f.taksit > 0 && +f.kalanTaksit > 0 ? (
                      <>
                        <b>{t("borclar.form.kalanToplamEtiket")}</b>{" "}
                        {t("borclar.form.kalanToplamCarpim", {
                          toplam: fmt((+f.taksit || 0) * (+f.kalanTaksit || 0), yabanciBirim(f)),
                          n: f.kalanTaksit,
                          taksit: fmt(+f.taksit || 0, yabanciBirim(f)),
                        })}
                      </>
                    ) : (
                      <>{t("borclar.form.krediIpucu")}</>
                    )}
                    <br />{t("borclar.form.faizNotu")}
                  </div>
                </div>
              )}
              {kategori === "cards" &&
                f.yeniDonemEkstreBorcu !== "" &&
                f.yeniDonemEkstreBorcu !== undefined &&
                (() => {
                  const h = kartHesabi(f);
                  return (
                    <div className="bt-ipucu" style={{ marginTop: 14 }}>
                      <Lightbulb size={16} />
                      <div>
                        <Ceviri
                          anahtar={yasalAsgariUygulanir(kayitParaBirimi(f)) ? "borclar.form.kartHesabi" : "paraBirimi.kartHesabiBolge"}
                          degerler={{
                            baslik: <b>{t("borclar.form.otomatikHesap")}</b>,
                            yeni: fmt(h.yeni, yabanciBirim(f)),
                            devreden: fmt(h.oncekiDevreden, yabanciBirim(f)),
                            toplam: <b>{t("borclar.form.toplamBorc", { tutar: fmt(h.onceki, yabanciBirim(f)) })}</b>,
                            odenen: fmt(h.odeme, yabanciBirim(f)),
                            kalan: <b>{t("borclar.form.kalir", { tutar: fmt(h.devreden, yabanciBirim(f)) })}</b>,
                            faiz: fmt(h.faiz, yabanciBirim(f)),
                            oran: h.oran.toFixed(2),
                            asgari: <b>{fmt(h.asgari, yabanciBirim(f))}</b>,
                            asgariOran: Math.round(krediKartiAsgariOrani(f.limit) * 100),
                            kaynak: turkiyeKurallariGecerli(kayitParaBirimi(f)) ? "" : ortalamaKaynagi(kayitParaBirimi(f)),
                          }}
                        />
                      </div>
                    </div>
                  );
                })()}
              {ekHesapOdemeModu &&
                f.odemeTutari &&
                (() => {
                  const h = ekHesapHesabi(form.veri);
                  const oncekiKayitTutari = form.odemeDuzenle
                    ? Math.max(+form.odemeDuzenle.tutar || 0, 0)
                    : 0;
                  const azami = Math.max(h.kalan + oncekiKayitTutari, 0);
                  const odeme = Math.min(+f.odemeTutari || 0, azami);
                  const toplamOdeme = form.kapat
                    ? h.kullanilan
                    : Math.min(
                        h.odeme - oncekiKayitTutari + odeme,
                        h.kullanilan,
                      );
                  const kalan = Math.max(h.kullanilan - toplamOdeme, 0);
                  return (
                    <div className="bt-ipucu" style={{ marginTop: 14 }}>
                      <Lightbulb size={16} />
                      <div>
                        <Ceviri
                          anahtar="borclar.form.odemeSonrasiMetin"
                          degerler={{
                            baslik: <b>{t("borclar.form.odemeSonrasi")}</b>,
                            kalan: <b>{fmt(kalan, yabanciBirim(form.veri))}</b>,
                            faiz: fmt((kalan * h.oran) / 100, yabanciBirim(form.veri)),
                            oran: h.oran.toFixed(2),
                          }}
                        />
                      </div>
                    </div>
                  );
                })()}
              <div className="bt-form-butonlar">
                <button className="bt-btn birincil" onClick={gonder}>
                  <Check size={14} />{" "}
                  {ekHesapBorcModu
                    ? t("borclar.buton.yeniBorcEkle")
                    : ekHesapOdemeModu
                    ? form.odemeDuzenle
                      ? t("borclar.buton.odemeGuncelle")
                      : form.kapat
                        ? t("borclar.buton.borcuKapat")
                        : t("borclar.buton.odemeKaydet")
                    : yeniEkstreModu
                      ? t("borclar.buton.yeniEkstreKaydet")
                      : ekstreDuzenleModu
                        ? t("borclar.buton.ekstreGuncelle")
                        : f.id
                          ? t("ortak.guncelle")
                          : t("ortak.kaydet")}
                </button>
                <button
                  className="bt-btn ikincil"
                  onClick={() => setForm(null)}
                >
                  {t("ortak.vazgec")}
                </button>
              </div>
              </div>
            </YerindeForm>
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
                {t("borclar.gecikenler.not")}
              </div>
              <div className="bt-stack" style={{ gap: 10 }}>
                {otomatikGecikenler.map((g, i) => (
                  <GecikmisBorcSatiri key={g.id} g={g} i={i} />
                ))}
              </div>
            </div>
          )}

          {gorunenKayitlar.length === 0 &&
          !acik &&
          !(kategori === "others" && otomatikGecikenler.length > 0) ? (
            kategori === "cards" && !arsivGorunumu ? null : (
              <div className="bt-bos">
                {arsivGorunumu
                  ? t("borclar.bos.arsivEkstre", { ay: ayEtiketi(seciliEkstreAyi) })
                  : krediArsivGorunumu
                    ? t("borclar.bos.odenmisTaksit", { ay: ayEtiketi(seciliKrediAyi) })
                    : krediGelecekGorunumu
                      ? t("borclar.bos.planlananTaksit", { ay: ayEtiketi(seciliKrediAyi) })
                      : kategori === "loans"
                        ? kapatilanKrediler.length > 0
                          ? t("borclar.bos.aktifKrediYok")
                          : t("borclar.bos.krediYok")
                        : kategori === "od"
                          ? kapananEkHesaplar.length > 0
                            ? t("borclar.bos.acikEkHesapYok")
                            : t("borclar.bos.ekHesapYok")
                          : t("borclar.bos.gecikenYok")}
              </div>
            )
          ) : (
            <div className="bt-stack" style={{ gap: 12 }}>
              {kategori === "others" && gorunenKayitlar.length > 0 && (
                <div>
                  <div className="bt-h2" style={{ marginBottom: 5 }}>
                    {t("borclar.diger.baslik")}
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--dim)" }}>
                    {t("borclar.diger.aciklama")}
                  </div>
                </div>
              )}
              {gorunenKayitlar.map(borcSatiri)}
            </div>
          )}

          {guncelKrediGorunumu && kapatilanKrediler.length > 0 && (
            <section
              className="bt-kapatilan-krediler"
              aria-labelledby="kapatilan-krediler-baslik"
            >
              <div className="bt-kapatilan-krediler-baslik">
                <span aria-hidden="true"><Check size={18} /></span>
                <div>
                  <strong id="kapatilan-krediler-baslik">{t("borclar.kapatilan.baslik")}</strong>
                  <small>
                    {t(kapatilanKrediler.length === 1 ? "borclar.kapatilan.aciklamaTekil" : "borclar.kapatilan.aciklamaCogul", { n: kapatilanKrediler.length })}
                  </small>
                </div>
              </div>
              {kapatilanKrediler.map((kredi, index) => (
                <KapatilanKrediSatiri
                  key={kredi.id}
                  kredi={kredi}
                  index={index}
                />
              ))}
            </section>
          )}

          {kapananEkHesaplar.length > 0 && (
            <section
              className="bt-kapatilan-krediler"
              aria-labelledby="kapanan-ek-hesaplar-baslik"
            >
              <div className="bt-kapatilan-krediler-baslik">
                <span aria-hidden="true"><Check size={18} /></span>
                <div>
                  <strong id="kapanan-ek-hesaplar-baslik">{t("borclar.kapanan.baslik")}</strong>
                  <small>
                    {t(kapananEkHesaplar.length === 1 ? "borclar.kapanan.aciklamaTekil" : "borclar.kapanan.aciklamaCogul", { n: kapananEkHesaplar.length })}
                  </small>
                </div>
              </div>
              {kapananEkHesaplar.map(borcSatiri)}
            </section>
          )}

          {kategori === "cards" && !saltOkunurGorunum && !aktivasyon.tamam && (
            <div className="bt-baslangic-plani kisa">
              <div>
                <h3>{t("borclar.baslangic.baslik")}</h3>
                <p>{t("borclar.baslangic.aciklama")}</p>
                <div className="bt-baslangic-adimlar">
                  <div className={`bt-baslangic-adim ${aktivasyonGorevleri.debt?.tamam ? "tamam" : ""}`}>
                    <b>{aktivasyonGorevleri.debt?.tamam ? <Check size={14} /> : "1"}</b>
                    <span>
                      <strong>{t("borclar.baslangic.adim1")}</strong>
                      <small>{t("borclar.baslangic.adim1Aciklama")}</small>
                    </span>
                    {aktivasyonGorevleri.debt?.tamam ? (
                      <span className="bt-adim-tamam"><Check size={13} /> {t("borclar.baslangic.tamam")}</span>
                    ) : (
                      <button className="bt-btn kucuk birincil" type="button" onClick={genelEkstreAkisiniAc}>
                        {t("ortak.ekle")} <ChevronRight size={14} />
                      </button>
                    )}
                  </div>
                  <div className={`bt-baslangic-adim ${aktivasyonGorevleri.income?.tamam ? "tamam" : ""}`}>
                    <b>{aktivasyonGorevleri.income?.tamam ? <Check size={14} /> : "2"}</b>
                    <span>
                      <strong>{t("borclar.baslangic.adim2")}</strong>
                      <small>{t("borclar.baslangic.adim2Aciklama")}</small>
                    </span>
                    {aktivasyonGorevleri.income?.tamam ? (
                      <span className="bt-adim-tamam"><Check size={13} /> {t("borclar.baslangic.tamam")}</span>
                    ) : (
                      <button className="bt-btn kucuk ikincil" type="button" onClick={gelirEkle}>
                        {t("borclar.baslangic.gelirEkle")} <ChevronRight size={14} />
                      </button>
                    )}
                  </div>
                  <div className={`bt-baslangic-adim ${aktivasyonGorevleri.activity?.tamam ? "tamam" : ""}`}>
                    <b>{aktivasyonGorevleri.activity?.tamam ? <Check size={14} /> : "3"}</b>
                    <span>
                      <strong>{t("borclar.baslangic.adim3")}</strong>
                      <small>{t("borclar.baslangic.adim3Aciklama")}</small>
                    </span>
                    {aktivasyonGorevleri.activity?.tamam ? (
                      <span className="bt-adim-tamam"><Check size={13} /> {t("borclar.baslangic.tamam")}</span>
                    ) : (
                      <button className="bt-btn kucuk ikincil" type="button" onClick={hareketEkle}>
                        {t("borclar.baslangic.harcamaEkle")} <ChevronRight size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {odemePenceresi && (
        <BorcUzerindenOdemeModal
          odeme={odemePenceresi}
          onClose={() => setOdemePenceresi(null)}
          kartOdemesiKaydet={kartOdemesiKaydet}
          krediOdemesiKaydet={krediOdemesiKaydet}
        />
      )}

      {yapilandirmaPenceresi && (
        <KartYapilandirmaModal
          kart={yapilandirmaPenceresi}
          onClose={() => setYapilandirmaPenceresi(null)}
          onSave={(plan) => {
            const hata = kartYapilandir?.(plan);
            if (!hata) setYapilandirmaPenceresi(null);
            return hata;
          }}
        />
      )}

      {baslangicSecimiAcik && belgeOkumaAcik(undefined, tumBorcKayitlari(veri)) && (
        <div
          className="bt-modal-arka"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) ekstreYontemSeciminiKapat();
          }}
        >
          <div
            className="bt-modal bt-baslangic-secim"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bt-baslangic-secim-baslik"
          >
            <div className="bt-modalbaslik">
              <div>
                <div id="bt-baslangic-secim-baslik" className="bt-h2">
                  {t("borclar.yontem.baslik")}
                </div>
                <p className="bt-baslangic-secim-aciklama">
                  {t("borclar.yontem.aciklama")}
                </p>
              </div>
              <button
                className="bt-btn hayalet kucuk"
                type="button"
                aria-label={t("ortak.kapat")}
                onClick={ekstreYontemSeciminiKapat}
              >
                <X size={18} />
              </button>
            </div>
            <div className="bt-baslangic-yontemler">
              <button
                className="bt-baslangic-yontem"
                type="button"
                onClick={() => {
                  setBaslangicSecimiAcik(false);
                  setEkstreYuklemePenceresi(true);
                }}
              >
                <span><Upload size={19} /></span>
                <span>
                  <strong>{t("borclar.yontem.okut")}</strong>
                  <small>{t("borclar.yontem.okutAciklama")}</small>
                </span>
              </button>
              <button
                className="bt-baslangic-yontem manuel"
                type="button"
                onClick={() => {
                  manuelEkstreAkisiniAc();
                }}
              >
                <span><Pencil size={18} /></span>
                <span>
                  <strong>{t("borclar.yontem.manuel")}</strong>
                  <small>{t("borclar.yontem.manuelAciklama")}</small>
                </span>
              </button>
            </div>
            <button
              className="bt-btn hayalet bt-baslangic-sonra"
              type="button"
              onClick={ekstreYontemSeciminiKapat}
            >
              {t("borclar.yontem.sonra")}
            </button>
          </div>
        </div>
      )}

      {ekstreYuklemePenceresi && (
        <StatementImportModal
          cards={veri.cards}
          initialCardId={ekstreAkisKarti?.id || ""}
          onClose={() => {
            setEkstreYuklemePenceresi(false);
            setEkstreAkisKarti(null);
          }}
          onUse={belgedenEkstreKaydet}
          onManual={manuelEkstreAkisiniAc}
        />
      )}

      {krediEklemeSecimiAcik && (
        <div
          className="bt-modal-arka"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setKrediEklemeSecimiAcik(false);
          }}
        >
          <div
            className="bt-modal bt-baslangic-secim"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bt-kredi-ekleme-secim-baslik"
          >
            <div className="bt-modalbaslik">
              <div>
                <div id="bt-kredi-ekleme-secim-baslik" className="bt-h2">
                  {t("borclar.krediYontem.baslik")}
                </div>
                <p className="bt-baslangic-secim-aciklama">
                  {t("borclar.krediYontem.aciklama")}
                </p>
              </div>
              <button
                className="bt-btn hayalet kucuk"
                type="button"
                aria-label={t("ortak.kapat")}
                onClick={() => setKrediEklemeSecimiAcik(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="bt-baslangic-yontemler">
              <button
                className="bt-baslangic-yontem manuel"
                type="button"
                onClick={() => {
                  setKrediEklemeSecimiAcik(false);
                  setForm({ liste: "loans", veri: {} });
                }}
              >
                <span><Pencil size={18} /></span>
                <span>
                  <strong>{t("borclar.krediYontem.manuel")}</strong>
                  <small>{t("borclar.krediYontem.manuelAciklama")}</small>
                </span>
              </button>
              <button
                className="bt-baslangic-yontem"
                type="button"
                onClick={() => {
                  setKrediEklemeSecimiAcik(false);
                  setKrediPlaniYuklemePenceresi(true);
                }}
              >
                <span><Upload size={19} /></span>
                <span>
                  <strong>{t("borclar.krediYontem.plan")}</strong>
                  <small>{t("borclar.krediYontem.planAciklama")}</small>
                </span>
              </button>
            </div>
            <button
              className="bt-btn hayalet bt-baslangic-sonra"
              type="button"
              onClick={() => setKrediEklemeSecimiAcik(false)}
            >
              {t("ortak.vazgec")}
            </button>
          </div>
        </div>
      )}

      {krediPlaniYuklemePenceresi && (
        <LoanPlanImportModal
          loans={veri.loans}
          onClose={() => setKrediPlaniYuklemePenceresi(false)}
          onUse={belgedenKrediPlaniKaydet}
        />
      )}

      {manuelEkstreSecimiAcik && (
        <div
          className="bt-modal-arka"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setManuelEkstreSecimiAcik(false);
          }}
        >
          <div
            className="bt-modal bt-baslangic-secim"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bt-manuel-ekstre-baslik"
          >
            <div className="bt-modalbaslik">
              <div>
                <div id="bt-manuel-ekstre-baslik" className="bt-h2">
                  {t("borclar.manuelSecim.baslik")}
                </div>
                <p className="bt-baslangic-secim-aciklama">
                  {t("borclar.manuelSecim.aciklama")}
                </p>
              </div>
              <button
                className="bt-btn hayalet kucuk"
                type="button"
                aria-label={t("ortak.kapat")}
                onClick={() => setManuelEkstreSecimiAcik(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="bt-baslangic-yontemler">
              {veri.cards.map((kart, i) => (
                <button
                  className="bt-baslangic-yontem"
                  type="button"
                  key={kart.id}
                  onClick={() => {
                    setManuelEkstreSecimiAcik(false);
                    setForm({ liste: "cards", veri: kart, yeniEkstre: true });
                  }}
                >
                  <BankaRozeti
                    banka={kart.banka}
                    bg={LIME}
                    rot={ROTASYONLAR[i % ROTASYONLAR.length]}
                    boyut={38}
                  />
                  <span>
                    <strong>{kartGorunenAdi(kart)}</strong>
                    <small>{t("borclar.manuelSecim.kart")}</small>
                  </span>
                </button>
              ))}
            </div>
            <button
              className="bt-btn ikincil bt-baslangic-sonra"
              type="button"
              onClick={() => {
                setManuelEkstreSecimiAcik(false);
                setForm({ liste: "cards", veri: {} });
              }}
            >
              <Plus size={14} /> {t("borclar.manuelSecim.yeniKart")}
            </button>
          </div>
        </div>
      )}

      {ekstreArsiviAcik && (
        <div
          className="bt-modal-arka"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setEkstreArsiviAcik(false);
          }}
        >
          <div
            className="bt-modal bt-ekstre-arsiv"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bt-ekstre-arsiv-baslik"
          >
            <div className="bt-modalbaslik">
              <div>
                <div id="bt-ekstre-arsiv-baslik" className="bt-h2">{t("borclar.arsiv.baslik")}</div>
                <p className="bt-ekstre-arsiv-aciklama">
                  {t("borclar.arsiv.aciklama")}
                </p>
              </div>
              <button className="bt-btn hayalet kucuk" type="button" aria-label={t("ortak.kapat")} onClick={() => setEkstreArsiviAcik(false)}>
                <X size={18} />
              </button>
            </div>

            {arsivMesaji && <div className="bt-ipucu bt-ekstre-arsiv-mesaj"><Info size={16} /><span>{arsivMesaji}</span></div>}

            <div className="bt-ekstre-arsiv-gizlilik">
              {t("borclar.arsiv.gizlilik")}
            </div>

            {yuklenenEkstreler.length === 0 ? (
              <div className="bt-arac-bos">
                <h3>{t("borclar.arsiv.bosBaslik")}</h3>
                <p>{t("borclar.arsiv.bosAciklama")}</p>
                <div className="bt-arac-bos-actions">
                  <button
                    className="bt-btn birincil"
                    type="button"
                    onClick={() => {
                      setEkstreArsiviAcik(false);
                      genelEkstreAkisiniAc();
                    }}
                  >
                    <Plus size={14} /> {t(belgeOkumaAcik(undefined, tumBorcKayitlari(veri)) ? "borclar.ekstre.ekle" : "borclar.ekstre.ekleManuel")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bt-ekstre-arsiv-liste">
                {yuklenenEkstreler.map((yukleme) => {
                  const ozet = yukleme.statement.ekstreBelgeOzeti || {};
                  const toplam = yukleme.statement.belgedenToplamEkstreBorcu
                    ?? yukleme.statement.toplamEkstreBorcu
                    ?? yukleme.statement.oncekiDonemBorcu
                    ?? 0;
                  return (
                    <div className="bt-ekstre-arsiv-satir" key={`${yukleme.cardId}-${yukleme.period}`}>
                      <div className="bt-ekstre-arsiv-bilgi">
                        <strong>{yukleme.cardBank} · {tDeger(yukleme.cardName) || t("borclar.krediKarti")}{yukleme.cardLast4 ? ` • ${yukleme.cardLast4}` : ""}</strong>
                        <span>{ayEtiketi(yukleme.period)} · {fmt(toplam, yabanciBirim((veri.cards || []).find((kart) => kart.id === yukleme.cardId)))}</span>
                        <small>
                          {ozet.yuklenmeTarihi ? t("borclar.arsiv.aktarildi", { tarih: tarihSaatEtiketi(ozet.yuklenmeTarihi) }) : t("borclar.arsiv.gecmisEkstre")}
                          {ozet.kaynak ? ` · ${String(ozet.kaynak).toUpperCase()}` : ""}
                        </small>
                      </div>
                      <div className="bt-ekstre-arsiv-islemler">
                        <label>
                          <span>{t("borclar.arsiv.bagliKart")}</span>
                          <select
                            className="bt-input"
                            value={yukleme.cardId}
                            onChange={(e) => ekstreyiTasi(yukleme, e.target.value)}
                          >
                            {veri.cards.map((kart) => (
                              <option key={kart.id} value={kart.id}>
                                {kartGorunenAdi(kart)}
                              </option>
                            ))}
                          </select>
                        </label>
                        <button className="bt-btn kucuk hayalet bt-tehlike-yazi" type="button" onClick={() => setSilinecekYukleme(yukleme)}>
                          <Trash2 size={14} /> {t("ortak.sil")}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {silinecekYukleme && (
        <div className="bt-modal-arka" role="presentation">
          <div className="bt-modal" role="dialog" aria-modal="true" aria-labelledby="bt-ekstre-sil-baslik">
            <div className="bt-sil-ikon"><Trash2 size={20} /></div>
            <div id="bt-ekstre-sil-baslik" className="bt-h2" style={{ marginBottom: 8 }}>
              {t("borclar.silYukleme.baslik")}
            </div>
            <p className="bt-ekstre-sil-aciklama">
              {t("borclar.silYukleme.aciklama", {
                banka: silinecekYukleme.cardBank,
                kart: tDeger(silinecekYukleme.cardName) || t("borclar.krediKarti"),
                ay: ayEtiketi(silinecekYukleme.period),
              })}
            </p>
            <div className="bt-ekstre-sil-secenekler">
              <button className="bt-btn birincil bt-tehlike" type="button" onClick={() => yuklemeyiSil(true)}>
                <Trash2 size={14} /> {t("borclar.silYukleme.evet")}
              </button>
              <button className="bt-btn ikincil" type="button" onClick={() => yuklemeyiSil(false)}>
                {t("borclar.silYukleme.hayir")}
              </button>
              <button className="bt-btn hayalet" type="button" onClick={() => setSilinecekYukleme(null)}>
                {t("ortak.vazgec")}
              </button>
            </div>
          </div>
        </div>
      )}

      {silinecekBorc && (
        <div
          className="bt-modal-arka"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSilinecekBorc(null);
          }}
        >
          <div
            className="bt-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bt-kredi-sil-baslik"
            aria-describedby="bt-kredi-sil-aciklama"
          >
            <div className="bt-sil-ikon"><Trash2 size={20} /></div>
            <div id="bt-kredi-sil-baslik" className="bt-h2" style={{ marginBottom: 8 }}>
              {t("borclar.krediSil.baslik")}
            </div>
            <p id="bt-kredi-sil-aciklama" className="bt-ekstre-sil-aciklama">
              <Ceviri
                anahtar="borclar.krediSil.aciklama"
                degerler={{
                  kayit: (
                    <>
                      <b>{silinecekBorc.kayit.banka || t("ortak.banka")}</b>
                      {silinecekBorc.kayit.ad ? ` · ${tDeger(silinecekBorc.kayit.ad)}` : ""}
                    </>
                  ),
                  tutar: <b>{fmt(summarizeLoanRecord(silinecekBorc.kayit, veri.loanPaymentHistory).remainingPaymentTotal, yabanciBirim(silinecekBorc.kayit))}</b>,
                }}
              />
            </p>
            <div className="bt-ekstre-sil-secenekler">
              <button className="bt-btn birincil bt-tehlike" type="button" onClick={krediSilmeyiOnayla}>
                <Trash2 size={14} /> {t("borclar.krediSil.evet")}
              </button>
              <button className="bt-btn ikincil" type="button" autoFocus onClick={() => setSilinecekBorc(null)}>
                {t("ortak.vazgec")}
              </button>
            </div>
          </div>
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
              {t("borclar.banka.baslik")}
            </div>
            <div
              style={{ fontSize: 12.5, color: "var(--dim)", marginBottom: 16 }}
            >
              {t("borclar.banka.aciklama")}
            </div>
            <input
              className="bt-input"
              autoFocus
              placeholder={t("borclar.banka.placeholder")}
              value={yeniBanka}
              onChange={(e) => setYeniBanka(e.target.value)}
            />
            <div className="bt-form-butonlar">
              <button className="bt-btn birincil" type="submit">
                <Plus size={14} /> {t("borclar.banka.ekleSec")}
              </button>
              <button
                className="bt-btn ikincil"
                type="button"
                onClick={() => {
                  setBankaPenceresi(false);
                  setYeniBanka("");
                }}
              >
                {t("ortak.vazgec")}
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
              {t("borclar.odemeSil.baslik")}
            </div>
            <div
              style={{ fontSize: 12.5, color: "var(--dim)", lineHeight: 1.55 }}
            >
              <Ceviri
                anahtar="borclar.odemeSil.aciklama"
                degerler={{
                  banka: (
                    <b style={{ color: "var(--text)" }}>
                      {silinecekEkHesapOdemesi.kart.banka}
                    </b>
                  ),
                  tutar: (
                    <b style={{ color: "var(--text)" }}>
                      {fmt(silinecekEkHesapOdemesi.odeme.tutar, yabanciBirim(silinecekEkHesapOdemesi.kart))}
                    </b>
                  ),
                }}
              />
            </div>
            <div className="bt-metric" style={{ padding: 11, marginTop: 14 }}>
              <div className="bt-metric-lbl">{t("borclar.odemeSil.kayitTarihi")}</div>
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
                <Trash2 size={14} /> {t("borclar.odemeSil.evet")}
              </button>
              <button
                className="bt-btn ikincil"
                type="button"
                onClick={() => setSilinecekEkHesapOdemesi(null)}
              >
                {t("ortak.vazgec")}
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
    "borcama_odeme_grafigi_v2_acik_" + depolamaAnahtari;
  const [acik, setAcik] = useState(
    () => localStorage.getItem(kayitAnahtari) === "1",
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
          className="bt-odeme-onizleme"
          type="button"
          aria-expanded="false"
          onClick={gorunumuDegistir}
        >
          <span className="bt-odeme-onizleme-ust">
            <span className="bt-odeme-onizleme-ikon">
              <BarChart3 size={18} />
            </span>
            <span className="bt-odeme-onizleme-metin">
              <strong>{ozet.baslik}</strong>
              <small>
                {t("borcSatir.grafik.odendiKaldi", { odenen: fmt(ozet.odenen), kalan: fmt(ozet.kalan) })}
              </small>
            </span>
            <span className="bt-odeme-onizleme-son">
              <strong>{t("borcSatir.yuzde", { n: Math.round(ozet.oran) })}</strong>
              <span>
                {t("borcSatir.grafik.ayrintilariAc")} <ChevronRight size={14} />
              </span>
            </span>
          </span>
          <span
            className="bt-odeme-ilerleme"
            aria-label={t("borcSatir.grafik.ilerlemeAria", { n: Math.round(ozet.oran) })}
          >
            <span style={{ width: ozet.oran + "%" }} />
          </span>
        </button>
      </div>
    );

  return (
    <div className="bt-odeme-ozet">
      <div className="bt-odeme-ozet-ust">
        <div>
          <div className="bt-metric-lbl">{t("borcSatir.grafik.baslik")}</div>
          <div className="bt-h2" style={{ marginTop: 4 }}>
            {ozet.baslik}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="bt-odeme-ozet-yuzde">{t("borcSatir.yuzde", { n: Math.round(ozet.oran) })}</div>
          <button
            className="bt-btn kucuk ikincil"
            type="button"
            aria-expanded={acik}
            onClick={gorunumuDegistir}
          >
            {acik ? <Minus size={14} /> : <Plus size={14} />}
            {acik ? t("ortak.kapat") : t("borcSatir.grafik.ac")}
          </button>
        </div>
      </div>
      <>
          <div
            className="bt-odeme-ilerleme"
            aria-label={t("borcSatir.grafik.ilerlemeAria", { n: Math.round(ozet.oran) })}
          >
            <div style={{ width: ozet.oran + "%" }} />
          </div>
          <div className="bt-odeme-ozet-rakamlar">
            <div className="bt-odeme-ozet-rakam">
              <div className="bt-metric-lbl">{t("borcSatir.toplamBorc")}</div>
              <div className="bt-mono" style={{ fontWeight: 800, marginTop: 4 }}>
                {fmt(ozet.toplam)}
              </div>
            </div>
            <div className="bt-odeme-ozet-rakam">
              <div className="bt-metric-lbl">{t("borcSatir.toplamOdenen")}</div>
              <div
                className="bt-mono"
                style={{ fontWeight: 800, marginTop: 4, color: "#5D7A2E" }}
              >
                {fmt(ozet.odenen)}
              </div>
            </div>
            <div className="bt-odeme-ozet-rakam">
              <div className="bt-metric-lbl">{t("borcSatir.kalanBorc")}</div>
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
  return expenseInstallmentAmountForPeriod(harcama, kart, ekstreAyi);
}

function EkstreKontrol({ veri, onKartEkle, onEkstreYukle }) {
  const kontrolAylar = useMemo(
    () =>
      [
        ...new Set(
          [
            ayAnahtari(),
            ...veri.cards.flatMap((k) => [
              k.ekstreAyi,
              ...(k.ekstreGecmisi || []).map((e) => e.ekstreAyi),
              ...veri.expenses
                .filter(
                  (h) =>
                    h.kaynak === k.banka + " · " + (k.ad || "Kredi kartı"),
                )
                .flatMap((h) => statementPeriodsForExpense(h, k)),
            ]),
          ].filter(Boolean),
        ),
      ]
        .sort()
        .reverse(),
    [veri.cards, veri.expenses],
  );
  const varsayilanKontrolAyi = useMemo(() => {
    const bugununTarihi = yerelTarihDegeri();
    return [
      ayAnahtari(),
      ...veri.cards.map((kart) =>
        statementPeriodForTransaction(bugununTarihi, kart.kesimGunu),
      ),
    ]
      .filter(Boolean)
      .sort()
      .at(-1);
  }, [veri.cards]);
  const [seciliAy, setSeciliAy] = useState(
    () => varsayilanKontrolAyi || ayAnahtari(),
  );
  useEffect(() => {
    if (!kontrolAylar.includes(seciliAy)) {
      setSeciliAy(varsayilanKontrolAyi || kontrolAylar[0] || ayAnahtari());
    }
  }, [kontrolAylar, seciliAy, varsayilanKontrolAyi]);
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

  if (veri.cards.length === 0) {
    return (
      <div className="bt-arac-bos">
        <h3>{t("borcSatir.kontrol.bosBaslik")}</h3>
        <p>{t(belgeOkumaAcik(undefined, tumBorcKayitlari(veri)) ? "borcSatir.kontrol.bosAciklama" : "borcSatir.kontrol.bosAciklamaManuel")}</p>
        <div className="bt-arac-bos-actions">
          <button className="bt-btn birincil" type="button" onClick={onKartEkle}>
            <Plus size={14} /> {t("borcSatir.kontrol.kartEkle")}
          </button>
          <button className="bt-btn ikincil" type="button" onClick={onEkstreYukle}>
            <Plus size={14} /> {t(belgeOkumaAcik(undefined, tumBorcKayitlari(veri)) ? "borcSatir.kontrol.ekstreEkle" : "borcSatir.kontrol.ekstreEkleManuel")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bt-stack">
      <div className="bt-card" style={{ padding: 14 }}>
        <div className="bt-cardhead" style={{ margin: 0 }}>
          <div>
            <div className="bt-h2" style={{ margin: 0 }}>
              {t("borcSatir.kontrol.donem")}
            </div>
            <div style={{ fontSize: 11.5, color: "var(--dim)", marginTop: 4 }}>
              {t("borcSatir.kontrol.donemAciklama")}
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
                {ay === ayAnahtari() ? t("borcSatir.kontrol.guncel") : ""}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="bt-ipucu">
        <Lightbulb size={16} />
        <div>
          <b>{t("borcSatir.kontrol.ipucuBaslik")}</b> {t("borcSatir.kontrol.ipucu")}
        </div>
      </div>
      {veri.cards.map((k, i) => {
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
                  <BankaRozeti
                    banka={k.banka}
                    bg={LIME}
                    rot={ROTASYONLAR[i % ROTASYONLAR.length]}
                    boyut={36}
                  />
                  <div>
                    <div className="bt-satir-ad">{kartGorunenAdi(k)}</div>
                    <div className="bt-satir-meta">
                      {t("borcSatir.kontrol.donemIci", {
                        baslangic: isoTarihGoster(donem.baslangic),
                        bitis: isoTarihGoster(donem.bitis),
                      })}
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
                  <div className="bt-metric-lbl">{t("borcSatir.kontrol.gercekEkstre")}</div>
                  <div className="bt-metric-amt">{fmt(ekstreYeni)}</div>
                  <div className="bt-metric-cap">
                    {ekstreKaydi
                      ? t("borcSatir.kontrol.bankadanGirilen")
                      : t("borcSatir.kontrol.ekstreYok")}
                  </div>
                </div>
                <div className="bt-metric">
                  <div className="bt-metric-lbl">{t("borcSatir.kontrol.manuel")}</div>
                  <div className="bt-metric-amt">{fmt(manuel)}</div>
                  <div className="bt-metric-cap">
                    {manuelHarcamalar.length === 1
                      ? t("borcSatir.kontrol.harcamaTekil", { n: manuelHarcamalar.length })
                      : t("borcSatir.kontrol.harcamaCogul", { n: manuelHarcamalar.length })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      {kaynaklar.length > 0 && (
        <div className="bt-card">
          <div className="bt-h2">
            <Wallet size={16} /> {t("borcSatir.kontrol.kaynaklarBaslik")}
          </div>
          {kaynaklar.map(([ad, x]) => (
            <div className="bt-kat" key={ad}>
              <div className="bt-kat-ad" style={{ width: 180 }}>
                {tDeger(ad)}
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

function KartYapilandirmaModal({ kart, onClose, onSave }) {
  const kalan = cardRestructurableBalance(kart);
  const [f, setF] = useState({
    amount: kalan > 0 ? String(kalan) : "", installment: "", installmentCount: "", firstPaymentDate: "", totalRepayment: "",
    monthlyInterest: "", kkdfRate: "", bsmvRate: "",
  });
  const [hata, setHata] = useState("");
  const adet = Math.max(Number.parseInt(f.installmentCount, 10) || 0, 0);
  const hesaplananTaksit = calculateRestructuringInstallment(f);
  const aylikTaksit = Math.max(Number(f.installment) || hesaplananTaksit, 0);
  const toplam = f.totalRepayment === "" ? aylikTaksit * adet : Math.max(Number(f.totalRepayment) || 0, 0);
  const tutar = Math.max(Number(f.amount) || 0, 0);
  const kaydet = () => {
    const kod = onSave({ cardId: kart.id, ...f, installment: aylikTaksit });
    if (!kod) return;
    const mesajlar = {
      INVALID_AMOUNT: t("borcSatir.yap.hataTutar"),
      INVALID_INSTALLMENT: t("borcSatir.yap.hataTaksit"),
      INVALID_FIRST_PAYMENT_DATE: t("borcSatir.yap.hataIlkOdeme"),
      INVALID_TOTAL_REPAYMENT: t("borcSatir.yap.hataToplam"),
    };
    setHata(mesajlar[kod] || t("borcSatir.yap.hataGenel"));
  };
  return <div className="bt-modal-arka" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="bt-modal bt-yapilandirma-modal" role="dialog" aria-modal="true" aria-labelledby="kart-yapilandirma-baslik">
      <div className="bt-modalbaslik"><div><div id="kart-yapilandirma-baslik" className="bt-h2">{t("borcSatir.yap.baslik")}</div><p className="bt-baslangic-secim-aciklama">{t("borcSatir.yap.aciklama", { kart: kartGorunenAdi(kart) })}</p></div><button className="bt-btn hayalet kucuk" type="button" aria-label={t("ortak.kapat")} onClick={onClose}><X size={18}/></button></div>
      <div className="bt-ipucu" style={{ marginBottom: 14 }}><Info size={16}/><div>{t("borcSatir.yap.ipucu")}</div></div>
      <div className="bt-alanlar">
        <label className="bt-alan">{t("borcSatir.yap.tutar")}<ParaInput className="bt-input" value={f.amount} onValueChange={(value) => setF({ ...f, amount: value })}/><small>{t("borcSatir.yap.kayitliBakiye", { bakiye: fmt(kalan) })}</small></label>
        <label className="bt-alan">{t("borcSatir.yap.aylikTaksit")}<ParaInput className="bt-input" value={f.installment} placeholder={hesaplananTaksit > 0 ? paraGirdisiniFormatla(hesaplananTaksit.toFixed(2)) : t("borcSatir.yap.otomatik")} onValueChange={(value) => setF({ ...f, installment: value })}/><small>{f.installment ? t("borcSatir.yap.kesinTaksit") : hesaplananTaksit > 0 ? t("borcSatir.yap.tahmini", { tutar: fmt(hesaplananTaksit) }) : t("borcSatir.yap.otomatikAciklama")}</small></label>
        <label className="bt-alan">{t("borcSatir.yap.taksitSayisi")}<input className="bt-input" type="number" min="1" max="120" step="1" value={f.installmentCount} onChange={(e) => setF({ ...f, installmentCount: e.target.value })}/></label>
        <label className="bt-alan">{t("borcSatir.yap.ilkOdeme")}<input className="bt-input" type="date" value={f.firstPaymentDate} onChange={(e) => setF({ ...f, firstPaymentDate: e.target.value })}/></label>
        <label className="bt-alan">{t("borcSatir.yap.toplamGeriOdeme")} <ParaInput className="bt-input" value={f.totalRepayment} onValueChange={(value) => setF({ ...f, totalRepayment: value })}/><small>{t("borcSatir.yap.bosBirak")}</small></label>
      </div>
      <details className="bt-yapilandirma-oranlar"><summary>{t("borcSatir.yap.oranlar")} <span>{t("ortak.istegeBagli")}</span></summary><div className="bt-alanlar" style={{ marginTop: 12 }}><label className="bt-alan">{t("borcSatir.yap.nominalFaiz")}<input className="bt-input" type="number" min="0" step="0.01" value={f.monthlyInterest} onChange={(e) => setF({ ...f, monthlyInterest: e.target.value })}/></label>{/* KKDF ve BSMV Turk vergi-fon kalemleri; TRY disinda alan yok, hesaba 0 girer. */}{turkiyeKurallariGecerli(kayitParaBirimi(kart)) && <><label className="bt-alan">KKDF (%)<input className="bt-input" type="number" min="0" step="0.01" value={f.kkdfRate} onChange={(e) => setF({ ...f, kkdfRate: e.target.value })}/></label><label className="bt-alan">BSMV (%)<input className="bt-input" type="number" min="0" step="0.01" value={f.bsmvRate} onChange={(e) => setF({ ...f, bsmvRate: e.target.value })}/></label></>}</div></details>
      {tutar > 0 && adet > 0 && <div className="bt-ipucu" style={{ marginTop: 14 }}><Check size={16}/><div><b>{t("borcSatir.yap.onizlemeBaslik")}</b> {t("borcSatir.yap.onizleme", { tutar: fmt(tutar), adet, dusen: fmt(Math.min(tutar, kalan)), toplam: fmt(toplam) })}{tutar > kalan && <> {t("borcSatir.yap.onizlemeFazla", { fazla: fmt(tutar - kalan) })}</>}</div></div>}
      {hata && <div className="bt-ipucu" role="alert" style={{ marginTop: 12, borderColor: CORAL }}>{hata}</div>}
      <div className="bt-form-butonlar"><button className="bt-btn birincil" type="button" onClick={kaydet}><Check size={14}/> {t("borcSatir.yap.kaydet")}</button><button className="bt-btn ikincil" type="button" onClick={onClose}>{t("ortak.vazgec")}</button></div>
    </div>
  </div>;
}

function BorclarSatiri({
  k,
  i,
  kategori,
  meta,
  setForm,
  sil,
  silmeOnayiAc,
  ekHesapOdemesiSil,
  paid,
  krediOdemeGecmisi,
  odendiIsaretle,
  odemelereGit,
  kartOdemesiAc,
  kartOdemeGecmisi,
  kartOdemesiDegistir,
  krediOdemesiAc,
  kartYapilandirmaAc,
  yeniEkstreAc,
  arsiv = false,
}) {
  // Satirdaki butun tutarlar kaydin kendi biriminde (ana birimse eskisi gibi).
  const satirBirimi = yabanciBirim(k);
  const fmt = (n) => fmtBirimli(n, satirBirimi);
  const [kartGecmisiAcik, setKartGecmisiAcik] = useState(false);
  const [duzenlenenKartOdemesi, setDuzenlenenKartOdemesi] = useState(null);
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
    odemeNesnesi = null,
    krediPlanOzeti = null;
  const krediOdemeAnahtari =
    kategori === "loans" ? loanPaymentKey(k, ayAnahtari()) : null;
  const krediOdemeDonemi = kategori === "loans" ? (k._donem || ayAnahtari()) : null;
  const buAyKrediOdendi =
    krediOdemeAnahtari !== null && !!paid?.[krediOdemeAnahtari];

  if (kategori === "cards") {
    const hesap = kartHesabi(k);
    const yapilandirma = latestCardRestructuring(k);
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
    const asgariTutar = hesap.asgari;
    const asgariTamam = hesap.odeme + 0.01 >= asgariTutar;
    const donem = arsiv ? k.ekstreAyi : k.ekstreAyi || ayAnahtari();
    const odendi =
      !!paid?.[kartOdemeAnahtari({ ...k, ekstreAyi: donem })] ||
      (ekstreVar && hesap.toplam <= 0);
    const borcKapandi = ekstreVar && hesap.toplam <= 0;
    const durum = borcKapandi
      ? yapilandirma
        ? `Yapılandırıldı${yapilandirma.taksitSayisi ? ` · ${yapilandirma.taksitSayisi} taksit` : ""}`
        : "Ödendi"
      : asgariTamam || odendi
        ? "Asgari ödendi"
        : hesap.odeme > 0
          ? "Kısmi ödeme"
        : "Ödeme bekleniyor";
    const durumMetni = borcKapandi
      ? yapilandirma
        ? yapilandirma.taksitSayisi
          ? t("borcSatir.kart.yapilandirildiTaksit", { n: yapilandirma.taksitSayisi })
          : t("borcSatir.kart.yapilandirildi")
        : t("borcSatir.kart.odendi")
      : asgariTamam || odendi
        ? t("borcSatir.kart.asgariOdendi")
        : hesap.odeme > 0
          ? t("borcSatir.kart.kismiOdeme")
        : t("borcSatir.kart.odemeBekleniyor");
    const gecikmis = ekstreVar && gecikenGun > 0 && !asgariTamam && !odendi;
    barRenk = gecikmis ? CORAL : LIME;
    barGoster = barOran !== null;
    altMeta = !ekstreVar
      ? t("borcSatir.kart.ekstreBekleniyor")
      : arsiv
        ? t("borcSatir.kart.ekstresi", { ay: ayEtiketi(k.ekstreAyi) })
        : t("borcSatir.kart.sonOdeme", { tarih: gecikmeTarihi.toLocaleDateString(locale()) });
    if (yapilandirma && borcKapandi) {
      altYazi = t("borcSatir.kart.taksitPlaninaTasindi", { tutar: fmt(yapilandirma.tutar) });
    } else if (gecikmis) {
      const gecikmeOrani = kartFaizOranlari(
        hesap.onceki || hesap.toplam,
        k.faiz,
        kayitParaBirimi(k),
      ).gecikme;
      const birikenFaiz = gunlukBirikmisFaiz(
        hesap.toplam,
        gecikmeOrani,
        gecikenGun,
      );
      // TRY disinda oran girilmemisse faiz tutari gosterilmez (varsayim yok).
      altYazi = gecikmeOrani > 0
        ? t(
            gecikenGun === 1 ? "borcSatir.kart.gecikmeTekil" : "borcSatir.kart.gecikmeCogul",
            { n: gecikenGun, faiz: fmt(birikenFaiz) },
          )
        : t(gecikenGun === 1 ? "borcSatir.kart.gecikmeFaizsizTekil" : "borcSatir.kart.gecikmeFaizsizCogul", { n: gecikenGun });
    }
    tutarEtiketi = ekstreVar ? durumMetni : null;
    kartDetay = ekstreVar
      ? {
          paraBirimi: satirBirimi,
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
          durumMetni,
          asgari: hesap.asgari,
          belgeOzeti: k.ekstreBelgeOzeti || null,
        }
      : null;
    if (ekstreVar && hesap.toplam > 0) {
      odemeNesnesi = {
        ...(satirBirimi ? { paraBirimi: satirBirimi } : {}),
        tur: "kart",
        ad: kartGorunenAdi(k),
        anahtar: kartOdemeAnahtari({ ...k, ekstreAyi: donem }),
        tutar: Math.max(asgariTutar - hesap.odeme, 0),
        kalanToplam: hesap.toplam,
      };
    }
  } else if (kategori === "loans") {
    krediPlanOzeti = summarizeLoanRecord(k, krediOdemeGecmisi);
    tutar = arsiv ? +k.taksit || 0 : krediPlanOzeti.remainingPaymentTotal;
    altMeta = k._gelecek
      ? ayEtiketi(k._donem) +
        t("borcSatir.kredi.planlananTaksit", { gun: k.odemeGunu }) +
        (k._kalanTaksitProj !== null
          ? t("borcSatir.kredi.odemeSonrasiKalacak", { n: k._kalanTaksitProj })
          : "")
      : arsiv
        ? ayEtiketi(k._donem) +
          t("borcSatir.kredi.taksitOdendi") +
          (+k.kalanBorc > 0
            ? t("borcSatir.kredi.kayitAnindakiKalan", { tutar: fmt(k.kalanBorc) })
            : "")
        : t("borcSatir.kredi.taksitHerAyin", { taksit: fmt(k.taksit), gun: k.odemeGunu }) +
          (+k.kalanTaksit > 0 ? t("borcSatir.kredi.taksitKaldi", { n: krediPlanOzeti.remainingInstallments }) : "") +
          (buAyKrediOdendi ? t("borcSatir.kredi.buAykiOdendi") : "");
    if (k.ilkOdemeTarihi) altMeta += t("borcSatir.kredi.ilkTaksit", { tarih: isoTarihGoster(k.ilkOdemeTarihi) });
    if (!arsiv && !k._gelecek && krediPlanOzeti.remainingPaymentTotal > 0) {
      tutarEtiketi = t("borcSatir.kredi.toplamKalanOdeme");
      altYazi = krediPlanOzeti.financingCostIsKnown
        ? t("borcSatir.kredi.anaparaMaliyet", { anapara: fmt(krediPlanOzeti.remainingPrincipal), maliyet: fmt(krediPlanOzeti.remainingFinancingCost) })
        : null;
    }
    if ((!arsiv || k._gelecek) && krediPlanOzeti.remainingPaymentTotal > 0) {
      const odemeKaydi = krediOdemeGecmisi?.[krediOdemeDonemi]?.[k.id];
      const yapilanOdeme = loanPaymentAmount(odemeKaydi);
      odemeNesnesi = {
        ...(satirBirimi ? { paraBirimi: satirBirimi } : {}),
        tur: "kredi",
        ad: k.banka + (k.ad ? " · " + k.ad : ""),
        anahtar: krediOdemeAnahtari,
        tutar: Math.max((+k.taksit || 0) - yapilanOdeme, 0),
        kalanKrediBorcu: krediPlanOzeti.remainingPaymentTotal,
        donem: krediOdemeDonemi,
        donemEtiketi: ayEtiketi(krediOdemeDonemi),
      };
    }
  } else if (kategori === "od") {
    const hesap = ekHesapHesabi(k);
    ekHesapDetay = hesap;
    tutar = hesap.kalan;
    altMeta =
      t("borcSatir.od.kullanilanOdenen", { kullanilan: fmt(hesap.kullanilan), odenen: fmt(hesap.odeme) }) +
      (+k.limit > 0 ? t("borcSatir.od.limit", { limit: fmt(k.limit) }) : "");
    tutarEtiketi = hesap.kalan > 0 ? t("borcSatir.kalanBorc") : t("borcSatir.od.borcKapandi");
    altYazi =
      hesap.kalan > 0
        ? hesap.ucretle
          ? t("borcSatir.od.ucretle")
          : t("borcSatir.od.tahminiFaiz", { faiz: fmt(hesap.faiz), oran: hesap.oran.toFixed(2) }) +
            (hesap.varsayilan ? ` · ${ortalamaEtiketi(kayitParaBirimi(k))}` : "")
        : null;
  } else {
    tutar = +k.tutar || 0;
    altMeta = k.ad || "—";
  }

  const kartOdemeAnahtariSatir =
    kategori === "cards"
      ? kartOdemeAnahtari({ ...k, ekstreAyi: k.ekstreAyi || ayAnahtari() })
      : null;
  const kartOdemeleri = kartOdemeAnahtariSatir
    ? kartOdemeGecmisi?.[kartOdemeAnahtariSatir] || []
    : [];

  return (
    <div className={`bt-satir${kategori === "cards" ? " bt-kredi-karti" : ""}${kategori === "loans" ? " bt-kredi-satiri" : ""}${kategori === "loans" && buAyKrediOdendi ? " bt-kredi-bu-ay-odendi" : ""}`}>
      <BankaRozeti
        banka={k.banka}
        bg={meta.rozetBg}
        rot={ROTASYONLAR[i % ROTASYONLAR.length]}
        className={kategori === "cards" ? "bt-kart-rozet" : undefined}
      />
      <div
        className={kategori === "cards" ? "bt-kart-bilgi" : kategori === "loans" ? "bt-kredi-bilgi" : undefined}
        style={{ flex: 1, minWidth: 150 }}
      >
        <div className={`bt-satir-ad${kategori === "loans" ? " bt-kredi-baslik" : ""}`}>
          {baslik}
          {kategori === "cards" ? (
            <span style={{ color: "var(--dim)", fontWeight: 500 }}>
              {" "}
              · {ekAd || t("borcSatir.krediKarti")}{kartSon4Eki(k)}
            </span>
          ) : ekAd && kategori !== "others" ? (
            <span style={{ color: "var(--dim)", fontWeight: 500 }}>
              {" "}· {ekAd}
            </span>
          ) : null}
          {kategori === "loans" && buAyKrediOdendi && (!arsiv || k._gelecek) && <span className="bt-kredi-durum">{k._gelecek ? t("borcSatir.kredi.ayOdendi", { ay: ayEtiketi(krediOdemeDonemi) }) : t("borcSatir.kredi.buAyOdendi")}</span>}
        </div>
        {kategori === "loans" && !arsiv && !k._gelecek ? (
            <div className="bt-kredi-metrikler" aria-label={t("borcSatir.kredi.ozetAria")}>
              {+k.anaPara > 0 && <div className="bt-kredi-metrik"><span>{t("borcSatir.kredi.krediTutari")}</span><strong>{fmt(k.anaPara)}</strong></div>}
              <div className="bt-kredi-metrik"><span>{t("borcSatir.kredi.kalanToplamOdeme")}</span><strong>{fmt(krediPlanOzeti?.remainingPaymentTotal)}</strong></div>
              <div className="bt-kredi-metrik bt-kredi-kapatma">
                <span>{t("borcSatir.kredi.bugunKapatirsam")}</span>
                <strong>{fmt(krediPlanOzeti?.financingCostIsKnown ? krediPlanOzeti.remainingPrincipal : krediPlanOzeti?.remainingPaymentTotal)}</strong>
                <small>{krediPlanOzeti?.financingCostIsKnown ? t("borcSatir.kredi.yaklasikAnapara") : t("borcSatir.kredi.tahminiUstSinir")}</small>
              </div>
              <div className="bt-kredi-metrik"><span>{t("borcSatir.kredi.aylikTaksit")}</span><strong>{fmt(k.taksit)}</strong></div>
              <div className="bt-kredi-metrik"><span>{t("borcSatir.kredi.kalanTaksit")}</span><strong>{(krediPlanOzeti?.remainingInstallments ?? 0) === 1 ? t("borcSatir.kredi.taksitTekil", { n: 1 }) : t("borcSatir.kredi.taksitCogul", { n: krediPlanOzeti?.remainingInstallments ?? 0 })}</strong></div>
              <div className="bt-kredi-metrik"><span>{t("borcSatir.kredi.aylikFaiz")}</span><strong>{+k.faiz > 0 ? t("borcSatir.yuzde", { n: Number(k.faiz).toLocaleString(locale(), { maximumFractionDigits: 4 }) }) : t("borcSatir.belirtilmedi")}</strong></div>
              <div className="bt-kredi-metrik"><span>{t("borcSatir.kredi.odemeGunu")}</span><strong>{k.odemeGunu ? t("borcSatir.kredi.ayinGunu", { gun: k.odemeGunu }) : t("borcSatir.belirtilmedi")}</strong></div>
          </div>
        ) : <div className="bt-satir-meta">{altMeta}</div>}
        {kategori === "loans" && !arsiv && !k._gelecek && altYazi && <div className="bt-kredi-ayrim">{altYazi}</div>}
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
        {kartDetay && (
          <EkstreSatirDetayi
            detay={kartDetay}
            arsivSayisi={!arsiv ? (k.ekstreGecmisi || []).length : 0}
          />
        )}
      </div>
      {!(kategori === "loans" && !arsiv && !k._gelecek) && <div
        className={kategori === "cards" ? "bt-kart-tutar" : undefined}
        style={{ textAlign: "right" }}
      >
        <div className="bt-satir-tutar">{fmt(tutar)}</div>
        {tutarEtiketi && (
          <button
            type="button"
            className="bt-satirD-tur"
            disabled={kategori !== "cards" || kartOdemeleri.length === 0}
            title={kartOdemeleri.length ? t("borcSatir.kart.gecmisiGor") : undefined}
            onClick={() => kartOdemeleri.length && setKartGecmisiAcik((acik) => !acik)}
            style={{ fontWeight: 800, color: tutar > 0 ? CORAL : "#5D7A2E" }}
          >
            {tutarEtiketi}
            {kartOdemeleri.length > 0 && <> · {kartOdemeleri.length === 1 ? t("borcSatir.kart.odemeTekil", { n: 1 }) : t("borcSatir.kart.odemeCogul", { n: kartOdemeleri.length })} <Pencil size={11} /></>}
          </button>
        )}
        {altYazi && <div className="bt-satir-alt">{altYazi}</div>}
      </div>}
      {(!arsiv || (kategori === "loans" && k._gelecek)) && (
        <div
          className={kategori === "cards" ? "bt-kart-islemler" : kategori === "loans" ? "bt-kredi-islemler" : undefined}
          style={{
            display: "flex",
            gap: 4,
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          {kategori === "cards" && odemeNesnesi && (
            <button
              className="bt-btn kucuk birincil"
              title={t("borcSatir.kart.odemeGirTitle")}
              onClick={() => kartOdemesiAc?.(odemeNesnesi)}
            >
              <Wallet size={13} /> {t("borcSatir.odemeGir")}
            </button>
          )}
          {kategori === "cards" && (
            <button
              className="bt-btn kucuk ikincil"
              title={t("borcSatir.kart.yeniEkstreTitle")}
              onClick={() => yeniEkstreAc?.(k)}
            >
              <Plus size={13} /> {t("borcSatir.kart.yeniEkstre")}
            </button>
          )}
          {kategori === "cards" && (
            <details className="bt-satir-menu">
              <summary className="bt-btn kucuk ikincil" title={t("borcSatir.kart.digerIslemler")}>
                <MoreHorizontal size={15} /> {t("borcSatir.kart.diger")}
              </summary>
              <div className="bt-satir-menu-panel">
                <button
                  className="bt-btn kucuk hayalet"
                  onClick={(e) => {
                    e.currentTarget.closest("details")?.removeAttribute("open");
                    setForm({ liste: "cards", veri: k, ekstreDuzenle: true });
                  }}
                >
                  <Pencil size={13} /> {t("borcSatir.kart.ekstreyiDuzenle")}
                </button>
                <button
                  className="bt-btn kucuk hayalet"
                  onClick={() => setForm({ liste: meta.liste, veri: k })}
                >
                  <Pencil size={13} /> {t("borcSatir.kart.kartBilgileri")}
                </button>
                {tutar > 0 && (
                  <button
                    className="bt-btn kucuk hayalet"
                    onClick={(e) => {
                      e.currentTarget.closest("details")?.removeAttribute("open");
                      kartYapilandirmaAc?.(k);
                    }}
                  >
                    <ArrowLeftRight size={13} /> {t("borcSatir.yap.baslik")}
                  </button>
                )}
                <button
                  className="bt-btn kucuk hayalet tehlike"
                  onClick={() => sil(meta.liste, k.id)}
                >
                  <Trash2 size={13} /> {t("borcSatir.kart.kartiSil")}
                </button>
              </div>
            </details>
          )}
          {kategori === "od" && (
            <button className="bt-btn kucuk ikincil"
              onClick={() => setForm({ liste: "overdrafts", veri: k, yeniBorc: true })}>
              <Plus size={13} /> {t("borcSatir.od.yeniBorc")}
            </button>
          )}
          {kategori === "od" && ekHesapDetay?.kalan > 0 && (
            <button
              className="bt-btn kucuk ikincil"
              title={t("borcSatir.od.kismiOdemeTitle")}
              onClick={() =>
                setForm({ liste: "overdrafts", veri: k, odemeGir: true })
              }
            >
              {t("borcSatir.odemeGir")}
            </button>
          )}
          {kategori === "od" && ekHesapDetay?.kalan > 0 && (
            <button
              className="bt-btn kucuk ikincil"
              title={t("borcSatir.od.tamaminiOdeTitle")}
              onClick={() =>
                setForm({
                  liste: "overdrafts",
                  veri: k,
                  odemeGir: true,
                  kapat: true,
                })
              }
            >
              <Check size={13} /> {t("borcSatir.od.borcuKapat")}
            </button>
          )}
          {kategori === "loans" && odemeNesnesi && (
            <button
              className="bt-btn kucuk birincil"
              title={t("borcSatir.kredi.odemeGirTitle")}
              onClick={() => krediOdemesiAc?.(odemeNesnesi)}
            >
              <Wallet size={13} /> {t("borcSatir.odemeGir")}
            </button>
          )}
          {!arsiv && kategori !== "cards" && (
            <button
              className="bt-btn hayalet"
              onClick={() => setForm({ liste: meta.liste, veri: k })}
            >
              <Pencil size={15} />
            </button>
          )}
          {!arsiv && kategori !== "cards" && (
            <button
              className="bt-btn hayalet tehlike"
              aria-label={kategori === "loans" ? t("borcSatir.kredi.kaydiSil") : t("borcSatir.borcKaydiSil")}
              onClick={() =>
                kategori === "loans"
                  ? silmeOnayiAc?.(meta.liste, k)
                  : sil(meta.liste, k.id)
              }
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      )}
      {!arsiv && (
        <div
          id={`borc-form-${k.id}`}
          className="bt-inline-ekstre-hedef"
        />
      )}
      {kategori === "cards" && kartGecmisiAcik && kartOdemeleri.length > 0 && (
        <div className="bt-odeme-gecmisi bt-kart-odeme-gecmisi-acik">
          <div className="bt-odeme-gecmisi-baslik">
            <strong>{t("borcSatir.kart.ekstreOdemeleri")}</strong>
            <span>{t("borcSatir.kart.yanlisTutar")}</span>
          </div>
          <div className="bt-odeme-liste">
            {[...kartOdemeleri].reverse().map((odeme) => {
              const duzenleniyor = duzenlenenKartOdemesi?.id === odeme.id;
              return (
                <div key={odeme.id} className="bt-odeme-kaydi">
                  <div className="bt-odeme-tarih">{tarihSaatEtiketi(odeme.tarih)}</div>
                  {duzenleniyor ? (
                    <ParaInput
                      className="bt-input"
                      autoFocus
                      value={duzenlenenKartOdemesi.tutar}
                      onValueChange={(value) => setDuzenlenenKartOdemesi({ ...duzenlenenKartOdemesi, tutar: value })}
                    />
                  ) : (
                    <div className="bt-odeme-tutar">{fmt(odeme.tutar)}</div>
                  )}
                  <div className="bt-odeme-islemler">
                    {duzenleniyor ? (
                      <>
                        <button className="bt-btn hayalet" title={t("ortak.kaydet")} onClick={() => {
                          kartOdemesiDegistir?.(kartOdemeAnahtariSatir, odeme.id, duzenlenenKartOdemesi.tutar);
                          setDuzenlenenKartOdemesi(null);
                        }}><Check size={13} /></button>
                        <button className="bt-btn hayalet" title={t("ortak.vazgec")} onClick={() => setDuzenlenenKartOdemesi(null)}><X size={13} /></button>
                      </>
                    ) : (
                      <button className="bt-btn hayalet" title={t("borcSatir.odemeyiDuzenle")} onClick={() => setDuzenlenenKartOdemesi({ id: odeme.id, tutar: odeme.tutar })}><Pencil size={13} /></button>
                    )}
                    <button className="bt-btn hayalet tehlike" title={t("borcSatir.odemeyiSil")} onClick={() => {
                      if (window.confirm(t("borcSatir.kart.odemeSilOnay")))
                        kartOdemesiDegistir?.(kartOdemeAnahtariSatir, odeme.id, null);
                    }}><Trash2 size={13} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {kategori === "od" && (k.odemeGecmisi || []).length > 0 && (
        <details className="bt-odeme-gecmisi">
          <summary>{k.odemeGecmisi.length === 1 ? t("borcSatir.od.gecmisTekil", { n: 1 }) : t("borcSatir.od.gecmisCogul", { n: k.odemeGecmisi.length })}</summary>
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
                    title={t("borcSatir.odemeyiDuzenle")}
                    onClick={() =>
                      setForm({ liste: "overdrafts", veri: k, odemeDuzenle: o })
                    }
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    className="bt-btn hayalet tehlike"
                    title={t("borcSatir.odemeyiSil")}
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

function EkstreSatirDetayi({ detay, arsivSayisi = 0 }) {
  const fmt = (n) => fmtBirimli(n, detay?.paraBirimi);
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
        {t("borcSatir.ekstre.detaylar")}
        {arsivSayisi > 0
          ? t(arsivSayisi === 1 ? "borcSatir.ekstre.eskiDonemTekil" : "borcSatir.ekstre.eskiDonemCogul", { n: arsivSayisi })
          : ""}
      </summary>
      <div className="bt-grid" style={{ marginTop: 10, gap: 8 }}>
        <div className="bt-metric" style={{ padding: 11 }}>
          <div className="bt-metric-lbl">{t("borcSatir.ekstre.buDonem")}</div>
          <div className="bt-mono" style={{ fontWeight: 800 }}>
            {fmt(detay.guncel)}
          </div>
        </div>
        <div className="bt-metric" style={{ padding: 11 }}>
          <div className="bt-metric-lbl">{t("borcSatir.ekstre.devreden")}</div>
          <div className="bt-mono" style={{ fontWeight: 800 }}>
            {fmt(detay.devreden)}
          </div>
        </div>
        <div className="bt-metric" style={{ padding: 11 }}>
          <div className="bt-metric-lbl">{t("borcSatir.toplamBorc")}</div>
          <div className="bt-mono" style={{ fontWeight: 800 }}>
            {fmt(detay.ekstre)}
          </div>
        </div>
        <div className="bt-metric" style={{ padding: 11 }}>
          <div className="bt-metric-lbl">{t("borcSatir.toplamOdenen")}</div>
          <div className="bt-mono" style={{ fontWeight: 800 }}>
            {detay.odemeBilgisiYok ? t("borcSatir.ekstre.bilgiYok") : fmt(detay.odeme)}
          </div>
        </div>
        <div className="bt-metric" style={{ padding: 11 }}>
          <div className="bt-metric-lbl">{t("borcSatir.kalanBorc")}</div>
          <div className="bt-mono" style={{ fontWeight: 800 }}>
            {fmt(detay.kalan)}
          </div>
        </div>
        <div className="bt-metric" style={{ padding: 11 }}>
          <div className="bt-metric-lbl">{t("borcSatir.ekstre.asgari")}</div>
          <div className="bt-mono" style={{ fontWeight: 800 }}>
            {fmt(detay.asgari)}
          </div>
        </div>
        {detay.belgeOzeti && (
          <div
            style={{
              gridColumn: "1/-1",
              borderTop: "1.5px solid var(--line)",
              paddingTop: 10,
              display: "grid",
              gap: 5,
              color: "var(--dim)",
              fontSize: 11,
            }}
          >
            <strong style={{ color: "var(--ink)" }}>{t("borcSatir.ekstre.belgeOzeti")}</strong>
            <span>
              {t("borcSatir.ekstre.oncekiBakiye", {
                onceki: fmt(detay.belgeOzeti.oncekiBakiye || 0),
                odemeler: fmt(detay.belgeOzeti.donemIciOdemeler || 0),
              })}
            </span>
            <span>
              {t("borcSatir.ekstre.yeniHarcama", {
                harcamalar: fmt(detay.belgeOzeti.harcamalar || 0),
                ucretler: fmt(detay.belgeOzeti.faizVeUcretler || 0),
              })}
            </span>
          </div>
        )}
        <div
          style={{
            gridColumn: "1/-1",
            fontSize: 11.5,
            fontWeight: 800,
            color: detay.durum === "Ödendi" ? "#5D7A2E" : CORAL,
          }}
        >
          {t("borcSatir.ekstre.durum", { durum: detay.durumMetni ?? detay.durum })}
        </div>
      </div>
    </details>
  );
}

function GecikmisBorcSatiri({ g, i }) {
  return (
    <div className="bt-satir" style={{ borderColor: CORAL }}>
      <BankaRozeti
        banka={g.banka}
        bg={CORAL}
        rot={ROTASYONLAR[i % ROTASYONLAR.length]}
      />
      <div style={{ flex: 1, minWidth: 150 }}>
        <div className="bt-satir-ad">
          {g.banka}{" "}
          <span style={{ color: "var(--dim)", fontWeight: 500 }}>· {g.ad}</span>
        </div>
        <div className="bt-satir-meta">
          {t("borcSatir.gecikmis.meta", {
            tur: tDeger(g.tur),
            tarih: g.tarih.toLocaleDateString(locale()),
            oran: g.oran.toFixed(2),
          })}
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div className="bt-satir-tutar">{fmt(g.bakiye, g.paraBirimi)}</div>
        <div className="bt-satirD-tur" style={{ fontWeight: 800 }}>
          {t("borcSatir.kalanBorc")}
        </div>
        <div className="bt-satir-alt">
          {g.oran === 0 && g.id.startsWith("kart-")
            ? g.durum === "devreden"
              ? t("borcSatir.kart.asgariOdendi")
              : t(g.gun === 1 ? "borcSatir.kart.gecikmeFaizsizTekil" : "borcSatir.kart.gecikmeFaizsizCogul", { n: g.gun })
            : g.durum === "devreden"
            ? t("borcSatir.gecikmis.asgariOdendi", { faiz: fmt(g.faiz, g.paraBirimi) })
            : t(g.gun === 1 ? "borcSatir.gecikmis.gecikmeTekil" : "borcSatir.gecikmis.gecikmeCogul", {
                n: g.gun,
                faiz: fmt(g.faiz, g.paraBirimi),
              })}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Borç Planı ---------------- */
function Plan({ kalemler, aylikFaiz, setSekme, veri, gelir, proAktif, proAc, kurNotu = null }) {
  const [strateji, setStrateji] = useState("cig");
  const [ekstra, setEkstra] = useState("");
  // Plan tutarlari ana birimde; senaryo kayitlari ana birime cevrilmis kopya.
  const anaBirimVeri = useMemo(() => anaBirimBorcVerisi(veri), [veri]);

  const finansalSenaryo = calculateRevolvingDebtScenario({
    income: gelir,
    expenses: veri?.expenses || [],
    cards: anaBirimVeri?.cards || [],
    loans: anaBirimVeri?.loans || [],
    debts: (kalemler || []).filter((kalem) => ["kart", "ek"].includes(kalem.tur)),
    currentDate: bugun(),
  });
  const senaryoMetni = getFinancialScenarioCopy(finansalSenaryo);
  // Ay sayısına göre tekil/çoğul anahtar (İngilizce "1 month / 2 months").
  const ayli = (anahtar, n, degerler) => t(`${anahtar}${n === 1 ? "Tekil" : "Cogul"}`, { n, ...degerler });
  const onerilenButce = finansalSenaryo.recommendation?.recommendedLivingBudget;
  const onerilenSenaryo =
    finansalSenaryo.recommendation?.livingReductionNeeded > 1 && Number.isFinite(onerilenButce)
      ? calculateRevolvingDebtScenario({
          income: gelir,
          expenses: veri?.expenses || [],
          cards: anaBirimVeri?.cards || [],
          loans: anaBirimVeri?.loans || [],
          debts: (kalemler || []).filter((kalem) => ["kart", "ek"].includes(kalem.tur)),
          currentDate: bugun(),
          livingBudgetOverride: onerilenButce,
        })
      : null;
  const kazanilanAy =
    finansalSenaryo.status === "ok" && onerilenSenaryo?.status === "ok"
      ? Math.max(finansalSenaryo.months - onerilenSenaryo.months, 0)
      : 0;
  const zorunluOdemelerSonrasiYasamButcesi = Math.max(
    finansalSenaryo.monthlyIncome -
      finansalSenaryo.fixedMonthly -
      finansalSenaryo.requiredMinimum,
    0,
  );
  const gerekenYasamAzaltimi = Math.max(
    finansalSenaryo.livingBudget - zorunluOdemelerSonrasiYasamButcesi,
    0,
  );
  const gerekenAzaltimYuzdesi = finansalSenaryo.livingBudget > 0
    ? Math.ceil((gerekenYasamAzaltimi / finansalSenaryo.livingBudget) * 100)
    : 0;
  const harcamasizKalanAcik = Math.max(
    finansalSenaryo.fixedMonthly +
      finansalSenaryo.requiredMinimum -
      finansalSenaryo.monthlyIncome,
    0,
  );
  const yuzdeOtuzSenaryosu = finansalSenaryo.spendingScenarios?.find(
    (scenario) => Math.abs(scenario.reductionRate - 0.3) < 0.001,
  );

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
          <Ceviri
            anahtar="plan.bos"
            degerler={{
              link: (
                <button className="bt-link" onClick={() => setSekme("borclar")}>
                  {t("plan.bosLink")}
                </button>
              ),
            }}
          />
        </div>
      </div>
    );

  if (!proAktif)
    return (
      <div className="bt-stack">
        <section className="bt-plan-giris">
          <div className="bt-plan-giris-ust">
            <button className="bt-link" type="button" onClick={() => setSekme("borclar")}>
              <ChevronLeft size={15} /> {t("plan.borclaraDon")}
            </button>
          </div>
          <div className="bt-plan-giris-ana">
            <div>
              <h1>{t("plan.kilit.baslik")}</h1>
              <p>{t("plan.kilit.aciklama")}</p>
            </div>
            <div className="bt-plan-faiz-ozeti">
              <span>{t("plan.faizYuku")}</span>
              <strong>{fmt0(aylikFaiz)}</strong>
              <small>{t(doner.length === 1 ? "plan.kilit.kayitTekil" : "plan.kilit.kayitCogul", { n: doner.length })}</small>
            </div>
          </div>
        </section>
        <section className="bt-pro-senaryo kilitli">
          <div className="bt-pro-senaryo-ust">
            <span className="bt-pro-senaryo-rozet"><Sparkles size={15} /> Borcama Pro</span>
          </div>
          <div className="bt-pro-senaryo-ana">
            <div>
              <h2>{t("plan.kilit.proBaslik")}</h2>
              <p>{t("plan.kilit.proAciklama")}</p>
            </div>
            <button className="bt-btn birincil" type="button" onClick={proAc}>
              {t("plan.kilit.incele")} <ChevronRight size={16} />
            </button>
          </div>
          <div className="bt-pro-senaryo-metrikler">
            <div><span>{t("plan.kilit.oncelik")}</span><strong>{t("plan.kilit.cigKartopu")}</strong></div>
            <div><span>{t("plan.kilit.senaryolar")}</span><strong>{t("plan.kilit.yuzdeler")}</strong></div>
            <div><span>{t("plan.kilit.sonuc")}</span><strong>{t("plan.kilit.borcsuzluk")}</strong></div>
          </div>
        </section>
      </div>
    );

  return (
    <div className="bt-stack">
      <section className="bt-plan-giris">
        <div className="bt-plan-giris-ust">
          <button className="bt-link" type="button" onClick={() => setSekme("borclar")}>
            <ChevronLeft size={15} /> {t("plan.borclaraDon")}
          </button>
        </div>
        <div className="bt-plan-giris-ana">
          <div>
            <h1>{t("plan.baslik")}</h1>
            <p>{t("plan.altBaslik")}</p>
          </div>
          <div className="bt-plan-faiz-ozeti">
            <span>{t("plan.faizYuku")}</span>
            <strong>{fmt0(aylikFaiz)}</strong>
            <small>{t("plan.yillik", { tutar: fmt0(aylikFaiz * 12) })}</small>
            <KurNotu durum={kurNotu} />
          </div>
        </div>
        <div className="bt-plan-faiz-kirilim">
          {kartFaiz > 0 && (
            <div className="bt-chip">
              <span className="dot" style={{ background: LIME }} />
              <span className="lbl">{t("plan.kirilim.kart")}</span>
              <span className="amt">{fmt0(kartFaiz)}</span>
            </div>
          )}
          {ekFaiz > 0 && (
            <div className="bt-chip">
              <span className="dot" style={{ background: CORAL }} />
              <span className="lbl">{t("plan.kirilim.ek")}</span>
              <span className="amt">{fmt0(ekFaiz)}</span>
            </div>
          )}
          {digerFaiz > 0 && (
            <div className="bt-chip">
              <span className="dot" style={{ background: "#55584c" }} />
              <span className="lbl">{t("plan.kirilim.diger")}</span>
              <span className="amt">{fmt0(digerFaiz)}</span>
            </div>
          )}
        </div>
        {gecikmisler.length > 0 && (
          <div className="bt-plan-gecikme">
            {gecikmisler.every((k) => !(k.faiz > 0))
              ? t(gecikmisler.length === 1 ? "plan.gecikmeFaizsizTekil" : "plan.gecikmeFaizsizCogul", { n: gecikmisler.length })
              : t(gecikmisler.length === 1 ? "plan.gecikmeTekil" : "plan.gecikmeCogul", {
                  n: gecikmisler.length,
                  tutar: fmt0(gecikmisFaiz),
                })}
          </div>
        )}
      </section>

      <section className={`bt-plan-senaryo ${finansalSenaryo.status === "structural_gap" ? "oncelikli" : ""}`}>
        <div className="bt-plan-senaryo-not" style={{ display: "none" }}>
          <strong>{t("plan.not.baslik")}</strong>
          <span>{t("plan.not.metin", { aylar: finansalSenaryo.living.monthsUsed.join(", ") || t("plan.not.henuzYok") })}
            {finansalSenaryo.living.partialMonthOnly && t("plan.not.eksikAy")}
          </span>
        </div>
        <div className="bt-plan-senaryo-ust">
          <div>
            <span className="bt-plan-senaryo-kicker">{t("plan.kicker")}</span>
            <h2>{finansalSenaryo.status === "structural_gap" ? t("plan.dengeBaslik") : senaryoMetni.title}</h2>
            <p>{finansalSenaryo.status === "structural_gap" ? t("plan.dengeAciklama") : senaryoMetni.reason}</p>
          </div>
          <span className="bt-plan-senaryo-durum">
            {finansalSenaryo.status === "ok"
              ? ayli("plan.durumAy", finansalSenaryo.months)
              : onerilenSenaryo?.status === "ok"
                ? ayli("plan.hedefAy", onerilenSenaryo.months)
                : t("plan.ekPlan")}
          </span>
        </div>

        {["structural_gap", "long_horizon"].includes(finansalSenaryo.status) ? (
          <>
            {finansalSenaryo.status === "structural_gap" && (
              <div className="bt-plan-karar">
                <div className="bt-plan-karar-ana">
                  <span>{t("plan.acik.baslik")}</span>
                  <strong>{fmt0(finansalSenaryo.monthlyGap)}</strong>
                  <small>{t("plan.acik.aciklama")}</small>
                </div>
                <div className="bt-plan-karar-yan">
                  <span>{t("plan.sinir.baslik")}</span>
                  <strong>{fmt0(Math.max(0, zorunluOdemelerSonrasiYasamButcesi))}</strong>
                  <small>{t("plan.sinir.aciklama")}</small>
                </div>
              </div>
            )}
            <details className="bt-plan-detay">
              <summary>{t("plan.detay.nasil")}</summary>
              <div className="bt-plan-senaryo-grid">
              <div><span>{t("plan.aylikGelir")}</span><strong>{fmt0(finansalSenaryo.monthlyIncome)}</strong></div>
              <div><span>{t("plan.sabitTaksit")}</span><strong>{fmt0(finansalSenaryo.fixedMonthly)}</strong></div>
              <div><span>{t("plan.yasamHarcamasi")}</span><strong>{fmt0(finansalSenaryo.livingBudget)}</strong></div>
              {finansalSenaryo.status === "structural_gap" ? (
                <>
                  <div>
                    <span>{t("plan.enAzOdeme")}</span>
                    <strong>{fmt0(finansalSenaryo.requiredMinimum)}</strong>
                  </div>
                  <div>
                    <span>{t("plan.kalan")}</span>
                    <strong>{fmt0(finansalSenaryo.initialDebtBudget)}</strong>
                    <small>{t("plan.kalanNot")}</small>
                  </div>
                  <div>
                    <span>{t("plan.toplamAcik")}</span>
                    <strong>{fmt0(finansalSenaryo.monthlyGap)}</strong>
                    <small>{t("plan.toplamAcikNot")}</small>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <span>{t("plan.onerilenAylik")}</span>
                    <strong>{fmt0(onerilenButce)}</strong>
                  </div>
                  <div>
                    <span>{t("plan.gunluk")}</span>
                    <strong>{fmt0(finansalSenaryo.recommendation.recommendedDailyLiving)}</strong>
                  </div>
                  <div>
                    <span>{t("plan.tahminiSonuc")}</span>
                    <strong>
                      {onerilenSenaryo?.status === "ok"
                        ? ayli("plan.kapanabilir", onerilenSenaryo.months)
                        : ayli("plan.asiyor", finansalSenaryo.months)}
                    </strong>
                  </div>
                </>
              )}
              </div>
              <div className="bt-plan-senaryo-not">
              <strong>{finansalSenaryo.status === "structural_gap" ? t("plan.acikNeden") : t("plan.planNasil")}</strong>
              {finansalSenaryo.status === "structural_gap" ? (
                <span>
                  {t("plan.acikAciklama", {
                    gelir: fmt0(finansalSenaryo.monthlyIncome),
                    taksit: fmt0(finansalSenaryo.fixedMonthly),
                    yasam: fmt0(finansalSenaryo.livingBudget),
                    kalan: fmt0(finansalSenaryo.initialDebtBudget),
                    enAz: fmt0(finansalSenaryo.requiredMinimum),
                    acik: fmt0(finansalSenaryo.monthlyGap),
                  })}
                </span>
              ) : (
                <span>{t(turkiyeKurallariGecerli() ? "plan.planAciklama" : "plan.planAciklamaVergisiz")}</span>
              )}
              </div>
            </details>
            {finansalSenaryo.status === "structural_gap" && (
              <div className="bt-plan-cozum">
                <h3>{t("plan.cozum.baslik")}</h3>
                <p>{t("plan.cozum.amac")}</p>
                <ol className="bt-plan-cozum-adimlar">
                  <li>
                    <b>1</b>
                    <span><strong>{t("plan.cozum.adim1Baslik")}</strong>{" "}{t("plan.cozum.adim1")}</span>
                  </li>
                  {harcamasizKalanAcik > 0 ? (
                    <li>
                      <b>2</b>
                      <span>
                        <strong>{t("plan.cozum.yetersizBaslik")}</strong>{" "}
                        {t("plan.cozum.yetersiz", { tutar: fmt0(harcamasizKalanAcik) })}
                      </span>
                    </li>
                  ) : (
                    <>
                      <li>
                        <b>2</b>
                        <span>
                          <strong>{t("plan.cozum.sinirBaslik", { tutar: fmt0(zorunluOdemelerSonrasiYasamButcesi) })}</strong>{" "}
                          {t("plan.cozum.sinir", { tutar: fmt0(gerekenYasamAzaltimi), yuzde: gerekenAzaltimYuzdesi })}
                        </span>
                      </li>
                      {yuzdeOtuzSenaryosu?.monthlyGap > 0 && gerekenAzaltimYuzdesi > 30 && (
                        <li>
                          <b>3</b>
                          <span>
                            <strong>{t("plan.cozum.otuzBaslik")}</strong>
                            {t("plan.cozum.otuz", {
                              butce: fmt0(yuzdeOtuzSenaryosu.livingBudget),
                              acik: fmt0(yuzdeOtuzSenaryosu.monthlyGap),
                            })}
                          </span>
                        </li>
                      )}
                    </>
                  )}
                </ol>
                <div className="bt-plan-cozum-actions">
                  <button className="bt-btn birincil" type="button" onClick={() => setSekme("harcamalar")}>
                    {t("plan.harcamalariIncele")} <ChevronRight size={16} />
                  </button>
                  <button className="bt-btn ikincil" type="button" onClick={() => setSekme("odemeler")}>
                    {t("plan.zorunluAc")}
                  </button>
                </div>
              </div>
            )}
            {finansalSenaryo.spendingScenarios?.length > 1 && (
              <details className="bt-plan-detay">
                <summary>{t("plan.senaryoKarsilastir")}</summary>
                <div className="bt-plan-senaryo-grid">
                  {finansalSenaryo.spendingScenarios.slice(1).map((scenario) => (
                    <div key={scenario.reductionRate}>
                      <span>{t("plan.senaryo.azalirsa", { yuzde: Math.round(scenario.reductionRate * 100) })}</span>
                      <strong>{t("plan.senaryo.aylikButce", { tutar: fmt0(scenario.livingBudget) })}</strong>
                      <small>
                        {scenario.status === "ok"
                          ? ayli("plan.senaryo.kapanir", scenario.months, { faiz: fmt0(scenario.totalInterest) })
                          : scenario.status === "long_horizon"
                            ? t("plan.senaryo.altmis")
                            : t("plan.senaryo.acik", { tutar: fmt0(scenario.monthlyGap) })}
                      </small>
                    </div>
                  ))}
                </div>
              </details>
            )}
            {finansalSenaryo.status !== "structural_gap" && (
              <div className="bt-plan-senaryo-actions">
                <button className="bt-btn birincil" type="button" onClick={() => setSekme("harcamalar")}>
                  {t("plan.harcamalariIncele")} <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        ) : finansalSenaryo.status === "ok" ? (
          <>
            <div className="bt-plan-senaryo-grid">
              <div><span>{t("plan.aylikGelir")}</span><strong>{fmt0(finansalSenaryo.monthlyIncome)}</strong></div>
              <div><span>{t("plan.sabitTaksit")}</span><strong>{fmt0(finansalSenaryo.fixedMonthly)}</strong></div>
              <div><span>{t("plan.yasamHarcamasi")}</span><strong>{fmt0(finansalSenaryo.livingBudget)}</strong></div>
              <div><span>{t("plan.mevcutPlan")}</span><strong>{ayli("plan.yaklasik", finansalSenaryo.months)}</strong></div>
              <div>
                <span>{t("plan.hedefle")}</span>
                <strong>{onerilenSenaryo?.status === "ok" ? ayli("plan.yaklasik", onerilenSenaryo.months) : "—"}</strong>
              </div>
              <div>
                <span>{t("plan.onerilenYasam")}</span>
                <strong>{onerilenSenaryo?.status === "ok" ? fmt0(onerilenButce) : fmt0(finansalSenaryo.livingBudget)}</strong>
              </div>
            </div>
            <div className="bt-plan-senaryo-not">
              <strong>{kazanilanAy > 0 ? ayli("plan.erken", kazanilanAy) : t("plan.sartlar")}</strong>
              <span>{t("plan.sartlarMetin")}</span>
            </div>
            {finansalSenaryo.spendingScenarios?.length > 1 && (
              <div className="bt-plan-senaryo-grid">
                {finansalSenaryo.spendingScenarios.slice(1).map((scenario) => (
                  <div key={scenario.reductionRate}>
                    <span>{t("plan.senaryo.azalirsa", { yuzde: Math.round(scenario.reductionRate * 100) })}</span>
                    <strong>{t("plan.senaryo.yasamButcesi", { tutar: fmt0(scenario.livingBudget) })}</strong>
                    <small>
                      {scenario.status === "ok"
                        ? ayli("plan.senaryo.kapanir", scenario.months, { faiz: fmt0(scenario.totalInterest) })
                        : scenario.status === "long_horizon"
                          ? t("plan.senaryo.altmis")
                          : t("plan.senaryo.acikGider", { tutar: fmt0(scenario.monthlyGap) })}
                    </small>
                  </div>
                ))}
              </div>
            )}
            {onerilenSenaryo?.status === "ok" && (
              <div className="bt-plan-senaryo-actions">
                <button className="bt-btn birincil" type="button" onClick={() => setSekme("harcamalar")}>
                  {t("plan.harcamalariIncele")} <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="bt-plan-senaryo-actions">
            <button
              className="bt-btn birincil"
              type="button"
              onClick={() => setSekme(finansalSenaryo.status === "missing_income" ? "gelir" : "borclar")}
            >
              {finansalSenaryo.status === "missing_income" ? t("plan.gelirEkle") : t("plan.kayitlariTamamla")}
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </section>

      <div className="bt-ipucu">
        <Lightbulb size={16} />
        <div>
          <Ceviri
            anahtar="plan.ipucu"
            degerler={{
              cig: <b>{t("plan.cigYontemi")}</b>,
              kartopu: <b>{t("plan.kartopuYontemi")}</b>,
            }}
          />
        </div>
      </div>

      <div className="bt-card">
        <div className="bt-cardhead">
          <div className="bt-h2" style={{ margin: 0 }}>
            <Target size={16} /> {t("plan.siraniz")}
          </div>
          <div className="bt-secici">
            <button
              className={strateji === "cig" ? "aktif" : ""}
              onClick={() => setStrateji("cig")}
            >
              <Flame size={14} color={CORAL} /> {t("plan.cig")}
            </button>
            <button
              className={strateji === "kartopu" ? "aktif" : ""}
              onClick={() => setStrateji("kartopu")}
            >
              <Snowflake size={14} /> {t("plan.kartopu")}
            </button>
          </div>
        </div>

        {doner.length === 0 ? (
          <div className="bt-bos">{t("plan.faizYok")}</div>
        ) : (
          <div className="bt-stack" style={{ gap: 12, marginTop: 22 }}>
            {sirali.map((k, i) => {
              const kartFaizAciklamasi =
                k.tur === "kart" && k.faizTahmini
                  ? k.gecikmis
                    ? k.asgariEksigi > 0
                      ? (k.yapilanOdeme > 0
                          ? t("plan.kart.odemeKaydedildi", { tutar: fmt0(k.yapilanOdeme) })
                          : t("plan.kart.odemeKaydiYok")) +
                        t("plan.kart.asgariEksik", { tutar: fmt0(k.asgariEksigi) })
                      : (k.yapilanOdeme > 0
                          ? t("plan.kart.odemeKaydedildi", { tutar: fmt0(k.yapilanOdeme) })
                          : t("plan.kart.asgariKarsilandi")) +
                        t("plan.kart.kalanBorc", { tutar: fmt0(k.bakiye) })
                    : (k.yapilanOdeme > 0
                        ? t("plan.kart.odemeKaydedildi", { tutar: fmt0(k.yapilanOdeme) })
                        : t("plan.kart.odemeKaydiYok")) +
                      t("plan.kart.vadesiGelmedi")
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
                  <BankaRozeti
                    banka={k.banka}
                    bg={
                      k.tur === "diger"
                        ? "#d8c9a0"
                        : k.tur === "ek"
                          ? CORAL
                          : LIME
                    }
                    rot={ROTASYONLAR[i % ROTASYONLAR.length]}
                    boyut={36}
                  />
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div className="bt-satir-ad">
                      {k.ad}{" "}
                      {i === 0 && (
                        <span style={{ color: "#5D7A2E", fontWeight: 700 }}>
                          {t("plan.onceBunu")}
                        </span>
                      )}
                    </div>
                    <div className="bt-satir-meta">
                      {kartFaizAciklamasi
                        ? kartFaizAciklamasi
                        : t("plan.faizMeta", {
                            oran: k.faiz.toFixed(2),
                            kaynak: k.faizTahmini
                              ? k.gecikmis
                                ? t("plan.tcmbGecikme")
                                : t("plan.tcmb")
                              : k.faizVarsayilan
                              ? ` (${ortalamaEtiketi()})`
                              : "",
                            tutar: fmt0(k.faizTutari),
                          })}
                    </div>
                  </div>
                  <div className="bt-satir-tutar">
                    {fmt(k.bakiye)}
                    {k.paraBirimi && <small style={{ display: "block", fontSize: 11, color: "var(--dim)", fontWeight: 600 }}>{fmt(k.kayitBakiye, k.paraBirimi)}</small>}
                  </div>
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
              {t("plan.disindakiler")}
            </div>
            <div className="bt-stack" style={{ gap: 10 }}>
              {sabit.map((k, i) => (
                <div key={k.id} className="bt-satir" style={{ opacity: 0.75 }}>
                  <BankaRozeti
                    banka={k.banka}
                    bg="#c8c9be"
                    rot={ROTASYONLAR[i % ROTASYONLAR.length]}
                    boyut={36}
                  />
                  <div style={{ flex: 1 }} className="bt-satir-ad">
                    {k.ad}
                  </div>
                  <div className="bt-satir-tutar">
                    {fmt(k.bakiye)}
                    {k.paraBirimi && <small style={{ display: "block", fontSize: 11, color: "var(--dim)", fontWeight: 600 }}>{fmt(k.kayitBakiye, k.paraBirimi)}</small>}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {hedef && (
        <div className="bt-card">
          <div className="bt-h2">{t("plan.ekstra.baslik")}</div>
          <label className="bt-alan" style={{ maxWidth: 240 }}>
            {t("plan.ekstra.alan")}
            <ParaInput
              className="bt-input"
              placeholder={ornekSayiMetni("plan.ekstra.ornek", 5000)}
              value={ekstra}
              onValueChange={setEkstra}
            />
          </label>
          {ekstraTutar > 0 && (
            <div className="bt-ipucu" style={{ marginTop: 16 }}>
              <Target size={16} />
              <div>
                <Ceviri
                  anahtar="plan.ekstra.sonuc"
                  degerler={{ ad: <b>{hedef.ad}</b>, tutar: <b>{fmt0(kurtarilan)}</b> }}
                />
                {ekstraTutar >= hedef.bakiye && (
                  <>
                    {" "}
                    <Ceviri anahtar="plan.ekstra.kapanir" degerler={{ b: <b>{t("plan.ekstra.tamamen")}</b> }} />
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
  const seciliTur = varlikTuru(f.tur || (piyasaDegerlemesiAcik() ? "usd" : "nakit"));
  const formParaBirimi = seciliTur.fon ? "TRY" : paraBirimi(f.paraBirimi).id;
  const seciliKategori = varlikKategorisi(
    seciliTur.kategori || f.kategori || "nakit",
  );
  const kategoriTurleri = kategoriTurIdleri(seciliKategori).map(varlikTuru);
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
    ["tumu", t("varliklar.filtre.tumu")],
    ["nakit", t("varliklar.filtre.nakit")],
    ["doviz", t("varliklar.filtre.doviz")],
    ["emtia", t("varliklar.filtre.emtia")],
    ["kripto", t("varliklar.filtre.kripto")],
    ["bes", t("varliklar.filtre.bes")],
    ["fon", t("varliklar.filtre.fon")],
    ["hisse", t("varliklar.filtre.hisse")],
    ["diger", t("varliklar.filtre.diger")],
  ].filter(([k]) =>
    // TRY disinda yalniz elle girilebilen kategoriler ve kaydi olanlar.
    k === "tumu" ||
    piyasaDegerlemesiAcik() ||
    gorunurVarlikKategorileri().some((kategori) => kategori.id === k) ||
    ozet.kalemler.some((kalem) => (varlikTuru(kalem.tur).kategori || "diger") === k));
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
      throw new Error(t("varliklar.hata.fonKodu"));
    const onbellek = piyasa.prices?.funds?.[temizKod];
    if (onbellek) return onbellek;
    const yanit = await fetch(
      "/api/fund-prices?codes=" + encodeURIComponent(temizKod),
      { headers: { Accept: "application/json" } },
    );
    const sonuc = await yanit.json().catch(() => ({}));
    const bilgi = sonuc?.funds?.[temizKod];
    if (!yanit.ok || !bilgi)
      throw new Error(sonuc?.errors?.[0]?.message || t("varliklar.hata.fonYok"));
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
      setFonHata(hata.message || t("varliklar.hata.fonFiyat"));
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
      throw new Error(piyasaTuru === "US" ? t("varliklar.hata.hisseKoduAbd") : t("varliklar.hata.hisseKoduBist"));
    const onbellek = piyasa.prices?.stocks?.[temizKod];
    if (onbellek) return onbellek;
    const yanit = await fetch(
      "/api/stock-prices?market=" + encodeURIComponent(piyasaTuru) + "&codes=" + encodeURIComponent(temizKod),
      { headers: { Accept: "application/json" } },
    );
    const sonuc = await yanit.json().catch(() => ({}));
    const bilgi = sonuc?.stocks?.[temizKod];
    if (!yanit.ok || !bilgi)
      throw new Error(sonuc?.errors?.[0]?.message || t("varliklar.hata.hisseYok"));
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
      setHisseHata(hata.message || t("varliklar.hata.hisseFiyat"));
    } finally {
      setHisseAraniyor(false);
    }
  }

  async function kaydet(e) {
    e.preventDefault();
    const tur = varlikTuru(f.tur || (piyasaDegerlemesiAcik() ? "usd" : "nakit"));
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
        setFonHata(hata.message || t("varliklar.hata.fonFiyat"));
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
        setHisseHata(hata.message || t("varliklar.hata.hisseFiyat"));
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
      toplamMaliyet: f.toplamMaliyet === "" || f.toplamMaliyet == null ? null : Math.max(+f.toplamMaliyet || 0, 0),
      maliyetBiliniyor: f.toplamMaliyet !== "" && f.toplamMaliyet != null,
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
    const kategori = varlikKategorisi(filtre === "tumu" ? "nakit" : filtre);
    const ilkTur = varlikTuru(kategoriTurIdleri(kategori)[0] || "nakit");
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
    ? new Date(piyasa.updatedAt).toLocaleString(locale(), {
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
          <div className="bt-metric-lbl">{t("varliklar.toplamVarliklar")}</div>
          <div className="bt-varlik-toplam">{fmt(ozet.toplam)}</div>
          <div style={{ color: "#bfc1b4", fontSize: 12, marginTop: 8 }}>
            {t(ozet.kalemler.length === 1 ? "varliklar.kayitOzetiTekil" : "varliklar.kayitOzetiCogul", { n: ozet.kalemler.length })}
          </div>
        </div>
        {piyasaDegerlemesiAcik() && (
          <div className="bt-varlik-mini">
            <div className="bt-metric-lbl">{t("varliklar.otomatikDegerlenen")}</div>
            <strong>{fmt(otomatikToplam)}</strong>
          </div>
        )}
        <div className="bt-varlik-mini">
          <div className="bt-metric-lbl">{t("varliklar.toplamKazancKayip")}</div>
          <strong style={{ color: ozet.kazanc < 0 ? CORAL : LIME }}>
            {ozet.maliyetBilinenKalemSayisi > 0
              ? (ozet.kazanc >= 0 ? "+" : "") + fmt(ozet.kazanc)
              : "—"}
          </strong>
        </div>
      </div>

      {ozet.maliyetEksikKalemSayisi > 0 && (
        <div className="bt-ipucu">
          <Info size={16} />
          <div><b>{t("varliklar.kismiBaslik")}</b> {t("varliklar.kismiMetin", { bilinen: ozet.maliyetBilinenKalemSayisi, toplam: ozet.kalemler.length, eksik: ozet.maliyetEksikKalemSayisi })}</div>
        </div>
      )}

      <div className="bt-card">
        <div className="bt-cardhead" style={{ marginBottom: 0 }}>
          <div>
            <div className="bt-h2" style={{ marginBottom: 5 }}>
              <PiggyBank size={20} /> {t("varliklar.baslik")}
            </div>
            {piyasaDegerlemesiAcik() ? (
              <div className={"bt-varlik-kaynak " + (piyasa.hata ? "hata" : "")}>
                <RefreshCw size={13} />
                {piyasa.yukleniyor
                  ? t("varliklar.fiyatGuncelleniyor")
                  : piyasa.hata ||
                    (fiyatTarihi
                      ? t("varliklar.sonFiyatGuncellemesi", { tarih: fiyatTarihi })
                      : t("varliklar.otomatikFiyatYok"))}
              </div>
            ) : (
              <div className="bt-varlik-kaynak">
                <Info size={13} />
                {t("paraBirimi.varlikUyari", { birim: kullaniciParaBirimi() })}
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {piyasaDegerlemesiAcik() && (
              <button
                type="button"
                className="bt-btn kucuk ikincil"
                onClick={piyasaYenile}
                disabled={piyasa.yukleniyor}
              >
                <RefreshCw size={14} /> {t("varliklar.fiyatlariYenile")}
              </button>
            )}
            {!acik && (
              <>
                <button
                  className="bt-btn kucuk ikincil"
                  onClick={() =>
                    setForm({
                      liste: "assets",
                      veri: { kategori: "nakit", tur: "nakit", paraBirimi: "TRY" },
                    })
                  }
                >
                  <Wallet size={15} /> {t("varliklar.nakitEkle")}
                </button>
                <button
                  className="bt-btn birincil"
                  onClick={() =>
                    setForm({
                      liste: "assets",
                      veri: piyasaDegerlemesiAcik()
                        ? { kategori: "doviz", tur: "usd" }
                        : { kategori: "nakit", tur: "nakit" },
                    })
                  }
                >
                  <Plus size={16} /> {t("varliklar.varlikEkle")}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <nav
        className="bt-nav bt-nav-alt"
        style={{ margin: 0 }}
        aria-label={t("varliklar.turlerAria")}
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
            {f.id ? t("varliklar.form.duzenleBaslik") : t("varliklar.form.yeniBaslik")}
          </div>
          <div className="bt-alanlar">
            <label className="bt-alan">
              <span>{t("varliklar.form.kategori")}</span>
              <select
                className="bt-input"
                value={seciliKategori.id}
                onChange={(e) => {
                  const kategori = varlikKategorisi(e.target.value);
                  const ilkTurId = kategoriTurIdleri(kategori)[0];
                  fSet({
                    kategori: kategori.id,
                    tur: ilkTurId,
                    ad: "",
                    miktar: "",
                    guncelDeger: "",
                    fonKodu: "",
                    fonBirimFiyati: "",
                    besToplamTutar: "",
                    hisseKodu: "",
                    hisseBirimFiyati: "",
                    hisseParaBirimi: "",
                    paraBirimi: varlikTuru(ilkTurId).kripto && varlikTuru(ilkTurId).coinId ? "USD" : f.paraBirimi || "TRY",
                  });
                  setFonHata("");
                  setHisseHata("");
                }}
              >
                {gorunurVarlikKategorileri().map((kategori) => (
                  <option key={kategori.id} value={kategori.id}>
                    {tDeger(kategori.ad)}
                  </option>
                ))}
              </select>
            </label>
            <label className="bt-alan">
              <span>{t("varliklar.form.turEtiketi", { kategori: tDeger(seciliKategori.ad) })}</span>
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
                    {tDeger(tur.ad)}
                  </option>
                ))}
              </select>
            </label>
            {seciliTur.fon && (
              <label className="bt-alan">
                <span>{t("varliklar.form.fonKodu", { kaynak: seciliTur.kaynak })}</span>
                <div style={{ display: "flex", gap: 8, minWidth: 0 }}>
                  <input
                    className="bt-input"
                    style={{ minWidth: 0, flex: 1, textTransform: "uppercase" }}
                    required
                    maxLength={8}
                    value={f.fonKodu || ""}
                    placeholder={seciliTur.id === "bes" ? t("varliklar.form.ornekBes") : t("varliklar.form.ornekFon")}
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
                    <RefreshCw size={14} /> {fonAraniyor ? t("varliklar.form.araniyor") : t("varliklar.form.fiyatiBul")}
                  </button>
                </div>
              </label>
            )}
            {seciliTur.hisse && (
              <label className="bt-alan">
                <span>{seciliTur.piyasa === "US" ? t("varliklar.form.abdHisseKodu") : t("varliklar.form.bistHisseKodu")}</span>
                <div style={{ display: "flex", gap: 8, minWidth: 0 }}>
                  <input
                    className="bt-input"
                    style={{ minWidth: 0, flex: 1, textTransform: "uppercase" }}
                    required
                    maxLength={10}
                    value={f.hisseKodu || ""}
                    placeholder={seciliTur.piyasa === "US" ? t("varliklar.form.ornekAbd") : t("varliklar.form.ornekBist")}
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
                    <RefreshCw size={14} /> {hisseAraniyor ? t("varliklar.form.araniyor") : t("varliklar.form.fiyatiBul")}
                  </button>
                </div>
              </label>
            )}
            {seciliTur.kripto && seciliTur.coinId && (
              <label className="bt-alan">
                <span>{t("varliklar.form.guncelKriptoFiyati", { birim: seciliTur.birim, para: formParaBirimi })}</span>
                <input
                  className="bt-input"
                  readOnly
                  value={seciliKriptoFiyati > 0 ? fmtPara(seciliKriptoFiyati, formParaBirimi) : t("varliklar.form.fiyatYukleniyor")}
                />
              </label>
            )}
            {(seciliTur.id === "diger" || seciliTur.id === "kripto_diger") && <label className="bt-alan">
              <span>{t("varliklar.form.varlikAdi")}</span>
              <input
                className="bt-input"
                value={f.ad || ""}
                placeholder={tDeger(seciliTur.ad)}
                onChange={(e) => fSet({ ad: e.target.value })}
              />
            </label>}
            {seciliTur.fon ? (
              <label className="bt-alan">
                <span>{t("varliklar.form.fonTamAdi")}</span>
                <input
                  className="bt-input"
                  readOnly
                  value={f.ad || ""}
                  placeholder={t("varliklar.form.fonAdiIpucu")}
                />
              </label>
            ) : (
              <label className="bt-alan">
                <span>{t("varliklar.form.bankaKurum")}</span>
                <input
                  className="bt-input"
                  value={f.kurum || ""}
                  placeholder={t("varliklar.form.ornekKurum")}
                  onChange={(e) => fSet({ kurum: e.target.value })}
                />
              </label>
            )}
            {!seciliTur.fon && piyasaDegerlemesiAcik() && <label className="bt-alan">
              <span>{t("varliklar.form.paraBirimi")}</span>
              <select className="bt-input" value={formParaBirimi} onChange={(e) => fSet({ paraBirimi: e.target.value })}>
                {PARA_BIRIMLERI.map((birim) => <option key={birim.id} value={birim.id}>{tDeger(birim.ad)}</option>)}
              </select>
            </label>}
            {seciliTur.fon && (
              <label className="bt-alan">
                <span>{t("varliklar.form.sonPayFiyati")}</span>
                <input
                  className="bt-input"
                  readOnly
                  value={f.fonBirimFiyati ? fmtBirim(f.fonBirimFiyati) : t("varliklar.form.fiyatiBulaBasin")}
                />
              </label>
            )}
            {seciliTur.hisse && (
              <label className="bt-alan">
                <span>{t("varliklar.form.sonHisseFiyati", { para: f.hisseParaBirimi || (seciliTur.piyasa === "US" ? "USD" : "₺") })}</span>
                <input
                  className="bt-input"
                  readOnly
                  value={f.hisseBirimFiyati
                    ? (f.hisseParaBirimi && f.hisseParaBirimi !== "TRY" ? fmtPara(f.hisseBirimFiyati, f.hisseParaBirimi) : fmtBirim(f.hisseBirimFiyati))
                    : t("varliklar.form.fiyatiBulaBasin")}
                />
              </label>
            )}
            {seciliTur.id === "bes" ? (
              <>
                <label className="bt-alan">
                  <span>{t("varliklar.form.besToplam")}</span>
                  <ParaInput
                    className="bt-input"
                    required
                    value={f.besToplamTutar ?? (f.miktar && f.fonBirimFiyati ? +f.miktar * +f.fonBirimFiyati : "")}
                    onValueChange={(value) => fSet({ besToplamTutar: value })}
                  />
                </label>
                <label className="bt-alan">
                  <span>{t("varliklar.form.tahminiPayAdedi")}</span>
                  <input
                    className="bt-input"
                    readOnly
                    value={besPayAdedi > 0 ? t("varliklar.form.payAdediDeger", { n: besPayAdedi.toLocaleString(locale(), { maximumFractionDigits: 6 }) }) : t("varliklar.form.payHesaplanacak")}
                  />
                </label>
              </>
            ) : seciliTur.otomatik ? (
              <label className="bt-alan">
                <span>{seciliTur.fon ? t("varliklar.form.payAdedi") : seciliTur.hisse ? t("varliklar.form.hisseAdedi") : t("varliklar.form.miktar", { birim: tDeger(seciliTur.birim) })} *</span>
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
                <span>{t("varliklar.form.guncelToplamDeger", { para: formParaBirimi })}</span>
                <ParaInput
                  className="bt-input"
                  required
                  value={f.guncelDeger ?? ""}
                  onValueChange={(value) => fSet({ guncelDeger: value })}
                />
              </label>
            )}
            <label className="bt-alan">
              <span>{t("varliklar.form.alisMaliyeti", { para: formParaBirimi })}</span>
              <ParaInput
                className="bt-input"
                value={f.maliyetBiliniyor === true ? f.toplamMaliyet ?? "" : ""}
                onValueChange={(value) => fSet({ toplamMaliyet: value })}
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
                    <b>{f.ad || f.fonKodu}</b> · {t("varliklar.form.sonPayFiyatiDeger", { fiyat: fmtBirim(f.fonBirimFiyati) })} · {f.fonKaynagi || seciliTur.kaynak}
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
                    <b>{f.ad || f.hisseKodu}</b> · {t("varliklar.form.hisseSonFiyat", { fiyat: fmtBirim(f.hisseBirimFiyati) })}
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
                  ? t("varliklar.form.ipucuFon", { kaynak: seciliTur.kaynak })
                  : seciliTur.hisse
                    ? t("varliklar.form.ipucuHisse")
                  : seciliTur.tahmini
                  ? t("varliklar.form.ipucuTahmini", { ad: tDeger(seciliTur.ad) })
                  : t("varliklar.form.ipucuOtomatik", { ad: tDeger(seciliTur.ad) })}
              </div>
            </div>
          )}
          {(seciliTur.fon || seciliTur.hisse || (seciliTur.kripto && seciliTur.coinId)) && gosterimMiktari > 0 &&
            seciliOtomatikBirimFiyati > 0 && (
              <div className="bt-card" style={{ marginTop: 14, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", fontSize: 13 }}>
                  <span>{t("varliklar.form.guncelYaklasikDeger")}</span>
                  <strong>{fmtPara(gosterimMiktari * seciliGosterimBirimFiyati, formParaBirimi)}</strong>
                </div>
                {+f.toplamMaliyet > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", fontSize: 13, marginTop: 7, color: (+f.miktar || 0) * seciliGosterimBirimFiyati - (+f.toplamMaliyet || 0) >= 0 ? "#5D7A2E" : CORAL }}>
                    <span>{t("varliklar.form.tahminiKarZarar")}</span>
                    <strong>{fmtPara(gosterimMiktari * seciliGosterimBirimFiyati - (+f.toplamMaliyet || 0), formParaBirimi)}</strong>
                  </div>
                )}
              </div>
            )}
          <div className="bt-form-butonlar">
            <button className="bt-btn birincil" type="submit">
              <Check size={15} /> {t("ortak.kaydet")}
            </button>
            <button
              className="bt-btn ikincil"
              type="button"
              onClick={() => setForm(null)}
            >
              {t("ortak.vazgec")}
            </button>
          </div>
        </form>
      )}

      {ozet.kalemler.length === 0 && !acik ? (
        <div className="bt-card bt-bos" style={{ display: "grid", justifyItems: "center", gap: 14 }}>
          {t("varliklar.bos.hic")}
          <button className="bt-btn birincil" type="button" onClick={bosKategoriEkle}><Plus size={15} /> {t("varliklar.varlikEkle")}</button>
        </div>
      ) : gorunenKalemler.length === 0 && !acik ? (
        <div className="bt-card bt-bos" style={{ display: "grid", justifyItems: "center", gap: 14 }}>
          {t("varliklar.bos.kategori")}
          <button className="bt-btn birincil" type="button" onClick={bosKategoriEkle}>
            <Plus size={15} /> {filtre === "nakit" ? t("varliklar.nakitEkle") : filtre === "hisse" ? t("varliklar.hisseEkle") : filtre === "fon" ? t("varliklar.fonEkle") : filtre === "kripto" ? t("varliklar.kriptoEkle") : t("varliklar.varlikEkle")}
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
                k.maliyetBiliniyor === true
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
                        : tDeger(tur.birim) || tDeger(tur.ad).slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 170 }}>
                    <div className="bt-satir-ad">{tDeger(k.ad || tur.ad)}</div>
                    <div className="bt-satir-meta">
                      {k.kurum ? k.kurum + " · " : ""}
                      {tur.fon && k.fonKodu ? k.fonKodu + " · " : ""}
                      {tur.hisse && k.hisseKodu ? k.hisseKodu + " · " : ""}
                      {tur.otomatik
                        ? (+k.miktar || 0).toLocaleString(locale(), {
                            maximumFractionDigits:
                              tur.kategori === "kripto"
                                ? 8
                                : tur.fon || k.tur === "bes"
                                  ? 2
                                  : 4,
                          }) +
                          " " +
                          tDeger(tur.birim)
                        : tDeger(tur.ad)}
                    </div>
                    {tur.otomatik && (
                      <div className="bt-satir-meta">
                        {birimFiyat > 0
                          ? t("varliklar.satir.birimFiyat", {
                              fiyat: tur.fon || tur.hisse
                                ? (tur.hisse && k.hisseParaBirimi && k.hisseParaBirimi !== "TRY"
                                  ? fmtPara(birimFiyat, k.hisseParaBirimi)
                                  : fmtBirim(birimFiyat))
                                : fmt(birimFiyat),
                            }) +
                            (tur.hisse
                              ? " · " + t("varliklar.satir.gecikmeli")
                              : tur.fon
                              ? " · " +
                                (piyasa.prices?.funds?.[k.fonKodu]?.source ||
                                  k.fonKaynagi ||
                                  tur.kaynak)
                              : tur.tahmini
                                ? " · " + t("varliklar.satir.yaklasik")
                                : " · " + t("varliklar.satir.otomatikEk"))
                          : t("varliklar.satir.manuelYedek")}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="bt-satir-tutar">
                      {/* Fiyati hic alinamamis otomatik varlikta 0 TL yaziyorduk;
                          kullanici bunu "varligim degersiz" diye okuyor. */}
                      {tur.otomatik && !birimFiyat ? t("varliklar.satir.fiyatAlinamadi") : fmt(k.hesaplananDeger)}
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
                    {tur.otomatik ? t("varliklar.satir.otomatik") : t("varliklar.satir.manuel")}
                  </span>
                  <div style={{ display: "flex", gap: 2 }}>
                    <button
                      className="bt-btn hayalet"
                      title={t("ortak.duzenle")}
                      onClick={() => setForm({ liste: "assets", veri: k })}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      className="bt-btn hayalet tehlike"
                      title={t("ortak.sil")}
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
            <BarChart3 size={19} /> {t("varliklar.dagilim")}
          </div>
          <div className="bt-varlik-dagilim">
            {dagilim.map(([ad, tutar]) => (
              <div className="bt-varlik-dagilim-satir" key={ad}>
                <span>{tDeger(ad)}</span>
                <div className="bt-varlik-dagilim-bar">
                  <div
                    style={{
                      width:
                        Math.max(2, (tutar / Math.max(ozet.toplam, 1)) * 100) +
                        "%",
                    }}
                  />
                </div>
                <strong className="bt-mono">{t("varliklar.yuzde", { n: Math.round((tutar / ozet.toplam) * 100) })}</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      {silinecek && (
        <div className="bt-modal-arka" role="presentation">
          <div className="bt-modal" role="dialog" aria-modal="true">
            <div className="bt-h2">{t("varliklar.silBaslik")}</div>
            <p style={{ color: "var(--dim)", fontSize: 13, lineHeight: 1.6 }}>
              <Ceviri anahtar="varliklar.silMetin" degerler={{ ad: <b style={{ color: "var(--text)" }}>{tDeger(silinecek.ad)}</b> }} />
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
                <Trash2 size={14} /> {t("varliklar.evetSil")}
              </button>
              <button
                className="bt-btn ikincil"
                onClick={() => setSilinecek(null)}
              >
                {t("ortak.vazgec")}
              </button>
            </div>
          </div>
        </div>
      )}
      {digerPenceresi && (
        <div className="bt-modal-arka" role="presentation">
          <div className="bt-modal" role="dialog" aria-modal="true" aria-labelledby="diger-varlik-baslik">
            <div className="bt-h2" id="diger-varlik-baslik">
              {digerPopupTuru === "kripto_diger" ? t("varliklar.diger.kriptoBaslik") : t("varliklar.diger.baslik")}
            </div>
            <p style={{ color: "var(--dim)", fontSize: 13, lineHeight: 1.6 }}>
              {digerPopupTuru === "kripto_diger"
                ? t("varliklar.diger.kriptoAciklama")
                : t("varliklar.diger.aciklama")}
            </p>
            <div className="bt-alanlar" style={{ marginTop: 14 }}>
              <label className="bt-alan">
                <span>{t("varliklar.diger.varlikAdi")}</span>
                <input className="bt-input" autoFocus value={digerFormu.ad} placeholder={t("varliklar.diger.ornekAd")} onChange={(e) => setDigerFormu((eski) => ({ ...eski, ad: e.target.value }))} />
              </label>
              <label className="bt-alan">
                <span>{t("varliklar.diger.kurumNot")}</span>
                <input className="bt-input" value={digerFormu.kurum} placeholder={t("varliklar.diger.ornekKurum")} onChange={(e) => setDigerFormu((eski) => ({ ...eski, kurum: e.target.value }))} />
              </label>
              <label className="bt-alan">
                <span>{t("varliklar.diger.guncelDeger", { para: paraBirimi(digerFormu.paraBirimi).id })}</span>
                <ParaInput className="bt-input" value={digerFormu.guncelDeger} onValueChange={(value) => setDigerFormu((eski) => ({ ...eski, guncelDeger: value }))} />
              </label>
              <label className="bt-alan">
                <span>{t("varliklar.form.paraBirimi")}</span>
                <select className="bt-input" value={paraBirimi(digerFormu.paraBirimi).id} onChange={(e) => setDigerFormu((eski) => ({ ...eski, paraBirimi: e.target.value }))}>
                  {PARA_BIRIMLERI.map((birim) => <option key={birim.id} value={birim.id}>{tDeger(birim.ad)}</option>)}
                </select>
              </label>
            </div>
            {digerHata && <div className="bt-ipucu" style={{ marginTop: 14, borderColor: CORAL }}><AlertTriangle size={16} />{digerHata}</div>}
            <div className="bt-form-butonlar">
              <button className="bt-btn birincil" type="button" onClick={() => {
                if (!digerFormu.ad.trim() || !(+digerFormu.guncelDeger > 0)) {
                  setDigerHata(t("varliklar.hata.digerEksik"));
                  return;
                }
                fSet({ tur: digerPopupTuru, ad: digerFormu.ad.trim(), kurum: digerFormu.kurum.trim(), guncelDeger: digerFormu.guncelDeger, paraBirimi: digerFormu.paraBirimi });
                setDigerPenceresi(false);
              }}><Check size={15} /> {t("ortak.ekle")}</button>
              <button className="bt-btn ikincil" type="button" onClick={() => { fSet({ tur: digerPopupTuru === "kripto_diger" ? "bitcoin" : "mevduat" }); setDigerPenceresi(false); }}>{t("ortak.vazgec")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Gelirler ---------------- */
function Gelirler({ veri, form, setForm, ekleGuncelle, sil, buAyGelir, sabit = false }) {
  const acik = form && form.liste === "incomes";
  const [f, setF] = useState({});
  useEffect(() => {
    if (acik) setF({ ...(sabit ? { tekrar: "Her ay" } : {}), ...(form.veri || {}) });
  }, [acik, form, sabit]);
  const gorunenGelirler = useMemo(
    () =>
      (veri.incomes || []).filter((gelir) =>
        sabit ? gelir.tekrar !== "Tek seferlik" : true,
      ),
    [veri.incomes, sabit],
  );
  const kaynaklar = Object.entries(buAyGelir.kaynaklar).sort(
    (a, b) => b[1] - a[1],
  );
  const enBuyuk = Math.max(...Object.values(buAyGelir.kaynaklar), 1);

  const alanlar = [
    { k: "ad", e: t("gelirGider.gelir.kaynakAdi"), t: "text", z: true },
    { k: "tutar", e: t("gelirGider.tutarTl"), t: "number", z: true, para: true },
    {
      k: "tekrar",
      e: t("gelirGider.gelir.tekrar"),
      t: "select",
      options: ["Her ay", "Tek seferlik"],
    },
    { k: "tarih", e: t("gelirGider.gelir.tarihTekSeferlik"), t: "date" },
  ];
  function gonder() {
    for (const a of alanlar) if (a.z && !String(f[a.k] ?? "").trim()) return;
    ekleGuncelle("incomes", {
      id: f.id || uid(),
      ...f,
      ...(sabit ? { tekrar: "Her ay", tarih: "" } : {}),
    });
  }

  return (
    <div className="bt-stack">
      <div className="bt-card">
        <div className="bt-cardhead">
          <div className="bt-h2" style={{ margin: 0 }}>
            <TrendingUp size={16} /> {sabit ? t("gelirGider.gelir.sabitBaslik") : t("gelirGider.gelir.baslik")}
          </div>
          {!acik && (
            <button
              className="bt-btn kucuk ikincil"
              onClick={() => setForm({ liste: "incomes", veri: {} })}
            >
              <Plus size={14} /> {t("ortak.ekle")}
            </button>
          )}
        </div>
        <div style={{ fontSize: 12.5, color: "var(--dim)", marginBottom: 16 }}>
          {sabit
            ? t("gelirGider.gelir.sabitAciklama")
            : t("gelirGider.gelir.aciklama")}
        </div>
        {acik && (
          <div className="bt-form">
            <div className="bt-alanlar">
              {alanlar.filter((a) => !(sabit && ["tekrar", "tarih"].includes(a.k))).map((a) => (
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
                          {tDeger(o)}
                        </option>
                      ))}
                    </select>
                  ) : a.para ? (
                    <ParaInput
                      className="bt-input"
                      value={f[a.k] ?? ""}
                      onValueChange={(value) => setF({ ...f, [a.k]: value })}
                    />
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
                <Check size={14} /> {f.id ? t("ortak.guncelle") : t("ortak.kaydet")}
              </button>
              <button className="bt-btn ikincil" onClick={() => setForm(null)}>
                {t("ortak.vazgec")}
              </button>
            </div>
          </div>
        )}
        {gorunenGelirler.length === 0 && !acik ? (
          <div className="bt-bos">{t("gelirGider.gelir.bos")}</div>
        ) : (
          <div className="bt-stack" style={{ gap: 12 }}>
            {gorunenGelirler.map((g, i) => (
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
                      ? t("gelirGider.gelir.tekSeferlik") +
                        (g.tarih
                          ? " · " + isoTarihGoster(g.tarih)
                          : "")
                      : t("gelirGider.gelir.herAyTekrarlaniyor")}
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
            <PieChart size={16} /> {t("gelirGider.gelir.dagilim")}
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
  ekleGuncelle,
  harcamaKaydet,
  sil,
  buAyHarcama,
  bankalar,
  kredilereGit,
  sabit = false,
}) {
  const acik = form && form.liste === "expenses";
  const [f, setF] = useState({});
  const [gorunenAy, setGorunenAy] = useState(ayAnahtari());
  const [kaynakEklemeTuru, setKaynakEklemeTuru] = useState("");
  const [kaynakFormu, setKaynakFormu] = useState({
    banka: "",
    ozelBanka: "",
    ad: "",
    kesimGunu: "",
    sonOdemeGunu: "",
    kartSon4: "",
    limit: "",
    bakiye: "",
  });
  const [kaynakHatasi, setKaynakHatasi] = useState("");
  useEffect(() => {
    if (acik) {
      setF(
        form.veri.id
          ? form.veri
          : {
              tarih: yerelTarihDegeri(),
              kategori: "Market",
              ...(sabit ? { tekrar: "Her ay" } : {}),
              ...form.veri,
            },
      );
    }
  }, [acik, form, sabit]);
  useEffect(() => {
    if (!acik) {
      setKaynakEklemeTuru("");
      setKaynakHatasi("");
    }
  }, [acik]);
  useEffect(() => {
    if (!f.id) return;
    const frame = requestAnimationFrame(() => {
      document
        .getElementById(`harcama-editor-${f.id}`)
        ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
    return () => cancelAnimationFrame(frame);
  }, [f.id]);

  const sirali = useMemo(
    () =>
      [...veri.expenses]
        .filter((h) => sabit ? h.tekrar === "Her ay" : h.tekrar !== "Her ay")
        .sort((a, b) => (b.tarih || "").localeCompare(a.tarih || "")),
    [veri.expenses, sabit],
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
    () => sabit ? sirali : sirali.filter((h) => (h.tarih || "").slice(0, 7) === gorunenAy),
    [sirali, gorunenAy, sabit],
  );
  const sabitToplam = useMemo(
    () => sirali.reduce((toplam, h) => toplam + (+h.tutar || 0), 0),
    [sirali],
  );
  const otomatikBorcOdemeleri = useMemo(
    () => (sabit ? duzenliBorcOdemeleri(veri.loans, bugun()) : []),
    [veri.loans, sabit],
  );
  const buAyOtomatikBorcToplami = useMemo(
    () => (sabit ? buAyDuzenliBorcToplami(veri.loans, bugun()) : 0),
    [veri.loans, sabit],
  );
  const enBuyuk = Math.max(...Object.values(buAyHarcama.kategoriler), 1);
  const harcamaKaynaklari = useMemo(
    () => harcamaKaynaklariniOlustur(veri),
    [veri.cards, veri.assets],
  );
  const tumHarcamaKaynaklari = [
    ...harcamaKaynaklari.kartlar,
    ...harcamaKaynaklari.hesaplar,
  ];
  const seciliKart = f.kaynakId && f.kaynakTuru === "card"
    ? veri.cards.find((kart) => kart.id === f.kaynakId)
    : veri.cards.find(
        (kart) => kart.banka + " · " + (kart.ad || "Kredi kartı") === f.kaynak,
      );
  const seciliEkstreAyi = seciliKart
    ? statementPeriodForTransaction(f.tarih, seciliKart.kesimGunu)
    : "";

  function kaynakEklemeAc(tur) {
    setKaynakEklemeTuru(tur);
    setKaynakFormu({
      banka: "",
      ozelBanka: "",
      ad: tur === "account" ? t("gelirGider.kaynak.vadesizHesap") : "",
      kesimGunu: "",
      sonOdemeGunu: "",
      kartSon4: "",
      limit: "",
      bakiye: "",
    });
    setKaynakHatasi("");
  }

  function kaynakEklemeKapat() {
    setKaynakEklemeTuru("");
    setKaynakHatasi("");
  }

  function hizliKaynakKaydet() {
    const banka = (kaynakFormu.banka === "__other__"
      ? kaynakFormu.ozelBanka
      : kaynakFormu.banka).trim();
    const ad = kaynakFormu.ad.trim();
    if (!banka || !ad) {
      setKaynakHatasi(t("gelirGider.kaynak.hataBankaAd"));
      return;
    }
    if (kaynakEklemeTuru === "card") {
      const kesimGunu = Number(kaynakFormu.kesimGunu);
      if (!Number.isInteger(kesimGunu) || kesimGunu < 1 || kesimGunu > 31) {
        setKaynakHatasi(t("gelirGider.kaynak.hataKesimGunu"));
        return;
      }
      const sonOdemeGunu = kaynakFormu.sonOdemeGunu === ""
        ? ""
        : Number(kaynakFormu.sonOdemeGunu);
      if (sonOdemeGunu !== "" && (!Number.isInteger(sonOdemeGunu) || sonOdemeGunu < 1 || sonOdemeGunu > 31)) {
        setKaynakHatasi(t("gelirGider.kaynak.hataSonOdemeGunu"));
        return;
      }
      const kartSon4 = kaynakFormu.kartSon4.trim();
      if (kartSon4 && !/^\d{4}$/.test(kartSon4)) {
        setKaynakHatasi(t("gelirGider.kaynak.hataSon4"));
        return;
      }
      const kart = {
        id: uid(),
        banka,
        ad,
        kartSon4,
        limit: Math.max(Number(kaynakFormu.limit) || 0, 0),
        kesimGunu,
        sonOdemeGunu,
        ekstreAyi: ayAnahtari(),
        yeniDonemEkstreBorcu: 0,
        oncekiAydanKalan: 0,
        toplamEkstreBorcu: 0,
        yapilanOdeme: 0,
        ekstreGecmisi: [],
      };
      ekleGuncelle("cards", kart, { formuKoru: true });
      setF((eski) => ({
        ...eski,
        kaynak: `${banka} · ${ad}`,
        kaynakId: kart.id,
        kaynakTuru: "card",
      }));
    } else {
      const hesap = {
        id: uid(),
        kategori: "nakit",
        tur: "mevduat",
        kurum: banka,
        ad,
        paraBirimi: "TRY",
        guncelDeger: Math.max(Number(kaynakFormu.bakiye) || 0, 0),
        toplamMaliyet: null,
        maliyetBiliniyor: false,
        guncellenmeTarihi: new Date().toISOString(),
      };
      ekleGuncelle("assets", hesap, { formuKoru: true });
      setF((eski) => ({
        ...eski,
        kaynak: `${banka} · ${ad}`,
        kaynakId: hesap.id,
        kaynakTuru: "account",
      }));
    }
    kaynakEklemeKapat();
  }

  function gonder() {
    if (!f.tutar || !f.tarih) return;
    const taksitSayisi = seciliKart
      ? Math.min(Math.max(parseInt(f.taksitSayisi) || 1, 1), 60)
      : 1;
    const kayit = {
      id: f.id || uid(),
      ...f,
      tutar: +f.tutar,
      taksitSayisi,
      ...(sabit ? { tekrar: "Her ay" } : { tekrar: "Tek seferlik" }),
    };
    if (seciliEkstreAyi) kayit.ekstreAyi = seciliEkstreAyi;
    else delete kayit.ekstreAyi;
    harcamaKaydet(kayit, false);
  }

  const harcamaFormu = (
    <div className="bt-form">
      <div className="bt-alanlar">
        <label className="bt-alan">
          {t("gelirGider.tutarTl")} *
          <ParaInput
            className="bt-input"
            value={f.tutar ?? ""}
            onValueChange={(value) => setF({ ...f, tutar: value })}
          />
        </label>
        <label className="bt-alan">
          {sabit ? t("gelirGider.harcama.baslangicTarihi") : t("ortak.tarih")} *
          <input
            className="bt-input"
            type="date"
            value={f.tarih ?? ""}
            onChange={(e) => setF({ ...f, tarih: e.target.value })}
          />
        </label>
        <label className="bt-alan">
          {t("gelirGider.harcama.odemeKaynagi")}
          <select
            className="bt-input"
            value={harcamaKaynagiSecimDegeri(f, harcamaKaynaklari)}
            onChange={(e) => {
              if (e.target.value === "action:add-card") {
                kaynakEklemeAc("card");
                return;
              }
              if (e.target.value === "action:add-account") {
                kaynakEklemeAc("account");
                return;
              }
              if (e.target.value === "cash") {
                setF({ ...f, kaynak: "Nakit", kaynakId: undefined, kaynakTuru: undefined });
                return;
              }
              const kaynak = tumHarcamaKaynaklari.find(
                (secenek) => secenek.secimDegeri === e.target.value,
              );
              setF({
                ...f,
                kaynak: kaynak?.kayitEtiketi || "",
                kaynakId: kaynak?.id,
                kaynakTuru: kaynak?.tur,
              });
            }}
          >
            <option value="">{t("gelirGider.harcama.secin")}</option>
            <option value="cash">{t("gelirGider.harcama.nakit")}</option>
            <optgroup label={t("gelirGider.harcama.krediKartlari")}>
              {harcamaKaynaklari.kartlar.length > 0 ? (
                harcamaKaynaklari.kartlar.map((kaynak) => (
                  <option key={kaynak.id} value={kaynak.secimDegeri}>
                    {kaynak.gorunenEtiket}
                  </option>
                ))
              ) : (
                <option disabled>{t("gelirGider.harcama.kartYok")}</option>
              )}
            </optgroup>
            <optgroup label={t("gelirGider.harcama.bankaHesabi")}>
              {harcamaKaynaklari.hesaplar.length > 0 ? (
                harcamaKaynaklari.hesaplar.map((kaynak) => (
                  <option key={kaynak.id} value={kaynak.secimDegeri}>
                    {kaynak.gorunenEtiket}
                  </option>
                ))
              ) : (
                <option disabled>{t("gelirGider.harcama.hesapYok")}</option>
              )}
            </optgroup>
            <optgroup label={t("gelirGider.harcama.yeniKaynak")}>
              <option value="action:add-card">{t("gelirGider.harcama.kartEkle")}</option>
              <option value="action:add-account">{t("gelirGider.harcama.hesapEkle")}</option>
            </optgroup>
          </select>
        </label>
        <label className="bt-alan">
          {t("gelirGider.harcama.kategori")}
          <select
            className="bt-input"
            value={f.kategori ?? "Market"}
            onChange={(e) => setF({ ...f, kategori: e.target.value })}
          >
            {KATEGORILER.map((k) => (
              <option key={k} value={k}>{tDeger(k)}</option>
            ))}
          </select>
        </label>
        {!sabit && <label className="bt-alan">
          {t("gelirGider.harcama.taksitSayisi")}
          <input
            className="bt-input"
            type="number"
            inputMode="numeric"
            min={1}
            max={60}
            step={1}
            disabled={!seciliKart}
            value={seciliKart ? (f.taksitSayisi ?? 1) : 1}
            onChange={(e) => setF({ ...f, taksitSayisi: e.target.value })}
          />
          <small style={{ color: "var(--dim)" }}>
            {!seciliKart
              ? t("gelirGider.harcama.taksitIcinKart")
              : Math.max(parseInt(f.taksitSayisi) || 1, 1) === 1
                ? t("gelirGider.harcama.tekCekim")
                : t("gelirGider.harcama.aylikYaklasik", {
                    tutar: fmt(
                      (+f.tutar || 0) /
                        Math.max(parseInt(f.taksitSayisi) || 1, 1),
                    ),
                  })}
          </small>
        </label>}
        <label className="bt-alan">
          {t("gelirGider.harcama.aciklama")}
          <input
            className="bt-input"
            type="text"
            placeholder={t("gelirGider.harcama.aciklamaOrnek")}
            value={f.aciklama ?? ""}
            onChange={(e) => setF({ ...f, aciklama: e.target.value })}
          />
        </label>
      </div>
      {seciliKart && seciliEkstreAyi && (
        <div className="bt-ipucu" style={{ marginTop: 12 }}>
          <Info size={16} />
          <div>
            <b>{t("gelirGider.harcama.ekstredenBaslar", { ay: ayEtiketi(seciliEkstreAyi) })}</b>{" "}
            {Math.max(parseInt(f.taksitSayisi) || 1, 1) > 1
              ? t("gelirGider.harcama.taksitDagilim", { n: Math.max(parseInt(f.taksitSayisi) || 1, 1), tutar: fmt((+f.tutar || 0) / Math.max(parseInt(f.taksitSayisi) || 1, 1)) })
              : t("gelirGider.harcama.islemTarihiKalir", { ay: ayEtiketi((f.tarih || "").slice(0, 7)) })}
          </div>
        </div>
      )}
      <div className="bt-form-butonlar">
        <button className="bt-btn birincil" onClick={gonder}>
          <Check size={14} /> {f.id ? t("ortak.guncelle") : t("ortak.kaydet")}
        </button>
        <button className="bt-btn ikincil" onClick={() => setForm(null)}>
          {t("ortak.vazgec")}
        </button>
      </div>
    </div>
  );

  return (
    <div className="bt-stack">
      <div className="bt-card" data-tour="harcamalar">
        <div className="bt-cardhead">
          <div className="bt-h2" style={{ margin: 0 }}>
            <Wallet size={16} /> {sabit ? t("gelirGider.harcama.sabitBaslik") : t("gelirGider.harcama.baslik")}
          </div>
          {!acik && (
            <button
              className="bt-btn kucuk birincil"
              onClick={() => setForm({ liste: "expenses", veri: {} })}
            >
              <Plus size={14} /> {sabit ? t("gelirGider.harcama.sabitEkle") : t("gelirGider.harcama.yeni")}
            </button>
          )}
        </div>
        {acik && !f.id && harcamaFormu}
        {!acik && sirali.length === 0 && (!sabit || otomatikBorcOdemeleri.length === 0) && (
          <div className="bt-bos">
            {sabit
              ? t("gelirGider.harcama.sabitBos")
              : t("gelirGider.harcama.bos")}
          </div>
        )}
      </div>

      {sabit && (sirali.length > 0 || otomatikBorcOdemeleri.length > 0) && (
        <div className="bt-card bt-sabit-gider-ozet">
          <div>
            <span>{t("gelirGider.harcama.duzenliYuk")}</span>
            <strong>{fmt(sabitToplam + buAyOtomatikBorcToplami)}</strong>
          </div>
          <p>
            {t("gelirGider.harcama.duzenliYukAciklama", { sabit: fmt(sabitToplam), borc: fmt(buAyOtomatikBorcToplami) })}
          </p>
        </div>
      )}

      {sabit && otomatikBorcOdemeleri.length > 0 && (
        <div className="bt-card">
          <div className="bt-cardhead">
            <div>
              <div className="bt-h2" style={{ margin: 0 }}>
                <ReceiptText size={16} /> {t("gelirGider.harcama.borclardanOtomatik")}
              </div>
              <div className="bt-satir-meta" style={{ marginTop: 5 }}>
                {t("gelirGider.harcama.borclardanOtomatikAciklama")}
              </div>
            </div>
            {kredilereGit && (
              <button className="bt-btn kucuk ikincil" onClick={kredilereGit}>
                {t("gelirGider.harcama.kredileriAc")} <ChevronRight size={14} />
              </button>
            )}
          </div>
          <div className="bt-stack" style={{ gap: 10 }}>
            {otomatikBorcOdemeleri.map((odeme) => (
              <div className="bt-satir" key={odeme.id}>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div className="bt-satir-ad">
                    {odeme.banka} · {odeme.ad}
                  </div>
                  <div className="bt-satir-meta">
                    {odeme.yapilandirma ? t("gelirGider.harcama.yapilandirma") : t("gelirGider.harcama.krediTaksiti")}
                    {odeme.kalanTaksit > 0 && <> · {t("gelirGider.harcama.taksitKaldi", { n: odeme.kalanTaksit })}</>}
                    {!odeme.buAyOdenecek && odeme.ilkOdemeTarihi && (
                      <> · {t("gelirGider.harcama.tarihindeBaslar", { tarih: isoTarihGoster(odeme.ilkOdemeTarihi) })}</>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="bt-satir-tutar">{fmt(odeme.taksit)}</div>
                  <div className="bt-satir-meta">
                    {odeme.buAyOdenecek ? t("gelirGider.harcama.buAyOdenecek") : t("gelirGider.harcama.henuzBaslamadi")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!sabit && Object.keys(buAyHarcama.kategoriler).length > 0 && (
        <div className="bt-card">
          <div className="bt-cardhead">
            <div className="bt-h2" style={{ margin: 0 }}>
              <PieChart size={16} /> {t("gelirGider.harcama.kategoriDagilimi")}
            </div>
            <div className="bt-mono" style={{ fontSize: 13 }}>
              {fmt(buAyHarcama.toplam)}
            </div>
          </div>
          {Object.entries(buAyHarcama.kategoriler)
            .sort((a, b) => b[1] - a[1])
            .map(([kat, tutar]) => (
              <div key={kat} className="bt-kat">
                <div className="bt-kat-ad">{tDeger(kat)}</div>
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

      {!sabit && Object.keys(buAyHarcama.kaynaklar).length > 0 && (
        <div className="bt-card">
          <div className="bt-h2">
            <Wallet size={16} /> {t("gelirGider.harcama.bankaDagilimi")}
          </div>
          {Object.entries(buAyHarcama.kaynaklar)
            .sort((a, b) => b[1] - a[1])
            .map(([kaynak, tutar]) => {
              const eb = Math.max(...Object.values(buAyHarcama.kaynaklar), 1);
              return (
                <div key={kaynak} className="bt-kat">
                  <div className="bt-kat-ad" style={{ width: 150 }}>
                    {tDeger(kaynak)}
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
              {sabit ? t("gelirGider.harcama.eklenenSabitler") : t("gelirGider.harcama.islemTarihi", { ay: ayEtiketi(gorunenAy) })}
            </div>
            {!sabit && <select
              className="bt-input"
              aria-label={t("gelirGider.harcama.donem")}
              value={gorunenAy}
              onChange={(e) => setGorunenAy(e.target.value)}
              style={{ width: 170 }}
            >
              {harcamaAylar.map((ay) => (
                <option key={ay} value={ay}>
                  {ayEtiketi(ay)}
                </option>
              ))}
            </select>}
          </div>
          {gorunenHarcamalar.length === 0 ? (
            <div className="bt-bos">{t("gelirGider.harcama.buAyBos")}</div>
          ) : (
            <div className="bt-stack" style={{ gap: 10 }}>
              {gorunenHarcamalar.map((h) => {
                const harcamaKarti = veri.cards.find(
                  (kart) =>
                    h.kaynak ===
                    kart.banka + " · " + (kart.ad || "Kredi kartı"),
                );
                const harcamaEkstreAyi = harcamaKarti
                  ? h.ekstreAyi ||
                    statementPeriodForTransaction(
                      h.tarih,
                      harcamaKarti.kesimGunu,
                    )
                  : "";
                return (
                  <div key={h.id} className="bt-harcama-kayit">
                    <div className="bt-satir">
                      <div style={{ flex: 1, minWidth: 150 }}>
                        <div className="bt-satir-ad">
                          {tDeger(h.kategori)}
                          {h.aciklama && (
                            <span
                              style={{ color: "var(--dim)", fontWeight: 500 }}
                            >
                              {" "}
                              · {h.aciklama}
                            </span>
                          )}
                        </div>
                        <div className="bt-satir-meta">
                          {sabit ? tDeger("Her ay") : h.tarih && isoTarihGoster(h.tarih)}
                          {h.kaynak && <> · {tDeger(h.kaynak)}</>}
                          {harcamaEkstreAyi && (
                            <> · {t("gelirGider.harcama.ekstre", { ay: ayEtiketi(harcamaEkstreAyi) })}</>
                          )}
                          {(+h.taksitSayisi || 1) > 1 && (
                            <>
                              {" "}· {t("gelirGider.harcama.taksitAylik", { n: h.taksitSayisi, tutar: fmt((+h.tutar || 0) / +h.taksitSayisi) })}
                            </>
                          )}
                        </div>
                      </div>
                      <div className="bt-satir-tutar">{fmt(h.tutar)}</div>
                      <div style={{ display: "flex", gap: 2 }}>
                        <button
                          className="bt-btn hayalet"
                          aria-label={t("gelirGider.harcama.duzenle")}
                          onClick={() =>
                            setForm({ liste: "expenses", veri: h })
                          }
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          className="bt-btn hayalet tehlike"
                          aria-label={t("gelirGider.harcama.sil")}
                          onClick={() => sil("expenses", h.id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                    {acik && f.id === h.id && (
                      <div
                        id={`harcama-editor-${h.id}`}
                        className="bt-harcama-inline-edit"
                      >
                        <div className="bt-harcama-inline-edit-baslik">
                          <strong>{t("gelirGider.harcama.duzenle")}</strong>
                          <span>
                            {tDeger(h.kategori)}
                            {h.aciklama ? ` · ${h.aciklama}` : ""}
                          </span>
                        </div>
                        {harcamaFormu}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {acik && kaynakEklemeTuru && (
        <div
          className="bt-modal-arka"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) kaynakEklemeKapat();
          }}
        >
          <form
            className="bt-modal bt-kaynak-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="harcama-kaynak-modal-baslik"
            onSubmit={(e) => {
              e.preventDefault();
              hizliKaynakKaydet();
            }}
          >
            <div className="bt-modalbaslik">
              <div>
                <div id="harcama-kaynak-modal-baslik" className="bt-h2">
                  {kaynakEklemeTuru === "card" ? t("gelirGider.kaynak.yeniKart") : t("gelirGider.kaynak.yeniHesap")}
                </div>
                <p className="bt-kaynak-modal-aciklama">
                  {t("gelirGider.kaynak.modalAciklama")}
                </p>
              </div>
              <button className="bt-btn hayalet" type="button" onClick={kaynakEklemeKapat} aria-label={t("ortak.kapat")}>
                <X size={17} />
              </button>
            </div>
            <div className="bt-kaynak-modal-form">
              <label className="bt-alan">
                <span>{t("ortak.banka")} *</span>
                <select
                  className="bt-input"
                  autoFocus
                  value={kaynakFormu.banka}
                  onChange={(e) => setKaynakFormu({
                    ...kaynakFormu,
                    banka: e.target.value,
                    ...(e.target.value !== "__other__" ? { ozelBanka: "" } : {}),
                  })}
                >
                  <option value="">{t("gelirGider.kaynak.bankaSecin")}</option>
                  {bankalar.map((banka) => <option key={banka} value={banka}>{banka}</option>)}
                  <option value="__other__">{t("gelirGider.kaynak.digerBanka")}</option>
                </select>
              </label>
              {kaynakFormu.banka === "__other__" && (
                <label className="bt-alan">
                  <span>{t("gelirGider.kaynak.bankaAdi")} *</span>
                  <input
                    className="bt-input"
                    value={kaynakFormu.ozelBanka}
                    placeholder={t("gelirGider.kaynak.bankaAdiOrnek")}
                    onChange={(e) => setKaynakFormu({ ...kaynakFormu, ozelBanka: e.target.value })}
                  />
                </label>
              )}
              <label className="bt-alan">
                <span>{kaynakEklemeTuru === "card" ? t("gelirGider.kaynak.kartAdi") : t("gelirGider.kaynak.hesapAdi")} *</span>
                <input
                  className="bt-input"
                  value={kaynakFormu.ad}
                  placeholder={kaynakEklemeTuru === "card" ? t("gelirGider.kaynak.kartAdiOrnek") : t("gelirGider.kaynak.hesapAdiOrnek")}
                  onChange={(e) => setKaynakFormu({ ...kaynakFormu, ad: e.target.value })}
                />
              </label>
              {kaynakEklemeTuru === "card" ? (
                <>
                  <label className="bt-alan">
                    <span>{t("gelirGider.kaynak.kartSon4")}</span>
                    <input
                      className="bt-input"
                      inputMode="numeric"
                      maxLength={4}
                      value={kaynakFormu.kartSon4}
                      placeholder="1234"
                      onChange={(e) => setKaynakFormu({ ...kaynakFormu, kartSon4: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                    />
                  </label>
                  <label className="bt-alan">
                    <span>{t("gelirGider.kaynak.kartLimiti")}</span>
                    <ParaInput
                      className="bt-input"
                      value={kaynakFormu.limit}
                      placeholder={t("gelirGider.kaynak.istegeBagli")}
                      onValueChange={(value) => setKaynakFormu({ ...kaynakFormu, limit: value })}
                    />
                  </label>
                  <label className="bt-alan">
                    <span>{t("gelirGider.kaynak.kesimGunu")} *</span>
                    <input
                      className="bt-input"
                      type="number"
                      min="1"
                      max="31"
                      inputMode="numeric"
                      value={kaynakFormu.kesimGunu}
                      onChange={(e) => setKaynakFormu({ ...kaynakFormu, kesimGunu: e.target.value })}
                    />
                  </label>
                  <label className="bt-alan">
                    <span>{t("gelirGider.kaynak.sonOdemeGunu")}</span>
                    <input
                      className="bt-input"
                      type="number"
                      min="1"
                      max="31"
                      inputMode="numeric"
                      value={kaynakFormu.sonOdemeGunu}
                      placeholder={t("gelirGider.kaynak.istegeBagli")}
                      onChange={(e) => setKaynakFormu({ ...kaynakFormu, sonOdemeGunu: e.target.value })}
                    />
                  </label>
                </>
              ) : (
                <label className="bt-alan genis">
                  <span>{t("gelirGider.kaynak.guncelBakiye")}</span>
                  <ParaInput
                    className="bt-input"
                    value={kaynakFormu.bakiye}
                    placeholder={t("gelirGider.kaynak.istegeBagli")}
                    onValueChange={(value) => setKaynakFormu({ ...kaynakFormu, bakiye: value })}
                  />
                </label>
              )}
              {kaynakHatasi && <span className="bt-kaynak-ekle-hata" role="alert">{kaynakHatasi}</span>}
              <div className="bt-kaynak-modal-actions">
                <button className="bt-btn birincil" type="submit">
                  <Check size={14} /> {t("gelirGider.kaynak.kaydetVeSec")}
                </button>
                <button className="bt-btn ikincil" type="button" onClick={kaynakEklemeKapat}>
                  {t("ortak.vazgec")}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
