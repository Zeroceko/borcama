import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Calculator,
  CheckCircle2,
  CircleDollarSign,
  ListChecks,
  Plus,
  ShieldCheck,
  Trash2,
  WalletCards,
} from "lucide-react";
import {
  borcKapatmaHesapla,
  borcPlaniHesapla,
  krediKartiAsgariOdemeHesapla,
} from "./seoTools.js";
import "./SeoPages.css";

const SITE = "https://borcama.com";
const BDDK_KAYNAK = "https://www.bddk.org.tr/Duyuru/EkGetir/2074?ekId=862";
const TCMB_KAYNAK = "https://www.tcmb.gov.tr/wps/wcm/connect/TR/TCMB%2BTR/Main%2BMenu/Istatistikler/Bankacilik%2BVerileri/Kredi_Karti_Islemlerinde_Uygulanacak_Azami_Faiz_Oranlari";

const ARACLAR = [
  { slug: "borc-kapatma-hesaplayici", icon: CircleDollarSign, title: "Borç kapatma hesaplayıcı", text: "Aylık ödeme ve faiz oranına göre tahmini kapanış süresini gör." },
  { slug: "kredi-karti-asgari-odeme-hesaplayici", icon: WalletCards, title: "Kredi kartı asgari ödeme hesaplayıcı", text: "Kart limiti ve dönem borcuna göre yasal oranla tahmini asgari tutarı hesapla." },
  { slug: "borc-odeme-plani", icon: ListChecks, title: "Borç ödeme planı oluşturucu", text: "Birden fazla borcu faiz veya kartopu stratejisiyle tek planda sırala." },
  { slug: "aylik-odeme-takvimi", icon: CalendarDays, title: "Aylık ödeme takvimi", text: "Son ödeme günlerini ve bu ayın toplam yükünü tek listede topla." },
];

