import test from "node:test";
import assert from "node:assert/strict";
import { bugunAksiyonunuSec, bugunKartiAnahtari, haftalikTasarruf, kurtulunanFaiz } from "./bugunAksiyonu.js";
import { getActivationState } from "./productActivation.js";

const tamamAktivasyon = getActivationState({
  cards: [{ toplamEkstreBorcu: 12000 }],
  incomes: [{ tutar: 50000 }],
  expenses: [{ tutar: 800 }],
});
const tl = (n) => `₺${Math.round(n).toLocaleString("tr-TR")}`;

test("gecikmiş ödeme her şeyden önce gelir ve en çok geciken seçilir", () => {
  const sonuc = bugunAksiyonunuSec({
    odemeler: [
      { ad: "Bonus", tutar: 3000, gun: -2 },
      { ad: "Axess", tutar: 1500, gun: -5 },
      { ad: "Kredi", tutar: 4000, gun: 1 },
    ],
    aktivasyon: getActivationState({}),
    aylikEksik: 5000,
    tutarYaz: tl,
  });
  assert.equal(sonuc.tur, "gecikme");
  assert.equal(sonuc.metin, "Axess ödemen 5 gün gecikti. Ödediysen işaretle, ödemediysen bugün öde.");
  assert.equal(sonuc.aksiyon.hedef, "odemeler");
});

test("ödendi işaretli, tutarsız veya ödeme gününden sonra eklenen borç gecikme sayılmaz", () => {
  const sonuc = bugunAksiyonunuSec({
    odemeler: [
      { ad: "Ödenen", tutar: 3000, gun: -3, odendi: true },
      { ad: "Sıfır", tutar: 0, gun: -3 },
      { ad: "Yeni kart", tutar: 2000, gun: -3, eklendiGun: 0 },
    ],
    aktivasyon: tamamAktivasyon,
    tutarYaz: tl,
  });
  assert.equal(sonuc.tur, "yok");
});

test("7 gün içindeki ödeme tutar ve gün sayısıyla söylenir; 7 günden uzağı söylenmez", () => {
  const yakin = bugunAksiyonunuSec({
    odemeler: [{ ad: "Kredi", tutar: 4250, gun: 3 }, { ad: "Bonus", tutar: 900, gun: 6 }],
    aktivasyon: tamamAktivasyon,
    tutarYaz: tl,
  });
  assert.equal(yakin.tur, "yaklasan");
  assert.equal(yakin.metin, "Kredi için ₺4.250 ödemen 3 gün sonra.");
  assert.equal(yakin.aksiyon.etiket, "Ödemeyi gör");

  const bugun = bugunAksiyonunuSec({ odemeler: [{ ad: "Bonus", tutar: 900, gun: 0 }], tutarYaz: tl });
  assert.equal(bugun.metin, "Bonus için ₺900 ödemenin son günü bugün.");

  const uzak = bugunAksiyonunuSec({ odemeler: [{ ad: "Kredi", tutar: 4250, gun: 8 }], aktivasyon: tamamAktivasyon });
  assert.equal(uzak.tur, "yok");
});

test("eksik kurulum adımı tek talimat olarak gösterilir", () => {
  const borcYok = bugunAksiyonunuSec({ aktivasyon: getActivationState({}) });
  assert.equal(borcYok.tur, "kurulum");
  assert.equal(borcYok.metin, "Borcunu ekle, ne zaman biteceğini gösterelim.");
  assert.equal(borcYok.aksiyon.gorev.id, "debt");
  assert.deepEqual(borcYok.adim, { aktif: 1, toplam: 3 });

  const gelirYok = bugunAksiyonunuSec({ aktivasyon: getActivationState({ cards: [{ toplamEkstreBorcu: 5000 }] }) });
  assert.equal(gelirYok.metin, "Maaşını yaz, ay sonunda ne kalacağını gösterelim.");
  assert.equal(gelirYok.aksiyon.gorev.id, "income");

  // Kurulumu bitiren kullanıcı (B13): son adım, sayaçsız, ödeme seçeneği ikincil.
  const hareketYok = bugunAksiyonunuSec({
    aktivasyon: getActivationState({ cards: [{ toplamEkstreBorcu: 5000 }], incomes: [{ tutar: 40000 }] }),
    kurulumSonrasi: true,
  });
  assert.equal(hareketYok.aksiyon.gorev.id, "activity");
  assert.equal(hareketYok.adim, null);
  assert.equal(hareketYok.ikincil.gorev.id, "payment");
});

test("para ayı çıkarmıyorsa ücretsiz tasarruf önerisi: haftalık tutar ve en çok giden kategori", () => {
  const sonuc = bugunAksiyonunuSec({
    aktivasyon: tamamAktivasyon,
    aylikEksik: 4000,
    yasamHarcamasi: 30000,
    enCokKategori: "Market",
    tutarYaz: tl,
  });
  assert.equal(sonuc.tur, "eksik");
  assert.equal(sonuc.haftalik, 950); // 4000 / 4.3 ≈ 930 → 50'lik yukarı yuvarlama
  assert.equal(
    sonuc.metin,
    "Bu ay paran ₺4.000 yetmiyor. Haftada ₺950 daha az harcarsan ayı çıkarırsın. En çok para giden yer: Market.",
  );
  assert.equal(sonuc.aksiyon.hedef, "harcamalar");

  const kategorisiz = bugunAksiyonunuSec({ aktivasyon: tamamAktivasyon, aylikEksik: 4000, yasamHarcamasi: 30000, tutarYaz: tl });
  assert.doesNotMatch(kategorisiz.metin, /En çok para giden/);
});

