import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  HESAP_SILME_ONAYI,
  HESAP_SILME_YONLENDIRME_SURESI_MS,
  borcamaHesabiniSil,
  borcamaYerelVerileriniTemizle,
  hesapSilmeBasarisiVar,
  hesapSilmeHataMesaji,
  hesapSilmeOnayIfadesi,
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
  assert.equal(hesapSilmeOnayIfadesi("tr"), "HESABIMI SİL");
  assert.equal(hesapSilmeOnayiGecerli("  hesabımı sil ", "tr"), true);
  assert.equal(hesapSilmeOnayiGecerli("hesabı sil", "tr"), false);
  // Türkçe modda İngilizce ifade kabul edilmez; davranış önceki gibi kalır.
  assert.equal(hesapSilmeOnayiGecerli("DELETE", "tr"), false);
  assert.equal(hesapSilmeOnayiGecerli("delete", "tr"), false);
});

test("İngilizce modda hesap silme ifadesi DELETE olarak doğrulanır", () => {
  assert.equal(hesapSilmeOnayIfadesi("en"), "DELETE");
  assert.equal(hesapSilmeOnayiGecerli("  delete ", "en"), true);
  assert.equal(hesapSilmeOnayiGecerli("DELETE", "en"), true);
  assert.equal(hesapSilmeOnayiGecerli("delet", "en"), false);
  assert.equal(hesapSilmeOnayiGecerli("", "en"), false);
});

test("İngilizce onayla silme isteği yine sabit sunucu onay metnini gönderir", async () => {
  let govde;
  await borcamaHesabiniSil({
    supabase: { auth: { getSession: async () => ({ data: { session: { access_token: "token" } } }) } },
    supabaseUrl: "https://example.supabase.co",
    onay: "delete",
    dilKodu: "en",
    fetchImpl: async (url, options) => {
      govde = JSON.parse(options.body);
      return { ok: true, json: async () => ({ ok: true }) };
    },
  });
  assert.deepEqual(govde, { confirmation: HESAP_SILME_ONAYI });
  await assert.rejects(
    borcamaHesabiniSil({ supabase: {}, supabaseUrl: "x", onay: "delete", dilKodu: "tr", fetchImpl: async () => { throw new Error("çağrılmamalı"); } }),
    /CONFIRMATION_REQUIRED/,
  );
});

test("hesap silme başarısı yalnız doğru sorgu değeriyle gösterilir", () => {
  assert.equal(hesapSilmeBasarisiVar("?account_deleted=1"), true);
  assert.equal(hesapSilmeBasarisiVar("?account_deleted=0"), false);
  assert.equal(hesapSilmeBasarisiVar(""), false);
  assert.equal(HESAP_SILME_YONLENDIRME_SURESI_MS, 5000);
});

test("hesap silme isteği kimlikli ve sabit onay metniyle gönderilir", async () => {
  let istek;
  const sonuc = await borcamaHesabiniSil({
    supabase: { auth: { getSession: async () => ({ data: { session: { access_token: "token" } } }) } },
    supabaseUrl: "https://example.supabase.co",
    onay: HESAP_SILME_ONAYI,
    dilKodu: "tr",
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

test("derin baglanti isareti hesap silmede korunur", () => {
  const session = bellekDeposu({
    "borcama:derin-baglanti": "https://borcama.com/auth-callback?token_hash=abc&type=signup",
    "borcama:funnel-session": "x",
  });
  borcamaYerelVerileriniTemizle(bellekDeposu({}), session);
  // Isaret silinirse uygulama acilista ayni baglantiyi yeniden isliyor ve
  // harcanmis anahtar yuzunden "baglantinin suresi dolmus" ekrani cikiyordu.
  assert.equal(session.has("borcama:derin-baglanti"), true);
  assert.equal(session.has("borcama:funnel-session"), false);
});

test("abonelik hatası kullanıcıya silmenin gerçekleşmediğini açıklar", () => {
  assert.match(hesapSilmeHataMesaji("SUBSCRIPTION_CANCELLATION_FAILED", "tr"), /hesabın silinmedi/i);
  assert.match(hesapSilmeHataMesaji("SUBSCRIPTION_CANCELLATION_FAILED", "en"), /account wasn't deleted/i);
});

test("hesap silme hata mesajları Türkçede önceki metinlerle aynıdır", () => {
  assert.equal(hesapSilmeHataMesaji("UNAUTHORIZED", "tr"), "Oturumun sona ermiş. Yeniden giriş yapıp tekrar dene.");
  assert.equal(hesapSilmeHataMesaji("CONFIRMATION_REQUIRED", "tr"), "Silme onayı doğrulanamadı.");
  assert.equal(hesapSilmeHataMesaji("X", "tr"), "Hesabın silinemedi. Hiçbir verin kaldırılmadı; lütfen tekrar dene.");
  assert.equal(hesapSilmeHataMesaji("X", "en"), "Your account couldn't be deleted. None of your data was removed; please try again.");
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
