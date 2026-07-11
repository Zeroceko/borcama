import React, { useState, useEffect, useMemo } from "react";
import { CreditCard, Landmark, Wallet, CalendarClock, Plus, Pencil, Trash2, Check, RotateCcw, TrendingDown, TrendingUp, Receipt, PieChart, LayoutDashboard, AlertTriangle, Target, Building2, Flame, Snowflake, Percent, ArrowDownRight, ArrowUpRight, Lightbulb, LogOut } from "lucide-react";
import { supabase } from "./supabaseClient.js";

/* ---------------- Stil ---------------- */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');

:root{
  --bg:#0E1420; --surface:#161E2E; --surface2:#1C2638; --border:#26324A;
  --text:#EDF1F9; --muted:#8C99B3; --faint:#5B6880;
  --kart:#5B8DEF; --kredi:#A78BFA; --ek:#F0A94B;
  --mint:#43D9A3; --danger:#F87171; --amber:#FBBF24;
  --radius:16px;
}
*{box-sizing:border-box}
.bt-app{
  font-family:'Inter',system-ui,sans-serif; background:
    radial-gradient(1100px 500px at 80% -10%, #17233C 0%, var(--bg) 55%);
  min-height:100vh; color:var(--text); font-variant-numeric:tabular-nums;
}
.bt-wrap{max-width:940px;margin:0 auto;padding:28px 18px 90px}
.bt-display{font-family:'Space Grotesk','Inter',sans-serif;letter-spacing:-0.02em}

.bt-header{display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:10px;margin-bottom:22px}
.bt-eyebrow{font-size:11px;font-weight:700;letter-spacing:.22em;color:var(--mint);text-transform:uppercase}
.bt-title{margin:4px 0 0;font-size:26px;font-weight:700}
.bt-date{font-size:13px;color:var(--muted)}
.bt-saving{color:var(--mint);margin-left:8px}

.bt-tabs{display:flex;gap:4px;background:var(--surface);border:1px solid var(--border);padding:5px;border-radius:14px;margin-bottom:22px}
.bt-tab{flex:1;display:flex;align-items:center;justify-content:center;gap:8px;padding:11px 0;border:none;border-radius:10px;
  background:transparent;color:var(--muted);font-family:'Inter',sans-serif;font-weight:600;font-size:14px;cursor:pointer;transition:background .15s,color .15s}
.bt-tab:hover{color:var(--text)}
.bt-tab.aktif{background:var(--surface2);color:var(--text);box-shadow:inset 0 0 0 1px var(--border)}
.bt-tab:focus-visible,.bt-btn:focus-visible,.bt-input:focus-visible{outline:2px solid var(--mint);outline-offset:2px}

.bt-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px}
.bt-stack{display:flex;flex-direction:column;gap:16px}
.bt-grid3{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:16px}
.bt-h2{margin:0;font-size:15px;font-weight:700;display:flex;align-items:center;gap:9px}
.bt-h2 svg{opacity:.85;flex-shrink:0}
.bt-cardhead{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;gap:10px;flex-wrap:wrap}

