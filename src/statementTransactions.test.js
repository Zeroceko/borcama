import assert from "node:assert/strict";
import test from "node:test";

import { parseStatementTransactions } from "./statementTransactions.js";

test("Enpara harcamalarini ayirir; odeme ve faizleri disarida birakir", () => {
  const result = parseStatementTransactions(`
01/07/2026 Ödeme - Enpara.com Cep Şubesi - 6.125,00 TL
02/02/2026 AGESA EMEKLİLİK VE (İşlem tutarı: 5.000,00 TL) 6/6 833,33 TL
03/07/2026 MOKA U /TABII / TRT 99,00 TL
06/07/2026 SOK 11183 KADIKOY HALIL E 126,54 TL
21/07/2026 Alışveriş faizi 918,68 TL
21/07/2026 Faizlerin KKDF’si 137,80 TL`, { bank: "Enpara", currentPurchases: 1058.87 });
  assert.equal(result.transactions.length, 3);
  assert.equal(result.detectedTotal, 1058.87);
  assert.equal(result.coverage, 100);
  assert.deepEqual(result.transactions.map((item) => item.category), ["Diğer", "Eğlence", "Market"]);
});

test("TEB TL-on-ekli satirlari ve kategorileri okur", () => {
  const result = parseStatementTransactions(`
12/05/2026 TRT MASLAK CAFE ISTANBUL TR TL.137,-
13/05/2026 MCDONALDS ISTANBUL TR TL.361,- TL.0,18
13/05/2026 ŞOK DOGANEVLER ISTANBUL TR TL.659,45
15/05/2026 Levent Çarşı Şubesi ÖDEME TEŞEKKÜR EDERİZ -TL.5.500,-`, { bank: "TEB" });
  assert.deepEqual(result.transactions.map((item) => item.amount), [137, 361, 659.45]);
  assert.deepEqual(result.transactions.map((item) => item.category), ["Yeme-İçme", "Yeme-İçme", "Market"]);
});

test("VakifBank iadeleri, odemeleri ve vergileri harcama saymaz", () => {
  const result = parseStatementTransactions(`
27.06.2026 CIHAN MARKET/ISTANBUL 720.00
01.07.2026 İADE/ BILETIX A.S. +28,015.00
01.07.2026 ÖDEMENİZ İÇİN TEŞEKKÜRLER +48,972.00
11.07.2026 KIRATLI AKARYAKIT SA 3,135.83
25.07.2026 ALIŞVERİŞ FAİZİ (Oran:3.75) 1,647.25
25.07.2026 BSMV 247.09`, { bank: "VakıfBank" });
  assert.deepEqual(result.transactions.map((item) => item.amount), [720, 3135.83]);
  assert.deepEqual(result.transactions.map((item) => item.category), ["Market", "Ulaşım"]);
});

test("Halkbank kalan borc sutununu islem tutarina katmaz", () => {
  const result = parseStatementTransactions(`
23/06/2026 DERIN YAPAR KAFE ISTANBUL 3,000.00 0.00
24/06/2026 İYZİCO /istanbulkart ISTANBUL 508.00 0.00
24/06/2026 MOKA U /TABII / TRT ANKARA + 99.00 0.00`, { bank: "Halkbank" });
  assert.deepEqual(result.transactions.map((item) => item.amount), [3000, 508, 99]);
  assert.deepEqual(result.transactions.map((item) => item.category), ["Yeme-İçme", "Ulaşım", "Eğlence"]);
});
