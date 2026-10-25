import test from "node:test";
import assert from "node:assert/strict";
import { loanPlanTextContentToText } from "./loanPlanImport.js";

test("PDF alanlarını metin akışı karışık olsa da görsel satır koordinatlarına göre birleştirir", () => {
  const content = {
    items: [
      { str: ":%3,69", transform: [1, 0, 0, 1, 420, 700], height: 12 },
      { str: "Aylık faiz oranı", transform: [1, 0, 0, 1, 250, 700], height: 12 },
      { str: ":250.000,00 TL", transform: [1, 0, 0, 1, 110, 720], height: 12 },
      { str: "Kredi tutarı", transform: [1, 0, 0, 1, 20, 720], height: 12 },
    ],
  };
  const text = loanPlanTextContentToText(content);
  assert.match(text, /Kredi tutarı :250\.000,00 TL/);
  assert.match(text, /Aylık faiz oranı :%3,69/);
});
