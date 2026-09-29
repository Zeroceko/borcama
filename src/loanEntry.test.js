import test from "node:test";
import assert from "node:assert/strict";
import { krediKaydiniHazirla, krediTaksitIlerlemesi } from "./loanEntry.js";

test("toplam ve ödenen taksitten kalan planı hesaplar", () => {
  const sonuc = krediKaydiniHazirla({
    anaPara: "350000",
    taksit: "12500.50",
    toplamTaksit: "36",
    odenenTaksit: "11",
    faiz: "3.49",
  });

  assert.equal(sonuc.tamam, true);
  assert.equal(sonuc.kredi.kalanTaksit, 25);
  assert.equal(sonuc.kredi.kalanBorc, 312512.5);
  assert.equal(sonuc.kredi.anaPara, "350000");
  assert.equal(sonuc.kredi.taksit, "12500.50");
  assert.equal(sonuc.kredi.faiz, "3.49");
});

test("faiz oranı bankanın girilen aylık taksitini yeniden hesaplamaz", () => {
  const dusukFaiz = krediKaydiniHazirla({ taksit: 10000, toplamTaksit: 12, odenenTaksit: 2, faiz: 1 });
  const yuksekFaiz = krediKaydiniHazirla({ taksit: 10000, toplamTaksit: 12, odenenTaksit: 2, faiz: 9 });

  assert.equal(dusukFaiz.kredi.taksit, yuksekFaiz.kredi.taksit);
  assert.equal(dusukFaiz.kredi.kalanBorc, yuksekFaiz.kredi.kalanBorc);
});

test("ödenen taksit toplamı aşarsa kaydı engeller", () => {
  const sonuc = krediKaydiniHazirla({ taksit: 10000, toplamTaksit: 12, odenenTaksit: 13 });
  assert.equal(sonuc.tamam, false);
  assert.match(sonuc.hata, /büyük olamaz/);
});

test("eski kayıtlar toplam ve ödenen taksit olmadan korunur", () => {
  const kredi = { taksit: 10000, kalanTaksit: 8, kalanBorc: 80000, faiz: 2.5 };
  const sonuc = krediKaydiniHazirla(kredi);
  assert.equal(sonuc.tamam, true);
  assert.deepEqual(sonuc.kredi, kredi);
});

test("tek ilerleme alanı girildiğinde kullanıcıyı açıkça uyarır", () => {
  const sonuc = krediTaksitIlerlemesi({ toplamTaksit: 24 });
  assert.equal(sonuc.gecerli, false);
  assert.match(sonuc.hata, /birlikte gir/);
});