const REHBERLER = [
  {
    slug: "borclarimi-nasil-duzenlerim",
    title: "Borçlarımı Nasıl Düzenlerim? Adım Adım Başlangıç Rehberi",
    description: "Dağınık kredi kartı, kredi ve ek hesap borçlarını tek listede toplamak ve uygulanabilir bir aylık plan kurmak için sade rehber.",
    intro: "Borçları düzenlemenin ilk adımı daha fazla hesap yapmak değil, eksiksiz bir fotoğraf çekmektir. Tutarlar tek yerde olmadığında hangi ödemenin öncelikli olduğunu görmek zorlaşır.",
    sections: [
      ["1. Bütün borçları tek listeye yaz", "Her kart, kredi ve ek hesap için kalan borcu, aylık faiz oranını, asgari veya zorunlu ödemeyi ve son ödeme tarihini kaydet. Banka uygulamaları arasında gidip gelmek yerine aynı tarihli tek bir tablo kullan."],
      ["2. Bu ayın zorunlu tutarını ayır", "Toplam borç ile bu ay ödenmesi gereken tutar aynı şey değildir. Önce gecikmeyi önleyecek zorunlu ödemeleri, sonra ek ödeme için kullanabileceğin gerçek bütçeyi belirle."],
      ["3. Tek bir öncelik yöntemi seç", "Maliyeti azaltmak istiyorsan faiz oranı en yüksek borca, hızlı ilerleme hissi istiyorsan bakiyesi en küçük borca odaklan. Yöntemden daha önemlisi, her ay aynı sistemi uygulamaktır."],
      ["4. Haftalık beş dakikalık kontrol yap", "Yeni ekstreleri, yaptığın ödemeleri ve değişen tarihleri güncelle. Planın gerçek hayata uymadığını fark edersen tutarı değiştir; planı tamamen bırakma."],
    ],
    tool: "borc-odeme-plani",
  },
  {
    slug: "kredi-karti-borcu-nasil-takip-edilir",
    title: "Kredi Kartı Borcu Nasıl Takip Edilir?",
    description: "Dönem borcu, asgari ödeme, son ödeme tarihi ve devreden bakiye kavramlarıyla kredi kartı borcunu düzenli takip etme rehberi.",
    intro: "Kredi kartı borcunu takip ederken yalnızca güncel bakiyeye bakmak yeterli değildir. Ekstre dönemi, son ödeme tarihi ve ödeme sonrası devreden tutar birlikte izlenmelidir.",
    sections: [
      ["Ekstre ile güncel borcu ayır", "Dönem borcu kesilmiş ekstrenin tutarıdır. Güncel borç ise ekstre kesildikten sonra yaptığın yeni harcamaları da içerebilir. Aylık planı ekstre tutarı üzerinden kur."],
      ["Dört bilgiyi birlikte kaydet", "Her kart için ekstre tarihi, son ödeme tarihi, dönem borcu ve bankanın bildirdiği asgari tutarı yaz. Kısmi ödeme yaptığında kalan tutarı da aynı dönemde güncelle."],
      ["Yeni harcamayı eski borçtan ayır", "Borç azalırken kartı kullanmaya devam etmek ilerlemeyi gizleyebilir. Mümkünse plan döneminde yeni harcamaları ayrı izle ve aylık net değişime bak."],
      ["Tek bir aylık özet kullan", "Tüm kartların toplam dönem borcu, toplam asgari ödemesi ve ödenen tutarı tek ekranda olduğunda gecikme riski ve gerçek ilerleme daha kolay görülür."],
    ],
    tool: "kredi-karti-asgari-odeme-hesaplayici",
  },
  {
    slug: "asgari-odeme-borcu-nasil-etkiler",
    title: "Asgari Ödeme Yapmak Borcu Nasıl Etkiler?",
    description: "Kredi kartında asgari ödeme tutarı, kalan borç ve faiz etkisini sade bir örnekle anlayın.",
    intro: "Asgari tutarı ödemek, bankanın bildirdiği son ödeme yükümlülüğünü karşılamaya yardımcı olur; ancak dönem borcunun tamamı kapanmadığı için kalan tutar maliyet oluşturmaya devam edebilir.",
    sections: [
      ["Asgari tutar nasıl belirlenir?", "BDDK'nın 26 Eylül 2024 tarihli kararında kart limiti 50 bin TL ve altındaki kartlar için dönem borcunun yüzde 20'si, bu sınırın üzerindeki kartlar için yüzde 40'ı esas alınır. Bankanın ekstrende bildirdiği tutar her zaman önceliklidir."],
      ["Kalan borç neden önemlidir?", "Asgari ödeme sonrası kalan bakiye sonraki döneme devreder. Uygulanacak oran bankaya, borç türüne ve güncel düzenlemelere göre değişebilir."],
      ["Ek ödeme neyi değiştirir?", "Asgari tutarın üzerindeki her ödeme ana bakiyeyi daha hızlı azaltabilir. Bunun etkisini değerlendirirken yeni harcamaları ve bankanın uyguladığı gerçek oranı da hesaba kat."],
      ["Hangi rakama güvenmelisin?", "Hesaplayıcılar planlama için tahmin sunar. Kesin asgari ödeme, faiz ve vergi tutarları için bankanın ekstresini ve güncel sözleşmeni esas al."],
    ],
    tool: "kredi-karti-asgari-odeme-hesaplayici",
  },
  {
    slug: "birden-fazla-bankadaki-borclar-nasil-yonetilir",
    title: "Birden Fazla Bankadaki Borçlar Nasıl Yönetilir?",
    description: "Farklı bankalardaki kart, kredi ve ek hesap borçlarını tek aylık düzende takip etmek için uygulanabilir yöntem.",
    intro: "Birden fazla bankayla çalışırken asıl zorluk borç sayısı değil, bilgilerin farklı ekranlarda kalmasıdır. Amaç bütün hesapları tek bir aylık karar tablosuna dönüştürmektir.",
    sections: [
      ["Ortak bir kesim tarihi fotoğrafı oluştur", "Bakiyeleri mümkün olduğunca aynı gün kaydet. Böylece bir bankadaki eski bakiye ile diğerindeki yeni bakiyeyi yanlış karşılaştırmazsın."],
      ["Tarihleri kronolojik sırala", "Son ödeme tarihlerini ayın günlerine göre diz. Gelir tarihinden önce ve sonra gelen ödemeleri görmek nakit akışını planlamayı kolaylaştırır."],
      ["Zorunlu ve isteğe bağlı ödemeyi ayır", "Tüm asgari veya taksit tutarları zorunlu katmandır. Bunun üzerindeki bütçeyi seçtiğin tek bir borca yönlendirerek ilerlemeyi daha okunur hale getir."],
      ["Aylık net değişimi izle", "Sadece yaptığın ödeme toplamına değil, ay başı ve ay sonu toplam borç farkına bak. Yeni harcamalar varsa bu fark gerçek ilerlemeyi daha iyi gösterir."],
    ],
    tool: "aylik-odeme-takvimi",
  },
  {
    slug: "borc-kapatma-plani-nasil-hazirlanir",
    title: "Borç Kapatma Planı Nasıl Hazırlanır?",
    description: "Aylık bütçe, asgari ödemeler, faiz ve öncelik sırasıyla gerçekçi bir borç kapatma planı hazırlayın.",
    intro: "İyi bir borç kapatma planı en iyimser rakama değil, her ay sürdürülebilecek tutara dayanır. Planın temel girdileri toplam bakiye, zorunlu ödemeler, aylık maliyet ve ek ödeme bütçesidir.",
    sections: [
      ["Gerçek aylık bütçeyi belirle", "Barınma, fatura, gıda ve ulaşım gibi temel giderlerden sonra düzenli ayırabileceğin tutarı kullan. Tek seferlik iyimser bir rakam planı erken bozabilir."],
      ["Faiz veya kartopu yöntemini seç", "Faiz yöntemi en yüksek aylık oranlı borcu öne alır. Kartopu yöntemi ise en küçük bakiyeyi önce kapatarak daha erken tamamlanan kalemler oluşturur."],
      ["Kapanan borcun ödemesini devret", "Bir borç bittiğinde o kalem için ayırdığın tutarı harcamaya döndürmek yerine sıradaki borca ekle. Planı hızlandıran ana etki budur."],
      ["Planı her ekstrede yenile", "Faiz oranı, yeni harcama veya gelir değiştiğinde tahmini bitiş tarihi de değişir. Hesabı bir söz değil, güncellenen bir yol haritası olarak kullan."],
    ],
    tool: "borc-odeme-plani",
  },
];

