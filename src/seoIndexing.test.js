import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { noindexYoluMu } from "./seoIndexing.js";

const kullaniciYollari = [
  "/login",
  "/register",
  "/reset-password",
  "/upgrade",
  "/welcome",
  "/summary",
  "/debts",
  "/payments",
  "/debt-plan",
  "/income",
  "/fixed-income",
  "/expenses",
  "/fixed-expenses",
  "/assets",
  "/settings",
  "/classic",
  "/landing-v2",
  "/demo",
];

test("kullanıcı ve yönetim ekranları noindex olarak sınıflandırılır", () => {
  for (const yol of kullaniciYollari) assert.equal(noindexYoluMu(yol), true, yol);
  assert.equal(noindexYoluMu("/backoffice/user/123"), true);
  assert.equal(noindexYoluMu("/user/123"), true);
  assert.equal(noindexYoluMu("/davet/BRCMABC234"), true);
  assert.equal(noindexYoluMu("/", true), true);
});

test("halka açık SEO sayfaları indekslenebilir kalır", () => {
  for (const yol of ["/", "/araclar", "/rehber", "/faq", "/privacy"])
    assert.equal(noindexYoluMu(yol), false, yol);
});

test("Vercel kullanıcı ekranlarında X-Robots-Tag gönderir", async () => {
  const vercel = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));
  const noindexKaynaklari = new Set(
    vercel.headers
      .filter((kural) => kural.headers?.some((baslik) => baslik.key === "X-Robots-Tag" && baslik.value.includes("noindex")))
      .map((kural) => kural.source),
  );
  for (const yol of kullaniciYollari) assert.equal(noindexKaynaklari.has(yol), true, yol);
  assert.equal(noindexKaynaklari.has("/user/:path*"), true);
  assert.equal(noindexKaynaklari.has("/davet/:path*"), true);
});

test("Vercel kullanıcı ekranlarını uygulamaya yönlendirir", async () => {
  const vercel = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));
  const yenidenYazimlar = new Map(
    vercel.rewrites.map((kural) => [kural.source, kural.destination]),
  );
  for (const yol of kullaniciYollari.filter((yol) => !["/classic", "/landing-v2"].includes(yol)))
    assert.equal(yenidenYazimlar.get(yol), "/index.html", yol);
});

test("ana landing tek ve sorgudan bağımsız canonical kullanır", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const canonicalEtiketleri = html.match(/<link rel="canonical" href="[^"]+"\s*\/>/g) || [];
  assert.deepEqual(canonicalEtiketleri, ['<link rel="canonical" href="https://borcama.com/" />']);
});

test("SSS sayfası kendi ön oluşturulmuş HTML dosyasına yönlenir", async () => {
  const vercel = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));
  const faqYenidenYazimi = vercel.rewrites.find((kural) => kural.source === "/faq");
  assert.equal(faqYenidenYazimi?.destination, "/faq.html");

  const prerender = await readFile(new URL("../scripts/prerender-seo.mjs", import.meta.url), "utf8");
  assert.match(prerender, /path: "\/faq"/);
  assert.match(prerender, /title: "Borcama Sık Sorulan Sorular"/);
});
