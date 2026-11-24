import { BANK_LOGOS } from "./bankLogos.js";

// Klasik ve Borcama 2.0 aynı banka rozetini kullanır.
const INK = "#14160f";
const LIME = "#cdf564";
const CORAL = "#ff6f59";

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
export function bankaKodu(banka) {
  const b = (banka || "").trim();
  if (BANKA_KOD[b]) return BANKA_KOD[b];
  return b.slice(0, 3).toUpperCase() || "??";
}
export function rozetStil(bg, rot, boyut = 42) {
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
export function BankaRozeti({ banka, bg = LIME, rot = 0, boyut = 42, className }) {
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