export function seoYoluMu(yol) {
  return yol === "/araclar" || yol.startsWith("/araclar/") || yol === "/rehber" || yol.startsWith("/rehber/");
}

export default function SeoSayfasi({ yol }) {
  if (yol === "/araclar") return <AraclarAna />;
  if (yol === "/araclar/borc-kapatma-hesaplayici") return <BorcKapatma />;
  if (yol === "/araclar/kredi-karti-asgari-odeme-hesaplayici") return <AsgariOdeme />;
  if (yol === "/araclar/borc-odeme-plani") return <BorcPlani />;
  if (yol === "/araclar/aylik-odeme-takvimi") return <OdemeTakvimi />;
  if (yol === "/rehber") return <RehberAna />;
  const slug = yol.replace("/rehber/", "");
  const rehber = REHBERLER.find((item) => item.slug === slug);
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
    setMeta("og:type", path.startsWith("/rehber/") ? "article" : "website", true);
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
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
    return () => script.remove();
  }, [title, description, path, schema]);
}

function Layout({ children }) {
  return <div className="seo"><header className="seo-nav seo-shell"><a className="seo-logo" href="/" aria-label="Borcama ana sayfa"><img src="/borcama-logo.png" alt="Borcama" /></a><nav><a href="/araclar">Ücretsiz Araçlar</a><a href="/rehber">Rehber</a><a href="/login">Giriş yap</a><a className="seo-btn small" href="/register?plan=free">Ücretsiz Başla <ArrowRight size={14}/></a></nav></header>{children}<footer className="seo-footer"><div className="seo-shell"><div><a className="seo-footer-logo" href="/"><img src="/borcama-logo.png" alt="Borcama"/></a><p>Kişisel borç, ödeme ve varlık takip aracı.</p></div><div className="seo-footer-links"><a href="/araclar">Ücretsiz Araçlar</a><a href="/rehber">Rehber</a><a href="/privacy">Gizlilik ve KVKK</a><a href="/faq">SSS</a></div></div></footer></div>;
}

