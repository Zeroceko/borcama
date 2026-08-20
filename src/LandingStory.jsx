import React from "react";
import {
  ArrowDown,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BellRing,
  Check,
  CircleDollarSign,
  CreditCard,
  Eye,
  Landmark,
  LineChart,
  ListChecks,
  PiggyBank,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Target,
  WalletCards,
} from "lucide-react";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@400;500;600;700&display=swap');
.ls,.ls *{box-sizing:border-box}.ls{--ink:#14160f;--green:#063326;--forest:#0b241b;--lime:#c8f95a;--coral:#ff6e59;--cream:#f5f0e2;--mint:#dce9e1;--white:#fffef9;background:var(--cream);color:var(--ink);font-family:'Space Grotesk',sans-serif;overflow:hidden}.ls a{color:inherit;text-decoration:none}.ls-shell{width:min(1180px,calc(100% - 36px));margin:auto}.ls-display{font-family:'Archivo Black',sans-serif;letter-spacing:-.045em;line-height:.98;margin:0}.ls-mark{color:var(--lime);text-shadow:3px 4px 0 var(--green)}
.ls-nav{height:78px;display:flex;align-items:center;justify-content:space-between;gap:24px}.ls-logo{display:block;width:150px}.ls-logo img{display:block;width:100%;height:auto}.ls-nav-links{display:flex;align-items:center;gap:22px;font-size:12px;font-weight:800}.ls-btn{display:inline-flex;align-items:center;justify-content:center;gap:9px;min-height:46px;padding:0 20px;border:2px solid var(--ink);border-radius:999px;background:var(--lime);font-weight:800;font-size:13px;box-shadow:4px 4px 0 var(--green);transition:transform .18s,box-shadow .18s}.ls-btn:hover{transform:translate(2px,2px);box-shadow:2px 2px 0 var(--green)}.ls .ls-btn-dark{background:var(--green);color:#fff;box-shadow:4px 4px 0 var(--coral)}.ls-login{border-bottom:2px solid var(--ink)}
.ls-hero{position:relative;min-height:720px;border-top:2px solid var(--ink);border-bottom:2px solid var(--ink);background:radial-gradient(circle at 86% 8%,#ff6e5966 0 11%,transparent 11.3%),radial-gradient(circle at 82% 82%,#c8f95a99 0 18%,transparent 18.3%),linear-gradient(137deg,var(--cream) 0 62%,var(--mint) 62%)}.ls-hero-in{min-height:716px;display:grid;grid-template-columns:minmax(0,1.05fr) minmax(430px,.95fr);align-items:center;gap:70px;padding:70px 0}.ls-hero h1{font-size:clamp(54px,6.4vw,84px);max-width:690px}.ls-hero-copy p{max-width:570px;font-size:17px;line-height:1.65;margin:25px 0 28px}.ls-hero-actions{display:flex;align-items:center;gap:18px;flex-wrap:wrap}.ls-hero-note{font-size:13px;font-weight:700;color:#5d6359}.ls-hero-note strong{color:var(--green)}
.ls-chaos{position:relative;min-height:500px}.ls-question{position:absolute;inset:78px 15px auto 35px;background:var(--green);color:#fff;border:3px solid var(--ink);border-radius:26px;padding:28px;box-shadow:14px 14px 0 var(--coral);transform:rotate(1.5deg);z-index:2}.ls-question small{display:block;color:#9cb2a8;font-size:13px;margin-bottom:15px}.ls-question strong{display:block;font-family:'Archivo Black';font-size:30px;line-height:1.12}.ls-question-total{font-family:'Archivo Black';color:var(--lime);font-size:50px;text-shadow:3px 3px 0 var(--coral);margin:28px 0 8px}.ls-question p{margin:0;color:#b8c5bf;font-size:13px}.ls-float{position:absolute;z-index:3;background:var(--white);border:2px solid var(--ink);border-radius:15px;padding:13px 16px;box-shadow:5px 5px 0 var(--lime);font-size:12px;font-weight:700}.ls-float b{display:block;font-size:17px;margin-top:4px}.ls-float-one{top:28px;right:8px;transform:rotate(4deg)}.ls-float-two{left:-8px;bottom:65px;transform:rotate(-5deg);box-shadow:5px 5px 0 var(--coral)}.ls-float-three{right:6px;bottom:10px;transform:rotate(3deg)}.ls-scroll{position:absolute;left:50%;bottom:22px;display:flex;align-items:center;gap:8px;transform:translateX(-50%);font-size:12px;font-weight:700}
.ls-proof{padding:28px 0;border-bottom:2px solid var(--ink);background:var(--white)}.ls-proof-row{display:flex;align-items:center;justify-content:space-between;gap:18px}.ls-proof-title{font-size:13px;font-weight:800}.ls-proof-items{display:flex;gap:9px;flex-wrap:wrap;justify-content:flex-end}.ls-pill{display:inline-flex;align-items:center;gap:7px;border:1.5px solid var(--ink);border-radius:999px;padding:8px 11px;background:var(--cream);font-size:11px;font-weight:700}.ls-pill:nth-child(even){background:#ffe2db}
.ls-section{padding:105px 0}.ls-section-head{margin-bottom:50px}.ls-section-title h2{font-size:clamp(42px,5.3vw,64px);max-width:880px}.ls-section-title p{font-size:16px;line-height:1.65;color:#5d6359;max-width:680px;margin:20px 0 0}
.ls-problem{background:var(--cream)}.ls-problem-grid{display:grid;grid-template-columns:.85fr 1.15fr;gap:24px}.ls-problem-line{background:var(--white);border:2px solid var(--ink);border-radius:20px;padding:25px;display:flex;gap:17px;align-items:flex-start;min-height:142px}.ls-problem-list{display:grid;gap:14px}.ls-problem-icon{flex:0 0 48px;width:48px;height:48px;display:grid;place-items:center;border:2px solid var(--ink);border-radius:13px;background:var(--coral);box-shadow:4px 4px 0 var(--lime)}.ls-problem-line h3{margin:2px 0 7px;font-size:19px}.ls-problem-line p{margin:0;color:#62675e;font-size:14px;line-height:1.55}.ls-problem-answer{position:relative;background:var(--green);color:#fff;border:3px solid var(--ink);border-radius:24px;padding:36px;overflow:hidden}.ls-problem-answer:after{content:'';position:absolute;width:240px;height:240px;border-radius:50%;background:var(--lime);right:-100px;bottom:-120px;opacity:.18}.ls-problem-answer small{color:#aebdb6;font-size:13px;font-weight:700}.ls-problem-answer h3{font-family:'Archivo Black';font-size:clamp(34px,4vw,52px);line-height:1.04;margin:24px 0;max-width:550px}.ls-problem-answer h3 span{color:var(--lime)}.ls-answer-row{position:relative;z-index:1;display:flex;justify-content:space-between;gap:20px;border-top:1px solid #4d6c60;padding:17px 0;font-size:14px}.ls-answer-row strong{white-space:nowrap;color:var(--lime)}
.ls-trigger{background:var(--green);color:#fff;border-top:2px solid var(--ink);border-bottom:2px solid var(--ink)}.ls-trigger .ls-section-title p{color:#b1c0b9}.ls-moments{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:42px}.ls-moment{border:1px solid #547065;border-radius:18px;background:#103d2f;padding:22px;min-height:190px}.ls-moment-top{display:flex;justify-content:space-between;align-items:center;color:var(--lime)}.ls-moment span{display:block;color:#a8bab2;font-size:12px;font-weight:700}.ls-moment h3{font-size:18px;margin:24px 0 9px}.ls-moment p{font-size:14px;line-height:1.5;color:#c0ccc6;margin:0}.ls-benefits{display:grid;grid-template-columns:repeat(3,1fr);gap:17px}.ls-benefit{background:var(--white);color:var(--ink);border:2px solid var(--ink);border-radius:20px;padding:25px;box-shadow:7px 7px 0 var(--coral)}.ls-benefit:nth-child(2){box-shadow:7px 7px 0 var(--lime)}.ls-benefit:nth-child(3){box-shadow:7px 7px 0 #84d1d1}.ls-benefit-icon{width:48px;height:48px;border:2px solid var(--ink);border-radius:50%;display:grid;place-items:center;background:var(--lime)}.ls-benefit h3{font-size:20px;margin:24px 0 8px}.ls-benefit p{font-size:14px;line-height:1.55;color:#5f655b}.ls-benefit b{display:block;font-family:'Archivo Black';font-size:23px;margin-top:28px;color:var(--green)}
.ls-how{background:linear-gradient(145deg,var(--mint) 0 58%,var(--cream) 58%)}.ls-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;position:relative}.ls-step{position:relative;background:var(--white);border:2px solid var(--ink);border-radius:22px;padding:27px;min-height:370px;display:flex;flex-direction:column}.ls-step-no{font-family:'Archivo Black';font-size:34px;color:var(--green)}.ls-step-visual{height:120px;margin:18px 0 25px;border:2px solid var(--ink);border-radius:15px;background:var(--cream);display:grid;place-items:center;position:relative;overflow:hidden}.ls-step:nth-child(2) .ls-step-visual{background:#ffe2db}.ls-step:nth-child(3) .ls-step-visual{background:#eaffbb}.ls-mini-card{width:70%;background:#fff;border:1.5px solid var(--ink);border-radius:9px;padding:10px;box-shadow:4px 4px 0 var(--coral)}.ls-mini-card i{display:block;height:7px;background:#dfe7db;border-radius:5px;margin-top:7px}.ls-mini-card i:last-child{width:68%;background:var(--lime)}.ls-step h3{font-size:21px;margin:0 0 9px}.ls-step p{font-size:14px;line-height:1.55;color:#5f655b;margin:0 0 20px}.ls-step ul{list-style:none;padding:0;margin:auto 0 0;display:grid;gap:8px;font-size:13px;font-weight:700}.ls-step li{display:flex;gap:8px;align-items:center}.ls-step li svg{color:var(--green);flex:none}.ls-how-note{margin-top:25px;display:flex;align-items:center;justify-content:space-between;gap:20px;background:var(--green);color:#fff;border:2px solid var(--ink);border-radius:18px;padding:20px 23px}.ls-how-note strong{font-size:17px}.ls-how-note span{color:#b5c4bd;font-size:13px}
.ls-feeling{position:relative;background:var(--cream)}.ls-feeling-stage{border:3px solid var(--ink);border-radius:28px;overflow:hidden;display:grid;grid-template-columns:1fr 1fr;box-shadow:12px 12px 0 var(--green)}.ls-before,.ls-after{padding:48px;min-height:470px}.ls-before{background:#ffe0d8}.ls-after{background:var(--green);color:#fff}.ls-feeling-label{display:inline-flex;align-items:center;gap:8px;border:1.5px solid var(--ink);border-radius:999px;padding:7px 10px;background:var(--white);color:var(--ink);font-size:12px;font-weight:700}.ls-feeling h3{font-family:'Archivo Black';font-size:clamp(34px,3.7vw,49px);line-height:1.04;margin:28px 0 30px}.ls-after h3{color:var(--lime);text-shadow:3px 3px 0 var(--coral)}.ls-thoughts{display:grid;gap:11px}.ls-thought{display:flex;align-items:center;gap:11px;padding:14px;border:1.5px solid var(--ink);border-radius:12px;background:#fff8;font-size:14px;font-weight:700}.ls-after .ls-thought{border-color:#547065;background:#123d30;color:#dbe5e0}.ls-relief{margin-top:22px;border-top:1px solid #547065;padding-top:22px;color:#b3c1ba;font-size:14px;line-height:1.6}.ls-final{padding:100px 0;text-align:center}.ls-final h2{font-size:clamp(44px,6vw,72px);max-width:1000px;margin:auto}.ls-final p{max-width:590px;margin:25px auto 30px;font-size:17px;line-height:1.65;color:#5e645a}.ls-final-actions{display:flex;justify-content:center;align-items:center;gap:18px;flex-wrap:wrap}
.ls-pricing{background:var(--mint);border-top:2px solid var(--ink);border-bottom:2px solid var(--ink)}.ls-pricing-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;align-items:stretch;max-width:1180px;margin:0 auto}.ls-price-card{display:flex;flex-direction:column;background:var(--white);border:2px solid var(--ink);border-radius:22px;padding:28px;box-shadow:7px 7px 0 var(--green)}.ls-price-card.pro{background:var(--green);color:#fff;box-shadow:7px 7px 0 var(--coral)}.ls-price-badge{align-self:flex-start;border:1.5px solid var(--ink);border-radius:999px;background:var(--lime);color:var(--ink);padding:6px 9px;font-size:10px;font-weight:800;letter-spacing:.06em}.ls-price-card h3{font-size:22px;margin:24px 0 8px}.ls-price{font-family:'Archivo Black';font-size:clamp(38px,4vw,50px);letter-spacing:-.04em}.ls-price small{font-family:'Space Grotesk';font-size:13px;letter-spacing:0;color:inherit}.ls-price-card>p{min-height:44px;margin:12px 0 22px;color:#60665c;font-size:13px;line-height:1.55}.ls-price-card.pro>p{color:#b8c7c0}.ls-price-list{list-style:none;padding:20px 0;margin:0 0 25px;border-top:1px solid #ccd2c8;display:grid;gap:12px;font-size:13px;font-weight:700}.ls-price-card.pro .ls-price-list{border-color:#49695d}.ls-price-list li{display:flex;align-items:flex-start;gap:9px}.ls-price-list svg{flex:none;color:var(--green)}.ls-price-card.pro .ls-price-list svg{color:var(--lime)}.ls-price-card .ls-btn{width:100%;margin-top:auto}.ls-price-card.pro .ls-btn{background:var(--lime);color:var(--ink);box-shadow:4px 4px 0 var(--coral)}
.ls-faq{background:var(--cream)}.ls-faq-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;align-items:start}.ls-faq-item{border:2px solid var(--ink);border-radius:16px;background:var(--white);overflow:hidden}.ls-faq-item[open]{box-shadow:5px 5px 0 var(--lime)}.ls-faq-item summary{position:relative;display:flex;align-items:center;min-height:70px;padding:18px 54px 18px 20px;font-size:15px;font-weight:800;cursor:pointer;list-style:none}.ls-faq-item summary::-webkit-details-marker{display:none}.ls-faq-item summary:after{content:'+';position:absolute;right:18px;top:50%;width:26px;height:26px;display:grid;place-items:center;transform:translateY(-50%);border:1.5px solid var(--ink);border-radius:50%;background:var(--cream);font-size:18px;line-height:1}.ls-faq-item[open] summary:after{content:'−';background:var(--lime)}.ls-faq-answer{padding:0 20px 20px;color:#5d6359;font-size:14px;line-height:1.65}.ls-faq-answer p{margin:0}.ls-faq-answer a{color:var(--green);font-weight:800;text-decoration:underline}.ls-faq-note{margin:28px 0 0;text-align:center;color:#5d6359;font-size:13px}.ls-faq-note a{font-weight:800;text-decoration:underline}
.ls-footer{background:#8dd8d5;border-top:2px solid var(--ink);padding:60px 0 25px}.ls-footer-logo{text-align:center}.ls-footer-logo img{width:min(570px,85%);height:auto}.ls-footer-row{display:flex;justify-content:space-between;gap:20px;border-top:1px solid #477d79;margin-top:38px;padding-top:20px;font-size:11px}
@media(max-width:900px){.ls-nav-link{display:none}.ls-hero-in{grid-template-columns:1fr;padding:65px 0 95px}.ls-chaos{min-height:470px;width:min(630px,100%)}.ls-problem-grid{grid-template-columns:1fr}.ls-moments{grid-template-columns:repeat(2,1fr)}.ls-benefits,.ls-steps,.ls-pricing-grid,.ls-faq-grid{grid-template-columns:1fr}.ls-step{min-height:0}.ls-feeling-stage{grid-template-columns:1fr}.ls-before,.ls-after{min-height:0}.ls-proof-row{align-items:flex-start;flex-direction:column}.ls-proof-items{justify-content:flex-start}}
@media(max-width:600px){
  .ls-shell{width:min(100% - 24px,1180px)}
  .ls-nav{height:66px}
  .ls-logo{width:112px}
  .ls-nav-links{gap:9px}
  .ls-login{font-size:12px;white-space:nowrap}
  .ls-nav .ls-btn{min-height:42px;padding:0 13px;font-size:12px;box-shadow:2px 2px 0 var(--green)}
  .ls-nav .ls-btn svg{display:none}
  .ls-hero{background:linear-gradient(150deg,var(--cream) 0 72%,var(--mint) 72%)}
  .ls-hero-in{min-height:auto;padding:46px 0 66px;gap:22px}
  .ls-hero h1{font-size:clamp(40px,12vw,48px);line-height:1.01;overflow-wrap:anywhere}
  .ls-hero-copy p{font-size:15.5px;line-height:1.62;margin:22px 0 24px}
  .ls-hero-actions{display:grid;gap:14px}
  .ls-hero-actions .ls-btn{width:100%;min-height:50px}
  .ls-hero-note{text-align:center;font-size:13px}
  .ls-chaos{min-height:430px}
  .ls-question{inset:52px 5px auto 5px;padding:20px;border-radius:20px;box-shadow:8px 8px 0 var(--coral);transform:none}
  .ls-question small{font-size:12px}
  .ls-question strong{font-size:23px}
  .ls-question-total{font-size:40px;margin-top:22px}
  .ls-float{padding:10px 12px;font-size:11px}
  .ls-float-one{right:0;top:7px}
  .ls-float-two{left:0;bottom:34px}
  .ls-float-three{right:0;bottom:-4px}
  .ls-proof{padding:24px 0}
  .ls-proof-title{font-size:14px}
  .ls-proof-items{display:grid;grid-template-columns:1fr 1fr;width:100%;gap:8px}
  .ls-pill{justify-content:center;min-height:40px;padding:8px;font-size:11px;text-align:center}
  .ls-pill:last-child{grid-column:1/-1}
  .ls-section{padding:64px 0}
  .ls-section-head{margin-bottom:34px}
  .ls-section-title h2{font-size:clamp(36px,10.5vw,44px);line-height:1.02;overflow-wrap:anywhere}
  .ls-section-title p{font-size:15.5px;line-height:1.62;margin-top:17px}
  .ls-problem-line{padding:18px;gap:14px;min-height:0}
  .ls-problem-icon{flex-basis:44px;width:44px;height:44px}
  .ls-problem-line h3{font-size:18px}
  .ls-problem-line p{font-size:14px}
  .ls-problem-answer{padding:24px}
  .ls-problem-answer h3{font-size:34px}
  .ls-answer-row{font-size:13px;gap:12px}
  .ls-moments{grid-template-columns:1fr;gap:10px;margin-bottom:32px}
  .ls-moment{min-height:0;padding:20px}
  .ls-benefits{gap:13px}
  .ls-benefit{padding:21px}
  .ls-benefit b{font-size:21px;margin-top:20px}
  .ls-step{padding:20px}
  .ls-step-visual{margin:14px 0 21px}
  .ls-how-note{align-items:flex-start;flex-direction:column}
  .ls-before,.ls-after{padding:27px 22px}
  .ls-feeling-stage{box-shadow:7px 7px 0 var(--green)}
  .ls-feeling h3{font-size:34px}
  .ls-price-card{padding:22px;box-shadow:5px 5px 0 var(--green)}
  .ls-price-card.pro{box-shadow:5px 5px 0 var(--coral)}
  .ls-price-card>p{min-height:0}
  .ls-faq-item summary{min-height:64px;padding:16px 48px 16px 17px;font-size:14px}
  .ls-faq-answer{padding:0 17px 17px;font-size:13.5px}
  .ls-final{padding:68px 0}
  .ls-final h2{font-size:clamp(40px,11vw,46px);line-height:1.02}
  .ls-final-actions{display:grid;gap:18px}
  .ls-final-actions .ls-btn{width:100%;min-height:50px}
  .ls-footer{padding-top:46px}
  .ls-footer-row{flex-direction:column;line-height:1.5}
  .ls-scroll{display:none}
}
`;

export default function LandingStory() {
  return (
    <div className="ls">
      <style>{CSS}</style>
      <header className="ls-shell ls-nav">
        <a className="ls-logo" href="/" aria-label="Borcama ana sayfa">
          <img src="/borcama-logo.png" alt="Borcama" />
        </a>
        <nav className="ls-nav-links" aria-label="Ana menü">
          <a className="ls-nav-link" href="#sorun">Sorun</a>
          <a className="ls-nav-link" href="#avantajlar">Avantajlar</a>
          <a className="ls-nav-link" href="#nasil">Nasıl kullanılır?</a>
          <a className="ls-nav-link" href="#paketler">Paketler</a>
          <a className="ls-nav-link" href="#sss">SSS</a>
          <a className="ls-login" href="/login">Giriş yap</a>
          <a className="ls-btn" href="/register?plan=free">
            Hemen Başla! <ArrowRight size={15} />
          </a>
        </nav>
      </header>

      <main>
        <section className="ls-hero">
          <div className="ls-shell ls-hero-in">
            <div className="ls-hero-copy">
              <h1 className="ls-display">
                Paran kaybolmuyor.
                <br />
                <span className="ls-mark">Görüş alanından çıkıyor.</span>
              </h1>
              <p>
                Kartlar, krediler, ek hesaplar, taksitler ve birikimler farklı
                yerlerde durunca toplam tablo görünmez olur. Borcama hepsini
                anlaşılır tek bir finans fotoğrafında birleştirir.
              </p>
              <div className="ls-hero-actions">
                <a className="ls-btn" href="/register?plan=free">
                  Finans fotoğrafımı çıkar <ArrowRight size={16} />
                </a>
                <span className="ls-hero-note">
                  <strong>Ücretsiz başla.</strong> Kredi kartı gerekmez.
                </span>
              </div>
            </div>
            <div className="ls-chaos" aria-label="Dağınık borçların tek ekranda toplanması">
              <div className="ls-float ls-float-one">
                Son ödeme yaklaşıyor
                <b>4 gün</b>
              </div>
              <div className="ls-question">
                <small>BUGÜN CEVABINI ARADIĞIN SORU</small>
                <strong>Gerçekte ne kadar borcum var?</strong>
                <div className="ls-question-total">₺284.750</div>
                <p>4 banka · 7 ödeme · 3 varlık türü</p>
              </div>
              <div className="ls-float ls-float-two">
                Bu ay ödenecek
                <b>₺42.600</b>
              </div>
              <div className="ls-float ls-float-three">
                Tahmini faiz
                <b>₺7.840</b>
              </div>
            </div>
          </div>
          <a className="ls-scroll" href="#sorun">
            NEDEN BORCAMA? <ArrowDown size={14} />
          </a>
        </section>

        <section className="ls-proof">
          <div className="ls-shell ls-proof-row">
            <div className="ls-proof-title">Tek bakışta görebileceğin finans alanları</div>
            <div className="ls-proof-items">
              <span className="ls-pill"><CreditCard size={13} /> Kredi kartları</span>
              <span className="ls-pill"><Landmark size={13} /> Krediler & KMH</span>
              <span className="ls-pill"><ReceiptText size={13} /> Harcamalar</span>
              <span className="ls-pill"><PiggyBank size={13} /> Varlıklar</span>
              <span className="ls-pill"><Target size={13} /> Borç planı</span>
            </div>
          </div>
        </section>

        <section id="sorun" className="ls-section ls-problem">
          <div className="ls-shell">
            <SectionHead
              title={<>Rakam çok. <span className="ls-mark">Net cevap yok.</span></>}
              text="Sorun yalnızca borcun olması değil; hangi rakamın ne anlama geldiğini, ne zaman ödeneceğini ve bir sonraki doğru adımı görememek."
            />
            <div className="ls-problem-grid">
              <div className="ls-problem-list">
                <Problem icon={<WalletCards />} title="Her banka başka bir ekran" text="Toplam borcu görmek için uygulamalar arasında dolaşırsın." />
                <Problem icon={<CircleDollarSign />} title="Minimum mu, toplam mı?" text="Ödeme yaptığında neyin kapandığı, neyin faizlenmeye devam ettiği belirsizleşir." />
                <Problem icon={<LineChart />} title="Birikim var ama net durum yok" text="Varlıklarınla borçların birbirinden kopuk kalır; gerçek finansal tablo oluşmaz." />
              </div>
              <div className="ls-problem-answer">
                <small>BORCAMA’NIN VERDİĞİ CEVAP</small>
                <h3>“Bugün neyim var, neyim eksik ve <span>önce ne yapmalıyım?</span>”</h3>
                <div className="ls-answer-row"><span>Toplam borcun</span><strong>Tek rakamda</strong></div>
                <div className="ls-answer-row"><span>Yaklaşan zorunlu ödemeler</span><strong>Tek listede</strong></div>
                <div className="ls-answer-row"><span>Borç + varlık dengesi</span><strong>Tek tabloda</strong></div>
                <div className="ls-answer-row"><span>Kapatma önceliğin</span><strong>Net bir sırada</strong></div>
              </div>
            </div>
          </div>
        </section>

        <section id="avantajlar" className="ls-section ls-trigger">
          <div className="ls-shell">
            <SectionHead
              title={<>Finansının kritik anları <span className="ls-mark">tek yerde.</span></>}
              text="Borcama senin yerine karar vermez veya kendiliğinden işlem yapmaz. Girdiğin bilgileri düzenleyerek ödeme, ekstre, faiz ve varlık durumunu daha kolay değerlendirmeni sağlar."
            />
            <div className="ls-moments">
              <Moment icon={<BellRing />} label="Ödeme planlarken" title="Ne kadar gerekiyor?" text="Toplam ve minimum ödeme tutarlarını birlikte gör." />
              <Moment icon={<ReceiptText />} label="Ekstreyi kaydederken" title="Rakamlar tutuyor mu?" text="Gerçek ekstreyi manuel harcamalarınla karşılaştır." />
              <Moment icon={<LineChart />} label="Devreden borcu incelerken" title="Maliyeti ne olacak?" text="Kalan borcun tahmini faiz etkisini takip et." />
              <Moment icon={<PiggyBank />} label="Birikimlerini güncellerken" title="Net durumum ne?" text="Varlıklarınla borçlarını aynı finans fotoğrafında gör." />
            </div>
            <div className="ls-benefits">
              <Benefit icon={<Eye />} title="Görünürlük" text="Farklı banka ve borç türlerini tek yerde topla." value="Ne olduğunu bil." />
              <Benefit icon={<ListChecks />} title="Öncelik" text="Çığ veya kartopu yöntemiyle kapatma sıranı oluştur." value="Sıradakini bil." />
              <Benefit icon={<ShieldCheck />} title="Kontrol" text="Ödemeleri, ekstreleri ve ilerlemeyi dönem dönem izle." value="İlerlediğini bil." />
            </div>
          </div>
        </section>

        <section id="nasil" className="ls-section ls-how">
          <div className="ls-shell">
            <SectionHead
              title={<>İlk tablonu kur. <span className="ls-mark">Her ay güncel tut.</span></>}
              text="Hesabını açıp mevcut finans fotoğrafını oluştur. Sonraki aylarda yeni ekstrelerini gir, yaptığın ödemeleri işaretle ve değişen borç bilgilerini güncelle."
            />
            <div className="ls-steps">
              <Step
                number="01"
                icon={<BadgeCheck size={34} />}
                title="Ücretsiz hesabını aç"
                text="E-posta ve parolanla birkaç saniyede başla."
                items={["Kredi kartı gerekmez", "İstersen e-posta linkiyle giriş", "Verilerin hesabına bağlı"]}
              />
              <Step
                number="02"
                icon={<WalletCards size={34} />}
                title="Finans fotoğrafını kur"
                text="Kartlarını, kredilerini, ek hesaplarını ve varlıklarını ekle."
                items={["Banka banka borç görünümü", "Ekstre dönemleri ve vadeler", "Döviz, emtia, fon, hisse ve BES"]}
              />
              <Step
                number="03"
                icon={<Sparkles size={34} />}
                title="Her ay bilgilerini güncelle"
                text="Yeni ekstreyi gir, yaptığın ödemeyi işaretle ve planındaki ilerlemeyi gör."
                items={["Yaklaşan ödemeler", "Ekstre sağlaması", "Borç kapatma sırası"]}
              />
            </div>
            <div className="ls-how-note">
              <strong>İlk kurulumdan sonra her ay yalnızca değişen bilgileri girersin.</strong>
              <span>Borcama finansal karar vermez; karar vermen için tabloyu anlaşılır hale getirir.</span>
            </div>
          </div>
        </section>

        <section className="ls-section ls-feeling">
          <div className="ls-shell">
            <SectionHead
              title={<>Rakamlar aynı olsa bile <span className="ls-mark">hissettirdiği şey değişir.</span></>}
              text="Kontrol, her borcun anında bitmesi değildir. Ne durumda olduğunu ve sıradaki adımı bilerek belirsizliği azaltmaktır."
            />
            <div className="ls-feeling-stage">
              <div className="ls-before">
                <span className="ls-feeling-label">ÖNCE · DAĞINIKLIK</span>
                <h3>“Bir şeyi unutuyor muyum?”</h3>
                <div className="ls-thoughts">
                  <div className="ls-thought"><BellRing size={18} /> Son ödeme hangi gündü?</div>
                  <div className="ls-thought"><CreditCard size={18} /> Hangi kartta ne kadar kaldı?</div>
                  <div className="ls-thought"><CircleDollarSign size={18} /> Bu ödeme gerçekten yeterli mi?</div>
                </div>
              </div>
              <div className="ls-after">
                <span className="ls-feeling-label">SONRA · KONTROL</span>
                <h3>“Ne yapacağımı biliyorum.”</h3>
                <div className="ls-thoughts">
                  <div className="ls-thought"><Check size={18} /> Bu ayın zorunlu tutarı önümde.</div>
                  <div className="ls-thought"><Check size={18} /> Sonraki ödeme sıram belli.</div>
                  <div className="ls-thought"><Check size={18} /> Küçük ilerlemeyi bile görebiliyorum.</div>
                </div>
                <div className="ls-relief">
                  Netlik → küçük doğru kararlar → görünür ilerleme → finansal özgüven.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="paketler" className="ls-section ls-pricing">
          <div className="ls-shell">
            <SectionHead
              title={<>İhtiyacın kadar kullan. <span className="ls-mark">Kontrol hep sende.</span></>}
              text="Ücretsiz hesapla başla. İlk 30 gün Pro'yu kart bilgisi vermeden dene; süre sonunda istersen Ücretsiz planla devam et."
            />
            <div className="ls-pricing-grid">
              <PriceCard
                badge="ÜCRETSİZ"
                title="Borcama Ücretsiz"
                price="₺0"
                description="Borçlarını, ödemelerini ve varlıklarını tek yerde takip et."
                items={["Borç, ödeme ve harcama takibi", "Varlık ve net durum görünümü", "Her ay bir kişisel öneri", "Temel finans özeti"]}
                action="Ücretsiz başla"
                href="/register"
              />
              <PriceCard
                pro
                badge="30 GÜN ÜCRETSİZ"
                title="Borcama Pro Aylık"
                price="₺99"
                suffix="/ ay"
                description="Tüm kişiselleştirilmiş analizler ve gelişmiş finansal senaryolar."
                items={["Ücretsiz paketteki her şey", "Tüm kişisel öneri ve sinyaller", "Faiz ve ödeme önceliği analizleri", "Aylık yük ve faiz senaryoları"]}
                action="Ücretsiz dene"
                href="/register"
              />
              <PriceCard
                pro
                badge="EN AVANTAJLI"
                title="Borcama Pro Yıllık"
                price="₺999"
                suffix="/ yıl"
                description="Yıllık öde, aynı Pro deneyiminde ₺189 avantaj sağla."
                items={["Ücretsiz paketteki her şey", "Tüm kişisel öneri ve sinyaller", "Faiz ve ödeme önceliği analizleri", "Aylık yük ve faiz senaryoları"]}
                action="Ücretsiz dene"
                href="/register"
              />
            </div>
          </div>
        </section>

        <section id="sss" className="ls-section ls-faq">
          <div className="ls-shell">
            <SectionHead
              title={<>Merak ettiğin şeyler. <span className="ls-mark">Net cevaplar.</span></>}
              text="Borcama'nın kullanımı, Pro üyeliği, iptal ve veriler hakkında en sık sorulan sorular."
            />
            <div className="ls-faq-grid">
              <FaqItem title="Borcama ne yapar?">
                Borçlarını, ödemelerini, gelir-harcamalarını ve varlıklarını tek yerde takip etmene yardımcı olur. Pro, girdiğin bilgilere göre borç ödeme önceliği, faiz yükü ve harcama eğilimleri hakkında kişiselleştirilmiş öneriler sunar. Belirli bir banka ürünü, kredi veya yatırım aracı tavsiye etmez.
              </FaqItem>
              <FaqItem title="Banka hesaplarım otomatik olarak bağlanıyor mu?">
                Hayır. Şimdilik bilgileri sen girersin; Borcama internet bankacılığı parolanı istemez. Yeni ekstreleri ve yaptığın ödemeleri aylık olarak güncellersin.
              </FaqItem>
              <FaqItem title="Ücretsiz paket ile Pro arasındaki fark nedir?">
                Ücretsiz paket temel borç, ödeme, harcama ve varlık takibiyle her ay bir kişisel öneri içerir. Pro; tüm kişisel finansal sinyalleri, faiz ve ödeme önceliği analizlerini ve gelişmiş senaryoları açar.
              </FaqItem>
              <FaqItem title="30 günlük Pro denemesi nasıl çalışır?">
                Yeni hesabında Pro özellikleri 30 gün boyunca kart bilgisi istemeden açılır. Süre sonunda ödeme alınmaz; hesabın ve verilerin korunarak otomatik olarak Ücretsiz plana döner.
              </FaqItem>
              <FaqItem title="Pro aboneliği otomatik yenilenir mi?">
                Evet. Aylık veya yıllık seçtiğin dönem sonunda aboneliğin otomatik yenilenir. Yenilemeyi durdurmak için bir sonraki faturalandırma tarihinden önce aboneliğini iptal edebilirsin.
              </FaqItem>
              <FaqItem title="Pro paketimi nasıl iptal ederim?">
                Borcama'da <strong>Ayarlar → Paketimi yönet / iptal et</strong> yolunu kullan. Otomatik yenilemeyi Borcama içinden durdurabilirsin; kart ve fatura işlemleri Paddle'ın güvenli müşteri portalında yönetilir.
              </FaqItem>
              <FaqItem title="İptal edince Pro hemen kapanır mı?">
                Hayır. İptal sonraki yenilemeyi durdurur; Pro özelliklerini ödediğin mevcut faturalandırma döneminin sonuna kadar kullanmaya devam edersin.
              </FaqItem>
              <FaqItem title="İptal ile iade aynı şey mi?">
                Hayır. İptal gelecek yenilemeyi durdurur, geçmiş ödemeyi otomatik iade etmez. İade koşulları ve başvuru adımları için <a href="/refund-policy">İptal ve İade Politikası</a>'na bakabilirsin.
              </FaqItem>
              <FaqItem title="Finansal bilgilerim kimlerle paylaşılır?">
                Borcama'nın veri işleme, saklama ve hizmet sağlayıcılarına ilişkin açıklamaları <a href="/privacy">Gizlilik ve KVKK Aydınlatma Metni</a>'nde yer alır. Kart ödeme bilgilerin Borcama tarafından saklanmaz.
              </FaqItem>
            </div>
            <p className="ls-faq-note">
              Başka bir sorun mu var? <a href="mailto:zero@borcama.com">zero@borcama.com</a>
            </p>
          </div>
        </section>

        <section className="ls-final">
          <div className="ls-shell">
            <h2 className="ls-display">
              Borcunu saklama.
              <br />
              <span className="ls-mark">Planına dönüştür.</span>
            </h2>
            <p>
              Borçlarını, ödemelerini ve varlıklarını aynı yerde gör.
              Belirsizliği azalt, ilerlemeyi görünür hale getir.
            </p>
            <div className="ls-final-actions">
              <a className="ls-btn ls-btn-dark" href="/register?plan=free">
                Ücretsiz hesabımı aç <ArrowRight size={16} />
              </a>
              <a className="ls-login" href="/login">Zaten hesabım var</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="ls-footer">
        <div className="ls-shell">
          <div className="ls-footer-logo">
            <img src="/borcama-logo.png" alt="Borcama" />
          </div>
          <div className="ls-footer-row">
            <span>Borç, ödeme ve varlıklarını tek yerde takip et.</span>
            <span>
              <a href="/terms">Kullanıcı Sözleşmesi</a> ·{" "}
              <a href="/privacy">Gizlilik ve KVKK</a>
              {" · "}<a href="/refund-policy">İade Politikası</a>
              {" · "}<a href="#sss">SSS</a>
            </span>
            <span>Finansal tavsiye değildir.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SectionHead({ title, text }) {
  return (
    <div className="ls-section-head">
      <div className="ls-section-title">
        <h2 className="ls-display">{title}</h2>
        <p>{text}</p>
      </div>
    </div>
  );
}

function FaqItem({ title, children }) {
  return (
    <details className="ls-faq-item">
      <summary>{title}</summary>
      <div className="ls-faq-answer"><p>{children}</p></div>
    </details>
  );
}

function Problem({ icon, title, text }) {
  return (
    <article className="ls-problem-line">
      <div className="ls-problem-icon">{React.cloneElement(icon, { size: 23 })}</div>
      <div><h3>{title}</h3><p>{text}</p></div>
    </article>
  );
}

function Moment({ icon, label, title, text }) {
  return (
    <article className="ls-moment">
      <div className="ls-moment-top">
        {React.cloneElement(icon, { size: 22 })}
        <ArrowRight size={17} />
      </div>
      <span>{label}</span>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

function Benefit({ icon, title, text, value }) {
  return (
    <article className="ls-benefit">
      <div className="ls-benefit-icon">{React.cloneElement(icon, { size: 23 })}</div>
      <h3>{title}</h3>
      <p>{text}</p>
      <b>{value}</b>
    </article>
  );
}

function Step({ number, icon, title, text, items }) {
  return (
    <article className="ls-step">
      <div className="ls-step-no">{number}</div>
      <div className="ls-step-visual">
        <div className="ls-mini-card">
          {icon}
          <i />
          <i />
        </div>
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
      <ul>
        {items.map((item) => <li key={item}><Check size={15} /> {item}</li>)}
      </ul>
    </article>
  );
}

function PriceCard({ badge, title, price, suffix, description, items, action, href, pro = false, external = false }) {
  return (
    <article className={`ls-price-card${pro ? " pro" : ""}`}>
      <span className="ls-price-badge">{badge}</span>
      <h3>{title}</h3>
      <div className="ls-price">{price} {suffix && <small>{suffix}</small>}</div>
      <p>{description}</p>
      <ul className="ls-price-list">
        {items.map((item) => <li key={item}><Check size={15} /> {item}</li>)}
      </ul>
      <a
        className="ls-btn"
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {action} <ArrowRight size={15} />
      </a>
    </article>
  );
}
