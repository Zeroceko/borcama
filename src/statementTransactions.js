function normalizeStatementText(value = "") {
  return String(value).replace(/İ/g, "I").replace(/ı/g, "i").normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "").replace(/[‐‑‒–—]/g, "-").replace(/\u00a0/g, " ").toLowerCase();
}

function parseMoney(raw) {
  let value = String(raw || "").replace(/\b(?:tl|try)\b/gi, "").replace(/[^0-9.,]/g, "");
  const dot = value.lastIndexOf(".");
  const comma = value.lastIndexOf(",");
  const decimal = dot >= 0 && comma >= 0 ? (dot > comma ? "." : ",")
    : dot >= 0 && value.length - dot - 1 === 2 ? "."
      : comma >= 0 && value.length - comma - 1 === 2 ? "," : "";
  if (decimal) {
    const index = value.lastIndexOf(decimal);
    value = `${value.slice(0, index).replace(/[.,]/g, "")}.${value.slice(index + 1).replace(/[.,]/g, "")}`;
  } else value = value.replace(/[.,]/g, "");
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

const MONTHS = {
  ocak: "01", subat: "02", mart: "03", nisan: "04", mayis: "05", haziran: "06",
  temmuz: "07", agustos: "08", eylul: "09", ekim: "10", kasim: "11", aralik: "12",
};

const EXCLUDED = [
  "odeme", "tesekkur", "onceki donem", "onceki ekstre", "onceki hesap",
  "alisveris faizi", "gecikme faizi", "nakit avans faizi", "kkdf", "bsmv",
  "vade farki", "ucret", "vergi", "iade", "harcama duzeltme",
];

const CATEGORY_RULES = [
  ["Market", ["market", "migros", "a101", "bim", "sok-", "sok ", "carrefour", "istegelsin", "getir buyuk", "bonveno"]],
  ["Yeme-İçme", ["cafe", "kafe", "kahve", "starbucks", "burger", "mcdonald", "kofteci", "restoran", "restaurant", "yemeksepeti", "unlu mamul", "gida"]],
  ["Ulaşım", ["istanbulkart", "metro", "taksi", "uber", "marti", "petrol", "akaryakit", "shell", "opet", "otoyol", "kmo anadolu"]],
  ["Fatura", ["turkcell", "vodafone", "turk telekom", "internet", "elektrik", "dogalgaz", "iski", "igdaş", "digiturk", "superonline"]],
  ["Sağlık", ["eczane", "hastane", "klinik", "medikal", "optik", "gozluk"]],
  ["Giyim", ["oysho", "zara", "lcwaikiki", "lc waikiki", "vakko", "magazacilik", "giyim"]],
  ["Eğlence", ["netflix", "spotify", "tabii", "sinema", "biletix", "steam", "playstation", "amazonprime"]],
  ["Eğitim", ["kitabevi", "kitap", "okul", "kurs", "egitim", "udemy"]],
];

function isoDate(raw) {
  const normalized = normalizeStatementText(raw);
  const numeric = normalized.match(/(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
  if (numeric)
    return `${numeric[3]}-${String(numeric[2]).padStart(2, "0")}-${String(numeric[1]).padStart(2, "0")}`;
  const named = normalized.match(/(\d{1,2})\s+([a-z]+)\s+(\d{4})/);
  if (!named || !MONTHS[named[2]]) return "";
  return `${named[3]}-${MONTHS[named[2]]}-${String(named[1]).padStart(2, "0")}`;
}

export function categorizeStatementTransaction(description = "") {
  const normalized = normalizeStatementText(description);
  for (const [category, tokens] of CATEGORY_RULES)
    if (tokens.some((token) => normalized.includes(token))) return category;
  return "Diğer";
}

function transactionLineParts(line, bank) {
  const dateMatch = String(line).match(/^\s*(\d{1,2}[./-]\d{1,2}[./-]\d{4}|\d{1,2}\s+[A-Za-zÇĞİÖŞÜçğıöşü]+\s+\d{4})\s+(.+)$/u);
  if (!dateMatch) return null;
  const date = isoDate(dateMatch[1]);
  let body = dateMatch[2].trim();
  const normalized = normalizeStatementText(body);
  if (EXCLUDED.some((token) => normalized.includes(token))) return null;

  let amountRaw = "";
  let description = body;
  if (bank === "TEB") {
    const match = body.match(/\s(-?\s*TL\.?\s*[0-9.]+(?:,[0-9]{1,2})?(?:,-)?)\s*(?:TL\.?\s*[0-9.,-]+)?\s*$/i);
    if (!match) return null;
    amountRaw = match[1];
    description = body.slice(0, match.index).trim();
  } else if (bank === "Halkbank") {
    const matches = [...body.matchAll(/(?:^|\s)([+]?[0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})|[+]?[0-9]+\.[0-9]{2})(?=\s|$)/g)];
    if (!matches.length) return null;
    const chosen = matches.length > 1 && parseMoney(matches.at(-1)[1]) === 0 ? matches.at(-2) : matches.at(-1);
    if (chosen[1].startsWith("+")) return null;
    amountRaw = chosen[1];
    description = body.slice(0, chosen.index).replace(/\s*[0-9.,]+\s*\/\s*\d+\s*-?\s*$/, "").trim();
  } else {
    const matches = [...body.matchAll(/(?:TL\.?\s*)?([+-]?\s*[0-9]{1,3}(?:[.,][0-9]{3})*(?:[.,][0-9]{2}|,-)|[+-]?\s*[0-9]+[.,][0-9]{2})\s*(?:TL)?/gi)];
    if (!matches.length) return null;
    const chosen = matches.at(-1);
    if (/^\s*\+/.test(chosen[1]) || /\biade\b/.test(normalized)) return null;
    amountRaw = chosen[1];
    description = body.slice(0, chosen.index).trim();
  }

  const amount = Math.abs(parseMoney(amountRaw));
  if (!date || !Number.isFinite(amount) || amount <= 0) return null;
  description = description
    .replace(/\s*\([^)]*(?:islem|işlem)\s+tutar[^)]*\)\s*/gi, " ")
    .replace(/\s+\d+\s*\/\s*\d+\s*$/, "")
    .replace(/\s+\d+\.?\s*taksit\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!description || /^sayfa\b/i.test(description)) return null;
  return { date, description, amount, category: categorizeStatementTransaction(description), selected: true };
}

export function parseStatementTransactions(text, { bank = "", currentPurchases = null } = {}) {
  const seen = new Set();
  const transactions = [];
  for (const line of String(text).split(/\n/)) {
    const item = transactionLineParts(line, bank);
    if (!item) continue;
    const key = `${item.date}|${normalizeStatementText(item.description)}|${item.amount.toFixed(2)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    transactions.push({ ...item, key });
  }
  const detectedTotal = Math.round(transactions.reduce((sum, item) => sum + item.amount, 0) * 100) / 100;
  const expected = Number(currentPurchases);
  const coverage = Number.isFinite(expected) && expected > 0
    ? Math.round((detectedTotal / expected) * 100)
    : null;
  return { transactions, detectedTotal, coverage };
}
