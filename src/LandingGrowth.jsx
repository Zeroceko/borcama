import React, { useState } from "react";
import { ArrowRight, ArrowLeft, Check, FileText, CalendarDays, Sparkles, Wallet, ChevronRight } from "lucide-react";
import "./landingGrowth.css";

const money = (value) => new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(value);
// A single fictional scenario. No account reads, persistent writes or model calls.
const example = {
  income: 70000, obligations: 26000, paid: 14000, living: 36000,
  categories: [{ name: "Market", amount: 6900 }, { name: "Yeme & içme", amount: 3000 }, { name: "Ulaşım", amount: 1900 }],
  payments: [{ name: "Kredi taksidi", day: "12", amount: 7500 }, { name: "Kart asgarisi", day: "18", amount: 4500 }],
};
const categoryTotal = example.categories.reduce((total, category) => total + category.amount, 0);

function Logo() { return <a className="lg-logo" href="/" aria-label="Borcama ana sayfa"><picture><source type="image/avif" srcSet="/borcama-logo-368.avif 368w, /borcama-logo-736.avif 736w" sizes="(max-width:760px) 116px, 166px"/><img src="/borcama-logo-368.png" srcSet="/borcama-logo-368.png 368w, /borcama-logo-736.png 736w" sizes="(max-width:760px) 116px, 166px" width="900" height="222" alt="Borcama" decoding="async"/></picture></a>; }
function Signup({ children = "Ücretsiz başla", href = "/register?plan=free", secondary = false }) { return <a className={`lg-button${secondary ? " secondary" : ""}`} href={href}>{children}<ArrowRight size={18}/></a>; }

export function ExamplePanel({ initial = "today", interactive = true }) {
  const [tab, setTab] = useState(initial);
  const remaining = example.obligations - example.paid;
  const balance = example.income - example.obligations - example.living;
  return <div className="lg-product">
    <div className="lg-product-top"><span><span className="lg-status-dot"/> BORCAMA</span><span>Örnek hesap · Eylül</span></div>
    {interactive && <div className="lg-example-tabs" role="tablist" aria-label="Örnek hesabı incele">{[["today", "Bugün"], ["spending", "Harcamalar"], ["assistant", "Asistana sor"]].map(([id, label]) => <button key={id} id={`example-tab-${id}`} role="tab" aria-selected={tab === id} aria-controls="example-content" onClick={() => setTab(id)}>{label}</button>)}</div>}
    <div id="example-content" className="lg-example-content" role={interactive ? "tabpanel" : undefined} aria-labelledby={interactive ? `example-tab-${tab}` : undefined}>
      {tab === "today" && <><div className="lg-product-heading"><CalendarDays size={19}/> Bu ay kalan ödeme</div><div className="lg-product-amount">₺{money(remaining)}</div><div className="lg-progress" aria-label="Ödemelerin yüzde 54'ü tamamlandı"><span style={{ width: `${example.paid / example.obligations * 100}%` }}/></div><p className="lg-product-muted">₺{money(example.paid)} ödendi · toplam ₺{money(example.obligations)}</p><div className="lg-payment-list">{example.payments.map(p => <div key={p.day}><span className="lg-date">{p.day}<small>EYL</small></span><span>{p.name}</span><b>₺{money(p.amount)}</b></div>)}</div><div className="lg-plan-result"><span>Aylık planında<strong>₺{money(balance)} fazlan var</strong></span><Wallet size={24}/></div><p className="lg-product-foot">₺70.000 gelir − ₺26.000 ödeme − ₺36.000 yaşam gideri.<br/>Bu bir plan hesabıdır; banka bakiyen değildir.</p></>}
      {tab === "spending" && <><div className="lg-product-heading"><FileText size={19}/> Ekstrendeki harcamalar</div><div className="lg-product-amount">₺{money(categoryTotal)}</div><p className="lg-product-muted">Örnek ekstre · 3 kategori</p><div className="lg-category-list">{example.categories.map((c, i) => <div key={c.name}><div><span>{c.name}</span><b>₺{money(c.amount)}</b></div><div className={`lg-category-bar color-${i}`}><span style={{width:`${c.amount / categoryTotal * 100}%`}}/></div></div>)}</div><div className="lg-plan-result"><span>En büyük kategori<strong>Market · %{Math.round(example.categories[0].amount / categoryTotal * 100)}</strong></span><FileText size={24}/></div><p className="lg-product-foot">Bu ekstre, ₺36.000 yaşam giderinin bir parçası.<br/>Kategorileri kontrol et, sonra hesabına kaydet.</p></>}
      {tab === "assistant" && <><div className="lg-product-heading"><Sparkles size={19}/> Borcama Asistanı <span className="lg-beta">BETA</span></div><div className="lg-question">Bu ay ödemelerime param yetiyor mu?</div><div className="lg-answer"><strong>Bu örnekte aylık planın ₺8.000 artıda.</strong><ul><li>₺70.000 gelirinden ödemeler ve yaşam giderleri için <b>₺62.000</b> ayrılıyor.</li><li>Kaydedilen ödemelerden sonra bu ay <b>₺12.000 ödeme</b> kalıyor.</li><li>Ödeme günlerinden önce nakdinin hazır olduğunu kontrol et.</li></ul></div><p className="lg-product-foot">Önceden hazırlanmış temsili yanıt; canlı AI çağrısı değildir. Kendi hesabında yanıtlar kayıtlarına göre oluşur. Sonuçları kontrol et.</p></>}
    </div>
  </div>;
}