function Hero({ kicker, title, lead, children }) {
  return <section className="seo-hero"><div className="seo-shell seo-hero-inner"><div><span className="seo-kicker">{kicker}</span><h1>{title}</h1><p>{lead}</p></div>{children}</div></section>;
}

function AraclarAna() {
  const schema = useMemo(() => ({ "@context": "https://schema.org", "@type": "CollectionPage", name: "Borcama Ücretsiz Finans Araçları", url: `${SITE}/araclar`, description: "Borç kapatma, asgari ödeme, ödeme planı ve aylık takvim araçları." }), []);
  useSeo({ title: "Ücretsiz Borç ve Ödeme Hesaplama Araçları", description: "Borç kapatma süresi, kredi kartı asgari ödeme, borç ödeme planı ve aylık ödeme takvimini ücretsiz hesaplayın.", path: "/araclar", schema });
  return <Layout><main><Hero kicker="ÜCRETSİZ ARAÇLAR" title="Rakamları tek tek değil, birlikte gör." lead="Bilgiler yalnızca tarayıcında hesaplanır; Borcama'ya veya başka bir sunucuya gönderilmez."><div className="seo-hero-badge"><ShieldCheck/><b>Üyelik gerekmez</b><span>Hemen hesapla</span></div></Hero><section className="seo-section seo-shell"><div className="seo-card-grid">{ARACLAR.map((arac) => <AracCard key={arac.slug} {...arac}/>)}</div><Cta /></section></main></Layout>;
}

function AracCard({ slug, icon: Icon, title, text }) {
  return <a className="seo-tool-card" href={`/araclar/${slug}`}><span className="seo-icon"><Icon/></span><h2>{title}</h2><p>{text}</p><span className="seo-card-link">Aracı aç <ArrowRight size={15}/></span></a>;
}

function ToolLayout({ title, lead, path, schema, children, faq = [] }) {
  useSeo({ title, description: lead, path, schema });
  return <Layout><main><Hero kicker="BORCAMA HESAPLAYICI" title={title} lead={lead}/><section className="seo-section seo-shell"><div className="seo-tool-layout">{children}</div>{faq.length > 0 && <Faq items={faq}/>}<SourceNote/><Cta/></section></main></Layout>;
}

function NumberField({ label, value, onChange, suffix = "TL", step = "100", min = "0", hint }) {
  return <label className="seo-field"><span>{label}</span><div><input type="number" inputMode="decimal" min={min} step={step} value={value} onChange={(event) => onChange(event.target.value)}/><b>{suffix}</b></div>{hint && <small>{hint}</small>}</label>;
}

function Money({ value }) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(Number(value) || 0);
}

