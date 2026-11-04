import { APP_STORE_URL } from "./appStore.js";
import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  Calculator,
  CircleDollarSign,
  ListChecks,
  Plus,
  Trash2,
  WalletCards,
} from "lucide-react";
import { funnelEtkinligiKaydet, funnelTiklamasiKaydedipGit } from "./funnelAnalytics.js";
import {
  borcKapatmaHesapla,
  borcPlaniHesapla,
  bruttenNeteMaas2026,
  kidemTazminatiHesapla2026,
  krediKartiAsgariOdemeHesapla,
  krediOdemePlaniHesapla,
  mevduatFaiziHesapla,
  nettenBruteMaas2026,
} from "./seoTools.js";
import {
  FINANSAL_SOZLUK,
  FINANSAL_SOZLUK_KATEGORILERI,
  finansalSozlukTerimi,
} from "./financialGlossary.js";
import {
  paraGirdisiniCoz,
  paraGirdisiniFormatla,
  turkLirasiFormatla,
} from "./currencyInput.js";
import {
  BDDK_KAYNAK,
  GIB_ASGARI_2026,
  GIB_VERGI_2026,
  KIDEM_2026,
  REHBER_KAYNAKLARI,
  REHBER_UYARILARI,
  REHBERLER,
  SGK_2026,
  TCMB_KAYNAK,
  guncellemeTarihiMetni,
  rehberBul,
} from "./seoRehberler.js";
import "./SeoPages.css";

const SITE = "https://borcama.com";

const ARACLAR = [
  { slug: "borc-kapatma-hesaplayici", icon: CircleDollarSign, title: "Borç kapatma hesaplayıcı", text: "Aylık ödeme ve faiz oranına göre tahmini kapanış süresini gör." },
  { slug: "kredi-karti-asgari-odeme-hesaplayici", icon: WalletCards, title: "Kredi kartı asgari ödeme hesaplayıcı", text: "Kart limiti ve dönem borcuna göre yasal oranla tahmini asgari tutarı hesapla." },
  { slug: "borc-odeme-plani", icon: ListChecks, title: "Borç ödeme planı oluşturucu", text: "Birden fazla borcu faiz veya kartopu stratejisiyle tek planda sırala." },
  { slug: "aylik-odeme-takvimi", icon: CalendarDays, title: "Aylık ödeme takvimi", text: "Son ödeme günlerini ve bu ayın toplam yükünü tek listede topla." },
  { slug: "mevduat-faizi-hesaplama", icon: CircleDollarSign, title: "Mevduat faizi hesaplama", text: "Ana para, yıllık faiz, vade ve stopajla tahmini net getiriyi gör." },
  { slug: "kredi-odeme-plani-hesaplama", icon: Calculator, title: "Kredi ödeme planı hesaplama", text: "Kredi tutarı, aylık faiz ve vadeye göre taksit planını oluştur." },
  { slug: "brut-net-maas-hesaplama", icon: CircleDollarSign, title: "Brütten nete, netten brüte maaş hesaplama", text: "2026 kesintilerine göre brüt ve net maaş arasında hesaplama yap." },
  { slug: "kidem-tazminati-hesaplama", icon: Calculator, title: "Kıdem tazminatı hesaplama", text: "Maaşın ve çalışma sürene göre tahmini kıdem tazminatını gör." },
];

const KART_BORCU_REHBERLERI = [
  ["/rehber/kredi-karti-faiz-oranlari-2026", "Kredi kartı faiz oranları (Kasım 2026)"],
  ["/rehber/kredi-karti-borcu-yapilandirma", "Kredi kartı borcu yapılandırma (2026)"],
  ["/rehber/kredi-karti-borcu-odenmezse-ne-olur", "Kredi kartı borcu ödenmezse ne olur?"],
];

const TOOL_GUIDES = {
  "/araclar/borc-kapatma-hesaplayici": [["/rehber/borc-kapatma-plani-nasil-hazirlanir", "Borç kapatma planı nasıl hazırlanır?"], ...KART_BORCU_REHBERLERI],
  "/araclar/kredi-karti-asgari-odeme-hesaplayici": [["/rehber/asgari-odeme-borcu-nasil-etkiler", "Asgari ödeme yapmak borcu nasıl etkiler?"], ...KART_BORCU_REHBERLERI],
  "/araclar/borc-odeme-plani": [KART_BORCU_REHBERLERI[1], KART_BORCU_REHBERLERI[2], ["/rehber/borc-kapatma-plani-nasil-hazirlanir", "Borç kapatma planı nasıl hazırlanır?"]],
  "/araclar/brut-net-maas-hesaplama": [["/rehber/2026-brut-net-maas-nasil-hesaplanir", "2026 brütten nete maaş nasıl hesaplanır?"]],
  "/araclar/kidem-tazminati-hesaplama": [["/rehber/2026-kidem-tazminati-nasil-hesaplanir", "2026 kıdem tazminatı nasıl hesaplanır?"]],
  "/araclar/mevduat-faizi-hesaplama": [
    ["/rehber/mevduat-faizi-net-getiri-nasil-hesaplanir", "Mevduat faizi net getiri nasıl hesaplanır?"],
    ["/rehber/32-gunluk-mevduat-faizi-nasil-hesaplanir", "32 günlük mevduat faizi nasıl hesaplanır?"],
    ["/rehber/100-bin-tl-mevduat-getirisi-nasil-hesaplanir", "100 bin TL mevduat getirisi nasıl hesaplanır?"],
  ],
};

export function seoYoluMu(yol) {
  return yol === "/araclar" || yol.startsWith("/araclar/") || yol === "/rehber" || yol.startsWith("/rehber/") || yol === "/finansal-sozluk" || yol.startsWith("/finansal-sozluk/");
}

export default function SeoSayfasi({ yol }) {
  if (yol === "/araclar") return <AraclarAna />;
  if (yol === "/araclar/borc-kapatma-hesaplayici") return <BorcKapatma />;
  if (yol === "/araclar/kredi-karti-asgari-odeme-hesaplayici") return <AsgariOdeme />;
  if (yol === "/araclar/borc-odeme-plani") return <BorcPlani />;
  if (yol === "/araclar/aylik-odeme-takvimi") return <OdemeTakvimi />;
  if (yol === "/araclar/mevduat-faizi-hesaplama") return <MevduatFaizi />;
  if (yol === "/araclar/kredi-odeme-plani-hesaplama") return <KrediOdemePlani />;
  if (yol === "/araclar/brut-net-maas-hesaplama") return <MaasHesaplama />;
  if (yol === "/araclar/kidem-tazminati-hesaplama") return <KidemTazminati />;
  if (yol === "/finansal-sozluk") return <FinansalSozlukAna />;
  if (yol.startsWith("/finansal-sozluk/")) {
    const terim = finansalSozlukTerimi(yol.replace("/finansal-sozluk/", ""));
    return terim ? <FinansalSozlukDetay terim={terim} /> : <FinansalSozlukAna />;
  }
  if (yol === "/rehber") return <RehberAna />;
  const slug = yol.replace("/rehber/", "");
  const rehber = rehberBul(slug);
  return rehber ? <RehberDetay rehber={rehber} /> : <AraclarAna />;
}

