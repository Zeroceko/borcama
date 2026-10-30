import { nativeMi } from "./platform.js";
import React from "react";
import { ArrowLeft } from "lucide-react";
import { t } from "./i18n.js";
import Ceviri from "./Ceviri.jsx";

const CSS = `
.faq,.faq *{box-sizing:border-box}.faq{--ink:#14160f;--green:#063326;--lime:#c8f95a;--coral:#ff6e59;--cream:#f5f0e2;min-height:100vh;background:var(--cream);color:var(--ink);font-family:'Space Grotesk',sans-serif}.faq a{color:inherit}.faq-shell{width:min(900px,calc(100% - 32px));margin:auto}.faq-nav{display:flex;align-items:center;justify-content:space-between;gap:20px;min-height:78px}.faq-logo{display:block;width:145px}.faq-logo img{display:block;width:100%;height:auto}.faq-back{display:inline-flex;border:0;background:transparent;color:inherit;font-family:inherit;cursor:pointer;align-items:center;gap:7px;font-size:12px;font-weight:800;text-underline-offset:4px}.faq-main{padding:64px 0 90px}.faq-label{display:inline-flex;align-items:center;gap:7px;padding:7px 10px;border:2px solid var(--ink);border-radius:999px;background:var(--lime);font-size:11px;font-weight:800}.faq h1{max-width:760px;margin:20px 0 14px;font:clamp(44px,8vw,72px)/.98 'Archivo Black',sans-serif;letter-spacing:-.045em}.faq-intro{max-width:650px;margin:0 0 42px;color:#5d6359;font-size:16px;line-height:1.65}.faq-list{display:grid;gap:11px}.faq-item{border:2px solid var(--ink);border-radius:17px;background:#fff;overflow:hidden}.faq-item[open]{box-shadow:6px 6px 0 var(--lime)}.faq-item summary{position:relative;min-height:72px;display:flex;align-items:center;padding:18px 58px 18px 21px;list-style:none;font-size:15px;font-weight:800;cursor:pointer}.faq-item summary::-webkit-details-marker{display:none}.faq-item summary:after{content:'+';position:absolute;right:19px;top:50%;width:28px;height:28px;display:grid;place-items:center;transform:translateY(-50%);border:1.5px solid var(--ink);border-radius:50%;background:var(--cream);font-size:18px}.faq-item[open] summary:after{content:'−';background:var(--lime)}.faq-answer{padding:0 21px 21px;color:#5d6359;font-size:14px;line-height:1.7}.faq-answer p{margin:0}.faq-answer a{color:var(--green);font-weight:800}.faq-contact{margin-top:34px;padding:22px;border:2px solid var(--ink);border-radius:17px;background:var(--green);color:#fff;box-shadow:7px 7px 0 var(--coral);text-align:center}.faq-contact p{margin:0 0 6px;font-weight:700}.faq-contact a{color:var(--lime);font-weight:800}.faq-footer{padding:26px 0;border-top:2px solid var(--ink);font-size:11px;color:#5d6359}.faq-footer .faq-shell{display:flex;justify-content:space-between;gap:18px;flex-wrap:wrap}.faq-footer a{font-weight:700}
@media(max-width:600px){.faq-nav{min-height:66px}.faq-logo{width:116px}.faq-main{padding:42px 0 70px}.faq h1{font-size:44px}.faq-intro{font-size:15px;margin-bottom:30px}.faq-item summary{min-height:66px;padding:16px 52px 16px 17px;font-size:14px}.faq-answer{padding:0 17px 17px;font-size:13.5px}.faq-contact{padding:19px}}
.faq-label,.faq-item,.faq-item summary:after,.faq-contact{border-width:1px;border-color:#14160f24}.faq-item[open],.faq-contact{box-shadow:0 11px 28px #14160f12}.faq-footer{border-top-width:1px;border-top-color:#14160f1f}
.faq h1{margin-top:0}
`;

const sade = (id) => [t(`sss.${id}.soru`), t(`sss.${id}.cevap`)];

// Sorular cizim aninda uretilir (secili dilde).
const sorular = () => [
  sade("ne"),
  sade("banka"),
  [t("sss.odemeGorunuyor.soru"), <Ceviri anahtar="sss.odemeGorunuyor.cevap" degerler={{ ekran: <strong>{t("sss.odemeGorunuyor.ekran")}</strong> }} />],
  sade("asgari"),
  sade("yapilandirma"),
  sade("ekstreAyi"),
  sade("tahmin"),
  [
    t("sss.kaynak.soru"),
    <Ceviri
      anahtar="sss.kaynak.cevap"
      degerler={{ ekran: <strong>{t("sss.kaynak.ekran")}</strong>, eposta: <a href="mailto:zero@borcama.com">zero@borcama.com</a> }}
    />,
  ],
  sade("paketFark"),
  sade("deneme"),
  sade("yenileme"),
  [
    t("sss.iptal.soru"),
    nativeMi ? (
      <Ceviri anahtar="sss.iptal.cevapNative" degerler={{ yol: <strong>{t("sss.iptal.yol")}</strong> }} />
    ) : (
      <Ceviri anahtar="web.sss.iptal.cevap" degerler={{ yol: <strong>{t("web.sss.iptal.yol")}</strong> }} />
    ),
  ],
  sade("iptalHemen"),
  [t("sss.iade.soru"), <Ceviri anahtar="sss.iade.cevap" degerler={{ baglanti: <a href="/refund-policy">{t("sss.iade.baglanti")}</a> }} />],
  [t("sss.paylasim.soru"), <Ceviri anahtar="sss.paylasim.cevap" degerler={{ baglanti: <a href="/privacy">{t("sss.paylasim.baglanti")}</a> }} />],
];

export default function Faq() {
  return (
    <div className="faq">
      <style>{CSS}</style>
      <header className="faq-shell faq-nav">
        <a className="faq-logo" href="/" aria-label={t("sss.logoEtiket")}>
          <img src="/borcama-logo.png" alt="Borcama" />
        </a>
        {nativeMi ? (
          <button className="faq-back" type="button" onClick={() => window.history.back()}><ArrowLeft size={15} /> {t("ortak.geri")}</button>
        ) : (
          <a className="faq-back" href="/"><ArrowLeft size={15} /> {t("web.anaSayfayaDon")}</a>
        )}
      </header>
      <main className="faq-shell faq-main">
        <h1>{t("sss.baslik")}</h1>
        <p className="faq-intro">{t("sss.giris")}</p>
        <div className="faq-list">
          {sorular().map(([title, answer]) => (
            <details className="faq-item" key={title}>
              <summary>{title}</summary>
              <div className="faq-answer"><p>{answer}</p></div>
            </details>
          ))}
        </div>
        <div className="faq-contact">
          <p>{t("sss.iletisim")}</p>
          <a href="mailto:zero@borcama.com">zero@borcama.com</a>
        </div>
      </main>
      <footer className="faq-footer">
        <div className="faq-shell">
          <span>© Borcama</span>
          <span><a href="/terms">{t("sss.altSozlesme")}</a> · <a href="/privacy">{t("sss.altGizlilik")}</a> · <a href="/refund-policy">{t("sss.altIade")}</a></span>
        </div>
      </footer>
    </div>
  );
}
