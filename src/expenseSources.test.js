import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { tr } from "./locales/bolumler/gelir-gider.js";
import {
  harcamaKaynagiSecimDegeri,
  harcamaKaynaklariniOlustur,
} from "./expenseSources.js";

test("harcama kaynakları yalnız kayıtlı kart ve mevduat hesaplarından oluşur", () => {
  const kaynaklar = harcamaKaynaklariniOlustur({
    cards: [
      { id: "c1", banka: "Banka A", ad: "Kart", kartSon4: "1234" },
      { id: "c2", banka: "Banka A", ad: "Kart", kartSon4: "5678" },
    ],
    assets: [
      { id: "a1", tur: "mevduat", kurum: "Banka B", ad: "Maaş hesabı" },
      { id: "a2", tur: "nakit", ad: "Cüzdan" },
    ],
  });

  assert.equal(kaynaklar.kartlar.length, 2);
  assert.deepEqual(
    kaynaklar.kartlar.map((kaynak) => kaynak.secimDegeri),
    ["card:c1", "card:c2"],
  );
  assert.match(kaynaklar.kartlar[1].gorunenEtiket, /5678/);
  assert.deepEqual(
    kaynaklar.hesaplar.map((kaynak) => kaynak.gorunenEtiket),
    ["Banka B · Maaş hesabı"],
  );
});

test("eski harcama kayıtları etiketleriyle doğru kaynağa bağlanır", () => {
  const kaynaklar = harcamaKaynaklariniOlustur({
    cards: [{ id: "c1", banka: "Banka A", ad: "Kart" }],
    assets: [],
  });

  assert.equal(
    harcamaKaynagiSecimDegeri({ kaynak: "Banka A · Kart" }, kaynaklar),
    "card:c1",
  );
  assert.equal(harcamaKaynagiSecimDegeri({ kaynak: "Nakit" }, kaynaklar), "cash");
});

test("adı boş kaynaklar Türkçe yedek adla kaydedilir ve gösterilir", () => {
  const kaynaklar = harcamaKaynaklariniOlustur({
    cards: [{ id: "c1" }],
    assets: [{ id: "a1", tur: "mevduat" }],
  });

  assert.equal(kaynaklar.kartlar[0].kayitEtiketi, "Banka · Kredi kartı");
  assert.equal(kaynaklar.kartlar[0].gorunenEtiket, "Banka · Kredi kartı");
  assert.equal(kaynaklar.hesaplar[0].kayitEtiketi, "Banka hesabı · Hesap");
  assert.equal(kaynaklar.hesaplar[0].gorunenEtiket, "Banka hesabı · Hesap");
});

test("harcama kaynağı menüsü kart ve hesap ekleme aksiyonlarını modal olarak açar", () => {
  const appSource = readFileSync(new URL("./App.jsx", import.meta.url), "utf8");

  assert.match(appSource, /<option value="action:add-card">\{t\("gelirGider\.harcama\.kartEkle"\)\}<\/option>/);
  assert.equal(tr["gelirGider.harcama.kartEkle"], "＋ Kart ekle");
  assert.match(appSource, /<option value="action:add-account">\{t\("gelirGider\.harcama\.hesapEkle"\)\}<\/option>/);
  assert.equal(tr["gelirGider.harcama.hesapEkle"], "＋ Hesap ekle");
  assert.match(appSource, /className="bt-modal bt-kaynak-modal"/);
  assert.match(appSource, /t\("gelirGider\.kaynak\.modalAciklama"\)/);
  assert.match(tr["gelirGider.kaynak.modalAciklama"], /Kaynak kaydedildiğinde bu harcamada otomatik seçilir/);
  assert.match(appSource, /<option value="">\{t\("gelirGider\.kaynak\.bankaSecin"\)\}<\/option>/);
  assert.equal(tr["gelirGider.kaynak.bankaSecin"], "Banka seçin…");
  assert.match(appSource, /<option value="__other__">\{t\("gelirGider\.kaynak\.digerBanka"\)\}<\/option>/);
  assert.equal(tr["gelirGider.kaynak.digerBanka"], "Diğer banka…");
});
