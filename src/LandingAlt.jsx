import { APP_STORE_URL, appStoreBaglantisi } from "./appStore.js";
import React, { useEffect, useRef } from "react";
import { Bell, CalendarCheck, Check, Coins, FileUp, Globe, Lock, Monitor, ReceiptText, ScanFace, ShieldCheck, Target, UserX, WalletCards } from "lucide-react";
import { landingOlcumunuBaslat } from "./landingMeasurement.js";
import "./siteTema.css";

// borcama.com v3 (docs/web-v3-direktifi.md): iPhone uygulaması ve web eşit
// ağırlıkta; uygulama görselleri scripts/ekran-goruntuleri.mjs ile çekilen
// gerçek ekranlardır (public/ekranlar/), çerçeveler CSS. Sayfa her zaman
// açık temada; koyu tema yalnız giriş sonrası Ayarlar'da.

const OZELLIKLER = [
  { ikon: UserX, baslik: "Hesap açmadan başla", metin: "Her özelliği hemen kullan. Hesap yalnız cihazlar arası eşitleme ve yedek için gerekir." },
  { ikon: ShieldCheck, baslik: "Banka şifresi yok", metin: "Borcama banka şifreni hiç sormaz. Önemli olanı sen yazarsın, kendi para biriminde." },
  { ikon: ReceiptText, baslik: "Ekstreni cihazında okut", metin: "Kart ekstresini yükle; satırlar cihazında ayrışır. Ham dosya sunucuya gitmez." },
  { ikon: Bell, baslik: "Ödeme hatırlatması", metin: "İstersen ödemeden bir gün önce. Kilit ekranında tutar ve banka adı görünmez." },
  { ikon: ScanFace, baslik: "Face ID / Touch ID", metin: "Finansın cihazının biyometrisinin arkasında kalır." },
  { ikon: Globe, baslik: "Dilin, para birimin", metin: "Türkçe, English, Deutsch, Français, Español, Italiano. TRY, USD, EUR, GBP ve daha fazlası." },
];

const ADIMLAR = [
  { ikon: WalletCards, baslik: "Borçlarını ekle", metin: "Kart, kredi, ek hesap ve kişiye borç. Üç alan yeter; faiz, limit sorulmaz." },
  { ikon: ReceiptText, baslik: "Ekstreni kaydet", metin: "Dosyayı yükle ya da elle gir. Satırlar yerini bulur; ham dosya sunucuya gitmez." },
  { ikon: Check, baslik: "Ödemeni işaretle", metin: "Kalan borcun ve maaştan kalan güncellensin. Plan her maaşta yenilenir." },
];

const CEVAPLAR = [
  { ikon: CalendarCheck, baslik: "Ne ödeyeceksin?", deger: "₺10.350", metin: "Bu ayki tutar ve tarihler; yaklaşan ödeme en üstte." },
  { ikon: Target, baslik: "Önce hangi borç?", deger: "Akbank", metin: "En küçük bakiyeden ya da en yüksek faizden; sırayı sen seç." },
  { ikon: Coins, baslik: "Ne kadar kalacak?", deger: "₺7.250", metin: "Gelir eksi ödemeler eksi yaşam. Her maaşta yenilenir." },
];

// Pro kapsamı ProCheckout'taki pro.ozellik.* maddeleriyle aynı.
const PRO_MADDELERI = ["Faiz ve ödeme önceliği analizi", "Aylık yük ve faiz senaryoları", "Tüm kişisel öneri ve sinyaller"];

