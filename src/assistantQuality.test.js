import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { ASISTAN_EVAL_AILELERI, ASISTAN_EVAL_VAKALARI } from "../evals/financial-assistant/cases.js";
import {
  ASISTAN_KALITE_RUBRIGI,
  asistanSurumKapisiniDegerlendir,
  deterministikYanitiKontrolEt,
} from "../evals/financial-assistant/rubric.js";
import { asistanYanitiniSunumaDonustur } from "./assistantPresentation.js";

const kok = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const tumAnahtarlar = (deger, sonuc = []) => {
  if (!deger || typeof deger !== "object") return sonuc;
  for (const [anahtar, altDeger] of Object.entries(deger)) {
    sonuc.push(anahtar);
    tumAnahtarlar(altDeger, sonuc);
  }
  return sonuc;
};

const tamPuan = () => Object.fromEntries(ASISTAN_KALITE_RUBRIGI.map((boyut) => [boyut.id, 4]));

test("sentetik asistan eval seti sekiz zorunlu finansal aileyi kapsar", () => {
  assert.equal(new Set(ASISTAN_EVAL_VAKALARI.map((vaka) => vaka.id)).size, ASISTAN_EVAL_VAKALARI.length);
  assert.deepEqual(new Set(ASISTAN_EVAL_VAKALARI.map((vaka) => vaka.aile)), new Set(ASISTAN_EVAL_AILELERI));
  assert.ok(ASISTAN_EVAL_AILELERI.every((aile) => ASISTAN_EVAL_VAKALARI.some((vaka) => vaka.aile === aile)));
});

test("eval vakaları yalnız sentetik ve normalize edilmiş finansal özet taşır", () => {
  const yasakAnahtar = /^(e-?posta|email|kart_?no|card_?number|aciklama|işyeri|isyeri|merchant|ham_?ekstre|raw_?statement|pdf)$/i;
  const uzunKartDizisi = /\b(?:\d[ -]?){13,19}\b/;
  for (const vaka of ASISTAN_EVAL_VAKALARI) {
    assert.equal(vaka.sentetik, true, vaka.id);
    assert.equal(tumAnahtarlar(vaka.baglam).some((anahtar) => yasakAnahtar.test(anahtar)), false, vaka.id);
    assert.equal(uzunKartDizisi.test(JSON.stringify(vaka)), false, vaka.id);
  }
});

test("canlı asistan talimatı sade dil, bütün profil ve sabit kısa yanıt yapısını korur", () => {
  const kaynak = readFileSync(resolve(kok, "supabase/functions/financial-assistant/index.ts"), "utf8");
  assert.match(kaynak, /BORCAMA_HESAP_OZETI'nin tamamını birlikte değerlendir/);
  assert.match(kaynak, /toplam finansal profil ve kullanıcının aylık ödeme gücüyle çelişki kontrolü/);
  assert.match(kaynak, /finansal okuryazarlığı olmayan birinin ilk okumada anlayacağı günlük Türkçeyle/);
  assert.match(kaynak, /ilk satırda "Kısa cevap: \.\.\."/);
  assert.match(kaynak, /"• " ile başlayan 2 veya 3 kısa madde/);
  assert.match(kaynak, /en fazla 130 kelime/);
  assert.match(kaynak, /kullanıcının girmediği sayıyı kesinmiş gibi sunma/);
  assert.match(kaynak, /Kullanıcı adına kayıt oluşturma veya değiştirme/);
});

test("sekiz referans yanıt deterministik regresyon kapılarından geçer", () => {
  for (const vaka of ASISTAN_EVAL_VAKALARI) {
    assert.deepEqual(deterministikYanitiKontrolEt(vaka, vaka.referans), {
      gecti: true,
      sorunlar: [],
      agirHatalar: [],
      olcum: {
        kelime: deterministikYanitiKontrolEt(vaka, vaka.referans).olcum.kelime,
        eylemMaddesi: 3,
      },
    }, vaka.id);
  }
});

test("kesin ve dayanıksız kredi yönlendirmesi ağır hata sayılır", () => {
  const vaka = ASISTAN_EVAL_VAKALARI.find((aday) => aday.aile === "kredi");
  const sonuc = deterministikYanitiKontrolEt(vaka, {
    ...vaka.referans,
    answer: `${vaka.referans.answer}\nKesinlikle kredi al.`,
  });
  assert.equal(sonuc.gecti, false);
  assert.ok(sonuc.agirHatalar.length > 0);
});

test("rubrik kapısı tüm aileler güçlü olduğunda geçer", () => {
  const sonuc = asistanSurumKapisiniDegerlendir(ASISTAN_EVAL_VAKALARI.map((vaka) => ({
    vakaId: vaka.id,
    aile: vaka.aile,
    puanlar: tamPuan(),
    deterministikGecti: true,
    agirHatalar: [],
  })));
  assert.equal(sonuc.gecti, true);
  assert.equal(sonuc.genelOrtalama, 100);
  assert.equal(sonuc.deterministikGecisOrani, 1);
});

test("kritik finansal doğruluk zayıfsa yüksek genel puan sürümü geçiremez", () => {
  const sonuclar = ASISTAN_EVAL_VAKALARI.map((vaka) => ({
    vakaId: vaka.id,
    aile: vaka.aile,
    puanlar: tamPuan(),
    deterministikGecti: true,
    agirHatalar: [],
  }));
  sonuclar[0].puanlar.finansal_dogruluk = 2;
  const sonuc = asistanSurumKapisiniDegerlendir(sonuclar);
  assert.equal(sonuc.gecti, false);
  assert.deepEqual(sonuc.basarisizVakalar, [sonuclar[0].vakaId]);
});

test("model satır atlamasa da yanıt okunabilir maddelere ayrılır", () => {
  const sonuc = asistanYanitiniSunumaDonustur("Kısa cevap: Önce pahalı borcu azalt. • 10.000 TL'yi KMH borcuna yatır. • Yeni harcama yapma. Senden gereken: Ödeme planını aç.");
  assert.equal(sonuc.kisaCevap, "Önce pahalı borcu azalt.");
  assert.deepEqual(sonuc.maddeler, ["10.000 TL'yi KMH borcuna yatır.", "Yeni harcama yapma."]);
  assert.equal(sonuc.sonrakiAdim, "Ödeme planını aç.");
});