function Summary({ items }) {
  return <div className="seo-summary">{items.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>;
}

function BorcKapatma() {
  const [borc, setBorc] = useState("100000");
  const [faiz, setFaiz] = useState("3.75");
  const [odeme, setOdeme] = useState("12000");
  const sonuc = useMemo(() => borcKapatmaHesapla({ borc, aylikFaiz: faiz, aylikOdeme: odeme }), [borc, faiz, odeme]);
  const schema = useMemo(() => toolSchema("Borç Kapatma Hesaplayıcı", "/araclar/borc-kapatma-hesaplayici"), []);
  return <ToolLayout title="Borç kapatma hesaplayıcı" lead="Aylık ödeme tutarına ve girdiğin faiz oranına göre borcun tahmini kaç ayda biteceğini hesapla." path="/araclar/borc-kapatma-hesaplayici" schema={schema} faq={[["Bu sonuç kesin midir?","Hayır. Yeni harcama, oran değişikliği, vergi ve masraflar sonucu değiştirebilir."],["Hangi faiz oranını girmeliyim?","Bankanın ekstrende veya sözleşmende bildirdiği aylık oranı kullan."]]}><div className="seo-panel"><h2>Bilgilerini gir</h2><NumberField label="Toplam borç" value={borc} onChange={setBorc}/><NumberField label="Aylık faiz oranı" value={faiz} onChange={setFaiz} suffix="%" step="0.01" hint="Bankanın uyguladığı gerçek aylık oranı gir."/><NumberField label="Her ay ayıracağın ödeme" value={odeme} onChange={setOdeme}/></div><div className="seo-result"><span className="seo-result-kicker">TAHMİNİ PLAN</span>{sonuc.tamamlandi ? <><Summary items={[["Kapanış süresi", `${sonuc.ay} ay`],["Toplam faiz", <Money value={sonuc.toplamFaiz}/>],["Toplam ödeme", <Money value={sonuc.toplamOdeme}/>]]}/><Schedule rows={sonuc.takvim}/></> : <Warning reason={sonuc.neden}/>}<Disclaimer/></div></ToolLayout>;
}

function AsgariOdeme() {
  const [limit, setLimit] = useState("100000");
  const [borc, setBorc] = useState("25000");
  const sonuc = useMemo(() => krediKartiAsgariOdemeHesapla({ donemBorcu: borc, kartLimiti: limit }), [limit, borc]);
  const schema = useMemo(() => toolSchema("Kredi Kartı Asgari Ödeme Hesaplayıcı", "/araclar/kredi-karti-asgari-odeme-hesaplayici"), []);
  return <ToolLayout title="Kredi kartı asgari ödeme hesaplayıcı" lead="Kart limitin ve dönem borcuna göre güncel BDDK oranıyla tahmini asgari ödeme tutarını gör." path="/araclar/kredi-karti-asgari-odeme-hesaplayici" schema={schema} faq={[["Hangi oran kullanılıyor?","Kart limiti 50 bin TL ve altındaysa yüzde 20, üzerindeyse yüzde 40."],["Ekstredeki tutar farklıysa ne yapmalıyım?","Her zaman bankanın güncel ekstrende bildirdiği asgari tutarı esas al."]]}><div className="seo-panel"><h2>Kart bilgilerini gir</h2><NumberField label="Kart limiti" value={limit} onChange={setLimit}/><NumberField label="Dönem borcu" value={borc} onChange={setBorc}/><p className="seo-inline-note">26 Eylül 2024 tarihli BDDK kararındaki kart limiti eşiği kullanılır.</p></div><div className="seo-result"><span className="seo-result-kicker">TAHMİNİ ASGARİ</span><div className="seo-big-money"><Money value={sonuc.tahminiAsgari}/></div><Summary items={[["Uygulanan oran", `%${Math.round(sonuc.oran * 100)}`],["Ödeme sonrası kalan", <Money value={sonuc.odemeSonrasiKalan}/>]]}/><Disclaimer text="Bu araç yasal orana göre tahmin üretir. Kesin tutar için bankanın ekstrende bildirdiği asgari ödemeyi esas al."/></div></ToolLayout>;
}

function BorcPlani() {
  const [butce, setButce] = useState("18000");
  const [strateji, setStrateji] = useState("faiz");
  const [borclar, setBorclar] = useState([
    { id: "1", ad: "Kredi kartı", kalan: "70000", faiz: "3.75", asgari: "7000" },
    { id: "2", ad: "İhtiyaç kredisi", kalan: "45000", faiz: "2.90", asgari: "4500" },
  ]);
  const sonuc = useMemo(() => borcPlaniHesapla({ borclar, aylikButce: butce, strateji }), [borclar, butce, strateji]);
  const guncelle = (id, alan, deger) => setBorclar((liste) => liste.map((item) => item.id === id ? { ...item, [alan]: deger } : item));
  const ekle = () => setBorclar((liste) => [...liste, { id: crypto.randomUUID(), ad: `Borç ${liste.length + 1}`, kalan: "10000", faiz: "3", asgari: "1000" }]);
  const schema = useMemo(() => toolSchema("Borç Ödeme Planı Oluşturucu", "/araclar/borc-odeme-plani"), []);
  return <ToolLayout title="Borç ödeme planı oluşturucu" lead="Borçlarını, aylık maliyetlerini ve zorunlu ödemelerini ekle; faiz veya kartopu sırasıyla tahmini planını gör." path="/araclar/borc-odeme-plani" schema={schema} faq={[["Faiz yöntemi nedir?","Aylık oranı en yüksek borca ek ödeme ayırır."],["Kartopu yöntemi nedir?","Bakiyesi en küçük borca ek ödeme ayırarak erken tamamlanan kalemler oluşturur."]]}><div className="seo-panel seo-wide-form"><h2>Plan bilgileri</h2><NumberField label="Toplam aylık ödeme bütçesi" value={butce} onChange={setButce}/><div className="seo-toggle"><button className={strateji === "faiz" ? "active" : ""} onClick={() => setStrateji("faiz")}>En yüksek faiz</button><button className={strateji === "kar" ? "active" : ""} onClick={() => setStrateji("kar")}>En küçük bakiye</button></div><div className="seo-debts">{borclar.map((item) => <div className="seo-debt-row" key={item.id}><input aria-label="Borç adı" value={item.ad} onChange={(event) => guncelle(item.id,"ad",event.target.value)}/><input aria-label={`${item.ad} kalan borç`} type="number" value={item.kalan} onChange={(event) => guncelle(item.id,"kalan",event.target.value)} placeholder="Kalan TL"/><input aria-label={`${item.ad} aylık faiz`} type="number" value={item.faiz} onChange={(event) => guncelle(item.id,"faiz",event.target.value)} placeholder="Faiz %"/><input aria-label={`${item.ad} asgari ödeme`} type="number" value={item.asgari} onChange={(event) => guncelle(item.id,"asgari",event.target.value)} placeholder="Asgari TL"/><button aria-label={`${item.ad} sil`} onClick={() => setBorclar((liste) => liste.filter((borc) => borc.id !== item.id))}><Trash2 size={16}/></button></div>)}</div><button className="seo-add" onClick={ekle}><Plus size={16}/> Borç ekle</button></div><div className="seo-result"><span className="seo-result-kicker">TAHMİNİ PLAN</span>{sonuc.tamamlandi ? <><Summary items={[["Kapanış süresi", `${sonuc.ay} ay`],["Tahmini toplam faiz", <Money value={sonuc.toplamFaiz}/>],["Aylık bütçe", <Money value={butce}/>]]}/><Schedule rows={sonuc.takvim}/></> : <Warning reason={sonuc.neden} required={sonuc.gerekliAsgari}/>}<Disclaimer/></div></ToolLayout>;
}

function OdemeTakvimi() {
  const [odemeler, setOdemeler] = useState([{ id: "1", ad: "", gun: "", tutar: "" }]);
  const toplam = odemeler.reduce((sum, item) => sum + (Number(item.tutar) || 0), 0);
  const sirali = odemeler.filter((item) => item.ad || item.gun || item.tutar).sort((a, b) => Number(a.gun) - Number(b.gun));
  const guncelle = (id, alan, deger) => setOdemeler((liste) => liste.map((item) => item.id === id ? { ...item, [alan]: deger } : item));
  const schema = useMemo(() => toolSchema("Aylık Ödeme Takvimi", "/araclar/aylik-odeme-takvimi"), []);
  return <ToolLayout title="Aylık ödeme takvimi" lead="Bu ay ödeyeceğin kart, kredi ve diğer borçları günlerine göre sırala; toplam aylık yükünü gör." path="/araclar/aylik-odeme-takvimi" schema={schema} faq={[["Bilgilerim kaydediliyor mu?","Hayır. Bu sayfadaki tutarlar yalnızca açık tarayıcı sekmesinde tutulur."],["Kalıcı takip nasıl yapılır?","Ücretsiz Borcama hesabında dönemleri ve gerçekleşen ödemeleri kaydedebilirsin."]]}><div className="seo-panel seo-wide-form"><h2>Bu ayın ödemeleri</h2><p className="seo-form-help">Her satıra ödemenin adını, ayın kaçıncı günü ödeneceğini ve bu ay ödeyeceğin tutarı yaz.</p><div className="seo-debt-head"><span>Ödeme adı</span><span>Son ödeme günü</span><span>Bu ay ödenecek tutar</span><span/></div><div className="seo-debts calendar">{odemeler.map((item) => <div className="seo-debt-row" key={item.id}><label className="seo-calendar-field"><span>Ödeme adı</span><input aria-label="Ödeme adı" value={item.ad} onChange={(event) => guncelle(item.id,"ad",event.target.value)} placeholder="Örn. Kredi kartı"/></label><label className="seo-calendar-field"><span>Son ödeme günü</span><div className="seo-calendar-input"><input aria-label={`${item.ad || "Ödeme"} son ödeme günü`} type="number" min="1" max="31" value={item.gun} onChange={(event) => guncelle(item.id,"gun",event.target.value)} placeholder="Örn. 10"/><b>Gün</b></div></label><label className="seo-calendar-field"><span>Bu ay ödenecek tutar</span><div className="seo-calendar-input"><input aria-label={`${item.ad || "Ödeme"} bu ay ödenecek tutarı`} type="number" min="0" value={item.tutar} onChange={(event) => guncelle(item.id,"tutar",event.target.value)} placeholder="Örn. 7.500"/><b>TL</b></div></label><button aria-label={`${item.ad || "Ödeme"} satırını sil`} title="Ödemeyi sil" onClick={() => setOdemeler((liste) => liste.filter((odeme) => odeme.id !== item.id))}><Trash2 size={16}/></button></div>)}</div><button className="seo-add" onClick={() => setOdemeler((liste) => [...liste,{id:crypto.randomUUID(),ad:"",gun:"",tutar:""}])}><Plus size={16}/> Yeni ödeme ekle</button></div><div className="seo-result"><span className="seo-result-kicker">AYLIK TOPLAM</span><div className="seo-big-money"><Money value={toplam}/></div>{sirali.length ? <div className="seo-calendar-list">{sirali.map((item) => <div key={item.id}><b>{item.gun || "—"}</b><span>{item.ad || "Adsız ödeme"}</span><strong><Money value={item.tutar}/></strong></div>)}</div> : <p className="seo-calendar-empty">Bir ödeme eklediğinde takvimin burada oluşacak.</p>}<Disclaimer text="Bu geçici plan yalnızca tarayıcında görünür. Ödeme talimatı oluşturmaz ve bankana veri göndermez."/></div></ToolLayout>;
}

function Schedule({ rows }) {
  const shown = rows.slice(0, 12);
  return <div className="seo-schedule"><div className="seo-table-head"><span>Ay</span><span>Faiz</span><span>Kalan</span></div>{shown.map((row) => <div key={row.ay}><span>{row.ay}</span><span><Money value={row.faiz}/></span><strong><Money value={row.kalan}/></strong></div>)}{rows.length > 12 && <small>İlk 12 ay gösteriliyor.</small>}</div>;
}

function Warning({ reason, required }) {
  const text = reason === "butce-asgariden-dusuk" ? `Aylık bütçe, toplam zorunlu ödemeden düşük. En az ${new Intl.NumberFormat("tr-TR",{style:"currency",currency:"TRY",maximumFractionDigits:0}).format(required || 0)} gir.` : reason === "yetersiz-odeme" ? "Aylık ödeme ilk ayın tahmini faizini karşılamıyor; bu tutarla borç azalmayabilir." : "Hesaplama için sıfırdan büyük ve geçerli tutarlar gir.";
  return <div className="seo-warning">{text}</div>;
}

function Disclaimer({ text = "Sonuçlar yaklaşık planlama içindir; finansal tavsiye değildir. Bankanın uyguladığı oran, vergi, masraf ve yeni işlemler sonucu değiştirebilir." }) {
  return <p className="seo-disclaimer"><ShieldCheck size={16}/>{text}</p>;
}

function SourceNote() {
  return <aside className="seo-sources"><b>Güncel kaynak notu</b><p>Asgari ödeme kuralı için <a href={BDDK_KAYNAK} target="_blank" rel="noreferrer">BDDK kararını</a>; kredi kartı azami faizleri için her ay güncellenen <a href={TCMB_KAYNAK} target="_blank" rel="noreferrer">TCMB tablosunu</a> esas alıyoruz. Son kontrol: 22 Ağustos 2026.</p></aside>;
}

function Faq({ items }) {
  return <section className="seo-faq"><span className="seo-kicker">SIK SORULANLAR</span><h2>Hesaplama hakkında</h2>{items.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</section>;
}

function RehberAna() {
  const schema = useMemo(() => ({ "@context":"https://schema.org", "@type":"CollectionPage", name:"Borcama Rehber", url:`${SITE}/rehber` }), []);
  useSeo({ title:"Borç ve Kredi Kartı Takip Rehberi", description:"Borç düzenleme, kredi kartı takibi, asgari ödeme ve borç kapatma planı hakkında sade ve uygulanabilir içerikler.", path:"/rehber", schema });
  return <Layout><main><Hero kicker="BORCAMA REHBER" title="Borçlarını anlamak için sade anlatımlar." lead="Karmaşık terimler yerine aylık düzen kurmana yardımcı olacak kısa ve uygulanabilir rehberler."/><section className="seo-section seo-shell"><div className="seo-article-grid">{REHBERLER.map((rehber) => <a key={rehber.slug} href={`/rehber/${rehber.slug}`}><BookOpen/><div><h2>{rehber.title}</h2><p>{rehber.description}</p><span>Rehberi oku <ArrowRight size={14}/></span></div></a>)}</div><Cta/></section></main></Layout>;
}

function RehberDetay({ rehber }) {
  const schema = useMemo(() => ({ "@context":"https://schema.org", "@type":"Article", headline:rehber.title, description:rehber.description, mainEntityOfPage:`${SITE}/rehber/${rehber.slug}`, author:{"@type":"Organization",name:"Borcama"}, publisher:{"@type":"Organization",name:"Borcama",logo:{"@type":"ImageObject",url:`${SITE}/borcama-logo.png`}}, datePublished:"2026-08-22", dateModified:"2026-08-22" }), [rehber]);
  useSeo({ title:rehber.title, description:rehber.description, path:`/rehber/${rehber.slug}`, schema });
  return <Layout><main><article className="seo-article seo-shell"><a className="seo-back" href="/rehber">← Tüm rehberler</a><span className="seo-kicker">BORCAMA REHBER</span><h1>{rehber.title}</h1><p className="seo-article-lead">{rehber.intro}</p><div className="seo-article-body">{rehber.sections.map(([title, body]) => <section key={title}><h2>{title}</h2><p>{body}</p></section>)}</div><div className="seo-article-tool"><Calculator/><div><b>Rakamlarını ücretsiz hesapla</b><p>Bu rehberi kendi tutarlarınla uygulanabilir bir plana dönüştür.</p></div><a className="seo-btn" href={`/araclar/${rehber.tool}`}>Aracı aç <ArrowRight size={14}/></a></div><SourceNote/><p className="seo-editorial">Bu içerik genel bilgilendirme amaçlıdır ve finansal tavsiye değildir. Kesin tutarlar için banka ekstreni ve güncel sözleşmeni esas al.</p></article></main></Layout>;
}

function Cta() {
  return <section className="seo-cta"><div><CheckCircle2/><span>Hesaplamak başlangıçtır.</span><h2>Planını her ay Borcama’da takip et.</h2><p>Kartlarını, kredilerini, ekstrelerini ve yaptığın ödemeleri tek yerde gör.</p></div><a className="seo-btn dark" href="/register?plan=free">Ücretsiz hesabını aç <ArrowRight size={15}/></a></section>;
}

function toolSchema(name, path) {
  return { "@context":"https://schema.org", "@type":"WebApplication", name, url:`${SITE}${path}`, applicationCategory:"FinanceApplication", operatingSystem:"Web", offers:{"@type":"Offer",price:"0",priceCurrency:"TRY"} };
}
