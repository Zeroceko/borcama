import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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

test("harcama kaynağı menüsü kart ve hesap ekleme aksiyonlarını modal olarak açar", () => {
  const appSource = readFileSync(new URL("./App.jsx", import.meta.url), "utf8");

  assert.match(appSource, /<option value="action:add-card">＋ Kart ekle<\/option>/);
  assert.match(appSource, /<option value="action:add-account">＋ Hesap ekle<\/option>/);
  assert.match(appSource, /className="bt-modal bt-kaynak-modal"/);
  assert.match(appSource, /Kaynak kaydedildiğinde bu harcamada otomatik seçilir/);
});
