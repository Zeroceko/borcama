import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const SITE = "https://borcama.com";
const DIST = join(process.cwd(), "dist");

const tools = [
  ["borc-kapatma-hesaplayici", "Borç Kapatma Hesaplayıcı", "Aylık ödeme ve faiz oranına göre borcunun tahmini kapanış süresini, toplam faizini ve ödeme planını hesapla."],
  ["kredi-karti-asgari-odeme-hesaplayici", "Kredi Kartı Asgari Ödeme Hesaplayıcı", "Kart limiti ve dönem borcuna göre 2026 kurallarıyla tahmini asgari ödeme tutarını hesapla."],
  ["borc-odeme-plani", "Borç Ödeme Planı Oluşturucu", "Birden fazla borcu faiz veya küçük bakiye önceliğiyle tek ödeme planında sırala."],
  ["aylik-odeme-takvimi", "Aylık Ödeme Takvimi", "Kredi kartı, kredi ve diğer ödemelerini tarihlerine göre sırala; aylık toplamını gör."],
  ["mevduat-faizi-hesaplama", "Mevduat Faizi Hesaplama", "Ana para, yıllık faiz, vade ve stopaj oranıyla brüt ve net mevduat kazancını hesapla."],
  ["kredi-odeme-plani-hesaplama", "Kredi Ödeme Planı Hesaplama", "Kredi tutarı, aylık faiz ve vadeye göre taksit, toplam faiz ve ödeme planını hesapla."],
  ["brut-net-maas-hesaplama", "Brütten Nete, Netten Brüte Maaş Hesaplama 2026", "2026 vergi ve çalışan kesintilerine göre brüt maaştan net maaşı veya net maaştan brüt maaşı hesapla."],
  ["kidem-tazminati-hesaplama", "Kıdem Tazminatı Hesaplama 2026", "2026 kıdem tazminatı tavanına göre maaş ve çalışma sürenle tahmini net kıdem tazminatını hesapla."],
];

const guides = [
  ["borclarimi-nasil-duzenlerim", "Borçlarımı Nasıl Düzenlerim?", "Borçlarını tek listede toplamak, ödeme önceliğini belirlemek ve sürdürülebilir bir aylık plan kurmak için adım adım rehber."],
  ["kredi-karti-borcu-nasil-takip-edilir", "Kredi Kartı Borcu Nasıl Takip Edilir?", "Dönem borcu, asgari ödeme ve son ödeme tarihini düzenli takip etmek için uygulanabilir yöntemler."],
  ["asgari-odeme-borcu-nasil-etkiler", "Asgari Ödeme Yapmak Borcu Nasıl Etkiler?", "Kredi kartında asgari ödeme sonrası kalan borcun ve faizin nasıl değiştiğini sade örneklerle öğren."],
  ["birden-fazla-bankadaki-borclar-nasil-yonetilir", "Birden Fazla Bankadaki Borçlar Nasıl Yönetilir?", "Farklı bankalardaki kredi, kart ve ek hesap borçlarını tek aylık planda düzenleme rehberi."],
  ["borc-kapatma-plani-nasil-hazirlanir", "Borç Kapatma Planı Nasıl Hazırlanır?", "Aylık bütçe, zorunlu ödemeler ve faiz oranlarıyla gerçekçi bir borç kapatma planı hazırla."],
];

const toolLinks = tools.map(([slug, title]) => [`/araclar/${slug}`, title]);
const guideLinks = guides.map(([slug, title]) => [`/rehber/${slug}`, title]);
const pages = [
  { path: "/araclar", title: "Finans ve Ödeme Hesaplama Araçları", description: "Borç, kredi kartı, mevduat, kredi taksiti, maaş ve kıdem tazminatı için ücretsiz hesaplama araçları.", links: toolLinks, type: "CollectionPage" },
  ...tools.map(([slug, title, description]) => ({ path: `/araclar/${slug}`, title, description, links: toolLinks.filter(([path]) => path !== `/araclar/${slug}`), type: "WebApplication" })),
  { path: "/rehber", title: "Borç ve Ödeme Rehberi", description: "Borç düzenleme, kredi kartı takibi ve borç kapatma planı hakkında sade ve uygulanabilir rehberler.", links: guideLinks, type: "CollectionPage" },
  ...guides.map(([slug, title, description]) => ({ path: `/rehber/${slug}`, title, description, links: guideLinks.filter(([path]) => path !== `/rehber/${slug}`), type: "Article" })),
];

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function staticBody(page) {
  const links = page.links.map(([path, label]) => `<li><a href="${path}">${escapeHtml(label)}</a></li>`).join("");
  return `<div id="root"><main class="seo-prerender"><a href="/">Borcama</a><h1>${escapeHtml(page.title)}</h1><p>${escapeHtml(page.description)}</p><nav aria-label="İlgili sayfalar"><h2>İlgili hesaplama ve rehberler</h2><ul>${links}</ul></nav></main></div>`;
}

const baseHtml = await readFile(join(DIST, "index.html"), "utf8");
for (const page of pages) {
  const canonical = `${SITE}${page.path}`;
  const fullTitle = `${page.title} | Borcama`;
  const schema = {
    "@context": "https://schema.org",
    "@type": page.type,
    name: page.title,
    headline: page.type === "Article" ? page.title : undefined,
    description: page.description,
    url: canonical,
    applicationCategory: page.type === "WebApplication" ? "FinanceApplication" : undefined,
    operatingSystem: page.type === "WebApplication" ? "Web" : undefined,
    offers: page.type === "WebApplication" ? { "@type": "Offer", price: "0", priceCurrency: "TRY" } : undefined,
  };
  let html = baseHtml
    .replace(/<title>.*?<\/title>/s, `<title>${escapeHtml(fullTitle)}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${escapeHtml(page.description)}" />`)
    .replace("</head>", `<link rel="canonical" href="${canonical}" />\n    <meta property="og:title" content="${escapeHtml(page.title)}" />\n    <meta property="og:description" content="${escapeHtml(page.description)}" />\n    <meta property="og:url" content="${canonical}" />\n    <meta property="og:type" content="${page.type === "Article" ? "article" : "website"}" />\n    <script type="application/ld+json">${JSON.stringify(schema).replaceAll("</", "<\\/")}</script>\n    <style>.seo-prerender{max-width:960px;margin:auto;padding:72px 24px;font-family:system-ui,sans-serif;color:#14160f}.seo-prerender>a{font-weight:800}.seo-prerender h1{max-width:800px;font-size:48px;line-height:1.05}.seo-prerender p{max-width:720px;font-size:18px;line-height:1.65}.seo-prerender nav{margin-top:48px}.seo-prerender li{margin:10px 0}</style>\n  </head>`)
    .replace('<div id="root"></div>', staticBody(page));
  const output = join(DIST, `${page.path}.html`);
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, html);
}

console.log(`Prerendered ${pages.length} SEO pages.`);
