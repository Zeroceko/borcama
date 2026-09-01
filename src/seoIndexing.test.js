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
  "/expenses",
  "/assets",
  "/settings",
  "/classic",
  "/landing-v2",
];

test("kullanıcı ve yönetim ekranları noindex olarak sınıflandırılır", () => {
  for (const yol of kullaniciYollari) assert.equal(noindexYoluMu(yol), true, yol);
  assert.equal(noindexYoluMu("/backoffice/user/123"), true);
  assert.equal(noindexYoluMu("/user/123"), true);
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
});

