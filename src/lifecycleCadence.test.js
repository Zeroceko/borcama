import test from "node:test";
import assert from "node:assert/strict";

const uygunBaslangicDakikasi = (minutes) => minutes >= 5 && minutes < 48 * 60;
const reminderActivityFiltresi = (createdAt, trialStartedAt) => new Date(createdAt) >= new Date(trialStartedAt);

test("trial-started beşinci dakikadan 48 saatlik hatırlatma eşiğine kadar uygundur", () => {
  assert.equal(uygunBaslangicDakikasi(4.99), false);
  assert.equal(uygunBaslangicDakikasi(5), true);
  assert.equal(uygunBaslangicDakikasi(15), true);
  assert.equal(uygunBaslangicDakikasi(47 * 60 + 59), true);
  assert.equal(uygunBaslangicDakikasi(48 * 60), false);
});

test("reminder eski activity kaydını dikkate almaz", () => {
  const start = "2026-09-05T10:00:00.000Z";
  assert.equal(reminderActivityFiltresi("2026-09-05T09:59:59.000Z", start), false);
  assert.equal(reminderActivityFiltresi("2026-09-05T10:00:00.000Z", start), true);
});
