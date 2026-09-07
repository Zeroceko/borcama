import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const oku = () => readFile(new URL("./LandingGrowth.jsx", import.meta.url), "utf8");

test("kayıtsız örnek deneyim tek temsili senaryoyu gösterir ve hesap/AI istemez", async () => {
  const landing = await oku();
  assert.match(landing, /const example =/);
  assert.match(landing, /Örnek hesap/);
  assert.match(landing, /Önceden hazırlanmış temsili yanıt; canlı AI çağrısı değildir/);
  assert.match(landing, /İlk 30 gün Pro özellikleri hediye/);
  assert.match(landing, /Süre bitince Ücretsiz planın devam eder/);
  assert.match(landing, /href = "\/register\?plan=free"/);
  assert.doesNotMatch(landing, /supabase|useSession|fetch\(|gemini|funnelEtkinligiKaydet/i);
});
