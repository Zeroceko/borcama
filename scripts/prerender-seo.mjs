import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { FINANSAL_SOZLUK } from "../src/financialGlossary.js";
import { REHBER_KAYNAKLARI, REHBERLER, guncellemeTarihiMetni, rehberBul } from "../src/seoRehberler.js";

const SITE = "https://borcama.com";
const DIST = join(process.cwd(), "dist");

const tools = [
  ["borc-kapatma-hesaplayici", "Borç Kapatma Hesaplayıcı", "Aylık ödeme ve faiz oranına göre borcunun tahmini kapanış süresini, toplam faizini ve ödeme planını hesapla."],
  ["kredi-karti-asgari-odeme-hesaplayici", "Kredi Kartı Asgari Ödeme Hesaplayıcı", "Kart limiti ve dönem borcuna göre 2026 kurallarıyla tahmini asgari ödeme tutarını hesapla."],
  ["borc-odeme-plani", "Borç Ödeme Planı Oluşturucu", "Birden fazla borcu faiz veya küçük bakiye önceliğiyle tek ödeme planında sırala."],
  ["aylik-odeme-takvimi", "Aylık Ödeme Takvimi", "Kredi kartı, kredi ve diğer ödemelerini tarihlerine göre sırala; aylık toplamını gör."],
  ["mevduat-faizi-hesaplama", "Mevduat Faizi Hesaplama 2026 | Net Getiri", "Ana para, yıllık brüt faiz, vade günü ve stopaj oranıyla mevduatın brüt faizini, net getirisini ve vade sonu toplamını hesapla."],
  ["kredi-odeme-plani-hesaplama", "Kredi Taksit ve Ödeme Planı Hesaplama", "Borcama kredi sunmaz veya aracılık yapmaz; mevcut kredi teklifindeki tutar, aylık faiz ve vadeyle tahmini ödeme planını hesaplar."],
  ["brut-net-maas-hesaplama", "Brütten Nete, Netten Brüte Maaş Hesaplama 2026", "2026 vergi ve çalışan kesintilerine göre brüt maaştan net maaşı veya net maaştan brüt maaşı hesapla."],
  ["kidem-tazminati-hesaplama", "Kıdem Tazminatı Hesaplama 2026", "2026 kıdem tazminatı tavanına göre maaş ve çalışma sürenle tahmini net kıdem tazminatını hesapla."],
];

// Rehberler SPA ile aynı veri kaynağından gelir; başlık, bölüm, SSS ve kaynaklar JavaScript'siz HTML'de de okunur.
const guides = REHBERLER.map((rehber) => [rehber.slug, rehber.title, rehber.description]);

