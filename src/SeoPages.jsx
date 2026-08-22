import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Calculator,
  CircleDollarSign,
  ListChecks,
  Megaphone,
  Plus,
  Trash2,
  WalletCards,
} from "lucide-react";
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
import "./SeoPages.css";

const SITE = "https://borcama.com";
const BDDK_KAYNAK = "https://www.bddk.org.tr/Duyuru/EkGetir/2074?ekId=862";
const TCMB_KAYNAK = "https://www.tcmb.gov.tr/wps/wcm/connect/TR/TCMB%2BTR/Main%2BMenu/Istatistikler/Bankacilik%2BVerileri/Kredi_Karti_Islemlerinde_Uygulanacak_Azami_Faiz_Oranlari";
const GIB_VERGI_2026 = "https://cdn.gib.gov.tr/api/gibportal-file/file/getFileResources?objectKey=arsiv%2Fyardim-kaynaklar%2Fyararli-bilgiler%2Fgelir-vergisi-tarifeleri%2Fgelir-vergisi-tarifesi-2026.pdf";
const GIB_ASGARI_2026 = "https://cdn.gib.gov.tr/api/gibportal-file/file/getFileResources?objectKey=arsiv%2Fyardim-kaynaklar%2Fyararli-bilgiler%2FAsgariUcrettenYapilanKesintiler.pdf";
const SGK_2026 = "https://www.sgk.gov.tr/Content/Post/2e0c9e1a-2cfe-4456-af10-49d3de0c58ba/Prime-Esas-Kazanc-Miktarlari-2026-01-14-10-35-39";
const KIDEM_2026 = "https://www.csgb.gov.tr/tr/istatistikler/calisma-hayati-istatistikleri/kidem-tazminati-tavan-miktari/";

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
  if (yol === "/araclar/mevduat-faizi-hesaplama") return <MevduatFaizi />;
  if (yol === "/araclar/kredi-odeme-plani-hesaplama") return <KrediOdemePlani />;
  if (yol === "/araclar/brut-net-maas-hesaplama") return <MaasHesaplama />;
  if (yol === "/araclar/kidem-tazminati-hesaplama") return <KidemTazminati />;
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
  return <div className="seo"><header className="seo-nav seo-shell"><a className="seo-logo" href="/" aria-label="Borcama ana sayfa"><img src="/borcama-logo.png" alt="Borcama" /></a><nav><a href="/araclar">Hesaplama Araçları</a><a href="/rehber">Rehber</a><a href="/login">Giriş yap</a><a className="seo-btn small" href="/register?plan=free">Ücretsiz Başla <ArrowRight size={14}/></a></nav></header>{children}<footer className="seo-footer"><div className="seo-shell"><div><a className="seo-footer-logo" href="/"><img src="/borcama-logo.png" alt="Borcama"/></a><p>Kişisel borç, ödeme ve varlık takip aracı.</p></div><div className="seo-footer-links"><a href="/araclar">Ücretsiz Araçlar</a><a href="/rehber">Rehber</a><a href="/privacy">Gizlilik ve KVKK</a><a href="/faq">SSS</a></div></div></footer></div>;
}

function Hero({ title, lead }) {
  return <section className="seo-hero"><div className="seo-shell seo-hero-inner"><div><h1>{title}</h1><p>{lead}</p></div></div></section>;
}

function AraclarAna() {
  const schema = useMemo(() => ({ "@context": "https://schema.org", "@type": "CollectionPage", name: "Borcama Finans Hesaplama Araçları", url: `${SITE}/araclar`, description: "Borç, kredi kartı, mevduat faizi, kredi ödeme planı ve aylık takvim araçları." }), []);
  useSeo({ title: "Finans ve Ödeme Hesaplama Araçları", description: "Borç kapatma, kredi kartı asgari ödeme, mevduat faizi, kredi taksit planı ve aylık ödeme takvimini hesaplayın.", path: "/araclar", schema });
  return <Layout><main><Hero title="Rakamları tek tek değil, birlikte gör." lead="Borçlarını, ödemelerini, kredilerini ve birikimini kolayca hesapla."/><section className="seo-section seo-shell"><div className="seo-card-grid">{ARACLAR.map((arac) => <AracCard key={arac.slug} {...arac}/>)}</div><Cta /></section></main></Layout>;
}