export default function LandingAlt() {
  const mevduattanGeldi = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("from") === "mevduat";
  const heroCtaHref = mevduattanGeldi ? "/register?plan=free&redirect=%2Fassets" : "/register?plan=free";
  const kok = useRef(null);
  useEffect(() => landingOlcumunuBaslat(kok.current), []);
  return <div className="site" ref={kok}>
    <header className="ust"><div className="kabuk ust-ic">
      <a className="logo" href="/" aria-label="Borcama ana sayfa"><Logo sizes="140px" /></a>
      <nav className="menu" aria-label="Hesap">
        <a className="gizle baglanti" href="/login">Giriş yap</a>
        <a className="dugme" href={heroCtaHref}>Ücretsiz başla</a>
      </nav>
    </div></header>
    <main>
      <section className="kabuk hero">
        <div>
          {mevduattanGeldi && <p className="cip"><Coins size={17} aria-hidden="true" /><span>Mevduat getirini hesapladın. Şimdi birikimini bütün finansal tablonla birlikte gör.</span></p>}
          <h1>Paran nereye gidiyor? <mark>Borcunu gör, kontrolü al.</mark></h1>
          <p className="giris">Kart, kredi ve ek hesap borçlarını yaz; hangi borcun önce biteceğini ve maaşından ne kalacağını gör. iPhone'da ve tarayıcıda, aynı hesap. Banka şifresi yok.</p>
          <div className="hero-eylem">
            <MagazaCta ct="landing-hero" />
            <a className="dugme" href={heroCtaHref}><Monitor size={17} aria-hidden="true" /> Şimdi başla</a>
          </div>
        </div>
        <div className="sahne">
          <div className="pencere">
            <div className="pencere-ust" aria-hidden="true"><i /><i /><i /><span className="adres">borcama.com/summary</span></div>
            <Ekran ad="web-ozet" genislik={1280} yukseklik={800} alt="Borcama web uygulaması: Bugün ekranı" oncelikli />
          </div>
          <Telefon ad="iphone-bugun" alt="Borcama iPhone uygulaması: Bugün ekranı" oncelikli />
          <div className="tel-kirp"><Telefon ad="iphone-bugun" alt="Borcama iPhone uygulaması: Bugün ekranı" oncelikli /></div>
        </div>
      </section>

      <section className="kabuk bolum">
        <div className="bolum-bas"><h2>Her gün yanında, her ay üç cevap.</h2><p>Hesap açmadan başlarsın, banka şifresi hiç sormaz, ekstreni cihazında okur.</p></div>
        <div className="ozellikler">
          {OZELLIKLER.map(({ ikon: Ikon, baslik, metin }) => <article className="ozellik" key={baslik}><span className="ikon"><Ikon size={22} aria-hidden="true" /></span><h3>{baslik}</h3><p>{metin}</p></article>)}
        </div>
      </section>

      <section className="kabuk bolum" id="nasil-calisir">
        <div className="bolum-bas"><h2>Ekle, öde, kalanı gör.</h2><p>İlk kurulum iki dakika. Sonraki aylarda yalnız yeni ekstreni ve ödemeni ekle.</p></div>
        <div className="ikili">
          <div className="adimlar">
            {ADIMLAR.map(({ ikon: Ikon, baslik, metin }, i) => <article className="adim" key={baslik}><span className="ikon"><Ikon size={22} aria-hidden="true" /></span><span className="no">0{i + 1}</span><h3>{baslik}</h3><p>{metin}</p></article>)}
          </div>
          <Telefon ad="iphone-plan" alt="Borcama iPhone uygulaması: Bu ayın borç planı" tek />
        </div>
      </section>

      <section className="kabuk bolum">
        <div className="bolum-bas"><h2>Üç cevabın olsun.</h2></div>
        <div className="cevaplar">
          {CEVAPLAR.map(({ ikon: Ikon, baslik, deger, metin }) => <article className="cevap" key={baslik}><span className="ikon"><Ikon size={22} aria-hidden="true" /></span><h3>{baslik}</h3><span className="buyuk">{deger}</span><p>{metin}</p></article>)}
        </div>
      </section>

      <section className="kabuk bolum" id="fiyatlar">
        <div className="guven">
          <div><h2>Banka şifresi yok.</h2><p>Ekstre dosyan cihazında işlenir. Kontrol edip onayladığın bilgiler hesabına kaydedilir; ham dosya sunucuya yüklenmez.</p></div>
          <div className="guven-liste">
            <span><ShieldCheck size={17} aria-hidden="true" /> Banka bağlantısı gerekmez</span>
            <span><FileUp size={17} aria-hidden="true" /> Ham dosya sunucuya yüklenmez</span>
            <span><Lock size={17} aria-hidden="true" /> Kilit ekranında tutar görünmez</span>
          </div>
        </div>
        <div className="fiyat-bas"><h2>Ücretsiz başla.</h2><p>İlk 30 gün Pro hediye. Kart gerekmez.</p></div>
        <div className="fiyatlar">
          <article className="fiyat">
            <h3>Borcama Ücretsiz</h3>
            <div className="tutar">₺0</div>
            <p>İlk 30 gün Pro özellikleri hediye. Kart gerekmez; süre bitince Ücretsiz planın devam eder.</p>
            <ul>
              <li><Check size={15} aria-hidden="true" />Borç, ödeme ve harcama takibi</li>
              <li><Check size={15} aria-hidden="true" />Varlık ve net durum takibi</li>
              <li><Check size={15} aria-hidden="true" />Temel finans özeti</li>
            </ul>
            <a className="dugme" href={appStoreBaglantisi("landing-fiyat")} rel="noopener"><Elma /> App Store'dan indir</a>
          </article>
          <article className="fiyat pro">
            <h3>İstersen Ücretsiz kal. İstersen Pro'ya geç.</h3>
            <div className="pro-fiyatlar">
              <div className="pro-fiyat"><span className="mono">Aylık</span><strong>₺99</strong></div>
              <div className="pro-fiyat"><span className="mono">Yıllık</span><strong>₺999</strong></div>
            </div>
            <p>30 günden sonra seçim sende. Ayrıntılı kişisel analizler ve finansal senaryolar için; iOS'ta App Store aboneliği, kendiliğinden ücretlendirme yapılmaz.</p>
            <ul>{PRO_MADDELERI.map((madde) => <li key={madde}><Check size={15} aria-hidden="true" />{madde}</li>)}</ul>
          </article>
        </div>
      </section>

      <section className="kabuk son"><div className="son-kutu">
        <h2>Borcunu plana çevir.</h2>
        <p>İki dakika sürer. Hesap açmadan, banka şifresi vermeden.</p>
        <div className="son-eylem">
          <a className="dugme" href={appStoreBaglantisi("landing-son")} rel="noopener"><Elma /> App Store'dan indir</a>
          <a className="dugme beyaz" href="/register?plan=free">Şimdi başla</a>
        </div>
      </div></section>
    </main>

    <footer className="kabuk alt">
      <div className="alt-ic">
        <a className="logo" href="/" aria-label="Borcama ana sayfa"><Logo sizes="140px" /></a>
        <nav className="alt-baglantilar" aria-label="Alt bilgi">
          <a href="/araclar">Ücretsiz Araçlar</a><a href="/finansal-sozluk">Finansal Sözlük</a><a href="/rehber">Rehber</a><a href="/terms">Kullanıcı Sözleşmesi</a><a href="/privacy">Gizlilik ve KVKK</a><a href="/refund-policy">İade Politikası</a><a href="/faq">SSS</a><a href={APP_STORE_URL} rel="noopener">iPhone uygulaması</a><a href="mailto:zero@borcama.com?subject=Borcama%20reklam%20ve%20i%C5%9Fbirli%C4%9Fi">Reklam ve işbirliği</a>
        </nav>
      </div>
      <div className="alt-not">
        <span>Kişisel borç, harcama ve varlık takip aracı. Kredi vermez, aracılık etmez.</span>
        <span>Finansal tavsiye değildir.</span>
      </div>
    </footer>
  </div>;
}

