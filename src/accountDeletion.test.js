import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  HESAP_SILME_ONAYI,
  borcamaHesabiniSil,
  borcamaYerelVerileriniTemizle,
  hesapSilmeHataMesaji,
  hesapSilmeOnayiGecerli,
} from "./accountDeletion.js";

function bellekDeposu(kayitlar) {
  const veri = new Map(Object.entries(kayitlar));
  return {
    get length() { return veri.size; },
    key(index) { return [...veri.keys()][index] ?? null; },
    removeItem(key) { veri.delete(key); },
    has(key) { return veri.has(key); },
  };
}

test("hesap silme ifadesi Türkçe karakter ve boşluklarla doğrulanır", () => {
  assert.equal(hesapSilmeOnayiGecerli("  hesabımı sil "), true);
  assert.equal(hesapSilmeOnayiGecerli("hesabı sil"), false);
});

test("hesap silme isteği kimlikli ve sabit onay metniyle gönderilir", async () => {
  let istek;
  const sonuc = await borcamaHesabiniSil({
    supabase: { auth: { getSession: async () => ({ data: { session: { access_token: "token" } } }) } },
    supabaseUrl: "https://example.supabase.co",
    onay: HESAP_SILME_ONAYI,
    fetchImpl: async (url, options) => {
      istek = { url, options };
      return { ok: true, json: async () => ({ ok: true }) };
    },
  });
  assert.equal(sonuc.ok, true);
  assert.equal(istek.url, "https://example.supabase.co/functions/v1/delete-account");
  assert.equal(istek.options.headers.Authorization, "Bearer token");
  assert.deepEqual(JSON.parse(istek.options.body), { confirmation: HESAP_SILME_ONAYI });
});

test("yerel temizlik yalnız Borcama hesap anahtarlarını kaldırır", () => {
  const local = bellekDeposu({ "borcama:piyasa:v1": "x", "borctakip:v1": "y", unrelated: "z" });
  const session = bellekDeposu({ "borcama:funnel-session": "x", other: "y" });
  borcamaYerelVerileriniTemizle(local, session);
  assert.equal(local.has("borcama:piyasa:v1"), false);
  assert.equal(local.has("borctakip:v1"), false);
  assert.equal(local.has("unrelated"), true);
  assert.equal(session.has("borcama:funnel-session"), false);
  assert.equal(session.has("other"), true);
});

test("abonelik hatası kullanıcıya silmenin gerçekleşmediğini açıklar", () => {
  assert.match(hesapSilmeHataMesaji("SUBSCRIPTION_CANCELLATION_FAILED"), /hesabın silinmedi/i);
});

test("sunucu silme akışı aboneliği durdurur ve yalnız service role RPC kullanır", () => {
  const edge = fs.readFileSync(new URL("../supabase/functions/delete-account/index.ts", import.meta.url), "utf8");
  const migration = fs.readFileSync(new URL("../supabase/migrations/20260908150000_self_service_account_deletion.sql", import.meta.url), "utf8");
  assert.match(edge, /effective_from:\s*"immediately"/);
  assert.match(edge, /admin\.rpc\("delete_borcama_account"/);
  assert.match(migration, /revoke execute[\s\S]+from public, anon, authenticated/i);
  assert.match(migration, /grant execute[\s\S]+to service_role/i);
  assert.match(migration, /delete from auth\.users/i);
});