.bt-hero{position:relative;overflow:hidden;background:linear-gradient(135deg,#1A2440 0%,#141C30 60%);border:1px solid #2C3A58;border-radius:20px;padding:26px 24px 22px}
.bt-hero::after{content:'₺';position:absolute;right:-10px;top:-58px;font-family:'Space Grotesk';font-size:220px;font-weight:700;color:#FFFFFF08;pointer-events:none;line-height:1}
.bt-hero-label{font-size:13px;color:var(--muted);font-weight:600}
.bt-hero-tutar{font-size:46px;font-weight:700;margin:4px 0 6px}
.bt-delta{display:inline-flex;align-items:center;gap:5px;font-size:13px;font-weight:700;padding:4px 10px;border-radius:999px;margin-bottom:16px}
.bt-delta.iyi{background:#43D9A322;color:var(--mint)}
.bt-delta.kotu{background:#F8717122;color:var(--danger)}
.bt-delta.notr{background:#FFFFFF12;color:var(--muted)}
.bt-serit{display:flex;height:12px;border-radius:999px;overflow:hidden;background:#FFFFFF14;gap:3px}
.bt-serit div{border-radius:999px;min-width:6px;transition:width .4s ease}
.bt-lejant{display:flex;gap:20px;flex-wrap:wrap;margin-top:14px}
.bt-lejant-item{font-size:13px;color:var(--muted)}
.bt-lejant-item b{color:var(--text);font-weight:700}
.bt-nokta{display:inline-block;width:9px;height:9px;border-radius:3px;margin-right:7px}
.bt-faiz-chip{display:inline-flex;align-items:center;gap:6px;margin-top:16px;background:#F0A94B1A;border:1px solid #F0A94B33;color:var(--amber);
  font-size:12.5px;font-weight:600;padding:6px 12px;border-radius:10px}

.bt-stat-label{font-size:13px;color:var(--muted);font-weight:600;display:flex;align-items:center;gap:7px}
.bt-stat-deger{font-size:25px;font-weight:700;margin-top:6px}
.bt-stat-alt{font-size:12px;color:var(--faint);margin-top:4px}
.bt-gauge{height:7px;background:#FFFFFF12;border-radius:999px;margin-top:10px}
.bt-gauge div{height:7px;border-radius:999px;transition:width .4s ease}

.bt-satir{display:flex;align-items:center;gap:14px;padding:13px 14px;border-radius:12px;background:var(--surface2);border:1px solid transparent;transition:border-color .15s}
.bt-satir:hover{border-color:var(--border)}
.bt-satir.odendi{opacity:.55}
.bt-satir.gecikti{background:#3A1E22;border-color:#5C2B31}
.bt-satir.hedef{border-color:#43D9A355;background:#43D9A30D}
.bt-avatar{width:38px;height:38px;border-radius:11px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.bt-satir-ana{flex:1;min-width:0}
.bt-satir-baslik{font-weight:600;font-size:14px}
.bt-satir-alt{font-size:12px;color:var(--muted);margin-top:2px}
.bt-satir-tutar{font-weight:700;font-size:15px;white-space:nowrap}
.bt-not{font-size:11px;color:var(--faint);font-weight:500}
.bt-sira{width:26px;height:26px;border-radius:8px;background:#FFFFFF12;display:flex;align-items:center;justify-content:center;
  font-size:13px;font-weight:800;flex-shrink:0;font-family:'Space Grotesk'}
.bt-sira.bir{background:var(--mint);color:#08251B}

.bt-bar{height:5px;background:#FFFFFF12;border-radius:999px;margin-top:8px;max-width:240px}
.bt-bar div{height:5px;border-radius:999px}

.bt-btn{display:inline-flex;align-items:center;gap:6px;border-radius:10px;cursor:pointer;font-weight:600;font-family:'Inter',sans-serif;
  padding:9px 16px;font-size:13px;border:1px solid transparent;transition:filter .15s,background .15s}
.bt-btn:hover{filter:brightness(1.12)}
.bt-btn.birincil{background:var(--mint);color:#08251B}
.bt-btn.ikincil{background:transparent;color:var(--text);border-color:var(--border)}
.bt-btn.ikincil:hover{background:var(--surface2)}
.bt-btn.hayalet{background:transparent;color:var(--muted);border:none;padding:7px}
.bt-btn.hayalet:hover{color:var(--text);background:var(--surface2)}
.bt-btn.tehlike:hover{color:var(--danger)}
.bt-btn.kucuk{padding:6px 11px;font-size:12px}
.bt-secici{display:flex;gap:4px;background:var(--surface2);border:1px solid var(--border);padding:4px;border-radius:11px}
.bt-secici button{display:flex;align-items:center;gap:6px;padding:7px 13px;border:none;border-radius:8px;background:transparent;
  color:var(--muted);font-family:'Inter',sans-serif;font-weight:600;font-size:13px;cursor:pointer}
.bt-secici button.aktif{background:var(--surface);color:var(--text);box-shadow:inset 0 0 0 1px var(--border)}

.bt-form{background:var(--surface2);border:1px solid var(--border);border-radius:14px;padding:16px;margin-bottom:14px}
.bt-alanlar{display:flex;flex-wrap:wrap;gap:12px}
.bt-alan{display:flex;flex-direction:column;gap:5px;font-size:12px;font-weight:600;color:var(--muted);flex:1 1 150px}
.bt-input{padding:10px 11px;border-radius:9px;border:1px solid var(--border);font-size:14px;color:var(--text);
  background:var(--surface);font-family:'Inter',sans-serif;width:100%}
.bt-input::placeholder{color:var(--faint)}
select.bt-input{appearance:auto}
.bt-form-butonlar{display:flex;gap:8px;margin-top:14px}

.bt-kat{display:flex;align-items:center;gap:12px;margin-bottom:9px}
.bt-kat-ad{width:88px;font-size:13px;font-weight:600;flex-shrink:0}
.bt-kat-bar{flex:1;height:9px;background:#FFFFFF10;border-radius:999px}
.bt-kat-bar div{height:9px;border-radius:999px;background:linear-gradient(90deg,var(--mint),#2FA57C)}
.bt-kat-tutar{width:112px;text-align:right;font-size:13px;font-weight:700;flex-shrink:0}

.bt-banka{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:12px;background:var(--surface2)}
.bt-banka-serit{display:flex;height:7px;border-radius:999px;overflow:hidden;background:#FFFFFF10;margin-top:7px;gap:2px}
.bt-banka-serit div{border-radius:999px;min-width:4px}

.bt-ipucu{display:flex;gap:10px;background:#43D9A30D;border:1px solid #43D9A333;border-radius:12px;padding:13px 14px;font-size:13px;color:var(--muted);line-height:1.55}
.bt-ipucu svg{flex-shrink:0;margin-top:1px}
.bt-ipucu b{color:var(--text)}

.bt-bos{display:flex;flex-direction:column;align-items:center;gap:8px;padding:26px 10px;color:var(--faint);font-size:13px;text-align:center}
.bt-bos svg{opacity:.4}
.bt-link{border:none;background:none;color:var(--mint);font-weight:700;cursor:pointer;font-size:inherit;padding:0;font-family:inherit}

@media (max-width:600px){
  .bt-hero-tutar{font-size:34px}
  .bt-tab span{display:none}
  .bt-kat-ad{width:70px}
  .bt-kat-tutar{width:90px}
}
@media (prefers-reduced-motion:reduce){
  *{transition:none!important}
}
`;

/* ---------------- Yardımcılar ---------------- */
const TL = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });
const TLk = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 2 });
const fmt = (n) => TLk.format(Number(n) || 0);
const fmt0 = (n) => TL.format(Number(n) || 0);
const AYLAR = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
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
// Kartta tam tarih girilmişse (ör. Vakıfbank ekstresindeki "6.7.2026") o günü esas alıp
// aylık tekrar eden ödeme takvimine çeviriyoruz; sadece gün girilmişse doğrudan onu kullanıyoruz.
function kartSonOdemeTarihi(k) {
  if (k.sonOdemeTarihi) {
    const g = new Date(k.sonOdemeTarihi + "T00:00:00").getDate();
    return sonrakiOdemeTarihi(g);
  }
  return sonrakiOdemeTarihi(k.sonOdemeGunu);
}

const KATEGORILER = ["Market","Yeme-İçme","Ulaşım","Fatura","Kira","Sağlık","Giyim","Eğlence","Eğitim","Diğer"];
const BANKALAR = ["VakıfBank","Halkbank","QNB","Enpara","Akbank","Garanti BBVA"];
// Faiz girilmediyse kullanılan tahmini aylık oranlar — gerçek oranlarını girmen çok daha doğru sonuç verir
// TCMB'nin "Kredi Kartı İşlemlerinde Uygulanacak Azami Faiz Oranları Hakkında Tebliğ" kapsamında
// 1 Ocak 2026'dan itibaren yürürlükteki YASAL AZAMİ (üst sınır) akdi faiz oranları.
// Kaynak: tcmb.gov.tr/.../Kredi_Karti_Islemlerinde_Uygulanacak_Azami_Faiz_Oranlari
// Banka faiz oranınızı biliyorsanız kart formuna girin; girmezseniz bu yasal tavan tahmini kullanılır
// (bankanız bu tavanın altında bir oran uyguluyor olabilir, üstünde asla uygulayamaz).
function tcmbKartAzamiFaizi(bakiye) {
  if (bakiye >= 180000) return 4.25;
  if (bakiye >= 30000) return 3.75;
  return 3.25;
}
// Son ödeme tarihi geçmiş, ödenmemiş borçlara uygulanan yasal azami gecikme faizi — akdi faizden daha yüksek, aynı borç dilimlerine göre.
function tcmbKartAzamiGecikmeFaizi(bakiye) {
  if (bakiye >= 180000) return 4.55;
  if (bakiye >= 30000) return 4.05;
  return 3.55;
}
const VARSAYILAN_FAIZ_EK_HESAP = 4.25; // TCMB azami KMH / nakit avans faiz oranı (1 Ocak 2026 itibarıyla)
const BOS_VERI = { cards: [], loans: [], overdrafts: [], others: [], expenses: [], paid: {}, ayarlar: {}, snapshots: {} };

const TUR_META = {
  kart: { renk: "var(--kart)", Ikon: CreditCard, ad: "Kredi kartı" },
  kredi: { renk: "var(--kredi)", Ikon: Landmark, ad: "Kredi" },
  ek: { renk: "var(--ek)", Ikon: Wallet, ad: "Ek hesap" },
  diger: { renk: "#94A3B8", Ikon: AlertTriangle, ad: "Gecikmiş / diğer" },
};

/* Tüm borçları tek listede toplayan model — plan ve banka kırılımı bunun üstünde çalışır */
function borcKalemleri(veri) {
  const kalemler = [];
  veri.cards.forEach((k) => {
    // Dönem içi toplam girilmişse gerçek güncel borç odur (geçen ay kalanı + faiz + bu ayki yeni harcamalar);
    // girilmemişse ekstre borcunu esas al.
    const guncelBorc = +k.donemIciToplam > 0 ? +k.donemIciToplam : +k.borc || 0;
    if (guncelBorc > 0) {
      const gecikmis = kalanGun(kartSonOdemeTarihi(k)) < 0;
      kalemler.push({
        id: "kart-" + k.id, tur: "kart", banka: (k.banka || "").trim(),
        ad: k.banka + (k.ad ? " · " + k.ad : " · Kredi kartı"),
        bakiye: guncelBorc,
        faiz: +k.faiz > 0 ? +k.faiz : (gecikmis ? tcmbKartAzamiGecikmeFaizi(guncelBorc) : tcmbKartAzamiFaizi(guncelBorc)),
        faizTahmini: !(+k.faiz > 0),
        gecikmis,
      });
    }
  });
  veri.overdrafts.forEach((k) => {
    if ((+k.kullanilan || 0) > 0)
      kalemler.push({
        id: "ek-" + k.id, tur: "ek", banka: (k.banka || "").trim(),
        ad: k.banka + " · Ek hesap (KMH)",
        bakiye: +k.kullanilan,
        faiz: +k.faiz > 0 ? +k.faiz : VARSAYILAN_FAIZ_EK_HESAP,
        faizTahmini: !(+k.faiz > 0),
      });
  });
  veri.loans.forEach((k) => {
    if ((+k.kalanBorc || 0) > 0)
      kalemler.push({
        id: "kredi-" + k.id, tur: "kredi", banka: (k.banka || "").trim(),
        ad: k.banka + (k.ad ? " · " + k.ad : " · Kredi"),
        bakiye: +k.kalanBorc,
        faiz: +k.faiz > 0 ? +k.faiz : 0,
        faizTahmini: false,
        sabitTaksit: true,
      });
  });
  (veri.others || []).forEach((k) => {
    if ((+k.tutar || 0) > 0)
      kalemler.push({
        id: "diger-" + k.id, tur: "diger", banka: (k.banka || "").trim(),
        ad: k.banka + (k.ad ? " · " + k.ad : " · Gecikmiş borç"),
        bakiye: +k.tutar,
        faiz: +k.faiz > 0 ? +k.faiz : 0,
        faizTahmini: false,
        sabitTaksit: !(+k.faiz > 0),
      });
  });
  return kalemler;
}

/* ---------------- Ana bileşen ---------------- */
export default function BorcTakip() {
  const [veri, setVeri] = useState(BOS_VERI);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState("");
  const [sekme, setSekme] = useState("ozet");
  const [form, setForm] = useState(null);
  const [kaydediliyor, setKaydediliyor] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const s = await window.storage.get("borctakip:v1");
        if (s && s.value) setVeri({ ...BOS_VERI, ...JSON.parse(s.value) });
      } catch (e) { /* ilk kullanım */ }
      finally { setYukleniyor(false); }
    })();
  }, []);

  async function kaydet(yeni) {
    // Aylık gidişat için bu ayın toplamını otomatik kaydet
    const kalemler = borcKalemleri(yeni);
    const toplam = kalemler.reduce((t, k) => t + k.bakiye, 0);
    yeni = { ...yeni, snapshots: { ...(yeni.snapshots || {}), [ayAnahtari()]: toplam } };
    setVeri(yeni);
    setKaydediliyor(true);
    try {
      await window.storage.set("borctakip:v1", JSON.stringify(yeni));
      setHata("");
    } catch (e) {
      setHata("Kayıt sırasında bir sorun oluştu. Değişiklikler bu oturumda duruyor; bir sonraki işlemde tekrar denenecek.");
    } finally { setKaydediliyor(false); }
  }

  const kalemler = useMemo(() => borcKalemleri(veri), [veri]);

  const toplamlar = useMemo(() => {
    const kart = kalemler.filter((k) => k.tur === "kart").reduce((t, k) => t + k.bakiye, 0);
    const kredi = kalemler.filter((k) => k.tur === "kredi").reduce((t, k) => t + k.bakiye, 0);
    const ek = kalemler.filter((k) => k.tur === "ek").reduce((t, k) => t + k.bakiye, 0);
    const diger = kalemler.filter((k) => k.tur === "diger").reduce((t, k) => t + k.bakiye, 0);
    return { kart, kredi, ek, diger, genel: kart + kredi + ek + diger };
  }, [kalemler]);

  const aylikFaiz = useMemo(
    () => kalemler.filter((k) => !k.sabitTaksit).reduce((t, k) => t + (k.bakiye * k.faiz) / 100, 0),
    [kalemler]
  );

  const buAyOdenecek = useMemo(() => {
    const kartOdeme = veri.cards.reduce((t, k) => {
      const anaBorc = +k.donemIciToplam > 0 ? +k.donemIciToplam : +k.borc || 0;
      return t + (+k.asgari > 0 ? +k.asgari : (+k.borc > 0 ? +k.borc : anaBorc));
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
      const anaBorc = +k.donemIciToplam > 0 ? +k.donemIciToplam : +k.borc || 0;
      if (anaBorc > 0) {
        const tutar = +k.asgari > 0 ? +k.asgari : (+k.borc > 0 ? +k.borc : anaBorc);
        liste.push({
          id: "kart-" + k.id, ad: k.banka + (k.ad ? " · " + k.ad : ""), ikon: "kart",
          tutar, not: +k.asgari > 0 ? "asgari" : (+k.borc > 0 ? "ekstre borcu" : "toplam borç"),
          tarih: kartSonOdemeTarihi(k),
          odendi: !!veri.paid["kart-" + k.id + "-" + ay], anahtar: "kart-" + k.id + "-" + ay,
        });
      }
    });
    veri.loans.forEach((k) => {
      if ((+k.kalanBorc || 0) > 0)
        liste.push({
          id: "kredi-" + k.id, ad: k.banka + (k.ad ? " · " + k.ad : ""), ikon: "kredi",
          tutar: +k.taksit || 0, not: "taksit",
          tarih: sonrakiOdemeTarihi(k.odemeGunu),
          odendi: !!veri.paid["kredi-" + k.id + "-" + ay], anahtar: "kredi-" + k.id + "-" + ay,
        });
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

  function ekleGuncelle(liste, kayit) {
    const dizi = veri[liste];
    const varMi = dizi.some((x) => x.id === kayit.id);
    kaydet({ ...veri, [liste]: varMi ? dizi.map((x) => (x.id === kayit.id ? kayit : x)) : [...dizi, kayit] });
    setForm(null);
  }
  const sil = (liste, id) => kaydet({ ...veri, [liste]: veri[liste].filter((x) => x.id !== id) });
  const odendiIsaretle = (anahtar, durum) => kaydet({ ...veri, paid: { ...veri.paid, [anahtar]: durum } });
  const ayarKaydet = (a) => kaydet({ ...veri, ayarlar: { ...veri.ayarlar, ...a } });

  // Harcama kaydı: istenirse tutarı, seçilen kredi kartının borcuna da işler (yalnızca yeni kayıtta)
  function harcamaKaydet(kayit, kartaEkle) {
    const dizi = veri.expenses;
    const varMi = dizi.some((x) => x.id === kayit.id);
    let yeni = { ...veri, expenses: varMi ? dizi.map((x) => (x.id === kayit.id ? kayit : x)) : [...dizi, kayit] };
    if (kartaEkle && !varMi) {
      yeni = {
        ...yeni,
        cards: yeni.cards.map((c) =>
          c.banka + " · " + (c.ad || "Kredi kartı") === kayit.kaynak
            ? { ...c, borc: (+c.borc || 0) + (+kayit.tutar || 0) }
            : c
        ),
      };
    }
    kaydet(yeni);
    setForm(null);
  }

  const s = bugun();

  return (
    <div className="bt-app">
      <style>{CSS}</style>
      <datalist id="bt-bankalar">
        {BANKALAR.map((b) => <option key={b} value={b} />)}
      </datalist>
      <div className="bt-wrap">
        <header className="bt-header">
          <div>
            <div className="bt-eyebrow">Kişisel finans defteri</div>
            <h1 className="bt-title bt-display">Borç &amp; Harcama Takibi</h1>
          </div>
          <div className="bt-date">
            {s.getDate()} {AYLAR[s.getMonth()]} {s.getFullYear()}
            {kaydediliyor && <span className="bt-saving">● kaydediliyor</span>}
            <button className="bt-btn hayalet" style={{ marginLeft: 10 }} onClick={() => supabase.auth.signOut()} title="Çıkış yap">
              <LogOut size={14} /> Çıkış
            </button>
          </div>
        </header>

        {hata && (
          <div className="bt-card" style={{ borderColor: "#5C2B31", background: "#3A1E22", marginBottom: 16, fontSize: 13, display: "flex", gap: 10, alignItems: "center" }}>
            <AlertTriangle size={16} color="var(--danger)" /> {hata}
          </div>
        )}

        <nav className="bt-tabs" role="tablist">
          {[
            ["ozet", "Özet", <LayoutDashboard size={17} key="i" />],
            ["borclar", "Borçlar", <TrendingDown size={17} key="i" />],
            ["plan", "Borç Planı", <Target size={17} key="i" />],
            ["harcamalar", "Harcamalar", <Receipt size={17} key="i" />],
          ].map(([k, ad, ikon]) => (
            <button key={k} role="tab" aria-selected={sekme === k}
              className={"bt-tab" + (sekme === k ? " aktif" : "")}
              onClick={() => { setSekme(k); setForm(null); }}>
              {ikon}<span>{ad}</span>
            </button>
          ))}
        </nav>

        {yukleniyor ? (
          <div className="bt-bos">Verileriniz yükleniyor…</div>
        ) : (
          <>
            {sekme === "ozet" && <Ozet toplamlar={toplamlar} kalemler={kalemler} aylikFaiz={aylikFaiz} gecenAyDelta={gecenAyDelta} buAyOdenecek={buAyOdenecek} yaklasan={yaklasan} buAyHarcama={buAyHarcama} odendiIsaretle={odendiIsaretle} setSekme={setSekme} ayarlar={veri.ayarlar || {}} ayarKaydet={ayarKaydet} />}
            {sekme === "borclar" && <Borclar veri={veri} form={form} setForm={setForm} ekleGuncelle={ekleGuncelle} sil={sil} />}
            {sekme === "plan" && <Plan kalemler={kalemler} aylikFaiz={aylikFaiz} setSekme={setSekme} />}
            {sekme === "harcamalar" && <Harcamalar veri={veri} form={form} setForm={setForm} harcamaKaydet={harcamaKaydet} sil={sil} buAyHarcama={buAyHarcama} />}
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------- Özet ---------------- */
function Ozet({ toplamlar, kalemler, aylikFaiz, gecenAyDelta, buAyOdenecek, yaklasan, buAyHarcama, odendiIsaretle, setSekme, ayarlar, ayarKaydet }) {
  const [gelirDuzenle, setGelirDuzenle] = useState(false);
  const [gelirTaslak, setGelirTaslak] = useState("");
  const gelir = +ayarlar.gelir || 0;
  const oran = gelir > 0 ? (buAyOdenecek / gelir) * 100 : null;
  const oranRenk = oran === null ? "var(--muted)" : oran < 30 ? "var(--mint)" : oran < 50 ? "var(--amber)" : "var(--danger)";
  const oranMesaj = oran === null ? "" : oran < 30 ? "sağlıklı seviyede" : oran < 50 ? "dikkat gerektiren seviyede" : "riskli seviyede — Borç Planı sekmesine bakın";

  const parcalar = [
    { ad: "Kredi kartları", tutar: toplamlar.kart, renk: "var(--kart)" },
    { ad: "Krediler", tutar: toplamlar.kredi, renk: "var(--kredi)" },
    { ad: "Ek hesap / KMH", tutar: toplamlar.ek, renk: "var(--ek)" },
    { ad: "Gecikmiş / diğer", tutar: toplamlar.diger, renk: "#94A3B8" },
  ];

  // Banka kırılımı
  const bankalar = useMemo(() => {
    const m = {};
    kalemler.forEach((k) => {
      const b = k.banka || "Diğer";
      if (!m[b]) m[b] = { toplam: 0, kart: 0, kredi: 0, ek: 0, diger: 0 };
      m[b].toplam += k.bakiye;
      m[b][k.tur] += k.bakiye;
    });
    return Object.entries(m).sort((a, b) => b[1].toplam - a[1].toplam);
  }, [kalemler]);
  const enBuyukBanka = bankalar.length ? bankalar[0][1].toplam : 1;

  return (
    <div className="bt-stack">
      <section className="bt-hero">
        <div className="bt-hero-label">Tüm bankalardaki toplam borcunuz</div>
        <div className="bt-hero-tutar bt-display">{fmt(toplamlar.genel)}</div>
        {gecenAyDelta ? (
          <div className={"bt-delta " + (gecenAyDelta.fark < 0 ? "iyi" : gecenAyDelta.fark > 0 ? "kotu" : "notr")}>
            {gecenAyDelta.fark < 0 ? <ArrowDownRight size={14} /> : gecenAyDelta.fark > 0 ? <ArrowUpRight size={14} /> : null}
            {gecenAyDelta.fark === 0
              ? "Geçen aydan bu yana değişmedi"
              : (gecenAyDelta.fark < 0 ? fmt0(-gecenAyDelta.fark) + " azaldı" : fmt0(gecenAyDelta.fark) + " arttı") + " (geçen aya göre)"}
          </div>
        ) : (
          <div className="bt-delta notr">Gidişat, gelecek aydan itibaren burada görünecek</div>
        )}
        <div className="bt-serit">
          {toplamlar.genel > 0 &&
            parcalar.map((p) => p.tutar > 0 ? (
              <div key={p.ad} style={{ width: (p.tutar / toplamlar.genel) * 100 + "%", background: p.renk }} title={p.ad} />
            ) : null)}
        </div>
        <div className="bt-lejant">
          {parcalar.map((p) => (
            <div key={p.ad} className="bt-lejant-item">
              <span className="bt-nokta" style={{ background: p.renk }} />
              {p.ad}: <b>{fmt(p.tutar)}</b>
            </div>
          ))}
        </div>
        {aylikFaiz > 0 && (
          <div className="bt-faiz-chip">
            <Percent size={14} />
            Kart + KMH borçları böyle kalırsa bu ay tahmini <b style={{ margin: "0 4px" }}>{fmt0(aylikFaiz)}</b> faiz işleyecek
          </div>
        )}
      </section>

      <div className="bt-grid3">
        <section className="bt-card">
          <div className="bt-stat-label"><CalendarClock size={15} /> Bu ay ödenmesi gereken</div>
          <div className="bt-stat-deger bt-display">{fmt(buAyOdenecek)}</div>
          <div className="bt-stat-alt">Kredi taksitleri + kart asgarileri</div>
        </section>

        <section className="bt-card">
          <div className="bt-stat-label" style={{ justifyContent: "space-between" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 7 }}><PieChart size={15} /> Borç yükü</span>
            <button className="bt-btn hayalet" style={{ padding: 3 }} title="Aylık geliri düzenle"
              onClick={() => { setGelirTaslak(gelir || ""); setGelirDuzenle(!gelirDuzenle); }}>
              <Pencil size={13} />
            </button>
          </div>
          {gelirDuzenle ? (
            <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
              <input className="bt-input" type="number" min={0} placeholder="Aylık net gelir (₺)"
                value={gelirTaslak} onChange={(e) => setGelirTaslak(e.target.value)} />
              <button className="bt-btn kucuk birincil" onClick={() => { ayarKaydet({ gelir: gelirTaslak }); setGelirDuzenle(false); }}>
                <Check size={13} />
              </button>
            </div>
          ) : gelir > 0 ? (
            <>
              <div className="bt-stat-deger bt-display" style={{ color: oranRenk }}>%{Math.round(oran)}</div>
              <div className="bt-stat-alt">Gelirinizin bu kadarı zorunlu borç ödemesine gidiyor — {oranMesaj}</div>
              <div className="bt-gauge"><div style={{ width: Math.min(oran, 100) + "%", background: oranRenk }} /></div>
            </>
          ) : (
            <div className="bt-stat-alt" style={{ marginTop: 10 }}>
              Aylık net gelirinizi girin; maaşınızın yüzde kaçının borca gittiğini görün. Bu bilgi de yalnızca sizin kaydınızda durur.
            </div>
          )}
        </section>

        <section className="bt-card">
          <div className="bt-stat-label"><Receipt size={15} /> Bu ay harcamanız</div>
          <div className="bt-stat-deger bt-display">{fmt(buAyHarcama.toplam)}</div>
          <div className="bt-stat-alt">{buAyHarcama.adet} kayıt</div>
        </section>
      </div>

      {bankalar.length > 0 && (
        <section className="bt-card">
          <div className="bt-cardhead">
            <h2 className="bt-h2"><Building2 size={16} color="var(--muted)" /> Banka bazında yükünüz</h2>
          </div>
          <div className="bt-stack" style={{ gap: 8 }}>
            {bankalar.map(([banka, b]) => (
              <div key={banka} className="bt-banka">
                <div className="bt-satir-ana">
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <span className="bt-satir-baslik">{banka}</span>
                    <span className="bt-satir-tutar">{fmt(b.toplam)}</span>
                  </div>
                  <div className="bt-banka-serit" style={{ maxWidth: (b.toplam / enBuyukBanka) * 100 + "%" }}>
                    {["kart", "kredi", "ek", "diger"].map((t) =>
                      b[t] > 0 ? <div key={t} style={{ width: (b[t] / b.toplam) * 100 + "%", background: TUR_META[t].renk }} /> : null
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="bt-card">
        <div className="bt-cardhead">
          <h2 className="bt-h2"><CalendarClock size={16} /> Yaklaşan ödemeler</h2>
        </div>
        {yaklasan.length === 0 ? (
          <div className="bt-bos">
            <CalendarClock size={28} />
            <div>
              Henüz ödeme takvimi yok.{" "}
              <button className="bt-link" onClick={() => setSekme("borclar")}>Borçlar sekmesinden</button> kart ve kredilerinizi ekleyin.
            </div>
          </div>
        ) : (
          <div className="bt-stack" style={{ gap: 8 }}>
            {yaklasan.map((o) => {
              const gun = kalanGun(o.tarih);
              const gecikti = gun < 0 && !o.odendi;
              const meta = TUR_META[o.ikon];
              return (
                <div key={o.id} className={"bt-satir" + (o.odendi ? " odendi" : "") + (gecikti ? " gecikti" : "")}>
                  <div className="bt-avatar" style={{ background: meta.renk + "22" }}>
                    <meta.Ikon size={18} color={meta.renk} />
                  </div>
                  <div className="bt-satir-ana">
                    <div className="bt-satir-baslik" style={{ textDecoration: o.odendi ? "line-through" : "none" }}>{o.ad}</div>
                    <div className="bt-satir-alt" style={{ color: gecikti ? "var(--danger)" : undefined }}>
                      {o.tarih.getDate()} {AYLAR[o.tarih.getMonth()]} · {o.odendi ? "ödendi" : gecikti ? (-gun) + " gün gecikti" : gun === 0 ? "bugün son gün" : gun + " gün kaldı"}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="bt-satir-tutar">{fmt(o.tutar)}</div>
                    <div className="bt-not">{o.not}</div>
                  </div>
                  <button className="bt-btn kucuk ikincil" onClick={() => odendiIsaretle(o.anahtar, !o.odendi)}>
                    {o.odendi ? <><RotateCcw size={13} /> Geri al</> : <><Check size={13} /> Ödendi</>}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

/* ---------------- Borç Planı ---------------- */
function Plan({ kalemler, aylikFaiz, setSekme }) {
  const [strateji, setStrateji] = useState("cig");
  const [ekstra, setEkstra] = useState("");

  const doner = kalemler.filter((k) => !k.sabitTaksit); // kart + KMH: faiz işleyen borçlar
  const sabit = kalemler.filter((k) => k.sabitTaksit);

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
      <div className="bt-bos" style={{ padding: 50 }}>
        <Target size={30} />
        <div>
          Plan oluşturmak için önce{" "}
          <button className="bt-link" onClick={() => setSekme("borclar")}>Borçlar sekmesinden</button> borçlarınızı ekleyin.
        </div>
      </div>
    );

  return (
    <div className="bt-stack">
      <div className="bt-ipucu">
        <Lightbulb size={16} color="var(--mint)" />
        <div>
          <b>Çığ yöntemi</b> önce en yüksek faizli borcu kapatır — matematiksel olarak en az faiz ödersiniz.{" "}
          <b>Kartopu yöntemi</b> önce en küçük borcu kapatır — hızlı kapanan borçlar motivasyon verir.
          Her ikisinde de kural aynı: diğer borçların asgarisini/taksitini aksatmadan, artan her kuruşu sıradaki tek hedefe yığın.
        </div>
      </div>

      <section className="bt-card">
        <div className="bt-cardhead">
          <h2 className="bt-h2"><Target size={16} color="var(--mint)" /> Kapatma sıranız</h2>
          <div className="bt-secici">
            <button className={strateji === "cig" ? "aktif" : ""} onClick={() => setStrateji("cig")}>
              <Flame size={14} color="var(--danger)" /> Çığ
            </button>
            <button className={strateji === "kartopu" ? "aktif" : ""} onClick={() => setStrateji("kartopu")}>
              <Snowflake size={14} color="var(--kart)" /> Kartopu
            </button>
          </div>
        </div>

        {doner.length === 0 ? (
          <div className="bt-bos"><Check size={26} /><div>Faiz işleyen (kart / KMH) borcunuz yok — kalan borçlarınız sabit taksitli.</div></div>
        ) : (
          <div className="bt-stack" style={{ gap: 8 }}>
            {sirali.map((k, i) => {
              const meta = TUR_META[k.tur];
              const kFaiz = (k.bakiye * k.faiz) / 100;
              return (
                <div key={k.id} className={"bt-satir" + (i === 0 ? " hedef" : "")}>
                  <div className={"bt-sira" + (i === 0 ? " bir" : "")}>{i + 1}</div>
                  <div className="bt-avatar" style={{ background: meta.renk + "22" }}>
                    <meta.Ikon size={18} color={meta.renk} />
                  </div>
                  <div className="bt-satir-ana">
                    <div className="bt-satir-baslik">{k.ad} {i === 0 && <span style={{ color: "var(--mint)", fontWeight: 700 }}>← önce bunu kapatın</span>}</div>
                    <div className="bt-satir-alt">
                      Aylık %{k.faiz}{k.faizTahmini && (k.gecikmis ? " (TCMB yasal azami GECİKME oranı — ödeme tarihi geçmiş)" : " (TCMB yasal azami oranı — gerçek oranınız daha düşük olabilir, biliyorsanız Borçlar'dan girin)")} · ayda ≈ {fmt0(kFaiz)} faiz işliyor
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
            <div className="bt-not" style={{ margin: "14px 0 8px", fontSize: 12 }}>
              Sıralamanın dışındakiler — sabit taksitli krediler (taksitleri aksatmayın; erken kapatma çoğu bankada ücrete tabidir) ve faiz oranı girilmemiş gecikmiş borçlar (faizini girerseniz sıralamaya dahil olur):
            </div>
            <div className="bt-stack" style={{ gap: 6 }}>
              {sabit.map((k) => {
                const meta = TUR_META[k.tur];
                return (
                  <div key={k.id} className="bt-satir" style={{ opacity: 0.75 }}>
                    <div className="bt-avatar" style={{ background: meta.renk + "22" }}>
                      <meta.Ikon size={18} color={meta.renk} />
                    </div>
                    <div className="bt-satir-ana"><div className="bt-satir-baslik">{k.ad}</div></div>
                    <div className="bt-satir-tutar">{fmt(k.bakiye)}</div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>

      {hedef && (
        <section className="bt-card">
          <div className="bt-cardhead">
            <h2 className="bt-h2"><Percent size={16} color="var(--amber)" /> Ekstra ödeme simülasyonu</h2>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
            <label className="bt-alan" style={{ maxWidth: 240 }}>
              Elinize geçen ekstra tutar (₺)
              <input className="bt-input" type="number" min={0} placeholder="örn. 5000"
                value={ekstra} onChange={(e) => setEkstra(e.target.value)} />
            </label>
          </div>
          {ekstraTutar > 0 && (
            <div className="bt-ipucu" style={{ marginTop: 14 }}>
              <Target size={16} color="var(--mint)" />
              <div>
                Bu parayı <b>{hedef.ad}</b> borcuna yatırın → her ay yaklaşık <b>{fmt0(kurtarilan)}</b> faiz ödemekten kurtulursunuz
                {ekstraTutar >= hedef.bakiye && <> ve bu borç <b>tamamen kapanır</b> — sıradaki hedefiniz {sirali[1] ? <b>{sirali[1].ad}</b> : "kalmıyor, tebrikler"}</>}.
              </div>
            </div>
          )}
        </section>
      )}

      {aylikFaiz > 0 && (
        <div className="bt-not" style={{ textAlign: "center" }}>
          Hesaplamalar basitleştirilmiş tahminlerdir (vergi ve fonlar hariç); kesin tutarlar için bankanızın ekstresini esas alın.
        </div>
      )}
    </div>
  );
}

/* ---------------- Borçlar ---------------- */
function Borclar({ veri, form, setForm, ekleGuncelle, sil }) {
  const toplamLimit = veri.cards.reduce((t, k) => t + (+k.limit || 0), 0);
  const toplamKullanilabilir = veri.cards.reduce((t, k) => t + (+k.kullanilabilirLimit || 0), 0);
  const toplamKartBorc = veri.cards.reduce((t, k) => t + (+k.donemIciToplam > 0 ? +k.donemIciToplam : +k.borc || 0), 0);
  const kullanim = toplamLimit > 0
    ? Math.round(((toplamKullanilabilir > 0 ? toplamLimit - toplamKullanilabilir : toplamKartBorc) / toplamLimit) * 100)
    : null;

  return (
    <div className="bt-stack" style={{ gap: 20 }}>
      <BorcBolumu
        baslik="Kredi kartları" tur="kart" liste="cards" kayitlar={veri.cards}
        form={form} setForm={setForm} ekleGuncelle={ekleGuncelle} sil={sil}
        ozet={kullanim !== null ? "Toplam limitin %" + kullanim + "'i kullanımda" : null}
        alanlar={[
          { k: "banka", e: "Banka", t: "text", z: true },
          { k: "ad", e: "Kart adı (Bonus, World…)", t: "text" },
          { k: "donemIciToplam", e: "Güncel toplam borç (₺)", t: "number", z: true },
          { k: "limit", e: "Toplam limit (₺)", t: "number" },
          { k: "kullanilabilirLimit", e: "Kullanılabilir limit (₺)", t: "number" },
          { k: "borc", e: "Bu ekstrenin borcu (varsa)", t: "number" },
          { k: "asgari", e: "Asgari / minimum ödeme (varsa, yoksa 0)", t: "number" },
          { k: "faiz", e: "Aylık akdi faiz (%) (varsa)", t: "number" },
          { k: "kesimGunu", e: "Ekstre kesim günü (varsa)", t: "number" },
          { k: "sonOdemeTarihi", e: "Son ödeme tarihi", t: "date", z: true },
        ]}
        aciklama={'Tek zorunlu rakam: bankanızın ekranındaki ana borç tutarı ("Toplam Borç", "Kalan Borç" ya da "Dönem İçi Toplamı" — hangi isimle geçiyorsa) — hiçbir çıkarma/toplama yapmadan olduğu gibi yapıştırın. Diğer alanlar varsa daha hassas takip sağlar, yoksa boş bırakın.'}
        satir={(k) => {
          const guncelBorc = +k.donemIciToplam > 0 ? +k.donemIciToplam : +k.borc || 0;
          const kullanilabilirVar = +k.kullanilabilirLimit > 0;
          const kullanilanTutar = kullanilabilirVar ? (+k.limit || 0) - (+k.kullanilabilirLimit) : guncelBorc;
          const kullanimOran = +k.limit > 0 ? kullanilanTutar / +k.limit : null;
          return (
            <>
              <div className="bt-satir-ana">
                <div className="bt-satir-baslik">{k.banka}{k.ad && <span style={{ color: "var(--muted)", fontWeight: 500 }}> · {k.ad}</span>}</div>
                <div className="bt-satir-alt">
                  Son ödeme: {k.sonOdemeTarihi ? k.sonOdemeTarihi.split("-").reverse().join(".") : (k.sonOdemeGunu ? "her ayın " + k.sonOdemeGunu + ". günü" : "—")}
                  {+k.asgari > 0 ? <> · asgari {fmt(k.asgari)}</> : " · asgari yok"}
                  {+k.faiz > 0 && <> · aylık %{k.faiz}</>}
                </div>
                {+k.borc > 0 && +k.borc !== guncelBorc && (
                  <div className="bt-not" style={{ marginTop: 3 }}>Bu ekstrede ödenecek {fmt(k.borc)} · güncel toplam borç {fmt(guncelBorc)}</div>
                )}
                {kullanimOran !== null && (
                  <>
                    <div className="bt-bar">
                      <div style={{
                        width: Math.min(kullanimOran * 100, 100) + "%",
                        background: kullanimOran > 0.8 ? "var(--danger)" : "var(--kart)",
                      }} />
                    </div>
                    <div className="bt-not" style={{ marginTop: 3 }}>Limitin %{Math.round(kullanimOran * 100)}'i kullanımda</div>
                  </>
                )}
              </div>
              <div className="bt-satir-tutar">{fmt(guncelBorc)}</div>
            </>
          );
        }}
      />
      <BorcBolumu
        baslik="Krediler" tur="kredi" liste="loans" kayitlar={veri.loans}
        form={form} setForm={setForm} ekleGuncelle={ekleGuncelle} sil={sil}
        alanlar={[
          { k: "banka", e: "Banka", t: "text", z: true },
          { k: "ad", e: "Kredi türü (ihtiyaç, taşıt…)", t: "text" },
          { k: "kalanBorc", e: "Kalan toplam borç (₺)", t: "number", z: true },
          { k: "taksit", e: "Aylık taksit (₺)", t: "number", z: true },
          { k: "kalanTaksit", e: "Kalan taksit sayısı", t: "number" },
          { k: "faiz", e: "Aylık faiz oranı (%)", t: "number" },
          { k: "odemeGunu", e: "Ödeme günü", t: "number", z: true },
        ]}
        satir={(k) => (
          <>
            <div className="bt-satir-ana">
              <div className="bt-satir-baslik">{k.banka}{k.ad && <span style={{ color: "var(--muted)", fontWeight: 500 }}> · {k.ad}</span>}</div>
              <div className="bt-satir-alt">
                Taksit {fmt(k.taksit)} · her ayın {k.odemeGunu}. günü{+k.kalanTaksit > 0 && <> · {k.kalanTaksit} taksit kaldı</>}
              </div>
            </div>
            <div className="bt-satir-tutar">{fmt(k.kalanBorc)}</div>
          </>
        )}
      />
      <BorcBolumu
        baslik="Ek hesap / KMH" tur="ek" liste="overdrafts" kayitlar={veri.overdrafts}
        form={form} setForm={setForm} ekleGuncelle={ekleGuncelle} sil={sil}
        alanlar={[
          { k: "banka", e: "Banka", t: "text", z: true },
          { k: "limit", e: "Ek hesap limiti (₺)", t: "number" },
          { k: "kullanilan", e: "Kullanılan tutar (₺)", t: "number", z: true },
          { k: "faiz", e: "Aylık faiz oranı (%)", t: "number" },
        ]}
        satir={(k) => (
          <>
            <div className="bt-satir-ana">
              <div className="bt-satir-baslik">{k.banka}</div>
              <div className="bt-satir-alt">
                {+k.limit > 0 && <>Limit {fmt(k.limit)}</>}
                {+k.faiz > 0 && <> · aylık %{k.faiz} faiz ≈ {fmt0((+k.kullanilan * +k.faiz) / 100)}/ay</>}
              </div>
            </div>
            <div className="bt-satir-tutar">{fmt(k.kullanilan)}</div>
          </>
        )}
      />
      <BorcBolumu
        baslik="Gecikmiş / diğer borçlar" tur="diger" liste="others" kayitlar={veri.others || []}
        form={form} setForm={setForm} ekleGuncelle={ekleGuncelle} sil={sil}
        aciklama="Geçmişten kalan ödenmemiş kart/kredi borçları, yasal takipteki borçlar, vergi, kişiye borç…"
        alanlar={[
          { k: "banka", e: "Alacaklı (banka / kurum / kişi)", t: "text", z: true },
          { k: "ad", e: "Açıklama (2023 kart borcu, icra…)", t: "text" },
          { k: "tutar", e: "Güncel tutar (₺)", t: "number", z: true },
          { k: "faiz", e: "Aylık faiz / gecikme oranı (%)", t: "number" },
        ]}
        satir={(k) => (
          <>
            <div className="bt-satir-ana">
              <div className="bt-satir-baslik">{k.banka}{k.ad && <span style={{ color: "var(--muted)", fontWeight: 500 }}> · {k.ad}</span>}</div>
              <div className="bt-satir-alt">
                {+k.faiz > 0
                  ? <>Aylık %{k.faiz} ≈ {fmt0((+k.tutar * +k.faiz) / 100)}/ay işliyor — kapatma planına dahil</>
                  : "Faiz oranı girilmedi — biliyorsanız girin, kapatma sıralamasına dahil olur"}
              </div>
            </div>
            <div className="bt-satir-tutar">{fmt(k.tutar)}</div>
          </>
        )}
      />
    </div>
  );
}

function BorcBolumu({ baslik, tur, liste, kayitlar, form, setForm, ekleGuncelle, sil, alanlar, satir, ozet, aciklama }) {
  const acik = form && form.liste === liste;
  const [f, setF] = useState({});
  useEffect(() => { if (acik) setF(form.veri || {}); }, [acik, form]);
  const meta = TUR_META[tur];

  function gonder() {
    for (const a of alanlar) if (a.z && !String(f[a.k] ?? "").trim()) return;
    ekleGuncelle(liste, { id: f.id || uid(), ...f });
  }

  return (
    <section className="bt-card">
      <div className="bt-cardhead">
        <h2 className="bt-h2"><meta.Ikon size={16} color={meta.renk} /> {baslik}</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {ozet && <span className="bt-not">{ozet}</span>}
          {!acik && (
            <button className="bt-btn kucuk ikincil" onClick={() => setForm({ liste, veri: {} })}>
              <Plus size={14} /> Ekle
            </button>
          )}
        </div>
      </div>

      {aciklama && <div className="bt-not" style={{ marginTop: -6, marginBottom: 12 }}>{aciklama}</div>}

      {acik && (
        <div className="bt-form">
          <div className="bt-alanlar">
            {alanlar.map((a) => (
              <label key={a.k} className="bt-alan">
                {a.e}{a.z ? " *" : ""}
                <input className="bt-input" type={a.t} min={a.t === "number" ? 0 : undefined}
                  step={a.k === "faiz" ? "0.01" : undefined}
                  list={a.k === "banka" ? "bt-bankalar" : undefined}
                  placeholder={a.k === "banka" ? "Seçin veya yazın" : undefined}
                  value={f[a.k] ?? ""} onChange={(e) => setF({ ...f, [a.k]: e.target.value })} />
              </label>
            ))}
          </div>
          <div className="bt-form-butonlar">
            <button className="bt-btn birincil" onClick={gonder}><Check size={14} /> {f.id ? "Güncelle" : "Kaydet"}</button>
            <button className="bt-btn ikincil" onClick={() => setForm(null)}>Vazgeç</button>
          </div>
        </div>
      )}

      {kayitlar.length === 0 && !acik ? (
        <div className="bt-bos">
          <meta.Ikon size={26} />
          <div>Henüz kayıt yok. "Ekle" ile başlayın.</div>
        </div>
      ) : (
        <div className="bt-stack" style={{ gap: 8 }}>
          {kayitlar.map((k) => (
            <div key={k.id} className="bt-satir">
              <div className="bt-avatar" style={{ background: meta.renk + "22" }}>
                <meta.Ikon size={18} color={meta.renk} />
              </div>
              {satir(k)}
              <div style={{ display: "flex", gap: 2 }}>
                <button className="bt-btn hayalet" title="Düzenle" onClick={() => setForm({ liste, veri: k })}><Pencil size={15} /></button>
                <button className="bt-btn hayalet tehlike" title="Sil" onClick={() => sil(liste, k.id)}><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ---------------- Harcamalar ---------------- */
function Harcamalar({ veri, form, setForm, harcamaKaydet, sil, buAyHarcama }) {
  const acik = form && form.liste === "expenses";
  const [f, setF] = useState({});
  const [kartaEkle, setKartaEkle] = useState(false);
  useEffect(() => {
    if (acik) {
      setF(form.veri.id ? form.veri : { tarih: new Date().toISOString().slice(0, 10), kategori: "Market", ...form.veri });
      setKartaEkle(false);
    }
  }, [acik, form]);

  const kartEtiketleri = useMemo(() => veri.cards.map((k) => k.banka + " · " + (k.ad || "Kredi kartı")), [veri.cards]);
  const kaynakKartMi = kartEtiketleri.includes(f.kaynak);

  const sirali = useMemo(() => [...veri.expenses].sort((a, b) => (b.tarih || "").localeCompare(a.tarih || "")), [veri.expenses]);
  const enBuyuk = Math.max(...Object.values(buAyHarcama.kategoriler), 1);

  function gonder() {
    if (!f.tutar || !f.tarih) return;
    harcamaKaydet({ id: f.id || uid(), ...f, tutar: +f.tutar }, kaynakKartMi && kartaEkle && !f.id);
  }

  return (
    <div className="bt-stack">
      <section className="bt-card">
        <div className="bt-cardhead">
          <h2 className="bt-h2"><Receipt size={16} color="var(--mint)" /> Harcamalar</h2>
          {!acik && (
            <button className="bt-btn kucuk birincil" onClick={() => setForm({ liste: "expenses", veri: {} })}>
              <Plus size={14} /> Yeni harcama
            </button>
          )}
        </div>
        {acik && (
          <div className="bt-form">
            <div className="bt-alanlar">
              <label className="bt-alan">Tutar (₺) *
                <input className="bt-input" type="number" min={0} value={f.tutar ?? ""} onChange={(e) => setF({ ...f, tutar: e.target.value })} />
              </label>
              <label className="bt-alan">Tarih *
                <input className="bt-input" type="date" value={f.tarih ?? ""} onChange={(e) => setF({ ...f, tarih: e.target.value })} />
              </label>
              <label className="bt-alan">Ödeme kaynağı
                <select className="bt-input" value={f.kaynak ?? ""} onChange={(e) => setF({ ...f, kaynak: e.target.value })}>
                  <option value="">Seçin…</option>
                  <option value="Nakit">Nakit</option>
                  <optgroup label="Kredi kartları">
                    {veri.cards.length > 0 ? (
                      veri.cards.map((k) => {
                        const ad = k.banka + " · " + (k.ad || "Kredi kartı");
                        return <option key={k.id} value={ad}>{ad}</option>;
                      })
                    ) : (
                      <option disabled>Henüz kart yok — Borçlar sekmesinden ekleyin</option>
                    )}
                  </optgroup>
                  <optgroup label="Banka hesabı / banka kartı">
                    {BANKALAR.map((b) => <option key={b} value={b + " · Hesap"}>{b} · Hesap</option>)}
                  </optgroup>
                </select>
              </label>
              <label className="bt-alan">Kategori
                <select className="bt-input" value={f.kategori ?? "Market"} onChange={(e) => setF({ ...f, kategori: e.target.value })}>
                  {KATEGORILER.map((k) => <option key={k}>{k}</option>)}
                </select>
              </label>
              <label className="bt-alan">Açıklama
                <input className="bt-input" type="text" placeholder="ör. haftalık market" value={f.aciklama ?? ""} onChange={(e) => setF({ ...f, aciklama: e.target.value })} />
              </label>
            </div>
            {kaynakKartMi && !f.id && (
              <label style={{ display: "flex", alignItems: "flex-start", gap: 9, marginTop: 12, fontSize: 13, color: "var(--muted)", cursor: "pointer" }}>
                <input type="checkbox" checked={kartaEkle} onChange={(e) => setKartaEkle(e.target.checked)} style={{ marginTop: 2, accentColor: "#43D9A3" }} />
                <span>
                  Bu tutarı <b style={{ color: "var(--text)" }}>{f.kaynak}</b> kartının borcuna da ekle.
                  <span className="bt-not" style={{ display: "block", marginTop: 2 }}>
                    Kart borcunu her ay ekstreden elle güncelliyorsanız işaretlemeyin — tutar iki kez sayılır.
                  </span>
                </span>
              </label>
            )}
            <div className="bt-form-butonlar">
              <button className="bt-btn birincil" onClick={gonder}><Check size={14} /> {f.id ? "Güncelle" : "Kaydet"}</button>
              <button className="bt-btn ikincil" onClick={() => setForm(null)}>Vazgeç</button>
            </div>
          </div>
        )}
        {!acik && sirali.length === 0 && (
          <div className="bt-bos"><Receipt size={26} /><div>Henüz harcama kaydı yok.</div></div>
        )}
      </section>

      {Object.keys(buAyHarcama.kategoriler).length > 0 && (
        <section className="bt-card">
          <div className="bt-cardhead">
            <h2 className="bt-h2"><PieChart size={16} color="var(--mint)" /> Bu ay kategori dağılımı</h2>
            <div className="bt-not">{fmt(buAyHarcama.toplam)} toplam</div>
          </div>
          {Object.entries(buAyHarcama.kategoriler).sort((a, b) => b[1] - a[1]).map(([kat, tutar]) => (
            <div key={kat} className="bt-kat">
              <div className="bt-kat-ad">{kat}</div>
              <div className="bt-kat-bar"><div style={{ width: (tutar / enBuyuk) * 100 + "%" }} /></div>
              <div className="bt-kat-tutar">{fmt(tutar)}</div>
            </div>
          ))}
        </section>
      )}

      {Object.keys(buAyHarcama.kaynaklar).length > 0 && (
        <section className="bt-card">
          <div className="bt-cardhead">
            <h2 className="bt-h2"><Wallet size={16} color="var(--kart)" /> Bu ay hangi bankadan ne kadar harcadınız</h2>
          </div>
          {Object.entries(buAyHarcama.kaynaklar).sort((a, b) => b[1] - a[1]).map(([kaynak, tutar]) => {
            const enBuyukK = Math.max(...Object.values(buAyHarcama.kaynaklar), 1);
            return (
              <div key={kaynak} className="bt-kat">
                <div className="bt-kat-ad" style={{ width: 150 }}>{kaynak}</div>
                <div className="bt-kat-bar"><div style={{ width: (tutar / enBuyukK) * 100 + "%", background: "linear-gradient(90deg,var(--kart),#3E6BC9)" }} /></div>
                <div className="bt-kat-tutar">{fmt(tutar)}</div>
              </div>
            );
          })}
        </section>
      )}

      {sirali.length > 0 && (
        <section className="bt-card">
          <div className="bt-cardhead"><h2 className="bt-h2">Son harcamalar</h2></div>
          <div className="bt-stack" style={{ gap: 7 }}>
            {sirali.slice(0, 50).map((h) => (
              <div key={h.id} className="bt-satir">
                <div className="bt-satir-ana">
                  <div className="bt-satir-baslik">
                    {h.kategori}{h.aciklama && <span style={{ color: "var(--muted)", fontWeight: 500 }}> · {h.aciklama}</span>}
                  </div>
                  <div className="bt-satir-alt">{h.tarih && h.tarih.split("-").reverse().join(".")}{h.kaynak && <> · {h.kaynak}</>}</div>
                </div>
                <div className="bt-satir-tutar">{fmt(h.tutar)}</div>
                <div style={{ display: "flex", gap: 2 }}>
                  <button className="bt-btn hayalet" title="Düzenle" onClick={() => setForm({ liste: "expenses", veri: h })}><Pencil size={15} /></button>
                  <button className="bt-btn hayalet tehlike" title="Sil" onClick={() => sil("expenses", h.id)}><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
