import React, { useEffect, useState } from "react";
import { Check, ChevronLeft, ShieldCheck } from "lucide-react";
import { useSession } from "./Auth.jsx";
import {
  revenueCatHazir,
  revenueCatProKontrol,
  revenueCatProPaketleri,
  revenueCatProSatinAl,
} from "./revenuecat.js";
import {
  proNiyetiniKaydet,
  proNiyetiniOku,
  proNiyetiniTemizle,
} from "./proIntent.js";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@600;700&display=swap');
.pc-page,.pc-page *{box-sizing:border-box}.pc-page{min-height:100vh;padding:28px 18px 50px;background:radial-gradient(circle at 88% 12%,#ff6f5955 0 9%,transparent 9.3%),linear-gradient(135deg,#f4efe0 0 68%,#d8e6df 68%);color:#14160f;font-family:'Space Grotesk',sans-serif}.pc-shell{width:min(100%,1000px);margin:auto}.pc-head{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:34px}.pc-logo{width:185px;height:auto}.pc-back{display:inline-flex;align-items:center;gap:7px;border:2px solid #14160f;border-radius:999px;padding:10px 15px;background:#fff;color:#14160f;text-decoration:none;font-weight:800;font-size:13px}.pc-card{display:grid;grid-template-columns:minmax(0,1.08fr) minmax(320px,.92fr);overflow:hidden;border:3px solid #14160f;border-radius:30px;background:#fff;box-shadow:12px 12px 0 #ff6f59}.pc-copy{padding:clamp(30px,5vw,58px)}.pc-badge{display:inline-flex;align-items:center;gap:7px;padding:7px 11px;border:2px solid #14160f;border-radius:999px;background:#cdf564;font:700 11px 'JetBrains Mono',monospace;letter-spacing:.04em}.pc-copy h1{font:400 clamp(38px,6vw,68px)/.98 'Archivo Black',sans-serif;margin:22px 0 18px;letter-spacing:-.035em}.pc-copy>p{color:#55584c;line-height:1.65;font-size:16px;max-width:560px}.pc-list{display:grid;gap:13px;padding:0;margin:28px 0 0;list-style:none}.pc-list li{display:flex;gap:10px;align-items:flex-start;font-weight:650}.pc-list svg{flex:0 0 auto;margin-top:2px;color:#315c47}.pc-pay{padding:clamp(24px,4vw,42px);background:#073b2d;color:#fff;display:flex;flex-direction:column;justify-content:center}.pc-pay h2{margin:0 0 7px;font-size:22px}.pc-pay-sub{margin:0 0 20px;color:#c8d9d2;font-size:13px;line-height:1.5}.pc-toggle{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:5px;border:2px solid #fff;border-radius:999px;margin-bottom:24px}.pc-toggle button{min-height:43px;border:0;border-radius:999px;background:transparent;color:#d9e4df;font:800 13px 'Space Grotesk',sans-serif;cursor:pointer}.pc-toggle button.active{background:#cdf564;color:#14160f}.pc-price{display:flex;align-items:flex-end;gap:8px;margin-bottom:8px}.pc-price strong{font:400 clamp(35px,5vw,52px)/1 'Archivo Black',sans-serif}.pc-price span{padding-bottom:6px;color:#c8d9d2;font-weight:700}.pc-renew{margin:0 0 24px;color:#c8d9d2;font-size:12px}.pc-primary,.pc-secondary{width:100%;min-height:52px;border:2px solid #14160f;border-radius:999px;font:800 14px 'Space Grotesk',sans-serif;cursor:pointer}.pc-primary{background:#cdf564;color:#14160f;box-shadow:5px 5px 0 #ff6f59}.pc-primary:disabled{opacity:.6;cursor:wait}.pc-secondary{margin-top:15px;background:transparent;color:#fff;border-color:#9bb4aa}.pc-note{display:flex;align-items:flex-start;gap:8px;margin:17px 0 0;color:#c8d9d2;font-size:11.5px;line-height:1.5}.pc-note svg{flex:0 0 auto}.pc-error{margin:0 0 15px;padding:11px 13px;border:2px solid #ff6f59;border-radius:12px;background:#ff6f5922;color:#ffd9d2;font-size:12px}.pc-loading{min-height:100vh;display:grid;place-items:center;background:#f4efe0;font-family:'Space Grotesk',sans-serif;color:#55584c}@media(max-width:760px){.pc-page{padding:18px 11px 35px}.pc-head{margin-bottom:20px}.pc-logo{width:145px}.pc-back{padding:9px 12px}.pc-card{grid-template-columns:1fr;border-radius:22px;box-shadow:7px 7px 0 #ff6f59}.pc-copy{padding:28px 22px}.pc-copy h1{font-size:38px}.pc-copy>p{font-size:14px}.pc-pay{padding:27px 22px 30px}.pc-list{margin-top:22px}}
`;

function Yukleniyor() {
  return <div className="pc-loading">Pro seçenekleri hazırlanıyor…</div>;
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
          setDurum({ yukleniyor: false, hata: "Pro fiyatları şu anda alınamadı. Biraz sonra tekrar deneyebilirsin." });
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
      proNiyetiniTemizle();
      window.location.assign("/welcome");
    } catch {
      setDurum({ yukleniyor: false, hata: "Ödeme ekranı açılamadı. Lütfen tekrar dene." });
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
          <a className="pc-back" href="/">
            <ChevronLeft size={15} /> Ana sayfa
          </a>
        </header>
        <section className="pc-card">
          <div className="pc-copy">
            <h1 style={{ marginTop: 0 }}>Pro'yu sürdürmek istediğinde.</h1>
            <p>
              Yeni hesaplarda Pro özellikleri ilk 30 gün kart bilgisi istemeden
              açıktır. Sonrasında istersen aylık veya yıllık planla devam edebilirsin.
            </p>
            <ul className="pc-list">
              <li><Check size={18} /> Tüm kişiselleştirilmiş öneri ve sinyaller</li>
              <li><Check size={18} /> Faiz ve ödeme önceliği analizleri</li>
              <li><Check size={18} /> Aylık yük ve faiz senaryolarını karşılaştırma</li>
              <li><Check size={18} /> İstediğin zaman aboneliği yönetme özgürlüğü</li>
            </ul>
          </div>
          <div className="pc-pay">
            <h2>Pro üyeliğini başlat</h2>
            <p className="pc-pay-sub">Güvenli ödeme ekranı bir sonraki adımda açılır.</p>
            <div className="pc-toggle" role="group" aria-label="Faturalama dönemi">
              <button className={plan === "monthly" ? "active" : ""} onClick={() => planSec("monthly")} type="button">Aylık</button>
              <button className={plan === "annual" ? "active" : ""} onClick={() => planSec("annual")} type="button">Yıllık</button>
            </div>
            <div className="pc-price">
              <strong>{paketler.yukleniyor ? "…" : fiyat || "—"}</strong>
              <span>{plan === "annual" ? "/ yıl" : "/ ay"}</span>
            </div>
            <p className="pc-renew">Abonelik seçtiğin dönemde otomatik yenilenir.</p>
            {durum.hata && <div className="pc-error">{durum.hata}</div>}
            <button className="pc-primary" type="button" disabled={!revenueCatHazir || paketler.yukleniyor || !fiyat || durum.yukleniyor} onClick={satinAl}>
              {durum.yukleniyor ? "Ödeme açılıyor…" : "Güvenli ödemeye geç →"}
            </button>
            <button className="pc-secondary" type="button" onClick={ucretsizDevam}>Uygulamaya dön</button>
            <p className="pc-note"><ShieldCheck size={15} /> Kart bilgilerin Borcama tarafından saklanmaz. Ödeme güvenli ödeme sağlayıcısı üzerinden tamamlanır.</p>
            <div
              style={{
                marginTop: 12,
                textAlign: "center",
                color: "#9fb4ab",
                fontSize: 11,
                lineHeight: 1.5,
              }}
            >
              Devam ederek{" "}
              <a href="/terms" target="_blank" rel="noreferrer" style={{ color: "#fff", fontWeight: 700 }}>
                Kullanıcı Sözleşmesi
              </a>{" "}
              ve{" "}
              <a href="/refund-policy" target="_blank" rel="noreferrer" style={{ color: "#fff", fontWeight: 700 }}>
                İade Politikası
              </a>
              'nı kabul edersin.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
