import React from "react";
import { ArrowLeft, HelpCircle } from "lucide-react";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@400;500;600;700&display=swap');
.faq,.faq *{box-sizing:border-box}.faq{--ink:#14160f;--green:#063326;--lime:#c8f95a;--coral:#ff6e59;--cream:#f5f0e2;min-height:100vh;background:var(--cream);color:var(--ink);font-family:'Space Grotesk',sans-serif}.faq a{color:inherit}.faq-shell{width:min(900px,calc(100% - 32px));margin:auto}.faq-nav{display:flex;align-items:center;justify-content:space-between;gap:20px;min-height:78px}.faq-logo{display:block;width:145px}.faq-logo img{display:block;width:100%;height:auto}.faq-back{display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:800;text-underline-offset:4px}.faq-main{padding:64px 0 90px}.faq-label{display:inline-flex;align-items:center;gap:7px;padding:7px 10px;border:2px solid var(--ink);border-radius:999px;background:var(--lime);font-size:11px;font-weight:800}.faq h1{max-width:760px;margin:20px 0 14px;font:clamp(44px,8vw,72px)/.98 'Archivo Black',sans-serif;letter-spacing:-.045em}.faq-intro{max-width:650px;margin:0 0 42px;color:#5d6359;font-size:16px;line-height:1.65}.faq-list{display:grid;gap:11px}.faq-item{border:2px solid var(--ink);border-radius:17px;background:#fff;overflow:hidden}.faq-item[open]{box-shadow:6px 6px 0 var(--lime)}.faq-item summary{position:relative;min-height:72px;display:flex;align-items:center;padding:18px 58px 18px 21px;list-style:none;font-size:15px;font-weight:800;cursor:pointer}.faq-item summary::-webkit-details-marker{display:none}.faq-item summary:after{content:'+';position:absolute;right:19px;top:50%;width:28px;height:28px;display:grid;place-items:center;transform:translateY(-50%);border:1.5px solid var(--ink);border-radius:50%;background:var(--cream);font-size:18px}.faq-item[open] summary:after{content:'−';background:var(--lime)}.faq-answer{padding:0 21px 21px;color:#5d6359;font-size:14px;line-height:1.7}.faq-answer p{margin:0}.faq-answer a{color:var(--green);font-weight:800}.faq-contact{margin-top:34px;padding:22px;border:2px solid var(--ink);border-radius:17px;background:var(--green);color:#fff;box-shadow:7px 7px 0 var(--coral);text-align:center}.faq-contact p{margin:0 0 6px;font-weight:700}.faq-contact a{color:var(--lime);font-weight:800}.faq-footer{padding:26px 0;border-top:2px solid var(--ink);font-size:11px;color:#5d6359}.faq-footer .faq-shell{display:flex;justify-content:space-between;gap:18px;flex-wrap:wrap}.faq-footer a{font-weight:700}
@media(max-width:600px){.faq-nav{min-height:66px}.faq-logo{width:116px}.faq-main{padding:42px 0 70px}.faq h1{font-size:44px}.faq-intro{font-size:15px;margin-bottom:30px}.faq-item summary{min-height:66px;padding:16px 52px 16px 17px;font-size:14px}.faq-answer{padding:0 17px 17px;font-size:13.5px}.faq-contact{padding:19px}}
.faq-label,.faq-item,.faq-item summary:after,.faq-contact{border-width:1px;border-color:#14160f24}.faq-item[open],.faq-contact{box-shadow:0 11px 28px #14160f12}.faq-footer{border-top-width:1px;border-top-color:#14160f1f}
`;

const questions = [
  [
    "Borcama ne yapar?",
    <>Borçlarını, ödemelerini, gelir-harcamalarını ve varlıklarını tek yerde takip etmene yardımcı olur. Pro; girdiğin bilgilere göre borç ödeme önceliği, faiz yükü ve harcama eğilimleri hakkında kişiselleştirilmiş öneriler sunar.</>,
  ],
  [
    "Banka hesaplarım otomatik olarak bağlanıyor mu?",
    <>Hayır. Şimdilik bilgileri sen girersin; Borcama internet bankacılığı parolanı istemez. Yeni ekstreleri ve yaptığın ödemeleri aylık olarak güncellersin.</>,
  ],
  [
    "Ücretsiz paket ile Pro arasındaki fark nedir?",
    <>Ücretsiz paket temel borç, ödeme, harcama ve varlık takibiyle her ay bir kişisel öneri içerir. Pro; tüm kişisel finansal sinyalleri, faiz ve ödeme önceliği analizlerini ve gelişmiş senaryoları açar.</>,
  ],
  [
    "30 günlük Pro denemesi nasıl çalışır?",
    <>Yeni hesabında Pro özellikleri 30 gün boyunca kart bilgisi istemeden açılır. Süre sonunda ödeme alınmaz; hesabın ve verilerin korunarak otomatik olarak Ücretsiz plana döner.</>,
  ],
  [
    "Pro aboneliği otomatik yenilenir mi?",
    <>Evet. Aylık veya yıllık seçtiğin dönem sonunda aboneliğin otomatik yenilenir. Yenilemeyi durdurmak için bir sonraki faturalandırma tarihinden önce aboneliğini iptal edebilirsin.</>,
  ],
  [
    "Pro paketimi nasıl iptal ederim?",
    <>Borcama'da <strong>Ayarlar → Paketimi yönet / iptal et</strong> yolunu kullan. Açılan güvenli müşteri portalından iptali onaylayabilirsin.</>,
  ],
  [
    "İptal edince Pro hemen kapanır mı?",
    <>Hayır. İptal sonraki yenilemeyi durdurur; Pro özelliklerini ödediğin mevcut faturalandırma döneminin sonuna kadar kullanmaya devam edersin.</>,
  ],
  [
    "İptal ile iade aynı şey mi?",
    <>Hayır. İptal gelecek yenilemeyi durdurur, geçmiş ödemeyi otomatik iade etmez. Ayrıntılar için <a href="/refund-policy">İade Politikası</a>'na bakabilirsin.</>,
  ],
  [
    "Finansal bilgilerim kimlerle paylaşılır?",
    <>Veri işleme ve saklama açıklamaları <a href="/privacy">Gizlilik ve KVKK Aydınlatma Metni</a>'nde yer alır. Kart ödeme bilgilerin Borcama tarafından saklanmaz.</>,
  ],
];

export default function Faq() {
  return (
    <div className="faq">
      <style>{CSS}</style>
      <header className="faq-shell faq-nav">
        <a className="faq-logo" href="/" aria-label="Borcama ana sayfa">
          <img src="/borcama-logo.png" alt="Borcama" />
        </a>
        <a className="faq-back" href="/"><ArrowLeft size={15} /> Ana sayfaya dön</a>
      </header>
      <main className="faq-shell faq-main">
        <span className="faq-label"><HelpCircle size={14} /> SIK SORULAN SORULAR</span>
        <h1>Merak ettiğin şeyler. Net cevaplar.</h1>
        <p className="faq-intro">Kullanım, Pro üyeliği, iptal, iade ve veriler hakkında sık sorulan sorular.</p>
        <div className="faq-list">
          {questions.map(([title, answer]) => (
            <details className="faq-item" key={title}>
              <summary>{title}</summary>
              <div className="faq-answer"><p>{answer}</p></div>
            </details>
          ))}
        </div>
        <div className="faq-contact">
          <p>Aradığın cevabı bulamadın mı?</p>
          <a href="mailto:zero@borcama.com">zero@borcama.com</a>
        </div>
      </main>
      <footer className="faq-footer">
        <div className="faq-shell">
          <span>© Borcama</span>
          <span><a href="/terms">Kullanıcı Sözleşmesi</a> · <a href="/privacy">Gizlilik ve KVKK</a> · <a href="/refund-policy">İade Politikası</a></span>
        </div>
      </footer>
    </div>
  );
}