const toolLinks = tools.map(([slug, title]) => [`/araclar/${slug}`, title]);
const guideLinks = guides.map(([slug, title]) => [`/rehber/${slug}`, title]);
const glossaryLinks = FINANSAL_SOZLUK.map((terim) => [`/finansal-sozluk/${terim.slug}`, terim.title]);
const cardDebtGuides = ["kredi-karti-faiz-oranlari-2026", "kredi-karti-borcu-yapilandirma", "kredi-karti-borcu-odenmezse-ne-olur"].map((slug) => [`/rehber/${slug}`, rehberBul(slug).title]);
const guideByTool = {
  "borc-kapatma-hesaplayici": [["/rehber/borc-kapatma-plani-nasil-hazirlanir", "Borç kapatma planı nasıl hazırlanır?"], ...cardDebtGuides],
  "kredi-karti-asgari-odeme-hesaplayici": [["/rehber/asgari-odeme-borcu-nasil-etkiler", "Asgari ödeme yapmak borcu nasıl etkiler?"], ...cardDebtGuides],
  "borc-odeme-plani": [cardDebtGuides[1], cardDebtGuides[2], ["/rehber/borc-kapatma-plani-nasil-hazirlanir", "Borç kapatma planı nasıl hazırlanır?"]],
  "brut-net-maas-hesaplama": [["/rehber/2026-brut-net-maas-nasil-hesaplanir", "2026 brütten nete maaş rehberi"]],
  "kidem-tazminati-hesaplama": [["/rehber/2026-kidem-tazminati-nasil-hesaplanir", "2026 kıdem tazminatı rehberi"]],
  "mevduat-faizi-hesaplama": [
    ["/?from=mevduat", "Borcama'da borç, gelir, gider ve varlıklarını birlikte gör"],
    ["/rehber/mevduat-faizi-net-getiri-nasil-hesaplanir", "Mevduat faizi net getiri rehberi"],
    ["/rehber/32-gunluk-mevduat-faizi-nasil-hesaplanir", "32 günlük mevduat faizi rehberi"],
    ["/rehber/100-bin-tl-mevduat-getirisi-nasil-hesaplanir", "100 bin TL mevduat getirisi rehberi"],
  ],
};
const staticSections = {
  "/araclar/borc-kapatma-hesaplayici": [
    ["Borç kapatma süresi nasıl hesaplanır?", "Hesaplama, kalan borca her ay girdiğin faiz oranını uygular ve belirlediğin aylık ödemeyi bakiyeden düşer. Aylık ödeme ilk ayın faizini karşılamıyorsa borç bu varsayımla kapanmaz."],
    ["Sonucu nasıl kullanmalısın?", "Tahmini kapanış süresini ve toplam ödemeyi bir başlangıç planı olarak kullan. Yeni harcama, faiz oranı veya ayırabildiğin ödeme değiştiğinde hesabı güncel rakamlarla yeniden yap."],
  ],
  "/araclar/mevduat-faizi-hesaplama": [
    ["Mevduat faizi nasıl hesaplanır?", "Brüt faiz; ana para, bankanın verdiği yıllık faiz oranı ve vade günü kullanılarak hesaplanır. Net getiri için brüt faizden stopaj tutarı çıkarılır."],
    ["32 günlük mevduat getirisi", "Vade süresini 32 gün seçerek bankanın teklifindeki yıllık brüt oran ve stopajla tahmini net kazancı görebilirsin."],
    ["Tek hesaplamadan bütün finansal tabloya", "Mevduat getirini borçların, gelirlerin, harcamaların ve diğer varlıklarınla aynı yerde takip ederek bu ayki durumunu daha kolay görebilirsin. Borcama'nın Ücretsiz paketi kalıcıdır ve kart bilgisi istemez."],
  ],
};
const pages = [
  { path: "/araclar", title: "Finans ve Ödeme Hesaplama Araçları", description: "Borç, kredi kartı, mevduat, kredi taksiti, maaş ve kıdem tazminatı için ücretsiz hesaplama araçları.", links: toolLinks, type: "CollectionPage" },
  ...tools.map(([slug, title, description]) => ({ path: `/araclar/${slug}`, title, description, sections: staticSections[`/araclar/${slug}`] || [], links: [...(guideByTool[slug] || []), ...toolLinks.filter(([path]) => path !== `/araclar/${slug}`)], type: "WebApplication" })),
  { path: "/rehber", title: "Borç ve Ödeme Rehberi", description: "Borç düzenleme, kredi kartı takibi ve borç kapatma planı hakkında sade ve uygulanabilir rehberler.", links: guideLinks, type: "CollectionPage" },
  ...REHBERLER.map((rehber) => ({
    path: `/rehber/${rehber.slug}`,
    title: rehber.title,
    heading: rehber.h1,
    description: rehber.description,
    updated: rehber.guncellendi,
    published: rehber.published,
    lead: rehber.intro,
    sections: [...rehber.sections, ...(rehber.sss || [])],
    faq: rehber.sss || [],
    sources: (REHBER_KAYNAKLARI[rehber.slug] || []).map(([url, label]) => [label, url]),
    links: [
      [`/araclar/${rehber.tool}`, tools.find(([slug]) => slug === rehber.tool)[1]],
      ...(rehber.araclar || []).map((slug) => [`/araclar/${slug}`, tools.find(([aracSlug]) => aracSlug === slug)[1]]),
      ...(rehber.ilgiliRehberler || []).map((slug) => [`/rehber/${slug}`, rehberBul(slug).title]),
      ...(rehber.terimler || []).map((slug) => FINANSAL_SOZLUK.find((terim) => terim.slug === slug)).map((terim) => [`/finansal-sozluk/${terim.slug}`, terim.title]),
      ["/register?plan=free", "Borcama'da ücretsiz borç planını oluştur"],
    ],
    type: "Article",
  })),
  { path: "/finansal-sozluk", title: "Finansal Sözlük", description: "Faiz, temerrüt, kredi kartı ekstresi, kalan anapara, nakit akışı ve borç yönetimi terimlerini sade örneklerle öğrenin.", links: glossaryLinks, type: "CollectionPage" },
  ...FINANSAL_SOZLUK.map((terim) => ({
    path: `/finansal-sozluk/${terim.slug}`,
    title: terim.seoTitle || `${terim.title} Nedir?`,
    heading: terim.h1,
    description: terim.seoDescription || `${terim.definition} Sade açıklama, örnek ve Borcama'daki karşılığını görün.`,
    sections: [...(terim.borcKoprusu ? [[terim.borcKoprusu.baslik, terim.borcKoprusu.aciklama]] : []), ["Kısaca nasıl çalışır?", terim.detail], ["Basit örnek", terim.example], ...(terim.ekBolumler || []), ["Borcama'da ne anlama gelir?", terim.borcama], ...(terim.sss || [])],
    faq: terim.sss || [],
    sources: terim.kaynaklar || [],
    links: [
      ...(terim.rehberler || []).map((slug) => [`/rehber/${slug}`, rehberBul(slug).title]),
      ...(terim.borcKoprusu?.araclar || []).map((slug) => [`/araclar/${slug}`, tools.find(([aracSlug]) => aracSlug === slug)[1]]),
      ...terim.related.map((slug) => FINANSAL_SOZLUK.find((item) => item.slug === slug)).filter(Boolean).map((item) => [`/finansal-sozluk/${item.slug}`, item.title]),
    ],
    type: "Article",
    term: terim,
  })),
  {
    path: "/faq",
    title: "Borcama Sık Sorulan Sorular",
    description: "Borcama'nın kullanımı, ücretsiz ve Pro paketleri, iptal, iade ve veri güvenliği hakkında sık sorulan soruların yanıtları.",
    sections: [
      ["Borcama ne yapar?", "Borçlarını, ödemelerini, gelir ve harcamalarını ve varlıklarını tek yerde takip etmene yardımcı olur."],
      ["Banka hesaplarım otomatik bağlanır mı?", "Hayır. Bilgileri sen girersin; Borcama internet bankacılığı parolanı istemez."],
      ["Ücretsiz paket ile Pro arasındaki fark nedir?", "Ücretsiz paket temel takibi ve aylık bir kişisel öneriyi içerir. Pro, daha ayrıntılı analiz ve senaryolar sunar."],
    ],
    links: [["/", "Borcama ana sayfa"], ["/araclar", "Hesaplama Araçları"], ["/rehber", "Borç ve Ödeme Rehberi"], ["/refund-policy", "İade Politikası"], ["/privacy", "Gizlilik ve KVKK"]],
    type: "FAQPage",
  },
];

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function staticBody(page) {
  const links = page.links.map(([path, label]) => `<li><a href="${path}">${escapeHtml(label)}</a></li>`).join("");
  const sections = (page.sections || []).map(([title, body]) => `<section><h2>${escapeHtml(title)}</h2><p>${escapeHtml(body)}</p></section>`).join("");
  return `<div id="root"><main class="seo-prerender"><a href="/">Borcama</a><h1>${escapeHtml(page.heading || page.title)}</h1>${page.updated ? `<p>Son güncelleme: <time datetime="${page.updated}">${guncellemeTarihiMetni(page.updated)}</time></p>` : ""}<p>${escapeHtml(page.description)}</p>${page.lead ? `<p>${escapeHtml(page.lead)}</p>` : ""}${sections}${(page.sources || []).length ? `<section><h2>Kaynaklar</h2><ul>${page.sources.map(([label, url]) => `<li><a href="${url}" rel="noreferrer">${escapeHtml(label)}</a></li>`).join("")}</ul></section>` : ""}<nav aria-label="İlgili sayfalar"><h2>İlgili hesaplama ve rehberler</h2><ul>${links}</ul></nav></main></div>`;
}

