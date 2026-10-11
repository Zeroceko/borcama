// Yayından sonra sitemap'teki URL'leri IndexNow'a (Bing, Yandex ve diğerleri)
// bildirir. Kullanım: node scripts/indexnow.mjs  (yalnız canlı yayından sonra)
// Anahtar dosyası public/38671da7f9cf34eea231b4629a683511.txt olarak sitede yayınlanır; gizli değildir.
const KEY = "38671da7f9cf34eea231b4629a683511";
const HOST = "borcama.com";

const sitemap = await fetch(`https://${HOST}/sitemap.xml`).then((r) => r.text());
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).slice(0, 10000);
if (!urlList.length) throw new Error("Sitemap'te URL bulunamadı");

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList }),
});
console.log(`IndexNow: ${urlList.length} URL gönderildi, yanıt ${response.status}`);
if (response.status >= 400) process.exit(1);
