import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const appSource = fs.readFileSync(new URL("./App.jsx", import.meta.url), "utf8");

test("yeni ödeme planı benzer banka ve ürün adına rağmen yeni kredi hedefiyle açılır", () => {
  const modalStart = appSource.indexOf("function LoanPlanImportModal");
  const modalEnd = appSource.indexOf("/* ---------------- Borçlar", modalStart);
  const modalSource = appSource.slice(modalStart, modalEnd);

  assert.match(modalSource, /const \[selectedLoan, setSelectedLoan\] = useState\("__new__"\)/);
  assert.match(modalSource, /const parsed = await readLoanPlanFile\(file, setProgress\);[\s\S]*setSelectedLoan\("__new__"\)/);
  assert.doesNotMatch(modalSource, /matchingLoan|normalizeLoanPlanTextForMatch/);
});

test("mevcut kredi ancak kullanıcı seçiminden gelen kimlikle güncellenir", () => {
  assert.match(appSource, /onChange=\{\(event\) => setSelectedLoan\(event\.target\.value\)\}/);
  assert.match(appSource, /onClick=\{\(\) => onUse\(result, selectedLoan\)\}/);
  assert.match(appSource, /const mevcut = veri\.loans\.find\(\(loan\) => loan\.id === loanId\)/);
});
