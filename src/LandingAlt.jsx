import React from "react";
import {
  ArrowRight,
  Check,
  Coins,
  Landmark,
  PiggyBank,
  ReceiptText,
  Target,
  TrendingUp,
  WalletCards,
} from "lucide-react";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@400;500;600;700&display=swap');
.la,.la *{box-sizing:border-box}.la{--green:#062d20;--lime:#baff25;--ice:#edf5e7;--ink:#09291f;background:#fff;color:var(--ink);font-family:'Space Grotesk',sans-serif}.la a{color:inherit;text-decoration:none}.la-shell{width:min(1160px,calc(100% - 32px));margin:auto}.la-nav{height:68px;display:flex;align-items:center;justify-content:space-between;position:relative;z-index:3}.la-logo{font-family:'Archivo Black';font-size:22px;color:var(--lime);text-shadow:2px 2px 0 var(--green)}.la-links{display:flex;gap:22px;align-items:center;font-size:12px;font-weight:700}.la-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;background:var(--lime);color:var(--green);border:1.5px solid var(--green);border-radius:999px;padding:11px 18px;font-size:12px;font-weight:800;box-shadow:2px 3px 0 var(--green)}.la-hero{min-height:620px;background:linear-gradient(90deg,rgba(255,255,255,.96) 0%,rgba(255,255,255,.75) 34%,rgba(255,255,255,0) 62%),url('/borcama-hero-alt.png') center/cover;border-radius:0 0 22px 22px;position:relative;margin-top:-68px;padding-top:68px}.la-hero-in{min-height:552px;display:flex;align-items:center}.la-copy{width:min(540px,52%)}.la-tag{font-size:12px;font-weight:800;color:#51704f;margin-bottom:14px}.la-h1,.la-h2{font-family:'Archivo Black';letter-spacing:-.05em;line-height:.93;margin:0}.la-h1{font-size:clamp(54px,7vw,88px)}.la-mark{display:inline-block;color:var(--lime);text-shadow:3px 4px 0 var(--green);transform:rotate(-2deg)}.la-lead{font-size:16px;line-height:1.6;max-width:440px;margin:22px 0}.la-trust{padding:38px 0;text-align:center;font-size:11px;font-weight:700}.la-trust-row{display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin-top:18px}.la-chip{background:var(--ice);border-radius:6px;padding:10px 15px;font-size:11px}.la-section{padding:90px 0}.la-head{max-width:650px;margin-bottom:38px}.la-h2{font-size:clamp(42px,6vw,68px)}.la-head p{color:#617269;line-height:1.6}.la-tools{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.la-tool{background:var(--ice);border-radius:12px;padding:12px;min-height:390px;display:flex;flex-direction:column}.la-shot{height:190px;border-radius:9px;background:#fff;border:1px solid #c8d8c5;padding:16px;overflow:hidden}.la-shot-total{font-family:'Archivo Black';font-size:30px;margin:10px 0;color:var(--green)}.la-bars i{display:block;height:9px;background:#dce8d7;margin:8px 0;border-radius:5px}.la-bars i:nth-child(2){width:74%;background:var(--lime)}.la-bars i:nth-child(3){width:48%}.la-tool h3{font-size:18px;margin:20px 8px 8px}.la-tool p{font-size:13px;line-height:1.5;color:#586a60;margin:0 8px 18px;flex:1}.la-tool .la-btn{align-self:flex-start;margin:0 8px 8px}.la-dark{background:var(--green);color:white;border-radius:20px;padding:100px 0;overflow:hidden}.la-dark .la-head{text-align:center;margin:0 auto 44px}.la-dark .la-h2 span{color:var(--lime);text-shadow:2px 3px 0 #000}.la-orbit{width:min(820px,90%);min-height:330px;margin:auto;position:relative;border-radius:50% 50% 0 0;background:radial-gradient(circle at 50% 100%,#80bad2 0 24%,#8475ee 25% 38%,#172e59 39% 54%,transparent 55%);border-bottom:1px solid #53675e}.la-bubble{position:absolute;background:#eef3eb;color:var(--green);padding:10px 15px;border-radius:999px;font-size:11px;font-weight:800;box-shadow:0 5px 20px #0005}.la-bubble:nth-child(1){left:8%;top:22%}.la-bubble:nth-child(2){right:6%;top:18%}.la-bubble:nth-child(3){left:28%;top:52%}.la-bubble:nth-child(4){right:28%;top:58%}.la-story{background:var(--ice);border-radius:20px;padding:90px 0}.la-story .la-head{text-align:center;margin:0 auto 48px}.la-flow{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.la-flow-card{text-align:center}.la-icon{width:78px;height:78px;margin:0 auto 16px;border:2px solid var(--green);background:white;border-radius:18px;display:grid;place-items:center;box-shadow:6px 6px 0 var(--lime);transform:rotate(-2deg)}.la-flow-card h3{font-size:15px;margin:0 0 6px}.la-flow-card p{font-size:12px;color:#607268;line-height:1.45}.la-split{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}.la-phone{background:var(--green);border-radius:30px;padding:26px;box-shadow:14px 14px 0 var(--lime);color:white;transform:rotate(1deg)}.la-phone-top{display:flex;justify-content:space-between;color:#a8b9b0;font-size:11px}.la-debt{font-family:'Archivo Black';font-size:48px;color:var(--lime);margin:18px 0}.la-row{display:flex;justify-content:space-between;align-items:center;background:#123c2e;padding:14px;border-radius:12px;margin-top:9px;font-size:12px}.la-row b{font-size:14px}.la-cta{padding:90px 0}.la-cta-box{background:linear-gradient(120deg,#b7e5ed,#e9efa5);border-radius:22px;padding:70px;text-align:center}.la-cta-box .la-h2{max-width:820px;margin:auto}.la-cta-box p{max-width:550px;margin:20px auto 28px;line-height:1.6}.la-footer{background:#8fd8d8;padding:70px 0 25px}.la-footer-logo{font-family:'Archivo Black';font-size:clamp(70px,13vw,160px);color:var(--lime);text-shadow:6px 8px 0 var(--green);line-height:1;text-align:center}.la-footline{display:flex;justify-content:space-between;border-top:1px solid #3c7772;padding-top:20px;margin-top:45px;font-size:11px}
@media(max-width:850px){.la-tools{grid-template-columns:1fr}.la-tool{min-height:0}.la-flow{grid-template-columns:repeat(2,1fr)}.la-split{grid-template-columns:1fr}.la-copy{width:70%}.la-links>a:not(.la-btn){display:none}}
@media(max-width:600px){.la-hero{background-position:62% center;background-image:linear-gradient(90deg,rgba(255,255,255,.96),rgba(255,255,255,.72)),url('/borcama-hero-alt.png')}.la-copy{width:100%}.la-h1{font-size:52px}.la-section{padding:65px 0}.la-flow{grid-template-columns:1fr}.la-cta-box{padding:45px 20px}.la-footline{flex-direction:column;gap:10px}.la-orbit{min-height:280px}.la-bubble{font-size:9px}}
.la{--lime:#cdf564;--coral:#ff6f59;--cream:#f4efe0;--ink:#14160f;background:var(--cream);color:var(--ink)}
.la-logo{display:block;width:136px}.la-logo img{display:block;width:100%;height:auto}
.la-hero{margin:0;padding:0;min-height:650px;border-radius:0;border:2px solid var(--ink);border-left:0;border-right:0;background:radial-gradient(circle at 83% 16%,#ff6f5966 0 9%,transparent 9.3%),radial-gradient(circle at 76% 78%,#cdf564aa 0 17%,transparent 17.3%),linear-gradient(135deg,#f4efe0 0 60%,#d8e6df 60% 100%);overflow:hidden}
.la-hero-in{min-height:650px;display:grid;grid-template-columns:1fr .9fr;gap:70px;align-items:center}.la-copy{width:auto}.la-tool{background:#fff;border:2px solid var(--ink);border-radius:18px;box-shadow:5px 5px 0 #dbe7d4}.la-story{border-radius:0;border-top:2px solid var(--ink);border-bottom:2px solid var(--ink)}
.la-demo{background:var(--green);border:3px solid var(--ink);border-radius:26px;padding:25px;color:white;box-shadow:13px 13px 0 var(--coral);transform:rotate(1deg)}.la-demo-top{display:flex;justify-content:space-between;color:#aebdb5;font-size:11px;margin-bottom:20px}.la-demo-dots{display:flex;gap:5px}.la-demo-dots i{width:9px;height:9px;border-radius:50%;background:var(--lime)}.la-demo-dots i:nth-child(2){background:var(--coral)}.la-demo-dots i:nth-child(3){background:#ffcf6e}.la-demo-label{font-size:10px;letter-spacing:.08em;color:#aebdb5}.la-demo-total{font-family:'Archivo Black';font-size:clamp(38px,5vw,60px);color:var(--lime);text-shadow:3px 3px 0 var(--coral);margin:8px 0 22px}.la-demo-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.la-demo-cell{background:#153d30;border:1px solid #385b50;border-radius:13px;padding:14px}.la-demo-cell small{display:block;color:#9fafaa;font-size:9px;margin-bottom:7px}.la-demo-cell b{font-size:14px}.la-demo-pay{margin-top:11px;background:#fff;color:var(--ink);border-radius:13px;padding:13px;display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:12px}.la-demo-pay span{display:block;color:#647169;font-size:10px;margin-top:2px}.la-demo-pay strong:last-child{white-space:nowrap}
.la-command{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;position:relative}.la-command:before{content:'';position:absolute;left:7%;right:7%;top:39px;height:2px;background:#49665b}.la-command-card{position:relative;background:#123c2e;border:1px solid #49665b;border-radius:18px;padding:22px;min-height:210px;z-index:1}.la-command-no{width:36px;height:36px;display:grid;place-items:center;background:var(--lime);color:var(--ink);border:2px solid var(--ink);border-radius:50%;font-family:'Archivo Black';font-size:13px;margin-bottom:28px}.la-command-card h3{margin:0 0 9px;font-size:16px}.la-command-card p{margin:0;color:#aebdb5;font-size:12px;line-height:1.5}.la-command-card b{display:block;color:var(--lime);font-family:'Archivo Black';font-size:20px;margin-top:18px}.la-progress{margin-top:18px;background:#06261c;border:1px solid #49665b;border-radius:16px;padding:20px;display:grid;grid-template-columns:auto 1fr auto;gap:18px;align-items:center}.la-progress span{font-size:11px;color:#aebdb5}.la-progress-track{height:12px;border:2px solid #749084;border-radius:999px;overflow:hidden}.la-progress-track i{display:block;width:38%;height:100%;background:linear-gradient(90deg,var(--coral),var(--lime))}.la-progress strong{color:var(--lime);font-family:'Archivo Black'}
.la-chip{border:1px solid #b8cbb6}.la-chip:nth-child(2),.la-chip:nth-child(4){background:#ffe1d9;border-color:#f6a08f}.la-tool:nth-child(2){box-shadow:6px 6px 0 var(--coral)}.la-tool:nth-child(3){box-shadow:6px 6px 0 var(--lime)}.la-tool:nth-child(2) .la-shot{background:#fff1ec}.la-tool:nth-child(3) .la-shot{background:#f4ffdc}.la-command-card:nth-child(2) .la-command-no,.la-command-card:nth-child(4) .la-command-no{background:var(--coral)}.la-command-card:nth-child(3){border-color:#94bb78}.la-story{position:relative;overflow:hidden;background:radial-gradient(circle at 5% 16%,#ff6f5955 0 10%,transparent 10.3%),radial-gradient(circle at 95% 88%,#cdf56477 0 13%,transparent 13.3%),linear-gradient(135deg,#edf5e7 0 60%,#f4efe0 60%)}.la-flow-card:nth-child(even) .la-icon{box-shadow:6px 6px 0 var(--coral)}.la-flow-card:nth-child(3) .la-icon{background:#f4ffdc}.la-phone{box-shadow:14px 14px 0 var(--coral)}.la-row:nth-child(3){border-left:5px solid var(--lime)}.la-row:nth-child(4){border-left:5px solid var(--coral)}.la-cta-box{background:radial-gradient(circle at 90% 10%,#cdf564 0 13%,transparent 13.4%),linear-gradient(125deg,#ff8c78,#ff6f59 55%,#f4efe0 55%);border:2px solid var(--ink);box-shadow:9px 9px 0 var(--green)}.la-footer{background:linear-gradient(135deg,#9bdcda 0 72%,#ff8c78 72%);border-top:2px solid var(--ink)}.la-footer-logo{text-shadow:6px 8px 0 var(--green),10px 12px 0 var(--coral)}
.la-trust{padding:52px 0 24px;font-size:15px;line-height:1.3;font-weight:800}.la-trust-row{gap:12px;margin-top:22px}.la-chip{padding:13px 20px;border-width:2px;border-radius:10px;font-size:13px;box-shadow:2px 2px 0 #c6d3c3}.la-section#araclar{padding-top:70px}.la-dark{border-radius:0;border-top:2px solid var(--ink);border-bottom:2px solid var(--ink)}
.la-assets{display:grid;grid-template-columns:minmax(0,.9fr) minmax(420px,1.1fr);gap:70px;align-items:center;padding-top:70px}.la-assets-copy .la-head{margin-bottom:25px}.la-assets-kicker{display:inline-flex;align-items:center;gap:7px;background:var(--coral);border:2px solid var(--ink);border-radius:999px;padding:7px 11px;font-size:11px;font-weight:800;margin-bottom:20px;box-shadow:3px 3px 0 var(--lime)}.la-assets-tags{display:flex;gap:8px;flex-wrap:wrap;margin:24px 0 28px}.la-assets-tags span{display:inline-flex;align-items:center;gap:6px;border:1.5px solid var(--ink);border-radius:999px;background:#fff;padding:8px 11px;font-size:11px;font-weight:800}.la-assets-panel{background:var(--green);color:#fff;border:3px solid var(--ink);border-radius:25px;padding:25px;box-shadow:13px 13px 0 var(--lime);transform:rotate(-.7deg)}.la-assets-top{display:flex;align-items:center;justify-content:space-between;gap:15px;color:#afbeb7;font-size:10px;letter-spacing:.08em}.la-assets-live{display:inline-flex;align-items:center;gap:6px;color:var(--lime);letter-spacing:0}.la-assets-live i{width:7px;height:7px;border-radius:50%;background:var(--lime);box-shadow:0 0 0 4px #cdf56422}.la-assets-total-label{font-size:10px;color:#afbeb7;margin-top:23px}.la-assets-total{font-family:'Archivo Black';font-size:clamp(40px,5vw,58px);color:var(--lime);text-shadow:3px 3px 0 var(--coral);margin:7px 0 17px}.la-assets-mini{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:19px}.la-assets-mini div{background:#153d30;border:1px solid #385b50;border-radius:12px;padding:12px}.la-assets-mini small{display:block;color:#9fafaa;font-size:9px;margin-bottom:6px}.la-assets-mini b{font-size:13px}.la-assets-mini .gain b{color:var(--lime)}.la-assets-list{display:grid;gap:9px}.la-asset-row{background:#fff;color:var(--ink);border-radius:12px;padding:12px 13px}.la-asset-line{display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:11px;font-weight:800}.la-asset-line span{display:flex;align-items:center;gap:7px}.la-asset-track{height:7px;border-radius:999px;background:#dfe9dc;margin-top:9px;overflow:hidden}.la-asset-track i{display:block;height:100%;background:linear-gradient(90deg,var(--coral),var(--lime));border-radius:inherit}.la-assets-note{color:#9fafaa;font-size:9px;line-height:1.5;margin-top:13px}
@media(max-width:850px){.la-hero-in{grid-template-columns:1fr;padding:65px 0}.la-demo{max-width:620px}.la-copy{width:auto}}
@media(max-width:850px){.la-command{grid-template-columns:repeat(2,1fr)}.la-command:before{display:none}}
@media(max-width:850px){.la-assets{grid-template-columns:1fr;gap:38px}.la-assets-panel{max-width:680px;width:calc(100% - 13px)}}
@media(max-width:600px){.la-hero{background:linear-gradient(145deg,#f4efe0 0 70%,#d8e6df 70%)}.la-demo-grid{grid-template-columns:1fr}}
@media(max-width:600px){.la-command{grid-template-columns:1fr}.la-progress{grid-template-columns:1fr}}
@media(max-width:850px){.la-links>.la-login{display:inline-flex!important}.la-nav-anchor{display:none!important}.la-links{gap:12px}}
@media(max-width:600px){.la-shell{width:min(100% - 24px,1160px)}.la-nav{height:64px}.la-logo{width:118px}.la-links{gap:8px}.la-login{font-size:11px;white-space:nowrap}.la-nav .la-btn{padding:9px 11px;font-size:11px;box-shadow:2px 2px 0 var(--green)}.la-nav .la-btn svg{display:none}.la-hero-in{padding:48px 0 58px;gap:42px}.la-h1{font-size:clamp(42px,13vw,52px);overflow-wrap:anywhere}.la-h2{font-size:clamp(36px,11vw,48px);overflow-wrap:anywhere}.la-lead{font-size:15px}.la-demo{width:calc(100% - 7px);padding:17px;border-radius:20px;box-shadow:7px 7px 0 var(--coral);transform:none}.la-demo-total{font-size:38px}.la-demo-pay{align-items:flex-start}.la-demo-pay>strong{font-size:11px}.la-trust{padding:38px 0 18px}.la-chip{padding:10px 12px;font-size:11px}.la-dark,.la-story{padding:64px 0}.la-command-card{min-height:0}.la-phone{padding:19px;border-radius:22px;box-shadow:7px 7px 0 var(--coral);transform:none}.la-debt{font-size:38px}.la-cta{padding:62px 0}.la-cta-box{box-shadow:6px 6px 0 var(--green)}.la-footer{padding-top:48px}.la-footer-logo img{width:100%!important}.la-footline{margin-top:28px}}
@media(max-width:600px){.la-assets{padding-top:48px}.la-assets-panel{padding:17px;border-radius:20px;box-shadow:7px 7px 0 var(--lime);transform:none}.la-assets-mini{grid-template-columns:1fr}.la-assets-total{font-size:38px}.la-assets-tags span{font-size:10px;padding:7px 9px}}
.la-pricing{padding:90px 0}.la-pricing-head{text-align:center;max-width:680px;margin:0 auto 38px}.la-pricing-head p{color:#617269;line-height:1.55}.la-pricing-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;max-width:1160px;margin:auto}.la-price-card{display:flex;flex-direction:column;padding:28px;background:#fff;border:2px solid var(--ink);border-radius:20px}.la-price-card.pro{background:var(--green);color:#fff;box-shadow:9px 9px 0 var(--coral)}.la-price-badge{align-self:flex-start;border:1.5px solid currentColor;border-radius:999px;padding:5px 9px;font-size:10px;font-weight:800}.la-price-card h3{font-size:24px;margin:18px 0 5px}.la-price{font-family:'Archivo Black';font-size:38px;line-height:1.1;margin:10px 0}.la-price small{font:600 11px 'Space Grotesk';opacity:.7}.la-price-card>p{min-height:42px;color:#617269;font-size:13px;line-height:1.5}.la-price-card.pro>p{color:#b9c8c0}.la-price-list{display:grid;gap:10px;margin:20px 0 26px;padding:0;list-style:none}.la-price-list li{display:flex;align-items:flex-start;gap:8px;font-size:12px;line-height:1.4}.la-price-list svg{flex:0 0 auto;color:#5d7a2e}.la-price-card.pro .la-price-list svg{color:var(--lime)}.la-price-card .la-btn{margin-top:auto;align-self:stretch}.la-price-card.pro .la-btn{box-shadow:3px 3px 0 var(--coral)}
@media(max-width:700px){.la-pricing{padding:64px 0}.la-pricing-grid{grid-template-columns:1fr}.la-price-card{padding:22px}.la-price-card>p{min-height:0}}
.la-section{padding:72px 0}.la-section#araclar{padding-top:58px}.la-tool{min-height:230px;padding:24px}.la-tool-icon{width:50px;height:50px;display:grid;place-items:center;border:2px solid var(--ink);border-radius:14px;background:var(--lime);box-shadow:4px 4px 0 var(--coral)}.la-tool h3{margin:24px 0 8px}.la-tool p{margin:0;line-height:1.55}.la-pricing{padding:76px 0}.la-pricing-grid{grid-template-columns:repeat(2,minmax(0,1fr));max-width:820px}.la-pro-prices{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0}.la-pro-price{padding:11px;border:1.5px solid #5b6e64;border-radius:12px;background:#123c2e}.la-pro-price span{display:block;color:#b9c8c0;font-size:10px;font-weight:800}.la-pro-price strong{display:block;margin-top:4px;font-family:'Archivo Black';font-size:22px;color:#fff}.la-pro-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:auto}.la-pro-actions .la-btn{padding-inline:10px}.la-price-card.pro .la-btn{color:var(--green)}.la-footer{padding-top:58px}
.la-debt-workflow{padding:76px 0;background:var(--green);color:#fff;border-top:2px solid var(--ink);border-bottom:2px solid var(--ink)}.la-debt-workflow-in{display:grid;grid-template-columns:minmax(0,.82fr) minmax(470px,1.18fr);gap:64px;align-items:center}.la-debt-workflow .la-head{margin-bottom:26px}.la-debt-workflow .la-head p{color:#b9c8c0}.la-debt-workflow .la-mark{text-shadow:3px 4px 0 #000}.la-debt-steps{display:grid;gap:10px}.la-debt-step{display:grid;grid-template-columns:30px minmax(0,1fr);gap:10px;align-items:start;padding:11px 12px;border:1px solid #49665b;border-radius:13px;background:#123c2e}.la-debt-step svg{width:30px;height:30px;padding:7px;border:1.5px solid var(--ink);border-radius:9px;background:var(--lime);color:var(--ink)}.la-debt-step strong{display:block;font-size:13px}.la-debt-step small{display:block;margin-top:3px;color:#aebdb5;font-size:11px;line-height:1.4}.la-statement{padding:24px;border:3px solid var(--ink);border-radius:24px;background:var(--cream);color:var(--ink);box-shadow:12px 12px 0 var(--coral);transform:rotate(.5deg)}.la-statement-top{display:flex;justify-content:space-between;gap:12px;color:#667068;font-size:10px;font-weight:800;letter-spacing:.05em}.la-statement h3{margin:17px 0 15px;font-size:22px}.la-statement-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.la-statement-cell{padding:11px;border:1.5px solid var(--ink);border-radius:11px;background:#fff}.la-statement-cell small{display:block;color:#6b726b;font-size:9px;margin-bottom:5px}.la-statement-cell strong{font-family:'Archivo Black';font-size:16px}.la-statement-remaining{display:flex;align-items:end;justify-content:space-between;gap:15px;margin-top:13px;padding:14px;border-radius:12px;background:var(--ink);color:#fff}.la-statement-remaining small{display:block;color:#afb6ad;font-size:9px}.la-statement-remaining strong{font-family:'Archivo Black';font-size:25px;color:var(--lime)}.la-payment-actions{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}.la-payment-actions span{padding:6px 8px;border:1px solid #687068;border-radius:999px;font-size:9px;font-weight:800}.la-assets-secondary{padding-top:58px;padding-bottom:58px;grid-template-columns:minmax(0,1fr) minmax(360px,.82fr);gap:52px}.la-assets-secondary .la-h2{font-size:clamp(34px,4.5vw,52px)}.la-assets-secondary .la-assets-tags{margin-bottom:0}.la-assets-panel-compact{padding:22px}.la-assets-panel-compact .la-assets-total{margin-bottom:16px}.la-assets-compact-row{display:flex;gap:7px;flex-wrap:wrap}.la-assets-compact-row span{padding:7px 9px;border:1px solid #49665b;border-radius:999px;background:#153d30;color:#d5dfda;font-size:9px;font-weight:800}
@media(max-width:600px){.la-section{padding:54px 0}.la-section#araclar{padding-top:44px}.la-tool{min-height:0;padding:20px}.la-tool h3{margin-top:20px}.la-pricing{padding:56px 0}.la-pricing-grid{grid-template-columns:1fr}.la-pro-actions{grid-template-columns:1fr}.la-footer{padding-top:44px}}
@media(max-width:850px){.la-debt-workflow-in{grid-template-columns:1fr;gap:34px}.la-assets-secondary{grid-template-columns:1fr;gap:30px}}
@media(max-width:600px){.la-debt-workflow{padding:56px 0}.la-statement{padding:17px;border-radius:19px;box-shadow:7px 7px 0 var(--coral);transform:none}.la-statement-grid{grid-template-columns:1fr 1fr}.la-statement-cell strong{font-size:14px}.la-statement-remaining{display:grid}.la-payment-actions{justify-content:flex-start}.la-assets-secondary{padding-top:44px;padding-bottom:44px}.la-assets-panel-compact{padding:17px}}
/* Uygulamayla ortak sakin yüzey dili. Güçlü kontur yalnızca marka illüstrasyonlarında kalır. */
.la{--surface-line:#09291f22}
.la-btn{border:1px solid var(--surface-line);box-shadow:0 7px 18px #09291f12}
.la-hero,.la-story,.la-dark,.la-debt-workflow,.la-footer{border-width:0}
.la-tool,.la-price-card,.la-statement,.la-demo,.la-assets-panel,.la-cta-box{border:1px solid var(--surface-line);box-shadow:0 16px 38px #09291f12;transform:none}
.la-demo,.la-assets-panel,.la-price-card.pro{border-color:#ffffff24;box-shadow:0 16px 38px #09291f24}
.la-tool-icon,.la-icon,.la-assets-kicker,.la-assets-tags span,.la-statement-cell,.la-debt-step svg,.la-command-no,.la-pro-price{border-width:1px;box-shadow:none}
.la-chip,.la-price-badge,.la-progress-track{border-width:1px;box-shadow:none}
.la-phone{box-shadow:0 18px 42px #09291f24;transform:none}
.la-tool:nth-child(2),.la-tool:nth-child(3),.la-flow-card:nth-child(even) .la-icon,.la-flow-card:nth-child(3) .la-icon{box-shadow:none}
`;
export default function LandingAlt() {
  return (
    <div className="la">
      <style>{CSS}</style>
      <header className="la-shell la-nav">
        <a className="la-logo" href="/">
          <img src="/borcama-logo.png" alt="Borcama" />
        </a>
        <nav className="la-links">
          <a className="la-login" href="/login">
            Giriş yap
          </a>
          <a className="la-btn" href="/register?plan=free">
            Hemen Başla! <ArrowRight size={14} />
          </a>
        </nav>
      </header>
      <main>
        <section className="la-hero">
          <div className="la-shell la-hero-in">
            <div className="la-copy">
              <div className="la-tag">Borçlarının kontrolü yeniden sende.</div>
              <h1 className="la-h1">
                Rakamları gör.
                <br />
                <span className="la-mark">Rahatça ilerle.</span>
              </h1>
              <p className="la-lead">
                Borcama, farklı bankalardaki borçlarını tek bir plana
                dönüştürür. Ne ödeyeceğini, ne kadar faiz işlediğini ve sırada
                hangi borcun olduğunu bil.
              </p>
              <a className="la-btn" href="/register?plan=free">
                Planımı oluştur <ArrowRight size={14} />
              </a>
            </div>
            <div className="la-demo">
              <div className="la-demo-top">
                <div className="la-demo-dots">
                  <i />
                  <i />
                  <i />
                </div>
                <span>BORCAMA ÖZET</span>
              </div>
              <div className="la-demo-label">
                TÜM BANKALARDAKİ TOPLAM BORCUN
              </div>
              <div className="la-demo-total">₺284.750</div>
              <div className="la-demo-grid">
                <div className="la-demo-cell">
                  <small>BU AY ÖDENECEK</small>
                  <b>₺42.600</b>
                </div>
                <div className="la-demo-cell">
                  <small>TAHMİNİ FAİZ</small>
                  <b>₺7.840</b>
                </div>
                <div className="la-demo-cell">
                  <small>KREDİ KARTLARI</small>
                  <b>₺164.750</b>
                </div>
                <div className="la-demo-cell">
                  <small>KREDİLER</small>
                  <b>₺120.000</b>
                </div>
              </div>
              <div className="la-demo-pay">
                <div>
                  <strong>Yapı Kredi · World</strong>
                  <span>4 gün kaldı · minimum ödeme</span>
                </div>
                <strong>₺18.400</strong>
              </div>
            </div>
          </div>
        </section>
        <section className="la-trust">
          <div className="la-shell">
            Tek yerde takip edebileceğin borç türleri
            <div className="la-trust-row">
              <span className="la-chip">Kredi kartı</span>
              <span className="la-chip">Tüketici kredisi</span>
              <span className="la-chip">Ek hesap / KMH</span>
              <span className="la-chip">Gecikmiş borç</span>
              <span className="la-chip">Gelir & harcama</span>
            </div>
          </div>
        </section>
        <section id="araclar" className="la-shell la-section">
          <div className="la-head">
            <h2 className="la-h2">
              Gerçekten kullanacağın
              <br />
              <span className="la-mark">üç temel ekran.</span>
            </h2>
          </div>
          <div className="la-tools">
            <Tool
              icon={<WalletCards />}
              title="Borç merkezi"
              text="Kart, kredi ve ek hesaplarını banka banka tek ekranda gör."
            />
            <Tool
              icon={<ReceiptText />}
              title="Ekstre sağlaması"
              text="Manuel kayıtlarınla bankadan gelen ekstre arasındaki farkı yakala."
            />
            <Tool
              icon={<Target />}
              title="Kapatma planı"
              text="Çığ veya kartopu yöntemiyle hangi borçtan başlayacağını seç."
            />
          </div>
        </section>
        <section className="la-debt-workflow">
          <div className="la-shell la-debt-workflow-in">
            <div>
              <div className="la-head">
                <h2 className="la-h2">
                  Borcunu ekle.
                  <br />
                  <span className="la-mark">Her ay güncelle.</span>
                </h2>
                <p>
                  İlk kurulumdan sonra yalnızca yeni ekstreyi ve yaptığın
                  ödemeyi gir. Kalan borcun otomatik olarak güncellensin.
                </p>
              </div>
              <div className="la-debt-steps">
                <DebtStep
                  title="Kart, kredi veya ek hesabını ekle"
                  text="Banka, limit, ödeme günü ve temel borç bilgilerini bir kez gir."
                />
                <DebtStep
                  title="Yeni ekstreyi dönemine kaydet"
                  text="Güncel dönem borcu ile önceki aydan devredeni ayrı gör."
                />
                <DebtStep
                  title="Ödemeni işaretle"
                  text="Minimum, kısmi veya tam ödeme gir; kalan tutarı kaybetme."
                />
              </div>
            </div>
            <div className="la-statement" aria-label="Kredi kartı borç görünümü önizlemesi">
              <div className="la-statement-top">
                <span>TEMMUZ 2026 EKSTRESİ</span>
                <span>KREDİ KARTI</span>
              </div>
              <h3>Halkbank · Paraf</h3>
              <div className="la-statement-grid">
                <StatementCell label="GÜNCEL DÖNEM BORCU" value="₺34.927" />
                <StatementCell label="GEÇEN AYDAN DEVREDEN" value="₺75.193" />
                <StatementCell label="TOPLAM BORÇ" value="₺110.120" />
                <StatementCell label="TOPLAM ÖDENEN" value="₺44.045" />
              </div>
              <div className="la-statement-remaining">
                <div>
                  <small>KALAN BORÇ</small>
                  <strong>₺66.075</strong>
                </div>
                <div className="la-payment-actions">
                  <span>Minimum ödedim</span>
                  <span>Kısmi ödeme</span>
                  <span>Tamamını ödedim</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="varliklar" className="la-shell la-section la-assets la-assets-secondary">
          <div className="la-assets-copy">
            <div className="la-assets-kicker">
              <PiggyBank size={15} /> İstersen varlıklarını da ekle
            </div>
            <div className="la-head">
              <h2 className="la-h2">
                Varlığını gör.
                <br />
                <span className="la-mark">Net durumunu bil.</span>
              </h2>
              <p>
                Dövizden altına, kriptodan BES ve fonlara kadar birikimlerini
                borçlarınla aynı yerde takip et. Güncel yaklaşık değerini,
                maliyetini ve tahmini kârını tek bakışta gör.
              </p>
            </div>
            <div className="la-assets-tags">
              <span><Coins size={14} /> Döviz & emtia</span>
              <span><TrendingUp size={14} /> Hisseler & fonlar</span>
              <span><PiggyBank size={14} /> BES</span>
              <span><Landmark size={14} /> Kripto</span>
            </div>
          </div>
          <div className="la-assets-panel la-assets-panel-compact" aria-label="Varlık portföyü önizlemesi">
            <div className="la-assets-top">
              <span>VARLIK PORTFÖYÜ</span>
              <span className="la-assets-live"><i /> Güncel fiyatlarla</span>
            </div>
            <div className="la-assets-total-label">TOPLAM YAKLAŞIK DEĞER</div>
            <div className="la-assets-total">₺486.420</div>
            <div className="la-assets-compact-row">
              <span>Döviz · emtia</span>
              <span>Fon · hisse</span>
              <span>BES · kripto</span>
            </div>
            <div className="la-assets-note">
              Piyasa verileri bilgilendirme amaçlı yaklaşık değerlerdir.
            </div>
          </div>
        </section>
        <section id="fiyatlar" className="la-pricing">
          <div className="la-shell">
            <div className="la-pricing-head">
              <h2 className="la-h2">Sana uygun olanla başla.</h2>
              <p>
                Ücretsiz hesapla temel takibe başla. İlk 30 gün tüm Pro
                özelliklerini kart bilgisi vermeden dene.
              </p>
            </div>
            <div className="la-pricing-grid">
              <article className="la-price-card">
                <span className="la-price-badge">ÜCRETSİZ</span>
                <h3>Borcama Ücretsiz</h3>
                <div className="la-price">₺0</div>
                <p>Finansal durumunu tek yerde takip etmeye başla.</p>
                <ul className="la-price-list">
                  <li><Check size={15} /> Borç, ödeme ve harcama takibi</li>
                  <li><Check size={15} /> Varlık ve net durum takibi</li>
                  <li><Check size={15} /> Her ay bir kişisel öneri</li>
                  <li><Check size={15} /> Temel finans özeti</li>
                </ul>
                <a className="la-btn" href="/register">Ücretsiz başla</a>
              </article>
              <article className="la-price-card pro">
                <span className="la-price-badge">30 GÜN ÜCRETSİZ DENE</span>
                <h3>Borcama Pro</h3>
                <div className="la-pro-prices">
                  <div className="la-pro-price">
                    <span>AYLIK</span>
                    <strong>₺99</strong>
                  </div>
                  <div className="la-pro-price">
                    <span>YILLIK</span>
                    <strong>₺999</strong>
                  </div>
                </div>
                <p>Kart bilgisi gerekmez. Deneme biterse hesabın otomatik olarak Ücretsiz plana döner.</p>
                <ul className="la-price-list">
                  <li><Check size={15} /> Ücretsiz paketteki her şey</li>
                  <li><Check size={15} /> Tüm kişiselleştirilmiş öneriler</li>
                  <li><Check size={15} /> Aylık yük ve faiz önceliği analizleri</li>
                  <li><Check size={15} /> Aylık yük ve faiz senaryoları</li>
                </ul>
                <div className="la-pro-actions">
                  <a className="la-btn" href="/register">30 gün ücretsiz dene</a>
                </div>
              </article>
            </div>
          </div>
        </section>
      </main>
      <footer className="la-footer">
        <div className="la-shell">
          <div className="la-footer-logo">
            <img
              src="/borcama-logo.png"
              alt="Borcama"
              style={{ width: "min(620px,90%)", height: "auto" }}
            />
          </div>
          <div className="la-footline">
            <span>Kişisel borç, harcama ve varlık takip aracı.</span>
            <span>
              <a href="/terms">Kullanıcı Sözleşmesi</a> ·{" "}
              <a href="/privacy">Gizlilik ve KVKK</a>
              {" · "}<a href="/refund-policy">İade Politikası</a>
              {" · "}<a href="/faq">SSS</a>
            </span>
            <span>Finansal tavsiye değildir.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
function Tool({ icon, title, text }) {
  return (
    <article className="la-tool">
      <div className="la-tool-icon">{React.cloneElement(icon, { size: 25 })}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}
function DebtStep({ title, text }) {
  return (
    <div className="la-debt-step">
      <Check />
      <div>
        <strong>{title}</strong>
        <small>{text}</small>
      </div>
    </div>
  );
}
function StatementCell({ label, value }) {
  return (
    <div className="la-statement-cell">
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  );
}
