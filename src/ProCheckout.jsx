import React, { useEffect, useState } from "react";
import { Check, ChevronLeft, ShieldCheck } from "lucide-react";
import { useSession } from "./Auth.jsx";
import {
  revenueCatHazir,
  revenueCatProKontrol,
  revenueCatProPaketleri,
  revenueCatProSatinAl,
  revenueCatSatinAlimlariGeriYukle,
} from "./revenuecat.js";
import { nativeMi } from "./platform.js";
import {
  proNiyetiniKaydet,
  proNiyetiniOku,
  proNiyetiniTemizle,
} from "./proIntent.js";
import { googleAdsSatinAlmaDonusumu } from "./googleAds.js";
import { t } from "./i18n.js";
import Ceviri from "./Ceviri.jsx";
import { revenueCatProHakkiniSenkronizeEt } from "./revenuecatSync.js";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@600;700&display=swap');
.pc-page,.pc-page *{box-sizing:border-box}.pc-page{min-height:100vh;padding:28px 18px 50px;background:radial-gradient(circle at 88% 12%,#ff6f5955 0 9%,transparent 9.3%),linear-gradient(135deg,#f4efe0 0 68%,#d8e6df 68%);color:#14160f;font-family:'Space Grotesk',sans-serif}.pc-shell{width:min(100%,1000px);margin:auto}.pc-head{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:34px}.pc-logo{width:185px;height:auto}.pc-back{display:inline-flex;align-items:center;gap:7px;border:2px solid #14160f;border-radius:999px;padding:10px 15px;background:#fff;color:#14160f;text-decoration:none;font-weight:800;font-size:13px}.pc-card{display:grid;grid-template-columns:minmax(0,1.08fr) minmax(320px,.92fr);overflow:hidden;border:3px solid #14160f;border-radius:30px;background:#fff;box-shadow:12px 12px 0 #ff6f59}.pc-copy{padding:clamp(30px,5vw,58px)}.pc-badge{display:inline-flex;align-items:center;gap:7px;padding:7px 11px;border:2px solid #14160f;border-radius:999px;background:#cdf564;font:700 11px 'JetBrains Mono',monospace;letter-spacing:.04em}.pc-copy h1{font:400 clamp(38px,6vw,68px)/.98 'Archivo Black',sans-serif;margin:22px 0 18px;letter-spacing:-.035em}.pc-copy>p{color:#55584c;line-height:1.65;font-size:16px;max-width:560px}.pc-list{display:grid;gap:13px;padding:0;margin:28px 0 0;list-style:none}.pc-list li{display:flex;gap:10px;align-items:flex-start;font-weight:650}.pc-list svg{flex:0 0 auto;margin-top:2px;color:#315c47}.pc-pay{padding:clamp(24px,4vw,42px);background:#073b2d;color:#fff;display:flex;flex-direction:column;justify-content:center}.pc-pay h2{margin:0 0 7px;font-size:22px}.pc-pay-sub{margin:0 0 20px;color:#c8d9d2;font-size:13px;line-height:1.5}.pc-toggle{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:5px;border:2px solid #fff;border-radius:999px;margin-bottom:24px}.pc-toggle button{min-height:43px;border:0;border-radius:999px;background:transparent;color:#d9e4df;font:800 13px 'Space Grotesk',sans-serif;cursor:pointer}.pc-toggle button.active{background:#cdf564;color:#14160f}.pc-price{display:flex;align-items:flex-end;gap:8px;margin-bottom:8px}.pc-price strong{font:400 clamp(35px,5vw,52px)/1 'Archivo Black',sans-serif}.pc-price span{padding-bottom:6px;color:#c8d9d2;font-weight:700}.pc-plan-ad{margin:0 0 4px;color:#fff;font-size:13px;font-weight:800}.pc-renew{margin:0 0 24px;color:#c8d9d2;font-size:12px}.pc-primary,.pc-secondary{width:100%;min-height:52px;border:2px solid #14160f;border-radius:999px;font:800 14px 'Space Grotesk',sans-serif;cursor:pointer}.pc-primary{background:#cdf564;color:#14160f;box-shadow:5px 5px 0 #ff6f59}.pc-primary:disabled{opacity:.6;cursor:wait}.pc-secondary{margin-top:15px;background:transparent;color:#fff;border-color:#9bb4aa}.pc-note{display:flex;align-items:flex-start;gap:8px;margin:17px 0 0;color:#c8d9d2;font-size:11.5px;line-height:1.5}.pc-note svg{flex:0 0 auto}.pc-error{margin:0 0 15px;padding:11px 13px;border:2px solid #ff6f59;border-radius:12px;background:#ff6f5922;color:#ffd9d2;font-size:12px}.pc-loading{min-height:100vh;display:grid;place-items:center;background:#f4efe0;font-family:'Space Grotesk',sans-serif;color:#55584c}@media(max-width:760px){.pc-page{padding:18px 11px 35px}.pc-head{margin-bottom:20px}.pc-logo{width:145px}.pc-back{padding:9px 12px}.pc-card{grid-template-columns:1fr;border-radius:22px;box-shadow:7px 7px 0 #ff6f59}.pc-copy{padding:28px 22px}.pc-copy h1{font-size:38px}.pc-copy>p{font-size:14px}.pc-pay{padding:27px 22px 30px}.pc-list{margin-top:22px}}
`;

function Yukleniyor() {
  return <div className="pc-loading">{t("pro.hazirlaniyor")}</div>;
}

export default function ProCheckout() {
  const session = useSession();
  const [plan, setPlan] = useState(() => proNiyetiniOku() || "monthly");
  const [paketler, setPaketler] = useState({ yukleniyor: true, monthly: null, annual: null });
  const [durum, setDurum] = useState({ yukleniyor: false, hata: "" });

  useEffect(() => {
    if (!session?.user?.id) return;
    let aktif = true;
    (async () => {
      try {
        const [fiyatlar, pro] = await Promise.all([
          revenueCatProPaketleri(session.user.id),
          revenueCatProKontrol(session.user.id),
        ]);
        if (!aktif) return;
        if (pro.active) {
          proNiyetiniTemizle();
          window.location.replace("/welcome");
          return;
        }
        setPaketler({ yukleniyor: false, monthly: fiyatlar.monthly, annual: fiyatlar.annual });
      } catch {
        if (aktif) {
          setPaketler({ yukleniyor: false, monthly: null, annual: null });
          setDurum({ yukleniyor: false, hata: t("pro.hata.fiyatAlinamadi") });
        }
      }
    })();
    return () => { aktif = false; };
  }, [session]);

  if (session === undefined) return <Yukleniyor />;
  if (!session) {
    const hedef = encodeURIComponent(`/upgrade?plan=${plan}`);
    window.location.replace(`/login?redirect=${hedef}&plan=${plan}`);
    return <Yukleniyor />;
  }

  const secili = paketler[plan];
  const fiyat = secili?.formattedPrice;

  function planSec(yeniPlan) {
    setPlan(yeniPlan);
    proNiyetiniKaydet(yeniPlan);
    window.history.replaceState({}, "", `/upgrade?plan=${yeniPlan}`);
  }

  async function satinAl() {
    setDurum({ yukleniyor: true, hata: "" });
    try {
      const sonuc = await revenueCatProSatinAl({
        userId: session.user.id,
        email: session.user.email,
        plan,
      });
      if (sonuc.cancelled) {
        setDurum({ yukleniyor: false, hata: "" });
        return;
      }
      if (!sonuc.active) throw new Error("Satın alma doğrulanamadı");
      if (!nativeMi) await googleAdsSatinAlmaDonusumu(sonuc);
      await revenueCatProHakkiniSenkronizeEt();
      proNiyetiniTemizle();
      window.location.assign("/welcome");
    } catch {
      setDurum({ yukleniyor: false, hata: t("pro.hata.odemeAcilamadi") });
    }
  }

  // App Store Guideline 3.1.1: satin alimlari geri yukleme yolu zorunludur.
  async function satinAlimlariGeriYukle() {
    setDurum({ yukleniyor: true, hata: "" });
    try {
      const sonuc = await revenueCatSatinAlimlariGeriYukle(session.user.id);
      if (sonuc.active) {
        await revenueCatProHakkiniSenkronizeEt();
        proNiyetiniTemizle();
        window.location.assign("/welcome");
        return;
      }
      setDurum({
        yukleniyor: false,
        hata: t("pro.hata.geriYuklenecekYok"),
      });
    } catch {
      setDurum({
        yukleniyor: false,
        hata: t("pro.hata.geriYuklenemedi"),
      });
    }
  }

  function ucretsizDevam() {
    proNiyetiniTemizle();
    window.location.assign("/summary");
  }

  return (
    <main className="pc-page">
      <style>{CSS}</style>
      <div className="pc-shell">
        <header className="pc-head">
          <img className="pc-logo" src="/borcama-logo.png" alt="Borcama" />
          {!nativeMi && (
            <a className="pc-back" href="/?plan=free" onClick={proNiyetiniTemizle}>
              <ChevronLeft size={15} /> Ana sayfa
            </a>
          )}
        </header>
        <section className="pc-card">
          <div className="pc-copy">
            <h1 style={{ marginTop: 0 }}>{t("pro.baslik")}</h1>
            <p>{t("pro.aciklama")}</p>
            <ul className="pc-list">
              <li><Check size={18} /> {t("pro.ozellik.oneriler")}</li>
              <li><Check size={18} /> {t("pro.ozellik.faizAnalizi")}</li>
              <li><Check size={18} /> {t("pro.ozellik.senaryolar")}</li>
              <li><Check size={18} /> {t("pro.ozellik.abonelikYonetimi")}</li>
            </ul>
          </div>
          <div className="pc-pay">
            <h2>{t("pro.odeme.baslik")}</h2>
            <p className="pc-pay-sub">{t("pro.odeme.altBaslik")}</p>
            <div className="pc-toggle" role="group" aria-label={t("pro.donem.etiket")}>
              <button className={plan === "monthly" ? "active" : ""} onClick={() => planSec("monthly")} type="button">{t("pro.donem.aylik")}</button>
              <button className={plan === "annual" ? "active" : ""} onClick={() => planSec("annual")} type="button">{t("pro.donem.yillik")}</button>
            </div>
            <div className="pc-price">
              <strong>{fiyat || (paketler.yukleniyor ? "…" : "—")}</strong>
              <span>{plan === "annual" ? t("pro.fiyat.yil") : t("pro.fiyat.ay")}</span>
            </div>
            <p className="pc-plan-ad">
              {plan === "annual" ? t("pro.planAdi.yillik") : t("pro.planAdi.aylik")}
            </p>
            <p className="pc-renew">{t("pro.yenileme")}</p>
            {durum.hata && <div className="pc-error">{durum.hata}</div>}
            <button className="pc-primary" type="button" disabled={!revenueCatHazir || paketler.yukleniyor || !fiyat || durum.yukleniyor} onClick={satinAl}>
              {durum.yukleniyor ? t("pro.odemeAciliyor") : t("pro.odemeyeGec")}
            </button>
            <button className="pc-secondary" type="button" onClick={ucretsizDevam}>{t("pro.uygulamayaDon")}</button>
            {nativeMi && (
              <button
                className="pc-secondary"
                type="button"
                disabled={durum.yukleniyor}
                onClick={satinAlimlariGeriYukle}
              >
                {t("pro.geriYukle")}
              </button>
            )}
            <p className="pc-note"><ShieldCheck size={15} /> {nativeMi ? t("pro.not.native") : "Kart bilgilerin Borcama tarafından saklanmaz. Ödeme güvenli ödeme sağlayıcısı üzerinden tamamlanır."}</p>
            <div
              style={{
                marginTop: 12,
                textAlign: "center",
                color: "#9fb4ab",
                fontSize: 11,
                lineHeight: 1.5,
              }}
            >
              <Ceviri
                anahtar="pro.yasal.cumle"
                degerler={{
                  sozlesme: (
                    <a href="/terms" target="_blank" rel="noreferrer" style={{ color: "#fff", fontWeight: 700 }}>
                      {t("pro.yasal.sozlesme")}
                    </a>
                  ),
                  gizlilik: (
                    <a href="/privacy" target="_blank" rel="noreferrer" style={{ color: "#fff", fontWeight: 700 }}>
                      {t("pro.yasal.gizlilik")}
                    </a>
                  ),
                  iade: (
                    <a href="/refund-policy" target="_blank" rel="noreferrer" style={{ color: "#fff", fontWeight: 700 }}>
                      {t("pro.yasal.iade")}
                    </a>
                  ),
                }}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
