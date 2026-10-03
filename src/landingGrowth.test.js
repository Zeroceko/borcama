import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const oku = () => readFile(new URL("./LandingGrowth.jsx", import.meta.url), "utf8");

test("kayıtsız örnek deneyim ortak sentetik hesabı gösterir ve hesap/AI istemez", async () => {
  const landing = await oku();
  assert.match(landing, /demoHesapOzeti, demoVerisiOlustur/);
  assert.match(landing, /Salt okunur örnek/);
  assert.match(landing, /hiçbir gerçek kullanıcı verisi kullanılmaz/);
  assert.match(landing, /canlı AI çağrısı değildir/);
  assert.match(landing, /İlk 30 gün Pro özellikleri hediye/);
  assert.match(landing, /Süre bitince Ücretsiz planın devam eder/);
  assert.match(landing, /href = "\/register\?plan=free"/);
  assert.match(landing, /Banka şifresi yok/);
  assert.match(landing, /Gerisini tablonda gör/);
  assert.doesNotMatch(landing, /lg-start/);
  assert.doesNotMatch(landing, /lg-faq/);
  assert.doesNotMatch(landing, /supabase|useSession|fetch\(|gemini|funnelEtkinligiKaydet/i);
});