export function PublicExample() {
  return <div className="lg"><header className="lg-shell lg-nav"><Logo/><Signup/></header><main className="lg-shell lg-demo-page"><a className="lg-back" href="/"><ArrowLeft size={16}/> Ana sayfaya dön</a><div className="lg-demo-intro"><span className="lg-eyebrow">ÖNCE BİR BAK</span><h1>Senin tablon da<br/>böyle netleşebilir.</h1><p>Bugün, Harcamalar ve Asistan sekmelerini incele. Bu hesap tamamen örnek verilerden oluşuyor; hiçbir bilgin kaydedilmiyor.</p></div><ExamplePanel/><div className="lg-demo-cta"><Signup>Kendi hesabını oluştur</Signup><p>Bir kartını, ekstreni veya nakit varlığını ekleyerek başla.</p></div></main></div>;
}

export default function LandingGrowth() {
  const deposit = new URLSearchParams(window.location.search).get("from") === "mevduat";
  const signup = deposit ? "/register?plan=free&redirect=%2Fassets" : "/register?plan=free";
  return <div className="lg">
    <header className="lg-shell lg-nav"><Logo/><nav aria-label="Ana menü"><a className="lg-nav-detail" href="#nasil-calisir">Nasıl çalışır?</a><a href="/login">Giriş yap</a><Signup href={signup}/></nav></header>
    <main>
      <section className="lg-shell lg-hero">
        <div className="lg-hero-copy"><h1>{deposit ? <>Birikimini gör.<span className="lg-hero-mark"><em>Aylık planını tamamla.</em></span></> : <>Paran nereye gidiyor?<span className="lg-hero-mark"><em>Borcunu gör, kontrolü al.</em></span></>}</h1><p>{deposit ? "Nakit ve mevduatını aylık planınla birlikte gör." : "Borçlarını, ödemelerini ve bütçeni tek yerde gör."}</p><div className="lg-hero-actions"><Signup href={signup}/><a className="lg-text-link" href="/demo">Örnek hesabı incele <ChevronRight size={17}/></a><a className="lg-text-link lg-mobile-how" href="#nasil-calisir">Nasıl çalışır? <ChevronRight size={17}/></a></div><div className="lg-reassurance"><span><Check size={15}/> Süresiz Ücretsiz</span><span><Check size={15}/> Kart bilgisi gerekmez</span></div></div>
        <div className="lg-hero-product"><ExamplePanel interactive={false}/><div className="lg-product-caption"><span>Gerçek hayata benzeyen, temsili bir hesap.</span><a href="/demo">İçine bak <ArrowRight size={15}/></a></div></div>
      </section>
      <section className="lg-shell lg-section lg-how" id="nasil-calisir"><div className="lg-section-head"><h2>Bir kayıtla başla.</h2><p>Gerisini hazır oldukça tamamla.</p></div><div className="lg-features">
        <article><span className="lg-step-number">01</span><FileText size={27}/><h3>Ekstreni ekle.</h3><p>Yükle ya da elle gir.</p><div className="lg-mini-categories">{example.categories.map((category) => <span key={category.name}>{category.name} <b>₺{money(category.amount)}</b></span>)}</div></article>
        <article><span className="lg-step-number">02</span><CalendarDays size={27}/><h3>Ödemeni kaydet.</h3><p>Tarih ve kalan tutar güncellensin.</p><div className="lg-mini-payment"><span>12 EYL</span><div>Kredi taksidi<strong>₺7.500</strong></div><Check size={20}/></div></article>
        <article><span className="lg-step-number">03</span><Sparkles size={27}/><h3>Tablona sor.</h3><p>Kayıtlarından kısa cevap al.</p><div className="lg-mini-answer">“Bu ay param yetiyor mu?”<strong>Planında ₺8.000 fazlan var.</strong></div></article>
      </div></section>
      <section className="lg-shell lg-section lg-pricing"><div className="lg-trust"><div><h2>Banka şifresi yok.</h2><p>Ekstre dosyan cihazında işlenir; kaydedeceğin bilgileri sen onaylarsın.</p></div><div><span><Check size={17}/> Banka bağlantısı gerekmez</span><span><Check size={17}/> Kart bilgisi gerekmez</span></div></div><div className="lg-section-head"><h2>Ücretsiz başla.</h2><p>İlk 30 gün Pro özellikleri hediye. Kart gerekmez. Süre bitince Ücretsiz planın devam eder.</p></div><div className="lg-pricing-grid"><article><span className="lg-plan-label">BORCAMA ÜCRETSİZ</span><div className="lg-price">₺0 <small>/ süresiz</small></div><Signup href={signup}>Hesabını oluştur</Signup></article><article><span className="lg-plan-label">30 GÜNDEN SONRA SEÇİM SENDE</span><h3>İstersen Ücretsiz kal.<br/>İstersen Pro'ya geç.</h3><div className="lg-pro-price">Pro: ₺99 / ay <span>veya ₺999 / yıl</span></div></article></div></section>
      <section className="lg-shell lg-final"><h2>İlk kaydını ekle.<br/>Gerisini tablonda gör.</h2><Signup href={signup}>Ücretsiz başla</Signup></section>
    </main><footer className="lg-shell lg-footer"><Logo/><nav><a href="/araclar">Hesaplama araçları</a><a href="/finansal-sozluk">Finansal sözlük</a><a href="/rehber">Rehber</a><a href="/faq">Yardım</a><a href="/terms">Kullanıcı sözleşmesi</a><a href="/privacy">Gizlilik ve KVKK</a><a href="/refund-policy">İade politikası</a></nav><small>Kişisel finans takip aracı. Yatırım tavsiyesi vermez.</small></footer>
  </div>;
}