test("eksik harcamadan büyükse ya da kısıntı yetmiyorsa dürüstçe borç planına yönlendirir", () => {
  const buyuk = bugunAksiyonunuSec({ aktivasyon: tamamAktivasyon, aylikEksik: 12000, yasamHarcamasi: 9000, tutarYaz: tl });
  assert.equal(buyuk.azaltimYetmez, true);
  assert.equal(
    buyuk.metin,
    "Bu ay paran ₺12.000 yetmiyor. Sadece harcamayı kısmak yetmiyor; borç planında ödemeleri nasıl hafifletebileceğini gör.",
  );
  assert.equal(buyuk.aksiyon.hedef, "plan");

  const senaryo = bugunAksiyonunuSec({ aktivasyon: tamamAktivasyon, aylikEksik: 3000, yasamHarcamasi: 20000, azaltimYetmez: true });
  assert.equal(senaryo.azaltimYetmez, true);
});

test("para artıyorsa en pahalı borca yatırmayı ve kurtulunan faizi söyler", () => {
  const sonuc = bugunAksiyonunuSec({
    aktivasyon: tamamAktivasyon,
    artan: 5000,
    enPahaliBorc: { ad: "Bonus Kart", faiz: 4.25, bakiye: 40000 },
    tutarYaz: tl,
  });
  assert.equal(sonuc.tur, "artan");
  assert.ok(Math.abs(sonuc.faiz - 212.5) < 0.001);
  assert.equal(
    sonuc.metin,
    "Bu ay yaklaşık ₺5.000 artıyor. Bunu Bonus Kart borcuna yatırırsan ayda yaklaşık ₺213 faizden kurtulursun.",
  );

  // Kapatma sırası Pro'da: ücretsiz kullanıcıya borç adı verilmez.
  const ucretsiz = bugunAksiyonunuSec({
    aktivasyon: tamamAktivasyon,
    artan: 5000,
    enPahaliBorc: { ad: "Bonus Kart", faiz: 4.25, bakiye: 40000 },
    borcAdiGoster: false,
    tutarYaz: tl,
  });
  assert.doesNotMatch(ucretsiz.metin, /Bonus Kart/);
  assert.equal(ucretsiz.aksiyon.hedef, "borclar");
});

test("faiz işleyen borç yoksa artan para için kenara koy önerilir", () => {
  const sonuc = bugunAksiyonunuSec({ aktivasyon: tamamAktivasyon, artan: 2500, enPahaliBorc: null, tutarYaz: tl });
  assert.equal(sonuc.metin, "Bu ay yaklaşık ₺2.500 artıyor. Kenara koy; beklenmedik bir ödemede kart kullanmak zorunda kalmazsın.");
  assert.equal(sonuc.aksiyon.hedef, "varliklar");
});

test("yapılacak bir şey yoksa sakin bir cümle", () => {
  const sonuc = bugunAksiyonunuSec({ aktivasyon: tamamAktivasyon });
  assert.equal(sonuc.tur, "yok");
  assert.equal(sonuc.metin, "Bugün yapman gereken bir şey yok. Harcama yaptıkça ekle.");
});

test("haftalık tasarruf yukarı ve yuvarlak tutara çevrilir", () => {
  assert.equal(haftalikTasarruf(0), 0);
  assert.equal(haftalikTasarruf(-100), 0);
  assert.equal(haftalikTasarruf(200), 50);
  assert.equal(haftalikTasarruf(4000), 950);
  assert.equal(haftalikTasarruf(20000), 4700);
  assert.ok(haftalikTasarruf(4000) * 4.3 >= 4000);
});

test("kurtulunan faiz bakiyeyi aşan tutar için bakiyeyle sınırlanır", () => {
  assert.equal(kurtulunanFaiz({ artan: 10000, borc: { faiz: 5, bakiye: 2000 } }), 100);
  assert.equal(kurtulunanFaiz({ artan: 10000, borc: { faiz: 0, bakiye: 2000 } }), 0);
  assert.equal(kurtulunanFaiz({ artan: 0, borc: { faiz: 5, bakiye: 2000 } }), 0);
});

test("kapatılan kart o gün gizli; ertesi gün ya da konu değişince yeniden görünür", () => {
  const gun = new Date(2026, 10, 17, 10);
  const yarin = new Date(2026, 10, 18, 9);
  const odeme = { tur: "yaklasan", odeme: { id: "kart-1" }, aksiyon: {} };
  assert.equal(bugunKartiAnahtari(odeme, gun), "yaklasan:kart-1:2026-11-17");
  assert.notEqual(bugunKartiAnahtari(odeme, yarin), bugunKartiAnahtari(odeme, gun));
  assert.notEqual(bugunKartiAnahtari({ ...odeme, odeme: { id: "kredi-2" } }, gun), bugunKartiAnahtari(odeme, gun));
  assert.equal(bugunKartiAnahtari({ tur: "kurulum", gorev: { id: "activity" } }, gun), "kurulum:activity:2026-11-17");
  assert.equal(bugunKartiAnahtari(null, gun), null);
});