function Logo({ sizes }) {
  return <picture>
    <source
      type="image/avif"
      srcSet="/borcama-logo-368.avif 368w, /borcama-logo-736.avif 736w"
      sizes={sizes}
    />
    <img
      src="/borcama-logo-368.png"
      srcSet="/borcama-logo-368.png 368w, /borcama-logo-736.png 736w"
      sizes={sizes}
      width="900"
      height="222"
      alt="Borcama"
      decoding="async"
    />
  </picture>;
}

function Ekran({ ad, genislik, yukseklik, alt, oncelikli = false }) {
  const dosya = `/ekranlar/${ad}`;
  return <picture>
    <source type="image/webp" srcSet={`${dosya}.webp`} />
    <img src={`${dosya}.png`} width={genislik} height={yukseklik} alt={alt} decoding="async" loading={oncelikli ? "eager" : "lazy"} fetchpriority={oncelikli ? "high" : undefined} />
  </picture>;
}

function Telefon({ ad, alt, oncelikli = false, tek = false }) {
  return <div className={tek ? "tel tek" : "tel"}><Ekran ad={ad} genislik={560} yukseklik={1212} alt={alt} oncelikli={oncelikli} /></div>;
}

function MagazaCta({ ct }) {
  return <a className="magaza-cta" href={appStoreBaglantisi(ct)} rel="noopener" aria-label="Borcama'yı App Store'dan indir"><Elma /><span><small>App Store'dan</small><b>İndir</b></span></a>;
}

function Elma() {
  return <svg className="elma" viewBox="0 0 14 17" aria-hidden="true"><path d="M11.6 9c0-2 1.6-2.9 1.7-3-.9-1.4-2.4-1.6-2.9-1.6-1.2-.1-2.4.7-3 .7-.6 0-1.6-.7-2.6-.7C3.5 4.5 2.2 5.2 1.5 6.4-.1 9.1 1.1 13 2.6 15.2c.7 1 1.6 2.2 2.7 2.2 1.1 0 1.5-.7 2.8-.7 1.3 0 1.7.7 2.8.7 1.2 0 1.9-1.1 2.6-2.1.8-1.2 1.2-2.3 1.2-2.4-.1 0-2.9-1.1-3.1-3.9zM9.7 3.1c.6-.7 1-1.7.9-2.7-.9 0-1.9.6-2.5 1.3-.6.6-1 1.6-.9 2.6 1 .1 2-.5 2.5-1.2z" /></svg>;
}