function useSeo({ title, description, path, schema }) {
  useEffect(() => {
    document.title = `${title} | Borcama`;
    const setMeta = (name, content, property = false) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let tag = document.querySelector(selector);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(property ? "property" : "name", name);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };
    setMeta("description", description);
    setMeta("og:title", title, true);
    setMeta("og:description", description, true);
    setMeta("og:url", `${SITE}${path}`, true);
    setMeta("og:type", path.startsWith("/rehber/") || path.startsWith("/finansal-sozluk/") ? "article" : "website", true);
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${SITE}${path}`);
    const old = document.getElementById("borcama-seo-schema");
    if (old) old.remove();
    const script = document.createElement("script");
    script.id = "borcama-seo-schema";
    script.type = "application/ld+json";
    const { path: parentPath, name: parentName } = seoParent(path);
    const breadcrumbItems = [
      { "@type": "ListItem", position: 1, name: "Borcama", item: SITE },
      { "@type": "ListItem", position: 2, name: parentName, item: `${SITE}${parentPath}` },
    ];
    if (path !== parentPath) breadcrumbItems.push({ "@type": "ListItem", position: 3, name: title, item: `${SITE}${path}` });
    const schemaNode = Object.fromEntries(Object.entries(schema).filter(([key]) => key !== "@context"));
    script.textContent = JSON.stringify({ "@context": "https://schema.org", "@graph": [schemaNode, { "@type": "BreadcrumbList", itemListElement: breadcrumbItems }] });
    document.head.appendChild(script);
    return () => script.remove();
  }, [title, description, path, schema]);
}

function Layout({ children }) {
  return <div className="seo"><header className="seo-nav seo-shell"><a className="seo-logo" href="/" aria-label="Borcama ana sayfa"><img src="/borcama-logo.png" alt="Borcama" /></a><nav><a href="/araclar">Hesaplama Araçları</a><a href="/finansal-sozluk">Finansal Sözlük</a><a href="/rehber">Rehber</a><a href="/login">Giriş yap</a><a className="seo-btn small" href="/register?plan=free">Ücretsiz Başla <ArrowRight size={14}/></a></nav></header>{children}<footer className="seo-footer"><div className="seo-shell"><div><a className="seo-footer-logo" href="/"><img src="/borcama-logo.png" alt="Borcama"/></a><p>Kişisel borç, ödeme ve varlık takip aracı.</p></div><div className="seo-footer-links"><a href="/araclar">Ücretsiz Araçlar</a><a href="/finansal-sozluk">Finansal Sözlük</a><a href="/rehber">Rehber</a><a href="/privacy">Gizlilik ve KVKK</a><a href="/faq">SSS</a><a href={APP_STORE_URL} rel="noopener">iPhone uygulaması</a><a href="mailto:zero@borcama.com?subject=Borcama%20reklam%20ve%20i%C5%9Fbirli%C4%9Fi">Reklam ve işbirliği</a></div></div></footer></div>;
}

function Hero({ title, lead }) {
  return <section className="seo-hero"><div className="seo-shell seo-hero-inner"><div><h1>{title}</h1><p>{lead}</p></div></div></section>;
}

function Breadcrumb({ path, title }) {
  const { path: parentPath, name: parentName } = seoParent(path);
  return <nav className="seo-breadcrumb seo-shell" aria-label="Sayfa yolu"><a href="/">Borcama</a><span>/</span>{path === parentPath ? <strong>{parentName}</strong> : <><a href={parentPath}>{parentName}</a><span>/</span><strong>{title}</strong></>}</nav>;
}

function seoParent(path) {
  if (path.startsWith("/araclar")) return { path: "/araclar", name: "Hesaplama Araçları" };
  if (path.startsWith("/finansal-sozluk")) return { path: "/finansal-sozluk", name: "Finansal Sözlük" };
  return { path: "/rehber", name: "Rehber" };
}

function AraclarAna() {
  const schema = useMemo(() => ({ "@context": "https://schema.org", "@type": "CollectionPage", name: "Borcama Finans Hesaplama Araçları", url: `${SITE}/araclar`, description: "Borç, kredi kartı, mevduat faizi, kredi ödeme planı ve aylık takvim araçları." }), []);
  useSeo({ title: "Finans ve Ödeme Hesaplama Araçları", description: "Borç kapatma, kredi kartı asgari ödeme, mevduat faizi, kredi taksit planı ve aylık ödeme takvimini hesaplayın.", path: "/araclar", schema });
  return <Layout><main><Hero title="Rakamları tek tek değil, birlikte gör." lead="Borçlarını, ödemelerini, kredilerini ve birikimini kolayca hesapla."/><section className="seo-section seo-shell"><div className="seo-card-grid">{ARACLAR.map((arac) => <AracCard key={arac.slug} {...arac}/>)}</div><Cta /></section></main></Layout>;
}

function AracCard({ slug, icon: Icon, title, text }) {
  return <a className="seo-tool-card" href={`/araclar/${slug}`}><span className="seo-icon"><Icon/></span><h2>{title}</h2><p>{text}</p><span className="seo-card-link">Aracı aç <ArrowRight size={15}/></span></a>;
}

function ToolLayout({ title, metaTitle, lead, path, schema, children, afterContent, faq = [], showSources = false, showCta = true }) {
  useSeo({ title: metaTitle || title, description: lead, path, schema });
  const bolumler = React.Children.toArray(children);
  const guides = TOOL_GUIDES[path] || [];
  return <Layout><main><Breadcrumb path={path} title={title}/><Hero title={title} lead={lead}/><section className="seo-section seo-shell"><div className="seo-tool-layout">{bolumler[0]}<div className="seo-result-column">{bolumler.slice(1)}</div></div>{afterContent}{guides.length > 0 && <section className="seo-related-guides" aria-label="İlgili rehberler"><h2>Hesabını daha iyi anla</h2>{guides.map(([href, label]) => <a className="seo-related-guide" href={href} key={href}><BookOpen/><span><b>Adım adım rehber</b><strong>{label}</strong></span><ArrowRight/></a>)}</section>}{faq.length > 0 && <Faq items={faq}/>} {showSources && <SourceNote/>}{showCta && <Cta/>}</section></main></Layout>;
}

function NumberField({ label, value, onChange, suffix = "TL", step = "100", min = "0", hint }) {
  const para = suffix === "TL";
  return <label className="seo-field"><span>{label}</span><div><input type={para ? "text" : "number"} inputMode="decimal" min={para ? undefined : min} step={para ? undefined : step} value={para ? paraGirdisiniFormatla(value) : value} onChange={(event) => onChange(para ? paraGirdisiniCoz(event.target.value) : event.target.value)}/><b>{suffix}</b></div>{hint && <small>{hint}</small>}</label>;
}

function Money({ value }) {
  return turkLirasiFormatla(value);
}

function InlineMoneyInput({ value, onChange, ...props }) {
  return <input {...props} type="text" inputMode="decimal" value={paraGirdisiniFormatla(value)} onChange={(event) => onChange(paraGirdisiniCoz(event.target.value))}/>;
}

// Tutarın karakter sayısı, CSS'in uzun tutarı tek satıra sığdırmak için yazıyı küçültmesini sağlar.
function karakterSayisi(value) {
  if (typeof value === "string") return value.length;
  return value?.type === Money ? turkLirasiFormatla(value.props.value).length : 10;
}

function BuyukTutar({ value }) {
  return <div className="seo-big-money" style={{ "--karakter": turkLirasiFormatla(value).length }}><Money value={value}/></div>;
}

function Summary({ items }) {
  return <div className="seo-summary">{items.map(([label, value]) => <div key={label}><span>{label}</span><strong style={{ "--karakter": karakterSayisi(value) }}>{value}</strong></div>)}</div>;
}

function BorcKapatma() {
  const [borc, setBorc] = useState("100000");
  const [faiz, setFaiz] = useState("3.75");
  const [odeme, setOdeme] = useState("12000");
  const sonuc = useMemo(() => borcKapatmaHesapla({ borc, aylikFaiz: faiz, aylikOdeme: odeme }), [borc, faiz, odeme]);
  useEffect(() => {
    if (sonuc.tamamlandi) funnelEtkinligiKaydet("debt_payoff_result_view");
  }, [sonuc.tamamlandi]);
  const schema = useMemo(() => toolSchema("Borç Kapatma Hesaplayıcı", "/araclar/borc-kapatma-hesaplayici"), []);
  const explanation = <section className="seo-explainer"><h2>Borç kapatma süresi nasıl hesaplanır?</h2><p>Hesaplama, kalan borca her ay girdiğin faiz oranını uygular ve belirlediğin aylık ödemeyi bakiyeden düşer. Aylık ödeme ilk ayın faizini karşılamıyorsa borç bu varsayımla kapanmaz.</p><div className="seo-formula"><b>Her ay kalan borç</b><span>Önceki bakiye + tahmini faiz − aylık ödeme</span></div><p>Tahmini kapanış süresini ve toplam ödemeyi bir başlangıç planı olarak kullan. Yeni harcama, faiz oranı veya ayırabildiğin ödeme değiştiğinde hesabı güncel rakamlarla yeniden yap.</p></section>;
  return <ToolLayout title="Borç kapatma hesaplayıcı" lead="Aylık ödeme tutarına ve girdiğin faiz oranına göre borcun tahmini kaç ayda biteceğini hesapla." path="/araclar/borc-kapatma-hesaplayici" schema={schema} afterContent={explanation} faq={[["Bu sonuç kesin midir?","Hayır. Yeni harcama, oran değişikliği, vergi ve masraflar sonucu değiştirebilir."],["Hangi faiz oranını girmeliyim?","Bankanın ekstrende veya sözleşmende bildirdiği aylık oranı kullan."]]}><div className="seo-panel"><h2>Bilgilerini gir</h2><NumberField label="Toplam borç" value={borc} onChange={setBorc}/><NumberField label="Aylık faiz oranı" value={faiz} onChange={setFaiz} suffix="%" step="0.01" hint="Bankanın uyguladığı gerçek aylık oranı gir."/><NumberField label="Her ay ayıracağın ödeme" value={odeme} onChange={setOdeme}/></div><div className="seo-result"><span className="seo-result-kicker">TAHMİNİ PLAN</span>{sonuc.tamamlandi ? <><Summary items={[["Kapanış süresi", `${sonuc.ay} ay`],["Toplam faiz", <Money value={sonuc.toplamFaiz}/>],["Toplam ödeme", <Money value={sonuc.toplamOdeme}/>]]}/><Schedule rows={sonuc.takvim}/></> : <Warning reason={sonuc.neden}/>}<Disclaimer/></div>{sonuc.tamamlandi && <BorcKapatmaUrunKoprusu/>}</ToolLayout>;
}

function BorcKapatmaUrunKoprusu() {
  const tikla = (olay) => funnelTiklamasiKaydedipGit(olay, "debt_payoff_product_click");
  return <section className="seo-product-bridge" aria-labelledby="borc-kapatma-sonraki-adim"><span className="seo-product-bridge-kicker">TAHMİNİ GÖRDÜN. ŞİMDİ GERÇEK PLANI KUR.</span><h2 id="borc-kapatma-sonraki-adim">Borçlarını kendi ödeme planına dönüştür.</h2><p>Kartlarını, kredilerini ve ek hesaplarını ekle; kalan borcu, ödeme günlerini ve aylık yükünü tek yerde takip et.</p><ul><li><WalletCards size={17}/> Bütün borçlarını tek tabloda gör</li><li><CalendarDays size={17}/> Ödeme günlerini ve zorunlu tutarları takip et</li><li><ListChecks size={17}/> İlk kapatacağın borcu kendi kayıtlarınla planla</li></ul><div className="seo-product-actions"><a className="seo-btn" href="/register?plan=free&redirect=%2Fdebts" onClick={tikla}>Ücretsiz borç planını oluştur <ArrowRight size={15}/></a></div><small>Kart bilgisi gerekmez. Ücretsiz paket hep açık. Hesaplayıcıya girdiğin tutarlar kayıt bağlantısına veya ölçüme eklenmez.</small></section>;
}

function AsgariOdeme() {
  const [limit, setLimit] = useState("100000");
  const [borc, setBorc] = useState("25000");
  const sonuc = useMemo(() => krediKartiAsgariOdemeHesapla({ donemBorcu: borc, kartLimiti: limit }), [limit, borc]);
  const schema = useMemo(() => toolSchema("Kredi Kartı Asgari Ödeme Hesaplayıcı", "/araclar/kredi-karti-asgari-odeme-hesaplayici"), []);
  return <ToolLayout title="Kredi kartı asgari ödeme hesaplayıcı" lead="Kart limitin ve dönem borcuna göre güncel BDDK oranıyla tahmini asgari ödeme tutarını gör." path="/araclar/kredi-karti-asgari-odeme-hesaplayici" schema={schema} showSources faq={[["Hangi oran kullanılıyor?","Kart limiti 100 bin TL ve altındaysa yüzde 20, üzerindeyse yüzde 40."],["Ekstredeki tutar farklıysa ne yapmalıyım?","Her zaman bankanın güncel ekstrende bildirdiği asgari tutarı esas al."]]}><div className="seo-panel"><h2>Kart bilgilerini gir</h2><NumberField label="Kart limiti" value={limit} onChange={setLimit}/><NumberField label="Dönem borcu" value={borc} onChange={setBorc}/><p className="seo-inline-note">1 Ekim 2026 tarihli ve 11581 sayılı BDDK kararındaki kart limiti eşiği kullanılır.</p></div><div className="seo-result"><span className="seo-result-kicker">TAHMİNİ ASGARİ</span><BuyukTutar value={sonuc.tahminiAsgari}/><Summary items={[["Uygulanan oran", `%${Math.round(sonuc.oran * 100)}`],["Ödeme sonrası kalan", <Money value={sonuc.odemeSonrasiKalan}/>]]}/><Disclaimer text="Bu araç yasal orana göre tahmin üretir. Kesin tutar için bankanın ekstrende bildirdiği asgari ödemeyi esas al."/></div><UrunKoprusu kicker="ASGARİYİ GÖRDÜN. KALANI DA TAKİP ET." baslik="Kartlarının asgari ödemesini ve son ödeme gününü kaçırma." redirect="/debts" id="asgari-sonraki-adim"/></ToolLayout>;
}

function MevduatFaizi() {
  const [anaPara, setAnaPara] = useState("100000");
  const [yillikFaiz, setYillikFaiz] = useState("45");
  const [vadeGunu, setVadeGunu] = useState("32");
  const [stopaj, setStopaj] = useState("15");
  const sonuc = useMemo(() => mevduatFaiziHesapla({ anaPara, yillikFaiz, vadeGunu, stopaj }), [anaPara, yillikFaiz, vadeGunu, stopaj]);
  useEffect(() => {
    if (sonuc.hesaplandi) funnelEtkinligiKaydet("deposit_result_view");
  }, [sonuc.hesaplandi]);
  const schema = useMemo(() => toolSchema("Mevduat Faizi Hesaplama", "/araclar/mevduat-faizi-hesaplama"), []);
  const explanation = <section className="seo-explainer"><h2>Mevduat faizi nasıl hesaplanır?</h2><p>Brüt faiz; ana para, bankanın verdiği yıllık faiz oranı ve vade günü kullanılarak hesaplanır. Net getiri için brüt faizden stopaj tutarı çıkarılır.</p><div className="seo-formula"><b>Brüt faiz</b><span>Ana para × yıllık faiz × vade günü ÷ 365</span></div><p>Vade sonu toplam, ana paran ile stopaj sonrası net faiz kazancının toplamıdır. Banka kampanyaları ve oranlar değişebildiği için hesaplayıcıya her zaman kendi teklifindeki rakamları gir.</p></section>;
  return <ToolLayout title="Mevduat faizi hesaplama" metaTitle="Mevduat Faizi Hesaplama 2026 | Net Getiri" lead="Ana para, yıllık brüt faiz, vade günü ve stopaj oranıyla mevduatın brüt faizini, net getirisini ve vade sonu toplamını hesapla." path="/araclar/mevduat-faizi-hesaplama" schema={schema} showSources={false} showCta={false} afterContent={explanation} faq={[["Hangi faiz oranını girmeliyim?","Bankanın mevduat teklifi veya sözleşmesinde yazan yıllık brüt faiz oranını gir."],["32 günlük mevduat nasıl hesaplanır?","Vade süresini 32 gün seç; araç yıllık brüt oranı 32 güne oranlayıp stopaj sonrası net getiriyi gösterir."],["Stopaj oranını nereden bulurum?","Oran vade ve mevduat türüne göre değişebileceği için bankanın ürün detayında bildirilen güncel oranı kullan."]]}><div className="seo-panel"><h2>Mevduat bilgilerini gir</h2><NumberField label="Yatıracağın ana para" value={anaPara} onChange={setAnaPara}/><NumberField label="Yıllık brüt faiz oranı" value={yillikFaiz} onChange={setYillikFaiz} suffix="%" step="0.01" hint="Bankanın sana sunduğu yıllık oranı gir."/><NumberField label="Vade süresi" value={vadeGunu} onChange={setVadeGunu} suffix="Gün" step="1"/><div className="seo-term-shortcuts" aria-label="Sık kullanılan vadeler">{[7,32,46,92].map((gun) => <button type="button" className={Number(vadeGunu) === gun ? "active" : ""} onClick={() => setVadeGunu(String(gun))} key={gun}>{gun} gün</button>)}</div><NumberField label="Stopaj oranı" value={stopaj} onChange={setStopaj} suffix="%" step="0.01" hint="Bankanın bu mevduat için bildirdiği güncel oranı gir."/></div><div className="seo-result"><span className="seo-result-kicker">TAHMİNİ NET GETİRİ</span>{sonuc.hesaplandi ? <><BuyukTutar value={sonuc.netFaiz}/><Summary items={[["Brüt faiz", <Money value={sonuc.brutFaiz}/>],["Stopaj", <Money value={sonuc.stopajTutari}/>],["Vade sonu toplam", <Money value={sonuc.vadeSonuTutar}/>]]}/></> : <Warning reason="eksik"/>}<Disclaimer text="Hesaplama 365 gün üzerinden yaklaşık sonuç üretir. Kesin getiri ve stopaj için bankanın teklifini esas al."/></div><MevduatUrunKoprusu vadeSonuTutar={sonuc.vadeSonuTutar}/></ToolLayout>;
}

function MevduatUrunKoprusu({ vadeSonuTutar }) {
  const tikla = (olay) => funnelTiklamasiKaydedipGit(olay, "deposit_product_click");
  return <section className="seo-product-bridge" aria-labelledby="mevduat-sonraki-adim"><span className="seo-product-bridge-kicker">HESAP BİTTİ. PEKİ TABLON?</span><h2 id="mevduat-sonraki-adim">Bu getiri, finansal tablonun yalnızca bir parçası.</h2><p>Mevduatını borçların, aylık gelir-gider dengen ve diğer varlıklarınla yan yana gör. Borcama sana tek bir oran değil, bu ay ne yapabileceğini gösterir.</p><div className="seo-product-snapshot"><div><span>Bu hesapta vade sonu</span><strong><Money value={vadeSonuTutar}/></strong></div><div><span>Borcama'da ekleyeceklerin</span><strong>Borç + gelir + gider + varlık</strong></div></div><ul><li><BarChart3 size={17}/> Borç ve varlıklarını aynı yerde takip et</li><li><WalletCards size={17}/> Bu ayki zorunlu ödemelerini kaçırma</li><li><CircleDollarSign size={17}/> Gelir ve harcamandan sonra kalan alanı gör</li></ul><div className="seo-product-actions"><a className="seo-btn" href="/register?plan=free&redirect=%2Fassets" onClick={tikla}>Ücretsiz finansal tablonu oluştur <ArrowRight size={15}/></a><a href="/?from=mevduat" onClick={tikla}>Borcama nasıl çalışır?</a></div><small>Kart bilgisi gerekmez. Ücretsiz paket hep açık. Bu hesapta girdiğin tutarlar kaydedilmez.</small></section>;
}

function KrediOdemePlani() {
  const [krediTutari, setKrediTutari] = useState("250000");
  const [aylikFaiz, setAylikFaiz] = useState("3.49");
  const [vadeAy, setVadeAy] = useState("12");
  const sonuc = useMemo(() => krediOdemePlaniHesapla({ krediTutari, aylikFaiz, vadeAy }), [krediTutari, aylikFaiz, vadeAy]);
  const schema = useMemo(() => toolSchema("Kredi Taksit ve Ödeme Planı Hesaplama", "/araclar/kredi-odeme-plani-hesaplama"), []);
  return <ToolLayout title="Kredi taksit ve ödeme planı hesaplama" lead="Borcama kredi sunmaz veya kredi aracılığı yapmaz. Bankandan aldığın mevcut teklifin tutarı, aylık faiz oranı ve vadesiyle tahmini taksiti, toplam faizi ve ödeme planını hesaplar." path="/araclar/kredi-odeme-plani-hesaplama" schema={schema} showSources={false} faq={[["Aylık mı yıllık mı faiz girmeliyim?","Bankanın kredi teklifinde yazan aylık faiz oranını gir."],["Masraflar dahil mi?","Hayır. Tahsis ücreti, sigorta, vergi ve bankaya özgü diğer masraflar bu temel hesaplamaya dahil değildir."],["Borcama kredi veriyor mu?","Hayır. Borcama kredi sunmaz, başvuru toplamaz veya kredi verenlerle aracılık yapmaz; yalnızca girdiğin mevcut teklif bilgileriyle hesaplama yapar."]]}><div className="seo-panel"><h2>Mevcut teklif bilgilerini gir</h2><p className="seo-inline-note">Bu araç bir kredi teklifi veya başvuru formu değildir; girdiğin bilgiler kaydedilmez.</p><NumberField label="Teklifteki kredi tutarı" value={krediTutari} onChange={setKrediTutari}/><NumberField label="Aylık faiz oranı" value={aylikFaiz} onChange={setAylikFaiz} suffix="%" step="0.01" hint="Bankanın mevcut teklifinde yazan aylık oranı gir."/><NumberField label="Vade süresi" value={vadeAy} onChange={setVadeAy} suffix="Ay" step="1"/></div><div className="seo-result"><span className="seo-result-kicker">TAHMİNİ ÖDEME PLANI</span>{sonuc.hesaplandi ? <><BuyukTutar value={sonuc.aylikTaksit}/><Summary items={[["Aylık taksit", <Money value={sonuc.aylikTaksit}/>],["Toplam faiz", <Money value={sonuc.toplamFaiz}/>],["Toplam ödeme", <Money value={sonuc.toplamOdeme}/>]]}/><KrediSchedule rows={sonuc.takvim}/></> : <Warning reason="eksik"/>}<Disclaimer text="Bu sonuç yaklaşık planlama içindir. Borcama kredi sunmaz veya aracılık yapmaz. Vergi, tahsis ücreti, sigorta ve bankanın diğer masrafları dahil değildir."/></div><UrunKoprusu kicker="PLANI GÖRDÜN. TAKSİTLERİ TAKİP ET." baslik="Kredini ekle; kalan taksitlerini ve aylık yükünü tek yerde gör." redirect="/debts" id="kredi-sonraki-adim"/></ToolLayout>;
}

function MaasHesaplama() {
  const [yon, setYon] = useState("brut-net");
  const [tutar, setTutar] = useState("75000");
  const [ay, setAy] = useState("8");
  const sonuc = useMemo(() => yon === "brut-net" ? bruttenNeteMaas2026({ brutMaas: tutar, ay }) : nettenBruteMaas2026({ netMaas: tutar, ay }), [yon, tutar, ay]);
  const yillikSonuclar = useMemo(() => Array.from({ length: 12 }, (_, index) => {
    const ayNo = index + 1;
    return yon === "brut-net" ? bruttenNeteMaas2026({ brutMaas: tutar, ay: ayNo }) : nettenBruteMaas2026({ netMaas: tutar, ay: ayNo });
  }), [yon, tutar]);
  const schema = useMemo(() => toolSchema("Brütten Nete ve Netten Brüte Maaş Hesaplama 2026", "/araclar/brut-net-maas-hesaplama"), []);
  const sonucBasligi = yon === "brut-net" ? "Tahmini net maaş" : "Tahmini brüt maaş";
  const sonucTutari = yon === "brut-net" ? sonuc.net : sonuc.brut;
  return <ToolLayout title="Brütten nete, netten brüte maaş hesaplama" lead="2026 yılı çalışan kesintilerine göre brüt maaştan net maaşı veya net maaştan tahmini brüt maaşı hesapla." path="/araclar/brut-net-maas-hesaplama" schema={schema} showSources={false} faq={[["Brüt maaş nedir?","Vergi ve çalışan kesintileri yapılmadan önceki toplam maaştır."],["Net maaş nedir?","Kesintilerden sonra çalışanın eline geçen maaştır."],["Ay seçimi neden gerekli?","Maaştan yapılan vergi kesintisi yıl içinde değişebildiği için hesaplamak istediğin ayı seçmelisin."],["Hesap kesin bordro tutarı mıdır?","Hayır. Ek ödeme, özel indirim, eksik gün ve işyerine göre değişen uygulamalar sonucu etkileyebilir."]]}><div className="seo-panel"><h2>Maaş bilgilerini gir</h2><span className="seo-strategy-label">Hesaplama yönü</span><div className="seo-toggle"><button className={yon === "brut-net" ? "active" : ""} onClick={() => setYon("brut-net")}>Brütten nete</button><button className={yon === "net-brut" ? "active" : ""} onClick={() => setYon("net-brut")}>Netten brüte</button></div><NumberField label={yon === "brut-net" ? "Aylık brüt maaş" : "Hedef aylık net maaş"} value={tutar} onChange={setTutar}/><NumberField label="Hesaplamak istediğin ay" value={ay} onChange={setAy} suffix="Ay" step="1" min="1" hint="Ocak için 1, Aralık için 12 yaz."/><p className="seo-inline-note">2026 yılı için, aynı maaşı yılbaşından beri aldığın varsayılır.</p></div><div className="seo-result"><span className="seo-result-kicker">{sonucBasligi}</span>{sonuc.hesaplandi ? <><BuyukTutar value={sonucTutari}/><Summary items={[["Brüt maaş", <Money value={sonuc.brut}/>],["SGK ve işsizlik", <Money value={sonuc.sgk + sonuc.issizlik}/>],["Vergiler", <Money value={sonuc.gelirVergisi + sonuc.damgaVergisi}/>]]}/><MaasYillikSchedule rows={yillikSonuclar}/></> : <Warning reason="eksik"/>}<Disclaimer text="Bu sonuç tahminidir. Kesin tutar için işvereninin hazırladığı maaş belgesini esas al."/></div><OfficialSources><a href={GIB_VERGI_2026} target="_blank" rel="noreferrer">2026 vergi dilimleri</a><a href={GIB_ASGARI_2026} target="_blank" rel="noreferrer">2026 asgari ücret hesabı</a><a href={SGK_2026} target="_blank" rel="noreferrer">2026 SGK sınırları</a></OfficialSources></ToolLayout>;
}

function KidemTazminati() {
  const [brutMaas, setBrutMaas] = useState("60000");
  const [ekOdemeler, setEkOdemeler] = useState("0");
  const [yil, setYil] = useState("5");
  const [ay, setAy] = useState("0");
  const [gun, setGun] = useState("0");
  const sonuc = useMemo(() => kidemTazminatiHesapla2026({ brutMaas, aylikEkOdemeler: ekOdemeler, yil, ay, gun }), [brutMaas, ekOdemeler, yil, ay, gun]);
  const schema = useMemo(() => toolSchema("Kıdem Tazminatı Hesaplama 2026", "/araclar/kidem-tazminati-hesaplama"), []);
  return <ToolLayout title="Kıdem tazminatı hesaplama" lead="Aylık brüt maaşın, düzenli ek ödemelerin ve çalışma sürene göre 2026 yılı için tahmini kıdem tazminatını hesapla." path="/araclar/kidem-tazminati-hesaplama" schema={schema} showSources={false} faq={[["Düzenli ek ödemelere ne yazmalıyım?","Her ay düzenli aldığın yemek, yol veya benzeri para ödemelerinin aylık toplamını yaz."],["Kıdem tazminatı tavanı nedir?","Hesaplamada her çalışma yılı için kullanılabilecek aylık tutarın üst sınırıdır. 1 Temmuz–31 Aralık 2026 için 73.729,87 TL kullanılır."],["Kimler kıdem tazminatı alabilir?","Hak kazanma durumu işten ayrılma nedenine ve çalışma koşullarına göre değişir; bu araç yalnızca tutar tahmini yapar."]]}><div className="seo-panel"><h2>Çalışma bilgilerini gir</h2><NumberField label="Aylık brüt maaş" value={brutMaas} onChange={setBrutMaas}/><NumberField label="Düzenli aylık ek ödemeler" value={ekOdemeler} onChange={setEkOdemeler} hint="Her ay düzenli aldığın yemek, yol veya benzeri para ödemeleri."/><div className="seo-duration-fields"><NumberField label="Tam yıl" value={yil} onChange={setYil} suffix="Yıl" step="1"/><NumberField label="Ek ay" value={ay} onChange={setAy} suffix="Ay" step="1"/><NumberField label="Ek gün" value={gun} onChange={setGun} suffix="Gün" step="1"/></div><p className="seo-inline-note">1 Temmuz–31 Aralık 2026 için geçerli 73.729,87 TL yıllık tavan kullanılır.</p></div><div className="seo-result"><span className="seo-result-kicker">Tahmini net kıdem tazminatı</span>{sonuc.hesaplandi ? <><BuyukTutar value={sonuc.netTazminat}/><Summary items={[["Hesaba alınan aylık", <Money value={sonuc.hesaplamayaEsasAylik}/>],["Brüt tazminat", <Money value={sonuc.brutTazminat}/>],["Damga vergisi", <Money value={sonuc.damgaVergisi}/>]]}/></> : <Warning reason="eksik"/>}<Disclaimer text="Bu araç hak kazanıp kazanmadığını belirlemez; yalnızca verdiğin bilgilere göre tahmini tutarı gösterir."/></div><OfficialSources><a href={KIDEM_2026} target="_blank" rel="noreferrer">Çalışma Bakanlığı kıdem tazminatı tavanı</a></OfficialSources></ToolLayout>;
}

function BorcPlani() {
  const [butce, setButce] = useState("18000");
  const [strateji, setStrateji] = useState("faiz");
  const [borclar, setBorclar] = useState([{ id: "1", ad: "", kalan: "", faiz: "", asgari: "" }]);
  const sonuc = useMemo(() => borcPlaniHesapla({ borclar, aylikButce: butce, strateji }), [borclar, butce, strateji]);
  const guncelle = (id, alan, deger) => setBorclar((liste) => liste.map((item) => item.id === id ? { ...item, [alan]: deger } : item));
  const ekle = () => setBorclar((liste) => [...liste, { id: crypto.randomUUID(), ad: "", kalan: "", faiz: "", asgari: "" }]);
  const schema = useMemo(() => toolSchema("Borç Ödeme Planı Oluşturucu", "/araclar/borc-odeme-plani"), []);
  return <ToolLayout title="Borç ödeme planı oluşturucu" lead="Borçlarını, aylık maliyetlerini ve zorunlu ödemelerini ekle; faiz veya kartopu sırasıyla tahmini planını gör." path="/araclar/borc-odeme-plani" schema={schema} faq={[["Faiz yöntemi nedir?","Aylık oranı en yüksek borca ek ödeme ayırır."],["Kartopu yöntemi nedir?","Bakiyesi en küçük borca ek ödeme ayırarak erken tamamlanan kalemler oluşturur."]]}><div className="seo-panel seo-wide-form"><h2>Plan bilgileri</h2><NumberField label="Toplam aylık ödeme bütçesi" value={butce} onChange={setButce}/><span className="seo-strategy-label">Ödeme önceliği</span><div className="seo-toggle"><button className={strateji === "faiz" ? "active" : ""} onClick={() => setStrateji("faiz")}>En yüksek faiz</button><button className={strateji === "kar" ? "active" : ""} onClick={() => setStrateji("kar")}>En küçük bakiye</button></div><p className="seo-form-help">Her borç için güncel kalan tutarı, aylık faiz oranını ve zorunlu asgari ödemeyi gir.</p><div className="seo-plan-head"><span>Borç adı</span><span>Kalan borç</span><span>Aylık faiz</span><span>Asgari ödeme</span><span/></div><div className="seo-debts seo-plan-debts">{borclar.map((item) => <div className="seo-debt-row" key={item.id}><label className="seo-debt-field"><span>Borç adı</span><input aria-label="Borç adı" value={item.ad} onChange={(event) => guncelle(item.id,"ad",event.target.value)} placeholder="Örn. Kredi kartı"/></label><label className="seo-debt-field"><span>Kalan borç</span><div className="seo-calendar-input"><InlineMoneyInput aria-label={`${item.ad || "Borç"} kalan borç`} value={item.kalan} onChange={(value) => guncelle(item.id,"kalan",value)} placeholder="Örn. 70.000"/><b>TL</b></div></label><label className="seo-debt-field"><span>Aylık faiz</span><div className="seo-calendar-input"><input aria-label={`${item.ad || "Borç"} aylık faiz`} type="number" min="0" step="0.01" value={item.faiz} onChange={(event) => guncelle(item.id,"faiz",event.target.value)} placeholder="Örn. 3,75"/><b>%</b></div></label><label className="seo-debt-field"><span>Asgari ödeme</span><div className="seo-calendar-input"><InlineMoneyInput aria-label={`${item.ad || "Borç"} asgari ödeme`} value={item.asgari} onChange={(value) => guncelle(item.id,"asgari",value)} placeholder="Örn. 7.000"/><b>TL</b></div></label><button aria-label={`${item.ad || "Borç"} satırını sil`} title="Borcu sil" onClick={() => setBorclar((liste) => liste.filter((borc) => borc.id !== item.id))}><Trash2 size={16}/></button></div>)}</div><button className="seo-add" onClick={ekle}><Plus size={16}/> Yeni borç ekle</button></div><div className="seo-result"><span className="seo-result-kicker">TAHMİNİ PLAN</span>{sonuc.tamamlandi ? <><Summary items={[["Kapanış süresi", `${sonuc.ay} ay`],["Tahmini toplam faiz", <Money value={sonuc.toplamFaiz}/>],["Aylık bütçe", <Money value={butce}/>]]}/><Schedule rows={sonuc.takvim}/></> : <Warning reason={sonuc.neden} required={sonuc.gerekliAsgari}/>}<Disclaimer/></div><UrunKoprusu kicker="SIRALAMA HAZIR. ŞİMDİ KAYDET." baslik="Bu planı kendi borçlarınla her ay güncel tut." redirect="/debt-plan" id="borc-plani-sonraki-adim"/></ToolLayout>;
}

function OdemeTakvimi() {
  const [odemeler, setOdemeler] = useState([{ id: "1", ad: "", gun: "", tutar: "" }]);
  const toplam = odemeler.reduce((sum, item) => sum + (Number(item.tutar) || 0), 0);
  const sirali = odemeler.filter((item) => item.ad || item.gun || item.tutar).sort((a, b) => Number(a.gun) - Number(b.gun));
  const guncelle = (id, alan, deger) => setOdemeler((liste) => liste.map((item) => item.id === id ? { ...item, [alan]: deger } : item));
  const schema = useMemo(() => toolSchema("Aylık Ödeme Takvimi", "/araclar/aylik-odeme-takvimi"), []);
  return <ToolLayout title="Aylık ödeme takvimi" lead="Bu ay ödeyeceğin kart, kredi ve diğer borçları günlerine göre sırala; toplam aylık yükünü gör." path="/araclar/aylik-odeme-takvimi" schema={schema} faq={[["Bilgilerim kaydediliyor mu?","Hayır. Yazdığın bilgiler yalnızca bu hesaplama sırasında kullanılır."],["Kalıcı takip nasıl yapılır?","Ücretsiz Borcama hesabında dönemleri ve gerçekleşen ödemeleri kaydedebilirsin."]]}><div className="seo-panel seo-wide-form"><h2>Bu ayın ödemeleri</h2><p className="seo-form-help">Her satıra ödemenin adını, ayın kaçıncı günü ödeneceğini ve bu ay ödeyeceğin tutarı yaz.</p><div className="seo-debt-head"><span>Ödeme adı</span><span>Son ödeme günü</span><span>Bu ay ödenecek tutar</span><span/></div><div className="seo-debts calendar">{odemeler.map((item) => <div className="seo-debt-row" key={item.id}><label className="seo-calendar-field"><span>Ödeme adı</span><input aria-label="Ödeme adı" value={item.ad} onChange={(event) => guncelle(item.id,"ad",event.target.value)} placeholder="Örn. Kredi kartı"/></label><label className="seo-calendar-field"><span>Son ödeme günü</span><div className="seo-calendar-input"><input aria-label={`${item.ad || "Ödeme"} son ödeme günü`} type="number" min="1" max="31" value={item.gun} onChange={(event) => guncelle(item.id,"gun",event.target.value)} placeholder="Örn. 10"/><b>Gün</b></div></label><label className="seo-calendar-field"><span>Bu ay ödenecek tutar</span><div className="seo-calendar-input"><InlineMoneyInput aria-label={`${item.ad || "Ödeme"} bu ay ödenecek tutarı`} value={item.tutar} onChange={(value) => guncelle(item.id,"tutar",value)} placeholder="Örn. 7.500"/><b>TL</b></div></label><button aria-label={`${item.ad || "Ödeme"} satırını sil`} title="Ödemeyi sil" onClick={() => setOdemeler((liste) => liste.filter((odeme) => odeme.id !== item.id))}><Trash2 size={16}/></button></div>)}</div><button className="seo-add" onClick={() => setOdemeler((liste) => [...liste,{id:crypto.randomUUID(),ad:"",gun:"",tutar:""}])}><Plus size={16}/> Yeni ödeme ekle</button></div><div className="seo-result"><span className="seo-result-kicker">AYLIK TOPLAM</span><BuyukTutar value={toplam}/>{sirali.length ? <div className="seo-calendar-list">{sirali.map((item) => <div key={item.id}><b>{item.gun || "—"}</b><span>{item.ad || "Adsız ödeme"}</span><strong><Money value={item.tutar}/></strong></div>)}</div> : <p className="seo-calendar-empty">Bir ödeme eklediğinde takvimin burada oluşacak.</p>}<Disclaimer text="Bu geçici plan kaydedilmez ve ödeme talimatı oluşturmaz."/></div><UrunKoprusu kicker="TAKVİM HAZIR. HER AY YENİDEN YAZMA." baslik="Ödeme günlerini kaydet, ayın toplam yükünü her ay hazır gör." redirect="/payments" id="takvim-sonraki-adim"/></ToolLayout>;
}

function Schedule({ rows }) {
  const shown = rows.slice(0, 12);
  return <div className="seo-schedule"><div className="seo-table-head"><span>Ay</span><span>Faiz</span><span>Kalan</span></div>{shown.map((row) => <div key={row.ay}><span>{row.ay}</span><span><Money value={row.faiz}/></span><strong><Money value={row.kalan}/></strong></div>)}{rows.length > 12 && <small>İlk 12 ay gösteriliyor.</small>}</div>;
}

function KrediSchedule({ rows }) {
  const shown = rows.slice(0, 12);
  return <div className="seo-schedule seo-loan-schedule"><div className="seo-table-head"><span>Ay</span><span>Taksit</span><span>Faiz</span><span>Kalan</span></div>{shown.map((row) => <div key={row.ay}><span>{row.ay}</span><span><Money value={row.odeme}/></span><span><Money value={row.faiz}/></span><strong><Money value={row.kalan}/></strong></div>)}{rows.length > 12 && <small>İlk 12 ay gösteriliyor; toplam hesap vadeye göre yapılır.</small>}</div>;
}

function MaasYillikSchedule({ rows }) {
  return <div className="seo-schedule seo-loan-schedule"><div className="seo-table-head"><span>Ay</span><span>Brüt</span><span>Net</span><span>Kesinti</span></div>{rows.map((row) => <div key={row.ay}><span>{row.ay}</span><span><Money value={row.brut}/></span><span><Money value={row.net}/></span><strong><Money value={row.brut - row.net}/></strong></div>)}</div>;
}

function Warning({ reason, required }) {
  const text = reason === "butce-asgariden-dusuk" ? `Aylık bütçe, toplam zorunlu ödemeden düşük. En az ${turkLirasiFormatla(required)} gir.` : reason === "yetersiz-odeme" ? "Aylık ödeme ilk ayın tahmini faizini karşılamıyor; bu tutarla borç azalmayabilir." : "Hesaplama için sıfırdan büyük ve geçerli tutarlar gir.";
  return <div className="seo-warning">{text}</div>;
}

function Disclaimer({ text = "Sonuçlar yaklaşık planlama içindir; finansal tavsiye değildir. Bankanın uyguladığı oran, vergi, masraf ve yeni işlemler sonucu değiştirebilir." }) {
  return <p className="seo-disclaimer">{text}</p>;
}

function SourceNote() {
  return <aside className="seo-sources"><b>Güncel kaynak notu</b><p>Asgari ödeme kuralı için <a href={BDDK_KAYNAK} target="_blank" rel="noreferrer">BDDK kararını</a>; kredi kartı azami faizleri için her ay güncellenen <a href={TCMB_KAYNAK} target="_blank" rel="noreferrer">TCMB tablosunu</a> esas alıyoruz. Son kontrol: 3 Kasım 2026.</p></aside>;
}

function OfficialSources({ children }) {
  return <aside className="seo-official-sources"><b>Resmî bilgiler</b><div>{children}</div></aside>;
}

function GuideSources({ items = [] }) {
  if (!items.length) return null;
  return <OfficialSources>{items.map(([href, label]) => <a href={href} target="_blank" rel="noreferrer" key={href}>{label}</a>)}</OfficialSources>;
}

function Faq({ items, baslik = "Hesaplama hakkında" }) {
  return <section className="seo-faq"><h2>{baslik}</h2>{items.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</section>;
}

function FinansalSozlukAna() {
  const [arama, setArama] = useState("");
  const [kategori, setKategori] = useState("Tümü");
  const sorgu = arama.trim().toLocaleLowerCase("tr-TR");
  const alfabe = [..."ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ"];
  const harf = (terim) => terim.title.slice(0, 1).toLocaleUpperCase("tr-TR");
  const terimler = FINANSAL_SOZLUK
    .filter((terim) => kategori === "Tümü" || terim.category === kategori)
    .filter((terim) => !sorgu || `${terim.title} ${terim.definition} ${terim.category}`.toLocaleLowerCase("tr-TR").includes(sorgu))
    .sort((a, b) => a.title.localeCompare(b.title, "tr-TR"));
  const doluHarfler = new Set(terimler.map(harf));
  const schema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Borcama Finansal Sözlük",
    description: "Borç, kredi kartı, faiz ve bütçe terimlerini sade örneklerle açıklayan finansal sözlük.",
    url: `${SITE}/finansal-sozluk`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: FINANSAL_SOZLUK.length,
      itemListElement: FINANSAL_SOZLUK.map((terim, index) => ({ "@type": "ListItem", position: index + 1, url: `${SITE}/finansal-sozluk/${terim.slug}`, name: terim.title })),
    },
  }), []);
  useSeo({ title: "Finansal Sözlük", description: "Faiz, temerrüt, kredi kartı ekstresi, kalan anapara, nakit akışı ve borç yönetimi terimlerini sade örneklerle öğrenin.", path: "/finansal-sozluk", schema });
  return <Layout><main><Breadcrumb path="/finansal-sozluk" title="Finansal Sözlük"/><Hero title="Finansal Sözlük" lead="Bankanın söylediğini gündelik dile çevir. Borç, faiz, kredi kartı ve bütçe terimlerini kısa örneklerle anla."/><section className="seo-section seo-shell"><label className="seo-glossary-search"><span>Sözlükte ara</span><input type="search" value={arama} onChange={(event) => setArama(event.target.value)} placeholder="Örn. temerrüt, faiz, kalan anapara"/></label><nav className="seo-glossary-alphabet" aria-label="Terimlerin ilk harfine göre dizini">{alfabe.map((item) => doluHarfler.has(item) ? <a key={item} href={`#harf-${item.toLocaleLowerCase("tr-TR")}`}>{item}</a> : <span aria-disabled="true" key={item}>{item}</span>)}</nav><div className="seo-glossary-categories" aria-label="Sözlük kategorileri"><button className={kategori === "Tümü" ? "active" : ""} type="button" onClick={() => setKategori("Tümü")}>Tümü</button>{FINANSAL_SOZLUK_KATEGORILERI.map((category) => <button className={kategori === category ? "active" : ""} type="button" key={category} onClick={() => setKategori(category)}>{category}</button>)}</div><p className="seo-glossary-count"><strong>{terimler.length}</strong> terim gösteriliyor</p>{terimler.length ? alfabe.map((item) => { const grup = terimler.filter((terim) => harf(terim) === item); return grup.length ? <section className="seo-glossary-group" id={`harf-${item.toLocaleLowerCase("tr-TR")}`} key={item}><h2>{item}</h2><div className="seo-glossary-grid">{grup.map((terim) => <a href={`/finansal-sozluk/${terim.slug}`} key={terim.slug}><span>{item}</span><div><small>{terim.category}</small><h3>{terim.title}</h3><p>{terim.definition}</p><b>Tanımı oku <ArrowRight size={14}/></b></div></a>)}</div></section> : null; }) : <p className="seo-glossary-empty">Bu aramayla eşleşen terim bulunamadı.</p>}<Cta/></section></main></Layout>;
}

function FinansalSozlukDetay({ terim }) {
  const path = `/finansal-sozluk/${terim.slug}`;
  const related = terim.related.map(finansalSozlukTerimi).filter(Boolean);
  const schema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${terim.title} nedir?`,
    description: terim.definition,
    mainEntityOfPage: `${SITE}${path}`,
    author: { "@type": "Organization", name: "Borcama" },
    publisher: { "@type": "Organization", name: "Borcama", logo: { "@type": "ImageObject", url: `${SITE}/borcama-logo.png` } },
    datePublished: "2026-09-23",
    dateModified: terim.guncellendi || "2026-09-23",
    mainEntity: { "@type": "DefinedTerm", name: terim.title, description: terim.definition, inDefinedTermSet: `${SITE}/finansal-sozluk` },
  }), [path, terim]);
  useSeo({ title: terim.seoTitle || `${terim.title} Nedir?`, description: terim.seoDescription || `${terim.definition} Sade açıklama, örnek ve Borcama'daki karşılığını görün.`, path, schema });
  return <Layout><main><Breadcrumb path={path} title={terim.title}/><article className="seo-article seo-glossary-article seo-shell"><span className="seo-glossary-category">{terim.category}</span><h1>{terim.h1 || `${terim.title} nedir?`}</h1><p className="seo-article-lead">{terim.definition}</p>{terim.borcKoprusu && <RehberBaglantilari baslik={terim.borcKoprusu.baslik} aciklama={terim.borcKoprusu.aciklama} baglantilar={[...rehberBaglantilari({ ilgiliRehberler: terim.rehberler }), ...rehberBaglantilari({ araclar: terim.borcKoprusu.araclar })]}/>}<div className="seo-article-body"><section><h2>Kısaca nasıl çalışır?</h2><p>{terim.detail}</p></section><section className="seo-glossary-example"><h2>Basit örnek</h2><p>{terim.example}</p></section>{(terim.ekBolumler || []).map(([baslik, metin]) => <section key={baslik}><h2>{baslik}</h2><p>{metin}</p></section>)}<section><h2>Borcama'da ne anlama gelir?</h2><p>{terim.borcama}</p></section></div><UrunKoprusu kicker="TANIMI ÖĞRENDİN. ŞİMDİ KENDİ TABLONU GÖR." baslik="Bunu kendi kart, kredi ve ödemelerinde gör." redirect="/debts" id="sozluk-sonraki-adim"/>{terim.tool && <div className="seo-article-tool"><Calculator/><div><b>Rakamlarınla kontrol et</b><p>Tanımı kendi tutarlarınla ücretsiz bir hesaba dönüştür.</p></div><a className="seo-btn" href={`/araclar/${terim.tool}`}>Aracı aç <ArrowRight size={14}/></a></div>}{!terim.borcKoprusu && <RehberBaglantilari baslik="Bu konuda rehberler" baglantilar={rehberBaglantilari({ ilgiliRehberler: terim.rehberler })}/>}{terim.sss?.length > 0 && <Faq items={terim.sss} baslik="Sık sorulan sorular"/>}{terim.kaynaklar?.length > 0 && <GuideSources items={terim.kaynaklar.map(([etiket, adres]) => [adres, etiket])}/>}<section className="seo-glossary-related" aria-label="İlgili finansal terimler"><h2>İlgili terimler</h2><div>{related.map((item) => <a href={`/finansal-sozluk/${item.slug}`} key={item.slug}><strong>{item.title}</strong><span>{item.definition}</span><ArrowRight size={16}/></a>)}</div></section><p className="seo-editorial">Bu açıklama genel bilgilendirme amaçlıdır; finansal veya hukuki tavsiye değildir. Kesin oran ve yükümlülük için güncel sözleşmeni ve resmî belgeyi esas al.</p></article></main></Layout>;
}

function slugifyCategory(category) {
  return category.toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replaceAll("ı", "i").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function RehberAna() {
  const schema = useMemo(() => ({ "@context":"https://schema.org", "@type":"CollectionPage", name:"Borcama Rehber", url:`${SITE}/rehber` }), []);
  useSeo({ title:"Borç ve Kredi Kartı Takip Rehberi", description:"Borç düzenleme, kredi kartı takibi, asgari ödeme ve borç kapatma planı hakkında sade ve uygulanabilir içerikler.", path:"/rehber", schema });
  return <Layout><main><Hero title="Borçlarını anlamak için sade anlatımlar." lead="Karmaşık terimler yerine aylık düzen kurmana yardımcı olacak kısa ve uygulanabilir rehberler."/><section className="seo-section seo-shell"><div className="seo-article-grid">{REHBERLER.map((rehber) => <a key={rehber.slug} href={`/rehber/${rehber.slug}`}><BookOpen/><div><h2>{rehber.title}</h2><p>{rehber.description}</p><span>Rehberi oku <ArrowRight size={14}/></span></div></a>)}</div><Cta/></section></main></Layout>;
}

function RehberDetay({ rehber }) {
  const schema = useMemo(() => ({ "@context":"https://schema.org", "@type":"Article", headline:rehber.title, description:rehber.description, mainEntityOfPage:`${SITE}/rehber/${rehber.slug}`, author:{"@type":"Organization",name:"Borcama"}, publisher:{"@type":"Organization",name:"Borcama",logo:{"@type":"ImageObject",url:`${SITE}/borcama-logo.png`}}, datePublished:rehber.published || "2026-08-22", dateModified:rehber.guncellendi || rehber.published || "2026-08-22" }), [rehber]);
  useSeo({ title:rehber.title, description:rehber.description, path:`/rehber/${rehber.slug}`, schema });
  const uyari = REHBER_UYARILARI[rehber.slug] || "Bu içerik genel bilgilendirme amaçlıdır ve finansal tavsiye değildir. Kesin tutarlar için banka ekstreni ve güncel sözleşmeni esas al.";
  return <Layout><main><Breadcrumb path={`/rehber/${rehber.slug}`} title={rehber.title}/><article className="seo-article seo-shell"><h1>{rehber.h1 || rehber.title}</h1>{rehber.guncellendi && <p className="seo-article-date">Son güncelleme: <time dateTime={rehber.guncellendi}>{guncellemeTarihiMetni(rehber.guncellendi)}</time></p>}<p className="seo-article-lead">{rehber.intro}</p><div className="seo-article-body">{rehber.sections.map(([title, body]) => <section key={title}><h2>{title}</h2><p>{body}</p></section>)}</div><div className="seo-article-tool"><Calculator/><div><b>Rakamlarını ücretsiz hesapla</b><p>Bu rehberi kendi tutarlarınla uygulanabilir bir plana dönüştür.</p></div><a className="seo-btn" href={`/araclar/${rehber.tool}`}>Aracı aç <ArrowRight size={14}/></a></div>{rehber.sss?.length > 0 && <Faq items={rehber.sss} baslik="Sık sorulan sorular"/>}<UrunKoprusu kicker="REHBERİ OKUDUN. ŞİMDİ UYGULA." baslik="Bu adımları kendi borçlarınla Borcama'da uygula." redirect="/debts" id="rehber-sonraki-adim"/><RehberBaglantilari baslik="İlgili hesaplayıcı ve rehberler" baglantilar={rehberBaglantilari(rehber)}/><GuideSources items={REHBER_KAYNAKLARI[rehber.slug]}/><p className="seo-editorial">{uyari}</p></article></main></Layout>;
}

// Rehberin ek araçları, ilgili rehberleri ve sözlük terimleri; yalnız var olan sayfalara bağlanır.
function rehberBaglantilari({ araclar = [], ilgiliRehberler = [], terimler = [] }) {
  return [
    ...araclar.map((slug) => ARACLAR.find((arac) => arac.slug === slug)).filter(Boolean).map((arac) => [`/araclar/${arac.slug}`, "Ücretsiz hesaplayıcı", arac.title, Calculator]),
    ...ilgiliRehberler.map(rehberBul).filter(Boolean).map((item) => [`/rehber/${item.slug}`, "Adım adım rehber", item.title, BookOpen]),
    ...terimler.map(finansalSozlukTerimi).filter(Boolean).map((terim) => [`/finansal-sozluk/${terim.slug}`, "Finansal sözlük", terim.title, BookOpen]),
  ];
}

function RehberBaglantilari({ baslik, aciklama, baglantilar }) {
  if (!baglantilar.length) return null;
  return <section className="seo-related-guides" aria-label={baslik}><h2>{baslik}</h2>{aciklama && <p>{aciklama}</p>}{baglantilar.map(([href, etiket, metin, Icon]) => <a className="seo-related-guide" href={href} key={href}><Icon/><span><b>{etiket}</b><strong>{metin}</strong></span><ArrowRight/></a>)}</section>;
}

// Araç, sözlük ve rehber sayfalarından ürüne geçiş. Sayfadaki tutarlar kayıt
// bağlantısına veya ölçüme eklenmez; olay yalnız hangi sayfadan geçildiğini tutar.
function UrunKoprusu({ kicker, baslik, redirect, id }) {
  const tikla = (olay) => funnelTiklamasiKaydedipGit(olay, "content_product_click");
  return <section className="seo-product-bridge" aria-labelledby={id}><span className="seo-product-bridge-kicker">{kicker}</span><h2 id={id}>{baslik}</h2><p>Kartlarını, kredilerini ve ek hesaplarını ekle; kalan borcu, ödeme günlerini ve aylık yükünü tek yerde takip et.</p><ul><li><WalletCards size={17}/> Bütün borçlarını tek tabloda gör</li><li><CalendarDays size={17}/> Ödeme günlerini ve zorunlu tutarları takip et</li><li><ListChecks size={17}/> İlk kapatacağın borcu kendi kayıtlarınla planla</li></ul><div className="seo-product-actions"><a className="seo-btn" href={`/register?plan=free&redirect=${encodeURIComponent(redirect)}`} onClick={tikla}>Ücretsiz hesabını aç <ArrowRight size={15}/></a></div><small>Kart bilgisi gerekmez. Ücretsiz paket hep açık.</small></section>;
}

function Cta() {
  return <section className="seo-cta"><div><h2>Planını her ay Borcama’da takip et.</h2><p>Kartlarını, kredilerini, ekstrelerini ve yaptığın ödemeleri tek yerde gör.</p></div><a className="seo-btn dark" href="/register?plan=free" onClick={(olay) => funnelTiklamasiKaydedipGit(olay, "content_product_click")}>Ücretsiz hesabını aç <ArrowRight size={15}/></a></section>;
}

function toolSchema(name, path) {
  return { "@context":"https://schema.org", "@type":"WebApplication", name, url:`${SITE}${path}`, applicationCategory:"FinanceApplication", operatingSystem:"Web", offers:{"@type":"Offer",price:"0",priceCurrency:"TRY"} };
}