function AracCard({ slug, icon: Icon, title, text }) {
  return <a className="seo-tool-card" href={`/araclar/${slug}`}><span className="seo-icon"><Icon/></span><h2>{title}</h2><p>{text}</p><span className="seo-card-link">Aracı aç <ArrowRight size={15}/></span></a>;
}

function ToolLayout({ title, lead, path, schema, children, faq = [], showSources = true }) {
  useSeo({ title, description: lead, path, schema });
  const bolumler = React.Children.toArray(children);
  return <Layout><main><Hero title={title} lead={lead}/><section className="seo-section seo-shell"><div className="seo-tool-layout">{bolumler[0]}<div className="seo-result-column">{bolumler.slice(1)}<AdSlot/></div></div>{faq.length > 0 && <Faq items={faq}/>} {showSources && <SourceNote/>}<Cta/></section></main></Layout>;
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

function MevduatFaizi() {
  const [anaPara, setAnaPara] = useState("100000");
  const [yillikFaiz, setYillikFaiz] = useState("45");
  const [vadeGunu, setVadeGunu] = useState("32");
  const [stopaj, setStopaj] = useState("15");
  const sonuc = useMemo(() => mevduatFaiziHesapla({ anaPara, yillikFaiz, vadeGunu, stopaj }), [anaPara, yillikFaiz, vadeGunu, stopaj]);
  const schema = useMemo(() => toolSchema("Mevduat Faizi Hesaplama", "/araclar/mevduat-faizi-hesaplama"), []);
  return <ToolLayout title="Mevduat faizi hesaplama" lead="Ana para, bankanın sunduğu yıllık brüt faiz, vade günü ve stopaj oranıyla tahmini net mevduat kazancını hesapla." path="/araclar/mevduat-faizi-hesaplama" schema={schema} showSources={false} faq={[["Hangi faiz oranını girmeliyim?","Bankanın mevduat teklifi veya sözleşmesinde yazan yıllık brüt faiz oranını gir."],["Stopaj oranını nereden bulurum?","Oran vade ve mevduat türüne göre değişebileceği için bankanın ürün detayında bildirilen güncel oranı kullan."]]}><div className="seo-panel"><h2>Mevduat bilgilerini gir</h2><NumberField label="Yatıracağın ana para" value={anaPara} onChange={setAnaPara}/><NumberField label="Yıllık brüt faiz oranı" value={yillikFaiz} onChange={setYillikFaiz} suffix="%" step="0.01" hint="Bankanın sana sunduğu yıllık oranı gir."/><NumberField label="Vade süresi" value={vadeGunu} onChange={setVadeGunu} suffix="Gün" step="1"/><NumberField label="Stopaj oranı" value={stopaj} onChange={setStopaj} suffix="%" step="0.01" hint="Bankanın bu mevduat için bildirdiği güncel oranı gir."/></div><div className="seo-result"><span className="seo-result-kicker">TAHMİNİ NET GETİRİ</span>{sonuc.hesaplandi ? <><div className="seo-big-money"><Money value={sonuc.netFaiz}/></div><Summary items={[["Brüt faiz", <Money value={sonuc.brutFaiz}/>],["Stopaj", <Money value={sonuc.stopajTutari}/>],["Vade sonu toplam", <Money value={sonuc.vadeSonuTutar}/>]]}/></> : <Warning reason="eksik"/>}<Disclaimer text="Hesaplama 365 gün üzerinden yaklaşık sonuç üretir. Kesin getiri ve stopaj için bankanın teklifini esas al."/></div></ToolLayout>;
}

function KrediOdemePlani() {
  const [krediTutari, setKrediTutari] = useState("250000");
  const [aylikFaiz, setAylikFaiz] = useState("3.49");
  const [vadeAy, setVadeAy] = useState("12");
  const sonuc = useMemo(() => krediOdemePlaniHesapla({ krediTutari, aylikFaiz, vadeAy }), [krediTutari, aylikFaiz, vadeAy]);
  const schema = useMemo(() => toolSchema("Kredi Ödeme Planı Hesaplama", "/araclar/kredi-odeme-plani-hesaplama"), []);
  return <ToolLayout title="Kredi ödeme planı hesaplama" lead="Kredi tutarı, bankanın aylık faiz oranı ve vadeye göre tahmini taksiti, toplam faizi ve aylık ödeme planını gör." path="/araclar/kredi-odeme-plani-hesaplama" schema={schema} showSources={false} faq={[["Aylık mı yıllık mı faiz girmeliyim?","Bankanın kredi teklifinde yazan aylık faiz oranını gir."],["Masraflar dahil mi?","Hayır. Tahsis ücreti, sigorta, vergi ve bankaya özgü diğer masraflar bu temel hesaplamaya dahil değildir."]]}><div className="seo-panel"><h2>Kredi bilgilerini gir</h2><NumberField label="Kullanacağın kredi tutarı" value={krediTutari} onChange={setKrediTutari}/><NumberField label="Aylık faiz oranı" value={aylikFaiz} onChange={setAylikFaiz} suffix="%" step="0.01" hint="Bankanın teklifinde yazan aylık oranı gir."/><NumberField label="Vade süresi" value={vadeAy} onChange={setVadeAy} suffix="Ay" step="1"/></div><div className="seo-result"><span className="seo-result-kicker">TAHMİNİ KREDİ PLANI</span>{sonuc.hesaplandi ? <><div className="seo-big-money"><Money value={sonuc.aylikTaksit}/></div><Summary items={[["Aylık taksit", <Money value={sonuc.aylikTaksit}/>],["Toplam faiz", <Money value={sonuc.toplamFaiz}/>],["Toplam ödeme", <Money value={sonuc.toplamOdeme}/>]]}/><KrediSchedule rows={sonuc.takvim}/></> : <Warning reason="eksik"/>}<Disclaimer text="Bu sonuç yaklaşık planlama içindir. Vergi, tahsis ücreti, sigorta ve bankanın diğer masrafları dahil değildir."/></div></ToolLayout>;
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
  return <ToolLayout title="Brütten nete, netten brüte maaş hesaplama" lead="2026 yılı çalışan kesintilerine göre brüt maaştan net maaşı veya net maaştan tahmini brüt maaşı hesapla." path="/araclar/brut-net-maas-hesaplama" schema={schema} showSources={false} faq={[["Brüt maaş nedir?","Vergi ve çalışan kesintileri yapılmadan önceki toplam maaştır."],["Net maaş nedir?","Kesintilerden sonra çalışanın eline geçen maaştır."],["Ay seçimi neden gerekli?","Maaştan yapılan vergi kesintisi yıl içinde değişebildiği için hesaplamak istediğin ayı seçmelisin."],["Hesap kesin bordro tutarı mıdır?","Hayır. Ek ödeme, özel indirim, eksik gün ve işyerine göre değişen uygulamalar sonucu etkileyebilir."]]}><div className="seo-panel"><h2>Maaş bilgilerini gir</h2><span className="seo-strategy-label">Hesaplama yönü</span><div className="seo-toggle"><button className={yon === "brut-net" ? "active" : ""} onClick={() => setYon("brut-net")}>Brütten nete</button><button className={yon === "net-brut" ? "active" : ""} onClick={() => setYon("net-brut")}>Netten brüte</button></div><NumberField label={yon === "brut-net" ? "Aylık brüt maaş" : "Hedef aylık net maaş"} value={tutar} onChange={setTutar}/><NumberField label="Hesaplamak istediğin ay" value={ay} onChange={setAy} suffix="Ay" step="1" min="1" hint="Ocak için 1, Aralık için 12 yaz."/><p className="seo-inline-note">2026 yılı için, aynı maaşı yılbaşından beri aldığın varsayılır.</p></div><div className="seo-result"><span className="seo-result-kicker">{sonucBasligi}</span>{sonuc.hesaplandi ? <><div className="seo-big-money"><Money value={sonucTutari}/></div><Summary items={[["Brüt maaş", <Money value={sonuc.brut}/>],["SGK ve işsizlik", <Money value={sonuc.sgk + sonuc.issizlik}/>],["Vergiler", <Money value={sonuc.gelirVergisi + sonuc.damgaVergisi}/>]]}/><MaasYillikSchedule rows={yillikSonuclar}/></> : <Warning reason="eksik"/>}<Disclaimer text="Bu sonuç tahminidir. Kesin tutar için işvereninin hazırladığı maaş belgesini esas al."/></div><OfficialSources><a href={GIB_VERGI_2026} target="_blank" rel="noreferrer">2026 vergi dilimleri</a><a href={GIB_ASGARI_2026} target="_blank" rel="noreferrer">2026 asgari ücret hesabı</a><a href={SGK_2026} target="_blank" rel="noreferrer">2026 SGK sınırları</a></OfficialSources></ToolLayout>;
}

function KidemTazminati() {
  const [brutMaas, setBrutMaas] = useState("60000");
  const [ekOdemeler, setEkOdemeler] = useState("0");
  const [yil, setYil] = useState("5");
  const [ay, setAy] = useState("0");
  const [gun, setGun] = useState("0");
  const sonuc = useMemo(() => kidemTazminatiHesapla2026({ brutMaas, aylikEkOdemeler: ekOdemeler, yil, ay, gun }), [brutMaas, ekOdemeler, yil, ay, gun]);
  const schema = useMemo(() => toolSchema("Kıdem Tazminatı Hesaplama 2026", "/araclar/kidem-tazminati-hesaplama"), []);
  return <ToolLayout title="Kıdem tazminatı hesaplama" lead="Aylık brüt maaşın, düzenli ek ödemelerin ve çalışma sürene göre 2026 yılı için tahmini kıdem tazminatını hesapla." path="/araclar/kidem-tazminati-hesaplama" schema={schema} showSources={false} faq={[["Düzenli ek ödemelere ne yazmalıyım?","Her ay düzenli aldığın yemek, yol veya benzeri para ödemelerinin aylık toplamını yaz."],["Kıdem tazminatı tavanı nedir?","Hesaplamada her çalışma yılı için kullanılabilecek aylık tutarın üst sınırıdır. 1 Temmuz–31 Aralık 2026 için 73.729,87 TL kullanılır."],["Kimler kıdem tazminatı alabilir?","Hak kazanma durumu işten ayrılma nedenine ve çalışma koşullarına göre değişir; bu araç yalnızca tutar tahmini yapar."]]}><div className="seo-panel"><h2>Çalışma bilgilerini gir</h2><NumberField label="Aylık brüt maaş" value={brutMaas} onChange={setBrutMaas}/><NumberField label="Düzenli aylık ek ödemeler" value={ekOdemeler} onChange={setEkOdemeler} hint="Her ay düzenli aldığın yemek, yol veya benzeri para ödemeleri."/><div className="seo-duration-fields"><NumberField label="Tam yıl" value={yil} onChange={setYil} suffix="Yıl" step="1"/><NumberField label="Ek ay" value={ay} onChange={setAy} suffix="Ay" step="1"/><NumberField label="Ek gün" value={gun} onChange={setGun} suffix="Gün" step="1"/></div><p className="seo-inline-note">1 Temmuz–31 Aralık 2026 için geçerli 73.729,87 TL yıllık tavan kullanılır.</p></div><div className="seo-result"><span className="seo-result-kicker">Tahmini net kıdem tazminatı</span>{sonuc.hesaplandi ? <><div className="seo-big-money"><Money value={sonuc.netTazminat}/></div><Summary items={[["Hesaba alınan aylık", <Money value={sonuc.hesaplamayaEsasAylik}/>],["Brüt tazminat", <Money value={sonuc.brutTazminat}/>],["Damga vergisi", <Money value={sonuc.damgaVergisi}/>]]}/></> : <Warning reason="eksik"/>}<Disclaimer text="Bu araç hak kazanıp kazanmadığını belirlemez; yalnızca verdiğin bilgilere göre tahmini tutarı gösterir."/></div><OfficialSources><a href={KIDEM_2026} target="_blank" rel="noreferrer">Çalışma Bakanlığı kıdem tazminatı tavanı</a></OfficialSources></ToolLayout>;
}

function BorcPlani() {
  const [butce, setButce] = useState("18000");
  const [strateji, setStrateji] = useState("faiz");
  const [borclar, setBorclar] = useState([{ id: "1", ad: "", kalan: "", faiz: "", asgari: "" }]);
  const sonuc = useMemo(() => borcPlaniHesapla({ borclar, aylikButce: butce, strateji }), [borclar, butce, strateji]);
  const guncelle = (id, alan, deger) => setBorclar((liste) => liste.map((item) => item.id === id ? { ...item, [alan]: deger } : item));
  const ekle = () => setBorclar((liste) => [...liste, { id: crypto.randomUUID(), ad: "", kalan: "", faiz: "", asgari: "" }]);
  const schema = useMemo(() => toolSchema("Borç Ödeme Planı Oluşturucu", "/araclar/borc-odeme-plani"), []);
  return <ToolLayout title="Borç ödeme planı oluşturucu" lead="Borçlarını, aylık maliyetlerini ve zorunlu ödemelerini ekle; faiz veya kartopu sırasıyla tahmini planını gör." path="/araclar/borc-odeme-plani" schema={schema} faq={[["Faiz yöntemi nedir?","Aylık oranı en yüksek borca ek ödeme ayırır."],["Kartopu yöntemi nedir?","Bakiyesi en küçük borca ek ödeme ayırarak erken tamamlanan kalemler oluşturur."]]}><div className="seo-panel seo-wide-form"><h2>Plan bilgileri</h2><NumberField label="Toplam aylık ödeme bütçesi" value={butce} onChange={setButce}/><span className="seo-strategy-label">Ödeme önceliği</span><div className="seo-toggle"><button className={strateji === "faiz" ? "active" : ""} onClick={() => setStrateji("faiz")}>En yüksek faiz</button><button className={strateji === "kar" ? "active" : ""} onClick={() => setStrateji("kar")}>En küçük bakiye</button></div><p className="seo-form-help">Her borç için güncel kalan tutarı, aylık faiz oranını ve zorunlu asgari ödemeyi gir.</p><div className="seo-plan-head"><span>Borç adı</span><span>Kalan borç</span><span>Aylık faiz</span><span>Asgari ödeme</span><span/></div><div className="seo-debts seo-plan-debts">{borclar.map((item) => <div className="seo-debt-row" key={item.id}><label className="seo-debt-field"><span>Borç adı</span><input aria-label="Borç adı" value={item.ad} onChange={(event) => guncelle(item.id,"ad",event.target.value)} placeholder="Örn. Kredi kartı"/></label><label className="seo-debt-field"><span>Kalan borç</span><div className="seo-calendar-input"><input aria-label={`${item.ad || "Borç"} kalan borç`} type="number" min="0" value={item.kalan} onChange={(event) => guncelle(item.id,"kalan",event.target.value)} placeholder="Örn. 70.000"/><b>TL</b></div></label><label className="seo-debt-field"><span>Aylık faiz</span><div className="seo-calendar-input"><input aria-label={`${item.ad || "Borç"} aylık faiz`} type="number" min="0" step="0.01" value={item.faiz} onChange={(event) => guncelle(item.id,"faiz",event.target.value)} placeholder="Örn. 3,75"/><b>%</b></div></label><label className="seo-debt-field"><span>Asgari ödeme</span><div className="seo-calendar-input"><input aria-label={`${item.ad || "Borç"} asgari ödeme`} type="number" min="0" value={item.asgari} onChange={(event) => guncelle(item.id,"asgari",event.target.value)} placeholder="Örn. 7.000"/><b>TL</b></div></label><button aria-label={`${item.ad || "Borç"} satırını sil`} title="Borcu sil" onClick={() => setBorclar((liste) => liste.filter((borc) => borc.id !== item.id))}><Trash2 size={16}/></button></div>)}</div><button className="seo-add" onClick={ekle}><Plus size={16}/> Yeni borç ekle</button></div><div className="seo-result"><span className="seo-result-kicker">TAHMİNİ PLAN</span>{sonuc.tamamlandi ? <><Summary items={[["Kapanış süresi", `${sonuc.ay} ay`],["Tahmini toplam faiz", <Money value={sonuc.toplamFaiz}/>],["Aylık bütçe", <Money value={butce}/>]]}/><Schedule rows={sonuc.takvim}/></> : <Warning reason={sonuc.neden} required={sonuc.gerekliAsgari}/>}<Disclaimer/></div></ToolLayout>;
}

function OdemeTakvimi() {
  const [odemeler, setOdemeler] = useState([{ id: "1", ad: "", gun: "", tutar: "" }]);
  const toplam = odemeler.reduce((sum, item) => sum + (Number(item.tutar) || 0), 0);
  const sirali = odemeler.filter((item) => item.ad || item.gun || item.tutar).sort((a, b) => Number(a.gun) - Number(b.gun));
  const guncelle = (id, alan, deger) => setOdemeler((liste) => liste.map((item) => item.id === id ? { ...item, [alan]: deger } : item));
  const schema = useMemo(() => toolSchema("Aylık Ödeme Takvimi", "/araclar/aylik-odeme-takvimi"), []);
  return <ToolLayout title="Aylık ödeme takvimi" lead="Bu ay ödeyeceğin kart, kredi ve diğer borçları günlerine göre sırala; toplam aylık yükünü gör." path="/araclar/aylik-odeme-takvimi" schema={schema} faq={[["Bilgilerim kaydediliyor mu?","Hayır. Yazdığın bilgiler yalnızca bu hesaplama sırasında kullanılır."],["Kalıcı takip nasıl yapılır?","Ücretsiz Borcama hesabında dönemleri ve gerçekleşen ödemeleri kaydedebilirsin."]]}><div className="seo-panel seo-wide-form"><h2>Bu ayın ödemeleri</h2><p className="seo-form-help">Her satıra ödemenin adını, ayın kaçıncı günü ödeneceğini ve bu ay ödeyeceğin tutarı yaz.</p><div className="seo-debt-head"><span>Ödeme adı</span><span>Son ödeme günü</span><span>Bu ay ödenecek tutar</span><span/></div><div className="seo-debts calendar">{odemeler.map((item) => <div className="seo-debt-row" key={item.id}><label className="seo-calendar-field"><span>Ödeme adı</span><input aria-label="Ödeme adı" value={item.ad} onChange={(event) => guncelle(item.id,"ad",event.target.value)} placeholder="Örn. Kredi kartı"/></label><label className="seo-calendar-field"><span>Son ödeme günü</span><div className="seo-calendar-input"><input aria-label={`${item.ad || "Ödeme"} son ödeme günü`} type="number" min="1" max="31" value={item.gun} onChange={(event) => guncelle(item.id,"gun",event.target.value)} placeholder="Örn. 10"/><b>Gün</b></div></label><label className="seo-calendar-field"><span>Bu ay ödenecek tutar</span><div className="seo-calendar-input"><input aria-label={`${item.ad || "Ödeme"} bu ay ödenecek tutarı`} type="number" min="0" value={item.tutar} onChange={(event) => guncelle(item.id,"tutar",event.target.value)} placeholder="Örn. 7.500"/><b>TL</b></div></label><button aria-label={`${item.ad || "Ödeme"} satırını sil`} title="Ödemeyi sil" onClick={() => setOdemeler((liste) => liste.filter((odeme) => odeme.id !== item.id))}><Trash2 size={16}/></button></div>)}</div><button className="seo-add" onClick={() => setOdemeler((liste) => [...liste,{id:crypto.randomUUID(),ad:"",gun:"",tutar:""}])}><Plus size={16}/> Yeni ödeme ekle</button></div><div className="seo-result"><span className="seo-result-kicker">AYLIK TOPLAM</span><div className="seo-big-money"><Money value={toplam}/></div>{sirali.length ? <div className="seo-calendar-list">{sirali.map((item) => <div key={item.id}><b>{item.gun || "—"}</b><span>{item.ad || "Adsız ödeme"}</span><strong><Money value={item.tutar}/></strong></div>)}</div> : <p className="seo-calendar-empty">Bir ödeme eklediğinde takvimin burada oluşacak.</p>}<Disclaimer text="Bu geçici plan kaydedilmez ve ödeme talimatı oluşturmaz."/></div></ToolLayout>;
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
  const text = reason === "butce-asgariden-dusuk" ? `Aylık bütçe, toplam zorunlu ödemeden düşük. En az ${new Intl.NumberFormat("tr-TR",{style:"currency",currency:"TRY",maximumFractionDigits:0}).format(required || 0)} gir.` : reason === "yetersiz-odeme" ? "Aylık ödeme ilk ayın tahmini faizini karşılamıyor; bu tutarla borç azalmayabilir." : "Hesaplama için sıfırdan büyük ve geçerli tutarlar gir.";
  return <div className="seo-warning">{text}</div>;
}

function Disclaimer({ text = "Sonuçlar yaklaşık planlama içindir; finansal tavsiye değildir. Bankanın uyguladığı oran, vergi, masraf ve yeni işlemler sonucu değiştirebilir." }) {
  return <p className="seo-disclaimer">{text}</p>;
}

function SourceNote() {
  return <aside className="seo-sources"><b>Güncel kaynak notu</b><p>Asgari ödeme kuralı için <a href={BDDK_KAYNAK} target="_blank" rel="noreferrer">BDDK kararını</a>; kredi kartı azami faizleri için her ay güncellenen <a href={TCMB_KAYNAK} target="_blank" rel="noreferrer">TCMB tablosunu</a> esas alıyoruz. Son kontrol: 22 Ağustos 2026.</p></aside>;
}

function OfficialSources({ children }) {
  return <aside className="seo-official-sources"><b>Resmî bilgiler</b><div>{children}</div></aside>;
}

function AdSlot() {
  return <aside className="seo-ad-slot"><span className="seo-ad-icon"><Megaphone size={27}/></span><div><h2>Markanızı burada tanıtın.</h2><p>Borcama ziyaretçilerine ulaşmak için bu alanda reklam verebilirsiniz.</p></div><a href="mailto:zero@borcama.com?subject=Borcama%20reklam%20alan%C4%B1">zero@borcama.com</a></aside>;
}

function Faq({ items }) {
  return <section className="seo-faq"><h2>Hesaplama hakkında</h2>{items.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</section>;
}

function RehberAna() {
  const schema = useMemo(() => ({ "@context":"https://schema.org", "@type":"CollectionPage", name:"Borcama Rehber", url:`${SITE}/rehber` }), []);
  useSeo({ title:"Borç ve Kredi Kartı Takip Rehberi", description:"Borç düzenleme, kredi kartı takibi, asgari ödeme ve borç kapatma planı hakkında sade ve uygulanabilir içerikler.", path:"/rehber", schema });
  return <Layout><main><Hero title="Borçlarını anlamak için sade anlatımlar." lead="Karmaşık terimler yerine aylık düzen kurmana yardımcı olacak kısa ve uygulanabilir rehberler."/><section className="seo-section seo-shell"><div className="seo-article-grid">{REHBERLER.map((rehber) => <a key={rehber.slug} href={`/rehber/${rehber.slug}`}><BookOpen/><div><h2>{rehber.title}</h2><p>{rehber.description}</p><span>Rehberi oku <ArrowRight size={14}/></span></div></a>)}</div><Cta/></section></main></Layout>;
}

function RehberDetay({ rehber }) {
  const schema = useMemo(() => ({ "@context":"https://schema.org", "@type":"Article", headline:rehber.title, description:rehber.description, mainEntityOfPage:`${SITE}/rehber/${rehber.slug}`, author:{"@type":"Organization",name:"Borcama"}, publisher:{"@type":"Organization",name:"Borcama",logo:{"@type":"ImageObject",url:`${SITE}/borcama-logo.png`}}, datePublished:"2026-08-22", dateModified:"2026-08-22" }), [rehber]);
  useSeo({ title:rehber.title, description:rehber.description, path:`/rehber/${rehber.slug}`, schema });
  return <Layout><main><article className="seo-article seo-shell"><a className="seo-back" href="/rehber">← Tüm rehberler</a><h1>{rehber.title}</h1><p className="seo-article-lead">{rehber.intro}</p><div className="seo-article-body">{rehber.sections.map(([title, body]) => <section key={title}><h2>{title}</h2><p>{body}</p></section>)}</div><div className="seo-article-tool"><Calculator/><div><b>Rakamlarını ücretsiz hesapla</b><p>Bu rehberi kendi tutarlarınla uygulanabilir bir plana dönüştür.</p></div><a className="seo-btn" href={`/araclar/${rehber.tool}`}>Aracı aç <ArrowRight size={14}/></a></div><SourceNote/><p className="seo-editorial">Bu içerik genel bilgilendirme amaçlıdır ve finansal tavsiye değildir. Kesin tutarlar için banka ekstreni ve güncel sözleşmeni esas al.</p></article></main></Layout>;
}

function Cta() {
  return <section className="seo-cta"><div><h2>Planını her ay Borcama’da takip et.</h2><p>Kartlarını, kredilerini, ekstrelerini ve yaptığın ödemeleri tek yerde gör.</p></div><a className="seo-btn dark" href="/register?plan=free">Ücretsiz hesabını aç <ArrowRight size={15}/></a></section>;
}

function toolSchema(name, path) {
  return { "@context":"https://schema.org", "@type":"WebApplication", name, url:`${SITE}${path}`, applicationCategory:"FinanceApplication", operatingSystem:"Web", offers:{"@type":"Offer",price:"0",priceCurrency:"TRY"} };
}