const baseHtml = await readFile(join(DIST, "index.html"), "utf8");
for (const page of pages) {
  const canonical = `${SITE}${page.path}`;
  const fullTitle = `${page.title} | Borcama`;
  const parentPath = page.path.startsWith("/araclar") ? "/araclar" : page.path.startsWith("/rehber") ? "/rehber" : page.path.startsWith("/finansal-sozluk") ? "/finansal-sozluk" : page.path;
  const parentName = parentPath === "/araclar" ? "Hesaplama Araçları" : parentPath === "/rehber" ? "Rehber" : parentPath === "/finansal-sozluk" ? "Finansal Sözlük" : page.title;
  const breadcrumbItems = [
    { "@type": "ListItem", position: 1, name: "Borcama", item: SITE },
    { "@type": "ListItem", position: 2, name: parentName, item: `${SITE}${parentPath}` },
  ];
  if (page.path !== parentPath) breadcrumbItems.push({ "@type": "ListItem", position: 3, name: page.title, item: canonical });
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": page.type,
        name: page.title,
        headline: page.type === "Article" ? page.title : undefined,
        datePublished: page.published,
        dateModified: page.updated || page.published,
        description: page.description,
        url: canonical,
        applicationCategory: page.type === "WebApplication" ? "FinanceApplication" : undefined,
        operatingSystem: page.type === "WebApplication" ? "Web" : undefined,
        offers: page.type === "WebApplication" ? { "@type": "Offer", price: "0", priceCurrency: "TRY" } : undefined,
        mainEntity: page.term ? { "@type": "DefinedTerm", name: page.term.title, description: page.term.definition, inDefinedTermSet: `${SITE}/finansal-sozluk` } : undefined,
      },
      { "@type": "BreadcrumbList", itemListElement: breadcrumbItems },
      ...((page.faq || []).length ? [{ "@type": "FAQPage", mainEntity: page.faq.map(([soru, cevap]) => ({ "@type": "Question", name: soru, acceptedAnswer: { "@type": "Answer", text: cevap } })) }] : []),
    ],
  };
  let html = baseHtml
    .replace(/<title>.*?<\/title>/s, `<title>${escapeHtml(fullTitle)}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${escapeHtml(page.description)}" />`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${canonical}" />`)
    .replace(/\s*<meta property="og:(title|description|url|type)" content="[^"]*" \/>/g, "")
    .replace("</head>", `<meta property="og:title" content="${escapeHtml(page.title)}" />\n    <meta property="og:description" content="${escapeHtml(page.description)}" />\n    <meta property="og:url" content="${canonical}" />\n    <meta property="og:type" content="${page.type === "Article" ? "article" : "website"}" />\n    <script type="application/ld+json">${JSON.stringify(schema).replaceAll("</", "<\\/")}</script>\n    <style>.seo-prerender{max-width:960px;margin:auto;padding:72px 24px;font-family:system-ui,sans-serif;color:#14160f}.seo-prerender>a{font-weight:800}.seo-prerender h1{max-width:800px;font-size:48px;line-height:1.05}.seo-prerender p{max-width:720px;font-size:18px;line-height:1.65}.seo-prerender nav{margin-top:48px}.seo-prerender li{margin:10px 0}</style>\n  </head>`)
    .replace(/<div id="root">[\s\S]*?<\/div><!--\/root-->/, `${staticBody(page)}<!--/root-->`)
    .replace(/\s*<script type="application\/ld\+json">\{"@context":"https:\/\/schema\.org","@type":"WebApplication","name":"Borcama"[\s\S]*?<\/script>/, "");
  const output = join(DIST, `${page.path}.html`);
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, html);
}

const glossarySitemap = [
  `<url><loc>${SITE}/finansal-sozluk</loc><lastmod>2026-09-23</lastmod><priority>0.8</priority></url>`,
  ...FINANSAL_SOZLUK.map((terim) => `<url><loc>${SITE}/finansal-sozluk/${terim.slug}</loc><lastmod>${terim.guncellendi || "2026-09-23"}</lastmod><priority>0.7</priority></url>`),
].map((row) => `  ${row}`).join("\n");
const sitemapPath = join(DIST, "sitemap.xml");
const sitemap = await readFile(sitemapPath, "utf8");
await writeFile(sitemapPath, sitemap.replace("  <!-- FINANSAL_SOZLUK_URLS -->", glossarySitemap));

console.log(`Prerendered ${pages.length} SEO pages.`);
