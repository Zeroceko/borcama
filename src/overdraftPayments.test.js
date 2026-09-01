import test from "node:test";
import assert from "node:assert/strict";
import {
  ekHesapOdemesiKaldir,
  ekHesapOdemesiUygula,
} from "./overdraftPayments.js";

test("tutarsız eski ödeme geçmişi güncel ek hesabın kapanmasını engellemez", () => {
  const hesap = {
    kullanilan: 13000,
    yapilanOdeme: 0,
    odemeGecmisi: [
      { id: "eski", tutar: 54747, tarih: "2026-08-06T18:28:00.000Z" },
    ],
  };
  const sonuc = ekHesapOdemesiUygula(hesap, {
    tutar: 13000,
    tarih: "2026-09-01T10:55",
    kapat: true,
    yeniId: "kapanis",
  });

  assert.equal(sonuc.tamam, true);
  assert.equal(sonuc.hesap.yapilanOdeme, 13000);
  assert.equal(sonuc.hesap.odemeGecmisi.length, 2);
  assert.equal(sonuc.kayit.toplamaDahil, true);
});

test("yeni kapanış kaydı silinirse bakiye yeniden açılır", () => {
  const kapanan = ekHesapOdemesiUygula(
    {
      kullanilan: 13000,
      yapilanOdeme: 0,
      odemeGecmisi: [{ id: "eski", tutar: 54747 }],
    },
    {
      tutar: 13000,
      tarih: "2026-09-01T10:55",
      kapat: true,
      yeniId: "kapanis",
    },
  );
  const geriAlinan = ekHesapOdemesiKaldir(kapanan.hesap, kapanan.kayit);

  assert.equal(geriAlinan.yapilanOdeme, 0);
  assert.deepEqual(
    geriAlinan.odemeGecmisi.map((odeme) => odeme.id),
    ["eski"],
  );
});

test("normal kısmi ödeme mevcut güncel ödemeye eklenir", () => {
  const sonuc = ekHesapOdemesiUygula(
    { kullanilan: 10000, yapilanOdeme: 2000, odemeGecmisi: [] },
    {
      tutar: 3000,
      tarih: "2026-09-01T10:55",
      yeniId: "yeni",
    },
  );

  assert.equal(sonuc.tamam, true);
  assert.equal(sonuc.hesap.yapilanOdeme, 5000);
});
